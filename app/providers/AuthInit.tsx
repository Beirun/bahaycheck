"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Toaster } from "@/components/ui/sonner";

export default function AuthInit({ children }: { children: React.ReactNode }) {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <>
      <Toaster
        richColors
        position={isDesktop ? "bottom-right" : "bottom-center"}
      />

      {children}
    </>
  );
}
