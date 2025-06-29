import { db } from "../../db/db";
import { useEmployeeActions } from './useEmployeeActions';
import bcrypt from "bcryptjs";

export const useAdminActions = (user, fetchData) => {
  const employeeActions = useEmployeeActions(user, fetchData);

  const checkPermissions = () => {
    return user && user.role === 'admin';
  };


  const addUser = async (userData) => {
    checkPermissions();
    try {
     
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      await db.user.add({
        ...userData,
        password: hashedPassword,
      });
      await fetchData();
    } catch (error) {
      console.error("Failed to add user:", error);
   
      throw error;
    }
  };

  const addSlot = async (slotData) => {
    if (!checkPermissions()) return { success: false, error: "Unauthorized" };
    try {
      const slotCount = slotData?.count || 1;
      const lastSlot = await db.slot.orderBy("id").last();
      const lastSlotNumber = lastSlot ? parseInt(lastSlot.number.replace("S", ""), 10) : 0;
      for (let i = 0; i < slotCount; i++) {
        await db.slot.add({ number: `S${lastSlotNumber + i + 1}`, status: "available", currentVehicle: null, userId: null, inTime: null, currentBookingId: null });
      }
      await fetchData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const removeSlot = async (slotId) => {
    if (!checkPermissions()) return { success: false, error: "Unauthorized" };
    try {
      const slot = await db.slot.get(slotId);
      if (slot && slot.status === 'occupied') {
        return { success: false, error: "Cannot delete an occupied slot. Force check-out first." };
      }
      await db.slot.delete(slotId);
      await fetchData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateSlotStatus = async (slotId, status) => {
    if (!checkPermissions()) return { success: false, error: "Unauthorized" };
    try {
      const slot = await db.slot.get(slotId);
      if (!slot) return { success: false, error: "Slot not found" };
      if (slot.status === 'occupied' && status !== 'available') return { success: false, error: "Cannot change status of an occupied slot. Please force exit first." };
      await db.slot.update(slotId, { status });
      await fetchData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };
    const updateUser = async (userId, updatedData) => {
    checkPermissions();
    try {
      // Don't update the password this way unless it's a password-reset form
      // This example just updates non-sensitive info
      const { password, ...dataToUpdate } = updatedData;
      await db.user.update(userId, dataToUpdate);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error("Failed to update user:", error);
      throw error;
    }
  };

    const getStat = async () => {
    if (!checkPermissions()) return { success: false, error: "Unauthorized" };
    try {
      // --- Basic Stats (from `slot` table - no change here) ---
      const totalSlots = await db.slot.count();
      const occupiedSlots = await db.slot.where("status").equals("occupied").count();
      const nonOccupiedSlots = totalSlots - occupiedSlots;


      

      const toLocalDateString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };


      const allBookings = await db.bookings.toArray();
      const today = new Date();
      const todayStr = toLocalDateString(today); 
      
      const uniqueVehiclesToday = new Set();
      let totalDuration = 0;
      let completedBookingsCount = 0;
      
      const dailyUniqueVehicleSets = new Map();
      const chartLabels = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
     
        dailyUniqueVehicleSets.set(toLocalDateString(d), new Set());
        chartLabels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      }

      // 2. Process all bookings in a single loop
      allBookings.forEach(booking => {
        if (!booking.inTime || !booking.vehicleNumber) return; 

        const inTimeDate = new Date(booking.inTime);
        const logDateStr = toLocalDateString(inTimeDate); 

     
        if (dailyUniqueVehicleSets.has(logDateStr)) {
          dailyUniqueVehicleSets.get(logDateStr).add(booking.vehicleNumber);
        }

    
        if (logDateStr === todayStr) {
          uniqueVehiclesToday.add(booking.vehicleNumber);
        }

   
        if (booking.outTime) {
          totalDuration += new Date(booking.outTime).getTime() - new Date(booking.inTime).getTime();
          completedBookingsCount++;
        }
      });
      
      // 3. Finalize calculations
      const parksToday = uniqueVehiclesToday.size;

      let avgParkingDuration = "N/A";
      if (completedBookingsCount > 0) {
        const avgMilliseconds = totalDuration / completedBookingsCount;
        const hours = Math.floor(avgMilliseconds / 3600000);
        const minutes = Math.floor((avgMilliseconds % 3600000) / 60000);
        avgParkingDuration = `${hours}h ${minutes}m`;
      }
      
      const chartDataPoints = Array.from(dailyUniqueVehicleSets.values())
                                   .map(vehicleSet => vehicleSet.size);

      const chartData = {
          labels: chartLabels,
          data: chartDataPoints,
      };

      return { 
        success: true, 
        totalSlots, 
        occupiedSlots, 
        nonOccupiedSlots,
        parksToday,
        avgParkingDuration,
        chartData,
      };
    } catch (error) {
      console.error("Error in getStat:", error);
      return { success: false, error: error.message };
    }
  };

  const getAllLogsDetailed = async () => {
    if (!checkPermissions()) return { success: false, error: "Unauthorized" };
    try {
      const logs = await db.logs.orderBy("inTime").reverse().toArray();
      const detailedLogs = await Promise.all(
        logs.map(async (log) => {
          const userInfo = log.userId ? await db.user.get(log.userId) : null;
          return {
            id: log.id,
            slotNumber: log.slotNumber ?? `ID: ${log.slotId}`,
            vehicleNumber: log.vehicleNumber,
            inTime: log.inTime,
            outTime: log.outTime,
            user: userInfo ? { username: userInfo.username, email: userInfo.email, phone: userInfo.phone, } : { username: "Walk-in/Unknown", email: "", phone: "" },
          };
        })
      );
      return { success: true, logs: detailedLogs };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

   const deleteUser = async (userId) => {
    checkPermissions();
    try {
      // Add safety check: don't let an admin delete themselves
      if (user.id === userId) {
        throw new Error("Admin cannot delete their own account.");
      }
      await db.user.delete(userId);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error("Failed to delete user:", error);
      throw error;
    }
  };
  

  const getAllUsers = async () => {
    if (!checkPermissions()) return { success: false, error: "Unauthorized" };
    try {
      const usersFromDb = await db.user.toArray();
      const users = usersFromDb.map(u => {
        const { password, ...rest } = u;
        return rest;
      });
      return { success: true, users };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

   const getSlotDetails = async () => {
    try {
      const slotsFromDb = await db.slot.toArray();
      
      const allSlots = await Promise.all(
        slotsFromDb.map(async (slot) => {
          let userInfo = null;
          if (slot.status === 'occupied' && slot.userId) {
            userInfo = await db.user.get(slot.userId);
          }
       
          return { ...slot, user: userInfo };
        })
      );

      const occupiedSlots = allSlots.filter(
        slot => slot.status === 'occupied'
      );
      

      return { 
        success: true, 
        slots: allSlots,       
        occupiedSlots: occupiedSlots 
      };

    } catch (error) {
      console.error("Failed to get slot details:", error);
      return { success: false, error: error.message, slots: [], occupiedSlots: [] };
    }
  };
    const forceExit = async (slotId) => {
    if (!checkPermissions()) return { success: false, error: "Unauthorized" };
    try {
      const slot = await db.slot.get(slotId);
      if (!slot) return { success: false, error: "Slot not found." };
      if (slot.status === 'available') return { success: false, error: "Slot is already available." };

      const logToUpdate = await db.logs.where({ slotId, outTime: null }).first();
      if (logToUpdate) {
        await db.logs.update(logToUpdate.id, { outTime: new Date() });
        if (logToUpdate.bookingId) {
          await db.bookings.update(logToUpdate.bookingId, { status: "force_completed" });
        }
      }
      await db.slot.update(slotId, { status: "available", userId: null, currentVehicle: null, inTime: null, currentBookingId: null });
      await fetchData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    ...employeeActions, 
    addSlot,
    removeSlot,
    updateSlotStatus,
    getStat,
    getAllLogsDetailed,
    getAllUsers,
    forceExit,
    addUser,
    updateUser,
    deleteUser,
    getSlotDetails
  };
};