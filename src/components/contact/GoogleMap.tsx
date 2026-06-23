import { useState } from 'preact/hooks';

interface GoogleMapProps {
  address?: string;
  height?: string;
}

export default function GoogleMap({
  address = '296 Brock Ave, Toronto, ON M6K 2M4',
  height = '400px',
}: GoogleMapProps) {
  const [mapFailed, setMapFailed] = useState(false);

  const encodedAddress = encodeURIComponent(address);
  const embedUrl = `https://www.google.com/maps?q=${encodedAddress.replace(/%20/g, '+')}&output=embed`;
  const fallbackUrl = `https://www.google.com/maps/search/${encodedAddress.replace(/%20/g, '+')}`;

  if (mapFailed) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <a
          href={fallbackUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#F5C400',
            textDecoration: 'underline',
            fontSize: '16px',
          }}
        >
          {address}
        </a>
      </div>
    );
  }

  return (
    <iframe
      src={embedUrl}
      width="100%"
      height={height}
      style={{ border: 'none', borderRadius: '24px', display: 'block' }}
      loading="lazy"
      allowFullScreen
      aria-label="Google Maps showing ASM AUTO Repair location"
      title="Google Maps showing ASM AUTO Repair location"
      onError={() => setMapFailed(true)}
    />
  );
}
