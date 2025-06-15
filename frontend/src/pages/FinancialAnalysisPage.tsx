import React, { useState } from 'react'
import { DollarSign, Calculator, TrendingUp, Plus, Trash2, History } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { toast } from 'sonner'

const FinancialAnalysisPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('roi')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  // ROI state
  const [roiData, setRoiData] = useState({
    totalInvestment: '',
    totalReturn: ''
  })

  // NPV state
  const [npvData, setNpvData] = useState({
    initialInvestment: '',
    discountRate: '',
    cashFlows: [''] as string[]
  })

  // IRR state
  const [irrData, setIrrData] = useState({
    initialInvestment: '',
    cashFlows: [''] as string[]
  })

  // Payback Period state
  const [paybackData, setPaybackData] = useState({
    initialInvestment: '',
    cashFlows: [''] as string[]
  })

  // Comprehensive Analysis state
  const [comprehensiveData, setComprehensiveData] = useState({
    projectName: '',
    initialInvestment: '',
    discountRate: '',
    cashFlows: [''] as string[]
  })

  const handleROICalculation = async () => {
    if (!roiData.totalInvestment || !roiData.totalReturn) {
      toast.error('Please enter both total investment and total return')
      return
    }

    setLoading(true)
    try {
      // Debug token and localStorage
      const token = localStorage.getItem('auth_token')
      console.log('=== AUTHENTICATION DEBUG ===')
      console.log('Token exists:', !!token)
      console.log('Token length:', token?.length || 0)
      console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'No token')
      console.log('All localStorage keys:', Object.keys(localStorage))
      console.log('localStorage contents:', JSON.stringify(localStorage))

      if (!token) {
        toast.error('No authentication token found. Please log in again.')
        return
      }

      console.log('Making ROI request to:', '/api/calculations/financial-analysis/roi')
      console.log('Request data:', {
        totalInvestment: parseFloat(roiData.totalInvestment),
        totalReturn: parseFloat(roiData.totalReturn)
      })

      const response = await fetch('/api/calculations/financial-analysis/roi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          totalInvestment: parseFloat(roiData.totalInvestment),
          totalReturn: parseFloat(roiData.totalReturn)
        })
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', [...response.headers.entries()])

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', errorText)

        // If it's a 401, suggest re-login
        if (response.status === 401) {
          toast.error('Authentication failed. Please log in again.')
          // Clear invalid token
          localStorage.removeItem('auth_token')
          // Optionally redirect to login
          // window.location.href = '/login'
        } else {
          throw new Error(`Failed to calculate ROI: ${response.status} ${errorText}`)
        }
        return
      }

      const data = await response.json()
      console.log('Response data:', data)
      setResults(data.data)
      toast.success('ROI calculation completed')
    } catch (error) {
      console.error('ROI calculation error:', error)
      toast.error(`Calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleNPVCalculation = async () => {
    const validCashFlows = npvData.cashFlows.filter(cf => cf.trim() !== '')

    if (!npvData.initialInvestment || !npvData.discountRate || validCashFlows.length === 0) {
      toast.error('Please enter initial investment, discount rate, and at least one cash flow')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/calculations/financial-analysis/npv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          initialInvestment: parseFloat(npvData.initialInvestment),
          discountRate: parseFloat(npvData.discountRate) / 100, // Convert percentage to decimal
          cashFlows: validCashFlows.map(cf => parseFloat(cf))
        })
      })

      if (!response.ok) {
        throw new Error('Failed to calculate NPV')
      }

      const data = await response.json()
      setResults(data.data)
      toast.success('NPV calculation completed')
    } catch (error) {
      console.error('NPV calculation error:', error)
      toast.error('Calculation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleIRRCalculation = async () => {
    const validCashFlows = irrData.cashFlows.filter(cf => cf.trim() !== '')

    if (!irrData.initialInvestment || validCashFlows.length === 0) {
      toast.error('Please enter initial investment and at least one cash flow')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/calculations/financial-analysis/irr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          initialInvestment: parseFloat(irrData.initialInvestment),
          cashFlows: validCashFlows.map(cf => parseFloat(cf))
        })
      })

      if (!response.ok) {
        throw new Error('Failed to calculate IRR')
      }

      const data = await response.json()
      setResults(data.data)
      toast.success('IRR calculation completed')
    } catch (error) {
      console.error('IRR calculation error:', error)
      toast.error('Calculation failed')
    } finally {
      setLoading(false)
    }
  }

  const handlePaybackCalculation = async () => {
    const validCashFlows = paybackData.cashFlows.filter(cf => cf.trim() !== '')

    if (!paybackData.initialInvestment || validCashFlows.length === 0) {
      toast.error('Please enter initial investment and at least one cash flow')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/calculations/financial-analysis/payback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          initialInvestment: parseFloat(paybackData.initialInvestment),
          cashFlows: validCashFlows.map(cf => parseFloat(cf))
        })
      })

      if (!response.ok) {
        throw new Error('Failed to calculate Payback Period')
      }

      const data = await response.json()
      setResults(data.data)
      toast.success('Payback Period calculation completed')
    } catch (error) {
      console.error('Payback Period calculation error:', error)
      toast.error('Calculation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleComprehensiveAnalysis = async () => {
    const validCashFlows = comprehensiveData.cashFlows.filter(cf => cf.trim() !== '')

    if (!comprehensiveData.initialInvestment || !comprehensiveData.discountRate || validCashFlows.length === 0) {
      toast.error('Please enter initial investment, discount rate, and at least one cash flow')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/calculations/financial-analysis/comprehensive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          projectName: comprehensiveData.projectName || 'Unnamed Project',
          initialInvestment: parseFloat(comprehensiveData.initialInvestment),
          discountRate: parseFloat(comprehensiveData.discountRate) / 100, // Convert percentage to decimal
          cashFlows: validCashFlows.map(cf => parseFloat(cf))
        })
      })

      if (!response.ok) {
        throw new Error('Failed to perform comprehensive analysis')
      }

      const data = await response.json()
      setResults(data.data)
      toast.success('Comprehensive analysis completed')
    } catch (error) {
      console.error('Comprehensive analysis error:', error)
      toast.error('Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const addCashFlow = (type: 'npv' | 'irr' | 'payback' | 'comprehensive') => {
    switch (type) {
      case 'npv':
        setNpvData(prev => ({ ...prev, cashFlows: [...prev.cashFlows, ''] }))
        break
      case 'irr':
        setIrrData(prev => ({ ...prev, cashFlows: [...prev.cashFlows, ''] }))
        break
      case 'payback':
        setPaybackData(prev => ({ ...prev, cashFlows: [...prev.cashFlows, ''] }))
        break
      case 'comprehensive':
        setComprehensiveData(prev => ({ ...prev, cashFlows: [...prev.cashFlows, ''] }))
        break
    }
  }

  const removeCashFlow = (type: 'npv' | 'irr' | 'payback' | 'comprehensive', index: number) => {
    switch (type) {
      case 'npv':
        setNpvData(prev => ({ ...prev, cashFlows: prev.cashFlows.filter((_, i) => i !== index) }))
        break
      case 'irr':
        setIrrData(prev => ({ ...prev, cashFlows: prev.cashFlows.filter((_, i) => i !== index) }))
        break
      case 'payback':
        setPaybackData(prev => ({ ...prev, cashFlows: prev.cashFlows.filter((_, i) => i !== index) }))
        break
      case 'comprehensive':
        setComprehensiveData(prev => ({ ...prev, cashFlows: prev.cashFlows.filter((_, i) => i !== index) }))
        break
    }
  }

  const updateCashFlow = (type: 'npv' | 'irr' | 'payback' | 'comprehensive', index: number, value: string) => {
    switch (type) {
      case 'npv':
        setNpvData(prev => ({
          ...prev,
          cashFlows: prev.cashFlows.map((cf, i) => i === index ? value : cf)
        }))
        break
      case 'irr':
        setIrrData(prev => ({
          ...prev,
          cashFlows: prev.cashFlows.map((cf, i) => i === index ? value : cf)
        }))
        break
      case 'payback':
        setPaybackData(prev => ({
          ...prev,
          cashFlows: prev.cashFlows.map((cf, i) => i === index ? value : cf)
        }))
        break
      case 'comprehensive':
        setComprehensiveData(prev => ({
          ...prev,
          cashFlows: prev.cashFlows.map((cf, i) => i === index ? value : cf)
        }))
        break
    }
  }

  // Function to check if results match the current active tab
  const isResultsForCurrentTab = () => {
    if (!results || !results.metric) return false

    const metricMapping = {
      'roi': 'ROI',
      'npv': 'NPV',
      'irr': 'IRR',
      'payback': 'Payback Period',
      'comprehensive': 'Comprehensive'
    }

    return results.metric === metricMapping[activeTab as keyof typeof metricMapping] ||
           (activeTab === 'comprehensive' && results.recommendation)
  }

  const tabs = [
    { id: 'roi', name: 'ROI', description: 'Return on Investment', icon: TrendingUp },
    { id: 'npv', name: 'NPV', description: 'Net Present Value', icon: DollarSign },
    { id: 'irr', name: 'IRR', description: 'Internal Rate of Return', icon: Calculator },
    { id: 'payback', name: 'Payback', description: 'Payback Period', icon: History },
    { id: 'comprehensive', name: 'All Metrics', description: 'Comprehensive Analysis', icon: TrendingUp },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budgeting & Financial Analysis</h1>
          <p className="text-gray-600 mt-1">
            Calculate ROI, NPV, IRR, Payback Period and perform comprehensive financial analysis
          </p>
        </div>
      </div>

      {/* Method Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setResults(null) // Clear results when switching tabs
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              {tabs.find(tab => tab.id === activeTab)?.name} Analysis
            </CardTitle>
            <CardDescription>
              {tabs.find(tab => tab.id === activeTab)?.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeTab === 'roi' && (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Investment ($)
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter total investment amount"
                      value={roiData.totalInvestment}
                      onChange={(e) => setRoiData(prev => ({ ...prev, totalInvestment: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Return ($)
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter total return amount"
                      value={roiData.totalReturn}
                      onChange={(e) => setRoiData(prev => ({ ...prev, totalReturn: e.target.value }))}
                    />
                  </div>
                  <div className="bg-blue-50 p-3 rounded text-sm">
                    <h5 className="font-medium mb-1">ROI Formula:</h5>
                    <p>ROI = (Total Return - Total Investment) / Total Investment × 100%</p>
                  </div>
                </div>
                <Button onClick={handleROICalculation} disabled={loading} className="w-full">
                  {loading ? 'Calculating...' : 'Calculate ROI'}
                </Button>
              </>
            )}

            {activeTab === 'npv' && (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Initial Investment ($)
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter initial investment"
                      value={npvData.initialInvestment}
                      onChange={(e) => setNpvData(prev => ({ ...prev, initialInvestment: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Rate (%)
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter discount rate (e.g., 10 for 10%)"
                      value={npvData.discountRate}
                      onChange={(e) => setNpvData(prev => ({ ...prev, discountRate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Future Cash Flows ($)
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addCashFlow('npv')}
                        className="flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Year
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {npvData.cashFlows.map((cashFlow, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <div className="flex-1">
                            <label className="text-xs text-gray-600 block">Year {index + 1}</label>
                            <Input
                              type="number"
                              placeholder={`Cash flow for year ${index + 1}`}
                              value={cashFlow}
                              onChange={(e) => updateCashFlow('npv', index, e.target.value)}
                            />
                          </div>
                          {npvData.cashFlows.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeCashFlow('npv', index)}
                              className="px-2 mt-5"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded text-sm">
                    <h5 className="font-medium mb-1">NPV Analysis:</h5>
                    <p>Positive NPV indicates the project adds value and should be accepted.</p>
                  </div>
                </div>
                <Button onClick={handleNPVCalculation} disabled={loading} className="w-full">
                  {loading ? 'Calculating...' : 'Calculate NPV'}
                </Button>
              </>
            )}

            {activeTab === 'irr' && (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Initial Investment ($)
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter initial investment"
                      value={irrData.initialInvestment}
                      onChange={(e) => setIrrData(prev => ({ ...prev, initialInvestment: e.target.value }))}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Future Cash Flows ($)
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addCashFlow('irr')}
                        className="flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Year
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {irrData.cashFlows.map((cashFlow, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <div className="flex-1">
                            <label className="text-xs text-gray-600 block">Year {index + 1}</label>
                            <Input
                              type="number"
                              placeholder={`Cash flow for year ${index + 1}`}
                              value={cashFlow}
                              onChange={(e) => updateCashFlow('irr', index, e.target.value)}
                            />
                          </div>
                          {irrData.cashFlows.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeCashFlow('irr', index)}
                              className="px-2 mt-5"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded text-sm">
                    <h5 className="font-medium mb-1">IRR Analysis:</h5>
                    <p>IRR represents the discount rate that makes NPV equal to zero. Higher IRR is generally better.</p>
                  </div>
                </div>
                <Button onClick={handleIRRCalculation} disabled={loading} className="w-full">
                  {loading ? 'Calculating...' : 'Calculate IRR'}
                </Button>
              </>
            )}

            {activeTab === 'payback' && (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Initial Investment ($)
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter initial investment"
                      value={paybackData.initialInvestment}
                      onChange={(e) => setPaybackData(prev => ({ ...prev, initialInvestment: e.target.value }))}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Annual Cash Flows ($)
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addCashFlow('payback')}
                        className="flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Year
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {paybackData.cashFlows.map((cashFlow, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <div className="flex-1">
                            <label className="text-xs text-gray-600 block">Year {index + 1}</label>
                            <Input
                              type="number"
                              placeholder={`Cash flow for year ${index + 1}`}
                              value={cashFlow}
                              onChange={(e) => updateCashFlow('payback', index, e.target.value)}
                            />
                          </div>
                          {paybackData.cashFlows.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeCashFlow('payback', index)}
                              className="px-2 mt-5"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded text-sm">
                    <h5 className="font-medium mb-1">Payback Period:</h5>
                    <p>Time required to recover the initial investment from cash flows. Shorter is generally better.</p>
                  </div>
                </div>
                <Button onClick={handlePaybackCalculation} disabled={loading} className="w-full">
                  {loading ? 'Calculating...' : 'Calculate Payback Period'}
                </Button>
              </>
            )}

            {activeTab === 'comprehensive' && (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Name (Optional)
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter project name"
                      value={comprehensiveData.projectName}
                      onChange={(e) => setComprehensiveData(prev => ({ ...prev, projectName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Initial Investment ($)
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter initial investment"
                      value={comprehensiveData.initialInvestment}
                      onChange={(e) => setComprehensiveData(prev => ({ ...prev, initialInvestment: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Rate (%)
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter discount rate (e.g., 10 for 10%)"
                      value={comprehensiveData.discountRate}
                      onChange={(e) => setComprehensiveData(prev => ({ ...prev, discountRate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Future Cash Flows ($)
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addCashFlow('comprehensive')}
                        className="flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Year
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {comprehensiveData.cashFlows.map((cashFlow, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <div className="flex-1">
                            <label className="text-xs text-gray-600 block">Year {index + 1}</label>
                            <Input
                              type="number"
                              placeholder={`Cash flow for year ${index + 1}`}
                              value={cashFlow}
                              onChange={(e) => updateCashFlow('comprehensive', index, e.target.value)}
                            />
                          </div>
                          {comprehensiveData.cashFlows.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeCashFlow('comprehensive', index)}
                              className="px-2 mt-5"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded text-sm">
                    <h5 className="font-medium mb-1">Comprehensive Analysis:</h5>
                    <p>Calculates all financial metrics (ROI, NPV, IRR, Payback) and provides an overall project recommendation.</p>
                  </div>
                </div>
                <Button onClick={handleComprehensiveAnalysis} disabled={loading} className="w-full">
                  {loading ? 'Analyzing...' : 'Run Comprehensive Analysis'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Results Panel */}
        {results && isResultsForCurrentTab() && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Analysis Results
              </CardTitle>
              <CardDescription>
                Financial analysis results for {results.metric || 'Comprehensive Analysis'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* ROI Results */}
                {results.metric === 'ROI' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Investment:</span>
                        <span className="font-medium">{formatCurrency(results.totalInvestment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Return:</span>
                        <span className="font-medium">{formatCurrency(results.totalReturn)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Net Profit:</span>
                        <span className={`font-medium ${results.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(results.netProfit)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-600">ROI:</span>
                        <span className={`font-bold text-lg ${results.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatNumber(results.roi)}%
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded text-sm ${
                      results.interpretation === 'Profitable' ? 'bg-green-50 text-green-800' :
                      results.interpretation === 'Loss' ? 'bg-red-50 text-red-800' : 'bg-yellow-50 text-yellow-800'
                    }`}>
                      <span className="font-medium">Interpretation: </span>
                      {results.interpretation}
                    </div>
                  </div>
                )}

                {/* NPV Results */}
                {results.metric === 'NPV' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Initial Investment:</span>
                        <span className="font-medium">{formatCurrency(results.initialInvestment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Discount Rate:</span>
                        <span className="font-medium">{formatNumber(results.discountRate)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Present Value:</span>
                        <span className="font-medium">{formatCurrency(results.totalPresentValue)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-600">NPV:</span>
                        <span className={`font-bold text-lg ${results.npv >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(results.npv)}
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded text-sm ${
                      results.interpretation === 'Accept Project' ? 'bg-green-50 text-green-800' :
                      results.interpretation === 'Reject Project' ? 'bg-red-50 text-red-800' : 'bg-yellow-50 text-yellow-800'
                    }`}>
                      <span className="font-medium">Recommendation: </span>
                      {results.interpretation}
                    </div>
                    {results.discountedCashFlows && (
                      <div className="border-t pt-3">
                        <h5 className="font-medium text-gray-700 mb-2">Discounted Cash Flows</h5>
                        <div className="space-y-1 text-sm">
                          {results.discountedCashFlows.map((cf: any, index: number) => (
                            <div key={index} className="flex justify-between">
                              <span>Year {cf.period}:</span>
                              <span>{formatCurrency(cf.discountedValue)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* IRR Results */}
                {results.metric === 'IRR' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Initial Investment:</span>
                        <span className="font-medium">{formatCurrency(results.initialInvestment)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-600">IRR:</span>
                        <span className={`font-bold text-lg ${results.irr >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatNumber(results.irr)}%
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded text-sm ${
                      results.interpretation === 'Positive return' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                      <span className="font-medium">Interpretation: </span>
                      {results.interpretation}
                    </div>
                  </div>
                )}

                {/* Payback Period Results */}
                {results.metric === 'Payback Period' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Initial Investment:</span>
                        <span className="font-medium">{formatCurrency(results.initialInvestment)}</span>
                      </div>
                      {results.paybackPeriod && (
                        <>
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-gray-600">Payback Period:</span>
                            <span className="font-bold text-lg text-blue-600">
                              {formatNumber(results.paybackPeriod)} years
                            </span>
                          </div>
                          {results.paybackInYears !== null && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Breakdown:</span>
                              <span className="font-medium">
                                {results.paybackInYears} years, {results.paybackInMonths} months
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <div className={`p-3 rounded text-sm ${
                      results.interpretation === 'Investment recoverable' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                      <span className="font-medium">Status: </span>
                      {results.interpretation}
                    </div>
                    {results.cashFlowAnalysis && (
                      <div className="border-t pt-3">
                        <h5 className="font-medium text-gray-700 mb-2">Cash Flow Analysis</h5>
                        <div className="space-y-1 text-sm">
                          {results.cashFlowAnalysis.map((cf: any, index: number) => (
                            <div key={index} className="flex justify-between">
                              <span>Year {cf.period}:</span>
                              <span className={cf.cumulativeCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {formatCurrency(cf.cumulativeCashFlow)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Comprehensive Analysis Results */}
                {results.recommendation && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {results.roi && (
                        <div className="text-center p-3 bg-blue-50 rounded">
                          <div className="text-sm text-gray-600">ROI</div>
                          <div className="font-bold text-lg text-blue-600">{formatNumber(results.roi.roi)}%</div>
                        </div>
                      )}
                      {results.npv && (
                        <div className="text-center p-3 bg-green-50 rounded">
                          <div className="text-sm text-gray-600">NPV</div>
                          <div className="font-bold text-lg text-green-600">{formatCurrency(results.npv.npv)}</div>
                        </div>
                      )}
                      {results.irr && (
                        <div className="text-center p-3 bg-purple-50 rounded">
                          <div className="text-sm text-gray-600">IRR</div>
                          <div className="font-bold text-lg text-purple-600">{formatNumber(results.irr.irr)}%</div>
                        </div>
                      )}
                      {results.payback && results.payback.paybackPeriod && (
                        <div className="text-center p-3 bg-orange-50 rounded">
                          <div className="text-sm text-gray-600">Payback Period</div>
                          <div className="font-bold text-lg text-orange-600">{formatNumber(results.payback.paybackPeriod)} years</div>
                        </div>
                      )}
                    </div>
                    <div className={`p-4 rounded-lg text-center ${
                      results.recommendation === 'Highly Recommended' ? 'bg-green-100 text-green-800' :
                      results.recommendation === 'Recommended' ? 'bg-blue-100 text-blue-800' :
                      results.recommendation === 'Consider with Caution' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      <div className="font-bold text-lg">Overall Recommendation</div>
                      <div className="text-xl font-bold mt-1">{results.recommendation}</div>
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Key Insights</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {results.metric === 'ROI' && (
                      <>
                        <li>• ROI shows the percentage return on your investment</li>
                        <li>• Positive ROI indicates profitable investment</li>
                        <li>• Compare with alternative investment opportunities</li>
                      </>
                    )}
                    {results.metric === 'NPV' && (
                      <>
                        <li>• NPV accounts for time value of money using discount rate</li>
                        <li>• Positive NPV means project adds value to the company</li>
                        <li>• Higher NPV is preferred when comparing projects</li>
                      </>
                    )}
                    {results.metric === 'IRR' && (
                      <>
                        <li>• IRR is the break-even discount rate for the project</li>
                        <li>• Compare IRR with your required rate of return</li>
                        <li>• Higher IRR indicates more attractive investment</li>
                      </>
                    )}
                    {results.metric === 'Payback Period' && (
                      <>
                        <li>• Payback period shows how quickly you recover initial investment</li>
                        <li>• Shorter payback period generally preferred for liquidity</li>
                        <li>• Consider discounted payback for more accurate analysis</li>
                      </>
                    )}
                    {results.recommendation && (
                      <>
                        <li>• Comprehensive analysis considers all major financial metrics</li>
                        <li>• Recommendation based on weighted scoring of all factors</li>
                        <li>• Consider market conditions and strategic fit alongside metrics</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default FinancialAnalysisPage