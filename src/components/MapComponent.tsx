import { useState } from 'react';
import { MapPin, Satellite } from 'lucide-react';
import { Button } from './ui/button';
import satelliteImage from 'figma:asset/ca9b98f3f9f9047b2eeb8984c0a9f14d6ea19982.png';

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

export function MapComponent({ fields, onPointSelect, selectedPoint }: MapComponentProps) {
  const [showSatellite, setShowSatellite] = useState(true);

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'scheduled': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="relative w-full min-h-[400px] md:h-96 bg-gray-100 rounded-lg overflow-hidden">
      {/* Satellite/Map Background */}
      <div className="absolute inset-0">
        <img
          src={satelliteImage}
          alt="Satellite Map View"
          className="w-full h-full object-cover"
        />
        {!showSatellite && (
          <div className="absolute inset-0 bg-green-50 opacity-80" />
        )}
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10">
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

      {/* Field Markers */}
      {fields.map((field, index) => {
        const isSelected = selectedPoint === field.id;
        // Position markers in a grid-like pattern for demo
        const x = 20 + (index % 3) * 30;
        const y = 20 + Math.floor(index / 3) * 25;
        
        return (
          <div
            key={field.id}
            className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-20 ${
              isSelected ? 'scale-125' : 'hover:scale-110'
            } transition-transform`}
            style={{ left: `${x}%`, top: `${y}%` }}
            onClick={() => onPointSelect(field.id)}
          >
            <div className="relative">
              <MapPin 
                className={`w-8 h-8 drop-shadow-lg ${getMarkerColor(field.status)} ${
                  isSelected ? 'animate-pulse' : ''
                }`}
                fill="currentColor"
              />
              {field.weedCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {field.weedCount}
                </div>
              )}
            </div>
            
            {/* Field Label */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs whitespace-nowrap">
              {field.name}
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg z-10">
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

      {/* Scale Indicator */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded text-xs">
        <div className="flex items-center gap-2">
          <div className="w-16 h-1 bg-black"></div>
          <span>1 km</span>
        </div>
      </div>
    </div>
  );
}