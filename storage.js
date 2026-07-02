/**
 * storage.js
 * ------------------------------------------------------------
 * Zentrale Verwaltung aller Daten im localStorage des Browsers.
 * Kein Server, keine Datenbank – alles bleibt lokal auf dem Gerät
 * der teilnehmenden Person, bis es zusätzlich per Web3Forms an
 * die Forschungsperson gesendet wird (siehe web3forms.js).
 *
 * Alle Funktionen sind bewusst synchron und einfach gehalten,
 * damit sie ohne Framework in app.js und admin.js genutzt
 * werden können.
 * ------------------------------------------------------------
 */

// Namespace-Präfix, damit die App nicht mit anderen Seiten im selben
// Browser kollidiert, falls localStorage-Keys wiederverwendet werden.
const STORAGE_PREFIX = "mtw_"; // "Markt-Trading-Wahrnehmung"

const STORAGE_KEYS = {
  participantId: STORAGE_PREFIX + "participant_id",
  consent: STORAGE_PREFIX + "consent_given",
  demographics: STORAGE_PREFIX + "demographics",
  portfolio: STORAGE_PREFIX + "portfolio",
  progress: STORAGE_PREFIX + "progress",
  records: STORAGE_PREFIX + "records",
};

const STARTING_CASH = 10000;
const STARTING_PRICE = 100; // fiktiver Startkurs der simulierten Aktie in €

/* ---------------------------- Basis-Helfer ---------------------------- */

function readJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null || raw === undefined) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error("Fehler beim Lesen von localStorage[" + key + "]:", err);
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error("Fehler beim Schreiben von localStorage[" + key + "]:", err);
    return false;
  }
}

/** Liefert das heutige Datum als lokales YYYY-MM-DD (nicht UTC!). */
function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Erzeugt eine zufällige, anonyme Teilnehmer-ID (kein Personenbezug). */
function generateParticipantId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return "TN-" + window.crypto.randomUUID().slice(0, 8);
  }
  // Fallback für ältere Browser / unsichere Kontexte (z. B. lokales file://)
  const rand = Math.random().toString(36).slice(2, 10);
  return "TN-" + rand + Date.now().toString(36).slice(-4);
}

/* ---------------------------- Teilnehmer-ID ---------------------------- */

function getParticipantId() {
  let id = window.localStorage.getItem(STORAGE_KEYS.participantId);
  if (!id) {
    id = generateParticipantId();
    window.localStorage.setItem(STORAGE_KEYS.participantId, id);
  }
  return id;
}

/* ---------------------------- Einwilligung ---------------------------- */

function getConsent() {
  return readJSON(STORAGE_KEYS.consent, false);
}

function setConsent(value) {
  return writeJSON(STORAGE_KEYS.consent, !!value);
}

/* ---------------------------- Demografie ---------------------------- */

function getDemographics() {
  return readJSON(STORAGE_KEYS.demographics, null);
}

function setDemographics(data) {
  return writeJSON(STORAGE_KEYS.demographics, data);
}

/* ---------------------------- Portfolio ---------------------------- */

function getPortfolio() {
  return readJSON(STORAGE_KEYS.portfolio, {
    cash: STARTING_CASH,
    shares: 0,
    price: STARTING_PRICE,
    priceHistory: [STARTING_PRICE], // für die Sparkline im Kursverlauf
  });
}

function setPortfolio(portfolio) {
  return writeJSON(STORAGE_KEYS.portfolio, portfolio);
}

/* ---------------------------- Fortschritt / Tagessperre ---------------------------- */

function getProgress() {
  return readJSON(STORAGE_KEYS.progress, {
    // Index (0-basiert) des NÄCHSTEN zu spielenden Szenarios
    nextScenarioIndex: 0,
    // Letztes Datum, an dem ein Szenario abgeschlossen wurde
    lastCompletedDate: null,
  });
}

function setProgress(progress) {
  return writeJSON(STORAGE_KEYS.progress, progress);
}

/* ---------------------------- Datensätze (Antworten) ---------------------------- */

function getRecords() {
  return readJSON(STORAGE_KEYS.records, []);
}

function addRecord(record) {
  const records = getRecords();
  records.push(record);
  return writeJSON(STORAGE_KEYS.records, records);
}

/* ---------------------------- Reset (nur Forschungsperson) ---------------------------- */

/** Löscht ausschließlich die Daten dieser Anwendung, nichts anderes. */
function clearAllAppData() {
  Object.values(STORAGE_KEYS).forEach((key) => {
    window.localStorage.removeItem(key);
  });
}

// Global verfügbar machen (kein Modul-Bundler im Einsatz)
if (typeof window !== "undefined") {
  window.MTWStorage = {
    KEYS: STORAGE_KEYS,
    STARTING_CASH,
    STARTING_PRICE,
    getTodayString,
    getParticipantId,
    getConsent,
    setConsent,
    getDemographics,
    setDemographics,
    getPortfolio,
    setPortfolio,
    getProgress,
    setProgress,
    getRecords,
    addRecord,
    clearAllAppData,
  };
}
