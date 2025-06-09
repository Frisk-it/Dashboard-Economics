const math = require('mathjs');

class FinancialAnalysisService {

  /**
   * Calculate Return on Investment (ROI)
   * @param {number} totalInvestment - Total project investment
   * @param {number} totalReturn - Total return from the project
   * @returns {Object} ROI calculation results
   */
  static calculateROI(totalInvestment, totalReturn) {
    if (totalInvestment <= 0) {
      throw new Error('Total investment must be greater than 0');
    }

    const netProfit = totalReturn - totalInvestment;
    const roi = (netProfit / totalInvestment) * 100;

    return {
      metric: 'ROI',
      totalInvestment,
      totalReturn,
      netProfit,
      roi: Math.round(roi * 100) / 100,
      interpretation: roi > 0 ? 'Profitable' : roi < 0 ? 'Loss' : 'Break-even'
    };
  }

  /**
   * Calculate Net Present Value (NPV)
   * @param {number} initialInvestment - Initial investment amount
   * @param {Array} cashFlows - Array of future cash flows
   * @param {number} discountRate - Discount rate (as decimal, e.g., 0.1 for 10%)
   * @returns {Object} NPV calculation results
   */
  static calculateNPV(initialInvestment, cashFlows, discountRate) {
    if (!cashFlows || cashFlows.length === 0) {
      throw new Error('Cash flows array cannot be empty');
    }

    if (discountRate < 0) {
      throw new Error('Discount rate cannot be negative');
    }

    let presentValue = 0;
    const discountedCashFlows = [];

    for (let i = 0; i < cashFlows.length; i++) {
      const period = i + 1;
      const discountedValue = cashFlows[i] / Math.pow(1 + discountRate, period);
      presentValue += discountedValue;

      discountedCashFlows.push({
        period,
        cashFlow: cashFlows[i],
        discountedValue: Math.round(discountedValue * 100) / 100
      });
    }

    const npv = presentValue - initialInvestment;

    return {
      metric: 'NPV',
      initialInvestment,
      discountRate: discountRate * 100, // Convert to percentage
      totalPresentValue: Math.round(presentValue * 100) / 100,
      npv: Math.round(npv * 100) / 100,
      interpretation: npv > 0 ? 'Accept Project' : npv < 0 ? 'Reject Project' : 'Indifferent',
      discountedCashFlows
    };
  }

  /**
   * Calculate Internal Rate of Return (IRR)
   * @param {number} initialInvestment - Initial investment amount
   * @param {Array} cashFlows - Array of future cash flows
   * @returns {Object} IRR calculation results
   */
  static calculateIRR(initialInvestment, cashFlows) {
    if (!cashFlows || cashFlows.length === 0) {
      throw new Error('Cash flows array cannot be empty');
    }

    // Create cash flow array with initial investment as negative
    const allCashFlows = [-initialInvestment, ...cashFlows];

    // Newton-Raphson method to find IRR
    let rate = 0.1; // Start with 10% guess
    let tolerance = 0.0001;
    let maxIterations = 100;

    for (let i = 0; i < maxIterations; i++) {
      let npv = 0;
      let dnpv = 0;

      for (let j = 0; j < allCashFlows.length; j++) {
        npv += allCashFlows[j] / Math.pow(1 + rate, j);
        if (j > 0) {
          dnpv -= j * allCashFlows[j] / Math.pow(1 + rate, j + 1);
        }
      }

      if (Math.abs(npv) < tolerance) {
        break;
      }

      if (Math.abs(dnpv) < tolerance) {
        // Derivative too small, try different starting point
        rate = 0.05;
        continue;
      }

      rate = rate - npv / dnpv;
    }

    // Validate result by checking if it produces NPV close to 0
    let validation = 0;
    for (let j = 0; j < allCashFlows.length; j++) {
      validation += allCashFlows[j] / Math.pow(1 + rate, j);
    }

    const irr = rate * 100; // Convert to percentage

    return {
      metric: 'IRR',
      initialInvestment,
      cashFlows,
      irr: Math.round(irr * 100) / 100,
      validation: Math.round(validation * 100) / 100,
      interpretation: irr > 0 ? 'Positive return' : 'Negative return'
    };
  }

