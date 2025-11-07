// UI Text Constants
export const UI_TEXT = {
  APP_TITLE: 'MemoX',
  VERSION: '1.0.0',
  LOADING: 'Loading...',
  
  // Tab labels
  TAB_RECEIVED: 'Received',
  TAB_SENT: 'Sent',
  TAB_COMPOSE: 'Compose',
  
  // Buttons
  BTN_REFRESH: 'Refresh',
  BTN_SEND_MESSAGE: 'Send Message',
  BTN_BROADCAST_MESSAGE: 'Broadcast Message',
  BTN_SENDING: 'Sending...',
  BTN_LOAD_MORE: 'Load More',
  BTN_LOADING: 'Loading...',
  
  // Empty states
  EMPTY_RECEIVED_TITLE: 'No messages yet',
  EMPTY_RECEIVED_SUBTITLE: 'Messages sent to you will appear here',
  EMPTY_SENT_TITLE: 'No sent messages',
  EMPTY_SENT_SUBTITLE: 'Messages you send will appear here',
  
  // Form labels
  LABEL_RECIPIENT_TYPE: 'Recipient Type',
  LABEL_DIRECT_MESSAGE: 'Direct Message',
  LABEL_BROADCAST_ALL: 'Broadcast to All',
  LABEL_TO: 'To',
  LABEL_SUBJECT: 'Subject',
  LABEL_MESSAGE: 'Message',
  LABEL_TTL: 'Time to Live (TTL)',
  LABEL_KEEP_FOREVER: 'Keep forever',
  LABEL_DAYS: 'days',
  
  // Placeholders
  PLACEHOLDER_EMAIL: 'recipient@example.com',
  PLACEHOLDER_SUBJECT: "What's this about?",
  PLACEHOLDER_MESSAGE: 'Write your message...',
  PLACEHOLDER_TTL: '7',
  
  // Alerts
  ALERT_SUCCESS: 'Success',
  ALERT_ERROR: 'Error',
  ALERT_MEMO_SENT: 'Memo sent successfully!',
  ALERT_SEND_FAILED: 'Failed to send memo. Please try again.',
  ALERT_DELETE_FAILED: 'Failed to delete memo',
  ALERT_LOAD_FAILED: 'Failed to load received memos',
  ALERT_ENTER_RECIPIENT: 'Please enter a recipient email',
  
  // Helper text
  HINT_TTL_DEFAULT: '(default: 1 day if empty)',
} as const;

// Configuration Constants
export const CONFIG = {
  POLL_INTERVAL_MS: 10000, // 10 seconds
  DEFAULT_TTL_DAYS: 1,
  PAGE_SIZE: 10, // Number of memos per page
} as const;

// Tab Types
export type TabType = 'send' | 'sent' | 'received';
export const TABS = {
  SEND: 'send' as TabType,
  SENT: 'sent' as TabType,
  RECEIVED: 'received' as TabType,
} as const;
