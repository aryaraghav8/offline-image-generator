import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hover, ...props }) => {
  return (
    <div
      className={cn('bg-dark-800 border border-dark-700 rounded-lg p-4', hover && 'hover:border-dark-600 transition-colors', className)}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, description, children }) => {
  return (
    <div className="mb-4">
      {title && <h3 className="text-lg font-semibold text-dark-100">{title}</h3>}
      {description && <p className="text-sm text-dark-400 mt-1">{description}</p>}
      {children}
    </div>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative bg-dark-800 border border-dark-700 rounded-lg shadow-xl', sizeClasses[size])}>
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-dark-700">
            <h2 className="text-lg font-semibold text-dark-100">{title}</h2>
            <button onClick={onClose} className="text-dark-400 hover:text-dark-100">
              <X size={24} />
            </button>
          </div>
        )}
        <div className="p-4">{children}</div>
        {footer && <div className="border-t border-dark-700 p-4 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
};

interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: (id: string) => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ id, message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const typeClasses = {
    success: 'bg-green-900/50 border-green-700 text-green-400',
    error: 'bg-red-900/50 border-red-700 text-red-400',
    info: 'bg-blue-900/50 border-blue-700 text-blue-400',
  };

  const icons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    info: <Info size={20} />,
  };

  return (
    <div className={cn('flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm animate-slideIn', typeClasses[type])}>
      {icons[type]}
      <span className="flex-1">{message}</span>
      <button onClick={() => onClose(id)} className="hover:opacity-80">
        <X size={18} />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-md">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onRemove} />
      ))}
    </div>
  );
};

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({ value, max = 100, className }) => {
  const percentage = (value / max) * 100;

  return (
    <div className={cn('w-full h-2 bg-dark-700 rounded-full overflow-hidden', className)}>
      <div
        className="h-full bg-blue-600 transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

interface SkeletonProps {
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn('bg-dark-700 rounded animate-pulse', className)}
        />
      ))}
    </>
  );
};

interface TabsProps {
  tabs: Array<{ id: string; label: string; content: React.ReactNode }>;
  defaultTab?: string;
  onChange?: (tabId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab, onChange }) => {
  const [activeTab, setActiveTab] = React.useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  return (
    <div>
      <div className="flex gap-2 border-b border-dark-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              'px-4 py-2 font-medium text-sm transition-colors border-b-2',
              activeTab === tab.id
                ? 'text-blue-400 border-b-blue-600'
                : 'text-dark-400 border-b-transparent hover:text-dark-100'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tabs.find((t) => t.id === activeTab)?.content}
      </div>
    </div>
  );
};

interface AccordionProps {
  items: Array<{ id: string; title: string; content: React.ReactNode }>;
}

export const Accordion: React.FC<AccordionProps> = ({ items }) => {
  const [expanded, setExpanded] = React.useState<string | null>(null);

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="border border-dark-700 rounded-lg overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === item.id ? null : item.id)}
            className="w-full px-4 py-3 text-left font-medium hover:bg-dark-700 transition-colors flex justify-between items-center"
          >
            {item.title}
            <span className={cn('transition-transform', expanded === item.id && 'rotate-180')}>▼</span>
          </button>
          {expanded === item.id && <div className="px-4 py-3 bg-dark-900 border-t border-dark-700">{item.content}</div>}
        </div>
      ))}
    </div>
  );
};
