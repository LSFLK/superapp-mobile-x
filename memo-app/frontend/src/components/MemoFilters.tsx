import { useState } from 'react';
import { Search, Calendar, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { MemoFilter } from '../types';
import { AutocompleteInput } from './AutocompleteInput';

interface MemoFiltersProps {
    filter: MemoFilter;
    onChange: (filter: MemoFilter) => void;
    onClear: () => void;
    showBroadcastOption?: boolean;
    knownUsers?: string[];
}

export function MemoFilters({ filter, onChange, onClear, showBroadcastOption = true, knownUsers = [] }: MemoFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);

    const hasActiveFilters = filter.search || filter.startDate || filter.endDate || filter.isBroadcast;

    const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
        onChange({ ...filter, [field]: value });
    };

    const toggleBroadcast = () => {
        onChange({ ...filter, isBroadcast: !filter.isBroadcast });
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-4">
            {/* Search Bar - Always Visible */}
            <div className="p-3 flex items-center gap-2">
                <div className="relative flex-1">
                    <AutocompleteInput
                        value={filter.search}
                        onChange={(value) => onChange({ ...filter, search: value })}
                        suggestions={knownUsers}
                        placeholder="Search by title or sender..."
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                        icon={<Search className="w-4 h-4" />}
                    />
                </div>
                <Button
                    variant={isOpen ? "default" : "outline"}
                    size="icon"
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn("shrink-0", hasActiveFilters && !isOpen && "border-primary-500 text-primary-600 bg-primary-50")}
                >
                    <Filter className="w-4 h-4" />
                </Button>
            </div>

            {/* Advanced Filters - Collapsible */}
            {isOpen && (
                <div className="px-3 pb-3 pt-0 space-y-3 animate-in slide-in-from-top-2 duration-200">
                    <div className="h-px bg-slate-100" />

                    {/* Date Range */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date Range</label>
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <input
                                    type="date"
                                    value={filter.startDate}
                                    onChange={(e) => handleDateChange('startDate', e.target.value)}
                                    className="w-full pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-primary-500"
                                />
                            </div>
                            <span className="text-slate-400">-</span>
                            <div className="relative flex-1">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <input
                                    type="date"
                                    value={filter.endDate}
                                    onChange={(e) => handleDateChange('endDate', e.target.value)}
                                    className="w-full pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-primary-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Toggles */}
                    {showBroadcastOption && (
                        <div className="flex items-center justify-between">
                            <label className="text-sm text-slate-700">Show Broadcasts Only</label>
                            <button
                                onClick={toggleBroadcast}
                                className={cn(
                                    "w-10 h-6 rounded-full transition-colors relative",
                                    filter.isBroadcast ? "bg-slate-900" : "bg-slate-200"
                                )}
                            >
                                <div
                                    className={cn(
                                        "absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform",
                                        filter.isBroadcast ? "translate-x-4" : "translate-x-0"
                                    )}
                                />
                            </button>
                        </div>
                    )}

                    {/* Clear Actions */}
                    {hasActiveFilters && (
                        <div className="pt-2 flex justify-end">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClear}
                                className="text-xs text-slate-500 hover:text-red-600 h-8"
                            >
                                Clear all filters
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
