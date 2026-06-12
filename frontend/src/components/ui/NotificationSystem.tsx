import { ToastContainer } from '@/components/ui/AdvancedComponents';
import { useAppStore } from '@/stores/appStore';

export const NotificationSystem = () => {
  const toasts = useAppStore((state) => state.toasts);
  const removeToast = useAppStore((state) => state.removeToast);

  return <ToastContainer toasts={toasts} onRemove={removeToast} />;
};
