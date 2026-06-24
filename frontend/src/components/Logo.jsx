export default function Logo({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Bank logo"
      className="brand-logo"
    >
      <rect width="64" height="64" rx="12" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
      <g transform="translate(8 14)">
        <path d="M0 18 L24 0 L48 18 Z" fill="#012169" />
        <rect x="0" y="20" width="48" height="4.5" rx="2" fill="#e31837" />
        <rect x="0" y="28" width="48" height="4.5" rx="2" fill="#012169" />
      </g>
    </svg>
  )
}
