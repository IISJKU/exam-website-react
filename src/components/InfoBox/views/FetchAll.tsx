import { ToastOptions } from "react-toastify";
import { showToast } from "../components/ToastMessage";

import { useAuth } from "../../../hooks/AuthProvider";

export default async function fetchAll(link: string, token: string, errorMsg?: string): Promise<any[]> {
  const numEntries = 25;
  let count = 0;
  let allEntries: any[] = [];
  let hasMore = true;
  const maxPages = 100; // safety limit to prevent infinite loop
  let pageCount = 0;

  while (hasMore && pageCount < maxPages) {
    const paginatedLink = link.includes("?")
      ? `${link}&pagination[start]=${count}&pagination[limit]=${numEntries}`
      : `${link}?pagination[start]=${count}&pagination[limit]=${numEntries}`;

    const response = await fetch(paginatedLink, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      if (errorMsg) {
        showToast({
          message: `${errorMsg} Status: ${response.status}, Message: ${result.error?.message || "Unknown error"}.`,
          type: "error",
        });
      }
      break;
    }

    const data = result?.data || [];
    allEntries = allEntries.concat(data);

    const total = result?.meta?.pagination?.total;
    hasMore = total != null ? allEntries.length < total : data.length === numEntries;

    count += numEntries;
    pageCount++;
  }

  return allEntries;
}
