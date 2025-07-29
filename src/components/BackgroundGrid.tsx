import React from 'react';

export const BackgroundGrid: React.FC = () => (
  <>
    {/* Light mode grid */}
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none block light:block dark:hidden"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(22, 163, 74, 0.08) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(22, 163, 74, 0.08) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        opacity: 0.3,
        mixBlendMode: 'multiply',
      }}
    />
    {/* Dark mode grid */}
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none hidden dark:block light:hidden"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(22, 163, 74, 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(22, 163, 74, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        opacity: 0.4,
        mixBlendMode: 'overlay',
      }}
    />
  </>
);

export default BackgroundGrid; 