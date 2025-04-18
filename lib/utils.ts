import { type ClassValue, clsx } from "clsx";
import qs from "qs";
import { twMerge } from "tailwind-merge";
import { aspectRatioOptions } from "@/constants";

// Classname merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const handleError = (error: unknown): never => {
  if (error instanceof Error) {
    console.error(error.message);
    throw new Error(`Error: ${error.message}`);
  } else if (typeof error === "string") {
    console.error(error);
    throw new Error(`Error: ${error}`);
  } else {
    console.error(error);
    throw new Error(`Unknown error: ${JSON.stringify(error)}`);
  }
};

// Shimmer placeholder
const shimmer = (w: number, h: number): string => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#7986AC" offset="20%" />
      <stop stop-color="#68769e" offset="50%" />
      <stop stop-color="#7986AC" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#7986AC" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite" />
</svg>`;

const toBase64 = (str: string): string =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

export const dataUrl = `data:image/svg+xml;base64,${toBase64(shimmer(1000, 1000))}`;

// Query formatter
export const formUrlQuery = ({
  searchParams,
  key,
  value,
}: {
  searchParams: URLSearchParams;
  key: string;
  value: string | null;
}): string => {
  const params = { ...qs.parse(searchParams.toString()), [key]: value };
  return `${window.location.pathname}?${qs.stringify(params, { skipNulls: true })}`;
};

// Key remover
export const removeKeysFromQuery = ({
  searchParams,
  keysToRemove,
}: {
  searchParams: string;
  keysToRemove: string[];
}): string => {
  const currentUrl = qs.parse(searchParams);

  keysToRemove.forEach((key) => {
    delete currentUrl[key];
  });

  Object.keys(currentUrl).forEach((key) => {
    if (currentUrl[key] == null) {
      delete currentUrl[key];
    }
  });

  return `${window.location.pathname}?${qs.stringify(currentUrl)}`;
};

// Debounce
export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Get image size
export type AspectRatioKey = keyof typeof aspectRatioOptions;
export const getImageSize = (
  type: string,
  image: { [key: string]: unknown },
  dimension: "width" | "height"
): number => {
  if (type === "fill") {
    const key = image.aspectRatio as AspectRatioKey;
    return aspectRatioOptions[key]?.[dimension] ?? 1000;
  }

  const dim = image[dimension];
  return typeof dim === "number" ? dim : 1000;
};

// Download
export const download = (url: string, filename: string): void => {
  if (!url) throw new Error("Resource URL not provided!");

  fetch(url)
    .then((res) => res.blob())
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${filename.replace(/ /g, "_")}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    })
    .catch((err) => console.error("Download error:", err));
};

// Deep merge
export const deepMergeObjects = <T extends object, U extends object>(
  obj1: T,
  obj2: U | null | undefined
): T & U => {
  if (obj2 == null) return obj1 as T & U;

  const output = { ...obj2 } as T & U;

  for (const key in obj1) {
    if (Object.prototype.hasOwnProperty.call(obj1, key)) {
      const val1 = obj1[key as keyof T];
      const val2 = obj2[key as unknown as keyof U];

      if (
        typeof val1 === "object" &&
        typeof val2 === "object" &&
        val1 !== null &&
        val2 !== null
      ) {
        (output as any)[key] = deepMergeObjects(val1 as object, val2 as object);
      } else {
        (output as any)[key] = val1;
      }
    }
  }

  return output;
};
