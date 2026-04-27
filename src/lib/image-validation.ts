// Server-side validation for image URLs submitted by admin forms.
// Validates host, Cloudinary cloud, folder, file extension, byte size, and aspect ratio.

const DEFAULT_MAX_BYTES = 5_000_000;
const DEFAULT_FORMATS = ["jpg", "jpeg", "png", "webp", "avif"] as const;

export type AspectRatioRule =
  | { type: "exact"; ratio: number; tolerance?: number } // ratio = w/h, tolerance default 0.04 (~4%)
  | { type: "min"; ratio: number; label?: string };       // w/h must be >= ratio

export type ImageValidationOpts = {
  allowedFormats?: readonly string[];
  maxBytes?: number;
  requiredFolder?: string;
  aspectRatio?: AspectRatioRule;
};

const cloudName = (import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME ?? "").trim();

function pathExtension(pathname: string): string | null {
  const last = pathname.split("/").pop() ?? "";
  const dot = last.lastIndexOf(".");
  if (dot < 0) return null;
  return last.slice(dot + 1).toLowerCase();
}

type CloudinaryInfo = { width: number; height: number; bytes: number; format?: string };

async function fetchCloudinaryInfo(u: URL): Promise<CloudinaryInfo | null> {
  const marker = "/upload/";
  const i = u.pathname.indexOf(marker);
  if (i < 0) return null;
  const before = u.pathname.slice(0, i + marker.length);
  const after = u.pathname.slice(i + marker.length);
  const infoUrl = `${u.origin}${before}fl_getinfo/${after}`;
  try {
    const res = await fetch(infoUrl);
    if (!res.ok) return null;
    const data = (await res.json()) as { output?: Record<string, unknown> };
    const out = data.output;
    if (!out) return null;
    const width = Number(out.width);
    const height = Number(out.height);
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;
    return {
      width,
      height,
      bytes: Number(out.bytes) || 0,
      format: typeof out.format === "string" ? out.format : undefined,
    };
  } catch {
    return null;
  }
}

export async function assertValidImageUrl(
  rawUrl: string | null | undefined,
  opts: ImageValidationOpts = {},
): Promise<void> {
  const url = (rawUrl ?? "").trim();
  if (!url) return; // image is optional — empty string means "no image"

  let u: URL;
  try {
    u = new URL(url);
  } catch {
    throw new Error("URL immagine non valido.");
  }

  if (u.protocol !== "https:") {
    throw new Error("L'immagine deve essere caricata su Cloudinary (HTTPS).");
  }
  if (u.hostname !== "res.cloudinary.com") {
    throw new Error("L'immagine deve essere caricata tramite il pulsante (host non Cloudinary).");
  }
  if (cloudName && !u.pathname.startsWith(`/${cloudName}/`)) {
    throw new Error("Immagine da un account Cloudinary non autorizzato.");
  }
  if (opts.requiredFolder && !u.pathname.includes(`/${opts.requiredFolder}/`)) {
    throw new Error(`L'immagine deve essere nella cartella ${opts.requiredFolder}.`);
  }

  const allowed = (opts.allowedFormats ?? DEFAULT_FORMATS).map((f) => f.toLowerCase());
  const ext = pathExtension(u.pathname);
  if (!ext) throw new Error("Estensione file mancante nell'URL.");
  if (!allowed.includes(ext)) {
    throw new Error(`Formato non supportato (.${ext}). Ammessi: ${allowed.join(", ")}.`);
  }

  const max = opts.maxBytes ?? DEFAULT_MAX_BYTES;
  const info = await fetchCloudinaryInfo(u);

  if (info) {
    if (info.bytes > max) {
      const maxMb = (max / 1_000_000).toFixed(1);
      const sizeMb = (info.bytes / 1_000_000).toFixed(2);
      throw new Error(`Immagine troppo grande (${sizeMb} MB). Massimo ${maxMb} MB.`);
    }
    if (info.format && !allowed.includes(info.format.toLowerCase())) {
      throw new Error(`Tipo immagine non supportato (${info.format}). Ammessi: ${allowed.join(", ")}.`);
    }
    if (opts.aspectRatio) {
      const r = info.width / info.height;
      if (opts.aspectRatio.type === "exact") {
        const tol = opts.aspectRatio.tolerance ?? 0.04;
        const target = opts.aspectRatio.ratio;
        if (Math.abs(r - target) / target > tol) {
          throw new Error(
            `Aspect ratio non valido (${info.width}×${info.height}). Richiesto ${target === 1 ? "quadrato 1:1" : `${target.toFixed(2)}:1`}.`,
          );
        }
      } else {
        if (r < opts.aspectRatio.ratio) {
          const lbl = opts.aspectRatio.label ?? `aspect ratio minimo ${opts.aspectRatio.ratio.toFixed(2)}:1`;
          throw new Error(`Immagine troppo verticale (${info.width}×${info.height}). Richiesto ${lbl}.`);
        }
      }
    }
  } else {
    // Fallback: best-effort HEAD for size when fl_getinfo is unavailable
    try {
      const head = await fetch(url, { method: "HEAD" });
      if (head.ok) {
        const ctype = head.headers.get("content-type") ?? "";
        if (ctype && !ctype.startsWith("image/")) {
          throw new Error(`Tipo MIME non valido (${ctype}). Atteso un'immagine.`);
        }
        const len = head.headers.get("content-length");
        if (len) {
          const size = Number(len);
          if (Number.isFinite(size) && size > max) {
            const maxMb = (max / 1_000_000).toFixed(1);
            const sizeMb = (size / 1_000_000).toFixed(2);
            throw new Error(`Immagine troppo grande (${sizeMb} MB). Massimo ${maxMb} MB.`);
          }
        }
      }
    } catch (e) {
      const msg = (e as Error).message;
      if (msg.startsWith("Immagine troppo grande") || msg.startsWith("Tipo MIME")) throw e;
    }
  }
}

export const IMAGE_RULES = {
  teamCrest: {
    allowedFormats: ["png", "webp", "svg", "jpg", "jpeg"] as const,
    maxBytes: 2_000_000,
    aspectRatio: { type: "exact", ratio: 1, tolerance: 0.04 } as AspectRatioRule,
  },
  sponsorLogo: {
    allowedFormats: ["png", "webp", "svg", "jpg", "jpeg"] as const,
    maxBytes: 2_000_000,
    aspectRatio: { type: "min", ratio: 1.75, label: "logo orizzontale (consigliato 2:1, minimo 16:9)" } as AspectRatioRule,
  },
  playerPhoto: {
    allowedFormats: ["jpg", "jpeg", "png", "webp", "avif"] as const,
    maxBytes: 5_000_000,
  },
} as const;
