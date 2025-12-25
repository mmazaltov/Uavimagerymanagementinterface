import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Calendar, Leaf } from 'lucide-react';

const weedDetectionData = [
  { month: 'Апр', dandelion: 12, crabgrass: 8, pigweed: 5, thistle: 3 },
  { month: 'Май', dandelion: 18, crabgrass: 15, pigweed: 12, thistle: 7 },
  { month: 'Июн', dandelion: 25, crabgrass: 22, pigweed: 18, thistle: 9 },
  { month: 'Июл', dandelion: 32, crabgrass: 28, pigweed: 20, thistle: 12 },
  { month: 'Авг', dandelion: 28, crabgrass: 25, pigweed: 16, thistle: 8 },
  { month: 'Сен', dandelion: 23, crabgrass: 18, pigweed: 12, thistle: 6 }
];

const fieldComparisonData = [
  { field: 'Северное A', weeds: 45, treated: 38, efficiency: 84 },
  { field: 'Южное B', weeds: 32, treated: 29, efficiency: 91 },
  { field: 'Восточное C', weeds: 28, treated: 22, efficiency: 79 },
  { field: 'Западное D', weeds: 51, treated: 44, efficiency: 86 }
];

const treatmentEffectivenessData = [
  { week: 'Неделя 1', pretreatment: 45, posttreatment: 42 },
  { week: 'Неделя 2', pretreatment: 42, posttreatment: 35 },
  { week: 'Неделя 3', pretreatment: 35, posttreatment: 28 },
  { week: 'Неделя 4', pretreatment: 28, posttreatment: 18 },
  { week: 'Неделя 5', pretreatment: 18, posttreatment: 12 },
  { week: 'Неделя 6', pretreatment: 12, posttreatment: 8 }
];

const weedDistributionData = [
  { name: 'Одуванчик', value: 126, color: '#ef4444' },
  { name: 'Росичка', value: 98, color: '#f59e0b' },
  { name: 'Щирица', value: 67, color: '#10b981' },
  { name: 'Полевой осот', value: 34, color: '#6366f1' }
];

const cropDensityData = [
  { field: 'Северное A', density: 85, target: 90 },
  { field: 'Южное B', density: 92, target: 90 },
  { field: 'Восточное C', density: 78, target: 90 },
  { field: 'Западное D', density: 88, target: 90 }
];

export function Analytics() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1>Панель аналитики</h1>
        <p className="text-muted-foreground">Комплексный анализ данных мониторинга БПЛА и производительности полей</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Всего обнаружено сорняков</p>
                <p>325</p>
                <div className="flex items-center gap-1">
                  <TrendingDown className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">-12% по сравнению с прошлым месяцем</span>
                </div>
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
                <p className="text-muted-foreground">Эффективность обработки</p>
                <p>87%</p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">+5% по сравнению с прошлым месяцем</span>
                </div>
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
                <p className="text-muted-foreground">Средняя плотность посевов</p>
                <p>86%</p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">+3% по сравнению с целевым</span>
                </div>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Leaf className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Частота инспекций</p>
                <p>2.3</p>
                <p className="text-muted-foreground">дней в среднем</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Тренды сорняков</TabsTrigger>
          <TabsTrigger value="fields">Сравнение полей</TabsTrigger>
          <TabsTrigger value="treatment">Анализ обработки</TabsTrigger>
          <TabsTrigger value="crops">Здоровье посевов</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Тренды обнаружения сорняков со временем</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={weedDetectionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="dandelion" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.8} />
                    <Area type="monotone" dataKey="crabgrass" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.8} />
                    <Area type="monotone" dataKey="pigweed" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.8} />
                    <Area type="monotone" dataKey="thistle" stackId="1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.8} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Распределение сорняков</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={weedDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {weedDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {weedDistributionData.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: entry.color }}
                        />
                        <span>{entry.name}</span>
                      </div>
                      <span className="font-medium">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fields" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Сравнение производительности полей</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={fieldComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="field" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="weeds" fill="#ef4444" name="Обнаружено сорняков" />
                  <Bar dataKey="treated" fill="#10b981" name="Успешно обработано" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {fieldComparisonData.map((field, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{field.field}</h3>
                      <Badge 
                        className={field.efficiency >= 85 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                      >
                        {field.efficiency}%
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Сорняков:</span>
                        <span>{field.weeds}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Обработано:</span>
                        <span>{field.treated}</span>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${field.efficiency}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="treatment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Эффективность обработки со временем</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={treatmentEffectivenessData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="pretreatment" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="До обработки"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="posttreatment" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="После обработки"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Сводка обработки</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-green-600">73%</p>
                  <p className="text-muted-foreground">Снижение количества сорняков</p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Начальное количество:</span>
                    <span className="font-medium">45 сорняков</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Текущее количество:</span>
                    <span className="font-medium">12 сорняков</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Период обработки:</span>
                    <span className="font-medium">6 недель</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Наиболее эффективные методы</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Селективный гербицид</span>
                    <Badge className="bg-green-100 text-green-800">94%</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Механическое удаление</span>
                    <Badge className="bg-yellow-100 text-yellow-800">78%</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '78%' }} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Культурный контроль</span>
                    <Badge className="bg-blue-100 text-blue-800">65%</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Рекомендации</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Продолжить селективный гербицид</p>
                      <p className="text-xs text-green-600">Лучшая производительность для одуванчика</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Увеличить мониторинг</p>
                      <p className="text-xs text-yellow-600">Восточное поле C требует внимания</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Запланировать последующую проверку</p>
                      <p className="text-xs text-blue-600">Через 2 недели для проверки</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="crops" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Анализ плотности посевов</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={cropDensityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="field" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="density" fill="#10b981" name="Текущая плотность %" />
                  <Bar dataKey="target" fill="#e5e7eb" name="Целевая плотность %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Показатели здоровья NDVI</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Северное поле A</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full">
                        <div className="w-full h-2 bg-green-500 rounded-full" style={{ width: '85%' }} />
                      </div>
                      <span className="text-sm font-medium">0.85</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Южное поле B</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full">
                        <div className="w-full h-2 bg-green-500 rounded-full" style={{ width: '72%' }} />
                      </div>
                      <span className="text-sm font-medium">0.72</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Восточное поле C</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full">
                        <div className="w-full h-2 bg-yellow-500 rounded-full" style={{ width: '65%' }} />
                      </div>
                      <span className="text-sm font-medium">0.65</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Западное поле D</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full">
                        <div className="w-full h-2 bg-green-500 rounded-full" style={{ width: '78%' }} />
                      </div>
                      <span className="text-sm font-medium">0.78</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Прогноз урожая</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p>8.2 т/га</p>
                  <p className="text-muted-foreground">Прогнозируемая средняя урожайность</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">+5% по сравнению с прошлым годом</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Северное поле A:</span>
                    <span className="font-medium">8.5 т/га</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Южное поле B:</span>
                    <span className="font-medium">8.8 т/га</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Восточное поле C:</span>
                    <span className="font-medium">7.2 т/га</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Западное поле D:</span>
                    <span className="font-medium">8.3 т/га</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
