import React, { useState } from 'react';
import { useParking } from '../../context/ParkingContext';

const AdminDashboard = () => {
  const { slots, addSlots, loading } = useParking();
  const [numSlotsToAdd, setNumSlotsToAdd] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (numSlotsToAdd < 1) {
      alert("Please enter a positive number of slots to add.");
      return;
    }
    setIsSubmitting(true);
    const result = await addSlots(parseInt(numSlotsToAdd));
    if (result.success) {
      alert(`${numSlotsToAdd} slot(s) added successfully!`);
      setNumSlotsToAdd(1);
    } else {
      alert("Failed to add slots. See console for details.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Admin Dashboard</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Slot Management</h2>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600">Total Parking Slots:</p>
            <p className="text-4xl font-bold text-amber-600">
              {loading ? '...' : slots.length}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-4">
            <input
              type="number"
              value={numSlotsToAdd}
              onChange={(e) => setNumSlotsToAdd(e.target.value)}
              min="1"
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 w-24"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-amber-500 text-white font-bold py-2 px-6 rounded-md hover:bg-amber-600 transition duration-300 disabled:bg-gray-400"
            >
              {isSubmitting ? 'Adding...' : 'Add Slots'}
            </button>
          </form>
        </div>
      </div>

   
    </div>
  );
};

export default AdminDashboard;