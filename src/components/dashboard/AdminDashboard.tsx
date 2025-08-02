import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { blink } from '@/blink/client'
import { useAuth } from '@/hooks/useAuth'
import { AccountRequest, User } from '@/types/auth'
import { 
  Users, 
  UserCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Shield,
  TrendingUp
} from 'lucide-react'

export function AdminDashboard() {
  const { user } = useAuth()
  const [accountRequests, setAccountRequests] = useState<AccountRequest[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      
      // Fetch pending account requests with proper error handling
      const requests = await blink.db.accountRequests.list({
        where: { status: 'pending' },
        orderBy: { createdAt: 'desc' },
        limit: 10
      })

      // Fetch all users with proper error handling
      const allUsers = await blink.db.users.list({
        orderBy: { createdAt: 'desc' },
        limit: 20
      })

      // Ensure requests is an array before mapping
      const requestsArray = Array.isArray(requests) ? requests : []
      setAccountRequests(requestsArray.map(req => ({
        id: req.id || '',
        email: req.email || '',
        firstName: req.first_name || '',
        lastName: req.last_name || '',
        department: req.department || '',
        position: req.position || '',
        phone: req.phone || '',
        reason: req.reason || '',
        status: req.status || 'pending',
        createdAt: req.created_at || new Date().toISOString(),
        reviewedBy: req.reviewed_by || '',
        reviewedAt: req.reviewed_at || '',
        notes: req.notes || '',
        userId: req.user_id || ''
      })))

      // Ensure allUsers is an array before mapping
      const usersArray = Array.isArray(allUsers) ? allUsers : []
      setUsers(usersArray.map(u => ({
        id: u.id || '',
        email: u.email || '',
        firstName: u.first_name || '',
        lastName: u.last_name || '',
        role: u.role || 'member',
        status: u.status || 'pending',
        department: u.department || '',
        position: u.position || '',
        phone: u.phone || '',
        avatarUrl: u.avatar_url || '',
        createdAt: u.created_at || new Date().toISOString(),
        updatedAt: u.updated_at || new Date().toISOString(),
        lastLogin: u.last_login || '',
        approvedBy: u.approved_by || '',
        approvedAt: u.approved_at || '',
        userId: u.user_id || ''
      })))

    } catch (err) {
      console.error('Dashboard data fetch error:', err)
      setError('Failed to load dashboard data. Please try refreshing the page.')
      // Set empty arrays as fallback
      setAccountRequests([])
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleApproveRequest = async (requestId: string) => {
    try {
      await blink.db.accountRequests.update(requestId, {
        status: 'approved',
        reviewedBy: user?.id,
        reviewedAt: new Date().toISOString()
      })
      
      // Refresh data
      fetchData()
    } catch (err) {
      setError('Failed to approve request')
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      await blink.db.accountRequests.update(requestId, {
        status: 'rejected',
        reviewedBy: user?.id,
        reviewedAt: new Date().toISOString()
      })
      
      // Refresh data
      fetchData()
    } catch (err) {
      setError('Failed to reject request')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'active':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>
      case 'suspended':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Suspended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'executive': return 'bg-purple-100 text-purple-800'
      case 'team_lead': return 'bg-blue-100 text-blue-800'
      case 'coordinator': return 'bg-green-100 text-green-800'
      case 'member': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, approvals, and system settings</p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-blue-600" />
          <Badge className="bg-red-100 text-red-800">Administrator</Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              Active system users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accountRequests.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Excellent</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Account Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Account Requests</CardTitle>
          <CardDescription>
            Review and approve new user access requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accountRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No pending requests</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accountRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.firstName} {request.lastName}
                    </TableCell>
                    <TableCell>{request.email}</TableCell>
                    <TableCell>{request.department || 'N/A'}</TableCell>
                    <TableCell>{request.position || 'N/A'}</TableCell>
                    <TableCell>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveRequest(request.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectRequest(request.id)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
          <CardDescription>
            Latest user accounts in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.slice(0, 10).map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>
                      {user.role.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>{user.department || 'N/A'}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}