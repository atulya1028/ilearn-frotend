import React, {useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate,Link } from "react-router-dom";
import '../styles/Login.css';
export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");


  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSignIn = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.token) {
        toast.success("Login Successful");
        localStorage.setItem("token", data.token);
        console.log("token------", data.token);
        navigate("/",{state: {refreshHandler:true}});
        window.location.reload();
        window.location.reload();
      } else {
        toast.error("Invalid credentials. Please try again.");
        setErrorMessage("Invalid credentials. Please try again.");
      }
      console.log("Token: ", data.token);
    } catch (error) {
      toast.error("Error signing in. Please try again.");
      setErrorMessage("Error signing in. Please try again.");
    }
  };

  return (
    <div className="login">
      <ToastContainer />
      
        <div className="parentDiv">
        <h5 className="login-heading">
              Welcome to iLearn <br />
              Your book online book store
            </h5>
            <input
              type="text"
              placeholder="Enter email"
              value={email}
              onChange={handleEmailChange}
              className="email"
            />
            <span className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                value={password}
                onChange={handlePasswordChange}
                className="pass"
              />
              <button
                className="showHideBtn"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <FontAwesomeIcon icon={faEyeSlash} />
                ) : (
                  <FontAwesomeIcon icon={faEye} />
                )}
              </button>
            </span>
            <button className="sign-in" onClick={handleSignIn}>
              SignIn
            </button>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
        <Link to='/forgot-password' className="forgot-pass">Forgot Password?</Link>
        <br />
        <Link to='/sign-up' className="sign-up">Don't have account? Please register</Link>
    </div>
  );
};
