import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Sparkles, FolderOpen, Settings, Package, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssetLibrary } from "@/components/dashboard/AssetLibrary";
import { UploadZone } from "@/components/dashboard/UploadZone";
import { PipelineStatus } from "@/components/dashboard/PipelineStatus";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("library");

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-accent flex items-center justify-center">
        <Card className="p-8">
          <p className="text-muted-foreground">Loading...</p>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-accent">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Nano Banana PRO
                </h1>
                <p className="text-xs text-muted-foreground">Creator Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-muted-foreground">
            Manage your VTuber assets and monitor AI pipeline processing
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card shadow-card">
            <TabsTrigger value="library" className="gap-2">
              <FolderOpen className="w-4 h-4" />
              Asset Library
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Pipeline Status
            </TabsTrigger>
            <TabsTrigger value="publish" className="gap-2">
              <Package className="w-4 h-4" />
              Publish
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library">
            <AssetLibrary />
          </TabsContent>

          <TabsContent value="upload">
            <UploadZone />
          </TabsContent>

          <TabsContent value="pipeline">
            <PipelineStatus />
          </TabsContent>

          <TabsContent value="publish">
            <Card className="p-12 text-center shadow-card">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Marketplace Integration</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                Shopify integration is currently disabled. Enable it in Settings → Tools to publish
                your asset packs to the marketplace.
              </p>
              <Button variant="outline">Configure Marketplace</Button>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
