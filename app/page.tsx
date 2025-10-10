// app/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="flex flex-col bg-slate-50">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-violet-500">
          BahayCheck
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto mb-8 text-slate-800">
          LGU-Integrated System for Post-Earthquake Residential Safety Requests.
          Quickly report, verify, and track the safety of your home after an
          earthquake.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            size="lg"
            onClick={() => (window.location.href = "/signup")}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Get Started
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
            onClick={() => {
              const featuresSection = document.getElementById("features");
              featuresSection?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Learn More
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="min-h-screen flex flex-col justify-center px-6"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-center text-slate-900 mb-12">
          Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto w-full">
          {[
            {
              title: "Rapid Safety Reporting",
              desc: "Submit post-earthquake safety requests for your residence in minutes.",
            },
            {
              title: "LGU Integration",
              desc: "Directly connected with local government units for faster response and verification.",
            },
            {
              title: "Real-Time Status",
              desc: "Track your request status live and receive notifications about updates.",
            },
          ].map((feature) => (
            <Card
              key={feature.title}
              className="transition-all duration-300 hover:scale-105 hover:shadow-[0_10px_15px_-3px_rgba(59,130,246,0.5),0_4px_6px_-2px_rgba(59,130,246,0.25)] shadow-lg border border-border p-6 flex flex-col justify-between min-h-[250px]"
            >
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-base md:text-lg">
                  {feature.desc}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="min-h-screen flex flex-col justify-center px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
            About BahayCheck
          </h2>
          <p className="text-lg md:text-xl text-slate-700">
            BahayCheck empowers citizens and local government units to ensure
            residential safety after earthquakes. Our platform streamlines
            reporting, verification, and follow-up, helping communities recover
            faster and safer.
          </p>
        </div>
      </section>
    </div>
  );
}
