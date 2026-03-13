import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 38,
          background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
        }}
      >
        <span
          style={{
            fontSize: 100,
            fontWeight: 800,
            color: 'white',
            lineHeight: 1,
            marginTop: -8,
          }}
        >
          T
        </span>
      </div>
    ),
    { ...size },
  );
}
