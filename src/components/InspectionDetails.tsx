import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { RouteVisualizer } from './RouteVisualizer';
import { Calendar, Download, Eye, MapPin, Plane, AlertTriangle, CheckCircle, Upload, Loader2, Database, ExternalLink, ZoomIn, ZoomOut, Maximize2, ChevronLeft, ChevronRight, RotateCcw, RotateCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface InspectionDetailsProps {
  inspectionId: string | null;
}

const mockInspections = [
  {
    id: '1',
    fieldName: 'Северное поле A',
    fieldId: '1',
    date: '2024-09-20',
    time: '14:30',
    status: 'completed',
    operator: 'Иван Смирнов',
    drone: 'DJI Phantom 4 RTK',
    flightTime: '18 мин',
    area: '45.2 га',
    imageCount: 127,
    weedsDetected: 23,
    detectionResults: [
      { weed: 'Одуванчик', count: 15, confidence: 0.92 },
      { weed: 'Росичка', count: 8, confidence: 0.87 }
    ],
    flightPath: 'Систематический сеточный паттерн',
    flightPattern: 'grid',
    altitude: 100,
    weather: 'Ясно, 22°C, ветер 5 км/ч',
    report: 'inspection_report_20240920.pdf'
  },
  {
    id: '2',
    fieldName: 'Южное поле B',
    fieldId: '2',
    date: '2024-09-18',
    time: '10:15',
    status: 'completed',
    operator: 'Сара Джонсон',
    drone: 'DJI Mavic 3',
    flightTime: '12 мин',
    area: '32.8 га',
    imageCount: 89,
    weedsDetected: 7,
    detectionResults: [
      { weed: 'Полевой осот', count: 4, confidence: 0.89 },
      { weed: 'Щирица', count: 3, confidence: 0.94 }
    ],
    flightPath: 'Целевая инспекция',
    flightPattern: 'circular',
    altitude: 80,
    weather: 'Переменная облачность, 19°C, ветер 8 км/ч',
    report: 'inspection_report_20240918.pdf'
  },
  {
    id: '3',
    fieldName: 'Западное поле D',
    fieldId: '3',
    date: '2024-09-19',
    time: '16:45',
    status: 'processing',
    operator: 'Майк Уилсон',
    drone: 'DJI Phantom 4 RTK',
    flightTime: '15 мин',
    area: '28.7 га',
    imageCount: 95,
    weedsDetected: null,
    detectionResults: [],
    flightPath: 'Периметр и центр',
    flightPattern: 'zigzag',
    altitude: 90,
    weather: '����сно, 25°C, ветер 3 км/ч',
    report: null
  }
];

const mockUAVImages = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1643145476486-a5ce26244724?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZ3JpY3VsdHVyYWwlMjBmaWVsZCUyMGFlcmlhbHxlbnwxfHx8fDE3NjExNjU1Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    timestamp: '14:32:15',
    coordinates: '55.7558° N, 37.6173° E',
    detections: 12,
    hasDetections: true
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1663326225593-c85572a25988?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGVhdCUyMGZpZWxkJTIwZHJvbmV8ZW58MXx8fHwxNzYxMjU1Nzk4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    timestamp: '14:35:42',
    coordinates: '55.7562° N, 37.6180° E',
    detections: 7,
    hasDetections: true
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1662585445239-6906fa73d9f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcm9wJTIwZmllbGQlMjBhZXJpYWwlMjB2aWV3fGVufDF8fHx8MTc2MTI1NTc5OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    timestamp: '14:38:19',
    coordinates: '55.7554° N, 37.6165° E',
    detections: 23,
    hasDetections: true
  }
];

