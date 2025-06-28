import Dexie from "dexie";

export const db = new Dexie("ParkingLot");

db.version(1).stores({
 user: "++id, &email, username, password, phone, vehicleNumber, role",
  slot: "++id, &number, status, currentVehicle, userId, inTime, currentBookingId",
 logs: "++id, inTime, outTime, userId, slotId, slotNumber, vehicleNumber, bookingId",
 bookings: "++id, slotId, userId, vehicleNumber, startTime, status, &[userId+status]"
});
