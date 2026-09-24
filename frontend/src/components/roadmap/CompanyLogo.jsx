import React, { useState } from 'react';
import { Building2, Layers, Cpu, ShieldCheck, Zap, Globe, Sparkles, Terminal } from 'lucide-react';

// Pre-defined company assets with high-res official vector SVGs and fallback vector renderers
const COMPANY_CONFIGS = {
  wipro: {
    name: 'Wipro',
    fullName: 'Wipro Technologies',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Logo_%282017%29.svg',
    primaryColor: '#e11d48',
    bgColor: '#fff1f2',
    borderColor: '#fecdd3',
    fallbackSvg: (
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <circle cx="50" cy="50" r="46" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
        {/* Multi-colored dots iconic pattern */}
        <circle cx="50" cy="24" r="6.5" fill="#ef4444" />
        <circle cx="70" cy="36" r="6.5" fill="#f59e0b" />
        <circle cx="74" cy="60" r="6.5" fill="#10b981" />
        <circle cx="58" cy="78" r="6.5" fill="#06b6d4" />
        <circle cx="34" cy="74" r="6.5" fill="#3b82f6" />
        <circle cx="24" cy="52" r="6.5" fill="#8b5cf6" />
        <circle cx="32" cy="32" r="6.5" fill="#ec4899" />
        <text x="50" y="54" textAnchor="middle" fontSize="13" fontWeight="900" fill="#0f172a" fontFamily="sans-serif">wipro</text>
      </svg>
    )
  },
  google: {
    name: 'Google',
    fullName: 'Google LLC',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
    primaryColor: '#4285F4',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
    fallbackSvg: (
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <circle cx="50" cy="50" r="46" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
        <path d="M50 32 C60 32 67 36 71 40 L62 49 C59 46 55 44 50 44 C41 44 34 50 34 59 C34 68 41 74 50 74 C58 74 63 69 64 63 L50 63 L50 52 L76 52 C77 55 77 58 77 62 C77 75 67 85 50 85 C32 85 18 73 18 59 C18 45 32 32 50 32 Z" fill="#4285F4"/>
        <path d="M71 40 L62 49 C59 46 55 44 50 44 C41 44 34 50 34 59 L18 59 C18 45 32 32 50 32 C60 32 67 36 71 40 Z" fill="#EA4335"/>
        <path d="M18 59 C18 63 19 67 21 71 L34 61 C34 60 34 59 34 59 L18 59 Z" fill="#FBBC05"/>
        <path d="M50 85 C67 85 77 75 77 62 C77 58 77 55 76 52 L64 52 C63 69 58 74 50 74 C41 74 34 68 34 59 L21 71 C27 80 38 85 50 85 Z" fill="#34A853"/>
      </svg>
    )
  },
  amazon: {
    name: 'Amazon',
    fullName: 'Amazon AWS',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    primaryColor: '#FF9900',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
    fallbackSvg: (
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <rect width="100" height="100" rx="20" fill="#232F3E"/>
        <text x="50" y="50" textAnchor="middle" fontSize="24" fontWeight="900" fill="#ffffff" fontFamily="sans-serif">a</text>
        <path d="M28 65 Q50 80 72 65" fill="none" stroke="#FF9900" strokeWidth="4" strokeLinecap="round"/>
        <path d="M68 60 L75 66 L68 70" fill="#FF9900"/>
      </svg>
    )
  },
  microsoft: {
    name: 'Microsoft',
    fullName: 'Microsoft Corporation',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
    primaryColor: '#00A4EF',
    bgColor: '#f0f9ff',
    borderColor: '#bae6fd',
    fallbackSvg: (
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <rect width="100" height="100" rx="16" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2"/>
        <rect x="24" y="24" width="22" height="22" fill="#F25022"/>
        <rect x="54" y="24" width="22" height="22" fill="#7FBA00"/>
        <rect x="24" y="54" width="22" height="22" fill="#00A4EF"/>
        <rect x="54" y="54" width="22" height="22" fill="#FFB900"/>
      </svg>
    )
  },
  tcs: {
    name: 'TCS',
    fullName: 'Tata Consultancy Services',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg',
    primaryColor: '#002B49',
    bgColor: '#f0f4f8',
    borderColor: '#cbd5e1',
    fallbackSvg: (
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <rect width="100" height="100" rx="16" fill="#002B49"/>
        <text x="50" y="44" textAnchor="middle" fontSize="18" fontWeight="800" fill="#ffffff" letterSpacing="2">TATA</text>
        <text x="50" y="68" textAnchor="middle" fontSize="22" fontWeight="900" fill="#00A3E0">TCS</text>
      </svg>
    )
  },
  infosys: {
    name: 'Infosys',
    fullName: 'Infosys Limited',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg',
    primaryColor: '#007cc3',
    bgColor: '#f0f9ff',
    borderColor: '#bae6fd',
    fallbackSvg: (
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <rect width="100" height="100" rx="16" fill="#007cc3"/>
        <text x="50" y="58" textAnchor="middle" fontSize="20" fontWeight="900" fill="#ffffff" letterSpacing="1">Infosys</text>
      </svg>
    )
  },
  meta: {
    name: 'Meta',
    fullName: 'Meta Platforms',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
    primaryColor: '#0668E1',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
    fallbackSvg: (
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <rect width="100" height="100" rx="16" fill="#0668E1"/>
        <path d="M28 50 C28 42 35 36 43 45 C48 51 52 51 57 45 C65 36 72 42 72 50 C72 58 65 64 57 55 C52 49 48 49 43 55 C35 64 28 58 28 50 Z" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinecap="round"/>
      </svg>
    )
  },
  tesla: {
    name: 'Tesla',
    fullName: 'Tesla Motors',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg',
    primaryColor: '#E82127',
    bgColor: '#fef2f2',
    borderColor: '#fecaca',
    fallbackSvg: (
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <rect width="100" height="100" rx="16" fill="#18181b"/>
        <path d="M25 32 Q50 36 75 32 L72 38 Q50 41 28 38 Z" fill="#E82127"/>
        <path d="M47 42 L53 42 L53 72 L47 72 Z" fill="#E82127"/>
        <path d="M38 42 Q50 48 62 42 L57 46 Q50 51 43 46 Z" fill="#E82127"/>
      </svg>
    )
  },
  cisco: {
    name: 'Cisco',
    fullName: 'Cisco Systems',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg',
    primaryColor: '#049fd9',
    bgColor: '#f0fdfa',
    borderColor: '#99f6e4',
    fallbackSvg: (
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <rect width="100" height="100" rx="16" fill="#049fd9"/>
        <text x="50" y="58" textAnchor="middle" fontSize="18" fontWeight="900" fill="#ffffff" letterSpacing="1">CISCO</text>
      </svg>
    )
  },
  techcorp: {
    name: 'TechCorp',
    fullName: 'TechCorp Solutions',
    logoUrl: null,
    primaryColor: '#4f46e5',
    bgColor: '#eef2ff',
    borderColor: '#c7d2fe',
    fallbackSvg: (
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <rect width="100" height="100" rx="16" fill="url(#tcGrad)"/>
        <defs>
          <linearGradient id="tcGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4f46e5"/>
            <stop offset="100%" stopColor="#7c3aed"/>
          </linearGradient>
        </defs>
        <rect x="28" y="28" width="44" height="44" rx="8" fill="#ffffff" opacity="0.2"/>
        <path d="M36 40 L64 40 M50 40 L50 68" stroke="#ffffff" strokeWidth="6" strokeLinecap="round"/>
      </svg>
    )
  }
};

