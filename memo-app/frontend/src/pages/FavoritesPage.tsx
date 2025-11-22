import { Star } from 'lucide-react';
import { useMemoContext } from '../context/MemoContext';
import { MemoList } from '../components/MemoList';
import { MemoFilters } from '../components/MemoFilters';
import { UI_TEXT } from '../constants';

export const FavoritesPage = () => {
    const {
        receivedMemos,
        sentMemos,
        favoriteMemoIds,
        toggleFavorite,
        archiveMemo,
        filter,
        setFilter,
        clearFilters,
        knownUsers
    } = useMemoContext();

    // Combine and filter favorites
    const allMemos = [...receivedMemos, ...sentMemos];
    const favoriteMemos = allMemos.filter(m => favoriteMemoIds.has(m.id));

    const filteredMemos = favoriteMemos.filter(memo => {
        if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            const matchesSubject = memo.subject.toLowerCase().includes(searchLower);
            const matchesMessage = memo.message.toLowerCase().includes(searchLower);
            const matchesFrom = 'from' in memo ? memo.from.toLowerCase().includes(searchLower) : false;
            const matchesTo = 'to' in memo ? memo.to.toLowerCase().includes(searchLower) : false;
            if (!matchesSubject && !matchesMessage && !matchesFrom && !matchesTo) return false;
        }

        // Date filtering
        if (filter.startDate) {
            const memoDate = 'savedAt' in memo
                ? new Date(memo.savedAt).setHours(0, 0, 0, 0)
                : new Date(memo.createdAt).setHours(0, 0, 0, 0);
            const startDate = new Date(filter.startDate).setHours(0, 0, 0, 0);
            if (memoDate < startDate) return false;
        }
        if (filter.endDate) {
            const memoDate = 'savedAt' in memo
                ? new Date(memo.savedAt).setHours(0, 0, 0, 0)
                : new Date(memo.createdAt).setHours(0, 0, 0, 0);
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
                type="received" // Using 'received' style generally, but might need mixed handling
                onDelete={(id) => {
                    const isReceived = receivedMemos.some(m => m.id === id);
                    archiveMemo(id, isReceived ? 'received' : 'sent');
                }}
                onToggleFavorite={toggleFavorite}
                favoriteMemoIds={favoriteMemoIds}
                emptyIcon={<Star className="h-16 w-16 mb-4 stroke-[1.5] text-amber-400" />}
                emptyTitle={UI_TEXT.EMPTY_FAVORITES_TITLE}
                emptySubtitle={UI_TEXT.EMPTY_FAVORITES_SUBTITLE}
                hasMore={false}
                loading={false}
            />
        </div>
    );
};
