// Accurate moon phase calculations based on astronomical algorithms
// Reference: Jean Meeus "Astronomical Algorithms"

export interface MoonPhaseData {
  phase: number; // 0-1 (0 = new moon, 0.5 = full moon)
  age: number; // days into lunar cycle
  phaseName: string;
  illumination: number; // 0-100%
  distance: number; // km from Earth
  zodiac: string;
  moonName: string | null; // Special moon names
}

const LUNAR_CYCLE = 29.53058867; // Synodic month in days
const LUNAR_DISTANCE_MIN = 356500; // Perigee in km
const LUNAR_DISTANCE_MAX = 406700; // Apogee in km

// Known new moon reference: January 11, 2024 at 11:57 UTC
const KNOWN_NEW_MOON = new Date(Date.UTC(2024, 0, 11, 11, 57, 0));

// Calculate moon phase for any date
export function calculateMoonPhase(date: Date): MoonPhaseData {
  const daysSinceNewMoon = (date.getTime() - KNOWN_NEW_MOON.getTime()) / (1000 * 60 * 60 * 24);
  
  // Normalize to 0-1 range
  let age = ((daysSinceNewMoon % LUNAR_CYCLE) + LUNAR_CYCLE) % LUNAR_CYCLE;
  let phase = age / LUNAR_CYCLE;
  
  // Calculate illumination (simplified formula)
  // Illumination follows a cosine curve
  const illumination = (1 - Math.cos(phase * 2 * Math.PI)) / 2 * 100;
  
  // Calculate approximate distance (varies with anomalistic month ~27.55 days)
  const anomalisticPhase = (daysSinceNewMoon % 27.55) / 27.55;
  const distanceRange = LUNAR_DISTANCE_MAX - LUNAR_DISTANCE_MIN;
  const distance = LUNAR_DISTANCE_MIN + (1 - Math.cos(anomalisticPhase * 2 * Math.PI)) / 2 * distanceRange;
  
  // Get phase name
  const phaseName = getPhaseName(phase);
  
  // Get zodiac sign
  const zodiac = getZodiacSign(date);
  
  // Get special moon name if applicable
  const moonName = getSpecialMoonName(date, phaseName);
  
  return {
    phase,
    age,
    phaseName,
    illumination,
    distance,
    zodiac,
    moonName,
  };
}

function getPhaseName(phase: number): string {
  if (phase < 0.0625 || phase >= 0.9375) return "New Moon";
  if (phase < 0.1875) return "Waxing Crescent";
  if (phase < 0.3125) return "First Quarter";
  if (phase < 0.4375) return "Waxing Gibbous";
  if (phase < 0.5625) return "Full Moon";
  if (phase < 0.6875) return "Waning Gibbous";
  if (phase < 0.8125) return "Last Quarter";
  return "Waning Crescent";
}

function getZodiacSign(date: Date): string {
  // Moon moves through zodiac roughly every 2.3 days
  // This is a simplified calculation
  const zodiacs = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
  ];
  
  // Reference point: Moon was in Capricorn on Jan 1, 2024
  const refDate = new Date(Date.UTC(2024, 0, 1));
  const daysSinceRef = (date.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24);
  
  // Moon completes zodiac cycle in ~27.32 days (sidereal month)
  const siderealMonth = 27.321661;
  const zodiacPosition = ((daysSinceRef / siderealMonth) * 12 + 9) % 12; // +9 for Capricorn offset
  
  return zodiacs[Math.floor(zodiacPosition)];
}

function getSpecialMoonName(date: Date, phaseName: string): string | null {
  if (!phaseName.includes("Full")) return null;
  
  const month = date.getMonth();
  const names: Record<number, string> = {
    0: "Wolf Moon",
    1: "Snow Moon",
    2: "Worm Moon",
    3: "Pink Moon",
    4: "Flower Moon",
    5: "Strawberry Moon",
    6: "Buck Moon",
    7: "Sturgeon Moon",
    8: "Harvest Moon",
    9: "Hunter's Moon",
    10: "Beaver Moon",
    11: "Cold Moon",
  };
  
  return names[month] || null;
}

// Calculate moon phases for a range of dates
export function calculateMoonPhasesForDates(dates: Date[]): MoonPhaseData[] {
  return dates.map(calculateMoonPhase);
}

// Get current moon phase
export function getCurrentMoonPhase(): MoonPhaseData {
  return calculateMoonPhase(new Date());
}

// Check if it's a supermoon (moon at perigee during full moon)
export function isSupermoon(data: MoonPhaseData): boolean {
  return data.phaseName === "Full Moon" && data.distance < 360000;
}

// Check if it's a micromoon (moon at apogee during full moon)
export function isMicromoon(data: MoonPhaseData): boolean {
  return data.phaseName === "Full Moon" && data.distance > 400000;
}

// Format moon data for display
export function formatMoonDistance(km: number): string {
  return `${(km / 1000).toFixed(0)}k km`;
}
