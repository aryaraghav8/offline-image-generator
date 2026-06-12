import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cn } from '@/utils';
export const Button = React.forwardRef(({ variant = 'primary', size = 'md', isLoading, className, children, ...props }, ref) => {
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
    return (_jsxs("button", { ref: ref, className: cn(baseClasses, variantClasses[variant], sizeClasses[size], className), disabled: isLoading || props.disabled, ...props, children: [isLoading && _jsx(LoadingSpinner, { size: "sm" }), children] }));
});
Button.displayName = 'Button';
export const LoadingSpinner = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };
    return (_jsx("div", { className: cn('animate-spin rounded-full border-2 border-dark-600 border-t-blue-600', sizeClasses[size]) }));
};
export const Input = React.forwardRef(({ label, error, helperText, className, ...props }, ref) => {
    return (_jsxs("div", { className: "w-full", children: [label && _jsx("label", { className: "block text-sm font-medium text-dark-100 mb-2", children: label }), _jsx("input", { ref: ref, className: cn('input-base w-full', error && 'border-red-600 focus:border-red-600 focus:ring-red-600/50', className), ...props }), error && _jsx("p", { className: "text-red-500 text-sm mt-1", children: error }), helperText && _jsx("p", { className: "text-dark-400 text-sm mt-1", children: helperText })] }));
});
Input.displayName = 'Input';
export const TextArea = React.forwardRef(({ label, error, helperText, maxLength, showCharCount, className, ...props }, ref) => {
    const [charCount, setCharCount] = React.useState(0);
    return (_jsxs("div", { className: "w-full", children: [label && (_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("label", { className: "text-sm font-medium text-dark-100", children: label }), showCharCount && (_jsxs("span", { className: cn('text-sm', charCount > (maxLength || 2000) * 0.9 ? 'text-orange-500' : 'text-dark-400'), children: [charCount, " / ", maxLength || 2000] }))] })), _jsx("textarea", { ref: ref, maxLength: maxLength || 2000, className: cn('input-base w-full resize-none', error && 'border-red-600', className), onChange: (e) => {
                    setCharCount(e.target.value.length);
                    props.onChange?.(e);
                }, ...props }), error && _jsx("p", { className: "text-red-500 text-sm mt-1", children: error }), helperText && _jsx("p", { className: "text-dark-400 text-sm mt-1", children: helperText })] }));
});
TextArea.displayName = 'TextArea';
export const Select = React.forwardRef(({ label, error, options, className, ...props }, ref) => {
    return (_jsxs("div", { className: "w-full", children: [label && _jsx("label", { className: "block text-sm font-medium text-dark-100 mb-2", children: label }), _jsx("select", { ref: ref, className: cn('input-base w-full', error && 'border-red-600', className), ...props, children: options.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value))) }), error && _jsx("p", { className: "text-red-500 text-sm mt-1", children: error })] }));
});
Select.displayName = 'Select';
export const Slider = React.forwardRef(({ label, min = 0, max = 100, step = 1, value, className, ...props }, ref) => {
    return (_jsxs("div", { className: "w-full", children: [label && (_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("label", { className: "text-sm font-medium text-dark-100", children: label }), _jsx("span", { className: "text-sm text-dark-400", children: value })] })), _jsx("input", { ref: ref, type: "range", min: min, max: max, step: step, value: value, className: cn('w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-blue-600', className), ...props })] }));
});
Slider.displayName = 'Slider';
export const Badge = ({ variant = 'default', children, className }) => {
    const variantClasses = {
        default: 'bg-dark-700 text-dark-100',
        success: 'bg-green-900/50 text-green-400',
        warning: 'bg-orange-900/50 text-orange-400',
        error: 'bg-red-900/50 text-red-400',
        info: 'bg-blue-900/50 text-blue-400',
    };
    return (_jsx("span", { className: cn('px-2.5 py-1 rounded-full text-xs font-medium', variantClasses[variant], className), children: children }));
};
