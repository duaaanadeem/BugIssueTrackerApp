'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppShell from '../../../components/AppShell';
import StatusBadge from '../../../components/StatusBadge';
import PriorityBadge from '../../../components/PriorityBadge';
import Button from '../../../components/Button';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';
import { apiService } from '../../../services/api';
import { getProjectMembers, getUserId } from '../../../utils/projectMembers';
import { ArrowLeft, MessageSquare, History, Trash2 } from 'lucide-react';

export default function IssueDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Open');
  const [priority, setPriority] = useState('Medium');
  const [saving, setSaving] = useState(false);
  const [assignedTo, setAssignedTo] = useState('');

  const assignees = getProjectMembers(issue?.projectId || issue?.project);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await apiService.getIssueById(id);
        const issueData = data?.issue || data;
        setIssue(issueData);
        setStatus(issueData.status || 'Open');
        setPriority(issueData.priority || 'Medium');
        setAssignedTo(getUserId(issueData.assignedTo) || '');
      } catch (err) {
        setError(err.message || 'Failed to fetch issue details');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleUpdate = async () => {
    try {
      setSaving(true);
      await apiService.updateIssue(id, { status, priority, assignedTo: assignedTo || null });
      setIssue((prev) => ({
        ...prev,
        status,
        priority,
        assignedTo: assignees.find((user) => String(user._id) === String(assignedTo)) || null,
      }));
    } catch (err) {
      setError(err.message || 'Failed to update issue');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this issue?')) return;
    try {
      await apiService.deleteIssue(id);
      router.push('/issues');
    } catch (err) {
      setError(err.message || 'Failed to delete issue');
    }
  };

  if (loading) return <AppShell><Loading /></AppShell>;
  if (!issue) return <AppShell><ErrorMessage message={error || 'Issue not found'} /></AppShell>;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#211c3a] pb-4">
          <div className="flex items-center gap-3">
            <Link href="/issues" className="rounded-lg p-2 text-[#656185] hover:bg-[#18152b] hover:text-[#f5f6fa]">
              <ArrowLeft size={18} className="shrink-0" />
            </Link>
            <span className="font-mono text-sm text-[#9fa1b8]">
              {issue.identifier || `ISS-${id?.slice(-4).toUpperCase()}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/issues/${id}/comments`}>
              <Button variant="secondary" size="sm" icon={MessageSquare}>Comments</Button>
            </Link>
            <Link href={`/issues/${id}/history`}>
              <Button variant="secondary" size="sm" icon={History}>History</Button>
            </Link>
            <Button variant="danger" size="sm" icon={Trash2} onClick={handleDelete}>Delete</Button>
          </div>
        </div>

        <ErrorMessage message={error} />

        {/* Two-Column Grid Workspace */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#f5f6fa]">{issue.title}</h1>
            <div className="rounded-2xl border border-[#272242] bg-[#151324] p-6">
              <h4 className="mb-3 text-xs font-semibold tracking-wider text-[#656185] uppercase">Description</h4>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-[#9fa1b8]">
                {issue.description || 'No description provided.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-4 rounded-2xl border border-[#272242] bg-[#151324] p-5">
              <h4 className="text-xs font-semibold tracking-wider text-[#656185] uppercase">Properties</h4>

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
              </div>

              <div className="space-y-2 border-t border-[#211c3a] pt-3 text-sm">
                <div className="flex justify-between text-[#656185]">
                  <span>Project</span>
                  <span className="font-medium text-[#9fa1b8]">
                    {issue.projectId?.name || issue.project?.name || 'General'}
                  </span>
                </div>
                <div className="flex justify-between text-[#656185]">
                  <span>Created</span>
                  <span className="font-medium text-[#9fa1b8]">{new Date(issue.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>

              <Button
                variant="primary"
                loading={saving}
                onClick={handleUpdate}
                className="mt-2 w-full"
              >
                Save Properties
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}