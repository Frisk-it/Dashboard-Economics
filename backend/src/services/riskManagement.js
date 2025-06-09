const math = require('mathjs');
const ss = require('simple-statistics');

class RiskManagementService {

  /**
   * Perform Sensitivity Analysis
   * @param {Object} baseScenario - Base case parameters
   * @param {Object} variableRanges - Ranges for each variable to test
   * @returns {Object} Sensitivity analysis results
   */
  static sensitivityAnalysis(baseScenario, variableRanges) {
    const { revenue, costs, probability, discountRate } = baseScenario;
    const results = [];

    Object.keys(variableRanges).forEach(variable => {
      const range = variableRanges[variable];
      const { min, max, steps } = range;
      const stepSize = (max - min) / (steps - 1);

      for (let i = 0; i < steps; i++) {
        const value = min + (stepSize * i);
        const scenario = { ...baseScenario };
        scenario[variable] = value;

        // Calculate NPV for this scenario
        const npv = this.calculateScenarioNPV(scenario);
        const percentChange = ((value - baseScenario[variable]) / baseScenario[variable]) * 100;

        results.push({
          variable,
          value,
          percentChange: Math.round(percentChange * 100) / 100,
          npv: Math.round(npv * 100) / 100
        });
      }
    });

    // Calculate sensitivity coefficients
    const sensitivityCoefficients = {};
    Object.keys(variableRanges).forEach(variable => {
      const variableResults = results.filter(r => r.variable === variable);
      const npvValues = variableResults.map(r => r.npv);
      const percentChanges = variableResults.map(r => r.percentChange);

      // Simple linear regression slope calculation
      const n = npvValues.length;
      const sumX = percentChanges.reduce((a, b) => a + b, 0);
      const sumY = npvValues.reduce((a, b) => a + b, 0);
      const sumXY = percentChanges.reduce((sum, x, i) => sum + x * npvValues[i], 0);
      const sumX2 = percentChanges.reduce((sum, x) => sum + x * x, 0);

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      sensitivityCoefficients[variable] = Math.round(slope * 100) / 100;
    });

    return {
      type: 'Sensitivity Analysis',
      baseScenario,
      results,
      sensitivityCoefficients,
      ranking: Object.entries(sensitivityCoefficients)
        .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a))
        .map(([variable, coefficient]) => ({ variable, coefficient }))
    };
  }

  /**
   * Create and analyze decision tree
   * @param {Object} treeStructure - Decision tree structure
   * @returns {Object} Decision tree analysis results
   */
  static decisionTreeAnalysis(treeStructure) {
    const analyzeNode = (node) => {
      if (node.type === 'outcome') {
        return {
          ...node,
          expectedValue: node.value,
          path: [node.name]
        };
      }

      if (node.type === 'chance') {
        let expectedValue = 0;
        const outcomes = [];

        node.branches.forEach(branch => {
          const result = analyzeNode(branch);
          expectedValue += branch.probability * result.expectedValue;
          outcomes.push({
            ...result,
            probability: branch.probability,
            path: [node.name, ...result.path]
          });
        });

        return {
          ...node,
          expectedValue: Math.round(expectedValue * 100) / 100,
          outcomes
        };
      }

      if (node.type === 'decision') {
        const alternatives = node.branches.map(branch => {
          const result = analyzeNode(branch);
          return {
            ...result,
            decision: branch.name,
            path: [node.name, ...result.path]
          };
        });

        // Find best alternative (highest expected value)
        const bestAlternative = alternatives.reduce((best, current) =>
          current.expectedValue > best.expectedValue ? current : best
        );

        return {
          ...node,
          expectedValue: bestAlternative.expectedValue,
          bestDecision: bestAlternative.decision,
          alternatives
        };
      }
    };

    const analysis = analyzeNode(treeStructure.root);

    return {
      type: 'Decision Tree Analysis',
      analysis,
      recommendation: analysis.bestDecision,
      expectedValue: analysis.expectedValue
    };
  }

  /**
   * Monte Carlo Simulation
   * @param {Object} simulationParams - Parameters for simulation
   * @returns {Object} Monte Carlo simulation results
   */
  static monteCarloSimulation(simulationParams) {
    const {
      variables,
      iterations = 10000,
      formula = 'revenue - costs',
      confidenceLevel = 0.95
    } = simulationParams;

    const results = [];

    for (let i = 0; i < iterations; i++) {
      const scenario = {};

      // Generate random values for each variable
      Object.keys(variables).forEach(variable => {
        const config = variables[variable];
        scenario[variable] = this.generateRandomValue(config);
      });

      // Calculate the result using the formula
      const result = this.evaluateFormula(formula, scenario);
      results.push(result);
    }

    // Statistical analysis
    results.sort((a, b) => a - b);

    const mean = results.reduce((sum, val) => sum + val, 0) / results.length;
    const median = results[Math.floor(results.length / 2)];

    // Standard deviation calculation
    const variance = results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / results.length;
    const standardDeviation = Math.sqrt(variance);

    // Confidence intervals
    const alpha = 1 - confidenceLevel;
    const lowerIndex = Math.floor(results.length * alpha / 2);
    const upperIndex = Math.floor(results.length * (1 - alpha / 2));

    const confidenceInterval = {
      lower: results[lowerIndex],
      upper: results[upperIndex]
    };

    // Risk metrics
    const probabilityOfLoss = results.filter(r => r < 0).length / iterations;
    const valueAtRisk = results[Math.floor(results.length * 0.05)]; // 5% VaR
    const lossResults = results.filter(r => r <= valueAtRisk);
    const conditionalValueAtRisk = lossResults.length > 0 ? lossResults.reduce((sum, val) => sum + val, 0) / lossResults.length : 0;

    // Distribution analysis
    const histogram = this.createHistogram(results, 20);

    return {
      type: 'Monte Carlo Simulation',
      parameters: simulationParams,
      iterations,
      statistics: {
        mean: Math.round(mean * 100) / 100,
        median: Math.round(median * 100) / 100,
        standardDeviation: Math.round(standardDeviation * 100) / 100,
        variance: Math.round(variance * 100) / 100,
        minimum: Math.round(Math.min(...results) * 100) / 100,
        maximum: Math.round(Math.max(...results) * 100) / 100
      },
      confidenceInterval: {
        level: confidenceLevel,
        lower: Math.round(confidenceInterval.lower * 100) / 100,
        upper: Math.round(confidenceInterval.upper * 100) / 100
      },
      riskMetrics: {
        probabilityOfLoss: Math.round(probabilityOfLoss * 10000) / 100,
        valueAtRisk: Math.round(valueAtRisk * 100) / 100,
        conditionalValueAtRisk: Math.round(conditionalValueAtRisk * 100) / 100
      },
      histogram,
      percentiles: {
        p5: Math.round(results[Math.floor(results.length * 0.05)] * 100) / 100,
        p10: Math.round(results[Math.floor(results.length * 0.10)] * 100) / 100,
        p25: Math.round(results[Math.floor(results.length * 0.25)] * 100) / 100,
        p50: Math.round(results[Math.floor(results.length * 0.50)] * 100) / 100,
        p75: Math.round(results[Math.floor(results.length * 0.75)] * 100) / 100,
        p90: Math.round(results[Math.floor(results.length * 0.90)] * 100) / 100,
        p95: Math.round(results[Math.floor(results.length * 0.95)] * 100) / 100
      }
    };
  }

  /**
   * Scenario Analysis
   * @param {Object} scenarios - Different scenarios to analyze
   * @returns {Object} Scenario analysis results
   */
  static scenarioAnalysis(scenarios) {
    const results = scenarios.map(scenario => {
      const npv = this.calculateScenarioNPV(scenario);
      return {
        ...scenario,
        npv: Math.round(npv * 100) / 100
      };
    });

    // Calculate expected NPV if probabilities are provided
    let expectedNPV = null;
    const totalProbability = results.reduce((sum, scenario) => sum + (scenario.probability || 0), 0);

    if (Math.abs(totalProbability - 1) < 0.01) { // Probabilities sum to ~1
      expectedNPV = results.reduce((sum, scenario) => sum + (scenario.npv * scenario.probability), 0);
    }

    // Risk assessment
    const npvValues = results.map(s => s.npv);
    const worstCase = Math.min(...npvValues);
    const bestCase = Math.max(...npvValues);
    const range = bestCase - worstCase;

    return {
      type: 'Scenario Analysis',
      scenarios: results,
      summary: {
        expectedNPV: expectedNPV ? Math.round(expectedNPV * 100) / 100 : null,
        worstCase: Math.round(worstCase * 100) / 100,
        bestCase: Math.round(bestCase * 100) / 100,
        range: Math.round(range * 100) / 100,
        numberOfScenarios: scenarios.length
      }
    };
  }

  /**
   * Risk Assessment Matrix
   * @param {Array} risks - Array of risk objects with impact and probability
   * @returns {Object} Risk assessment results
   */
  static riskAssessmentMatrix(risks) {
    const assessedRisks = risks.map(risk => {
      const riskScore = risk.impact * risk.probability;
      let riskLevel;

      if (riskScore >= 0.75) riskLevel = 'High';
      else if (riskScore >= 0.35) riskLevel = 'Medium';
      else riskLevel = 'Low';

      return {
        ...risk,
        riskScore: Math.round(riskScore * 100) / 100,
        riskLevel
      };
    });

    const highRisks = assessedRisks.filter(r => r.riskLevel === 'High');
    const mediumRisks = assessedRisks.filter(r => r.riskLevel === 'Medium');
    const lowRisks = assessedRisks.filter(r => r.riskLevel === 'Low');

    const totalRiskScore = assessedRisks.reduce((sum, risk) => sum + risk.riskScore, 0);
    const averageRiskScore = totalRiskScore / assessedRisks.length;

    return {
      type: 'Risk Assessment Matrix',
      risks: assessedRisks.sort((a, b) => b.riskScore - a.riskScore),
      summary: {
        totalRisks: assessedRisks.length,
        highRisks: highRisks.length,
        mediumRisks: mediumRisks.length,
        lowRisks: lowRisks.length,
        averageRiskScore: Math.round(averageRiskScore * 100) / 100,
        totalRiskScore: Math.round(totalRiskScore * 100) / 100
      },
      recommendations: this.generateRiskRecommendations(assessedRisks)
    };
  }

  // Helper methods
  static calculateScenarioNPV(scenario) {
    const { revenue, costs, discountRate = 0.1, periods = 5 } = scenario;
    const netCashFlow = revenue - costs;

    let npv = -costs;
    for (let i = 1; i <= periods; i++) {
      npv += netCashFlow / Math.pow(1 + discountRate, i);
    }

    return npv;
  }

  static generateRandomValue(config) {
    const { distribution, parameters } = config;

    switch (distribution) {
      case 'normal':
        return this.normalRandom(parameters.mean, parameters.stdDev);
      case 'uniform':
        return this.uniformRandom(parameters.min, parameters.max);
      case 'triangular':
        return this.triangularRandom(parameters.min, parameters.mode, parameters.max);
      default:
        return parameters.mean || 0;
    }
  }

  static normalRandom(mean, stdDev) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
  }

  static uniformRandom(min, max) {
    return min + Math.random() * (max - min);
  }

  static triangularRandom(min, mode, max) {
    const u = Math.random();
    const f = (mode - min) / (max - min);

    if (u < f) {
      return min + Math.sqrt(u * (max - min) * (mode - min));
    } else {
      return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
    }
  }

  static evaluateFormula(formula, variables) {
    try {
      let expression = formula;
      Object.keys(variables).forEach(variable => {
        const regex = new RegExp(variable, 'g');
        expression = expression.replace(regex, variables[variable]);
      });

      return math.evaluate(expression);
    } catch (error) {
      console.error('Formula evaluation error:', error);
      return 0;
    }
  }

  static createHistogram(data, bins) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binWidth = (max - min) / bins;

    const histogram = [];
    for (let i = 0; i < bins; i++) {
      const binStart = min + (i * binWidth);
      const binEnd = binStart + binWidth;
      const count = data.filter(value => value >= binStart && (i === bins - 1 ? value <= binEnd : value < binEnd)).length;

      histogram.push({
        bin: i + 1,
        range: `${Math.round(binStart * 100) / 100} - ${Math.round(binEnd * 100) / 100}`,
        count,
        frequency: Math.round((count / data.length) * 10000) / 100
      });
    }

    return histogram;
  }

  static generateRiskRecommendations(risks) {
    const recommendations = [];

    risks.forEach(risk => {
      if (risk.riskLevel === 'High') {
        recommendations.push({
          risk: risk.name,
          action: 'Immediate mitigation required',
          priority: 'High',
          suggestion: 'Develop detailed mitigation plan and monitor closely'
        });
      } else if (risk.riskLevel === 'Medium') {
        recommendations.push({
          risk: risk.name,
          action: 'Mitigation plan needed',
          priority: 'Medium',
          suggestion: 'Create contingency plan and regular monitoring'
        });
      } else {
        recommendations.push({
          risk: risk.name,
          action: 'Monitor',
          priority: 'Low',
          suggestion: 'Regular review and basic monitoring'
        });
      }
    });

    return recommendations;
  }
}

module.exports = RiskManagementService;