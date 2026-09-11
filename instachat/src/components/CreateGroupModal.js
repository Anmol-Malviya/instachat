import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { batchUsers, createGroup } from '@/lib/api';

export default function CreateGroupModal({ isOpen, onClose, connections }) {
  const { user } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleToggleMember = (uid) => {
    setSelectedMembers(prev => 
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedMembers.length === 0) return;
    setLoading(true);
    try {
      await createGroup({
        name: groupName,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(groupName)}&background=random`,
        memberIds: [...selectedMembers, user.uid],
        createdBy: user.uid
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const filteredConnections = connections.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-[#0c0c0e] rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Create Group</h2>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="text-xs text-zinc-400 font-medium mb-1 block">Group Name</label>
            <input 
              type="text" 
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-white/30 text-white"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 font-medium mb-2 block">Add Members</label>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input 
                type="text" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search connections..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:border-white/30 text-white"
              />
            </div>
            
            <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar pr-2">
              {filteredConnections.map(c => {
                const isSelected = selectedMembers.includes(c.uid);
                return (
                  <button 
                    key={c.uid}
                    onClick={() => handleToggleMember(c.uid)}
                    className="flex w-full items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img src={c.photoURL} alt="" className="w-8 h-8 rounded-full object-cover" />
                      <span className="text-sm text-zinc-200">{c.name}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'bg-white border-white text-black' : 'border-zinc-500'}`}>
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </button>
                )
              })}
              {filteredConnections.length === 0 && (
                <p className="text-center text-xs text-zinc-500 py-4">No connections found</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/5 flex justify-end">
          <button 
            onClick={handleCreate}
            disabled={!groupName.trim() || selectedMembers.length === 0 || loading}
            className="px-6 py-2 bg-white text-black text-sm font-bold rounded-xl disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
