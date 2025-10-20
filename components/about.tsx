export default function About() {
  return (
    <section id="about" className="py-20 md:py-32 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">About BahayCheck</h2>
          </div>

          <div className="bg-secondary/30 border border-blue-200/10 rounded-2xl p-8 md:p-12 space-y-6">
            <p className="text-lg text-foreground leading-relaxed">
              BahayCheck is a government-integrated platform designed to streamline post-earthquake residential safety
              assessments. We bridge the gap between residents and Local Government Units, enabling efficient
              coordination and transparent communication during critical recovery periods.
            </p>

            <div className="grid md:grid-cols-3 gap-6 pt-6 border-t border-blue-200/30">
              <div className="space-y-2">
                <p className="text-3xl font-bold text-primary">100%</p>
                <p className="text-muted-foreground">Transparent Process</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-primary">24/7</p>
                <p className="text-muted-foreground">Available Support</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-primary">Real-time</p>
                <p className="text-muted-foreground">Status Updates</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
