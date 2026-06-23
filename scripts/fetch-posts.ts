/**
 * Fetch Posts Script — Google Sheet → Markdown pipeline
 *
 * Prebuild script that fetches posts from a Google Sheet (public CSV URL),
 * transforms each row into Markdown frontmatter + body, and writes to
 * src/content/posts/{slug}.md.
 *
 * Configuration:
 *   Set GOOGLE_SHEET_CSV_URL environment variable to the published CSV URL
 *   of the Google Sheet containing posts.
 *
 * Google Sheet columns (order matters):
 *   title | body | imageUrl | publishedDate
 *
 * If no URL is configured, the script exits gracefully allowing
 * local development and builds to proceed without external dependencies.
 */

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

// ─── Configuration ───────────────────────────────────────────────────────────

const SHEET_URL = process.env.GOOGLE_SHEET_CSV_URL;
const PROJECT_ROOT = resolve(import.meta.dirname, '..');
const POSTS_DIR = join(PROJECT_ROOT, 'src', 'content', 'posts');
const IMAGES_DIR = join(PROJECT_ROOT, 'public', 'images', 'posts');

// ─── Types ───────────────────────────────────────────────────────────────────

interface PostRow {
  title: string;
  body: string;
  imageUrl: string;
  publishedDate: string;
}

// ─── Utility Functions ───────────────────────────────────────────────────────

/**
 * Generate a URL-safe slug from a title string.
 * Lowercase, hyphens replace spaces, no special characters.
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')          // Spaces to hyphens
    .replace(/-+/g, '-')           // Collapse multiple hyphens
    .replace(/^-|-$/g, '');        // Trim leading/trailing hyphens
}

/**
 * Compute a content hash for idempotency checks.
 */
function contentHash(content: string): string {
  return createHash('md5').update(content).digest('hex');
}

/**
 * Parse a CSV string into an array of string arrays.
 * Handles quoted fields with commas and newlines.
 */
function parseCSV(csv: string): string[][] {
  const rows: string[][] = [];
  let current = '';
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    const next = csv[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else if (char === '"') {
        // End of quoted field
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(current.trim());
        current = '';
      } else if (char === '\n' || (char === '\r' && next === '\n')) {
        row.push(current.trim());
        current = '';
        if (row.some((cell) => cell.length > 0)) {
          rows.push(row);
        }
        row = [];
        if (char === '\r') i++; // Skip \n in \r\n
      } else {
        current += char;
      }
    }
  }

  // Handle last field/row
  if (current.length > 0 || row.length > 0) {
    row.push(current.trim());
    if (row.some((cell) => cell.length > 0)) {
      rows.push(row);
    }
  }

  return rows;
}

/**
 * Parse CSV rows into PostRow objects.
 * Expects columns: title, body, imageUrl, publishedDate
 * Skips the header row.
 */
function parseRows(csvRows: string[][]): PostRow[] {
  if (csvRows.length < 2) return []; // Need at least header + 1 data row

  // Skip header row (first row)
  return csvRows.slice(1).map((cols) => ({
    title: (cols[0] || '').trim(),
    body: (cols[1] || '').trim(),
    imageUrl: (cols[2] || '').trim(),
    publishedDate: (cols[3] || '').trim(),
  }));
}

/**
 * Validate that a row has the minimum required fields.
 */
function isValidRow(row: PostRow): boolean {
  return row.title.length > 0 && row.body.length > 0;
}

/**
 * Format a date string to YYYY-MM-DD.
 * Handles various date formats from Google Sheets.
 */
function formatDate(dateStr: string): string {
  if (!dateStr) {
    return new Date().toISOString().split('T')[0];
  }

  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) {
    return new Date().toISOString().split('T')[0];
  }

  return parsed.toISOString().split('T')[0];
}

/**
 * Generate an excerpt from body text (first 160 chars).
 */
function generateExcerpt(body: string): string {
  const clean = body.replace(/\n+/g, ' ').trim();
  if (clean.length <= 160) return clean;
  return clean.substring(0, 157) + '...';
}

/**
 * Generate Markdown file content with frontmatter.
 */
function generateMarkdown(row: PostRow, slug: string, imagePath: string): string {
  const date = formatDate(row.publishedDate);
  const excerpt = generateExcerpt(row.body);

  const frontmatter = [
    '---',
    `title: "${row.title.replace(/"/g, '\\"')}"`,
    `publishedDate: ${date}`,
    `featuredImage: "${imagePath}"`,
    `excerpt: "${excerpt.replace(/"/g, '\\"')}"`,
    `author: "ASM AUTO Repair"`,
    `draft: false`,
    '---',
    '',
    row.body,
    '',
  ].join('\n');

  return frontmatter;
}

/**
 * Check if a URL is a Google Drive file URL and extract the file ID.
 */
