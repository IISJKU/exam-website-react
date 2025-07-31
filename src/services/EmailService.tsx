import { showToast } from "../components/InfoBox/components/ToastMessage";
import config from "../config";

interface SendEmailParams {
  to: string; // Recipient email
  subject: string; // Subject of the email
  text: string; // Plain text message
  html: string; // HTML message
  token: string; // Authentication token (passed explicitly)
}

export const sendEmail = async (params: SendEmailParams): Promise<void> => {
  const { to, subject, text, html, token } = params;

  if (to == "") return;

  try {
    const response = await fetch(config.strapiUrl + "/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Use the token passed as a parameter
      },
      body: JSON.stringify({ to, subject, text, html }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log(`Failed to send email. ${errorData.message}`);
      //showToast({ message: `Failed to send email: ${errorData.message}.`, type: "error" });
      //throw new Error(errorData.message || "Failed to send email");
    }
  } catch (error) {
    console.log(`Failed to send email.`);
    //showToast({ message: `Failed to send email: ${error}.`, type: "error" });
  }
};
