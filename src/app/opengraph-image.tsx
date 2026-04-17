import { ImageResponse } from 'next/og';

// Image metadata
export const alt = 'CollegeComps — College ROI Calculator';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

// Route segment config — this is a server-side route, render on build/revalidate
export const runtime = 'edge';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'radial-gradient(ellipse 80% 50% at 20% 10%, rgba(249, 115, 22, 0.25), transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(249, 115, 22, 0.2), transparent 60%), #000',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
          padding: '80px',
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#f97316',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            marginBottom: 24,
          }}
        >
          Stop Guessing. Start Calculating.
        </div>
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            textAlign: 'center',
            maxWidth: 1000,
          }}
        >
          Is Your Degree{' '}
          <span
            style={{
              background: 'linear-gradient(90deg, #fb923c, #f97316, #ea580c)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            (Really)
          </span>{' '}
          Worth the Debt?
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 30,
            color: '#9ca3af',
            display: 'flex',
            gap: 48,
            alignItems: 'center',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#f97316', fontSize: 36 }}>●</span> 6,000+ colleges
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#f97316', fontSize: 36 }}>●</span> 8.9M programs
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#f97316', fontSize: 36 }}>●</span> Federal data
          </span>
        </div>
        <div
          style={{
            marginTop: 56,
            fontSize: 24,
            color: '#6b7280',
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}
        >
          COLLEGECOMPS.COM
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
