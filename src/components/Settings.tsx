import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DroneSettings } from './DroneSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { User, Bell, Database, Shield, Plane } from 'lucide-react';

export function Settings() {
  const [activeTab, setActiveTab] = useState('equipment');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Настройки системы</h2>
        <p className="text-muted-foreground">
          Управление настройками платформы агромониторинга
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="equipment">
            <Plane className="w-4 h-4 mr-2" />
            Оборудование
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Профиль
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Уведомления
          </TabsTrigger>
          <TabsTrigger value="data">
            <Database className="w-4 h-4 mr-2" />
            Данные
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Безопасность
          </TabsTrigger>
        </TabsList>

        <TabsContent value="equipment">
          <DroneSettings />
        </TabsContent>

        <TabsContent value="profile" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Настройки профиля</CardTitle>
              <CardDescription>Управление данными пользователя</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Раздел в разработке</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Настройки уведомлений</CardTitle>
              <CardDescription>Управление уведомлениями о событиях системы</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Раздел в разработке</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Управление данными</CardTitle>
              <CardDescription>Экспорт, импорт и резервное копирование</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Раздел в разработке</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Безопасность</CardTitle>
              <CardDescription>Управление доступом и правами пользователей</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Раздел в разработке</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
