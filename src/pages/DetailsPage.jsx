import React, { useState, useEffect } from "react";
import {useParams, useNavigate } from "react-router-dom";
import "../styles/Detail.css";
import favorite from "../images/favorite.png";
import favoriteFill from "../images/favorite-fill.png";
import { ToastContainer, toast } from "react-toastify";

const DetailsPage = () => {
  const { title } = useParams();
  const [book, setBook] = useState(null);
  const [selectedValue, setSelectedValue] = useState(1);
  const [readMore, setReadMore] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  // ✅ Fetch favorites on mount
  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:8080/api/favorite/favorites", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch favorites");

        const data = await response.json();
        setFavorites(data.favorites.map((fav) => fav.bookId._id));
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };

    fetchFavorites();
  }, []);

  // ✅ Fetch book details
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/books/${title}`);
        if (!response.ok) throw new Error("Failed to fetch book details");

        const data = await response.json();
        setBook(data);
      } catch (error) {
        console.error("Error fetching book data:", error);
      }
    };

    if (title) {
      fetchBook();
    }
  }, [title]);

  // ✅ Fetch cart items
  useEffect(() => {
    const fetchCartItems = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:8080/api/cart/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch cart items");

        const data = await response.json();
        setCartItems(data.cart);
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    };

    fetchCartItems();
  }, []);

  // ✅ Check if a book is in favorites
  const isFavorite = (bookId) => favorites.includes(bookId);

  // ✅ Add book to favorites
  const handleFavorite = async (bookId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to add to favorites.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/favorite/add-to-favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId }),
      });

      if (!response.ok) throw new Error("Failed to add to favorites");

      setFavorites([...favorites, bookId]); // ✅ Update state immediately
      toast.success("Favorite added successfully");
    } catch (error) {
      toast.error("Favorite already added");
      console.error("Error adding to favorites:", error);
    }
  };

  // ✅ Remove book from favorites
  const handleRemoveFavorite = async (bookId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to remove from favorites.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/favorite/remove-from-favorites/${bookId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to remove from favorites");

      setFavorites(favorites.filter((favId) => favId !== bookId)); // ✅ Update state immediately
      toast.success("Favorite removed successfully");
    } catch (error) {
      console.error("Error removing from favorites:", error);
    }
  };

  // ✅ Add book to cart
  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    window.location.reload();
    if (!token) {
      toast.error("Please log in to add to cart.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId: book._id, quantity: selectedValue }),
      });

      if (!response.ok) throw new Error("Failed to add to cart");

      setCartItems([...cartItems, { book: book, quantity: selectedValue }]); // ✅ Update state immediately
      toast.success("Book added to cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Error adding to cart");
    }
  };

  // ✅ Handle "Buy Now"
  const handlePayNow = async () => {
    navigate("/cart");
    await handleAddToCart();
  };

  const handleChange = (e) => setSelectedValue(parseInt(e.target.value));

  const handleReadMore = () => setReadMore(!readMore);

  if (!book) return <p>Loading book details...</p>;

  return (
    <div className="detail-container">
      <ToastContainer />
      <div className="block">
        <img src={`http://localhost:8080/${book.image}`} alt={book.title} className="detail-image" />
        <div className="sub-block">
          <div className="block2">
            <h1 className="title">{book.title}</h1>
            <h6 className="author">{book.author}</h6>
          </div>
          <div className="block3">
            <h3>₹{parseFloat(book.price).toFixed(2)}</h3>
            <span>
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
          </div>
          <select value={selectedValue} onChange={handleChange} className="drop-down">
            {[...Array(10).keys()].map((num) => (
              <option key={num + 1} value={num + 1}>
                {num + 1}
              </option>
            ))}
          </select>
          <div className="btn-setting">
            <div className="btn-handle">
              <button className="cart-b" onClick={handleAddToCart}>
                ADD TO CART
              </button>
              <button className="buy-b" onClick={handlePayNow}>
                BUY NOW
              </button>
            </div>
          </div>
          <div className="desc-setting">
            <h2>Description</h2>
            <p className="desc">
              {book.description
                ? readMore
                  ? book.description
                  : book.description.slice(0, 100) + "..."
                : "Description not available"}
            </p>
            <div onClick={handleReadMore} className="read">
              {readMore ? "View Less" : "View More"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsPage;
