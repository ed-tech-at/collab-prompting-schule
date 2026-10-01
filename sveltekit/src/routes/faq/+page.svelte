<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<h1>FAQ und Kurzanleitung</h1>

<section>
	<h2>Was ist collab.prompting.schule?</h2>
	<p>
		collab.prompting.schule ist ein Werkzeug für kollaborative KI-Übungen in Lehrveranstaltungen.
		Lehrende erstellen einen CollabSpace mit Aufgabe, Teilnahmecode und KI-Anbindung. Teilnehmende
		starten darin eigene CollabChats, die anschließend gemeinsam verglichen und besprochen werden können.
	</p>
	<p>
		Ein CollabSpace ist der gemeinsame Arbeitsraum. Ein CollabChat ist eine einzelne Unterhaltung innerhalb
		dieses Arbeitsraums.
	</p>
</section>

<section>
	<h2>Wie läuft eine Einheit ab?</h2>
	<ol>
		<li>Lehrende erstellen einen CollabSpace und konfigurieren Aufgabe, Teilnahmecode und KI-Schnittstelle.</li>
		<li>Teilnehmende öffnen den Link oder geben CollabSpace-ID und Teilnahmecode ein.</li>
		<li>Teilnehmende starten eigene CollabChats und bewerten diese bei Bedarf.</li>
		<li>Lehrende besprechen die Chats gemeinsam mit der Gruppe und können Chats für Teilnehmende anzeigen oder verstecken.</li>
	</ol>
</section>

<section>
	<h2>Wie nehme ich an einem CollabSpace teil?</h2>
	<p>
		Wenn Sie eine Einladung erhalten haben, verwenden Sie die CollabSpace-ID, Ihren Anzeigenamen und den
		Teilnahmecode aus der Einladung. Danach können Sie einen eigenen CollabChat starten.
	</p>
	<p><a class="btn btn-primary" href={resolve('/space')}>An einem CollabChat teilnehmen <i class="fas fa-sign-in-alt"></i></a></p>
</section>

<section>
	<h2>Wie verwalte ich einen eigenen CollabSpace?</h2>
	<p>
		Lehrende legen einen CollabSpace an, teilen den Teilnahmelink oder QR-Code und können die entstandenen
		CollabChats später in der Verwaltung ansehen, verstecken oder zur Löschung vormerken.
	</p>
	<p>
		Für die Verwaltung brauchen Sie die CollabSpace-ID und das Verwaltungspasswort. Die E-Mail-Adresse wird
		für Benachrichtigungen und Meldungen zum CollabSpace verwendet und erstellt keinen Account.
	</p>
	<p><a class="btn btn-badge" href={resolve('/admin')}>CollabSpace-Verwaltung <i class="fas fa-wrench"></i></a></p>
</section>

<section>
	<h2>Gibt es Benutzerkonten?</h2>
	<p>
		Es gibt keinen persönlichen Account und kein Profil. Bei der Verwendung von CollabSpaces werden lokale
		Sitzungs-Cookies für 8 Tage auf Ihrem Gerät gespeichert.
	</p>
	<p>
		Das Abmelden löscht nur diese lokalen Sitzungen. Ihre CollabSpaces und CollabChats werden dadurch nicht
		gelöscht.
	</p>
</section>
