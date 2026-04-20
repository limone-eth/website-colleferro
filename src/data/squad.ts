export type Player = {
  number: number;
  name: string;
  role: "Portiere" | "Difensore" | "Centrocampista" | "Attaccante";
  dob?: string;
  nationality?: string;
};

export const squad: Player[] = [
  { number: 1, name: "Matteo Valente", role: "Portiere", dob: "1998", nationality: "ITA" },
  { number: 22, name: "Davide Luberti", role: "Portiere", dob: "2002", nationality: "ITA" },
  { number: 12, name: "Simone Parisi", role: "Portiere", dob: "2005", nationality: "ITA" },

  { number: 2, name: "Francesco Di Giorgio", role: "Difensore", dob: "1996", nationality: "ITA" },
  { number: 3, name: "Alessio Rocchi", role: "Difensore", dob: "1999", nationality: "ITA" },
  { number: 4, name: "Luca Fanucci", role: "Difensore", dob: "1993", nationality: "ITA" },
  { number: 5, name: "Marco Palombi", role: "Difensore", dob: "1994", nationality: "ITA" },
  { number: 6, name: "Giorgio Iacovacci", role: "Difensore", dob: "2001", nationality: "ITA" },
  { number: 15, name: "Kevin Romani", role: "Difensore", dob: "2003", nationality: "ITA" },
  { number: 23, name: "Emanuele Truzzolino", role: "Difensore", dob: "2000", nationality: "ITA" },

  { number: 8, name: "Riccardo Santilli", role: "Centrocampista", dob: "1997", nationality: "ITA" },
  { number: 10, name: "Daniele Cerroni", role: "Centrocampista", dob: "1995", nationality: "ITA" },
  { number: 14, name: "Tommaso Gaetani", role: "Centrocampista", dob: "2002", nationality: "ITA" },
  { number: 16, name: "Andrea Proietti", role: "Centrocampista", dob: "1998", nationality: "ITA" },
  { number: 18, name: "Federico Magrini", role: "Centrocampista", dob: "2000", nationality: "ITA" },
  { number: 20, name: "Mattia Cascioli", role: "Centrocampista", dob: "2004", nationality: "ITA" },

  { number: 7, name: "Lorenzo Bastianelli", role: "Attaccante", dob: "1996", nationality: "ITA" },
  { number: 9, name: "Simone Tolfo", role: "Attaccante", dob: "1994", nationality: "ITA" },
  { number: 11, name: "Niccolò Petrassi", role: "Attaccante", dob: "2001", nationality: "ITA" },
  { number: 17, name: "Omar Traoré", role: "Attaccante", dob: "2003", nationality: "CIV" },
  { number: 19, name: "Gabriele Volpi", role: "Attaccante", dob: "2005", nationality: "ITA" },
];
