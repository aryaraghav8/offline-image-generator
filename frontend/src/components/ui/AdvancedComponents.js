import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/utils';
export const Card = ({ children, className, hover, ...props }) => {
    return (_jsx("div", { className: cn('bg-dark-800 border border-dark-700 rounded-lg p-4', hover && 'hover:border-dark-600 transition-colors', className), ...props, children: children }));
};
export const CardHeader = ({ title, description, children }) => {
    return (_jsxs("div", { className: "mb-4", children: [title && _jsx("h3", { className: "text-lg font-semibold text-dark-100", children: title }), description && _jsx("p", { className: "text-sm text-dark-400 mt-1", children: description }), children] }));
};
export const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);
    if (!isOpen)
        return null;
    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
    };
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center", children: [_jsx("div", { className: "absolute inset-0 bg-black/50 backdrop-blur-sm", onClick: onClose }), _jsxs("div", { className: cn('relative bg-dark-800 border border-dark-700 rounded-lg shadow-xl', sizeClasses[size]), children: [title && (_jsxs("div", { className: "flex items-center justify-between p-4 border-b border-dark-700", children: [_jsx("h2", { className: "text-lg font-semibold text-dark-100", children: title }), _jsx("button", { onClick: onClose, className: "text-dark-400 hover:text-dark-100", children: _jsx(X, { size: 24 }) })] })), _jsx("div", { className: "p-4", children: children }), footer && _jsx("div", { className: "border-t border-dark-700 p-4 flex justify-end gap-2", children: footer })] })] }));
};
export const Toast = ({ id, message, type, onClose, duration = 3000 }) => {
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
        success: _jsx(CheckCircle, { size: 20 }),
        error: _jsx(AlertCircle, { size: 20 }),
        info: _jsx(Info, { size: 20 }),
    };
    return (_jsxs("div", { className: cn('flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm animate-slideIn', typeClasses[type]), children: [icons[type], _jsx("span", { className: "flex-1", children: message }), _jsx("button", { onClick: () => onClose(id), className: "hover:opacity-80", children: _jsx(X, { size: 18 }) })] }));
};
export const ToastContainer = ({ toasts, onRemove }) => {
    return (_jsx("div", { className: "fixed bottom-4 right-4 z-50 space-y-3 max-w-md", children: toasts.map((toast) => (_jsx(Toast, { ...toast, onClose: onRemove }, toast.id))) }));
};
export const Progress = ({ value, max = 100, className }) => {
    const percentage = (value / max) * 100;
    return (_jsx("div", { className: cn('w-full h-2 bg-dark-700 rounded-full overflow-hidden', className), children: _jsx("div", { className: "h-full bg-blue-600 transition-all duration-300", style: { width: `${percentage}%` } }) }));
};
export const Skeleton = ({ className, count = 1 }) => {
    return (_jsx(_Fragment, { children: Array.from({ length: count }).map((_, i) => (_jsx("div", { className: cn('bg-dark-700 rounded animate-pulse', className) }, i))) }));
};
export const Tabs = ({ tabs, defaultTab, onChange }) => {
    const [activeTab, setActiveTab] = React.useState(defaultTab || tabs[0]?.id);
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        onChange?.(tabId);
    };
    return (_jsxs("div", { children: [_jsx("div", { className: "flex gap-2 border-b border-dark-700", children: tabs.map((tab) => (_jsx("button", { onClick: () => handleTabChange(tab.id), className: cn('px-4 py-2 font-medium text-sm transition-colors border-b-2', activeTab === tab.id
                        ? 'text-blue-400 border-b-blue-600'
                        : 'text-dark-400 border-b-transparent hover:text-dark-100'), children: tab.label }, tab.id))) }), _jsx("div", { className: "mt-4", children: tabs.find((t) => t.id === activeTab)?.content })] }));
};
export const Accordion = ({ items }) => {
    const [expanded, setExpanded] = React.useState(null);
    return (_jsx("div", { className: "space-y-2", children: items.map((item) => (_jsxs("div", { className: "border border-dark-700 rounded-lg overflow-hidden", children: [_jsxs("button", { onClick: () => setExpanded(expanded === item.id ? null : item.id), className: "w-full px-4 py-3 text-left font-medium hover:bg-dark-700 transition-colors flex justify-between items-center", children: [item.title, _jsx("span", { className: cn('transition-transform', expanded === item.id && 'rotate-180'), children: "\u25BC" })] }), expanded === item.id && _jsx("div", { className: "px-4 py-3 bg-dark-900 border-t border-dark-700", children: item.content })] }, item.id))) }));
};
