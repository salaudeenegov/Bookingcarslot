import React from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";

import LoginPage from "./Pages/LoginPage";
import RegisterPage from "./Pages/RegisterPage";
import Homelayout from "./Pages/Homelayout";
import AdminDashboard from "./Pages/AdminDashboard";
import StaffConsole from "./Pages/StaffConsole";
import UserHome from "./Pages/UserHome";
import UserProfile from "./Pages/UserProfile";
import UserHistoryPage from "./Pages/UserHistoryPage";
import BookSlotPage from "./Pages/BookSlotPage";


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/home" element={<Homelayout />}>
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="staff" element={<StaffConsole />} />
        <Route path="user">
          <Route index element={<UserHome />} />
          <Route path="book" element={<BookSlotPage />} />
          <Route path="history" element={<UserHistoryPage />} />
          <Route path="profile" element={<UserProfile />} />
        </Route>
      </Route>
    </Routes>
  );
};


export default App;
