import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Package, MapPin, CheckCircle, Circle, Clock } from "lucide-react";

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
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Simulate getting active order (in real app, this would come from a backend/state management)
  useEffect(() => {
    // Mock active order for demonstration
    const mockOrder: Order = {
      id: '1',
      title: 'Electronics Kit Assembly',
      status: 'active',
      createdAt: new Date(),
      items: [
        { id: '1', name: 'Arduino Uno R3', location: 'A1-B2', quantity: 1, found: false },
        { id: '2', name: 'Breadboard Large', location: 'A1-C3', quantity: 2, found: false },
        { id: '3', name: 'Jumper Wires (M-M)', location: 'A2-A1', quantity: 1, found: true },
        { id: '4', name: 'LED Pack (Red)', location: 'A3-B1', quantity: 1, found: false },
        { id: '5', name: 'Resistor Kit', location: 'A3-B2', quantity: 1, found: true },
      ]
    };
    
    setCurrentOrder(mockOrder);
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

  const foundItems = currentOrder?.items.filter(item => item.found).length || 0;
  const totalItems = currentOrder?.items.length || 0;
  const progress = totalItems > 0 ? (foundItems / totalItems) * 100 : 0;

  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <Card className="w-full max-w-2xl text-center shadow-glow">
          <CardContent className="p-12">
            <Package className="w-24 h-24 mx-auto text-muted-foreground mb-6" />
            <h2 className="text-3xl font-bold mb-4">No Active Orders</h2>
            <p className="text-xl text-muted-foreground mb-6">
              Waiting for packaging orders from admin...
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
            <h1 className="text-4xl font-bold text-foreground">Lynx Storage</h1>
            <p className="text-xl text-muted-foreground">Pick List Display</p>
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
                  Order ID: {currentOrder.id}
                </p>
              </div>
              <Badge variant="default" className="text-lg px-4 py-2">
                <Clock className="w-4 h-4 mr-2" />
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold">Progress</span>
                <span className="text-lg font-mono">
                  {foundItems}/{totalItems} items
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
                          Qty: <span className="font-bold">{item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {item.found ? (
                      <Badge variant="default" className="text-lg px-4 py-2">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Found
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-lg px-4 py-2">
                        <Circle className="w-4 h-4 mr-2" />
                        Pending
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
          <Card className="shadow-glow animate-pulse-glow">
            <CardContent className="p-6 text-center">
              <Button variant="wall" size="wall" className="animate-fade-in">
                <CheckCircle className="w-8 h-8 mr-4" />
                Order Complete - All Items Found!
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Storage;