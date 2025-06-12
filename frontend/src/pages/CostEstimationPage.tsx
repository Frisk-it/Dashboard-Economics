import React, { useState } from 'react'
import { Calculator, TrendingUp, Plus, Trash2, History } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { toast } from 'sonner'

const CostEstimationPage: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('cocomo')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  // COCOMO state
  const [cocomoData, setCocomoData] = useState({
    kloc: '',
    projectType: 'organic' as 'organic' | 'semidetached' | 'embedded',
    teamSize: ''
  })

  // Function Points state
  const [fpData, setFpData] = useState({
    externalInputs: '',
    externalOutputs: '',
    externalInquiries: '',
    internalLogicalFiles: '',
    externalInterfaceFiles: '',
    complexity: 'average' as 'simple' | 'average' | 'complex'
  })

  // Regression Analysis state
  const [regressionData, setRegressionData] = useState({
    historicalData: [{ size: '', effort: '', projectName: '' }],
    projectSize: ''
  })

  const handleCocomoCalculation = async () => {
    if (!cocomoData.kloc) {
      toast.error('Please enter KLOC value')
      return
    }

    setLoading(true)
    try {
      // Mock calculation for now
      const kloc = parseFloat(cocomoData.kloc)
      const teamSize = parseInt(cocomoData.teamSize) || 5

      let effort: number
      let time: number

      switch (cocomoData.projectType) {
        case 'organic':
          effort = 2.4 * Math.pow(kloc, 1.05)
          time = 2.5 * Math.pow(effort, 0.38)
          break
        case 'semidetached':
          effort = 3.0 * Math.pow(kloc, 1.12)
          time = 2.5 * Math.pow(effort, 0.35)
          break
        case 'embedded':
          effort = 3.6 * Math.pow(kloc, 1.20)
          time = 2.5 * Math.pow(effort, 0.32)
          break
        default:
          effort = 2.4 * Math.pow(kloc, 1.05)
          time = 2.5 * Math.pow(effort, 0.38)
      }

      const averageSalary = 80000 // $80k per year
      const cost = effort * (averageSalary / 12) // Convert to monthly

      setResults({
        method: 'COCOMO',
        effort: effort,
        time: time,
        cost: cost,
        productivity: kloc / effort,
        teamSize: teamSize
      })

      toast.success('COCOMO calculation completed')
    } catch (error) {
      toast.error('Calculation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleFunctionPointsCalculation = async () => {
    const { externalInputs, externalOutputs, externalInquiries, internalLogicalFiles, externalInterfaceFiles } = fpData

    if (!externalInputs || !externalOutputs || !externalInquiries || !internalLogicalFiles || !externalInterfaceFiles) {
      toast.error('Please fill in all function point values')
      return
    }

    setLoading(true)
    try {
      // Mock calculation
      const complexity = fpData.complexity
      let weights = { simple: 0.8, average: 1.0, complex: 1.2 }[complexity]

      const unadjustedFP =
        parseInt(externalInputs) * 4 +
        parseInt(externalOutputs) * 5 +
        parseInt(externalInquiries) * 4 +
        parseInt(internalLogicalFiles) * 10 +
        parseInt(externalInterfaceFiles) * 7

      const adjustedFP = unadjustedFP * weights
      const productivity = 20 // Lines of code per function point
      const kloc = (adjustedFP * productivity) / 1000
      const effort = 1.4 * Math.pow(adjustedFP, 1.0)
      const cost = effort * 8000 // $8k per person-month

      setResults({
        method: 'Function Points',
        functionPoints: adjustedFP,
        kloc: kloc,
        effort: effort,
        cost: cost,
        productivity: productivity
      })

      toast.success('Function Points calculation completed')
    } catch (error) {
      toast.error('Calculation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRegressionCalculation = async () => {
    const validData = regressionData.historicalData.filter(item => item.size && item.effort)

    if (validData.length < 2) {
      toast.error('Please provide at least 2 historical data points')
      return
    }

    if (!regressionData.projectSize) {
      toast.error('Please enter the project size for prediction')
      return
    }

    setLoading(true)
    try {
      const data = validData.map(item => ({
        size: parseFloat(item.size),
        effort: parseFloat(item.effort)
      }))

      const projectSize = parseFloat(regressionData.projectSize)

      // Call API
      const response = await fetch('/api/calculations/cost-estimation/regression', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ historicalData: data, projectSize })
      })

      if (!response.ok) {
        throw new Error('Failed to calculate regression estimation')
      }

      const result = await response.json()

      setResults({
        method: 'Regression Analysis',
        ...result.data,
        cost: result.data.predictedEffort * 8000 // Convert person-months to cost
      })

      toast.success('Regression analysis completed')
    } catch (error) {
      console.error('Regression calculation error:', error)
      toast.error('Calculation failed')
    } finally {
      setLoading(false)
    }
  }

  const addHistoricalDataPoint = () => {
    setRegressionData(prev => ({
      ...prev,
      historicalData: [...prev.historicalData, { size: '', effort: '', projectName: '' }]
    }))
  }

  const removeHistoricalDataPoint = (index: number) => {
    setRegressionData(prev => ({
      ...prev,
      historicalData: prev.historicalData.filter((_, i) => i !== index)
    }))
  }

  const updateHistoricalDataPoint = (index: number, field: 'size' | 'effort' | 'projectName', value: string) => {
    setRegressionData(prev => ({
      ...prev,
      historicalData: prev.historicalData.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  // Function to check if results match the current active tab
  const isResultsForCurrentTab = () => {
    if (!results || !results.method) return false

    const methodMapping = {
      'cocomo': 'COCOMO',
      'function-points': 'Function Points',
      'regression': 'Regression Analysis'
    }

    return results.method === methodMapping[activeTab as keyof typeof methodMapping]
  }

  const tabs = [
    { id: 'cocomo', name: 'COCOMO', description: 'Constructive Cost Model' },
    { id: 'function-points', name: 'Function Points', description: 'Function Point Analysis' },
    { id: 'regression', name: 'Regression', description: 'Historical Data Analysis' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cost Estimation</h1>
          <p className="text-gray-600 mt-1">
            Estimate software development costs using various methodologies
          </p>
        </div>
        <Button
          onClick={() => navigate('/calculation-history')}
          variant="outline"
          className="flex items-center"
        >
          <History className="h-4 w-4 mr-2" />
          View History
        </Button>
      </div>

      {/* Method Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                // Clear results when switching to a different tab
                if (activeTab !== tab.id) {
                  const methodMapping = {
                    'cocomo': 'COCOMO',
                    'function-points': 'Function Points',
                    'regression': 'Regression Analysis'
                  }

                  const newTabMethod = methodMapping[tab.id as keyof typeof methodMapping]
                  if (results && results.method !== newTabMethod) {
                    setResults(null)
                  }
                }
                setActiveTab(tab.id)
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
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
              {tabs.find(tab => tab.id === activeTab)?.name}
            </CardTitle>
            <CardDescription>
              {tabs.find(tab => tab.id === activeTab)?.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeTab === 'cocomo' && (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      KLOC (Kilo Lines of Code)
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter KLOC"
                      value={cocomoData.kloc}
                      onChange={(e) => setCocomoData(prev => ({ ...prev, kloc: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Type
                    </label>
                    <select
                      value={cocomoData.projectType}
                      onChange={(e) => setCocomoData(prev => ({ ...prev, projectType: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="organic">Organic</option>
                      <option value="semidetached">Semi-detached</option>
                      <option value="embedded">Embedded</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Team Size (optional)
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter team size"
                      value={cocomoData.teamSize}
                      onChange={(e) => setCocomoData(prev => ({ ...prev, teamSize: e.target.value }))}
                    />
                  </div>
                </div>
                <Button onClick={handleCocomoCalculation} disabled={loading} className="w-full">
                  {loading ? 'Calculating...' : 'Calculate COCOMO'}
                </Button>
              </>
            )}

            {activeTab === 'function-points' && (
              <>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        External Inputs
                      </label>
                      <Input
                        type="number"
                        placeholder="Number of external inputs"
                        value={fpData.externalInputs}
                        onChange={(e) => setFpData(prev => ({ ...prev, externalInputs: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        External Outputs
                      </label>
                      <Input
                        type="number"
                        placeholder="Number of external outputs"
                        value={fpData.externalOutputs}
                        onChange={(e) => setFpData(prev => ({ ...prev, externalOutputs: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        External Inquiries
                      </label>
                      <Input
                        type="number"
                        placeholder="Number of external inquiries"
                        value={fpData.externalInquiries}
                        onChange={(e) => setFpData(prev => ({ ...prev, externalInquiries: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Internal Logical Files
                      </label>
                      <Input
                        type="number"
                        placeholder="Number of internal logical files"
                        value={fpData.internalLogicalFiles}
                        onChange={(e) => setFpData(prev => ({ ...prev, internalLogicalFiles: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        External Interface Files
                      </label>
                      <Input
                        type="number"
                        placeholder="Number of external interface files"
                        value={fpData.externalInterfaceFiles}
                        onChange={(e) => setFpData(prev => ({ ...prev, externalInterfaceFiles: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Overall Complexity
                      </label>
                      <select
                        value={fpData.complexity}
                        onChange={(e) => setFpData(prev => ({ ...prev, complexity: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="simple">Simple</option>
                        <option value="average">Average</option>
                        <option value="complex">Complex</option>
                      </select>
                    </div>
                  </div>
                </div>
                <Button onClick={handleFunctionPointsCalculation} disabled={loading} className="w-full">
                  {loading ? 'Calculating...' : 'Calculate Function Points'}
                </Button>
              </>
            )}

            {activeTab === 'regression' && (
              <>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Historical Project Data
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addHistoricalDataPoint}
                        className="flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Project
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {regressionData.historicalData.map((project, index) => (
                        <div key={index} className="border rounded-lg p-3 space-y-2">
                          <div className="flex justify-between items-center">
                            <Input
                              type="text"
                              placeholder={`Project ${index + 1} Name (optional)`}
                              value={project.projectName}
                              onChange={(e) => updateHistoricalDataPoint(index, 'projectName', e.target.value)}
                              className="flex-1 mr-2"
                            />
                            {regressionData.historicalData.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeHistoricalDataPoint(index)}
                                className="px-2"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-gray-600">Size (KLOC)</label>
                              <Input
                                type="number"
                                placeholder="Size"
                                value={project.size}
                                onChange={(e) => updateHistoricalDataPoint(index, 'size', e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600">Effort (PM)</label>
                              <Input
                                type="number"
                                placeholder="Effort"
                                value={project.effort}
                                onChange={(e) => updateHistoricalDataPoint(index, 'effort', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Project Size (KLOC)
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter project size for estimation"
                      value={regressionData.projectSize}
                      onChange={(e) => setRegressionData(prev => ({ ...prev, projectSize: e.target.value }))}
                    />
                  </div>
                  <div className="bg-blue-50 p-3 rounded text-sm">
                    <h5 className="font-medium mb-1">Linear Regression Analysis:</h5>
                    <p>Uses historical project data to predict effort based on size. Requires at least 2 data points.</p>
                  </div>
                </div>
                <Button onClick={handleRegressionCalculation} disabled={loading} className="w-full">
                  {loading ? 'Calculating...' : 'Calculate Regression Analysis'}
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
                Results - {results.method}
              </CardTitle>
              <CardDescription>
                Cost estimation results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {results.effort && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Effort:</span>
                      <span className="font-medium">{formatNumber(results.effort)} person-months</span>
                    </div>
                  )}
                  {results.time && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Development Time:</span>
                      <span className="font-medium">{formatNumber(results.time)} months</span>
                    </div>
                  )}
                  {results.cost && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Cost:</span>
                      <span className="font-medium text-lg">{formatCurrency(results.cost)}</span>
                    </div>
                  )}
                  {results.functionPoints && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Function Points:</span>
                      <span className="font-medium">{formatNumber(results.functionPoints)}</span>
                    </div>
                  )}
                  {results.kloc && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">KLOC:</span>
                      <span className="font-medium">{formatNumber(results.kloc)}</span>
                    </div>
                  )}
                  {results.productivity && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Productivity:</span>
                      <span className="font-medium">{formatNumber(results.productivity)}</span>
                    </div>
                  )}

                  {/* Regression Analysis specific results */}
                  {results.method === 'Regression Analysis' && (
                    <>
                      <div className="border-t pt-3 mt-3">
                        <h5 className="font-medium text-gray-700 mb-2">Statistical Analysis</h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {results.correlationCoefficient && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Correlation:</span>
                              <span>{formatNumber(results.correlationCoefficient)}</span>
                            </div>
                          )}
                          {results.rSquared && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">R²:</span>
                              <span>{formatNumber(results.rSquared)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {results.equation && (
                        <div className="bg-blue-50 p-2 rounded text-sm">
                          <span className="text-gray-600">Regression Equation: </span>
                          <span className="font-medium font-mono">{results.equation}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Key Insights</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {results.method === 'COCOMO' && (
                      <>
                        <li>• COCOMO model is based on empirical software engineering data</li>
                        <li>• Project type affects effort multipliers significantly</li>
                        <li>• Consider adding 20-30% buffer for uncertainty</li>
                      </>
                    )}
                    {results.method === 'Function Points' && (
                      <>
                        <li>• Function Points measure software functionality independent of technology</li>
                        <li>• Complexity level significantly impacts the final estimate</li>
                        <li>• Most effective for business applications</li>
                      </>
                    )}
                    {results.method === 'Regression Analysis' && (
                      <>
                        <li>• Based on historical project data patterns</li>
                        <li>• R² value indicates how well the model fits the data</li>
                        <li>• Higher correlation coefficient means more reliable predictions</li>
                        <li>• Quality depends on similarity of historical projects to new project</li>
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

export default CostEstimationPage