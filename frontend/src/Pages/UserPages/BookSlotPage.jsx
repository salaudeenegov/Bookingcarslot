import React, { useState, useContext } from "react";
import { useParking } from "../../context/ParkingContext.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";

const getSlotDisplayInfo = (slot, userId) => {
    if (slot.status === 'occupied') {
        return {
            status: 'occupied',
            className: slot.userId === userId ? 'bg-blue-300' : 'bg-red-300 cursor-not-allowed',
            text: slot.currentVehicle,
            isClickable: false,
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
    const { slots, loading, error, bookSlot } = useParking();
    const { user } = useContext(AuthContext);

    const [isBookingModalOpen, setBookingModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [vehicleNumber, setVehicleNumber] = useState("");
    const [bookingTime, setBookingTime] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSlotClick = (slot) => {
        const displayInfo = getSlotDisplayInfo(slot, user?.id);
        if (!displayInfo.isClickable) return;

        setSelectedSlot(slot);

        if (displayInfo.status === 'available') {
            const now = new Date();
            setBookingTime(now.toISOString().substring(0, 16));
            setVehicleNumber(user?.vehicleNumber || "");
            setBookingModalOpen(true);
        }
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        if (!vehicleNumber || !bookingTime) {
            alert("Vehicle number and parking time are required.");
            return;
        }
        setIsSubmitting(true);
        const result = await bookSlot(selectedSlot.id, vehicleNumber, bookingTime);
        if (result.success) {
            alert(`Slot ${selectedSlot.number} is now occupied successfully!`);
            setBookingModalOpen(false);
        } else {
            alert(`Failed: ${result.error}`);
        }
        setIsSubmitting(false);
    };

    if (loading) return <div className="text-center py-10">Loading parking information...</div>;
    if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;

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
                            <span className="font-bold text-xl text-gray-700">{slot.number}</span>
                            <div className="text-xs mt-1 text-gray-800">{displayInfo.text}</div>
                        </div>
                    );
                })}
            </div>

            {isBookingModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Park in Slot {selectedSlot?.number}</h2>
                        <form onSubmit={handleBookingSubmit}>
                            <div className="mb-4">
                                <label htmlFor="inTime" className="block text-sm font-medium text-gray-700 mb-1">In Time</label>
                                <input
                                    type="datetime-local"
                                    id="inTime"
                                    value={bookingTime}
                                    onChange={(e) => setBookingTime(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">This will be the official start time of your parking session.</p>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                                <input
                                    type="text"
                                    id="vehicleNumber"
                                    value={vehicleNumber}
                                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <button type="button" onClick={() => setBookingModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-amber-500 text-white font-bold rounded-md hover:bg-amber-600 transition-colors disabled:bg-amber-300 disabled:cursor-not-allowed">{isSubmitting ? "Parking..." : "Confirm & Park"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookSlotPage;