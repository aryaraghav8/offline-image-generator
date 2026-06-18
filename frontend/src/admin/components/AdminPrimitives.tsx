import type { ReactNode } from 'react';
import { cn } from '@/utils';

// ─── Page header ────────────────────────────────────────────────────────

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export const AdminPageHeader = ({ title, description, actions }: AdminPageHeaderProps) => (
  <div className="flex flex-wrap items-start justify-between gap-4">
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
      {description && <p className="mt-1 text-sm text-dark-400">{description}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

// ─── Status pill (generic, color-driven) ───────────────────────────────

type PillTone = 'success' | 'warning' | 'error' | 'neutral' | 'info';

const TONE_CLASSES: Record<PillTone, string> = {
  success: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
  error: 'bg-rose-500/10 text-rose-400 ring-rose-500/20',
  neutral: 'bg-dark-700/60 text-dark-300 ring-dark-600',
  info: 'bg-sky-500/10 text-sky-400 ring-sky-500/20',
};

interface StatusPillProps {
  tone: PillTone;
  children: ReactNode;
  dot?: boolean;
  className?: string;
}

export const StatusPill = ({ tone, children, dot = true, className }: StatusPillProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1',
      TONE_CLASSES[tone],
      className
    )}
  >
    {dot && <span className={cn('h-1.5 w-1.5 rounded-full', tone === 'success' && 'bg-emerald-400', tone === 'warning' && 'bg-amber-400', tone === 'error' && 'bg-rose-400', tone === 'neutral' && 'bg-dark-400', tone === 'info' && 'bg-sky-400')} />}
    {children}
  </span>
);

// ─── Stat card ──────────────────────────────────────────────────────────

interface AdminStatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  trend?: { value: string; positive: boolean };
}

export const AdminStatCard = ({ label, value, hint, icon, trend }: AdminStatCardProps) => (
  <div className="rounded-xl border border-dark-700 bg-dark-900/60 p-4">
    <div className="flex items-start justify-between">
      <p className="text-xs font-medium uppercase tracking-wider text-dark-500">{label}</p>
      {icon && <span className="text-ember-400">{icon}</span>}
    </div>
    <div className="mt-2 flex items-baseline gap-2">
      <span className="text-2xl font-semibold text-white">{value}</span>
      {trend && (
        <span className={cn('text-xs font-medium', trend.positive ? 'text-emerald-400' : 'text-rose-400')}>
          {trend.positive ? '↑' : '↓'} {trend.value}
        </span>
      )}
    </div>
    {hint && <p className="mt-1 text-xs text-dark-500">{hint}</p>}
  </div>
);

// ─── Empty state ────────────────────────────────────────────────────────

interface AdminEmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const AdminEmptyState = ({ icon, title, description, action }: AdminEmptyStateProps) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-dark-700 px-6 py-16 text-center">
    {icon && <div className="mb-3 text-dark-600">{icon}</div>}
    <p className="font-medium text-dark-300">{title}</p>
    {description && <p className="mt-1 max-w-sm text-sm text-dark-500">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

// ─── Section panel ──────────────────────────────────────────────────────

interface AdminPanelProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const AdminPanel = ({ title, description, actions, children, className, noPadding }: AdminPanelProps) => (
  <div className={cn('rounded-xl border border-dark-700 bg-dark-900/60', className)}>
    {(title || actions) && (
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dark-700 px-5 py-4">
        <div>
          {title && <h3 className="text-sm font-semibold text-white">{title}</h3>}
          {description && <p className="mt-0.5 text-xs text-dark-500">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    )}
    <div className={noPadding ? '' : 'p-5'}>{children}</div>
  </div>
);

// ─── Toggle switch ──────────────────────────────────────────────────────

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const Toggle = ({ checked, onChange, label, disabled }: ToggleProps) => (
  <label className={cn('inline-flex items-center gap-2', disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer')}>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-5 w-9 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ember-500/50',
        checked ? 'bg-ember-500' : 'bg-dark-700'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform',
          checked ? 'translate-x-[18px]' : 'translate-x-0.5'
        )}
      />
    </button>
    {label && <span className="text-sm text-dark-300">{label}</span>}
  </label>
);

// ─── Progress bar (admin-styled) ────────────────────────────────────────

interface AdminProgressBarProps {
  value: number;
  max?: number;
  tone?: 'ember' | 'success' | 'warning' | 'error';
  className?: string;
}

const PROGRESS_TONE: Record<string, string> = {
  ember: 'bg-ember-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-rose-500',
};

export const AdminProgressBar = ({ value, max = 100, tone = 'ember', className }: AdminProgressBarProps) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-dark-800', className)}>
      <div className={cn('h-full rounded-full transition-all duration-500', PROGRESS_TONE[tone])} style={{ width: `${pct}%` }} />
    </div>
  );
};
