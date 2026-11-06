// Small inline SVG icons (stroke = currentColor) so there is no icon dependency.

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export const ArrowLeft = (props) => (
  <svg {...base} {...props}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export const ArrowRight = (props) => (
  <svg {...base} {...props}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export const Check = (props) => (
  <svg {...base} {...props}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const Cross = (props) => (
  <svg {...base} {...props}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const Speaker = (props) => (
  <svg {...base} {...props}>
    <path d="M11 5 6 9H2v6h4l5 4V5z" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />
  </svg>
);

export const Clock = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const Book = (props) => (
  <svg {...base} {...props}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14z" />
    <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
  </svg>
);

export const Play = (props) => (
  <svg {...base} {...props}>
    <path d="M7 4v16l13-8z" />
  </svg>
);

export const User = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

export const Lightbulb = (props) => (
  <svg {...base} {...props}>
    <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
  </svg>
);

export const Refresh = (props) => (
  <svg {...base} {...props}>
    <path d="M21 12a9 9 0 1 1-2.6-6.4L21 8" />
    <path d="M21 3v5h-5" />
  </svg>
);

export const Backspace = (props) => (
  <svg {...base} {...props}>
    <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
    <path d="m18 9-6 6M12 9l6 6" />
  </svg>
);
