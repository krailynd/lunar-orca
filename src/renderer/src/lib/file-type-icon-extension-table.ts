import {
  Database,
  FileArchive,
  FileAxis3D,
  FileBraces,
  FileChartColumn,
  FileCode,
  FileCog,
  FileDiff,
  FileImage,
  FileJson,
  FileKey,
  FileLock,
  FileMusic,
  FileSliders,
  FileSpreadsheet,
  FileTerminal,
  FileText,
  FileType,
  FileVideo,
  type LucideIcon
} from 'lucide-react'

export const FILE_ICON_BY_EXTENSION: Record<string, LucideIcon> = {
  '7z': FileArchive,
  aac: FileMusic,
  adoc: FileText,
  ai: FileImage,
  asc: FileKey,
  astro: FileCode,
  avi: FileVideo,
  avif: FileImage,
  bash: FileTerminal,
  bat: FileTerminal,
  blend: FileAxis3D,
  bmp: FileImage,
  br: FileArchive,
  bz2: FileArchive,
  c: FileCode,
  cc: FileCode,
  cer: FileKey,
  cfg: FileSliders,
  cjs: FileCode,
  clj: FileCode,
  cmd: FileTerminal,
  conf: FileSliders,
  cpp: FileCode,
  crt: FileKey,
  cs: FileCode,
  css: FileType,
  csv: FileSpreadsheet,
  cts: FileCode,
  cxx: FileCode,
  dart: FileCode,
  db: Database,
  diff: FileDiff,
  dmg: FileArchive,
  doc: FileText,
  docx: FileText,
  duckdb: Database,
  eot: FileType,
  eps: FileImage,
  erl: FileCode,
  ex: FileCode,
  exs: FileCode,
  fbx: FileAxis3D,
  fish: FileTerminal,
  flac: FileMusic,
  fs: FileCode,
  fsx: FileCode,
  gif: FileImage,
  glb: FileAxis3D,
  gltf: FileAxis3D,
  go: FileCode,
  gpg: FileKey,
  gql: FileBraces,
  gradle: FileCog,
  graphql: FileBraces,
  gz: FileArchive,
  h: FileCode,
  hcl: FileSliders,
  heic: FileImage,
  hpp: FileCode,
  hrl: FileCode,
  hs: FileCode,
  htm: FileCode,
  html: FileCode,
  ico: FileImage,
  ini: FileSliders,
  ipynb: FileChartColumn,
  iso: FileArchive,
  java: FileCode,
  jpeg: FileImage,
  jpg: FileImage,
  js: FileCode,
  json: FileJson,
  json5: FileJson,
  jsonc: FileJson,
  jsx: FileCode,
  key: FileKey,
  kt: FileCode,
  kts: FileCode,
  less: FileType,
  lock: FileLock,
  log: FileText,
  lua: FileCode,
  m4a: FileMusic,
  m4v: FileVideo,
  md: FileText,
  mdx: FileText,
  mjs: FileCode,
  mkv: FileVideo,
  mmd: FileChartColumn,
  mov: FileVideo,
  mp3: FileMusic,
  mp4: FileVideo,
  mpeg: FileVideo,
  mpg: FileVideo,
  mts: FileCode,
  nim: FileCode,
  nu: FileTerminal,
  obj: FileAxis3D,
  ods: FileSpreadsheet,
  ogg: FileMusic,
  opus: FileMusic,
  otf: FileType,
  p12: FileLock,
  patch: FileDiff,
  pdf: FileText,
  pem: FileKey,
  pfx: FileLock,
  php: FileCode,
  pl: FileCode,
  pm: FileCode,
  png: FileImage,
  ppt: FileChartColumn,
  pptx: FileChartColumn,
  prisma: Database,
  properties: FileSliders,
  proto: FileBraces,
  ps1: FileTerminal,
  psd: FileImage,
  pub: FileKey,
  py: FileCode,
  qmd: FileText,
  r: FileCode,
  rar: FileArchive,
  rb: FileCode,
  rmarkdown: FileText,
  rmd: FileText,
  rst: FileText,
  rs: FileCode,
  rtf: FileText,
  sass: FileType,
  scala: FileCode,
  scss: FileType,
  sh: FileTerminal,
  sol: FileCode,
  sqlite: Database,
  sqlite3: Database,
  sql: Database,
  stl: FileAxis3D,
  svelte: FileCode,
  svg: FileImage,
  swift: FileCode,
  tar: FileArchive,
  'tar.bz2': FileArchive,
  'tar.gz': FileArchive,
  'tar.xz': FileArchive,
  tbz2: FileArchive,
  tex: FileText,
  tf: FileSliders,
  tfvars: FileSliders,
  tgz: FileArchive,
  tif: FileImage,
  tiff: FileImage,
  toml: FileSliders,
  ts: FileCode,
  tsx: FileCode,
  tsv: FileSpreadsheet,
  ttf: FileType,
  txt: FileText,
  txz: FileArchive,
  vb: FileCode,
  vue: FileCode,
  wav: FileMusic,
  webm: FileVideo,
  webp: FileImage,
  woff: FileType,
  woff2: FileType,
  xhtml: FileCode,
  xls: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  xml: FileCode,
  xz: FileArchive,
  yaml: FileSliders,
  yml: FileSliders,
  zig: FileCode,
  zip: FileArchive,
  zsh: FileTerminal
}

export const COMPOUND_EXTENSIONS = ['tar.bz2', 'tar.gz', 'tar.xz']

export type MaterialFileIconSpec = {
  color: string
  label: string
  textColor?: string
}

