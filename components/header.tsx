"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Menu, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useRouter } from "next/navigation"

export default function Header() {
    const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setMounted(true)
    const isDarkMode = document.documentElement.classList.contains("dark")
    setIsDark(isDarkMode)
  }, [])

  const toggleDarkMode = () => {
    const html = document.documentElement
    if (isDark) {
      html.classList.remove("dark")
      localStorage.setItem("theme", "light")
      setIsDark(false)
    } else {
      html.classList.add("dark")
      localStorage.setItem("theme", "dark")
      setIsDark(true)
    }
  }

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute("href")
    if (href?.startsWith("#")) {
      e.preventDefault()
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
        setIsOpen(false)
      }
    }
  }

  return (
    <header
      className={`sticky top-0 z-50 bg-background border-b border-border transition-shadow duration-300 ${isScrolled ? "shadow-md" : ""}`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">B</span>
          </div>
          <span className="text-xl font-bold text-foreground">BahayCheck</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#home" onClick={handleNavClick} className="text-foreground hover:text-primary transition-colors">
            Home
          </a>
          <a href="#how-it-works" onClick={handleNavClick} className="text-foreground hover:text-primary transition-colors">
            How It Works
          </a>
          <a href="#features" onClick={handleNavClick} className="text-foreground hover:text-primary transition-colors">
            Features
          </a>
          <a href="#about" onClick={handleNavClick} className="text-foreground hover:text-primary transition-colors">
            About
          </a>
          <a href="#contact" onClick={handleNavClick} className="text-foreground hover:text-primary transition-colors">
            Contact
          </a>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {mounted && (
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md hover:bg-muted transition-colors border"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}
          <Button onClick={() => router.push('/signup')} className="bg-primary hover:bg-primary/90 text-primary-foreground">Report Now</Button>
        </div>

        {/* Mobile Sheet */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button aria-label="Toggle menu" className="md:hidden">
              <Menu size={24} />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="p-6 space-y-4">
            <a href="#home" onClick={handleNavClick} className="block text-foreground hover:text-primary">
              Home
            </a>
            <a href="#how-it-works" onClick={handleNavClick} className="block text-foreground hover:text-primary">
              How It Works
            </a>
            <a href="#features" onClick={handleNavClick} className="block text-foreground hover:text-primary">
              Features
            </a>
            <a href="#about" onClick={handleNavClick} className="block text-foreground hover:text-primary">
              About
            </a>
            <a href="#contact" onClick={handleNavClick} className="block text-foreground hover:text-primary">
              Contact
            </a>
            <div className="flex items-center gap-2 pt-4 border-t border-border">
              {mounted && (
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-md hover:bg-muted transition-colors border"
                  aria-label="Toggle dark mode"
                >
                  {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              )}
              <Button onClick={() => router.push('/signup')} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">Report Now</Button>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  )
}
