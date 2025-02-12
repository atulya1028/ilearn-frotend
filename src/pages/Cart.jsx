import React, { useState, useEffect } from "react";
import "../styles/Cart.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import emptyBox from "../images/empty-box.png";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const profileToken = localStorage.getItem("token");
  const totalAmount = cart.reduce((total, item) => total + item.book.price * item.quantity, 0);

  const navigate = useNavigate();

  // ✅ Fetch Cart Items
  useEffect(() => {
    const fetchCartItems = async () => {
      if (!profileToken) return;

      try {
        const response = await fetch("http://localhost:8080/api/cart", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${profileToken}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch cart data");

        const data = await response.json();
        setCart(data.cart || []);
        setDeliveryInstructions(data.deliveryInstructions || "");
      } catch (error) {
        console.error("Error fetching cart data:", error.message);
      }
    };

    fetchCartItems();
  }, [profileToken]);

  // ✅ Remove an Item from Cart
  const handleDeleteItem = async (bookId) => {
    window.location.reload();
    try {
      const response = await fetch(`http://localhost:8080/api/cart/remove/${bookId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${profileToken}` },
      });
  
      if (!response.ok) throw new Error("Failed to remove item");
  
      // ✅ Update state so UI reflects changes instantly
      setCart((prevCart) => prevCart.filter((item) => item.book._id !== bookId));
  
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Error deleting item:", error.message);
      toast.error("Failed to remove item");
    }
  };
  

  // ✅ Update Quantity of Item
  const handleUpdateQuantity = async (bookId, newQuantity) => {
    window.location.reload();
    if (newQuantity < 1) return; // Prevent quantity below 1
  
    try {
      const response = await fetch("http://localhost:8080/api/cart/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${profileToken}`,
        },
        body: JSON.stringify({ bookId, quantity: newQuantity }),
      });
  
      if (!response.ok) throw new Error("Failed to update quantity");
  
      // ✅ Update state correctly so the UI reflects changes
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.book._id === bookId ? { ...item, quantity: newQuantity } : item
        )
      );
  
      toast.success("Quantity updated");
    } catch (error) {
      console.error("Error updating quantity:", error.message);
      toast.error("Failed to update quantity");
    }
  };
  

  // ✅ Handle Checkout
  const handleCheckout = async () => {
    try {
      if (!profileToken) {
        toast.error("Please sign in to proceed.");
        return;
      }

      const response = await fetch("http://localhost:8080/api/cart/proceed-to-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${profileToken}`,
        },
        body: JSON.stringify({ deliveryInstructions }),
      });

      if (!response.ok) throw new Error("Checkout failed");

      toast.success("Proceeding to checkout...");
      navigate("/create-order");
    } catch (error) {
      console.error("Error during checkout:", error.message);
      toast.error("Checkout failed");
    }
  };

  return (
    <>
      <ToastContainer />
      <h4 className="heading">My Bag</h4>
      <div className="cart">
        <div className="main">
          <div className="block1">
            {cart.length > 0 ? (
              cart.map((item) => (
                <div className="details" key={item._id}>
                  <div className="items">
                    <img
                      src={`http://localhost:8080/${item.book.image}`}
                      alt={item.book.title}
                      width={100}
                      height={150}
                    />
                    <span className="title-top">
                      <h6 style={{ width: "100px" }}>{item.book.title}</h6>
                      <h6>₹ {item.book.price}</h6>

                      {/* ✅ Quantity Update Controls */}
                      <div className="quantity-controls">
                        <FontAwesomeIcon
                        className="quantity-btn"
                          icon={faMinus}
                          size="1x"
                          onClick={() => handleUpdateQuantity(item.book._id, item.quantity - 1)}
                          style={{ cursor: "pointer", color: "black" }}
                        />
                        &nbsp;&nbsp;
                        <span>{item.quantity}</span>
                        &nbsp;&nbsp;
                        <FontAwesomeIcon
                        className="quantity-btn"
                          icon={faPlus}
                          size="1x"
                          onClick={() => handleUpdateQuantity(item.book._id, item.quantity + 1)}
                          style={{ cursor: "pointer", color: "black" }}
                        />
                      </div>

                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <h6>₹ {item.book.price * item.quantity}</h6>
                        <FontAwesomeIcon
                          icon={faTrash}
                          size="1x"
                          onClick={() => handleDeleteItem(item.book._id)}
                          style={{ cursor: "pointer", color: "red" }}
                        />
                      </span>
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <img src={emptyBox} className="empty-box" alt="Empty Cart" />
            )}
          </div>

          {/* ✅ Order Summary */}
          {cart.length > 0 && (
            <div className="order">
              <h5>Order Summary</h5>
              <div className="order-details">
                <h5>Amount Payable:</h5>
                <h5>₹ {totalAmount}</h5>
              </div>
              <div className="order-details">
                <h5>(includes GST)</h5>
              </div>
              <hr />
              <div className="order-details">
                <h5>Delivery Instructions</h5>
              </div>
              <textarea
                name="deliveryInstructions"
                cols="30"
                rows="7"
                style={{
                  width: "100%",
                  border: "1px solid black",
                  borderRadius: "5px",
                }}
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
              />
              <button
                style={{
                  width: "100%",
                  height: "40px",
                  backgroundColor: "black",
                  color: "white",
                  border: "none",
                  marginTop: "10px",
                }}
                onClick={handleCheckout}
              >
                Proceed To Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;
