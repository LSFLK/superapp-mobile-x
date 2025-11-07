import { Trash2 } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ReceivedMemo, Memo } from '../types';
import { UI_TEXT } from '../constants';

interface MemoListProps {
  memos: ReceivedMemo[] | Memo[];
  type: 'received' | 'sent';
  onDelete: (id: string) => void;
  emptyIcon: React.ReactNode;
  emptyTitle: string;
  emptySubtitle: string;
  hasMore?: boolean;
  loading?: boolean;
  onLoadMore?: () => void;
}

export const MemoList = ({ 
  memos, 
  type, 
  onDelete, 
  emptyIcon, 
  emptyTitle, 
  emptySubtitle,
  hasMore = false,
  loading = false,
  onLoadMore,
}: MemoListProps) => {
  if (memos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-400">
        {emptyIcon}
        <p className="text-base font-medium text-slate-600">{emptyTitle}</p>
        <p className="text-sm mt-1">{emptySubtitle}</p>
      </div>
    );
  }

  return (
    <>
      {memos.map((memo) => (
        <div
          key={memo.id}
          className="tap-highlight bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-semibold text-slate-900 truncate">
                  {memo.subject}
                </h3>
                {memo.isBroadcast && (
                  <Badge variant="default" className="shrink-0 bg-purple-100 text-purple-700 border-purple-200">
                    Broadcast
                  </Badge>
                )}
              </div>
              
              {type === 'received' ? (
                <p className="text-sm text-slate-500">From: {memo.from}</p>
              ) : (
                <p className="text-sm text-slate-500">
                  To: {memo.isBroadcast ? 'Everyone' : memo.to}
                </p>
              )}
              
              {memo.ttlDays && (
                <p className="text-xs text-slate-400 mt-1">
                  {type === 'received' ? `Expires in ${memo.ttlDays} days` : `TTL: ${memo.ttlDays} days`}
                </p>
              )}
              {type === 'sent' && !memo.ttlDays && (
                <p className="text-xs text-slate-400 mt-1">TTL: Forever</p>
              )}
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              {type === 'sent' && 'status' in memo && (
                <Badge 
                  variant={memo.status === 'delivered' ? 'success' : 'warning'}
                  className="font-medium text-xs"
                >
                  {memo.status}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(memo.id)}
                className="tap-highlight -mr-2 -mt-1 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed mb-3">
            {memo.message}
          </p>
          
          <p className="text-xs text-slate-400">
            {new Date(
              type === 'received' && 'savedAt' in memo ? memo.savedAt : memo.createdAt
            ).toLocaleString()}
          </p>
        </div>
      ))}
      
      {hasMore && onLoadMore && (
        <div className="flex justify-center mt-6">
          <Button
            onClick={onLoadMore}
            disabled={loading}
            className="tap-highlight px-8"
          >
            {loading ? UI_TEXT.BTN_LOADING : UI_TEXT.BTN_LOAD_MORE}
          </Button>
        </div>
      )}
    </>
  );
};
