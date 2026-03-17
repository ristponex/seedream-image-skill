#!/usr/bin/env bun

import { parseArgs } from "util";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join, resolve, extname } from "path";

// Load environment variables
const envPath = join(import.meta.dir, "..", ".env");
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim();
        process.env[key] = value;
      }
    }
  }
}

const API_KEY = process.env.ATLAS_CLOUD_API_KEY;
const API_BASE = "https://api.atlascloud.ai/api/v1/model";
const GENERATE_URL = `${API_BASE}/generateImage`;
const RESULT_URL = `${API_BASE}/result`;

// Model variant mapping
const MODEL_MAP: Record<string, string> = {
  "v5.0-lite": "bytedance/seedream-v5.0-lite",
  "v4.5": "bytedance/seedream-v4.5",
  "v4": "bytedance/seedream-v4",
};

const EDIT_SUFFIX: Record<string, string> = {
  "v5.0-lite": "bytedance/seedream-v5.0-lite/edit",
  "v4.5": "bytedance/seedream-v4.5/edit",
};

const SEQUENTIAL_SUFFIX: Record<string, string> = {
  "v5.0-lite": "bytedance/seedream-v5.0-lite/sequential",
  "v4.5": "bytedance/seedream-v4.5/sequential",
};

const EDIT_SEQUENTIAL_SUFFIX: Record<string, string> = {
  "v5.0-lite": "bytedance/seedream-v5.0-lite/edit-sequential",
};

// Help text
function showHelp(): void {
  console.log(`
seedream - Generate and edit images using ByteDance's Seedream models

Usage:
  seedream <prompt> [options]

Arguments:
  prompt                    Text description of the image to generate

Options:
  --model <variant>         Model variant: v5.0-lite (default), v4.5, v4
  --mode <mode>             Generation mode: generate (default), edit, batch
  --size <WxH>              Image dimensions (default: 1024x1024)
  --steps <n>               Inference steps (default: 25)
  --guidance <n>            Guidance scale (default: 5.0)
  --count <n>               Number of images for batch mode (default: 1, max: 15)
  --seed <n>                Random seed for reproducibility
  --output <path>           Output file path (default: ./output/<timestamp>.png)
  --image <path>            Source image for edit mode (file path or URL)
  --mask <path>             Mask image for edit mode (file path or URL)
  --strength <n>            Edit strength 0.0-1.0 (default: 0.75)
  --negative-prompt <text>  What to avoid in the generation
  --nsfw                    Enable NSFW content generation
  --help                    Show this help message

Examples:
  seedream "A dragon flying over mountains"
  seedream "Cyberpunk city" --model v4.5 --size 1280x720
  seedream "Add rainbow" --mode edit --image ./photo.png
  seedream "Cat in poses" --mode batch --count 5
  `);
}

// Parse command line arguments
function parseArguments() {
  const { values, positionals } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      model: { type: "string", default: "v5.0-lite" },
      mode: { type: "string", default: "generate" },
      size: { type: "string", default: "1024x1024" },
      steps: { type: "string", default: "25" },
      guidance: { type: "string", default: "5.0" },
      count: { type: "string", default: "1" },
      seed: { type: "string" },
      output: { type: "string" },
      image: { type: "string" },
      mask: { type: "string" },
      strength: { type: "string", default: "0.75" },
      "negative-prompt": { type: "string" },
      nsfw: { type: "boolean", default: false },
      help: { type: "boolean", default: false },
    },
    allowPositionals: true,
  });

  return { values, positionals };
}

// Convert a local file to base64 data URI
function fileToBase64(filePath: string): string {
  const absPath = resolve(filePath);
  if (!existsSync(absPath)) {
    throw new Error(`File not found: ${absPath}`);
  }
  const buffer = readFileSync(absPath);
  const base64 = buffer.toString("base64");
  const ext = extname(absPath).toLowerCase().replace(".", "");
  const mimeType = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
  return `data:${mimeType};base64,${base64}`;
}

// Resolve image input — could be URL or file path
function resolveImageInput(input: string): string {
  if (input.startsWith("http://") || input.startsWith("https://") || input.startsWith("data:")) {
    return input;
  }
  return fileToBase64(input);
}

// Determine the model ID based on mode and variant
function resolveModelId(variant: string, mode: string): string {
  if (mode === "edit") {
    const editModel = EDIT_SUFFIX[variant];
    if (!editModel) {
      throw new Error(`Edit mode not available for model variant: ${variant}`);
    }
    return editModel;
  }

  if (mode === "batch") {
    const seqModel = SEQUENTIAL_SUFFIX[variant];
    if (!seqModel) {
      throw new Error(`Sequential/batch mode not available for model variant: ${variant}`);
    }
    return seqModel;
  }

  const baseModel = MODEL_MAP[variant];
  if (!baseModel) {
    throw new Error(`Unknown model variant: ${variant}. Available: v5.0-lite, v4.5, v4`);
  }
  return baseModel;
}

