/**
 * Stylised purple lily with a golden arc and sparkles (hero illustration).
 * Pure SVG so it scales crisply; swap for a photo later if desired.
 */

const PETAL =
  "M0 6C-32-30-66-110-34-200C-20-242 20-242 34-200C66-110 32-30 0 6Z";
const MIDRIB = "M0 0C-3-70-3-140 0-225";

/** Concave four-point star path centred on (cx, cy) with radius r. */
function star(cx: number, cy: number, r: number) {
  const k = r * 0.14;
  return [
    `M${cx} ${cy - r}`,
    `C${cx + k} ${cy - k} ${cx + k} ${cy - k} ${cx + r} ${cy}`,
    `C${cx + k} ${cy + k} ${cx + k} ${cy + k} ${cx} ${cy + r}`,
    `C${cx - k} ${cy + k} ${cx - k} ${cy + k} ${cx - r} ${cy}`,
    `C${cx - k} ${cy - k} ${cx - k} ${cy - k} ${cx} ${cy - r}Z`,
  ].join(" ");
}

const stamenAngles = [12, 72, 132, 192, 252, 312];

export function LilyArt({ className = "" }: { className?: string }) {
  return (
    <div className={`relative mx-auto w-full max-w-[620px] ${className}`}>
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(150,55,185,0.5),rgba(150,55,185,0.14)_55%,transparent)] blur-2xl"
      />
      <svg
        viewBox="0 0 640 560"
        role="img"
        aria-label="Purple lily with a golden arc and sparkles"
        className="relative h-auto w-full"
      >
        <defs>
          <linearGradient id="goldArc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffe76a" />
            <stop offset="0.55" stopColor="#e9c92a" />
            <stop offset="1" stopColor="#e9c92a" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="petalBack" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#36093f" />
            <stop offset="0.45" stopColor="#761e92" />
            <stop offset="1" stopColor="#b35acb" />
          </linearGradient>
          <linearGradient id="petalFront" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#4a0f5c" />
            <stop offset="0.4" stopColor="#9a2cb8" />
            <stop offset="0.82" stopColor="#cf7ce1" />
            <stop offset="1" stopColor="#efd6f5" />
          </linearGradient>
          <linearGradient id="petalEdge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#f6e3fa" stopOpacity="0.5" />
            <stop offset="0.3" stopColor="#f6e3fa" stopOpacity="0" />
            <stop offset="0.7" stopColor="#f6e3fa" stopOpacity="0" />
            <stop offset="1" stopColor="#f6e3fa" stopOpacity="0.5" />
          </linearGradient>
          <radialGradient id="centerShade" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#24042d" stopOpacity="0.95" />
            <stop offset="0.6" stopColor="#24042d" stopOpacity="0.45" />
            <stop offset="1" stopColor="#24042d" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="spotFade" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#fff" />
            <stop offset="0.5" stopColor="#fff" />
            <stop offset="0.8" stopColor="#000" />
          </linearGradient>
          <mask id="spotMask" maskUnits="userSpaceOnUse" x="-80" y="-260" width="160" height="270">
            <rect x="-80" y="-260" width="160" height="270" fill="url(#spotFade)" />
          </mask>
          <pattern id="spots" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="5" r="1.7" fill="#25042e" opacity="0.7" />
            <circle cx="12" cy="12" r="1.2" fill="#25042e" opacity="0.55" />
          </pattern>
          <linearGradient id="leaf" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#1f3328" />
            <stop offset="1" stopColor="#3b6a49" />
          </linearGradient>
          <linearGradient id="bud" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#2f3a2d" />
            <stop offset="0.35" stopColor="#5a1a70" />
            <stop offset="1" stopColor="#a74dc0" />
          </linearGradient>

          <filter id="softGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="petalShadow" x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#0d0212" floodOpacity="0.55" />
          </filter>

          <g id="petal-back">
            <path d={PETAL} fill="url(#petalBack)" />
            <path d={PETAL} fill="url(#spots)" mask="url(#spotMask)" opacity="0.6" />
            <path d={MIDRIB} stroke="#12021a" strokeOpacity="0.35" strokeWidth="2" fill="none" />
          </g>
          <g id="petal-front">
            <path d={PETAL} fill="url(#petalFront)" />
            <path d={PETAL} fill="url(#petalEdge)" />
            <path d={PETAL} fill="url(#spots)" mask="url(#spotMask)" opacity="0.8" />
            <path d={MIDRIB} stroke="#fff" strokeOpacity="0.18" strokeWidth="1.5" fill="none" />
          </g>
          <g id="stamen">
            <path
              d="M0 0C10-25 25-55 36-86"
              stroke="#ecc9f1"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            <ellipse cx="38" cy="-91" rx="10" ry="4" fill="#b85a1a" transform="rotate(-68 38 -91)" />
          </g>
        </defs>

        {/* golden arc */}
        <circle
          cx="330"
          cy="258"
          r="206"
          fill="none"
          stroke="url(#goldArc)"
          strokeWidth="3.5"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="66 34"
          transform="rotate(150 330 258)"
        />

        {/* sparkles */}
        <g fill="#f6e24a" filter="url(#softGlow)">
          <path
            d={star(168, 150, 26)}
            className="animate-twinkle"
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          />
          <path
            d={star(576, 168, 12)}
            className="animate-twinkle-slow"
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          />
          <path d={star(436, 478, 8)} fill="#e6c8eb" opacity="0.9" />
        </g>
        <g fill="#f1e2f4" opacity="0.55">
          <circle cx="112" cy="262" r="1.6" />
          <circle cx="520" cy="90" r="1.3" />
          <circle cx="600" cy="300" r="1.8" />
          <circle cx="250" cy="500" r="1.2" />
        </g>

        {/* flower */}
        <g className="animate-float">
          {/* leaves */}
          <path
            d="M350 426C430 404 512 414 574 478C512 456 430 456 350 426Z"
            fill="url(#leaf)"
            opacity="0.9"
          />
          <path
            d="M298 438C238 448 186 486 146 536C206 496 258 468 298 438Z"
            fill="url(#leaf)"
            opacity="0.8"
          />

          {/* bud + stem */}
          <g transform="translate(548 212) rotate(24)">
            <path
              d="M0 64C-10 110-44 150-124 184"
              stroke="url(#leaf)"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            <path d="M0-72C24-42 28 12 0 64C-28 12-24-42 0-72Z" fill="url(#bud)" />
            <path
              d="M0-72C9-30 9 20 0 64"
              stroke="#e6c0ee"
              strokeOpacity="0.25"
              strokeWidth="1.5"
              fill="none"
            />
            <path d="M-11-40C-3-8-3 30-7 56" stroke="#24042d" strokeOpacity="0.45" fill="none" />
          </g>

          {/* petals */}
          <g transform="translate(322 300) rotate(-10) scale(1.06 0.98)" filter="url(#petalShadow)">
            <use href="#petal-back" transform="rotate(-6) scale(0.9)" />
            <use href="#petal-back" transform="rotate(114) scale(0.92)" />
            <use href="#petal-back" transform="rotate(238) scale(0.9)" />
            <use href="#petal-front" transform="rotate(56) scale(0.98)" />
            <use href="#petal-front" transform="rotate(178) scale(1.08)" />
            <use href="#petal-front" transform="rotate(298) scale(1)" />

            <circle r="72" fill="url(#centerShade)" />

            {/* stamens + pistil */}
            {stamenAngles.map((a) => (
              <use key={a} href="#stamen" transform={`rotate(${a})`} />
            ))}
            <path
              d="M0 0C4-30 9-60 14-98"
              stroke="#d7a4e0"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            <g fill="#6e1f55">
              <circle cx="12" cy="-101" r="4" />
              <circle cx="18" cy="-99" r="4" />
              <circle cx="15" cy="-105" r="4" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
