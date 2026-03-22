"use client";

export default function NovionLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-label="Novion logo"
      role="img"
    >
      {/* Abstract network/matchmaking mark: connected nodes */}
      <circle cx="14" cy="14" r="4" fill="currentColor" opacity="0.9" />
      <circle cx="34" cy="14" r="4" fill="currentColor" opacity="0.6" />
      <circle cx="24" cy="34" r="5" fill="var(--primary)" />
      <line
        x1="14"
        y1="14"
        x2="34"
        y2="14"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.3"
      />
      <line
        x1="14"
        y1="14"
        x2="24"
        y2="34"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.4"
      />
      <line
        x1="34"
        y1="14"
        x2="24"
        y2="34"
        stroke="var(--primary)"
        strokeWidth="1.5"
        opacity="0.6"
      />
    </svg>
  );
}
