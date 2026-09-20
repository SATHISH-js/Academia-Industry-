const fs = require('fs');
const path = require('path');

const certDir = path.join(__dirname, '..', 'uploads', 'certificates');
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
}

function createSvg(title, recipient, date, id) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#bg)" rx="24"/>
  <rect x="30" y="30" width="740" height="540" fill="none" stroke="url(#gold)" stroke-width="4" rx="16"/>
  <rect x="45" y="45" width="710" height="510" fill="none" stroke="#334155" stroke-width="1" rx="12"/>
  <text x="400" y="120" fill="#94a3b8" font-family="sans-serif" font-size="16" font-weight="600" text-anchor="middle" letter-spacing="4">ACADEMIA-INDUSTRY COLLABORATION PORTAL</text>
  <text x="400" y="180" fill="#ffffff" font-family="sans-serif" font-size="34" font-weight="800" text-anchor="middle">CERTIFICATE OF COMPLETION</text>
  <text x="400" y="230" fill="#94a3b8" font-family="sans-serif" font-size="15" text-anchor="middle">This is proudly presented to</text>
  <text x="400" y="285" fill="url(#gold)" font-family="sans-serif" font-size="32" font-weight="800" text-anchor="middle">${recipient}</text>
  <text x="400" y="340" fill="#cbd5e1" font-family="sans-serif" font-size="18" text-anchor="middle">for successfully demonstrating verified mastery in</text>
  <text x="400" y="390" fill="#ffffff" font-family="sans-serif" font-size="26" font-weight="700" text-anchor="middle">${title}</text>
  <text x="200" y="490" fill="#94a3b8" font-family="sans-serif" font-size="13">Date: ${date}</text>
  <text x="600" y="490" fill="#94a3b8" font-family="sans-serif" font-size="13" text-anchor="end">ID: ${id}</text>
  <circle cx="400" cy="485" r="36" fill="#4f46e5"/>
  <path d="M390 485 L397 492 L412 477" stroke="#ffffff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="400" y="535" fill="#818cf8" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">AI VERIFIED BADGE</text>
</svg>`;
}

fs.writeFileSync(path.join(certDir, 'sample_ml_cert.png'), createSvg('Advanced Machine Learning & Neural Networks', 'Aarav Sharma', 'September 2026', 'AI-ML-88219'));
fs.writeFileSync(path.join(certDir, 'sample_react_cert.png'), createSvg('Full-Stack Modern Web Architecture', 'Priya Patel', 'September 2026', 'AI-WEB-49102'));
console.log('[Certificates] Generated sample demo certificates in', certDir);
