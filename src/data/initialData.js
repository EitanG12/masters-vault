export const INITIAL_COMBATANTS = [];
export const INITIAL_PARTY = [];
export const INITIAL_MAP_OBJECTS = [];

export const INITIAL_CAMPAIGNS = [
  {
    id: 'camp-1',
    name: 'קמפיין חדש',
    notes: '',
  },
];

export function createEmptyCampaign(index = 1) {
  return {
    id: `camp-${Date.now()}`,
    name: `קמפיין ${index}`,
    notes: '',
  };
}
