import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface DemoAssetPack {
  id: string;
  name: string;
  description: string | null;
  original_image_url: string;
  thumbnail_url: string;
  status: string;
  created_at: string;
  total_layers: number;
  total_expressions: number;
}

interface DemoPipelineJob {
  id: string;
  asset_pack_id: string;
  stage: string;
  status: string;
  progress: number;
  created_at: string;
}

// Store demo data in memory (will reset on page refresh)
let demoAssetPacks: DemoAssetPack[] = [];
let demoPipelineJobs: DemoPipelineJob[] = [];

export const getDemoAssetPacks = () => demoAssetPacks;
export const getDemoPipelineJobs = () => demoPipelineJobs;

export const useDemoUpload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      name,
      description,
      previewUrl,
    }: {
      file: File;
      name: string;
      description?: string;
      previewUrl: string;
    }) => {
      // Create a demo asset pack
      const assetPackId = `demo-${Date.now()}`;
      const newAssetPack: DemoAssetPack = {
        id: assetPackId,
        name,
        description: description || null,
        original_image_url: previewUrl,
        thumbnail_url: previewUrl,
        status: "processing",
        created_at: new Date().toISOString(),
        total_layers: 0,
        total_expressions: 0,
      };

      demoAssetPacks = [newAssetPack, ...demoAssetPacks];

      // Create demo pipeline jobs
      const stages = ["decomposition", "expression_generation", "export_preparation"];
      
      for (const stage of stages) {
        const job: DemoPipelineJob = {
          id: `job-${Date.now()}-${stage}`,
          asset_pack_id: assetPackId,
          stage,
          status: "pending",
          progress: 0,
          created_at: new Date().toISOString(),
        };
        demoPipelineJobs = [...demoPipelineJobs, job];
      }

      // Simulate pipeline progress
      await simulatePipeline(assetPackId, queryClient);

      return newAssetPack;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["asset-packs"] });
      queryClient.invalidateQueries({ queryKey: ["pipeline-jobs"] });
      toast.success("Demo pipeline started! Watch the Pipeline Status tab.");
    },
    onError: (error) => {
      console.error("Demo upload error:", error);
      toast.error("Failed to start demo pipeline");
    },
  });
};

async function simulatePipeline(assetPackId: string, queryClient: any) {
  const stages = ["decomposition", "expression_generation", "export_preparation"];
  
  for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
    const stage = stages[stageIndex];
    
    // Find and update the job for this stage
    const jobIndex = demoPipelineJobs.findIndex(
      (j) => j.asset_pack_id === assetPackId && j.stage === stage
    );
    
    if (jobIndex === -1) continue;

    // Start processing
    demoPipelineJobs[jobIndex] = {
      ...demoPipelineJobs[jobIndex],
      status: "processing",
      progress: 0,
    };
    queryClient.invalidateQueries({ queryKey: ["pipeline-jobs"] });

    // Simulate progress
    for (let progress = 0; progress <= 100; progress += 20) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      demoPipelineJobs[jobIndex] = {
        ...demoPipelineJobs[jobIndex],
        progress,
      };
      queryClient.invalidateQueries({ queryKey: ["pipeline-jobs"] });
    }

    // Complete the stage
    demoPipelineJobs[jobIndex] = {
      ...demoPipelineJobs[jobIndex],
      status: "completed",
      progress: 100,
    };
    queryClient.invalidateQueries({ queryKey: ["pipeline-jobs"] });

    // Small delay between stages
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  // Update asset pack to completed
  const packIndex = demoAssetPacks.findIndex((p) => p.id === assetPackId);
  if (packIndex !== -1) {
    demoAssetPacks[packIndex] = {
      ...demoAssetPacks[packIndex],
      status: "completed",
      total_layers: 8,
      total_expressions: 21,
    };
    queryClient.invalidateQueries({ queryKey: ["asset-packs"] });
  }

  toast.success("Demo pipeline completed!");
}
