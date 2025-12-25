import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MapPin, Satellite } from 'lucide-react';
import { Button } from './ui/button';
import L from 'leaflet';

interface Field {
  id: string;
  name: string;
  area: string;
  status: string;
  coordinates: { lat: number; lng: number };
  weedCount: number;
  hasData: boolean;
}

interface MapComponentProps {
  fields: Field[];
  onPointSelect: (fieldId: string) => void;
  selectedPoint: string | null;
}

// Fix for default marker icons in production
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Create custom marker icons based on status
const createCustomIcon = (status: string, isSelected: boolean, weedCount: number) => {
  const getColor = (status: string) => {
    switch (status) {
      case 'active': return '#16a34a';
      case 'pending': return '#ca8a04';
      case 'scheduled': return '#2563eb';
      default: return '#6b7280';
    }
  };

  const color = getColor(status);
  const scale = isSelected ? 1.3 : 1;

  const svgIcon = `
    <svg width="${40 * scale}" height="${40 * scale}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="${color}" stroke="white" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      ${weedCount > 0 ? `
        <circle cx="19" cy="5" r="5" fill="#ef4444"/>
        <text x="19" y="7.5" text-anchor="middle" fill="white" font-size="8" font-weight="bold">${weedCount}</text>
      ` : ''}
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker',
    iconSize: [40 * scale, 40 * scale],
    iconAnchor: [20 * scale, 40 * scale],
    popupAnchor: [0, -40 * scale],
  });
};

// Component to handle map layer changes
function MapLayerControl({ showSatellite }: { showSatellite: boolean }) {
  const map = useMap();

  return (
    <>
      {showSatellite ? (
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
        />
      ) : (
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png"
          maxZoom={19}
        />
      )}
    </>
  );
}

export function MapComponent({ fields, onPointSelect, selectedPoint }: MapComponentProps) {
  const [showSatellite, setShowSatellite] = useState(false);

  // Calculate center of all fields or use default coordinates
  const center = useMemo(() => {
    if (fields.length === 0) {
      return { lat: 55.7558, lng: 37.6173 }; // Moscow as default
    }

    const avgLat = fields.reduce((sum, field) => sum + field.coordinates.lat, 0) / fields.length;
    const avgLng = fields.reduce((sum, field) => sum + field.coordinates.lng, 0) / fields.length;

    return { lat: avgLat, lng: avgLng };
  }, [fields]);

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'scheduled': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="relative w-full h-[500px] bg-gray-100 rounded-lg overflow-hidden">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', minHeight: '500px' }}
        attributionControl={false}
      >
        <MapLayerControl showSatellite={showSatellite} />

        {fields.map((field) => {
          const isSelected = selectedPoint === field.id;

          return (
            <Marker
              key={field.id}
              position={[field.coordinates.lat, field.coordinates.lng]}
              icon={createCustomIcon(field.status, isSelected, field.weedCount)}
              eventHandlers={{
                click: () => onPointSelect(field.id),
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-sm">{field.name}</h3>
                  <p className="text-xs text-gray-600">Площадь: {field.area}</p>
                  {field.weedCount > 0 && (
                    <p className="text-xs text-red-600 font-medium">
                      Сорняков: {field.weedCount}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[2000]">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowSatellite(!showSatellite)}
          className="bg-white/90 backdrop-blur-sm"
        >
          <Satellite className="w-4 h-4 mr-2" />
          {showSatellite ? 'Карта' : 'Спутник'}
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg z-[2000]">
        <h4 className="text-sm font-medium mb-2">Статус полей</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <MapPin className="w-4 h-4 text-green-600" />
            <span>Активно</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <MapPin className="w-4 h-4 text-yellow-600" />
            <span>Ожидание</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>Запланировано</span>
          </div>
        </div>
      </div>
    </div>
  );
}
