import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, Plus, Trash2, Clock } from 'lucide-react';
import { getProjects, deleteProject, createProject } from '../lib/api';
import type { Project } from '../lib/api';

export function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    try {
      const project = await createProject('New Project');
      navigate('/wizard', { state: { projectId: project._id } });
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteProject(id);
      await loadProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-phantom-900 tracking-tight">
            My Projects
          </h1>
          <button
            onClick={handleCreateProject}
            className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white text-sm font-medium rounded-lg hover:bg-violet-600 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-phantom-100 flex items-center justify-center">
              <Folder className="w-8 h-8 text-phantom-400" />
            </div>
            <h3 className="text-lg font-medium text-phantom-900 mb-2">No projects yet</h3>
            <p className="text-phantom-500 mb-6">Create your first project to get started</p>
            <button
              onClick={handleCreateProject}
              className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500 text-white text-sm font-medium rounded-lg hover:bg-violet-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <div
                key={project._id}
                onClick={() => navigate('/wizard', { state: { projectId: project._id } })}
                className="group p-5 rounded-xl border border-phantom-200 bg-white hover:border-violet-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                    <Folder className="w-5 h-5 text-white" />
                  </div>
                  <button
                    onClick={(e) => handleDeleteProject(project._id, e)}
                    className="p-1.5 text-phantom-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-medium text-phantom-900 mb-1 truncate">{project.name}</h3>
                <div className="flex items-center gap-2 text-xs text-phantom-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDate(project.updatedAt)}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    project.status === 'draft' ? 'bg-amber-100 text-amber-700' :
                    project.status === 'complete' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-phantom-100 text-phantom-600'
                  }`}>
                    {project.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
