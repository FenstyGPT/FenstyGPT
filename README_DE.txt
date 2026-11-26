# FenstyGPT – einfache Browser-KI

## Was ist dabei?
- `index.html`: die Chat-Seite. Du kannst sie im Browser öffnen.
- `worker.js`: der kleine sichere KI-Server für Cloudflare.
- Der geheime Gemini-API-Schlüssel liegt nur auf dem Server, nicht in der HTML-Datei.

## Einmalige Einrichtung
Du brauchst für die echte KI einen Gemini-API-Schlüssel und einen Cloudflare-Worker. Bitte lass dir dabei von einem Elternteil helfen. Prüft vorher die aktuellen Alters-, Nutzungs- und möglichen Kostenbedingungen von Google und Cloudflare. Teile deinen API-Schlüssel niemals im Chat oder in GitHub.

### A. KI-Server einrichten
1. Öffne https://dash.cloudflare.com/ und melde dich an.
2. Gehe zu **Workers & Pages** und erstelle einen Worker.
3. Öffne den Worker-Code und ersetze den Beispielcode durch den kompletten Inhalt von `worker.js`.
4. Speichere und veröffentliche den Worker.
5. Öffne **Settings → Variables and Secrets**.
6. Füge ein Secret mit dem Namen `GEMINI_API_KEY` hinzu. Als Wert kommt dein Gemini-API-Schlüssel hinein. Speichern.
7. Kopiere die Worker-Adresse, z. B. `https://fenstygpt.DEIN-NAME.workers.dev`.

API-Schlüssel: https://aistudio.google.com/apikey
Cloudflare: https://dash.cloudflare.com/

### B. Chat-Seite öffnen
1. Öffne `index.html` in Chrome. Für eine dauerhafte App-ähnliche Seite kann sie später über GitHub Pages veröffentlicht werden.
2. Tippe oben rechts auf ⚙️.
3. Füge bei **KI-Server-Adresse** die kopierte Worker-Adresse ein.
4. Speichere und schreibe eine Nachricht.

## Einstellungen
Name, Charakter, Humor, Freund-Modus und Regeln lassen sich jederzeit in den Einstellungen ändern. Sie werden lokal in diesem Browser gespeichert.

## Wichtig
- Ohne eingerichteten Worker und API-Schlüssel zeigt die Seite nur die Oberfläche; echte KI-Antworten funktionieren erst nach Schritt A.
- Der Worker nutzt standardmäßig `gemini-3.5-flash-lite`. Falls Google das Modell ändert oder für dein Konto nicht freigibt, muss die Modell-ID im Worker angepasst werden.
- Ein API-Schlüssel kann Nutzungskosten verursachen. Vorher mit einem Elternteil prüfen und Nutzungslimits setzen.
- Das ist eine private, einfache Web-App, keine offiziell geprüfte oder überwachte ChatGPT-App.
