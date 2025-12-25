import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { 
  Plane, 
  MapPin, 
  Camera, 
  Settings, 
  Play, 
  Pause, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Route,
  Image,
  FileText,
  Download,
  Upload,
  Eye,
  Plus,
  ChevronRight,
  ChevronLeft,
  Info
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { RouteVisualizer } from './RouteVisualizer';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Mission {
  id: string;
  name: string;
  field: {
    id: string;
    name: string;
    area: number;
  };
  drone: string;
  camera: string;
  altitude: number;
  speed: number;
  flightPattern: string;
  overlap: number;
  sideOverlap: number;
  date: string;
  time: string;
  operator: string;
  status: 'planned' | 'in-flight' | 'completed' | 'processing' | 'ready';
  progress: number;
  estimatedPhotos: number;
  estimatedTime: number;
  actualPhotos?: number;
  routePoints?: Array<{ lat: number; lng: number }>;
  photos?: Array<{ id: string; url: string; timestamp: string; detected?: boolean }>;
}

const mockDrones = [
  { id: 'dji-m300', name: 'DJI Matrice 300 RTK', maxAlt: 7000, maxSpeed: 82, flightTime: 55 },
  { id: 'dji-p4', name: 'DJI Phantom 4 Pro', maxAlt: 6000, maxSpeed: 72, flightTime: 30 },
  { id: 'senseFly', name: 'senseFly eBee X', maxAlt: 5000, maxSpeed: 90, flightTime: 90 },
];

const mockCameras = [
  { id: 'zenmuse-p1', name: 'Zenmuse P1', resolution: '45MP', fov: '63.5°', format: 'JPG/DNG' },
  { id: 'multispectral', name: 'MicaSense RedEdge-MX', resolution: '5x1.2MP', fov: '47.2°', format: 'TIFF' },
  { id: 'thermal', name: 'FLIR Vue TZ20', resolution: '640x512', fov: '25°', format: 'TIFF' },
];

const mockFields = [
  { id: 'f1', name: 'Поле №1 Пшеница', area: 15.5, crop: 'Пшеница' },
  { id: 'f2', name: 'Поле №2 Кукуруза', area: 22.3, crop: 'Кукуруза' },
  { id: 'f3', name: 'Поле №3 Соя', area: 18.7, crop: 'Соя' },
  { id: 'f4', name: 'Поле №4 Подсолнух', area: 12.2, crop: 'Подсолнух' },
];

const mockMissions: Mission[] = [
  {
    id: 'm1',
    name: 'Инспекция поля №1 - Контроль сорняков',
    field: { id: 'f1', name: 'Поле №1 Пшеница', area: 15.5 },
    drone: 'DJI Matrice 300 RTK',
    camera: 'Zenmuse P1',
    altitude: 120,
    speed: 12,
    flightPattern: 'zigzag',
    overlap: 75,
    sideOverlap: 65,
    date: '2025-11-08',
    time: '09:00',
    operator: 'Иванов И.И.',
    status: 'completed',
    progress: 100,
    estimatedPhotos: 156,
    estimatedTime: 25,
    actualPhotos: 158,
  },
  {
    id: 'm2',
    name: 'Инспекция поля №2 - Оценка плотности посева',
    field: { id: 'f2', name: 'Поле №2 Кукуруза', area: 22.3 },
    drone: 'DJI Phantom 4 Pro',
    camera: 'Multispectral',
    altitude: 100,
    speed: 10,
    flightPattern: 'parallel',
    overlap: 80,
    sideOverlap: 70,
    date: '2025-11-10',
    time: '10:30',
    operator: 'Петрова А.С.',
    status: 'planned',
    progress: 0,
    estimatedPhotos: 223,
    estimatedTime: 38,
  },
  {
    id: 'm3',
    name: 'Инспекция поля №3 - Мониторинг здоровья',
    field: { id: 'f3', name: 'Поле №3 Соя', area: 18.7 },
    drone: 'senseFly eBee X',
    camera: 'MicaSense RedEdge-MX',
    altitude: 150,
    speed: 15,
    flightPattern: 'zigzag',
    overlap: 70,
    sideOverlap: 60,
    date: '2025-11-07',
    time: '11:00',
    operator: 'Сидоров П.М.',
    status: 'processing',
    progress: 75,
    estimatedPhotos: 187,
    estimatedTime: 32,
    actualPhotos: 189,
  },
];

export function MissionPlanning() {
  const [activeTab, setActiveTab] = useState('missions');
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [missions, setMissions] = useState<Mission[]>(mockMissions);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  
  // Wizard form state
  const [newMission, setNewMission] = useState({
    name: '',
    fieldId: '',
    droneId: '',
    cameraId: '',
    altitude: 120,
    speed: 12,
    flightPattern: 'zigzag',
    overlap: 75,
    sideOverlap: 65,
    date: '',
    time: '',
    operator: 'Текущий пользователь',
    purpose: '',
  });

  const getStatusIcon = (status: Mission['status']) => {
    switch (status) {
      case 'planned': return <Clock className="w-4 h-4" />;
      case 'in-flight': return <Play className="w-4 h-4" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'processing': return <Settings className="w-4 h-4 animate-spin" />;
      case 'ready': return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Mission['status']) => {
    switch (status) {
      case 'planned': return 'bg-blue-500';
      case 'in-flight': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      case 'processing': return 'bg-yellow-500';
      case 'ready': return 'bg-emerald-500';
    }
  };

  const getStatusLabel = (status: Mission['status']) => {
    switch (status) {
      case 'planned': return 'Запланирована';
      case 'in-flight': return 'В полёте';
      case 'completed': return 'Выполнена';
      case 'processing': return 'В обработке';
      case 'ready': return 'Готово';
    }
  };

  const calculateEstimates = () => {
    const field = mockFields.find(f => f.id === newMission.fieldId);
    if (!field) return { photos: 0, time: 0, coverage: 0 };
    
    const areaM2 = field.area * 10000; // гектары в м²
    const photoFootprint = (newMission.altitude * 0.8) * (newMission.altitude * 0.6); // примерный расчет
    const overlapFactor = (100 - newMission.overlap) / 100;
    const photos = Math.ceil(areaM2 / (photoFootprint * overlapFactor * overlapFactor));
    const time = Math.ceil((photos * 3) / 60); // примерно 3 сек на фото
    
    return { photos, time, coverage: 100 };
  };

  const handleCreateMission = () => {
    const field = mockFields.find(f => f.id === newMission.fieldId);
    const drone = mockDrones.find(d => d.id === newMission.droneId);
    const camera = mockCameras.find(c => c.id === newMission.cameraId);
    
    if (!field || !drone || !camera) return;
    
    const estimates = calculateEstimates();
    
    const mission: Mission = {
      id: `m${missions.length + 1}`,
      name: newMission.name,
      field: { id: field.id, name: field.name, area: field.area },
      drone: drone.name,
      camera: camera.name,
      altitude: newMission.altitude,
      speed: newMission.speed,
      flightPattern: newMission.flightPattern,
      overlap: newMission.overlap,
      sideOverlap: newMission.sideOverlap,
      date: newMission.date,
      time: newMission.time,
      operator: newMission.operator,
      status: 'planned',
      progress: 0,
      estimatedPhotos: estimates.photos,
      estimatedTime: estimates.time,
    };
    
    setMissions([mission, ...missions]);
    setShowWizard(false);
    setWizardStep(1);
    toast.success('Полетное задание успешно создано и запланировано');
  };

  const renderWizardStep = () => {
    const estimates = calculateEstimates();
    
    switch (wizardStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="mission-name">Название полетного задания</Label>
              <Input
                id="mission-name"
                placeholder="Например: Инспекция поля - Контроль сорняков"
                value={newMission.name}
                onChange={(e) => setNewMission({ ...newMission, name: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="field-select">Выбор поля</Label>
              <Select value={newMission.fieldId} onValueChange={(v) => setNewMission({ ...newMission, fieldId: v })}>
                <SelectTrigger id="field-select">
                  <SelectValue placeholder="Выберите поле из реестра" />
                </SelectTrigger>
                <SelectContent>
                  {mockFields.map(field => (
                    <SelectItem key={field.id} value={field.id}>
                      {field.name} ({field.area} га)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Дата выполнения</Label>
                <Input
                  id="date"
                  type="date"
                  value={newMission.date}
                  onChange={(e) => setNewMission({ ...newMission, date: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="time">Время</Label>
                <Input
                  id="time"
                  type="time"
                  value={newMission.time}
                  onChange={(e) => setNewMission({ ...newMission, time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="purpose">Цель инспекции</Label>
              <Select value={newMission.purpose} onValueChange={(v) => setNewMission({ ...newMission, purpose: v })}>
                <SelectTrigger id="purpose">
                  <SelectValue placeholder="Выберите цель" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weed">Контроль сорняков</SelectItem>
                  <SelectItem value="density">Оценка плотности посева</SelectItem>
                  <SelectItem value="health">Мониторинг здоровья культур</SelectItem>
                  <SelectItem value="water">Водный стресс</SelectItem>
                  <SelectItem value="pest">Обнаружение вредителей</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="drone-select">Модель БПЛА</Label>
              <Select value={newMission.droneId} onValueChange={(v) => setNewMission({ ...newMission, droneId: v })}>
                <SelectTrigger id="drone-select">
                  <SelectValue placeholder="Выберите БПЛА" />
                </SelectTrigger>
                <SelectContent>
                  {mockDrones.map(drone => (
                    <SelectItem key={drone.id} value={drone.id}>
                      {drone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {newMission.droneId && (
                <div className="mt-2 p-3 bg-muted rounded-lg text-sm space-y-1">
                  {mockDrones.find(d => d.id === newMission.droneId) && (
                    <>
                      <p>Макс. высота: {mockDrones.find(d => d.id === newMission.droneId)?.maxAlt}м</p>
                      <p>Макс. скорость: {mockDrones.find(d => d.id === newMission.droneId)?.maxSpeed} км/ч</p>
                      <p>Время полёта: {mockDrones.find(d => d.id === newMission.droneId)?.flightTime} мин</p>
                    </>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="camera-select">Камера</Label>
              <Select value={newMission.cameraId} onValueChange={(v) => setNewMission({ ...newMission, cameraId: v })}>
                <SelectTrigger id="camera-select">
                  <SelectValue placeholder="Выберите камеру" />
                </SelectTrigger>
                <SelectContent>
                  {mockCameras.map(camera => (
                    <SelectItem key={camera.id} value={camera.id}>
                      {camera.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {newMission.cameraId && (
                <div className="mt-2 p-3 bg-muted rounded-lg text-sm space-y-1">
                  {mockCameras.find(c => c.id === newMission.cameraId) && (
                    <>
                      <p>Разрешение: {mockCameras.find(c => c.id === newMission.cameraId)?.resolution}</p>
                      <p>FOV: {mockCameras.find(c => c.id === newMission.cameraId)?.fov}</p>
                      <p>Формат: {mockCameras.find(c => c.id === newMission.cameraId)?.format}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="altitude">Высота полёта (метры)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="altitude"
                  type="number"
                  min="50"
                  max="500"
                  value={newMission.altitude}
                  onChange={(e) => setNewMission({ ...newMission, altitude: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">{newMission.altitude} м</span>
              </div>
            </div>

            <div>
              <Label htmlFor="speed">Скорость полёта (м/с)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="speed"
                  type="number"
                  min="5"
                  max="20"
                  value={newMission.speed}
                  onChange={(e) => setNewMission({ ...newMission, speed: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">{newMission.speed} м/с</span>
              </div>
            </div>

            <div>
              <Label htmlFor="pattern">Схема облёта</Label>
              <Select value={newMission.flightPattern} onValueChange={(v) => setNewMission({ ...newMission, flightPattern: v })}>
                <SelectTrigger id="pattern">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zigzag">Зигзаг</SelectItem>
                  <SelectItem value="parallel">Параллельные проходы</SelectItem>
                  <SelectItem value="circular">Круговой облёт</SelectItem>
                  <SelectItem value="grid">Сетка</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="overlap">Фронтальное перекрытие (%)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="overlap"
                  type="number"
                  min="50"
                  max="90"
                  value={newMission.overlap}
                  onChange={(e) => setNewMission({ ...newMission, overlap: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">{newMission.overlap}%</span>
              </div>
            </div>

            <div>
              <Label htmlFor="side-overlap">Боковое перекрытие (%)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="side-overlap"
                  type="number"
                  min="40"
                  max="80"
                  value={newMission.sideOverlap}
                  onChange={(e) => setNewMission({ ...newMission, sideOverlap: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">{newMission.sideOverlap}%</span>
              </div>
            </div>
          </div>
        );
      
      case 4:
        const selectedField = mockFields.find(f => f.id === newMission.fieldId);
        return (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Предварительный расчёт маршрута</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Поле</p>
                  <p>{selectedField?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Площадь</p>
                  <p>{selectedField?.area} га</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Оценка снимков</p>
                  <p>~{estimates.photos} фото</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Оценка времени</p>
                  <p>~{estimates.time} минут</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Высота полёта</p>
                  <p>{newMission.altitude} м</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Схема</p>
                  <p>
                    {newMission.flightPattern === 'zigzag' && 'Зигзаг'}
                    {newMission.flightPattern === 'parallel' && 'Параллельно'}
                    {newMission.flightPattern === 'circular' && 'Круговой'}
                    {newMission.flightPattern === 'grid' && 'Сетка'}
                  </p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <RouteVisualizer 
                fieldId={newMission.fieldId} 
                flightPattern={newMission.flightPattern}
                altitude={newMission.altitude}
              />
            </div>

            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-900">
                Маршрут будет автоматически оптимизирован с учётом формы поля, препятствий и погодных условий.
                После утверждения полетное задание будет добавлено в очередь для выполнения.
              </p>
            </div>
          </div>
        );
    }
  };

  if (showWizard) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Создание нового полетного задания</CardTitle>
                <CardDescription>Шаг {wizardStep} из 4</CardDescription>
              </div>
              <Button variant="ghost" onClick={() => { setShowWizard(false); setWizardStep(1); }}>
                Отмена
              </Button>
            </div>
            
            <div className="mt-4">
              <Progress value={(wizardStep / 4) * 100} />
            </div>

            <div className="flex items-center justify-between mt-4 text-sm">
              <div className={wizardStep >= 1 ? 'text-primary' : 'text-muted-foreground'}>
                1. Основные данные
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <div className={wizardStep >= 2 ? 'text-primary' : 'text-muted-foreground'}>
                2. БПЛА и камера
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <div className={wizardStep >= 3 ? 'text-primary' : 'text-muted-foreground'}>
                3. Параметры полёта
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <div className={wizardStep >= 4 ? 'text-primary' : 'text-muted-foreground'}>
                4. Маршрут
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {renderWizardStep()}

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setWizardStep(Math.max(1, wizardStep - 1))}
                disabled={wizardStep === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>

              {wizardStep < 4 ? (
                <Button onClick={() => setWizardStep(wizardStep + 1)}>
                  Далее
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleCreateMission}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Создать полетное задание
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedMission) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setSelectedMission(null)}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Назад к списку
          </Button>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(selectedMission.status)}>
              {getStatusIcon(selectedMission.status)}
              <span className="ml-2">{getStatusLabel(selectedMission.status)}</span>
            </Badge>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{selectedMission.name}</CardTitle>
            <CardDescription>
              {selectedMission.field.name} • {selectedMission.date} в {selectedMission.time}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Обзор</TabsTrigger>
                <TabsTrigger value="route">Маршрут</TabsTrigger>
                <TabsTrigger value="photos">Снимки</TabsTrigger>
                <TabsTrigger value="report">Отчёт</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{selectedMission.field.area}</div>
                      <p className="text-xs text-muted-foreground">Площадь (га)</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{selectedMission.altitude}</div>
                      <p className="text-xs text-muted-foreground">Высота (м)</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{selectedMission.actualPhotos || selectedMission.estimatedPhotos}</div>
                      <p className="text-xs text-muted-foreground">Снимков</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{selectedMission.estimatedTime}</div>
                      <p className="text-xs text-muted-foreground">Минут</p>
                    </CardContent>
                  </Card>
                </div>

                {selectedMission.status !== 'planned' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Прогресс выполнения</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Progress value={selectedMission.progress} className="mb-2" />
                      <p className="text-sm text-muted-foreground">{selectedMission.progress}% завершено</p>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Параметры полетного задания</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">БПЛА</p>
                      <p className="font-medium">{selectedMission.drone}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Камера</p>
                      <p className="font-medium">{selectedMission.camera}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Скорость</p>
                      <p className="font-medium">{selectedMission.speed} м/с</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Схема облёта</p>
                      <p className="font-medium">
                        {selectedMission.flightPattern === 'zigzag' && 'Зигзаг'}
                        {selectedMission.flightPattern === 'parallel' && 'Параллельно'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Перекрытие</p>
                      <p className="font-medium">{selectedMission.overlap}% / {selectedMission.sideOverlap}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Оператор</p>
                      <p className="font-medium">{selectedMission.operator}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="route" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    {(() => {
                      console.log('🗺️ MissionPlanning route tab rendering with mission data:', {
                        fieldId: selectedMission.field.id,
                        flightPattern: selectedMission.flightPattern,
                        altitude: selectedMission.altitude,
                        missionId: selectedMission.id,
                        fieldName: selectedMission.field.name
                      });
                      return (
                        <RouteVisualizer
                          fieldId={selectedMission.field.id}
                          flightPattern={selectedMission.flightPattern}
                          altitude={selectedMission.altitude}
                          showDetails
                        />
                      );
                    })()}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="photos" className="mt-4">
                {selectedMission.status === 'planned' ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Снимки будут доступны после выполнения полетного задания</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[
                      'https://images.unsplash.com/photo-1643145476486-a5ce26244724?w=400&h=400&fit=crop&crop=entropy&q=80',
                      'https://images.unsplash.com/photo-1663326225593-c85572a25988?w=400&h=400&fit=crop&crop=entropy&q=80',
                      'https://images.unsplash.com/photo-1662585445239-6906fa73d9f5?w=400&h=400&fit=crop&crop=entropy&q=80',
                      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=400&fit=crop&crop=entropy&q=80',
                      'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=400&fit=crop&crop=entropy&q=80',
                      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=400&fit=crop&crop=entropy&q=80',
                      'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=400&fit=crop&crop=entropy&q=80',
                      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=400&fit=crop&crop=entropy&q=80',
                      'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400&h=400&fit=crop&crop=entropy&q=80',
                      'https://images.unsplash.com/photo-1595408098668-04685c0d1d56?w=400&h=400&fit=crop&crop=entropy&q=80',
                      'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=400&fit=crop&crop=entropy&q=80',
                      'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&h=400&fit=crop&crop=entropy&q=80'
                    ].map((imageUrl, i) => (
                      <Card key={i} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                        <div className="aspect-square bg-muted relative">
                          <ImageWithFallback
                            src={imageUrl}
                            alt={`Снимок ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="text-xs">
                              #{i + 1}
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-2">
                          <p className="text-xs text-muted-foreground">10:15:{(i * 5).toString().padStart(2, '0')}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="report" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Отчёт о выполнении</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedMission.status === 'ready' || selectedMission.status === 'completed' ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8 text-primary" />
                            <div>
                              <p className="font-medium">Отчёт детекции</p>
                              <p className="text-sm text-muted-foreground">PDF, 2.4 МБ</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              Просмотр
                            </Button>
                            <Button size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Скачать
                            </Button>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                          <h4 className="font-medium">Результаты обнаружения</h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-2xl font-bold text-red-700">127</p>
                              <p className="text-sm text-red-600">Очагов сорняков</p>
                            </div>
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <p className="text-2xl font-bold text-yellow-700">23</p>
                              <p className="text-sm text-yellow-600">Зоны риска</p>
                            </div>
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-2xl font-bold text-green-700">85%</p>
                              <p className="text-sm text-green-600">Покрытие здоровых</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-12 text-center">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {selectedMission.status === 'processing' 
                            ? 'Отчёт формируется...' 
                            : 'Отчёт будет доступен после обработки снимков'}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Полетные задания БПЛА</h2>
          <p className="text-muted-foreground">
            Создание и управление инспекциями полей с помощью беспилотников
          </p>
        </div>
        <Button onClick={() => setShowWizard(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Создать полетное задание
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="missions">Все задания</TabsTrigger>
          <TabsTrigger value="planned">Запланированные</TabsTrigger>
          <TabsTrigger value="active">Активные</TabsTrigger>
          <TabsTrigger value="completed">Завершённые</TabsTrigger>
        </TabsList>

        <TabsContent value="missions" className="space-y-4 mt-6">
          <div className="grid gap-4">
            {missions.map((mission) => (
              <Card 
                key={mission.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedMission(mission)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{mission.name}</h3>
                        <Badge className={getStatusColor(mission.status)}>
                          {getStatusIcon(mission.status)}
                          <span className="ml-2">{getStatusLabel(mission.status)}</span>
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mt-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{mission.field.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Plane className="w-4 h-4" />
                          <span>{mission.drone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Camera className="w-4 h-4" />
                          <span>{mission.camera}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{mission.date} • {mission.time}</span>
                        </div>
                      </div>

                      {mission.status !== 'planned' && mission.status !== 'completed' && (
                        <div className="mt-4">
                          <Progress value={mission.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">{mission.progress}% завершено</p>
                        </div>
                      )}
                    </div>

                    <ChevronRight className="w-5 h-5 text-muted-foreground ml-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="planned" className="mt-6">
          <div className="grid gap-4">
            {missions.filter(m => m.status === 'planned').map((mission) => (
              <Card 
                key={mission.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedMission(mission)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{mission.name}</h3>
                        <Badge className="bg-blue-500">
                          <Clock className="w-4 h-4 mr-2" />
                          Запланирована
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{mission.field.name} • {mission.date} в {mission.time}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground ml-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <div className="grid gap-4">
            {missions.filter(m => m.status === 'in-flight' || m.status === 'processing').map((mission) => (
              <Card 
                key={mission.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedMission(mission)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{mission.name}</h3>
                        <Badge className={getStatusColor(mission.status)}>
                          {getStatusIcon(mission.status)}
                          <span className="ml-2">{getStatusLabel(mission.status)}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{mission.field.name}</p>
                      <Progress value={mission.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">{mission.progress}% завершено</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground ml-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid gap-4">
            {missions.filter(m => m.status === 'completed' || m.status === 'ready').map((mission) => (
              <Card 
                key={mission.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedMission(mission)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{mission.name}</h3>
                        <Badge className={getStatusColor(mission.status)}>
                          {getStatusIcon(mission.status)}
                          <span className="ml-2">{getStatusLabel(mission.status)}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {mission.field.name} • {mission.date} • {mission.actualPhotos} снимков
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground ml-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}