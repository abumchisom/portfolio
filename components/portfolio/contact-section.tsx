import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, MapPin, Phone } from "lucide-react"
import Link from "next/link"

interface ContactSectionProps {
  portfolio?: {
    email?: string
    phone?: string
    location?: string
  } | null
}

export function ContactSection({ portfolio }: ContactSectionProps) {
  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">Get In Touch</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ready to discuss your technical writing or cybersecurity needs? I'd love to hear about your project and how
            I can help.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Let's Work Together</CardTitle>
              <CardDescription>
                Whether you need comprehensive documentation, security assessments, or strategic consulting, I'm here to
                help your organization succeed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Email</p>
                  <Link
                    href={`mailto:${portfolio?.email || "alex@example.com"}`}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {portfolio?.email || "alex@example.com"}
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Phone</p>
                  <Link
                    href={`tel:${portfolio?.phone?.replace(/\D/g, "") || "15551234567"}`}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {portfolio?.phone || "No phone available."}
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-muted-foreground">{portfolio?.location || "San Francisco, CA"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Quick Response</CardTitle>
              <CardDescription>
                I typically respond to inquiries within 24 hours. For urgent security matters, please call directly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Response Times</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• General inquiries: 24 hours</li>
                  <li>• Project consultations: 48 hours</li>
                  <li>• Security emergencies: Same day</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Best Times to Reach Me</h4>
                <p className="text-sm text-muted-foreground">Monday - Friday, 9 AM - 6 PM PST</p>
              </div>
              <Button asChild className="w-full">
                <Link href={`mailto:${portfolio?.email || "alex@example.com"}`}>Send Email</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
