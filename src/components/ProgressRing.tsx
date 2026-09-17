interface ProgressRingProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  sublabel?: string;
}

/** A large circular progress indicator used in the dashboard hero section. */
export function ProgressRing({ percent, size = 132, strokeWidth = 12, label, sublabel }: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="progress-ring" role="img" aria-label={`${label}: ${clamped} percent complete`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle className="progress-ring-track" cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} fill="none" />
        <circle
          className="progress-ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="progress-ring-center">
        <div className="progress-ring-value">{clamped}%</div>
        {sublabel && <div className="progress-ring-sublabel">{sublabel}</div>}
      </div>
    </div>
  );
}
