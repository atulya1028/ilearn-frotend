import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../images/iLearn.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faUserCircle, faHeart, faSearch } from "@fortawesome/free-solid-svg-icons";
import SideBars from "./SideBars";
import { faBagShopping } from "@fortawesome/free-solid-svg-icons";
import "../App.css";
import '../styles/Header.css';

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 576);
  const [userProfile, setUserProfile] = useState(null);
  const [viewProfile, setViewProfile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults,setSearchResults] = useState([]);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);

  const navigate = useNavigate();
  const profileBoxRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.refreshHeader) {
      console.log("Header refreshed!");
    }
  }, [location.state]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoggedIn(false);
          return;
        }

        const response = await fetch("http://localhost:8080/api/auth/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        console.log("Profile API Response:", data);
        console.log("Token-------", token);

        if (data && data._id) {
          setUserProfile(data);
          localStorage.setItem("userId", data._id);
          console.log("userId:", data._id);
          setLoggedIn(true);
        } else {
          console.error("Profile Fetch Error: user data is missing or invalid");
          setUserProfile(null);
          setLoggedIn(false);
        }
      } catch (error) {
        console.error("Profile Fetch Error:", error.message);
        setUserProfile(null);
        setLoggedIn(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfile = () => {
    setViewProfile(!viewProfile);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    setUserProfile(null);
    handleProfile();
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      console.error("Search term is empty");
      return;
    }
  
    try {
      console.log("Searching for:", searchTerm);  // ✅ Log before API call
  
      const response = await fetch(`http://localhost:8080/api/book/search?q=${encodeURIComponent(searchTerm)}`);
      
      if (!response.ok) {
        console.error("Error searching:", response.status, response.statusText);
        return;
      }
  
      const data = await response.json();
      console.log("Search API Response:", data);  // ✅ Log API response
  
      if (data.length > 0) {
        setSearchResults(data);
        navigate(`/details/${data[0].title || data[0].author}`);
      } else {
        console.warn("No results found");
      }
    } catch (error) {
      console.error("Search request failed:", error.message);
    }
  };

  useEffect(() => {
    const fetchFavoriteCount = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setFavoriteCount(0);
          return;
        }
  
        const response = await fetch("http://localhost:8080/favorite/favorites/count", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          console.error("Favorite Count Fetch Error:", response.status, response.statusText);
          return;
        }
  
        const data = await response.json();
        console.log("Favorite API Response:", data);  // ✅ Log the API response
  
        if (typeof data.count === "number") {
          setFavoriteCount(data.count);  // ✅ Update the state with correct key
        } else {
          console.error("Invalid favorite count response:", data);
        }
      } catch (error) {
        console.error("Favorite Count Fetch Error:", error.message);
      }
    };
  
    fetchFavoriteCount();
  }, [loggedIn]);  // ✅ Runs whenever login state changes
  

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setCartItemsCount(0);
          return;
        }
  
        const response = await fetch("http://localhost:8080/api/cart/cart-count", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          console.error("Cart Count Fetch Error:", response.status, response.statusText);
          return;
        }
  
        const data = await response.json();
        console.log("Cart Count API Response:", data);
  
        if (typeof data.cartCount === "number") {
          setCartItemsCount(data.cartCount);
        } else {
          console.error("Invalid cart count response:", data);
        }
      } catch (error) {
        console.error("Cart Count Fetch Error:", error.message);
      }
    };
  
    fetchCartCount();
  }, [loggedIn]);  // Runs whenever login state changes
  



  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileBoxRef.current && !profileBoxRef.current.contains(event.target)) {
        setViewProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  

  return (
    <>
      {isMobile ? (
        <header>
          <span className="head">
            <span>
              <FontAwesomeIcon
                color="black"
                fontSize={25}
                icon={faBars}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              />
              <img src={logo} alt="logo" className="logo-img" />
            </span>
            <span>
              <Link to='/favorite'><FontAwesomeIcon icon={faHeart} className="fav" /></Link>
              <span className="favorite-count">{favoriteCount}</span>
              
              <Link to='/cart'><FontAwesomeIcon icon={faBagShopping} className="bag" /></Link>
              {cartItemsCount > 0 && <div className="cart-items-count">{cartItemsCount}</div>}
            </span>
          </span>

          <input type="text" 
          className="search-box"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Author, Name"
          />
          <FontAwesomeIcon icon={faSearch} onClick={handleSearch} className="search" />

          <SideBars
            isOpen={isSidebarOpen}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            loggedIn={loggedIn}
            handleLogout={handleLogout}
          />
        </header>
      ) : (
        <header className="head">
          <Link to="/"><img src={logo} width="220px" height="150px" alt="iLearn" /></Link>
          <input
            className="search-box"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Author, Name"
          />
          <FontAwesomeIcon icon={faSearch} onClick={handleSearch} className="search" />
          <div>
            <span style={{ display: "flex", alignItems: "center" }}>
              <Link to='/favorite'><FontAwesomeIcon icon={faHeart} className="fav" /></Link>
              <span className="favorite-count">{favoriteCount}</span>
              <Link to='/cart'><FontAwesomeIcon icon={faBagShopping} className="bag" /></Link>
              {cartItemsCount > 0 && <span className="cart-items-count">{cartItemsCount}</span>}
              <FontAwesomeIcon
                icon={faUserCircle}
                className="user-circle"
                onClick={handleProfile}
              />
              {viewProfile && (
                <div className="profile" ref={profileBoxRef}>
                  <div className="profile-box">
                    {loggedIn ? (
                      <>
                        <div style={{ fontSize: "15px" }}>
                          Welcome, <span>{userProfile?.name}</span>
                        </div>
                        <Link to='/login' className="login-register" onClick={handleLogout}>Logout</Link>
                      </>
                    ) : (
                      <Link to="/login" className="login-register" onClick={handleProfile}>Login/Register</Link>
                    )}
                  </div>
                </div>
              )}
            </span>
          </div>
        </header>
      )}
    </>
  );
};

export default Header;

