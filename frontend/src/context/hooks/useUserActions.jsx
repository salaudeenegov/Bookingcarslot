import { db } from "../../db/db";

export const useUserActions = (user, fetchData) => {
  const bookSlot = async (slotId, vehicleNumber, inTime) => {
    if (!user) return { success: false, error: "User not logged in" };

    const activeUserSlot = await db.slot.where({ userId: user.id, status: "occupied" }).first();
    if (activeUserSlot) {
      return { success: false, error: `You are already parked in slot ${activeUserSlot.number}.` };
    }

    const slot = await db.slot.get(slotId);
    if (!slot || slot.status !== 'available') {
      return { success: false, error: "Slot is not available." };
    }

    const inTimeObj = new Date(inTime);
    try {
      await db.transaction("rw", db.bookings, db.slot, db.logs, async () => {
        const bookingData = { slotId, userId: user.id, vehicleNumber: vehicleNumber || user.vehicleNumber, startTime: inTimeObj, endTime: null, status: "active" };
        const bookingId = await db.bookings.add(bookingData);
        await db.slot.update(slotId, { status: "occupied", userId: user.id, currentVehicle: bookingData.vehicleNumber, inTime: inTimeObj, currentBookingId: bookingId });
        await db.logs.add({ slotId, slotNumber: slot.number, userId: user.id, vehicleNumber: bookingData.vehicleNumber, inTime: inTimeObj, outTime: null, bookingId });
      });
      await fetchData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const manageExit = async (slotId) => {
    if (!user) return { success: false, error: "User not logged in" };
    
    try {
      const slot = await db.slot.get(slotId);
      if (!slot) throw new Error("Slot not found");
      if(slot.userId !== user.id) return { success: false, error: "This is not your vehicle." };

      const logToUpdate = await db.logs.where({ slotId, outTime: null }).first();
      if (logToUpdate) {
        await db.logs.update(logToUpdate.id, { outTime: new Date() });
        if (logToUpdate.bookingId) {
          await db.bookings.update(logToUpdate.bookingId, { status: "completed" });
        }
      }
      await db.slot.update(slotId, { status: "available", userId: null, currentVehicle: null, inTime: null, currentBookingId: null });
      await fetchData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const getMyBookings = async () => {
    if (!user) return [];
    return db.bookings.where("userId").equals(user.id).reverse().toArray();
  };

  const getMyActiveParkingSession = async () => {
    if (!user) return null;
    try {
      const activeBooking = await db.bookings.where("[userId+status]").equals([user.id, "active"]).first();
      if (!activeBooking) return null;
      const slot = await db.slot.get(activeBooking.slotId);
      const log = await db.logs.where({ bookingId: activeBooking.id, outTime: null }).first();
      if (!slot || !log) return null;
      return { booking: activeBooking, slot, log };
    } catch (error) {
      console.error("Failed to get active parking session:", error);
      return null;
    }
  };

  return { bookSlot, manageExit, getMyBookings, getMyActiveParkingSession };
};