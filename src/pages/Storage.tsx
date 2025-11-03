import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Package, MapPin, CheckCircle, Circle, Clock } from "lucide-react";
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

const API_URL = "http://localhost:3001";

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

const Storage = () => {
  const [storageItems, setStorageItems] = useState<OrderItem[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  // Læs ordrer fra lokal fil ved opstart
  useEffect(() => {
    const loadOrdersFromFile = async () => {
      try {
        const result = await Filesystem.readFile({
          path: 'orders.json',
          directory: Directory.Data,
          encoding: Encoding.UTF8,
        });
        const orders: Order[] = JSON.parse(typeof result.data === 'string' ? result.data : await result.data.text());
        // Sæt den første aktive ordre som currentOrder
        const activeOrder = orders.find(o => o.status === 'active');
        if (activeOrder) setCurrentOrder(activeOrder);
      } catch (e) {
        // Filen findes ikke endnu, behold fallback
      }
    };
    loadOrdersFromFile();
  }, []);

  // Fetch storage items and active order
  useEffect(() => {
    // Fetch storage items
    const fetchStorage = async () => {
      const res = await fetch(`${API_URL}/storage`);
      const data = await res.json();
      setStorageItems(data);
    };

    // Fetch active order
    const fetchActiveOrder = async () => {
      const res = await fetch(`${API_URL}/orders`);
      const orders: Order[] = await res.json();
      const active = orders.find(o => o.status === "active");
      setActiveOrder(active || null);
      setCurrentOrder(active || null); // <-- Add this line
    };

    fetchStorage();
    fetchActiveOrder();
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const toggleItemFound = (itemId: string) => {
    if (currentOrder) {
      setCurrentOrder(prev => prev ? {
        ...prev,
        items: prev.items.map(item => 
          item.id === itemId ? { ...item, found: !item.found } : item
        )
      } : null);
    }
  };

  const getFoundStatus = (item: OrderItem) => {
    if (!activeOrder) return false;
    const foundItem = activeOrder.items.find(
      (orderItem) =>
        orderItem.name === item.name &&
        orderItem.location === item.location &&
        orderItem.found
    );
    return !!foundItem;
  };

  const foundItems = currentOrder?.items.filter(item => item.found).length || 0;
  const totalItems = currentOrder?.items.length || 0;
  const progress = totalItems > 0 ? (foundItems / totalItems) * 100 : 0;

  const markOrderComplete = async () => {
    if (!currentOrder) return;
    try {
      // Læs alle ordrer fra fil
      const result = await Filesystem.readFile({
        path: 'orders.json',
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });
      const orders: Order[] = JSON.parse(typeof result.data === 'string' ? result.data : await result.data.text());
      // Find og opdater den aktuelle ordre
      const updatedOrders = orders.map(order =>
        order.id === currentOrder.id ? { ...order, status: 'completed' } : order
      );
      await Filesystem.writeFile({
        path: 'orders.json',
        data: JSON.stringify(updatedOrders, null, 2),
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });
      setCurrentOrder(null); // Nulstil currentOrder
    } catch (e) {
      // Håndter fejl
    }
  };

  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <Card className="w-full max-w-2xl text-center shadow-glow">
          <CardContent className="p-12">
            <Package className="w-24 h-24 mx-auto text-muted-foreground mb-6" />
            <h2 className="text-3xl font-bold mb-4">Ingen aktive ordrer</h2>
            <p className="text-xl text-muted-foreground mb-6">
              Venter på pakkeliste fra admin...
            </p>
            <div className="text-lg font-mono">
              {currentTime.toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header with Time and Progress */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Lynx Lager</h1>
            <p className="text-xl text-muted-foreground">Plukliste visning</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-mono font-bold">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="text-lg text-muted-foreground">
              {currentTime.toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Current Order Info */}
        <Card className="shadow-card border-2 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary-glow/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Package className="w-8 h-8 text-primary" />
                  {currentOrder.title}
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  Ordre-ID: {currentOrder.id}
                </p>
              </div>
              <Badge variant="default" className="text-lg px-4 py-2">
                <Clock className="w-4 h-4 mr-2" />
                Aktiv
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold">Fremdrift</span>
                <span className="text-lg font-mono">
                  {foundItems}/{totalItems} varer
                </span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Items List */}
        <div className="grid gap-4">
          {currentOrder.items.map((item, index) => (
            <Card 
              key={item.id} 
              className={`shadow-card transition-all duration-300 animate-fade-in ${
                item.found 
                  ? 'border-success bg-success/5' 
                  : 'border-2 border-primary/30 hover:border-primary/50'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <Button
                      variant={item.found ? "success" : "outline"}
                      size="icon"
                      onClick={() => toggleItemFound(item.id)}
                      className="w-12 h-12 text-lg"
                    >
                      {item.found ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </Button>
                    
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{item.name}</h3>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span className="font-mono text-lg">{item.location}</span>
                        </div>
                        <div className="text-lg">
                          Antal: <span className="font-bold">{item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {item.found ? (
                      <Badge variant="default" className="text-lg px-4 py-2">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Fundet
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-lg px-4 py-2">
                        <Circle className="w-4 h-4 mr-2" />
                        Afventer
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Complete Order Button */}
        {progress === 100 && (
          <Card className="shadow-glow animate-pulse-glow cursor-pointer" onClick={markOrderComplete}>
            <CardContent className="p-6 text-center">
              <div className="w-full">
                <Button variant="wall" size="wall" className="animate-fade-in w-full" tabIndex={-1} type="button" onClick={e => e.preventDefault()}>
                  <CheckCircle className="w-8 h-8 mr-4" />
                  Ordre fuldført - alle varer fundet!
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lageroversigt */}
        <h2 className="text-2xl font-bold mb-4">Lageroversigt</h2>
        <div className="grid gap-4">
          {storageItems.map((item) => (
            <Card key={item.id} className="shadow-card">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-1">{item.name}</h3>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span className="font-mono text-lg">{item.location}</span>
                    </div>
                    <div className="text-lg">
                      Antal: <span className="font-bold">{item.quantity}</span>
                    </div>
                  </div>
                </div>
                <div>
                  {getFoundStatus(item) ? (
                    <Badge variant="default" className="text-lg px-4 py-2">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Fundet
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      <Circle className="w-4 h-4 mr-2" />
                      Ikke fundet
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Storage;