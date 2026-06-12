import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { NotificationSystem } from '@/components/ui/NotificationSystem';
export const MainLayout = () => {
    return (_jsxs("div", { className: "flex h-screen overflow-hidden bg-dark-950", children: [_jsx(Sidebar, {}), _jsxs("div", { className: "flex min-w-0 flex-1 flex-col overflow-hidden", children: [_jsx(Header, {}), _jsx("main", { className: "flex-1 overflow-y-auto overflow-x-hidden", children: _jsx(Outlet, {}) })] }), _jsx(NotificationSystem, {})] }));
};
