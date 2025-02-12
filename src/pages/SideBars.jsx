import React, { useState, useEffect } from "react";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faSignIn,
  faInfoCircle,
  faContactCard,
  faBusinessTime,
  faSignOut,
} from "@fortawesome/free-solid-svg-icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SideBars = ({ isOpen, toggleSidebar, loggedIn, handleLogout }) => {
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserProfile(token);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch("http://localhost:8080/api/auth/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserName(data.name || "User");
      } else {
        throw new Error("Failed to fetch user profile");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const handleLogoutClick = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success("Logout successful!");
      } else {
        toast.error("Logout failed! Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred during logout.");
      console.error("Logout Error:", error.message);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      handleLogout();
      toggleSidebar();

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <Drawer anchor="left" open={isOpen} onClose={toggleSidebar}>
        <div style={{ margin: "10px", fontWeight: "bold" }}>Welcome, {userName}</div>
        <List>
          <ListItem button component={Link} to="/" onClick={toggleSidebar}>
            <FontAwesomeIcon icon={faHome} color="blue" style={{ marginRight: "10px" }} /> Home
          </ListItem>
          <ListItem button component={Link} to="/about-us" onClick={toggleSidebar}>
            <FontAwesomeIcon icon={faInfoCircle} color="blue" style={{ marginRight: "10px" }} /> About Us
          </ListItem>
          <ListItem button component={Link} to="/contact" onClick={toggleSidebar}>
            <FontAwesomeIcon icon={faContactCard} color="blue" style={{ marginRight: "10px" }} /> Contact Us
          </ListItem>
          <ListItem button component={Link} to="/business" onClick={toggleSidebar}>
            <FontAwesomeIcon icon={faBusinessTime} color="blue" style={{ marginRight: "10px" }} /> Business
          </ListItem>

          {loggedIn ? (
            <ListItem button onClick={handleLogoutClick}>
              <FontAwesomeIcon icon={faSignOut} color="blue" style={{ marginRight: "10px" }} /> Logout
            </ListItem>
          ) : (
            <ListItem button component={Link} to="/login" onClick={toggleSidebar}>
              <FontAwesomeIcon icon={faSignIn} color="blue" style={{ marginRight: "10px" }} /> Login/Register
            </ListItem>
          )}
        </List>
      </Drawer>
    </>
  );
};

export default SideBars;
