import React, { useState } from 'react'
import { Calculator, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { toast } from 'sonner'

const CostEstimationPage: React.FC = () => {
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

  const tabs = [
    { id: 'cocomo', name: 'COCOMO', description: 'Constructive Cost Model' },
    { id: 'function-points', name: 'Function Points', description: 'Function Point Analysis' },
    { id: 'expert', name: 'Expert Judgment', description: 'Expert-based Estimation' },
    { id: 'regression', name: 'Regression', description: 'Historical Data Analysis' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cost Estimation</h1>
        <p className="text-gray-600 mt-1">
          Estimate software development costs using various methodologies
        </p>
      </div>

      {/* Method Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              {tabs.find(t => t.id === activeTab)?.name} Estimation
            </CardTitle>
            <CardDescription>
              {tabs.find(t => t.id === activeTab)?.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeTab === 'cocomo' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    KLOC (Thousands of Lines of Code)
                  </label>
                  <Input
                    type="number"
                    value={cocomoData.kloc}
                    onChange={(e) => setCocomoData(prev => ({ ...prev, kloc: e.target.value }))}
                    placeholder="Enter KLOC estimate"
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
                    <option value="organic">Organic (Small team, familiar domain)</option>
                    <option value="semidetached">Semi-detached (Medium complexity)</option>
                    <option value="embedded">Embedded (Large, complex, innovative)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Size (Optional)
                  </label>
                  <Input
                    type="number"
                    value={cocomoData.teamSize}
                    onChange={(e) => setCocomoData(prev => ({ ...prev, teamSize: e.target.value }))}
                    placeholder="Number of developers"
                  />
                </div>
                <Button onClick={handleCocomoCalculation} disabled={loading} className="w-full">
                  {loading ? 'Calculating...' : 'Calculate COCOMO Estimate'}
                </Button>
              </>
            )}

            {activeTab === 'function-points' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      External Inputs
                    </label>
                    <Input
                      type="number"
                      value={fpData.externalInputs}
                      onChange={(e) => setFpData(prev => ({ ...prev, externalInputs: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      External Outputs
                    </label>
                    <Input
                      type="number"
                      value={fpData.externalOutputs}
                      onChange={(e) => setFpData(prev => ({ ...prev, externalOutputs: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      External Inquiries
                    </label>
                    <Input
                      type="number"
                      value={fpData.externalInquiries}
                      onChange={(e) => setFpData(prev => ({ ...prev, externalInquiries: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Internal Files
                    </label>
                    <Input
                      type="number"
                      value={fpData.internalLogicalFiles}
                      onChange={(e) => setFpData(prev => ({ ...prev, internalLogicalFiles: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    External Interface Files
                  </label>
                  <Input
                    type="number"
                    value={fpData.externalInterfaceFiles}
                    onChange={(e) => setFpData(prev => ({ ...prev, externalInterfaceFiles: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Complexity Level
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
                <Button onClick={handleFunctionPointsCalculation} disabled={loading} className="w-full">
                  {loading ? 'Calculating...' : 'Calculate Function Points'}
                </Button>
              </>
            )}

            {(activeTab === 'expert' || activeTab === 'regression') && (
              <div className="text-center py-8">
                <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Coming Soon
                </h3>
                <p className="text-gray-500">
                  This estimation method will be available in a future update.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Estimation Results
            </CardTitle>
            <CardDescription>
              Your cost estimation calculation results
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results ? (
              <div className="space-y-4">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h3 className="font-semibold text-primary mb-2">
                    {results.method} Results
                  </h3>
                  <div className="space-y-3">
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
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Key Insights</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Estimates are based on historical data and industry averages</li>
                    <li>• Consider adding 20-30% buffer for uncertainty</li>
                    <li>• Results may vary based on team experience and technology</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calculator className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p>Enter project parameters and calculate to see results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CostEstimationPage