import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  TrendingUp,
  DollarSign,
  Calculator,
  Shield,
  FolderOpen
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { formatCurrency, formatNumber } from '@/lib/utils'
import apiService from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Link } from 'react-router-dom'

// interface DashboardStats {
//   totalProjects: number
//   totalInvestment: number
//   totalROI: number
//   avgRisk: number
//   recentProjects: Array<{
//     id: string
//     name: string
//     status: string
//     roi: number
//     createdAt: string
//   }>
// }

const DashboardPage: React.FC = () => {
  const { user } = useAuth()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: apiService.getDashboardOverview,
    retry: 1,
  })

  const statCards = [
    {
      title: 'Total Projects',
      value: stats?.totalProjects || 0,
      icon: FolderOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Investment',
      value: formatCurrency(stats?.totalInvestment || 0),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Average ROI',
      value: `${formatNumber(stats?.totalROI || 0)}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Risk Level',
      value: `${formatNumber(stats?.avgRisk || 0)}%`,
      icon: Shield,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's an overview of your economic analysis projects
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-md ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Start analyzing your software projects with these tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/cost-estimation">
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center space-y-2">
                <Calculator className="h-6 w-6" />
                <span>Cost Estimation</span>
              </Button>
            </Link>
            <Link to="/financial-analysis">
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center space-y-2">
                <DollarSign className="h-6 w-6" />
                <span>Budgeting</span>
              </Button>
            </Link>
            <Link to="/risk-management">
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center space-y-2">
                <Shield className="h-6 w-6" />
                <span>Risk Management</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>



      {/* Getting Started */}
      {(!stats?.totalProjects || stats.totalProjects === 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Welcome to EconDash! Here's how to get started with your economic analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <h3 className="font-medium">Create a Project</h3>
                  <p className="text-sm text-gray-600">
                    Start by creating a new software project to analyze
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <h3 className="font-medium">Estimate Costs</h3>
                  <p className="text-sm text-gray-600">
                    Use our cost estimation tools (COCOMO, Function Points, etc.)
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <h3 className="font-medium">Budgeting & Financial Analysis</h3>
                  <p className="text-sm text-gray-600">
                    Calculate ROI, NPV, IRR, Payback Period and other financial metrics
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  4
                </div>
                <div>
                  <h3 className="font-medium">Assess Risks</h3>
                  <p className="text-sm text-gray-600">
                    Use sensitivity analysis and Monte Carlo simulations
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default DashboardPage