import React, { useState, useEffect, useCallback } from 'react';
import { useParking } from '../../context/ParkingContext'; 
import { FaCar, FaUser, FaClock, FaPlusCircle, FaSpinner, FaWrench } from 'react-icons/fa';


const DriveInFormModal = ({ onSave, onCancel }) => {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vehicleNumber) {
      alert("Vehicle Number is mandatory.");
      return;
    }
    setIsSaving(true);
 
    await onSave({ vehicleNumber, driverName, phone });
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Assign Drive-In Vehicle</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700">Vehicle Number (Required)</label>
            <input
              id="vehicleNumber"
              type="text"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
              placeholder="e.g., MH12AB1234"
              className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="driverName" className="block text-sm font-medium text-gray-700">Driver's Name (Optional)</label>
            <input
              id="driverName"
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              placeholder="e.g., John Doe"
              className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number (Optional)</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g., 9876543210"
              className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onCancel} disabled={isSaving} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
              {isSaving ? <FaSpinner className="animate-spin" /> : null}
              {isSaving ? 'Assigning...' : 'Assign Slot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- Main StaffConsole Component ---
const StaffConsole = () => {
  const { getSlotDetails, markVehicleExit, assignDriveInVehicle, slots: globalSlots } = useParking();
  
  const [detailedSlots, setDetailedSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState(null);

  // Memoized function to fetch detailed slot data
  const fetchDetails = useCallback(async () => {
    setIsLoading(true);
    setError('');
    const result = await getSlotDetails();
    if (result.success) {
      setDetailedSlots(result.slots);
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  }, [getSlotDetails]);

  
  useEffect(() => {
    fetchDetails();
  }, [fetchDetails, globalSlots]); 

  // Handler to mark a vehicle as exited
  const handleExitVehicle = async (slotId) => {
    if (window.confirm('Are you sure you want to mark this vehicle as exited? This action cannot be undone.')) {
      const result = await markVehicleExit(slotId);
      if (!result.success) {
        alert(`Error: ${result.error}`);
      }
      // The view will auto-update because markVehicleExit calls fetchData(),
      // which updates globalSlots, triggering the useEffect hook.
    }
  };

  // Handler to open the drive-in assignment modal
  const handleOpenDriveInModal = (slotId) => {
    setSelectedSlotId(slotId);
    setIsModalOpen(true);
  };

  // Handler to process the drive-in data from the modal
  const handleAssignDriveIn = async (driveInData) => {
    if (!selectedSlotId) return;
    console.log(driveInData);
    const result = await assignDriveInVehicle(selectedSlotId, driveInData);
    if (result.success) {
      setIsModalOpen(false);
      setSelectedSlotId(null);
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  if (isLoading && detailedSlots.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <FaSpinner className="text-4xl text-blue-500 animate-spin mx-auto" />
          <p className="mt-4 text-lg text-gray-600">Loading Parking Console...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-xl text-red-600 bg-red-100 rounded-md">Error: {error}</div>;
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Staff Parking Console</h1>
      
      {isModalOpen && (
        <DriveInFormModal
          onSave={handleAssignDriveIn}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {detailedSlots.map((slot) => (
          <div
            key={slot.id}
            className={`rounded-lg shadow-lg p-4 flex flex-col justify-between transition-all duration-300 ${
              slot.status === 'occupied'
                ? 'bg-orange-100 border-2 border-orange-300'
                : slot.status === 'maintenance'
                  ? 'bg-purple-100 border-2 border-purple-400 opacity-70'
                  : 'bg-green-100 border-2 border-green-300 hover:shadow-xl hover:border-green-400'
            }`}
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-700 text-center mb-3">
                Slot {slot.number}
              </h2>
              {slot.status === 'occupied' ? (
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="flex items-center gap-2 font-semibold"><FaUser className="text-blue-500 flex-shrink-0" /> <span>{slot.user?.username || 'N/A'}</span></p>
                  <p className="flex items-center gap-2"><FaCar className="text-gray-700 flex-shrink-0" /> {slot.currentVehicle || 'N/A'}</p>
                  <p className="flex items-center gap-2"><FaClock className="text-teal-600 flex-shrink-0" /> {new Date(slot.inTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              ) : slot.status === 'maintenance' ? (
                <div className="text-center mt-8">
                  <p className="text-purple-700 font-semibold mb-4 text-lg">Under Maintenance</p>
                  <button
                    disabled
                    className="w-full py-2 px-2 bg-gray-400 text-white font-bold rounded-lg cursor-not-allowed flex items-center justify-center gap-2 opacity-60"
                  >
                    <FaWrench /> Not Available
                  </button>
                </div>
              ) : (
                <div className="text-center mt-8">
                  <p className="text-green-700 font-semibold mb-4 text-lg">Available</p>
                  <button
                    onClick={() => handleOpenDriveInModal(slot.id)}
                    className="w-full py-2 px-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 transition-colors"
                  >
                    <FaPlusCircle /> Assign Drive-In
                  </button>
                </div>
              )}
            </div>
            
            {slot.status === 'occupied' && (
              <button
                onClick={() => handleExitVehicle(slot.id)}
                className="w-full mt-4 py-2 px-4 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors"
              >
                Mark as Exited
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffConsole;