# Markt-Simulation – Maturaarbeit "Gier & Angst im Markthandel"

Eine webbasierte Simulation, in der Teilnehmende über 15 Kalendertage hinweg
je eine Handelsentscheidung unter Zeitdruck treffen. Reines HTML/CSS/JavaScript,
kein Server, keine Datenbank, kein Framework.

## Projektstruktur

```
markt-simulation/
├── index.html          Hauptseite für Teilnehmende
├── admin.html           Admin-Seite (Export/Löschen, PIN-geschützt)
├── css/
│   └── style.css        Gesamtes Styling (Dark-Theme)
├── js/
│   ├── scenarios.js      Die 15 Szenarien (Text, Kursänderung, Emotion)
│   ├── storage.js        localStorage-Verwaltung
│   ├── web3forms.js       Automatischer E-Mail-Versand pro Entscheidung
│   ├── app.js            Ablauflogik der Simulation
│   └── admin.js          Logik der Admin-Seite
└── README.md             Diese Anleitung
```

---

## 1. Lokal testen

Da du 15 Tage lang nicht auf jedes Datum warten willst, gibt es einen
**Testmodus**: Hänge `?dev=1` an die URL an, z. B.:

```
index.html?dev=1
```

Im Testmodus:
- ist die Tagessperre deaktiviert (du kannst alle 15 Szenarien direkt hintereinander durchklicken),
- läuft der Countdown nur 6 Sekunden statt der regulären 2 Minuten,
- werden **keine** Daten an Web3Forms gesendet (dein Postfach bleibt sauber),
- erscheint oben ein gut sichtbarer "TESTMODUS"-Banner mit einem Button, um Testdaten wieder zu löschen.

Zum lokalen Ausprobieren reicht ein Doppelklick auf `index.html` – die App
läuft komplett offline im Browser. Für den finalen Test der Web3Forms-Anbindung
(siehe Abschnitt 3) brauchst du allerdings eine echte Domain, da manche
Formular-Dienste `file://`-Seiten aus Sicherheitsgründen nicht akzeptieren.
Am einfachsten testest du das nach der Veröffentlichung auf GitHub Pages.

---

## 2. Veröffentlichen mit Git & GitHub Pages

