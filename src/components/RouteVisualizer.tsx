import { useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup } from 'react-leaflet';
import { MapPin, Route, Circle } from 'lucide-react';
import L from 'leaflet';

interface RouteVisualizerProps {
  fieldId: string;
  flightPattern: string;
  altitude: number;
  showDetails?: boolean;
}

export function RouteVisualizer({ fieldId, flightPattern, altitude, showDetails = false }: RouteVisualizerProps) {
  console.log('🗺️ RouteVisualizer mounted with props:', { fieldId, flightPattern, altitude, showDetails });

  // Mock field center coordinates (Moscow area)
  const fieldCenter = useMemo(() => {
    const centers: { [key: string]: [number, number] } = {
      '1': [55.7558, 37.6173],
      '2': [55.7512, 37.6145],
      '3': [55.7601, 37.6220],
    };
    const center = centers[fieldId] || [55.7558, 37.6173];
    console.log('📍 Field center calculated:', center);
    return center;
  }, [fieldId]);

  // Generate route points based on pattern
  const generateRoutePoints = useMemo((): [number, number][] => {
    const [centerLat, centerLng] = fieldCenter;
    const offset = 0.002; // ~200m offset
    console.log('🛤️ Generating route points for pattern:', flightPattern);

    switch (flightPattern) {
      case 'zigzag':
        return [
          [centerLat - offset, centerLng - offset],
          [centerLat - offset, centerLng + offset],
          [centerLat - offset * 0.7, centerLng + offset],
          [centerLat - offset * 0.7, centerLng - offset],
          [centerLat - offset * 0.4, centerLng - offset],
          [centerLat - offset * 0.4, centerLng + offset],
          [centerLat - offset * 0.1, centerLng + offset],
          [centerLat - offset * 0.1, centerLng - offset],
          [centerLat + offset * 0.2, centerLng - offset],
          [centerLat + offset * 0.2, centerLng + offset],
          [centerLat + offset * 0.5, centerLng + offset],
          [centerLat + offset * 0.5, centerLng - offset],
          [centerLat + offset * 0.8, centerLng - offset],
          [centerLat + offset * 0.8, centerLng + offset],
        ];

      case 'parallel':
        return [
          [centerLat - offset, centerLng - offset * 1.2],
          [centerLat + offset, centerLng - offset * 1.2],
          [centerLat + offset, centerLng - offset * 0.6],
          [centerLat - offset, centerLng - offset * 0.6],
          [centerLat - offset, centerLng],
          [centerLat + offset, centerLng],
          [centerLat + offset, centerLng + offset * 0.6],
          [centerLat - offset, centerLng + offset * 0.6],
          [centerLat - offset, centerLng + offset * 1.2],
          [centerLat + offset, centerLng + offset * 1.2],
        ];

      case 'circular':
        const points: [number, number][] = [];
        const radius = offset * 0.8;
        for (let i = 0; i < 16; i++) {
          const angle = (i / 16) * 2 * Math.PI;
          points.push([
            centerLat + radius * Math.cos(angle),
            centerLng + radius * Math.sin(angle),
          ]);
        }
        // Close the circle
        points.push(points[0]);
        return points;

      case 'grid':
        const gridPoints: [number, number][] = [];
        for (let lat = -offset; lat <= offset; lat += offset * 0.4) {
          for (let lng = -offset; lng <= offset; lng += offset * 0.4) {
            gridPoints.push([centerLat + lat, centerLng + lng]);
          }
        }
        return gridPoints;

      default:
        console.log('⚠️ Unknown flight pattern, returning empty array');
        return [];
    }
  }, [fieldCenter, flightPattern]);

  const routePointsForPolyline = useMemo(() => {
    if (flightPattern === 'grid') {
      // For grid pattern, don't connect all points
      return [];
    }
    return generateRoutePoints;
  }, [generateRoutePoints, flightPattern]);

  const getPatternName = (pattern: string) => {
    switch (pattern) {
      case 'zigzag': return 'Зигзаг';
      case 'parallel': return 'Параллельно';
      case 'circular': return 'Круговой';
      case 'grid': return 'Сетка';
      default: return pattern;
    }
  };

  console.log('✅ RouteVisualizer rendering with:', {
    fieldCenter,
    routePoints: generateRoutePoints.length,
    polylinePoints: routePointsForPolyline.length
  });

  return (
    <div className="relative w-full h-[400px] bg-gray-100 rounded-lg overflow-hidden" style={{ minHeight: '400px', height: '400px' }}>
      <MapContainer
        center={fieldCenter}
        zoom={15}
        scrollWheelZoom={true}
        style={{ height: '400px', width: '100%', minHeight: '400px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png"
          maxZoom={19}
        />

        {/* Flight path polyline */}
        {routePointsForPolyline.length > 0 && (
          <Polyline
            positions={routePointsForPolyline}
            color="#3b82f6"
            weight={3}
            opacity={0.7}
            dashArray="10, 10"
          />
        )}

        {/* Photo capture points */}
        {generateRoutePoints.map((point, index) => {
          const isStart = index === 0;
          const isEnd = index === generateRoutePoints.length - 1;
          const color = isStart ? '#22c55e' : isEnd ? '#ef4444' : '#3b82f6';

          return (
            <CircleMarker
              key={index}
              center={point}
              radius={isStart || isEnd ? 8 : 5}
              pathOptions={{
                color: 'white',
                fillColor: color,
                fillOpacity: 0.9,
                weight: 2,
              }}
            >
              <Popup>
                <div className="text-xs">
                  <strong>
                    {isStart ? 'Старт' : isEnd ? 'Финиш' : `Точка ${index + 1}`}
                  </strong>
                  <br />
                  Высота: {altitude} м
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg z-[1000]">
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white"></div>
            <span>Старт</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Точки съёмки</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white"></div>
            <span>Финиш</span>
          </div>
          {flightPattern !== 'grid' && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-blue-500 border-dashed"></div>
              <span>Маршрут</span>
            </div>
          )}
        </div>
      </div>

      {/* Flight info */}
      {showDetails && (
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg z-[1000]">
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <Route className="w-3 h-3" />
              <span className="font-medium">Маршрут:</span>
              <span>{getPatternName(flightPattern)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="w-3 h-3" />
              <span className="font-medium">Высота:</span>
              <span>{altitude} м</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3" />
              <span className="font-medium">Точек:</span>
              <span>{generateRoutePoints.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
