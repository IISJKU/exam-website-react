import { ToastOptions } from "react-toastify";
import { showToast } from "../components/ToastMessage";

import { useAuth } from "../../../hooks/AuthProvider";
import { useTranslation } from "react-i18next";

export default async function fetchAll(link: string, token: string, errorMsg?: string): Promise<any[] | {}> {
  const { t } = useTranslation();
  let count = 0;
  let start = true;
  let numEntries = 25;
  let allEntries: any[] = [];
  let data = [];

  while (start || data.length == numEntries) {
    data = [];
    start = false;

    // Determine if the link already contains "?" for query parameters
    const paginatedLink: string = link.includes("?")
      ? `${link}&pagination[start]=${t}&pagination[limit]=${numEntries}`
      : `${link}?pagination[start]=${t}&pagination[limit]=${numEntries}`;

    const response = await fetch(paginatedLink, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    data = await response.json();

    if (!response.ok && errorMsg) {
      showToast({
        message: `${t(errorMsg)} ${t("Status")}: ${response.status}, ${t("Message")}: ${data.error?.message || t("Unknown error")}.`,
        type: "error",
      });
    }

    count = count + numEntries;

    if (data.length !== 0 && data != null) allEntries = allEntries.concat(data);
  }

  return allEntries;
}
