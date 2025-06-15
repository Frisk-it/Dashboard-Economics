import React, { useState, useEffect } from 'react'
import { Clock, TrendingUp, Eye, Trash2, Filter, Download, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { toast } from 'sonner'

interface Calculation {
  id: string
  method: string
  input_parameters: any
  results: any
  created_at: string
}

const CalculationHistoryPage: React.FC = () => {
  const [calculations, setCalculations] = useState<Calculation[]>([])
  const [filteredCalculations, setFilteredCalculations] = useState<Calculation[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCalculation, setSelectedCalculation] = useState<Calculation | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMethod, setSelectedMethod] = useState('all')
  const [pagination, setPagination] = useState({ page: 1, limit: 20 })

  const methodColors = {
    'COCOMO': 'bg-blue-100 text-blue-800',
    'Function Points': 'bg-green-100 text-green-800',
    'Regression Analysis': 'bg-orange-100 text-orange-800'
  }

  useEffect(() => {
    fetchCalculations()
    fetchStats()
  }, [pagination])

  useEffect(() => {
    filterCalculations()
  }, [calculations, searchTerm, selectedMethod])

  const fetchCalculations = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/calculations/history?page=${pagination.page}&limit=${pagination.limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch calculations')
      }

      const data = await response.json()
      setCalculations(data.data || [])
    } catch (error) {
      console.error('Error fetching calculations:', error)
      toast.error('Failed to load calculation history')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/calculations/history/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }

      const data = await response.json()
      setStats(data.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const filterCalculations = () => {
    let filtered = calculations

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(calc =>
        calc.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
        calc.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by method
    if (selectedMethod !== 'all') {
      filtered = filtered.filter(calc => calc.method === selectedMethod)
    }

    setFilteredCalculations(filtered)
  }

  const deleteCalculation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this calculation?')) {
      return
    }

    try {
      const response = await fetch(`/api/calculations/history/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete calculation')
      }

      setCalculations(prev => prev.filter(calc => calc.id !== id))
      toast.success('Calculation deleted successfully')
    } catch (error) {
      console.error('Error deleting calculation:', error)
      toast.error('Failed to delete calculation')
    }
  }

  const viewCalculation = (calculation: Calculation) => {
    setSelectedCalculation(calculation)
  }

  const exportCalculations = () => {
    const csvContent = [
      ['Date', 'Method', 'Results', 'Input Parameters'].join(','),
      ...filteredCalculations.map(calc => [
        new Date(calc.created_at).toLocaleDateString(),
        calc.method,
        JSON.stringify(calc.results),
        JSON.stringify(calc.input_parameters)
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'calculation_history.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getMethodOptions = () => {
    const methods = [...new Set(calculations.map(calc => calc.method))]
    return methods
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calculation History</h1>
          <p className="text-gray-600 mt-1">
            View and manage your past cost estimation calculations
          </p>
        </div>
        <Button onClick={exportCalculations} className="flex items-center">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Calculations</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCalculations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {Object.entries(stats.methodCounts || {}).slice(0, 3).map(([method, count]: [string, any]) => (
            <Card key={method}>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{method}</p>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search calculations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedMethod}
          onChange={(e) => setSelectedMethod(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Methods</option>
          {getMethodOptions().map(method => (
            <option key={method} value={method}>{method}</option>
          ))}
        </select>
        <Button variant="outline" className="flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Calculations List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCalculations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No calculations found</h3>
              <p className="text-gray-500">
                {calculations.length === 0
                  ? "You haven't performed any calculations yet."
                  : "No calculations match your current filters."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredCalculations.map((calculation) => (
            <Card key={calculation.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        methodColors[calculation.method as keyof typeof methodColors] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {calculation.method}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(calculation.created_at)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {/* Key Results Preview */}
                      {calculation.results.effort && (
                        <div>
                          <p className="text-sm text-gray-600">Effort</p>
                          <p className="font-semibold">{formatNumber(calculation.results.effort)} PM</p>
                        </div>
                      )}
                      {calculation.results.cost && (
                        <div>
                          <p className="text-sm text-gray-600">Cost</p>
                          <p className="font-semibold">{formatCurrency(calculation.results.cost)}</p>
                        </div>
                      )}
                      {(calculation.results.time || calculation.results.functionPoints || calculation.results.adjustedMean) && (
                        <div>
                          <p className="text-sm text-gray-600">
                            {calculation.results.time ? 'Duration' :
                             calculation.results.functionPoints ? 'Function Points' :
                             'Adjusted Mean'}
                          </p>
                          <p className="font-semibold">
                            {calculation.results.time ? `${formatNumber(calculation.results.time)} months` :
                             calculation.results.functionPoints ? formatNumber(calculation.results.functionPoints) :
                             `${formatNumber(calculation.results.adjustedMean)} PM`}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Input Parameters Preview */}
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Input: </span>
                      {calculation.method === 'COCOMO' && calculation.input_parameters.kloc &&
                        `${calculation.input_parameters.kloc} KLOC, ${calculation.input_parameters.projectType}`}
                      {calculation.method === 'Function Points' &&
                        `${Object.values(calculation.input_parameters).slice(0, 3).join(', ')}...`}
                      {calculation.method === 'Regression Analysis' && calculation.input_parameters.historicalData &&
                        `${calculation.input_parameters.historicalData.length} historical data points`}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => viewCalculation(calculation)}
                      className="flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteCalculation(calculation.id)}
                      className="flex items-center text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Detailed View Modal */}
      {selectedCalculation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{selectedCalculation.method} Calculation</h2>
                <Button variant="outline" onClick={() => setSelectedCalculation(null)}>
                  Close
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Parameters */}
                <Card>
                  <CardHeader>
                    <CardTitle>Input Parameters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-50 p-4 rounded text-sm overflow-x-auto">
                      {JSON.stringify(selectedCalculation.input_parameters, null, 2)}
                    </pre>
                  </CardContent>
                </Card>

                {/* Results */}
                <Card>
                  <CardHeader>
                    <CardTitle>Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-50 p-4 rounded text-sm overflow-x-auto">
                      {JSON.stringify(selectedCalculation.results, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Created:</span> {formatDate(selectedCalculation.created_at)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Calculation ID:</span> {selectedCalculation.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {filteredCalculations.length > 0 && (
        <div className="flex justify-center items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {pagination.page}
          </span>
          <Button
            variant="outline"
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={filteredCalculations.length < pagination.limit}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

export default CalculationHistoryPage