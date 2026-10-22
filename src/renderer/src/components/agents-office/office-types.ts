export type CharacterState = 'idle' | 'walking' | 'working' | 'resting' | 'waiting' | 'blocked'

export type OfficeAgent = {
  id: string
  name: string
  role: string
  model?: string
  status: CharacterState
  currentTask?: string
  deskIndex: number
  color: string
  bubble?: string
  tool?: string
  avatarType: number
  updatedAt: number
}

export type OfficeSeat = {
  x: number
  y: number
  zone: 'desk' | 'lounge' | 'meeting' | 'coffee'
  occupiedBy?: string
}

export type OfficeLayout = {
  width: number
  height: number
  background: string
  seats: OfficeSeat[]
  loungeSeats: OfficeSeat[]
  meetingSeats: OfficeSeat[]
}
