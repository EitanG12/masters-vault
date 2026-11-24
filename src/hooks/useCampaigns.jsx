import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_CAMPAIGNS,
  INITIAL_COMBATANTS,
  INITIAL_PARTY,
  INITIAL_MAP_OBJECTS,
  createEmptyCampaign,
} from '../data/initialData';

const STORAGE_KEY = 'masters_vault_state_v1';

// 1. יצירת ה-Context
const CampaignContext = createContext();

function loadInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        campaigns: INITIAL_CAMPAIGNS,
        activeCampaignId: INITIAL_CAMPAIGNS[0].id,
        combatants: INITIAL_COMBATANTS,
        party: INITIAL_PARTY,
        mapObjects: INITIAL_MAP_OBJECTS,
        monsters: [],
      };
    }
    const parsed = JSON.parse(raw);
    const campaigns =
      Array.isArray(parsed.campaigns) && parsed.campaigns.length > 0
        ? parsed.campaigns
        : INITIAL_CAMPAIGNS;
    const activeCampaignId = campaigns.some((c) => c.id === parsed.activeCampaignId)
      ? parsed.activeCampaignId
      : campaigns[0].id;

    return {
      campaigns,
      activeCampaignId,
      combatants: Array.isArray(parsed.combatants)
        ? parsed.combatants.map((combatant) => ({
            ...combatant,
            effects: Array.isArray(combatant.effects) ? combatant.effects : [],
          }))
        : INITIAL_COMBATANTS,
      party: Array.isArray(parsed.party) ? parsed.party : INITIAL_PARTY,
      mapObjects: Array.isArray(parsed.mapObjects) ? parsed.mapObjects : INITIAL_MAP_OBJECTS,
      monsters: Array.isArray(parsed.monsters) ? parsed.monsters : [],
    };
  } catch {
    return {
      campaigns: INITIAL_CAMPAIGNS,
      activeCampaignId: INITIAL_CAMPAIGNS[0].id,
      combatants: INITIAL_COMBATANTS,
      party: INITIAL_PARTY,
      mapObjects: INITIAL_MAP_OBJECTS,
      monsters: [],
    };
  }
}

// 2. מעטפת ה-Provider שתחזיק את הנתונים לכל האפליקציה
export function CampaignProvider({ children }) {
  const initial = loadInitialState();

  const [campaigns, setCampaigns] = useState(initial.campaigns);
  const [activeCampaignId, setActiveCampaignId] = useState(initial.activeCampaignId);
  const [combatants, setCombatants] = useState(initial.combatants);
  const [party, setParty] = useState(initial.party);
  const [mapObjects, setMapObjects] = useState(initial.mapObjects);
  const [monsters, setMonsters] = useState(initial.monsters);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          campaigns,
          activeCampaignId,
          combatants,
          party,
          mapObjects,
          monsters,
        })
      );
    } catch {
      // התעלמות משגיאות אחסון מקומי במידת הצורך
    }
  }, [campaigns, activeCampaignId, combatants, party, mapObjects, monsters]);

  const activeCampaign =
    campaigns.find((c) => c.id === activeCampaignId) || campaigns[0];

  function createCampaign(customName = '') {
    const nextIndex = campaigns.length + 1;
    const newCamp = createEmptyCampaign(nextIndex);
    if (customName.trim()) {
      newCamp.name = customName.trim();
    }

    setCampaigns((prev) => [...prev, newCamp]);
    setActiveCampaignId(newCamp.id);
    setCombatants([]);
    setParty([]);
    setMapObjects([]);
    setMonsters([]);
  }

  function updateCampaignNotes(notes) {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === activeCampaign.id ? { ...c, notes } : c))
    );
  }

  function renameCampaign(campaignId, name) {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, name: trimmed } : c))
    );
  }

  function deleteCampaign(campaignId) {
    const remaining = campaigns.filter((c) => c.id !== campaignId);

    if (remaining.length === 0) {
      const fresh = createEmptyCampaign(1);
      setCampaigns([fresh]);
      setActiveCampaignId(fresh.id);
      setCombatants([]);
      setParty([]);
      setMapObjects([]);
      setMonsters([]);
      return;
    }

    setCampaigns(remaining);
    if (activeCampaignId === campaignId) {
      setActiveCampaignId(remaining[0].id);
    }
  }

  // איגוד כל הנתונים לאובייקט אחד שיהיה זמין לכולם
  const value = {
    campaigns,
    activeCampaign,
    activeCampaignId: activeCampaign.id,
    setActiveCampaignId,
    createCampaign,
    updateCampaignNotes,
    renameCampaign,
    deleteCampaign,
    combatants,
    setCombatants,
    party,
    setParty,
    mapObjects,
    setMapObjects,
    monsters,
    setMonsters,
  };

  return (
    <CampaignContext.Provider value={value}>
      {children}
    </CampaignContext.Provider>
  );
}

// 3. הוק מותאם אישית לצריכת הנתונים (שימוש קל וקצר בכל קובץ)
export function useCampaignContext() {
  const context = useContext(CampaignContext);
  if (!context) {
    throw new Error('useCampaignContext must be used within a CampaignProvider');
  }
  return context;
}