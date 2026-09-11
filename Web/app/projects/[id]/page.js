'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AppShell from '../../../components/AppShell';
import IssueCard from '../../../components/IssueCard';
import Button from '../../../components/Button';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';
import { apiService } from '../../../services/api';
import { getProjectMembers } from '../../../utils/projectMembers';
import { ArrowLeft, Plus } from 'lucide-react';

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [projectData, issuesData] = await Promise.all([
          apiService.getProjectById(id),
          apiService.getIssuesByProject(id),
        ]);
        setProject(projectData?.project || projectData);
        setIssues(Array.isArray(issuesData) ? issuesData : issuesData?.issues || []);
      } catch (err) {
        setError(err.message || 'Failed to load project details');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) return <AppShell><Loading /></AppShell>;

  const members = getProjectMembers(project);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#211c3a] pb-4">
          <div className="flex items-center gap-3">
            <Link href="/projects" className="rounded-lg p-2 text-[#656185] hover:bg-[#18152b] hover:text-[#f5f6fa]">
              <ArrowLeft size={18} className="shrink-0" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#f5f6fa]">{project?.name || 'Project'}</h1>
              <p className="mt-1 text-[13px] text-[#9fa1b8]">{project?.description || 'No description'}</p>
            </div>
          </div>
          <Link href={`/issues/create?projectId=${id}`}>
            <Button variant="primary" size="sm" icon={Plus}>
              Add Issue
            </Button>
          </Link>
        </div>

        <ErrorMessage message={error} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            <h2 className="text-sm font-semibold tracking-wider text-[#656185] uppercase">
              Project Issues ({issues.length})
            </h2>
            {issues.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#272242] bg-[#151324] py-16 text-center text-sm text-[#656185]">
                No issues tracked in this project yet.
              </div>
            ) : (
              <div className="divide-y divide-[#1e1a33] overflow-hidden rounded-2xl border border-[#272242] bg-[#151324]">
                {issues.map((issue) => (
                  <IssueCard key={issue._id || issue.id} issue={issue} />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#272242] bg-[#151324] p-5">
            <h3 className="mb-3 text-xs font-bold tracking-wider text-[#656185] uppercase">Members</h3>
            {members.length === 0 ? (
              <p className="text-[13px] text-[#9fa1b8]">No members were added when this project was created.</p>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <div key={member._id} className="rounded-xl border border-[#272242] bg-[#1b182d] px-3 py-2.5">
                    <p className="text-sm font-semibold text-[#f5f6fa]">{member.name}</p>
                    <p className="text-xs text-[#656185]">{member.email}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
