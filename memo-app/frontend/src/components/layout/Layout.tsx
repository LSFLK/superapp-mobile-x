import React from 'react';
import { Inbox, Star, MoreHorizontal, ChevronLeft, RefreshCw, Loader2 } from 'lucide-react';
import { UI_TEXT, TABS, TabType } from '../../constants';
import { cn } from '../../lib/utils';

interface LayoutProps {
    children: React.ReactNode;
    activeTab: TabType;
    onTabSwitch: (tab: TabType) => void;
    onRefresh?: () => void;
    isRefreshing?: boolean;
    title: string;
    showBack?: boolean;
    onBack?: () => void;
    receivedCount?: number;
    favoritesCount?: number;
}

export const Layout = ({
    children,
    activeTab,
    onTabSwitch,
    onRefresh,
    isRefreshing,
    title,
    showBack,
    onBack,
    receivedCount = 0,
    favoritesCount = 0,
}: LayoutProps) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 font-sans selection:bg-primary-100 selection:text-primary-900">
            {/* Sticky Header with Glassmorphism */}
            <header className="sticky top-0 z-30 glass border-b border-slate-200/50 px-4 py-3 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3 animate-slide-in-from-right">
                    {showBack && (
                        <button
                            onClick={onBack}
                            className="-ml-2 p-2 rounded-full text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-all duration-200 active:scale-95"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    )}
                    <h1 className="text-lg font-bold tracking-tight text-slate-900">
                        {title}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    {onRefresh && (
                        <button
                            aria-label="Refresh"
                            onClick={onRefresh}
                            disabled={isRefreshing}
                            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200 active:scale-95 disabled:opacity-50"
                        >
                            {isRefreshing ? (
                                <Loader2 className="animate-spin w-5 h-5" />
                            ) : (
                                <RefreshCw className="w-5 h-5" />
                            )}
                        </button>
                    )}
                </div>
            </header>

            {/* Main Content with Page Transition */}
            <main className="p-4 max-w-md mx-auto min-h-[calc(100vh-140px)] animate-fade-in">
                {children}
            </main>

            {/* Bottom Navigation with Enhanced Active States */}
            <nav className="fixed bottom-0 left-0 right-0 glass border-t border-slate-200/50 pb-safe pt-2 px-6 flex justify-around items-end h-[80px] z-40 shadow-lg">
                <button
                    onClick={() => onTabSwitch(TABS.RECEIVED)}
                    className={cn(
                        "flex flex-col items-center pb-4 w-16 transition-all duration-300 relative group",
                        activeTab === TABS.RECEIVED ? "text-primary-600" : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <div className={cn(
                        "transition-transform duration-200",
                        activeTab === TABS.RECEIVED ? "scale-110" : "group-hover:scale-105"
                    )}>
                        <Inbox size={24} className="mb-1" />
                    </div>
                    <span className={cn(
                        "text-[10px] font-medium transition-all duration-200",
                        activeTab === TABS.RECEIVED ? "font-semibold" : ""
                    )}>
                        {UI_TEXT.TAB_RECEIVED}
                    </span>
                    {activeTab === TABS.RECEIVED && (
                        <div className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary-600 rounded-full animate-scale-in" />
                    )}
                    {receivedCount > 0 && (
                        <span className="absolute top-0 right-3 w-2.5 h-2.5 bg-primary-600 rounded-full border-2 border-white animate-scale-in"></span>
                    )}
                </button>

                <button
                    onClick={() => onTabSwitch(TABS.FAVORITES)}
                    className={cn(
                        "flex flex-col items-center pb-4 w-16 transition-all duration-300 relative group",
                        activeTab === TABS.FAVORITES ? "text-primary-600" : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <div className={cn(
                        "transition-transform duration-200",
                        activeTab === TABS.FAVORITES ? "scale-110" : "group-hover:scale-105"
                    )}>
                        <Star size={24} className="mb-1" />
                    </div>
                    <span className={cn(
                        "text-[10px] font-medium transition-all duration-200",
                        activeTab === TABS.FAVORITES ? "font-semibold" : ""
                    )}>
                        {UI_TEXT.TAB_FAVORITES}
                    </span>
                    {activeTab === TABS.FAVORITES && (
                        <div className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary-600 rounded-full animate-scale-in" />
                    )}
                    {favoritesCount > 0 && (
                        <span className="absolute top-0 right-3 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white animate-scale-in"></span>
                    )}
                </button>

                <button
                    onClick={() => onTabSwitch(TABS.MORE)}
                    className={cn(
                        "flex flex-col items-center pb-4 w-16 transition-all duration-300 relative group",
                        activeTab === TABS.MORE ? "text-primary-600" : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <div className={cn(
                        "transition-transform duration-200",
                        activeTab === TABS.MORE ? "scale-110" : "group-hover:scale-105"
                    )}>
                        <MoreHorizontal size={24} className="mb-1" />
                    </div>
                    <span className={cn(
                        "text-[10px] font-medium transition-all duration-200",
                        activeTab === TABS.MORE ? "font-semibold" : ""
                    )}>
                        {UI_TEXT.TAB_MORE}
                    </span>
                    {activeTab === TABS.MORE && (
                        <div className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary-600 rounded-full animate-scale-in" />
                    )}
                </button>
            </nav>
        </div>
    );
};
