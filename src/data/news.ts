export type NewsPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  dateIso: string;
  category: "Prima Squadra" | "Società" | "Biglietteria" | "Giovanili" | "Partner";
  author: string;
  body: string[];
  featured?: boolean;
};

export const news: NewsPost[] = [
  {
    slug: "vittoria-casalinga-contro-aranova",
    title: "Vittoria casalinga: il Colleferro piega l'Aranova 1-0",
    excerpt:
      "Gol decisivo di Bastianelli al 78’. Al “Caslini” tre punti d'oro per la corsa playoff.",
    date: "14 Apr 2026",
    dateIso: "2026-04-14",
    category: "Prima Squadra",
    author: "Redazione",
    featured: true,
    body: [
      "Al “Caslini” va in scena una partita tesa, decisa nel finale da un colpo di testa di Lorenzo Bastianelli al 78’ su cross di Cerroni.",
      "Primo tempo di studio, con il Colleferro più propositivo ma poco preciso sotto porta. Nella ripresa cresce il ritmo e arriva il gol che vale tre punti pesantissimi.",
      "Il tecnico Fumagalli a fine gara: «I ragazzi hanno interpretato la partita con la testa giusta. Ora concentrati su Montespaccato, per noi è un’altra finale».",
    ],
  },
  {
    slug: "biglietti-colleferro-montespaccato",
    title: "Aperta la prevendita per Colleferro — Montespaccato",
    excerpt:
      "Da mercoledì disponibili i tagliandi per la sfida di domenica 26 aprile al “Caslini”. Riduzioni per under 14 e abbonati.",
    date: "11 Apr 2026",
    dateIso: "2026-04-11",
    category: "Biglietteria",
    author: "Ufficio Stampa",
    body: [
      "Da mercoledì 15 aprile sono disponibili in prevendita i biglietti per Colleferro — Montespaccato, in programma domenica 26 aprile alle 15:00.",
      "Prezzo intero 8 €, ridotto 5 € (donne, over 65, residenti a Colleferro), under 14 ingresso gratuito accompagnati da un adulto pagante. Gli abbonati accedono con la tessera.",
      "Biglietti disponibili online e presso il botteghino dello stadio a partire da un'ora prima del fischio d'inizio.",
    ],
  },
  {
    slug: "rinnovo-sponsor-colacchi",
    title: "Colacchi Costruzioni rinnova la partnership con il club",
    excerpt:
      "Confermato per la seconda stagione consecutiva il main sponsor rossonero. «Un legame che va oltre il calcio».",
    date: "08 Apr 2026",
    dateIso: "2026-04-08",
    category: "Partner",
    author: "Redazione",
    body: [
      "Colacchi Costruzioni sarà ancora al fianco del Colleferro Calcio. Accordo biennale annunciato questa mattina in Sala Consiliare.",
      "Il Presidente Colasanti: «Ringraziamo Antonio Colacchi per aver creduto ancora una volta nel progetto rossonero. È il segno che il club è percepito come valore per il territorio».",
    ],
  },
  {
    slug: "juniores-pareggio-europaldo",
    title: "Juniores: pari esterno 1-1 contro l'Europaldo",
    excerpt:
      "I ragazzi di mister Gabrielli strappano un punto in trasferta. Romani ancora in gol.",
    date: "06 Apr 2026",
    dateIso: "2026-04-06",
    category: "Giovanili",
    author: "Settore Giovanile",
    body: [
      "Buona prova dei ragazzi rossoneri in trasferta. Vantaggio ospite con Romani al 32’, pareggio locale su rigore a inizio ripresa.",
    ],
  },
  {
    slug: "open-day-scuola-calcio",
    title: "Open Day Scuola Calcio: sabato 10 maggio al “Caslini”",
    excerpt:
      "Una giornata per conoscere lo staff, provare gli allenamenti e scoprire i valori del settore giovanile rossonero.",
    date: "03 Apr 2026",
    dateIso: "2026-04-03",
    category: "Società",
    author: "Settore Giovanile",
    body: [
      "Sabato 10 maggio, dalle 10:00 alle 13:00, il Colleferro Calcio apre le porte del “Caslini” a bambini e famiglie per l'Open Day della Scuola Calcio.",
      "Sono invitati bambini e bambine nati tra il 2013 e il 2020. È sufficiente presentarsi con abbigliamento sportivo e una bottiglietta d’acqua. Per informazioni: giovanili@colleferrocalcio.it.",
    ],
  },
  {
    slug: "intervista-presidente-colasanti",
    title: "Presidente Colasanti: «Il Colleferro torna a sognare»",
    excerpt:
      "Il numero uno rossonero traccia il bilancio della stagione e parla del progetto triennale.",
    date: "29 Mar 2026",
    dateIso: "2026-03-29",
    category: "Società",
    author: "Redazione",
    body: [
      "«Non ci nascondiamo dietro un dito: vogliamo tornare dove il Colleferro merita di stare». Il Presidente Antonio Colasanti presenta la fase finale della stagione.",
      "«Abbiamo costruito una rosa corta ma solida, con tanti ragazzi del territorio. I risultati parlano e ci danno fiducia in vista del prossimo triennio».",
    ],
  },
];

export const featuredNews = news.find((n) => n.featured) ?? news[0];
export const latestNews = news.slice(0, 4);
