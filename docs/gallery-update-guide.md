# Gallery Update Guide

This guide documents how to update the website's gallery images. The process is designed so the **maintainer** (non-technical, smartphone-only) only needs to send photos — the **developer** handles all technical steps.

---

## Maintainer's Role (No Technical Skills Required)

1. Take photos of completed work, the workshop, or team
2. Send photos to the developer via **WhatsApp** or **email**
3. Include a brief description of each photo (e.g., "brake repair on Honda Civic", "new workshop equipment")

That's it. No CLI, no code editing, no desktop tools, no logins needed from the maintainer.

---

## Developer's Role (Technical Steps)

### Step 1: Receive Photos

Receive new photos from the maintainer via WhatsApp or email. Save them to your local machine.

### Step 2: Resize and Convert to WebP

Convert each image to WebP format at 800×600 pixels, keeping file size under 100KB:

```bash
# Using cwebp (install via: brew install webp)
cwebp -resize 800 600 -q 80 input-photo.jpg -o workshop-brake-repair.webp

# Or using sharp-cli (install via: npm install -g sharp-cli)
sharp -i input-photo.jpg -o workshop-brake-repair.webp resize 800 600 --format webp --quality 80
```

**Guidelines:**
- Target dimensions: **800×600** pixels (landscape) or **600×800** (portrait)
- Maximum file size: **100KB** per image
- Format: **WebP** (best compression-to-quality ratio)
- Quality: **75–85** (adjust to stay under 100KB)

### Step 3: Save to Gallery Directory

Save the converted image to the project's gallery folder:

```
public/images/gallery/{descriptive-filename}.webp
```

**Naming convention:** Use lowercase, hyphen-separated descriptive names:
- ✅ `brake-repair-honda-civic.webp`
- ✅ `workshop-interior-01.webp`
- ✅ `team-working-engine.webp`
- ❌ `IMG_2847.webp`
- ❌ `photo.webp`
- ❌ `new image (2).webp`

### Step 4: Update gallery.json

Open `src/data/gallery.json` and add a new entry for each image:

```json
{
  "src": "/images/gallery/brake-repair-honda-civic.webp",
  "alt": "Brake repair completed on a silver Honda Civic at ASM AUTO Repair",
  "width": 800,
  "height": 600,
  "category": "vehicles"
}
```

**Field details:**

| Field | Description | Rules |
|-------|-------------|-------|
| `src` | Path to the image file | Must start with `/images/gallery/` |
| `alt` | Descriptive text for accessibility | 5–125 characters, not a filename, not generic |
| `width` | Image width in pixels | Match actual dimensions |
| `height` | Image height in pixels | Match actual dimensions |
| `category` | Image category | `"workshop"`, `"vehicles"`, or `"team"` |

**Alt text guidelines:**
- ✅ "Engine diagnostic equipment in use at ASM AUTO Repair workshop"
- ✅ "Team member inspecting transmission components"
- ❌ "image" / "photo" / "workshop-01.webp"
- ❌ Text longer than 125 characters

### Step 5: Push to Git and Deploy

```bash
git add public/images/gallery/ src/data/gallery.json
git commit -m "Add gallery images: [brief description]"
git push origin main
```

Netlify will auto-deploy the updated site within 2–5 minutes.

---

## Quick Checklist

- [ ] Photos received from maintainer
- [ ] Images resized to 800×600 and converted to WebP (<100KB each)
- [ ] Files saved to `public/images/gallery/` with descriptive filenames
- [ ] `src/data/gallery.json` updated with new entries (src, alt, width, height, category)
- [ ] Alt text is descriptive, 5–125 characters, not a filename
- [ ] Changes pushed to Git
- [ ] Verified deployment on live site

---

## Category Reference

| Category | Use For |
|----------|---------|
| `workshop` | Shop interior, equipment, tools, workspace |
| `vehicles` | Completed repairs, before/after shots, customer vehicles |
| `team` | Staff photos, team at work, group shots |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Image not showing on site | Check `src` path matches actual file location in `public/images/gallery/` |
| Build fails after update | Check `gallery.json` for valid JSON (no trailing commas, proper quotes) |
| Image too large (slow load) | Re-convert with lower quality (try `-q 70`) or smaller dimensions |
| Alt text warning in build | Ensure alt is 5–125 chars and descriptive (not a filename) |
