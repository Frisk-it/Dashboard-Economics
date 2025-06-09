const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const CostEstimationService = require('../services/costEstimation');
const FinancialAnalysisService = require('../services/financialAnalysis');
const RiskManagementService = require('../services/riskManagement');

const router = express.Router();

// Cost Estimation Routes

// COCOMO Estimation
router.post('/cost-estimation/cocomo', authenticateToken, [
  body('kloc').isFloat({ min: 0.1 }).withMessage('KLOC must be a positive number'),
  body('projectType').isIn(['organic', 'semidetached', 'embedded']).withMessage('Invalid project type'),
  body('teamSize').optional().isInt({ min: 1 }).withMessage('Team size must be a positive integer')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { kloc, projectType, teamSize } = req.body;
    const result = CostEstimationService.cocomoEstimation(kloc, projectType, teamSize);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Function Points Estimation
router.post('/cost-estimation/function-points', authenticateToken, [
  body('externalInputs').isInt({ min: 0 }).withMessage('External inputs must be a non-negative integer'),
  body('externalOutputs').isInt({ min: 0 }).withMessage('External outputs must be a non-negative integer'),
  body('externalInquiries').isInt({ min: 0 }).withMessage('External inquiries must be a non-negative integer'),
  body('internalLogicalFiles').isInt({ min: 0 }).withMessage('Internal logical files must be a non-negative integer'),
  body('externalInterfaceFiles').isInt({ min: 0 }).withMessage('External interface files must be a non-negative integer'),
  body('complexity').isIn(['simple', 'average', 'complex']).withMessage('Invalid complexity level')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const functionCounts = req.body;
    const result = CostEstimationService.functionPointsEstimation(functionCounts);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Expert Judgment Estimation
router.post('/cost-estimation/expert-judgment', authenticateToken, [
  body('estimates').isArray({ min: 1 }).withMessage('Estimates array is required'),
  body('estimates.*').isFloat({ min: 0 }).withMessage('All estimates must be positive numbers')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { estimates } = req.body;
    const result = CostEstimationService.expertJudgmentEstimation(estimates);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Regression Analysis Estimation
router.post('/cost-estimation/regression', authenticateToken, [
  body('historicalData').isArray({ min: 2 }).withMessage('At least 2 historical data points are required'),
  body('historicalData.*.size').isFloat({ min: 0 }).withMessage('Size must be a positive number'),
  body('historicalData.*.effort').isFloat({ min: 0 }).withMessage('Effort must be a positive number'),
  body('projectSize').isFloat({ min: 0 }).withMessage('Project size must be a positive number')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { historicalData, projectSize } = req.body;
    const result = CostEstimationService.regressionAnalysisEstimation(historicalData, projectSize);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Compare Estimations
router.post('/cost-estimation/compare', authenticateToken, [
  body('estimations').isArray({ min: 1 }).withMessage('Estimations array is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { estimations } = req.body;
    const result = CostEstimationService.compareEstimations(estimations);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Financial Analysis Routes

// ROI Calculation
router.post('/financial-analysis/roi', authenticateToken, [
  body('totalInvestment').isFloat({ min: 0.01 }).withMessage('Total investment must be greater than 0'),
  body('totalReturn').isFloat({ min: 0 }).withMessage('Total return must be a non-negative number')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { totalInvestment, totalReturn } = req.body;
    const result = FinancialAnalysisService.calculateROI(totalInvestment, totalReturn);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// NPV Calculation
router.post('/financial-analysis/npv', authenticateToken, [
  body('initialInvestment').isFloat({ min: 0 }).withMessage('Initial investment must be a non-negative number'),
  body('cashFlows').isArray({ min: 1 }).withMessage('Cash flows array is required'),
  body('cashFlows.*').isFloat().withMessage('All cash flows must be numbers'),
  body('discountRate').isFloat({ min: 0, max: 1 }).withMessage('Discount rate must be between 0 and 1')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { initialInvestment, cashFlows, discountRate } = req.body;
    const result = FinancialAnalysisService.calculateNPV(initialInvestment, cashFlows, discountRate);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// IRR Calculation
router.post('/financial-analysis/irr', authenticateToken, [
  body('initialInvestment').isFloat({ min: 0 }).withMessage('Initial investment must be a non-negative number'),
  body('cashFlows').isArray({ min: 1 }).withMessage('Cash flows array is required'),
  body('cashFlows.*').isFloat().withMessage('All cash flows must be numbers')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { initialInvestment, cashFlows } = req.body;
    const result = FinancialAnalysisService.calculateIRR(initialInvestment, cashFlows);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Payback Period Calculation
router.post('/financial-analysis/payback', authenticateToken, [
  body('initialInvestment').isFloat({ min: 0 }).withMessage('Initial investment must be a non-negative number'),
  body('cashFlows').isArray({ min: 1 }).withMessage('Cash flows array is required'),
  body('cashFlows.*').isFloat().withMessage('All cash flows must be numbers')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { initialInvestment, cashFlows } = req.body;
    const result = FinancialAnalysisService.calculatePaybackPeriod(initialInvestment, cashFlows);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Comprehensive Financial Analysis
router.post('/financial-analysis/comprehensive', authenticateToken, [
  body('initialInvestment').isFloat({ min: 0 }).withMessage('Initial investment must be a non-negative number'),
  body('cashFlows').isArray({ min: 1 }).withMessage('Cash flows array is required'),
  body('cashFlows.*').isFloat().withMessage('All cash flows must be numbers'),
  body('discountRate').optional().isFloat({ min: 0, max: 1 }).withMessage('Discount rate must be between 0 and 1'),
  body('projectName').optional().isString().withMessage('Project name must be a string')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const projectData = req.body;
    const result = FinancialAnalysisService.comprehensiveAnalysis(projectData);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Risk Management Routes

// Sensitivity Analysis
router.post('/risk-analysis/sensitivity', authenticateToken, [
  body('baseScenario').isObject().withMessage('Base scenario is required'),
  body('variableRanges').isObject().withMessage('Variable ranges are required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { baseScenario, variableRanges } = req.body;
    const result = RiskManagementService.sensitivityAnalysis(baseScenario, variableRanges);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Decision Tree Analysis
router.post('/risk-analysis/decision-tree', authenticateToken, [
  body('treeStructure').isObject().withMessage('Tree structure is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { treeStructure } = req.body;
    const result = RiskManagementService.decisionTreeAnalysis(treeStructure);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Monte Carlo Simulation
router.post('/risk-analysis/monte-carlo', authenticateToken, [
  body('variables').isObject().withMessage('Variables configuration is required'),
  body('iterations').optional().isInt({ min: 100, max: 100000 }).withMessage('Iterations must be between 100 and 100,000'),
  body('formula').optional().isString().withMessage('Formula must be a string'),
  body('confidenceLevel').optional().isFloat({ min: 0.5, max: 0.99 }).withMessage('Confidence level must be between 0.5 and 0.99')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const simulationParams = req.body;
    const result = RiskManagementService.monteCarloSimulation(simulationParams);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Risk Assessment Matrix
router.post('/risk-analysis/assessment-matrix', authenticateToken, [
  body('risks').isArray({ min: 1 }).withMessage('Risks array is required'),
  body('risks.*.name').isString().withMessage('Risk name is required'),
  body('risks.*.impact').isFloat({ min: 0, max: 1 }).withMessage('Impact must be between 0 and 1'),
  body('risks.*.probability').isFloat({ min: 0, max: 1 }).withMessage('Probability must be between 0 and 1')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { risks } = req.body;
    const result = RiskManagementService.riskAssessmentMatrix(risks);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;