import { useState, useCallback, useRef } from "react";
import {
  Upload,
  Grid3X3,
  List,
  Search,
  Plus,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/EmptyState";
import { useAssetLibrary } from "@/hooks/useAssetLibrary";
import { AssetCategory } from "@/types/assets";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AssetCard } from "./AssetCard";
import { AssetListItem } from "./AssetListItem";
import { categoryConfig } from "./assetCategoryConfig";

export const AssetLibraryNew = () => {
  const {
    assets,
    tags,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    deleteAsset,
    duplicateAsset,
    toggleFavorite,
    moveToCategory,
    addAsset,
  } = useAssetLibrary();

  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFiles = (files: File[]) => {
    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        addAsset({
          name: file.name.replace(/\.[^/.]+$/, ""),
          category: "custom",
          thumbnailUrl: url,
          fileUrl: url,
          tags: [],
          favorite: false,
        });
      }
    });
    toast.success(`Imported ${files.length} file(s)! 🐰`);
  };

  const handleImportFromUrl = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      addAsset({
        name: "Imported Asset",
        category: "custom",
        thumbnailUrl: url,
        fileUrl: url,
        tags: [],
        favorite: false,
      });
      toast.success("Imported from URL! 🐰");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-none"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2 hover-bounce">
                <Plus className="w-4 h-4" />
                Import
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleImportFromUrl}>
                <LinkIcon className="w-4 h-4 mr-2" />
                Import from URL
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFiles(Array.from(e.target.files || []))}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as AssetCategory | "all")}>
        <TabsList className="bg-card shadow-soft">
          <TabsTrigger value="all" className="gap-2">
            📁 All
          </TabsTrigger>
          {Object.entries(categoryConfig).map(([key, config]) => (
            <TabsTrigger key={key} value={key} className="gap-2">
              {config.icon} {config.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Drop Zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-2xl p-8 text-center transition-all",
          dragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary/50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-soft">
            <Upload className="w-6 h-6 text-primary-foreground" />
          </div>
          <p className="font-medium">Drop files here to import</p>
          <p className="text-sm text-muted-foreground">or use the Import button above</p>
        </div>
      </div>

      {/* Asset Grid/List */}
      {assets.length === 0 ? (
        <EmptyState
          title="No assets yet!"
          description="Let's add some cute assets to your library! Drop files above or use the Import button."
          actionLabel="Import Assets"
          onAction={() => fileInputRef.current?.click()}
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {assets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onDelete={() => deleteAsset(asset.id)}
              onDuplicate={() => duplicateAsset(asset.id)}
              onToggleFavorite={() => toggleFavorite(asset.id)}
              onMoveToCategory={(category) => moveToCategory(asset.id, category)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {assets.map((asset) => (
            <AssetListItem
              key={asset.id}
              asset={asset}
              onDelete={() => deleteAsset(asset.id)}
              onDuplicate={() => duplicateAsset(asset.id)}
              onToggleFavorite={() => toggleFavorite(asset.id)}
              onMoveToCategory={(category) => moveToCategory(asset.id, category)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
