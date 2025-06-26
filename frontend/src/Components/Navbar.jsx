import React from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";

const Navbar = () => {
  const role = "user";
  const userName = "Salaudeen";

  return (
    <nav className="w-full bg-amber-100 shadow-md sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex justify-between items-center">
      
        <h1 className="text-2xl font-bold text-gray-800">
          ParkingWalla
        </h1>

     
        <div className="flex items-center gap-6">
          {role === "user" && (
            <ul className="flex gap-4 text-gray-700 font-medium">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/book">Book Slot</Link></li>
              <li><Link to="/history">My History</Link></li>
            </ul>
          )}
          {role === "employee" && (
            <ul className="flex gap-4 text-gray-700 font-medium">
              <li><Link to="/slots">Slot View</Link></li>
              <li><Link to="/exit">Manage Exit</Link></li>
              <li><Link to="/history">Logs</Link></li>
            </ul>
          )}
          {role === "admin" && (
            <ul className="flex gap-4 text-gray-700 font-medium">
              <li><Link to="/admin">Dashboard</Link></li>
              <li><Link to="/slots">Slots</Link></li>
              <li><Link to="/history">Logs</Link></li>
            </ul>
          )}

         
          <div className="flex items-center gap-2">
            <FaRegUserCircle className="text-xl text-gray-700" />
            <span className="text-sm font-semibold text-gray-800">{userName}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
