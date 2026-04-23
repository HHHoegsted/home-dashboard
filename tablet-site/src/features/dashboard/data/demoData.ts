import type { DashboardData } from "../../../types/dashboard";

export const demoData: DashboardData = {
  now: {
    time: "18:42",
    dateLabel: "torsdag · 23. april",
  },
  weather: {
    location: "Hjemme",
    tempC: 12,
    condition: "Skyet med let vind",
    highC: 14,
    lowC: 7,
    rainChance: 28,
    updatedAt: "18:30",
  },
  meal: {
    title: "Boller i karry med ris",
    mealType: "Aftensmad",
    servings: 4,
    source: "Mealie",
    image:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80",
  },
  eventsToday: [
    {
      id: 1,
      title: "Hente Charlie fra skole",
      start: "14:45",
      end: "15:15",
      location: "Skolen",
      type: "familie",
    },
    {
      id: 2,
      title: "Fodboldtræning",
      start: "17:00",
      end: "18:30",
      location: "Idrætshallen",
      type: "børn",
    },
    {
      id: 3,
      title: "Tag kød op til i morgen",
      start: "20:00",
      end: "20:05",
      location: "Køkkenet",
      type: "hjem",
    },
  ],
  upcoming: [
    {
      id: 1,
      title: "Tandlæge",
      start: "fre 09:00",
      end: "09:30",
      location: "Tandklinikken",
      source: "Familiekalender",
    },
    {
      id: 2,
      title: "Fødselsdag hos mormor",
      start: "lør 13:00",
      end: "16:00",
      location: "Mormors hus",
      source: "Delt kalender",
    },
    {
      id: 3,
      title: "Skrald afhentes",
      start: "man 06:00",
      end: "06:10",
      location: "Indkørslen",
      source: "Hjemmepåmindelser",
    },
    {
      id: 4,
      title: "Hente dagligvarer",
      start: "tir 16:30",
      end: "17:00",
      location: "Supermarkedet",
      source: "Familiekalender",
    },
  ],
  household: [
    { id: 1, label: "Inde", value: "21,4°C" },
    { id: 2, label: "Ude", value: "12°C" },
    { id: 3, label: "Regn", value: "28%" },
    { id: 4, label: "Næste", value: "17:00" },
  ],
};