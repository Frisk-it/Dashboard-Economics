const math = require('mathjs');

class CostEstimationService {

  /**
   * COCOMO Model Implementation
   * @param {number} kloc - Kilo Lines of Code
   * @param {string} projectType - organic, semidetached, embedded
   * @param {number} teamSize - Team size
   * @returns {Object} Cost estimation results
   */
  static cocomoEstimation(kloc, projectType = 'organic', teamSize = 5) {
    const cocomoConstants = {
      organic: { a: 2.4, b: 1.05, c: 2.5, d: 0.38 },
      semidetached: { a: 3.0, b: 1.12, c: 2.5, d: 0.35 },
      embedded: { a: 3.6, b: 1.20, c: 2.5, d: 0.32 }
    };

    const constants = cocomoConstants[projectType] || cocomoConstants.organic;

    // Effort in person-months
    const effort = constants.a * Math.pow(kloc, constants.b);

    // Development time in months
    const developmentTime = constants.c * Math.pow(effort, constants.d);

    // Average team size
    const averageTeamSize = effort / developmentTime;

    // Cost per person-month (assumed $8000)
    const costPerPersonMonth = 8000;
    const totalCost = effort * costPerPersonMonth;

    // Productivity
    const productivity = kloc / effort;

    return {
      model: 'COCOMO',
      projectType,
      kloc,
      effort: Math.round(effort * 100) / 100,
      developmentTime: Math.round(developmentTime * 100) / 100,
      averageTeamSize: Math.round(averageTeamSize * 100) / 100,
      totalCost: Math.round(totalCost),
      productivity: Math.round(productivity * 100) / 100,
      costPerPersonMonth
    };
  }

  /**
   * Function Points Estimation
   * @param {Object} functionCounts - Object containing function point counts
   * @returns {Object} Function points estimation results
   */
  static functionPointsEstimation(functionCounts) {
    const {
      externalInputs = 0,
      externalOutputs = 0,
      externalInquiries = 0,
      internalLogicalFiles = 0,
      externalInterfaceFiles = 0,
      complexity = 'average' // simple, average, complex
    } = functionCounts;

    // Complexity weights
    const complexityWeights = {
      simple: {
        externalInputs: 3,
        externalOutputs: 4,
        externalInquiries: 3,
        internalLogicalFiles: 7,
        externalInterfaceFiles: 5
      },
      average: {
        externalInputs: 4,
        externalOutputs: 5,
        externalInquiries: 4,
        internalLogicalFiles: 10,
        externalInterfaceFiles: 7
      },
      complex: {
        externalInputs: 6,
        externalOutputs: 7,
        externalInquiries: 6,
        internalLogicalFiles: 15,
        externalInterfaceFiles: 10
      }
    };

    const weights = complexityWeights[complexity];

    // Calculate Unadjusted Function Points (UFP)
    const ufp =
      (externalInputs * weights.externalInputs) +
      (externalOutputs * weights.externalOutputs) +
      (externalInquiries * weights.externalInquiries) +
      (internalLogicalFiles * weights.internalLogicalFiles) +
      (externalInterfaceFiles * weights.externalInterfaceFiles);

    // Technical Complexity Factor (simplified - typically 0.65 to 1.35)
    const tcf = 1.0; // Assuming average complexity

    // Adjusted Function Points
    const afp = ufp * tcf;

    // Effort estimation (hours per function point - typically 10-20 hours)
    const hoursPerFP = 15;
    const totalHours = afp * hoursPerFP;

    // Cost estimation
    const hourlyRate = 75;
    const totalCost = totalHours * hourlyRate;

    // Development time (assuming 8 hours per day)
    const developmentDays = totalHours / 8;

    return {
      model: 'Function Points',
      complexity,
      unadjustedFunctionPoints: ufp,
      technicalComplexityFactor: tcf,
      adjustedFunctionPoints: Math.round(afp * 100) / 100,
      totalHours: Math.round(totalHours),
      totalCost: Math.round(totalCost),
      developmentDays: Math.round(developmentDays),
      hourlyRate,
      breakdown: {
        externalInputs: { count: externalInputs, weight: weights.externalInputs, total: externalInputs * weights.externalInputs },
        externalOutputs: { count: externalOutputs, weight: weights.externalOutputs, total: externalOutputs * weights.externalOutputs },
        externalInquiries: { count: externalInquiries, weight: weights.externalInquiries, total: externalInquiries * weights.externalInquiries },
        internalLogicalFiles: { count: internalLogicalFiles, weight: weights.internalLogicalFiles, total: internalLogicalFiles * weights.internalLogicalFiles },
        externalInterfaceFiles: { count: externalInterfaceFiles, weight: weights.externalInterfaceFiles, total: externalInterfaceFiles * weights.externalInterfaceFiles }
      }
    };
  }

