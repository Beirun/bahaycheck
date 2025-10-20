"use client"

import { useToastStore } from "@/stores/useToastStore"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import { Toaster as Sonner, ToasterProps } from "sonner"
import { toast } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  const pathname = usePathname();
  const { pending, clearPending, isError, setError } = useToastStore();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (pending) {
      const { type, msg } = pending;
      if (toast[type]) toast[type](msg);
      else toast.message(msg);
      clearPending();
      if(isError) setError(false)
    }
  }, [pathname, isError, pending, clearPending, setError]);
  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
