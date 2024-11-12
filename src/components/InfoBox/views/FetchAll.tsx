import { ToastOptions } from "react-toastify";
import { showToast } from "../components/ToastMessage";

import { useAuth } from "../../../hooks/AuthProvider";

export default async function fetchAll(link: string, token: string, errorMsg?: string): Promise<any[] | {}> {
  let t = 0;
  let start = true;
  let numEntries = 10;
  let allEntries: any[] = [];
  let data = [];

  while (data.length !== 0 || start) {
    data = [];
    start = false;

    // Determine if the link already contains "?" for query parameters
    const paginatedLink = link.includes("?") ? `${link}&pagination[start]=${t}&pagination[limit]=${numEntries}` : `${link}?pagination[start]=${t}&pagination[limit]=${numEntries}`;

    const response = await fetch(paginatedLink, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    data = await response.json();

    if (!response.ok && errorMsg) {
      showToast({
        message: `${errorMsg} Status: ${response.status}, Message: ${data.error?.message || "Unknown error"}.`,
        type: "error",
      });
    }

    t = t + numEntries;
    if (data.length !== 0) allEntries = allEntries.concat(data);
  }

  return allEntries;
}