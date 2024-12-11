import { useAuth } from "../hooks/AuthProvider";

export default function HeaderUsername() {
  let auth = useAuth();

  if (auth.user == null) return <></>;
  else
    return (
      <div className="text-right">
        <div>{auth.user}</div>
        <div className="font-bold">{auth.role}</div>
      </div>
    );
}
