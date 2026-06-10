type ActivityItem = {
  _id: string;
  action: string;
  description: string;
  candidateId: { name: string } | null;
  performedBy: { name: string } | null;
  createdAt: string;
};

const actionConfig: Record<string, { icon: string; color: string; gradient: string }> = {
  resume_uploaded:       { icon: '📤', color: 'text-blue-400',   gradient: 'from-blue-500/20 to-indigo-500/20' },
  candidate_shortlisted: { icon: '✅', color: 'text-emerald-400', gradient: 'from-emerald-500/20 to-teal-500/20' },
  candidate_rejected:    { icon: '❌', color: 'text-red-400',    gradient: 'from-red-500/20 to-rose-500/20' },
  candidate_reviewed:    { icon: '👁️', color: 'text-amber-400',  gradient: 'from-amber-500/20 to-orange-500/20' },
  job_created:           { icon: '💼', color: 'text-violet-400', gradient: 'from-violet-500/20 to-purple-500/20' },
  ai_analysis_run:       { icon: '🤖', color: 'text-emerald-400', gradient: 'from-emerald-500/20 to-teal-500/20' },
  candidate_deleted:     { icon: '🗑️', color: 'text-slate-400',  gradient: 'from-slate-500/20 to-slate-600/20' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ago`;
  if (hrs > 0) return `${hrs}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'Just now';
}

export default function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600 text-sm">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-5 top-3 bottom-3 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent" />

      <div className="flex flex-col gap-4">
        {activities.map((item) => {
          const config = actionConfig[item.action] || { icon: '📋', color: 'text-slate-400', gradient: 'from-slate-500/20 to-slate-600/20' };
          return (
            <div key={item._id} className="flex items-start gap-3 relative">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center flex-shrink-0 border border-white/5 z-10`}>
                <span className="text-sm">{config.icon}</span>
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className={`text-sm font-medium ${config.color}`}>
                  {item.description || item.action.replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {item.performedBy?.name || 'System'} • {timeAgo(item.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}