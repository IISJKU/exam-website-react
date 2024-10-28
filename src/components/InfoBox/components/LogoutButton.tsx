import { useAuth } from "../../../hooks/AuthProvider";

export default function LogoutButton() {
  const auth = useAuth();

  return (
    <button className="mx-6 my-4 px-2 text-2xl border border-slate-900 hover:underline" id="logout" onClick={() => auth.logOut()}>
      Log Out
    </button>
  );
}
