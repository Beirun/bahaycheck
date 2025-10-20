"use client";

import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Bell, Menu, LogOut } from "lucide-react";
import { ModeToggle } from "@/components/theme-toggle";


interface NavbarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setSidebarOpen: (open: boolean) => void;
}

export default function Navbar({
  searchTerm,
  setSearchTerm,
  setSidebarOpen,
}: NavbarProps) {

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
          
          
          
            <ModeToggle />
          
          
        </div>
      </div>
    </header>
  );
}