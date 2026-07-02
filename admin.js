/**
 * admin.js
 * ------------------------------------------------------------
 * Logik für admin.html – gedacht ausschließlich für die
 * Forschungsperson.
 *
 * WICHTIG ZUM VERSTÄNDNIS DER ARCHITEKTUR:
 * localStorage ist immer an EIN Gerät/EINEN Browser gebunden.
 * Diese Seite zeigt daher ausschließlich die Daten, die auf dem
 * Gerät gespeichert sind, auf dem sie gerade geöffnet wird – also
 * z. B. deine eigenen Testdurchläufe, nicht automatisch die Daten
 * aller Teilnehmenden. Die zentrale Sammlung über alle Geräte
 * hinweg läuft über Web3Forms (siehe README.md).
 *
 * Der PIN-Schutz unten ist eine einfache Zugriffshürde für den
 * Alltagsgebrauch, KEINE echte Sicherheitsmaßnahme: Der Code läuft
 * vollständig im Browser und kann theoretisch eingesehen werden.
 * Teile den Link zu admin.html deshalb nicht öffentlich.
 * ------------------------------------------------------------
 */

(function () {
  "use strict";

  const S = window.MTWStorage;

  // Eigenen PIN festlegen (mind. 4 Zeichen). Nur ein einfacher, lokaler
  // Zugriffsschutz – siehe Hinweis oben.
  const ADMIN_PIN = "forschung2026";
  const SESSION_FLAG = "mtw_admin_unlocked";
  const MAX_ATTEMPTS = 5;

  const gate = document.getElementById("adminGate");
  const panel = document.getElementById("adminPanel");

  function checkAccess() {
    if (window.sessionStorage.getItem(SESSION_FLAG) === "true") {
      showPanel();
      return;
    }
    let attempts = 0;
    function askPin() {
      const input = prompt("Admin-PIN eingeben:");
      if (input === null) {
        gate.innerHTML = `<p>Zugriff abgebrochen. Lade die Seite neu, um es erneut zu versuchen.</p>`;
        return;
      }
      if (input === ADMIN_PIN) {
        window.sessionStorage.setItem(SESSION_FLAG, "true");
        showPanel();
        return;
      }
      attempts += 1;
      if (attempts >= MAX_ATTEMPTS) {
        gate.innerHTML = `<p>Zu viele Fehlversuche. Bitte Seite neu laden.</p>`;
        return;
      }
      alert("Falscher PIN. Versuch " + attempts + " von " + MAX_ATTEMPTS + ".");
      askPin();
    }
    askPin();
  }

  function showPanel() {
    gate.classList.add("hidden");
    panel.classList.remove("hidden");
    renderPanel();
  }

  function renderPanel() {
    const participantId = S.getParticipantId();
    const demographics = S.getDemographics();
    const portfolio = S.getPortfolio();
    const progress = S.getProgress();
    const records = S.getRecords();

    document.getElementById("statParticipant").textContent = participantId;
    document.getElementById("statDemo").textContent = demographics
      ? `Alter ${demographics.age} · ${demographics.gender} · Erfahrung: ${demographics.experience}`
      : "noch keine Angaben";
    document.getElementById("statProgress").textContent = `${progress.nextScenarioIndex} von ${SCENARIOS.length} Szenarien`;
    document.getElementById("statPortfolio").textContent =
      `Cash ${portfolio.cash.toFixed(2)} € · Aktien ${portfolio.shares} · Kurs ${portfolio.price.toFixed(2)} €`;
    document.getElementById("statRecordCount").textContent = String(records.length);

    const tbody = document.getElementById("recordsTableBody");
    if (records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" class="empty-row">Noch keine Datensätze auf diesem Gerät gespeichert.</td></tr>`;
    } else {
      tbody.innerHTML = records
        .map(
          (r) => `
        <tr>
          <td>${r.date}</td>
          <td>${r.scenarioNumber}</td>
          <td>${r.scenarioTitle}</td>
          <td>${r.price.toFixed(2)} €</td>
          <td>${r.action}</td>
          <td>${r.quantity}</td>
          <td>${r.portfolioValue.toFixed(2)} €</td>
          <td>${(r.reactionTimeMs / 1000).toFixed(1)} s</td>
          <td>${r.timerExpired ? "Ja" : "Nein"}</td>
        </tr>`
        )
        .join("");
    }
  }

  /* ---------------------------- CSV-Export ---------------------------- */

  function buildCsv() {
    const demographics = S.getDemographics() || {};
    const participantId = S.getParticipantId();

    // Semikolon als Trennzeichen, da Excel in deutscher Spracheinstellung
    // das Komma als Dezimaltrennzeichen erwartet und CSV-Dateien mit
    // Semikolon standardmäßig korrekt in Spalten aufteilt.
    const headers = [
      "teilnehmer_id",
      "alter",
      "geschlecht",
      "erfahrung",
      "datum",
      "szenario_nummer",
      "szenario_titel",
      "kurs",
      "kursaenderung_prozent",
      "cash_vorher",
      "cash_nachher",
      "aktien_vorher",
      "aktien_nachher",
      "gesamtportfolio",
      "aktion",
      "stueckzahl",
      "reaktionszeit_ms",
      "timer_abgelaufen",
    ];

    const rows = S.getRecords().map((r) =>
      [
        participantId,
        demographics.age ?? "",
        demographics.gender ?? "",
        demographics.experience ?? "",
        r.date,
        r.scenarioNumber,
        r.scenarioTitle,
        r.price,
        r.changePercent,
        r.cashBefore,
        r.cashAfter,
        r.sharesBefore,
        r.sharesAfter,
        r.portfolioValue,
        r.action,
        r.quantity,
        r.reactionTimeMs,
        r.timerExpired ? "Ja" : "Nein",
      ]
        .map(csvEscape)
        .join(";")
    );

    return [headers.join(";"), ...rows].join("\r\n");
  }

  function csvEscape(value) {
    const str = String(value);
    if (str.includes(";") || str.includes('"') || str.includes("\n")) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  function downloadBlob(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function exportCsv() {
    const csv = "\uFEFF" + buildCsv(); // BOM für korrekte Umlaute in Excel
    downloadBlob(csv, `markt-simulation_${S.getParticipantId()}_${S.getTodayString()}.csv`, "text/csv;charset=utf-8");
  }

  function exportJson() {
    const payload = {
      participantId: S.getParticipantId(),
      demographics: S.getDemographics(),
      portfolio: S.getPortfolio(),
      progress: S.getProgress(),
      records: S.getRecords(),
      exportedAt: new Date().toISOString(),
    };
    downloadBlob(
      JSON.stringify(payload, null, 2),
      `markt-simulation_${S.getParticipantId()}_${S.getTodayString()}.json`,
      "application/json"
    );
  }

  function deleteAllData() {
    const confirmation = prompt(
      'Achtung: Dies löscht ALLE lokal auf diesem Gerät gespeicherten Daten dieser Anwendung unwiderruflich.\n\nTippe zur Bestätigung "LÖSCHEN" ein:'
    );
    if (confirmation === "LÖSCHEN") {
      S.clearAllAppData();
      alert("Alle lokalen Daten wurden gelöscht.");
      window.location.reload();
    } else if (confirmation !== null) {
      alert("Eingabe stimmte nicht überein. Es wurde nichts gelöscht.");
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    checkAccess();
    document.getElementById("exportCsvBtn").addEventListener("click", exportCsv);
    document.getElementById("exportJsonBtn").addEventListener("click", exportJson);
    document.getElementById("deleteAllBtn").addEventListener("click", deleteAllData);
    document.getElementById("refreshBtn").addEventListener("click", renderPanel);
  });
})();
