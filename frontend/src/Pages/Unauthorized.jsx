import React from "react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();
  const handleClick = () => {
    return navigate("/");
  };
  return (
    <div className="h-screen w-full text-center flex flex-col items-center justify-center">
      <div className="text-2xl">
        <h1>Unauthorized</h1>
        <p>
          You do not have permission to view this page. Please log in with valid
          credentials.
        </p>
      </div>
      <button
        className="w-[30%] mt-2 rounded-2xl  bg-amber-100"
        onClick={handleClick}
      >
        {" "}
        Login
      </button>
    </div>
  );
};

export default Unauthorized;
