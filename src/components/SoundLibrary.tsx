import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Volume2, 
  VolumeX, 
  Play,
  Music,
  Bell,
  CheckCircle,
  XCircle,
  MousePointer,
  Sparkles
} from "lucide-react";
import { useSounds } from "@/hooks/useSoundEffects";
import { BunnyMascot } from "./BunnyMascot";

const soundOptions = [
  { id: "success", label: "Success", icon: CheckCircle, description: "When actions complete" },
  { id: "click", label: "Click", icon: MousePointer, description: "Button clicks" },
  { id: "pop", label: "Pop", icon: Sparkles, description: "Bubble pop effect" },
  { id: "notification", label: "Notification", icon: Bell, description: "Alert chime" },
  { id: "complete", label: "Complete", icon: Music, description: "Task finished" },
  { id: "error", label: "Error", icon: XCircle, description: "Something went wrong" },
] as const;

export const SoundLibrary = () => {
  const { enabled, setEnabled, playSound } = useSounds();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {enabled ? (
            <Volume2 className="w-6 h-6 text-primary" />
          ) : (
            <VolumeX className="w-6 h-6 text-muted-foreground" />
          )}
          <div>
            <h2 className="font-semibold text-lg">Sound & Music Library</h2>
            <p className="text-sm text-muted-foreground">
              Cute sounds for a playful experience
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Label htmlFor="sound-toggle" className="text-sm">
            {enabled ? "Sounds On" : "Sounds Off"}
          </Label>
          <Switch
            id="sound-toggle"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>
      </div>

      {/* Sound Effects Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {soundOptions.map((sound) => {
          const Icon = sound.icon;
          return (
            <Card
              key={sound.id}
              className={`p-4 transition-all cursor-pointer hover:border-primary/50 ${
                !enabled ? "opacity-50" : ""
              }`}
              onClick={() => enabled && playSound(sound.id as Parameters<typeof playSound>[0])}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-soft flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{sound.label}</p>
                  <p className="text-xs text-muted-foreground">{sound.description}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 flex-shrink-0"
                  disabled={!enabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    playSound(sound.id as Parameters<typeof playSound>[0]);
                  }}
                >
                  <Play className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Info Card */}
      <Card className="p-4 bg-gradient-soft border-primary/20">
        <div className="flex items-center gap-4">
          <BunnyMascot size="sm" />
          <div>
            <p className="text-sm font-medium">
              {enabled 
                ? "Sounds are enabled! Click any sound to preview 🎵" 
                : "Enable sounds for a more playful experience!"
              }
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Sounds play when you complete actions, upload assets, and more
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