function getGoogleDriveFileId(url: string): string | null {
  // Match patterns like:
  // https://drive.google.com/file/d/FILE_ID/view
  // https://drive.google.com/open?id=FILE_ID
  // https://drive.google.com/uc?id=FILE_ID
  const patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Download an image from a URL (including Google Drive) to the images directory.
 * Returns the local path on success, or the original URL on failure.
 */
async function downloadImage(
  imageUrl: string,
  slug: string
): Promise<string> {
  if (!imageUrl) {
    return `/images/posts/${slug}.webp`;
  }

  const localPath = `/images/posts/${slug}.webp`;
  const localFile = join(IMAGES_DIR, `${slug}.webp`);

  // If already downloaded, skip
  if (existsSync(localFile)) {
    return localPath;
  }

  // Resolve Google Drive URLs to a direct download URL
  let downloadUrl = imageUrl;
  const driveId = getGoogleDriveFileId(imageUrl);
  if (driveId) {
    downloadUrl = `https://drive.google.com/uc?export=download&id=${driveId}`;
  }

  try {
    const response = await fetch(downloadUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'ASM-AutoRepair-FetchPosts/1.0',
      },
    });

    if (!response.ok) {
      console.warn(
        `[fetch-posts] Warning: Failed to download image for "${slug}" (HTTP ${response.status}). Using URL in frontmatter.`
      );
      // If it's a valid external URL, use it directly
      if (imageUrl.startsWith('http')) return imageUrl;
      return localPath;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    writeFileSync(localFile, buffer);
    console.log(`[fetch-posts] Downloaded image: ${localPath}`);
    return localPath;
  } catch (error) {
    console.warn(
      `[fetch-posts] Warning: Could not download image for "${slug}": ${error instanceof Error ? error.message : error}. Using URL in frontmatter.`
    );
    // If it's a valid external URL, use it directly
    if (imageUrl.startsWith('http')) return imageUrl;
    return localPath;
  }
}

// ─── Main Pipeline ───────────────────────────────────────────────────────────

async function main(): Promise<void> {
  // Exit gracefully if no URL is configured
  if (!SHEET_URL) {
    console.log(
      '[fetch-posts] No GOOGLE_SHEET_CSV_URL configured — skipping fetch.'
    );
    process.exit(0);
  }

  console.log('[fetch-posts] Fetching posts from Google Sheet...');

  // Ensure output directories exist
  mkdirSync(POSTS_DIR, { recursive: true });
  mkdirSync(IMAGES_DIR, { recursive: true });

  // Fetch the CSV
  let csvText: string;
  try {
    const response = await fetch(SHEET_URL);
    if (!response.ok) {
      console.error(
        `[fetch-posts] Error: Failed to fetch sheet (HTTP ${response.status}). Skipping.`
      );
      process.exit(0);
    }
    csvText = await response.text();
  } catch (error) {
    console.error(
      `[fetch-posts] Error: Could not reach Google Sheet: ${error instanceof Error ? error.message : error}. Skipping.`
    );
    process.exit(0);
  }

  // Parse CSV
  const csvRows = parseCSV(csvText);
  const posts = parseRows(csvRows);

  if (posts.length === 0) {
    console.log('[fetch-posts] No posts found in sheet. Done.');
    process.exit(0);
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let malformed = 0;

  for (const row of posts) {
    // Skip malformed rows
    if (!isValidRow(row)) {
      console.warn(
        `[fetch-posts] Warning: Skipping malformed row (missing title or body): ${JSON.stringify({ title: row.title.substring(0, 40) || '(empty)' })}`
      );
      malformed++;
      continue;
    }

    const slug = generateSlug(row.title);
    if (!slug) {
      console.warn(
        `[fetch-posts] Warning: Could not generate slug for title: "${row.title}". Skipping.`
      );
      malformed++;
      continue;
    }

    const filePath = join(POSTS_DIR, `${slug}.md`);

    // Download or resolve image
    const imagePath = await downloadImage(row.imageUrl, slug);

    // Generate markdown content
    const markdown = generateMarkdown(row, slug, imagePath);

    // Idempotency check: skip if file exists with same content hash
    if (existsSync(filePath)) {
      const existingContent = readFileSync(filePath, 'utf-8');
      if (contentHash(existingContent) === contentHash(markdown)) {
        skipped++;
        continue;
      }
      // Content differs — update the file
      writeFileSync(filePath, markdown, 'utf-8');
      updated++;
      console.log(`[fetch-posts] Updated: ${slug}.md`);
    } else {
      // New file
      writeFileSync(filePath, markdown, 'utf-8');
      created++;
      console.log(`[fetch-posts] Created: ${slug}.md`);
    }
  }

  console.log(
    `[fetch-posts] Done. Created: ${created}, Updated: ${updated}, Skipped (unchanged): ${skipped}, Malformed: ${malformed}`
  );
}

// Run the pipeline
main().catch((error) => {
  console.error('[fetch-posts] Unexpected error:', error);
  // Don't fail the build — exit gracefully
  process.exit(0);
});
