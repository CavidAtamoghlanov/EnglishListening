import type { WordSeed } from "../types";

function w(english: string, azeri: string, category: string, icon: string): WordSeed {
  return { english, azeri, category, icon, synonyms: [] };
}

export const B1_EXTRA_SEEDS: WordSeed[] = [
  w("missed connection", "qaçırılmış qoşulma", "travel problems", "✈️"),
  w("lost reservation", "itmiş rezervasiya", "travel problems", "📵"),
  w("overbooked", "artıq bron", "travel problems", "🏨"),
  w("in my opinion", "mənim fikrimcə", "opinions", "💭"),
  w("I agree", "razıyam", "opinions", "✅"),
  w("I disagree", "razı deyiləm", "opinions", "❌"),
  w("small talk topic", "söhbət mövzusu", "social conversation", "💬"),
  w("follow up email", "izləmə e-poçtu", "work communication", "📧"),
  w("agenda", "gündəm", "meetings", "📋"),
  w("minutes of meeting", "görüş protokolu", "meetings", "📝"),
  w("project plan", "layihə planı", "planning", "📊"),
  w("milestone", "mərhələ", "planning", "🏁"),
  w("REST API", "REST API", "software basics", "🌐"),
  w("HTTP status code", "HTTP status kodu", "software basics", "🔢"),
  w("JSON", "JSON", "software basics", "📄"),
  w("database table", "verilənlər bazası cədvəli", "database basics", "🗃️"),
  w("primary key", "əsas açar", "database basics", "🔑"),
  w("foreign key", "xarici açar", "database basics", "🔗"),
  w("SELECT query", "SELECT sorğusu", "database basics", "🔍"),
  w("INSERT statement", "INSERT ifadəsi", "database basics", "➕"),
  w("backend service", "backend xidməti", "backend basics", "⚙️"),
  w("log file", "log faylı", "debugging basics", "📄"),
  w("stack trace", "stack trace", "debugging basics", "🐛"),
  w("reproduce bug", "xətanı təkrarlamaq", "debugging basics", "🔁"),
  w("README", "README faylı", "documentation", "📘"),
  w("API documentation", "API sənədləşməsi", "documentation", "📗"),
  w("user story", "istifadəçi hekayəsi", "software basics", "📖"),
  w("acceptance criteria", "qəbul meyarları", "software basics", "✅"),
  w("deployment window", "deploy pəncərəsi", "backend basics", "🕐"),
  w("environment", "mühit", "backend basics", "🌐"),
];
