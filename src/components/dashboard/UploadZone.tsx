import { useState, useCallback } from "react";
import { Upload, Image as ImageIcon, Sparkles, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useDemoUpload } from "@/hooks/useDemoUpload";

export const UploadZone = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [assetName, setAssetName] = useState("");
  const [description, setDescription] = useState("");

  const demoUploadMutation = useDemoUpload();

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

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    toast.success("Image loaded successfully");
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }
    if (!assetName) {
      toast.error("Please provide an asset name");
      return;
    }

    await demoUploadMutation.mutateAsync({
      file: selectedFile,
      name: assetName,
      description,
      previewUrl: preview || "",
    });

    // Reset form
    setSelectedFile(null);
    setPreview(null);
    setAssetName("");
    setDescription("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Upload Area */}
      <Card className="p-6 shadow-card">
        <h3 className="text-lg font-semibold mb-4">Upload Character Image</h3>
        
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Demo mode: AI processing is simulated. No actual image processing occurs.
          </AlertDescription>
        </Alert>
        
        <div
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept="image/*"
            onChange={handleChange}
          />
          
          {preview ? (
            <div className="space-y-4">
              <img
                src={preview}
                alt="Preview"
                className="max-h-64 mx-auto rounded-lg shadow-card"
              />
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedFile(null);
                  setPreview(null);
                }}
              >
                Change Image
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-primary mx-auto flex items-center justify-center shadow-glow">
                <ImageIcon className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <p className="text-lg font-medium mb-1">
                  Drag and drop your character image
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse your files
                </p>
              </div>
              <Button asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Select Image
                </label>
              </Button>
            </div>
          )}
        </div>

        {preview && (
          <div className="mt-6 space-y-4">
            <div>
              <Label htmlFor="asset-name">Asset Pack Name</Label>
              <Input
                id="asset-name"
                placeholder="e.g., Purple Cat Girl VTuber Pack"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe your character..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1.5"
                rows={3}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Info Panel */}
      <Card className="p-6 shadow-card bg-gradient-accent">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow shrink-0">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Demo Pipeline Process</h3>
            <p className="text-sm text-muted-foreground">
              What happens after you upload (simulated)
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-semibold text-primary">
              1
            </div>
            <div>
              <h4 className="font-medium mb-1">Image Decomposition</h4>
              <p className="text-sm text-muted-foreground">
                Separate layers: head, ears, eyes, eyebrows, nose, mouth, body, accessories
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-semibold text-primary">
              2
            </div>
            <div>
              <h4 className="font-medium mb-1">Expression Generation</h4>
              <p className="text-sm text-muted-foreground">
                Create mouth phonemes, eye directions, eyebrow emotions, head rotations
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-semibold text-primary">
              3
            </div>
            <div>
              <h4 className="font-medium mb-1">Export Preparation</h4>
              <p className="text-sm text-muted-foreground">
                Organize layers, create transparency maps, generate setup guide
              </p>
            </div>
          </div>
        </div>

        {preview && (
          <Button
            className="w-full mt-6 bg-gradient-primary hover:shadow-glow transition-all"
            onClick={handleSubmit}
            disabled={demoUploadMutation.isPending}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {demoUploadMutation.isPending ? "Processing Demo..." : "Start Demo Pipeline"}
          </Button>
        )}
      </Card>
    </div>
  );
};
