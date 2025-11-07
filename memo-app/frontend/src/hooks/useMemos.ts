import { useState, useCallback } from 'react';
import { bridge } from '../bridge';
import { getSentMemos, getReceivedMemos, deleteMemo as deleteServerMemo, updateMemoStatus, sendMemo } from '../api';
import { Memo, ReceivedMemo } from '../types';
import { UI_TEXT, CONFIG } from '../constants';

/**
 * Custom hook for managing memos (sent and received)
 */
export const useMemos = (userEmail: string) => {
  const [sentMemos, setSentMemos] = useState<Memo[]>([]);
  const [receivedMemos, setReceivedMemos] = useState<ReceivedMemo[]>([]);
  const [sentOffset, setSentOffset] = useState(0);
  const [receivedOffset, setReceivedOffset] = useState(0);
  const [hasMoreSent, setHasMoreSent] = useState(true);
  const [hasMoreReceived, setHasMoreReceived] = useState(true);
  const [loadingSent, setLoadingSent] = useState(false);
  const [loadingReceived, setLoadingReceived] = useState(false);


  const loadSentMemos = useCallback(async (append: boolean = false) => {
    if (!userEmail || loadingSent) return;
    
    setLoadingSent(true);
    try {
      const offset = append ? sentOffset : 0;
      const memos = await getSentMemos(CONFIG.PAGE_SIZE, offset);
      
      if (append) {
        setSentMemos(prev => [...prev, ...memos]);
      } else {
        setSentMemos(memos);
      }
      
      setHasMoreSent(memos.length === CONFIG.PAGE_SIZE);
      setSentOffset(offset + memos.length);
    } catch (error) {
      console.error('Failed to load sent memos:', error);
    } finally {
      setLoadingSent(false);
    }
  }, [userEmail, loadingSent, sentOffset]);

  const loadReceivedMemos = useCallback(async (append: boolean = false) => {
    if (loadingReceived) return;
    
    setLoadingReceived(true);
    try {
      const offset = append ? receivedOffset : 0;
      // Fetch from server
      const serverMemos = await getReceivedMemos(CONFIG.PAGE_SIZE, offset);
      
      // Get currently saved memos
      const savedMemos = await bridge.getSavedMemos();
      const savedMemoIds = new Set(savedMemos.map(m => m.id));
      
      // Find new memos that aren't saved yet
      const newMemos = serverMemos.filter(memo => !savedMemoIds.has(memo.id));
      
      // Save new memos to local storage and update their status
      for (const memo of newMemos) {
        const receivedMemo: ReceivedMemo = {
          id: memo.id,
          from: memo.from,
          to: memo.to,
          subject: memo.subject,
          message: memo.message,
          isBroadcast: memo.isBroadcast,
          ttlDays: memo.ttlDays,
          createdAt: memo.createdAt,
          savedAt: new Date().toISOString(),
        };
        await bridge.saveMemo(receivedMemo);
        
        // Update status to delivered for direct messages (not broadcasts)
        if (!memo.isBroadcast) {
          await updateMemoStatus(memo.id, 'delivered');
        }
      }
      
      // Load all saved memos and display
      const allMemos = await bridge.getSavedMemos();
      setReceivedMemos(allMemos);
      
      setHasMoreReceived(serverMemos.length === CONFIG.PAGE_SIZE);
      setReceivedOffset(append ? offset + serverMemos.length : serverMemos.length);
    } catch (error) {
      console.error('Failed to load received memos:', error);
      await bridge.showAlert(UI_TEXT.ALERT_ERROR, UI_TEXT.ALERT_LOAD_FAILED);
    } finally {
      setLoadingReceived(false);
    }
  }, [loadingReceived, receivedOffset]);

  const deleteSentMemo = async (id: string) => {
    try {
      await deleteServerMemo(id);
      setSentMemos(sentMemos.filter(m => m.id !== id));
    } catch (error) {
      await bridge.showAlert(UI_TEXT.ALERT_ERROR, UI_TEXT.ALERT_DELETE_FAILED);
      throw error;
    }
  };

  const deleteReceivedMemo = async (id: string) => {
    try {
      await bridge.deleteMemo(id);
      setReceivedMemos(receivedMemos.filter(m => m.id !== id));
    } catch (error) {
      await bridge.showAlert(UI_TEXT.ALERT_ERROR, UI_TEXT.ALERT_DELETE_FAILED);
      throw error;
    }
  };

  const submitMemo = useCallback(async (
    to: string,
    subject: string,
    message: string,
    isBroadcast: boolean,
    ttlDays?: number
  ) => {
    try {
      await sendMemo(to, subject, message, isBroadcast, ttlDays);
      await bridge.showAlert(UI_TEXT.ALERT_SUCCESS, UI_TEXT.ALERT_MEMO_SENT);
      // Reload sent memos to show the new one
      await loadSentMemos();
      return true;
    } catch (error) {
      await bridge.showAlert(UI_TEXT.ALERT_ERROR, UI_TEXT.ALERT_SEND_FAILED);
      return false;
    }
  }, [loadSentMemos]);

  return {
    sentMemos,
    receivedMemos,
    loadSentMemos,
    loadReceivedMemos,
    deleteSentMemo,
    deleteReceivedMemo,
    submitMemo,
    hasMoreSent,
    hasMoreReceived,
    loadingSent,
    loadingReceived,
  };
};
