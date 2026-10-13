import type { TerminalThemeMap } from './types'

export const DEFAULT_TERMINAL_THEMES: TerminalThemeMap = {
  // Most colors come from Ghostty. Orca raises dark selection contrast because Ghostty's
  // original #3e4451 blends into Codex-style gray instruction blocks.
  'Ghostty Default Style Dark': {
    background: '#282c34',
    foreground: '#ffffff',
    cursor: '#ffffff',
    cursorAccent: '#282c34',
    selectionBackground: '#5a7898',
    selectionForeground: '#ffffff',
    black: '#1d1f21',
    red: '#cc6666',
    green: '#b5bd68',
    yellow: '#f0c674',
    blue: '#81a2be',
    magenta: '#b294bb',
    cyan: '#8abeb7',
    white: '#c5c8c6',
    brightBlack: '#666666',
    brightRed: '#d54e53',
    brightGreen: '#b9ca4a',
    brightYellow: '#e7c547',
    brightBlue: '#7aa6da',
    brightMagenta: '#c397d8',
    brightCyan: '#70c0b1',
    brightWhite: '#eaeaea'
  },

  'Builtin Tango Light': {
    background: '#FFFFFF',
    foreground: '#0F172A',
    cursor: '#059669',
    cursorAccent: '#FFFFFF',
    selectionBackground: '#E0F2FE',
    selectionForeground: '#0F172A',
    black: '#0F172A',
    red: '#cc0000',
    green: '#059669',
    // Why: Claude-style previews use ANSI accent colors for readable text,
    // so the light theme cannot keep Tango's near-white legacy values.
    yellow: '#8e7700',
    blue: '#2563EB',
    magenta: '#75507b',
    cyan: '#0284C7',
    white: '#64748B',
    brightBlack: '#475569',
    brightRed: '#ef2929',
    brightGreen: '#10b981',
    brightYellow: '#6d5a00',
    brightBlue: '#3b82f6',
    brightMagenta: '#ad7fa8',
    brightCyan: '#0369a1',
    brightWhite: '#334155'
  },

  'Osaka Jade Neon': {
    background: '#0c1512',
    foreground: '#C1C497',
    cursor: '#2DD5B7',
    cursorAccent: '#0c1512',
    selectionBackground: '#32473B',
    selectionForeground: '#F7E8B2',
    black: '#111c18',
    red: '#FF5345',
    green: '#549e6a',
    yellow: '#459451',
    blue: '#509475',
    magenta: '#D2689C',
    cyan: '#2DD5B7',
    white: '#C1C497',
    brightBlack: '#53685B',
    brightRed: '#db9f9c',
    brightGreen: '#63b07a',
    brightYellow: '#E5C736',
    brightBlue: '#ACD4CF',
    brightMagenta: '#75bbb3',
    brightCyan: '#8CD3CB',
    brightWhite: '#F7E8B2'
  }
}
