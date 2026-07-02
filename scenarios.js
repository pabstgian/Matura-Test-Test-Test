/**
 * scenarios.js
 * ------------------------------------------------------------
 * Enthält die 15 fest definierten Marktszenarien der Studie.
 *
 * Jedes Szenario besteht aus:
 *   - id:            Szenario-Nummer (1-15), entspricht dem Studientag
 *   - title:         Kurze Schlagzeile (Ticker-Stil)
 *   - message:       Ausführlicher Nachrichtentext für die Newsbox
 *   - changePercent: Kursänderung in %, die beim Laden des Szenarios
 *                     auf den aktuellen Kurs angewendet wird
 *                     (positiv = Kursanstieg, negativ = Kurssturz)
 *   - emotion:        Intendierte Zielemotion (nur für die spätere
 *                     Auswertung relevant, wird den Teilnehmenden
 *                     NICHT angezeigt)
 *   - dramatic:       true = Nachricht wird optisch besonders
 *                     hervorgehoben/animiert (z.B. Crash, Krieg)
 *
 * Die Reihenfolge der Szenarien ist bewusst nicht rein alternierend,
 * damit Teilnehmende das Muster (immer abwechselnd gut/schlecht)
 * nicht vorhersehen und ihr Verhalten danach ausrichten können.
 *
 * Änderungen an dieser Datei wirken sich erst auf Teilnehmende aus,
 * die die jeweilige Szenario-Nummer noch nicht gespielt haben.
 * ------------------------------------------------------------
 */

