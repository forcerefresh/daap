import React, { useState, useEffect } from "react";

export interface ExternalSVG extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc: string;
  alt?: string;
}

export const ExternalSVG = ({
  src,
  fallbackSrc,
  alt = "icon",
  ...props
}: ExternalSVG) => {
  const [svgContent, setSvgContent] = useState<string>();
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchSVG = async () => {
      try {
        const response = await fetch(src, {
          mode: "cors",
          cache: "no-cache",
        });

        if (!response.ok) throw new Error("Failed to fetch SVG");

        const svgText = await response.text();
        if (!svgText.includes("<svg")) throw new Error("Invalid SVG content");

        setSvgContent(svgText);
      } catch (err) {
        console.error("SVG load error:", err);
        setError(true);
      }
    };

    fetchSVG();
  }, [src]);

  if (error && fallbackSrc) {
    return <img src={fallbackSrc} alt={alt} {...props} />;
  }

  if (svgContent) {
    return <div dangerouslySetInnerHTML={{ __html: svgContent }} {...props} />;
  }

  return <div className="svg-placeholder" {...props} />;
};
