import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 108,
          background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
        }}
      >
        <span
          style={{
            fontSize: 280,
            fontWeight: 800,
            color: 'white',
            lineHeight: 1,
            marginTop: -20,
          }}
        >
          T
        </span>
      </div>
    ),
    { ...size },
  );
}
