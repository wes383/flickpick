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
  crossOrigin,
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

  // 需要 CORS 的图片（如 html-to-image 截图）直接走代理：
  // TMDB 不返回 CORS 头，直连必然失败，不应计为网络故障
  const needsCors = crossOrigin === "anonymous";
  const useProxy = globalProxyEnabled || useLocalProxy || needsCors;
  const imageUrl = buildTmdbImageUrl(path, size, useProxy);

  const handleError = () => {
    if (!useLocalProxy && !needsCors) {
      // 直连失败，先切到代理重试这张图
      setUseLocalProxy(true);
      // 不立即上报失败：可能是 404（海报路径无效），而非网络问题
      // 只有代理也加载成功，才说明是网络问题（见 handleLoad）
    }
    // 代理也失败 → 多半是图片路径本身无效（404），不计入网络失败
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (useLocalProxy && !globalProxyEnabled) {
      // 直连失败但代理成功 → 网络无法访问 TMDB，上报失败
      reportImageFailure();
    } else if (!useProxy) {
      // 直连成功
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