/**
 * Resolves company config based on company_name or title
 */
export function getCompanyMeta(companyName = '', title = '') {
  const compStr = (companyName || '').toLowerCase().trim();
  const titleStr = (title || '').toLowerCase().trim();
  const searchStr = `${compStr} ${titleStr}`;

  if (searchStr.includes('wipro')) return COMPANY_CONFIGS.wipro;
  if (searchStr.includes('google')) return COMPANY_CONFIGS.google;
  if (searchStr.includes('amazon') || searchStr.includes('aws')) return COMPANY_CONFIGS.amazon;
  if (searchStr.includes('microsoft') || searchStr.includes('azure')) return COMPANY_CONFIGS.microsoft;
  if (searchStr.includes('tcs') || searchStr.includes('tata')) return COMPANY_CONFIGS.tcs;
  if (searchStr.includes('infosys')) return COMPANY_CONFIGS.infosys;
  if (searchStr.includes('meta') || searchStr.includes('facebook')) return COMPANY_CONFIGS.meta;
  if (searchStr.includes('tesla')) return COMPANY_CONFIGS.tesla;
  if (searchStr.includes('cisco')) return COMPANY_CONFIGS.cisco;
  if (searchStr.includes('techcorp')) return COMPANY_CONFIGS.techcorp;

  // Custom or clean name fallback
  const cleanName = companyName && companyName.trim() ? companyName.trim() : null;
  return {
    name: cleanName || 'Tech Industry Track',
    fullName: cleanName || 'Industry Curriculum Track',
    logoUrl: null,
    primaryColor: '#4f46e5',
    bgColor: '#f8fafc',
    borderColor: '#e2e8f0',
    fallbackSvg: (
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <rect width="100" height="100" rx="16" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2"/>
        <circle cx="50" cy="50" r="24" fill="#e2e8f0"/>
        <text x="50" y="57" textAnchor="middle" fontSize="22" fontWeight="900" fill="#475569">
          {(cleanName || 'IT').slice(0, 2).toUpperCase()}
        </text>
      </svg>
    )
  };
}

/**
 * CompanyLogo Component
 * Renders company/track image with optional company name displayed right underneath
 */
export const CompanyLogo = ({
  companyName = '',
  title = '',
  size = 52,
  showNameBelow = false,
  nameStyle = {},
  style = {},
  className = ''
}) => {
  const [imgError, setImgError] = useState(false);
  const meta = getCompanyMeta(companyName, title);

  const logoNode = (
    <div
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        border: `1.5px solid ${meta.borderColor || '#e2e8f0'}`,
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: '6px',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        ...style
      }}
      className={className}
      title={meta.fullName || meta.name}
    >
      {meta.logoUrl && !imgError ? (
        <img
          src={meta.logoUrl}
          alt={meta.name}
          onError={() => setImgError(true)}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain'
          }}
          loading="lazy"
        />
      ) : (
        meta.fallbackSvg
      )}
    </div>
  );

  if (!showNameBelow) {
    return logoNode;
  }

  return (
    <div style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: '0.4rem',
      userSelect: 'none'
    }}>
      {logoNode}
      <span
        style={{
          fontSize: '0.82rem',
          fontWeight: 800,
          color: 'var(--slate-800)',
          letterSpacing: '0.02em',
          maxWidth: size * 2.2,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          ...nameStyle
        }}
      >
        {meta.name}
      </span>
    </div>
  );
};

export default CompanyLogo;
