/**
 * web3forms.js
 * ------------------------------------------------------------
 * Sendet jeden abgeschlossenen Szenario-Durchgang automatisch
 * per E-Mail an die Forschungsperson – ganz ohne eigenes Backend.
 *
 * Dienst: https://web3forms.com  (kostenloses Kontingent: 250
 * Zusendungen / Monat, siehe README.md)
 *
 * WICHTIG: Trage unten deinen persönlichen Access Key ein, den du
 * kostenlos auf https://web3forms.com erhältst. Der Access Key ist
 * KEIN Geheimnis – er darf laut Web3Forms öffentlich im Client-Code
 * stehen, er funktioniert wie ein Alias für deine E-Mail-Adresse.
 *
 * Ablauf, falls der Access Key noch nicht gesetzt ist, oder falls
 * kein Internet verfügbar ist (z. B. beim lokalen Testen per
 * Doppelklick): Der Versand schlägt lautlos fehl, die Daten bleiben
 * aber trotzdem sicher im localStorage gespeichert und können über
 * die Admin-Seite (admin.html) jederzeit als CSV/JSON exportiert
 * werden. Web3Forms ist also ein zusätzlicher, bequemer Kanal –
 * NICHT der einzige Speicherort der Daten.
 * ------------------------------------------------------------
 */

// TODO: Hier deinen eigenen Access Key von https://web3forms.com eintragen
const WEB3FORMS_ACCESS_KEY = "a7b70d20-14ab-4b67-854b-96d409106fd8";

const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

/**
 * Sendet einen einzelnen Szenario-Datensatz an Web3Forms.
 * Läuft asynchron im Hintergrund und blockiert die Simulation nicht.
 *
 * @param {Object} record       Ein einzelner Datensatz (siehe app.js)
 * @param {Object} demographics Demografische Daten der teilnehmenden Person
 * @returns {Promise<boolean>}  true bei Erfolg, sonst false
 */
async function sendRecordToResearcher(record, demographics) {
  if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY.includes("HIER_EINFUEGEN")) {
    console.warn(
      "Web3Forms ist noch nicht konfiguriert (WEB3FORMS_ACCESS_KEY fehlt). " +
        "Datensatz wurde nur lokal gespeichert. Siehe README.md."
    );
    return false;
  }

  const payload = {
    access_key: WEB3FORMS_ACCESS_KEY,
    subject: `Maturaarbeit · Tag ${record.scenarioNumber}/15 · ${record.participantId}`,
    // "from_name" erscheint als Absendername in deinem Postfach
    from_name: "Markt-Simulation (Maturaarbeit)",
    // Übersichtlicher Klartext für die E-Mail
    participant_id: record.participantId,
    alter: demographics ? demographics.age : "",
    geschlecht: demographics ? demographics.gender : "",
    erfahrung: demographics ? demographics.experience : "",
    datum: record.date,
    szenario_nummer: record.scenarioNumber,
    szenario_titel: record.scenarioTitle,
    kurs: record.price,
    kursaenderung_prozent: record.changePercent,
    cash_vorher: record.cashBefore,
    cash_nachher: record.cashAfter,
    aktien_vorher: record.sharesBefore,
    aktien_nachher: record.sharesAfter,
    gesamtportfolio: record.portfolioValue,
    aktion: record.action,
    stueckzahl: record.quantity,
    reaktionszeit_ms: record.reactionTimeMs,
    timer_abgelaufen: record.timerExpired ? "Ja" : "Nein",
    // Vollständiger Datensatz als JSON, praktisch zum Copy-Paste in Excel/SPSS
    rohdaten_json: JSON.stringify(record),
  };

  try {
    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({}));

    if (response.ok && result.success !== false) {
      console.info("Datensatz erfolgreich an Web3Forms gesendet.");
      return true;
    }

    console.error("Web3Forms hat den Versand abgelehnt:", result);
    return false;
  } catch (err) {
    // Kein Internet, CORS-Problem, falsche Domain o. Ä. – Simulation läuft
    // trotzdem normal weiter, die Daten sind lokal gespeichert.
    console.error("Web3Forms-Versand fehlgeschlagen:", err);
    return false;
  }
}

if (typeof window !== "undefined") {
  window.MTWWeb3Forms = { sendRecordToResearcher };
}
