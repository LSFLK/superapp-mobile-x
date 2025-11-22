import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { bridge } from '../bridge';
import { ReceivedMemo, Memo, MemoFilter } from '../types';
import { useUser } from '../hooks/useUser';
import { useMemos } from '../hooks/useMemos';
import { CONFIG } from '../constants';

interface MemoContextType {
    // User
    userEmail: string;
    knownUsers: string[];

    // Memos
    receivedMemos: ReceivedMemo[];
    sentMemos: Memo[];
    archivedMemos: ReceivedMemo[];
    favoriteMemoIds: Set<string>;

    // Loading States
    loadingReceived: boolean;
    loadingSent: boolean;

    // Actions
    refreshReceived: () => Promise<void>;
    refreshSent: () => Promise<void>;
    sendMemo: (recipients: string[], subject: string, message: string, isBroadcast: boolean, ttlDays?: number) => Promise<void | boolean>;
    toggleFavorite: (id: string) => void;
    archiveMemo: (id: string, type: 'received' | 'sent') => void;
    deleteMemoPermanently: (id: string) => void;

    // Filter
    filter: MemoFilter;
    setFilter: (filter: MemoFilter) => void;
    clearFilters: () => void;
}

const MemoContext = createContext<MemoContextType | undefined>(undefined);

export const useMemoContext = () => {
    const context = useContext(MemoContext);
    if (!context) {
        throw new Error('useMemoContext must be used within a MemoProvider');
    }
    return context;
};

export const MemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { userEmail } = useUser();
    const {
        receivedMemos,
        sentMemos,
        loadingReceived,
        loadingSent,
        loadReceivedMemos,
        loadSentMemos,
        submitMemo,
        deleteReceivedMemo,
        deleteSentMemo
    } = useMemos(userEmail);

    const [knownUsers, setKnownUsers] = useState<string[]>([]);
    const [archivedMemos, setArchivedMemos] = useState<ReceivedMemo[]>([]);
    const [favoriteMemoIds, setFavoriteMemoIds] = useState<Set<string>>(new Set());
    const [archiveLoaded, setArchiveLoaded] = useState(false);
    const [favoritesLoaded, setFavoritesLoaded] = useState(false);

    const [filter, setFilter] = useState<MemoFilter>({
        search: '',
        startDate: '',
        endDate: '',
        isBroadcast: false,
    });

    // Load known users with retry logic
    useEffect(() => {
        const loadUsers = async (retries = 3) => {
            try {
                const users = await bridge.getUsers();
                if (users && users.length > 0) {
                    setKnownUsers(users);
                } else if (retries > 0) {
                    // Retry after a short delay if no users returned
                    setTimeout(() => loadUsers(retries - 1), 1000);
                }
            } catch (error) {
                console.error('Failed to load users:', error);
                if (retries > 0) {
                    // Retry after a short delay on error
                    setTimeout(() => loadUsers(retries - 1), 1000);
                }
            }
        };
        loadUsers();
    }, []);

    // Load initial data
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [favorites, archive] = await Promise.all([
                    bridge.getFavorites(),
                    bridge.getArchive()
                ]);
                setFavoriteMemoIds(new Set(favorites));
                setArchivedMemos(archive);
                setFavoritesLoaded(true);
                setArchiveLoaded(true);
            } catch (error) {
                console.error('Failed to load initial data:', error);
            }
        };
        loadInitialData();
    }, []);

    // Persist favorites
    useEffect(() => {
        if (favoritesLoaded) {
            bridge.saveFavorites(Array.from(favoriteMemoIds));
        }
    }, [favoriteMemoIds, favoritesLoaded]);

    // Persist archive
    useEffect(() => {
        if (archiveLoaded) {
            bridge.saveArchive(archivedMemos);
        }
    }, [archivedMemos, archiveLoaded]);

    // Poll for new memos
    useEffect(() => {
        if (!userEmail) return;
        const interval = setInterval(() => {
            loadReceivedMemos(false);
        }, CONFIG.POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [userEmail, loadReceivedMemos]);

    const toggleFavorite = useCallback((id: string) => {
        setFavoriteMemoIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const archiveMemo = useCallback(async (id: string, type: 'received' | 'sent') => {
        if (type === 'received') {
            const memoToArchive = receivedMemos.find(m => m.id === id);
            if (memoToArchive) {
                setArchivedMemos(prev => [memoToArchive, ...prev]);
                await deleteReceivedMemo(id); // Remove from main list
                await loadReceivedMemos(false); // Refresh list
            }
        } else {
            const sentMemo = sentMemos.find(m => m.id === id);
            if (sentMemo) {
                // Adapt sent memo to archived format (add savedAt)
                const archivedSent: ReceivedMemo = {
                    ...sentMemo,
                    savedAt: new Date().toISOString()
                };
                setArchivedMemos(prev => [archivedSent, ...prev]);
                // For sent memos, we just remove them from the view locally if needed, 
                // but since we don't have a way to "delete" them from backend permanently for sender only (usually),
                // we might just leave it or use deleteSentMemo if that's the intention.
                // Assuming we want to remove it from the "Sent" list:
                // await deleteSentMemo(id); 
                // Actually, let's just keep it in archive and NOT delete from sent, 
                // OR delete from sent if that's the desired behavior.
                // The original App.tsx called handleArchiveMemo which called bridge.deleteMemo(id).
                // bridge.deleteMemo deletes from local storage (received).
                // It seems original app mixed up sent/received archiving or only supported received.
                // Let's assume for now we only archive received, but if called for sent, we just do nothing or delete?
                // Let's use deleteSentMemo to be consistent with "removing from list".
                await deleteSentMemo(id);
            }
        }
    }, [receivedMemos, sentMemos, deleteReceivedMemo, deleteSentMemo, loadReceivedMemos]);

    const deleteMemoPermanently = useCallback((id: string) => {
        setArchivedMemos(prev => prev.filter(m => m.id !== id));
    }, []);

    const clearFilters = useCallback(() => {
        setFilter({
            search: '',
            startDate: '',
            endDate: '',
            isBroadcast: false,
        });
    }, []);

    const value = {
        userEmail,
        knownUsers,
        receivedMemos,
        sentMemos,
        archivedMemos,
        favoriteMemoIds,
        loadingReceived,
        loadingSent,
        refreshReceived: async () => loadReceivedMemos(false),
        refreshSent: async () => loadSentMemos(false),
        sendMemo: submitMemo,
        toggleFavorite,
        archiveMemo,
        deleteMemoPermanently,
        filter,
        setFilter,
        clearFilters,
    };

    return (
        <MemoContext.Provider value={value}>
            {children}
        </MemoContext.Provider>
    );
};
