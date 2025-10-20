import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Hero() {
    const handleNavClick = () => {
          const element = document.querySelector("#features")
          if (element) {
            element.scrollIntoView({ behavior: "smooth" })
          }
      }
      const router =useRouter()
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-br from-background via-background to-secondary py-20 md:py-32"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block">
              <span className="px-4 py-2 bg-secondary text-primary rounded-full text-sm font-medium">
                Post-Earthquake Safety
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
              Quickly Report, Verify, and Track Your Home&apos;s Safety
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              BahayCheck connects residents with Local Government Units to coordinate post-earthquake residential safety
              assessments efficiently and transparently.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button onClick={() => router.push('/signup')} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Report Now
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button onClick={handleNavClick} size="lg" variant="outline" className="border-border hover:bg-muted bg-transparent">
                Learn More
              </Button>
            </div>
          </div>

          <div className="relative h-96 md:h-full min-h-96 bg-secondary rounded-2xl border border-border flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 4l4 2m-8-2l4-2"
                    />
                  </svg>
                </div>
                <p className="text-muted-foreground font-medium">Safe Home Assessment</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
