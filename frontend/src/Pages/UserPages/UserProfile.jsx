import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { 
  FaUserCircle, 
  FaEnvelope, 
  FaPhone, 
  FaCar, 
  FaUserTag, 
  FaPencilAlt 
} from "react-icons/fa";

const UserProfile = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-lg mx-auto">
        
    
        <div className="bg-amber-50 p-8 text-center relative">
          <div className="inline-block p-4 bg-amber-200 rounded-full">
            <FaUserCircle className="text-6xl text-amber-600" />
          </div>
          <h2 className="mt-4 text-3xl font-bold text-gray-800">{user.username}</h2>
          <p className="text-amber-700 font-semibold uppercase tracking-widest text-sm">{user.role}</p>
        </div>
        <div className="p-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Contact Information</h3>
          <ul className="space-y-4 text-gray-600">
            <li className="flex items-center">
              <FaEnvelope className="w-5 h-5 text-amber-500" />
              <span className="ml-4">{user.email || 'Not provided'}</span>
            </li>
            <li className="flex items-center">
              <FaPhone className="w-5 h-5 text-amber-500" />
              <span className="ml-4">{user.phone || 'Not provided'}</span>
            </li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-700 mt-8 mb-4 border-b pb-2">Vehicle Information</h3>
          <ul className="space-y-4 text-gray-600">
             <li className="flex items-center">
              <FaCar className="w-5 h-5 text-amber-500" />
              <span className="ml-4 font-mono tracking-wider">
                {user.vehicleNumber || 'Not provided'}
              </span>
            </li>
          </ul>
        </div>

     
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
           <button 
             className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-white font-bold rounded-md hover:bg-amber-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          
           >
            <FaPencilAlt />
            Edit Profile
           </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;