import { CheckCircle2, Shield, TrendingUp } from "lucide-react"

export default function HowItWorks() {
  const steps = [
    {
      icon: CheckCircle2,
      title: "Report Damage",
      description: "Submit detailed information about your home's condition after an earthquake",
    },
    {
      icon: Shield,
      title: "LGU Verification",
      description: "Local Government Units verify and assess your report with professional evaluation",
    },
    {
      icon: TrendingUp,
      title: "Track Status",
      description: "Monitor your report status in real-time and receive transparent updates",
    },
  ]

  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">How BahayCheck Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A simple three-step process to ensure your home&apos;s safety is properly documented and tracked
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary/50 to-transparent"></div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
