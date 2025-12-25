import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Search, Plus, Leaf, MapPin, AlertTriangle, Upload } from 'lucide-react';

// Weed images from Unsplash
const weedImages = {
  dandelion: 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=400&h=400&fit=crop&q=80',
  crabgrass: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=400&fit=crop&q=80',
  pigweed: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=400&h=400&fit=crop&q=80',
  thistle: 'https://images.unsplash.com/photo-1595608121062-2b5e0c8e8c7f?w=400&h=400&fit=crop&q=80',
};

const mockWeeds = [
  {
    id: '1',
    name: 'Одуванчик',
    scientificName: 'Taraxacum officinale',
    category: 'Широколистный',
    severity: 'Medium',
    description: 'Обычный многолетний сорняк с желтыми цветами. Распространяется семенами, разносимыми ветром.',
    controlMethods: ['Механическое удаление', 'Селективный гербицид', 'Культурный контроль'],
    image: weedImages.dandelion,
    detectedIn: ['Северное поле A', 'Западное поле D'],
    totalCount: 45,
    averageDensity: 3.2
  },
  {
    id: '2',
    name: 'Росичка',
    scientificName: 'Digitaria sanguinalis',
    category: 'Злаковый',
    severity: 'High',
    description: 'Однолетний злаковый сорняк, агрессивно конкурирующий с культурами за питательные вещества и воду.',
    controlMethods: ['Довсходовый гербицид', 'Послевсходовый гербицид', 'Севооборот'],
    image: weedImages.crabgrass,
    detectedIn: ['Северное поле A', 'Южное поле B'],
    totalCount: 78,
    averageDensity: 5.8
  },
  {
    id: '3',
    name: 'Щирица',
    scientificName: 'Amaranthus retroflexus',
    category: 'Широколистный',
    severity: 'High',
    description: 'Быстрорастущий однолетний сорняк, способный достигать значительной высоты и затенять культуры.',
    controlMethods: ['Вспашка', 'Применение гербицидов', 'Ручное удаление'],
    image: weedImages.pigweed,
    detectedIn: ['Западное поле D'],
    totalCount: 23,
    averageDensity: 2.1
  },
  {
    id: '4',
    name: 'Полевой осот',
    scientificName: 'Cirsium arvense',
    category: 'Широколистный',
    severity: 'Medium',
    description: 'Многолетний сорняк с глубокой корневой системой. Фиолетовые цветы и колючие листья.',
    controlMethods: ['Системный гербицид', 'Повторное скашивание', 'Биологический контроль'],
    image: weedImages.thistle,
    detectedIn: ['Южное поле B'],
    totalCount: 12,
    averageDensity: 1.4
  }
];

export function WeedRegistry() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWeed, setSelectedWeed] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredWeeds = mockWeeds.filter(weed =>
    weed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    weed.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    weed.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'Высокая';
      case 'medium': return 'Средняя';
      case 'low': return 'Низкая';
      default: return severity;
    }
  };

  const selectedWeedData = selectedWeed ? mockWeeds.find(w => w.id === selectedWeed) : null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1>Реестр сорняков</h1>
          <p className="text-muted-foreground">Идентификация и управление видами сорняков на ваших полях</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Добавить тип сорняка
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Добавить новый тип сорняка</DialogTitle>
              <DialogDescription>
                Заполните форму ниже, чтобы добавить новый тип сорняка в реестр
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Название</label>
                <Input placeholder="напр., Одуванчик обыкновенный" />
              </div>
              <div>
                <label className="text-sm font-medium">Научное название</label>
                <Input placeholder="напр., Taraxacum officinale" />
              </div>
              <div>
                <label className="text-sm font-medium">Категория</label>
                <Input placeholder="напр., Широколистный, Злаковый" />
              </div>
              <div>
                <label className="text-sm font-medium">Описание</label>
                <Textarea placeholder="Опишите характеристики сорняка..." rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium">Загрузить изображение</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Нажмите для загрузки изображения сорняка</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => setIsAddDialogOpen(false)}>
                  Добавить сорняк
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weed List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Поиск сорняков по названию, научному названию или категории..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Weeds Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredWeeds.map((weed) => (
              <Card 
                key={weed.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedWeed === weed.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedWeed(weed.id)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Weed Image */}
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <ImageWithFallback
                        src={weed.image}
                        alt={weed.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{weed.name}</h3>
                          <p className="text-sm text-muted-foreground italic">{weed.scientificName}</p>
                        </div>
                        <Badge className={getSeverityColor(weed.severity)}>
                          {getSeverityLabel(weed.severity)}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Leaf className="w-3 h-3" />
                          <span>{weed.category}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{weed.totalCount} обнаружено</span>
                        </div>
                      </div>

                      <div className="text-sm">
                        <p className="text-muted-foreground">Найдено в:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {weed.detectedIn.slice(0, 2).map((field, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {field}
                            </Badge>
                          ))}
                          {weed.detectedIn.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{weed.detectedIn.length - 2} ещё
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Weed Details Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Детали сорняка</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedWeedData ? (
                <div className="space-y-4">
                  {/* Weed Image */}
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <ImageWithFallback
                      key={selectedWeedData.id}
                      src={selectedWeedData.image}
                      alt={selectedWeedData.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Basic Info */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-medium">{selectedWeedData.name}</h3>
                      <p className="text-sm text-muted-foreground italic">{selectedWeedData.scientificName}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Категория</p>
                        <p className="font-medium">{selectedWeedData.category}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Серьезность</p>
                        <Badge className={getSeverityColor(selectedWeedData.severity)}>
                          {getSeverityLabel(selectedWeedData.severity)}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Описание</p>
                      <p className="text-sm mt-1">{selectedWeedData.description}</p>
                    </div>

                    {/* Detection Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Всего обнаружено</p>
                        <p>{selectedWeedData.totalCount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Средн. плотность</p>
                        <p>{selectedWeedData.averageDensity}/м²</p>
                      </div>
                    </div>

                    {/* Found In Fields */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Обнаружено на полях</p>
                      <div className="space-y-1">
                        {selectedWeedData.detectedIn.map((field, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span>{field}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Control Methods */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Методы контроля</p>
                      <div className="space-y-1">
                        {selectedWeedData.controlMethods.map((method, index) => (
                          <Badge key={index} variant="outline" className="block w-fit">
                            {method}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button className="w-full">
                      Посмотреть карту распределения
                    </Button>
                    <Button variant="outline" className="w-full">
                      История обработки
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Выберите тип сорняка для просмотра деталей
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Сводка реестра</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Всего типов сорняков</span>
                <span className="font-medium">{mockWeeds.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Высокая серьезность</span>
                <span className="font-medium text-red-600">
                  {mockWeeds.filter(w => w.severity === 'High').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Всего обнаружений</span>
                <span className="font-medium">
                  {mockWeeds.reduce((sum, w) => sum + w.totalCount, 0)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
