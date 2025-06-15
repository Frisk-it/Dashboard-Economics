import React, { useState } from 'react'
import { Shield, TrendingUp, TreePine, Zap, BarChart3, AlertTriangle, Target, Settings, Database, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

// Import components for risk management
import SensitivityAnalysis from '../components/risk-management/SensitivityAnalysis'
import DecisionTree from '../components/risk-management/DecisionTree'
import MonteCarloSimulation from '../components/risk-management/MonteCarloSimulation'
import RiskDashboard from '../components/risk-management/RiskDashboard'

const RiskManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [mockDataEnabled, setMockDataEnabled] = useState(true)

  const tabs = [
    {
      id: 'dashboard',
      label: 'Risk Dashboard',
      icon: BarChart3,
      description: 'Overview of all risk metrics and assessments'
    },
    {
      id: 'sensitivity',
      label: 'Sensitivity Analysis',
      icon: TrendingUp,
      description: 'Analyze how changes in variables affect outcomes'
    },
    {
      id: 'decision-tree',
      label: 'Decision Trees',
      icon: TreePine,
      description: 'Visualize decision paths and probabilities'
    },
    {
      id: 'monte-carlo',
      label: 'Monte Carlo Simulation',
      icon: Zap,
      description: 'Model uncertainty with probabilistic analysis'
    }
  ]

  const toggleMockData = () => {
    setMockDataEnabled(!mockDataEnabled)
    if (!mockDataEnabled) {
      toast.success('Mock data enabled - showing sample data for demonstration')
    } else {
      toast.info('Mock data disabled - showing real calculations only')
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <RiskDashboard mockDataEnabled={mockDataEnabled} />
      case 'sensitivity':
        return <SensitivityAnalysis mockDataEnabled={mockDataEnabled} />
      case 'decision-tree':
        return <DecisionTree mockDataEnabled={mockDataEnabled} />
      case 'monte-carlo':
        return <MonteCarloSimulation mockDataEnabled={mockDataEnabled} />
      default:
        return <RiskDashboard mockDataEnabled={mockDataEnabled} />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Risk Management</h1>
              <p className="text-gray-600">
                Comprehensive risk assessment tools including sensitivity analysis, decision trees, and Monte Carlo simulations
              </p>
            </div>
          </div>

          {/* Mock Data Toggle */}
          <div className="flex items-center gap-3">
            <div className="text-right">
            </div>
            <Button
              onClick={toggleMockData}
              variant={mockDataEnabled ? 'default' : 'outline'}
              size="sm"
              className="flex items-center gap-2"
            >
              {mockDataEnabled ? (
                <>
                  <Database className="h-4 w-4" />
                  Mock Data ON
                </>
              ) : (
                <>
                  <X className="h-4 w-4" />
                  Mock Data OFF
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Data Mode Indicator */}
        <div className={`p-3 rounded-lg border-l-4 ${
          mockDataEnabled
            ? 'bg-blue-50 border-blue-400 text-blue-800'
            : 'bg-green-50 border-green-400 text-green-800'
        }`}>
          <div className="flex items-center gap-2">
            {mockDataEnabled ? (
              <Database className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">
              {mockDataEnabled
                ? 'Currently showing mock/sample data for demonstration purposes'
                : 'Currently showing real calculations only - input your own data to see results'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Card
              key={tab.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                activeTab === tab.id
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`h-5 w-5 ${
                    activeTab === tab.id ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                  <h3 className={`font-semibold ${
                    activeTab === tab.id ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {tab.label}
                  </h3>
                </div>
                <p className="text-sm text-gray-600">{tab.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Risk Tolerance</p>
                <p className="text-lg font-semibold text-gray-900">
                  {mockDataEnabled ? 'Moderate' : 'Configure'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Assessments</p>
                <p className="text-lg font-semibold text-gray-900">
                  {mockDataEnabled ? '3' : '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Settings className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Data Source</p>
                <p className="text-lg font-semibold text-gray-900">
                  {mockDataEnabled ? 'Sample' : 'User Input'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="min-h-[600px]">
        {renderTabContent()}
      </div>
    </div>
  )
}

export default RiskManagementPage