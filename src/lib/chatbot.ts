import type { Service } from "@/types";
import { buildIndex, searchServices } from "./search";

export type ChatMessage = {
  id: string;
  role: "user" | "bot";
  text: string;
  matches?: Service[];
};

const GREETINGS = [
  "नमस्ते! म सजिलो सेवा सहायक हुँ। तपाईंलाई कुन सेवा चाहिएको हो?",
  "नमस्ते! कुनै सरकारी सेवाको प्रक्रिया वा कागजात चाहियो भने सोध्नुस्।",
];

const GENERIC_FALLBACKS = [
  "मैले ठ्याक्कै बुझिनँ। कृपया सेवाको नाम (जस्तै: नागरिकता, राहदानी, जग्गा नामसारी) लेख्नुहोस्।",
  "उदाहरण: \"पान कार्ड कसरी बनाउने?\" वा \"राहदानीको लागि के कागजात चाहिन्छ?\"",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function detectIntent(q: string): "greet" | "thanks" | "help" | "search" {
  const t = q.trim().toLowerCase();
  if (/^(नमस्ते|namaste|hello|hi|हाई)\b/.test(t)) return "greet";
  if (/(धन्यवाद|thanks|thank you)/.test(t)) return "thanks";
  if (/(कसरी|कुन कागजात|के कागजात|कति समय|शुल्क|दस्तुर|fees?|how|where)/.test(t))
    return "search";
  if (/(मद्दत|help|सहायता)/.test(t)) return "help";
  return "search";
}

export function botReply(query: string, services: Service[]): ChatMessage {
  const id = crypto.randomUUID();
  const intent = detectIntent(query);
  if (intent === "greet") {
    return { id, role: "bot", text: pick(GREETINGS) };
  }
  if (intent === "thanks") {
    return {
      id,
      role: "bot",
      text: "खुसी लाग्यो! अरू कुनै सेवा चाहिए सोध्न नहिचकिचाउनुहोस्।",
    };
  }
  if (intent === "help") {
    return {
      id,
      role: "bot",
      text: "तपाईंले सेवा खोज्न सक्नुहुन्छ — जस्तै: नागरिकता, राहदानी, जग्गा, सवारी चालक, पान कार्ड, विवाह दर्ता, स्वास्थ्य बीमा।",
    };
  }
  const idx = buildIndex(services);
  const matches = searchServices(idx, query, 3);
  if (matches.length === 0) {
    return { id, role: "bot", text: pick(GENERIC_FALLBACKS) };
  }
  const top = matches[0];
  const lines = [
    `तपाईंले खोजेको सेवा: **${top.titleNe}**`,
    `मन्त्रालय: ${top.ministryId}`,
    `कार्यालय: ${top.officeId}`,
    `अनुमानित समय: ${top.estimatedTimeNe}`,
    `शुल्क: ${top.feeNe}`,
    "तल विस्तृत प्रक्रिया हेर्नुहोस्।",
  ];
  return {
    id,
    role: "bot",
    text: lines.join("\n"),
    matches,
  };
}

export const chatStarter = pick(GREETINGS);
