-- Enable storage for asset files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'assets',
  'assets',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policy for asset uploads
CREATE POLICY "Allow public read access to assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'assets');

CREATE POLICY "Allow authenticated users to upload assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'assets' AND auth.role() = 'authenticated');

CREATE POLICY "Allow users to delete their own assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'assets' AND auth.role() = 'authenticated');

-- Create asset_packs table to store VTuber asset information
CREATE TABLE IF NOT EXISTS public.asset_packs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  original_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  total_layers INTEGER DEFAULT 0,
  total_expressions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.asset_packs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for asset_packs
CREATE POLICY "Users can view their own asset packs"
ON public.asset_packs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own asset packs"
ON public.asset_packs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own asset packs"
ON public.asset_packs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own asset packs"
ON public.asset_packs FOR DELETE
USING (auth.uid() = user_id);

-- Create pipeline_jobs table to track AI processing
CREATE TABLE IF NOT EXISTS public.pipeline_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_pack_id UUID NOT NULL REFERENCES public.asset_packs(id) ON DELETE CASCADE,
  stage TEXT NOT NULL CHECK (stage IN ('decomposition', 'expression_generation', 'export_preparation')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pipeline_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pipeline_jobs (via asset_pack ownership)
CREATE POLICY "Users can view pipeline jobs for their asset packs"
ON public.pipeline_jobs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.asset_packs
    WHERE asset_packs.id = pipeline_jobs.asset_pack_id
    AND asset_packs.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create pipeline jobs for their asset packs"
ON public.pipeline_jobs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.asset_packs
    WHERE asset_packs.id = pipeline_jobs.asset_pack_id
    AND asset_packs.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update pipeline jobs for their asset packs"
ON public.pipeline_jobs FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.asset_packs
    WHERE asset_packs.id = pipeline_jobs.asset_pack_id
    AND asset_packs.user_id = auth.uid()
  )
);

-- Create asset_layers table to store generated layers
CREATE TABLE IF NOT EXISTS public.asset_layers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_pack_id UUID NOT NULL REFERENCES public.asset_packs(id) ON DELETE CASCADE,
  layer_type TEXT NOT NULL CHECK (layer_type IN ('head', 'ears', 'eyes', 'eyebrows', 'nose', 'mouth', 'body', 'accessory', 'expression')),
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.asset_layers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for asset_layers
CREATE POLICY "Users can view layers for their asset packs"
ON public.asset_layers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.asset_packs
    WHERE asset_packs.id = asset_layers.asset_pack_id
    AND asset_packs.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create layers for their asset packs"
ON public.asset_layers FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.asset_packs
    WHERE asset_packs.id = asset_layers.asset_pack_id
    AND asset_packs.user_id = auth.uid()
  )
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_asset_packs_updated_at
BEFORE UPDATE ON public.asset_packs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pipeline_jobs_updated_at
BEFORE UPDATE ON public.pipeline_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();