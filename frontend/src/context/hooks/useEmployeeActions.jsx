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

        const outTime = new Date();


        const logData = {
          userId: booking.userId,
          username: booking.username,
          vehicleNumber: booking.vehicleNumber,
          slotNumber: slot.number,
          inTime: booking.inTime,
          outTime: outTime,
          duration: (outTime - booking.inTime) / 1000 / 60, // Duration in minutes
        };
        await db.logs.add(logData);

        // 2. Update the Booking to mark it as completed
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
        
        const guestUser = {
           
            username: driverName || `Guest-${vehicleNumber.replace(/\s/g, '')}-${Date.now()}`,
            email: `guest_${Date.now()}@parking.local`, 
            phone: phone || '',
            vehicleNumber: vehicleNumber,
            password: tempPassword,
            role: 'guest',
        };


        await db.transaction('rw', db.user, db.slot, db.bookings, async () => {
            const slot = await db.slot.get(slotId);
            if (slot.status !== 'available') {
                throw new Error("This slot is no longer available.");
            }

            
            const guestUserId = await db.user.add(guestUser);

          
            const newBooking = {
                userId: guestUserId,
                username: guestUser.username,
                vehicleNumber: vehicleNumber,
                slotNumber: slot.number,
                inTime: inTime,
                status: 'active',
            };
            const newBookingId = await db.bookings.add(newBooking);

         
            await db.slot.update(slotId, {
                status: 'occupied',
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
