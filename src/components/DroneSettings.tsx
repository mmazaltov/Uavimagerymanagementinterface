import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { 
  Plane, 
  Camera, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  Settings as SettingsIcon,
  Route
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { toast } from 'sonner@2.0.3';

interface Drone {
  id: string;
  name: string;
  model: string;
  maxAltitude: number;
  maxSpeed: number;
  flightTime: number;
  weight: number;
  status: 'active' | 'maintenance' | 'inactive';
}

interface Camera {
  id: string;
  name: string;
  model: string;
  resolution: string;
  fov: string;
  format: string;
  sensorSize: string;
  status: 'active' | 'maintenance' | 'inactive';
}

interface FlightTemplate {
  id: string;
  name: string;
  pattern: string;
  altitude: number;
  speed: number;
  overlap: number;
  sideOverlap: number;
  description: string;
}

const mockDrones: Drone[] = [
  {
    id: 'd1',
    name: 'DJI Matrice 300 RTK',
    model: 'M300 RTK',
    maxAltitude: 7000,
    maxSpeed: 82,
    flightTime: 55,
    weight: 6.3,
    status: 'active',
  },
  {
    id: 'd2',
    name: 'DJI Phantom 4 Pro',
    model: 'P4 Pro V2.0',
    maxAltitude: 6000,
    maxSpeed: 72,
    flightTime: 30,
    weight: 1.4,
    status: 'active',
  },
  {
    id: 'd3',
    name: 'senseFly eBee X',
    model: 'eBee X',
    maxAltitude: 5000,
    maxSpeed: 90,
    flightTime: 90,
    weight: 1.6,
    status: 'maintenance',
  },
];

const mockCameras: Camera[] = [
  {
    id: 'c1',
    name: 'Zenmuse P1',
    model: 'P1',
    resolution: '45MP (8192x5460)',
    fov: '63.5°',
    format: 'JPG/DNG',
    sensorSize: 'Full Frame 35mm',
    status: 'active',
  },
  {
    id: 'c2',
    name: 'MicaSense RedEdge-MX',
    model: 'RedEdge-MX',
    resolution: '5x1.2MP',
    fov: '47.2°',
    format: 'TIFF',
    sensorSize: 'Multispectral',
    status: 'active',
  },
  {
    id: 'c3',
    name: 'FLIR Vue TZ20',
    model: 'Vue TZ20',
    resolution: '640x512',
    fov: '25°',
    format: 'TIFF/JPG',
    sensorSize: 'Thermal',
    status: 'active',
  },
];

const mockTemplates: FlightTemplate[] = [
  {
    id: 't1',
    name: 'Стандартный облёт - Зигзаг',
    pattern: 'zigzag',
    altitude: 120,
    speed: 12,
    overlap: 75,
    sideOverlap: 65,
    description: 'Оптимальный шаблон для прямоугольных полей с высокой точностью',
  },
  {
    id: 't2',
    name: 'Быстрый облёт - Параллельно',
    pattern: 'parallel',
    altitude: 150,
    speed: 15,
    overlap: 70,
    sideOverlap: 60,
    description: 'Ускоренное сканирование для предварительной оценки',
  },
  {
    id: 't3',
    name: 'Детальный облёт - Сетка',
    pattern: 'grid',
    altitude: 100,
    speed: 10,
    overlap: 80,
    sideOverlap: 75,
    description: 'Максимальная детализация для точного анализа',
  },
];

export function DroneSettings() {
  const [drones, setDrones] = useState<Drone[]>(mockDrones);
  const [cameras, setCameras] = useState<Camera[]>(mockCameras);
  const [templates, setTemplates] = useState<FlightTemplate[]>(mockTemplates);
  const [editingDrone, setEditingDrone] = useState<Drone | null>(null);
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<FlightTemplate | null>(null);
  const [showDroneDialog, setShowDroneDialog] = useState(false);
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'inactive': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'maintenance': return 'Обслуживание';
      case 'inactive': return 'Неактивен';
      default: return status;
    }
  };

  const handleSaveDrone = () => {
    if (editingDrone) {
      if (editingDrone.id.startsWith('new-')) {
        setDrones([...drones, { ...editingDrone, id: `d${drones.length + 1}` }]);
        toast.success('БПЛА добавлен в систему');
      } else {
        setDrones(drones.map(d => d.id === editingDrone.id ? editingDrone : d));
        toast.success('Данные БПЛА обновлены');
      }
      setEditingDrone(null);
      setShowDroneDialog(false);
    }
  };

  const handleSaveCamera = () => {
    if (editingCamera) {
      if (editingCamera.id.startsWith('new-')) {
        setCameras([...cameras, { ...editingCamera, id: `c${cameras.length + 1}` }]);
        toast.success('Камера добавлена в систему');
      } else {
        setCameras(cameras.map(c => c.id === editingCamera.id ? editingCamera : c));
        toast.success('Данные камеры обновлены');
      }
      setEditingCamera(null);
      setShowCameraDialog(false);
    }
  };

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      if (editingTemplate.id.startsWith('new-')) {
        setTemplates([...templates, { ...editingTemplate, id: `t${templates.length + 1}` }]);
        toast.success('Шаблон маршрута создан');
      } else {
        setTemplates(templates.map(t => t.id === editingTemplate.id ? editingTemplate : t));
        toast.success('Шаблон маршрута обновлён');
      }
      setEditingTemplate(null);
      setShowTemplateDialog(false);
    }
  };

  const handleDeleteDrone = (id: string) => {
    setDrones(drones.filter(d => d.id !== id));
    toast.success('БПЛА удалён из системы');
  };

  const handleDeleteCamera = (id: string) => {
    setCameras(cameras.filter(c => c.id !== id));
    toast.success('Камера удалена из системы');
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    toast.success('Шаблон удалён');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Настройки оборудования и шаблонов</h2>
        <p className="text-muted-foreground">
          Управление парком БПЛА, камерами и шаблонами маршрутов
        </p>
      </div>

      <Tabs defaultValue="drones">
        <TabsList>
          <TabsTrigger value="drones">БПЛА</TabsTrigger>
          <TabsTrigger value="cameras">Камеры</TabsTrigger>
          <TabsTrigger value="templates">Шаблоны маршрутов</TabsTrigger>
        </TabsList>

        <TabsContent value="drones" className="space-y-4 mt-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Всего БПЛА: {drones.length}
            </p>
            <Dialog open={showDroneDialog} onOpenChange={setShowDroneDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingDrone({
                    id: 'new-' + Date.now(),
                    name: '',
                    model: '',
                    maxAltitude: 0,
                    maxSpeed: 0,
                    flightTime: 0,
                    weight: 0,
                    status: 'active',
                  });
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить БПЛА
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingDrone?.id.startsWith('new-') ? 'Добавить БПЛА' : 'Редактировать БПЛА'}
                  </DialogTitle>
                  <DialogDescription>
                    Укажите параметры беспилотного летательного аппарата
                  </DialogDescription>
                </DialogHeader>
                {editingDrone && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="drone-name">Название</Label>
                      <Input
                        id="drone-name"
                        value={editingDrone.name}
                        onChange={(e) => setEditingDrone({ ...editingDrone, name: e.target.value })}
                        placeholder="DJI Matrice 300 RTK"
                      />
                    </div>
                    <div>
                      <Label htmlFor="drone-model">Модель</Label>
                      <Input
                        id="drone-model"
                        value={editingDrone.model}
                        onChange={(e) => setEditingDrone({ ...editingDrone, model: e.target.value })}
                        placeholder="M300 RTK"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="max-altitude">Макс. высота (м)</Label>
                        <Input
                          id="max-altitude"
                          type="number"
                          value={editingDrone.maxAltitude}
                          onChange={(e) => setEditingDrone({ ...editingDrone, maxAltitude: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="max-speed">Макс. скорость (км/ч)</Label>
                        <Input
                          id="max-speed"
                          type="number"
                          value={editingDrone.maxSpeed}
                          onChange={(e) => setEditingDrone({ ...editingDrone, maxSpeed: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="flight-time">Время полёта (мин)</Label>
                        <Input
                          id="flight-time"
                          type="number"
                          value={editingDrone.flightTime}
                          onChange={(e) => setEditingDrone({ ...editingDrone, flightTime: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="weight">Вес (кг)</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.1"
                          value={editingDrone.weight}
                          onChange={(e) => setEditingDrone({ ...editingDrone, weight: parseFloat(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => { setShowDroneDialog(false); setEditingDrone(null); }}>
                        Отмена
                      </Button>
                      <Button onClick={handleSaveDrone}>
                        <Save className="w-4 h-4 mr-2" />
                        Сохранить
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {drones.map((drone) => (
              <Card key={drone.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Plane className="w-5 h-5 text-primary" />
                        <h3 className="font-medium">{drone.name}</h3>
                        <Badge className={getStatusColor(drone.status)}>
                          {getStatusLabel(drone.status)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm text-muted-foreground">
                        <div>
                          <p className="text-xs text-muted-foreground">Модель</p>
                          <p className="font-medium text-foreground">{drone.model}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Макс. высота</p>
                          <p className="font-medium text-foreground">{drone.maxAltitude} м</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Скорость</p>
                          <p className="font-medium text-foreground">{drone.maxSpeed} км/ч</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Время полёта</p>
                          <p className="font-medium text-foreground">{drone.flightTime} мин</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingDrone(drone);
                          setShowDroneDialog(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteDrone(drone.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cameras" className="space-y-4 mt-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Всего камер: {cameras.length}
            </p>
            <Dialog open={showCameraDialog} onOpenChange={setShowCameraDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingCamera({
                    id: 'new-' + Date.now(),
                    name: '',
                    model: '',
                    resolution: '',
                    fov: '',
                    format: '',
                    sensorSize: '',
                    status: 'active',
                  });
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить камеру
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCamera?.id.startsWith('new-') ? 'Добавить камеру' : 'Редактировать камеру'}
                  </DialogTitle>
                  <DialogDescription>
                    Укажите параметры камеры для съёмки
                  </DialogDescription>
                </DialogHeader>
                {editingCamera && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="camera-name">Название</Label>
                      <Input
                        id="camera-name"
                        value={editingCamera.name}
                        onChange={(e) => setEditingCamera({ ...editingCamera, name: e.target.value })}
                        placeholder="Zenmuse P1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="camera-model">Модель</Label>
                      <Input
                        id="camera-model"
                        value={editingCamera.model}
                        onChange={(e) => setEditingCamera({ ...editingCamera, model: e.target.value })}
                        placeholder="P1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="resolution">Разрешение</Label>
                        <Input
                          id="resolution"
                          value={editingCamera.resolution}
                          onChange={(e) => setEditingCamera({ ...editingCamera, resolution: e.target.value })}
                          placeholder="45MP"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fov">FOV</Label>
                        <Input
                          id="fov"
                          value={editingCamera.fov}
                          onChange={(e) => setEditingCamera({ ...editingCamera, fov: e.target.value })}
                          placeholder="63.5°"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="format">Формат</Label>
                        <Input
                          id="format"
                          value={editingCamera.format}
                          onChange={(e) => setEditingCamera({ ...editingCamera, format: e.target.value })}
                          placeholder="JPG/DNG"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sensor">Сенсор</Label>
                        <Input
                          id="sensor"
                          value={editingCamera.sensorSize}
                          onChange={(e) => setEditingCamera({ ...editingCamera, sensorSize: e.target.value })}
                          placeholder="Full Frame"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => { setShowCameraDialog(false); setEditingCamera(null); }}>
                        Отмена
                      </Button>
                      <Button onClick={handleSaveCamera}>
                        <Save className="w-4 h-4 mr-2" />
                        Сохранить
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {cameras.map((camera) => (
              <Card key={camera.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Camera className="w-5 h-5 text-primary" />
                        <h3 className="font-medium">{camera.name}</h3>
                        <Badge className={getStatusColor(camera.status)}>
                          {getStatusLabel(camera.status)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Модель</p>
                          <p className="font-medium">{camera.model}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Разрешение</p>
                          <p className="font-medium">{camera.resolution}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">FOV</p>
                          <p className="font-medium">{camera.fov}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Сенсор</p>
                          <p className="font-medium">{camera.sensorSize}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingCamera(camera);
                          setShowCameraDialog(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteCamera(camera.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4 mt-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Всего шаблонов: {templates.length}
            </p>
            <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingTemplate({
                    id: 'new-' + Date.now(),
                    name: '',
                    pattern: 'zigzag',
                    altitude: 120,
                    speed: 12,
                    overlap: 75,
                    sideOverlap: 65,
                    description: '',
                  });
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Создать шаблон
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingTemplate?.id.startsWith('new-') ? 'Создать шаблон' : 'Редактировать шаблон'}
                  </DialogTitle>
                  <DialogDescription>
                    Настройте параметры шаблона маршрута
                  </DialogDescription>
                </DialogHeader>
                {editingTemplate && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="template-name">Название</Label>
                      <Input
                        id="template-name"
                        value={editingTemplate.name}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                        placeholder="Стандартный облёт"
                      />
                    </div>
                    <div>
                      <Label htmlFor="template-description">Описание</Label>
                      <Input
                        id="template-description"
                        value={editingTemplate.description}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                        placeholder="Описание шаблона"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="template-altitude">Высота (м)</Label>
                        <Input
                          id="template-altitude"
                          type="number"
                          value={editingTemplate.altitude}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, altitude: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="template-speed">Скорость (м/с)</Label>
                        <Input
                          id="template-speed"
                          type="number"
                          value={editingTemplate.speed}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, speed: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="template-overlap">Перекрытие (%)</Label>
                        <Input
                          id="template-overlap"
                          type="number"
                          value={editingTemplate.overlap}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, overlap: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="template-side">Боковое (%)</Label>
                        <Input
                          id="template-side"
                          type="number"
                          value={editingTemplate.sideOverlap}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, sideOverlap: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => { setShowTemplateDialog(false); setEditingTemplate(null); }}>
                        Отмена
                      </Button>
                      <Button onClick={handleSaveTemplate}>
                        <Save className="w-4 h-4 mr-2" />
                        Сохранить
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Route className="w-5 h-5 text-primary" />
                        <h3 className="font-medium">{template.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Высота</p>
                          <p className="font-medium">{template.altitude} м</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Скорость</p>
                          <p className="font-medium">{template.speed} м/с</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Перекрытие</p>
                          <p className="font-medium">{template.overlap}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Боковое</p>
                          <p className="font-medium">{template.sideOverlap}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingTemplate(template);
                          setShowTemplateDialog(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
