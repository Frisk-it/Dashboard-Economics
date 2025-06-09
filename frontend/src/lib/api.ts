import axios, { AxiosInstance} from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

class ApiService {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // Authentication methods
  async register(userData: {
    email: string
    password: string
    firstName: string
    lastName: string
  }) {
    const response = await this.client.post('/api/auth/register', userData)
    return response.data
  }

  async login(credentials: { email: string; password: string }) {
    const response = await this.client.post('/api/auth/login', credentials)
    return response.data
  }

  async getProfile() {
    const response = await this.client.get('/api/auth/profile')
    return response.data
  }

  async updateProfile(profileData: { firstName?: string; lastName?: string }) {
    const response = await this.client.put('/api/auth/profile', profileData)
    return response.data
  }

  // Project methods
  async getProjects() {
    const response = await this.client.get('/api/projects')
    return response.data
  }

  async getProject(id: string) {
    const response = await this.client.get(`/api/projects/${id}`)
    return response.data
  }

  async createProject(projectData: any) {
    const response = await this.client.post('/api/projects', projectData)
    return response.data
  }

  async updateProject(id: string, projectData: any) {
    const response = await this.client.put(`/api/projects/${id}`, projectData)
    return response.data
  }

  async deleteProject(id: string) {
    const response = await this.client.delete(`/api/projects/${id}`)
    return response.data
  }

  async getProjectStatistics(id: string) {
    const response = await this.client.get(`/api/projects/${id}/statistics`)
    return response.data
  }

  async getDashboardOverview() {
    const response = await this.client.get('/api/projects/dashboard/overview')
    return response.data
  }

  // Cost Estimation methods
  async cocomoEstimation(data: {
    kloc: number
    projectType: 'organic' | 'semidetached' | 'embedded'
    teamSize?: number
  }) {
    const response = await this.client.post('/api/calculations/cost-estimation/cocomo', data)
    return response.data
  }

  async functionPointsEstimation(data: {
    externalInputs: number
    externalOutputs: number
    externalInquiries: number
    internalLogicalFiles: number
    externalInterfaceFiles: number
    complexity: 'simple' | 'average' | 'complex'
  }) {
    const response = await this.client.post('/api/calculations/cost-estimation/function-points', data)
    return response.data
  }

  async expertJudgmentEstimation(data: { estimates: number[] }) {
    const response = await this.client.post('/api/calculations/cost-estimation/expert-judgment', data)
    return response.data
  }

  async regressionAnalysisEstimation(data: {
    historicalData: Array<{ size: number; effort: number }>
    projectSize: number
  }) {
    const response = await this.client.post('/api/calculations/cost-estimation/regression', data)
    return response.data
  }

  async compareEstimations(data: { estimations: any[] }) {
    const response = await this.client.post('/api/calculations/cost-estimation/compare', data)
    return response.data
  }

  // Financial Analysis methods
  async calculateROI(data: { totalInvestment: number; totalReturn: number }) {
    const response = await this.client.post('/api/calculations/financial-analysis/roi', data)
    return response.data
  }

  async calculateNPV(data: {
    initialInvestment: number
    cashFlows: number[]
    discountRate: number
  }) {
    const response = await this.client.post('/api/calculations/financial-analysis/npv', data)
    return response.data
  }

  async calculateIRR(data: { initialInvestment: number; cashFlows: number[] }) {
    const response = await this.client.post('/api/calculations/financial-analysis/irr', data)
    return response.data
  }

  async calculatePayback(data: { initialInvestment: number; cashFlows: number[] }) {
    const response = await this.client.post('/api/calculations/financial-analysis/payback', data)
    return response.data
  }

  async comprehensiveFinancialAnalysis(data: {
    initialInvestment: number
    cashFlows: number[]
    discountRate?: number
    projectName?: string
  }) {
    const response = await this.client.post('/api/calculations/financial-analysis/comprehensive', data)
    return response.data
  }

  // Risk Management methods
  async sensitivityAnalysis(data: {
    baseScenario: any
    variableRanges: any
  }) {
    const response = await this.client.post('/api/calculations/risk-analysis/sensitivity', data)
    return response.data
  }

  async decisionTreeAnalysis(data: { treeStructure: any }) {
    const response = await this.client.post('/api/calculations/risk-analysis/decision-tree', data)
    return response.data
  }

  async monteCarloSimulation(data: {
    variables: any
    iterations?: number
    formula?: string
    confidenceLevel?: number
  }) {
    const response = await this.client.post('/api/calculations/risk-analysis/monte-carlo', data)
    return response.data
  }

  async riskAssessmentMatrix(data: {
    risks: Array<{ name: string; impact: number; probability: number }>
  }) {
    const response = await this.client.post('/api/calculations/risk-analysis/assessment-matrix', data)
    return response.data
  }
}

export const apiService = new ApiService()
export default apiService