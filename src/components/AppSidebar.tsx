import { Map, FileText, Leaf, Search, Plane, BarChart3, Settings } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarFooter } from './ui/sidebar';
import type { ViewType } from '../App';

interface AppSidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const menuItems = [
  { id: 'dashboard' as ViewType, label: 'Панель управления', icon: Map },
  { id: 'fields' as ViewType, label: 'Реестр полей', icon: FileText },
  { id: 'weeds' as ViewType, label: 'Реестр сорняков', icon: Leaf },
  { id: 'missions' as ViewType, label: 'Полетные задания', icon: Plane },
  { id: 'inspection' as ViewType, label: 'Инспекции', icon: Search },
  { id: 'analytics' as ViewType, label: 'Аналитика', icon: BarChart3 },
];

export function AppSidebar({ currentView, onViewChange }: AppSidebarProps) {
  return (
    <>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Map className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Агромониторинг</p>
            <p className="text-xs text-muted-foreground">Платформа детекции</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarMenu className="px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                onClick={() => onViewChange(item.id)}
                isActive={currentView === item.id}
                className="flex items-center gap-3"
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>

      <SidebarFooter className="px-2 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => onViewChange('settings')}
              isActive={currentView === 'settings'}
              className="flex items-center gap-3"
            >
              <Settings className="w-4 h-4" />
              <span>Настройки</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}