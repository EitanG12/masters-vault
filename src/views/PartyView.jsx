import React, { useState } from 'react';
import { UserPlus, Trash2, Shield, Eye, Zap, Heart, Sword, Sparkles, BowArrow, Crown, Skull, ImageOff } from 'lucide-react';
import { useCampaignContext } from '../hooks/useCampaigns';

const ABILITIES = [
  { key: 'str', label: 'כוח' },
  { key: 'dex', label: 'זריזות' },
  { key: 'con', label: 'חוסן' },
  { key: 'int', label: 'תבונה' },
  { key: 'wis', label: 'חוכמה' },
  { key: 'cha', label: 'כריזמה' },
];

const CHARACTER_ICONS = [
  { id: 'sword', label: 'חרב', Icon: Sword },
  { id: 'shield', label: 'מגן', Icon: Shield },
  { id: 'magic', label: 'קסם', Icon: Sparkles },
  { id: 'bow', label: 'קשת', Icon: BowArrow },
  { id: 'crown', label: 'כתר', Icon: Crown },
  { id: 'skull', label: 'גולגולת', Icon: Skull },
];

const DEFAULT_FORM = {
  name: '', role: '', hp: 20, maxHp: 20, ac: 14,
  initiative: 2, passivePerception: 12,
  str: 10, dex: 14, con: 12, int: 10, wis: 12, cha: 10,
  icon: '', avatarUrl: '',
};

