import Image, { type ImageProps } from "next/image";

function isLocalMediaUrl(src: ImageProps["src"]): boolean {
  if (typeof src !== "string") return false;

  try {
    const url = new URL(src);
    return url.hostname === "127.0.0.1" || url.hostname === "localhost";
  } catch {
    return src.startsWith("/storage/");
  }
}

/** next/image wrapper that skips optimizer for local Laravel storage URLs. */
export function MediaImage({ src, alt, unoptimized, ...props }: ImageProps) {
  const skipOptimizer = unoptimized ?? isLocalMediaUrl(src);

  return <Image src={src} alt={alt} unoptimized={skipOptimizer} {...props} />;
}
