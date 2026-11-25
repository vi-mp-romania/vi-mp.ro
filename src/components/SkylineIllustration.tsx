/** Built-in neon sunset skyline, shown wherever no image URL is configured. */
import { useId } from 'react';
import { cn } from '@/lib/cn';

// Constants
/** Building silhouettes as [x, width, height] on a 800-wide canvas, left to right. */
const BUILDINGS: readonly (readonly [number, number, number])[] = [
  [40, 26, 70], [70, 18, 110], [92, 30, 150], [126, 22, 95], [152, 34, 185], [190, 20, 130],
  [214, 28, 210], [246, 18, 120], [268, 36, 165], [308, 22, 105], [334, 30, 140], [368, 16, 90],
  [470, 26, 120], [500, 34, 200], [538, 20, 150], [562, 30, 235], [596, 22, 140], [622, 36, 180],
  [662, 18, 100], [684, 28, 130], [716, 20, 85],
];

/** Palm trees as [x, height, lean], lean in degrees. */
const PALMS: readonly (readonly [number, number, number])[] = [
  [20, 230, -6], [760, 260, 5], [420, 150, 3],
];

const HORIZON = 330; // y of the water line

/** Props of SkylineIllustration. */
interface Props {
  className?: string;
  hasSun?: boolean; // draw the sun disc (off for small thumbnails)
}

/** Decorative SVG scene (aria-hidden): gradient sky, sun, towers with lit windows, palms, water. */
export function SkylineIllustration({ className, hasSun = true }: Props) {
  // Gradient ids must be unique per instance; useId output is reduced to characters url() accepts.
  const prefix = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const paint = (name: string) => `url(#${prefix}${name})`;

  return (
    <svg
      viewBox="0 0 800 450"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={cn('h-full w-full', className)}
    >
      <defs>
        <linearGradient id={`${prefix}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b1440" />
          <stop offset="0.45" stopColor="#6b2f7a" />
          <stop offset="0.8" stopColor="#f2709c" />
          <stop offset="1" stopColor="#ffb36b" />
        </linearGradient>
        <linearGradient id={`${prefix}sun`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd29a" />
          <stop offset="1" stopColor="#ff6aa6" />
        </linearGradient>
        <linearGradient id={`${prefix}water`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a2a6e" />
          <stop offset="1" stopColor="#0d0b1a" />
        </linearGradient>
        <linearGradient id={`${prefix}fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.6" stopColor="#0d0b1a" stopOpacity="0" />
          <stop offset="1" stopColor="#0d0b1a" />
        </linearGradient>
      </defs>

      {/* Sky and sun */}
      <rect width="800" height={HORIZON} fill={paint('sky')} />
      {hasSun && <circle cx="420" cy={HORIZON - 40} r="90" fill={paint('sun')} opacity="0.85" />}

      {/* Towers with a few lit windows each */}
      <g fill="#1a1230">
        {BUILDINGS.map(([x, width, height]) => (
          <g key={x}>
            <rect x={x} y={HORIZON - height} width={width} height={height} />
            {Array.from({ length: Math.floor(height / 22) }, (_, row) => (
              <rect
                key={row}
                x={x + 4 + ((row * 7) % Math.max(1, width - 10))}
                y={HORIZON - height + 10 + row * 22}
                width="4"
                height="5"
                fill={row % 3 === 0 ? '#7fe7ff' : '#ffb36b'}
                opacity="0.8"
              />
            ))}
          </g>
        ))}
      </g>

      {/* Water with streaked reflections */}
      <rect y={HORIZON} width="800" height={450 - HORIZON} fill={paint('water')} />
      <g stroke="#ff86b8" strokeWidth="2" opacity="0.45">
        {BUILDINGS.filter((_, index) => index % 2 === 0).map(([x, width]) => (
          <line key={x} x1={x + width / 2} y1={HORIZON + 8} x2={x + width / 2} y2={HORIZON + 60} />
        ))}
      </g>

      {/* Palms in the foreground */}
      {PALMS.map(([x, height, lean]) => (
        <g key={x} transform={`rotate(${lean} ${x} 450)`} fill="#0b0816" stroke="#0b0816">
          <path d={`M${x - 4} 450 Q${x + 6} ${450 - height / 2} ${x} ${450 - height}`} strokeWidth="9" fill="none" />
          {[-150, -110, -70, -30, 10, 40].map((angle) => (
            <path
              key={angle}
              transform={`rotate(${angle} ${x} ${450 - height})`}
              d={`M${x} ${450 - height} q30 -18 70 6 q-38 -4 -70 -6z`}
              strokeWidth="2"
            />
          ))}
        </g>
      ))}

      <rect width="800" height="450" fill={paint('fade')} />
    </svg>
  );
}
