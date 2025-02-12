import React, { useState, useEffect } from "react";
import "../styles/CreateOrder.css";
import logo from "../images/iLearn.png";
import books from "../images/books.gif";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLessThan } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { Footer } from "../pages/Footer";

export const CreateOrder = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    country: "India",
    saveInfo: false,
    deliveryInstructions: "",
  });

  const [cartItems, setCartItems] = useState([]); // Ensure cartItems is always an array
  const [total, setTotal] = useState(0);
  const [subtotal, setSubtotal] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartDetails = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/cart/get-checkout", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
  
        if (Array.isArray(data.cartItems)) {
          const formattedCart = data.cartItems.map((item) => ({
            ...item,
            price: item.book?.price || 0, // Ensure price exists
            quantity: item.quantity || 1, // Ensure quantity exists
          }));
          setCartItems(formattedCart);
        } else {
          setCartItems([]);
        }
      } catch (error) {
        console.error("Error fetching cart details:", error);
        setCartItems([]);
      }
    };
  
    fetchCartDetails();
  
    // Load form data from localStorage
    const savedFormData = JSON.parse(localStorage.getItem("formData"));
    if (savedFormData) {
      setFormData(savedFormData);
    }
  }, []);
  

  useEffect(() => {
    const calculateSubtotal = () => {
      let totalAmount = 0;
      cartItems.forEach((item) => {
        totalAmount += (item.price || 0) * (item.quantity || 1);
      });
      setSubtotal(totalAmount);
      setTotal(totalAmount);
    };
  
    calculateSubtotal(); // Always run, even if cartItems is empty
  }, [cartItems]);
  

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/api/cart/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      console.log(data);

      localStorage.setItem("formData", JSON.stringify(formData));
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  const gotoHome = () => {
    navigate("/");
    window.location.reload();
  };

  return (
    <>
      <div className="header">
        <img src={logo} alt="logo" onClick={gotoHome} className="logo-co" />
        <img src={books} alt="Book icon" height={250} className="books-co" />
      </div>

      <div className="flex-box">
        <div className="shipping-details">
          <h3>Shipping address</h3>
          <form onSubmit={handleFormSubmit}>
            <div className="country-box">
              <label htmlFor="country">Country/Region</label>
              <br />
              <select
                name="country"
                id="country"
                className="country-choice"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              >
                <option value="India">India</option>
              </select>
            </div>
            <br />
            <span className="intro">
              <input type="text" placeholder="First name" value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
              <input type="text" placeholder="Last name" value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </span>
            <br />
            <input type="text" placeholder="Address" className="address" value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <br />
            <br />
            <input type="text" placeholder="Apartment, suites, etc. (optional)" className="apartment" value={formData.apartment}
              onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
            />
            <br />
            <br />
            <span className="loc">
              <input type="text" placeholder="City" className="city" value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              <input type="number" name="pincode" id="pincode" placeholder="PIN code" className="pincode" value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              />
            </span>
            <input type="number" className="phone" placeholder="Phone" value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <br />
            <br />
            <span className="check-box">
              <input type="checkbox" className="save" checked={formData.saveInfo}
                onChange={(e) => setFormData({ ...formData, saveInfo: e.target.checked })}
              />
              &nbsp;
              <h6 className="save-info">Save this information for next time</h6>
            </span>
            <span className="to-cart">
              <Link to="/cart" className="cart-btn">
                <FontAwesomeIcon icon={faLessThan} color="black" size="1xs" />
                &nbsp; &nbsp;
                <h6 style={{ fontSize: "12px" }}> Return to cart</h6>
              </Link>
              <button type="submit" className="shipping-btn">
                Continue to shipping
              </button>
            </span>
          </form>
        </div>

        <div className="item-details">
          {Array.isArray(cartItems) && cartItems.length > 0 ? (
            cartItems.map((item) => (
              <span key={item._id} className="book-box">
                <img src={`http://localhost:8080/${item.book.image}`} alt="" width={100} height={100} />
                <h5 className="text">{item.book.title}</h5>
                <h5 className="text">₹ {item.price || 0}</h5>

              </span>
            ))
          ) : (
            <p style={{ textAlign: "center" }}>No items in the cart</p>
          )}

          <br />
          <div className="subtotal">
            <h6>Subtotal</h6>
            <h6>₹ {subtotal}</h6>
          </div>
          <br />
          <div className="order-total">
            <h3>Total</h3>
            <span className="price">
              <h6 className="inr">INR</h6>
              &nbsp;
              <h3>₹ {total}</h3>
            </span>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
