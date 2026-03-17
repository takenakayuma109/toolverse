'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      setStatus('error');
      setErrorMessage('Missing authorization code. Please try again.');
      return;
    }

    // Post the OAuth callback data to the opener window (SDK popup flow)
    if (window.opener) {
      window.opener.postMessage(
        { type: 'toolverse-oauth-callback', code, state },
        '*'
      );

      // Close the popup after a short delay to ensure the message is received
      setTimeout(() => {
        window.close();
      }, 500);
    } else {
      // If there's no opener, the user may have navigated here directly
      setStatus('error');
      setErrorMessage(
        'This page should be opened as a popup from the Toolverse SDK. Please try again from your application.'
      );
    }
  }, [searchParams]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      {status === 'processing' && (
        <>
          <div
            style={{
              width: 40,
              height: 40,
              border: '3px solid #e5e7eb',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <p style={{ marginTop: '1rem', color: '#6b7280', fontSize: '1rem' }}>
            Authenticating...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
      )}
      {status === 'error' && (
        <>
          <p style={{ color: '#ef4444', fontSize: '1.125rem', fontWeight: 600 }}>
            Authentication Error
          </p>
          <p style={{ marginTop: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
            {errorMessage}
          </p>
        </>
      )}
    </div>
  );
}

export default function ToolverseCallbackPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <p style={{ color: '#6b7280' }}>Loading...</p>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
