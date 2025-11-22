import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { assetPackId, imageUrl } = await req.json();
    console.log("Starting image processing for asset pack:", assetPackId);

    if (!assetPackId || !imageUrl) {
      throw new Error("Missing required fields: assetPackId and imageUrl");
    }

    // Update asset pack status to processing
    await supabase
      .from("asset_packs")
      .update({ status: "processing" })
      .eq("id", assetPackId);

    // Create pipeline job for decomposition stage
    const { data: decompositionJob, error: jobError } = await supabase
      .from("pipeline_jobs")
      .insert({
        asset_pack_id: assetPackId,
        stage: "decomposition",
        status: "processing",
        progress: 0,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (jobError) throw jobError;
    console.log("Created decomposition job:", decompositionJob.id);

    // Stage 1: Image Decomposition
    await processDecomposition(supabase, decompositionJob.id, assetPackId, imageUrl);

    // Create pipeline job for expression generation
    const { data: expressionJob } = await supabase
      .from("pipeline_jobs")
      .insert({
        asset_pack_id: assetPackId,
        stage: "expression_generation",
        status: "processing",
        progress: 0,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    console.log("Created expression generation job:", expressionJob.id);

    // Stage 2: Expression Generation
    await processExpressions(supabase, expressionJob.id, assetPackId);

    // Create pipeline job for export preparation
    const { data: exportJob } = await supabase
      .from("pipeline_jobs")
      .insert({
        asset_pack_id: assetPackId,
        stage: "export_preparation",
        status: "processing",
        progress: 0,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    console.log("Created export preparation job:", exportJob.id);

    // Stage 3: Export Preparation
    await processExport(supabase, exportJob.id, assetPackId);

    // Update asset pack to completed
    const { data: layers } = await supabase
      .from("asset_layers")
      .select("id")
      .eq("asset_pack_id", assetPackId);

    await supabase
      .from("asset_packs")
      .update({
        status: "completed",
        total_layers: layers?.filter(l => l).length || 0,
        total_expressions: layers?.filter(l => l).length || 0,
      })
      .eq("id", assetPackId);

    console.log("Pipeline processing completed successfully");

    return new Response(
      JSON.stringify({ success: true, assetPackId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in process-image:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function processDecomposition(supabase: any, jobId: string, assetPackId: string, imageUrl: string) {
  console.log("Starting decomposition stage");
  
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY not configured");
  }

  // Update progress
  await supabase
    .from("pipeline_jobs")
    .update({ progress: 10 })
    .eq("id", jobId);

  // Call Lovable AI to analyze the image and identify layer boundaries
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: `You are an expert at analyzing anime/VTuber character images and identifying distinct layers for animation. 
Analyze the image and identify these layer types: head, ears, eyes, eyebrows, nose, mouth, body, accessories.
For each layer, provide a description of what should be isolated.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this character image and identify all the layers needed for VTuber rigging. List each layer type and describe its boundaries.",
            },
            {
              type: "image_url",
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("AI Gateway error:", error);
    throw new Error(`AI analysis failed: ${error}`);
  }

  const aiResult = await response.json();
  const layerAnalysis = aiResult.choices[0].message.content;
  console.log("Layer analysis:", layerAnalysis);

  await supabase
    .from("pipeline_jobs")
    .update({ 
      progress: 50,
      metadata: { layer_analysis: layerAnalysis }
    })
    .eq("id", jobId);

  // For MVP, create mock layer entries based on the analysis
  const layerTypes = ['head', 'ears', 'eyes', 'eyebrows', 'nose', 'mouth', 'body', 'accessory'];
  
  for (const layerType of layerTypes) {
    await supabase.from("asset_layers").insert({
      asset_pack_id: assetPackId,
      layer_type: layerType,
      name: `${layerType}_layer`,
      file_url: imageUrl, // In production, this would be the isolated layer
      metadata: { source: "decomposition", analysis: layerAnalysis },
    });
  }

  await supabase
    .from("pipeline_jobs")
    .update({ 
      progress: 100,
      status: "completed",
      completed_at: new Date().toISOString()
    })
    .eq("id", jobId);

  console.log("Decomposition stage completed");
}

async function processExpressions(supabase: any, jobId: string, assetPackId: string) {
  console.log("Starting expression generation stage");

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  await supabase
    .from("pipeline_jobs")
    .update({ progress: 10 })
    .eq("id", jobId);

  // Generate expressions using AI
  const expressionTypes = [
    { type: "mouth", variations: ["A", "E", "I", "O", "U", "closed", "smile", "frown"] },
    { type: "eyes", variations: ["open", "closed", "half-closed", "left", "right", "up", "down"] },
    { type: "eyebrows", variations: ["neutral", "raised", "furrowed", "surprised", "angry", "sad"] },
  ];

  let progressStep = 80 / (expressionTypes.length * expressionTypes.reduce((acc, e) => acc + e.variations.length, 0));
  let currentProgress = 10;

  for (const expression of expressionTypes) {
    for (const variation of expression.variations) {
      // Call AI to generate expression description
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: "You are an expert at describing anime character expressions for VTuber rigging.",
            },
            {
              role: "user",
              content: `Describe how a ${expression.type} should look for the "${variation}" expression in VTuber rigging.`,
            },
          ],
        }),
      });

      const aiResult = await response.json();
      const description = aiResult.choices[0].message.content;

      // Store the expression layer
      await supabase.from("asset_layers").insert({
        asset_pack_id: assetPackId,
        layer_type: "expression",
        name: `${expression.type}_${variation}`,
        file_url: "generated_expression.png", // Placeholder
        metadata: { 
          expression_type: expression.type,
          variation,
          description,
        },
      });

      currentProgress += progressStep;
      await supabase
        .from("pipeline_jobs")
        .update({ progress: Math.min(Math.floor(currentProgress), 90) })
        .eq("id", jobId);
    }
  }

  await supabase
    .from("pipeline_jobs")
    .update({ 
      progress: 100,
      status: "completed",
      completed_at: new Date().toISOString()
    })
    .eq("id", jobId);

  console.log("Expression generation stage completed");
}

async function processExport(supabase: any, jobId: string, assetPackId: string) {
  console.log("Starting export preparation stage");

  await supabase
    .from("pipeline_jobs")
    .update({ progress: 50 })
    .eq("id", jobId);

  // In production, this would organize files, create ZIP archives, generate documentation
  // For MVP, we'll just mark it as complete

  await supabase
    .from("pipeline_jobs")
    .update({ 
      progress: 100,
      status: "completed",
      completed_at: new Date().toISOString(),
      metadata: { export_ready: true }
    })
    .eq("id", jobId);

  console.log("Export preparation stage completed");
}
