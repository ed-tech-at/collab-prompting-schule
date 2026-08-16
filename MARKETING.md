# collab.prompting.schule

## Kurzbeschreibung
**collab.prompting.schule** ist eine webbasierte Plattform für kollaborative genKI Lehr/-Lernsettings. Lehrende erstellen einen geschützten **CollabSpace**, hinterlegen eine Aufgabe, einen Systemprompt sowie einen kompatiblen LLM-Zugang und laden Teilnehmende per CollabSpace-ID und Teilnahmecode ein.

Studierende starten innerhalb eines Spaces eigene **CollabChats** mit dem konfigurierten Sprachmodell. Die Gespräche werden im CollabSpace verlinkt und können nach einer Bewertung für andere Teilnehmende sichtbar werden. Lehrende sehen alls Chats. Dadurch eignet sich die Plattform für Lehre, Reflexion, Vergleich von Prompting-Strategien und gemeinsame Diskussion von KI-Ergebnissen.

## Zielgruppe
- Lehrende in Schule, Hochschule und Weiterbildung
- Studierende und Lernende in KI-gestützten Lehrveranstaltungen

## Einsatzszenarien
- Prompting-Übungen mit gemeinsamer Nachbesprechung
- Vergleich unterschiedlicher Lösungswege zu derselben Aufgabe
- Reflexion über Qualität, Nützlichkeit und Grenzen von KI-Antworten
- Lehrveranstaltungen mit vorgegebenem Systemprompt und externem LLM-Backend
- Begleitforschung zu Nutzung, Bewertung und Sichtbarkeit von KI-Dialogen

## Zeitplan
### Bisherige Schritte
- Feburar 2026: Entwicklung der Anwendung
- **2026:** Bereitstellung unter `https://collab.prompting.schule`
- Juli 2026: JSON-Export der Space-Daten
- August 2026: Bild-Upload für Teilnehmende sowie ZIP-Export der Space-Daten

### Nächste Schritte
- Erprobung in weiteren Lehr-/Lernszenarien

## Zusätzliche Informationen

### Funktionen im Überblick
- Lehrende können selbst neue **CollabSpaces** unter https://collab.prompting.schule/admin anlegen
  - Pro Space konfigurierbar:
    - LLM `base_url` (Anbindung an OpenAI-kompatible Chat-Completions-APIs)
    - LLM `API Key` (zB aus LLMDuckt)
    - Modellname
    - Aufgabenstellung
    - Systemprompt
    - Admin-Passwort
    - Teilnahmecode für Lernende
    - Mathematik-Rendering (KaTeX) für Formeln in den Antworten
    - Bild-Upload für Teilnehmende (standardmäßig deaktiviert)
- Teilnehmende treten einem Space mit **Space-ID, Username und Teilnahmecode** bei
- Innerhalb eines Spaces können Teilnehmende beliebig neue **Einzelchats** starten
- Nur die Person, die einen Chat erstellt hat, kann darin weitere Nachrichten senden
- Chatverläufe bleiben im Space erhalten und sind später wieder aufrufbar
- Teilnehmende können ihren eigenen Chat mit **1 bis 5 Sternen** und Kommentar bewerten
- Lehrende können Chats ebenfalls mit **1 bis 5 Sternen** und Kommentar bewerten
- Ein Chat wird für andere Teilnehmende grundsätzlich erst sichtbar, wenn er bewertet wurde
- Lehrende können Chats zusätzlich **verstecken oder wieder freigeben**
- Lehrende sehen in der Admin-Oberfläche alle Konversationen eines Spaces samt Bewertungen und Kommentaren
- Mehrere Spaces und Logins werden per Cookie-Session für **8 Tage** gespeichert

