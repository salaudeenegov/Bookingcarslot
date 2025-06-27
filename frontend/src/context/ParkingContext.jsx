import React, { createContext, useReducer, useEffect, useContext, useCallback } from "react";
import { db } from "../db/db";
import { AuthContext } from "./AuthContext.jsx";

const ParkingContext = createContext();

const initialState = {
  slots: [],
  bookings: [],
  logs: [],
  loading: true,
  error: null,
};

function parkingReducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: true };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "SET_DATA":
      return {
        ...state,
        slots: action.payload.slots,
        bookings: action.payload.bookings,
        logs: action.payload.logs,
        loading: false,
      };
    case "UPDATE_SLOT":
      return {
        ...state,
        slots: state.slots.map((s) =>
          s.id === action.payload.id ? { ...s, ...action.payload } : s
        ),
      };
    case "UPDATE_BOOKING":
       return {
        ...state,
        bookings: state.bookings.map(b => 
            b.id === action.payload.id ? { ...b, ...action.payload } : b
        ),
      };
    case "ADD_BOOKING":
        return {
            ...state,
            bookings: [action.payload, ...state.bookings]
        };
    default:
      return state;
  }
}

const BOOKING_GRACE_PERIOD_MS = 30 * 60 * 1000; 

export const ParkingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(parkingReducer, initialState);
  const { user } = useContext(AuthContext);

  const fetchData = useCallback(async () => {
    dispatch({ type: "SET_LOADING" });
    try {
      const slotCount = await db.slot.count();
      if (slotCount === 0) {
        const initialSlots = Array.from({ length: 20 }, (_, i) => ({
          number: i + 1,
          status: 'available',
          currentVehicle: null,
          userId: null,
          inTime: null,
          currentBookingId: null,
        }));
        await db.slot.bulkAdd(initialSlots);
      }

      const slotsFromDb = await db.slot.toArray();
      const bookingsFromDb = await db.bookings.where('status').anyOf('pending', 'active').toArray();
      const logsFromDb = await db.logs.orderBy("inTime").reverse().toArray();
      
      dispatch({ type: "SET_DATA", payload: { slots: slotsFromDb, bookings: bookingsFromDb, logs: logsFromDb }});
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: err.message });
    }
  }, []);

  useEffect(() => {
    const expireBookings = async () => {
        console.log("Checking for expired bookings...");
        const now = new Date();
        const expired = await db.bookings
            .where('status').equals('pending')
            .and(b => new Date(b.endTime) < now)
            .toArray();

        if (expired.length > 0) {
            const expiredIds = expired.map(b => b.id);
            await db.bookings.bulkUpdate(expired.map(b => ({ key: b.id, changes: { status: 'expired' }})));
            
            const slotIdsToFree = expired.map(b => b.slotId);
            await db.slot.where('id').anyOf(slotIdsToFree).modify({ status: 'available', currentBookingId: null });
            
            console.log(`Expired ${expired.length} bookings.`);
            fetchData();
        }
    };
    
    fetchData();
    const intervalId = setInterval(expireBookings, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [fetchData]);

  const bookSlot = async (slotId, vehicleNumber, startTime) => {
    if (!user) return { success: false, error: "User not logged in" };

    // Check if user already has an active or pending booking
    const existingUserBooking = await db.bookings
      .where('userId').equals(user.id)
      .and(b => b.status === 'pending' || b.status === 'active')
      .first();
    if (existingUserBooking) {
      return { success: false, error: "You already have an active or pending booking." };
    }

    const startTimeObj = new Date(startTime);
    const endTimeObj = new Date(startTimeObj.getTime() + BOOKING_GRACE_PERIOD_MS);

    const conflict = await db.bookings
      .where('slotId').equals(slotId)
      .and(b => b.status === 'pending' && (
          (new Date(b.startTime) < endTimeObj) && (new Date(b.endTime) > startTimeObj)
      )).first();
      
    if (conflict) {
      return { success: false, error: "Slot is already booked for this time period." };
    }

    const bookingData = {
      slotId,
      userId: user.id,
      vehicleNumber: vehicleNumber || user.vehicleNumber,
      startTime: startTimeObj,
      endTime: endTimeObj,
      status: "pending",
    };

    try {
      const id = await db.bookings.add(bookingData);
      await db.slot.update(slotId, { status: 'booked', currentBookingId: id });

      dispatch({type: "ADD_BOOKING", payload: {...bookingData, id}});
      dispatch({type: "UPDATE_SLOT", payload: { id: slotId, status: 'booked', currentBookingId: id }});
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const cancelBooking = async (bookingId) => {
      try {
        const booking = await db.bookings.get(bookingId);
        if (!booking) throw new Error("Booking not found");

        await db.bookings.update(bookingId, { status: 'cancelled' });
        const slot = await db.slot.get(booking.slotId);
        if(slot.currentBookingId === bookingId && slot.status !== 'occupied') {
            await db.slot.update(booking.slotId, { status: 'available', currentBookingId: null });
            dispatch({ type: "UPDATE_SLOT", payload: { id: booking.slotId, status: 'available', currentBookingId: null } });
        }
        dispatch({ type: "UPDATE_BOOKING", payload: { id: bookingId, status: 'cancelled' } });
        return { success: true };
      } catch(err) {
        return { success: false, error: err.message };
      }
  };

  const checkInUser = async (bookingId) => {
    try {
        const booking = await db.bookings.get(bookingId);
        if (!booking) throw new Error("Booking not found");

        const now = new Date();
        if (now > new Date(booking.endTime)) {
            await db.bookings.update(bookingId, { status: 'expired' });
            dispatch({ type: "UPDATE_BOOKING", payload: { id: bookingId, status: 'expired' } });
            return { success: false, error: "Booking has expired." };
        }

        const updatedSlotData = {
            status: 'occupied',
            userId: booking.userId,
            currentVehicle: booking.vehicleNumber,
            inTime: now,
        };
        await db.slot.update(booking.slotId, updatedSlotData);
        await db.bookings.update(bookingId, { status: 'active' });
        await db.logs.add({
            slotId: booking.slotId,
            userId: booking.userId,
            vehicleNumber: booking.vehicleNumber,
            inTime: now,
            outTime: null,
            bookingId: booking.id
        });
        
        fetchData();
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
  };

  const manageExit = async (slotId) => {
    try {
      const slot = await db.slot.get(slotId);
      if(!slot) throw new Error("Slot not found");

      const logToUpdate = await db.logs.where({ slotId: slotId, outTime: null }).first();
      if (logToUpdate) {
        await db.logs.update(logToUpdate.id, { outTime: new Date() });
        if (logToUpdate.bookingId) {
            await db.bookings.update(logToUpdate.bookingId, { status: 'completed' });
        }
      }
      
      const updatedSlotData = { status: 'available', userId: null, currentVehicle: null, inTime: null, currentBookingId: null };
      await db.slot.update(slotId, updatedSlotData);

      fetchData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const getBookingsForUser = useCallback(async (userId) => {
    return db.bookings.where('userId').equals(userId).reverse().toArray();
  }, []);
   const getActiveParkingSession = useCallback(async (userId) => {
    try {
      const activeBooking = await db.bookings
        .where({ userId: userId, status: 'active' })
        .first();

      if (!activeBooking) {
        return null;
      }

      const slot = await db.slot.get(activeBooking.slotId);
      const log = await db.logs.where({ bookingId: activeBooking.id }).first();

      if (!slot || !log) {
        console.error("Data inconsistency for active session:", activeBooking);
        return null;
      }
      
      return { booking: activeBooking, slot, log };

    } catch (error) {
      console.error("Failed to get active parking session:", error);
      return null;
    }
  }, []);

  return (
    <ParkingContext.Provider value={{
      ...state,
      bookSlot,
      cancelBooking,
      checkInUser,
      manageExit,
      getBookingsForUser,
      getActiveParkingSession,
      fetchData
    }}>
      {children}
    </ParkingContext.Provider>
  );
};

export const useParking = () => useContext(ParkingContext);