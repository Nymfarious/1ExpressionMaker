import { Heart, MoreVertical, Edit, Trash2, Copy, Download, FolderInput } from "lucide-react";
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
import { AssetItemProps } from "./AssetCard";

export const AssetListItem = ({ asset, onDelete, onDuplicate, onToggleFavorite, onMoveToCategory }: AssetItemProps) => {
  const config = categoryConfig[asset.category];
  
  return (
    <Card className="flex items-center gap-4 p-3 hover:shadow-soft transition-shadow">
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
        <img src={asset.thumbnailUrl} alt={asset.name} className="w-full h-full object-cover" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium truncate">{asset.name}</h4>
          {asset.favorite && <Heart className="w-4 h-4 fill-pink text-pink shrink-0" />}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-xs">
            {config.icon} {config.label}
          </Badge>
          {asset.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="ghost" size="icon" onClick={onToggleFavorite}>
          <Heart className={cn("w-4 h-4", asset.favorite && "fill-pink text-pink")} />
        </Button>
        <Button variant="ghost" size="icon">
          <Download className="w-4 h-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
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
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <FolderInput className="w-4 h-4 mr-2" />
                Move to
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {Object.entries(categoryConfig).map(([key, cfg]) => (
                  <DropdownMenuItem key={key} onClick={() => onMoveToCategory(key as AssetCategory)}>
                    {cfg.icon} {cfg.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};
