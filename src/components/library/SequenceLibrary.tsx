import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Grid3X3, 
  List, 
  Play, 
  Clock, 
  Layers,
  Film,
  Heart,
  MoreHorizontal,
  Plus
} from "lucide-react";
import { BunnyMascot } from "@/components/BunnyMascot";
import { EmptyState } from "@/components/EmptyState";
import { Asset, Sequence } from "@/types/assets";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface SequenceLibraryProps {
  sequences: Sequence[];
  assets: Asset[];
  onSequenceSelect?: (sequence: Sequence) => void;
  onCreateSequence?: () => void;
}

export const SequenceLibrary = ({ 
  sequences, 
  assets, 
  onSequenceSelect,
  onCreateSequence 
}: SequenceLibraryProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState<"all" | "favorites">("all");

  // Filter to animation-ready assets (those with frameCount)
  const animationAssets = assets.filter(asset => 
    asset.frameCount && asset.frameCount > 1
  );

  const filteredSequences = sequences.filter(seq => {
    const matchesSearch = seq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filter === "all" || seq.favorite;
    return matchesSearch && matchesFilter;
  });

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const handlePlay = (sequence: Sequence) => {
    toast.info(`Playing "${sequence.name}"... 🎬`);
  };

  const handleDelete = (sequence: Sequence) => {
    toast.success(`Deleted "${sequence.name}" 🗑️`);
  };

  const handleDuplicate = (sequence: Sequence) => {
    toast.success(`Duplicated "${sequence.name}" ✨`);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Sequence Library</h2>
          <Badge variant="secondary" className="rounded-full">
            {filteredSequences.length}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            onClick={onCreateSequence}
            className="bg-gradient-primary hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-1" />
            New Sequence
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search sequences..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="h-9">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="favorites" className="text-xs">
              <Heart className="w-3 h-3 mr-1" />
              Favorites
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex border rounded-lg">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9 rounded-r-none"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9 rounded-l-none"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Animation-Ready Assets Section */}
      {animationAssets.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Animation-Ready Assets ({animationAssets.length})
          </h3>
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              {animationAssets.map((asset) => (
                <Card 
                  key={asset.id}
                  className="flex-shrink-0 w-24 p-2 hover:border-primary/50 cursor-pointer transition-colors group"
                >
                  <div className="aspect-square rounded-lg bg-muted mb-1.5 overflow-hidden relative">
                    <img 
                      src={asset.thumbnailUrl} 
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-6 h-6 text-primary" />
                    </div>
                    <Badge className="absolute bottom-1 right-1 text-[10px] px-1.5 py-0">
                      {asset.frameCount} frames
                    </Badge>
                  </div>
                  <p className="text-xs truncate">{asset.name}</p>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Sequences List */}
      <ScrollArea className="flex-1">
        {filteredSequences.length === 0 ? (
          <EmptyState
            title="No sequences yet!"
            description="Create your first animation sequence and bring your characters to life!"
            actionLabel="Create Sequence"
            onAction={onCreateSequence}
          />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredSequences.map((sequence) => (
              <Card 
                key={sequence.id}
                className="p-3 hover:border-primary/50 cursor-pointer transition-all hover:shadow-soft group"
                onClick={() => onSequenceSelect?.(sequence)}
              >
                <div className="aspect-video rounded-lg bg-gradient-soft mb-2 flex items-center justify-center relative overflow-hidden">
                  <Film className="w-8 h-8 text-muted-foreground" />
                  <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="icon" variant="secondary" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handlePlay(sequence); }}>
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                  {sequence.favorite && (
                    <Heart className="absolute top-2 right-2 w-4 h-4 fill-pink-400 text-pink-400" />
                  )}
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm truncate">{sequence.name}</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDuplicate(sequence)}>
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(sequence)} className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {sequence.frames.length} frames
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(sequence.duration)}
                    </span>
                  </div>
                  
                  {sequence.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {sequence.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                          {tag}
                        </Badge>
                      ))}
                      {sequence.tags.length > 2 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          +{sequence.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSequences.map((sequence) => (
              <Card 
                key={sequence.id}
                className="p-3 hover:border-primary/50 cursor-pointer transition-all flex items-center gap-4 group"
                onClick={() => onSequenceSelect?.(sequence)}
              >
                <div className="w-16 h-12 rounded-lg bg-gradient-soft flex items-center justify-center flex-shrink-0">
                  <Film className="w-5 h-5 text-muted-foreground" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{sequence.name}</p>
                    {sequence.favorite && (
                      <Heart className="w-3 h-3 fill-pink-400 text-pink-400 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {sequence.frames.length} frames
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(sequence.duration)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handlePlay(sequence); }}>
                    <Play className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDuplicate(sequence)}>
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(sequence)} className="text-destructive">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
