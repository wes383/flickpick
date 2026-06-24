"use client";

import { useState, useEffect, ImgHTMLAttributes } from "react";
import {
  buildTmdbImageUrl,
  reportImageFailure,
  reportImageSuccess,
  shouldUseTmdbProxy,
  subscribeToProxyStatus,
} from "@/lib/tmdb-image-fallback";

interface TmdbImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "onError"> {
  path: string;
  size?: "w92" | "w154" | "w185" | "w200" | "w300" | "w342" | "w500" | "w780" | "original";
  alt: string;
}

export function TmdbImage({ 
  path, 
  size = "w500", 
  alt, 
  className,
  onLoad,
  ...props 
}: TmdbImageProps) {
  const [useLocalProxy, setUseLocalProxy] = useState(false);
  const [globalProxyEnabled, setGlobalProxyEnabled] = useState(shouldUseTmdbProxy());
  
  useEffect(() => {
    const unsubscribe = subscribeToProxyStatus(() => {
      setGlobalProxyEnabled(shouldUseTmdbProxy());
    });
    return () => {
      unsubscribe();
    };
  }, []);
  
  const useProxy = globalProxyEnabled || useLocalProxy;
  const imageUrl = buildTmdbImageUrl(path, size, useProxy);

  const handleError = () => {
    if (!useLocalProxy) {
      setUseLocalProxy(true);
      reportImageFailure();
    }
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!useProxy) {
      reportImageSuccess();
    }
    onLoad?.(e);
  };

  return (
    <img
      src={imageUrl}
      alt={alt}
      onError={handleError}
      onLoad={handleLoad}
      className={className}
      {...props}
    />
  );
}
