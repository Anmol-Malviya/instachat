import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { createReport } from '@/lib/api';

const REPORT_REASONS = [
  "Spam or misleading",
  "Harassment or bullying",
  "Hate speech or graphic content",
  "Inappropriate content",
  "Other"
];

export default function ReportModal({ isOpen, onClose, targetId, targetType = 'message' }) {
  const { user } = useAuth();
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await createReport({
        reporterId: user.uid,
        [targetType === 'message' ? 'messageId' : 'reportedUserId']: targetId,
        reason,
        description
      });
      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      console.error(err);
      alert('Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm bg-[#1a1a1e] rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Report {targetType === 'message' ? 'Message' : 'User'}</h2>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {success ? (
            <div className="text-center py-6 text-green-500">
              <p className="font-bold">Report submitted successfully.</p>
              <p className="text-sm text-zinc-400 mt-2">Thank you for keeping InstaChat safe.</p>
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs text-zinc-400 font-medium mb-2 block">Reason</label>
                <select 
                  value={reason} 
                  onChange={e => setReason(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-white/30 text-white"
                >
                  {REPORT_REASONS.map(r => <option key={r} value={r} className="bg-[#1a1a1e] text-white">{r}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-medium mb-2 block">Additional details (optional)</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Provide more context..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-white/30 text-white min-h-[100px] resize-none"
                />
              </div>
            </>
          )}
        </div>

        {!success && (
          <div className="p-4 border-t border-white/5 flex justify-end gap-2">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-zinc-400 hover:text-white text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-colors shadow-lg shadow-red-500/20"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
