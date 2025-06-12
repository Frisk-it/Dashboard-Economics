const { supabase } = require('../config/supabase');

class CalculationHistoryService {
  // Save a calculation to the database
  static async saveCalculation(userId, calculationData) {
    try {
      const { data, error } = await supabase
        .from('analysis_results')
        .insert([
          {
            user_id: userId,
            analysis_type: 'cost_estimation',
            method: calculationData.method,
            input_parameters: calculationData.inputData,
            results: calculationData.results,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data[0]
      };
    } catch (error) {
      console.error('Error saving calculation:', error);
      throw new Error('Failed to save calculation');
    }
  }

  // Get all calculations for a user
  static async getUserCalculations(userId, limit = 50, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('analysis_results')
        .select('*')
        .eq('user_id', userId)
        .eq('analysis_type', 'cost_estimation')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Error fetching calculations:', error);
      throw new Error('Failed to fetch calculations');
    }
  }

  // Get a specific calculation by ID
  static async getCalculationById(userId, calculationId) {
    try {
      const { data, error } = await supabase
        .from('analysis_results')
        .select('*')
        .eq('user_id', userId)
        .eq('analysis_type', 'cost_estimation')
        .eq('id', calculationId)
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error fetching calculation:', error);
      throw new Error('Failed to fetch calculation');
    }
  }

  // Delete a calculation
  static async deleteCalculation(userId, calculationId) {
    try {
      const { error } = await supabase
        .from('analysis_results')
        .delete()
        .eq('user_id', userId)
        .eq('analysis_type', 'cost_estimation')
        .eq('id', calculationId);

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Calculation deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting calculation:', error);
      throw new Error('Failed to delete calculation');
    }
  }

  // Get calculation statistics for a user
  static async getUserCalculationStats(userId) {
    try {
      const { data, error } = await supabase
        .from('analysis_results')
        .select('method, created_at')
        .eq('user_id', userId)
        .eq('analysis_type', 'cost_estimation');

      if (error) {
        throw error;
      }

      const stats = {
        totalCalculations: data.length,
        methodCounts: {},
        recentActivity: data.slice(0, 10)
      };

      // Count calculations by method
      data.forEach(calc => {
        stats.methodCounts[calc.method] = (stats.methodCounts[calc.method] || 0) + 1;
      });

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error fetching calculation stats:', error);
      throw new Error('Failed to fetch calculation statistics');
    }
  }
}

module.exports = CalculationHistoryService;