export function InspectionDetails({ inspectionId }: InspectionDetailsProps) {
  const [selectedInspection, setSelectedInspection] = useState(inspectionId || '1');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedSnapshots, setUploadedSnapshots] = useState<any[]>([]);
  const [dbError, setDbError] = useState(false);
  const [recognizeImages, setRecognizeImages] = useState<any[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [activeTab, setActiveTab] = useState('images');
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImageList, setCurrentImageList] = useState<any[]>([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isMaximized, setIsMaximized] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [weedDetectionStats, setWeedDetectionStats] = useState<any[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [showAllDetections, setShowAllDetections] = useState(false);
  const [inspectionStats, setInspectionStats] = useState<any[]>([]);
  const [isLoadingInspectionStats, setIsLoadingInspectionStats] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    coordinates: '',
    description: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const inspection = mockInspections.find(i => i.id === selectedInspection) || mockInspections[0];

  // Function to generate thumbnail URL for preview (lower quality)
  const getThumbnailUrl = (originalUrl: string): string => {
    if (!originalUrl) return originalUrl;
    
    // For Supabase Storage signed URLs
    if (originalUrl.includes('supabase.co/storage')) {
      // Add transformation parameters for lower quality preview
      const url = new URL(originalUrl);
      url.searchParams.set('width', '400');
      url.searchParams.set('quality', '60');
      return url.toString();
    }
    
    // For Unsplash URLs
    if (originalUrl.includes('unsplash.com')) {
      const url = new URL(originalUrl);
      url.searchParams.set('w', '400');
      url.searchParams.set('q', '60');
      return url.toString();
    }
    
    // For other URLs, return as-is
    return originalUrl;
  };

  // Function to load images from recognize bucket
  const loadRecognizeImages = async () => {
    setIsLoadingImages(true);
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-7e600dc3/recognize-images`;
      console.log('Loading images from recognize bucket:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      console.log('Load images response status:', response.status);
      const result = await response.json();
      console.log('Load images result:', result);
      
      if (result.success && result.images) {
        console.log('Setting recognize images:', result.images.length);
        setRecognizeImages(result.images);
      } else {
        console.error('Failed to load recognize images:', result.error);
        toast.error('Не удалось загрузить изображения из bucket recognize');
      }
    } catch (error) {
      console.error('Error loading recognize images:', error);
      toast.error('Ошибка при загрузке изображений');
    } finally {
      setIsLoadingImages(false);
    }
  };

  // Function to load snapshots
  const loadSnapshots = async () => {
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-7e600dc3/snapshots/${selectedInspection}`;
      console.log('Loading snapshots from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      console.log('Load snapshots response status:', response.status);
      const result = await response.json();
      console.log('Load snapshots result:', result);
      
      if (result.success) {
        console.log('Setting snapshots:', result.snapshots?.length || 0);
        setUploadedSnapshots(result.snapshots || []);
        setDbError(false);
      } else {
        console.error('Failed to load snapshots:', result.error);
        
        // Check for database table error
        if (result.error && result.error.includes('kv_store')) {
          setDbError(true);
          console.error('');
          console.error('═══════════════════════════════════════════════════════════');
          console.error('⚠️  DATABASE TABLE MISSING');
          console.error('═══════════════════════════════════════════════════════════');
          console.error('');
          console.error('The database table does not exist. Please follow the instructions in DATABASE_SETUP.md');
          console.error('');
          console.error('Quick fix: Run this SQL in Supabase Dashboard > SQL Editor:');
          console.error('');
          console.error('CREATE TABLE IF NOT EXISTS kv_store_faa4b35a (');
          console.error('  key TEXT PRIMARY KEY,');
          console.error('  value JSONB NOT NULL,');
          console.error('  created_at TIMESTAMPTZ DEFAULT NOW()');
          console.error(');');
          console.error('');
          console.error('═══════════════════════════════════════════════════════════');
        }
      }
    } catch (error) {
      console.error('Error loading snapshots:', error);
    }
  };

  // Function to load aggregated inspection stats
  const loadInspectionStats = async () => {
    setIsLoadingInspectionStats(true);
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-7e600dc3/inspection-stats/${selectedInspection}`;
      console.log('Loading inspection stats from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      console.log('Load inspection stats response status:', response.status);
      const result = await response.json();
      console.log('Load inspection stats result:', result);
      
      if (result.success && result.stats) {
        console.log('Setting inspection stats:', result.stats.length);
        setInspectionStats(result.stats);
      } else {
        console.error('Failed to load inspection stats:', result.error);
        setInspectionStats([]);
      }
    } catch (error) {
      console.error('Error loading inspection stats:', error);
      setInspectionStats([]);
    } finally {
      setIsLoadingInspectionStats(false);
    }
  };

  // Load images on mount
  useEffect(() => {
    loadRecognizeImages();
  }, []);

  // Load snapshots when inspection changes
  useEffect(() => {
    loadSnapshots();
    loadInspectionStats();
  }, [selectedInspection]);

  // Reload data when switching tabs
  useEffect(() => {
    if (activeTab === 'images') {
      loadSnapshots();
    } else if (activeTab === 'detection-snapshots') {
      loadRecognizeImages();
    }
  }, [activeTab]);

  // Load weed detection stats when selected image changes
  useEffect(() => {
    const loadStatsForSelectedImage = async () => {
      if (!selectedImage) {
        console.log('🔍 Weed Detection Stats: No image selected');
        setWeedDetectionStats([]);
        return;
      }

      // Find the selected image
      const image = recognizeImages.find(img => img.id === selectedImage) || 
                    mockUAVImages.find(img => img.id === selectedImage);
      
      if (!image || !image.name) {
        console.log('🔍 Weed Detection Stats: Image found but no filename', { image, selectedImage });
        setWeedDetectionStats([]);
        return;
      }

      console.log('═══════════════════════════════════════════════════════════');
      console.log('🔍 LOADING WEED DETECTION STATS');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('📁 Image filename (will match with image_file_name):', image.name);
      console.log('🆔 Image ID:', selectedImage);

      setIsLoadingStats(true);
      try {
        const url = `https://${projectId}.supabase.co/functions/v1/make-server-7e600dc3/weed-detection-stats/${encodeURIComponent(image.name)}`;
        console.log('🌐 Request URL:', url);
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });
        
        console.log('📡 Response status:', response.status);
        const result = await response.json();
        console.log('📦 Response data:', result);
        
        if (result.success && result.stats) {
          console.log('✅ Found', result.stats.length, 'detection records in weed_detection_stats table');
          console.log('📊 Detection data:');
          result.stats.forEach((stat: any, index: number) => {
            console.log(`  ${index + 1}. Plant: ${stat.plant_name || stat.weed_type || 'N/A'}, Count: ${stat.count || 'N/A'}, Confidence: ${stat.confidence ? Math.round(stat.confidence * 100) + '%' : 'N/A'}`);
          });
          setWeedDetectionStats(result.stats);
        } else {
          console.log('⚠️ No stats found or error:', result.error || 'No data');
          setWeedDetectionStats([]);
        }
        console.log('═══════════════════════════════════════════════════════════');
      } catch (error) {
        console.error('❌ Error loading weed detection stats:', error);
        setWeedDetectionStats([]);
        console.log('═══════════════════════════════════════════════════════════');
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadStatsForSelectedImage();
  }, [selectedImage, recognizeImages]);

  // Keyboard navigation for fullscreen dialog
  useEffect(() => {
    if (!isFullscreenOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      } else if (e.key === 'Escape') {
        setIsFullscreenOpen(false);
        setZoomLevel(1);
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleResetZoom();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          handleZoomIn();
        } else {
          handleZoomOut();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isFullscreenOpen, currentImageIndex, currentImageList.length, zoomLevel]);

  const handleOpenFullscreen = (imageUrl: string, imageList: any[] = [], index: number = 0) => {
    setFullscreenImage(imageUrl);
    setCurrentImageList(imageList);
    setCurrentImageIndex(index);
    setZoomLevel(1);
    setRotation(0);
    setIsFullscreenOpen(true);
  };

  const handleNextImage = () => {
    if (currentImageIndex < currentImageList.length - 1) {
      const newIndex = currentImageIndex + 1;
      setCurrentImageIndex(newIndex);
      setFullscreenImage(currentImageList[newIndex].url || currentImageList[newIndex].imageUrl);
      setZoomLevel(1);
      setRotation(0);
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      const newIndex = currentImageIndex - 1;
      setCurrentImageIndex(newIndex);
      setFullscreenImage(currentImageList[newIndex].url || currentImageList[newIndex].imageUrl);
      setZoomLevel(1);
      setRotation(0);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handleRotateLeft = () => {
    setRotation(prev => prev - 90);
  };

  const handleRotateRight = () => {
    setRotation(prev => prev + 90);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.date) {
      toast.error('Пожалуйста, запол��ите обязательные поля');
      return;
    }

    setIsUploading(true);
    console.log('Starting snapshot upload...', { selectedInspection, formData, hasFile: !!selectedFile });

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('inspectionId', selectedInspection);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('coordinates', formData.coordinates);
      formDataToSend.append('description', formData.description);
      
      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
        console.log('File attached:', selectedFile.name, selectedFile.size);
      }

      const url = `https://${projectId}.supabase.co/functions/v1/make-server-7e600dc3/snapshots`;
      console.log('Uploading to:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: formDataToSend,
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);

      if (result.success) {
        console.log('Upload successful, adding to state:', result.snapshot);
        toast.success('Снимок отправлен на распознавание', {
          description: 'В течение минуты результаты отобразятся во вкладке "Детекция снимков"',
          duration: 5000,
        });
        setUploadedSnapshots(prev => [result.snapshot, ...prev]);
        
        // Reset form
        setFormData({
          name: '',
          date: '',
          coordinates: '',
          description: '',
        });
        setSelectedFile(null);
        setIsDialogOpen(false);
      } else {
        console.error('Upload failed:', result.error);
        
        // Check for database table error
        if (result.error && result.error.includes('kv_store')) {
          toast.error('Ошибка базы данных: таблица не найдена. Проверьте DATABASE_SETUP.md', {
            duration: 10000,
          });
          console.error('');
          console.error('═══════════════════════════════════════════════════════════');
          console.error('⚠️  DATABASE TABLE MISSING');
          console.error('═══════════════════════════════════════════════���═══════════');
          console.error('');
          console.error('The database table does not exist. Please follow the instructions in DATABASE_SETUP.md');
          console.error('');
          console.error('Quick fix: Run this SQL in Supabase Dashboard > SQL Editor:');
          console.error('');
          console.error('CREATE TABLE IF NOT EXISTS kv_store_faa4b35a (');
          console.error('  key TEXT NOT NULL PRIMARY KEY,');
          console.error('  value JSONB NOT NULL');
          console.error(');');
          console.error('');
          console.error('═══════════════════════════════════════════════════════════');
          console.error('');
        } else {
          toast.error(`Ошибка: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('Error uploading snapshot:', error);
      toast.error('Не удалось загрузить снимок: ' + String(error));
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Завершено';
      case 'processing': return 'Обработка';
      case 'scheduled': return 'Запланировано';
      case 'failed': return 'Ошибка';
      default: return status;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Database Error Alert */}
      {dbError && (
        <Alert variant="destructive">
          <Database className="h-4 w-4" />
          <AlertTitle>Требуется настройка базы данных</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>Таблица азы данных не найдена. Пожалуйста, создайте таблицу в Supabase Dashboard:</p>
            <div className="mt-3 bg-black/10 p-3 rounded text-xs font-mono">
              CREATE TABLE IF NOT EXISTS kv_store_faa4b35a (<br />
              &nbsp;&nbsp;key TEXT NOT NULL PRIMARY KEY,<br />
              &nbsp;&nbsp;value JSONB NOT NULL<br />
              );
            </div>
            <div className="mt-3 flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://supabase.com/dashboard/project/wuhndvrjxzfkdwdjtzih/editor', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                От��рыть SQL Editor
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText('CREATE TABLE IF NOT EXISTS kv_store_faa4b35a (key TEXT NOT NULL PRIMARY KEY, value JSONB NOT NULL);');
                  toast.success('SQL скопирован в буфер обмена');
                }}
              >
                Копировать SQL
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1>Детали инспекции</h1>
          <p className="text-muted-foreground">Данные полета БПЛА и результаты обнаружения сорняков</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Экспорт данных
          </Button>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Добавить снимок
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Inspections List */}
        <Card>
          <CardHeader>
            <CardTitle>Недавние инспекции</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockInspections.map((insp) => (
              <div
                key={insp.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedInspection === insp.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => setSelectedInspection(insp.id)}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4>{insp.fieldName}</h4>
                    <Badge className={getStatusColor(insp.status)}>
                      {getStatusLabel(insp.status)}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {insp.date} в {insp.time}
                    </p>
                    {insp.weedsDetected !== null && (
                      <p className="flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3 h-3" />
                        {insp.weedsDetected} сорняков обнаружено
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="xl:col-span-3 space-y-6">
          {/* Inspection Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="w-5 h-5" />
                {inspection.fieldName} - {inspection.date}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Детали полета</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Оператор:</span>
                        <span>{inspection.operator}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">БПЛА:</span>
                        <span>{inspection.drone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Время полета:</span>
                        <span>{inspection.flightTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Покрытая площадь:</span>
                        <span>{inspection.area}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Сбор данных</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Изображений:</span>
                        <span>{inspection.imageCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Паттерн полета:</span>
                        <span>{inspection.flightPath}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Погода:</span>
                        <span>{inspection.weather}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Статус:</span>
                        <Badge className={getStatusColor(inspection.status)}>
                          {getStatusLabel(inspection.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">
                      Результаты обнаружения
                      {isLoadingInspectionStats && (
                        <Loader2 className="w-3 h-3 ml-1 inline animate-spin text-muted-foreground" />
                      )}
                    </h4>
                    {isLoadingInspectionStats ? (
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Loader2 className="w-5 h-5 mx-auto animate-spin text-muted-foreground" />
                      </div>
                    ) : inspectionStats.length > 0 ? (
                      <div className="space-y-2">
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          {inspectionStats.reduce((sum, stat) => sum + stat.count, 0)} Сорняков
                        </div>
                        <div className="space-y-1 text-sm">
                          {inspectionStats.slice(0, 3).map((stat, index) => (
                            <div key={index} className="flex justify-between">
                              <span>{stat.plant_name}:</span>
                              <span>{stat.count} ({Math.round(stat.confidence * 100)}%)</span>
                            </div>
                          ))}
                          {inspectionStats.length > 3 && (
                            <div className="text-xs text-muted-foreground text-center pt-1">
                              +{inspectionStats.length - 3} других видов
                            </div>
                          )}
                        </div>
                      </div>
                    ) : inspection.weedsDetected !== null ? (
                      <div className="space-y-2">
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          {inspection.weedsDetected} Сорняков
                        </div>
                        <div className="space-y-1 text-sm">
                          {inspection.detectionResults.map((result, index) => (
                            <div key={index} className="flex justify-between">
                              <span>{result.weed}:</span>
                              <span>{result.count} ({Math.round(result.confidence * 100)}%)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <p className="text-yellow-800">Обработка...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {inspection.report && (
                <div className="mt-6 pt-6 border-t">
                  <Button className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Скачать полный отчет ({inspection.report})
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* UAV Images and Detection Results */}
          <Tabs defaultValue="images" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="images">Изображения БПЛА</TabsTrigger>
              <TabsTrigger value="detection-snapshots">Детекция снимков</TabsTrigger>
              <TabsTrigger value="detections">Анализ обнаружений</TabsTrigger>
              <TabsTrigger value="map">Траектория полета</TabsTrigger>
            </TabsList>

            <TabsContent value="images" className="space-y-4">
              {/* Uploaded Snapshots Section */}
              {uploadedSnapshots.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Загруженные снимки ({uploadedSnapshots.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {uploadedSnapshots.map((snapshot, index) => (
                        <div
                          key={snapshot.id}
                          className="relative rounded-lg overflow-hidden border-2 border-gray-200 cursor-pointer hover:border-blue-400 transition-colors"
                          onClick={() => snapshot.imageUrl && handleOpenFullscreen(snapshot.imageUrl, uploadedSnapshots, index)}
                        >
                          {snapshot.imageUrl ? (
                            <div className="aspect-video">
                              <ImageWithFallback
                                src={getThumbnailUrl(snapshot.imageUrl)}
                                alt={snapshot.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="aspect-video bg-gray-100 flex items-center justify-center">
                              <p className="text-muted-foreground text-sm">Нет изображения</p>
                            </div>
                          )}

                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2">
                            <p className="text-sm font-medium truncate">{snapshot.name}</p>
                            <p className="text-xs text-gray-300">{new Date(snapshot.date).toLocaleString('ru-RU')}</p>
                            {snapshot.coordinates && (
                              <p className="text-xs text-gray-300">{snapshot.coordinates}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="detection-snapshots" className="space-y-4">
              {selectedImage && (
                <Card>
                  <CardHeader>
                    <CardTitle>Анализ изображения</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      // First try to find in recognize images, then fallback to mock
                      const image = recognizeImages.find(img => img.id === selectedImage) || 
                                   mockUAVImages.find(img => img.id === selectedImage);
                      return image ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div 
                              className="aspect-video rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => {
                                const imageList = recognizeImages.length > 0 ? recognizeImages : mockUAVImages;
                                const imgIndex = imageList.findIndex(img => img.id === selectedImage);
                                handleOpenFullscreen(image.url, imageList, imgIndex >= 0 ? imgIndex : 0);
                              }}
                            >
                              <ImageWithFallback
                                src={getThumbnailUrl(image.url)}
                                alt={`Выбранное изображение БПЛА ${image.id}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <Button className="w-full" onClick={() => {
                              const imageList = recognizeImages.length > 0 ? recognizeImages : mockUAVImages;
                              const imgIndex = imageList.findIndex(img => img.id === selectedImage);
                              handleOpenFullscreen(image.url, imageList, imgIndex >= 0 ? imgIndex : 0);
                            }}>
                              <Eye className="w-4 h-4 mr-2" />
                              Просмотр в полном разрешении
                            </Button>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Детали изображения</h4>
                              <div className="space-y-2 text-sm">
                                {image.name && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Файл:</span>
                                    <span className="truncate ml-2">{image.name}</span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Время:</span>
                                  <span>{image.timestamp}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Координаты:</span>
                                  <span>{image.coordinates}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Обнаружений:</span>
                                  <span>
                                    {weedDetectionStats.length > 0 
                                      ? weedDetectionStats.reduce((sum, stat) => sum + (stat.count || 0), 0)
                                      : image.detections}
                                  </span>
                                </div>
                                {image.name && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Статус данных БД:</span>
                                    {isLoadingStats ? (
                                      <Badge variant="outline" className="text-xs">
                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                        Загрузка
                                      </Badge>
                                    ) : weedDetectionStats.length > 0 ? (
                                      <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Найдено {weedDetectionStats.length} зап.
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 text-xs">
                                        <Database className="w-3 h-3 mr-1" />
                                        Mock данные
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {(isLoadingStats || weedDetectionStats.length > 0 || image.hasDetections) && (
                              <div>
                                <h4 className="font-medium mb-2">Обнаруженные объекты</h4>
                                {isLoadingStats ? (
                                  <div className="flex items-center justify-center p-4">
                                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mr-2" />
                                    <span className="text-sm text-muted-foreground">Загрузка данных...</span>
                                  </div>
                                ) : weedDetectionStats.length > 0 ? (
                                  <div className="space-y-2">
                                    {weedDetectionStats.slice(0, showAllDetections ? weedDetectionStats.length : 4).map((stat, index) => (
                                      <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                                        <div className="flex flex-col">
                                          <span className="text-sm">{stat.plant_name || stat.weed_type || 'Неизвестный сорняк'}</span>
                                          {stat.count && (
                                            <span className="text-xs text-muted-foreground">Количество: {stat.count}</span>
                                          )}
                                        </div>
                                        {stat.confidence && (
                                          <Badge variant="outline">{Math.round(stat.confidence * 100)}% уверенность</Badge>
                                        )}
                                      </div>
                                    ))}
                                    {weedDetectionStats.length > 4 && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowAllDetections(!showAllDetections)}
                                        className="w-full mt-2"
                                      >
                                        {showAllDetections ? 'Свернуть' : `Показать еще (${weedDetectionStats.length - 4})`}
                                      </Button>
                                    )}
                                  </div>
                                ) : image.hasDetections ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                                      <span className="text-sm">Одуванчик</span>
                                      <Badge variant="outline">92% уверенность</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                                      <span className="text-sm">Росичка</span>
                                      <Badge variant="outline">87% уверенность</Badge>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">Нет данных о обнаружениях</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>
                    Изображения БПЛА с масками обнаружения
                    {isLoadingImages && <span className="ml-2 text-sm text-muted-foreground">(Загрузка...)</span>}
                    {recognizeImages.length > 0 && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        ({recognizeImages.length} из bucket recognize)
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingImages ? (
                    <div className="flex items-center justify-center h-48">
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground">Загрузка изображений...</span>
                    </div>
                  ) : recognizeImages.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {recognizeImages.map((image, index) => (
                        <div
                          key={image.id}
                          className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:border-blue-300 ${
                            selectedImage === image.id ? 'border-blue-500' : 'border-gray-200'
                          }`}
                          onClick={() => setSelectedImage(image.id)}
                          onDoubleClick={() => handleOpenFullscreen(image.url, recognizeImages, index)}
                        >
                          <div className="aspect-video">
                            <ImageWithFallback
                              src={getThumbnailUrl(image.url)}
                              alt={`И��ображение БПЛА ${image.name}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          {/* Detection overlay simulation */}
                          {image.hasDetections && (
                            <div className="absolute inset-0 pointer-events-none">
                              <div className="absolute top-1/4 left-1/3 w-8 h-8 border-2 border-red-500 bg-red-500/20 rounded"></div>
                              <div className="absolute top-1/2 right-1/4 w-6 h-6 border-2 border-red-500 bg-red-500/20 rounded"></div>
                              {image.detections > 2 && (
                                <div className="absolute bottom-1/3 left-1/4 w-10 h-10 border-2 border-red-500 bg-red-500/20 rounded"></div>
                              )}
                            </div>
                          )}

                          <div className="absolute top-2 right-2">
                            <Badge className="bg-red-500 text-white">
                              {image.detections} сорняков
                            </Badge>
                          </div>

                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2">
                            <p className="text-xs truncate">{image.name}</p>
                            <p className="text-xs">{image.timestamp}</p>
                            <p className="text-xs text-gray-300">{image.coordinates}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {mockUAVImages.map((image, index) => (
                      <div
                        key={image.id}
                        className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:border-blue-300 ${
                          selectedImage === image.id ? 'border-blue-500' : 'border-gray-200'
                        }`}
                        onClick={() => setSelectedImage(image.id)}
                        onDoubleClick={() => handleOpenFullscreen(image.url, mockUAVImages, index)}
                      >
                        <div className="aspect-video">
                          <ImageWithFallback
                            src={getThumbnailUrl(image.url)}
                            alt={`Изображение БПЛА ${image.id}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Detection overlay simulation */}
                        {image.hasDetections && (
                          <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-1/4 left-1/3 w-8 h-8 border-2 border-red-500 bg-red-500/20 rounded"></div>
                            <div className="absolute top-1/2 right-1/4 w-6 h-6 border-2 border-red-500 bg-red-500/20 rounded"></div>
                            {image.detections > 2 && (
                              <div className="absolute bottom-1/3 left-1/4 w-10 h-10 border-2 border-red-500 bg-red-500/20 rounded"></div>
                            )}
                          </div>
                        )}

                        <div className="absolute top-2 right-2">
                          <Badge className="bg-red-500 text-white">
                            {image.detections} сорняков
                          </Badge>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2">
                          <p className="text-xs">{image.timestamp}</p>
                          <p className="text-xs text-gray-300">{image.coordinates}</p>
                        </div>
                      </div>
                    ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="detections" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Сводка обнаружений
                    {isLoadingInspectionStats && (
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    )}

                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingInspectionStats ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mr-2" />
                      <span className="text-muted-foreground">Загрузка статистики...</span>
                    </div>
                  ) : inspectionStats.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium">Распределение сорняков</h4>
                        {(() => {
                          const totalCount = inspectionStats.reduce((sum, stat) => sum + stat.count, 0);
                          return inspectionStats.map((stat, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>{stat.plant_name}</span>
                                <span>{stat.count} экземпляров</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-red-500 h-2 rounded-full"
                                  style={{
                                    width: `${(stat.count / totalCount) * 100}%`
                                  }}
                                />
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-medium">Оценки уверенности</h4>
                        {inspectionStats.map((stat, index) => {
                          // Generate random confidence between 45 and 95
                          const confidence = Math.floor(Math.random() * (95 - 45 + 1)) + 45;
                          
                          // Determine color based on confidence value
                          let barColor = '';
                          if (confidence >= 45 && confidence <= 59) {
                            barColor = 'bg-red-500';
                          } else if (confidence >= 60 && confidence <= 74) {
                            barColor = 'bg-yellow-500';
                          } else if (confidence >= 75 && confidence <= 95) {
                            barColor = 'bg-green-500';
                          }
                          
                          return (
                            <div key={index} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>{stat.plant_name}</span>
                                <span>{confidence}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`${barColor} h-2 rounded-full`}
                                  style={{ width: `${confidence}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : inspection.weedsDetected !== null ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium">Распределение сорняков</h4>
                        {inspection.detectionResults.map((result, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>{result.weed}</span>
                              <span>{result.count} экземпляров</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-red-500 h-2 rounded-full"
                                style={{
                                  width: `${(result.count / inspection.weedsDetected!) * 100}%`
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-medium">Оценки уверенности</h4>
                        {inspection.detectionResults.map((result, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>{result.weed}</span>
                              <span>{Math.round(result.confidence * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${result.confidence * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Анализ обнаружения в процессе...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="map" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Траектория полета и покрытие</CardTitle>
                </CardHeader>
                <CardContent>
                  <RouteVisualizer
                    fieldId={inspection.fieldId}
                    flightPattern={inspection.flightPattern}
                    altitude={inspection.altitude}
                    showDetails={true}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Add Snapshot Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Добавить снимок</DialogTitle>
            <DialogDescription>
              Заполните данные о снимке и загрузите изображение
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Название снимка <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Например: Северный участок, точка 1"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">
                  Дата съемки <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => handleFormChange('date', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coordinates">Координаты</Label>
                <Input
                  id="coordinates"
                  placeholder="Например: 55.7558° N, 37.6173° E"
                  value={formData.coordinates}
                  onChange={(e) => handleFormChange('coordinates', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  placeholder="Дополнительная информация о снимке"
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Файл изображения</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  {selectedFile && (
                    <Badge variant="outline" className="whitespace-nowrap">
                      {selectedFile.name}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Поддерживаемые форматы: JPG, PNG, GIF (макс. 50 МБ)
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isUploading}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Сохранить
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Image Dialog */}
      <Dialog open={isFullscreenOpen} onOpenChange={(open) => {
        setIsFullscreenOpen(open);
        if (!open) {
          setZoomLevel(1);
          setRotation(0);
          setIsMaximized(false);
        }
      }}>
        <DialogContent className={`${isMaximized ? '!max-w-none !w-screen !h-screen !inset-0 !translate-x-0 !translate-y-0 !top-0 !left-0 rounded-none' : '!max-w-[85vw] !w-[85vw] h-[92vh]'} p-0 flex flex-col`}>
          <DialogHeader className="pb-[8px] border-b flex-shrink-0 pt-[16px] pr-[16px] pl-[16px] space-y-3">
            <DialogTitle className="flex-shrink-0">
              Полноразмерное изображение
              {currentImageList.length > 0 && (
                <span className="text-sm text-muted-foreground ml-2">
                  ({currentImageIndex + 1} / {currentImageList.length})
                </span>
              )}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Просмотр изображений в полноразмерном режиме с возможностью масштабирования и навигации
            </DialogDescription>
            <div className="flex items-center gap-1.5 flex-wrap justify-center w-full">
              {/* Zoom controls */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.5}
                title="Уменьшить"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm min-w-[60px] text-center">{Math.round(zoomLevel * 100)}%</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                title="Увеличи��ь"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleResetZoom}
                title="Сбросить масштаб"
              >
                1:1
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              {/* Rotation controls */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRotateLeft}
                title="Повернуть против часовой стрелки"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRotateRight}
                title="Повернуть по часовой стрелке"
              >
                <RotateCw className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button 
                variant={isMaximized ? "default" : "outline"}
                size="sm"
                onClick={() => setIsMaximized(!isMaximized)}
                title={isMaximized ? "Выйти из полноэкранного режима" : "Полноэкранный режим"}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto p-4 pt-2 relative">
            {fullscreenImage && (
              <div className="relative w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                <ImageWithFallback
                  src={fullscreenImage}
                  alt="Полноразмерное изображение"
                  className="transition-transform duration-200"
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                />
                
                {/* Navigation arrows */}
                {currentImageList.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                      onClick={handlePrevImage}
                      disabled={currentImageIndex === 0}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                      onClick={handleNextImage}
                      disabled={currentImageIndex === currentImageList.length - 1}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Image info footer */}
          {currentImageList.length > 0 && currentImageList[currentImageIndex] && (
            <div className="p-4 pt-2 border-t flex-shrink-0 bg-gray-50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                {currentImageList[currentImageIndex].name && (
                  <div>
                    <span className="text-muted-foreground">Файл:</span>
                    <p className="truncate">{currentImageList[currentImageIndex].name}</p>
                  </div>
                )}
                {currentImageList[currentImageIndex].timestamp && (
                  <div>
                    <span className="text-muted-foreground">Время:</span>
                    <p>{currentImageList[currentImageIndex].timestamp}</p>
                  </div>
                )}
                {currentImageList[currentImageIndex].coordinates && (
                  <div>
                    <span className="text-muted-foreground">Координаты:</span>
                    <p className="truncate">{currentImageList[currentImageIndex].coordinates}</p>
                  </div>
                )}
                {currentImageList[currentImageIndex].detections !== undefined && (
                  <div>
                    <span className="text-muted-foreground">Обнаружений:</span>
                    <p>{currentImageList[currentImageIndex].detections}</p>
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground flex flex-wrap gap-3">
                <span>← → Навигация</span>
                <span>+ - Масштаб</span>
                <span>Ctrl+Scroll Масштаб</span>
                <span>0 Сброс</span>
                <span>Esc Закрыть</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}