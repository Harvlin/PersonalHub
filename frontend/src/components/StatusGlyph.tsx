import type { Status } from "@/lib/store";

type Props = { status: Status; size?: number; className?: string };

export function StatusGlyph({ status, size = 13, className }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 16 16",
    className,
    "aria-hidden": true as const,
  };

  if (status === "done") {
    return (
      <svg {...common}>
        <circle cx="8" cy="8" r="6" fill="currentColor" />
      </svg>
    );
  }
  if (status === "in_progress") {
    return (
      <svg {...common}>
        <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 2 A6 6 0 0 1 8 14 Z" fill="currentColor" />
      </svg>
    );
  }
  if (status === "waiting") {
    return (
      <svg {...common}>
        <circle
          cx="8"
          cy="8"
          r="6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="2.4 2.2"
        />
      </svg>
    );
  }
  if (status === "blocked") {
    return (
      <svg {...common}>
        <circle cx="8" cy="8" r="6" className="fill-signal" />
        <path
          d="M5.8 5.8 L10.2 10.2 M10.2 5.8 L5.8 10.2"
          stroke="var(--paper)"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
