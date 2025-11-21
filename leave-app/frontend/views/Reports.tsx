
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Leave, UserInfo, Allowances, LeaveType, LeaveStatus } from '../types';
import { Card, Button, Badge, Modal, Input } from '../components/UI';
import { Filters } from '../components/Filters';
import { Download, Users, UserCircle, FileText, Settings, Printer, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';
import { formatDate } from '../utils/formatters';
import { useReports } from '../hooks/useReports';
// logic moved to useReports hook

interface ReportsProps {
  allLeaves: Leave[];
  isAdmin: boolean;
  currentUser: UserInfo;
  users?: UserInfo[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export const Reports: React.FC<ReportsProps> = ({ 
  allLeaves, isAdmin, currentUser, users
}) => {
  const {
    activeTab,
    setActiveTab,
    orgSubTab,
    setOrgSubTab,
    search,
    setSearch,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    filteredLeaves,
    stats,
    typeData,
    handleDownloadCSV,
    handlePrint,
  } = useReports({ allLeaves, currentUser, isAdmin, users });

  const renderOverview = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
           <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col justify-center items-center">
              <span className="text-3xl font-bold text-slate-800">{stats.total}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Total</span>
           </div>
           <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col justify-center items-center">
               <span className="text-emerald-600 font-bold text-3xl">{stats.approved}</span>
               <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Approved</span>
           </div>
           <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col justify-center items-center">
               <span className="text-amber-500 font-bold text-3xl">{stats.pending}</span>
               <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Pending</span>
           </div>
           <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col justify-center items-center">
               <span className="text-red-500 font-bold text-3xl">{stats.rejected}</span>
               <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Rejected</span>
           </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
            <Card className="h-72 flex flex-col">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Leave Type Distribution</h4>
                <div className="flex-1 w-full min-h-0">
                    {typeData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie
                                  data={typeData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="value"
                              >
                                  {typeData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                                itemStyle={{fontSize: '12px', fontWeight: 'bold'}}
                              />
                          </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-300 text-xs">No data available</div>
                    )}
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-2 pb-2">
                    {typeData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center text-xs text-slate-600">
                            <div className="w-2 h-2 rounded-full mr-1.5" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                            {entry.name}
                        </div>
                    ))}
                </div>
            </Card>
        </div>

        {activeTab === 'org' && (
            <div className="mt-8">
                <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                  <Users size={16} className="mr-2 text-primary-600" /> 
                  Employee Breakdown
                </h4>
                <div className="space-y-4">
                    {Object.values(stats.byUser).map((u: any) => (
                        <div key={u.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="bg-slate-50/50 p-3 border-b border-slate-100 flex justify-between items-center">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">
                                        {u.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 truncate max-w-[150px] sm:max-w-xs">{u.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Total</span>
                                    <p className="text-sm font-bold text-slate-800">{u.totalDays} Days</p>
                                </div>
                            </div>
                            
                            <div className="p-4">
                                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                                   <div className="bg-sky-50 rounded-lg p-2">
                                      <p className="text-xs text-slate-500 mb-1">Annual</p>
                                      <p className="text-sm font-bold text-sky-700">{u.breakdownDays.annual}d</p>
                                   </div>
                                   <div className="bg-rose-50 rounded-lg p-2">
                                      <p className="text-xs text-slate-500 mb-1">Sick</p>
                                      <p className="text-sm font-bold text-rose-700">{u.breakdownDays.sick}d</p>
                                   </div>
                                   <div className="bg-indigo-50 rounded-lg p-2">
                                      <p className="text-xs text-slate-500 mb-1">Casual</p>
                                      <p className="text-sm font-bold text-indigo-700">{u.breakdownDays.casual}d</p>
                                   </div>
                                </div>
                                
                                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                                   <div className="flex gap-4">
                                      <span className="flex items-center text-emerald-600 font-medium">
                                        <CheckCircle size={12} className="mr-1" /> {u.statusCounts.approved} Approved
                                      </span>
                                      <span className="flex items-center text-red-500 font-medium">
                                        <XCircle size={12} className="mr-1" /> {u.statusCounts.rejected} Rejected
                                      </span>
                                   </div>
                                   {/* <span className="text-slate-400">
                                      {u.count} Requests
                                   </span> */}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );

  const renderRawLog = () => (
    <div className="space-y-3">
       {filteredLeaves.length === 0 ? (
         <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
           <FileText className="w-8 h-8 mx-auto mb-2 opacity-20" />
           No records found.
         </div>
       ) : (
         filteredLeaves.map(leave => {
            const days = Math.ceil(Math.abs(new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
            return (
              <div key={leave.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-2 group hover:border-primary-200 transition-colors">
                <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{leave.userEmail}</p>
                      <div className="flex items-center text-[10px] text-slate-500 mt-1">
                        <Calendar size={10} className="mr-1"/>
                        <span>{formatDate(leave.startDate)} — {formatDate(leave.endDate)}</span>
                        <span className="mx-1.5">•</span>
                        <Clock size={10} className="mr-1"/>
                        <span>{days} days</span>
                      </div>
                    </div>
                    <Badge status={leave.status} />
                </div>
                <div className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg mt-1">
                    <span className="text-slate-600 italic line-clamp-1 break-all mr-2">"{leave.reason}"</span>
                    <span className="font-bold uppercase text-[9px] text-slate-400 tracking-wider shrink-0 bg-white px-1.5 py-0.5 rounded border border-slate-100">{leave.type}</span>
                </div>
              </div>
            );
         })
       )}
    </div>
  );

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-500">
      <div className="flex justify-end gap-2">
         <Button variant="secondary" size="sm" onClick={() => handlePrint(filteredLeaves, activeTab)} className="h-8 text-xs">
            <Printer size={14} className="mr-1.5" /> Print
         </Button>
         <Button variant="secondary" size="sm" onClick={handleDownloadCSV} className="h-8 text-xs">
            <Download size={14} className="mr-1.5" /> CSV
         </Button>
      </div>

      {isAdmin && (
        <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => { setActiveTab('org'); setOrgSubTab('overview'); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center transition-all duration-200 ${
              activeTab === 'org' 
              ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <Users size={14} className="mr-1.5" /> Organization
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center transition-all duration-200 ${
              activeTab === 'my' 
              ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <UserCircle size={14} className="mr-1.5" /> My Statistics
          </button>
        </div>
      )}

      <Filters 
        search={activeTab === 'my' ? '' : search} 
        onSearchChange={setSearch}
        searchPlaceholder={activeTab === 'my' ? undefined : "Search email..."}
        hideSearch={activeTab === 'my'}
        type={typeFilter}
        onTypeChange={setTypeFilter}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
      />

      {activeTab === 'org' && (
         <div className="flex justify-between items-center border-b border-slate-200 pb-1">
            <div className="flex gap-4 text-xs font-semibold text-slate-500">
               <button 
                 onClick={() => setOrgSubTab('overview')}
                 className={`pb-2 border-b-2 transition-colors px-1 ${orgSubTab === 'overview' ? 'text-primary-600 border-primary-600' : 'border-transparent hover:text-slate-800'}`}
               >
                 Overview
               </button>
               <button 
                 onClick={() => setOrgSubTab('raw')}
                 className={`pb-2 border-b-2 transition-colors px-1 ${orgSubTab === 'raw' ? 'text-primary-600 border-primary-600' : 'border-transparent hover:text-slate-800'}`}
               >
                 Log Data
               </button>
            </div>
         </div>
      )}

      <div className="mt-2 min-h-[300px]">
          {activeTab === 'my' ? renderOverview() : (orgSubTab === 'overview' ? renderOverview() : renderRawLog())}
      </div>
    </div>
  );
};