function getModifier(score) {
  const num = Number(score);
  if (Number.isNaN(num)) return '+0';
  const mod = Math.floor((num - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

function getAvatarUrl(name, index) {
  const seed = encodeURIComponent(name?.trim() || `hero-${index + 1}`);
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}`;
}

function findIcon(iconId) {
  return CHARACTER_ICONS.find((item) => item.id === iconId) || null;
}

function CharacterPortrait({ member, index }) {
  const [brokenUrl, setBrokenUrl] = useState('');
  const customUrl = member.avatarUrl?.trim() || '';
  const icon = findIcon(member.icon);
  const urlFailed = customUrl && brokenUrl === customUrl;

  if (customUrl && !urlFailed) {
    return (
      <img
        src={customUrl}
        alt=""
        onError={() => setBrokenUrl(customUrl)}
        className="w-14 h-14 rounded-xl border border-amber-500/50 bg-slate-950 object-cover"
      />
    );
  }

  if (icon) {
    const Icon = icon.Icon;
    return (
      <div
        className="w-14 h-14 rounded-xl border border-amber-500/40 bg-slate-950 flex items-center justify-center text-amber-300"
        title={icon.label}
      >
        <Icon className="w-7 h-7" />
      </div>
    );
  }

  return (
    <img
      src={getAvatarUrl(member.name, index)}
      alt=""
      className="w-14 h-14 rounded-xl border border-slate-700 bg-slate-950 object-cover"
    />
  );
}

function IconPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        type="button"
        onClick={() => onChange('')}
        title="אווטאר אוטומטי"
        className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-colors ${
          value ? 'border-slate-700 text-slate-400 hover:text-white' : 'border-amber-400 bg-amber-500/15 text-amber-200'
        }`}
      >
        אווטאר
      </button>
      {CHARACTER_ICONS.map(({ id, label, Icon }) => {
        const selected = value === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            title={label}
            aria-label={label}
            className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${
              selected
                ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
}

export function PartyView() {
  const { party, setParty, activeCampaign } = useCampaignContext();
  const campaignName = activeCampaign.name;
  const [form, setForm] = useState(DEFAULT_FORM);

  function handleAddMember(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const maxHp = Math.max(1, Number(form.maxHp) || 1);
    const hp = Math.max(0, Math.min(maxHp, Number(form.hp) || maxHp));

    setParty((prev) => [...prev, {
      id: `char-${Date.now()}`,
      name: form.name.trim(),
      role: form.role.trim() || 'הרפתקן',
      hp, maxHp,
      ac: Number(form.ac) || 10,
      initiative: Number(form.initiative) || 0,
      passivePerception: Number(form.passivePerception) || 10,
      icon: form.icon || '',
      avatarUrl: form.avatarUrl.trim(),
      stats: {
        str: Number(form.str) || 10, dex: Number(form.dex) || 10,
        con: Number(form.con) || 10, int: Number(form.int) || 10,
        wis: Number(form.wis) || 10, cha: Number(form.cha) || 10,
      },
    }]);
    setForm(DEFAULT_FORM);
  }

  function adjustHp(id, delta) {
    setParty((prev) => prev.map((member) => {
      if (member.id !== id) return member;
      return { ...member, hp: Math.max(0, Math.min(member.maxHp, member.hp + delta)) };
    }));
  }

  function updateMember(id, patch) {
    setParty((prev) => prev.map((member) => (member.id === id ? { ...member, ...patch } : member)));
  }

  function removeMember(id) {
    setParty((prev) => prev.filter((member) => member.id !== id));
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold text-white">דפי דמות — החבורה</h2>
        <p className="text-sm text-slate-400 mt-0.5">כל הנתונים החשובים עבור <span className="text-amber-300 font-medium">{campaignName}</span>.</p>
      </div>

      <form onSubmit={handleAddMember} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
          <UserPlus className="w-4 h-4" /><span>הוספת דמות חדשה</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="שם הדמות *" required className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none" />
          <input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="מקצוע / תפקיד" className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none" />
          <div><label className="block text-[11px] text-slate-400 mb-1">נק&quot;פ מקס&apos;</label><input type="number" value={form.maxHp} onChange={(e) => setForm({ ...form, maxHp: e.target.value, hp: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-white" /></div>
          <div><label className="block text-[11px] text-slate-400 mb-1">דרג&quot;ש</label><input type="number" value={form.ac} onChange={(e) => setForm({ ...form, ac: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-white" /></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 items-end">
          <div><label className="block text-[11px] text-slate-400 mb-1">יוזמה</label><input type="number" value={form.initiative} onChange={(e) => setForm({ ...form, initiative: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white" /></div>
          <div><label className="block text-[11px] text-slate-400 mb-1">תפיסה פס&apos;</label><input type="number" value={form.passivePerception} onChange={(e) => setForm({ ...form, passivePerception: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white" /></div>
          {ABILITIES.map(({ key, label }) => (
            <div key={key}>
              <label className="block text-[11px] text-slate-400 mb-1">{label}</label>
              <input type="number" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4 items-start border-t border-slate-800 pt-4">
          <div className="space-y-1.5">
            <p className="text-[11px] text-slate-400">אייקון לדמות</p>
            <IconPicker value={form.icon} onChange={(icon) => setForm({ ...form, icon })} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[11px] text-slate-400">קישור לתמונה מותאמת (URL)</label>
            <input
              type="url"
              inputMode="url"
              value={form.avatarUrl}
              onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
              placeholder="הדבק קישור לתמונה — מחליף את האווטאר האוטומטי"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500">בלי קישור ובלי אייקון מוצג אווטאר אוטומטי לפי שם הדמות. קישור גובר על האייקון.</p>
          </div>
        </div>

        <div className="flex justify-end"><button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm px-4 py-2 rounded-xl transition-colors">הוסף דמות</button></div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {party.map((member, idx) => (
          <div key={member.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between gap-3">
              <div className="flex gap-3">
                <CharacterPortrait member={member} index={idx} />
                <div>
                  <h3 className="text-lg font-bold text-white">{member.name}</h3>
                  <p className="text-xs text-amber-400">{member.role}</p>
                </div>
              </div>
              <button type="button" onClick={() => removeMember(member.id)} className="text-slate-500 hover:text-rose-400 p-1" aria-label="הסר דמות"><Trash2 className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-2"><div className="flex justify-center gap-1 text-[11px] text-rose-400"><Heart className="w-3 h-3"/><span>נק&quot;פ</span></div><div className="text-sm font-bold mt-0.5">{member.hp}/{member.maxHp}</div><div className="flex justify-center gap-1 mt-1"><button type="button" onClick={() => adjustHp(member.id, -1)} className="px-1.5 py-0.5 bg-slate-800 rounded text-xs">-1</button><button type="button" onClick={() => adjustHp(member.id, 1)} className="px-1.5 py-0.5 bg-slate-800 rounded text-xs">+1</button></div></div>
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-2 flex flex-col justify-center"><div className="flex justify-center gap-1 text-[11px] text-sky-400"><Shield className="w-3 h-3"/><span>דרג&quot;ש</span></div><div className="text-base font-bold mt-0.5">{member.ac}</div></div>
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-2 flex flex-col justify-center"><div className="flex justify-center gap-1 text-[11px] text-amber-400"><Zap className="w-3 h-3"/><span>יוזמה</span></div><div className="text-base font-bold mt-0.5">{member.initiative >= 0 ? `+${member.initiative}` : member.initiative}</div></div>
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-2 flex flex-col justify-center"><div className="flex justify-center gap-1 text-[11px] text-emerald-400"><Eye className="w-3 h-3"/><span>תפיסה</span></div><div className="text-base font-bold mt-0.5">{member.passivePerception}</div></div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center">
              {ABILITIES.map(({ key, label }) => (
                <div key={key} className="bg-slate-950/60 border border-slate-800/80 rounded-lg py-1.5 px-1">
                  <div className="text-[10px] text-slate-400 leading-tight">{label}</div>
                  <div className="text-xs font-bold text-slate-100">{member.stats?.[key] ?? 10}</div>
                  <div className="text-[10px] text-amber-400 font-semibold">{getModifier(member.stats?.[key] ?? 10)}</div>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t border-slate-800 pt-3">
              <p className="text-[11px] text-slate-400">אייקון או תמונה</p>
              <IconPicker value={member.icon || ''} onChange={(icon) => updateMember(member.id, { icon })} />
              <div className="flex gap-2">
                <input
                  type="url"
                  inputMode="url"
                  value={member.avatarUrl || ''}
                  onChange={(e) => updateMember(member.id, { avatarUrl: e.target.value })}
                  placeholder="קישור לתמונה (URL)"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
                {member.avatarUrl?.trim() && (
                  <button
                    type="button"
                    onClick={() => updateMember(member.id, { avatarUrl: '' })}
                    className="shrink-0 inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-700 text-[11px] text-slate-300 hover:text-white"
                  >
                    <ImageOff className="w-3.5 h-3.5" />
                    נקה
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
