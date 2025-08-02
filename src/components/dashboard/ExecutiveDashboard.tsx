import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Target,
  DollarSign,
  Activity
} from 'lucide-react';
import { blink } from '../../blink/client';

interface StrategicApproval {
  id: string;
  title: string;
  description: string;
  requested_by: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
}

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  pendingRequests: number;
  completedTasks: number;
  pendingApprovals: number;
  systemHealth: number;
}

export default function ExecutiveDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    pendingRequests: 0,
    completedTasks: 0,
    pendingApprovals: 0,
    systemHealth: 100
  });
  const [strategicApprovals, setStrategicApprovals] = useState<StrategicApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExecutiveData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch system metrics
      const [users, requests, approvals] = await Promise.all([
        blink.db.users.list(),
        blink.db.accountRequests.list(),
        blink.db.strategicApprovals.list()
      ]);

      const usersArray = Array.isArray(users) ? users : [];
      const requestsArray = Array.isArray(requests) ? requests : [];
      const approvalsArray = Array.isArray(approvals) ? approvals : [];

      setMetrics({
        totalUsers: usersArray.length,
        activeUsers: usersArray.filter(u => u.status === 'active').length,
        pendingRequests: requestsArray.filter(r => r.status === 'pending').length,
        completedTasks: 0, // Will be implemented with task management
        pendingApprovals: approvalsArray.filter(a => a.status === 'pending').length,
        systemHealth: 98
      });

      // Map strategic approvals
      setStrategicApprovals(
        approvalsArray.map(approval => ({
          id: approval.id || '',
          title: approval.title || 'Untitled Request',
          description: approval.description || '',
          requested_by: approval.requested_by || 'Unknown',
          created_at: approval.created_at || new Date().toISOString(),
          status: approval.status || 'pending',
          priority: approval.priority || 'medium',
          category: approval.category || 'General'
        }))
      );

    } catch (err) {
      console.error('Error fetching executive data:', err);
      setError('Failed to load executive dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutiveData();
  }, []);

  const handleApprovalAction = async (approvalId: string, action: 'approved' | 'rejected') => {
    try {
      await blink.db.strategicApprovals.update(approvalId, {
        status: action,
        reviewed_at: new Date().toISOString(),
        reviewed_by: 'executive'
      });
      
      // Refresh data
      fetchExecutiveData();
    } catch (err) {
      console.error('Error updating approval:', err);
      setError('Failed to update approval status');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchExecutiveData} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Executive Dashboard</h1>
          <p className="text-gray-600 mt-1">Strategic oversight and system analytics</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
            <Activity className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">System Health: {metrics.systemHealth}%</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.activeUsers} active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">
              Account access requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Strategic Approvals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting executive decision
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.systemHealth}%</div>
            <p className="text-xs text-muted-foreground">
              Overall system health
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="approvals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="approvals">Strategic Approvals</TabsTrigger>
          <TabsTrigger value="analytics">System Analytics</TabsTrigger>
          <TabsTrigger value="reports">Custom Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Strategic Approval Requests</CardTitle>
              <CardDescription>
                High-level decisions requiring executive approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              {strategicApprovals.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">No pending strategic approvals</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {strategicApprovals.map((approval) => (
                    <div key={approval.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{approval.title}</h3>
                          <p className="text-gray-600 mt-1">{approval.description}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Badge className={getPriorityColor(approval.priority)}>
                            {approval.priority}
                          </Badge>
                          <Badge className={getStatusColor(approval.status)}>
                            {approval.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Requested by:</span>
                          <p className="text-gray-600">{approval.requested_by}</p>
                        </div>
                        <div>
                          <span className="font-medium">Category:</span>
                          <p className="text-gray-600">{approval.category}</p>
                        </div>
                        <div>
                          <span className="font-medium">Created:</span>
                          <p className="text-gray-600">{new Date(approval.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {approval.status === 'pending' && (
                        <div className="flex space-x-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprovalAction(approval.id, 'approved')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprovalAction(approval.id, 'rejected')}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth Trends</CardTitle>
                <CardDescription>System adoption and user engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Analytics charts will be implemented</p>
                    <p className="text-sm text-gray-500">with task management integration</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>System efficiency and productivity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">User Satisfaction</span>
                    <span className="text-sm text-gray-600">94%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">System Uptime</span>
                    <span className="text-sm text-gray-600">99.8%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '99.8%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Task Completion Rate</span>
                    <span className="text-sm text-gray-600">87%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Reports</CardTitle>
              <CardDescription>
                Generate detailed reports for strategic decision making
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                  <FileText className="h-6 w-6 mb-2" />
                  <span>User Activity Report</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                  <DollarSign className="h-6 w-6 mb-2" />
                  <span>Cost Analysis Report</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  <span>Performance Metrics</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                  <Target className="h-6 w-6 mb-2" />
                  <span>Strategic Goals</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                  <Users className="h-6 w-6 mb-2" />
                  <span>Team Productivity</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                  <Activity className="h-6 w-6 mb-2" />
                  <span>System Health</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}