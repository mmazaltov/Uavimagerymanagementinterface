import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { MapComponent } from './MapComponent';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Eye, Calendar, AlertTriangle, CheckCircle, Plane, Clock, TrendingUp } from 'lucide-react';
import type { ViewType } from '../App';

interface DashboardContentProps {
  onFieldSelect: (fieldId: string) => void;
  onViewChange: (view: ViewType) => void;
}

const mockFields = [
  {
    id: '1',
    name: 'Северное поле A',
    area: '45.2 га',
    status: 'active',
    lastInspection: '2024-09-20',
    weedCount: 23,
    hasData: true,
    inspections: 5,
    coordinates: { lat: 55.7558, lng: 37.6173 }
  },
  {
    id: '2',
    name: 'Южное поле B',
    area: '32.8 га',
    status: 'pending',
    lastInspection: '2024-09-18',
    weedCount: 7,
    hasData: true,
    inspections: 3,
    coordinates: { lat: 55.7512, lng: 37.6145 }
  },
  {
    id: '3',
    name: 'Восточное поле C',
    area: '67.5 га',
    status: 'scheduled',
    lastInspection: null,
    weedCount: 0,
    hasData: false,
    inspections: 0,
    coordinates: { lat: 55.7601, lng: 37.6220 }
  }
];

export function DashboardContent({ onFieldSelect, onViewChange }: DashboardContentProps) {
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Активно';
      case 'pending': return 'Ожидание';
      case 'scheduled': return 'Запланировано';
      default: return status;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Всего полей</p>
                <p>145.5 га</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Активных инспекций</p>
                <p>8</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Обнаружено сорняков</p>
                <p>156</p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Последний полет</p>
                <p>Сегодня</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="map" className="space-y-4">
        <TabsList>
          <TabsTrigger value="map">Вид карты</TabsTrigger>
          <TabsTrigger value="list">Вид списка</TabsTrigger>
        </TabsList>
        
        <TabsContent value="map" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Обзорная карта полей</CardTitle>
              </CardHeader>
              <CardContent>
                <MapComponent 
                  fields={mockFields} 
                  onPointSelect={setSelectedPoint}
                  selectedPoint={selectedPoint}
                />
              </CardContent>
            </Card>

            {/* Field Details */}
            <Card>
              <CardHeader>
                <CardTitle>Детали поля</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedPoint ? (
                  (() => {
                    const field = mockFields.find(f => f.id === selectedPoint);
                    return field ? (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium">{field.name}</h3>
                          <p className="text-sm text-muted-foreground">{field.area}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(field.status)}>
                            {getStatusLabel(field.status)}
                          </Badge>
                          {field.hasData && (
                            <Badge variant="outline">
                              Данные доступны
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="font-medium">Инспекций:</span> {field.inspections}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Найдено сорняков:</span> {field.weedCount}
                          </p>
                          {field.lastInspection && (
                            <p className="text-sm">
                              <span className="font-medium">Последняя инспекция:</span> {field.lastInspection}
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Button 
                            className="w-full" 
                            size="sm"
                            onClick={() => {
                              onFieldSelect(field.id);
                              onViewChange('fields');
                            }}
                          >
                            Просмотр деталей поля
                          </Button>
                          {field.inspections > 0 && (
                            <Button 
                              variant="outline" 
                              className="w-full" 
                              size="sm"
                              onClick={() => onViewChange('inspection')}
                            >
                              Просмотр инспекций
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : null;
                  })()
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Нажмите на маркер поля для просмотра деталей
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="list" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockFields.map((field) => (
              <Card key={field.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{field.name}</h3>
                      <Badge className={getStatusColor(field.status)}>
                        {getStatusLabel(field.status)}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <p>Площадь: {field.area}</p>
                      <p>Инспекций: {field.inspections}</p>
                      <p>Сорняков: {field.weedCount}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          onFieldSelect(field.id);
                          onViewChange('fields');
                        }}
                      >
                        Детали
                      </Button>
                      {field.inspections > 0 && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onViewChange('inspection')}
                        >
                          Инспекция
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Flight Missions Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Plane className="w-5 h-5" />
                Обзор полетных заданий
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Актуальная информация по запланированным и выполненным полетам
              </p>
            </div>
            <Button variant="outline" onClick={() => onViewChange('missions')}>
              Все задания
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Stats Cards */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Запланировано</span>
              </div>
              <div className="text-3xl">4</div>
              <p className="text-xs text-muted-foreground">На ближайшую неделю</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Plane className="w-4 h-4" />
                <span className="text-sm">Активные</span>
              </div>
              <div className="text-3xl">2</div>
              <p className="text-xs text-muted-foreground">В процессе выполнения</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Завершено</span>
              </div>
              <div className="text-3xl">18</div>
              <p className="text-xs text-muted-foreground">За текущий месяц</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Площадь покрытия</span>
              </div>
              <div className="text-3xl">428</div>
              <p className="text-xs text-muted-foreground">Гектаров обследовано</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Mission */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Ближайшее задание</h4>
                <Badge className="bg-blue-100 text-blue-800">Запланировано</Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm">Инспекция поля №1 - Контроль сорняков</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    08.11.2025 в 09:00
                  </span>
                  <span>Поле №1 Пшеница (15.5 га)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">БПЛА:</span>
                  <span>DJI Matrice 300 RTK</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Оператор:</span>
                  <span>Иванов И.И.</span>
                </div>
              </div>
            </div>

            {/* Recent Missions */}
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-medium">Недавно завершенные</h4>
              <div className="space-y-3">
                <div className="flex items-start justify-between text-sm">
                  <div className="flex-1">
                    <p className="font-medium">Контроль роста кукурузы</p>
                    <p className="text-xs text-muted-foreground">Поле №2 • 06.11.2025</p>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Готово
                  </Badge>
                </div>
                <div className="flex items-start justify-between text-sm">
                  <div className="flex-1">
                    <p className="font-medium">Мониторинг вредителей</p>
                    <p className="text-xs text-muted-foreground">Поле №4 • 05.11.2025</p>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Готово
                  </Badge>
                </div>
                <div className="flex items-start justify-between text-sm">
                  <div className="flex-1">
                    <p className="font-medium">Оценка густоты посева</p>
                    <p className="text-xs text-muted-foreground">Поле №3 • 04.11.2025</p>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Готово
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}