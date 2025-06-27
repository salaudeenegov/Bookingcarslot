import React, { useState, useContext } from "react";
import { useParking } from "../context/ParkingContext";
import { AuthContext } from "../context/AuthContext.jsx";


const getSlotDisplayInfo = (slot, bookings, userId) => {
    if (slot.status === 'occupied') {
        return {
            status: 'occupied',
            className: slot.userId === userId ? 'bg-blue-300' : 'bg-red-300 cursor-not-allowed',
            text: slot.currentVehicle,
            isClickable: slot.userId === userId,
        };
    }

    const relevantBooking = bookings.find(b => b.slotId === slot.id && b.status === 'pending');
    if (relevantBooking) {
        const bookingTime = new Date(relevantBooking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
            status: 'booked',
            className: relevantBooking.userId === userId ? 'bg-yellow-300 cursor-pointer' : 'bg-orange-300 cursor-not-allowed',
            text: `Booked ${bookingTime}`,
            isClickable: relevantBooking.userId === userId,
            bookingId: relevantBooking.id,
        };
    }

    return {
        status: 'available',
        className: 'bg-green-200 hover:bg-green-300 cursor-pointer',
        text: 'Available',
        isClickable: true,
    };
};


const BookSlotPage = () => {
    const { slots, bookings, loading, error, bookSlot, cancelBooking } = useParking();
    const { user } = useContext(AuthContext);

    const [isBookingModalOpen, setBookingModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [vehicleNumber, setVehicleNumber] = useState("");
    const [bookingTime, setBookingTime] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSlotClick = (slot) => {
        const displayInfo = getSlotDisplayInfo(slot, bookings, user?.id);
        if (!displayInfo.isClickable) return;

        setSelectedSlot(slot);
        if (displayInfo.status === 'available') {
            const now = new Date();
            now.setMinutes(now.getMinutes() + 5); 
            now.setSeconds(0);
            setBookingTime(now.toISOString().substring(0, 16));
            setVehicleNumber(user?.vehicleNumber || "");
            setBookingModalOpen(true);
        } else if (displayInfo.status === 'booked' && displayInfo.bookingId) {
            if (window.confirm("Do you want to cancel this booking?")) {
                handleCancelBooking(displayInfo.bookingId);
            }
        }
    };

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
            setBookingModalOpen(false);
        } else {
            alert(`Booking failed: ${result.error}`);
        }
        setIsSubmitting(false);
    };

    const handleCancelBooking = async (bookingId) => {
        setIsSubmitting(true);
        const result = await cancelBooking(bookingId);
        if(result.success) {
            alert("Booking cancelled successfully.");
        } else {
            alert(`Failed to cancel: ${result.error}`);
        }
        setIsSubmitting(false);
    };


    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Book a Parking Slot</h1>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                {slots.map((slot) => {
                    const displayInfo = getSlotDisplayInfo(slot, bookings, user?.id);
                    return (
                        <div
                            key={slot.id}
                            onClick={() => handleSlotClick(slot)}
                            className={`relative aspect-square rounded-lg flex flex-col items-center justify-center p-2 text-center transition-all duration-300 ${displayInfo.className}`}
                        >
                            <span className="font-bold text-xl text-gray-700">{slot.number}</span>
                            <div className="text-xs mt-1 text-gray-800">{displayInfo.text}</div>
                        </div>
                    );
                })}
            </div>

            {isBookingModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Book Slot {selectedSlot?.number}</h2>
                        <form onSubmit={handleBookingSubmit}>
                            <div className="mb-4">
                                <label htmlFor="bookingTime" className="block text-sm font-medium text-gray-700 mb-1">Booking Time</label>
                                <input
                                    type="datetime-local"
                                    id="bookingTime"
                                    value={bookingTime}
                                    onChange={(e) => setBookingTime(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">You have a 30-minute grace period to check-in.</p>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
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
                                <button type="button" onClick={() => setBookingModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-amber-500 text-white font-bold rounded-md">{isSubmitting ? "Booking..." : "Confirm Booking"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookSlotPage;