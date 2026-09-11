'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AppShell from '../../../../components/AppShell';
import Loading from '../../../../components/Loading';
import ErrorMessage from '../../../../components/ErrorMessage';
import { apiService } from '../../../../services/api';
import { ArrowLeft, Clock } from 'lucide-react';

export default function HistoryPage() {
  const { id } = useParams();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        const data = await apiService.getIssueHistory(id);
        setHistory(Array.isArray(data) ? data : data?.history || []);
      } catch (err) {
        setError(err.message || 'Failed to load audit history');
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [id]);

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#23252a]">
          <Link href={`/issues/${id}`} className="text-[#616672] hover:text-[#e6e8ec] p-1 rounded hover:bg-[#18191d]">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-base font-semibold text-[#e6e8ec]">Activity History</h1>
            <p className="text-xs text-[#9094a0]">Audit trail and property transitions</p>
          </div>
        </div>

        <ErrorMessage message={error} />

        {loading ? (
          <Loading />
        ) : history.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[#23252a] rounded-lg text-[#616672] text-xs">
            No history recorded for this issue.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#23252a]">
            {history.map((event, index) => (
              <div key={event._id || index} className="relative flex items-start gap-3">
                <span className="absolute -left-6 top-1 w-2 h-2 rounded-full bg-indigo-500 ring-4 ring-[#0d0e11]" />
                <div className="flex-1 text-xs text-[#9094a0]">
                  <span className="font-medium text-[#e6e8ec]">{event.user?.name || 'User'} </span>
                  {event.action || 'updated the issue'}{' '}
                  {event.from && event.to && (
                    <span className="text-[#616672]">
                      ({event.from} &rarr; {event.to})
                    </span>
                  )}
                  <div className="text-[11px] text-[#616672] mt-0.5 flex items-center gap-1">
                    <Clock size={11} />
                    {new Date(event.createdAt || Date.now()).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}