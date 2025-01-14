import { useContext, createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(localStorage.getItem("userName") || null);
  const [token, setToken] = useState(localStorage.getItem("site") || "");
  const [role, setRole] = useState(localStorage.getItem("userRole") || "");
  const [userEmail, setUserEmail] = useState(localStorage.getItem("userEmail") || "");
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  const userData = async (token2) => {
    if (token2) {
      const response = await fetch(config.strapiUrl + "/api/users/me?populate=*", {
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
    const response = await fetch(config.strapiUrl + "/api/auth/local?populate=*", {
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
    if (userRes.role && userRes.role.name) {
      setUser(userRes.username);
      localStorage.setItem("userName", userRes.username);
      setRole(userRes.role.name);
      localStorage.setItem("userRole", userRes.role.name);
      setUserEmail(userRes.email);
      localStorage.setItem("userEmail", userRes.email);

      if (userRes.role.name == "Admin") {
        setUserId(userRes.id);
      } else if (userRes.role.name == "Student") {
      } else if (userRes.role.name == "Tutor") {
        setUserId(userRes.tutor.id);
      }
    } else {
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
    resetStates();
    navigate("/");
  };

  /**
   * Reset all of the States & Delete Everything from local storage
   */
  const resetStates = () => {
    setUser(null);
    setUserId(null);
    setToken("");
    setRole("");
    setUserEmail("");

    localStorage.removeItem("site");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
  };

  const redirectIfLoggedIn = async () => {
    if (token != "") {
      try {
        const response = await fetch(config.strapiUrl + "/api/users/me?populate=*", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          resetStates();

          throw new Error(response.message);
        } else {
          redirectRole(role);
        }
      } catch (error) {}
    }
  };

  //in case the token has not expired, set all of the other data needed
  if (token != "" && user == null) {
    setUserData(token);
  }
  return <AuthContext.Provider value={{ token, user, role, userId, userEmail, loginAction, logOut, redirectIfLoggedIn }}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};
