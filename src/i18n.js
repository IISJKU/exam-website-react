import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  en: {
    translation: {
      "Welcome to React": "Welcome to React and react-i18next",
    },
  },
  de: {
    translation: {
      Yes: "Ja",
      No: "Nein",
      "Are you sure?": "Bist du sicher?",
      Students: "Studenten",
      "Upcoming Exams": "Bevorstehende Prüfungen",
      Tutors: "Tutoren",
      "First Name": "Vorname",
      "Last Name": "Nachname",
      Phone: "Telefonnummer",
      "Emergency Contacty": "Notfallnummer",
      "Registration Number": "Martrikelnummer",
      "Bonus Time": "Extra Zeit",
      Course: "Studiengang",
      "Exam Title": "Title",
      Date: "Datum",
      Topic: "Kurs",
      Username: "Benutzername",
      Password: "Passwort",
      "Exam Overview": "Kursübersicht",
      "Emergency Contact": "Notfallkontakt",
      January: "Jänner",
      Febuary: "Februar",
      March: "März",
      April: "April",
      May: "Mai",
      June: "Juni",
      July: "Juli",
      August: "August",
      September: "September",
      October: "October",
      November: "November",
      December: "Dezember",
    },
  },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "en", // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
    // if you're using a language detector, do not define the lng option

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
