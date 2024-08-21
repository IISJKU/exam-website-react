import FormField from "../components/FormField";
import Header from "../components/Header";
import { Views } from "../Views";

import { useTranslation } from "react-i18next";

interface LoginProps {
  callback: Function;
}

export default function Login(props: LoginProps) {
  const { t } = useTranslation();

  /*ADD FUNCTIONALITY HERE PLEASE */
  function handleSubmit() {
    props.callback(Views.Admin);
  }

  return (
    <>
      <Header />
      <form>
        <FormField label={t("Username")} id={"username"} type={"text"}></FormField>
        <FormField label={t("Password")} id={"password"} type={"password"}></FormField>

        <button onClick={handleSubmit} type="submit" className="mx-6 my-4 px-2 text-2xl border border-slate-900 hover:underline ">
          Login
        </button>
        <button
          onClick={() => {
            props.callback(Views.Admin);
          }}
          type="submit"
          className="mx-6 my-4 px-2 text-2xl border border-slate-900 hover:underline "
        >
          Register
        </button>
      </form>
    </>
  );
}
