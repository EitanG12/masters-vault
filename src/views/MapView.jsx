import React, { useState } from 'react';
import { TreePine, Bridge, BrickWall, Fence, Mountain, Box } from 'lucide-react';
import { useCampaignContext } from '../hooks/useCampaigns';

const OBSTACLE_MARKS = [
  { test: /עץ|יער|שיח|אורן/, Icon: TreePine },
  { test: /גשר/, Icon: Bridge },
  { test: /קיר|חומה/, Icon: BrickWall },
  { test: /גדר/, Icon: Fence },
  { test: /הר|סלע|אבן/, Icon: Mountain },
  { test: /תיבה|ארגז|חזה/, Icon: Box },
];

function readableLabel(name) {
  return (name || '').trim().slice(0, 4);
}

function ObstacleMark({ name }) {
  const text = name || '';
  const className = 'w-3.5 h-3.5';
  if (/עץ|יער|שיח|אורן/.test(text)) return <TreePine className={className} />;
  if (/גשר/.test(text)) return <Bridge className={className} />;
  if (/קיר|חומה/.test(text)) return <BrickWall className={className} />;
  if (/גדר/.test(text)) return <Fence className={className} />;
  if (/הר|סלע|אבן/.test(text)) return <Mountain className={className} />;
  if (/תיבה|ארגז|חזה/.test(text)) return <Box className={className} />;
  return null;
}

function hasObstacleIcon(name) {
  return OBSTACLE_MARKS.some((item) => item.test.test(name || ''));
}

function tokenShape(type) {
  if (type === 'ally') {
    return 'w-11 h-11 rounded-full bg-sky-500 text-sky-950 ring-2 ring-sky-200/80';
  }
  if (type === 'enemy') {
    return 'w-11 h-11 rounded-lg bg-rose-600 text-rose-50 ring-2 ring-rose-300/80';
  }
  return 'min-w-[2.85rem] h-7 px-1.5 rounded-sm bg-gradient-to-l from-amber-400 to-emerald-500 text-slate-950 ring-2 ring-amber-200/70';
}

function typeLabel(type) {
  if (type === 'ally') return 'בן ברית';
  if (type === 'enemy') return 'יריב';
  return 'מכשול';
}

function MapToken({ obj, onRemove }) {
  const [tip, setTip] = useState(null);
  const showIcon = obj.type === 'obstacle' && hasObstacleIcon(obj.name);

  function showTip(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    setTip({ x: rect.left + rect.width / 2, y: rect.top });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onRemove}
        onMouseEnter={showTip}
        onMouseLeave={() => setTip(null)}
        onFocus={showTip}
        onBlur={() => setTip(null)}
        aria-label={`${obj.name}, ${typeLabel(obj.type)}. לחץ להסרה`}
        className={`${tokenShape(obj.type)} flex items-center justify-center font-bold shadow-md hover:opacity-80 hover:scale-105 transition-all`}
      >
        {showIcon ? <ObstacleMark name={obj.name} /> : <span className="text-[10px] leading-none tracking-tight">{readableLabel(obj.name)}</span>}
      </button>
      {tip && (
        <div
          className="fixed z-50 -translate-x-1/2 -translate-y-full pointer-events-none whitespace-nowrap rounded-md bg-slate-950 border border-slate-600 px-2 py-1 text-[11px] text-white shadow-lg"
          style={{ left: tip.x, top: tip.y - 6 }}
        >
          {obj.name}
        </div>
      )}
    </div>
  );
}

export function MapView() {
  const { mapObjects, setMapObjects, party, combatants, activeCampaign } = useCampaignContext();
  const campaignName = activeCampaign.name;

  const [form, setForm] = useState({ name: '', type: 'enemy' });

  function handleGridClick(x, y) {
    if (!form.name.trim()) {
      alert('בחר קודם דמות או מפלצת מהרשימה ואז תלחץ על הלוח איפה להניח אותה!');
      return;
    }
    const newObj = {
      id: `map-obj-${Date.now()}`,
      name: form.name.trim(),
      type: form.type,
      x, y,
    };
    setMapObjects((prev) => [...prev, newObj]);
  }

  function handleRemoveObject(id, e) {
    e.stopPropagation();
    setMapObjects((prev) => prev.filter((o) => o.id !== id));
  }

  const rows = Array.from({ length: 10 }, (_, row) => row + 1);
  const cols = Array.from({ length: 10 }, (_, col) => col + 1);

  return (
    <div className="max-w-6xl mx-auto space-y-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold text-white">מפה טקטית (הנחה בלחיצה)</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          בחר סמן ואז לחץ על משבצת בלוח כדי להניח אותו. קמפיין <span className="text-amber-300 font-medium">{campaignName}</span>.
        </p>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">מי עולה ללוח? (הקלד או בחר)</label>
          <input
            type="text"
            list="map-names-list"
            value={form.name}
            onChange={(e) => {
              const val = e.target.value;
              let autoType = form.type;
              if (party.some((p) => p.name === val) || combatants.some((c) => c.name === val && c.side === 'ally')) autoType = 'ally';
              else if (combatants.some((c) => c.name === val && c.side === 'enemy')) autoType = 'enemy';
              setForm({ ...form, name: val, type: autoType });
            }}
            placeholder="למשל: גובלין, אדמונד, עץ, גשר, קיר"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
          />
          <datalist id="map-names-list">
            {party.map((p) => <option key={`party-${p.id}`} value={p.name} />)}
            {combatants.map((c) => <option key={`comb-${c.id}`} value={c.name} />)}
            <option value="עץ" />
            <option value="גשר" />
            <option value="קיר" />
          </datalist>
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 mb-1">צבע / צד בקרב</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ally">בן ברית (עיגול כחול)</option>
            <option value="enemy">יריב (ריבוע מעוגל אדום)</option>
            <option value="obstacle">מכשול/חפץ (מלבן צהוב-ירוק)</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-300">
        <span className="inline-flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-sky-500 inline-block" />בן ברית</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-4 h-4 rounded-md bg-rose-600 inline-block" />יריב</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-6 h-3 rounded-sm bg-gradient-to-l from-amber-400 to-emerald-500 inline-block" />מכשול או חפץ</span>
        <span className="text-slate-500">עץ, גשר וקיר מוצגים כאייקון. שאר השמות — ארבעת התווים הראשונים.</span>
      </div>

      <div className="bg-slate-950 border-2 border-slate-800 rounded-lg p-2 overflow-x-auto">
        <div className="min-w-[600px] grid grid-cols-10 gap-0">
          {rows.map((y) => cols.map((x) => {
            const objectsHere = mapObjects.filter((o) => o.x === x && o.y === y);
            return (
              <div
                key={`${x}-${y}`}
                onClick={() => handleGridClick(x, y)}
                className="border border-slate-800/60 bg-slate-900/30 relative min-h-[3.5rem] flex flex-wrap items-center justify-center gap-1 p-1 hover:bg-amber-500/20 cursor-pointer transition-colors"
              >
                <span className="absolute top-0.5 right-1 text-[9px] text-slate-700 font-mono select-none pointer-events-none">{x},{y}</span>
                {objectsHere.map((obj) => (
                  <MapToken key={obj.id} obj={obj} onRemove={(e) => handleRemoveObject(obj.id, e)} />
                ))}
              </div>
            );
          }))}
        </div>
      </div>

      <p className="text-xs text-slate-500 text-center">כדי להסיר סמן מהלוח, לחץ עליו. מעבר עכבר מציג את השם המלא.</p>
    </div>
  );
}
