import { useContext, createContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
const url = "http://localhost:1337";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("site") || "");
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  let tempToken;

  const userData = async (token2) => {
    if (token2) {
      const response = await fetch(url + "/api/users/me?populate=*", {
        headers: {
          Authorization: `Bearer ${token2}`,
        },
      });

      if (!response.ok) throw new Error(response.message);

      const res = await response.json();

      //if (!res.ok) throw new Error(res.message);
      console.log("res");
      console.log(res);

      return res;
    }
  };

  const loginAction = async (data) => {
    const response = await fetch(url + "/api/auth/local?populate=*", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    console.log(response);

    if (!response.ok) throw Error(response.message);

    const res = await response.json();
    if (res) {
      try {
        console.log(res);
        const userRes = await userData(res.jwt);

        if (userRes.role && userRes.role.name) {
          setUser(userRes.username);
          setRole(userRes.role.name);
          if (userRes.role.name == "Admin") {
            setUserId(userRes.id);
            navigate("/admin/exams");
          } else if (userRes.role.name == "Student") {
            console.log("userRes.role.name");
            navigate("/student/all-exams");
          } else if (userRes.role.name == "Tutor") {
            setUserId(userRes.tutor.id);
            navigate("/tutor/exams");
          }
        }
        setToken(res.jwt);
      } catch (error) {
        throw new Error(res.message);
      }

      console.log("----------------------------");
      return;
    }
  };

  const logOut = () => {
    setUser(null);
    setUserId(null);
    setToken("");
    setRole("");
    localStorage.removeItem("site");
    navigate("/");
  };

  return <AuthContext.Provider value={{ token, user, role, userId, loginAction, logOut }}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};
