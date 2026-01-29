"use client";

import Image, { type ImageProps } from "next/image";

const CDN_BASE = process.env.NEXT_PUBLIC_CLOUDFRONT_BASE_URL;

function hostOf(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

const CDN_HOST = CDN_BASE ? hostOf(CDN_BASE) : null;

type SafeImageProps = Omit<ImageProps, "src"> & {
  src: string;
};

export function SafeImage({ src, alt, ...props }: SafeImageProps) {
  const host = hostOf(src);
  const isCdn = !!CDN_HOST && host === CDN_HOST;

  if (isCdn) {
    return <Image src={src} alt={alt} {...props} />;
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={props.className} loading="lazy" />;
}
