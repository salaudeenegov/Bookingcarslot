import React, { useState, useContext } from "react";
import { useParking } from "../../context/ParkingContext.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";
import BookingModal from "./components/BookingModal.jsx";

const getSlotDisplayInfo = (slot, userId) => {
  if (slot.status === "occupied") {
    return {
      status: "occupied",
      className:
        slot.userId === userId
          ? "bg-blue-300"
          : "bg-red-300 cursor-not-allowed",
      text: slot.currentVehicle,
      isClickable: false,
    };
  }
  if (slot.status === "maintenance") {
    return {
      status: "maintenance",
      className:
        "bg-purple-200 text-purple-800 opacity-70 cursor-not-allowed border-2 border-purple-400",
      text: "Under Maintenance",
      isClickable: false,
    };
  }
  return {
    status: "available",
    className: "bg-green-200 hover:bg-green-300 cursor-pointer",
    text: "Available",
    isClickable: true,
  };
};

const BookSlotPage = () => {
  const { slots, loading, error } = useParking();
  const { user } = useContext(AuthContext);

  const [isBookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const handleSlotClick = (slot) => {
    const displayInfo = getSlotDisplayInfo(slot, user?.id);
    if (!displayInfo.isClickable) return;

    setSelectedSlot(slot);

    if (displayInfo.status === "available") {
      setBookingModalOpen(true);
    }
  };

  if (loading)
    return (
      <div className="text-center py-10">Loading parking information...</div>
    );
  if (error)
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Park in a Slot</h1>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
        {slots.map((slot) => {
          const displayInfo = getSlotDisplayInfo(slot, user?.id);
          return (
            <div
              key={slot.id}
              onClick={() => handleSlotClick(slot)}
              className={`relative aspect-square rounded-lg flex flex-col items-center justify-center p-2 text-center transition-all duration-300 ${displayInfo.className}`}
            >
              <span className="font-bold text-xl text-gray-700">
                {slot.number}
              </span>
              <div className="text-xs mt-1 text-gray-800">
                {displayInfo.text}
              </div>
            </div>
          );
        })}
      </div>

      {isBookingModalOpen && (
        <BookingModal
          onClose={() => setBookingModalOpen(false)}
          selectedSlot={selectedSlot}
        />
      )}
    </div>
  );
};

export default BookSlotPage;
