import { useState } from 'react';
import { Send, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { cn } from '../lib/utils';
import { bridge } from '../bridge';
import { UI_TEXT, CONFIG } from '../constants';

interface MemoFormProps {
  onSuccess: () => void;
  onSubmit: (to: string, subject: string, message: string, isBroadcast: boolean, ttlDays?: number) => Promise<boolean>;
}

export const MemoForm = ({ onSuccess, onSubmit }: MemoFormProps) => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isBroadcast, setIsBroadcast] = useState(false);
  const [ttlDays, setTtlDays] = useState<number | undefined>(undefined);
  const [ttlForever, setTtlForever] = useState(true); // Default to forever
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isBroadcast && !to) {
      await bridge.showAlert(UI_TEXT.ALERT_ERROR, UI_TEXT.ALERT_ENTER_RECIPIENT);
      return;
    }
    if (!subject || !message) return;

    setLoading(true);
    try {
      // If ttlForever is checked, send undefined (no TTL)
      // Otherwise, use ttlDays if set, or default to CONFIG value
      const ttl = ttlForever ? undefined : (ttlDays || CONFIG.DEFAULT_TTL_DAYS);
      const success = await onSubmit(to, subject, message, isBroadcast, ttl);

      if (success) {
        // Reset form
        setTo('');
        setSubject('');
        setMessage('');
        setIsBroadcast(false);
        setTtlDays(undefined);
        setTtlForever(true); // Reset to forever default

        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-24">
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
        {/* Recipient Type Selector */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">
            {UI_TEXT.LABEL_RECIPIENT_TYPE}
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsBroadcast(false)}
              className={cn(
                "flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium transition-all",
                !isBroadcast
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              )}
            >
              {UI_TEXT.LABEL_DIRECT_MESSAGE}
            </button>
            <button
              type="button"
              onClick={() => setIsBroadcast(true)}
              className={cn(
                "flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium transition-all",
                isBroadcast
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              )}
            >
              {UI_TEXT.LABEL_BROADCAST_ALL}
            </button>
          </div>
        </div>

        {/* To field - only show if not broadcast */}
        {!isBroadcast && (
          <div className="space-y-2">
            <label htmlFor="to" className="text-sm font-semibold text-slate-700">
              {UI_TEXT.LABEL_TO}
            </label>
            <Input
              id="to"
              placeholder={UI_TEXT.PLACEHOLDER_EMAIL}
              value={to}
              onChange={e => setTo(e.target.value)}
              required={!isBroadcast}
              className="tap-highlight"
            />
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="subject" className="text-sm font-semibold text-slate-700">
            Subject
          </label>
          <Input
            id="subject"
            placeholder="What's this about?"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            required
            className="tap-highlight"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-semibold text-slate-700">
            Message
          </label>
          <Textarea
            id="message"
            placeholder="Write your message..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
            rows={8}
            className="tap-highlight resize-none"
          />
        </div>

        {/* Advanced Settings - Collapsible */}
        <div className="border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
          >
            <span>Advanced Settings</span>
            {showAdvanced ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-3 pl-2">
              <label className="text-sm font-medium text-slate-600">
                Time to Live (TTL)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ttlForever}
                    onChange={e => {
                      setTtlForever(e.target.checked);
                      if (e.target.checked) {
                        setTtlDays(undefined);
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-slate-600">Keep forever</span>
                </label>
              </div>
              {!ttlForever && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    placeholder="7"
                    value={ttlDays || ''}
                    onChange={e => setTtlDays(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="tap-highlight w-24"
                  />
                  <span className="text-sm text-slate-600">days</span>
                  <span className="text-xs text-slate-400 ml-2">(leave empty for default)</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Button
        type="submit"
        className="tap-highlight w-full"
        size="lg"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Sending...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            {isBroadcast ? 'Broadcast Message' : 'Send Message'}
          </span>
        )}
      </Button>
    </form>
  );
};
