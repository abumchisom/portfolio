import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
    description: "Thorough security assessments and vulnerability testing for web applications and systems.",
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
    description: "Strategic content planning and creation for technical products and security awareness programs.",
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
    description: "Expert cybersecurity consulting services for businesses looking to improve their security posture.",
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
]

export function ServicesSection() {
  return (
    <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">Services</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Specialized technical writing and cybersecurity services to help your organization communicate clearly and
            stay secure.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="bg-card border-border">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {service.category}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{service.priceRange}</span>
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
                <CardDescription className="text-muted-foreground">{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Key Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
