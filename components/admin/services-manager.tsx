"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, DollarSign } from "lucide-react"
import { toast } from "sonner"

interface Service {
  id: string
  title: string
  description: string
  category: string
  price_range: string
  features: string[]
  active: boolean
  created_at: string
  updated_at: string
}

interface ServiceFormData {
  title: string
  description: string
  category: string
  price_range: string
  features: string[]
  active: boolean
}

const initialFormData: ServiceFormData = {
  title: "",
  description: "",
  category: "technical-writing",
  price_range: "",
  features: [],
  active: true,
}

export function ServicesManager() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState<ServiceFormData>(initialFormData)
  const [featuresInput, setFeaturesInput] = useState("")

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services")
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      } else {
        toast.error("Failed to fetch services")
      }
    } catch (error) {
      console.error("Error fetching services:", error)
      toast.error("Failed to fetch services")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.description) {
      toast.error("Please fill in all required fields")
      return
    }

    const features = featuresInput
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f.length > 0)

    const serviceData = {
      ...formData,
      features,
    }

    try {
      const url = editingService ? `/api/services/${editingService.id}` : "/api/services"
      const method = editingService ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(serviceData),
      })

      if (response.ok) {
        toast.success(editingService ? "Service updated successfully" : "Service created successfully")
        setDialogOpen(false)
        resetForm()
        fetchServices()
      } else {
        toast.error("Failed to save service")
      }
    } catch (error) {
      console.error("Error saving service:", error)
      toast.error("Failed to save service")
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setFormData({
      title: service.title,
      description: service.description,
      category: service.category,
      price_range: service.price_range,
      features: service.features,
      active: service.active,
    })
    setFeaturesInput(service.features.join("\n"))
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Service deleted successfully")
        fetchServices()
      } else {
        toast.error("Failed to delete service")
      }
    } catch (error) {
      console.error("Error deleting service:", error)
      toast.error("Failed to delete service")
    }
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setFeaturesInput("")
    setEditingService(null)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    resetForm()
  }

  if (loading) {
    return <div className="flex justify-center py-8">Loading services...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Services</h2>
          <p className="text-muted-foreground">Manage your service offerings</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingService ? "Edit Service" : "Add New Service"}</DialogTitle>
              <DialogDescription>
                {editingService ? "Update service details" : "Create a new service offering"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Service Name *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Technical Documentation"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
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

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this service includes..."
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price_range">Price Range</Label>
                <Input
                  id="price_range"
                  value={formData.price_range}
                  onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                  placeholder="e.g., $50-150/hour"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="features">Features (one per line)</Label>
                <Textarea
                  id="features"
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                  placeholder="API Documentation&#10;User Guides&#10;Developer Resources"
                  rows={5}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label htmlFor="active">Active Service</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancel
                </Button>
                <Button type="submit">{editingService ? "Update Service" : "Create Service"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {services.map((service) => (
          <Card key={service.id} className="bg-card border-border">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {service.category === "technical-writing" ? "Technical Writing" : "Cybersecurity"}
                  </Badge>
                  {!service.active && (
                    <Badge variant="destructive" className="text-xs">
                      Inactive
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(service)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(service.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-xl">{service.title}</CardTitle>
              <CardDescription className="text-muted-foreground">{service.description}</CardDescription>
              {service.price_range && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  {service.price_range}
                </div>
              )}
            </CardHeader>
            <CardContent>
              {service.features.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No services found</p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Service
          </Button>
        </div>
      )}
    </div>
  )
}
