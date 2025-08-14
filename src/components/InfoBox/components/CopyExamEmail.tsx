import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Student from "../../classes/Student";
import Exam from "../../classes/Exam";
import Examiner from "../../classes/Examiner";
import { format } from "date-fns";

interface CopyExamEmailProps {
  student?: Student | undefined;
  examiner?: Examiner | undefined;
  exam?: Exam | undefined;
  user?: string | undefined;

  editMode: boolean;
}

//prettier-ignore
export default function CopyExamEmail(props: CopyExamEmailProps) {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();
  let text =
    `Angepasste Prüfungsbedingungen ${props.exam?.title} (${props.exam?.lva_num}) - ${props.student?.first_name + " " + props.student?.last_name} (${props.student?.matrikel_number})` +`\n` +
    `\n`+

    `Sehr geehrter Prof. ${props.examiner?.last_name}!` + `\n` +
    `\n` +
    `Ich melde mich bezüglich der Klausur aus ${props.exam?.title} (${props.exam?.lva_num}) bei Ihnen.` + `\n` +
    `${props.student?.first_name + " " + props.student?.last_name} (${props.student?.matrikel_number}) wird durch unser Institut unterstützt und hat uns bekannt gegeben,` + `\n` +
    `an der Klausur am ${format(new Date(props.exam?.date ?? ""), "dd.MM.yyyy")  } teilnehmen zu wollen.` + `\n` +
    `\n` +
    `Nach Durchsicht der Atteste/Dokumente wurde für die schriftlichen Prüfungen folgende Anpassungen vereinbart:` + `\n`;


    if(props.student?.bonus_time && props.student?.bonus_time != 1)
    text = text + 
    `• ${props.student?.bonus_time * 100 - 100}% Mehrzeit,` + `\n`;

    
    if(props.student?.misc && props.student?.misc != "")
    props.student?.misc.split("; ").forEach(asd => {
      text = text + 
        `• ${asd},` + `\n`;}
    ); 
   
    
    text = text + 
    `• Schreiben am Institut Integriert Studieren in einem eigenen Prüfungsraum inkl. Aufsicht und Technik durch unser Institut.` + `\n` +
    `\n` +
    `Ebenso würde ich um eine kurze Info zur regulären Bearbeitungszeit mit Klausurbeginn bzw. -ende und wie diese Klausur abgehalten werden soll (Moodle-Testung, Open-/Closedbook, Zoom, etc.)  bitten.` + `\n` +
    `\n` +
    `Um sicherzustellen, dass wir ausreichend Zeit für die Vorbereitung der Klausurabwicklung haben, möchten ich Sie darum bitten,` + `\n` +
    `uns die Klausurangaben bereits am Tag vor der Prüfung bis spätestens 15:00 an pruefung-integriert-studieren@jku.at zuzusenden.` + `\n` +
    `Ebenso wäre es hilfreich, falls Sie uns eine Kontaktnummer zur Verfügung stellen könnten.` + `\n` +
    `Diese würden wir nutzen, um während der Klausur bei etwaigen inhaltlichen Fragen Kontakt aufnehmen zu können.` + `\n` +
    `\n` +
    `Für etwaige Rückfragen stehe ich Ihnen natürlich gerne zur Verfügung!` + `\n` +
    `\n` +
    `Freundliche Grüße ` + `\n` +
    `\n` +
    `Bei Moodle/Zoom-Prüfungen:` + `\n` +
    `Sollte eine Moodle-Testung durchgeführt werden müssen die Institute im Moodle eine Mehrzeit einstellen. Dies sollte im optimal Fall bereits bei der Anfrage mitgesendet werden` + `\n` +
    `IM-Anleitung zur Mehrzeiteinstellungen von Moodle-Klausuren: (Wichtig hier muss man in der Prüfung drinnen sein, ansonsten kann man alles bearbeiten)` + `\n` +
    `    Wählen Sie den jeweiligen Test aus. Oben im Menüband unter "Mehr" wählen Sie "Überschreibungen" aus. Klicken Sie auf den Button "Nutzeränderungen hinzufügen".` + `\n` +
    `\n` +
    `    Wählen Sie die/den Nutzer/in aus. Sie können für die betroffene Person nun "Testöffnung", "Testschließung", "Zeitbegrenzung" und "Erlaubte Versuche" wie gewünscht abändern.` + `\n` +
    `` + `\n` +
    `    Beachten Sie bitte, dass die allgemeinen Testeinstellungen ebenso Gültigkeit haben. Im Test unter "Einstellungen" können Sie in der Kategorie "Bewertung" die Bewertungsmethode für mehrere Versuche festlegen.` + `\n` +
    `Da auf individueller Basis ein weiterer Versuch gewährt wird, müssen Sie hier auch festlegen, welche Bewertungsmethode (z. B. "letzter Versuch") zum Einsatz kommt. Sofern Sie hier nichts auswählen, wird der beste Versuch gewertet.` + `\n` +
    `   Wenn es "Nutzeränderungen" gibt, so ist dies auch für Personen mit Bearbeitungsrechten auf der Teststartseite ersichtlich.` + `\n` +
    `\n` +
    `Wir hoffen auf Ihre Unterstützung und verbleiben mit besten Grüßen,` + "\n" ;

  const copyExamText = async () => {
    if (!copied) {
      // prevent re-triggering if it`s already `Copied!`
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);

        setTimeout(() => {
          setCopied(false); // reset to `Copy` after 5 seconds
        }, 5000);
      } catch (err) {
        console.error(`Failed to copy: `, err);
      }
    }
  };
  if(props.editMode)
  return (
    <>
    </>
  );
  else
  return (
    <>
    <button onClick={copyExamText} className="underline hover:opacity-40 focus:border-1">
      {copied ? t(`Email Text Copied!`) : t(`Copy Email Text`)}
    </button> <br/>
    </>
  );
}
