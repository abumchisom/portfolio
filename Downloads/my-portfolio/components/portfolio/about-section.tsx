export function AboutSection() {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="space-y-8">
            <div>
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">About</h2>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Building bridges between complex technology and the people who use it
              </h3>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              I'm a developer passionate about crafting accessible, pixel-perfect technical documentation that blends
              thoughtful design with robust security engineering. My favorite work lies at the intersection of clear
              communication and cybersecurity, creating experiences that not only look great but are meticulously built
              for performance and security.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              Currently, I'm a Senior Technical Writer at <span className="text-primary">SecureTech</span>, specializing
              in security documentation. I contribute to the creation and maintenance of technical content that powers
              our platform, ensuring our documentation meets industry standards and best practices to deliver an
              inclusive user experience.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              In the past, I've had the opportunity to develop content across a variety of settings — from{" "}
              <span className="text-foreground">cybersecurity firms</span> and{" "}
              <span className="text-foreground">enterprise corporations</span> to{" "}
              <span className="text-foreground">startups</span> and{" "}
              <span className="text-foreground">digital security consultancies</span>. Additionally, I also released a{" "}
              <span className="text-foreground">comprehensive security training course</span> a few years ago, guiding
              learners through building secure applications with modern security frameworks.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              In my spare time, I'm usually researching new security threats, writing technical articles, hanging out
              with my team, or exploring the latest developments in cybersecurity and technical communication.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
