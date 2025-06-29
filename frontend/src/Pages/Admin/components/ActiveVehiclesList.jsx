import React from 'react';
import { FaCar, FaUser, FaPhone, FaRegClock, FaParking } from 'react-icons/fa';

const ActiveVehiclesList = ({ occupiedSlots }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h3 className="text-2xl font-bold text-gray-800 mb-5">
        Active Vehicles
      </h3>
      {occupiedSlots.length === 0 ? (
        <div className="text-center py-10">
          <FaCar className="mx-auto text-4xl text-gray-300 mb-3" />
          <p className="text-gray-500">The parking lot is currently empty.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {occupiedSlots.map((slot) => (
            <div 
              key={slot.id} 
              className="group grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md hover:border-amber-400 transition-all duration-300"
            >
              {/* Slot Number - Large and Prominent */}
              <div className="md:col-span-2 flex flex-col items-center justify-center bg-amber-100 text-amber-700 p-3 rounded-lg">
                <FaParking className="text-xl mb-1" />
                <span className="text-xs font-semibold">SLOT</span>
                <span className="text-3xl font-bold">{slot.number.replace("S", "")}</span>
              </div>

              {/* Vehicle & User Details */}
              <div className="md:col-span-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                {/* Vehicle Number */}
                <div className="flex items-center gap-3">
                  <FaCar className="text-xl text-gray-400 group-hover:text-amber-500 transition-colors" />
                  <div>
                    <p className="text-gray-500 text-xs">Vehicle No.</p>
                    <p className="font-semibold text-gray-800 text-base">{slot.currentVehicle}</p>
                  </div>
                </div>

                {/* Owner Name */}
                <div className="flex items-center gap-3">
                  <FaUser className="text-xl text-gray-400 group-hover:text-amber-500 transition-colors" />
                  <div>
                    <p className="text-gray-500 text-xs">Owner</p>
                    <p className="font-semibold text-gray-800">{slot.user?.username || 'N/A'}</p>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="flex items-center gap-3">
                  <FaPhone className="text-xl text-gray-400 group-hover:text-amber-500 transition-colors" />
                  <div>
                    <p className="text-gray-500 text-xs">Phone</p>
                    <p className="font-semibold text-gray-800">{slot.user?.phone || 'N/A'}</p>
                  </div>
                </div>
                
                {/* Check-In Time */}
                 <div className="flex items-center gap-3 col-span-full sm:col-span-1">
                   <FaRegClock className="text-xl text-gray-400 group-hover:text-amber-500 transition-colors" />
                   <div>
                     <p className="text-gray-500 text-xs">Checked-In</p>
                     <p className="font-semibold text-gray-800">
                       {new Date(slot.inTime).toLocaleString([], { 
                         month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                       })}
                     </p>
                   </div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveVehiclesList;