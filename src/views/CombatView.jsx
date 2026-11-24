import React, { useState, useEffect } from 'react';
import { SkipForward, UserPlus, Users, Trash2, Heart, Shield, RotateCcw } from 'lucide-react';
import { useCampaignContext } from '../hooks/useCampaigns';
import { EffectManager } from '../components/EffectManager';

const DEFAULT_FORM = { name: '', role: '', side: 'enemy', hp: 15, maxHp: 15, ac: 13, initiative: 1 };

export function CombatView() {
  const { combatants, setCombatants, party, activeCampaign } = useCampaignContext();
  const campaignName = activeCampaign.name;
  const [form, setForm] = useState(DEFAULT_FORM);
  const [activeTurnIndex, setActiveTurnIndex] = useState(0);

  const sortedCombatants = [...combatants].sort((a, b) => (Number(b.initiative) || 0) - (Number(a.initiative) || 0));

  useEffect(() => {
    if (sortedCombatants.length === 0 || activeTurnIndex >= sortedCombatants.length) setActiveTurnIndex(0);
  }, [sortedCombatants.length, activeTurnIndex]);

  function handleAdd(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const maxHp = Math.max(1, Number(form.maxHp) || 1);
    setCombatants((prev) => [...prev, {
      id: `comb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: form.name.trim(), role: form.role.trim() || (form.side === 'ally' ? 'בן ברית' : 'יריב'),
      side: form.side, hp: Math.max(0, Math.min(maxHp, Number(form.hp) || maxHp)), maxHp,
      ac: Number(form.ac) || 10, initiative: Number(form.initiative) || 0,
      effects: [],
    }]);
    setForm(DEFAULT_FORM);
  }

  function handleImportParty() {
    if (!Array.isArray(party)) return;
    const existing = new Set(combatants.map((c) => c.name));
    const additions = party.filter((p) => !existing.has(p.name)).map((p, i) => ({
      id: `comb-party-${p.id}-${Date.now()}-${i}`,
      name: p.name, role: p.role || 'דמות שחקן', side: 'ally',
      hp: p.hp ?? 10, maxHp: p.maxHp ?? 10, ac: p.ac ?? 10, initiative: p.initiative ?? 0,
      effects: Array.isArray(p.effects) ? p.effects : [],
    }));
    if (additions.length) setCombatants((prev) => [...prev, ...additions]);
  }

  function adjustHp(id, delta) {
    setCombatants((prev) => prev.map((item) => item.id !== id ? item : { ...item, hp: Math.max(0, Math.min(item.maxHp, item.hp + delta)) }));
  }

  function setCombatantEffects(id, effects) {
    setCombatants((prev) => prev.map((item) => (
      item.id === id ? { ...item, effects } : item
    )));
  }

  function advanceTurn() {
    if (sortedCombatants.length === 0) return;
    const nextIndex = (activeTurnIndex + 1) % sortedCombatants.length;
    const nextCombatant = sortedCombatants[nextIndex];
    if (nextCombatant.effects?.some((effect) => effect.duration === 'until-next-turn')) {
      setCombatantEffects(
        nextCombatant.id,
        nextCombatant.effects.filter((effect) => effect.duration !== 'until-next-turn')
      );
    }
    setActiveTurnIndex(nextIndex);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div><h2 className="text-2xl font-bold text-white">מנהל קרב</h2><p className="text-sm text-slate-400 mt-0.5">ניהול יזמה לקמפיין <span className="text-amber-300 font-medium">{campaignName}</span>.</p></div>
        <div className="flex flex-wrap items-center gap-2">
          {party.length > 0 && <button onClick={handleImportParty} className="flex items-center gap-1.5 px-3 py-2 bg-sky-500/15 text-sky-300 rounded-xl text-xs font-semibold"><Users className="w-4 h-4"/>הכנס את החבורה</button>}
          <button onClick={advanceTurn} className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold"><SkipForward className="w-4 h-4"/>תור הבא</button>
          {combatants.length > 0 && <button onClick={() => { setCombatants([]); setActiveTurnIndex(0); }} className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"><RotateCcw className="w-3.5 h-3.5"/>סיים קרב</button>}
        </div>
      </div>

      <form onSubmit={handleAdd} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-7 gap-2.5 items-end">
        <div className="sm:col-span-2"><label className="block text-[11px] text-slate-400 mb-1">שם</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-white" /></div>
        <div><label className="block text-[11px] text-slate-400 mb-1">צד</label><select value={form.side} onChange={(e) => setForm({ ...form, side: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-sm text-white"><option value="enemy">יריב</option><option value="ally">בן ברית</option></select></div>
        <div><label className="block text-[11px] text-slate-400 mb-1">נק&quot;פ</label><input type="number" value={form.maxHp} onChange={(e) => setForm({ ...form, maxHp: e.target.value, hp: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-sm text-white" /></div>
        <div><label className="block text-[11px] text-slate-400 mb-1">דרג&quot;ש</label><input type="number" value={form.ac} onChange={(e) => setForm({ ...form, ac: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-sm text-white" /></div>
        <div><label className="block text-[11px] text-slate-400 mb-1">יוזמה</label><input type="number" value={form.initiative} onChange={(e) => setForm({ ...form, initiative: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-sm text-white" /></div>
        <button type="submit" className="bg-amber-500 text-slate-950 font-semibold px-3 py-1.5 rounded-xl"><UserPlus className="w-4 h-4 mx-auto"/></button>
      </form>

      <div className="space-y-2.5">
        {sortedCombatants.map((item, idx) => {
          const isCurrentTurn = idx === activeTurnIndex;
          return (
            <div key={item.id} className={`rounded-2xl p-4 border flex flex-col md:flex-row justify-between gap-4 ${isCurrentTurn ? 'bg-amber-500/10 border-amber-500/60 shadow-lg' : 'bg-slate-900/80 border-slate-800'}`}>
              <div className="flex gap-3">
                <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center border font-bold ${isCurrentTurn ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-950 text-amber-400 border-slate-800'}`}><span className="text-[10px] opacity-80">יוזמה</span><span className="text-sm">{item.initiative}</span></div>
                <div>
                  <div className="flex items-center gap-2"><h3 className="text-base font-bold text-white">{item.name}</h3><span className={`text-[11px] px-2 py-0.5 rounded-full ${item.side === 'ally' ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30' : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'}`}>{item.side === 'ally' ? 'בן ברית' : 'יריב'}</span>{isCurrentTurn && <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold">תור פעיל</span>}</div>
                  <p className="text-xs text-slate-400">{item.role}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5"><Shield className="w-3.5 h-3.5 text-sky-400" /><span className="text-sm font-bold text-white">{item.ac}</span></div>
                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1">
                  <Heart className="w-3.5 h-3.5 text-rose-400" /><span className="text-sm font-bold text-white min-w-[3.2rem] text-center">{item.hp}/{item.maxHp}</span>
                  {[-5, -1, 1, 5].map(d => <button key={d} onClick={() => adjustHp(item.id, d)} className="px-1.5 py-0.5 bg-slate-800 rounded text-[11px]">{d > 0 ? `+${d}` : d}</button>)}
                </div>
                <button onClick={() => setCombatants(prev => prev.filter(i => i.id !== item.id))} className="p-2 text-slate-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="w-full md:w-auto">
                <EffectManager
                  effects={item.effects || []}
                  onChange={(effects) => setCombatantEffects(item.id, effects)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}