import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Download, Edit, Trash2 } from "lucide-react";
import { useAssetPacks } from "@/hooks/useAssetPacks";

export const AssetLibrary = () => {
  const { data: assetPacks, isLoading } = useAssetPacks();

  if (isLoading) {
    return (
      <Card className="p-12 text-center shadow-card">
        <p className="text-muted-foreground">Loading your assets...</p>
      </Card>
    );
  }

  const assets = assetPacks || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Your Assets</h3>
          <p className="text-sm text-muted-foreground">
            {assets.length} asset pack{assets.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map((asset) => (
          <Card key={asset.id} className="overflow-hidden shadow-card hover:shadow-elevated transition-all">
            <div className="aspect-square relative overflow-hidden bg-muted">
              <img
                src={asset.thumbnail_url || "/placeholder.svg"}
                alt={asset.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge
                  variant={asset.status === "completed" ? "default" : "secondary"}
                  className="bg-card/90 backdrop-blur-sm"
                >
                  {asset.status}
                </Badge>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <h4 className="font-semibold mb-1">{asset.name}</h4>
                <div className="flex gap-3 text-sm text-muted-foreground">
                  <span>{asset.total_layers} layers</span>
                  <span>•</span>
                  <span>{asset.total_expressions} expressions</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {assets.length === 0 && (
        <Card className="p-12 text-center shadow-card">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-gradient-primary mx-auto mb-4 flex items-center justify-center shadow-glow">
              <Download className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No assets yet</h3>
            <p className="text-muted-foreground mb-4">
              Upload your first character image to get started with the AI pipeline
            </p>
            <Button>Upload Character Image</Button>
          </div>
        </Card>
      )}
    </div>
  );
};
