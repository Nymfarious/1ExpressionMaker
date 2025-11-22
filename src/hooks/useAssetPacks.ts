import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AssetPack {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  original_image_url: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  total_layers: number;
  total_expressions: number;
  created_at: string;
  updated_at: string;
}

export interface PipelineJob {
  id: string;
  asset_pack_id: string;
  stage: "decomposition" | "expression_generation" | "export_preparation";
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  error_message: string | null;
  metadata: Record<string, any>;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useAssetPacks = () => {
  return useQuery({
    queryKey: ["asset-packs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("asset_packs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AssetPack[];
    },
  });
};

export const usePipelineJobs = (assetPackId?: string) => {
  return useQuery({
    queryKey: ["pipeline-jobs", assetPackId],
    queryFn: async () => {
      let query = supabase
        .from("pipeline_jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (assetPackId) {
        query = query.eq("asset_pack_id", assetPackId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PipelineJob[];
    },
    enabled: !!assetPackId,
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
      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("You must be logged in to upload assets");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name);
      if (description) formData.append("description", description);

      const { data, error } = await supabase.functions.invoke("upload-asset", {
        body: formData,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["asset-packs"] });
      toast.success("Asset uploaded successfully! AI pipeline started.");
    },
    onError: (error: Error) => {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload asset");
    },
  });
};
