import { ChangeEvent, useState } from "react";
import FormField from "../components/FormField";
import Header from "../components/Header";
import { Views } from "../Views";

import { useTranslation } from "react-i18next";

interface LoginProps {
  callback: Function;
}

export default function Login(props: LoginProps) {
  const { t } = useTranslation();
  const [formValues, setFormValues] = useState({ username: "", password: "" });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [e.target.id]: e.target.value });
  };

  /*ADD FUNCTIONALITY HERE PLEASE */
  function handleSubmit() {
    fetch(
      "http://localhost:1337/api/users?filters[username][$eq]=" +
        formValues.username
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data.length);
        if (data.length === 0) {
          props.callback(Views.Login);
          return;
        }
        console.log(data);
        props.callback(Views.Admin);
      });
  }

  return (
    <>
      <Header />
      <form>
        <FormField
          label={t("Username")}
          id={"username"}
          type={"text"}
          value={formValues.username}
          onChange={handleChange}
        ></FormField>
        <FormField
          label={t("Password")}
          id={"password"}
          type={"password"}
          value={formValues.password}
          onChange={handleChange}
        ></FormField>

        <button
          onClick={() => handleSubmit()}
          type="submit"
          className="mx-6 my-4 px-2 text-2xl border border-slate-900 hover:underline "
        >
          Login
        </button>
      </form>
    </>
  );
}
