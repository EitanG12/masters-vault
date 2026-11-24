import React, { useState } from 'react';
import { FolderPlus, Trash2, Check, X } from 'lucide-react';

export function CampaignSwitcher({
  campaigns,
  activeCampaignId,
  onSelectCampaign,
  onCreateCampaign,
  onDeleteCampaign,
}) {
  const [newName, setNewName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  function handleCreateSubmit(e) {
    e.preventDefault();
    onCreateCampaign(newName);
    setNewName('');
    setIsCreating(false);
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-2.5" dir="rtl">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400">קמפיינים</span>
        <button
          type="button"
          onClick={() => {
            setIsCreating((prev) => !prev);
            setConfirmDeleteId(null);
          }}
          className="inline-flex items-center gap-1 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span>קמפיין חדש</span>
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateSubmit} className="flex items-center gap-1.5">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="שם הקמפיין החדש..."
            className="flex-1 min-w-0 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            autoFocus
          />
          <button
            type="submit"
            title="צור קמפיין נקי"
            className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsCreating(false);
              setNewName('');
            }}
            title="ביטול"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      <div className="space-y-1 max-h-44 overflow-y-auto pr-0.5">
        {campaigns.map((campaign) => {
          const isActive = campaign.id === activeCampaignId;
          const isConfirmingDelete = confirmDeleteId === campaign.id;

          return (
            <div
              key={campaign.id}
              className={`group flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                isActive
                  ? 'bg-amber-500/15 border border-amber-500/40 text-amber-200 font-medium'
                  : 'bg-slate-950/50 border border-transparent text-slate-300 hover:bg-slate-800/70'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  onSelectCampaign(campaign.id);
                  setConfirmDeleteId(null);
                }}
                className="flex-1 text-right truncate"
                title={campaign.name}
              >
                {campaign.name}
              </button>

              {!isConfirmingDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(campaign.id)}
                  title={`מחק את ${campaign.name}`}
                  className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteCampaign(campaign.id);
                      setConfirmDeleteId(null);
                    }}
                    title="אשר מחיקה"
                    className="px-1.5 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold"
                  >
                    מחק
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(null)}
                    title="בטל מחיקה"
                    className="p-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}