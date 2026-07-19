// Coffee bag packaging varies wildly — this is a best-effort router that scans OCR'd text
// for known keywords/values and proposes field guesses. It's deliberately conservative
// (first match wins, no fuzzy matching) since a wrong guess is worse than no guess: the
// full text always stays available in the bean's notes so nothing is lost either way.

const ORIGIN_COUNTRIES: Record<string, string> = {
  ethiopia: "Ethiopia",
  etiopie: "Ethiopia",
  colombia: "Colombia",
  kolumbie: "Colombia",
  kenya: "Kenya",
  keňa: "Kenya",
  kena: "Kenya",
  brazil: "Brazil",
  brazílie: "Brazil",
  brazilie: "Brazil",
  guatemala: "Guatemala",
  "costa rica": "Costa Rica",
  kostarika: "Costa Rica",
  rwanda: "Rwanda",
  burundi: "Burundi",
  honduras: "Honduras",
  peru: "Peru",
  panama: "Panama",
  indonesia: "Indonesia",
  indonésie: "Indonesia",
  indonesie: "Indonesia",
  sumatra: "Indonesia",
  yemen: "Yemen",
  jemen: "Yemen",
  mexico: "Mexico",
  mexiko: "Mexico",
  "el salvador": "El Salvador",
  nicaragua: "Nicaragua",
  tanzania: "Tanzania",
  uganda: "Uganda",
  india: "India",
  "papua new guinea": "Papua New Guinea",
};

const PROCESSES: Record<string, string> = {
  washed: "Washed",
  "wet process": "Washed",
  praný: "Washed",
  prany: "Washed",
  myté: "Washed",
  myte: "Washed",
  natural: "Natural",
  přírodní: "Natural",
  prirodni: "Natural",
  honey: "Honey",
  medová: "Honey",
  medova: "Honey",
  anaerobic: "Anaerobic",
  anaerobní: "Anaerobic",
  anaerobni: "Anaerobic",
  "carbonic maceration": "Carbonic Maceration",
  "wet hulled": "Wet Hulled",
  fermented: "Fermented",
  fermentace: "Fermented",
  fermentovaná: "Fermented",
  fermentovana: "Fermented",
};

const ROAST_LEVELS: Record<string, string> = {
  "light roast": "Light",
  light: "Light",
  světlé: "Light",
  svetle: "Light",
  "medium roast": "Medium",
  medium: "Medium",
  středně: "Medium",
  stredne: "Medium",
  "dark roast": "Dark",
  dark: "Dark",
  tmavé: "Dark",
  tmave: "Dark",
  filter: "Filter",
  filtr: "Filter",
  espresso: "Espresso",
};

const VARIETIES = [
  "Bourbon",
  "Typica",
  "Caturra",
  "Catuai",
  "Castillo",
  "Geisha",
  "Gesha",
  "SL28",
  "SL34",
  "Pacamara",
  "Villa Sarchi",
  "Pink Bourbon",
  "Java",
  "Mundo Novo",
  "Catimor",
  "Maragogype",
];

export interface OcrGuess {
  name?: string;
  origin_country?: string;
  process?: string;
  roast_level?: string;
  variety?: string;
  tasting_notes: string[];
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findFirstMatch(text: string, dictionary: Record<string, string>): string | undefined {
  for (const [keyword, value] of Object.entries(dictionary)) {
    if (new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "i").test(text)) return value;
  }
  return undefined;
}

export function guessBeanFieldsFromText(text: string): OcrGuess {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const guess: OcrGuess = { tasting_notes: [] };
  if (lines[0]) guess.name = lines[0];

  guess.origin_country = findFirstMatch(text, ORIGIN_COUNTRIES);
  guess.process = findFirstMatch(text, PROCESSES);
  guess.roast_level = findFirstMatch(text, ROAST_LEVELS);

  const foundVarieties = VARIETIES.filter((v) => new RegExp(`\\b${escapeRegExp(v)}\\b`, "i").test(text));
  if (foundVarieties.length) guess.variety = foundVarieties.join(", ");

  const notesLine = lines.find((l) => /^(notes?|chuť|chut|tasting|profil)/i.test(l));
  if (notesLine) {
    const afterColon = notesLine.split(/[:：]/).slice(1).join(":").trim();
    if (afterColon) {
      guess.tasting_notes = afterColon
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }

  return guess;
}
