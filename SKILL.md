---
name: seedream-image
description: Generate and edit images using ByteDance Seedream models via Atlas Cloud API. Supports batch generation (up to 15), editing, typography, poster design. Use when user asks to "generate an image with Seedream" or "create a poster".
---
# Seedream Image Skill

## Overview

This project provides a CLI tool (`seedream`) for generating and editing images using ByteDance's Seedream models via the Atlas Cloud API.

## Commands

### Generate an image
```bash
seedream "your prompt here"
```

### Edit an image
```bash
seedream "edit instructions" --mode edit --image ./source.png --strength 0.75
```

### Edit with mask
```bash
seedream "replace area" --mode edit --image ./source.png --mask ./mask.png
```

### Batch generate (up to 15 images)
```bash
seedream "prompt" --mode batch --count 5
```

### NSFW generation
```bash
seedream "prompt" --nsfw
```

### Model variants
- `--model v5.0-lite` (default) — Latest, fastest
- `--model v4.5` — Previous generation
- `--model v4` — Cost-effective

### Common options
- `--size WxH` — Image dimensions (default: 1024x1024)
- `--steps N` — Inference steps (default: 25)
- `--guidance N` — Guidance scale (default: 5.0)
- `--seed N` — Random seed
- `--output path` — Custom output path
- `--negative-prompt "text"` — Negative prompt

## Output

Images are saved to `./output/` directory by default.

## Setup

Requires `ATLAS_CLOUD_API_KEY` in `.env` file.
