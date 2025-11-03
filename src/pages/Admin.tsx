// Admin.tsx (React frontend)
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Package, Clock, Check, Edit, Trash2, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { nanoid } from "nanoid"

interface OrderItem {
  id: string
  name: string
  location: string
  quantity: number
  found?: boolean
}

interface Order {
  id: string
  title: string
  items: OrderItem[]
  status: "pending" | "active" | "completed"
  createdAt: Date
}

interface PackageTemplate {
  id: string
  name: string
  description: string
  items: Omit<OrderItem, "id" | "found">[]
}

type ActiveTab = "storage" | "orders" | "templates"

const API_URL = "http://localhost:3001" // change to your VPS URL

const Admin = () => {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<ActiveTab>("orders")
  const [orders, setOrders] = useState<Order[]>([])
  const [templates, setTemplates] = useState<PackageTemplate[]>([])
  const [completedItems, setCompletedItems] = useState<OrderItem[]>([])
  const [storageItems, setStorageItems] = useState<OrderItem[]>([])

  // Missing state declarations
  const [newOrder, setNewOrder] = useState<{ title: string; items: OrderItem[] }>({ title: "", items: [] })
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<OrderItem[]>([])
  const [searchIndex, setSearchIndex] = useState(0)
  const [saveAsPreset, setSaveAsPreset] = useState(false)

  const [newStorageItem, setNewStorageItem] = useState<{ name: string; location: string; quantity: number }>({
    name: "",
    location: "",
    quantity: 1,
  })

  // Template editing states
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null)
  const [editingTemplateData, setEditingTemplateData] = useState<PackageTemplate | null>(null)
  const [newTemplateItem, setNewTemplateItem] = useState<{ name: string; location: string; quantity: number }>({
    name: "",
    location: "",
    quantity: 1,
  })

  // Create order handler
  const createOrder = async () => {
    const order: Order = {
      id: nanoid(),
      title: newOrder.title,
      items: newOrder.items,
      status: "pending",
      createdAt: new Date(),
    }
    await saveOrder(order)
    setNewOrder({ title: "", items: [] })
    setSaveAsPreset(false)
    loadOrders()
    toast({ title: "Ordre oprettet" })
    if (saveAsPreset) {
      // 1. Create template
      const res = await fetch(`${API_URL}/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newOrder.title,
          description: "",
        }),
      })
      const { id } = await res.json()
      // 2. Save items for this template
      for (const item of newOrder.items) {
        await fetch(`${API_URL}/templates/${id}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: item.name,
            location: item.location,
            quantity: item.quantity,
          }),
        })
      }
      loadTemplates()
      toast({ title: "Skabelon gemt" })
    }
  }

  // Add storage item handler
  const addStorageItemHandler = async () => {
    if (!newStorageItem.name || !newStorageItem.quantity) return // removed location check
    await addStorageItem(newStorageItem)
    setNewStorageItem({ name: "", location: "", quantity: 1 })
    loadStorage()
    toast({ title: "Vare tilføjet til lager" })
  }

  // Template handlers
  const createNewTemplate = () => {
    setEditingTemplate("new")
    setEditingTemplateData({
      id: nanoid(),
      name: "",
      description: "",
      items: [],
    })
    setNewTemplateItem({ name: "", location: "", quantity: 1 })
  }

  const startEditingTemplate = (template: PackageTemplate) => {
    setEditingTemplate(template.id)
    setEditingTemplateData({ ...template })
    setNewTemplateItem({ name: "", location: "", quantity: 1 })
  }

  const cancelEditingTemplate = () => {
    setEditingTemplate(null)
    setEditingTemplateData(null)
    setNewTemplateItem({ name: "", location: "", quantity: 1 })
  }

  const saveTemplate = async () => {
    if (!editingTemplateData) return
    if (editingTemplate === "new") {
      // Create template first
      const res = await fetch(`${API_URL}/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingTemplateData.name,
          description: editingTemplateData.description,
        }),
      })
      const { id } = await res.json()
      // Save items for this template
      for (const item of editingTemplateData.items) {
        await fetch(`${API_URL}/templates/${id}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        })
      }
    } else {
      await saveTemplates(editingTemplateData)
      // Optionally update items here if you allow editing them
    }
    loadTemplates()
    cancelEditingTemplate()
    toast({ title: "Skabelon gemt" })
  }

  const addItemToTemplateHandler = async () => {
    if (!editingTemplateData) return
    if (!newTemplateItem.name || !newTemplateItem.location || !newTemplateItem.quantity) return
    const updatedItems = [...editingTemplateData.items, { ...newTemplateItem }]
    setEditingTemplateData({ ...editingTemplateData, items: updatedItems })
    setNewTemplateItem({ name: "", location: "", quantity: 1 })
  }

  const removeItemFromTemplate = (index: number) => {
    if (!editingTemplateData) return
    const updatedItems = editingTemplateData.items.filter((_, i) => i !== index)
    setEditingTemplateData({ ...editingTemplateData, items: updatedItems })
  }

  const useTemplate = (template: PackageTemplate) => {
    setActiveTab("orders")
    setNewOrder({
      title: template.name,
      items: template.items.map((item) => ({
        ...item,
        id: nanoid(),
      })),
    })
  }

  // Replace filesystem with API
  const loadOrders = async () => {
    const res = await fetch(`${API_URL}/orders`)
    const data = await res.json()
    setOrders(data.map((order: any) => ({ ...order, createdAt: new Date(order.createdAt) })))
  }

  const saveOrder = async (order: Order) => {
    await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    })
  }

  const loadTemplates = async () => {
    const res = await fetch(`${API_URL}/templates`)
    const data = await res.json()
    setTemplates(data)
  }

  const saveTemplates = async (template: PackageTemplate) => {
    await fetch(`${API_URL}/templates/${template.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: template.name, description: template.description }),
    })
  }

  const deleteTemplate = async (templateId: string) => {
    await fetch(`${API_URL}/templates/${templateId}`, { method: "DELETE" })
    setTemplates(templates.filter((t) => t.id !== templateId))
  }

  const addItemToTemplate = async (templateId: string, item: Omit<OrderItem, "id" | "found">) => {
    await fetch(`${API_URL}/templates/${templateId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    })
    loadTemplates()
  }

  const loadStorage = async () => {
    const res = await fetch(`${API_URL}/storage`)
    const data = await res.json()
    setStorageItems(data)
  }

  const addStorageItem = async (item: Omit<OrderItem, "id" | "found">) => {
    const res = await fetch(`${API_URL}/storage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    })
    const newItem = await res.json()
    setStorageItems([...storageItems, { ...item, id: newItem.id }])
  }

  const deleteStorageItem = async (id: string) => {
    await fetch(`${API_URL}/storage/${id}`, { method: "DELETE" })
    setStorageItems(storageItems.filter((item) => item.id !== id))
  }

  const completeOrder = async (id: string) => {
    await fetch(`${API_URL}/orders/${id}/complete`, { method: "POST" })
    loadOrders()
    toast({ title: "Ordre afsluttet" })
  }

  const activateOrder = async (id: string) => {
    await fetch(`${API_URL}/orders/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "active" }),
    })
    loadOrders()
  }

  useEffect(() => {
    loadOrders()
    loadTemplates()
    loadStorage()
  }, [])

  // Search functionality
  useEffect(() => {
    if (searchTerm) {
      const results = storageItems.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      setSearchResults(results)
      setSearchIndex(0)
    } else {
      setSearchResults([])
      setSearchIndex(0)
    }
  }, [searchTerm, storageItems])

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      setSearchIndex((i) => Math.min(i + 1, searchResults.length - 1))
    } else if (e.key === "ArrowUp") {
      setSearchIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter" && searchResults.length > 0) {
      const selected = searchResults[searchIndex]
      setNewOrder((prev) => {
        const idx = prev.items.findIndex((item) => item.name === selected.name && item.location === selected.location)
        if (idx !== -1) {
          const updatedItems = [...prev.items]
          updatedItems[idx].quantity += 1
          return { ...prev, items: updatedItems }
        } else {
          return {
            ...prev,
            items: [...prev.items, { ...selected, quantity: 1 }],
          }
        }
      })
    }
  }

  const TabButton = ({
    tab,
    label,
    isActive,
    onClick,
  }: {
    tab: ActiveTab
    label: string
    isActive: boolean
    onClick: () => void
  }) => (
    <button
      onClick={onClick}
      className={`px-6 py-3 font-semibold text-lg transition-all duration-200 border-b-2 ${
        isActive
          ? "text-primary border-primary bg-primary/5"
          : "text-muted-foreground border-transparent hover:text-foreground hover:border-muted-foreground/50"
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Wentzel Storage</h1>
              <p className="text-muted-foreground text-lg">Lagerstyringssystem</p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              <Package className="w-4 h-4 mr-2" />
              {orders.filter((o) => o.status === "active").length} Aktive ordrer
            </Badge>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-0 border-b">
            <TabButton
              tab="orders"
              label="Ordrehåndtering"
              isActive={activeTab === "orders"}
              onClick={() => setActiveTab("orders")}
            />
            <TabButton
              tab="storage"
              label="Lagerstyring"
              isActive={activeTab === "storage"}
              onClick={() => setActiveTab("storage")}
            />
            <TabButton
              tab="templates"
              label="Skabeloner"
              isActive={activeTab === "templates"}
              onClick={() => setActiveTab("templates")}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === "orders" && (
          <div className="space-y-8">
            {/* Create Order Section */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Opret ny ordre</CardTitle>
                <CardDescription>Opret en ny ordre til lageret</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="order-title">Ordretitel</Label>
                  <Input
                    id="order-title"
                    value={newOrder.title}
                    onChange={(e) => setNewOrder((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Indtast ordretitel..."
                    className="mt-1"
                  />
                </div>

                {/* Search and add items */}
                <div className="space-y-4">
                  <Label>Tilføj varer fra lager</Label>
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Søg efter vare..."
                  />

                  {searchTerm && (
                    <div className="border rounded-lg mt-2 max-h-40 overflow-y-auto">
                      {searchResults.length === 0 ? (
                        <div className="p-2 text-muted-foreground">Ingen varer fundet</div>
                      ) : (
                        searchResults.map((item, idx) => (
                          <div
                            key={item.id}
                            className={`p-2 cursor-pointer ${idx === searchIndex ? "bg-accent" : ""}`}
                            onMouseDown={() => {
                              setNewOrder((prev) => ({
                                ...prev,
                                items: [...prev.items, { ...item, quantity: 1 }],
                              }))
                            }}
                          >
                            <span className="font-medium">{item.name}</span>
                            <span className="ml-2 text-muted-foreground">({item.location})</span>
                            <span className="ml-2">Antal: {item.quantity}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {newOrder.items.length > 0 && (
                  <div className="space-y-2">
                    <Label>Ordrevarer ({newOrder.items.length})</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {newOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <div>
                            <span className="font-medium">{item.name}</span>
                            <span className="text-muted-foreground ml-2">({item.location})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Antal: {item.quantity}</Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setNewOrder((prev) => ({
                                  ...prev,
                                  items: prev.items.filter((_, i) => i !== index),
                                }))
                              }
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="save-as-preset"
                    checked={saveAsPreset}
                    onChange={(e) => setSaveAsPreset(e.target.checked)}
                  />
                  <Label htmlFor="save-as-preset">Gem som skabelon</Label>
                </div>

                <Button
                  onClick={createOrder}
                  size="lg"
                  className="w-full"
                  disabled={!newOrder.title || newOrder.items.length === 0}
                >
                  Opret ordre
                </Button>
              </CardContent>
            </Card>

            {/* Orders List */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Alle ordrer
                </CardTitle>
                <CardDescription>Administrer og aktiver ordrer til lagerdisplayet</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Ingen ordrer oprettet endnu. Opret din første ordre ovenfor.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{order.title}</h3>
                            <Badge
                              variant={
                                order.status === "active"
                                  ? "default"
                                  : order.status === "completed"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {order.status === "pending"
                                ? "afventer"
                                : order.status === "active"
                                  ? "aktiv"
                                  : "afsluttet"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {order.items.length} varer • Oprettet {order.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {order.status === "pending" && (
                            <Button onClick={() => activateOrder(order.id)} variant="default">
                              <Check className="w-4 h-4 mr-2" />
                              Aktivér
                            </Button>
                          )}
                          {order.status === "active" && (
                            <Button onClick={() => completeOrder(order.id)} variant="secondary">
                              Afslut
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "storage" && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Lagerstyring</CardTitle>
              <CardDescription>Administrer varer i lageret</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Tilføj ny vare til lager</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Navn"
                    value={newStorageItem.name}
                    onChange={(e) => setNewStorageItem((s) => ({ ...s, name: e.target.value }))}
                  />
                  <Input
                    placeholder="Lokation"
                    value={newStorageItem.location}
                    onChange={(e) => setNewStorageItem((s) => ({ ...s, location: e.target.value }))}
                  />
                  <Input
                    placeholder="Antal"
                    type="number"
                    value={newStorageItem.quantity}
                    onChange={(e) => setNewStorageItem((s) => ({ ...s, quantity: Number(e.target.value) }))}
                  />
                  <Button onClick={addStorageItemHandler} variant="default">
                    <Plus className="w-4 h-4 mr-2" />
                    Tilføj
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Lagervarer ({storageItems.length})</Label>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {storageItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-muted-foreground ml-2">({item.location})</span>
                        <Badge variant="outline" className="ml-2">
                          Antal: {item.quantity}
                        </Badge>
                      </div>
                      <Button size="sm" variant="destructive" onClick={() => deleteStorageItem(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "templates" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Skabeloner</h2>
                <p className="text-muted-foreground">Administrer og rediger orderskabeloner</p>
              </div>
              <Button onClick={createNewTemplate} variant="default">
                <Plus className="w-4 h-4 mr-2" />
                Ny skabelon
              </Button>
            </div>

            <div className="grid gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="shadow-card">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {editingTemplate === template.id ? (
                          <div className="space-y-2">
                            <Input
                              value={editingTemplateData?.name || ""}
                              onChange={(e) =>
                                setEditingTemplateData((prev) => (prev ? { ...prev, name: e.target.value } : null))
                              }
                              className="text-lg font-semibold"
                            />
                            <Textarea
                              value={editingTemplateData?.description || ""}
                              onChange={(e) =>
                                setEditingTemplateData((prev) =>
                                  prev ? { ...prev, description: e.target.value } : null,
                                )
                              }
                              className="text-sm"
                            />
                          </div>
                        ) : (
                          <div>
                            <CardTitle>{template.name}</CardTitle>
                            <CardDescription>{template.description}</CardDescription>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {editingTemplate === template.id ? (
                          <>
                            <Button onClick={saveTemplate} size="sm" variant="default">
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button onClick={cancelEditingTemplate} size="sm" variant="outline">
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button onClick={() => useTemplate(template)} size="sm" variant="default">
                              Brug skabelon
                            </Button>
                            <Button onClick={() => startEditingTemplate(template)} size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button onClick={() => deleteTemplate(template.id)} size="sm" variant="destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {editingTemplate === template.id ? (
                      <div className="space-y-4">
                        {/* Add new item to template */}
                        <div>
                          <Label>Tilføj vare til skabelon</Label>
                          <div className="flex gap-2 mt-2">
                            <Input
                              placeholder="Navn"
                              value={newTemplateItem.name}
                              onChange={(e) => setNewTemplateItem((prev) => ({ ...prev, name: e.target.value }))}
                            />
                            <Input
                              placeholder="Lokation"
                              value={newTemplateItem.location}
                              onChange={(e) => setNewTemplateItem((prev) => ({ ...prev, location: e.target.value }))}
                            />
                            <Input
                              placeholder="Antal"
                              type="number"
                              value={newTemplateItem.quantity}
                              onChange={(e) => setNewTemplateItem((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
                            />
                            <Button onClick={addItemToTemplateHandler} size="sm">
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Template items */}
                        <div className="space-y-2">
                          <Label>Varer i skabelon ({editingTemplateData?.items.length || 0})</Label>
                          {editingTemplateData?.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-2 border rounded">
                              <div>
                                <span className="font-medium">{item.name}</span>
                                <span className="text-muted-foreground ml-2">({item.location})</span>
                                <Badge variant="outline" className="ml-2">
                                  Antal: {item.quantity}
                                </Badge>
                              </div>
                              <Button onClick={() => removeItemFromTemplate(index)} size="sm" variant="ghost">
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label>Varer ({template.items.length})</Label>
                        {template.items.length === 0 ? (
                          <p className="text-muted-foreground text-sm">Ingen varer i denne skabelon</p>
                        ) : (
                          <div className="space-y-1">
                            {template.items.map((item, index) => (
                              <div key={index} className="text-sm">
                                <span className="font-medium">{item.name}</span>
                                <span className="text-muted-foreground ml-2">({item.location})</span>
                                <span className="ml-2">× {item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Admin
