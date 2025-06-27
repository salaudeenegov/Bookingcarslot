import React, { useState } from "react";
import { useParking } from "./ParkingContext";

const BookingModal = ({ onClose, selectedSlot }) => {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bookSlot = useParking();

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!vehicleNumber || !bookingTime) {
      alert("Vehicle number and booking time are required.");
      return;
    }
    setIsSubmitting(true);
    const result = await bookSlot(selectedSlot.id, vehicleNumber, bookingTime);
    if (result.success) {
      alert(`Slot ${selectedSlot.number} booked successfully!`);
      onClose();
    } else {
      alert(`Booking failed: ${result.error}`);
    }
    setIsSubmitting(false);
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">
          Book Slot {selectedSlot?.number}
        </h2>
        <form onSubmit={handleBookingSubmit}>
          <div className="mb-4">
            <label
              htmlFor="bookingTime"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Booking Time
            </label>
            <input
              type="datetime-local"
              id="bookingTime"
              value={bookingTime}
              onChange={(e) => setBookingTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              You have a 30-minute grace period to check-in.
            </p>
          </div>
          <div className="mb-4">
            <label
              htmlFor="vehicleNumber"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Vehicle Number
            </label>
            <input
              type="text"
              id="vehicleNumber"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setBookingModalOpen(false)}
              className="px-4 py-2 bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-amber-500 text-white font-bold rounded-md"
            >
              {isSubmitting ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
