import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import books from "../images/books.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import favorite from "../images/favorite.png";
import favoriteFill from "../images/favorite-fill.png";
import "../styles/Home.css";

export default function Home() {
  const [booksData, setBooksData] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/books");
        if (!response.ok) throw new Error("Failed to fetch books");

        const data = await response.json();
        setBooksData(data);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:8080/favorite/favorites", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch favorites");

        const data = await response.json();
        setFavorites(new Set(data.favorites.map((fav) => fav.bookId._id)));
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };

    fetchFavorites();
  }, [booksData]); // Ensures it runs after books are loaded

  const isFavorite = (bookId) => favorites.has(bookId);

  const handleFavorite = async (bookId) => {
    const token = localStorage.getItem("token");
    window.location.reload();
    if (!token) {
      toast.error("Please log in to add to favorites.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/favorite/add-to-favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to add to favorites");

      setFavorites((prev) => new Set([...prev, bookId])); // Update favorites dynamically
      toast.success("Favorite added successfully");
    } catch (error) {
      toast.error(error.message || "Something went wrong");
      console.error("Error adding to favorites:", error);
    }
  };

  const handleRemoveFavorite = async (bookId) => {
    const token = localStorage.getItem("token");
    window.location.reload();
    if (!token) {
      toast.error("Please log in to remove from favorites.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/favorite/remove-from-favorites/${bookId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to remove from favorites");

      setFavorites((prev) => {
        const updated = new Set(prev);
        updated.delete(bookId);
        return updated;
      });

      toast.success("Favorite removed successfully");
    } catch (error) {
      toast.error(error.message || "Something went wrong");
      console.error("Error removing from favorites:", error);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="nav-container">
        <div className="banner">
          <img src={books} alt="books" className="book-icon" />
        </div>

        <div className="head-view">
          <h4>Best Selling Books</h4>
          <div onClick={() => setShowMore(!showMore)} className="view">
            {showMore ? "View Less" : "View More"}
          </div>
        </div>

        <ul className="book-list">
          {booksData.slice(0, showMore ? booksData.length : 6).map((book) => (
            <li key={book._id}>
              <div className="box-card">
                <img src={`http://localhost:8080/${book.image}`} alt={book.title} className="card-image" />
                <div>{book.title}</div>
                <div>{book.author}</div>
                <div>₹{book.price}</div>
              </div>
              <span style={{ display: "flex", gap: "10px", paddingTop: "10px" }}>
                <Link to={`/details/${book.title}`} className="card-text">
                  <button className="add-cart">ADD TO CART</button>
                </Link>
                <img
                  src={isFavorite(book._id) ? favoriteFill : favorite}
                  alt="Favorite"
                  className="favorite-icon"
                  onClick={() =>
                    isFavorite(book._id) ? handleRemoveFavorite(book._id) : handleFavorite(book._id)
                  }
                  width={20}
                  height={20}
                />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
