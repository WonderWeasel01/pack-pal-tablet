import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Settings, Monitor, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Package className="w-16 h-16 text-primary mr-4" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Wentzel Storage
            </h1>
          </div>
          <p className="text-2xl text-muted-foreground max-w-2xl mx-auto">
            Professionelt lagerstyringssystem til vægmonterede skærme
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="shadow-card hover:shadow-glow transition-all duration-300 group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Settings className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Admin Panel</CardTitle>
              <CardDescription className="text-lg">
                Opret pakkelister, administrer skabeloner og styr systemet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin">
                <Button variant="industrial" size="lg" className="w-full">
                  Åbn Admin Panel
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              
            
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-glow transition-all duration-300 group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                <Monitor className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-2xl">Lagerdisplay</CardTitle>
              <CardDescription className="text-lg">
                Vægmonteret interface til lagerpersonale for at se pluklister
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/storage">
                <Button variant="wall" size="lg" className="w-full bg-accent hover:bg-accent/90">
                  Åbn lagervisning
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              
       
            </CardContent>
          </Card>
        </div>

        {/* System Info */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-card rounded-full shadow-card">
            <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
            <span className="text-muted-foreground">System online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
