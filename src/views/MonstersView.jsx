import React, { useMemo, useState } from 'react';
import { Trash2, Swords, Search, BookOpen, Plus } from 'lucide-react';
import { useCampaignContext } from '../hooks/useCampaigns';
import { BESTIARY } from '../data/bestiaryData';

const DEFAULT_MONSTER_FORM = { name: '', type: '', hp: 15, maxHp: 15, ac: 13, initiative: 1, lore: '', actions: '', cr: '' };

function monsterFromEntry(entry) {
  return {
    id: `mon-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: entry.name,
    type: entry.type,
    hp: entry.hp,
    maxHp: entry.maxHp,
    ac: entry.ac,
    initiative: entry.initiative,
    lore: entry.lore,
    actions: entry.actions,
    cr: entry.cr || '',
  };
}

function formFromEntry(entry) {
  return {
    name: entry.name,
    type: entry.type,
    hp: entry.hp,
    maxHp: entry.maxHp,
    ac: entry.ac,
    initiative: entry.initiative,
    lore: entry.lore,
    actions: entry.actions,
    cr: entry.cr || '',
  };
}

export function MonstersView() {
  const { monsters, setMonsters, setCombatants, activeCampaign } = useCampaignContext();
  const campaignName = activeCampaign.name;
  const [form, setForm] = useState(DEFAULT_MONSTER_FORM);
  const [query, setQuery] = useState('');

  const matches = useMemo(() => {
    const q = query.trim();
    if (!q) return BESTIARY;
    return BESTIARY.filter((entry) =>
      entry.name.includes(q) || entry.type.includes(q) || entry.lore.includes(q) || entry.actions.includes(q)
    );
  }, [query]);

  function handleAddMonster(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const maxHp = Math.max(1, Number(form.maxHp) || 1);
    setMonsters((prev) => [...prev, {
      id: `mon-${Date.now()}`,
      name: form.name.trim(),
      type: form.type.trim() || 'מפלצת',
      hp: Math.max(0, Math.min(maxHp, Number(form.hp) || maxHp)),
      maxHp,
      ac: Number(form.ac) || 10,
      initiative: Number(form.initiative) || 0,
      lore: form.lore.trim(),
      actions: form.actions.trim(),
      cr: form.cr || '',
    }]);
    setForm(DEFAULT_MONSTER_FORM);
  }

  function handleAddToCombat(monster) {
    setCombatants((prev) => [...prev, {
      id: `comb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: monster.name, role: monster.type, side: 'enemy',
      hp: monster.hp, maxHp: monster.maxHp, ac: monster.ac, initiative: monster.initiative,
    }]);
  }

  function addFromBestiary(entry) {
    const monster = monsterFromEntry(entry);
    setMonsters((prev) => [...prev, monster]);
    handleAddToCombat(monster);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold text-white">מגדיר מפלצות</h2>
        <p className="text-sm text-slate-400 mt-0.5">בנה אויבים עבור <span className="text-amber-300 font-medium">{campaignName}</span>.</p>
      </div>

      <section className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
          <BookOpen className="w-4 h-4" />
          <span>מאגר מובנה — 15 אויבים נפוצים</span>
        </div>
        <p className="text-xs text-slate-400">לחיצה על שם ממלאת את הטופס. אפשר גם להוסיף ישר למגדיר ולקרב.</p>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חפש או בחר: גובלין, זאב אימים, מנטיקור..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-800 divide-y divide-slate-800">
          {matches.length === 0 && (
            <p className="text-sm text-slate-500 px-3 py-4">אין התאמה במאגר. אפשר עדיין למלא את הטופס ידנית.</p>
          )}
          {matches.map((entry) => (
            <div key={entry.id} className="flex flex-col sm:flex-row sm:items-center gap-2 px-3 py-2.5 bg-slate-950/70 hover:bg-slate-900">
              <button
                type="button"
                onClick={() => setForm(formFromEntry(entry))}
                className="flex-1 text-right min-w-0"
              >
                <span className="block text-sm font-semibold text-white">{entry.name}</span>
                <span className="block text-[11px] text-slate-400 truncate">
                  {entry.type} · דרג אתגר {entry.cr} · נק&quot;פ {entry.hp} · דרג&quot;ש {entry.ac} · יוזמה {entry.initiative >= 0 ? `+${entry.initiative}` : entry.initiative}
                </span>
              </button>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setForm(formFromEntry(entry))}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-[11px] font-medium hover:bg-slate-700"
                >
                  מלא טופס
                </button>
                <button
                  type="button"
                  onClick={() => addFromBestiary(entry)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-200 text-[11px] font-medium hover:bg-rose-500/25"
                >
                  <Plus className="w-3 h-3" />
                  למגדיר ולקרב
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <form onSubmit={handleAddMonster} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="שם המפלצת *" required className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
          <input type="text" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="סוג" className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
          <div><label className="block text-[11px] text-slate-400 mb-1">נק&quot;פ מקס&apos;</label><input type="number" value={form.maxHp} onChange={(e) => setForm({ ...form, maxHp: e.target.value, hp: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-white" /></div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">דרג&quot;ש / יוזמה</label>
            <div className="grid grid-cols-2 gap-1.5">
              <input type="number" value={form.ac} onChange={(e) => setForm({ ...form, ac: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white" />
              <input type="number" value={form.initiative} onChange={(e) => setForm({ ...form, initiative: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <textarea value={form.lore} onChange={(e) => setForm({ ...form, lore: e.target.value })} placeholder="רקע קצר..." rows={4} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white resize-y focus:outline-none focus:border-amber-500" />
          <textarea value={form.actions} onChange={(e) => setForm({ ...form, actions: e.target.value })} placeholder="התקפות ויכולות..." rows={4} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white resize-y focus:outline-none focus:border-amber-500" />
        </div>
        <div className="flex justify-end"><button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-4 py-2 rounded-xl transition-colors">הוסף מפלצת</button></div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {monsters.map((monster) => (
          <div key={monster.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3.5">
            <div className="flex justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-white">{monster.name}</h3>
                <p className="text-xs text-rose-400">{monster.type}{monster.cr ? ` · דרג אתגר ${monster.cr}` : ''}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => handleAddToCombat(monster)} className="flex items-center gap-1 px-2.5 py-1 bg-rose-500/15 text-rose-300 rounded-lg text-xs font-medium"><Swords className="w-3.5 h-3.5" />לקרב</button>
                <button type="button" onClick={() => setMonsters((prev) => prev.filter((m) => m.id !== monster.id))} className="p-1.5 text-slate-500 hover:text-rose-400" aria-label="הסר מפלצת"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-2"><div className="text-[11px] text-rose-400">נק&quot;פ</div><div className="text-sm font-bold mt-0.5">{monster.hp}/{monster.maxHp}</div></div>
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-2"><div className="text-[11px] text-sky-400">דרג&quot;ש</div><div className="text-sm font-bold mt-0.5">{monster.ac}</div></div>
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-2"><div className="text-[11px] text-amber-400">יוזמה</div><div className="text-sm font-bold mt-0.5">{monster.initiative >= 0 ? `+${monster.initiative}` : monster.initiative}</div></div>
            </div>
            {monster.actions && <div className="bg-slate-950/70 rounded-xl p-3 text-xs text-slate-200 whitespace-pre-line">{monster.actions}</div>}
            {monster.lore && <div className="bg-slate-950/50 rounded-xl p-3 text-xs text-slate-300 whitespace-pre-line">{monster.lore}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
