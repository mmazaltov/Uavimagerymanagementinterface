import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Calendar, Leaf, Loader2, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// Color palette for charts
const CHART_COLORS = [
  '#ef4444', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316'
];

// Truncate label to max length with ellipsis
const truncateLabel = (label: string, maxLength: number = 20): string => {
  if (label.length <= maxLength) return label;
  return label.slice(0, maxLength) + '...';
};

interface WeedStat {
  plant_name: string;
  count: number;
  confidence: number;
}

interface RawWeedStat {
  plant_name: string;
  count: number;
  image_file_name: string;
}

interface DrillDownData {
  name: string;
  date: string;
  count: number;
}

// Custom tooltip for bar chart - fixed width, semi-transparent background
const CustomBarTooltip = ({ active, payload, label, allData }: any) => {
  if (active && payload && payload.length) {
    const top10 = allData?.slice(0, 10) || [];
    return (
      <div
        className="border border-gray-300 rounded-lg shadow-lg p-3"
        style={{
          width: '280px', // ~35 characters
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(4px)'
        }}
      >
        <p
          className="font-semibold text-gray-900 mb-2 text-sm border-b pb-2 truncate"
          title={label}
        >
          {truncateLabel(label, 32)}
        </p>
        <p className="text-xs text-gray-600 mb-2">
          Количество: <span className="font-bold text-gray-900">{payload[0].value}</span>
        </p>
        {top10.length > 1 && (
          <div className="space-y-0.5">
            {top10.map((item: any, index: number) => (
              <div
                key={index}
                className={`flex justify-between text-xs ${item.name === label ? 'font-bold text-gray-900' : 'text-gray-600'}`}
              >
                <span className="truncate mr-2" title={item.name} style={{ maxWidth: '200px' }}>
                  {index + 1}. {truncateLabel(item.name, 25)}
                </span>
                <span className="font-medium">{item.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  return null;
};

// Custom tooltip for pie chart - shows only selected area data
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        className="border border-gray-300 rounded-lg shadow-lg p-3"
        style={{
          width: '280px', // ~35 characters
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(4px)'
        }}
      >
        <p
          className="font-semibold text-gray-900 mb-2 text-sm border-b pb-2 truncate"
          title={data.name}
        >
          {truncateLabel(data.name, 32)}
        </p>
        <p className="text-xs text-gray-600">
          Количество: <span className="font-bold text-gray-900">{data.value}</span>
        </p>
        <p className="text-xs text-gray-600">
          Доля: <span className="font-bold text-gray-900">{data.percentage}%</span>
        </p>
      </div>
    );
  }
  return null;
};

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

// Fallback data when DB is empty
const fallbackWeedData = [
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
  const [weedStats, setWeedStats] = useState<WeedStat[]>([]);
  const [rawWeedStats, setRawWeedStats] = useState<RawWeedStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllLegend, setShowAllLegend] = useState(false);
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);
  const [drillDownWeed, setDrillDownWeed] = useState<string | null>(null);
  const [drillDownData, setDrillDownData] = useState<DrillDownData[]>([]);

  // Load weed detection stats directly from Supabase REST API
  useEffect(() => {
    const loadWeedStats = async () => {
      setIsLoading(true);
      try {
        // Direct REST API call to Supabase - include image_file_name for drill-down
        const url = `https://${projectId}.supabase.co/rest/v1/weed_detection_stats?select=plant_name,count,image_file_name`;
        console.log('Loading weed stats from Supabase REST API:', url);

        const response = await fetch(url, {
          headers: {
            'apikey': publicAnonKey,
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const rawData = await response.json();
        console.log('Raw weed stats from DB:', rawData.length, 'records');

        if (rawData && rawData.length > 0) {
          // Save raw data for drill-down
          setRawWeedStats(rawData.map((stat: { plant_name: string; count: number; image_file_name: string }) => ({
            plant_name: stat.plant_name || 'Неизвестный сорняк',
            count: stat.count || 0,
            image_file_name: stat.image_file_name || 'unknown',
          })));

          // Aggregate by plant_name on client side
          const aggregated = new Map<string, { plant_name: string; count: number }>();

          rawData.forEach((stat: { plant_name: string; count: number }) => {
            const plantName = stat.plant_name || 'Неизвестный сорняк';

            if (aggregated.has(plantName)) {
              const existing = aggregated.get(plantName)!;
              existing.count += stat.count || 0;
            } else {
              aggregated.set(plantName, {
                plant_name: plantName,
                count: stat.count || 0,
              });
            }
          });

          // Sort by count descending
          const result = Array.from(aggregated.values())
            .sort((a, b) => b.count - a.count);

          console.log('Aggregated weed stats:', result.length, 'unique plants');
          setWeedStats(result.map(item => ({ ...item, confidence: 0 })));
        } else {
          setRawWeedStats([]);
          setWeedStats([]);
        }
      } catch (error) {
        console.error('Error loading weed stats:', error);
        setWeedStats([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadWeedStats();
  }, []);

  // Handle drill-down click on bar
  const handleBarClick = (data: { name: string; count: number }) => {
    const weedName = data.name;

    // Filter raw data for the selected weed and aggregate by image
    const weedData = rawWeedStats.filter(stat => stat.plant_name === weedName);

    // Group by image_file_name to create time series
    const byImage = new Map<string, number>();
    weedData.forEach((stat: RawWeedStat) => {
      const key = stat.image_file_name;
      byImage.set(key, (byImage.get(key) || 0) + stat.count);
    });

    // Convert to array and sort by image name (which often contains date info)
    const timeSeriesData: DrillDownData[] = Array.from(byImage.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map((entry, index) => ({
        name: weedName,
        date: `Снимок ${index + 1}`,
        count: entry[1],
      }));

    setDrillDownData(timeSeriesData);
    setDrillDownWeed(weedName);
  };

  // Handle back from drill-down
  const handleBackFromDrillDown = () => {
    setDrillDownWeed(null);
    setDrillDownData([]);
  };

  // Prepare data for bar chart
  const barChartData = weedStats.length > 0
    ? weedStats.map((stat, index) => ({
        name: stat.plant_name,
        count: stat.count,
        fill: CHART_COLORS[index % CHART_COLORS.length]
      }))
    : fallbackWeedData.map((item, index) => ({
        name: item.name,
        count: item.value,
        fill: item.color
      }));

  // Prepare data for pie chart with percentages - TOP 10 + Others
  const totalCount = barChartData.reduce((sum: number, item: { count: number }) => sum + item.count, 0);

  // Get top 10 items
  const top10Items = barChartData.slice(0, 10);
  const remainingItems = barChartData.slice(10);
  const othersCount = remainingItems.reduce((sum: number, item: { count: number }) => sum + item.count, 0);

  // Build pie chart data with top 10 + "Другие" if there are more items
  const pieChartData = top10Items.map((item: { name: string; count: number }, index: number) => ({
    name: item.name,
    value: item.count,
    color: CHART_COLORS[index % CHART_COLORS.length],
    percentage: totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0
  }));

  // Add "Другие" category if there are remaining items
  if (othersCount > 0) {
    pieChartData.push({
      name: 'Другие',
      value: othersCount,
      color: '#9ca3af', // Gray color for "Others"
      percentage: totalCount > 0 ? Math.round((othersCount / totalCount) * 100) : 0
    });
  }

  // Full data for legend expansion
  const fullLegendData = barChartData.map((item: { name: string; count: number }, index: number) => ({
    name: item.name,
    value: item.count,
    color: CHART_COLORS[index % CHART_COLORS.length],
    percentage: totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0
  }));

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
                <CardTitle className="flex items-center gap-2">
                  {drillDownWeed ? (
                    <>
                      <button
                        onClick={handleBackFromDrillDown}
                        className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                        title="Назад к общей статистике"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <span>Динамика: {truncateLabel(drillDownWeed, 25)}</span>
                    </>
                  ) : (
                    <>
                      Статистика обнаружения сорняков
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Загрузка данных...</span>
                  </div>
                ) : drillDownWeed ? (
                  /* Drill-down AreaChart view */
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart
                      data={drillDownData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        angle={-45}
                        textAnchor="end"
                        interval={0}
                        height={60}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        label={{ value: 'Количество', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(4px)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [value, 'Обнаружено']}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#6366f1"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCount)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  /* Main BarChart view */
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={barChartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                    >
                      <defs>
                        <filter id="barShadow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.3"/>
                        </filter>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        interval={0}
                        height={80}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value, index) => truncateLabel(value, index === 0 ? 20 : 30)}
                      />
                      <YAxis
                        label={{ value: 'Количество', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                      />
                      <Tooltip
                        content={<CustomBarTooltip allData={barChartData} />}
                        cursor={false}
                      />
                      <Bar
                        dataKey="count"
                        name="Количество"
                        radius={[4, 4, 0, 0]}
                        onClick={(data: { name: string; count: number }) => handleBarClick(data)}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={(_data: unknown, _index: number, e: React.MouseEvent) => {
                          if (e && e.target) {
                            (e.target as SVGElement).style.filter = 'url(#barShadow)';
                            (e.target as SVGElement).style.transform = 'scaleY(1.02)';
                            (e.target as SVGElement).style.transformOrigin = 'bottom';
                          }
                        }}
                        onMouseLeave={(_data: unknown, _index: number, e: React.MouseEvent) => {
                          if (e && e.target) {
                            (e.target as SVGElement).style.filter = 'none';
                            (e.target as SVGElement).style.transform = 'scaleY(1)';
                          }
                        }}
                      >
                        {barChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Распределение сорняков</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ percentage }: { percentage: number }) => `${percentage}%`}
                          labelLine={{ stroke: '#666', strokeWidth: 1 }}
                          onMouseEnter={(_: unknown, index: number) => setActivePieIndex(index)}
                          onMouseLeave={() => setActivePieIndex(null)}
                          onClick={(data: { name: string; value: number }) => {
                            // Skip "Другие" category - it's an aggregate
                            if (data.name !== 'Другие') {
                              handleBarClick({ name: data.name, count: data.value });
                            }
                          }}
                          activeIndex={activePieIndex !== null ? activePieIndex : undefined}
                          activeShape={(props: any) => {
                            const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
                            return (
                              <g>
                                <path
                                  d={`M ${cx + (outerRadius + 6) * Math.cos(-startAngle * Math.PI / 180)},${cy + (outerRadius + 6) * Math.sin(-startAngle * Math.PI / 180)}
                                     A ${outerRadius + 6},${outerRadius + 6} 0 ${endAngle - startAngle > 180 ? 1 : 0},0 ${cx + (outerRadius + 6) * Math.cos(-endAngle * Math.PI / 180)},${cy + (outerRadius + 6) * Math.sin(-endAngle * Math.PI / 180)}
                                     L ${cx + innerRadius * Math.cos(-endAngle * Math.PI / 180)},${cy + innerRadius * Math.sin(-endAngle * Math.PI / 180)}
                                     A ${innerRadius},${innerRadius} 0 ${endAngle - startAngle > 180 ? 1 : 0},1 ${cx + innerRadius * Math.cos(-startAngle * Math.PI / 180)},${cy + innerRadius * Math.sin(-startAngle * Math.PI / 180)}
                                     Z`}
                                  fill={fill}
                                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                                />
                              </g>
                            );
                          }}
                        >
                          {pieChartData.map((entry: { color: string }, index: number) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                              style={{ outline: 'none', cursor: 'pointer' }}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-2 space-y-0.5">
                      {/* Show top 10 legend items - smaller text, clickable for drill-down */}
                      {(showAllLegend ? fullLegendData : pieChartData).map((entry: { name: string; color: string; value: number; percentage: number }, index: number) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between text-xs leading-tight ${entry.name !== 'Другие' ? 'cursor-pointer hover:bg-gray-100 rounded px-1 -mx-1' : ''}`}
                          onClick={() => {
                            if (entry.name !== 'Другие') {
                              handleBarClick({ name: entry.name, count: entry.value });
                            }
                          }}
                          title={entry.name !== 'Другие' ? `Нажмите для детализации: ${entry.name}` : entry.name}
                        >
                          <div className="flex items-center gap-1">
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="truncate" style={{ maxWidth: '300px' }}>
                              {truncateLabel(entry.name, 42)}
                            </span>
                          </div>
                          <span className="font-medium text-gray-700">{entry.value} ({entry.percentage}%)</span>
                        </div>
                      ))}
                      {/* Toggle button to show all items */}
                      {barChartData.length > 10 && (
                        <button
                          onClick={() => setShowAllLegend(!showAllLegend)}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-1 w-full justify-center"
                        >
                          {showAllLegend ? (
                            <>
                              <ChevronUp className="w-3 h-3" />
                              Скрыть ({barChartData.length - 10})
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3 h-3" />
                              Ещё {barChartData.length - 10}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </>
                )}
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
