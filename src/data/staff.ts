export type StaffMember = {
  name: string;
  role: string;
  group: "Tecnico" | "Medico" | "Dirigenza";
};

export const staff: StaffMember[] = [
  { name: "Paolo Fumagalli", role: "Allenatore Prima Squadra", group: "Tecnico" },
  { name: "Stefano Ricciardelli", role: "Vice Allenatore", group: "Tecnico" },
  { name: "Marco Tiberi", role: "Preparatore dei Portieri", group: "Tecnico" },
  { name: "Enrico Galeazzi", role: "Preparatore Atletico", group: "Tecnico" },
  { name: "Claudio Mariani", role: "Match Analyst", group: "Tecnico" },

  { name: "Dott. Giorgio Savelli", role: "Medico Sociale", group: "Medico" },
  { name: "Luca Bernardini", role: "Fisioterapista", group: "Medico" },
  { name: "Alessia Franceschini", role: "Nutrizionista", group: "Medico" },

  { name: "Antonio Colasanti", role: "Presidente", group: "Dirigenza" },
  { name: "Giulia Morelli", role: "Direttore Generale", group: "Dirigenza" },
  { name: "Pierluigi Santini", role: "Direttore Sportivo", group: "Dirigenza" },
  { name: "Valerio De Santis", role: "Team Manager", group: "Dirigenza" },
  { name: "Chiara Bertolini", role: "Segretaria Generale", group: "Dirigenza" },
];