  /**
   * Calculate Payback Period
   * @param {number} initialInvestment - Initial investment amount
   * @param {Array} cashFlows - Array of future cash flows
   * @returns {Object} Payback period calculation results
   */
  static calculatePaybackPeriod(initialInvestment, cashFlows) {
    if (!cashFlows || cashFlows.length === 0) {
      throw new Error('Cash flows array cannot be empty');
    }

    let cumulativeCashFlow = -initialInvestment;
    let paybackPeriod = null;
    const cashFlowAnalysis = [];

    for (let i = 0; i < cashFlows.length; i++) {
      cumulativeCashFlow += cashFlows[i];

      cashFlowAnalysis.push({
        period: i + 1,
        cashFlow: cashFlows[i],
        cumulativeCashFlow: Math.round(cumulativeCashFlow * 100) / 100
      });

      if (cumulativeCashFlow >= 0 && paybackPeriod === null) {
        // Calculate exact payback period with interpolation
        const previousCumulative = cumulativeCashFlow - cashFlows[i];
        const fraction = Math.abs(previousCumulative) / cashFlows[i];
        paybackPeriod = i + fraction;
        break;
      }
    }

    return {
      metric: 'Payback Period',
      initialInvestment,
      paybackPeriod: paybackPeriod ? Math.round(paybackPeriod * 100) / 100 : null,
      paybackInYears: paybackPeriod ? Math.floor(paybackPeriod) : null,
      paybackInMonths: paybackPeriod ? Math.round((paybackPeriod % 1) * 12) : null,
      interpretation: paybackPeriod ? 'Investment recoverable' : 'Investment not recoverable within given period',
      cashFlowAnalysis
    };
  }

  /**
   * Calculate Discounted Payback Period
   * @param {number} initialInvestment - Initial investment amount
   * @param {Array} cashFlows - Array of future cash flows
   * @param {number} discountRate - Discount rate (as decimal)
   * @returns {Object} Discounted payback period calculation results
   */
  static calculateDiscountedPaybackPeriod(initialInvestment, cashFlows, discountRate) {
    if (!cashFlows || cashFlows.length === 0) {
      throw new Error('Cash flows array cannot be empty');
    }

    let cumulativeDiscountedCashFlow = -initialInvestment;
    let paybackPeriod = null;
    const discountedCashFlowAnalysis = [];

    for (let i = 0; i < cashFlows.length; i++) {
      const period = i + 1;
      const discountedCashFlow = cashFlows[i] / Math.pow(1 + discountRate, period);
      cumulativeDiscountedCashFlow += discountedCashFlow;

      discountedCashFlowAnalysis.push({
        period,
        originalCashFlow: cashFlows[i],
        discountedCashFlow: Math.round(discountedCashFlow * 100) / 100,
        cumulativeDiscountedCashFlow: Math.round(cumulativeDiscountedCashFlow * 100) / 100
      });

      if (cumulativeDiscountedCashFlow >= 0 && paybackPeriod === null) {
        const previousCumulative = cumulativeDiscountedCashFlow - discountedCashFlow;
        const fraction = Math.abs(previousCumulative) / discountedCashFlow;
        paybackPeriod = i + fraction;
        break;
      }
    }

    return {
      metric: 'Discounted Payback Period',
      initialInvestment,
      discountRate: discountRate * 100,
      paybackPeriod: paybackPeriod ? Math.round(paybackPeriod * 100) / 100 : null,
      paybackInYears: paybackPeriod ? Math.floor(paybackPeriod) : null,
      paybackInMonths: paybackPeriod ? Math.round((paybackPeriod % 1) * 12) : null,
      interpretation: paybackPeriod ? 'Discounted investment recoverable' : 'Discounted investment not recoverable within given period',
      discountedCashFlowAnalysis
    };
  }