export const MATERIAL_ICON_LABEL_COLOR = '#ffffff'
export const MATERIAL_ICON_DEFAULT: MaterialFileIconSpec = { color: '#90a4ae', label: '' }
export const MATERIAL_FOLDER_COLOR = '#e0a458'

// Why: compact "ext:color:label[:d]" table; the `d` flag marks specs that need dark
// label text. Kept in a .ts module so renderer .tsx components carry no raw color literals.
const MATERIAL_EXTENSION_SPECS =
  'js:#f7df1e:JS:d,mjs:#f7df1e:MJS:d,cjs:#f7df1e:CJS:d,jsx:#61dafb:JSX:d,ts:#3178c6:TS,tsx:#61dafb:TSX:d,' +
  'json:#fbc02d:{}:d,json5:#fbc02d:{}:d,jsonc:#fbc02d:{}:d,java:#e76f00:JV,class:#e76f00:JV,kt:#7f52ff:KT,kts:#7f52ff:KT,' +
  'sql:#00758f:SQL,db:#00758f:DB,sqlite:#00758f:DB,sqlite3:#00758f:DB,duckdb:#00758f:DB,md:#083fa1:MD,mdx:#083fa1:MDX,' +
  'markdown:#083fa1:MD,py:#3776ab:PY,pyi:#3776ab:PY,rs:#dea584:RS:d,go:#00add8:GO,css:#1572b6:CSS,scss:#1572b6:SC,' +
  'sass:#1572b6:SA,less:#1572b6:LE,html:#e34f26:<> ,htm:#e34f26:<> ,xhtml:#e34f26:<> ,vue:#41b883:VUE,svelte:#ff3e00:SV,' +
  'astro:#ff5d01:AS,rb:#cc342d:RB,php:#777bb4:PHP,c:#00599c:C,h:#00599c:H,cc:#00599c:C++,cpp:#00599c:C++,cxx:#00599c:C++,' +
  'hpp:#00599c:C++,cs:#512bd4:C#,fs:#378bba:F#,fsx:#378bba:F#,swift:#fa7343:SW,dart:#0175c2:DT,lua:#2c2d72:LUA,' +
  'r:#276dc3:R,pl:#39457e:PL,pm:#39457e:PL,ex:#a90533:EX,exs:#a90533:EX,erl:#a90533:ERL,hrl:#a90533:ERL,clj:#5881d8:CLJ,' +
  'scala:#dc322f:SC,nim:#ffe953:NIM:d,zig:#f7a41d:ZIG,vb:#512bd4:VB,sh:#4eaa25:SH,bash:#4eaa25:SH,zsh:#4eaa25:SH,' +
  'fish:#4eaa25:SH,ps1:#012456:PS,bat:#c1f12e:BAT:d,cmd:#c1f12e:CMD:d,yaml:#cb171e:YML,yml:#cb171e:YML,toml:#9c4221:TML,' +
  'ini:#9c4221:INI,cfg:#9c4221:CFG,conf:#9c4221:CFG,properties:#9c4221:PRP,xml:#f1662a:XML,svg:#ffb13b:SVG:d,' +
  'graphql:#e10098:GQL,gql:#e10098:GQL,proto:#4285f4:PB,prisma:#2d3748:PR,gradle:#02303a:G,tf:#7b42bc:TF,' +
  'tfvars:#7b42bc:TF,hcl:#7b42bc:HCL,ipynb:#f37726:NB,tex:#3d6117:TEX,rst:#2f5d8a:RST,adoc:#2f5d8a:AD,csv:#217346:CSV,' +
  'tsv:#217346:TSV,xls:#217346:XLS,xlsx:#217346:XLS,pdf:#b30b00:PDF,txt:#90a4ae:TXT:d,log:#90a4ae:LOG:d,' +
  'lock:#ffd54f:LK:d,png:#26a69a:IMG,jpg:#26a69a:IMG,jpeg:#26a69a:IMG,gif:#26a69a:IMG,webp:#26a69a:IMG,' +
  'avif:#26a69a:IMG,ico:#26a69a:IMG,mp3:#e91e63:AUD,wav:#e91e63:AUD,flac:#e91e63:AUD,ogg:#e91e63:AUD,m4a:#e91e63:AUD,' +
  'mp4:#7b1fa2:VID,mov:#7b1fa2:VID,webm:#7b1fa2:VID,mkv:#7b1fa2:VID,avi:#7b1fa2:VID,woff:#607d8b:FNT,woff2:#607d8b:FNT,' +
  'ttf:#607d8b:FNT,otf:#607d8b:FNT,eot:#607d8b:FNT,zip:#ffa726:ZIP:d,rar:#ffa726:RAR:d,7z:#ffa726:7Z:d,gz:#ffa726:GZ:d,' +
  'tar:#ffa726:TAR:d,tgz:#ffa726:TGZ:d,tar.gz:#ffa726:TGZ:d,tar.bz2:#ffa726:TBZ:d,tar.xz:#ffa726:TXZ:d'

export const MATERIAL_ICON_BY_EXTENSION: Record<string, MaterialFileIconSpec> =
  parseMaterialExtensionSpecs(MATERIAL_EXTENSION_SPECS)

function parseMaterialExtensionSpecs(raw: string): Record<string, MaterialFileIconSpec> {
  const specs: Record<string, MaterialFileIconSpec> = {}
  for (const entry of raw.split(',')) {
    const [extension, color, label, flag] = entry.split(':')
    if (!extension || !color || !label) {
      continue
    }
    specs[extension] = flag === 'd' ? { color, label, textColor: '#1f2328' } : { color, label }
  }
  return specs
}
