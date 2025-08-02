export type UserRole = 'admin' | 'executive' | 'team_lead' | 'coordinator' | 'member'
export type UserStatus = 'pending' | 'active' | 'suspended' | 'inactive'
export type RequestStatus = 'pending' | 'approved' | 'rejected'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'under_review'
export type Priority = 'low' | 'medium' | 'high' | 'critical'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  status: UserStatus
  department?: string
  position?: string
  phone?: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
  lastLogin?: string
  approvedBy?: string
  approvedAt?: string
  userId: string
}

export interface AccountRequest {
  id: string
  email: string
  firstName: string
  lastName: string
  department?: string
  position?: string
  phone?: string
  reason?: string
  status: RequestStatus
  createdAt: string
  reviewedBy?: string
  reviewedAt?: string
  notes?: string
  userId: string
}

export interface StrategicApproval {
  id: string
  title: string
  description: string
  requestedBy: string
  category: string
  priority: Priority
  status: ApprovalStatus
  createdAt: string
  reviewedBy?: string
  reviewedAt?: string
  notes?: string
  userId: string
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  login: () => Promise<void>
  logout: () => void
  hasPermission: (permission: string) => boolean
  hasRole: (roles: UserRole[]) => boolean
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 5,
  executive: 4,
  team_lead: 3,
  coordinator: 2,
  member: 1
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    'manage_users',
    'manage_roles',
    'approve_accounts',
    'view_all_data',
    'manage_system',
    'view_audit_logs',
    'strategic_decisions'
  ],
  executive: [
    'view_all_data',
    'custom_reporting',
    'broadcast_announcements',
    'strategic_decisions',
    'approve_strategic'
  ],
  team_lead: [
    'manage_team',
    'approve_leaves',
    'track_attendance',
    'view_team_data'
  ],
  coordinator: [
    'assist_team_lead',
    'update_task_status',
    'view_team_data'
  ],
  member: [
    'view_tasks',
    'submit_leaves',
    'track_attendance',
    'send_messages'
  ]
}