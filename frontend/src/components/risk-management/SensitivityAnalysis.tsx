import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TrendingUp, Calculator, Play, Download, Settings, Plus, Trash2 } from 'lucide-react'
import { Line, Bar } from 'react-chartjs-2'
import { toast } from 'sonner'

interface Variable {
  id: string
  name: string
  baseValue: number
  minValue: number
  maxValue: number
  step: number
  unit: string
}

interface SensitivityResult {
  variable: string
  values: number[]
  outcomes: number[]
  elasticity: number
  impact: 'high' | 'medium' | 'low'
}

interface SensitivityAnalysisProps {
  mockDataEnabled: boolean
}

const SensitivityAnalysis: React.FC<SensitivityAnalysisProps> = ({ mockDataEnabled }) => {
  const [variables, setVariables] = useState<Variable[]>([
    {
      id: '1',
      name: 'Initial Investment',
      baseValue: 100000,
      minValue: 50000,
      maxValue: 200000,
      step: 10000,
      unit: '$'
    },
    {
      id: '2',
      name: 'Discount Rate',
      baseValue: 8,
      minValue: 3,
      maxValue: 15,
      step: 0.5,
      unit: '%'
    },
    {
      id: '3',
      name: 'Growth Rate',
      baseValue: 5,
      minValue: 0,
      maxValue: 10,
      step: 0.5,
      unit: '%'
    }
  ])

  const [results, setResults] = useState<SensitivityResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedVariable, setSelectedVariable] = useState<string>('')
  const [analysisType, setAnalysisType] = useState<'tornado' | 'spider' | 'scenario'>('tornado')

  // Mock sensitivity analysis calculation
  const runSensitivityAnalysis = async () => {
    if (variables.length === 0) {
      toast.error('Please add at least one variable to analyze')
      return
    }

    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      const mockResults: SensitivityResult[] = variables.map(variable => {
        const range = (variable.maxValue - variable.minValue) / variable.step
        const values: number[] = []
        const outcomes: number[] = []

        for (let i = 0; i <= range; i++) {
          const value = variable.minValue + (i * variable.step)
          values.push(value)

          // Mock calculation - NPV based on variable changes
          const baseNPV = 50000
          const sensitivity = Math.random() * 0.1 + 0.05 // 5-15% sensitivity
          const percentChange = (value - variable.baseValue) / variable.baseValue
          const outcome = baseNPV * (1 + percentChange * sensitivity)
          outcomes.push(outcome)
        }

        const elasticity = Math.random() * 2 + 0.1 // 0.1-2.1 elasticity
        const impact = elasticity > 1.5 ? 'high' : elasticity > 0.8 ? 'medium' : 'low'

        return {
          variable: variable.name,
          values,
          outcomes,
          elasticity,
          impact
        }
      })

      setResults(mockResults)
      toast.success('Sensitivity analysis completed')
    } catch (error) {
      toast.error('Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const addVariable = () => {
    const newVariable: Variable = {
      id: Date.now().toString(),
      name: 'New Variable',
      baseValue: 0,
      minValue: 0,
      maxValue: 100,
      step: 1,
      unit: ''
    }
    setVariables([...variables, newVariable])
  }

  const removeVariable = (id: string) => {
    setVariables(variables.filter(v => v.id !== id))
  }

  const updateVariable = (id: string, field: keyof Variable, value: string | number) => {
    setVariables(variables.map(v =>
      v.id === id ? { ...v, [field]: value } : v
    ))
  }

  // Tornado chart data (shows impact of each variable)
  const tornadoData = {
    labels: results.map(r => r.variable),
    datasets: [
      {
        label: 'Positive Impact',
        data: results.map(r => {
          const maxOutcome = Math.max(...r.outcomes)
          const baseOutcome = r.outcomes[Math.floor(r.outcomes.length / 2)]
          return maxOutcome - baseOutcome
        }),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Negative Impact',
        data: results.map(r => {
          const minOutcome = Math.min(...r.outcomes)
          const baseOutcome = r.outcomes[Math.floor(r.outcomes.length / 2)]
          return minOutcome - baseOutcome
        }),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      }
    ]
  }

  const tornadoOptions = {
    responsive: true,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Tornado Diagram - Variable Impact Analysis',
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
    },
  }

  return (
    <div className="space-y-6">
      {/* Header with Analysis Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Sensitivity Analysis
              </CardTitle>
              <CardDescription>
                Analyze how changes in input variables affect project outcomes
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={runSensitivityAnalysis}
                disabled={loading || variables.length === 0}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Run Analysis
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Empty State */}
      {!mockDataEnabled && (
        <Card>
          <CardContent className="text-center py-12">
            <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Sensitivity Analysis Data
            </h3>
            <p className="text-gray-500 mb-4">
              Enable mock data to see sample sensitivity analysis, or configure your own variables to run the analysis.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Variable Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Input Variables</CardTitle>
              <CardDescription>
                Configure the variables to analyze and their ranges
              </CardDescription>
            </div>
            <Button onClick={addVariable} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Variable
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {variables.map((variable, index) => (
              <div key={variable.id} className="grid grid-cols-2 md:grid-cols-7 gap-4 p-4 border rounded-lg">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={variable.name}
                    onChange={(e) => updateVariable(variable.id, 'name', e.target.value)}
                    placeholder="Variable name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Base Value</label>
                  <Input
                    type="number"
                    value={variable.baseValue}
                    onChange={(e) => updateVariable(variable.id, 'baseValue', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Min Value</label>
                  <Input
                    type="number"
                    value={variable.minValue}
                    onChange={(e) => updateVariable(variable.id, 'minValue', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Max Value</label>
                  <Input
                    type="number"
                    value={variable.maxValue}
                    onChange={(e) => updateVariable(variable.id, 'maxValue', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Step</label>
                  <Input
                    type="number"
                    value={variable.step}
                    onChange={(e) => updateVariable(variable.id, 'step', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Unit</label>
                  <Input
                    value={variable.unit}
                    onChange={(e) => updateVariable(variable.id, 'unit', e.target.value)}
                    placeholder="$, %, etc."
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeVariable(variable.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results Visualization */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Impact Analysis - Tornado Diagram</CardTitle>
            <CardDescription>
              Shows the relative impact of each variable on the outcome
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar data={tornadoData} options={tornadoOptions} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sensitivity Summary</CardTitle>
            <CardDescription>
              Key insights from the sensitivity analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">
                  {results.filter(r => r.impact === 'high').length}
                </p>
                <p className="text-sm text-gray-600">High Impact Variables</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">
                  {(results.reduce((sum, r) => sum + r.elasticity, 0) / results.length).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">Average Elasticity</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">
                  {Math.max(...results.flatMap(r => r.outcomes)).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Best Case Outcome</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">
                  {Math.min(...results.flatMap(r => r.outcomes)).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Worst Case Outcome</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default SensitivityAnalysis