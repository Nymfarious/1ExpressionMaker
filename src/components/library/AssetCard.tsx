import { Heart, MoreVertical, Edit, Trash2, Copy, Download, FolderInput, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Asset, AssetCategory } from "@/types/assets";
import { cn } from "@/lib/utils";
import { categoryConfig } from "./assetCategoryConfig";

export interface AssetItemProps {
  asset: Asset;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleFavorite: () => void;
  onMoveToCategory: (category: AssetCategory) => void;
}

export const AssetCard = ({ asset, onDelete, onDuplicate, onToggleFavorite, onMoveToCategory }: AssetItemProps) => {
  const config = categoryConfig[asset.category];
  
  return (
    <Card className="group overflow-hidden hover-bounce shadow-card hover:shadow-elevated">
      <div className="aspect-square relative overflow-hidden bg-muted">
        <img
          src={asset.thumbnailUrl}
          alt={asset.name}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Quick Actions Overlay */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="secondary"
            className="w-8 h-8 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
          >
            <Heart className={cn("w-4 h-4", asset.favorite && "fill-pink text-pink")} />
          </Button>
        </div>

        {/* Category Badge */}
        <div className="absolute bottom-2 left-2">
          <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm text-xs">
            {config.icon} {config.label}
          </Badge>
        </div>

        {/* Frame count for sequences */}
        {asset.frameCount && (
          <div className="absolute bottom-2 right-2">
            <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm text-xs">
              {asset.frameCount} frames
            </Badge>
          </div>
        )}
      </div>
      
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm truncate flex-1">{asset.name}</h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-6 h-6 shrink-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="w-4 h-4 mr-2" />
                Export
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <FolderInput className="w-4 h-4 mr-2" />
                  Move to
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <DropdownMenuItem key={key} onClick={() => onMoveToCategory(key as AssetCategory)}>
                      {config.icon} {config.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onToggleFavorite}>
                <Star className="w-4 h-4 mr-2" />
                {asset.favorite ? "Remove from Favorites" : "Add to Favorites"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {asset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {asset.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
                {tag}
              </Badge>
            ))}
            {asset.tags.length > 2 && (
              <Badge variant="outline" className="text-xs px-1.5 py-0">
                +{asset.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
