/**
 * Fixed starfield + galaxy wash background.
 *
 * - Server component, computed once at build time (zero runtime cost).
 * - Fixed positioning so it stays put when the page scrolls.
 * - pointer-events-none so it never intercepts clicks.
 * - Subtle enough that content (gray-900 cards) remains fully readable.
 *
 * Technique: a single element with many box-shadow values = many "stars".
 * Three layers at different sizes and opacities create depth.
 */

// Deterministic pseudo-random so every build looks identical.
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateStars(count: number, size: number, opacity: number, seed: number): string {
  const rand = seededRandom(seed);
  const shadows: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(rand() * 2000);
    const y = Math.floor(rand() * 2000);
    shadows.push(`${x}px ${y}px 0 ${size}px rgba(255,255,255,${opacity})`);
  }
  return shadows.join(',');
}

const SMALL_STARS = generateStars(250, 0, 0.5, 42);
const MEDIUM_STARS = generateStars(100, 0.5, 0.7, 137);
const LARGE_STARS = generateStars(30, 1, 0.9, 314);

export default function StarfieldBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
    >
      {/* Deep space base */}
      <div className="absolute inset-0 bg-black" />

      {/* Galaxy wash — warm orange nebula (matches brand) with subtle purple */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background: `
            radial-gradient(ellipse 100% 60% at 15% 10%, rgba(249, 115, 22, 0.18), transparent 55%),
            radial-gradient(ellipse 80% 50% at 85% 25%, rgba(139, 92, 246, 0.10), transparent 60%),
            radial-gradient(ellipse 120% 70% at 50% 100%, rgba(249, 115, 22, 0.12), transparent 55%)
          `,
        }}
      />

      {/* Small stars — densest, dimmest layer */}
      <div
        className="absolute top-0 left-0 w-px h-px rounded-full"
        style={{
          boxShadow: SMALL_STARS,
        }}
      />

      {/* Medium stars */}
      <div
        className="absolute top-0 left-0 w-px h-px rounded-full"
        style={{
          boxShadow: MEDIUM_STARS,
        }}
      />

      {/* Large stars — brightest, sparsest layer with soft glow */}
      <div
        className="absolute top-0 left-0 w-px h-px rounded-full"
        style={{
          boxShadow: LARGE_STARS,
        }}
      />

      {/* Darker vignette at edges so content is always readable */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)',
        }}
      />
    </div>
  );
}
