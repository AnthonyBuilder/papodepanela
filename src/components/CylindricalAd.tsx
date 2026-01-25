import { useEffect, useRef } from 'react';

interface CylindricalAdProps {
  className?: string;
}

declare global {
  interface Window {
    gzysbu?: any;
  }
}

export default function CylindricalAd({ className = '' }: CylindricalAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (scriptLoadedRef.current || !containerRef.current) return;

    // Create the inline script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = `
      (function(gzysbu){
        var d = document,
            s = d.createElement('script'),
            l = d.scripts[d.scripts.length - 1];
        s.settings = gzysbu || {};
        s.src = "//cylindrical-presentation.com/beXNV.skdlG/lE0QYcWFcI/TePm/9BuRZVUvlAkDPxTJYs3INFT/Yk3/NlzcADtqN/j/cA1tNZj/cz3eMdQ_";
        s.async = true;
        s.referrerPolicy = 'no-referrer-when-downgrade';
        l.parentNode.insertBefore(s, l);
      })({})
    `;
    
    containerRef.current.appendChild(script);
    scriptLoadedRef.current = true;

    return () => {
      // Cleanup
      if (containerRef.current && script.parentNode) {
        script.parentNode.removeChild(script);
      }
      scriptLoadedRef.current = false;
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`mx-auto overflow-hidden ${className}`}
      style={{ 
        textAlign: 'center',
        margin: '20px auto',
        maxWidth: '100%',
        minHeight: '90px'
      }}
    />
  );
}
