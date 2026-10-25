// components/LeafOrnament.jsx
// Small decorative leaf sprig drawn on both sides of a heading (Contact page).
// side="left" points the leaves to the left, side="right" is the mirror image.

function LeafOrnament({ side = 'left' }) {
  return (
    <svg
      className={`leaf-ornament leaf-ornament-${side}`}
      width="34"
      height="34"
      viewBox="0 0 34 34"
      aria-hidden="true"
      focusable="false"
    >
      {/* three leaves growing from one point at the bottom right */}
      <ellipse cx="13" cy="12" rx="3.2" ry="9.5" transform="rotate(-38 13 12)" fill="var(--forest-600)" />
      <ellipse cx="9" cy="21" rx="3" ry="8.5" transform="rotate(-72 9 21)" fill="var(--terracotta-500)" />
      <ellipse cx="21" cy="9" rx="2.8" ry="8" transform="rotate(-8 21 9)" fill="var(--terracotta-500)" />
      <path d="M28 30 L13 12 M28 30 L9 21 M28 30 L21 9" stroke="var(--forest-800)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export default LeafOrnament;
