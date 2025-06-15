import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TreePine, Plus, Trash2, Play, Download, Edit3, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface DecisionNode {
  id: string
  type: 'decision' | 'chance' | 'terminal'
  name: string
  parentId: string | null
  x: number
  y: number
  probability?: number
  value?: number
  children: string[]
}

interface DecisionTreeType {
  id: string
  name: string
  nodes: DecisionNode[]
  expectedValue: number
}

interface DecisionTreeProps {
  mockDataEnabled: boolean
}

const DecisionTree: React.FC<DecisionTreeProps> = ({ mockDataEnabled }) => {
  const [trees, setTrees] = useState<DecisionTreeType[]>([])
  const [activeTree, setActiveTree] = useState<string>('')
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Sample decision tree data
  useEffect(() => {
    if (!mockDataEnabled) {
      setTrees([])
      setActiveTree('')
      return
    }

    const sampleTree: DecisionTreeType = {
      id: '1',
      name: 'Product Launch Decision',
      expectedValue: 0,
      nodes: [
        {
          id: 'root',
          type: 'decision',
          name: 'Launch New Product?',
          parentId: null,
          x: 100,
          y: 300,
          children: ['launch', 'no-launch']
        },
        {
          id: 'launch',
          type: 'chance',
          name: 'Market Response',
          parentId: 'root',
          x: 300,
          y: 200,
          children: ['success', 'failure']
        },
        {
          id: 'no-launch',
          type: 'terminal',
          name: 'Status Quo',
          parentId: 'root',
          x: 300,
          y: 400,
          value: 0,
          children: []
        },
        {
          id: 'success',
          type: 'terminal',
          name: 'High Sales',
          parentId: 'launch',
          x: 500,
          y: 150,
          probability: 0.6,
          value: 150000,
          children: []
        },
        {
          id: 'failure',
          type: 'terminal',
          name: 'Low Sales',
          parentId: 'launch',
          x: 500,
          y: 250,
          probability: 0.4,
          value: -50000,
          children: []
        }
      ]
    }
    setTrees([sampleTree])
    setActiveTree('1')
  }, [mockDataEnabled])

  const currentTree = trees.find(t => t.id === activeTree)

  const calculateExpectedValue = (nodeId: string, nodes: DecisionNode[]): number => {
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return 0

    if (node.type === 'terminal') {
      return node.value || 0
    }

    if (node.type === 'chance') {
      return node.children.reduce((sum, childId) => {
        const child = nodes.find(n => n.id === childId)
        if (child && child.probability) {
          return sum + (child.probability * calculateExpectedValue(childId, nodes))
        }
        return sum
      }, 0)
    }

    if (node.type === 'decision') {
      // For decision nodes, return the maximum expected value of children
      const childValues = node.children.map(childId => calculateExpectedValue(childId, nodes))
      return Math.max(...childValues, 0)
    }

    return 0
  }

  const runAnalysis = async () => {
    if (!currentTree) return

    setLoading(true)
    try {
      // Simulate analysis
      await new Promise(resolve => setTimeout(resolve, 1500))

      const rootValue = calculateExpectedValue('root', currentTree.nodes)
      const updatedTree = { ...currentTree, expectedValue: rootValue }

      setTrees(trees.map(t => t.id === activeTree ? updatedTree : t))
      toast.success('Decision tree analysis completed')
    } catch (error) {
      toast.error('Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const getNodeIcon = (type: DecisionNode['type']) => {
    switch (type) {
      case 'decision':
        return '□'
      case 'chance':
        return '◯'
      case 'terminal':
        return '△'
      default:
        return '?'
    }
  }

  const getNodeColor = (type: DecisionNode['type']) => {
    switch (type) {
      case 'decision':
        return 'bg-blue-100 border-blue-500 text-blue-800'
      case 'chance':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800'
      case 'terminal':
        return 'bg-green-100 border-green-500 text-green-800'
      default:
        return 'bg-gray-100 border-gray-500 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TreePine className="h-5 w-5" />
                Decision Trees
              </CardTitle>
              <CardDescription>
                Visualize decision paths and calculate expected values
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={runAnalysis}
                disabled={loading || !currentTree}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Analyze
              </Button>
              <Button variant="outline" size="sm" disabled={!currentTree}>
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
            <TreePine className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Decision Tree Available
            </h3>
            <p className="text-gray-500 mb-4">
              Enable mock data to see sample decision trees, or create your own decision trees to analyze different scenarios.
            </p>
          </CardContent>
        </Card>
      )}

      {currentTree && mockDataEnabled && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tree Visualization */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{currentTree.name}</CardTitle>
                  <CardDescription>
                    Expected Value: ${currentTree.expectedValue.toLocaleString()}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 overflow-auto">
                <svg width="100%" height="100%" className="absolute inset-0">
                  {/* Draw connections */}
                  {currentTree.nodes.map(node =>
                    node.children.map(childId => {
                      const child = currentTree.nodes.find(n => n.id === childId)
                      if (!child) return null

                      return (
                        <line
                          key={`${node.id}-${childId}`}
                          x1={node.x + 60}
                          y1={node.y + 20}
                          x2={child.x}
                          y2={child.y + 20}
                          stroke="#6b7280"
                          strokeWidth="2"
                        />
                      )
                    })
                  )}

                  {/* Draw nodes */}
                  {currentTree.nodes.map(node => (
                    <g key={node.id}>
                      <foreignObject x={node.x} y={node.y} width="120" height="40">
                        <div
                          className={`w-full h-full rounded-lg border-2 p-2 cursor-pointer transition-all ${
                            getNodeColor(node.type)
                          } ${selectedNode === node.id ? 'ring-2 ring-blue-400' : ''}`}
                          onClick={() => setSelectedNode(node.id)}
                        >
                          <div className="text-xs font-semibold truncate">
                            {getNodeIcon(node.type)} {node.name}
                          </div>
                          {node.type === 'terminal' && (
                            <div className="text-xs">
                              ${node.value?.toLocaleString()}
                            </div>
                          )}
                          {node.probability && (
                            <div className="text-xs">
                              P: {(node.probability * 100).toFixed(0)}%
                            </div>
                          )}
                        </div>
                      </foreignObject>
                    </g>
                  ))}
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Node Details Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Node Details</CardTitle>
              <CardDescription>
                {selectedNode ? 'Selected node information' : 'Select a node to view details'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedNode ? (
                <div className="space-y-4">
                  {(() => {
                    const node = currentTree.nodes.find(n => n.id === selectedNode)
                    if (!node) return null

                    return (
                      <div>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium">Name:</span>
                            <p className="text-sm text-gray-600">{node.name}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Type:</span>
                            <p className="text-sm text-gray-600 capitalize">{node.type}</p>
                          </div>
                          {node.type === 'terminal' && (
                            <div>
                              <span className="text-sm font-medium">Value:</span>
                              <p className="text-sm text-gray-600">${node.value?.toLocaleString()}</p>
                            </div>
                          )}
                          {node.probability && (
                            <div>
                              <span className="text-sm font-medium">Probability:</span>
                              <p className="text-sm text-gray-600">{(node.probability * 100).toFixed(1)}%</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a node to view its properties</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analysis Results */}
      {currentTree && currentTree.expectedValue !== 0 && mockDataEnabled && (
        <Card>
          <CardHeader>
            <CardTitle>Decision Analysis Results</CardTitle>
            <CardDescription>
              Summary of expected values and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Expected Value</h4>
                <p className="text-2xl font-bold text-blue-900">
                  ${currentTree.expectedValue.toLocaleString()}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Overall expected outcome
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Best Case</h4>
                <p className="text-2xl font-bold text-green-900">
                  ${Math.max(...currentTree.nodes.filter(n => n.value).map(n => n.value || 0)).toLocaleString()}
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Maximum possible outcome
                </p>
              </div>

              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-800 mb-2">Worst Case</h4>
                <p className="text-2xl font-bold text-red-900">
                  ${Math.min(...currentTree.nodes.filter(n => n.value).map(n => n.value || 0)).toLocaleString()}
                </p>
                <p className="text-sm text-red-700 mt-1">
                  Minimum possible outcome
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Decision Path Analysis */}
      {currentTree && mockDataEnabled && (
        <Card>
          <CardHeader>
            <CardTitle>Decision Path Analysis</CardTitle>
            <CardDescription>
              Optimal decision paths and probability breakdowns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Recommended Path</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Based on expected value maximization:
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Launch Product</span>
                  <span>→</span>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Market Response</span>
                  <span>→</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Expected: $70,000</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium mb-2">Success Scenario</h5>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Probability: 60%</div>
                    <div>Outcome: $150,000</div>
                    <div>Contribution: $90,000</div>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Failure Scenario</h5>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Probability: 40%</div>
                    <div>Outcome: -$50,000</div>
                    <div>Contribution: -$20,000</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default DecisionTree