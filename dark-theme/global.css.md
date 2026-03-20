@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
@import "tailwindcss";

.font-serif { font-family: 'DM Serif Display', Georgia, serif; }
.font-sans { font-family: 'DM Sans', sans-serif; }

/_ ── Dark theme variables ─────────────────────────────── _/
:root {
--bg-base: #0e0f11;
--bg-surface: #141618;
--bg-elevated: #1a1c1f;
--bg-overlay: #202327;
--bg-hover: #252830;

--border-subtle: #1f2226;
--border-default: #272b30;
--border-strong: #313740;

--text-primary: #e8e6e1;
--text-secondary: #9da3ad;
--text-muted: #5a6070;
--text-faint: #3a3f48;

--accent: #6b9177;
--accent-dim: rgba(107, 145, 119, 0.12);
--accent-glow: rgba(107, 145, 119, 0.18);

--cream: #e8e6e1;
}

body {
background-color: var(--bg-base);
color: var(--text-primary);
}

/_ Noise grain overlay _/
body::after {
content: '';
position: fixed;
inset: 0;
background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
pointer-events: none;
z-index: 9999;
opacity: 0.45;
}

/_ ── Input fields ─────────────────────────────────────── _/
.input-field {
width: 100%;
background: var(--bg-overlay);
border: 1.5px solid var(--border-default);
border-radius: 10px;
font-family: 'DM Sans', sans-serif;
font-size: 14px;
padding: 12px 16px;
color: var(--text-primary);
outline: none;
transition: border-color 0.2s, box-shadow 0.2s;
}
.input-field:focus {
border-color: var(--accent);
box-shadow: 0 0 0 3px var(--accent-glow);
}
.input-field::placeholder {
color: var(--text-muted);
}

/_ Select dark arrow _/
select.input-field {
appearance: none;
background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235a6070' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
background-repeat: no-repeat;
background-position: right 14px center;
padding-right: 36px;
}
select.input-field option {
background: var(--bg-overlay);
color: var(--text-primary);
}

.input-error {
border-color: #c0392b !important;
box-shadow: 0 0 0 3px rgba(192, 57, 43, 0.15) !important;
}
