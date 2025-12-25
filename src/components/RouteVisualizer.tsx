import { MapPin, Route, Circle } from 'lucide-react';
import satelliteImage from 'figma:asset/ca9b98f3f9f9047b2eeb8984c0a9f14d6ea19982.png';

interface RouteVisualizerProps {
  fieldId: string;
  flightPattern: string;
  altitude: number;
  showDetails?: boolean;
}

export function RouteVisualizer({ fieldId, flightPattern, altitude, showDetails = false }: RouteVisualizerProps) {
  // Generate route points based on pattern
  const generateRoutePoints = () => {
    switch (flightPattern) {
      case 'zigzag':
        return [
          { x: 15, y: 20 },
          { x: 85, y: 20 },
          { x: 85, y: 30 },
          { x: 15, y: 30 },
          { x: 15, y: 40 },
          { x: 85, y: 40 },
          { x: 85, y: 50 },
          { x: 15, y: 50 },
          { x: 15, y: 60 },
          { x: 85, y: 60 },
          { x: 85, y: 70 },
          { x: 15, y: 70 },
          { x: 15, y: 80 },
          { x: 85, y: 80 },
        ];
      case 'parallel':
        return [
          { x: 15, y: 20 },
          { x: 15, y: 80 },
          { x: 30, y: 80 },
          { x: 30, y: 20 },
          { x: 45, y: 20 },
          { x: 45, y: 80 },
          { x: 60, y: 80 },
          { x: 60, y: 20 },
          { x: 75, y: 20 },
          { x: 75, y: 80 },
          { x: 85, y: 80 },
        ];
      case 'circular':
        const centerX = 50;
        const centerY = 50;
        const radius = 30;
        const points = [];
        for (let i = 0; i < 16; i++) {
          const angle = (i / 16) * 2 * Math.PI;
          points.push({
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
          });
        }
        return points;
      case 'grid':
        const gridPoints = [];
        for (let y = 20; y <= 80; y += 15) {
          for (let x = 15; x <= 85; x += 15) {
            gridPoints.push({ x, y });
          }
        }
        return gridPoints;
      default:
        return [];
    }
  };

  const routePoints = generateRoutePoints();

  return (
    <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
      {/* Background satellite image */}
      <img
        src={satelliteImage}
        alt="Field satellite view"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Semi-transparent overlay for better visibility */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Flight route visualization */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Flight path */}
        <polyline
          points={routePoints.map(p => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="0.5"
          strokeDasharray="2,2"
          opacity="0.8"
        />

        {/* Photo capture points */}
        {routePoints.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="1.5"
              fill="#3b82f6"
              opacity="0.9"
            />
            {/* Camera footprint */}
            <circle
              cx={point.x}
              cy={point.y}
              r="3"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="0.3"
              opacity="0.4"
            />
          </g>
        ))}

        {/* Start point */}
        <g>
          <circle
            cx={routePoints[0]?.x}
            cy={routePoints[0]?.y}
            r="2.5"
            fill="#22c55e"
            stroke="white"
            strokeWidth="0.5"
          />
        </g>

        {/* End point */}
        <g>
          <circle
            cx={routePoints[routePoints.length - 1]?.x}
            cy={routePoints[routePoints.length - 1]?.y}
            r="2.5"
            fill="#ef4444"
            stroke="white"
            strokeWidth="0.5"
          />
        </g>
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg">
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
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-blue-500 border-dashed"></div>
            <span>Маршрут</span>
          </div>
        </div>
      </div>

      {/* Flight info */}
      {showDetails && (
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg">
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <Route className="w-3 h-3" />
              <span className="font-medium">Маршрут:</span>
              <span>
                {flightPattern === 'zigzag' && 'Зигзаг'}
                {flightPattern === 'parallel' && 'Параллельно'}
                {flightPattern === 'circular' && 'Круговой'}
                {flightPattern === 'grid' && 'Сетка'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="w-3 h-3" />
              <span className="font-medium">Высота:</span>
              <span>{altitude} м</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3" />
              <span className="font-medium">Точек:</span>
              <span>{routePoints.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Scale indicator */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm p-2 rounded text-xs">
        <div className="flex items-center gap-2">
          <div className="w-12 h-0.5 bg-black"></div>
          <span>500 м</span>
        </div>
      </div>
    </div>
  );
}
