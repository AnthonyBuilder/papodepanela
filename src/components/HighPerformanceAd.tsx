import { useEffect, useRef, useState } from 'react';

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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (scriptLoadedRef.current || !containerRef.current) return;

    // Ajustar dimensões para mobile
    const responsiveWidth = isMobile ? Math.min(width, window.innerWidth - 40) : width;
    const responsiveHeight = isMobile ? Math.min(height, 60) : height;

    // Set ad options
    window.atOptions = {
      'key': adKey,
      'format': format,
      'height': responsiveHeight,
      'width': responsiveWidth,
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
  }, [adKey, format, height, width, isMobile]);

  return (
    <div 
      ref={containerRef}
      className="mx-auto overflow-hidden"
      style={{ 
        textAlign: 'center',
        margin: '10px auto',
        maxWidth: '100%',
        minHeight: isMobile ? '60px' : `${height}px`,
        width: isMobile ? '100%' : `${width}px`
      }}
    />
  );
}
