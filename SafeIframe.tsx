/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';

interface SafeIframeProps {
  html: string;
}

export default function SafeIframe({ html }: SafeIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Build standard high-fidelity styles for inside the email structure
    const baseStyle = `
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #334155;
          margin: 16px;
          word-break: break-all;
          overflow-wrap: break-word;
        }
        img {
          max-width: 100% !important;
          height: auto !important;
        }
        a {
          color: #2563eb;
          text-decoration: underline;
        }
        pre {
          background-color: #f1f5f9;
          padding: 12px;
          border-radius: 8px;
          overflow-x: auto;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 13px;
        }
      </style>
    `;

    // Combine email html with default styling and sandboxing attributes
    const combinedContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          ${baseStyle}
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;

    iframe.srcdoc = combinedContent;
  }, [html]);

  return (
    <iframe
      ref={iframeRef}
      title="Email Content Representation"
      sandbox="allow-popups allow-popups-to-escape-sandbox"
      referrerPolicy="no-referrer"
      className="w-full h-full border-0 bg-white"
    />
  );
}
