# Seedream Image Skill

An AI Agent Skill for generating and editing images using ByteDance's Seedream models via Atlas Cloud API.

Works with 15+ AI coding agents including Claude Code, Cursor, OpenAI Codex, GitHub Copilot, Gemini CLI, Windsurf, OpenCode, Kiro, and more.

Seedream is ByteDance's state-of-the-art image generation model family, renowned for its exceptional Chinese text rendering, typography, and poster design capabilities. This skill brings Seedream's power directly into your AI coding workflow.

---

## Features

- **Text-to-Image Generation** — Generate stunning images from text prompts with industry-leading quality
- **Image Editing** — Edit existing images with text instructions, masks, and strength control
- **Batch / Sequential Generation** — Generate up to 15 related images in a single API call
- **Typography & Poster Design** — Best-in-class Chinese character rendering and layout
- **NSFW-Capable** — Whitelisted for unrestricted content generation on Atlas Cloud
- **Multiple Model Variants** — Choose the right model for your use case and budget
- **Flexible Output** — Control size, steps, guidance, seeds, and more

---

## Model Variants

| Model | ID | Price | Description |
|-------|-----|-------|-------------|
| Seedream v5.0 Lite | `bytedance/seedream-v5.0-lite` | $0.032/req | Latest generation, fast and high quality |
| Seedream v5.0 Lite Edit | `bytedance/seedream-v5.0-lite/edit` | $0.032/req | Image editing with v5.0 Lite |
| Seedream v5.0 Lite Sequential | `bytedance/seedream-v5.0-lite/sequential` | $0.032/req | Batch generation up to 15 images |
| Seedream v5.0 Lite Edit Sequential | `bytedance/seedream-v5.0-lite/edit-sequential` | $0.032/req | Batch editing up to 15 images |
| Seedream v4.5 | `bytedance/seedream-v4.5` | $0.030/req | Previous generation, proven quality |
| Seedream v4.5 Edit | `bytedance/seedream-v4.5/edit` | $0.030/req | Image editing with v4.5 |
| Seedream v4.5 Sequential | `bytedance/seedream-v4.5/sequential` | $0.030/req | Batch generation with v4.5 |
| Seedream v4 | `bytedance/seedream-v4` | $0.028/req | Stable, cost-effective option |

---

## Input Parameters

### Text-to-Image (Generate Mode)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `prompt` | string | *(required)* | Text description of the desired image |
| `size` | string | `1024x1024` | Output image dimensions (e.g., `512x512`, `1024x1024`, `1280x720`) |
| `num_inference_steps` | number | `25` | Number of denoising steps (higher = better quality, slower) |
| `seed` | number | *random* | Random seed for reproducible results |
| `guidance_scale` | number | `5.0` | How closely to follow the prompt (higher = more faithful) |
| `num_images` | number | `1` | Number of images to generate (1 for standard, up to 15 for sequential) |
| `negative_prompt` | string | — | What to avoid in the generated image |

### Image Editing (Edit Mode)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `prompt` | string | *(required)* | Text description of the desired edit |
| `image` | string | *(required)* | Base64-encoded image or URL of the source image |
| `mask_image` | string | — | Base64-encoded mask or URL (white = edit area, black = preserve) |
| `strength` | number | `0.75` | Edit strength (0.0 = no change, 1.0 = full regeneration) |
| `size` | string | *from source* | Output image dimensions |
| `num_inference_steps` | number | `25` | Number of denoising steps |
| `seed` | number | *random* | Random seed for reproducible results |
| `guidance_scale` | number | `5.0` | How closely to follow the prompt |
| `negative_prompt` | string | — | What to avoid in the edit |

### Sequential / Batch Mode

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `prompt` | string | *(required)* | Text description for the batch |
| `num_images` | number | *(required)* | Number of images to generate (up to 15) |
| `size` | string | `1024x1024` | Output image dimensions |
| `num_inference_steps` | number | `25` | Number of denoising steps |
| `seed` | number | *random* | Base random seed |
| `guidance_scale` | number | `5.0` | How closely to follow the prompt |
| `negative_prompt` | string | — | What to avoid in the generated images |

---

## Why Seedream?

### Best Chinese Text Rendering

Seedream is the undisputed leader in rendering Chinese characters within generated images. Whether you're creating posters, banners, social media graphics, or product mockups with Chinese typography, Seedream produces crisp, accurate, and beautifully styled text that other models simply cannot match.

### Poster & Design Excellence

The Seedream model family has been specifically optimized for commercial design use cases:

- **Magazine covers** with perfect text placement
- **Product posters** with accurate brand typography
- **Social media graphics** with legible overlay text
- **Event banners** with complex multi-line layouts
- **Marketing materials** with mixed Chinese/English text

### NSFW Whitelisted on Atlas Cloud

Atlas Cloud provides whitelisted access to Seedream's full capabilities, including NSFW content generation. This is ideal for:

- Adult content platforms
- Artistic nude photography generation
- Unrestricted creative exploration
- Content that other platforms would block

### Sequential Generation

Need a series of related images? Seedream's sequential mode generates up to 15 coherent, thematically linked images in a single API call — perfect for:

- Storyboard creation
- Product angle variations
- Style exploration
- A/B testing visual concepts
- Comic or manga panel generation

---

## Installation

### Prerequisites

