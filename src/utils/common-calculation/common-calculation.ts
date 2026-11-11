type Size = { width: number; height: number };

export function resizeProportionally(size: Size, maxSize: number): Size {
  const { width, height } = size;

  if (width <= maxSize && height <= maxSize) {
    return { width, height };
  }

  const scale = Math.min(maxSize / width, maxSize / height);

  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}
