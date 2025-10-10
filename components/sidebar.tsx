"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Home, BarChart3, FileText, Users, LogOut } from "lucide-react";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  current: boolean;
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }: SidebarProps) {
  const navigation: NavigationItem[] = [
    { name: "Overview", href: "overview", icon: BarChart3, current: activeTab === "overview" },
    { name: "Safety Requests", href: "requests", icon: FileText, current: activeTab === "requests" },
    { name: "Volunteers", href: "volunteers", icon: Users, current: activeTab === "volunteers" },
  ];

  return (
    <>
      {/* Sidebar for mobile */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 bg-sidebar border-sidebar-border flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Home className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="ml-2 text-lg font-semibold text-sidebar-foreground">BahayCheck</span>
            </div>
          </div>
          <nav className="flex-1 mt-6">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.href);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  item.current
                    ? "bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-border"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </button>
            ))}
          </nav>
          {/* Mobile Logout Button */}
          <div className="p-4 border-t border-sidebar-border">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {/* Your logout logic here */}}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Logout
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-sidebar border-r border-sidebar-border">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between h-16 flex-shrink-0 px-4 border-b border-sidebar-border">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Home className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="ml-2 text-lg font-semibold text-sidebar-foreground">BahayCheck</span>
            </div>
          </div>
          <div className="flex flex-col flex-1 justify-between">
            <nav className="p-4 space-y-2">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.href)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    item.current
                      ? "bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-border"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </button>
              ))}
            </nav>
            {/* Desktop Logout Button */}
            <div className="p-4 border-t border-sidebar-border">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {/* Your logout logic here */}}
              >
                <LogOut className="h-4 w-4 mr-3" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}