import React from 'react';
import { cn } from '@/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, className, children, ...props }, ref) => {
    const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2';

    const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-dark-700 text-dark-100 hover:bg-dark-600',
      ghost: 'text-dark-100 hover:bg-dark-800',
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <LoadingSpinner size="sm" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('animate-spin rounded-full border-2 border-dark-600 border-t-blue-600', sizeClasses[size])} />
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-dark-100 mb-2">{label}</label>}
        <input
          ref={ref}
          className={cn('input-base w-full', error && 'border-red-600 focus:border-red-600 focus:ring-red-600/50', className)}
          {...props}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        {helperText && <p className="text-dark-400 text-sm mt-1">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  maxLength?: number;
  showCharCount?: boolean;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, helperText, maxLength, showCharCount, className, ...props }, ref) => {
    const [charCount, setCharCount] = React.useState(0);

    return (
      <div className="w-full">
        {label && (
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-dark-100">{label}</label>
            {showCharCount && (
              <span className={cn('text-sm', charCount > (maxLength || 2000) * 0.9 ? 'text-orange-500' : 'text-dark-400')}>
                {charCount} / {maxLength || 2000}
              </span>
            )}
          </div>
        )}
        <textarea
          ref={ref}
          maxLength={maxLength || 2000}
          className={cn('input-base w-full resize-none', error && 'border-red-600', className)}
          onChange={(e) => {
            setCharCount(e.target.value.length);
            props.onChange?.(e);
          }}
          {...props}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        {helperText && <p className="text-dark-400 text-sm mt-1">{helperText}</p>}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-dark-100 mb-2">{label}</label>}
        <select
          ref={ref}
          className={cn('input-base w-full', error && 'border-red-600', className)}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ label, min = 0, max = 100, step = 1, value, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-dark-100">{label}</label>
            <span className="text-sm text-dark-400">{value}</span>
          </div>
        )}
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          className={cn('w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-blue-600', className)}
          {...props}
        />
      </div>
    );
  }
);

Slider.displayName = 'Slider';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, className }) => {
  const variantClasses = {
    default: 'bg-dark-700 text-dark-100',
    success: 'bg-green-900/50 text-green-400',
    warning: 'bg-orange-900/50 text-orange-400',
    error: 'bg-red-900/50 text-red-400',
    info: 'bg-blue-900/50 text-blue-400',
  };

  return (
    <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', variantClasses[variant], className)}>
      {children}
    </span>
  );
};
