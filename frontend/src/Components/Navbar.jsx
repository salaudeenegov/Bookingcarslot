import React, { useState, useEffect, useRef, useContext } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { HiOutlineChevronDown, HiOutlineMenu, HiOutlineX } from "react-icons/hi"; 
import { NavLink, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; 

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const role = user?.role || "";
  const userName = user?.username || (user?.email ? user.email.split("@")[0] : "Guest");


  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate=useNavigate();
  
  
  const profileRef = useRef(null);
  const handleLogout=()=>
  {
    localStorage.clear();
    navigate("/");
  }


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileRef]);


  const NavLinks = ({ mobile = false }) => {
    const commonClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300";
    const activeClass = "bg-amber-200 text-amber-800";
    const inactiveClass = "text-gray-600 hover:bg-amber-100 hover:text-amber-700";
    
    const linkClasses = ({ isActive }) => 
      `${commonClasses} ${isActive ? activeClass : inactiveClass} ${mobile ? 'block text-base' : ''}`;
    return (
      <>
        {role === "user" && (
          <>
            <NavLink to="/home/user" className={linkClasses}>Home</NavLink>
            <NavLink to="/home/user/book" className={linkClasses}>Book Slot</NavLink>
            <NavLink to="/home/user/history" className={linkClasses}>My History</NavLink>
            <NavLink to="/home/user/profile" className={linkClasses}>Profile</NavLink>
          </>
        )}
        {role === "employee" && (
           <>
            <NavLink to="/slots" className={linkClasses}>Slot View</NavLink>
            <NavLink to="/exit" className={linkClasses}>Manage Exit</NavLink>
            <NavLink to="/history" className={linkClasses}>Logs</NavLink>
          </>
        )}
        {role === "admin" && (
          <>
            <NavLink to="/admin" className={linkClasses}>Dashboard</NavLink>
            <NavLink to="/slots" className={linkClasses}>Slots</NavLink>
            <NavLink to="/history" className={linkClasses}>Logs</NavLink>
          </>
        )}
      </>
    );
  };


  return (
    <nav className="bg-white/80 backdrop-blur-sm shadow-md sticky top-0 z-50 border-b border-slate-200">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
       
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-amber-600 tracking-tight">
              ParkingWalla
            </Link>
          </div>

       
          <div className="hidden md:flex md:items-center md:space-x-4">
            <NavLinks />
          </div>

       
          <div className="flex items-center">
             <div className="hidden md:block">
            
              <div className="ml-4 relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-2 rounded-full hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all"
                >
                  <FaRegUserCircle className="text-2xl text-gray-600" />
                  <span className="text-sm font-semibold text-gray-800">{userName}</span>
                  <HiOutlineChevronDown
                    className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${isProfileOpen ? "transform rotate-180" : ""}`}
                  />
                </button>

            
                {isProfileOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <Link to="/home/user/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-100">Your Profile</Link>
                    <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-100">Settings</Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <Link to="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-100" onSubmit={handleLogout}>Sign out</Link>
                  </div>
                )}
              </div>
            </div>

        
            <div className="md:hidden ml-4">
              <button
                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-800 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500"
              >
                {isMobileMenuOpen ? (
                  <HiOutlineX className="h-6 w-6" /> 
                ) : (
                  <HiOutlineMenu className="h-6 w-6" /> 
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

    
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
             <NavLinks mobile={true} />
          </div>
        
          <div className="pt-4 pb-3 border-t border-amber-200">
              <div className="flex items-center px-4">
                <FaRegUserCircle className="text-3xl text-gray-600" />
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{userName}</div>
                  <div className="text-sm font-medium text-gray-500">{role}</div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-amber-100">Your Profile</Link>
                <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-amber-100">Sign out</Link>
              </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;