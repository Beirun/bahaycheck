"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Toaster } from "@/components/ui/sonner";
import { useVolunteerStore } from "@/stores/useVolunteerStore";

export default function AuthInit({ children }: { children: React.ReactNode }) {
  const {loadAuthFromStorage} = useAuthStore();
  const {loadLicenseFromStorage } = useVolunteerStore()
  const isDesktop = useMediaQuery("(min-width: 768px)");
  useEffect(() => {
    loadAuthFromStorage();
  }, [loadAuthFromStorage]);

  useEffect(() =>{
    loadLicenseFromStorage()
  },[loadLicenseFromStorage])

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
