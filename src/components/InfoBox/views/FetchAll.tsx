import { ToastOptions } from "react-toastify";
import { showToast } from "../components/ToastMessage";

import { useAuth } from "../../../hooks/AuthProvider";

export default async function fetchAll(link: string, token: string, errorMsg?: string): Promise<any[] | {}> {
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
      ? `${link}&pagination[start]=${count}&pagination[limit]=${numEntries}`
      : `${link}?pagination[start]=${count}&pagination[limit]=${numEntries}`;

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

    count = count + numEntries;
    console.log(data);

    if (data.length !== 0 && data != null) allEntries = allEntries.concat(data);
  }

  return allEntries;
}
