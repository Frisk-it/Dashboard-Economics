-- Database setup for Economics Dashboard
-- This migration creates the core tables and sets up security

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_type VARCHAR(50) DEFAULT 'organic' CHECK (project_type IN ('organic', 'semidetached', 'embedded')),
    status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),

    -- Budget and timeline
    estimated_budget DECIMAL(15,2),
    actual_budget DECIMAL(15,2),
    estimated_duration INTEGER, -- in months
    actual_duration INTEGER, -- in months

    -- Technical parameters
    team_size INTEGER,
    kloc DECIMAL(10,2), -- Kilo Lines of Code
    function_points JSONB, -- Store function point breakdown

    -- Risk and assumptions
    risk_factors JSONB, -- Array of risk objects
    assumptions JSONB, -- Array of assumption strings

    -- Financial analysis results
    financial_analysis JSONB, -- Store ROI, NPV, IRR, etc. results
    cost_estimations JSONB, -- Store COCOMO, Function Points results
    risk_analysis JSONB, -- Store Monte Carlo, sensitivity analysis results

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analysis_results table for storing calculation results
CREATE TABLE IF NOT EXISTS analysis_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    analysis_type VARCHAR(50) NOT NULL, -- 'cost_estimation', 'financial_analysis', 'risk_analysis'
    method VARCHAR(50) NOT NULL, -- 'cocomo', 'function_points', 'monte_carlo', etc.
    input_parameters JSONB NOT NULL,
    results JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_analysis_results_user_id ON analysis_results(user_id);
CREATE INDEX idx_analysis_results_project_id ON analysis_results(project_id);
CREATE INDEX idx_analysis_results_type ON analysis_results(analysis_type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for common queries
CREATE VIEW project_statistics AS
SELECT
    p.*,
    CASE
        WHEN p.actual_budget IS NOT NULL AND p.estimated_budget IS NOT NULL AND p.estimated_budget > 0
        THEN ((p.actual_budget - p.estimated_budget) / p.estimated_budget) * 100
        ELSE NULL
    END as budget_variance_percent,
    CASE
        WHEN p.actual_duration IS NOT NULL AND p.estimated_duration IS NOT NULL AND p.estimated_duration > 0
        THEN ((p.actual_duration - p.estimated_duration) / p.estimated_duration) * 100
        ELSE NULL
    END as duration_variance_percent,
    CASE
        WHEN p.kloc IS NOT NULL AND p.actual_duration IS NOT NULL AND p.actual_duration > 0
        THEN p.kloc / p.actual_duration
        ELSE NULL
    END as productivity_kloc_per_month,
    CASE
        WHEN p.kloc IS NOT NULL AND p.actual_budget IS NOT NULL AND p.kloc > 0
        THEN p.actual_budget / p.kloc
        ELSE NULL
    END as cost_per_kloc
FROM projects p;