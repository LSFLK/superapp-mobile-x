
import React, { useState, useMemo } from 'react';
import { UserInfo } from '../types';
import { Button, Input } from '../components/UI';
import { UserCircle, Settings } from 'lucide-react';

interface AdminProps {
  users: UserInfo[];
  currentUser: UserInfo;
  updateUserRole: (userId: string, role: 'admin' | 'user') => Promise<void>;
  openLimitModal: () => void;
}

export const Admin: React.FC<AdminProps> = ({ users, currentUser, updateUserRole, openLimitModal }) => {
  const [search, setSearch] = useState('');

  const filteredUsers = useMemo(() => {
    return users.filter(user => user.email.toLowerCase().includes(search.toLowerCase()));
  }, [users, search]);

  return (
    <div className="space-y-4">
      <Button size="lg" variant="danger" onClick={openLimitModal} className="w-full">
          <Settings size={14} className="mr-1.5" />
          Change Allowances Limits
      </Button>
      <h2 className="text-lg text-slate-800 pt-5">Change User Roles</h2>
      <Input 
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50/50 p-3 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 truncate max-w-[150px] sm:max-w-xs">{user.email}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Role</span>
                <p className="text-sm font-bold text-slate-800">{user.role}</p>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-end">
                <Button
                  size="sm"
                  variant={user.role === 'admin' ? 'danger' : 'secondary'}
                  onClick={() => updateUserRole(user.id, user.role === 'admin' ? 'user' : 'admin')}
                  disabled={user.id === currentUser.id}
                  className="h-6 px-2 text-[10px]"
                >
                  {user.role === 'admin' ? 'Revoke Admin' : 'Grant Admin'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
