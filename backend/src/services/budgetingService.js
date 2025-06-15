class BudgetingService {

  /**
   * Create a budget plan
   * @param {Object} budgetData - Budget planning data
   * @returns {Object} Budget plan results
   */
  static createBudgetPlan(budgetData) {
    const {
      projectName,
      totalBudget,
      categories,
      timeframe,
      currency = 'USD'
    } = budgetData;

    if (!totalBudget || totalBudget <= 0) {
      throw new Error('Total budget must be greater than 0');
    }

    if (!categories || categories.length === 0) {
      throw new Error('At least one budget category is required');
    }

    // Validate categories sum to 100% if percentages are used
    const totalPercentage = categories.reduce((sum, cat) => {
      return sum + (cat.percentage || 0);
    }, 0);

    const budgetBreakdown = categories.map(category => {
      const amount = category.amount || (totalBudget * (category.percentage / 100));
      return {
        name: category.name,
        plannedAmount: Math.round(amount * 100) / 100,
        percentage: Math.round((amount / totalBudget) * 10000) / 100,
        description: category.description || '',
        type: category.type || 'expense'
      };
    });

    const allocatedBudget = budgetBreakdown.reduce((sum, cat) => sum + cat.plannedAmount, 0);
    const unallocatedBudget = totalBudget - allocatedBudget;

    return {
      projectName: projectName || 'Unnamed Project',
      totalBudget,
      allocatedBudget: Math.round(allocatedBudget * 100) / 100,
      unallocatedBudget: Math.round(unallocatedBudget * 100) / 100,
      allocationPercentage: Math.round((allocatedBudget / totalBudget) * 10000) / 100,
      currency,
      timeframe: timeframe || 'annual',
      budgetBreakdown,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Budget vs Actual Analysis
   * @param {Object} analysisData - Budget vs actual data
   * @returns {Object} Variance analysis results
   */
  static budgetVarianceAnalysis(analysisData) {
    const { budgetPlan, actualExpenses } = analysisData;

    if (!budgetPlan || !actualExpenses) {
      throw new Error('Budget plan and actual expenses are required');
    }

    const varianceAnalysis = budgetPlan.budgetBreakdown.map(budgetCategory => {
      const actualCategory = actualExpenses.find(actual =>
        actual.name.toLowerCase() === budgetCategory.name.toLowerCase()
      );

      const actualAmount = actualCategory ? actualCategory.amount : 0;
      const variance = actualAmount - budgetCategory.plannedAmount;
      const variancePercentage = budgetCategory.plannedAmount > 0
        ? (variance / budgetCategory.plannedAmount) * 100
        : 0;

      return {
        category: budgetCategory.name,
        plannedAmount: budgetCategory.plannedAmount,
        actualAmount,
        variance: Math.round(variance * 100) / 100,
        variancePercentage: Math.round(variancePercentage * 100) / 100,
        status: variance > 0 ? 'over' : variance < 0 ? 'under' : 'on-track',
        varianceType: Math.abs(variancePercentage) > 10 ? 'significant' : 'minor'
      };
    });

    const totalPlanned = budgetPlan.totalBudget;
    const totalActual = actualExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalVariance = totalActual - totalPlanned;
    const totalVariancePercentage = (totalVariance / totalPlanned) * 100;

    return {
      projectName: budgetPlan.projectName,
      totalPlanned,
      totalActual: Math.round(totalActual * 100) / 100,
      totalVariance: Math.round(totalVariance * 100) / 100,
      totalVariancePercentage: Math.round(totalVariancePercentage * 100) / 100,
      overallStatus: totalVariance > 0 ? 'over-budget' : totalVariance < 0 ? 'under-budget' : 'on-budget',
      budgetUtilization: Math.round((totalActual / totalPlanned) * 10000) / 100,
      varianceAnalysis,
      analysisDate: new Date().toISOString()
    };
  }

  /**
   * Budget Forecasting
   * @param {Object} forecastData - Forecasting data
   * @returns {Object} Budget forecast results
   */
  static budgetForecast(forecastData) {
    const {
      budgetPlan,
      actualSpendingToDate,
      timeElapsed,
      totalTimeframe,
      trendType = 'linear'
    } = forecastData;

    if (!budgetPlan || !actualSpendingToDate || !timeElapsed || !totalTimeframe) {
      throw new Error('Budget plan, actual spending, time elapsed, and total timeframe are required');
    }

    const progressPercentage = (timeElapsed / totalTimeframe) * 100;
    const spendingRate = actualSpendingToDate / timeElapsed;

    let projectedTotal;
    if (trendType === 'linear') {
      projectedTotal = spendingRate * totalTimeframe;
    } else if (trendType === 'accelerating') {
      // Assuming 20% acceleration
      projectedTotal = spendingRate * totalTimeframe * 1.2;
    } else if (trendType === 'decelerating') {
      // Assuming 20% deceleration
      projectedTotal = spendingRate * totalTimeframe * 0.8;
    } else {
      projectedTotal = spendingRate * totalTimeframe;
    }

    const projectedVariance = projectedTotal - budgetPlan.totalBudget;
    const projectedVariancePercentage = (projectedVariance / budgetPlan.totalBudget) * 100;

    const remainingBudget = budgetPlan.totalBudget - actualSpendingToDate;
    const remainingTime = totalTimeframe - timeElapsed;
    const requiredBurnRate = remainingTime > 0 ? remainingBudget / remainingTime : 0;

    return {
      projectName: budgetPlan.projectName,
      currentStatus: {
        timeElapsed,
        totalTimeframe,
        progressPercentage: Math.round(progressPercentage * 100) / 100,
        actualSpendingToDate,
        budgetUtilized: Math.round((actualSpendingToDate / budgetPlan.totalBudget) * 10000) / 100
      },
      forecast: {
        currentBurnRate: Math.round(spendingRate * 100) / 100,
        projectedTotal: Math.round(projectedTotal * 100) / 100,
        projectedVariance: Math.round(projectedVariance * 100) / 100,
        projectedVariancePercentage: Math.round(projectedVariancePercentage * 100) / 100,
        trendType
      },
      recommendations: {
        remainingBudget: Math.round(remainingBudget * 100) / 100,
        remainingTime,
        requiredBurnRate: Math.round(requiredBurnRate * 100) / 100,
        recommendation: this.generateRecommendation(projectedVariancePercentage, progressPercentage)
      },
      forecastDate: new Date().toISOString()
    };
  }

  /**
   * Budget Optimization
   * @param {Object} optimizationData - Budget optimization parameters
   * @returns {Object} Optimization recommendations
   */
  static budgetOptimization(optimizationData) {
    const {
      budgetPlan,
      constraints,
      priorities,
      optimizationGoal = 'cost-reduction'
    } = optimizationData;

    if (!budgetPlan) {
      throw new Error('Budget plan is required for optimization');
    }

    const optimizedCategories = budgetPlan.budgetBreakdown.map(category => {
      const priority = priorities?.find(p => p.category === category.name)?.priority || 'medium';
      const constraint = constraints?.find(c => c.category === category.name);

      let optimizedAmount = category.plannedAmount;
      let optimization = 'no-change';

      // Apply optimization logic based on priority and goal
      if (optimizationGoal === 'cost-reduction') {
        if (priority === 'low' && (!constraint || !constraint.fixed)) {
          optimizedAmount = category.plannedAmount * 0.85; // 15% reduction
          optimization = 'reduce';
        } else if (priority === 'medium' && (!constraint || !constraint.fixed)) {
          optimizedAmount = category.plannedAmount * 0.95; // 5% reduction
          optimization = 'slight-reduce';
        }
      } else if (optimizationGoal === 'value-maximization') {
        if (priority === 'high' && (!constraint || constraint.maxIncrease)) {
          const maxIncrease = constraint?.maxIncrease || 0.1;
          optimizedAmount = category.plannedAmount * (1 + maxIncrease);
          optimization = 'increase';
        }
      }

      const savings = category.plannedAmount - optimizedAmount;

      return {
        category: category.name,
        originalAmount: category.plannedAmount,
        optimizedAmount: Math.round(optimizedAmount * 100) / 100,
        savings: Math.round(savings * 100) / 100,
        savingsPercentage: Math.round((savings / category.plannedAmount) * 10000) / 100,
        priority,
        optimization,
        reasoning: this.getOptimizationReasoning(optimization, priority, savings)
      };
    });

    const totalOriginal = budgetPlan.totalBudget;
    const totalOptimized = optimizedCategories.reduce((sum, cat) => sum + cat.optimizedAmount, 0);
    const totalSavings = totalOriginal - totalOptimized;

    return {
      projectName: budgetPlan.projectName,
      optimizationGoal,
      summary: {
        originalBudget: totalOriginal,
        optimizedBudget: Math.round(totalOptimized * 100) / 100,
        totalSavings: Math.round(totalSavings * 100) / 100,
        savingsPercentage: Math.round((totalSavings / totalOriginal) * 10000) / 100
      },
      optimizedCategories,
      recommendations: this.generateOptimizationRecommendations(optimizedCategories),
      optimizationDate: new Date().toISOString()
    };
  }

  /**
   * Budget Performance Metrics
   * @param {Object} metricsData - Performance metrics data
   * @returns {Object} Budget performance analysis
   */
  static budgetPerformanceMetrics(metricsData) {
    const {
      budgetHistory,
      benchmarkData,
      timeframe = 'monthly'
    } = metricsData;

    if (!budgetHistory || budgetHistory.length === 0) {
      throw new Error('Budget history is required for performance metrics');
    }

    // Calculate accuracy metrics
    const accuracyMetrics = budgetHistory.map(period => {
      const accuracy = 100 - Math.abs(period.variancePercentage);
      return {
        period: period.period,
        accuracy: Math.max(0, Math.round(accuracy * 100) / 100),
        variance: period.variancePercentage
      };
    });

    const averageAccuracy = accuracyMetrics.reduce((sum, metric) => sum + metric.accuracy, 0) / accuracyMetrics.length;

    // Calculate trend analysis
    const trendAnalysis = this.calculateBudgetTrend(budgetHistory);

    // Benchmark comparison
    let benchmarkComparison = null;
    if (benchmarkData) {
      benchmarkComparison = {
        industryAverage: benchmarkData.industryAverage || 0,
        performanceVsBenchmark: averageAccuracy - (benchmarkData.industryAverage || 0),
        ranking: this.calculateBenchmarkRanking(averageAccuracy, benchmarkData)
      };
    }

    return {
      timeframe,
      accuracyMetrics,
      summary: {
        averageAccuracy: Math.round(averageAccuracy * 100) / 100,
        bestPeriod: accuracyMetrics.reduce((best, current) =>
          current.accuracy > best.accuracy ? current : best
        ),
        worstPeriod: accuracyMetrics.reduce((worst, current) =>
          current.accuracy < worst.accuracy ? current : worst
        )
      },
      trendAnalysis,
      benchmarkComparison,
      recommendations: this.generatePerformanceRecommendations(averageAccuracy, trendAnalysis),
      analysisDate: new Date().toISOString()
    };
  }

  // Helper methods
  static generateRecommendation(projectedVariancePercentage, progressPercentage) {
    if (projectedVariancePercentage > 10) {
      return 'Significant budget overrun projected. Consider reducing scope or securing additional funding.';
    } else if (projectedVariancePercentage > 5) {
      return 'Minor budget overrun projected. Monitor spending closely and optimize where possible.';
    } else if (projectedVariancePercentage < -10) {
      return 'Significant under-spending projected. Consider reallocating budget or expanding scope.';
    } else {
      return 'Budget tracking well. Continue current spending patterns.';
    }
  }

  static getOptimizationReasoning(optimization, priority, savings) {
    switch (optimization) {
      case 'reduce':
        return `Low priority category - recommended for ${Math.abs(savings).toFixed(2)} reduction`;
      case 'slight-reduce':
        return `Medium priority category - minor optimization opportunity`;
      case 'increase':
        return `High priority category - investment recommended for value maximization`;
      default:
        return 'No optimization recommended for this category';
    }
  }

  static generateOptimizationRecommendations(optimizedCategories) {
    const recommendations = [];

    optimizedCategories.forEach(category => {
      if (category.savings > 0) {
        recommendations.push(`Consider reducing ${category.category} budget by ${category.savingsPercentage.toFixed(1)}%`);
      } else if (category.savings < 0) {
        recommendations.push(`Consider increasing ${category.category} budget for better value`);
      }
    });

    return recommendations.slice(0, 5); // Return top 5 recommendations
  }

  static calculateBudgetTrend(budgetHistory) {
    if (budgetHistory.length < 2) {
      return { trend: 'insufficient-data', slope: 0 };
    }

    // Simple linear regression for trend
    const n = budgetHistory.length;
    const sumX = budgetHistory.reduce((sum, _, index) => sum + index, 0);
    const sumY = budgetHistory.reduce((sum, period) => sum + period.variancePercentage, 0);
    const sumXY = budgetHistory.reduce((sum, period, index) => sum + (index * period.variancePercentage), 0);
    const sumXX = budgetHistory.reduce((sum, _, index) => sum + (index * index), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    let trend;
    if (slope > 1) trend = 'worsening';
    else if (slope > -1) trend = 'stable';
    else trend = 'improving';

    return { trend, slope: Math.round(slope * 100) / 100 };
  }

  static calculateBenchmarkRanking(accuracy, benchmarkData) {
    if (!benchmarkData.percentiles) return 'unknown';

    if (accuracy >= benchmarkData.percentiles.p90) return 'top-10%';
    else if (accuracy >= benchmarkData.percentiles.p75) return 'top-25%';
    else if (accuracy >= benchmarkData.percentiles.p50) return 'median';
    else if (accuracy >= benchmarkData.percentiles.p25) return 'bottom-25%';
    else return 'bottom-10%';
  }

  static generatePerformanceRecommendations(averageAccuracy, trendAnalysis) {
    const recommendations = [];

    if (averageAccuracy < 70) {
      recommendations.push('Budget accuracy is below acceptable levels. Review estimation methods.');
    }

    if (trendAnalysis.trend === 'worsening') {
      recommendations.push('Budget performance is declining. Implement corrective measures.');
    }

    if (averageAccuracy > 90) {
      recommendations.push('Excellent budget performance. Document and share best practices.');
    }

    return recommendations;
  }
}

module.exports = BudgetingService;