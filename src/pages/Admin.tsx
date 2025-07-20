import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Package, Clock, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OrderItem {
  id: string;
  name: string;
  location: string;
  quantity: number;
  found?: boolean;
}

interface Order {
  id: string;
  title: string;
  items: OrderItem[];
  status: 'pending' | 'active' | 'completed';
  createdAt: Date;
}

interface PackageTemplate {
  id: string;
  name: string;
  description: string;
  items: Omit<OrderItem, 'id' | 'found'>[];
}

const Admin = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [templates, setTemplates] = useState<PackageTemplate[]>([
    {
      id: '1',
      name: 'Electronics Kit',
      description: 'Standard electronics components package',
      items: [
        { name: 'Arduino Uno', location: 'A1-B2', quantity: 1 },
        { name: 'Breadboard', location: 'A1-C3', quantity: 2 },
        { name: 'Jumper Wires', location: 'A2-A1', quantity: 1 },
      ]
    },
    {
      id: '2', 
      name: 'Office Supplies',
      description: 'Basic office supply package',
      items: [
        { name: 'Pens (Blue)', location: 'B1-A1', quantity: 5 },
        { name: 'Notebooks', location: 'B1-B2', quantity: 3 },
        { name: 'Stapler', location: 'B2-A1', quantity: 1 },
      ]
    }
  ]);

  const [newOrder, setNewOrder] = useState({
    title: '',
    items: [] as Omit<OrderItem, 'id' | 'found'>[]
  });

  const [newItem, setNewItem] = useState({
    name: '',
    location: '',
    quantity: 1
  });

  const addItemToOrder = () => {
    if (newItem.name && newItem.location) {
      setNewOrder(prev => ({
        ...prev,
        items: [...prev.items, { ...newItem }]
      }));
      setNewItem({ name: '', location: '', quantity: 1 });
    }
  };

  const createOrder = () => {
    if (newOrder.title && newOrder.items.length > 0) {
      const order: Order = {
        id: Date.now().toString(),
        title: newOrder.title,
        items: newOrder.items.map(item => ({
          ...item,
          id: Math.random().toString(36).substr(2, 9),
          found: false
        })),
        status: 'pending',
        createdAt: new Date()
      };
      
      setOrders(prev => [order, ...prev]);
      setNewOrder({ title: '', items: [] });
      
      toast({
        title: "Order Created",
        description: `Order "${order.title}" has been created successfully.`,
      });
    }
  };

  const activateOrder = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'active' as const }
        : { ...order, status: order.status === 'active' ? 'pending' as const : order.status }
    ));
    
    toast({
      title: "Order Activated",
      description: "Order is now displayed on the storage screen.",
    });
  };

  const useTemplate = (template: PackageTemplate) => {
    setNewOrder({
      title: template.name,
      items: [...template.items]
    });
    
    toast({
      title: "Template Applied",
      description: `Template "${template.name}" has been applied to the new order.`,
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Lynx Admin</h1>
            <p className="text-muted-foreground text-lg">Storage Management System</p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Package className="w-4 h-4 mr-2" />
            {orders.filter(o => o.status === 'active').length} Active Orders
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create New Order */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Order
              </CardTitle>
              <CardDescription>
                Add items that need to be picked from storage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="order-title">Order Title</Label>
                <Input
                  id="order-title"
                  value={newOrder.title}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter order title..."
                  className="mt-1"
                />
              </div>

              <div className="space-y-4">
                <Label>Add Items</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    value={newItem.name}
                    onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Item name"
                  />
                  <Input
                    value={newItem.location}
                    onChange={(e) => setNewItem(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Location (e.g., A1-B2)"
                  />
                </div>
                <div className="flex gap-3">
                  <Input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    placeholder="Quantity"
                    min="1"
                    className="w-32"
                  />
                  <Button onClick={addItemToOrder} size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </Button>
                </div>
              </div>

              {newOrder.items.length > 0 && (
                <div className="space-y-2">
                  <Label>Order Items ({newOrder.items.length})</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {newOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div>
                          <span className="font-medium">{item.name}</span>
                          <span className="text-muted-foreground ml-2">({item.location})</span>
                        </div>
                        <Badge variant="secondary">Qty: {item.quantity}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                onClick={createOrder} 
                variant="industrial" 
                size="lg" 
                className="w-full"
                disabled={!newOrder.title || newOrder.items.length === 0}
              >
                Create Order
              </Button>
            </CardContent>
          </Card>

          {/* Package Templates */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Package Templates
              </CardTitle>
              <CardDescription>
                Pre-built packages for common orders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {templates.map((template) => (
                <div key={template.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                    <Button onClick={() => useTemplate(template)} size="sm" variant="outline">
                      Use Template
                    </Button>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Items: </span>
                    {template.items.map((item, index) => (
                      <span key={index}>
                        {item.name}
                        {index < template.items.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Active Orders */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Order Management
            </CardTitle>
            <CardDescription>
              Manage and activate orders for the storage display
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No orders created yet. Create your first order above.
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{order.title}</h3>
                        <Badge 
                          variant={order.status === 'active' ? 'default' : order.status === 'completed' ? 'secondary' : 'outline'}
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {order.items.length} items • Created {order.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    {order.status === 'pending' && (
                      <Button onClick={() => activateOrder(order.id)} variant="success">
                        <Check className="w-4 h-4 mr-2" />
                        Activate
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;