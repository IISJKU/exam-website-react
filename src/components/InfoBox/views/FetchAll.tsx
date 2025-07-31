import { ToastOptions } from "react-toastify";
import { showToast } from "../components/ToastMessage";

import { useAuth } from "../../../hooks/AuthProvider";

export default async function fetchAll(link: string, token: string, errorMsg?: string): Promise<any[]> {
  let count = 0;
  const numEntries = 25;
  const allEntries: any[] = [];

  while (true) {
    // Construct the paginated link
    const paginatedLink: string = link.includes("?")
      ? `${link}&pagination[start]=${count}&pagination[limit]=${numEntries}`
      : `${link}?pagination[start]=${count}&pagination[limit]=${numEntries}`;

    try {
      // Fetch data from the API
      const response = await fetch(paginatedLink, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Parse the response
      const data = await response.json();

      // Handle non-OK responses
      if (!response.ok) {
        if (errorMsg) {
          showToast({
            message: `${errorMsg} Status: ${response.status}, Message: ${data.error?.message || "Unknown error"}.`,
            type: "error",
          });
        }
        break; // Exit the loop on error
      }

      // Break the loop if no data is returned
      if (!Array.isArray(data) || data.length === 0) {
        break;
      }

      // Add the fetched data to the result array
      allEntries.push(...data);

      // Break the loop if fewer than `numEntries` items are returned
      if (data.length < numEntries) {
        break;
      }

      // Increment the pagination counter
      count += numEntries;
    } catch (error) {
      // Handle network or unexpected errors
      showToast({
        message: `An error occurred while fetching data: ${error || "Unknown error"}.`,
        type: "error",
      });
      break; // Exit the loop on error
    }
  }

  return allEntries;
}
