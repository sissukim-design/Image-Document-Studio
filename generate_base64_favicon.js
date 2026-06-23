import fs from 'node:fs';

// Gorgeous Violet Shield + Yellow Lightning icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8b5cf6" />
      <stop offset="105%" stop-color="#5b21b6" />
    </linearGradient>
    <linearGradient id="lightning-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="100%" stop-color="#eab308" />
    </linearGradient>
  </defs>
  <!-- Beautiful Clean Shield Shape acting as icon background -->
  <path d="M 50 8 C 72 8 88 18 88 18 C 88 48 76 78 50 93 C 24 78 12 48 12 18 C 12 18 28 8 50 8 Z" fill="url(#shield-grad)" stroke="#ffffff" stroke-width="2" />
  <!-- Inner Rim for Tech look -->
  <path d="M 50 14 C 68 14 81.5 22.5 81.5 22.5 C 81.5 47.5 71.5 72.5 50 85 C 28.5 72.5 18.5 47.5 18.5 22.5 C 18.5 22.5 32 14 50 14 Z" fill="none" stroke="#c084fc" stroke-width="1.5" stroke-opacity="0.4" />
  <!-- Vibrant Dynamic Lightning Bolt -->
  <path d="M 54 22 L 32 52 H 49 L 44 78 L 70 46 H 51 L 54 22 Z" fill="url(#lightning-grad)" />
</svg>`;

// Write to public/favicon.svg
fs.writeFileSync('public/favicon.svg', svgContent, 'utf8');
console.log("Successfully wrote to public/favicon.svg!");

// Encode to Base64 for inline utilization in index.html to avoid browser caching issues completely
const base64Svg = Buffer.from(svgContent.trim()).toString('base64');
const dataUri = `data:image/svg+xml;base64,${base64Svg}`;

let indexHtml = fs.readFileSync('index.html', 'utf8');

// Replace standard favicon links with dynamic high-priority data URI
indexHtml = indexHtml.replace(
  /<link rel="icon".*?\/>/g,
  `<link rel="icon" type="image/svg+xml" href="${dataUri}" />`
);

indexHtml = indexHtml.replace(
  /<link rel="shortcut icon".*?\/>/g,
  `<link rel="shortcut icon" type="image/svg+xml" href="${dataUri}" />`
);

indexHtml = indexHtml.replace(
  /<link rel="apple-touch-icon".*?\/>/g,
  `<link rel="apple-touch-icon" href="${dataUri}" />`
);

fs.writeFileSync('index.html', indexHtml, 'utf8');
console.log("Successfully updated index.html with inline base64 Shield with Lightning SVG favicon!");
