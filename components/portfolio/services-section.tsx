import { Badge } from "@/components/ui/badge";

const services = [
  {
    title: "Technical Documentation",
    description:
      "Comprehensive technical documentation services including API documentation, user guides, and developer resources.",
    category: "Technical Writing",
    priceRange: "$50-150/hour",
    features: [
      "API Documentation",
      "User Guides",
      "Developer Resources",
      "Process Documentation",
      "Knowledge Base Creation",
    ],
  },
  {
    title: "Security Auditing",
    description:
      "Thorough security assessments and vulnerability testing for web applications and systems.",
    category: "Cybersecurity",
    priceRange: "$100-200/hour",
    features: [
      "Vulnerability Assessment",
      "Penetration Testing",
      "Security Code Review",
      "Compliance Auditing",
      "Risk Assessment",
    ],
  },
  {
    title: "Content Strategy",
    description:
      "Strategic content planning and creation for technical products and security awareness programs.",
    category: "Technical Writing",
    priceRange: "$75-125/hour",
    features: [
      "Content Strategy",
      "Editorial Planning",
      "Technical Blogging",
      "Training Materials",
      "Style Guide Development",
    ],
  },
  {
    title: "Security Consulting",
    description:
      "Expert cybersecurity consulting services for businesses looking to improve their security posture.",
    category: "Cybersecurity",
    priceRange: "$150-250/hour",
    features: [
      "Security Architecture",
      "Incident Response Planning",
      "Security Training",
      "Policy Development",
      "Compliance Guidance",
    ],
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">Services</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Specialized technical writing and cybersecurity services to help
            your organization communicate clearly and stay secure.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group relative rounded-xl border border-border/60 bg-background/50 p-6 transition hover:border-primary/40"
            >
              <div className="flex justify-between items-start mb-4">
                <Badge variant="secondary" className="text-xs">
                  {service.category}
                </Badge>
                <span className="text-lg font-bold text-primary">
                  {service.priceRange}
                </span>
              </div>

              <h3 className="text-xl font-semibold text-foreground mb-2">
                {service.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {service.description}
              </p>

              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">
                  Key Features
                </h4>
                <div className="flex flex-wrap gap-2">
                  {service.features.map((feature, featureIndex) => (
                    <span
                      key={featureIndex}
                      className="px-2.5 py-1 text-xs rounded-full border border-border/50 bg-muted/30 text-muted-foreground"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
