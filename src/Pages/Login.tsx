import { ChangeEvent, useState } from "react";
import FormField from "../components/FormField";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom"; // Use react-router-dom for navigation
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/AuthProvider";
import { showToast } from "../components/InfoBox/components/ToastMessage";

export default function Login() {
  const { t } = useTranslation();
  const [formValues, setFormValues] = useState({ identifier: "", password: "" });
  const navigate = useNavigate(); // Hook to programmatically navigate
  const [errorText, setErrorText] = useState<string>();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [e.target.id]: e.target.value });
  };

  const auth = useAuth();

  try {
    auth.redirectIfLoggedIn();
  } catch (error) {
    setErrorText(t("Server can't be reached"));
    showToast({ message: `${t("Server can't be reached")}: ${error}.`, type: "error" });
  }

  // Handle login submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the form from refreshing the page

    try {
      if (formValues.identifier && formValues.password && formValues.identifier !== "" && formValues.password !== "") {
        await auth.loginAction(formValues);
      }
    } catch (error) {
      if (error instanceof TypeError) {
        setErrorText(t("Server can't be reached"));
        showToast({ message: `${t("Server can't be reached")}: ${error}.`, type: "error" });
      } else {
        setErrorText(t("Username or Password don't match."));
        showToast({ message: `${t("Username or Password don't match.")}`, type: "error" });
      }
    }
  };

  return (
    <>
      <Header />
      <form onSubmit={handleSubmit} aria-label={t("Login Form")}>
        <FormField label={t("Email")} id="identifier" type="text" value={formValues.identifier} onChange={handleChange} aria-labelledby="email-label" />
        <FormField
          label={t("Password")}
          id="password"
          type="password"
          value={formValues.password}
          onChange={handleChange}
          errorText={errorText}
          aria-labelledby="password-label"
        />
        <button type="submit" className="mx-6 my-4 px-2 text-2xl border border-slate-900 hover:underline" aria-label={t("Submit Login Form")}>
          {t("Login")}
        </button>
      </form>
    </>
  );
}
