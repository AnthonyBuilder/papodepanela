import { useEffect, useRef } from 'react';

interface HighPerformanceAdProps {
  adKey: string;
  format?: string;
  height?: number;
  width?: number;
}

declare global {
  interface Window {
    atOptions?: any;
  }
}

export default function HighPerformanceAd({ 
  adKey,
  format = 'iframe',
  height = 60,
  width = 468
}: HighPerformanceAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (scriptLoadedRef.current || !containerRef.current) return;

    // Set ad options
    window.atOptions = {
      'key': adKey,
      'format': format,
      'height': height,
      'width': width,
      'params': {}
    };

    // Load the ad script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://www.highperformanceformat.com/${adKey}/invoke.js`;
    script.async = true;
    
    containerRef.current.appendChild(script);
    scriptLoadedRef.current = true;

    return () => {
      // Cleanup
      if (containerRef.current && script.parentNode) {
        script.parentNode.removeChild(script);
      }
      scriptLoadedRef.current = false;
    };
  }, [adKey, format, height, width]);

  return (
    <div 
      ref={containerRef}
      style={{ 
        textAlign: 'center',
        margin: '10px 0',
        minHeight: `${height}px`,
        minWidth: `${width}px`
      }}
    />
  );
}
