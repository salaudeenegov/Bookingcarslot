import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../db/db";
import bcrypt from "bcryptjs";
import { AuthContext } from "../context/AuthContext";
import image from "../assets/aps5.jpg";
import Swal from "sweetalert2";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!",
        footer: `Please enter both email and password.`,
      });
      return;
    }

    try {
      const user = await db.user.where("email").equals(email).first();

      if (!user) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong!",
          footer: `No user found with this email.`,
        });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        Swal.fire({
          icon: "error",
          title: "Incorrect Password",
          text: "Incorrect password.",
        });
        return;
      }

      const userData = {
        id: user.id,
        email: user.email,
        role: user.role,
        vehicleNumber: user.vehicleNumber,
        username: user.username,
      };
      login(userData);
      Swal.fire({
        title: "successfully Logged in!",
          icon: "success",
      });

      navigate("/home");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!",
        footer: `${error}`,
      });
      console.error("Login error:", error);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-r from-amber-100 to-yellow-200">
      <div className="flex w-4/5 h-4/5 rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Image */}
        <div className="left w-1/2 h-full hidden md:block">
          <img
            src={image}
            alt="Car Parking"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Form */}
        <div className="right w-full md:w-1/2 h-full flex items-center justify-center bg-white">
          <form
            onSubmit={handleLogin}
            className="w-4/5 max-w-md flex flex-col gap-6 p-8 rounded-xl shadow-lg bg-white"
          >
            <h2 className="text-3xl font-bold text-amber-600 mb-2 text-center">
              Welcome Back
            </h2>

            {/* Email Input */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="px-4 py-2 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="px-4 py-2 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="flex justify-between text-xs text-gray-500">
              <a href="#" className="hover:underline text-amber-600">
                Forgot password?
              </a>
              <Link to="/register" className="hover:underline text-amber-600">
                Register New
              </Link>
            </div>

            <button
              type="submit"
              className="mt-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded transition duration-200"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
