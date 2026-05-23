import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type {
  SentenceItem,
  SentenceLevel,
  SentencePracticeMode,
  SentenceWordHint,
} from "../src/features/sentences/types";

type Seed = {
  english: string;
  azeri: string;
  category: string;
  icon: string;
  words: SentenceWordHint[];
  acceptedAnswers?: string[];
};

function w(...pairs: [string, string, string?][]): SentenceWordHint[] {
  return pairs.map(([text, translation, note]) => ({ text, translation, note }));
}

function build(
  mode: SentencePracticeMode,
  level: SentenceLevel,
  seeds: Seed[],
): SentenceItem[] {
  const prefix = `${mode}_${level.toLowerCase()}`;
  return seeds.map((seed, index) => ({
    id: `${prefix}_${String(index + 1).padStart(4, "0")}`,
    level,
    mode,
    english: seed.english,
    azeri: seed.azeri,
    acceptedAnswers: [seed.english, ...(seed.acceptedAnswers ?? [])],
    category: seed.category,
    icon: seed.icon,
    words: seed.words,
  }));
}

const REPEAT: Record<SentenceLevel, Seed[]> = {
  A1: [
    { english: "I am Cavid.", azeri: "Mən Cavidəm.", category: "family", icon: "👤", words: w(["I", "Mən"], ["am", "-əm"], ["Cavid", "Cavid"]) },
    { english: "This is my family.", azeri: "Bu mənim ailəmdir.", category: "family", icon: "👨‍👩‍👧", words: w(["This", "Bu"], ["my", "mənim"], ["family", "ailə"]) },
    { english: "I need water.", azeri: "Mənə su lazımdır.", category: "everyday", icon: "💧", words: w(["I", "Mən"], ["need", "lazımdır"], ["water", "su"]) },
    { english: "My phone is new.", azeri: "Telefonum yenidir.", category: "technology", icon: "📱", words: w(["phone", "telefon"], ["new", "yeni"]) },
    { english: "The room is clean.", azeri: "Otaq təmizdir.", category: "home", icon: "🛏️", words: w(["room", "otaq"], ["clean", "təmiz"]) },
    { english: "I like coffee.", azeri: "Mən qəhvəni sevirəm.", category: "food", icon: "☕", words: w(["like", "sevirəm"], ["coffee", "qəhvə"]) },
    { english: "We are at home.", azeri: "Biz evdəyik.", category: "home", icon: "🏠", words: w(["We", "Biz"], ["home", "ev"]) },
    { english: "She is my sister.", azeri: "O mənim bacımdır.", category: "family", icon: "👧", words: w(["She", "O"], ["sister", "bacı"]) },
    { english: "The bus is here.", azeri: "Avtobus buradadır.", category: "travel", icon: "🚌", words: w(["bus", "avtobus"], ["here", "burada"]) },
    { english: "I write code.", azeri: "Mən kod yazıram.", category: "technology", icon: "💻", words: w(["write", "yazıram"], ["code", "kod"]) },
  ],
  A2: [
    { english: "I have a meeting today.", azeri: "Bu gün görüşüm var.", category: "work", icon: "📅", words: w(["meeting", "görüş"], ["today", "bu gün"]) },
    { english: "Please send the email.", azeri: "Zəhmət olmasa e-poçtu göndərin.", category: "work", icon: "📧", words: w(["send", "göndərin"], ["email", "e-poçt"]) },
    { english: "The hotel is near.", azeri: "Otel yaxındadır.", category: "travel", icon: "🏨", words: w(["hotel", "otel"], ["near", "yaxın"]) },
    { english: "I need a taxi.", azeri: "Mənə taksi lazımdır.", category: "travel", icon: "🚕", words: w(["need", "lazımdır"], ["taxi", "taksi"]) },
    { english: "The app is slow.", azeri: "Tətbiq yavaşdır.", category: "technology", icon: "📱", words: w(["app", "tətbiq"], ["slow", "yavaş"]) },
    { english: "I am at the airport.", azeri: "Mən aeroportdayam.", category: "travel", icon: "✈️", words: w(["airport", "aeroport"]) },
    { english: "Please open the file.", azeri: "Zəhmət olmasa faylı açın.", category: "work", icon: "📄", words: w(["open", "açın"], ["file", "fayl"]) },
    { english: "The shop is closed.", azeri: "Mağaza bağlıdır.", category: "shopping", icon: "🛍️", words: w(["shop", "mağaza"], ["closed", "bağlı"]) },
    { english: "I work from home.", azeri: "Evdən işləyirəm.", category: "work", icon: "🏠", words: w(["work", "işləyirəm"], ["home", "ev"]) },
    { english: "Can you help me?", azeri: "Mənə kömək edə bilərsiniz?", category: "communication", icon: "🤝", words: w(["help", "kömək"], ["me", "mənə"]) },
  ],
  B1: [
    { english: "I found the problem.", azeri: "Problemi tapdım.", category: "software", icon: "🔍", words: w(["found", "tapdım"], ["problem", "problem"]) },
    { english: "We should check the logs.", azeri: "Logları yoxlamalıyıq.", category: "software", icon: "📋", words: w(["check", "yoxlamalıyıq"], ["logs", "loglar"]) },
    { english: "The API returns an error.", azeri: "API xəta qaytarır.", category: "software", icon: "🌐", words: w(["API", "API"], ["error", "xəta"]) },
    { english: "I need more time.", azeri: "Mənə daha çox vaxt lazımdır.", category: "work", icon: "⏰", words: w(["need", "lazımdır"], ["time", "vaxt"]) },
    { english: "Can we discuss this later?", azeri: "Bunu sonra müzakirə edə bilərik?", category: "meetings", icon: "💬", words: w(["discuss", "müzakirə"], ["later", "sonra"]) },
    { english: "The flight was delayed.", azeri: "Uçuş gecikdi.", category: "travel", icon: "✈️", words: w(["flight", "uçuş"], ["delayed", "gecikdi"]) },
    { english: "I agree with you.", azeri: "Sizinlə razıyam.", category: "opinions", icon: "✅", words: w(["agree", "razıyam"], ["you", "sizinlə"]) },
    { english: "Please update the ticket.", azeri: "Zəhmət olmasa tiketi yeniləyin.", category: "work", icon: "🎫", words: w(["update", "yeniləyin"], ["ticket", "tiket"]) },
    { english: "The database is down.", azeri: "Verilənlər bazası işləmir.", category: "software", icon: "🗄️", words: w(["database", "verilənlər bazası"], ["down", "işləmir"]) },
    { english: "I will call you back.", azeri: "Sizə geri zəng edəcəyəm.", category: "communication", icon: "📞", words: w(["call", "zəng"], ["back", "geri"]) },
  ],
  B2: [
    { english: "The API requires authentication.", azeri: "API autentifikasiya tələb edir.", category: "backend", icon: "🔐", words: w(["API", "API"], ["authentication", "autentifikasiya"]) },
    { english: "We need better logging.", azeri: "Daha yaxşı loglama lazımdır.", category: "backend", icon: "📝", words: w(["logging", "loglama"], ["better", "daha yaxşı"]) },
    { english: "The query is too slow.", azeri: "Sorğu çox yavaşdır.", category: "database", icon: "🐢", words: w(["query", "sorğu"], ["slow", "yavaş"]) },
    { english: "I will review the pull request.", azeri: "Pull request-ə baxacağam.", category: "backend", icon: "🔀", words: w(["review", "baxacağam"], ["pull request", "pull request"]) },
    { english: "The deployment failed in staging.", azeri: "Staging-də deploy uğursuz oldu.", category: "deployment", icon: "🚀", words: w(["deployment", "deploy"], ["staging", "staging"]) },
    { english: "We should clarify the requirements.", azeri: "Tələbləri aydınlaşdırmalıyıq.", category: "meetings", icon: "📋", words: w(["clarify", "aydınlaşdırmalıyıq"], ["requirements", "tələblər"]) },
    { english: "My flight was delayed.", azeri: "Uçuşum gecikdi.", category: "travel", icon: "✈️", words: w(["flight", "uçuş"], ["delayed", "gecikdi"]) },
    { english: "I need a late checkout.", azeri: "Gec çıxış lazımdır.", category: "travel", icon: "🏨", words: w(["late", "gec"], ["checkout", "çıxış"]) },
    { english: "The service is not responding.", azeri: "Xidmət cavab vermir.", category: "backend", icon: "⚙️", words: w(["service", "xidmət"], ["responding", "cavab vermir"]) },
    { english: "Let's schedule a follow up.", azeri: "Gələcək görüş planlaşdıraq.", category: "meetings", icon: "📅", words: w(["schedule", "planlaşdıraq"], ["follow up", "izləmə görüşü"]) },
  ],
};

