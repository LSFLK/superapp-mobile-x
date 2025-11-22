import { MailOpen } from 'lucide-react';
import { useMemoContext } from '../context/MemoContext';
import { MemoList } from '../components/MemoList';
import { MemoFilters } from '../components/MemoFilters';
import { UI_TEXT } from '../constants';

export const SentPage = () => {
    const {
        sentMemos,
        loadingSent,
        refreshSent,
        archiveMemo, // Using archiveMemo to "delete" sent memos from view
        toggleFavorite,
        favoriteMemoIds,
        filter,
        setFilter,
        clearFilters,
        knownUsers
    } = useMemoContext();

    const filteredMemos = sentMemos.filter(memo => {
        if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            const matchesSubject = memo.subject.toLowerCase().includes(searchLower);
            const matchesMessage = memo.message.toLowerCase().includes(searchLower);
            const matchesTo = memo.to.toLowerCase().includes(searchLower);
            if (!matchesSubject && !matchesMessage && !matchesTo) return false;
        }

        if (filter.startDate) {
            const memoDate = new Date(memo.createdAt).setHours(0, 0, 0, 0);
            const startDate = new Date(filter.startDate).setHours(0, 0, 0, 0);
            if (memoDate < startDate) return false;
        }
        if (filter.endDate) {
            const memoDate = new Date(memo.createdAt).setHours(0, 0, 0, 0);
            const endDate = new Date(filter.endDate).setHours(0, 0, 0, 0);
            if (memoDate > endDate) return false;
        }

        if (filter.isBroadcast && !memo.isBroadcast) return false;

        return true;
    });

    return (
        <div className="space-y-3">
            <MemoFilters
                filter={filter}
                onChange={setFilter}
                onClear={clearFilters}
                knownUsers={knownUsers}
            />
            <MemoList
                memos={filteredMemos}
                type="sent"
                onDelete={(id) => archiveMemo(id, 'sent')}
                onToggleFavorite={toggleFavorite}
                favoriteMemoIds={favoriteMemoIds}
                emptyIcon={<MailOpen className="h-16 w-16 mb-4 stroke-[1.5]" />}
                emptyTitle={UI_TEXT.EMPTY_SENT_TITLE}
                emptySubtitle={UI_TEXT.EMPTY_SENT_SUBTITLE}
                hasMore={false} // Pagination logic needs to be fully moved to context if needed
                loading={loadingSent}
                onLoadMore={refreshSent} // Reusing refresh for load more for now
            />
        </div>
    );
};
