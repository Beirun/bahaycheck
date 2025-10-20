import { Card } from "@/components/ui/card"
import { Zap, Lock, BarChart3, Users } from "lucide-react"

export default function Features() {
  const features = [
    {
      icon: Zap,
      title: "Fast Reporting",
      description: "Submit damage reports in minutes with an intuitive mobile-first interface",
    },
    {
      icon: Lock,
      title: "LGU Integration",
      description: "Seamlessly connect with local government units for official verification",
    },
    {
      icon: BarChart3,
      title: "Real-Time Tracking",
      description: "Monitor your report status with live updates and transparent communication",
    },
    {
      icon: Users,
      title: "Transparent Updates",
      description: "Receive clear, timely notifications about your assessment progress",
    },
  ]

  return (
    <section id="features" className="py-20 md:py-32 bg-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Powerful Features for Safety
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to report and track your home&apos;s post-earthquake safety assessment
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="p-6 border-border hover:border-primary/50 transition-all hover:shadow-lg">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
