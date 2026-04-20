export type Sponsor = {
  name: string;
  tier: "Main" | "Technical" | "Official" | "Local";
  url?: string;
};

export const sponsors: Sponsor[] = [
  { name: "Colacchi Costruzioni", tier: "Main" },
  { name: "Valle del Sacco Energia", tier: "Main" },
  { name: "Erreà", tier: "Technical" },
  { name: "Banca Popolare del Frusinate", tier: "Official" },
  { name: "Farmacia Centrale Colleferro", tier: "Official" },
  { name: "Autofficina Rossi", tier: "Local" },
  { name: "Pizzeria Da Gino", tier: "Local" },
  { name: "Panificio San Bruno", tier: "Local" },
];
