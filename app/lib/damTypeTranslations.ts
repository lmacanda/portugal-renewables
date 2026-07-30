// lib/damTypeTranslations.ts
export const DAM_TYPE_TRANSLATIONS: Record<string, string> = {
  "Gravidade de betão": "Concrete gravity",
  "Abóboda": "Arch",
  "Contrafortes": "Buttress",
  "Arcos Múltiplos": "Multiple arch",
  "Terra": "Earthfill",
  "Terra zonada": "Zoned earthfill",
  "Terra homogénea": "Homogeneous earthfill",
  "Alvenaria": "Masonry",
  "Enrocamento com cortina a montante": "Rockfill, upstream face",
};

export function translateDamType(type: string): string {
  return DAM_TYPE_TRANSLATIONS[type] ?? type; // fall back to original if not in the map
}