import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Users,
  UserCheck,
  BarChart3,
  Settings,
  FileText,
  MessageSquare,
  Calendar,
  CheckSquare,
  Shield,
  TrendingUp,
  UserPlus,
  ClipboardCheck
} from 'lucide-react'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const { user, hasPermission } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (!user) return null

  const menuItems = [
    // Admin items
    ...(hasPermission('manage_users') ? [
      { icon: Users, label: 'User Management', href: '/admin/users' },
      { icon: UserCheck, label: 'Account Approvals', href: '/admin/approvals' },
      { icon: Settings, label: 'System Settings', href: '/admin/settings' },
    ] : []),

    // Executive items
    ...(hasPermission('view_all_data') ? [
      { icon: BarChart3, label: 'Executive Dashboard', href: '/executive/dashboard' },
      { icon: FileText, label: 'Custom Reports', href: '/executive/reports' },
      { icon: TrendingUp, label: 'Strategic Overview', href: '/executive/strategic' },
    ] : []),

    // Strategic approvals for executives and admins
    ...(hasPermission('strategic_decisions') ? [
      { icon: ClipboardCheck, label: 'Strategic Approvals', href: '/strategic/approvals' },
    ] : []),

    // Team Lead items
    ...(hasPermission('manage_team') ? [
      { icon: Users, label: 'Team Management', href: '/team/manage' },
      { icon: Calendar, label: 'Leave Approvals', href: '/team/leaves' },
      { icon: CheckSquare, label: 'Task Management', href: '/team/tasks' },
    ] : []),

    // Coordinator items
    ...(hasPermission('assist_team_lead') ? [
      { icon: CheckSquare, label: 'Task Updates', href: '/coordinator/tasks' },
      { icon: Users, label: 'Team Support', href: '/coordinator/support' },
    ] : []),

    // Member items
    ...(hasPermission('view_tasks') ? [
      { icon: CheckSquare, label: 'My Tasks', href: '/member/tasks' },
      { icon: Calendar, label: 'Leave Requests', href: '/member/leaves' },
      { icon: MessageSquare, label: 'Messages', href: '/member/messages' },
    ] : []),

    // Common items for all users
    { icon: UserPlus, label: 'My Profile', href: '/profile' },
  ]

  const handleNavigation = (href: string) => {
    navigate(href)
  }

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }

  return (
    <div className={cn('pb-12 w-64', className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold tracking-tight">
              EKAN System
            </h2>
          </div>
          <div className="space-y-1">
            {menuItems.map((item, index) => (
              <Button
                key={index}
                variant={isActive(item.href) ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive(item.href) && "bg-blue-600 text-white hover:bg-blue-700"
                )}
                onClick={() => handleNavigation(item.href)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}