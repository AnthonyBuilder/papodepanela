import { useEffect } from 'react';

interface AdBannerProps {
  slot?: string;
  format?: string;
  responsive?: boolean;
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function AdBanner({ 
  slot = '7126064905',
  format = 'auto',
  responsive = true,
  style = { display: 'block' }
}: AdBannerProps) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <ins 
      className="adsbygoogle"
      style={style}
      data-ad-client="ca-pub-6045768913014450"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive.toString()}
    />
  );
}
