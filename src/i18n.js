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
      "Upcoming Monitored Exams": "Eingetragene Prüfungen",
      "Request New Exam": "Prüfung Anfragen",
      "Exams Overview": "Prüfungsübersicht",
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
      Duration: "Dauer",
      "Date/Time": "Datum/Zeit",
      "Exam Title": "Klausur Name",
      Examiner: "Prüfer",
      Major: "Abschluss",
      Institute: "Institut",
      Mode: "Modus",
      Room: "Raum",
      Save: "Speichern",
      Edit: "Bearbeiten",
      "Search student...": "Suche Student*in",
      "Search tutors...": "Suche Tutor*in",
      "Search examiner...": "Suche Prüfer*in",
      "Search majors...": "Suche Abschluss",
      "Search institutes...": "Suche Institut",
      "Search modes...": "Suche Modus",
      "Search rooms...": "Suche Raum",
      "Matrikel Number": "Matrikelnummer",
      "Required Actions": "Erforderliche Aktionen",
      Notifications: "Benachrichtigungen",
      "New Notifications": "Neue Benachrichtigungen",
      "Old Notifications": "Alte Benachrichtigungen",
      "Proposed Changes": "Vorgeschlagene Veränderungen",
      "Proposed Exams": "Vorgeschlagene Prüfungen",
      "Confirm Logout": "Ausloggen Bestätigen",
      "Are you sure you want to log out of your account?": "Bist du sicher dass du dich ausloggen möchtest?",
      "Are you sure you want to remove the exam from the monitoring list?": "Bist du sicher dass du die Prüfung nicht mehr betreuen möchtest?",
      "Request to Monitor": "Betreuung Eintragen",
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
