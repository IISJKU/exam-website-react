import { ToastOptions } from "react-toastify";
import { showToast } from "../components/ToastMessage";

function arraysEqual(a: any[], b: any[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export default async function fetchAll(link: string, token: string, errorMsg?: string): Promise<any[]> {
  const numEntries = 25;
  let count = 0;
  let allEntries: any[] = [];
  let hasMore = true;
  const maxPages = 500;
  let pageCount = 0;

  while (hasMore && count < 5000 && pageCount < maxPages) {
    const paginatedLink = link.includes("?")
      ? `${link}&pagination[start]=${count}&pagination[limit]=${numEntries}`
      : `${link}?pagination[start]=${count}&pagination[limit]=${numEntries}`;

    const response = await fetch(paginatedLink, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    const result = await response.json();

    if (!response.ok) {
      if (errorMsg) {
        showToast({message: `${errorMsg} Status: ${response.status}, Message: ${result.error?.message || "Unknown error"}.`,
          type: "error",
        });
      }
      break;
    }

    const data = Array.isArray(result) ? result : Array.isArray(result.data)
        ? result.data : Array.isArray(result.roles)
        ? result.roles
        : [];

    allEntries = allEntries.concat(data);
    hasMore = data.length === numEntries;
    count += numEntries;
    pageCount++;
  }

  return allEntries;
}