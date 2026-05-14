export const PaperGrain = ({ blend = 'multiply' }) => (
  <svg
    aria-hidden
    className="pointer-events-none fixed inset-0 w-full h-full"
    style={{ zIndex: 1, mixBlendMode: blend, opacity: 0.35 }}
  >
    <filter id="paperNoise">
      <feTurbulence type="fractalNoise" baseFrequency="0.92" numOctaves="2" stitchTiles="stitch" seed="7" />
      <feColorMatrix type="matrix" values="0 0 0 0 0.10  0 0 0 0 0.08  0 0 0 0 0.06  0 0 0 0.30 0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#paperNoise)" />
  </svg>
);
