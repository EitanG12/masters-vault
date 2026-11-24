import React, { useState } from 'react';
import { LayoutDashboard, Swords, Map as MapIcon, Users, Skull, BookOpen } from 'lucide-react';
import { CampaignProvider, useCampaignContext } from './hooks/useCampaigns';
import { CampaignSwitcher } from './components/CampaignSwitcher';
import { EffectManager } from './components/EffectManager';
import { PartyView } from './views/PartyView';
import { MonstersView } from './views/MonstersView';
import { CombatView } from './views/CombatView';
import { MapView } from './views/MapView';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'מבט-על', icon: LayoutDashboard },
  { id: 'combat', label: 'מנהל קרב', icon: Swords },
  { id: 'map', label: 'מפה טקטית', icon: MapIcon },
  { id: 'party', label: 'החבורה', icon: Users },
  { id: 'monsters', label: 'מגדיר מפלצות', icon: Skull },
];

function MasterVaultLayout() {
  // שים לב איך אנחנו שואבים עכשיו רק את מה שApp צריך לתפריט הראשי
  // השאר יטופל ישירות בתוך ה-Views!
  const {
    campaigns,
    activeCampaign,
    activeCampaignId,
    setActiveCampaignId,
    createCampaign,
    updateCampaignNotes,
    deleteCampaign,
    party,
    combatants,
    mapObjects,
    setCombatants
  } = useCampaignContext();

  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <aside className="w-full md:w-72 bg-slate-900 border-b md:border-b-0 md:border-l border-slate-800 p-4 flex flex-col gap-4 shrink-0">
        <div className="border-b border-slate-800 pb-3">
          <h1 className="text-xl font-bold text-amber-400 tracking-tight">Master&apos;s Vault</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            קמפיין פעיל: <span className="text-slate-200 font-medium">{activeCampaign.name}</span>
          </p>
        </div>

        <CampaignSwitcher
          campaigns={campaigns}
          activeCampaignId={activeCampaignId}
          onSelectCampaign={(id) => {
            setActiveCampaignId(id);
            setActiveTab('dashboard');
          }}
          onCreateCampaign={(name) => {
            createCampaign(name);
            setActiveTab('dashboard');
          }}
          onDeleteCampaign={deleteCampaign}
        />

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isSelected ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white">ברוך שובך, שליט המבוך</h2>
              <p className="text-sm text-slate-400 mt-1">
                קמפיין <span className="text-amber-300 font-medium">{activeCampaign.name}</span> מוכן לעבודה.
              </p>
              <div className="grid grid-cols-3 gap-3 mt-5 text-center">
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                  <div className="text-lg font-bold text-amber-400">{party.length}</div>
                  <div className="text-xs text-slate-400">דמויות בחבורה</div>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                  <div className="text-lg font-bold text-rose-400">{combatants.length}</div>
                  <div className="text-xs text-slate-400">משתתפי קרב</div>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                  <div className="text-lg font-bold text-sky-400">{mapObjects.length}</div>
                  <div className="text-xs text-slate-400">עצמים במפה</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-semibold">
                <BookOpen className="w-4 h-4" />
                <span>יומן מערכה והערות</span>
              </div>
              <textarea
                value={activeCampaign.notes || ''}
                onChange={(e) => updateCampaignNotes(e.target.value)}
                rows={7}
                placeholder="כתוב כאן סיכומי סשנים, רמזים, הערות על החבורה או נקודות המשך לקמפיין..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-y"
              />
            </div>

            <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-semibold">
                <BookOpen className="w-4 h-4" />
                <h3>תזכורת מהירה לחוקים — D&amp;D 5e</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <article className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                  <h4 className="mb-2 text-sm font-semibold text-sky-300">בדיקות והתקפות</h4>
                  <ul className="space-y-1.5 text-xs leading-relaxed text-slate-300">
                    <li><b className="text-slate-100">בדיקת תכונה:</b> d20 + מתאם תכונה + תוסף שליטה אם מיומן.</li>
                    <li><b className="text-slate-100">התקפה:</b> d20 + מתאם מתאים + תוסף שליטה אם מיומן; פגיעה כשסך ההתקפה שווה לדרג&quot;ש או גבוה ממנו.</li>
                    <li><b className="text-slate-100">הצלות:</b> d20 + מתאם תכונה, ותוסף שליטה אם הדמות מיומנת בהצלה.</li>
                    <li><b className="text-slate-100">יתרון/חיסרון:</b> מגלגלים שתי קוביות d20 ובוחרים גבוהה/נמוכה; הם מבטלים זה את זה.</li>
                    <li><b className="text-slate-100">דרגות מחסה:</b> חצי מחסה +2 לדרג&quot;ש ולהצלות זריזות; שלושת-רבעי +5; מחסה מלא מונע פגיעה ישירה.</li>
                  </ul>
                </article>
                <article className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                  <h4 className="mb-2 text-sm font-semibold text-rose-300">תור, קרב והתאוששות</h4>
                  <ul className="space-y-1.5 text-xs leading-relaxed text-slate-300">
                    <li><b className="text-slate-100">בתור:</b> תנועה ופעולה; פעולת בונוס רק אם יכולת מאפשרת; תגובה אחת בין תחילת התור הבא.</li>
                    <li><b className="text-slate-100">הפתעה:</b> נקבעת בתחילת הקרב למי שלא הבחין באיום; מונעת תנועה ותגובה עד סוף התור הראשון, והפעולה מוגבלת לפי חוקי 2014.</li>
                    <li><b className="text-slate-100">הצלת מוות:</b> d20: 10+ הצלחה, 9- כישלון; 1 = שני כישלונות, 20 = חזרה ל-1 נק&quot;פ. שלוש הצלחות מייצבות, שלושה כישלונות ממיתים.</li>
                    <li><b className="text-slate-100">מנוחה קצרה:</b> לפחות שעה; אפשר להשתמש בקוביות פגיעה להתאוששות.</li>
                    <li><b className="text-slate-100">מנוחה ארוכה:</b> לפחות 8 שעות; התאוששות של עד מחצית קוביות הפגיעה ו-HP לפי חוקי המהדורה והדמות.</li>
                  </ul>
                </article>
              </div>
              <p className="text-[11px] text-slate-500">הערה: התזכורת מתייחסת בעיקר לחוקי D&amp;D 5e משנת 2014. יכולות, לחשים והחלטות שה&quot;מ עשויים לשנות את הכללים.</p>
            </section>

            <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-violet-300 font-semibold">
                <Swords className="w-4 h-4" />
                <h3>אפקטים פעילים בקרב</h3>
              </div>
              {combatants.filter((combatant) => combatant.effects?.length).length === 0 ? (
                <p className="text-sm text-slate-400">אין אפקטים פעילים. אפשר להוסיף או להסיר אפקטים במסך מנהל קרב.</p>
              ) : (
                <div className="space-y-3">
                  {combatants.filter((combatant) => combatant.effects?.length).map((combatant) => (
                    <div key={combatant.id} className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950/80 p-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <span className="text-sm font-semibold text-white">{combatant.name}</span>
                        <span className="ms-2 text-[11px] text-slate-400">{combatant.side === 'ally' ? 'בן ברית' : 'יריב'}</span>
                      </div>
                      <EffectManager
                        effects={combatant.effects}
                        onChange={(effects) => setCombatants((previous) => previous.map((item) => (
                          item.id === combatant.id ? { ...item, effects } : item
                        )))}
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* שים לב! עכשיו אנחנו לא צריכים להעביר 40 משתנים פנימה. הם ריקים,
            כי הקבצים האלה יוכלו לגשת לבד ל-Context! */}
        {activeTab === 'combat' && <CombatView />}
        {activeTab === 'party' && <PartyView />}
        {activeTab === 'monsters' && <MonstersView />}
        {activeTab === 'map' && <MapView />}
      </main>
    </div>
  );
}

// פה אנחנו עוטפים את הכל ב-Provider שיצרנו בשלב 1!
export default function App() {
  return (
    <CampaignProvider>
      <MasterVaultLayout />
    </CampaignProvider>
  );
}