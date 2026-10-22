import React from 'react'
import {
  MATERIAL_FOLDER_COLOR,
  MATERIAL_ICON_BY_EXTENSION,
  MATERIAL_ICON_DEFAULT,
  MATERIAL_ICON_LABEL_COLOR,
  type MaterialFileIconSpec
} from './file-type-icon-extension-table'
import { MATERIAL_ICON_BY_NAME } from './file-type-icon-name-table'

export type { MaterialFileIconSpec }

function getFilename(filePath: string | undefined | null): string {
  if (!filePath) {
    return ''
  }
  const lastSlash = Math.max(filePath.lastIndexOf('/'), filePath.lastIndexOf('\\'))
  return lastSlash >= 0 ? filePath.slice(lastSlash + 1) : filePath
}

function getExtension(filename: string): string {
  const lowerName = filename.toLowerCase()
  const compound = ['tar.bz2', 'tar.gz', 'tar.xz'].find((ext) => lowerName.endsWith(`.${ext}`))
  if (compound) {
    return compound
  }
  const lastDot = filename.lastIndexOf('.')
  if (lastDot <= 0 || lastDot === filename.length - 1) {
    return ''
  }
  return filename.slice(lastDot + 1).toLowerCase()
}

export function getMaterialFileIconSpec(filePath: string | undefined | null): MaterialFileIconSpec {
  const filename = getFilename(filePath)
  if (!filename) {
    return MATERIAL_ICON_DEFAULT
  }
  const lowerName = filename.toLowerCase()
  return (
    MATERIAL_ICON_BY_NAME[lowerName] ??
    MATERIAL_ICON_BY_EXTENSION[getExtension(filename)] ??
    MATERIAL_ICON_DEFAULT
  )
}

export function MaterialFileIcon({
  filePath,
  className,
  size = 16
}: {
  filePath: string | undefined | null
  className?: string
  size?: number
}): React.JSX.Element {
  const spec = getMaterialFileIconSpec(filePath)
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* File Page Shape with Folded Corner */}
      <path
        d="M5 3.5A1.5 1.5 0 0 1 6.5 2h9l5.5 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 5 20.5z"
        fill={spec.color}
      />
      {/* Folded Corner flap */}
      <path d="M15.5 2v4a1.5 1.5 0 0 0 1.5 1.5h4z" className="fill-black/25" />
      {spec.label ? (
        <text
          x="12"
          y="16.5"
          textAnchor="middle"
          fontSize={spec.label.length > 2 ? 6.2 : 7.8}
          fontWeight={800}
          fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
          fill={spec.textColor ?? MATERIAL_ICON_LABEL_COLOR}
          letterSpacing="-0.02em"
        >
          {spec.label}
        </text>
      ) : null}
    </svg>
  )
}

export function MaterialFolderIcon({
  className,
  size = 16
}: {
  className?: string
  size?: number
}): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M3 6.5A1.5 1.5 0 0 1 4.5 5h5l2 2h8A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z"
        fill={MATERIAL_FOLDER_COLOR}
      />
    </svg>
  )
}
