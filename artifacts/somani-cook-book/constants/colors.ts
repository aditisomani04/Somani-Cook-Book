/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#29271f',
    tint: '#a64d35',

    // Core surfaces
    background: '#f7f4ed',
    foreground: '#29271f',

    // Cards / elevated surfaces
    card: '#fffdf8',
    cardForeground: '#29271f',

    // Primary action color (buttons, links, active states)
    primary: '#a64d35',
    primaryForeground: '#ffffff',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#ece7da',
    secondaryForeground: '#49483b',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#eee9df',
    mutedForeground: '#777467',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#dfe4d3',
    accentForeground: '#4b5a3d',

    // Destructive actions (delete, error states)
    destructive: '#b74436',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#e5dfd3',
    input: '#ddd6c9',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 20,
};

export default colors;
