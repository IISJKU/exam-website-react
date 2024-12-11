import { useContext, createContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
const url = "http://localhost:1337";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(localStorage.getItem("userName") || null);
  const [token, setToken] = useState(localStorage.getItem("site") || "");
  const [role, setRole] = useState(localStorage.getItem("userRole") || "");
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  const userData = async (token2) => {
    if (token2) {
      const response = await fetch(url + "/api/users/me?populate=*", {
        headers: {
          Authorization: `Bearer ${token2}`,
        },
      });

      if (!response.ok) throw new Error(response.message);

      const res = await response.json();

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

    if (!response.ok) throw Error(response.message);

    const res = await response.json();

    if (res) {
      localStorage.setItem("site", res.jwt);
      setToken(res.jwt);
      let userRes = await setUserData(res.jwt);
      redirectRole(userRes.role.name);
    }
  };

  /**
   * Sets User Data based on the the token entered
   * @param {string} token
   * @returns User Response
   */
  const setUserData = async (token) => {
    const userRes = await userData(token);
    console.log(userRes);
    if (userRes.role && userRes.role.name) {
      setUser(userRes.username);
      localStorage.setItem("userName", userRes.username);
      setRole(userRes.role.name);
      localStorage.setItem("userRole", userRes.role.name);

      if (userRes.role.name == "Admin") {
        setUserId(userRes.id);
      } else if (userRes.role.name == "Student") {
        console.log("userRes.role.name");
      } else if (userRes.role.name == "Tutor") {
        setUserId(userRes.tutor.id);
      }
    } else {
      console.log("i should never get here");
    }

    return userRes;
  };

  /**
   * Redirects the user based on their role
   *
   * @param {String} roleName
   */
  const redirectRole = (roleName) => {
    if (roleName == "Admin") {
      navigate("/admin/exams");
    } else if (roleName == "Student") {
      navigate("/student/all-exams");
    } else if (roleName == "Tutor") {
      navigate("/tutor/exams");
    }
  };

  /**
   * Reset all variables, User Tokens and so on
   */
  const logOut = () => {
    setUser(null);
    setUserId(null);
    setToken("");
    setRole("");

    localStorage.removeItem("site");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");

    navigate("/");
  };

  const redirectIfLoggedIn = async () => {
    if (token != "") {
      const response = await fetch(url + "/api/users/me?populate=*", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        redirectRole(role);
      } else {
        setUser(null);
        setUserId(null);
        setToken("");
        setRole("");

        localStorage.removeItem("site");
        localStorage.removeItem("userName");
        localStorage.removeItem("userRole");
      }
    }
  };

  //in case the token has not expired, set all of the other data needed
  if (token != "" && user == null) {
    setUserData(token);
  }
  return <AuthContext.Provider value={{ token, user, role, userId, loginAction, logOut, redirectIfLoggedIn }}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};