// Build the request payload
function buildPayload(prompt: string, options: Record<string, any>): Record<string, any> {
  const payload: Record<string, any> = {
    prompt,
    image_size: options.size,
    num_inference_steps: parseInt(options.steps),
    guidance_scale: parseFloat(options.guidance),
  };

  if (options.seed) {
    payload.seed = parseInt(options.seed);
  }

  if (options.negativePrompt) {
    payload.negative_prompt = options.negativePrompt;
  }

  if (options.mode === "batch") {
    payload.num_images = parseInt(options.count);
  }

  if (options.mode === "edit") {
    if (!options.image) {
      throw new Error("Edit mode requires --image parameter");
    }
    payload.image = resolveImageInput(options.image);
    payload.strength = parseFloat(options.strength);

    if (options.mask) {
      payload.mask_image = resolveImageInput(options.mask);
    }
  }

  return payload;
}

// Submit generation request to Atlas Cloud API
async function submitRequest(modelId: string, payload: Record<string, any>): Promise<string> {
  console.log(`Submitting request to model: ${modelId}`);

  const response = await fetch(GENERATE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model_id: modelId,
      input: payload,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as { request_id: string };
  console.log(`Request submitted. ID: ${data.request_id}`);
  return data.request_id;
}

// Poll for result until completion
async function pollResult(requestId: string, maxAttempts = 120, intervalMs = 3000): Promise<any> {
  console.log("Waiting for generation to complete...");

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = await fetch(`${RESULT_URL}/${requestId}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Poll request failed (${response.status}): ${errorText}`);
    }

    const raw = (await response.json()) as { code?: number; data?: any; status?: string; output?: any; error?: string };
    const data = raw.data || raw;

    if (data.status === "completed" || data.status === "succeeded") {
      console.log("\nGeneration completed!");
      const outputs = data.outputs || data.output;
      return Array.isArray(outputs) ? outputs : outputs ? [outputs] : [];
    }

    if (data.status === "failed") {
      throw new Error(`Generation failed: ${data.error || "Unknown error"}`);
    }

    // Show progress indicator
    process.stdout.write(`\rPolling... attempt ${attempt}/${maxAttempts}`);
    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new Error("Generation timed out after maximum polling attempts");
}

// Download an image from URL and save to disk
async function downloadImage(url: string, outputPath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }
  const buffer = await response.arrayBuffer();
  writeFileSync(outputPath, Buffer.from(buffer));
}

// Generate output file path
function getOutputPath(basePath: string | undefined, index: number): string {
  if (basePath && index === 0) {
    return resolve(basePath);
  }

  const outputDir = resolve("./output");
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[T]/g, "-")
    .replace(/[:.]/g, "")
    .slice(0, 19)
    .replace(/-/g, "");
  const formattedTs = `${timestamp.slice(0, 4)}-${timestamp.slice(4, 6)}-${timestamp.slice(6, 8)}-${timestamp.slice(8, 14)}`;
  const paddedIndex = String(index + 1).padStart(3, "0");

  return join(outputDir, `seedream-${formattedTs}-${paddedIndex}.png`);
}

// Main execution
async function main() {
  const { values, positionals } = parseArguments();

  if (values.help || positionals.length === 0) {
    showHelp();
    process.exit(0);
  }

  if (!API_KEY) {
    console.error("Error: ATLAS_CLOUD_API_KEY is not set.");
    console.error("Set it in .env file or as an environment variable.");
    process.exit(1);
  }

  const prompt = positionals.join(" ");
  const mode = values.mode as string;
  const variant = values.model as string;

  console.log(`\nSeedream Image Generator`);
  console.log(`========================`);
  console.log(`Prompt: ${prompt}`);
  console.log(`Model: ${variant}`);
  console.log(`Mode: ${mode}`);
  console.log(`Size: ${values.size}`);
  console.log(`Steps: ${values.steps}`);
  console.log(`Guidance: ${values.guidance}`);
  if (values.nsfw) console.log(`NSFW: enabled`);
  console.log();

  try {
    // Resolve the model ID
    const modelId = resolveModelId(variant, mode);

    // Build payload
    const payload = buildPayload(prompt, {
      size: values.size,
      steps: values.steps,
      guidance: values.guidance,
      count: values.count,
      seed: values.seed,
      negativePrompt: values["negative-prompt"],
      mode,
      image: values.image,
      mask: values.mask,
      strength: values.strength,
    });

    // Submit request
    const requestId = await submitRequest(modelId, payload);

    // Poll for result
    const output = await pollResult(requestId);

    // Download and save images
    // API returns URL strings directly (not {url} objects)
    const imageUrls: string[] = Array.isArray(output) ? output : output ? [output] : [];
    if (imageUrls.length === 0) {
      console.error("No images returned from the API.");
      process.exit(1);
    }

    console.log(`\nDownloading ${imageUrls.length} image(s)...`);

    for (let i = 0; i < imageUrls.length; i++) {
      const url = typeof imageUrls[i] === "string" ? imageUrls[i] : (imageUrls[i] as any).url || imageUrls[i];
      const outputPath = getOutputPath(values.output as string | undefined, i);
      await downloadImage(url, outputPath);
      console.log(`Saved: ${outputPath}`);
    }

    console.log(`\nDone! Generated ${imageUrls.length} image(s).`);
  } catch (error) {
    console.error(`\nError: ${(error as Error).message}`);
    process.exit(1);
  }
}

main();
