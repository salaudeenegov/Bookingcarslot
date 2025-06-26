import Dexie from "dexie";

export const db = new Dexie("ParkingLot");

db.version(1).stores({
  user: "++id, email, username, password, phone, vechilenumber, role",
  slot: "++id, number, status, currentvechile, resturantid",
  logs: "++id, intime, outtime, userId, vechilenumber",
  resturant: "++id, name, location",
});
