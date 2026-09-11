'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AppShell from '../../../../components/AppShell';
import Button from '../../../../components/Button';
import Loading from '../../../../components/Loading';
import ErrorMessage from '../../../../components/ErrorMessage';
import { apiService } from '../../../../services/api';
import { ArrowLeft, Send } from 'lucide-react';

export default function CommentsPage() {
  const { id } = useParams();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadComments() {
      try {
        setLoading(true);
        const data = await apiService.getComments(id);
        setComments(Array.isArray(data) ? data : data?.comments || []);
      } catch (err) {
        setError(err.message || 'Failed to load comments');
      } finally {
        setLoading(false);
      }
    }
    loadComments();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      setSubmitting(true);
      const newComment = await apiService.addComment(id, { text });
      setComments((prev) => [...prev, newComment]);
      setText('');
    } catch (err) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#23252a]">
          <Link href={`/issues/${id}`} className="text-[#616672] hover:text-[#e6e8ec] p-1 rounded hover:bg-[#18191d]">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-base font-semibold text-[#e6e8ec]">Discussion</h1>
            <p className="text-xs text-[#9094a0]">{comments.length} comments posted</p>
          </div>
        </div>

        <ErrorMessage message={error} />

        {loading ? (
          <Loading />
        ) : (
          <div className="space-y-3">
            {comments.map((c, i) => (
              <div key={c._id || i} className="p-3 bg-[#121316] border border-[#23252a] rounded-lg space-y-1">
                <div className="flex items-center justify-between text-[11px] text-[#616672]">
                  <span className="font-medium text-[#e6e8ec]">{c.user?.name || c.author || 'User'}</span>
                  <span>{new Date(c.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-xs text-[#9094a0] leading-relaxed">{c.text || c.content}</p>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="pt-2">
          <div className="bg-[#121316] border border-[#23252a] rounded-lg p-2 flex flex-col gap-2">
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Leave a comment..."
              className="w-full bg-transparent text-xs text-[#e6e8ec] placeholder-[#616672] p-1 focus:outline-none resize-none"
            />
            <div className="flex justify-end">
              <Button type="submit" variant="primary" size="sm" icon={Send} loading={submitting}>
                Comment
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  );
}