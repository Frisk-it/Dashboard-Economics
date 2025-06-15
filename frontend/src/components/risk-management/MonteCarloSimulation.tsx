import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Zap, Play, Download, Settings } from 'lucide-react'
import { Line, Bar } from 'react-chartjs-2'
import { toast } from 'sonner'

interface SimulationParameter {
  id: string
  name: string
  distribution: 'normal' | 'uniform' | 'triangular'
  mean: number
  stdDev?: number
  min?: number
  max?: number
  mode?: number
  unit: string
}

interface SimulationResult {
  iteration: number
  outcome: number
  parameters: { [key: string]: number }
}

interface Statistics {
  mean: number
  median: number
  stdDev: number
  min: number
  max: number
  percentile5: number
  percentile95: number
  var95: number
}

interface MonteCarloSimulationProps {
  mockDataEnabled: boolean
}

const MonteCarloSimulation: React.FC<MonteCarloSimulationProps> = ({ mockDataEnabled }) => {
  const [parameters, setParameters] = useState<SimulationParameter[]>([
    {
      id: '1',
      name: 'Initial Investment',
      distribution: 'normal',
      mean: 100000,
      stdDev: 15000,
      unit: '$'
    },
    {
      id: '2',
      name: 'Annual Revenue',
      distribution: 'triangular',
      min: 50000,
      max: 200000,
      mode: 120000,
      mean: 120000,
      unit: '$'
    },
    {
      id: '3',
      name: 'Discount Rate',
      distribution: 'uniform',
      min: 0.05,
      max: 0.12,
      mean: 0.085,
      unit: '%'
    }
  ])

  const [results, setResults] = useState<SimulationResult[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(false)
  const [iterations, setIterations] = useState(10000)

  // Random number generators
  const generateNormal = (mean: number, stdDev: number): number => {
    let u = 0, v = 0
    while(u === 0) u = Math.random()
    while(v === 0) v = Math.random()
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2 * Math.PI * v)
    return z * stdDev + mean
  }

  const generateUniform = (min: number, max: number): number => {
    return Math.random() * (max - min) + min
  }

  const generateTriangular = (min: number, max: number, mode: number): number => {
    const u = Math.random()
    const f = (mode - min) / (max - min)

    if (u < f) {
      return min + Math.sqrt(u * (max - min) * (mode - min))
    } else {
      return max - Math.sqrt((1 - u) * (max - min) * (max - mode))
    }
  }

  const runSimulation = async () => {
    if (parameters.length === 0) {
      toast.error('Please add at least one parameter')
      return
    }

    setLoading(true)
    try {
      const simulationResults: SimulationResult[] = []
      const batchSize = Math.max(1, Math.floor(iterations / 100))

      for (let i = 0; i < iterations; i++) {
        const parameterValues: { [key: string]: number } = {}

        parameters.forEach(param => {
          let value: number

          switch (param.distribution) {
            case 'normal':
              value = generateNormal(param.mean, param.stdDev || 1)
              break
            case 'uniform':
              value = generateUniform(param.min || 0, param.max || 1)
              break
            case 'triangular':
              value = generateTriangular(param.min || 0, param.max || 1, param.mode || 0.5)
              break
            default:
              value = param.mean
          }

          parameterValues[param.name] = value
        })

        // Calculate NPV outcome
        const initialInvestment = parameterValues['Initial Investment'] || 100000
        const annualRevenue = parameterValues['Annual Revenue'] || 120000
        const discountRate = parameterValues['Discount Rate'] || 0.085

        let npv = -initialInvestment
        for (let year = 1; year <= 5; year++) {
          npv += annualRevenue / Math.pow(1 + discountRate, year)
        }

        simulationResults.push({
          iteration: i + 1,
          outcome: npv,
          parameters: parameterValues
        })

        if (i % batchSize === 0) {
          await new Promise(resolve => setTimeout(resolve, 1))
        }
      }

      setResults(simulationResults)
      calculateStatistics(simulationResults)
      toast.success(`Simulation completed with ${iterations} iterations`)
    } catch (error) {
      toast.error('Simulation failed')
    } finally {
      setLoading(false)
    }
  }

  const calculateStatistics = (data: SimulationResult[]) => {
    const outcomes = data.map(r => r.outcome).sort((a, b) => a - b)
    const n = outcomes.length

    const mean = outcomes.reduce((sum, val) => sum + val, 0) / n
    const median = n % 2 === 0
      ? (outcomes[n/2 - 1] + outcomes[n/2]) / 2
      : outcomes[Math.floor(n/2)]

    const variance = outcomes.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n
    const stdDev = Math.sqrt(variance)

    const percentile5 = outcomes[Math.floor(n * 0.05)]
    const percentile95 = outcomes[Math.floor(n * 0.95)]
    const var95 = outcomes[Math.floor(n * 0.05)]

    setStatistics({
      mean,
      median,
      stdDev,
      min: outcomes[0],
      max: outcomes[n - 1],
      percentile5,
      percentile95,
      var95
    })
  }

  // Chart data
  const histogramData = {
    labels: results.length > 0 ? Array.from({ length: 30 }, (_, i) => {
      const min = Math.min(...results.map(r => r.outcome))
      const max = Math.max(...results.map(r => r.outcome))
      return Math.round(min + (i * (max - min) / 30))
    }) : [],
    datasets: [
      {
        label: 'Frequency',
        data: results.length > 0 ? (() => {
          const min = Math.min(...results.map(r => r.outcome))
          const max = Math.max(...results.map(r => r.outcome))
          const binCount = 30
          const binSize = (max - min) / binCount
          const bins = new Array(binCount).fill(0)

          results.forEach(result => {
            const binIndex = Math.min(Math.floor((result.outcome - min) / binSize), binCount - 1)
            bins[binIndex]++
          })

          return bins
        })() : [],
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
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
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Monte Carlo Simulation
              </CardTitle>
              <CardDescription>
                Model uncertainty and risk using probabilistic analysis
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={runSimulation}
                disabled={loading || parameters.length === 0}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Run Simulation
              </Button>
              <Button variant="outline" size="sm" disabled={!results.length}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Simulation Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Iterations</label>
              <Input
                type="number"
                value={iterations}
                onChange={(e) => setIterations(parseInt(e.target.value) || 1000)}
                min="100"
                max="100000"
                step="100"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                loading ? 'bg-yellow-500' : results.length > 0 ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
              <span className="text-sm">
                {loading ? 'Running...' : results.length > 0 ? 'Complete' : 'Ready'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {!mockDataEnabled && (
        <Card>
          <CardContent className="text-center py-12">
            <Zap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Monte Carlo Parameters
            </h3>
            <p className="text-gray-500 mb-4">
              Enable mock data to see sample parameters, or configure your own probability distributions to run simulations.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Parameters */}
      {mockDataEnabled && (
        <Card>
        <CardHeader>
          <CardTitle>Input Parameters</CardTitle>
          <CardDescription>
            Probability distributions for input variables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {parameters.map((param) => (
              <div key={param.id} className="p-4 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <p className="text-sm text-gray-600">{param.name}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Distribution</label>
                    <p className="text-sm text-gray-600 capitalize">{param.distribution}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Parameters</label>
                    <p className="text-sm text-gray-600">
                      {param.distribution === 'normal' && `μ=${param.mean}, σ=${param.stdDev}`}
                      {param.distribution === 'uniform' && `[${param.min}, ${param.max}]`}
                      {param.distribution === 'triangular' && `[${param.min}, ${param.mode}, ${param.max}]`}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Unit</label>
                    <p className="text-sm text-gray-600">{param.unit}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && statistics && (
        <>
          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Simulation Results</CardTitle>
              <CardDescription>
                Statistical summary of {results.length.toLocaleString()} iterations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600">Mean</p>
                  <p className="text-lg font-bold text-blue-900">
                    ${statistics.mean.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600">Median</p>
                  <p className="text-lg font-bold text-green-900">
                    ${statistics.median.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-600">Std Dev</p>
                  <p className="text-lg font-bold text-yellow-900">
                    ${statistics.stdDev.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600">95% VaR</p>
                  <p className="text-lg font-bold text-red-900">
                    ${statistics.var95.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts */}
          <Card>
            <CardHeader>
              <CardTitle>Outcome Distribution</CardTitle>
              <CardDescription>
                Histogram of simulation outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Bar data={histogramData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          {/* Risk Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Analysis</CardTitle>
              <CardDescription>
                Probability of different outcome scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">Loss Probability</h4>
                  <p className="text-2xl font-bold text-red-900">
                    {((results.filter(r => r.outcome < 0).length / results.length) * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    Chance of negative NPV
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-2">Breakeven Range</h4>
                  <p className="text-2xl font-bold text-yellow-900">
                    {((results.filter(r => r.outcome >= 0 && r.outcome <= statistics.mean).length / results.length) * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Outcomes near breakeven
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Success Probability</h4>
                  <p className="text-2xl font-bold text-green-900">
                    {((results.filter(r => r.outcome > statistics.mean).length / results.length) * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Outcomes above average
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default MonteCarloSimulation