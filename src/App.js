import React from 'react';
import './App.css';
import { BrowserRouter, Route, Routes, Outlet } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Business from './pages/Business';
import DetailsPage from './pages/DetailsPage';
import Layout from './pages/Layout';
import { Login } from './pages/Login';
import Cart from './pages/Cart';
import { CreateOrder } from './pages/CreateOrder';
import Favorite  from './pages/Favorite';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SignUp from './pages/SignUp';

function App() {
  return (
    <>
        <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Outlet />
            </Layout>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/about-us" element={<About />} />
          <Route path="/business" element={<Business />} />
          <Route path='/cart' element={<Cart/>}/>
          <Route path="/details/:title" element={<DetailsPage />} />
          <Route path="/favorite" element={<Favorite />} />
          
        </Route>
        <Route path="/create-order" element={<CreateOrder />} />
        <Route path='/forgot-password' element={<ForgotPassword/>}/>
        <Route path="/reset-password/:token" element={<ResetPassword/>} />
        <Route path='/login' element={<Login/>}/>
        <Route path='/sign-up' element={<SignUp/>}/>
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
