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
import ProtectedRoute from "./Components/ProtectedRoute";
import Unauthorized from "./Pages/Unauthorized";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/home" element={<Homelayout />}>
        <Route path="admin">
          <Route
            index
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="employee"
            element={
              <ProtectedRoute>
                <UserManagment />
              </ProtectedRoute>
            }
          />
          <Route
            path="logs"
            element={
              <ProtectedRoute>
                <AdminLogs />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route
          path="staff"
          element={
            <ProtectedRoute>
              <StaffConsole />
            </ProtectedRoute>
          }
        />
        <Route path="user">
          <Route
            index
            element={
              <ProtectedRoute>
                <UserHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="book"
            element={
              <ProtectedRoute>
                <BookSlotPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="history"
            element={
              <ProtectedRoute>
                <UserHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
