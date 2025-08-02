import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { blink } from '@/blink/client'
import { useAuth } from '@/hooks/useAuth'
import { AccountRequest, UserRole } from '@/types/auth'
import { 
  UserCheck, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  Eye,
  FileText,
  Calendar
} from 'lucide-react'

export function AccountApprovals() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<AccountRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [selectedRequest, setSelectedRequest] = useState<AccountRequest | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false)
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve')
  const [approvalNotes, setApprovalNotes] = useState('')
  const [assignedRole, setAssignedRole] = useState<UserRole>('member')

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      
      const allRequests = await blink.db.accountRequests.list({
        orderBy: { createdAt: 'desc' }
      })

      const requestsArray = Array.isArray(allRequests) ? allRequests : []
      setRequests(requestsArray.map(req => ({
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

    } catch (err) {
      console.error('Failed to fetch requests:', err)
      setError('Failed to load account requests. Please try refreshing the page.')
      setRequests([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.position?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleApproveRequest = async (requestId: string, role: UserRole = 'member', notes: string = '') => {
    try {
      // Update the request status
      await blink.db.accountRequests.update(requestId, {
        status: 'approved',
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
        notes: notes
      })

      // Create user account
      const request = requests.find(r => r.id === requestId)
      if (request) {
        await blink.db.users.create({
          id: `user_${Date.now()}`,
          email: request.email,
          password_hash: 'temp_password_hash', // This should be handled properly in production
          first_name: request.firstName,
          last_name: request.lastName,
          role: role,
          status: 'active',
          department: request.department,
          position: request.position,
          phone: request.phone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          user_id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        })
      }
      
      fetchRequests()
      setIsApprovalDialogOpen(false)
      setApprovalNotes('')
      setSelectedRequest(null)
    } catch (err) {
      console.error('Failed to approve request:', err)
      setError('Failed to approve request')
    }
  }

  const handleRejectRequest = async (requestId: string, notes: string = '') => {
    try {
      await blink.db.accountRequests.update(requestId, {
        status: 'rejected',
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
        notes: notes
      })
      
      fetchRequests()
      setIsApprovalDialogOpen(false)
      setApprovalNotes('')
      setSelectedRequest(null)
    } catch (err) {
      console.error('Failed to reject request:', err)
      setError('Failed to reject request')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const openApprovalDialog = (request: AccountRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request)
    setApprovalAction(action)
    setApprovalNotes('')
    setAssignedRole('member')
    setIsApprovalDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading account requests...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Account Approvals</h1>
          <p className="text-gray-600">Review and approve new user access requests</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}</div>
            <p className="text-xs text-muted-foreground">All time requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {requests.filter(r => r.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {requests.filter(r => r.status === 'approved').length}
            </div>
            <p className="text-xs text-muted-foreground">Successfully approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {requests.filter(r => r.status === 'rejected').length}
            </div>
            <p className="text-xs text-muted-foreground">Declined requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name, email, department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Account Requests ({filteredRequests.length})</CardTitle>
          <CardDescription>
            Review and process user access requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No requests found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.firstName} {request.lastName}
                    </TableCell>
                    <TableCell>{request.email}</TableCell>
                    <TableCell>{request.department || 'N/A'}</TableCell>
                    <TableCell>{request.position || 'N/A'}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(request)
                            setIsDetailDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {request.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => openApprovalDialog(request, 'approve')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openApprovalDialog(request, 'reject')}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Request Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>
              Complete information about this access request
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Name</Label>
                  <p className="text-sm">{selectedRequest.firstName} {selectedRequest.lastName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="text-sm">{selectedRequest.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Department</Label>
                  <p className="text-sm">{selectedRequest.department || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Position</Label>
                  <p className="text-sm">{selectedRequest.position || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Phone</Label>
                  <p className="text-sm">{selectedRequest.phone || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
              </div>
              {selectedRequest.reason && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Reason for Access</Label>
                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">{selectedRequest.reason}</p>
                </div>
              )}
              {selectedRequest.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Review Notes</Label>
                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">{selectedRequest.notes}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Requested</Label>
                  <p className="text-sm">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
                </div>
                {selectedRequest.reviewedAt && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Reviewed</Label>
                    <p className="text-sm">{new Date(selectedRequest.reviewedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? 'Approve Request' : 'Reject Request'}
            </DialogTitle>
            <DialogDescription>
              {approvalAction === 'approve' 
                ? 'Approve this user and assign a role' 
                : 'Reject this request with a reason'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {approvalAction === 'approve' && (
              <div>
                <Label htmlFor="role">Assign Role</Label>
                <Select value={assignedRole} onValueChange={(value) => setAssignedRole(value as UserRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="coordinator">Coordinator</SelectItem>
                    <SelectItem value="team_lead">Team Lead</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="notes">
                {approvalAction === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason'}
              </Label>
              <Textarea
                id="notes"
                placeholder={
                  approvalAction === 'approve' 
                    ? 'Add any notes about this approval...' 
                    : 'Please provide a reason for rejection...'
                }
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApprovalDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedRequest) {
                  if (approvalAction === 'approve') {
                    handleApproveRequest(selectedRequest.id, assignedRole, approvalNotes)
                  } else {
                    handleRejectRequest(selectedRequest.id, approvalNotes)
                  }
                }
              }}
              className={approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {approvalAction === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}