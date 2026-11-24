import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

const CONDITION_EFFECTS = [
  { name: 'עיוורון', description: 'היצור נכשל אוטומטית בבדיקות ראייה; התקפותיו בחיסרון ונגדו ביתרון.' },
  { name: 'הרעלה', description: 'היצור בחיסרון בהתקפות ובהטלות תכונה.' },
  { name: 'מרותק', description: 'מהירות 0, חיסרון בהצלות זריזות ובהתקפות; התקפות נגדו ביתרון.' },
  { name: 'אחוז', description: 'מהירות 0; מסתיים אם האוחז נעשה חסר יכולת או שהיצור משתחרר.' },
  { name: 'משותק', description: 'חסר יכולת לנוע או לפעול; נכשל בהצלות כוח וזריזות, והתקפות סמוכות פוגעות קריטית.' },
  { name: 'מופתע', description: 'במהדורת 2014: אין תנועה או פעולה בתור הראשון, ואין תגובה עד שהתור מסתיים.' },
  { name: 'בהלם', description: 'חסר יכולת; לא יכול לנוע, נכשל בהצלות כוח וזריזות והתקפות נגדו ביתרון.' },
  { name: 'מפוחד', description: 'חיסרון בבדיקות ובהתקפות כל עוד מקור הפחד נראה; לא מתקרב אליו מרצון.' },
  { name: 'שרוע', description: 'התקפות קרובות נגדו ביתרון, מרחוק בחיסרון; קימה עולה מחצית מהתנועה.' },
  { name: 'מחוסר הכרה', description: 'חסר יכולת ומפיל חפצים; התקפות נגדו ביתרון וסמוכות פוגעות קריטית.' },
  { name: 'מוקף', description: 'חוק אופציונלי; קבעו מראש תנאי הקפה והשפעה, כי אין חוק הקפה בסיסי ב-5e.' },
];

export function EffectManager({ effects = [], onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDescription, setCustomDescription] = useState('');

  function addEffect(effect) {
    const name = effect.name.trim();
    if (!name) return;

    onChange([
      ...effects,
      {
        id: `effect-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name,
        description: effect.description?.trim() || '',
        duration: 'until-next-turn',
      },
    ]);
  }

  function handleCustomSubmit(event) {
    event.preventDefault();
    addEffect({ name: customName, description: customDescription });
    setCustomName('');
    setCustomDescription('');
  }

  return (
    <div className="space-y-2">
      {effects.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {effects.map((effect) => (
            <button
              type="button"
              key={effect.id}
              onClick={() => onChange(effects.filter((item) => item.id !== effect.id))}
              title={`${effect.description || effect.name} · עד תור הבא · לחץ להסרה`}
              className="inline-flex items-center gap-1 rounded-full border border-violet-500/40 bg-violet-500/15 px-2 py-1 text-[11px] text-violet-200 hover:border-violet-400"
            >
              <span>{effect.name}</span>
              <X className="h-3 w-3" />
            </button>
          ))}
        </div>
      )}

      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-2 py-1 text-[11px] text-slate-300 hover:border-violet-400 hover:text-violet-200"
        >
          <Plus className="h-3 w-3" />
          הוסף אפקט
        </button>
      ) : (
        <div className="space-y-2 rounded-xl border border-slate-700 bg-slate-950 p-2.5">
          <div className="flex flex-wrap gap-1.5">
            {CONDITION_EFFECTS.map((effect) => (
              <button
                type="button"
                key={effect.name}
                onClick={() => addEffect(effect)}
                className="rounded-lg bg-slate-800 px-2 py-1 text-[11px] text-slate-200 hover:bg-violet-500/20 hover:text-violet-200"
              >
                {effect.name}
              </button>
            ))}
          </div>
          <form onSubmit={handleCustomSubmit} className="grid gap-2">
            <input
              value={customName}
              onChange={(event) => setCustomName(event.target.value)}
              placeholder="שם אפקט מותאם"
              className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-white"
            />
            <input
              value={customDescription}
              onChange={(event) => setCustomDescription(event.target.value)}
              placeholder="תיאור קצר (אופציונלי)"
              className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-white"
            />
            <div className="flex justify-end gap-1.5">
              <button type="submit" className="rounded-lg bg-violet-500 px-2.5 py-1 text-[11px] font-semibold text-white">
                הוסף
              </button>
              <button type="button" onClick={() => setIsOpen(false)} className="rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300">
                סגור
              </button>
            </div>
          </form>
          <p className="text-[10px] text-slate-500">משך ברירת מחדל: עד תור הבא. ניתן להסיר ידנית.</p>
        </div>
      )}
    </div>
  );
}
