import React, { createContext, useReducer, useEffect, useContext, useCallback } from "react";
import { db } from "../db/db";
import { AuthContext } from "./AuthContext.jsx";
import bcrypt from "bcryptjs";
import { useUserActions } from "./hooks/useUserActions";
import { useAdminActions } from "./hooks/useAdminActions";

const ParkingContext = createContext();

const initialState = {
  slots: [],
  users: [],
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
      return { ...state, loading: false, error: null, ...action.payload };
    default:
      return state;
  }
}

export const ParkingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(parkingReducer, initialState);
  const { user } = useContext(AuthContext);

  const initializeDefaultUsers = useCallback(async () => {
    try {
      const usersExist = await db.user.count();
      if (usersExist === 0) {
        const salt = await bcrypt.genSalt(10);
        const hashedpassword = await bcrypt.hash("asdfghjkl;'", salt);
        
        await db.user.bulkAdd([
          { email: "admin@gmail.com", username: "admin", password: hashedpassword, phone: "111-222-3333", vehicleNumber: "ADMIN", role: "admin" },
          { email: "employee@gmail.com", username: "employee", password: hashedpassword, phone: "444-555-6666", vehicleNumber: "STAFF", role: "employee" },
        ]);
      }
    } catch (err) {
      console.error("Failed to initialize default users:", err);
    }
  }, []);

  const fetchData = useCallback(async () => {
    dispatch({ type: "SET_LOADING" });
    try {
      const [slots, bookings, logs, users] = await Promise.all([
        db.slot.toArray(),
        db.bookings.toArray(),
        db.logs.orderBy("inTime").reverse().toArray(),
        db.user.toArray(), 
      ]);
      dispatch({ type: "SET_DATA", payload: { slots, bookings, logs, users } });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: err.message });
    }
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      await initializeDefaultUsers();
      await fetchData();
    };
    initializeApp();
  }, [initializeDefaultUsers, fetchData]);

  // Instantiate the modular action hooks
  const userActions = useUserActions(user, fetchData);
  const adminActions = useAdminActions(user, fetchData);
  
  const contextValue = {
    ...state,      
    fetchData,    
    ...userActions,
    ...adminActions 
  };

  return (
    <ParkingContext.Provider value={contextValue}>
      {children}
    </ParkingContext.Provider>
  );
};

export const useParking = () => useContext(ParkingContext);