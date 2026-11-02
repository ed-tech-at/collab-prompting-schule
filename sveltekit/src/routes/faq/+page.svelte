<script lang="ts">
	import { resolve } from '$app/paths';
	import { localize } from '$lib/i18n';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

{#if data.lang === 'en'}
<h1>FAQ and quick guide</h1>

<section>
	<h2>What is collab.prompting.schule?</h2>
	<p>
		collab.prompting.schule is a tool for collaborative AI exercises in courses.
		Teachers create a CollabSpace with a task, a participation code and an AI connection. Participants
		start their own CollabChats in it, which can then be compared and discussed together.
	</p>
	<p>
		A CollabSpace is the shared workspace. A CollabChat is a single conversation within
		this workspace.
	</p>
</section>

<section>
	<h2>How does a session work?</h2>
	<ol>
		<li>Teachers create a CollabSpace and configure the task, participation code and AI interface.</li>
		<li>Participants open the link or enter the CollabSpace ID and participation code.</li>
		<li>Participants start their own CollabChats and rate them if they like.</li>
		<li>Teachers discuss the chats with the group and can show or hide chats for participants.</li>
	</ol>
</section>

<section>
	<h2>How do I join a CollabSpace?</h2>
	<p>
		If you have received an invitation, use the CollabSpace ID, your display name and the
		participation code from the invitation. Then you can start your own CollabChat.
	</p>
	<p><a class="btn btn-primary" href={localize(resolve('/space'), data.lang)}>Join a CollabChat <i class="fas fa-sign-in-alt"></i></a></p>
</section>

<section>
	<h2>How do I manage my own CollabSpace?</h2>
	<p>
		Teachers create a CollabSpace, share the participation link or QR code and can later view, hide or
		mark the resulting CollabChats for deletion in the admin area.
	</p>
	<p>
		To manage it you need the CollabSpace ID and the admin password. The email address is used
		for notifications and reports about the CollabSpace and does not create an account.
	</p>
	<p><a class="btn btn-badge" href={localize(resolve('/admin'), data.lang)}>CollabSpace admin <i class="fas fa-wrench"></i></a></p>
</section>

<section>
	<h2>Are there user accounts?</h2>
	<p>
		There is no personal account and no profile. When you use CollabSpaces, local session cookies
		are stored on your device for 8 days.
	</p>
	<p>
		Logging out only deletes these local sessions. Your CollabSpaces and CollabChats are not
		deleted.
	</p>
</section>
{:else}
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
	<p><a class="btn btn-primary" href={localize(resolve('/space'), data.lang)}>An einem CollabChat teilnehmen <i class="fas fa-sign-in-alt"></i></a></p>
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
	<p><a class="btn btn-badge" href={localize(resolve('/admin'), data.lang)}>CollabSpace-Verwaltung <i class="fas fa-wrench"></i></a></p>
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
{/if}
