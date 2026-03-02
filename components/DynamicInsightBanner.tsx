interface PageLayout {
  tagline?: string;
  insight?: string;
  emphasis?: string;
  accentColor?: 'jade' | 'rust' | 'sea';
  statusBanner?: { type: 'warning' | 'info' | 'success' | 'error'; message: string };
  keyStats?: string[];
  sectionOrder?: string[];
}

interface DynamicInsightBannerProps {
  layout: PageLayout;
}

const accentStyles = {
  jade: {
    border: 'border-l-jade',
    bg: 'bg-jade/5',
    icon: 'text-jade',
    stat: 'bg-jade/10 text-jade',
  },
  rust: {
    border: 'border-l-rust',
    bg: 'bg-rust/5',
    icon: 'text-rust',
    stat: 'bg-rust/10 text-rust',
  },
  sea: {
    border: 'border-l-sea',
    bg: 'bg-sea/10',
    icon: 'text-sea',
    stat: 'bg-sea/10 text-sea',
  },
};

const bannerStyles = {
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-jade/5 border-jade/20 text-jade',
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-rust/10 border-rust/30 text-rust',
};

const bannerIcons = {
  warning: '⚠',
  info: 'ℹ',
  success: '✓',
  error: '✕',
};

export default function DynamicInsightBanner({ layout }: DynamicInsightBannerProps) {
  const { tagline, insight, accentColor = 'jade', statusBanner, keyStats } = layout;

  if (!tagline && !insight && !statusBanner && (!keyStats || keyStats.length === 0)) {
    return null;
  }

  const styles = accentStyles[accentColor] || accentStyles.jade;

  return (
    <div className="space-y-2 mb-2">
      {/* Status Banner */}
      {statusBanner && (
        <div className={`border rounded-lg px-4 py-2.5 flex items-center gap-2 text-sm font-body ${bannerStyles[statusBanner.type]}`}>
          <span className="font-bold">{bannerIcons[statusBanner.type]}</span>
          <span>{statusBanner.message}</span>
        </div>
      )}

      {/* AI Insight Card */}
      {(tagline || insight || (keyStats && keyStats.length > 0)) && (
        <div className={`border-l-4 ${styles.border} ${styles.bg} rounded-r-xl p-4`}>
          <div className="flex items-center gap-1.5 mb-2">
            <span className={`text-xs font-body font-semibold tracking-wider uppercase ${styles.icon}`}>
              ◆ AI Insight
            </span>
          </div>
          {tagline && (
            <p className={`font-heading font-bold text-base ${styles.icon} mb-1`}>{tagline}</p>
          )}
          {insight && (
            <p className="text-sm font-body text-jade/70 leading-relaxed">{insight}</p>
          )}
          {keyStats && keyStats.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {keyStats.map((stat, i) => (
                <span key={i} className={`text-xs px-2.5 py-1 rounded-full font-body font-medium ${styles.stat}`}>
                  {stat}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
