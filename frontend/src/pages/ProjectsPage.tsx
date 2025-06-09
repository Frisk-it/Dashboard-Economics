import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { formatCurrency } from '@/lib/utils'
import apiService from '@/lib/api'
import { toast } from 'sonner'

const ProjectsPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const queryClient = useQueryClient()

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: apiService.getProjects,
  })

  const deleteProjectMutation = useMutation({
    mutationFn: apiService.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete project')
    },
  })

  const handleDeleteProject = (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteProjectMutation.mutate(id)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">
            Manage your software project economic analyses
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Projects Grid */}
      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteProject(project.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Budget:</span>
                      <div className="font-medium">
                        {formatCurrency(project.budget || 0)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Team Size:</span>
                      <div className="font-medium">{project.teamSize || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <div className="font-medium">{project.duration || 'N/A'} months</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <div className={`font-medium capitalize ${
                        project.status === 'active' ? 'text-green-600' :
                        project.status === 'completed' ? 'text-blue-600' :
                        'text-gray-600'
                      }`}>
                        {project.status || 'Planning'}
                      </div>
                    </div>
                  </div>

                  {project.estimatedCost && (
                    <div className="pt-4 border-t">
                      <div className="text-sm text-gray-500 mb-1">Estimated Cost</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(project.estimatedCost)}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4">
                    <span className="text-xs text-gray-500">
                      Created {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No projects yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first project to start with economic analysis
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Project
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Project Modal - Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Create New Project</h2>
            <p className="text-gray-600 mb-4">
              Project creation form will be implemented here.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowCreateModal(false)}>
                Create Project
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectsPage