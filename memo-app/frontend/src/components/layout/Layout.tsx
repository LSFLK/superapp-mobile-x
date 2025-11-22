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
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-primary-100 selection:text-primary-900">
            {/* Sticky Header */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    {showBack && (
                        <button
                            onClick={onBack}
                            className="-ml-2 p-2 rounded-full text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors"
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
                            className="p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            {isRefreshing ? <Loader2 className="animate-spin w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
                        </button>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="p-4 max-w-md mx-auto min-h-[calc(100vh-140px)]">
                {children}
            </main>

            {/* Bottom Navigation - Always Visible: Feed, Favorites, More */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe pt-2 px-6 flex justify-around items-end h-[80px] z-40">
                <button
                    onClick={() => onTabSwitch(TABS.RECEIVED)}
                    className={cn(
                        "flex flex-col items-center pb-4 w-16 transition-colors relative",
                        activeTab === TABS.RECEIVED ? "text-primary-600" : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <Inbox size={24} className="mb-1" />
                    <span className="text-[10px] font-medium">{UI_TEXT.TAB_RECEIVED}</span>
                    {receivedCount > 0 && (
                        <span className="absolute top-0 right-3 w-2.5 h-2.5 bg-primary-600 rounded-full border-2 border-white"></span>
                    )}
                </button>

                <button
                    onClick={() => onTabSwitch(TABS.FAVORITES)}
                    className={cn(
                        "flex flex-col items-center pb-4 w-16 transition-colors relative",
                        activeTab === TABS.FAVORITES ? "text-primary-600" : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <Star size={24} className="mb-1" />
                    <span className="text-[10px] font-medium">{UI_TEXT.TAB_FAVORITES}</span>
                    {favoritesCount > 0 && (
                        <span className="absolute top-0 right-3 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white"></span>
                    )}
                </button>

                <button
                    onClick={() => onTabSwitch(TABS.MORE)}
                    className={cn(
                        "flex flex-col items-center pb-4 w-16 transition-colors",
                        activeTab === TABS.MORE ? "text-primary-600" : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <MoreHorizontal size={24} className="mb-1" />
                    <span className="text-[10px] font-medium">{UI_TEXT.TAB_MORE}</span>
                </button>
            </nav>
        </div>
    );
};
