import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Search, Plus, Leaf, MapPin, AlertTriangle, Upload, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

type WeedSeverity = 'High' | 'Medium' | 'Low';

type WeedEntry = {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  severity: WeedSeverity;
  description: string;
  controlMethods: string[];
  images: string[];
  detectedIn: string[];
  totalCount: number;
  averageDensity: number;
};

// Weed images - existing remote sources + local registry assets
const weedImages = {
  dandelion: ['https://i.ibb.co/DHFkLc6V/image.jpg'], // Одуванчик
  crabgrass: ['https://i.ibb.co/wrYTgVkP/image.jpg'], // Росичка
  pigweed: ['https://i.ibb.co/mFy52tPh/image.webp'], // Щирица
  thistle: ['https://i.ibb.co/dwgBWVNg/image.jpg'], // Полевой осот
  bindweed: ['/plants/vyunok/vyunok_1.jpg', '/plants/vyunok/vyunok_2.jpg'], // Вьюнок
  blackBindweed: ['/plants/gorets-vyunkovyi/gorets-vyunkovyi_1.jpg', '/plants/gorets-vyunkovyi/gorets-vyunkovyi_2.jpg'], // Горец вьюнковый
  ladyThumb: ['/plants/gorets-pochechui/gorets-pochechui_1.jpg', '/plants/gorets-pochechui/gorets-pochechui_2.jpg'], // Горец почечуйный
  broadleafGroup: ['/plants/dvodolnye/dvodolnye_1.jpg', '/plants/dvodolnye/dvodolnye_2.jpg'], // Двудольные
  grassesGroup: ['/plants/zlakovye/zlakovye_1.jpg', '/plants/zlakovye/zlakovye_2.jpg'], // Злаковые
  chenopodsGroup: ['/plants/marevye/marevye_1.jpg', '/plants/marevye/marevye_2.jpg'], // Маревые
  sowthistleGroup: ['/plants/osot-bodyak-latuk/osot-bodyak-latuk_1.jpg', '/plants/osot-bodyak-latuk/osot-bodyak-latuk_2.jpg'], // Осот, бодяк, латук
  horsetail: ['/plants/hvoshch/hvoshch_1.jpg', '/plants/hvoshch/hvoshch_2.jpg'], // Хвощ
  mintFamily: ['/plants/chistec-pikulnik-yasnotka/chistec-pikulnik-yasnotka_1.jpg', '/plants/chistec-pikulnik-yasnotka/chistec-pikulnik-yasnotka_2.jpg'], // Чистец, пикульник, яснотка однолетние
};

