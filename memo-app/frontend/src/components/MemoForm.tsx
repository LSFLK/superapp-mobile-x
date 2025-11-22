import { useState } from 'react';
import { Send, Loader2, ChevronDown, ChevronUp, User, Users, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { cn } from '../lib/utils';
import { bridge } from '../bridge';
import { UI_TEXT } from '../constants';
import { AutocompleteInput } from './AutocompleteInput';

interface MemoFormProps {
  onSuccess: () => void;
  onSubmit: (to: string, subject: string, message: string, isBroadcast: boolean, ttlDays?: number) => Promise<void | boolean>;
  knownUsers?: string[];
}

export const MemoForm = ({ onSuccess, onSubmit, knownUsers = [] }: MemoFormProps) => {
  console.log('[MemoForm] knownUsers:', knownUsers);
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isBroadcast, setIsBroadcast] = useState(false);
  const [ttlDays, setTtlDays] = useState<number>(30);
  const [ttlForever, setTtlForever] = useState(true); // Default to forever
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if ((!to && !isBroadcast) || !subject || !message) return;

    setLoading(true);
    try {
      // If ttlForever is checked, send undefined (no TTL)
      // Otherwise, use ttlDays
      const ttl = ttlForever ? undefined : ttlDays;
      await onSubmit(to, subject, message, isBroadcast, ttl);

      // Reset form
      setTo('');
      setSubject('');
      setMessage('');
      setIsBroadcast(false);
      setTtlDays(30);
      setTtlForever(true); // Reset to forever default

      // Show success alert via bridge if available, or just rely on onSuccess
      // bridge.showAlert(UI_TEXT.ALERT_SUCCESS, 'Memo sent successfully');

      onSuccess();
    } catch (error) {
      console.error('Failed to send memo:', error);
      await bridge.showAlert(UI_TEXT.ALERT_ERROR, 'Failed to send memo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24">
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
        {/* Recipient */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">To</label>
          <div className="relative">
            <AutocompleteInput
              value={to}
              onChange={setTo}
              suggestions={knownUsers}
              placeholder="Enter recipient email"
              disabled={isBroadcast}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              icon={<User className="w-5 h-5" />}
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                const newState = !isBroadcast;
                setIsBroadcast(newState);
                if (newState) setTo('All Users');
                else setTo('');
              }}
              className={cn(
                "text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors border",
                isBroadcast
                  ? "bg-primary-50 text-primary-700 border-primary-200"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              )}
            >
              {isBroadcast ? <Check className="w-3 h-3" /> : <Users className="w-3 h-3" />}
              Broadcast to all
            </button>
          </div>
        </div>

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
                        setTtlDays(undefined as any);
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
                    onChange={e => setTtlDays(e.target.value ? parseInt(e.target.value) : 30)}
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
    </form >
  );
};