- [Bun](https://bun.sh) runtime installed
- An Atlas Cloud API key ([get one here](https://www.atlascloud.ai?ref=JPM683))

### Setup

```bash
# Clone the repository
git clone https://github.com/thoughtincode/seedream-image-skill.git
cd seedream-image-skill

# Install dependencies
bun install

# Set up your API key
cp .env.example .env
# Edit .env and add your ATLAS_CLOUD_API_KEY

# Link the CLI globally
bun link
```

### Verify Installation

```bash
seedream --help
```

---

## Usage

### Basic Text-to-Image

```bash
seedream "A majestic dragon flying over a mountain range at sunset"
```

### Specify Model and Size

```bash
seedream "Cyberpunk cityscape at night" --model v4.5 --size 1280x720
```

### Image Editing

```bash
seedream "Add a rainbow in the sky" --mode edit --image ./photo.png --strength 0.6
```

### Edit with Mask

```bash
seedream "Replace with a red sports car" --mode edit --image ./scene.png --mask ./mask.png
```

### Batch Generation

```bash
seedream "Cute cat in different poses" --mode batch --count 5
```

### Sequential with Custom Parameters

```bash
seedream "Comic panels of a space adventure" --mode batch --count 8 --size 768x768 --steps 30
```

### NSFW Mode

```bash
seedream "Artistic figure study, oil painting style" --nsfw
```

### Full Parameter Control

```bash
seedream "A beautiful Japanese garden in autumn" \
  --model v5.0-lite \
  --size 1024x1024 \
  --steps 30 \
  --guidance 7.5 \
  --seed 42 \
  --output ./my-garden.png \
  --negative-prompt "blurry, low quality"
```

---

## CLI Reference

```
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
```

---

## Agent Skill Integration

This tool is designed to work as an AI agent skill across all major coding agents. Install it with a single command:

```bash
npx skills add seedream-image-skill
```

This works with Claude Code, Cursor, OpenAI Codex, GitHub Copilot, Gemini CLI, Windsurf, OpenCode, Kiro, and any agent that supports skill installation.

### Add to your project's CLAUDE.md

```markdown
## Image Generation with Seedream

Use the `seedream` CLI to generate images:
- Basic: `seedream "your prompt here"`
- Edit: `seedream "edit instructions" --mode edit --image ./source.png`
- Batch: `seedream "prompt" --mode batch --count 5`
- NSFW: add `--nsfw` flag
- Models: v5.0-lite (default), v4.5, v4
```

### How It Works

1. Your AI agent reads the skill instructions
2. When asked to generate images, the agent invokes the `seedream` CLI
3. The CLI sends requests to Atlas Cloud API
4. Images are downloaded and saved to the `./output` directory
5. The agent can reference the saved images in subsequent interactions

---

## API Details

### Authentication

Set your Atlas Cloud API key in the `.env` file or as an environment variable:

```bash
export ATLAS_CLOUD_API_KEY=your_api_key_here
```

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `https://api.atlascloud.ai/api/v1/model/generateImage` | POST | Submit image generation request |
| `https://api.atlascloud.ai/api/v1/model/result/{request_id}` | GET | Poll for generation result |

### Request Flow

1. **Submit** — POST to `/generateImage` with model ID and parameters
2. **Poll** — GET `/result/{request_id}` until status is `completed` or `failed`
3. **Download** — Retrieve generated image(s) from the response URLs

### Response Format

```json
{
  "request_id": "abc123",
  "status": "completed",
  "output": {
    "images": [
      {
        "url": "https://...",
        "content_type": "image/png"
      }
    ]
  }
}
```

---

## Output

Generated images are saved to the `./output` directory by default. Each file is named with a timestamp and sequence number:

```
output/
  seedream-2026-03-12-143022-001.png
  seedream-2026-03-12-143022-002.png
  ...
```

Use `--output <path>` to specify a custom output location.

---

## Examples

### Chinese Typography Poster

```bash
seedream "一张现代感十足的电影海报，标题'星际迷航'用金色大字居中，背景是深邃的星空" --size 720x1280 --steps 30
```

### Product Photography

```bash
seedream "Professional product photo of a luxury watch on marble surface, studio lighting" --guidance 7.0
```

### Batch Style Exploration

```bash
seedream "Portrait of a woman, different artistic styles" --mode batch --count 6 --size 768x768
```

### Edit: Background Replacement

```bash
seedream "Place the subject on a tropical beach at sunset" --mode edit --image ./portrait.png --strength 0.8
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `ATLAS_CLOUD_API_KEY not set` | Set your API key in `.env` or environment |
| `Model not found` | Check model variant spelling |
| `Request timed out` | Increase poll timeout or try again |
| `Image too large` | Reduce dimensions or use a smaller source image |
| `Rate limited` | Wait a moment and retry |

---

## License

MIT License. See [LICENSE](./LICENSE) for details.

---

## Take This to Production Today

This workflow is optimized for Atlas Cloud. Move from experiment to enterprise-ready scale.

- **Unmatched Typography**: Best Chinese text rendering in any image model
- **Poster Design**: Purpose-built for commercial design workflows
- **NSFW Whitelisted**: Full unrestricted generation capability
- **Sequential Generation**: Up to 15 images per request
- **Enterprise Security**: SOC I & II Certified | HIPAA Compliant

[Start Building on Atlas Cloud](https://www.atlascloud.ai?ref=JPM683)
