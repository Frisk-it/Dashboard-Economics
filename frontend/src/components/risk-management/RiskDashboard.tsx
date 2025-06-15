import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, AlertTriangle, Shield, Target, BarChart3 } from 'lucide-react'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface RiskMetric {
  name: string
  value: number
  change: number
  status: 'low' | 'medium' | 'high'
  description: string
}

interface RiskDashboardProps {
  mockDataEnabled: boolean
}

const RiskDashboard: React.FC<RiskDashboardProps> = ({ mockDataEnabled }) => {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetric[]>(
    mockDataEnabled ? [
      {
        name: 'Market Risk',
        value: 68,
        change: -5.2,
        status: 'medium',
        description: 'Exposure to market volatility'
      },
      {
        name: 'Credit Risk',
        value: 35,
        change: 2.1,
        status: 'low',
        description: 'Default probability assessment'
      },
      {
        name: 'Operational Risk',
        value: 82,
        change: 8.7,
        status: 'high',
        description: 'Internal process failures'
      },
      {
        name: 'Liquidity Risk',
        value: 45,
        change: -1.5,
        status: 'medium',
        description: 'Asset conversion capability'
      }
    ] : []
  )

  const [timeframe, setTimeframe] = useState<'1W' | '1M' | '3M' | '1Y'>('1M')

  // Update risk metrics when mock data is toggled
  useEffect(() => {
    if (mockDataEnabled) {
      setRiskMetrics([
        {
          name: 'Market Risk',
          value: 68,
          change: -5.2,
          status: 'medium',
          description: 'Exposure to market volatility'
        },
        {
          name: 'Credit Risk',
          value: 35,
          change: 2.1,
          status: 'low',
          description: 'Default probability assessment'
        },
        {
          name: 'Operational Risk',
          value: 82,
          change: 8.7,
          status: 'high',
          description: 'Internal process failures'
        },
        {
          name: 'Liquidity Risk',
          value: 45,
          change: -1.5,
          status: 'medium',
          description: 'Asset conversion capability'
        }
      ])
    } else {
      setRiskMetrics([])
    }
  }, [mockDataEnabled])

  // Risk trend data
  const riskTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Overall Risk Score',
        data: [65, 68, 62, 70, 66, 58],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Risk Tolerance',
        data: [75, 75, 75, 75, 75, 75],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderDash: [5, 5],
        tension: 0.4,
      }
    ]
  }

  // Risk distribution data
  const riskDistributionData = {
    labels: ['Market Risk', 'Credit Risk', 'Operational Risk', 'Liquidity Risk'],
    datasets: [
      {
        data: [68, 35, 82, 45],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
          'rgb(245, 158, 11)',
        ],
        borderWidth: 2,
      }
    ]
  }

  // Value at Risk data
  const varData = {
    labels: ['95% VaR', '99% VaR', '99.9% VaR'],
    datasets: [
      {
        label: 'Daily VaR ($000)',
        data: [125, 180, 245],
        backgroundColor: 'rgba(139, 69, 19, 0.8)',
        borderColor: 'rgb(139, 69, 19)',
        borderWidth: 2,
      }
    ]
  }

  const getStatusColor = (status: 'low' | 'medium' | 'high') => {
    switch (status) {
      case 'low':
        return 'text-green-600 bg-green-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'high':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: 'low' | 'medium' | 'high') => {
    switch (status) {
      case 'low':
        return <Shield className="h-4 w-4" />
      case 'medium':
        return <Target className="h-4 w-4" />
      case 'high':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <BarChart3 className="h-4 w-4" />
    }
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Risk Metrics Overview',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Risk Distribution',
      },
    },
  }

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Value at Risk (VaR)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  return (
    <div className="space-y-6">
      {/* Empty State */}
      {!mockDataEnabled && riskMetrics.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Risk Data Available
            </h3>
            <p className="text-gray-500 mb-4">
              Enable mock data to see sample risk metrics, or connect your data sources to view real risk assessments.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Key Risk Metrics */}
      {riskMetrics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {riskMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{metric.name}</span>
                <div className={`p-1 rounded-full ${getStatusColor(metric.status)}`}>
                  {getStatusIcon(metric.status)}
                </div>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-bold">{metric.value}</span>
                <div className={`flex items-center text-sm ${
                  metric.change >= 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {metric.change >= 0 ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {Math.abs(metric.change)}%
                </div>
              </div>
              <p className="text-xs text-gray-500">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {/* Risk Trend Chart */}
      {mockDataEnabled && (
        <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Risk Trend Analysis</CardTitle>
              <CardDescription>
                Historical risk score vs. tolerance levels
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {(['1W', '1M', '3M', '1Y'] as const).map((period) => (
                <Button
                  key={period}
                  variant={timeframe === period ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeframe(period)}
                >
                  {period}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Line data={riskTrendData} options={chartOptions} />
          </div>
        </CardContent>
        </Card>
      )}

      {/* Risk Distribution and VaR */}
      {mockDataEnabled && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
            <CardDescription>
              Breakdown of risk exposure by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Doughnut data={riskDistributionData} options={doughnutOptions} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Value at Risk (VaR)</CardTitle>
            <CardDescription>
              Potential losses at different confidence levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar data={varData} options={barOptions} />
            </div>
          </CardContent>
        </Card>
              </div>
      )}

      {/* Risk Assessment Summary */}
      {mockDataEnabled && (
        <Card>
        <CardHeader>
          <CardTitle>Risk Assessment Summary</CardTitle>
          <CardDescription>
            Current risk profile and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Strengths</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Low credit risk exposure</li>
                  <li>• Diversified portfolio</li>
                  <li>• Strong liquidity position</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">Concerns</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Elevated market volatility</li>
                  <li>• Concentration in tech sector</li>
                  <li>• Currency exposure</li>
                </ul>
              </div>

              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-800 mb-2">Urgent Actions</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Address operational risks</li>
                  <li>• Reduce single-point failures</li>
                  <li>• Implement stress testing</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
        </Card>
      )}
    </div>
  )
}

export default RiskDashboard