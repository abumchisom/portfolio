"use client";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price_range: string;
  features: string[];
  active: boolean;
}

export function ServicesSection() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      if (response.ok) {
        const data = await response.json();
        setServices(data.filter((service: Service) => service.active));
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">Loading services...</div>
      </section>
    );
  }

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
          {services.map((service) => (
            <div
              key={service.id}
              className="group relative rounded-xl border border-border/60 bg-background/50 p-6 transition hover:border-primary/40"
            >
              <div className="flex justify-between items-start mb-4">
                <Badge variant="secondary" className="text-xs">
                  {service.category}
                </Badge>
                <span className="text-lg font-bold text-primary">
                  {service.price_range}
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