  /**
   * Comprehensive Financial Analysis
   * @param {Object} projectData - Project financial data
   * @returns {Object} Complete financial analysis
   */
  static comprehensiveAnalysis(projectData) {
    const {
      initialInvestment,
      cashFlows,
      discountRate = 0.1,
      projectName = 'Unnamed Project'
    } = projectData;

    if (!initialInvestment || !cashFlows) {
      throw new Error('Initial investment and cash flows are required');
    }

    const totalReturn = cashFlows.reduce((sum, flow) => sum + flow, 0);

    const roi = this.calculateROI(initialInvestment, totalReturn);
    const npv = this.calculateNPV(initialInvestment, cashFlows, discountRate);
    const irr = this.calculateIRR(initialInvestment, cashFlows);
    const payback = this.calculatePaybackPeriod(initialInvestment, cashFlows);
    const discountedPayback = this.calculateDiscountedPaybackPeriod(initialInvestment, cashFlows, discountRate);

    // Overall recommendation
    let recommendation = 'Neutral';
    let score = 0;

    if (npv.npv > 0) score += 2;
    if (roi.roi > 15) score += 2; // Assuming 15% minimum ROI threshold
    if (irr.irr > discountRate * 100) score += 2;
    if (payback.paybackPeriod && payback.paybackPeriod <= 3) score += 1; // 3 years threshold

    if (score >= 6) recommendation = 'Highly Recommended';
    else if (score >= 4) recommendation = 'Recommended';
    else if (score >= 2) recommendation = 'Consider with Caution';
    else recommendation = 'Not Recommended';

    return {
      projectName,
      analysis: {
        roi,
        npv,
        irr,
        payback,
        discountedPayback
      },
      recommendation: {
        overall: recommendation,
        score: score,
        maxScore: 7,
        reasons: [
          npv.npv > 0 ? 'Positive NPV' : 'Negative NPV',
          roi.roi > 15 ? 'High ROI' : 'Low ROI',
          irr.irr > discountRate * 100 ? 'IRR exceeds discount rate' : 'IRR below discount rate',
          payback.paybackPeriod && payback.paybackPeriod <= 3 ? 'Quick payback' : 'Slow payback'
        ]
      },
      summary: {
        initialInvestment,
        totalReturn,
        netProfit: totalReturn - initialInvestment,
        projectDuration: cashFlows.length,
        averageAnnualCashFlow: Math.round((totalReturn / cashFlows.length) * 100) / 100
      }
    };
  }

  /**
   * Sensitivity Analysis for Financial Metrics
   * @param {Object} baseCase - Base case scenario
   * @param {Object} variations - Variations to test
   * @returns {Object} Sensitivity analysis results
   */
  static sensitivityAnalysis(baseCase, variations) {
    const { initialInvestment, cashFlows, discountRate } = baseCase;
    const results = [];

    // Test variations in discount rate
    if (variations.discountRateRange) {
      const { min, max, step } = variations.discountRateRange;
      for (let rate = min; rate <= max; rate += step) {
        const npv = this.calculateNPV(initialInvestment, cashFlows, rate);
        results.push({
          scenario: `Discount Rate ${(rate * 100).toFixed(1)}%`,
          parameter: 'discountRate',
          value: rate,
          npv: npv.npv
        });
      }
    }

    // Test variations in cash flows
    if (variations.cashFlowMultipliers) {
      variations.cashFlowMultipliers.forEach(multiplier => {
        const adjustedCashFlows = cashFlows.map(cf => cf * multiplier);
        const npv = this.calculateNPV(initialInvestment, adjustedCashFlows, discountRate);
        const roi = this.calculateROI(initialInvestment, adjustedCashFlows.reduce((sum, cf) => sum + cf, 0));

        results.push({
          scenario: `Cash Flows ${(multiplier * 100).toFixed(0)}%`,
          parameter: 'cashFlowMultiplier',
          value: multiplier,
          npv: npv.npv,
          roi: roi.roi
        });
      });
    }

    return {
      baseCase: this.calculateNPV(initialInvestment, cashFlows, discountRate),
      sensitivityResults: results,
      analysis: 'Sensitivity analysis shows how changes in key variables affect project NPV'
    };
  }
}

module.exports = FinancialAnalysisService;