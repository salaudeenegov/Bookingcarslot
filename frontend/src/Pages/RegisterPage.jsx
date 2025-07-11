import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../db/db";
import bcrypt from "bcryptjs";
import Swal from "sweetalert2";

const steps = [
  {
    label: "Account Info",
    fields: [
      {
        name: "username",
        label: "Username",
        type: "text",
        placeholder: "Enter your name",
      },
      {
        name: "email",
        label: "Email Address",
        type: "email",
        placeholder: "Enter your email",
      },
      {
        name: "phone",
        label: "Phone Number",
        type: "text",
        placeholder: "9876543210",
      },
    ],
  },
  {
    label: "Contact & Vehicle",
    fields: [
      {
        name: "vehicleNumber",
        label: "Vehicle Number",
        type: "text",
        placeholder: "KA 51 MK 2002",
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "Enter your password",
      },
      {
        name: "confirmPassword",
        label: "Confirm Password",
        type: "password",
        placeholder: "Confirm your password",
      },
    ],
  },
];

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    vehicleNumber: "",
  });
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateStep = () => {
    const currentFields = steps[step].fields;
    for (const field of currentFields) {
      if (!formData[field.name]) {
        Swal.fire({
          icon: "warning",
          title: "Missing Field",
          text: `Please fill in the "${field.label}" field.`,
        });
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    const { username, email, password, confirmPassword, phone, vehicleNumber } =
      formData;

    if (password !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Password Mismatch",
        text: "Passwords do not match. Please go back and correct them.",
      });
      return;
    }

    const existingUser = await db.user.where("email").equals(email).first();
    if (existingUser) {
      Swal.fire({
        icon: "error",
        title: "Duplicate Email",
        text: "A user with this email address already exists.",
      });
      return;
    }

    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await db.user.add({
        username,
        email,
        password: hashedPassword,
        phone,
        vehicleNumber,
        role: "user",
      });

      Swal.fire({
        icon: "success",
        title: "Registration Successful",
        text: "Registration successful! You can now log in.",
      });
      navigate("/");
    } catch (error) {
      console.error("Registration failed:", error);
      Swal.fire({
        icon: "error",
        title: "Registration Error",
        text: "An error occurred during registration. Please try again.",
      });
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-amber-100 via-amber-200 to-amber-300">
      <div className="flex flex-row w-4/5 h-4/5 rounded-3xl shadow-2xl overflow-hidden bg-white/80 backdrop-blur-md">
        <div className="hidden md:flex flex-col justify-center items-start w-1/2 bg-gradient-to-br from-amber-400 via-amber-300 to-amber-100 p-10">
          <h1 className="text-6xl font-extrabold text-white drop-shadow-lg mb-6 leading-tight">
            Your Spot,
            <br />
            Just a Tap Away.
          </h1>
          <p className="text-lg text-white/90 mt-4">
            Book your parking space in seconds. Fast, easy, and reliable.
          </p>
        </div>

        <div className="flex w-full md:w-1/2 h-full items-center justify-center bg-white/90">
          <form
            onSubmit={handleSubmit}
            className="w-4/5 max-w-md flex flex-col gap-6 p-10 rounded-2xl shadow-xl bg-white/95"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              {steps.map((s, idx) => (
                <div key={s.label} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      idx === step
                        ? "bg-amber-500 text-white"
                        : "bg-amber-200 text-amber-700"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="w-8 h-1 bg-amber-300 mx-1 rounded" />
                  )}
                </div>
              ))}
            </div>
            <h2 className="text-2xl font-bold text-amber-600 mb-2 text-center">
              {steps[step].label}
            </h2>
            {steps[step].fields.map((field) => (
              <div className="flex flex-col gap-2" key={field.name}>
                <label className="text-sm font-semibold text-gray-700">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="px-4 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                  required
                />
              </div>
            ))}
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <Link to="/" className="hover:underline text-amber-600">
                Already have an account?
              </Link>
            </div>
            <div className="flex gap-4 mt-4">
              {step > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="bg-gray-200 text-gray-700 font-bold py-3 rounded-xl shadow transition w-full"
                >
                  Back
                </button>
              )}
              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-white font-bold py-3 rounded-xl shadow-lg transition duration-200 w-full"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-white font-bold py-3 rounded-xl shadow-lg transition duration-200 w-full"
                >
                  Register
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;