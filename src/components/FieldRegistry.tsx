import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Search, Plus, Eye, Calendar, MapPin, AlertTriangle } from 'lucide-react';
import type { ViewType } from '../App';

interface FieldRegistryProps {
  onFieldSelect: (fieldId: string) => void;
  onViewChange: (view: ViewType) => void;
}

const mockFields = [
  {
    id: '1',
    name: 'Северное поле A',
    area: 45.2,
    crop: 'Кукуруза',
    planted: '2024-04-15',
    status: 'active',
    lastInspection: '2024-09-20',
    weedCount: 23,
    hasData: true,
    inspections: 5,
    location: 'Сектор N-1',
    ndvi: 0.85,
    issues: ['Высокая плотность сорняков', 'Дефицит питательных веществ']
  },
  {
    id: '2', 
    name: 'Южное поле B',
    area: 32.8,
    crop: 'Соя',
    planted: '2024-05-01',
    status: 'pending',
    lastInspection: '2024-09-18',
    weedCount: 7,
    hasData: true,
    inspections: 3,
    location: 'Сектор S-2',
    ndvi: 0.72,
    issues: ['Обнаружены вредители']
  },
  {
    id: '3',
    name: 'Восточное поле C',
    area: 67.5,
    crop: 'Пшеница',
    planted: '2024-03-20',
    status: 'scheduled',
    lastInspection: null,
    weedCount: 0,
    hasData: false,
    inspections: 0,
    location: 'Сектор E-3',
    ndvi: null,
    issues: []
  },
  {
    id: '4',
    name: 'Западное поле D',
    area: 28.7,
    crop: 'Ячмень',
    planted: '2024-04-10',
    status: 'active',
    lastInspection: '2024-09-19',
    weedCount: 12,
    hasData: true,
    inspections: 4,
    location: 'Сектор W-1',
    ndvi: 0.78,
    issues: ['Умеренное присутствие сорняков']
  }
];

export function FieldRegistry({ onFieldSelect, onViewChange }: FieldRegistryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedField, setSelectedField] = useState<string | null>(null);

  const filteredFields = mockFields.filter(field =>
    field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    field.crop.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const selectedFieldData = selectedField ? mockFields.find(f => f.id === selectedField) : null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1>Реестр полей</h1>
          <p className="text-muted-foreground">Управление и мониторинг сельскохозяйственных полей</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Добавить поле
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fields List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Поиск полей по названию или культуре..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFields.map((field) => (
              <Card 
                key={field.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedField === field.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedField(field.id)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{field.name}</h3>
                        <p className="text-sm text-muted-foreground">{field.crop} • {field.area} га</p>
                      </div>
                      <Badge className={getStatusColor(field.status)}>
                        {getStatusLabel(field.status)}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{field.location}</span>
                      </div>
                      {field.ndvi && (
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-green-500 rounded-full" />
                          <span>NDVI: {field.ndvi}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span>Инспекций: {field.inspections}</span>
                      {field.weedCount > 0 && (
                        <span className="text-red-600 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {field.weedCount} сорняков
                        </span>
                      )}
                    </div>

                    {field.lastInspection && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>Последняя: {field.lastInspection}</span>
                      </div>
                    )}

                    {field.issues.length > 0 && (
                      <div className="space-y-1">
                        {field.issues.slice(0, 2).map((issue, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {issue}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Field Details Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Детали поля</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedFieldData ? (
                <div className="space-y-4">
                  {/* Field Image */}
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1643145476486-a5ce26244724?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZ3JpY3VsdHVyYWwlMjBmaWVsZCUyMGFlcmlhbCUyMHZpZXd8ZW58MXx8fHwxNzU4NDgzMDMyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                      alt={`${selectedFieldData.name} aerial view`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Field Info */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-medium">{selectedFieldData.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedFieldData.location}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Площадь</p>
                        <p className="font-medium">{selectedFieldData.area} га</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Культура</p>
                        <p className="font-medium">{selectedFieldData.crop}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Посажено</p>
                        <p className="font-medium">{selectedFieldData.planted}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Статус</p>
                        <Badge className={getStatusColor(selectedFieldData.status)}>
                          {getStatusLabel(selectedFieldData.status)}
                        </Badge>
                      </div>
                    </div>

                    {selectedFieldData.ndvi && (
                      <div>
                        <p className="text-sm text-muted-foreground">Значение NDVI</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${selectedFieldData.ndvi * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{selectedFieldData.ndvi}</span>
                        </div>
                      </div>
                    )}

                    {selectedFieldData.issues.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Проблемы</p>
                        <div className="space-y-1">
                          {selectedFieldData.issues.map((issue, index) => (
                            <Badge key={index} variant="outline" className="block w-fit">
                              {issue}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button className="w-full" onClick={() => onViewChange('inspection')}>
                      <Eye className="w-4 h-4 mr-2" />
                      Просмотр инспекций ({selectedFieldData.inspections})
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      Запланировать инспекцию
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Выберите поле для просмотра деталей
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
