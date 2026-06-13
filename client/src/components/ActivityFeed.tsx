import { 
  UploadCloud, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Briefcase, 
  Sparkles,
  Trash2,
  ClipboardList
} from 'lucide-react';

type ActivityItem = {
  _id: string;
  action: string;
  description: string;
  candidateId: { name: string } | null;
  performedBy: { name: string } | null;
  createdAt: string;
};

const actionConfig: Record<string, { icon: React.ReactNode; color: string; gradient: string }> = {
  resume_uploaded:       { icon: <UploadCloud size={16} />, color: 'text-blue-600 dark:text-blue-400',   gradient: 'from-blue-500/20 to-cyan-500/20' },
  candidate_shortlisted: { icon: <CheckCircle2 size={16} />, color: 'text-emerald-600 dark:text-emerald-400', gradient: 'from-emerald-500/20 to-teal-500/20' },
  candidate_rejected:    { icon: <XCircle size={16} />, color: 'text-red-600 dark:text-red-400',    gradient: 'from-red-500/20 to-rose-500/20' },
  candidate_reviewed:    { icon: <Eye size={16} />, color: 'text-amber-600 dark:text-amber-400',  gradient: 'from-amber-500/20 to-orange-500/20' },
  job_created:           { icon: <Briefcase size={16} />, color: 'text-violet-600 dark:text-violet-400', gradient: 'from-violet-500/20 to-purple-500/20' },
  ai_analysis_run:       { icon: <Sparkles size={16} />, color: 'text-primary', gradient: 'from-primary/20 to-secondary/20' },
  candidate_deleted:     { icon: <Trash2 size={16} />, color: 'text-slate-600 dark:text-slate-400',  gradient: 'from-slate-500/20 to-slate-600/20' },
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
        <p className="text-slate-500 dark:text-slate-600 text-sm">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-5 top-3 bottom-3 w-px bg-gradient-to-b from-slate-200 via-slate-100 dark:from-white/10 dark:via-white/5 to-transparent" />

      <div className="flex flex-col gap-4">
        {activities.map((item) => {
          const config = actionConfig[item.action] || { icon: <ClipboardList size={16} />, color: 'text-slate-600 dark:text-slate-400', gradient: 'from-slate-500/20 to-slate-600/20' };
          return (
            <div key={item._id} className="flex items-start gap-3 relative">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} ${config.color} flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-white/5 bg-white dark:bg-transparent z-10`}>
                {config.icon}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className={`text-sm font-medium ${config.color}`}>
                  {item.description || item.action.replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-600 mt-0.5">
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