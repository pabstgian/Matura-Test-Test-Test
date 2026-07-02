/**
 * app.js
 * ------------------------------------------------------------
 * Steuert den gesamten Ablauf der Simulation auf index.html:
 * Startseite -> Demografie (einmalig) -> tägliches Szenario
 * -> Tagesabschluss -> Sperre bis zum nächsten Kalendertag.
 *
 * Es kommt bewusst kein Framework zum Einsatz: Für jeden
 * "Screen" wird der Inhalt von #app per innerHTML ersetzt und
 * anschließend werden die nötigen Event-Listener angehängt.
 * ------------------------------------------------------------
 */

(function () {
  "use strict";

  const S = window.MTWStorage;
  const TOTAL_SCENARIOS = SCENARIOS.length; // 15

  // Testmodus: ?dev=1 an die URL anhängen, um die Tagessperre zu
  // umgehen und alle 15 Szenarien direkt hintereinander zu testen.
  // Datensätze aus dem Testmodus werden NICHT an Web3Forms gesendet.
  const DEV_MODE = new URLSearchParams(window.location.search).get("dev") === "1";
  const TIMER_SECONDS = DEV_MODE ? 6 : 120;

  /** Zeigt Sekunden als reine Zahl an, ab 61s im Format M:SS. */
  function formatTimerDisplay(seconds) {
    const s = Math.max(0, seconds);
    if (TIMER_SECONDS <= 60) return String(s);
    const m = Math.floor(s / 60);
    const rest = s % 60;
    return `${m}:${String(rest).padStart(2, "0")}`;
  }

  const root = document.getElementById("app");
  let timerController = null; // aktiver Countdown, damit er sich sauber stoppen lässt

  /* ============================== Helfer ============================== */

  const currencyFormatter = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  });

  function formatCurrency(value) {
    return currencyFormatter.format(value);
  }

  function formatSignedPercent(value) {
    const rounded = Math.round(value * 10) / 10;
    const sign = rounded > 0 ? "+" : "";
    return `${sign}${rounded.toString().replace(".", ",")}\u00A0%`;
  }

  function round2(value) {
    return Math.round(value * 100) / 100;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = String(str);
    return div.innerHTML;
  }

  /** Baut die kleine Kurs-Sparkline (SVG-Polyline) aus dem Preisverlauf. */
  function buildSparkline(priceHistory) {
    const points = priceHistory.slice(-15);
    if (points.length < 2) return "";
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const w = 200;
    const h = 40;
    const step = w / (points.length - 1);
    const coords = points
      .map((p, i) => {
        const x = i * step;
        const y = h - ((p - min) / range) * (h - 4) - 2;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
    const trendUp = points[points.length - 1] >= points[0];
    return `
      <svg class="sparkline" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
        <polyline points="${coords}" class="${trendUp ? "spark-up" : "spark-down"}" />
      </svg>`;
  }

  /* ============================== Layout / Header ============================== */

  function headerHTML(dayNumber, portfolio) {
    const totalValue = round2(portfolio.cash + portfolio.shares * portfolio.price);
    return `
      <header class="app-header">
        <div class="brand">
          <span class="brand-dot"></span>
          <span class="brand-name">MARKT&nbsp;SIM</span>
          <span class="brand-sub">Maturaarbeit &middot; Gier &amp; Angst im Markthandel</span>
        </div>
        <div class="header-progress">
          <span class="header-progress-label">Tag ${dayNumber} von ${TOTAL_SCENARIOS}</span>
          <div class="progress-track">
            <div class="progress-fill" style="width:${(dayNumber / TOTAL_SCENARIOS) * 100}%"></div>
          </div>
        </div>
        <div class="header-portfolio">
          <div class="portfolio-chip">
            <span class="chip-label">Cash</span>
            <span class="chip-value">${formatCurrency(portfolio.cash)}</span>
          </div>
          <div class="portfolio-chip">
            <span class="chip-label">Aktien</span>
            <span class="chip-value">${portfolio.shares}</span>
          </div>
          <div class="portfolio-chip chip-total">
            <span class="chip-label">Gesamtwert</span>
            <span class="chip-value">${formatCurrency(totalValue)}</span>
          </div>
        </div>
      </header>
      ${DEV_MODE ? devBadgeHTML() : ""}
    `;
  }

  function devBadgeHTML() {
    return `
      <div class="dev-badge">
        TESTMODUS aktiv &middot; Tagessperre deaktiviert &middot; Timer ${TIMER_SECONDS}s &middot; kein Versand an Web3Forms
        <button id="devResetBtn" type="button" class="dev-reset-btn">Testdaten zurücksetzen</button>
      </div>`;
  }

  function attachDevResetHandler() {
    const btn = document.getElementById("devResetBtn");
    if (btn) {
      btn.addEventListener("click", () => {
        if (confirm("Alle lokalen Testdaten dieser Anwendung löschen?")) {
          S.clearAllAppData();
          window.location.reload();
        }
      });
    }
  }

  /* ============================== Routing ============================== */

  function route() {
    const consent = S.getConsent();
    const demographics = S.getDemographics();

    if (!consent) return renderWelcomeScreen();
    if (!demographics) return renderDemographicsScreen();
    return renderDailyGate();
  }

  function renderDailyGate() {
    const progress = S.getProgress();
    const today = S.getTodayString();

    if (progress.nextScenarioIndex >= TOTAL_SCENARIOS) {
      return renderFinishedScreen();
    }
    if (!DEV_MODE && progress.lastCompletedDate === today) {
      return renderLockedScreen();
    }
    return renderScenarioScreen(progress.nextScenarioIndex);
  }

  /* ============================== Screen 1: Willkommen ============================== */

  function renderWelcomeScreen() {
    root.innerHTML = `
      <div class="centered-screen">
        <div class="card intro-card">
          <div class="brand intro-brand">
            <span class="brand-dot"></span>
            <span class="brand-name">MARKT&nbsp;SIM</span>
          </div>
          <h1>Wie beeinflussen Gier und Angst unsere Entscheidungen im Markthandel?</h1>
          <p>
            Willkommen zu dieser wissenschaftlichen Untersuchung im Rahmen einer Maturaarbeit.
            Du übernimmst ein virtuelles Portfolio und triffst über <strong>15 aufeinanderfolgende
            Tage</strong> hinweg jeweils eine Handelsentscheidung &ndash; unter Zeitdruck und
            unter dem Einfluss realistisch wirkender Marktnachrichten.
          </p>
          <ul class="intro-list">
            <li>Jeden Kalendertag wird automatisch genau <strong>ein neues Szenario</strong> freigeschaltet.</li>
            <li>Du hast pro Szenario <strong>2&nbsp;Minuten</strong> Zeit für deine Entscheidung.</li>
            <li>Dein virtuelles Portfolio (10.000&nbsp;€ Startkapital) bleibt über alle 15 Tage erhalten.</li>
            <li>Die Teilnahme ist <strong>freiwillig und anonym</strong>. Es werden keine Namen oder Kontaktdaten erhoben.</li>
          </ul>
          <label class="consent-row">
            <input type="checkbox" id="consentCheckbox" />
            <span>Ich nehme freiwillig teil und bin damit einverstanden, dass meine anonymisierten
              Entscheidungsdaten für die Maturaarbeit ausgewertet werden.</span>
          </label>
          <button id="startBtn" class="btn btn-primary btn-large" disabled>Simulation starten</button>
          <p class="fine-print">Deine Daten werden ausschließlich lokal in deinem Browser sowie &ndash;
            zur Auswertung durch die Forschungsperson &ndash; anonymisiert übermittelt.</p>
        </div>
      </div>
    `;

    const checkbox = document.getElementById("consentCheckbox");
    const startBtn = document.getElementById("startBtn");
    checkbox.addEventListener("change", () => {
      startBtn.disabled = !checkbox.checked;
    });
    startBtn.addEventListener("click", () => {
      S.setConsent(true);
      route();
    });
  }

  /* ============================== Screen 2: Demografie ============================== */

  function renderDemographicsScreen() {
    root.innerHTML = `
      <div class="centered-screen">
        <div class="card intro-card">
          <h1>Kurz zu dir</h1>
          <p>Diese Angaben werden einmalig erhoben und anonym gespeichert. Sie helfen bei der
            späteren Auswertung der Ergebnisse.</p>
          <form id="demoForm" class="demo-form">
            <label class="field">
              <span>Alter</span>
              <input type="number" name="age" min="10" max="110" required placeholder="z. B. 17" />
            </label>
            <label class="field">
              <span>Geschlecht</span>
              <select name="gender" required>
                <option value="" disabled selected>Bitte wählen</option>
                <option value="weiblich">weiblich</option>
                <option value="männlich">männlich</option>
                <option value="divers">divers</option>
                <option value="keine Angabe">keine Angabe</option>
              </select>
            </label>
            <label class="field">
              <span>Erfahrung mit Aktien / Kryptowährungen</span>
              <select name="experience" required>
                <option value="" disabled selected>Bitte wählen</option>
                <option value="Keine">Keine</option>
                <option value="Wenig">Wenig</option>
                <option value="Viel">Viel</option>
              </select>
            </label>
            <button type="submit" class="btn btn-primary btn-large">Weiter</button>
          </form>
        </div>
      </div>
    `;

    document.getElementById("demoForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      S.setDemographics({
        age: formData.get("age"),
        gender: formData.get("gender"),
        experience: formData.get("experience"),
      });
      route();
    });
  }

  /* ============================== Screen 3a: Heute gesperrt ============================== */

  function renderLockedScreen() {
    const progress = S.getProgress();
    const portfolio = S.getPortfolio();
    root.innerHTML = `
      ${headerHTML(progress.nextScenarioIndex, portfolio)}
      <div class="centered-screen">
        <div class="card status-card">
          <div class="status-icon">⏳</div>
          <h1>Bis morgen!</h1>
          <p>Du hast das heutige Szenario bereits abgeschlossen.<br />
            Das nächste Szenario wird morgen freigeschaltet.</p>
          <p class="fine-print">Fortschritt: ${progress.nextScenarioIndex} von ${TOTAL_SCENARIOS} Szenarien abgeschlossen.</p>
        </div>
      </div>
    `;
  }

  /* ============================== Screen 3b: Alles abgeschlossen ============================== */

  function renderFinishedScreen() {
    const portfolio = S.getPortfolio();
    const totalValue = round2(portfolio.cash + portfolio.shares * portfolio.price);
    const renditePercent = ((totalValue - S.STARTING_CASH) / S.STARTING_CASH) * 100;
    root.innerHTML = `
      ${headerHTML(TOTAL_SCENARIOS, portfolio)}
      <div class="centered-screen">
        <div class="card status-card">
          <div class="status-icon">🏁</div>
          <h1>Alle Szenarien wurden abgeschlossen.</h1>
          <p>Vielen Dank für deine Teilnahme an dieser Untersuchung!</p>
          <div class="final-stats">
            <div><span>Endkapital</span><strong>${formatCurrency(totalValue)}</strong></div>
            <div><span>Ergebnis</span><strong class="${renditePercent >= 0 ? "text-up" : "text-down"}">${formatSignedPercent(renditePercent)}</strong></div>
          </div>
        </div>
      </div>
    `;
  }

  /* ============================== Screen 4: Aktives Szenario ============================== */

  function renderScenarioScreen(index) {
    const scenario = SCENARIOS[index];
    const portfolio = S.getPortfolio();
    const newPrice = round2(portfolio.price * (1 + scenario.changePercent / 100));
    const cashBefore = portfolio.cash;
    const sharesBefore = portfolio.shares;
    const decisionStartedAt = performance.now();
    const dayNumber = index + 1;

    const maxBuyQty = Math.max(0, Math.floor(cashBefore / newPrice));
    const maxSellQty = sharesBefore;
    const isUp = scenario.changePercent >= 0;

    root.innerHTML = `
      ${headerHTML(dayNumber, { ...portfolio, price: newPrice })}
      <div class="scenario-screen">
        <div class="card news-card ${scenario.dramatic ? "news-dramatic" : ""}">
          <div class="news-eyebrow">${scenario.dramatic ? "⚠ EILMELDUNG" : "MARKTNACHRICHT"}</div>
          <h2 class="news-title">${escapeHtml(scenario.title)}</h2>
          <p class="news-message">${escapeHtml(scenario.message)}</p>
        </div>

        <div class="trade-grid">
          <div class="card price-card">
            <div class="price-top">
              <div>
                <div class="price-label">Aktienkurs</div>
                <div class="price-value">${formatCurrency(newPrice)}</div>
              </div>
              <div class="price-change ${isUp ? "text-up" : "text-down"}">
                ${formatSignedPercent(scenario.changePercent)}
              </div>
            </div>
            ${buildSparkline([...portfolio.priceHistory, newPrice])}
          </div>

          <div class="card timer-card">
            <div class="timer-ring-wrap">
              <svg viewBox="0 0 120 120" class="timer-ring">
                <circle cx="60" cy="60" r="52" class="ring-bg" />
                <circle cx="60" cy="60" r="52" class="ring-fg" id="ringFg" />
              </svg>
              <div class="timer-number" id="timerNumber">${formatTimerDisplay(TIMER_SECONDS)}</div>
            </div>
            <div class="timer-label">Zeit für deine Entscheidung</div>
          </div>
        </div>

        <div class="card action-card">
          <div class="action-buttons" id="actionButtons">
            <button class="btn btn-buy" id="buyBtn" ${maxBuyQty <= 0 ? "disabled" : ""}>Kaufen</button>
            <button class="btn btn-sell" id="sellBtn" ${maxSellQty <= 0 ? "disabled" : ""}>Verkaufen</button>
            <button class="btn btn-hold" id="holdBtn">Halten</button>
          </div>

          <div class="quantity-panel hidden" id="quantityPanel">
            <div class="quantity-title" id="quantityTitle"></div>
            <div class="quantity-controls">
              <input type="range" id="qtySlider" min="0" max="0" value="0" />
              <input type="number" id="qtyInput" min="0" max="0" value="0" />
            </div>
            <div class="quantity-summary" id="quantitySummary"></div>
            <div class="quantity-actions">
              <button class="btn btn-secondary" id="qtyCancelBtn">Zurück</button>
              <button class="btn btn-primary" id="qtyConfirmBtn">Bestätigen</button>
            </div>
          </div>
        </div>
      </div>
    `;

    attachDevResetHandler();

    let pendingAction = null; // 'Kaufen' | 'Verkaufen'

    const buyBtn = document.getElementById("buyBtn");
    const sellBtn = document.getElementById("sellBtn");
    const holdBtn = document.getElementById("holdBtn");
    const actionButtons = document.getElementById("actionButtons");
    const quantityPanel = document.getElementById("quantityPanel");
    const quantityTitle = document.getElementById("quantityTitle");
    const quantitySummary = document.getElementById("quantitySummary");
    const qtySlider = document.getElementById("qtySlider");
    const qtyInput = document.getElementById("qtyInput");
    const qtyConfirmBtn = document.getElementById("qtyConfirmBtn");
    const qtyCancelBtn = document.getElementById("qtyCancelBtn");

    function openQuantityPanel(action) {
      pendingAction = action;
      const max = action === "Kaufen" ? maxBuyQty : maxSellQty;
      qtySlider.max = String(max);
      qtyInput.max = String(max);
      const defaultQty = max >= 1 ? 1 : 0;
      qtySlider.value = String(defaultQty);
      qtyInput.value = String(defaultQty);
      quantityTitle.textContent =
        action === "Kaufen"
          ? `Wie viele Aktien möchtest du kaufen? (max. ${max})`
          : `Wie viele Aktien möchtest du verkaufen? (max. ${max})`;
      updateQuantitySummary();
      actionButtons.classList.add("hidden");
      quantityPanel.classList.remove("hidden");
    }

    function closeQuantityPanel() {
      pendingAction = null;
      actionButtons.classList.remove("hidden");
      quantityPanel.classList.add("hidden");
    }

    function updateQuantitySummary() {
      const qty = Number(qtyInput.value) || 0;
      const total = round2(qty * newPrice);
      quantitySummary.textContent =
        pendingAction === "Kaufen"
          ? `${qty} Aktie(n) × ${formatCurrency(newPrice)} = ${formatCurrency(total)}`
          : `${qty} Aktie(n) × ${formatCurrency(newPrice)} = ${formatCurrency(total)}`;
      qtyConfirmBtn.disabled = qty <= 0;
    }

    buyBtn.addEventListener("click", () => openQuantityPanel("Kaufen"));
    sellBtn.addEventListener("click", () => openQuantityPanel("Verkaufen"));
    holdBtn.addEventListener("click", () => finalizeDecision("Halten", 0));
    qtyCancelBtn.addEventListener("click", closeQuantityPanel);

    qtySlider.addEventListener("input", () => {
      qtyInput.value = qtySlider.value;
      updateQuantitySummary();
    });
    qtyInput.addEventListener("input", () => {
      let val = Math.max(0, Math.min(Number(qtyInput.max), Math.floor(Number(qtyInput.value) || 0)));
      qtyInput.value = String(val);
      qtySlider.value = String(val);
      updateQuantitySummary();
    });

    qtyConfirmBtn.addEventListener("click", () => {
      const qty = Number(qtyInput.value) || 0;
      if (qty <= 0) return;
      finalizeDecision(pendingAction, qty);
    });

    /* ---------------------------- Countdown ---------------------------- */

    const RING_CIRCUMFERENCE = 2 * Math.PI * 52;
    const ringFg = document.getElementById("ringFg");
    const timerNumber = document.getElementById("timerNumber");
    ringFg.style.strokeDasharray = `${RING_CIRCUMFERENCE}`;
    ringFg.style.strokeDashoffset = "0";

    let remaining = TIMER_SECONDS;
    let finished = false;

    function tick() {
      remaining -= 1;
      const fraction = Math.max(0, remaining / TIMER_SECONDS);
      ringFg.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - fraction));
      timerNumber.textContent = formatTimerDisplay(remaining);

      ringFg.classList.remove("ring-warn", "ring-danger");
      if (fraction <= 0.25) ringFg.classList.add("ring-danger");
      else if (fraction <= 0.5) ringFg.classList.add("ring-warn");

      if (remaining <= 0) {
        clearInterval(intervalId);
        if (!finished) finalizeDecision("Halten", 0, true);
      }
    }

    const intervalId = setInterval(tick, 1000);
    timerController = {
      stop() {
        clearInterval(intervalId);
      },
    };

    /* ---------------------------- Entscheidung abschließen ---------------------------- */

    function finalizeDecision(action, quantity, timerExpired) {
      if (finished) return;
      finished = true;
      timerController.stop();

      const reactionTimeMs = Math.min(
        TIMER_SECONDS * 1000,
        Math.round(performance.now() - decisionStartedAt)
      );

      let cashAfter = cashBefore;
      let sharesAfter = sharesBefore;

      if (action === "Kaufen") {
        cashAfter = round2(cashBefore - quantity * newPrice);
        sharesAfter = sharesBefore + quantity;
      } else if (action === "Verkaufen") {
        cashAfter = round2(cashBefore + quantity * newPrice);
        sharesAfter = sharesBefore - quantity;
      }

      const portfolioValueAfter = round2(cashAfter + sharesAfter * newPrice);

      const record = {
        participantId: S.getParticipantId(),
        date: S.getTodayString(),
        scenarioNumber: scenario.id,
        scenarioTitle: scenario.title,
        price: newPrice,
        changePercent: scenario.changePercent,
        cashBefore: round2(cashBefore),
        cashAfter,
        sharesBefore,
        sharesAfter,
        portfolioValue: portfolioValueAfter,
        action,
        quantity,
        reactionTimeMs,
        timerExpired: !!timerExpired,
      };

      S.addRecord(record);

      const updatedPortfolio = {
        cash: cashAfter,
        shares: sharesAfter,
        price: newPrice,
        priceHistory: [...portfolio.priceHistory, newPrice].slice(-30),
      };
      S.setPortfolio(updatedPortfolio);
      S.setProgress({ nextScenarioIndex: index + 1, lastCompletedDate: S.getTodayString() });

      if (!DEV_MODE) {
        window.MTWWeb3Forms.sendRecordToResearcher(record, S.getDemographics());
      }

      renderDaySummary(record, updatedPortfolio);
    }
  }

  /* ============================== Screen 5: Tagesabschluss ============================== */

  function renderDaySummary(record, portfolio) {
    const totalValue = round2(portfolio.cash + portfolio.shares * portfolio.price);
    const isLastDay = record.scenarioNumber >= TOTAL_SCENARIOS;

    root.innerHTML = `
      ${headerHTML(record.scenarioNumber, portfolio)}
      <div class="centered-screen">
        <div class="card status-card">
          <div class="status-icon">✅</div>
          <h1>Tag ${record.scenarioNumber} abgeschlossen</h1>
          <div class="decision-recap">
            <div><span>Deine Entscheidung</span><strong>${escapeHtml(record.action)}${record.quantity ? ` (${record.quantity} Aktien)` : ""}</strong></div>
            <div><span>Reaktionszeit</span><strong>${(record.reactionTimeMs / 1000).toFixed(1).replace(".", ",")} s${record.timerExpired ? " (Timer abgelaufen)" : ""}</strong></div>
            <div><span>Neuer Kontostand</span><strong>${formatCurrency(totalValue)}</strong></div>
          </div>
          <p>${isLastDay
            ? "Das war das letzte Szenario. Klicke auf Weiter, um deine Ergebnisse zu sehen."
            : "Das nächste Szenario wird morgen freigeschaltet."}</p>
          <button id="continueBtn" class="btn btn-primary btn-large">Weiter</button>
        </div>
      </div>
    `;

    document.getElementById("continueBtn").addEventListener("click", route);
  }

  /* ============================== Start ============================== */

  document.addEventListener("DOMContentLoaded", route);
})();
