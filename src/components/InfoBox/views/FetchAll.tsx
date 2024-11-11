import { ToastOptions } from "react-toastify";
import { showToast } from "../components/ToastMessage";

import { useAuth } from "../../../hooks/AuthProvider";

export default async function fetchAll(link: string, token: string, errorMsg?: string): Promise<any[] | {}> {
  let t = 0;

  let start = true;

  let numEntries = 10;

  let allEntries: any[] = [];
  let data = [];

  while (data.length != 0 || start) {
    data = [];
    start = false;

    const response = await fetch(link + `?pagination[start]=${t}&pagination[limit]=${numEntries}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    data = await response.json();
    console.log(data);

    if (!response.ok && errorMsg) {
      showToast({
        message: errorMsg + ` Status: ${response.status}, Message: ${data.error.message || "Unknown error"}.`,
        type: "error",
      });
    }

    t = t + numEntries;
    if (data.length != 0) allEntries = allEntries.concat(data);
  }

  return allEntries;
}
