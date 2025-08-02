import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { blink } from '@/blink/client'
import { useAuth } from '@/hooks/useAuth'
import { StrategicApproval, Priority } from '@/types/auth'
import { 
  ClipboardCheck, 
  Plus,
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  Eye,
  FileText,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Target
} from 'lucide-react'

export function StrategicApprovals() {
  const { user } = useAuth()
  const [approvals, setApprovals] = useState<StrategicApproval[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [selectedApproval, setSelectedApproval] = useState<StrategicApproval | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve')
  const [reviewNotes, setReviewNotes] = useState('')

  // New approval form state
  const [newApproval, setNewApproval] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as Priority
  })

  const fetchApprovals = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      
      const allApprovals = await blink.db.strategicApprovals.list({
        orderBy: { createdAt: 'desc' }
      })

      const approvalsArray = Array.isArray(allApprovals) ? allApprovals : []
      setApprovals(approvalsArray.map(approval => ({
        id: approval.id || '',
        title: approval.title || '',
        description: approval.description || '',
        requestedBy: approval.requested_by || '',
        category: approval.category || '',
        priority: approval.priority as Priority || 'medium',
        status: approval.status || 'pending',
        createdAt: approval.created_at || new Date().toISOString(),
        reviewedBy: approval.reviewed_by || '',
        reviewedAt: approval.reviewed_at || '',
        notes: approval.notes || '',
        userId: approval.user_id || ''
      })))

    } catch (err) {
      console.error('Failed to fetch strategic approvals:', err)
      setError('Failed to load strategic approvals. Please try refreshing the page.')
      setApprovals([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchApprovals()
  }, [fetchApprovals])

  const filteredApprovals = approvals.filter(approval => {
    const matchesSearch = 
      approval.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || approval.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || approval.category === categoryFilter
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  const handleCreateApproval = async () => {
    try {
      const approval = await blink.db.strategicApprovals.create({
        id: `approval_${Date.now()}`,
        title: newApproval.title,
        description: newApproval.description,
        requested_by: user?.id || '',
        category: newApproval.category,
        priority: newApproval.priority,
        status: 'pending',
        created_at: new Date().toISOString(),
        user_id: user?.id || ''
      })
      
      fetchApprovals()
      setIsCreateDialogOpen(false)
      setNewApproval({
        title: '',
        description: '',
        category: '',
        priority: 'medium'
      })
    } catch (err) {
      console.error('Failed to create approval:', err)
      setError('Failed to create strategic approval')
    }
  }

  const handleReviewApproval = async (approvalId: string, action: 'approve' | 'reject', notes: string = '') => {
    try {
      await blink.db.strategicApprovals.update(approvalId, {
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
        notes: notes
      })
      
      fetchApprovals()
      setIsReviewDialogOpen(false)
      setReviewNotes('')
      setSelectedApproval(null)
    } catch (err) {
      console.error('Failed to review approval:', err)
      setError('Failed to review strategic approval')
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
      case 'under_review':
        return <Badge variant="outline" className="text-blue-600 border-blue-600"><Eye className="w-3 h-3 mr-1" />Under Review</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'financial': return <DollarSign className="h-4 w-4" />
      case 'strategic': return <Target className="h-4 w-4" />
      case 'operational': return <ClipboardCheck className="h-4 w-4" />
      case 'hr': case 'human resources': return <Users className="h-4 w-4" />
      case 'technology': return <TrendingUp className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const openReviewDialog = (approval: StrategicApproval, action: 'approve' | 'reject') => {
    setSelectedApproval(approval)
    setReviewAction(action)
    setReviewNotes('')
    setIsReviewDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading strategic approvals...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Strategic Approvals</h1>
          <p className="text-gray-600">Review and approve strategic decisions and initiatives</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Request Approval
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Request Strategic Approval</DialogTitle>
              <DialogDescription>
                Submit a new strategic decision for executive approval
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="approvalTitle">Title</Label>
                <Input
                  id="approvalTitle"
                  placeholder="Enter approval title"
                  value={newApproval.title}
                  onChange={(e) => setNewApproval(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="approvalDescription">Description</Label>
                <Textarea
                  id="approvalDescription"
                  placeholder="Describe the strategic decision requiring approval"
                  value={newApproval.description}
                  onChange={(e) => setNewApproval(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="approvalCategory">Category</Label>
                  <Select
                    value={newApproval.category}
                    onValueChange={(value) => setNewApproval(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Financial">Financial</SelectItem>
                      <SelectItem value="Strategic">Strategic</SelectItem>
                      <SelectItem value="Operational">Operational</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Human Resources">Human Resources</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="approvalPriority">Priority</Label>
                  <Select
                    value={newApproval.priority}
                    onValueChange={(value) => setNewApproval(prev => ({ ...prev, priority: value as Priority }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateApproval} 
                disabled={!newApproval.title.trim() || !newApproval.description.trim() || !newApproval.category}
              >
                Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvals.length}</div>
            <p className="text-xs text-muted-foreground">All time requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {approvals.filter(a => a.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting decision</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {approvals.filter(a => a.status === 'approved').length}
            </div>
            <p className="text-xs text-muted-foreground">Successfully approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {approvals.filter(a => a.priority === 'high' || a.priority === 'critical').length}
            </div>
            <p className="text-xs text-muted-foreground">Urgent decisions</p>
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
                placeholder="Search by title, description, or category..."
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
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Financial">Financial</SelectItem>
                <SelectItem value="Strategic">Strategic</SelectItem>
                <SelectItem value="Operational">Operational</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Human Resources">Human Resources</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Legal">Legal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Approvals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Strategic Approvals ({filteredApprovals.length})</CardTitle>
          <CardDescription>
            Review and process strategic decision requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredApprovals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ClipboardCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No approvals found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApprovals.map((approval) => (
                  <TableRow key={approval.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(approval.category)}
                        <div>
                          <div className="font-medium">{approval.title}</div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {approval.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{approval.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(approval.priority)}>
                        {approval.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(approval.status)}</TableCell>
                    <TableCell>{approval.requestedBy}</TableCell>
                    <TableCell>
                      {new Date(approval.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedApproval(approval)
                            setIsDetailDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {approval.status === 'pending' && user?.role === 'executive' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => openReviewDialog(approval, 'approve')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openReviewDialog(approval, 'reject')}
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

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Strategic Approval Details</DialogTitle>
            <DialogDescription>
              Complete information about this strategic decision request
            </DialogDescription>
          </DialogHeader>
          {selectedApproval && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Title</Label>
                <p className="text-lg font-medium">{selectedApproval.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Description</Label>
                <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">{selectedApproval.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Category</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    {getCategoryIcon(selectedApproval.category)}
                    <span className="text-sm">{selectedApproval.category}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Priority</Label>
                  <div className="mt-1">
                    <Badge className={getPriorityColor(selectedApproval.priority)}>
                      {selectedApproval.priority}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedApproval.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Requested By</Label>
                  <p className="text-sm">{selectedApproval.requestedBy}</p>
                </div>
              </div>
              {selectedApproval.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Review Notes</Label>
                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">{selectedApproval.notes}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Requested</Label>
                  <p className="text-sm">{new Date(selectedApproval.createdAt).toLocaleString()}</p>
                </div>
                {selectedApproval.reviewedAt && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Reviewed</Label>
                    <p className="text-sm">{new Date(selectedApproval.reviewedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve Request' : 'Reject Request'}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'approve' 
                ? 'Approve this strategic decision request' 
                : 'Reject this request with a reason'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reviewNotes">
                {reviewAction === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason'}
              </Label>
              <Textarea
                id="reviewNotes"
                placeholder={
                  reviewAction === 'approve' 
                    ? 'Add any notes about this approval...' 
                    : 'Please provide a reason for rejection...'
                }
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReviewDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedApproval) {
                  handleReviewApproval(selectedApproval.id, reviewAction, reviewNotes)
                }
              }}
              className={reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {reviewAction === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}