"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price_range: string;
  features: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface ServiceFormData {
  title: string;
  description: string;
  category: string;
  price_range: string;
  features: string[];
  active: boolean;
}

const initialFormData: ServiceFormData = {
  title: "",
  description: "",
  category: "technical-writing",
  price_range: "",
  features: [],
  active: true,
};

export function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>(initialFormData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      } else {
        toast.error("Failed to fetch services");
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    const serviceData = { ...formData };

    try {
      const url = editingService ? `/api/services/${editingService.id}` : "/api/services";
      const method = editingService ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serviceData),
      });

      if (response.ok) {
        toast.success(editingService ? "Service updated" : "Service created");
        setDialogOpen(false);
        resetForm();
        fetchServices();
      } else {
        toast.error("Failed to save service");
      }
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error("Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      category: service.category,
      price_range: service.price_range,
      features: service.features,
      active: service.active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      const response = await fetch(`/api/services/${id}`, { method: "DELETE" });
      if (response.ok) {
        toast.success("Service deleted");
        fetchServices();
      } else {
        toast.error("Failed to delete service");
      }
    } catch (error) {
      toast.error("Failed to delete service");
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingService(null);
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading services...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Services</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your service offerings</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="border border-border rounded-lg p-6 hover:bg-muted/30 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-xs capitalize">
                    {service.category.replace("-", " ")}
                  </Badge>
                  {!service.active && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(service)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(service.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <h3 className="font-medium text-lg mb-2">{service.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{service.description}</p>

              {service.price_range && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                  <DollarSign className="h-4 w-4" />
                  {service.price_range}
                </div>
              )}

              {service.features.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Features:</p>
                  <ul className="space-y-1.5">
                    {service.features.map((feature, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {services.length === 0 && (
          <div className="border border-border rounded-lg p-12 text-center">
            <p className="text-sm text-muted-foreground mb-6">No services yet.</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Service
            </Button>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingService ? "Edit Service" : "Add New Service"}</DialogTitle>
            <DialogDescription>
              {editingService ? "Update the service details" : "Create a new service offering"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="title">Service Name *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical-writing">Technical Writing</SelectItem>
                    <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="price_range">Price Range</Label>
              <Input
                id="price_range"
                value={formData.price_range}
                onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                placeholder="e.g., $50-150/hour"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Features</Label>
              <div
                className="flex flex-wrap gap-2 border border-border rounded-lg px-3 py-2 min-h-11 focus-within:ring-2 focus-within:ring-ring"
                onClick={() => document.getElementById("featureInput")?.focus()}
              >
                {formData.features.map((f, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {f}
                    <button
                      type="button"
                      className="ml-1.5 hover:text-destructive"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          features: formData.features.filter((_, idx) => idx !== i),
                        })
                      }
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                <input
                  id="featureInput"
                  type="text"
                  className="flex-1 min-w-32 outline-none bg-transparent text-sm"
                  placeholder="Type and press Enter..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val && !formData.features.includes(val)) {
                        setFormData({ ...formData, features: [...formData.features, val] });
                      }
                      (e.target as HTMLInputElement).value = "";
                    } else if (e.key === "Backspace" && (e.target as HTMLInputElement).value === "" && formData.features.length) {
                      setFormData({ ...formData, features: formData.features.slice(0, -1) });
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={formData.active}
                onCheckedChange={(c) => setFormData({ ...formData, active: c })}
              />
              <Label className="cursor-pointer">Active Service</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editingService ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}