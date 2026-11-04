// Settings displays this family; buildFontFamily adds the cross-platform fallback chain.
export function defaultTerminalFontFamily(): string {
  const platform = typeof process !== 'undefined' ? process.platform : ''
  if (platform === 'win32') {
    return 'Cascadia Code, Consolas'
  }
  if (platform === 'linux') {
    return 'Iosevka Nerd Font Mono, JetBrainsMono Nerd Font, FiraCode Nerd Font, monospace'
  }
  return 'SF Mono' // macOS default
}

export const getDefaultPrimarySelectionMiddleClickPaste = (
  platform = typeof process !== 'undefined' ? process.platform : ''
): boolean => platform === 'linux' || platform === 'darwin'

export const getDefaultTerminalRightClickToPaste = (
  platform = typeof process !== 'undefined' ? process.platform : ''
): boolean => platform === 'win32'
