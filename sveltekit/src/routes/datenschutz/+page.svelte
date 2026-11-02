<script lang='ts'>
	import { resolve } from '$app/paths';
	import { localize } from '$lib/i18n';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<main id="main" class="special">

{#if data.lang === 'en'}
<h2 class="wp-block-heading">Privacy policy and terms of participation</h2>

<p class="notice"><i>This is a courtesy translation. Only the <a href={localize(resolve('/datenschutz'), 'de')} lang="de">German version</a> is legally binding.</i></p>

<h4>1. Principle</h4>

<p>Protecting your data is particularly important to us. We therefore process your data exclusively on the basis of the statutory provisions (<a href="https://www.dsb.gv.at/recht-entscheidungen/gesetze-in-oesterreich.html">GDPR, TKG</a>). In this privacy information we inform you about the most important aspects of data processing on our website.</p>

<h4>2. Purpose and legal basis of processing</h4>

<p>When you visit our website, your IP address and the start and end of the session are recorded for the duration of that session. This is technically necessary and therefore constitutes a legitimate interest within the meaning of Art 6 (1) (f) GDPR. Unless otherwise stated below, we do not process this data any further.</p>

<p>Your session is stored in a local cookie for 8 days. This is necessary to allow proper use of the website.</p>

<p>You can end your local sessions at any time at <a href={localize(resolve("/logout"), data.lang)}>/logout</a> or with the link <i>Log out of all local sessions</i> on the start page.</p>

<p>Your entries can be attributed to your display name by the lecturer and other participants.</p>

<h5>2.1 Evaluation for scientific purposes</h5>
The data collected while using our website, such as the freely chosen username and the content entered, are evaluated in pseudonymised form for scientific purposes. These evaluations serve research and the further development of educational and technology offerings, in particular in the fields of educational informatics, artificial intelligence and machine learning. Data processing is carried out in strict compliance with applicable data protection law and solely for the purpose of gaining scientific insights that can contribute to improving and further developing our offering.

<h5>2.2 Use of artificial intelligence (AI) in interactive learning objects</h5>

Our platform uses modern AI technologies to support interactive learning objects. They are used in particular to generate content dynamically, to analyse entries and to improve the user experience. Processing takes place solely to provide and maintain the services. The models used do not learn from users' individual content.

<h5>2.3 Notes for CollabSpace creators</h5>
<p>When creating a CollabSpace, a valid email address is required. It is used to inform you about important events, for example when content from your CollabSpace is reported. In such cases you automatically receive a notification at the address provided. On request, the reporting person can also receive a copy of this notification and thereby learn your email address.</p>

<b>Prohibited content</b>
<p>We expressly ask for your help: should offensive or inappropriate content be spread via your space, your feedback helps us to review and remove such content as quickly as possible.</p>

<p>CollabSpaces must not be used to publish content that:</p>
<ul>
  <li>glorifies or incites violence,</li>
  <li>deals with or promotes weapons,</li>
  <li>describes or supports illegal activities,</li>
  <li>is discriminatory or contains hate speech,</li>
  <li>violates applicable law or ethical standards.</li>
</ul>

<p>Violations of these rules may lead to the space being blocked or to further legal action.</p>

<h4>3. Internal services and internal data collection</h4>
<p>
When using the platform, technically necessary log data is stored. It allows TU Graz to detect, narrow down and eliminate system malfunctions, system errors that limit the availability of the online services, and unauthorised access to our systems. The log data is not linked to other personal data. The following data categories are processed: date and time of the request, name and URL of the retrieved resources, amount of data (in bytes) of the requested and/or retrieved resource, server response (e.g. HTTP status code), identification data of the browser and operating system used, the website from which access took place, IP address, username.
</p>

<h4>4. Your rights</h4>

<p>Users have the right to information, erasure, rectification, restriction of processing, data portability and to object to data processing. There is also a right to lodge a complaint with the Austrian Data Protection Authority, Wickenburggasse 8, 1080 Vienna (<a href="mailto:dsb@dsb.gv.at">dsb@dsb.gv.at</a>).</p>

<p>The controller responsible for processing your personal data is Graz University of Technology (hereinafter TU Graz).
The data protection officer of TU Graz is x-tention Informationsrechnologie GmbH, Friedhofstraße 57, 4600 Wels, datenschutzbeauftragter@tugraz.at.
For data protection concerns, please contact <a href="mailto:datenschutz@tugraz.at">datenschutz@tugraz.at</a>.</p>

<p>Privacy notice created with the support of the <a href="https://www.wko.at/internetrecht/datenschutzerklaerung-checkliste-infopflichten-dsgvo-tkg-we">WKO</a>.</p>
{:else}
<h2 class="wp-block-heading">Datenschutz und Teilnahmebedingungen</h2>



<h4>1. Grundsatz</h4>

<p>Der Schutz Ihrer Daten ist uns ein besonderes Anliegen. Wir verarbeiten Ihre Daten daher ausschließlich auf Grundlage der gesetzlichen Bestimmungen (<a href="https://www.dsb.gv.at/recht-entscheidungen/gesetze-in-oesterreich.html">DSGVO, TKG</a>). In diesen Datenschutzinformationen informieren wir Sie über die wichtigsten Aspekte der Datenverarbeitung im Rahmen unserer Website.</p>



<h4>2. Zweck und Rechtsgrundlage der Verarbeitung</h4>


<p>Beim Besuch unserer Website wird Ihre IP-Adresse, Beginn und Ende der Sitzung für die Dauer dieser Sitzung erfasst. Dies ist aus technischem Grund erforderlich und stellt damit ein berechtigtes Interesse i.S.v. Art 6 Abs 1 lit f DSGVO dar. Soweit im Folgenden nichts anderes geregelt wird, werden diese Daten von uns nicht weiterverarbeitet.</p>

<p>Ihre Sitzung wird für die Dauer von 8 Tagen in einem lokalen Cookie gespeichert. Dies ist notwendig, um die Nutzung der Website ordnungsgemäß zu ermöglichen.</p>

<p>Sie können jederzeit Ihre lokalen Sitzungen unter <a href={localize(resolve("/logout"), data.lang)}>/logout</a> oder durch den Link <i>Von allen lokalen Sitzungen abmelden</i> auf der Startseite beenden.</p>

<p>Ihre Eingaben können durch den Vortragenden und andere Teilnehmende Ihrem Anzeigenamen zugeordnet werden.</p>



<h5>2.1 Auswertung zu wissenschaftlichen Zwecken</h5>
Die im Rahmen der Nutzung unserer Website erhobenen Daten, wie der frei gewählte Username und die eingegebenen Inhalte, werden pseudonymisiert zu wissenschaftlichen Zwecken ausgewertet. Diese Auswertungen dienen der Forschung und Weiterentwicklung von Bildungs- und Technologieangeboten, insbesondere im Bereich der Bildungsinformatik, Künstlichen Intelligenz und maschinellen Lernens. Die Datenverarbeitung erfolgt unter strikter Einhaltung der geltenden Datenschutzgesetze und ausschließlich zu dem Zweck, wissenschaftliche Erkenntnisse zu gewinnen, die zur Verbesserung und Weiterentwicklung unseres Angebots beitragen können.

<h5>2.2 Verwendung von Künstlicher Intelligenz (KI) in interaktiven Lernobjekten</h5>

Unsere Plattform nutzt moderne KI-Technologien zur Unterstützung interaktiver Lernobjekte. Diese kommen insbesondere bei der dynamischen Generierung von Inhalten, bei der Analyse von Eingaben sowie zur Verbesserung der Benutzererfahrung zum Einsatz. Die Verarbeitung erfolgt ausschließlich zur Bereitstellung und Wartung der Dienste. Die eingesetzten Modelle lernen nicht aus den individuellen Inhalten der Nutzer:innen. 

<h5>2.3 Hinweise für CollabSpace-Ersteller:innen</h5>
<p>Beim Anlegen eines CollabSpace-Raums ist die Eingabe einer gültigen E-Mail-Adresse erforderlich. Diese wird verwendet, um Sie über wichtige Ereignisse zu informieren – etwa wenn Inhalte aus Ihrem CollabSpace gemeldet werden. In solchen Fällen erhalten Sie automatisch eine Benachrichtigung an die angegebene Adresse. Auf Wunsch kann auch die meldende Person eine Kopie dieser Benachrichtigung erhalten und so Ihre E-Mail-Adresse erfahren.</p>


<b>Unzulässige Inhalte</b>
<p>Wir bitten Sie ausdrücklich um Ihre Mithilfe: Sollten beleidigende oder unangemessene Inhalte über Ihren Raum verbreitet werden, helfen uns Ihre Rückmeldungen dabei, solche Inhalte schnellstmöglich zu prüfen und zu entfernen.</p>

<p>In CollabSpace-Räumen dürfen keine Inhalte veröffentlicht werden, die:</p>
<ul>
  <li>Gewalt verherrlichen oder dazu aufrufen,</li>
  <li>Waffen thematisieren oder fördern,</li>
  <li>illegale Aktivitäten beschreiben oder unterstützen,</li>
  <li>diskriminierend sind oder Hassrede beinhalten,</li>
  <li>gegen geltende Gesetze oder ethische Standards verstoßen.</li>
</ul>

<p>Verstöße gegen diese Regeln können zur Sperrung des Raums oder weiterer rechtlicher Schritte führen.</p>

<h4>3. Interne Dienste und interne Datenermittlungen</h4>
<p>
Im Zuge der Verwendung der Plattform werden technisch notwendige Protokolldaten gespeichert. Diese erlauben es der TU Graz, Systemstörungen, Systemfehler, die zu einer Einschränkung der Verfügbarkeit der Online-Angebote führen sowie unerlaubte Zugriffe auf unsere Systeme zu erkennen, einzugrenzen und zu beseitigen. Die Logdaten werden nicht mit anderen personenbezogenen Daten verknüpft. Folgende Datenkategorien werden verarbeitet: Datum und Uhrzeit der Abfrage, Name und URL der abgerufenen Ressourcen, Datenmenge (in Bytes) der angefragten und/oder angerufenen Ressource, Antwort des Servers (z.B. http-Statuscode), Erkennungsdaten des verwendeten Browsers und Betriebssystems, Webseite, von der aus der Zugriff erfolgte, IP-Adresse, Username.
</p>

<h4>4. Ihre Rechte</h4>


<p>Die/Der BenutzerIn verfügt über das Recht auf Auskunft, Löschung, Berichtigung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch gegen die Datenverarbeitung. Es besteht ferner ein Beschwerderecht an die Österreichische Datenschutzbehörde, Wickenburggasse 8, 1080 Wien (<a href="mailto:dsb@dsb.gv.at">dsb@dsb.gv.at</a>).</p>



<p>Verantwortliche für die Verarbeitung Ihrer personenbezogenen Daten ist die Technische Universität Graz (nachfolgend TU Graz).
Datenschutzbeauftragte der TU Graz ist die x-tention Informationsrechnologie GmbH, Friedhofstraße 57, 4600 Wels,  datenschutzbeauftragter@tugraz.at.
Bei datenschutzrechtlichen Anliegen wenden Sie sich bitte an <a href="mailto:datenschutz@tugraz.at">datenschutz@tugraz.at</a> .</p>



<p>Datenschutzhinweis mit Unterstützung der <a href="https://www.wko.at/internetrecht/datenschutzerklaerung-checkliste-infopflichten-dsgvo-tkg-we">WKO</a> erstellt.</p>
{/if}

</main>