#### Bild-Upload (Bild-Prompting)
- Pro Space aktivierbar; ist im Auslieferungszustand **deaktiviert**
- Teilnehmende hängen Bilder per Dateiauswahl, **Drag & Drop** oder **Einfügen aus der Zwischenablage** an eine Nachricht an
- Auch Nachrichten **ohne Text**, also reine Bildnachrichten, sind möglich
- Bilder bleiben Teil des Gesprächsverlaufs und werden bei Folgefragen erneut an das Modell übergeben
- **Voraussetzung:** Das hinterlegte Sprachmodell muss Bildeingaben (Vision) unterstützen — es wird derselbe LLM-Zugang wie für Text verwendet, kein separates Bildmodell
- Unterstützt wird jedes Format, das der Browser darstellen kann (JPEG, PNG, WebP, GIF, AVIF …); die Bilder werden vor dem Versand im Browser auf max. 1568 Pixel Kantenlänge verkleinert und als JPEG kodiert
- Nicht verarbeitbar sind **HEIC/HEIF**-Dateien (iPhone-Format) am Desktop; Transparenz wird auf Weiß gesetzt und von animierten GIFs bleibt das erste Bild
- Maximal **3 Bilder pro Nachricht**

#### Export der Space-Daten
- Lehrende können einen Space jederzeit aus der Verwaltung herunterladen
- **JSON-Export:** Einstellungen, alle Chats und alle Nachrichten in einer Datei, inklusive der zur Löschung vorgemerkten Chats
- **ZIP-Export mit Bildern:** dieselbe JSON-Datei plus die hochgeladenen Bilder als einzelne Bilddateien; wird nur angeboten, wenn der Space Bild-Upload nutzt
- **Nicht enthalten:** API-Key, Verwaltungspasswort und Teilnahmecode
- Eignet sich für Archivierung, Weiterverarbeitung und die wissenschaftliche Auswertung von Prompting-Verläufen

### Didaktischer Mehrwert
- KI-Nutzung wird nicht nur individuell, sondern **vergleichbar und besprechbar**
- Lernende sehen nach Freigabe auch die Lösungs- und Prompting-Wege anderer
- Lehrende erhalten eine einfache Grundlage für Feedback, Diskussion und Sichtung von Ergebnissen
- Die Plattform verbindet **individuelles Ausprobieren** mit **kollektiver Reflexion**

### Rechtliches & Datenschutz (Kurzfassung)
- Für die Nutzung müssen Teilnehmende den Datenschutzinformationen und Teilnahmebedingungen zustimmen
- Sessions werden per Cookie lokal für **8 Tage** gespeichert
- Usernames und eingegebene Inhalte können im Space anderen Teilnehmenden und Lehrenden zugeordnet werden
- Inhalte und Nutzungsdaten können laut Datenschutzhinweis **pseudonymisiert zu wissenschaftlichen Zwecken** ausgewertet werden

### Technische Eckpunkte
- Webanwendung auf Basis von **SvelteKit**
- LLM-Anbindung über die **OpenAI Node SDK**
- Markdown-Ausgabe für Assistant-Antworten
- Bildeingaben werden als multimodale Nachrichten (`image_url`) an die Chat-Completions-API übergeben und in der Datenbank beim jeweiligen Chateintrag gespeichert
- Export als JSON bzw. ZIP direkt aus der Verwaltung, ohne zusätzliche Werkzeuge
- Self-Hosting ist laut Repository grundsätzlich möglich; TU-Graz-spezifische Kennzeichen müssen dabei entfernt werden

### Abgrenzung
- Die Plattform ist **kein allgemeiner KI-Chat für anonyme Massenkommunikation**
- Der Fokus liegt auf **strukturierten Lehr-/Lernräumen** mit klarer Aufgabe, Zugangsschutz, Nachvollziehbarkeit und pädagogischer Auswertung

### URLs
- Produktivsystem: https://collab.prompting.schule
- Repository (aktuell privat): https://github.com/ed-tech-at/collab-prompting-schule

## Support
- Derzeit Einzelbetreuung von Ben
