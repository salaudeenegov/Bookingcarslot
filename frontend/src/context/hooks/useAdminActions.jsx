import { db } from "../../db/db";
import { useEmployeeActions } from './useEmployeeActions';

export const useAdminActions = (user, fetchData) => {
  const employeeActions = useEmployeeActions(user, fetchData);

  const checkPermissions = () => {
    return user && user.role === 'admin';
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

  const getStat = async () => {
    if (!checkPermissions()) return { success: false, error: "Unauthorized" };
    try {
      const totalSlots = await db.slot.count();
      const occupiedSlots = await db.slot.where("status").equals("occupied").count();
      const nonOccupiedSlots = totalSlots - occupiedSlots;
      return { success: true, totalSlots, occupiedSlots, nonOccupiedSlots };
    } catch (error) {
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
    forceExit
  };
};