Du brauchst einen kostenlosen [GitHub](https://github.com)-Account und
[Git](https://git-scm.com/downloads) installiert.

```bash
# 1. In den Projektordner wechseln
cd markt-simulation

# 2. Git-Repository initialisieren
git init
git add .
git commit -m "Erste Version der Markt-Simulation"

# 3. Auf GitHub ein NEUES, leeres Repository anlegen (über github.com,
#    ohne README/.gitignore anzuhaken), dann lokal verbinden:
git branch -M main
git remote add origin https://github.com/DEIN-BENUTZERNAME/markt-simulation.git
git push -u origin main
```

Dann auf GitHub:

1. Repository öffnen → **Settings** → **Pages**
2. Unter "Build and deployment" → **Source**: "Deploy from a branch"
3. **Branch**: `main`, Ordner `/ (root)` → **Save**
4. Nach 1–2 Minuten ist die Seite erreichbar unter:
   `https://DEIN-BENUTZERNAME.github.io/markt-simulation/`
   und die Admin-Seite unter:
   `https://DEIN-BENUTZERNAME.github.io/markt-simulation/admin.html`

Jede weitere Änderung veröffentlichst du mit:

```bash
git add .
git commit -m "Beschreibung der Änderung"
git push
```

GitHub Pages aktualisiert die Seite automatisch nach jedem Push (meist nach
ca. 30–60 Sekunden).

> **Tipp:** Verschicke den Teilnahme-Link (`.../index.html` bzw. einfach die
> Basis-URL) an deine Teilnehmenden, aber **nicht** den Link zu `admin.html`.

---

## 3. Web3Forms einrichten (automatischer E-Mail-Versand)

Damit du die Entscheidung jeder teilnehmenden Person automatisch per E-Mail
zugeschickt bekommst, nutzt die App [Web3Forms](https://web3forms.com) – einen
kostenlosen Dienst, der Formulardaten ohne eigenes Backend direkt an eine
E-Mail-Adresse weiterleitet.

**Einrichtung (5 Minuten):**

1. Gehe auf **https://web3forms.com** und klicke auf "Create your Form" /
   "Create Access Key".
2. Gib deine eigene E-Mail-Adresse ein und bestätige sie über den Link, den
   du per Mail bekommst.
3. Du erhältst einen **Access Key** (eine Art öffentlicher Code, kein
   Passwort – siehe Hinweis unten).
4. Öffne `js/web3forms.js` und ersetze diese Zeile:

   ```js
   const WEB3FORMS_ACCESS_KEY = "DEIN_ACCESS_KEY_HIER_EINFUEGEN";
   ```

   durch deinen echten Access Key, z. B.:

   ```js
   const WEB3FORMS_ACCESS_KEY = "a1b2c3d4-e5f6-7890-abcd-1234567890ef";
   ```

5. Änderung speichern, committen und pushen:

   ```bash
   git add js/web3forms.js
   git commit -m "Web3Forms Access Key eingetragen"
   git push
   ```

6. **Testen:** Öffne deine veröffentlichte GitHub-Pages-URL, gehe einmal
   durch ein Szenario (am besten mit `?dev=1` und danach den Testmodus-Reset
   nutzen) und prüfe dein Postfach (auch den **Spam-Ordner** – die erste
   E-Mail landet dort gelegentlich).

**Ist der Access Key ein Sicherheitsrisiko?** Nein. Laut Web3Forms ist der
Access Key bewusst dafür gemacht, öffentlich im Client-Code zu stehen – er
funktioniert wie ein Alias für deine E-Mail-Adresse und erlaubt niemandem,
auf dein Postfach zuzugreifen, sondern nur, dir Formulardaten zu senden.

**Wie oft wird gesendet?** Nach **jeder einzelnen Tagesentscheidung** wird
automatisch eine E-Mail an dich geschickt (nicht erst am Ende der 15 Tage).
Das ist bewusst so gewählt: Falls eine teilnehmende Person die Studie
vorzeitig abbricht, hast du trotzdem alle bereits getroffenen Entscheidungen
in deinem Postfach.

**Kostenloses Kontingent:** Das Gratis-Angebot von Web3Forms umfasst
**250 Zusendungen pro Monat**. Bei z. B. 15 Teilnehmenden × 15 Tage sind das
bis zu 225 E-Mails – das passt in den meisten Fällen noch hinein, kann sich
aber bei mehr Teilnehmenden oder längeren Erhebungszeiträumen summieren.
Behalte das im Blick; bei Bedarf gibt es ein günstiges kostenpflichtiges
Kontingent. Aktuelle Zahlen findest du unter web3forms.com/pricing.

**Wichtig – Web3Forms ist ein zusätzlicher Kanal, keine alleinige Datenbank:**
Web3Forms speichert Zusendungen im Gratis-Tarif nur 30 Tage lang zum
Nachschlagen; deine eigentliche "Datenbank" sind die E-Mails in deinem
Postfach. Jeder Datensatz bleibt zusätzlich **lokal im Browser der
teilnehmenden Person** gespeichert (siehe Admin-Seite), falls du im
Ausnahmefall doch direkten Zugriff auf ein Gerät brauchst.

---

## 4. Daten einsehen: Admin-Seite

Öffne `admin.html` (lokal oder über deine GitHub-Pages-URL). Ein PIN-Dialog
schützt die Seite vor Zufallsbesuchern. Den Standard-PIN kannst und solltest
du in `js/admin.js` ändern:

```js
const ADMIN_PIN = "forschung2026"; // hier deinen eigenen PIN eintragen
```

**Wichtiger Architektur-Hinweis:** `localStorage` ist immer an ein einzelnes
Gerät/einen Browser gebunden. Öffnest du `admin.html` auf deinem eigenen
Computer, siehst du dort **nicht automatisch die Daten aller Teilnehmenden**,
sondern nur, was auf genau diesem Gerät gespeichert wurde (z. B. deine
eigenen Testdurchläufe). Die vollständige Sammlung über alle Geräte hinweg
läuft ausschließlich über die Web3Forms-E-Mails aus Abschnitt 3. Die
Admin-Seite ist trotzdem nützlich: zum Testen während der Entwicklung, als
Sicherheitsnetz und zum Zurücksetzen deiner eigenen Testdaten.

Auf der Admin-Seite kannst du:
- alle lokal gespeicherten Datensätze in einer Tabelle einsehen,
- sie als **CSV** exportieren (Semikolon-getrennt, für Excel/SPSS geeignet),
- sie als **JSON** exportieren,
- **alle lokalen Daten löschen** (mit Tipp-Bestätigung "LÖSCHEN").

### CSV in Excel/SPSS öffnen
Die CSV-Datei ist mit Semikolon getrennt (deutsche Excel-Standardeinstellung)
und enthält eine BOM-Kennung, damit Umlaute korrekt dargestellt werden. In
SPSS: **Datei → Importieren → CSV-Daten**, Trennzeichen "Semikolon" wählen.

---

## 5. Datenschutz-Hinweise

Diese App wurde bewusst datensparsam gestaltet:

- Es werden **keine Namen, E-Mail-Adressen oder Kontaktdaten** von
  Teilnehmenden erhoben – nur eine zufällig erzeugte Teilnehmer-ID, Alter,
  Geschlecht, Erfahrungsstufe und die Entscheidungsdaten.
- Es werden **keine Google Fonts oder andere Dritt-Anbieter-Schriftarten**
  geladen (nur Systemschriften) – das vermeidet unnötige Datenübertragungen
  an Dritte beim Seitenaufruf.
- Übertragene Daten (per Web3Forms) enthalten laut Web3Forms nur das, was du
  im Formular selbst versendest – siehe deren
  [Datenschutzerklärung](https://web3forms.com/privacy).

Trotzdem gilt: Sobald echte Personen teilnehmen (auch anonymisiert), lohnt
sich eine kurze Rücksprache mit deiner Betreuungsperson bzw. Schule zu den
Vorgaben eurer Institution für Maturaarbeiten mit Datenerhebung – insbesondere,
wenn Teilnehmende minderjährig sind. Diese Anleitung ersetzt keine
rechtliche Beratung.

**Formulierungsvorschlag** für den Einwilligungstext (bereits als Grundgerüst
in `index.html` enthalten, kannst du anpassen):

> "Ich nehme freiwillig teil und bin damit einverstanden, dass meine
> anonymisierten Entscheidungsdaten für die Maturaarbeit ausgewertet werden."

---

## 6. Szenarien anpassen

Alle 15 Szenarien stehen in `js/scenarios.js`. Jedes Szenario hat:

```js
{
  id: 1,                          // Tag/Reihenfolge
  title: "Kurze Schlagzeile",
  message: "Ausführlicher Nachrichtentext für die Newsbox",
  changePercent: 82,              // + = Kursanstieg, - = Kurssturz
  emotion: "Gier / Euphorie",     // nur für deine eigene Auswertung
  dramatic: false,                // true = optisch rot hervorgehoben/animiert
}
```

Änderungen wirken sich nur auf Szenarien aus, die noch nicht gespielt wurden.

---

## 7. Fehlerbehebung

**E-Mails kommen nicht an:**
- Spam-/Werbe-Ordner prüfen (besonders bei der allerersten Zusendung).
- Prüfen, ob der Access Key in `js/web3forms.js` korrekt eingetragen ist
  (keine Anführungszeichen vergessen/verdoppelt).
- Web3Forms blockiert neue, noch nicht bekannte Domains teils präventiv gegen
  Spam. Falls es auf deiner `github.io`-Domain nach 24h nicht funktioniert,
  kontaktiere den Web3Forms-Support über web3forms.com – das ist in der Regel
  unkompliziert und kostenlos gelöst.
- Browser-Konsole öffnen (F12 → Console) und nach Fehlermeldungen mit
  "Web3Forms" suchen.

**"Tag X von 15" wird nicht hochgezählt / Sperre funktioniert nicht wie erwartet:**
- Das Datum wird über die **lokale Systemzeit des Geräts** der teilnehmenden
  Person geprüft. Bei falsch eingestellter Systemuhr kann es zu Abweichungen
  kommen.
- localStorage ist pro Browser: Wechselt eine Person das Gerät oder nutzt
  einen privaten/Inkognito-Tab, beginnt die Simulation dort von vorne.

**Admin-Seite zeigt "0 Datensätze", obwohl schon gespielt wurde:**
- Das ist normal, wenn du `admin.html` auf einem anderen Gerät öffnest als
  demjenigen, auf dem gespielt wurde (siehe Abschnitt 4). Die eigentlichen
  Daten findest du in deinem E-Mail-Postfach.

---

## 8. Technische Hinweise

- Kein Build-Prozess, keine Abhängigkeiten, keine `node_modules` – reines
  HTML/CSS/Vanilla-JS. Jede Datei kann direkt im Texteditor bearbeitet werden.
- Getestet in aktuellen Versionen von Chrome, Firefox, Edge und Safari
  (Desktop & Mobil).
- `localStorage`-Schlüssel sind mit `mtw_` (Markt-Trading-Wahrnehmung)
  präfixiert, um Kollisionen mit anderen Seiten zu vermeiden.
