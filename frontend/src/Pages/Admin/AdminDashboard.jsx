import React, { useEffect, useState, useRef } from "react";
import { useParking } from "../../context/ParkingContext";
import {
  FaParking, FaCar, FaPlus, FaSpinner, FaCarSide, FaRegClock, FaTimes, FaUser,
  FaEnvelope, FaPhone, FaHashtag, FaEllipsisV, FaSignOutAlt, FaWrench, FaTrash, FaCheckCircle
} from "react-icons/fa";
import StatCard from "./components/StatCard";
import DailyActivityChart from "./components/DailyActivityChart";
import ActiveVehiclesList from "./components/ActiveVehiclesList";
import Swal from 'sweetalert2';

const AdminDashboard = () => {
  const { 
    loading, 
    addSlot, 
    getStat, 
    getSlotDetails, 
    forceExit, 
    updateSlotStatus, 
    removeSlot 
  } = useParking();

  const [numSlotsToAdd, setNumSlotsToAdd] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analytics, setAnalytics] = useState({});
  const [slotsData, setSlotsData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [actionMenuSlotId, setActionMenuSlotId] = useState(null);
    const [occupiedSlots, setOccupiedSlots] = useState([]); 
  const menuRef = useRef(null);

  const loadData = async () => {
    const statsRes = await getStat();
    const slotsRes = await getSlotDetails();
    if (statsRes) setAnalytics(statsRes);
    if (slotsRes && slotsRes.slots) setSlotsData(slotsRes.slots);
    setOccupiedSlots(slotsRes.occupiedSlots);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActionMenuSlotId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddSlots = async (e) => {
    e.preventDefault();
    if (numSlotsToAdd < 1) return Swal.fire({
      icon: 'warning',
      title: 'Invalid Number',
      text: 'Please enter a positive number.'
    });
    setIsSubmitting(true);
    const result = await addSlot({ count: parseInt(numSlotsToAdd, 10) });
    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Slots Added',
        text: `${numSlotsToAdd} slot(s) added successfully!`
      });
      setNumSlotsToAdd(1);
      await loadData();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: `Failed to add slots: ${result.error}`
      });
    }
    setIsSubmitting(false);
  };
  
  const handleForceExit = async (slotId) => {
    setActionMenuSlotId(null);
    if (window.confirm("Are you sure you want to force check-out this vehicle? This action cannot be undone.")) {
      const result = await forceExit(slotId);
      if (!result.success) Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Error: ${result.error}`
      });
    }
  };

  const handleSetStatus = async (slotId, status) => {
    setActionMenuSlotId(null);
    const result = await updateSlotStatus(slotId, status);
    if (!result.success) Swal.fire({
      icon: 'error',
      title: 'Error',
      text: `Error: ${result.error}`
    });
  };

  const handleRemoveSlot = async (slotId) => {
    setActionMenuSlotId(null);
    if (window.confirm("Are you sure you want to permanently delete this slot?")) {
        const result = await removeSlot(slotId);
        if (!result.success) Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Error: ${result.error}`
        });
    }
  };

  const handleSlotCardClick = (slot) => {
    if (slot.status === 'occupied' && slot.user) {
      setSelectedSlot(slot);
      setIsModalOpen(true);
    }
  };

  const statusStyles = {
    available: 'bg-green-100 border-green-500 text-green-800',
    occupied: 'bg-red-100 border-red-500 text-red-800',
    maintenance: 'bg-purple-100 border-purple-500 text-purple-800',
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard icon={<FaParking />} title="Total Slots" value={analytics.totalSlots ?? '...'} color="text-blue-500" />
        <StatCard icon={<FaCar />} title="Occupied Slots" value={analytics.occupiedSlots ?? '...'} color="text-red-500" />
        <StatCard icon={<FaCarSide />} title="Available Slots" value={analytics.nonOccupiedSlots ?? '...'} color="text-green-500" />
        <StatCard icon={<FaCar />} title="Parks Today" value={analytics.parksToday ?? '...'} color="text-amber-500" />
        <StatCard icon={<FaRegClock />} title="Avg. Park Time" value={analytics.avgParkingDuration ?? '...'} color="text-purple-500" />
      </div>

         {analytics.chartData && (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <DailyActivityChart chartData={analytics.chartData} />
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center border-b pb-4 mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 md:mb-0">Parking Slot Management</h2>
          <form onSubmit={handleAddSlots} className="flex items-center gap-2">
            <input type="number" value={numSlotsToAdd} onChange={(e) => setNumSlotsToAdd(e.target.value)} min="1" className="px-3 py-2 border border-gray-300 rounded-md w-24" />
            <button type="submit" disabled={isSubmitting} className="bg-amber-500 text-white font-bold py-2 px-4 rounded-md hover:bg-amber-600 flex items-center gap-2">
              {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaPlus />} Add Slots
            </button>
          </form>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {slotsData.map((slot) => {
            const style = statusStyles[slot.status] || 'bg-gray-100 border-gray-400';
            const isDetailsClickable = slot.status === 'occupied' && slot.user;
            return (
              <div key={slot.id} onClick={() => handleSlotCardClick(slot)} className={`p-3 rounded-lg border-2 text-center transition-transform hover:scale-105 flex flex-col justify-between h-32 relative ${style} ${isDetailsClickable ? 'cursor-pointer' : ''}`}>
                <button onClick={(e) => { e.stopPropagation(); setActionMenuSlotId(slot.id === actionMenuSlotId ? null : slot.id); }} className="absolute top-1 right-1 p-1 text-gray-500 hover:text-black rounded-full z-20">
                  <FaEllipsisV />
                </button>
                {actionMenuSlotId === slot.id && (
                  <div ref={menuRef} className="absolute top-8 right-1 bg-white shadow-lg rounded-md z-10 w-48 text-left border border-gray-200">
                    {/* --- FIX IS HERE: Added e.stopPropagation() to all menu buttons --- */}
                    {slot.status === 'occupied' && (
                      <button onClick={(e) => { e.stopPropagation(); handleForceExit(slot.id); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"><FaSignOutAlt /> Force Exit</button>
                    )}
                    {slot.status === 'available' && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); handleSetStatus(slot.id, 'maintenance'); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"><FaWrench /> Set to Maintenance</button>
                        <button onClick={(e) => { e.stopPropagation(); handleRemoveSlot(slot.id); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"><FaTrash /> Delete Slot</button>
                      </>
                    )}
                    {slot.status === 'maintenance' && (
                      <button onClick={(e) => { e.stopPropagation(); handleSetStatus(slot.id, 'available'); }} className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-100 flex items-center gap-2"><FaCheckCircle /> Set to Available</button>
                    )}
                  </div>
                )}
                <div className="pt-4">
                  <p className="font-bold text-2xl">{slot.number}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider">{slot.status}</p>
                </div>
                {slot.status === 'occupied' && (
                  <div className="mt-2 text-xs">
                    <p className="font-bold truncate">{slot.currentVehicle}</p>
                    <p className="flex items-center justify-center gap-1"><FaRegClock />{new Date(slot.inTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {isModalOpen && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"><FaTimes /></button>
            <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">Slot <span className="text-amber-500">{selectedSlot.number}</span> Details</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2"><FaCar /> Vehicle Information</h3>
                <div className="text-gray-600 space-y-1 pl-6">
                  <p className="flex items-center gap-3"><FaHashtag className="text-gray-400" /> <strong>Vehicle No:</strong> {selectedSlot.currentVehicle}</p>
                  <p className="flex items-center gap-3"><FaRegClock className="text-gray-400" /> <strong>Checked In:</strong> {new Date(selectedSlot.inTime).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2"><FaUser /> Owner Information</h3>
                <div className="text-gray-600 space-y-1 pl-6">
                  <p className="flex items-center gap-3"><FaUser className="text-gray-400" /> <strong>Name:</strong> {selectedSlot.user.username}</p>
                  <p className="flex items-center gap-3"><FaEnvelope className="text-gray-400" /> <strong>Email:</strong> {selectedSlot.user.email}</p>
                  <p className="flex items-center gap-3"><FaPhone className="text-gray-400" /> <strong>Phone:</strong> {selectedSlot.user.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
        <ActiveVehiclesList occupiedSlots={occupiedSlots} />
    </div>
  );
};

export default AdminDashboard;