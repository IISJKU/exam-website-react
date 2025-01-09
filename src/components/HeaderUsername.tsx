import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/AuthProvider";

export default function HeaderUsername() {
  const { t } = useTranslation();
  let auth = useAuth();

  if (auth.user == null) return <></>;
  else
    return (
      <div className="text-right">
        <div>{auth.user}</div>
        <div className="font-bold">{t(auth.role)}</div>
      </div>
    );
}
