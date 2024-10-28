import { useContext, createContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
const url = "http://localhost:1337";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("site") || "");
  const navigate = useNavigate();

  const userData = async () => {
    const response = await fetch(url + "/api/users/me?populate=role", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const res = await response.json();

    return res;
  };

  const loginAction = async (data) => {
    try {
      const response = await fetch(url + "/api/auth/local", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const res = await response.json();
      if (res) {
        setToken(res.jwt);
        //localStorage.setItem("site", res.jwt);

        const userRes = await userData();

        if (userRes) {
          setUser(userRes.username);
          if (userRes.role.name == "Admin") {
            navigate("/admin/exams");
          }
        }

        return;
      }
      throw new Error(res.message);
    } catch (err) {
      console.error(err);
    }
  };

  const logOut = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("site");
    navigate("/");
  };

  return <AuthContext.Provider value={{ token, user, loginAction, logOut }}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};
