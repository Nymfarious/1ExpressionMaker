import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, Sparkles, Loader2 } from "lucide-react";
import { usePipelineJobs, useAssetPacks } from "@/hooks/useAssetPacks";

const stageLabels = {
  decomposition: "Image Decomposition",
  expression_generation: "Expression Generation",
  export_preparation: "Export Preparation",
};

export const PipelineStatus = () => {
  const { data: assetPacks } = useAssetPacks();
  const { data: allJobs, isLoading } = usePipelineJobs();

  if (isLoading) {
    return (
      <Card className="p-12 text-center shadow-card">
        <p className="text-muted-foreground">Loading pipeline jobs...</p>
      </Card>
    );
  }

  // Get asset pack names for jobs
  const jobsWithNames = (allJobs || []).map((job) => {
    const assetPack = assetPacks?.find((ap) => ap.id === job.asset_pack_id);
    return {
      ...job,
      assetPackName: assetPack?.name || "Unknown Asset",
    };
  });

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Pipeline Jobs</h3>
        <p className="text-sm text-muted-foreground">
          Monitor AI processing status and progress
        </p>
      </div>

      <div className="space-y-4">
        {jobsWithNames.map((job) => (
          <Card key={job.id} className="p-6 shadow-card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    job.status === "completed"
                      ? "bg-green-100 dark:bg-green-900/30"
                      : job.status === "failed"
                      ? "bg-red-100 dark:bg-red-900/30"
                      : "bg-gradient-primary shadow-glow"
                  }`}
                >
                  {job.status === "completed" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold">{job.assetPackName}</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {stageLabels[job.stage]}
                  </p>
                </div>
              </div>
              <Badge
                variant={job.status === "completed" ? "default" : "secondary"}
                className={
                  job.status === "completed"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : ""
                }
              >
                {job.status}
              </Badge>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{job.progress}%</span>
              </div>
              <Progress value={job.progress} className="h-2" />
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Started: {job.started_at ? new Date(job.started_at).toLocaleString() : "Not started"}</span>
              </div>
              {job.completed_at && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Completed: {new Date(job.completed_at).toLocaleString()}</span>
                </div>
              )}
            </div>
            {job.error_message && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                Error: {job.error_message}
              </p>
            )}
          </Card>
        ))}

        {jobsWithNames.length === 0 && (
          <Card className="p-12 text-center shadow-card">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-gradient-primary mx-auto mb-4 flex items-center justify-center shadow-glow">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No active pipeline jobs</h3>
              <p className="text-muted-foreground">
                Upload a character image to start processing
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
