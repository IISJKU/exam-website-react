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

    console.log(`Fetching: ${paginatedLink}`); // Log the request URL for debugging

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

      // Log the response for debugging
      console.log(`Response for start=${count}:`, data);

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

      // Check if the response is valid and contains data
      if (!Array.isArray(data)) {
        console.error("Unexpected response format:", data);
        break; // Exit the loop if the response is not an array
      }

      // Break the loop if no data is returned
      if (data.length === 0) {
        console.log("No more data to fetch. Exiting loop.");
        break;
      }

      // Add the fetched data to the result array
      allEntries.push(...data);

      // Break the loop if fewer than `numEntries` items are returned
      if (data.length < numEntries) {
        console.log("Last page of data fetched. Exiting loop.");
        break;
      }

      // Increment the pagination counter
      count += numEntries;
    } catch (error) {
      // Handle network or unexpected errors
      console.error("Error during fetch:", error);
      showToast({
        message: `An error occurred while fetching data: ${error.message || "Unknown error"}.`,
        type: "error",
      });
      break; // Exit the loop on error
    }
  }

  console.log("All entries fetched:", allEntries);
  return allEntries;
}
