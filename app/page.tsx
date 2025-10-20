// app/page.tsx
"use client";

import Header from "@/components/header"
import Hero from "@/components/hero"
import HowItWorks from "@/components/how-it-works"
import Features from "@/components/features"
import About from "@/components/about"
import CTA from "@/components/cta"

export default function LandingPage() {
  return (
    <main id='landing' className="min-h-screen w-screen bg-background">
      <Header />
      <Hero />
      <HowItWorks />
      <Features />
      <About />
      <CTA />
    </main>
  );
}