const TRANSLATE: Record<SentenceLevel, Seed[]> = {
  A1: [
    { english: "I am Cavid.", azeri: "Mən Cavidəm.", category: "family", icon: "👤", words: w(["Mən", "I"], ["Cavidəm", "am Cavid"]) },
    { english: "This is my family.", azeri: "Bu mənim ailəmdir.", category: "family", icon: "👨‍👩‍👧", words: w(["Bu", "This"], ["ailəmdir", "is my family"]) },
    { english: "I need water.", azeri: "Mənə su lazımdır.", category: "everyday", icon: "💧", words: w(["Mənə", "I"], ["su", "water"], ["lazımdır", "need"]) },
    { english: "My phone is new.", azeri: "Telefonum yenidir.", category: "technology", icon: "📱", words: w(["Telefonum", "My phone"], ["yenidir", "is new"]) },
    { english: "The room is clean.", azeri: "Otaq təmizdir.", category: "home", icon: "🛏️", words: w(["Otaq", "The room"], ["təmizdir", "is clean"]) },
    { english: "I like coffee.", azeri: "Mən qəhvəni sevirəm.", category: "food", icon: "☕", words: w(["qəhvəni", "coffee"], ["sevirəm", "like"]) },
    { english: "We are at home.", azeri: "Biz evdəyik.", category: "home", icon: "🏠", words: w(["Biz", "We"], ["evdəyik", "are at home"]) },
    { english: "She is my sister.", azeri: "O mənim bacımdır.", category: "family", icon: "👧", words: w(["O", "She"], ["bacımdır", "is my sister"]) },
    { english: "The bus is here.", azeri: "Avtobus buradadır.", category: "travel", icon: "🚌", words: w(["Avtobus", "The bus"], ["buradadır", "is here"]) },
    { english: "I write code.", azeri: "Mən kod yazıram.", category: "technology", icon: "💻", words: w(["kod", "code"], ["yazıram", "write"]) },
  ],
  A2: [
    { english: "I have a meeting today.", azeri: "Bu gün görüşüm var.", category: "work", icon: "📅", words: w(["görüşüm", "meeting"], ["var", "have"]) },
    { english: "Please send the email.", azeri: "Zəhmət olmasa e-poçtu göndərin.", category: "work", icon: "📧", words: w(["e-poçtu", "email"], ["göndərin", "send"]) },
    { english: "The hotel is near.", azeri: "Otel yaxındadır.", category: "travel", icon: "🏨", words: w(["Otel", "hotel"], ["yaxındadır", "is near"]) },
    { english: "I need a taxi.", azeri: "Mənə taksi lazımdır.", category: "travel", icon: "🚕", words: w(["taksi", "taxi"], ["lazımdır", "need"]) },
    { english: "The app is slow.", azeri: "Tətbiq yavaşdır.", category: "technology", icon: "📱", words: w(["Tətbiq", "app"], ["yavaşdır", "is slow"]) },
    { english: "I am at the airport.", azeri: "Mən aeroportdayam.", category: "travel", icon: "✈️", words: w(["aeroportdayam", "at the airport"]) },
    { english: "Please open the file.", azeri: "Zəhmət olmasa faylı açın.", category: "work", icon: "📄", words: w(["faylı", "file"], ["açın", "open"]) },
    { english: "The shop is closed.", azeri: "Mağaza bağlıdır.", category: "shopping", icon: "🛍️", words: w(["Mağaza", "shop"], ["bağlıdır", "is closed"]) },
    { english: "I work from home.", azeri: "Evdən işləyirəm.", category: "work", icon: "🏠", words: w(["Evdən", "from home"], ["işləyirəm", "work"]) },
    { english: "Can you help me?", azeri: "Mənə kömək edə bilərsiniz?", category: "communication", icon: "🤝", words: w(["kömək", "help"], ["edə bilərsiniz", "can you"]) },
  ],
  B1: [
    { english: "I found the problem.", azeri: "Problemi tapdım.", category: "software", icon: "🔍", words: w(["Problemi", "the problem"], ["tapdım", "found"]) },
    { english: "We should check the logs.", azeri: "Logları yoxlamalıyıq.", category: "software", icon: "📋", words: w(["Logları", "logs"], ["yoxlamalıyıq", "should check"]) },
    { english: "The API returns an error.", azeri: "API xəta qaytarır.", category: "software", icon: "🌐", words: w(["API", "API"], ["xəta", "error"], ["qaytarır", "returns"]) },
    { english: "I need more time.", azeri: "Mənə daha çox vaxt lazımdır.", category: "work", icon: "⏰", words: w(["vaxt", "time"], ["lazımdır", "need"]) },
    { english: "Can we discuss this later?", azeri: "Bunu sonra müzakirə edə bilərik?", category: "meetings", icon: "💬", words: w(["müzakirə", "discuss"], ["sonra", "later"]) },
    { english: "The flight was delayed.", azeri: "Uçuş gecikdi.", category: "travel", icon: "✈️", words: w(["Uçuş", "flight"], ["gecikdi", "was delayed"]) },
    { english: "I agree with you.", azeri: "Sizinlə razıyam.", category: "opinions", icon: "✅", words: w(["razıyam", "agree"], ["Sizinlə", "with you"]) },
    { english: "Please update the ticket.", azeri: "Zəhmət olmasa tiketi yeniləyin.", category: "work", icon: "🎫", words: w(["tiketi", "ticket"], ["yeniləyin", "update"]) },
    { english: "The database is down.", azeri: "Verilənlər bazası işləmir.", category: "software", icon: "🗄️", words: w(["Verilənlər bazası", "database"], ["işləmir", "is down"]) },
    { english: "I will call you back.", azeri: "Sizə geri zəng edəcəyəm.", category: "communication", icon: "📞", words: w(["zəng", "call"], ["geri", "back"]) },
  ],
  B2: [
    { english: "The API requires authentication.", azeri: "API autentifikasiya tələb edir.", category: "backend", icon: "🔐", words: w(["API", "API"], ["autentifikasiya", "authentication"], ["tələb edir", "requires"]) },
    { english: "We need better logging.", azeri: "Daha yaxşı loglama lazımdır.", category: "backend", icon: "📝", words: w(["loglama", "logging"], ["lazımdır", "need"]) },
    { english: "The query is too slow.", azeri: "Sorğu çox yavaşdır.", category: "database", icon: "🐢", words: w(["Sorğu", "query"], ["yavaşdır", "is slow"]) },
    { english: "I will review the pull request.", azeri: "Pull request-ə baxacağam.", category: "backend", icon: "🔀", words: w(["Pull request-ə", "pull request"], ["baxacağam", "will review"]) },
    { english: "The deployment failed in staging.", azeri: "Staging-də deploy uğursuz oldu.", category: "deployment", icon: "🚀", words: w(["deploy", "deployment"], ["uğursuz oldu", "failed"]) },
    { english: "We should clarify the requirements.", azeri: "Tələbləri aydınlaşdırmalıyıq.", category: "meetings", icon: "📋", words: w(["Tələbləri", "requirements"], ["aydınlaşdırmalıyıq", "should clarify"]) },
    { english: "My flight was delayed.", azeri: "Uçuşum gecikdi.", category: "travel", icon: "✈️", words: w(["Uçuşum", "My flight"], ["gecikdi", "was delayed"]) },
    { english: "I need a late checkout.", azeri: "Gec çıxış lazımdır.", category: "travel", icon: "🏨", words: w(["Gec çıxış", "late checkout"], ["lazımdır", "need"]) },
    { english: "The service is not responding.", azeri: "Xidmət cavab vermir.", category: "backend", icon: "⚙️", words: w(["Xidmət", "service"], ["cavab vermir", "not responding"]) },
    { english: "Let's schedule a follow up.", azeri: "Gələcək görüş planlaşdıraq.", category: "meetings", icon: "📅", words: w(["görüş", "follow up"], ["planlaşdıraq", "schedule"]) },
  ],
};

const root = path.join(process.cwd(), "src", "data", "sentences");
const levels: SentenceLevel[] = ["A1", "A2", "B1", "B2"];
const modes: SentencePracticeMode[] = ["repeat", "translate"];

for (const mode of modes) {
  const seedsByLevel = mode === "repeat" ? REPEAT : TRANSLATE;
  for (const level of levels) {
    const dir = path.join(root, mode);
    mkdirSync(dir, { recursive: true });
    const items = build(mode, level, seedsByLevel[level]);
    writeFileSync(path.join(dir, `${level.toLowerCase()}.json`), `${JSON.stringify(items, null, 2)}\n`);
    console.log(`${mode}/${level.toLowerCase()}.json: ${items.length} sentences`);
  }
}

console.log("Done.");
