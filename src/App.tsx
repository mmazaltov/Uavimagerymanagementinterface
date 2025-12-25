import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "./components/ui/sidebar";
import { DashboardContent } from "./components/DashboardContent";
import { FieldRegistry } from "./components/FieldRegistry";
import { WeedRegistry } from "./components/WeedRegistry";
import { InspectionDetails } from "./components/InspectionDetails";
import { MissionPlanning } from "./components/MissionPlanning";
import { Analytics } from "./components/Analytics";
import { Settings } from "./components/Settings";
import { AppSidebar } from "./components/AppSidebar";
import { Toaster } from "./components/ui/sonner";

export type ViewType =
  | "dashboard"
  | "fields"
  | "weeds"
  | "inspection"
  | "missions"
  | "analytics"
  | "settings";

export default function App() {
  const [currentView, setCurrentView] =
    useState<ViewType>("dashboard");
  const [selectedField, setSelectedField] = useState<
    string | null
  >(null);
  const [selectedInspection, setSelectedInspection] = useState<
    string | null
  >(null);

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <DashboardContent
            onFieldSelect={setSelectedField}
            onViewChange={setCurrentView}
          />
        );
      case "fields":
        return (
          <FieldRegistry
            onFieldSelect={setSelectedField}
            onViewChange={setCurrentView}
          />
        );
      case "weeds":
        return <WeedRegistry />;
      case "inspection":
        return (
          <InspectionDetails
            inspectionId={selectedInspection}
          />
        );
      case "missions":
        return <MissionPlanning />;
      case "analytics":
        return <Analytics />;
      case "settings":
        return <Settings />;
      default:
        return (
          <DashboardContent
            onFieldSelect={setSelectedField}
            onViewChange={setCurrentView}
          />
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarContent>
            <AppSidebar
              currentView={currentView}
              onViewChange={setCurrentView}
            />
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <h1>
                Агромониторинг - детекция снимков 
              </h1>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}