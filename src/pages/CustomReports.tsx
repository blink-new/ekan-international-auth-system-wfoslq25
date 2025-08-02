import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DatePickerWithRange } from '@/components/ui/date-picker'
import { blink } from '@/blink/client'
import { useAuth } from '@/hooks/useAuth'
import { 
  FileText, 
  Plus, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  BarChart3,
  Users,
  Calendar,
  TrendingUp,
  AlertCircle,
  Filter,
  Search,
  Play
} from 'lucide-react'

interface Report {
  id: string
  name: string
  description: string
  type: 'user_activity' | 'system_usage' | 'security_audit' | 'performance' | 'custom'
  parameters: Record<string, any>
  schedule?: 'daily' | 'weekly' | 'monthly' | 'none'
  createdBy: string
  createdAt: string
  lastRun?: string
  status: 'active' | 'inactive' | 'running'
}

interface ReportResult {
  id: string
  reportId: string
  data: any[]
  generatedAt: string
  parameters: Record<string, any>
  rowCount: number
}

export function CustomReports() {
  const { user } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [reportResults, setReportResults] = useState<ReportResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isRunning, setIsRunning] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('reports')

  // New report form state
  const [newReport, setNewReport] = useState({
    name: '',
    description: '',
    type: 'user_activity' as Report['type'],
    schedule: 'none' as Report['schedule'],
    parameters: {}
  })

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      
      // In a real application, this would fetch from the database
      // For now, we'll use mock data
      const mockReports: Report[] = [
        {
          id: 'report_1',
          name: 'User Activity Summary',
          description: 'Daily summary of user login activity and system usage',
          type: 'user_activity',
          parameters: { dateRange: '7d', includeInactive: false },
          schedule: 'daily',
          createdBy: user?.id || '',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          status: 'active'
        },
        {
          id: 'report_2',
          name: 'Security Audit Log',
          description: 'Comprehensive security events and access violations',
          type: 'security_audit',
          parameters: { severity: 'high', includeFailedLogins: true },
          schedule: 'weekly',
          createdBy: user?.id || '',
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active'
        },
        {
          id: 'report_3',
          name: 'System Performance Metrics',
          description: 'Database performance, response times, and resource usage',
          type: 'performance',
          parameters: { metrics: ['response_time', 'memory_usage', 'cpu_usage'] },
          schedule: 'monthly',
          createdBy: user?.id || '',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active'
        }
      ]

      setReports(mockReports)

    } catch (err) {
      console.error('Failed to fetch reports:', err)
      setError('Failed to load reports. Please try refreshing the page.')
      setReports([])
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  const fetchReportResults = useCallback(async () => {
    try {
      // Mock report results
      const mockResults: ReportResult[] = [
        {
          id: 'result_1',
          reportId: 'report_1',
          data: [
            { date: '2024-01-15', logins: 45, activeUsers: 38, avgSessionTime: '2h 15m' },
            { date: '2024-01-14', logins: 52, activeUsers: 41, avgSessionTime: '2h 32m' },
            { date: '2024-01-13', logins: 38, activeUsers: 35, avgSessionTime: '1h 58m' }
          ],
          generatedAt: new Date().toISOString(),
          parameters: { dateRange: '7d', includeInactive: false },
          rowCount: 3
        }
      ]

      setReportResults(mockResults)
    } catch (err) {
      console.error('Failed to fetch report results:', err)
    }
  }, [])

  useEffect(() => {
    fetchReports()
    fetchReportResults()
  }, [fetchReports, fetchReportResults])

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === 'all' || report.type === typeFilter
    
    return matchesSearch && matchesType
  })

  const handleCreateReport = async () => {
    try {
      const report: Report = {
        id: `report_${Date.now()}`,
        ...newReport,
        createdBy: user?.id || '',
        createdAt: new Date().toISOString(),
        status: 'active'
      }

      setReports(prev => [report, ...prev])
      setIsCreateDialogOpen(false)
      setNewReport({
        name: '',
        description: '',
        type: 'user_activity',
        schedule: 'none',
        parameters: {}
      })
    } catch (err) {
      setError('Failed to create report')
    }
  }

  const handleRunReport = async (reportId: string) => {
    try {
      setIsRunning(reportId)
      
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock result generation
      const result: ReportResult = {
        id: `result_${Date.now()}`,
        reportId,
        data: [
          { metric: 'Total Users', value: 156, change: '+12%' },
          { metric: 'Active Sessions', value: 89, change: '+5%' },
          { metric: 'Failed Logins', value: 3, change: '-25%' }
        ],
        generatedAt: new Date().toISOString(),
        parameters: {},
        rowCount: 3
      }

      setReportResults(prev => [result, ...prev])
      
      // Update last run time
      setReports(prev => prev.map(r => 
        r.id === reportId 
          ? { ...r, lastRun: new Date().toISOString() }
          : r
      ))

    } catch (err) {
      setError('Failed to run report')
    } finally {
      setIsRunning(null)
    }
  }

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return
    }

    try {
      setReports(prev => prev.filter(r => r.id !== reportId))
      setReportResults(prev => prev.filter(r => r.reportId !== reportId))
    } catch (err) {
      setError('Failed to delete report')
    }
  }

  const getTypeColor = (type: Report['type']) => {
    switch (type) {
      case 'user_activity': return 'bg-blue-100 text-blue-800'
      case 'system_usage': return 'bg-green-100 text-green-800'
      case 'security_audit': return 'bg-red-100 text-red-800'
      case 'performance': return 'bg-purple-100 text-purple-800'
      case 'custom': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'running': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading reports...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Custom Reports</h1>
          <p className="text-gray-600">Create and manage custom reports and analytics</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Report</DialogTitle>
              <DialogDescription>
                Configure a new custom report with specific parameters
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reportName">Report Name</Label>
                <Input
                  id="reportName"
                  placeholder="Enter report name"
                  value={newReport.name}
                  onChange={(e) => setNewReport(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reportDescription">Description</Label>
                <Textarea
                  id="reportDescription"
                  placeholder="Describe what this report will show"
                  value={newReport.description}
                  onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reportType">Report Type</Label>
                  <Select
                    value={newReport.type}
                    onValueChange={(value) => setNewReport(prev => ({ ...prev, type: value as Report['type'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user_activity">User Activity</SelectItem>
                      <SelectItem value="system_usage">System Usage</SelectItem>
                      <SelectItem value="security_audit">Security Audit</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reportSchedule">Schedule</Label>
                  <Select
                    value={newReport.schedule}
                    onValueChange={(value) => setNewReport(prev => ({ ...prev, schedule: value as Report['schedule'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Manual Only</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateReport} disabled={!newReport.name.trim()}>
                Create Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
            <p className="text-xs text-muted-foreground">All configured reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Reports</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {reports.filter(r => r.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Reports</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {reports.filter(r => r.schedule !== 'none').length}
            </div>
            <p className="text-xs text-muted-foreground">Auto-generated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generated Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {reportResults.filter(r => 
                new Date(r.generatedAt).toDateString() === new Date().toDateString()
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Reports run today</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search reports by name or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="user_activity">User Activity</SelectItem>
                    <SelectItem value="system_usage">System Usage</SelectItem>
                    <SelectItem value="security_audit">Security Audit</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>Reports ({filteredReports.length})</CardTitle>
              <CardDescription>
                Manage and execute custom reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{report.name}</div>
                          <div className="text-sm text-gray-500">{report.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(report.type)}>
                          {report.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {report.schedule === 'none' ? 'Manual' : report.schedule}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {report.lastRun 
                          ? new Date(report.lastRun).toLocaleDateString()
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleRunReport(report.id)}
                            disabled={isRunning === report.id}
                          >
                            {isRunning === report.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteReport(report.id)}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Results</CardTitle>
              <CardDescription>
                View and download generated report data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No report results available</p>
                  <p className="text-sm">Run a report to see results here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reportResults.map((result) => {
                    const report = reports.find(r => r.id === result.reportId)
                    return (
                      <Card key={result.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">{report?.name}</CardTitle>
                              <CardDescription>
                                Generated on {new Date(result.generatedAt).toLocaleString()} • {result.rowCount} rows
                              </CardDescription>
                            </div>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                {result.data.length > 0 && Object.keys(result.data[0]).map(key => (
                                  <TableHead key={key}>{key.replace('_', ' ')}</TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {result.data.slice(0, 5).map((row, index) => (
                                <TableRow key={index}>
                                  {Object.values(row).map((value, cellIndex) => (
                                    <TableCell key={cellIndex}>{String(value)}</TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          {result.data.length > 5 && (
                            <p className="text-sm text-gray-500 mt-2">
                              Showing 5 of {result.data.length} rows
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}