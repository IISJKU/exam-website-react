import { ChangeEvent, useState } from "react";
import FormField from "../components/FormField";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom"; // Use react-router-dom for navigation
import { useTranslation } from "react-i18next";

export default function Login() {
  const { t } = useTranslation();
  const [formValues, setFormValues] = useState({ username: "", password: "" });
  const navigate = useNavigate(); // Hook to programmatically navigate

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [e.target.id]: e.target.value });
  };

  // Handle login submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the form from refreshing the page

    try {
      const response = await fetch(
        `http://localhost:1337/api/users?filters[username][$eq]=${formValues.username}`
      );
      const data = await response.json();

      if (data.length === 0) {
        // If user not found, remain on the login page
        alert("Invalid username or password");
        return;
      }

      // Navigate to Admin dashboard on successful login
      navigate("/admin/exams");
    } catch (error) {
      console.error("Error during login:", error);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <>
      <Header />
      <form onSubmit={handleSubmit}>
        <FormField
          label={t("Username")}
          id={"username"}
          type={"text"}
          value={formValues.username}
          onChange={handleChange}
        />
        <FormField
          label={t("Password")}
          id={"password"}
          type={"password"}
          value={formValues.password}
          onChange={handleChange}
        />
        <button
          type="submit"
          className="mx-6 my-4 px-2 text-2xl border border-slate-900 hover:underline"
        >
          {t("Login")}
        </button>
      </form>
    </>
  );
}
