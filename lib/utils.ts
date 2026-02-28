import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import imageCompression from "browser-image-compression"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fileToBase64(
  file: File
): Promise<{ data: string; type: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const [header, base64] = result.split(",");
      const type = header.match(/data:(image\/[^;]+)/)?.[1] ?? "image/jpeg";
      resolve({ data: base64 ?? "", type });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses an image using browser-image-compression.
 * Keeps receipt photos readable while staying under Server Action body limits.
 */
export async function compressImage(
  file: File
): Promise<{ data: string; type: string }> {
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.8,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
  });
  return fileToBase64(compressed);
}
