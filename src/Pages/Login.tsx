import FormField from "../components/FormField";
import Header from "../components/Header";
import { Views } from "../Views";

interface LoginProps {
  callback: Function;
}

export default function Login(props: LoginProps) {
  /*ADD FUNCTIONALITY HERE PLEASE */
  function handleSubmit() {
    props.callback(Views.Register);
  }

  return (
    <>
      <Header />
      <form>
        <FormField label={"Username"} id={"username"} type={"text"}></FormField>
        <FormField label={"Password"} id={"password"} type={"password"}></FormField>

        <button onClick={handleSubmit} type="submit" className="mx-6 my-4 px-2 text-2xl border border-slate-900 hover:underline ">
          Login
        </button>
        <button
          onClick={() => {
            props.callback(Views.Register);
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