const mockWeeds: WeedEntry[] = [
  {
    id: '1',
    name: 'Одуванчик',
    scientificName: 'Taraxacum officinale',
    category: 'Широколистный',
    severity: 'Medium',
    description: 'Обычный многолетний сорняк с желтыми цветами. Распространяется семенами, разносимыми ветром.',
    controlMethods: ['Механическое удаление', 'Селективный гербицид', 'Культурный контроль'],
    images: weedImages.dandelion,
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
    images: weedImages.crabgrass,
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
    images: weedImages.pigweed,
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
    images: weedImages.thistle,
    detectedIn: ['Южное поле B'],
    totalCount: 12,
    averageDensity: 1.4
  },
  {
    id: '5',
    name: 'Вьюнок',
    scientificName: 'Convolvulus arvensis',
    category: 'Широколистный, вьющееся',
    severity: 'High',
    description: 'Многолетний вьющийся сорняк с бело-розовыми воронковидными цветками. Размножается семенами и корневыми отпрысками, оплетает культуры и угнетает их.',
    controlMethods: ['Системные гербициды по вегетации', 'Повторное скашивание', 'Глубокая обработка почвы'],
    images: weedImages.bindweed,
    detectedIn: ['Северное поле A', 'Восточное поле C'],
    totalCount: 31,
    averageDensity: 2.7
  },
  {
    id: '6',
    name: 'Горец вьюнковый',
    scientificName: 'Fallopia convolvulus',
    category: 'Широколистный, однолетний',
    severity: 'Medium',
    description: 'Однолетняя лиана с треугольными листьями, обвивает растения и затрудняет уборку. Даёт обильный самосев.',
    controlMethods: ['Предпосевное боронование', 'Селективные гербициды против двудольных', 'Севооборот'],
    images: weedImages.blackBindweed,
    detectedIn: ['Западное поле D', 'Южное поле B'],
    totalCount: 19,
    averageDensity: 1.6
  },
  {
    id: '7',
    name: 'Горец почечуйный',
    scientificName: 'Persicaria maculosa',
    category: 'Широколистный, однолетний',
    severity: 'Medium',
    description: 'Однолетний сорняк влажных мест с характерным тёмным пятном на листьях. Быстро образует семена и засоряет посевы.',
    controlMethods: ['Довсходовые гербициды', 'Механическое удаление до семяобразования', 'Поддержание чистоты канав и меж'],
    images: weedImages.ladyThumb,
    detectedIn: ['Южное поле B'],
    totalCount: 14,
    averageDensity: 1.1
  },
  {
    id: '8',
    name: 'Двудольные',
    scientificName: 'Dicotyledones spp.',
    category: 'Широколистные',
    severity: 'Medium',
    description: 'Сборная группа двудольных сорняков, конкурирующих с культурами за свет, влагу и элементы питания.',
    controlMethods: ['Селективные гербициды против двудольных', 'Механическая междурядная обработка', 'Покровные культуры и севооборот'],
    images: weedImages.broadleafGroup,
    detectedIn: ['Северное поле A', 'Восточное поле C', 'Западное поле D'],
    totalCount: 62,
    averageDensity: 4.5
  },
  {
    id: '9',
    name: 'Злаковые',
    scientificName: 'Poaceae spp.',
    category: 'Злаковые',
    severity: 'Medium',
    description: 'Группа однолетних и многолетних злаковых сорняков. Быстро кущатся и вытесняют культурные растения.',
    controlMethods: ['Гербициды против злаков', 'Севооборот', 'Контроль всходов до кущения'],
    images: weedImages.grassesGroup,
    detectedIn: ['Северное поле A', 'Восточное поле C'],
    totalCount: 54,
    averageDensity: 3.9
  },
  {
    id: '10',
    name: 'Маревые (Марь, Лебеда, Кохия, Солянка)',
    scientificName: 'Amaranthaceae (Chenopodiaceae) spp.',
    category: 'Широколистные',
    severity: 'Medium',
    description: 'Группа маревых с быстрым ростом и высоким семенным продуктивом. Хорошо адаптируются к засушливым условиям.',
    controlMethods: ['Раннее рыхление и боронование', 'Селективные гербициды против двудольных', 'Снижение семенного банка'],
    images: weedImages.chenopodsGroup,
    detectedIn: ['Западное поле D', 'Южное поле B'],
    totalCount: 27,
    averageDensity: 2.3
  },
  {
    id: '11',
    name: 'Осот, бодяк, латук',
    scientificName: 'Asteraceae: Sonchus/Cirsium/Lactuca spp.',
    category: 'Широколистные, корнеотпрысковые',
    severity: 'High',
    description: 'Многолетние сорняки семейства астровых с мощной корневой системой. Трудноискоренимы, быстро восстанавливаются после скашивания.',
    controlMethods: ['Системные гербициды по розеткам', 'Повторное скашивание', 'Истощение корневой системы'],
    images: weedImages.sowthistleGroup,
    detectedIn: ['Южное поле B', 'Восточное поле C'],
    totalCount: 22,
    averageDensity: 1.8
  },
  {
    id: '12',
    name: 'Хвощ',
    scientificName: 'Equisetum arvense',
    category: 'Хвощевые',
    severity: 'High',
    description: 'Многолетний корневищный сорняк влажных и кислых почв. Имеет весенние спороносные побеги и летние зелёные стебли.',
    controlMethods: ['Известкование кислых почв', 'Улучшение дренажа', 'Системные гербициды и механическое истощение'],
    images: weedImages.horsetail,
    detectedIn: ['Северное поле A'],
    totalCount: 16,
    averageDensity: 1.2
  },
  {
    id: '13',
    name: 'Чистец, пикульник, яснотка однолетние',
    scientificName: 'Lamiaceae: Stachys/Galeopsis/Lamium spp.',
    category: 'Широколистные',
    severity: 'Medium',
    description: 'Однолетние губоцветные с четырёхгранными стеблями и супротивными листьями. Засоряют посевы зерновых и пропашных культур.',
    controlMethods: ['Предпосевная обработка почвы', 'Селективные гербициды против двудольных', 'Севооборот'],
    images: weedImages.mintFamily,
    detectedIn: ['Восточное поле C', 'Западное поле D'],
    totalCount: 18,
    averageDensity: 1.5
  }
];

