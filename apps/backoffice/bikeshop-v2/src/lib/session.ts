export type Role = 'admin' | 'staff'

export type Session = {
  userId: string
  tenantId: string
  role: Role
  name: string
}

// TODO: Replace with real auth integration (e.g., NextAuth, Clerk, etc.)
// This is a temporary mock session for development
const mockSession: Session = {
  userId: 'user-1',
  tenantId: 'tenant-1',
  role: 'admin',
  name: 'Carlos',
}

export function getSession(): Session {
  // TODO: Implement real session fetching
  return mockSession
}

export function useSession(): Session {
  // TODO: Convert to real hook with proper state management
  return getSession()
}
