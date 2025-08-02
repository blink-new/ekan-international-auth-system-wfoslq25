import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { blink } from '@/blink/client'
import { useAuth } from '@/hooks/useAuth'
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Target, 
  DollarSign,
  BarChart3,
  PieChart,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Briefcase,
  Globe
} from 'lucide-react'

interface KPI {
  id: string
  name: string
  value: number
  target: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  change: number
  category: 'financial' | 'operational' | 'strategic' | 'hr'
}

interface StrategicGoal {
  id: string
  title: string
  description: string
  category: string
  progress: number
  target: number
  deadline: string
  status: 'on_track' | 'at_risk' | 'behind' | 'completed'
  owner: string
  milestones: {
    id: string
    title: string
    completed: boolean
    dueDate: string
  }[]
}

interface Initiative {
  id: string
  name: string
  description: string
  priority: 'high' | 'medium' | 'low'
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold'
  budget: number
  spent: number
  startDate: string
  endDate: string
  team: string[]
}

export function StrategicOverview() {
  const { user } = useAuth()
  const [kpis, setKpis] = useState<KPI[]>([])
  const [goals, setGoals] = useState<StrategicGoal[]>([])
  const [initiatives, setInitiatives] = useState<Initiative[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  const fetchStrategicData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      
      // Mock data for strategic overview
      const mockKpis: KPI[] = [
        {
          id: 'kpi_1',
          name: 'Revenue Growth',
          value: 15.2,
          target: 20.0,
          unit: '%',
          trend: 'up',
          change: 2.3,
          category: 'financial'
        },
        {
          id: 'kpi_2',
          name: 'Employee Satisfaction',
          value: 4.2,
          target: 4.5,
          unit: '/5',
          trend: 'up',
          change: 0.1,
          category: 'hr'
        },
        {
          id: 'kpi_3',
          name: 'Project Completion Rate',
          value: 87,
          target: 90,
          unit: '%',
          trend: 'stable',
          change: 0,
          category: 'operational'
        },
        {
          id: 'kpi_4',
          name: 'Market Share',
          value: 12.8,
          target: 15.0,
          unit: '%',
          trend: 'up',
          change: 1.2,
          category: 'strategic'
        }
      ]

      const mockGoals: StrategicGoal[] = [
        {
          id: 'goal_1',
          title: 'Digital Transformation Initiative',
          description: 'Modernize all core business processes and systems',
          category: 'Technology',
          progress: 65,
          target: 100,
          deadline: '2024-12-31',
          status: 'on_track',
          owner: 'CTO',
          milestones: [
            { id: 'm1', title: 'System Analysis Complete', completed: true, dueDate: '2024-03-31' },
            { id: 'm2', title: 'Platform Selection', completed: true, dueDate: '2024-06-30' },
            { id: 'm3', title: 'Implementation Phase 1', completed: false, dueDate: '2024-09-30' },
            { id: 'm4', title: 'Full Deployment', completed: false, dueDate: '2024-12-31' }
          ]
        },
        {
          id: 'goal_2',
          title: 'Market Expansion',
          description: 'Enter 3 new international markets',
          category: 'Business Development',
          progress: 33,
          target: 100,
          deadline: '2025-06-30',
          status: 'on_track',
          owner: 'VP Sales',
          milestones: [
            { id: 'm5', title: 'Market Research', completed: true, dueDate: '2024-02-28' },
            { id: 'm6', title: 'Regulatory Approval', completed: false, dueDate: '2024-08-31' },
            { id: 'm7', title: 'Local Partnerships', completed: false, dueDate: '2025-03-31' }
          ]
        },
        {
          id: 'goal_3',
          title: 'Sustainability Program',
          description: 'Achieve carbon neutrality across all operations',
          category: 'Environmental',
          progress: 45,
          target: 100,
          deadline: '2025-12-31',
          status: 'at_risk',
          owner: 'Chief Sustainability Officer',
          milestones: [
            { id: 'm8', title: 'Carbon Audit', completed: true, dueDate: '2024-01-31' },
            { id: 'm9', title: 'Renewable Energy Transition', completed: false, dueDate: '2024-12-31' },
            { id: 'm10', title: 'Carbon Offset Program', completed: false, dueDate: '2025-06-30' }
          ]
        }
      ]

      const mockInitiatives: Initiative[] = [
        {
          id: 'init_1',
          name: 'AI-Powered Analytics Platform',
          description: 'Implement machine learning for business intelligence',
          priority: 'high',
          status: 'in_progress',
          budget: 500000,
          spent: 275000,
          startDate: '2024-01-15',
          endDate: '2024-08-31',
          team: ['Data Science Team', 'Engineering Team', 'Product Team']
        },
        {
          id: 'init_2',
          name: 'Employee Wellness Program',
          description: 'Comprehensive health and wellness initiative',
          priority: 'medium',
          status: 'planning',
          budget: 150000,
          spent: 25000,
          startDate: '2024-03-01',
          endDate: '2024-12-31',
          team: ['HR Team', 'Wellness Committee']
        },
        {
          id: 'init_3',
          name: 'Customer Experience Optimization',
          description: 'Redesign customer journey and touchpoints',
          priority: 'high',
          status: 'in_progress',
          budget: 300000,
          spent: 180000,
          startDate: '2024-02-01',
          endDate: '2024-10-31',
          team: ['UX Team', 'Customer Success', 'Marketing']
        }
      ]

      setKpis(mockKpis)
      setGoals(mockGoals)
      setInitiatives(mockInitiatives)

    } catch (err) {
      console.error('Failed to fetch strategic data:', err)
      setError('Failed to load strategic overview. Please try refreshing the page.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStrategicData()
  }, [fetchStrategicData])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'bg-green-100 text-green-800'
      case 'at_risk': return 'bg-yellow-100 text-yellow-800'
      case 'behind': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'planning': return 'bg-gray-100 text-gray-800'
      case 'on_hold': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial': return <DollarSign className="h-4 w-4" />
      case 'operational': return <Activity className="h-4 w-4" />
      case 'strategic': return <Target className="h-4 w-4" />
      case 'hr': return <Users className="h-4 w-4" />
      default: return <BarChart3 className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading strategic overview...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Strategic Overview</h1>
          <p className="text-gray-600">Executive dashboard for strategic planning and performance monitoring</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-purple-100 text-purple-800">Executive View</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="kpis">KPIs</TabsTrigger>
          <TabsTrigger value="goals">Strategic Goals</TabsTrigger>
          <TabsTrigger value="initiatives">Initiatives</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Strategic Goals</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{goals.length}</div>
                <p className="text-xs text-muted-foreground">
                  {goals.filter(g => g.status === 'on_track').length} on track
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Initiatives</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {initiatives.filter(i => i.status === 'in_progress').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {initiatives.length} total initiatives
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((initiatives.reduce((sum, i) => sum + i.spent, 0) / 
                    initiatives.reduce((sum, i) => sum + i.budget, 0)) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  ${initiatives.reduce((sum, i) => sum + i.spent, 0).toLocaleString()} spent
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Average goal completion
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick KPI Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
              <CardDescription>
                Critical metrics for strategic decision making
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi) => (
                  <div key={kpi.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(kpi.category)}
                        <span className="text-sm font-medium">{kpi.name}</span>
                      </div>
                      {kpi.trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      ) : kpi.trend === 'down' ? (
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                      ) : (
                        <div className="h-4 w-4" />
                      )}
                    </div>
                    <div className="text-2xl font-bold">
                      {kpi.value}{kpi.unit}
                    </div>
                    <div className="text-sm text-gray-500">
                      Target: {kpi.target}{kpi.unit}
                    </div>
                    <Progress 
                      value={(kpi.value / kpi.target) * 100} 
                      className="mt-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Strategic Goals Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Strategic Goals Progress</CardTitle>
              <CardDescription>
                Current status of major strategic initiatives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {goals.map((goal) => (
                  <div key={goal.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{goal.title}</h4>
                      <Badge className={getStatusColor(goal.status)}>
                        {goal.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-gray-500">
                        {goal.progress}% of {goal.target}%
                      </span>
                    </div>
                    <Progress value={goal.progress} className="mb-2" />
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Owner: {goal.owner}</span>
                      <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* KPIs Tab */}
        <TabsContent value="kpis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
              <CardDescription>
                Detailed view of all strategic KPIs and metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {kpis.map((kpi) => (
                  <Card key={kpi.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(kpi.category)}
                          <CardTitle className="text-lg">{kpi.name}</CardTitle>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {kpi.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-3xl font-bold">
                              {kpi.value}{kpi.unit}
                            </div>
                            <div className="text-sm text-gray-500">
                              Target: {kpi.target}{kpi.unit}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`flex items-center ${
                              kpi.trend === 'up' ? 'text-green-600' : 
                              kpi.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {kpi.trend === 'up' ? (
                                <TrendingUp className="h-4 w-4 mr-1" />
                              ) : kpi.trend === 'down' ? (
                                <TrendingDown className="h-4 w-4 mr-1" />
                              ) : null}
                              {kpi.change > 0 ? '+' : ''}{kpi.change}{kpi.unit}
                            </div>
                            <div className="text-sm text-gray-500">vs last period</div>
                          </div>
                        </div>
                        <Progress 
                          value={(kpi.value / kpi.target) * 100} 
                          className="h-2"
                        />
                        <div className="text-sm text-gray-500">
                          {Math.round((kpi.value / kpi.target) * 100)}% of target achieved
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Strategic Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Strategic Goals</CardTitle>
              <CardDescription>
                Long-term objectives and their progress tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {goals.map((goal) => (
                  <Card key={goal.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">{goal.title}</CardTitle>
                        <Badge className={getStatusColor(goal.status)}>
                          {goal.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <CardDescription>{goal.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Category</Label>
                            <p className="text-sm">{goal.category}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Owner</Label>
                            <p className="text-sm">{goal.owner}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Deadline</Label>
                            <p className="text-sm">{new Date(goal.deadline).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium">Overall Progress</Label>
                            <span className="text-sm text-gray-500">{goal.progress}%</span>
                          </div>
                          <Progress value={goal.progress} className="h-3" />
                        </div>

                        <div>
                          <Label className="text-sm font-medium mb-3 block">Milestones</Label>
                          <div className="space-y-2">
                            {goal.milestones.map((milestone) => (
                              <div key={milestone.id} className="flex items-center space-x-3">
                                {milestone.completed ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                  <Clock className="h-5 w-5 text-gray-400" />
                                )}
                                <div className="flex-1">
                                  <span className={`text-sm ${milestone.completed ? 'line-through text-gray-500' : ''}`}>
                                    {milestone.title}
                                  </span>
                                  <span className="text-xs text-gray-500 ml-2">
                                    Due: {new Date(milestone.dueDate).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Initiatives Tab */}
        <TabsContent value="initiatives" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Strategic Initiatives</CardTitle>
              <CardDescription>
                Current projects and programs driving strategic goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {initiatives.map((initiative) => (
                  <Card key={initiative.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">{initiative.name}</CardTitle>
                        <div className="flex space-x-2">
                          <Badge className={getPriorityColor(initiative.priority)}>
                            {initiative.priority} priority
                          </Badge>
                          <Badge className={getStatusColor(initiative.status)}>
                            {initiative.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription>{initiative.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Budget</Label>
                            <p className="text-sm font-medium">${initiative.budget.toLocaleString()}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Spent</Label>
                            <p className="text-sm">${initiative.spent.toLocaleString()}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Start Date</Label>
                            <p className="text-sm">{new Date(initiative.startDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">End Date</Label>
                            <p className="text-sm">{new Date(initiative.endDate).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium">Budget Utilization</Label>
                            <span className="text-sm text-gray-500">
                              {Math.round((initiative.spent / initiative.budget) * 100)}%
                            </span>
                          </div>
                          <Progress 
                            value={(initiative.spent / initiative.budget) * 100} 
                            className="h-3"
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium mb-2 block">Team</Label>
                          <div className="flex flex-wrap gap-2">
                            {initiative.team.map((team, index) => (
                              <Badge key={index} variant="outline">
                                {team}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}