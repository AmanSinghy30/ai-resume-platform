type ActivityItem = {
  _id: string;
  action: string;
  description: string;
  candidateId: { name: string } | null;
  performedBy: { name: string } | null;
  createdAt: string;
};

const actionConfig: Record<string, { icon: string; color: string }> = {
  resume_uploaded:       { icon: '📤', color: 'text-blue-400' },
  candidate_shortlisted: { icon: '✅', color: 'text-green-400' },
  candidate_rejected:    { icon: '❌', color: 'text-red-400' },
  candidate_reviewed:    { icon: '👁️', color: 'text-yellow-400' },
  job_created:           { icon: '💼', color: 'text-purple-400' },
  ai_analysis_run:       { icon: '🤖', color: 'text-accent' },
  candidate_deleted:     { icon: '🗑️', color: 'text-gray-400' },
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
        <p className="text-gray-500 text-sm">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {activities.map((item) => {
        const config = actionConfig[item.action] || { icon: '📋', color: 'text-gray-400' };
        return (
          <div key={item._id} className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0 mt-0.5">{config.icon}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${config.color}`}>
                {item.description || item.action.replace(/_/g, ' ')}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {item.performedBy?.name || 'System'} • {timeAgo(item.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}