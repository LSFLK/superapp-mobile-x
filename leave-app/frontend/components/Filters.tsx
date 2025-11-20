
import React, { useState } from 'react';
import { Input, Select, Button } from './UI';
import { LeaveType, LeaveStatus } from '../types';
import { Search, Filter, X } from 'lucide-react';
import { cn } from '../utils/cn';

interface FiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  hideSearch?: boolean;
  type: LeaveType | 'all';
  onTypeChange: (val: LeaveType | 'all') => void;
  status?: LeaveStatus | 'all';
  onStatusChange?: (val: LeaveStatus | 'all') => void;
  startDate?: string;
  onStartDateChange?: (val: string) => void;
  endDate?: string;
  onEndDateChange?: (val: string) => void;
  className?: string;
}

export const Filters: React.FC<FiltersProps> = ({
  search, onSearchChange, searchPlaceholder = "Search...",
  hideSearch = false,
  type, onTypeChange,
  status = 'all', onStatusChange,
  startDate, onStartDateChange,
  endDate, onEndDateChange,
  className
}) => {
  const [expanded, setExpanded] = useState(false);

  const activeFiltersCount = [
    type !== 'all',
    status !== 'all',
    startDate,
    endDate,
    !hideSearch && search 
  ].filter(Boolean).length;

  const handleClearAll = () => {
    onTypeChange('all');
    if (onStatusChange) onStatusChange('all');
    if (onStartDateChange) onStartDateChange('');
    if (onEndDateChange) onEndDateChange('');
    if (!hideSearch) onSearchChange('');
  };

  return (
    <div className={cn("bg-white rounded-xl border border-slate-200 shadow-sm transition-all w-full", className)}>
      <div className="flex items-center p-2 gap-2">
        {!hideSearch && (
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <Input 
              placeholder={searchPlaceholder} 
              className="pl-8 h-9 text-xs w-full" 
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "h-9 px-3 flex-shrink-0 flex items-center gap-1.5", 
            hideSearch && "w-full justify-center", 
            (expanded || activeFiltersCount > 0) && "bg-primary-50 text-primary-600 border-primary-100"
          )}
        >
          <Filter size={14} />
          <span className={hideSearch ? "inline" : "hidden sm:inline"}>Filter Options</span>
          {activeFiltersCount > 0 && (
            <span className="bg-primary-600 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-0.5">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </div>

      {expanded && (
        <div className="bg-slate-50/50 p-3 border-t border-slate-100 grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 duration-200">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Type</label>
            <Select value={type} onChange={(e) => onTypeChange(e.target.value as any)} className="text-xs h-8">
              <option value="all">All Types</option>
              <option value="sick">Sick</option>
              <option value="annual">Annual</option>
              <option value="casual">Casual</option>
            </Select>
          </div>
          
          {onStatusChange && (
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Status</label>
              <Select value={status} onChange={(e) => onStatusChange(e.target.value as any)} className="text-xs h-8">
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Select>
            </div>
          )}

          {(onStartDateChange && onEndDateChange) && (
            <div className="col-span-2 grid grid-cols-2 gap-2 mt-1 pt-2 border-t border-slate-200/60">
              <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">From</label>
                  <Input 
                    type="date" 
                    value={startDate || ''} 
                    onChange={(e) => onStartDateChange(e.target.value)} 
                    className="text-xs h-8"
                  />
              </div>
              <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">To</label>
                  <Input 
                    type="date" 
                    value={endDate || ''} 
                    min={startDate} 
                    onChange={(e) => onEndDateChange(e.target.value)} 
                    className="text-xs h-8"
                  />
              </div>
            </div>
          )}

          <div className="col-span-2 pt-1">
            <button 
              onClick={handleClearAll}
              className="text-[10px] text-slate-500 hover:text-red-500 flex items-center justify-center w-full py-1 transition-colors"
            >
              <X size={10} className="mr-1" /> Clear all filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};