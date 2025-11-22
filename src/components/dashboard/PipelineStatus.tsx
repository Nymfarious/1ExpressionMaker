import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { usePipelineJobs, useAssetPacks } from "@/hooks/useAssetPacks";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const stageLabels = {
  decomposition: "Image Decomposition",
  expression_generation: "Expression Generation",
  export_preparation: "Export Preparation",
};

export const PipelineStatus = () => {
  const { data: assetPacks } = useAssetPacks();
  const { data: allJobs, isLoading } = usePipelineJobs();
  const queryClient = useQueryClient();

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('pipeline-jobs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pipeline_jobs'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['pipeline-jobs'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

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
        {jobsWithNames.map((job) => {
          const allStages = ['decomposition', 'expression_generation', 'export_preparation'];
          const currentStageIndex = allStages.indexOf(job.stage);
          
          return (
            <Card key={job.id} className="p-6 shadow-card animate-fade-in">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                      job.status === "completed"
                        ? "bg-green-100 dark:bg-green-900/30"
                        : job.status === "failed"
                        ? "bg-red-100 dark:bg-red-900/30"
                        : "bg-gradient-primary shadow-glow"
                    }`}
                  >
                    {job.status === "completed" ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : job.status === "failed" ? (
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    ) : (
                      <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{job.assetPackName}</h4>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {stageLabels[job.stage]}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={job.status === "completed" ? "default" : "secondary"}
                  className={`transition-all ${
                    job.status === "completed"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : job.status === "failed"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "animate-pulse"
                  }`}
                >
                  {job.status}
                </Badge>
              </div>

              {/* Pipeline Timeline */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  {allStages.map((stage, index) => (
                    <div key={stage} className="flex-1 flex items-center">
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            index < currentStageIndex
                              ? "bg-green-100 dark:bg-green-900/30"
                              : index === currentStageIndex
                              ? job.status === "failed"
                                ? "bg-red-100 dark:bg-red-900/30"
                                : "bg-gradient-primary shadow-glow"
                              : "bg-muted"
                          }`}
                        >
                          {index < currentStageIndex ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                          ) : index === currentStageIndex ? (
                            job.status === "failed" ? (
                              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                            ) : (
                              <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
                            )
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          {stageLabels[stage]}
                        </p>
                      </div>
                      {index < allStages.length - 1 && (
                        <div className="flex-1 h-0.5 bg-muted mx-2 relative">
                          <div
                            className={`absolute inset-0 bg-gradient-primary transition-all ${
                              index < currentStageIndex ? "w-full" : "w-0"
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-medium">{job.progress}%</span>
                </div>
                <Progress value={job.progress} className="h-2" />
              </div>

              {/* Timestamps */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Started: {job.started_at ? new Date(job.started_at).toLocaleTimeString() : "Not started"}</span>
                </div>
                {job.completed_at && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Completed: {new Date(job.completed_at).toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
              
              {job.error_message && (
                <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30">
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{job.error_message}</span>
                  </p>
                </div>
              )}
            </Card>
          );
        })}

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
