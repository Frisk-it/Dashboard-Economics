import React from 'react'
import { Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const RiskManagementPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Risk Management</h1>
        <p className="text-gray-600 mt-1">
          Perform sensitivity analysis, decision trees, and Monte Carlo simulations
        </p>
      </div>

      <Card>
        <CardContent className="text-center py-12">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Coming Soon
          </h3>
          <p className="text-gray-500">
            Risk management tools will be available in the next update.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default RiskManagementPage