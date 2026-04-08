import React from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';

const MEASUREMENT_ID = process.env.EXPO_PUBLIC_GA_MEASUREMENT_ID || 'G-J7Y2KJ4MCM';

export default function RootHtml({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <ScrollViewStyleReset />
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
