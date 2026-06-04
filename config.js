const CONFIG = {
  whatsapp: "491703044341",
  formspree: "https://formspree.io/f/mlgkrqjg",
  supabaseUrl: "https://cmpagnbvympkrtcjnefz.supabase.co",
  supabaseKey: "sb_publishable_B66wSpD1Xd2a7PkCUAZBQQ_qYY6650Q",
  categories: ["Șoferi", "Construcții", "Depozit & Logistică", "Producție", "HoReCa", "Agricultură", "Curățenie", "Îngrijire & Medical"]
};

const FALLBACK_JOBS = [
  {
    id: "sofer-curier-amazon",
    active: true,
    title: "Șofer Curier Amazon Germania",
    category: "Categoria B",
    salary: "2850 € brut / lună",
    image: "assets/images/hero-soferi-germania.webp.png",
    facts: { locatii: "Nürnberg / Nittenau", permis: "Categoria B", tip: "Full-time", tara: "Germania" },
    perks: ["Contract legal de muncă", "Cazare disponibilă contra cost", "Program de lucru stabil"],
    intro: "Căutăm șoferi de curierat pentru livrarea coletelor Amazon în zona Nürnberg / Nittenau. Postul este cu contract legal de muncă, program stabil și echipă care te sprijină de la sosire.",
    responsibilities: ["Livrarea coletelor Amazon către clienți", "Respectarea rutelor și termenelor de livrare", "Utilizarea aplicației de livrare", "Păstrarea autovehiculului curat și în stare bună"],
    requirements: ["Permis categoria B valabil", "Seriozitate și punctualitate", "Cunoștințe minime de germană sau engleză (un plus)"],
    offer: ["2850 € brut / lună", "Contract legal de muncă", "Cazare disponibilă contra cost", "Program de lucru stabil"]
  },
  {
    id: "sofer-ce-amazon",
    active: true,
    title: "Șofer Profesionist C+E Amazon Germania",
    category: "Categoria C+E",
    salary: "3000 – 3200 € net",
    image: "assets/images/hero-soferi-germania.webp.png",
    facts: { locatii: "Germania / Eggolsheim", permis: "C+E", tip: "Full-time", tara: "Germania" },
    perks: ["Contract de muncă direct", "Bonus de performanță săptămânal", "Camioane moderne, program planificat"],
    intro: "Recrutăm șoferi profesioniști categoria C+E pentru transport, cu plecare din zona Eggolsheim. Camioane moderne, program planificat și contract de muncă direct.",
    responsibilities: ["Transport rutier de mărfuri pe rute planificate", "Respectarea timpilor de condus și a regulamentelor", "Întreținerea de bază și verificarea zilnică a vehiculului"],
    requirements: ["Permis categoria C+E valabil", "Card tahograf și atestat profesional", "Experiență anterioară (un plus)"],
    offer: ["3000 – 3200 € net", "Contract de muncă direct", "Bonus de performanță săptămânal", "Camioane moderne, program planificat"]
  }
];
