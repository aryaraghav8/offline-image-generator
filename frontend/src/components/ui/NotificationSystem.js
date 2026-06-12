import { jsx as _jsx } from "react/jsx-runtime";
import { ToastContainer } from '@/components/ui/AdvancedComponents';
import { useAppStore } from '@/stores/appStore';
export const NotificationSystem = () => {
    const toasts = useAppStore((state) => state.toasts);
    const removeToast = useAppStore((state) => state.removeToast);
    return _jsx(ToastContainer, { toasts: toasts, onRemove: removeToast });
};