  /**
   * Expert Judgment / Delphi Method Estimation
   * @param {Array} estimates - Array of expert estimates
   * @returns {Object} Delphi estimation results
   */
  static expertJudgmentEstimation(estimates) {
    if (!estimates || estimates.length === 0) {
      throw new Error('At least one estimate is required');
    }

    const sortedEstimates = estimates.sort((a, b) => a - b);
    const n = estimates.length;

    // Calculate statistics
    const mean = estimates.reduce((sum, val) => sum + val, 0) / n;
    const median = n % 2 === 0
      ? (sortedEstimates[n/2 - 1] + sortedEstimates[n/2]) / 2
      : sortedEstimates[Math.floor(n/2)];

    // Standard deviation
    const variance = estimates.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    // Remove outliers (values beyond 2 standard deviations)
    const filteredEstimates = estimates.filter(est => Math.abs(est - mean) <= 2 * stdDev);
    const adjustedMean = filteredEstimates.length > 0
      ? filteredEstimates.reduce((sum, val) => sum + val, 0) / filteredEstimates.length
      : mean;

    // Three-point estimation (PERT)
    const optimistic = Math.min(...estimates);
    const pessimistic = Math.max(...estimates);
    const mostLikely = median;
    const pertEstimate = (optimistic + 4 * mostLikely + pessimistic) / 6;

    return {
      model: 'Expert Judgment (Delphi)',
      numberOfExperts: n,
      originalEstimates: estimates,
      statistics: {
        mean: Math.round(mean * 100) / 100,
        median: Math.round(median * 100) / 100,
        standardDeviation: Math.round(stdDev * 100) / 100,
        minimum: optimistic,
        maximum: pessimistic
      },
      filteredEstimates: filteredEstimates,
      adjustedMean: Math.round(adjustedMean * 100) / 100,
      pertEstimate: Math.round(pertEstimate * 100) / 100,
      confidenceRange: {
        low: Math.round((adjustedMean - stdDev) * 100) / 100,
        high: Math.round((adjustedMean + stdDev) * 100) / 100
      }
    };
  }

  /**
   * Regression Analysis Estimation
   * @param {Array} historicalData - Array of objects with {size, effort}
   * @param {number} projectSize - Size of the new project
   * @returns {Object} Regression estimation results
   */
  static regressionAnalysisEstimation(historicalData, projectSize) {
    if (!historicalData || historicalData.length < 2) {
      throw new Error('At least 2 historical data points are required');
    }

    const n = historicalData.length;
    const sumX = historicalData.reduce((sum, item) => sum + item.size, 0);
    const sumY = historicalData.reduce((sum, item) => sum + item.effort, 0);
    const sumXY = historicalData.reduce((sum, item) => sum + (item.size * item.effort), 0);
    const sumX2 = historicalData.reduce((sum, item) => sum + (item.size * item.size), 0);

    // Linear regression: y = a + bx
    const b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const a = (sumY - b * sumX) / n;

    // Predicted effort
    const predictedEffort = a + b * projectSize;

    // Correlation coefficient
    const sumY2 = historicalData.reduce((sum, item) => sum + (item.effort * item.effort), 0);
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    const correlationCoefficient = denominator === 0 ? 0 : numerator / denominator;

    // R-squared (coefficient of determination)
    const rSquared = correlationCoefficient * correlationCoefficient;

    // Standard error of estimate
    const yMean = sumY / n;
    const ssr = historicalData.reduce((sum, item) => {
      const predicted = a + b * item.size;
      return sum + Math.pow(item.effort - predicted, 2);
    }, 0);
    const standardError = Math.sqrt(ssr / (n - 2));

    return {
      model: 'Regression Analysis',
      regressionEquation: {
        intercept: Math.round(a * 100) / 100,
        slope: Math.round(b * 100) / 100,
        equation: `Effort = ${Math.round(a * 100) / 100} + ${Math.round(b * 100) / 100} × Size`
      },
      projectSize,
      predictedEffort: Math.round(predictedEffort * 100) / 100,
      statisticalMeasures: {
        correlationCoefficient: Math.round(correlationCoefficient * 100) / 100,
        rSquared: Math.round(rSquared * 100) / 100,
        standardError: Math.round(standardError * 100) / 100
      },
      confidenceInterval: {
        lower: Math.round((predictedEffort - 1.96 * standardError) * 100) / 100,
        upper: Math.round((predictedEffort + 1.96 * standardError) * 100) / 100
      },
      dataPoints: historicalData.length
    };
  }

  /**
   * Compare multiple estimation results
   * @param {Array} estimations - Array of estimation results
   * @returns {Object} Comparison results
   */
  static compareEstimations(estimations) {
    if (!estimations || estimations.length === 0) {
      throw new Error('At least one estimation is required for comparison');
    }

    const efforts = estimations.map(est => est.effort || est.predictedEffort || est.adjustedMean || est.totalHours / 8).filter(Boolean);
    const costs = estimations.map(est => est.totalCost).filter(Boolean);

    const effortStats = this.calculateStatistics(efforts);
    const costStats = this.calculateStatistics(costs);

    return {
      estimations,
      summary: {
        numberOfEstimations: estimations.length,
        effortStatistics: effortStats,
        costStatistics: costStats,
        averageEffort: Math.round(effortStats.mean * 100) / 100,
        averageCost: Math.round(costStats.mean),
        effortRange: {
          min: Math.min(...efforts),
          max: Math.max(...efforts),
          spread: Math.max(...efforts) - Math.min(...efforts)
        },
        costRange: {
          min: Math.min(...costs),
          max: Math.max(...costs),
          spread: Math.max(...costs) - Math.min(...costs)
        }
      }
    };
  }

  static calculateStatistics(values) {
    if (values.length === 0) return { mean: 0, median: 0, stdDev: 0 };

    const sorted = values.sort((a, b) => a - b);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const median = values.length % 2 === 0
      ? (sorted[values.length/2 - 1] + sorted[values.length/2]) / 2
      : sorted[Math.floor(values.length/2)];

    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return { mean, median, stdDev };
  }
}

module.exports = CostEstimationService;