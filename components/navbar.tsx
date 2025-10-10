"use client";

import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Bell, Menu, LogOut } from "lucide-react";
import { ModeToggle } from "@/components/theme-toggle";

interface Notification {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: "new_volunteer" | "new_request" | "request_update";
  read: boolean;
  relatedId?: string;
}

interface NavbarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  unreadNotifications: number;
  notifications: Notification[];
  handleMarkAllAsRead: () => void;
  handleNotificationClick: (notification: Notification) => void;
  getNotificationIcon: (type: Notification["type"]) => React.JSX.Element;
  setActiveTab: (tab: string) => void;
  setSidebarOpen: (open: boolean) => void;
  notificationOpen: boolean;
  setNotificationOpen: (open: boolean) => void;
  notificationRef: React.RefObject<HTMLDivElement> | null;
}

export default function Navbar({
  searchTerm,
  setSearchTerm,
  unreadNotifications,
  notifications,
  handleMarkAllAsRead,
  handleNotificationClick,
  getNotificationIcon,
  setActiveTab,
  setSidebarOpen,
  notificationOpen,
  setNotificationOpen,
  notificationRef
}: NavbarProps) {
  const modeToggleRef = useRef<HTMLDivElement>(null);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Close if clicking outside notification area AND outside mode toggle
      if (
        notificationOpen &&
        notificationRef?.current &&
        !notificationRef.current.contains(event.target as Node) &&
        modeToggleRef.current &&
        !modeToggleRef.current.contains(event.target as Node)
      ) {
        setNotificationOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationOpen, notificationRef, setNotificationOpen]);

  // Handle ModeToggle click specifically
  const handleModeToggleClick = () => {
    setNotificationOpen(false);
  };

  return (
    <header className="bg-card border-b border-border">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-card-foreground">LGU Dashboard</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Post-Earthquake Safety Monitoring</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search requests..."
              className="pl-10 w-40 lg:w-80 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Notification Dropdown */}
          <div className="relative" ref={notificationRef}>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative"
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-medium text-destructive-foreground">
                  {unreadNotifications}
                </span>
              )}
            </Button>
            
            {notificationOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-card-foreground">Notifications</h3>
                  {unreadNotifications > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleMarkAllAsRead}
                      className="text-xs h-8"
                    >
                      Mark all as read
                    </Button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-border last:border-b-0 cursor-pointer transition-colors hover:bg-accent/50 ${
                          !notification.read ? "bg-accent/30" : ""
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h4 className={`text-sm font-medium ${
                                !notification.read ? "text-card-foreground" : "text-muted-foreground"
                              }`}>
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="flex-shrink-0 ml-2">
                                  <div className="h-2 w-2 rounded-full bg-chart-4" />
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notification.description}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">
                                {notification.date} • {notification.time}
                              </span>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  notification.type === "new_volunteer" ? "bg-chart-3/20 text-chart-3 border-chart-3/30" :
                                  notification.type === "new_request" ? "bg-chart-4/20 text-chart-4 border-chart-4/30" :
                                  "bg-chart-2/20 text-chart-2 border-chart-2/30"
                                }`}
                              >
                                {notification.type.replace("_", " ")}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 border-t border-border">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-center text-xs"
                    onClick={() => setActiveTab("requests")}
                  >
                    View All Requests
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* ModeToggle with ref and click handler */}
          <div ref={modeToggleRef} onClick={handleModeToggleClick}>
            <ModeToggle />
          </div>
          
          
        </div>
      </div>
    </header>
  );
}