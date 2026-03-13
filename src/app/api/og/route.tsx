import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get('title') || 'Toolverse';
  const description =
    searchParams.get('description') ||
    'Discover, create, and use the world\'s best software tools';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #030014 0%, #0f0a2e 50%, #1a0a3e 100%)',
        }}
      >
        {/* Logo icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '24px',
            }}
          >
            <span
              style={{
                fontSize: '48px',
                fontWeight: 800,
                color: 'white',
              }}
            >
              T
            </span>
          </div>
          <span
            style={{
              fontSize: '36px',
              fontWeight: 700,
              color: '#a78bfa',
              letterSpacing: '-0.02em',
            }}
          >
            Toolverse
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: title.length > 30 ? '48px' : '56px',
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.2,
            margin: 0,
            marginBottom: '20px',
            letterSpacing: '-0.03em',
          }}
        >
          {title}
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: '24px',
            color: '#9ca3af',
            margin: 0,
            lineHeight: 1.5,
            maxWidth: '800px',
          }}
        >
          {description}
        </p>

        {/* Accent bar */}
        <div
          style={{
            marginTop: '48px',
            width: '200px',
            height: '4px',
            borderRadius: '2px',
            background: 'linear-gradient(90deg, #7c3aed, #4f46e5)',
            opacity: 0.6,
          }}
        />

        {/* Footer tagline */}
        <p
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '80px',
            fontSize: '18px',
            color: '#6b7280',
            margin: 0,
          }}
        >
          The Universe of Tools
        </p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
