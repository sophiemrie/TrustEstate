import type { Config } from 'tailwindcss';

const hues = [
    0,
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    95,
    99,
    100,
];

const palettes = [
    'primary',
    'secondary',
    'tertiary',
    'error',
    'neutral',
    'neutral-variant',
];

const roles = [
    'primary',
    'on-primary',
    'primary-container',
    'on-primary-container',
    'primary-fixed',
    'primary-fixed-dim',
    'on-primary-fixed',
    'on-primary-fixed-variant',
    'secondary',
    'on-secondary',
    'secondary-container',
    'on-secondary-container',
    'secondary-fixed',
    'secondary-fixed-dim',
    'on-secondary-fixed',
    'on-secondary-fixed-variant',
    'tertiary',
    'on-tertiary',
    'tertiary-container',
    'on-tertiary-container',
    'tertiary-fixed',
    'tertiary-fixed-dim',
    'on-tertiary-fixed',
    'on-tertiary-fixed-variant',
    'error',
    'on-error',
    'error-container',
    'on-error-container',
    'surface-dim',
    'surface',
    'surface-bright',
    'surface-container-lowest',
    'surface-container-low',
    'surface-container',
    'surface-container-high',
    'surface-container-highest',
    'on-surface',
    'on-surface-variant',
    'outline',
    'outline-variant',
    'inverse-surface',
    'inverse-on-surface',
    'inverse-primary',
    'scrim',
    'shadow',
];

const prefix = 'app';

function generateColors() {
    const colors: any = {};
    for (const palette of palettes) {
        for (const hue of hues)
            colors[`${palette}-${hue}`] = `var(--${prefix}-${palette}-${hue})`;
    }

    for (const role of roles)
        colors[`${role}`] = `var(--${prefix}-${role})`;

    return colors;
}

export default {
    content: [
        './src/**/*.{html,ts}',
    ],
    theme: {
        colors: generateColors(),
        fontFamily: {
            chat: ['Open Sans', 'sans-serif'],
        },
    },
} satisfies Config;
