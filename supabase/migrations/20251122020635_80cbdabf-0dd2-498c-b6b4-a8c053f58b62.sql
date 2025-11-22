-- Enable realtime for pipeline_jobs table
ALTER TABLE public.pipeline_jobs REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.pipeline_jobs;