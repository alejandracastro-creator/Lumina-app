import React from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';

const MEASUREMENT_ID = process.env.EXPO_PUBLIC_GA_MEASUREMENT_ID || 'G-J7Y2KJ4MCM';
const ASSET_VERSION = process.env.EXPO_PUBLIC_ASSET_VERSION || '1';

export default function RootHtml({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0B0720" />
        <meta name="color-scheme" content="dark" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="LUMINA" />
        <ScrollViewStyleReset />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="icon" href="/icons/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href={`/icons/apple-touch-icon.png?v=${ASSET_VERSION}`} sizes="180x180" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#4C1D95" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
html, body, #root { background-color: #0B0720; }
`,
          }}
        />
        <script async src="https://identity.netlify.com/v1/netlify-identity-widget.js" />
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${MEASUREMENT_ID}', { send_page_view: false });
`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
