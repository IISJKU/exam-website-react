import { HeadingLevel, Document, TextRun, Paragraph, Packer, Table, TableRow, TableCell, WidthType } from "docx";
import { useTranslation } from "react-i18next";
import Student from "../../classes/Student";
import Examiner from "../../classes/Examiner";
import Exam from "../../classes/Exam";
import { format, addMinutes } from "date-fns";
import Tutor from "../../classes/Tutor";
import Institute from "../../classes/Institute";

interface ExamProtocolGeneratorProps {
  student?: Student | undefined;
  examiner?: Examiner | undefined;
  exam?: Exam | undefined;
  user?: string | undefined;
  editMode: boolean;
  tutor?: Tutor | undefined;
  institute?: string | undefined;
  room?: string;
  mode?: string;
}

export default function ExamProtocolGenerator(props: ExamProtocolGeneratorProps) {
  const t = useTranslation();

  let misc: string[] = [];

  if (props.student?.misc) misc = props.student?.misc.split("; ");
  if (props.student?.bonus_time && props.student?.bonus_time != 1) misc.unshift(`${props.student?.bonus_time * 100 - 100}% Mehrzeit,`);
  misc.push("Betreuung durch Institut Integriert Studieren");

  const createProtocol = async () => {
    // Documents contain sections, you can have multiple sections per document, go here to learn more about sections
    // This simple example will only contain one section
    function createBulletPoint(boldText: string, normalText?: string): Paragraph {
      return new Paragraph({
        children: [new TextRun({ text: boldText, bold: true, font: "Calibri" }), new TextRun(normalText ?? "")],
        bullet: {
          level: 0,
        },
      });
    }

    const createCell = (text: string, percent?: number, bold?: boolean, margins?: number) => {
      if (percent)
        return new TableCell({
          width: { size: percent, type: WidthType.PERCENTAGE },
          margins: {
            top: margins ?? 20, // 5pt
            bottom: margins ?? 20,
            left: 50, // 10pt
            right: 50,
          },
          children: [
            new Paragraph({
              children: [new TextRun({ text: text, bold: bold ?? false, font: "Calibri" })],
            }),
          ],
        });
      else
        return new TableCell({
          margins: {
            top: margins ?? 20, // 5pt
            bottom: margins ?? 20,
            left: 50, // 10pt
            right: 50,
          },
          children: [
            new Paragraph({
              children: [new TextRun({ text: text, bold: bold ?? false, font: "Calibri" })],
            }),
          ],
        });
    };

    const doc = new Document({
      styles: {
        default: {
          document: {
            run: { font: "Calibri Light", size: 24 },
          },
          heading1: {
            run: {
              size: 32,
              color: "2F5496",
            },
            paragraph: { spacing: { after: 8 * 20 } },
          },
          heading2: {
            run: {
              size: 26,
              color: "2F5496",
            },
            paragraph: { spacing: { before: 8 * 20 } },
          },
        },
        paragraphStyles: [
          {
            id: "titlePara",
            name: "Title",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
              size: 56,
            },
            paragraph: {},
          },
          {
            id: "normalText",
            name: "Normal Text",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
              size: 24,
            },
            paragraph: { spacing: { after: 8 * 20 } },
          },
        ],
      },
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: "Prüfungsprotokoll",
              heading: HeadingLevel.TITLE,
              style: "titlePara",
            }),
            new Paragraph({
              text: props.exam?.title ?? "",
              heading: HeadingLevel.HEADING_1,
            }),
            createBulletPoint("Datum: ", format(new Date(props.exam?.date ?? ""), "dd.MM.yyyy")),
            createBulletPoint("Raum/Gerät: ", props.room),
            createBulletPoint("Prüfer:in: ", props.examiner?.first_name + " " + props.examiner?.last_name),
            createBulletPoint("Abgabe an E-Mail: ", props.examiner?.email ?? ""),
            createBulletPoint("Und in CC: "),
            createBulletPoint("Prüfungsbedingungen: ", props.mode),
            createBulletPoint("Weitere Anmerkungen zum Ablauf: "),
            new Paragraph({
              text: "Kandidat:innen mit angepasster Prüfungsbedingung: ",
            }),
            new Paragraph({
              text: "Name: " + props.student?.first_name + " " + props.student?.last_name + " (" + props.student?.matrikel_number + ") ",
              style: "normalText",
            }),
            new Paragraph({
              text: "Grundlage",
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              text: "Genehmigung Prüfungsmethoden",
              style: "normalText",
            }),

            ...misc.map((elem: string) => (elem ? createBulletPoint(elem) : createBulletPoint(""))),
            new Paragraph({
              text: "Bestätigungen",
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              text: "Kandidat:innen",
              heading: HeadingLevel.HEADING_2,
            }),
            new Table({
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
              rows: [
                new TableRow({
                  children: [createCell("Name", 30, true), createCell("Matrikelnummer", 30, true), createCell("Unterschrift", 40, true)],
                }),
                new TableRow({
                  children: [
                    createCell(props.student?.first_name + " " + props.student?.last_name, 25, false, 200),
                    createCell(props.student?.matrikel_number ?? " ", 25, false, 200),
                    createCell("", 50, false, 200),
                  ],
                }),
              ],
            }),
            new Paragraph({
              text: "Aufsichten",
              heading: HeadingLevel.HEADING_2,
            }),
            new Table({
              width: {
                size: 100, // 100% of the page width
                type: WidthType.PERCENTAGE,
              },
              rows: [
                new TableRow({
                  children: [
                    createCell("Aufsicht", 30, true),
                    createCell("Start", 9, true),
                    createCell("Ende", 9, true),
                    createCell("Minuten", 12, true),
                    createCell("Unterschrift", 40, true),
                  ],
                }),
                new TableRow({
                  children: [
                    createCell(props.tutor?.first_name + " " + props.tutor?.last_name, 30, false, 200),
                    createCell(format(new Date(props.exam?.date ?? ""), "hh:mm"), 9, false, 200),
                    createCell(format(addMinutes(new Date(props.exam?.date ?? ""), props.exam?.duration ?? 0), "hh:mm"), 9, false, 200),
                    createCell(props.exam?.duration + " ", 12, false, 200),
                    createCell("", 40, false, 200),
                  ],
                }),
              ],
            }),
            new Paragraph({
              text: "Auffälligkeiten (Ausfall PC/Unklarheiten Materialen etc.):",
              heading: HeadingLevel.HEADING_2,
            }),
            new Table({
              width: {
                size: 100, // 100% of the page width
                type: WidthType.PERCENTAGE,
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph("")],
                    }),
                  ],
                }),
              ],
            }),
            new Paragraph({
              text: "Abgabe:",
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              text: "Timestamp eMail gesendet (lt. Groupwise): ",
              style: "normalText",
            }),
            new Paragraph({
              text: "Hauspost: ☐ (Sollten sich die Studierenden dazu entscheiden doch viel auf dem Papier zu schreiben gehört dies bei Unklarheiten immer per Hauspost gesendet):",
              style: "normalText",
            }),
            new Paragraph({
              children: [new TextRun({ text: "z.h. " + props.examiner?.first_name + " " + props.examiner?.last_name, bold: true, font: "Calibri" })],
              style: "normalText",
            }),
            new Paragraph({
              children: [new TextRun({ text: props?.institute, bold: true, font: "Calibri" })],
              style: "normalText",
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = props.student?.last_name + "" + props.exam?.title.replaceAll(" ", "") + "" + "Protokoll" + ".docx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  if (!props.editMode)
    return (
      <button onClick={createProtocol} className="underline hover:opacity-40 focus:border-1">
        Create Protocol
      </button>
    );
  else return <></>;
}
