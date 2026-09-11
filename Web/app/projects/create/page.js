'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppShell from '../../../components/AppShell';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import ErrorMessage from '../../../components/ErrorMessage';
import { apiService } from '../../../services/api';
import { ArrowLeft, Search, Plus, X } from 'lucide-react';

export default function CreateProjectPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [members, setMembers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchMessage, setSearchMessage] = useState('');

  const searchUsers = async (e) => {
    e?.preventDefault();
    const value = searchName.trim();
    if (!value) {
      setSearchResults([]);
      setSearchMessage('');
      return;
    }

    try {
      setSearching(true);
      setSearchMessage('');
      const data = await apiService.searchUsers(value);
      const users = (data.users || []).filter(
        (user) => !members.some((member) => String(member._id) === String(user._id))
      );
      setSearchResults(users);
      if (users.length === 0) {
        setSearchMessage('No users found for that username.');
      }
    } catch (err) {
      setSearchMessage(err.message || 'Unable to search users.');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const addMember = (user) => {
    setMembers((current) => [...current, user]);
    setSearchResults((current) => current.filter((item) => item._id !== user._id));
  };

  const removeMember = (userId) => {
    setMembers((current) => current.filter((member) => member._id !== userId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }
    if (!description.trim()) {
      setError('Project description is required');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await apiService.createProject({
        name: name.trim(),
        description: description.trim(),
        members: members.map((member) => member._id),
      });
      router.push('/projects');
    } catch (err) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-3 border-b border-[#211c3a] pb-4">
          <Link href="/projects" className="rounded-lg p-2 text-[#656185] hover:bg-[#18152b] hover:text-[#f5f6fa]">
            <ArrowLeft size={18} className="shrink-0" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#f5f6fa]">Create Project</h1>
            <p className="mt-1 text-[13px] text-[#9fa1b8]">
              Add teammates by username. Only these members can be assigned to issues.
            </p>
          </div>
        </div>

        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-[#272242] bg-[#151324] p-6 sm:p-8">
          <Input
            label="Project Name"
            placeholder="e.g. Core Platform Engine"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div>
            <label className="field-label">Description</label>
            <textarea
              rows={5}
              placeholder="Outline project objectives and milestones..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="field-textarea placeholder-[#656185]"
            />
          </div>

          <div className="space-y-3 border-t border-[#211c3a] pt-5">
            <label className="field-label">Add members by username</label>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  icon={Search}
                  placeholder="Search username..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      searchUsers();
                    }
                  }}
                />
              </div>
              <Button type="button" variant="secondary" loading={searching} onClick={searchUsers}>
                Search
              </Button>
            </div>

            {searchMessage && <p className="text-[13px] text-[#9fa1b8]">{searchMessage}</p>}

            {searchResults.length > 0 && (
              <div className="divide-y divide-[#211c3a] overflow-hidden rounded-xl border border-[#272242] bg-[#121020]">
                {searchResults.map((user) => (
                  <div key={user._id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#f5f6fa]">{user.name}</p>
                      <p className="truncate text-xs text-[#656185]">{user.email}</p>
                    </div>
                    <Button type="button" variant="primary" size="sm" icon={Plus} onClick={() => addMember(user)}>
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div>
              <p className="mb-2 text-[13px] font-semibold text-[#9fa1b8]">Selected members</p>
              {members.length === 0 ? (
                <p className="text-[13px] text-[#656185]">No members added yet.</p>
              ) : (
                <div className="space-y-2">
                  {members.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[#272242] bg-[#1b182d] px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#f5f6fa]">{member.name}</p>
                        <p className="truncate text-xs text-[#656185]">{member.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMember(member._id)}
                        className="shrink-0 rounded-lg p-2 text-[#656185] hover:bg-[#18152b] hover:text-red-400"
                      >
                        <X size={16} className="shrink-0" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-[#211c3a] pt-4">
            <Link href="/projects">
              <Button variant="ghost">Cancel</Button>
            </Link>
            <Button type="submit" variant="primary" loading={loading}>
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
