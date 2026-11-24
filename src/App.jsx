import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Swords, BookOpen, Users, LayoutDashboard, 
  Plus, Minus, Settings, 
  ShieldAlert, Skull, Heart, Shield,
  Activity, UserPlus, Play,
  Search, X, Maximize, Minimize, Dices,
  ChevronUp, ChevronDown, Map, Save, Info, Eye
} from 'lucide-react';

// --- Custom Hook: Local Storage ---
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading localStorage", error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error("Error setting localStorage", error);
    }
  };
  return [storedValue, setValue];
}

// --- Helper for Modifiers ---
const getMod = (score) => {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : mod;
};

// --- Mock Data & Constants ---
const INITIAL_COMBATANTS = [];

const CONDITIONS_LIST = [
  'עיוור', 'מוקסם', 'חירש', 'מפוחד', 'אחוז', 
  'משותק', 'מאובן', 'מורעל', 'שרוע', 'מרוסן', 
  'המום', 'מחוסר הכרה', 'ריכוז', 'חבוי'
];

const MONSTER_DB = [
  { name: 'קובולד', hp: 5, ac: 12, type: 'enemy', avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Kobold', stats: { str: 7, dex: 15, con: 9, int: 8, wis: 7, cha: 8 }, speed: 30, description: 'זוחלים קטנים, פחדנים וערמומיים שסוגדים לדרקונים.', actions: ['פגיון: קפא"פ +4, 1ק4+2 נזק.'] },
  { name: 'גובלין', hp: 7, ac: 15, type: 'enemy', avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Goblin', stats: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 }, speed: 30, description: 'יצורים קטנים וזדוניים שנוטים לארוב לעוברי אורח. מסוכנים בלהקות.', actions: ['חרב קצרה: קפא"פ +4, 1ק6+2 נזק חותך.', 'קשת קצרה: טווח 80/320 +4, 1ק6+2 נזק חודר.'] },
  { name: 'שלד', hp: 13, ac: 13, type: 'enemy', avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Skeleton', stats: { str: 10, dex: 14, con: 15, int: 6, wis: 8, cha: 5 }, speed: 30, description: 'אל-מת אלמותי שמונע על ידי קסם אפל. חסין לרעל ותשישות.', actions: ['חרב קצרה: +4, 1ק6+2.', 'פגיע לנזק מוחץ (Bludgeoning).'] },
  { name: 'אורק (Orc)', hp: 15, ac: 13, type: 'enemy', avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Orc', stats: { str: 16, dex: 12, con: 16, int: 7, wis: 11, cha: 10 }, speed: 30, description: 'לוחמים פראיים ואכזריים.', actions: ['גרזן אדיר: +5, 1ק12+3 נזק חותך.'] },
  { name: 'זומבי', hp: 22, ac: 8, type: 'enemy', avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Zombie', stats: { str: 13, dex: 6, con: 16, int: 3, wis: 6, cha: 5 }, speed: 20, description: 'אל-מת איטי שקשה מאוד להרוג.', actions: ['טריקה: +3, 1ק6+1 נזק מוחץ.', 'הצלת אל-מת: אם יורד ל-0 נק"פ, מגלגל חוסן 5+נזק כדי להישאר ב-1 נק"פ.'] },
  { name: 'עכביש ענק', hp: 26, ac: 14, type: 'enemy', avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Spider', stats: { str: 14, dex: 16, con: 12, int: 2, wis: 11, cha: 4 }, speed: 40, description: 'טורף ענק שמסוגל לטפס על קירות ולטוות קורי עכביש.', actions: ['נשיכה: +5, 1ק8+3 חודר + 2ק8 רעל.', 'קורים (נטען 5-6): מרוסן (DC 12).'] },
  { name: 'דובליל (Bugbear)', hp: 27, ac: 16, type: 'enemy', avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Bugbear', stats: { str: 15, dex: 14, con: 13, int: 8, wis: 11, cha: 9 }, speed: 30, description: 'גובלינואיד גדול ושעיר, מתמחה בהתגנבות למרות גודלו.', actions: ['כוכב שחר: +4, 2ק8+2 נזק חותך.', 'התקפת פתע: +2ק6 נזק אם מפתיע אויב.'] },
  { name: 'זאב אימים', hp: 37, ac: 14, type: 'enemy', avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=DireWolf', stats: { str: 17, dex: 15, con: 15, int: 3, wis: 12, cha: 7 }, speed: 50, description: 'זאב ענק ואכזרי שיכול להפיל אביר מסוסו.', actions: ['נשיכה: +5, 2ק6+3 חודר. מטרה חייבת להציל כוח (DC 13) או ליפול שרועה.'] },
  { name: 'בסיליסק', hp: 52, ac: 15, type: 'enemy', avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Basilisk', stats: { str: 16, dex: 8, con: 15, int: 2, wis: 8, cha: 7 }, speed: 20, description: 'לטאה איטית שרואה אל תוך העיניים ומאבנת את קורבנותיה.', actions: ['מבט מאבן: יצור שמתחיל את תורו בטווח 30 רגל צריך להציל חוסן (DC 12) או להתאבן.', 'נשיכה: +5, 2ק6+3 חודר + 2ק6 רעל.'] },
  { name: 'חקיין (Mimic)', hp: 58, ac: 12, type: 'enemy', avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Mimic', stats: { str: 17, dex: 12, con: 15, int: 5, wis: 13, cha: 8 }, speed: 15, description: 'מפלצת טורפת שמשנה צורה לחפצים דוממים כמו תיבות אוצר.', actions: ['חזות כוזבת: נראה לחלוטין כמו חפץ כשהוא ללא ניע.', 'נשיכה/פסאודופוד: +5, 1ק8+3 מוחץ + 1ק8 חומצה.'] },
  { name: 'עוג (Ogre)', hp: 59, ac: 11, type: 'enemy', avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Ogre', stats: { str: 19, dex: 8, con: 16, int: 5, wis: 7, cha: 7 }, speed: 40, description: 'ענק טיפש וזללן עם מזג רע.', actions: ['אלת ענק: +6, 2ק8+4 נזק מוחץ.'] },
  { name: 'דוב-ינשוף (Owlbear)', hp: 59, ac: 13, type: 'enemy', avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Owlbear', stats: { str: 20, dex: 12, con: 17, int: 3, wis: 12, cha: 7 }, speed: 40, description: 'טורף פראי ואגרסיבי שמשלב את הכוח של דוב עם הראייה של ינשוף.', actions: ['ריבוי התקפות: מקור וטפרים.', 'מקור: +7, 1ק10+5. טפרים: +7, 2ק8+5.'] },
  { name: 'מצליף מוחות', hp: 71, ac: 15, type: 'enemy', avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=MindFlayer', stats: { str: 11, dex: 12, con: 12, int: 19, wis: 17, cha: 17 }, speed: 30, description: 'חייזר פסיואני שניזון ממוחות של דמויי-אדם.', actions: ['פיצוץ מוחי (נטען 5-6): קונוס 60 רגל, 4ק8+4 פסיכי והמום (DC 15 חכמה).', 'זרועות: +7, 2ק10+4 פסיכי ואחוז.'] },
  { name: 'מינוטאור', hp: 76, ac: 14, type: 'enemy', avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Minotaur', stats: { str: 18, dex: 11, con: 16, int: 6, wis: 16, cha: 9 }, speed: 40, description: 'מפלץ חצי-אדם חצי-שור, צייד קטלני במבוכים.', actions: ['הסתערות ללא רחם.', 'גרזן אדיר: +6, 2ק12+4 מוחץ.', 'קרניים: +6, 2ק8+4.'] },
  { name: 'קוביית ג\'לטין', hp: 84, ac: 6, type: 'enemy', avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Gelatinous', stats: { str: 14, dex: 3, con: 20, int: 1, wis: 6, cha: 1 }, speed: 15, description: 'רפש חומצי ענק שכמעט בלתי נראה. מנקה מבוכים מושלם.', actions: ['בליעה: נכנס למשבצת של יצור. הצלת זריזות (DC 12). 3ק6 חומצה למשויכים.'] },
  { name: 'טרול', hp: 84, ac: 15, type: 'enemy', avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Troll', stats: { str: 18, dex: 13, con: 20, int: 7, wis: 9, cha: 7 }, speed: 30, description: 'ענק רזה ורעב תמיד, עם יכולת התחדשות פסיכית.', actions: ['התחדשות: מרפא 10 נק"פ בתחילת תורו (אלא אם חטף אש/חומצה).', '3 התקפות: נשיכה (+7, 1ק6+4) ושני טפרים (+7, 2ק6+4).'] },
  { name: 'מדוזה', hp: 120, ac: 15, type: 'enemy', avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Medusa', stats: { str: 10, dex: 15, con: 16, int: 12, wis: 13, cha: 15 }, speed: 30, description: 'אישה בעלת נחשים כשיער שמבטה הופך בשר לאבן.', actions: ['מבט מאבן: 30 רגל, חוסן (DC 14).', 'נחשי שיער: +5, 1ק4+2 חודר + 4ק6 רעל.'] },
  { name: 'ליץ\' (Lich)', hp: 135, ac: 17, type: 'enemy', avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Lich', stats: { str: 11, dex: 16, con: 16, int: 20, wis: 14, cha: 16 }, speed: 30, description: 'קוסם אל-מת רב עוצמה שהקריב את נשמתו לחיי נצח.', actions: ['הטלת לחשים עד דרג 9.', 'מגע משתק: +12, 3ק6 קר ולהיכנס להלם (DC 18 חוסן).', 'פעולות אגדיות.'] },
  { name: 'ערפד', hp: 144, ac: 16, type: 'enemy', avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Vampire', stats: { str: 18, dex: 18, con: 18, int: 17, wis: 15, cha: 18 }, speed: 30, description: 'שליט אל-מת של הלילה, זקוק לדם ובעל כריזמה אדירה.', actions: ['התחדשות 20 נק"פ.', 'שינוי צורה לעטלף/ערפל.', 'נשיכה מרוקנת: +9, 1ק6+4 חודר + 3ק6 נקרוטי. המקסימום נק"פ של המטרה יורד.'] },
  { name: 'דרקון אדום צעיר', hp: 178, ac: 18, type: 'enemy', avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Dragon', stats: { str: 23, dex: 10, con: 21, int: 14, wis: 11, cha: 19 }, speed: 40, description: 'זוחל אגדי ומטיל אימה שיורק אש. חמדן ושחצן.', actions: ['נשיפת אש (נטען 5-6): קונוס 30 רגל, 16ק6 אש (הצלת זריזות DC 17 לחצי).', 'ריבוי התקפות: נשיכה (+10, 2ק10+6) ושני טפרים (+10, 2ק6+6).'] },
  { name: 'בוהה (Beholder)', hp: 180, ac: 18, type: 'enemy', avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Beholder', stats: { str: 10, dex: 14, con: 18, int: 17, wis: 15, cha: 17 }, speed: 20, description: 'כדור בשר מרחף עם עין מרכזית ענקית ו-10 עיניים על זרועות. פרנואיד ומטורף.', actions: ['חרוט אנטי-קסם מהעין המרכזית (150 רגל).', '3 קרני עין אקראיות בתור (קסם, טלקינזיס, אבן, מוות וכו\').'] }
];

const generateMapTemplate = (type, gridSize) => {
  let objects = [];
  if (type === 'river') {
    for (let y = 0; y < gridSize; y++) {
      objects.push({ x: Math.floor(gridSize/2)-1, y, typeId: 'water' });
      objects.push({ x: Math.floor(gridSize/2), y, typeId: 'water' });
    }
    objects.push({ x: Math.floor(gridSize/2)-1, y: Math.floor(gridSize/2), typeId: 'bridge' });
    objects.push({ x: Math.floor(gridSize/2), y: Math.floor(gridSize/2), typeId: 'bridge' });
    objects.push({ x: 2, y: 3, typeId: 'rock' }, { x: gridSize-3, y: 7, typeId: 'rock' });
  } else if (type === 'forest') {
    for (let i = 0; i < 15; i++) {
      const rx = Math.floor(Math.random() * gridSize);
      const ry = Math.floor(Math.random() * gridSize);
      objects.push({ x: rx, y: ry, typeId: Math.random() > 0.3 ? 'tree' : 'rock' });
    }
  } else if (type === 'castle') {
    for (let i = 0; i < gridSize; i++) {
      if (i !== Math.floor(gridSize/2)) objects.push({ x: i, y: 1, typeId: 'wall' });
      objects.push({ x: 1, y: i, typeId: 'wall' });
      objects.push({ x: gridSize-2, y: i, typeId: 'wall' });
    }
    objects.push({ x: Math.floor(gridSize/2), y: 3, typeId: 'fire' });
  }
  return objects;
};

// --- Helper Components ---
const Card = ({ title, icon: Icon, children, className = '' }) => (
  <div className={`bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg ${className}`}>
    <div className="bg-slate-800/50 p-3 border-b border-slate-800 flex items-center gap-2">
      <Icon className="text-amber-500" size={18} />
      <h3 className="font-bold text-slate-200">{title}</h3>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseStyle = "inline-flex items-center justify-center gap-2 font-medium transition-colors rounded-lg focus:outline-none";
  const variants = {
    primary: "bg-amber-600 hover:bg-amber-500 text-white shadow-md",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white",
    danger: "bg-red-900/80 hover:bg-red-800 text-red-100 border border-red-700",
    ghost: "hover:bg-slate-800 text-slate-300",
    outline: "border border-slate-700 hover:bg-slate-800 text-slate-300"
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
    icon: "p-2"
  };
  return (
    <button className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// --- Main Views ---
const DashboardHome = ({ navigateTo, campaignDetails, setCampaignDetails }) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="bg-gradient-to-l from-slate-900 to-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
      <h1 className="text-4xl font-extrabold text-white mb-3">ברוך שובך, שליט המבוך</h1>
      <p className="text-slate-400 mb-8 max-w-2xl text-lg">השחקנים שלך ממתינים. נהל את הקרב, עדכן את יומן המסע ופקח עין על מצב החבורה, הכל ממקום אחד.</p>
      
      <div className="flex flex-wrap gap-4 relative z-10">
        <Button onClick={() => navigateTo('combat')} size="lg" className="flex-1 md:flex-none">
          <Swords /> התחל קרב
        </Button>
        <Button onClick={() => navigateTo('map')} variant="secondary" size="lg" className="flex-1 md:flex-none">
          <Map /> מפה טקטית
        </Button>
      </div>
    </div>

    <div className="w-full mt-8">
      <Card title="יומן מערכה והערות" icon={BookOpen} className="h-full">
        <textarea 
          value={campaignDetails}
          onChange={(e) => setCampaignDetails(e.target.value)}
          className="w-full h-80 bg-slate-950/50 text-slate-300 leading-relaxed text-base p-4 rounded-lg border border-slate-800 focus:border-amber-500 focus:outline-none resize-none custom-scrollbar"
          placeholder="כתוב כאן את תקציר הקמפיין, רעיונות להמשך, או סודות של ה-NPCs..."
        />
      </Card>
    </div>
  </div>
);

const PartySheet = ({ combatants }) => {
  const party = combatants.filter(c => c.type === 'player' && c.stats);

  return (
    <div className="animate-in fade-in duration-300 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-blue-400 flex items-center gap-2 mb-2">
          <Users /> החבורה (Party Sheet)
        </h2>
        <p className="text-slate-400">ריכוז הנתונים והסטטיסטיקות של שחקני הקבוצה שלך לגישה מהירה.</p>
      </div>
      
      {party.length === 0 ? (
        <div className="text-center py-12 text-slate-500 border border-dashed border-slate-700 rounded-xl">
          <Users className="mx-auto mb-2 opacity-50" size={32} />
          <p>אין כרגע שחקנים עם נתונים מורחבים בקרב.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-24">
          {party.map(player => (
            <div key={player.id} className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
              <div className="bg-slate-800 p-4 flex items-center gap-4 border-b border-slate-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
                <img src={player.avatar} alt={player.name} className="w-16 h-16 rounded-xl bg-slate-700 object-cover border-2 border-slate-600 shadow-md relative z-10" />
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white">{player.name}</h3>
                  <div className="flex gap-3 text-sm text-slate-300 mt-1">
                    <span className="flex items-center gap-1 bg-slate-900/50 px-2 py-0.5 rounded"><Heart size={14} className="text-red-400" /> {player.hp}/{player.maxHp}</span>
                    <span className="flex items-center gap-1 bg-slate-900/50 px-2 py-0.5 rounded"><Shield size={14} className="text-slate-400" /> AC {player.ac}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-6 gap-2 text-center">
                  {[
                    { label: 'STR', val: player.stats.str },
                    { label: 'DEX', val: player.stats.dex },
                    { label: 'CON', val: player.stats.con },
                    { label: 'INT', val: player.stats.int },
                    { label: 'WIS', val: player.stats.wis },
                    { label: 'CHA', val: player.stats.cha }
                  ].map(stat => (
                    <div key={stat.label} className="bg-slate-950 border border-slate-800 rounded-lg p-1">
                      <div className="text-[10px] text-slate-500 font-bold">{stat.label}</div>
                      <div className="text-lg font-bold text-slate-200">{stat.val}</div>
                      <div className="text-xs text-slate-400">{getMod(stat.val)}</div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-2"><Eye size={14} className="text-indigo-400"/> תפיסה פסיבית:</span>
                    <span className="font-bold text-white">{player.passivePerception}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-2"><Activity size={14} className="text-emerald-400"/> מהירות:</span>
                    <span className="font-bold text-white">{player.speed} רגל</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CombatTracker = ({ combatants, setCombatants }) => {
  const [activeTurnId, setActiveTurnId] = useState(combatants[0]?.id || null);
  const [round, setRound] = useState(1);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [newPlayerForm, setNewPlayerForm] = useState({ name: '', hp: 10, ac: 10, initiative: 10 });

  useEffect(() => {
    if (combatants.length > 0 && !activeTurnId) setActiveTurnId(combatants[0].id);
  }, [combatants, activeTurnId]);

  const sortedCombatants = [...combatants].sort((a, b) => b.initiative - a.initiative);

  const nextTurn = () => {
    if (sortedCombatants.length === 0) return;
    
    let currentIndex = sortedCombatants.findIndex(c => c.id === activeTurnId);
    let nextIndex = (currentIndex + 1) % sortedCombatants.length;
    
    if (nextIndex === 0) setRound(r => r + 1);

    let loopCount = 0;
    while (sortedCombatants[nextIndex].type === 'enemy' && sortedCombatants[nextIndex].hp <= 0 && loopCount < sortedCombatants.length) {
      nextIndex = (nextIndex + 1) % sortedCombatants.length;
      if (nextIndex === 0) setRound(r => r + 1);
      loopCount++;
    }
    setActiveTurnId(sortedCombatants[nextIndex].id);
  };

  const updateHP = (id, amount) => {
    setCombatants(prev => prev.map(c => {
      if (c.id === id) {
        const newHp = Math.max(0, Math.min(c.maxHp, c.hp + amount));
        return { ...c, hp: newHp };
      }
      return c;
    }));
  };

  const removeCombatant = (id) => {
    setCombatants(prev => prev.filter(c => c.id !== id));
  };

  const handleAddPlayerSubmit = (e) => {
    e.preventDefault();
    const newPlayer = {
      id: Date.now().toString(),
      name: newPlayerForm.name,
      hp: Number(newPlayerForm.hp),
      maxHp: Number(newPlayerForm.hp),
      ac: Number(newPlayerForm.ac),
      initiative: Number(newPlayerForm.initiative),
      type: 'player',
      conditions: [],
      position: null,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${newPlayerForm.name}&backgroundColor=1e3a8a`
    };
    setCombatants([...combatants, newPlayer]);
    setShowAddPlayerModal(false);
    setNewPlayerForm({ name: '', hp: 10, ac: 10, initiative: 10 });
  };

  const addRandomMonster = () => {
    const randomMonster = MONSTER_DB[Math.floor(Math.random() * MONSTER_DB.length)];
    const newId = Date.now().toString();
    const initiative = Math.floor(Math.random() * 20) + 1;
    const newMonster = {
      id: newId,
      name: `${randomMonster.name} (${initiative})`,
      hp: randomMonster.hp, 
      maxHp: randomMonster.hp, 
      ac: randomMonster.ac,
      initiative: initiative,
      type: 'enemy', 
      conditions: [],
      position: null,
      avatar: randomMonster.avatar ? `${randomMonster.avatar}&backgroundColor=${Math.floor(Math.random()*16777215).toString(16)}` : null
    };
    setCombatants(prev => [...prev, newMonster]);
    if (combatants.length === 0) setActiveTurnId(newId);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-amber-500 flex items-center gap-2">
            <Swords /> מנהל קרב
          </h2>
          <p className="text-slate-400">סיבוב {round}</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Button onClick={() => setShowAddPlayerModal(true)} variant="secondary" size="sm" className="flex-1 md:flex-none border border-blue-700/50 hover:bg-blue-900/30 text-blue-400">
            <UserPlus size={16} /> הוסף שחקן
          </Button>
          <Button onClick={addRandomMonster} variant="outline" size="sm" className="flex-1 md:flex-none">
            <Plus size={16} /> אויב אקראי
          </Button>
          <Button onClick={nextTurn} size="sm" className="flex-1 md:flex-none w-full md:w-auto mt-2 md:mt-0">
            תור הבא <Play size={16} className="rotate-180 mr-1" />
          </Button>
        </div>
      </div>

      <div className="space-y-3 pb-24 md:pb-0">
        {sortedCombatants.map((c) => {
          const isActive = c.id === activeTurnId;
          const isDead = c.type === 'enemy' && c.hp <= 0;
          const isUnconscious = c.type === 'player' && c.hp <= 0;
          const hpPercent = (c.hp / c.maxHp) * 100;

          return (
            <div key={c.id} className={`flex flex-col md:flex-row justify-between p-3 md:p-4 rounded-xl border transition-all ${
              isActive ? 'bg-slate-800/80 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 
              isDead ? 'bg-slate-950/50 border-slate-800 opacity-50 grayscale' :
              c.type === 'player' ? 'bg-slate-900 border-blue-900/30' : 'bg-slate-900 border-red-900/20'
            }`}>
              
              <div className="flex items-center gap-4 mb-3 md:mb-0 w-full md:w-1/3">
                <div className="relative">
                  {c.avatar ? (
                    <img src={c.avatar} alt={c.name} className={`w-12 h-12 rounded-xl object-cover border-2 shadow-md ${c.type === 'player' ? 'border-blue-700 bg-blue-900' : 'border-red-700 bg-red-900'}`} />
                  ) : (
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shrink-0 ${
                      c.type === 'player' ? 'bg-blue-900/50 text-blue-400 border border-blue-800' : 'bg-red-900/30 text-red-400 border border-red-800/50'
                    }`}>
                      {c.name.substring(0, 1)}
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 bg-slate-950 border border-slate-700 rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-bold text-amber-500 shadow-md">
                    {c.initiative}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="font-bold text-slate-200 truncate flex items-center gap-2">
                    {c.name} 
                    {isDead && <Skull size={14} className="text-slate-500" />}
                  </h3>
                  <div className="flex gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Shield size={12} /> {c.ac}</span>
                    <span className="flex items-center gap-1"><Heart size={12} className={c.hp <= c.maxHp * 0.3 ? 'text-red-500' : ''} /> {c.hp}/{c.maxHp}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center w-full md:w-1/3 px-0 md:px-4 mb-3 md:mb-0">
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden mb-1 border border-slate-800">
                  <div className={`h-full transition-all duration-300 ${
                    hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 20 ? 'bg-amber-500' : 'bg-red-600'
                  }`} style={{ width: `${hpPercent}%` }}></div>
                </div>
                {isUnconscious && isActive && (
                  <div className="text-red-400 text-xs font-bold animate-pulse flex items-center gap-1 mt-1">
                    <ShieldAlert size={12} /> שים לב: דרושה זריקת הצלת מוות!
                  </div>
                )}
                {isDead && !isUnconscious && (
                  <div className="text-slate-500 text-xs font-bold mt-1">מת / הוסר מהקרב</div>
                )}
              </div>

              <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto">
                <div className="flex bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
                  <button onClick={() => updateHP(c.id, -1)} className="px-3 py-2 hover:bg-red-900/30 text-red-400 transition-colors"><Minus size={16} /></button>
                  <div className="px-3 py-2 font-mono font-bold text-slate-300 border-x border-slate-800 bg-slate-900">{c.hp}</div>
                  <button onClick={() => updateHP(c.id, 1)} className="px-3 py-2 hover:bg-emerald-900/30 text-emerald-400 transition-colors"><Plus size={16} /></button>
                </div>
                <Button onClick={() => removeCombatant(c.id)} variant="ghost" size="icon" className="text-slate-500 hover:text-red-400" title="הסר מהקרב">
                  <X size={18} />
                </Button>
              </div>

            </div>
          );
        })}
        {sortedCombatants.length === 0 && (
          <div className="text-center py-12 text-slate-500 border border-dashed border-slate-700 rounded-xl">
            <Swords className="mx-auto mb-2 opacity-50" size={32} />
            <p>רשימת הקרב ריקה. הוסף שחקנים ואויבים כדי להתחיל.</p>
          </div>
        )}
      </div>

      {showAddPlayerModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2"><UserPlus size={20} /> הוסף שחקן</h3>
            <form onSubmit={handleAddPlayerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">שם הדמות</label>
                <input required type="text" value={newPlayerForm.name} onChange={e => setNewPlayerForm({...newPlayerForm, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">נק"פ (HP)</label>
                  <input required type="number" value={newPlayerForm.hp} onChange={e => setNewPlayerForm({...newPlayerForm, hp: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">דרג"ש (AC)</label>
                  <input required type="number" value={newPlayerForm.ac} onChange={e => setNewPlayerForm({...newPlayerForm, ac: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-blue-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">תוצאת יוזמה</label>
                <input required type="number" value={newPlayerForm.initiative} onChange={e => setNewPlayerForm({...newPlayerForm, initiative: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="pt-2 text-xs text-slate-500 border-t border-slate-800 mt-4">
                * דמות חדשה מתווספת כרגע רק עם נתוני קרב בסיסיים. נתונים מורחבים יעודכנו בהמשך מול שרת.
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white">הוסף שחקן</Button>
                <Button type="button" variant="ghost" onClick={() => setShowAddPlayerModal(false)}>ביטול</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const MonsterManual = ({ combatants, setCombatants }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedMonster, setExpandedMonster] = useState(null);
  
  const addToCombat = (monster) => {
    const initiative = Math.floor(Math.random() * 20) + 1;
    const newMonster = {
      id: Date.now().toString(),
      name: `${monster.name} (${initiative})`,
      hp: monster.hp, 
      maxHp: monster.hp, 
      ac: monster.ac,
      initiative: initiative,
      type: 'enemy', 
      conditions: [],
      position: null,
      avatar: monster.avatar ? `${monster.avatar}&backgroundColor=${Math.floor(Math.random()*16777215).toString(16)}` : null
    };
    setCombatants(prev => [...prev, newMonster].sort((a, b) => b.initiative - a.initiative));
  };

  const filtered = MONSTER_DB.filter(m => m.name.includes(searchTerm));

  return (
    <div className="animate-in fade-in duration-300 h-full flex flex-col relative">
      <h2 className="text-2xl font-bold text-red-500 flex items-center gap-2 mb-4">
        <BookOpen /> מגדיר מפלצות מורחב
      </h2>
      <div className="relative mb-6">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input 
          type="text" 
          placeholder="חפש מפלצת (למשל: עכביש, גובלין)..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pr-10 pl-4 text-slate-200 focus:border-red-500 focus:outline-none shadow-inner"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-y-auto pb-24 custom-scrollbar">
        {filtered.map(monster => (
          <div key={monster.name} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-red-900/50 transition-all flex flex-col shadow-lg">
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex gap-4 items-center">
               <img src={monster.avatar} alt={monster.name} className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700" />
               <div className="flex-1">
                  <h3 className="font-bold text-slate-200 text-lg">{monster.name}</h3>
                  <div className="text-xs text-slate-400 mt-1 flex gap-3">
                    <span className="flex items-center gap-1"><Heart size={14} className="text-red-400" /> {monster.hp} נק"פ</span>
                    <span className="flex items-center gap-1"><Shield size={14} className="text-slate-400" /> {monster.ac} דרג"ש</span>
                  </div>
               </div>
               <Button onClick={() => setExpandedMonster(expandedMonster === monster.name ? null : monster.name)} variant="ghost" size="icon" className="text-slate-400 hover:text-slate-200">
                  <Info size={20} />
               </Button>
            </div>
            
            {expandedMonster === monster.name && (
               <div className="p-4 bg-slate-900 border-b border-slate-800 animate-in slide-in-from-top-2">
                  <p className="text-sm text-slate-400 italic mb-4">{monster.description}</p>
                  
                  {monster.stats && (
                    <div className="grid grid-cols-6 gap-1 text-center mb-4">
                      {[
                        { label: 'STR', val: monster.stats.str },
                        { label: 'DEX', val: monster.stats.dex },
                        { label: 'CON', val: monster.stats.con },
                        { label: 'INT', val: monster.stats.int },
                        { label: 'WIS', val: monster.stats.wis },
                        { label: 'CHA', val: monster.stats.cha }
                      ].map(stat => (
                        <div key={stat.label} className="bg-slate-950 rounded p-1 border border-slate-800">
                          <div className="text-[9px] text-slate-500 font-bold">{stat.label}</div>
                          <div className="text-sm font-bold text-slate-300">{stat.val}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {monster.actions && (
                    <div className="space-y-2">
                       <h4 className="text-xs font-bold text-red-400 border-b border-red-900/30 pb-1 mb-2">פעולות מרכזיות</h4>
                       {monster.actions.map((act, i) => (
                         <div key={i} className="text-xs text-slate-300 flex items-start gap-2 bg-slate-950/50 p-2 rounded">
                            <Swords size={12} className="text-red-500 shrink-0 mt-0.5" />
                            <span>{act}</span>
                         </div>
                       ))}
                    </div>
                  )}
               </div>
            )}
            
            <div className="p-3 bg-slate-900">
               <Button onClick={() => addToCombat(monster)} variant="outline" size="sm" className="w-full border-red-900/30 text-red-400 hover:bg-red-900/20">
                 <Plus size={16} /> הוסף לקרב
               </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BattleMap = ({ combatants, setCombatants, mapObjects, setMapObjects }) => {
  const [selectedTool, setSelectedTool] = useState({ type: null, id: null });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const mapRef = useRef(null);
  const gridSize = 12;
  
  // OPTIMIZATION: Memoize lookup dictionaries to avoid O(N) finds in rendering 144 cells
  const mapObjectsDict = useMemo(() => {
    const dict = {};
    mapObjects.forEach(obj => { dict[`${obj.x},${obj.y}`] = obj.typeId; });
    return dict;
  }, [mapObjects]);

  const combatantsDict = useMemo(() => {
    const dict = {};
    combatants.forEach(c => { 
      if (c.position) dict[`${c.position.x},${c.position.y}`] = c; 
    });
    return dict;
  }, [combatants]);

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  const loadTemplate = (type) => {
    setMapObjects(generateMapTemplate(type, gridSize));
    setShowTemplates(false);
  };

  const handleCellClick = (x, y) => {
    if (selectedTool.type === 'character') {
      const cIndex = combatants.findIndex(c => c.id === selectedTool.id);
      if (cIndex > -1) {
        const updated = [...combatants];
        updated[cIndex].position = { x, y };
        setCombatants(updated);
        setSelectedTool({ type: null, id: null });
      }
    } else if (selectedTool.type === 'environment') {
      if (selectedTool.id === 'eraser') {
        setMapObjects(prev => prev.filter(obj => obj.x !== x || obj.y !== y));
      } else {
        setMapObjects(prev => {
          const filtered = prev.filter(obj => obj.x !== x || obj.y !== y);
          return [...filtered, { x, y, typeId: selectedTool.id }];
        });
      }
    }
  };

  const environmentTools = [
    { id: 'eraser', name: 'מחק', icon: '🧹', color: 'bg-red-900/50' },
    { id: 'tree', name: 'עץ', icon: '🌲', css: 'bg-green-800 rounded-full border-2 border-green-950 shadow-[inset_0_-4px_10px_rgba(0,0,0,0.5)]' },
    { id: 'rock', name: 'סלע', icon: '🪨', css: 'bg-stone-600 rounded-[40%] border-2 border-stone-800 shadow-[inset_0_-2px_5px_rgba(0,0,0,0.4)] rotate-12' },
    { id: 'wall', name: 'קיר אבן', icon: '🧱', css: 'bg-slate-700 rounded-sm border-t-4 border-slate-600 border-x-2 border-x-slate-800 border-b-4 border-b-slate-900' },
    { id: 'water', name: 'מים', icon: '💧', css: 'bg-cyan-600/40 border border-cyan-400/30 shadow-[inset_0_0_15px_rgba(6,182,212,0.3)] animate-pulse' },
    { id: 'bridge', name: 'גשר עץ', icon: '🌉', css: 'bg-amber-900/80 border-y-4 border-amber-950 relative before:content-[""] before:absolute before:inset-0 before:bg-[url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiM1YzQwMzMiLz48cGF0aCBkPSJNMCAwTDQgNFpNNCBMNCAweiIgc3Ryb2tlPSIjM2UyMzE4IiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=")]' },
    { id: 'fire', name: 'מדורה', icon: '🔥', css: 'bg-orange-600/30 rounded-full border-2 border-orange-500/50 shadow-[0_0_15px_#f97316]' },
  ];

  const getEnvStyle = (typeId) => {
    const tool = environmentTools.find(t => t.id === typeId);
    return tool ? tool.css : '';
  };

  return (
    <div className={`flex flex-col animate-in fade-in duration-300 mx-auto ${isFullscreen ? 'fixed inset-0 z-[120] bg-slate-950 p-2 md:p-8 w-full h-full max-w-none' : 'h-full max-w-4xl relative'}`} ref={mapRef}>
      <div className={`mb-4 flex justify-between items-center ${isFullscreen ? 'hidden' : 'block'}`}>
        <div>
          <h2 className="text-2xl font-bold text-blue-500 flex items-center gap-2 mb-2">
            <LayoutDashboard /> מפת קרב טקטית
          </h2>
          <p className="text-slate-400">פתח את המגירה למטה כדי להוסיף תכסית או שחקנים.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowTemplates(!showTemplates)} variant="outline" size="icon" title="תבניות מפה">
             <Map size={20} />
          </Button>
          <Button onClick={toggleFullscreen} variant="secondary" size="icon">
             <Maximize size={20} />
          </Button>
        </div>
      </div>

      {showTemplates && !isFullscreen && (
        <div className="absolute top-16 left-0 bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl z-50 flex flex-col gap-2 animate-in slide-in-from-top-2">
           <h4 className="text-sm font-bold text-slate-300 mb-1">תבניות מהירות</h4>
           <Button variant="ghost" size="sm" onClick={() => loadTemplate('clear')}>🧹 נקה מפה</Button>
           <Button variant="ghost" size="sm" onClick={() => loadTemplate('river')}>🌊 נהר וגשר</Button>
           <Button variant="ghost" size="sm" onClick={() => loadTemplate('forest')}>🌳 יער סבוך</Button>
           <Button variant="ghost" size="sm" onClick={() => loadTemplate('castle')}>🏰 חורבות טירה</Button>
        </div>
      )}

      {isFullscreen && (
         <div className="absolute top-4 left-4 z-50 flex gap-2">
            <Button onClick={() => setShowTemplates(!showTemplates)} variant="secondary" size="icon" className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 shadow-xl">
               <Map size={20} />
            </Button>
            <Button onClick={toggleFullscreen} variant="secondary" size="icon" className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 shadow-xl">
               <Minimize size={20} />
            </Button>
            {showTemplates && (
              <div className="absolute top-12 left-0 bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl flex flex-col gap-2 w-32">
                 <Button variant="ghost" size="sm" onClick={() => loadTemplate('clear')}>נקה מפה</Button>
                 <Button variant="ghost" size="sm" onClick={() => loadTemplate('river')}>נהר</Button>
                 <Button variant="ghost" size="sm" onClick={() => loadTemplate('forest')}>יער</Button>
                 <Button variant="ghost" size="sm" onClick={() => loadTemplate('castle')}>טירה</Button>
              </div>
            )}
         </div>
      )}
      
      <div className={`flex-1 overflow-hidden p-2 relative shadow-inner w-full ${isFullscreen ? 'bg-slate-950 flex flex-col justify-center items-center h-full' : 'bg-slate-900 border border-slate-800 rounded-xl md:p-4'}`}>
        <div className={`aspect-square bg-[#3c3329] grid border-l border-t border-slate-900/50 shadow-2xl bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] ${isFullscreen ? 'w-[95vmin] max-h-[90vh] max-w-none' : 'w-full max-w-2xl mx-auto'}`} 
             style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)`, gridTemplateRows: `repeat(${gridSize}, 1fr)` }}>
          {Array.from({ length: gridSize * gridSize }).map((_, i) => {
            const x = i % gridSize;
            const y = Math.floor(i / gridSize);
            const coordKey = `${x},${y}`;
            const envType = mapObjectsDict[coordKey];
            const occupant = combatantsDict[coordKey];

            return (
              <div 
                key={i} 
                onClick={() => handleCellClick(x, y)}
                className={`border-r border-b border-slate-950/30 flex items-center justify-center relative cursor-pointer hover:bg-amber-500/20 transition-colors ${
                  envType ? getEnvStyle(envType) : ''
                }`}
              >
                {occupant && (
                  <div className={`relative z-10 w-[85%] h-[85%] rounded-full border-2 shadow-[0_4px_10px_rgba(0,0,0,0.8)] overflow-hidden flex items-center justify-center font-bold animate-in zoom-in duration-200 ${
                    occupant.type === 'player' ? 'border-blue-400 bg-blue-900' : 'border-red-400 bg-red-900'
                  }`}>
                    {occupant.avatar ? (
                      <img src={occupant.avatar} alt={occupant.name} className="w-full h-full object-cover scale-110" />
                    ) : (
                      <span className="text-white text-xs">{occupant.name.substring(0, 1)}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Drawer Container */}
      <div className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl bg-slate-900/95 backdrop-blur-xl border-t border-x border-slate-700 rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-transform duration-300 z-[100] ${isToolbarOpen ? 'translate-y-0' : 'translate-y-[calc(100%-10px)]'}`}>
         
         <div 
            onClick={() => setIsToolbarOpen(!isToolbarOpen)}
            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 border-t border-x border-slate-700 px-6 py-2 rounded-t-xl cursor-pointer hover:bg-slate-800 transition-colors flex items-center justify-center shadow-[0_-5px_15px_rgba(0,0,0,0.3)]"
         >
            {isToolbarOpen ? <ChevronDown className="text-amber-500" /> : <ChevronUp className="text-amber-500 animate-bounce" />}
            {!isToolbarOpen && <span className="absolute -top-8 bg-amber-900/90 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap hidden md:block opacity-0 hover:opacity-100 transition-opacity">פתח מגירת כלים</span>}
         </div>

         <div className="p-4 md:p-6 space-y-4 max-h-[40vh] overflow-y-auto custom-scrollbar">
           <div>
             <h4 className="text-sm font-bold text-slate-400 mb-2">תכסית וסביבה (מצייר ברצף)</h4>
             <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
               {environmentTools.map(tool => (
                 <button
                   key={tool.id}
                   onClick={() => setSelectedTool({ type: 'environment', id: tool.id })}
                   className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                     selectedTool.type === 'environment' && selectedTool.id === tool.id
                       ? 'bg-amber-600 text-white border-amber-500'
                       : `bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700`
                   }`}
                 >
                   <span>{tool.name}</span>
                 </button>
               ))}
             </div>
           </div>

           <div>
             <h4 className="text-sm font-bold text-slate-400 mb-2">דמויות ומפלצות להצבה</h4>
             <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
             {combatants.map((c) => {
               const isSelected = selectedTool.type === 'character' && selectedTool.id === c.id;
               const isPlaced = c.position !== null;
               const isDead = c.type === 'enemy' && c.hp <= 0;
               if (isDead && !isPlaced) return null;
               return (
                 <button 
                   key={c.id}
                   onClick={() => setSelectedTool({ type: 'character', id: c.id })}
                   className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
                     isSelected ? 'bg-amber-600 text-white border-amber-500' : 
                     isPlaced ? 'bg-slate-800/50 border-slate-700 text-slate-500 opacity-60' :
                     c.type === 'player' ? 'bg-blue-900/20 border-blue-900/50 text-blue-300' : 'bg-red-900/20 border-red-900/50 text-red-300'
                   }`}
                 >
                   {c.avatar ? (
                     <img src={c.avatar} alt={c.name} className="w-6 h-6 rounded-full bg-slate-800" />
                   ) : (
                     <div className={`w-3 h-3 rounded-full ${c.type === 'player' ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                   )}
                   <span className="text-sm font-medium whitespace-nowrap">{c.name.split(' ')[0]} {isPlaced ? '(מוצב)' : ''}</span>
                 </button>
               );
             })}
             {combatants.length === 0 && <div className="text-slate-500 text-xs py-2">אין משתתפים בקרב להצבה.</div>}
             </div>
           </div>
         </div>
      </div>
    </div>
  );
};

const DiceRollerModal = ({ onClose }) => {
  const [amount, setAmount] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [history, setHistory] = useState([]);
  const [isRolling, setIsRolling] = useState(false);

  const diceTypes = [
    { faces: 4, label: 'd4', color: 'bg-red-900/50 text-red-200 border-red-700' },
    { faces: 6, label: 'd6', color: 'bg-blue-900/50 text-blue-200 border-blue-700' },
    { faces: 8, label: 'd8', color: 'bg-emerald-900/50 text-emerald-200 border-emerald-700' },
    { faces: 10, label: 'd10', color: 'bg-amber-900/50 text-amber-200 border-amber-700' },
    { faces: 12, label: 'd12', color: 'bg-orange-900/50 text-orange-200 border-orange-700' },
    { faces: 20, label: 'd20', color: 'bg-indigo-900/50 text-indigo-200 border-indigo-700' },
    { faces: 100, label: 'd100', color: 'bg-purple-900/50 text-purple-200 border-purple-700' },
  ];

  const rollDice = (faces) => {
    if (isRolling) return;
    setIsRolling(true);
    setTimeout(() => {
      const rolls = Array.from({ length: amount }, () => Math.floor(Math.random() * faces) + 1);
      const sum = rolls.reduce((a, b) => a + b, 0);
      const total = sum + modifier;
      const newResult = {
        id: Date.now(),
        notation: `${amount}d${faces}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''}`,
        rolls,
        modifier,
        total
      };
      setHistory(prev => [newResult, ...prev].slice(0, 10));
      setIsRolling(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200 relative">
        {isRolling && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center">
             <div className="dice-shake-anim">
               <Dices size={80} className="text-amber-500 drop-shadow-[0_0_25px_rgba(245,158,11,0.8)]" />
             </div>
          </div>
        )}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
          <h3 className="font-bold text-white flex items-center gap-2"><Dices className="text-amber-500" /> גלגול קוביות</h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X size={18} /></Button>
        </div>
        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-2">כמות קוביות</label>
              <div className="flex bg-slate-950 rounded-lg border border-slate-700 overflow-hidden">
                <button onClick={() => setAmount(Math.max(1, amount - 1))} className="px-3 py-2 text-slate-400 hover:bg-slate-800"><Minus size={16} /></button>
                <div className="flex-1 flex items-center justify-center font-bold text-white bg-slate-900">{amount}</div>
                <button onClick={() => setAmount(amount + 1)} className="px-3 py-2 text-slate-400 hover:bg-slate-800"><Plus size={16} /></button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-2">תוסף (Modifier)</label>
              <div className="flex bg-slate-950 rounded-lg border border-slate-700 overflow-hidden">
                <button onClick={() => setModifier(modifier - 1)} className="px-3 py-2 text-slate-400 hover:bg-slate-800"><Minus size={16} /></button>
                <div className="flex-1 flex items-center justify-center font-bold text-white bg-slate-900">{modifier > 0 ? `+${modifier}` : modifier}</div>
                <button onClick={() => setModifier(modifier + 1)} className="px-3 py-2 text-slate-400 hover:bg-slate-800"><Plus size={16} /></button>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-2">בחר קובייה</label>
            <div className="grid grid-cols-4 gap-2">
              {diceTypes.map(d => (
                <button key={d.label} onClick={() => rollDice(d.faces)} className={`py-3 rounded-lg border text-sm font-bold flex flex-col items-center gap-1 transition-transform hover:scale-105 ${d.color} ${d.faces === 20 ? 'col-span-2' : ''}`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          {history.length > 0 && (
            <div className="border-t border-slate-800 pt-4">
              <h4 className="text-xs font-bold text-slate-500 mb-3">היסטוריית גלגולים</h4>
              <div className="space-y-2">
                {history.map((res, i) => (
                  <div key={res.id} className={`flex items-center justify-between p-3 rounded-lg border ${i === 0 ? 'bg-amber-900/20 border-amber-900/50' : 'bg-slate-950/50 border-slate-800'}`}>
                    <div className="text-sm font-mono text-slate-400">{res.notation}</div>
                    <div className="flex items-center gap-3">
                      <div className="text-xs text-slate-500 max-w-[100px] truncate" title={res.rolls.join(' + ')}>
                        [{res.rolls.join(', ')}]
                      </div>
                      <div className={`text-xl font-bold ${i === 0 ? 'text-amber-500' : 'text-slate-300'}`}>{res.total}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// הרכיב הראשי שעוטף את כל האפליקציה! 
export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [showDiceRoller, setShowDiceRoller] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // מערכת ניהול קמפיינים (קמפיין חדש מאפס הכל אוטומטית)
  const [campaigns, setCampaigns] = useLocalStorage('dm_campaigns', [{id: '1', name: 'הקמפיין הראשון שלי'}]);
  const [activeCampaignId, setActiveCampaignId] = useLocalStorage('dm_active_campaign', '1');

  // משתני המצב המקומיים שמשתנים לפי הקמפיין הפעיל
  const [combatants, setCombatants] = useState([]);
  const [mapObjects, setMapObjects] = useState([]);
  const [campaignDetails, setCampaignDetails] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // טעינת הנתונים הנכונים מתיקיית הזיכרון כשהמנחה מחליף קמפיין
  useEffect(() => {
    setIsLoaded(false);
    const c = window.localStorage.getItem(`dm_combatants_${activeCampaignId}`);
    setCombatants(c ? JSON.parse(c) : INITIAL_COMBATANTS);
    
    const m = window.localStorage.getItem(`dm_map_${activeCampaignId}`);
    setMapObjects(m ? JSON.parse(m) : []);
    
    const n = window.localStorage.getItem(`dm_notes_${activeCampaignId}`);
    setCampaignDetails(n ? JSON.parse(n) : '');
    
    setIsLoaded(true);
  }, [activeCampaignId]);

  // שמירה חכמה ואוטומטית של הנתונים בכל שינוי במפה או בקרב
  useEffect(() => {
    if (isLoaded) {
      window.localStorage.setItem(`dm_combatants_${activeCampaignId}`, JSON.stringify(combatants));
      window.localStorage.setItem(`dm_map_${activeCampaignId}`, JSON.stringify(mapObjects));
      window.localStorage.setItem(`dm_notes_${activeCampaignId}`, JSON.stringify(campaignDetails));
    }
  }, [combatants, mapObjects, campaignDetails, activeCampaignId, isLoaded]);

  // יצירת קמפיין חדש ונקי לגמרי
  const createNewCampaign = () => {
    const id = Date.now().toString();
    setCampaigns([...campaigns, { id, name: `קמפיין חדש ${new Date().toLocaleDateString('he-IL')}` }]);
    setActiveCampaignId(id); // המעבר עצמו יאפס את הנתונים דרך ה-Effect
    setShowSettings(false);
  };

  const activeCampaign = campaigns.find(c => c.id === activeCampaignId) || campaigns[0];

  const renderView = () => {
    switch (currentView) {
      case 'home': return <DashboardHome navigateTo={setCurrentView} campaignDetails={campaignDetails} setCampaignDetails={setCampaignDetails} />;
      case 'party': return <PartySheet combatants={combatants} />;
      case 'combat': return <CombatTracker combatants={combatants} setCombatants={setCombatants} />;
      case 'map': return <BattleMap combatants={combatants} setCombatants={setCombatants} mapObjects={mapObjects} setMapObjects={setMapObjects} />;
      case 'monsters': return <MonsterManual combatants={combatants} setCombatants={setCombatants} />;
      default: return <DashboardHome navigateTo={setCurrentView} campaignDetails={campaignDetails} setCampaignDetails={setCampaignDetails} />;
    }
  };

  const navItems = [
    { id: 'home', label: 'מבט-על', icon: LayoutDashboard },
    { id: 'party', label: 'החבורה', icon: Users },
    { id: 'combat', label: 'מנהל קרב', icon: Swords },
    { id: 'map', label: 'מפה טקטית', icon: Map },
    { id: 'monsters', label: 'מגדיר מפלצות', icon: BookOpen }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row font-sans" dir="rtl">
      {/* סגנונות גלובליים נקיים לפס הגלילה ואנימציית הקוביות */}
      <style>{`
        @keyframes dice-shake {
          0% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-15deg) scale(1.2); }
          50% { transform: rotate(15deg) scale(1.2); }
          75% { transform: rotate(-15deg) scale(1.2); }
          100% { transform: rotate(0deg) scale(1); }
        }
        .dice-shake-anim { animation: dice-shake 0.5s ease-in-out infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.5); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(245, 158, 11, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(245, 158, 11, 0.5); }
      `}</style>

      {/* תפריט עליון (נייד בלבד) */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="font-black text-xl text-amber-500 tracking-wider flex items-center gap-2">
          <Shield size={20} /> Master's Vault
        </h1>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => setShowDiceRoller(true)}><Dices size={20} className="text-amber-500" /></Button>
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}><Settings size={20} className="text-slate-400" /></Button>
        </div>
      </div>

      {/* תפריט צדדי (מחשב) */}
      <div className="hidden md:flex flex-col w-64 bg-slate-900 border-l border-slate-800 relative z-40 shadow-2xl">
        <div className="p-6 border-b border-slate-800">
          <h1 className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600 tracking-wider mb-1 flex items-center gap-2">
            <Shield size={24} className="text-amber-500"/> Master's Vault
          </h1>
          <div className="flex items-center justify-between mt-4 bg-slate-950 p-2 rounded-lg border border-slate-800 shadow-inner">
             <span className="text-sm text-slate-400 truncate flex-1">{activeCampaign.name}</span>
             <Button variant="ghost" size="icon" className="w-6 h-6 hover:text-amber-400" onClick={() => setShowSettings(true)}>
               <Settings size={14} />
             </Button>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                currentView === item.id 
                  ? 'bg-amber-600/10 text-amber-500 border border-amber-500/20 shadow-sm' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Button onClick={() => setShowDiceRoller(true)} variant="secondary" className="w-full justify-center border border-amber-900/50 hover:bg-amber-900/30 text-amber-500 shadow-md">
             <Dices size={20} /> קוביות למנחה
          </Button>
        </div>
      </div>

      {/* תפריט ניווט תחתון (נייד בלבד) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around p-2 z-40 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-colors ${
              currentView === item.id ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <item.icon size={20} />
            <span className="text-[10px]">{item.label}</span>
          </button>
        ))}
      </div>

      {/* אזור התוכן הראשי (המסכים המשתנים) */}
      <main className="flex-1 relative overflow-hidden flex flex-col h-[calc(100vh-140px)] md:h-screen">
        <div className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar relative">
           {!isLoaded ? (
             <div className="h-full flex justify-center items-center text-slate-500 font-bold animate-pulse">טוען נתוני קמפיין...</div>
           ) : (
             renderView()
           )}
        </div>
      </main>

      {/* חלונות מודאליים שמרחפים מעל הכל */}
      {showDiceRoller && <DiceRollerModal onClose={() => setShowDiceRoller(false)} />}
      
      {showSettings && (
         <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95">
               <h3 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2"><Settings size={20} /> הגדרות וקמפיינים</h3>
               
               <div className="space-y-4 mb-6">
                  <h4 className="text-sm text-slate-400 border-b border-slate-800 pb-2">בחר קמפיין פעיל</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                     {campaigns.map(c => (
                        <div key={c.id} onClick={() => { setActiveCampaignId(c.id); setShowSettings(false); }} className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center transition-colors ${activeCampaignId === c.id ? 'bg-amber-900/30 border-amber-500 text-amber-400 shadow-md' : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'}`}>
                           <span className="font-bold">{c.name}</span>
                           {activeCampaignId === c.id && <span className="text-xs bg-amber-500 text-slate-900 px-2 py-0.5 rounded-full font-bold">פעיל</span>}
                        </div>
                     ))}
                  </div>
                  
                  <Button onClick={createNewCampaign} variant="outline" className="w-full border-dashed border-slate-600 text-slate-400 hover:text-slate-200 hover:border-slate-400">
                     <Plus size={16} /> יצירת קמפיין חדש
                  </Button>
               </div>
               
               <div className="flex justify-end">
                  <Button onClick={() => setShowSettings(false)} variant="ghost" className="hover:bg-slate-800 text-slate-300">סגור</Button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}