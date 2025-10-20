"use client"

import { useState, useEffect } from "react"
import { Menu, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"

export default function Header() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => setMounted(true), [])

  const toggleDarkMode = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
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
    <header className={`sticky top-0 z-50 bg-background border-b border-border transition-shadow duration-300 ${isScrolled ? "shadow-md" : ""}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">B</span>
          </div>
          <span className="text-xl font-bold text-foreground">BahayCheck</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {["home", "how-it-works", "features", "about", "contact"].map((id) => (
            <a key={id} href={`#${id}`} onClick={handleNavClick} className="text-foreground hover:text-primary transition-colors">
              {id.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {mounted && (
            <button onClick={toggleDarkMode} className="p-2 rounded-md hover:bg-muted transition-colors border" aria-label="Toggle dark mode">
              {resolvedTheme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}
          <Button onClick={() => router.push("/signup")} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Report Now
          </Button>
        </div>

        {/* Mobile Sheet */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button aria-label="Toggle menu" className="md:hidden">
              <Menu size={24} />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="p-6 space-y-4">
            {["home", "how-it-works", "features", "about", "contact"].map((id) => (
              <a key={id} href={`#${id}`} onClick={handleNavClick} className="block text-foreground hover:text-primary">
                {id.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())}
              </a>
            ))}
            <div className="flex items-center gap-2 pt-4 border-t border-border">
              {mounted && (
                <button onClick={toggleDarkMode} className="p-2 rounded-md hover:bg-muted transition-colors border" aria-label="Toggle dark mode">
                  {resolvedTheme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              )}
              <Button onClick={() => router.push("/signup")} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                Report Now
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  )
}
