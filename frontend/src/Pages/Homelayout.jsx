import React, { useContext, useEffect } from "react";
import { Outlet, Navigate, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import { AuthContext } from "../context/AuthContext"; 

function Homelayout() {
  const { user, loading } = useContext(AuthContext); 
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && location.pathname === "/home") {
      if (user.role === "admin") navigate("/home/admin");
      else if (user.role === "employee") navigate("/home/staff");
      else navigate("/home/user");
    }
  }, [user, location.pathname, navigate, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return (
    <div className="bg-[#FEFBEF] min-h-screen">
      <Navbar />
      <main className="mt-2 p-4">
        <Outlet />
      </main>
    </div>
  );
}

export default Homelayout;