const SCENARIOS = [
  {
    id: 1,
    title: "KI-Hype erfasst die Börse",
    message:
      "Auf Social Media überschlagen sich die Meldungen: Eine neue KI-Anwendung des Unternehmens soll \u201edie Arbeitswelt revolutionieren\u201c. Influencer und Foren feiern die Aktie als \u201eKauf des Jahrzehnts\u201c, der Handel wird regelrecht überrannt.",
    changePercent: 82,
    emotion: "Gier / Euphorie",
    dramatic: false,
  },
  {
    id: 2,
    title: "Militärischer Konflikt eskaliert",
    message:
      "Über Nacht ist ein bewaffneter Konflikt in einer wirtschaftlich bedeutenden Region eskaliert. Investoren weltweit ziehen panisch Kapital ab, die Börsen erleben einen der schwärzesten Handelstage der letzten Jahre.",
    changePercent: -58,
    emotion: "Angst / Panik",
    dramatic: true,
  },
  {
    id: 3,
    title: "Zentralbank erhöht Leitzins überraschend",
    message:
      "Die Zentralbank hat den Leitzins völlig unerwartet deutlich angehoben, um die Inflation zu bremsen. Analysten sind überrumpelt, an den Märkten macht sich Nervosität breit.",
    changePercent: -32,
    emotion: "Angst / Unsicherheit",
    dramatic: false,
  },
  {
    id: 4,
    title: "Überraschende Zinssenkung angekündigt",
    message:
      "Die Zentralbank senkt den Leitzins stärker als von irgendjemandem erwartet. Billiges Geld soll die Wirtschaft ankurbeln \u2013 die Börsen reagieren euphorisch, Kaufaufträge häufen sich in Sekunden.",
    changePercent: 45,
    emotion: "Gier",
    dramatic: false,
  },
  {
    id: 5,
    title: "Inflation erreicht Rekordhoch",
    message:
      "Die neuesten Inflationszahlen liegen weit über den Prognosen. Die Kaufkraft der Bevölkerung sinkt spürbar, Ökonomen warnen vor einer Lohn-Preis-Spirale. An der Börse macht sich Verunsicherung breit.",
    changePercent: -47,
    emotion: "Angst",
    dramatic: false,
  },
  {
    id: 6,
    title: "Rezessionsangst geht um",
    message:
      "Mehrere Frühindikatoren deuten übereinstimmend auf eine bevorstehende Rezession hin. Wirtschaftsinstitute korrigieren ihre Prognosen drastisch nach unten. An den Märkten breitet sich Verkaufsdruck aus.",
    changePercent: -63,
    emotion: "Angst / Panik",
    dramatic: true,
  },
  {
    id: 7,
    title: "Großangelegter Cyberangriff",
    message:
      "Ein koordinierter Cyberangriff hat zentrale Systeme des Unternehmens lahmgelegt. Kundendaten könnten betroffen sein, der Betrieb steht in mehreren Werken still. Erste Schadensschätzungen kursieren bereits.",
    changePercent: -52,
    emotion: "Angst",
    dramatic: true,
  },
  {
    id: 8,
    title: "Lieferengpässe lösen sich auf",
    message:
      "Nach Monaten voller Produktionsausfälle melden mehrere Häfen wieder Normalbetrieb. Die Lieferketten entspannen sich schneller als erwartet, die Produktion läuft wieder auf Hochtouren.",
    changePercent: 34,
    emotion: "Erleichterung / Gier",
    dramatic: false,
  },
  {
    id: 9,
    title: "Neue Pandemiewelle sorgt für Lockdown-Ängste",
    message:
      "Gesundheitsbehörden melden eine neue, schnell verbreitende Virusvariante. Erste Länder erwägen erneute Beschränkungen. Die Erinnerung an frühere Lockdowns lässt die Märkte einbrechen.",
    changePercent: -68,
    emotion: "Angst / Panik",
    dramatic: true,
  },
  {
    id: 10,
    title: "Bekannte Großinvestorin steigt massiv ein",
    message:
      "Eine für ihr Gespür bekannte Star-Investorin hat laut Pflichtmitteilung ein Milliardenpaket der Aktie erworben. Kleinanleger springen in Scharen auf den Zug auf, aus Angst, die Gelegenheit zu verpassen.",
    changePercent: 97,
    emotion: "Gier / Euphorie (FOMO)",
    dramatic: false,
  },
  {
    id: 11,
    title: "CEO tritt überraschend zurück",
    message:
      "Der langjährige Vorstandsvorsitzende ist mit sofortiger Wirkung zurückgetreten \u2013 offizielle Gründe werden nicht genannt. Die Nachfolge ist ungeklärt, Gerüchte über interne Konflikte machen die Runde.",
    changePercent: -41,
    emotion: "Unsicherheit",
    dramatic: false,
  },
  {
    id: 12,
    title: "Bilanzskandal aufgedeckt",
    message:
      "Interne Dokumente belegen offenbar jahrelange Bilanzfälschung in erheblichem Ausmaß. Die Finanzaufsicht kündigt eine sofortige Untersuchung an, der Handel mit der Aktie wird zeitweise ausgesetzt.",
    changePercent: -76,
    emotion: "Angst / Panik",
    dramatic: true,
  },
  {
    id: 13,
    title: "Quartalszahlen übertreffen alle Erwartungen",
    message:
      "Das Unternehmen meldet einen Rekordgewinn \u2013 deutlich über den optimistischsten Analystenschätzungen. Das Management hebt zudem die Jahresprognose kräftig an.",
    changePercent: 71,
    emotion: "Euphorie",
    dramatic: false,
  },
  {
    id: 14,
    title: "Überraschendes Übernahmeangebot",
    message:
      "Ein internationaler Konzern legt ein Übernahmeangebot mit einer außergewöhnlich hohen Prämie auf den aktuellen Kurs vor. Der Handel mit der Aktie wird kurzzeitig ausgesetzt, danach schnellt der Kurs nach oben.",
    changePercent: 112,
    emotion: "Euphorie / Gier",
    dramatic: false,
  },
  {
    id: 15,
    title: "Historisches Friedensabkommen unterzeichnet",
    message:
      "Nach monatelangen Verhandlungen wurde ein Friedensabkommen unterzeichnet, das die globalen Märkte spürbar beruhigt. Erleichterung macht sich breit, Anleger kehren in großer Zahl an die Börse zurück.",
    changePercent: 53,
    emotion: "Erleichterung / Gier",
    dramatic: false,
  },
];

// Für Umgebungen ohne ES-Module (direktes <script>-Tag) global verfügbar machen
if (typeof window !== "undefined") {
  window.SCENARIOS = SCENARIOS;
}
