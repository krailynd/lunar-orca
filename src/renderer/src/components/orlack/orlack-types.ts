export type OrlackChannelType = 'channel' | 'dm' | 'thread'

export type OrlackChannel = {
  id: string
  name: string
  topic?: string
  worktreePath?: string
  orchestrator?: string
  isPrivate?: boolean
  unreadCount?: number
  lastActivity?: number
  type: OrlackChannelType
}

export type OrlackAttachment = {
  name: string
  size: string
  type: 'code' | 'diff' | 'log' | 'doc'
  content?: string
}

export type OrlackUser = {
  id: string
  name: string
  avatarColor: string
  role: string
  status: 'online' | 'offline' | 'busy'
  isBot?: boolean
  model?: string
  worktreeId?: string
}

export type OrlackMessage = {
  id: string
  channelId: string
  userId: string
  userName: string
  userColor: string
  userRole?: string
  content: string
  timestamp: number
  worktreePath?: string
  sessionId?: string
  reactions?: Record<string, number>
  attachments?: OrlackAttachment[]
  isUpdate?: boolean
  phase?: string
  statusVerdict?: 'pass' | 'fail' | 'working'
}
