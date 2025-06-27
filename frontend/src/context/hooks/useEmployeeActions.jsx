import { db } from "../../db/db";

export const useEmployeeActions = (user, fetchData) => {
  const checkPermissions = () => {
    return user && (user.role === 'admin' || user.role === 'employee');
  };

  const getSlotDetails = async () => {
    if (!checkPermissions()) return { success: false, error: "Unauthorized" };
    try {
      const slots = await db.slot.toArray();
      const detailedSlots = await Promise.all(slots.map(async (s) => {
        let userInfo = null;
        if (s.status === "occupied" && s.userId) {
          userInfo = await db.user.get(s.userId);
        }
        return {
          id: s.id, number: s.number, status: s.status, userId: s.userId, currentVehicle: s.currentVehicle, inTime: s.inTime, currentBookingId: s.currentBookingId,
          user: userInfo ? { username: userInfo.username, email: userInfo.email, phone: userInfo.phone, vehicleNumber: userInfo.vehicleNumber } : null,
        };
      }));
      return { success: true, slots: detailedSlots };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };



  return { getSlotDetails };
};