export function WeedRegistry() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWeed, setSelectedWeed] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [weedCountsByName, setWeedCountsByName] = useState<Record<string, number>>({});
  const [totalDetections, setTotalDetections] = useState(0);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

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
  const selectedImages = selectedWeedData?.images ?? [];

  useEffect(() => {
    const loadWeedCounts = async () => {
      setIsLoadingStats(true);
      try {
        const url = `https://${projectId}.supabase.co/rest/v1/weed_detection_stats?select=plant_name,count`;
        const response = await fetch(url, {
          headers: {
            'apikey': publicAnonKey,
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const rawData: { plant_name: string | null; count: number | null }[] = await response.json();

        const aggregated = new Map<string, number>();
        let total = 0;

        rawData.forEach((stat) => {
          const rawName = (stat.plant_name || '').trim();
          if (!rawName) return;
          if (rawName.toLowerCase().startsWith('нераспознанные')) return;

          const baseName = rawName.includes(' - ')
            ? rawName.split(' - ')[0].trim()
            : rawName;
          if (!baseName) return;

          const count = stat.count || 0;
          total += count;
          aggregated.set(baseName, (aggregated.get(baseName) || 0) + count);
        });

        setWeedCountsByName(Object.fromEntries(aggregated.entries()));
        setTotalDetections(total);
      } catch (error) {
        console.error('Error loading weed stats:', error);
        setWeedCountsByName({});
        setTotalDetections(0);
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadWeedCounts();
  }, []);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [selectedWeed]);

  const handlePrevImage = () => {
    if (!selectedWeedData || selectedImages.length < 2) return;
    setSelectedImageIndex((prev) => (prev - 1 + selectedImages.length) % selectedImages.length);
  };

  const handleNextImage = () => {
    if (!selectedWeedData || selectedImages.length < 2) return;
    setSelectedImageIndex((prev) => (prev + 1) % selectedImages.length);
  };

  const getWeedTotalCount = (weed: WeedEntry) => {
    return weedCountsByName[weed.name] ?? 0;
  };

  const detectedHighSeverity = mockWeeds.filter(
    (weed) => weed.severity === 'High' && getWeedTotalCount(weed) > 0,
  ).length;

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
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 relative">
                      <ImageWithFallback
                        src={weed.images[0]}
                        alt={weed.name}
                        className="w-full h-full object-cover"
                      />
                      {weed.images.length > 1 && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[11px] text-white">
                          <Images className="h-3 w-3" />
                          {weed.images.length}
                        </div>
                      )}
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
                          <span>{isLoadingStats ? '…' : getWeedTotalCount(weed)} обнаружено</span>
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
        <div
          className="space-y-4 self-start overflow-auto"
          style={{
            position: 'sticky',
            top: '1.5rem',
            maxHeight: 'calc(100vh - 1.5rem)',
          }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Детали сорняка</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedWeedData ? (
                <div className="space-y-4">
                  {/* Weed Image */}
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <ImageWithFallback
                      key={selectedWeedData.id}
                      src={selectedImages[selectedImageIndex] ?? selectedWeedData.images[0]}
                      alt={selectedWeedData.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {selectedImages.length > 1 && (
                    <div className="flex items-center justify-between text-sm">
                      <Button variant="outline" size="sm" onClick={handlePrevImage}>
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Предыдущее
                      </Button>
                      <span className="text-muted-foreground">
                        {selectedImageIndex + 1} / {selectedImages.length}
                      </span>
                      <Button variant="outline" size="sm" onClick={handleNextImage}>
                        Следующее
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}

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
                        <p>{isLoadingStats ? '…' : getWeedTotalCount(selectedWeedData)}</p>
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
                <span className="font-medium">
                  {isLoadingStats ? '…' : Object.keys(weedCountsByName).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Высокая серьезность</span>
                <span className="font-medium text-red-600">
                  {isLoadingStats ? '…' : detectedHighSeverity}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Всего обнаружений</span>
                <span className="font-medium">
                  {isLoadingStats ? '…' : totalDetections}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
