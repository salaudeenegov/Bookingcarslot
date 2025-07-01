import React from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";

import LoginPage from "./Pages/LoginPage";
import RegisterPage from "./Pages/RegisterPage";
import Homelayout from "./Pages/Homelayout";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import StaffConsole from "./Pages/EmployeePage/StaffConsole";
import UserHome from "./Pages/UserPages/UserHome";
import BookSlotPage from "./Pages/UserPages/BookSlotPage";
import UserHistoryPage from "./Pages/UserPages/UserHistoryPage";
import UserProfile from "./Pages/UserPages/UserProfile";
import UserManagment from "./Pages/Admin/UserManagment";
import AdminLogs from "./Pages/Admin/AdminLogs";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/home" element={<Homelayout />}>
        <Route path="admin">
          <Route index element={<AdminDashboard />} />
          <Route path="employee" element={<UserManagment />} />
          <Route path="logs" element={<AdminLogs />} />
        </Route>
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
