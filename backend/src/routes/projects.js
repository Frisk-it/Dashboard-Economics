const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all projects for the authenticated user
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    next(error);
  }
});

// Get a specific project by ID
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
});

// Create a new project
router.post('/', authenticateToken, [
  body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Project name is required and must be less than 255 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('projectType').optional().isIn(['organic', 'semidetached', 'embedded']).withMessage('Invalid project type'),
  body('status').optional().isIn(['planning', 'active', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('estimatedBudget').optional().isFloat({ min: 0 }).withMessage('Estimated budget must be a positive number'),
  body('actualBudget').optional().isFloat({ min: 0 }).withMessage('Actual budget must be a positive number'),
  body('estimatedDuration').optional().isInt({ min: 1 }).withMessage('Estimated duration must be a positive integer'),
  body('actualDuration').optional().isInt({ min: 1 }).withMessage('Actual duration must be a positive integer'),
  body('teamSize').optional().isInt({ min: 1 }).withMessage('Team size must be a positive integer'),
  body('kloc').optional().isFloat({ min: 0 }).withMessage('KLOC must be a positive number'),
  body('functionPoints').optional().isObject().withMessage('Function points must be an object'),
  body('riskFactors').optional().isArray().withMessage('Risk factors must be an array'),
  body('assumptions').optional().isArray().withMessage('Assumptions must be an array')
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

    const projectData = {
      ...req.body,
      user_id: req.user.id,
      created_at: new Date().toISOString(),
      status: req.body.status || 'planning'
    };

    const { data: project, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    next(error);
  }
});

// Update a project
router.put('/:id', authenticateToken, [
  body('name').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Project name must be less than 255 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('projectType').optional().isIn(['organic', 'semidetached', 'embedded']).withMessage('Invalid project type'),
  body('status').optional().isIn(['planning', 'active', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('estimatedBudget').optional().isFloat({ min: 0 }).withMessage('Estimated budget must be a positive number'),
  body('actualBudget').optional().isFloat({ min: 0 }).withMessage('Actual budget must be a positive number'),
  body('estimatedDuration').optional().isInt({ min: 1 }).withMessage('Estimated duration must be a positive integer'),
  body('actualDuration').optional().isInt({ min: 1 }).withMessage('Actual duration must be a positive integer'),
  body('teamSize').optional().isInt({ min: 1 }).withMessage('Team size must be a positive integer'),
  body('kloc').optional().isFloat({ min: 0 }).withMessage('KLOC must be a positive number'),
  body('functionPoints').optional().isObject().withMessage('Function points must be an object'),
  body('riskFactors').optional().isArray().withMessage('Risk factors must be an array'),
  body('assumptions').optional().isArray().withMessage('Assumptions must be an array')
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

    const { id } = req.params;

    // Check if project exists and belongs to user
    const { data: existingProject, error: selectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (selectError) {
      if (selectError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }
      throw selectError;
    }

    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key =>
      updateData[key] === undefined && delete updateData[key]
    );

    const { data: project, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    next(error);
  }
});

// Delete a project
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if project exists and belongs to user
    const { data: existingProject, error: selectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (selectError) {
      if (selectError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }
      throw selectError;
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get project statistics
router.get('/:id/statistics', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }
      throw error;
    }

    // Calculate project statistics
    const statistics = {
      budgetVariance: project.actualBudget && project.estimatedBudget
        ? ((project.actualBudget - project.estimatedBudget) / project.estimatedBudget) * 100
        : null,
      durationVariance: project.actualDuration && project.estimatedDuration
        ? ((project.actualDuration - project.estimatedDuration) / project.estimatedDuration) * 100
        : null,
      completionPercentage: project.status === 'completed' ? 100 :
        project.status === 'active' ? 50 :
        project.status === 'planning' ? 10 : 0,
      productivity: project.kloc && project.actualDuration
        ? project.kloc / project.actualDuration
        : null,
      costPerKLOC: project.kloc && project.actualBudget
        ? project.actualBudget / project.kloc
        : null,
      teamProductivity: project.teamSize && project.kloc && project.actualDuration
        ? project.kloc / (project.teamSize * project.actualDuration)
        : null
    };

    res.json({
      success: true,
      data: {
        project,
        statistics
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get all projects statistics for dashboard
router.get('/dashboard/overview', authenticateToken, async (req, res, next) => {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', req.user.id);

    if (error) {
      throw error;
    }

    const overview = {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      plannedProjects: projects.filter(p => p.status === 'planning').length,
      cancelledProjects: projects.filter(p => p.status === 'cancelled').length,
      totalEstimatedBudget: projects.reduce((sum, p) => sum + (p.estimatedBudget || 0), 0),
      totalActualBudget: projects.reduce((sum, p) => sum + (p.actualBudget || 0), 0),
      averageTeamSize: projects.length > 0
        ? projects.reduce((sum, p) => sum + (p.teamSize || 0), 0) / projects.length
        : 0,
      averageKLOC: projects.length > 0
        ? projects.reduce((sum, p) => sum + (p.kloc || 0), 0) / projects.length
        : 0
    };

    // Calculate budget variance
    if (overview.totalEstimatedBudget > 0) {
      overview.budgetVariance = ((overview.totalActualBudget - overview.totalEstimatedBudget) / overview.totalEstimatedBudget) * 100;
    }

    // Recent activity
    const recentProjects = projects
      .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        overview,
        recentProjects
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;