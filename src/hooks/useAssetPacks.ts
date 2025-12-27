import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getDemoAssetPacks, getDemoPipelineJobs } from "./useDemoUpload";

export interface AssetPack {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  original_image_url: string | null;
  status: string;
  total_layers: number | null;
  total_expressions: number | null;
  created_at: string;
  updated_at: string;
}

export interface PipelineJob {
  id: string;
  asset_pack_id: string;
  stage: string;
  status: string;
  progress: number | null;
  error_message: string | null;
  metadata?: Record<string, any>;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useAssetPacks = () => {
  return useQuery({
    queryKey: ["asset-packs"],
    queryFn: async () => {
      // Get demo packs
      const demoPacks = getDemoAssetPacks();
      
      // Try to get real packs from Supabase
      const { data, error } = await supabase
        .from("asset_packs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.log("Using demo packs only:", error.message);
        return demoPacks as unknown as AssetPack[];
      }

      // Combine demo and real packs
      return [...demoPacks, ...(data || [])] as unknown as AssetPack[];
    },
  });
};

export const usePipelineJobs = (assetPackId?: string) => {
  return useQuery({
    queryKey: ["pipeline-jobs", assetPackId],
    queryFn: async () => {
      // Get demo jobs
      const demoJobs = getDemoPipelineJobs();
      const filteredDemoJobs = assetPackId 
        ? demoJobs.filter(j => j.asset_pack_id === assetPackId)
        : demoJobs;

      // Try to get real jobs from Supabase
      let query = supabase.from("pipeline_jobs").select("*");
      if (assetPackId) {
        query = query.eq("asset_pack_id", assetPackId);
      }
      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.log("Using demo jobs only:", error.message);
        return filteredDemoJobs as unknown as PipelineJob[];
      }

      // Combine demo and real jobs
      return [...filteredDemoJobs, ...(data || [])] as unknown as PipelineJob[];
    },
  });
};

export const useUploadAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      name,
      description,
    }: {
      file: File;
      name: string;
      description?: string;
    }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name);
      if (description) {
        formData.append("description", description);
      }

      const { data, error } = await supabase.functions.invoke("upload-asset", {
        body: formData,
      });

      if (error) {
        console.error("Upload error:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["asset-packs"] });
      toast.success("Asset uploaded! AI pipeline started.");
    },
    onError: (error) => {
      console.error("Upload error:", error);
      toast.error("Failed to upload asset. Please try again.");
    },
  });
};
