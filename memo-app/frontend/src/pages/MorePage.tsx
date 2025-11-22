import { MailOpen, Edit3, Archive, Users } from 'lucide-react';
import { TABS, TabType } from '../constants';

interface MorePageProps {
    onNavigate: (tab: TabType) => void;
}

export const MorePage = ({ onNavigate }: MorePageProps) => {
    return (
        <div className="space-y-4 pb-24">
            <div className="space-y-2">
                <button
                    onClick={() => onNavigate(TABS.SENT)}
                    className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors active:scale-[0.98]"
                >
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                        <MailOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 text-left">
                        <h3 className="font-semibold text-slate-900">Sent</h3>
                        <p className="text-sm text-slate-500">View sent messages</p>
                    </div>
                </button>

                <button
                    onClick={() => onNavigate(TABS.SEND)}
                    className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors active:scale-[0.98]"
                >
                    <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
                        <Edit3 className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1 text-left">
                        <h3 className="font-semibold text-slate-900">Send Memo</h3>
                        <p className="text-sm text-slate-500">Compose a new message</p>
                    </div>
                </button>

                <button
                    onClick={() => onNavigate(TABS.ARCHIVE)}
                    className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors active:scale-[0.98]"
                >
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center">
                        <Archive className="w-6 h-6 text-slate-600" />
                    </div>
                    <div className="flex-1 text-left">
                        <h3 className="font-semibold text-slate-900">Archive</h3>
                        <p className="text-sm text-slate-500">View archived messages</p>
                    </div>
                </button>

                <button
                    onClick={() => onNavigate(TABS.GROUPS)}
                    className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors active:scale-[0.98]"
                >
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center">
                        <Users className="w-6 h-6 text-slate-600" />
                    </div>
                    <div className="flex-1 text-left">
                        <h3 className="font-semibold text-slate-900">Manage Groups</h3>
                        <p className="text-sm text-slate-500">Create and edit recipient groups</p>
                    </div>
                </button>
            </div>
        </div>
    );
};
