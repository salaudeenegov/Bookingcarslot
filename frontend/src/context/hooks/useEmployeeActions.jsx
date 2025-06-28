import bcrypt from "bcryptjs";
import { db } from "../../db/db";

export const useEmployeeActions = (user, fetchData) => {
  const checkPermissions = () => {
    return user && (user.role === "admin" || user.role === "employee");
  };

  const getSlotDetails = async () => {
    if (!checkPermissions()) return { success: false, error: "Unauthorized" };
    try {
      const slots = await db.slot.toArray();
      const detailedSlots = await Promise.all(
        slots.map(async (s) => {
          let userInfo = null;
          if (s.status === "occupied" && s.userId) {
            userInfo = await db.user.get(s.userId);
          }
          return {
            id: s.id,
            number: s.number,
            status: s.status,
            userId: s.userId,
            currentVehicle: s.currentVehicle,
            inTime: s.inTime,
            currentBookingId: s.currentBookingId,
            user: userInfo
              ? {
                  username: userInfo.username,
                  email: userInfo.email,
                  phone: userInfo.phone,
                  vehicleNumber: userInfo.vehicleNumber,
                }
              : null,
          };
        })
      );
      return { success: true, slots: detailedSlots };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const markVehicleExit = async (slotId) => {
    checkPermissions();

    try {
      await db.transaction("rw", db.slot, db.bookings, db.logs, async () => {
        const slot = await db.slot.get(slotId);
        if (!slot || slot.status !== "occupied") {
          throw new Error("Slot is not occupied or does not exist.");
        }

        const bookingId = slot.currentBookingId;
        const booking = await db.bookings.get(bookingId);
        if (!booking) {
          throw new Error("Could not find the associated booking record.");
        }
        const entryTime = booking.inTime || booking.startTime;
        if (!entryTime) {
          throw new Error(
            "Booking record is missing an entry time. Cannot proceed."
          );
        }

        const outTime = new Date();

        const logData = {
          userId: booking.userId,
          vehicleNumber: booking.vehicleNumber,
          slotId: slot.id,
          slotNumber: slot.number,
          bookingId: booking.id,
          inTime: entryTime,
          outTime: outTime,
        };

        console.log("Adding the Exit Log:", logData);
        await db.logs.add(logData);

        // Optionally, also add a log for entry if not already present (for completeness)
        // Uncomment below if you want to always ensure an entry log exists
        // const entryLog = await db.logs.where({ bookingId: booking.id, outTime: null }).first();
        // if (!entryLog) {
        //   await db.logs.add({
        //     userId: booking.userId,
        //     username: booking.username,
        //     vehicleNumber: booking.vehicleNumber,
        //     slotId: slot.id,
        //     slotNumber: slot.number,
        //     bookingId: booking.id,
        //     inTime: booking.inTime,
        //     outTime: null,
        //     duration: null,
        //     type: 'entry',
        //   });
        // }

        // Update the Booking to mark it as completed
        await db.bookings.update(bookingId, {
          status: "completed",
          outTime: outTime,
        });

        await db.slot.update(slotId, {
          status: "available",
          userId: null,
          currentVehicle: null,
          inTime: null,
          currentBookingId: null,
        });
      });

      await fetchData();
      return { success: true };
    } catch (error) {
      console.error("Failed to mark vehicle exit:", error);
      return { success: false, error: error.message };
    }
  };
  const assignDriveInVehicle = async (slotId, driveInData) => {
    checkPermissions();

    const { vehicleNumber, driverName, phone } = driveInData;
    if (!vehicleNumber) {
      throw new Error("Vehicle number is required for a drive-in.");
    }

    try {
      const salt = await bcrypt.genSalt(5);
      const tempPassword = await bcrypt.hash(`guest-${Date.now()}`, salt);
      const inTime = new Date();

      // Check if this vehicle already has an active booking
      const existingActiveBooking = await db.bookings
        .where({ vehicleNumber, status: "active" })
        .first();
      if (existingActiveBooking) {
        throw new Error(
          "This vehicle already has an active booking. Please exit the previous booking first."
        );
      }

      const guestUser = {
        username:
          driverName ||
          `Guest-${vehicleNumber.replace(/\s/g, "")}-${Date.now()}`,
        email: `guest_${Date.now()}@parking.local`,
        phone: phone || "",
        vehicleNumber: vehicleNumber,
        password: tempPassword,
        role: "guest",
      };

      await db.transaction("rw", db.user, db.slot, db.bookings, async () => {
        const slot = await db.slot.get(slotId);
        if (slot.status !== "available") {
          throw new Error("This slot is no longer available.");
        }

        const guestUserId = await db.user.add(guestUser);

        const newBooking = {
          userId: guestUserId,
          username: guestUser.username,
          vehicleNumber: vehicleNumber,
          slotNumber: slot.number,
          inTime: inTime,
          status: "active",
        };
        const newBookingId = await db.bookings.add(newBooking);

        await db.logs.add({
          userId: guestUserId,
          vehicleNumber: vehicleNumber,
          slotId: slot.id,
          slotNumber: slot.number,
          bookingId: newBookingId,
          inTime: inTime,
          outTime: null,
        });

        await db.slot.update(slotId, {
          status: "occupied",
          userId: guestUserId,
          currentVehicle: vehicleNumber,
          inTime: inTime,
          currentBookingId: newBookingId,
        });
      });

      await fetchData();
      return { success: true };
    } catch (error) {
      console.error("Failed to assign drive-in vehicle:", error);
      return { success: false, error: error.message };
    }
  };

  return { getSlotDetails, markVehicleExit, assignDriveInVehicle };
};
