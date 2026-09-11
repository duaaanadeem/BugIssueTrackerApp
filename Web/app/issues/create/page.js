'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppShell from '../../../components/AppShell';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import ErrorMessage from '../../../components/ErrorMessage';
import { apiService } from '../../../services/api';
import { getProjectMembers } from '../../../utils/projectMembers';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import Loading from '../../../components/Loading';

export default function CreateIssuePage() {
  return (
    <Suspense fallback={<AppShell><Loading /></AppShell>}>
      <CreateIssuePageContent />
    </Suspense>
  );
}

function CreateIssuePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [project, setProject] = useState(searchParams.get('projectId') || '');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Open');
  const [assignedTo, setAssignedTo] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await apiService.getProjects();
        const list = Array.isArray(data) ? data : data?.projects || [];
        setProjects(list);
        setProject((current) => current || list[0]?._id || list[0]?.id || '');
      } catch (e) {
        console.error(e);
      }
    }
    fetchProjects();
  }, []);

  const selectedProject = projects.find((item) => String(item._id || item.id) === String(project));
  const assignees = getProjectMembers(selectedProject);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      setError('Description must be at least 5 characters');
      return;
    }
    if (!project) {
      setError('Select a project');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await apiService.createIssue({
        title: title.trim(),
        description: description.trim(),
        projectId: project,
        priority,
        status,
        assignedTo: assignedTo || null,
      });
      router.push('/issues');
    } catch (err) {
      setError(err.message || 'Failed to create issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-3 border-b border-[#211c3a] pb-4">
          <Link href="/issues" className="rounded-lg p-2 text-[#656185] hover:bg-[#18152b] hover:text-[#f5f6fa]">
            <ArrowLeft size={18} className="shrink-0" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#f5f6fa]">Create Issue</h1>
            <p className="mt-1 text-[13px] text-[#9fa1b8]">File a new task and assign it to a project member</p>
          </div>
        </div>

        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-[#272242] bg-[#151324] p-6 sm:p-8">
          <Input
            label="Issue Title"
            placeholder="e.g. Broken authentication redirect"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div>
            <label className="field-label">Description</label>
            <textarea
              rows={6}
              placeholder="Provide steps to reproduce, console logs, or relevant details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="field-textarea placeholder-[#656185]"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">Project</label>
              <select
                value={project}
                onChange={(e) => {
                  setProject(e.target.value);
                  setAssignedTo('');
                }}
                className="field-select"
              >
                {projects.length === 0 && <option value="">No projects yet</option>}
                {projects.map((p) => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="field-label">Assigned to</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="field-select"
              >
                <option value="">Unassigned</option>
                {assignees.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
              {selectedProject && assignees.length === 0 && (
                <p className="mt-1 text-xs text-[#656185]">
                  No members were added to this project. Add members when creating a project to assign work.
                </p>
              )}
            </div>

            <div>
              <label className="field-label">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="field-select"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="field-label">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="field-select"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-[#211c3a] pt-4">
            <Link href="/issues">
              <Button variant="ghost">Cancel</Button>
            </Link>
            <Button type="submit" variant="primary" loading={loading}>
              Create Issue
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
