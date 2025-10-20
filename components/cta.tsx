import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CTA() {
    const router = useRouter()
  return (
    <section id="contact" className="py-20 md:py-32 bg-gradient-to-br from-primary/5 via-background to-blue-50/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            Ready to Report Your Home&apos;s Safety?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Start a report now or contact your Local Government Unit to learn more about BahayCheck
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button onClick={()=> router.push('/signup')} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Start a Report
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <Button onClick={()=> router.push('/signin')} size="lg" variant="outline" className="border-border hover:bg-muted bg-transparent">
            Contact LGU
          </Button>
        </div>
      </div>
    </section>
  )
}
