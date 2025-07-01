import React, { createContext, useReducer, useEffect, useContext, useCallback } from "react";
import { db } from "../db/db";
import { AuthContext } from "./AuthContext.jsx";
import bcrypt from "bcryptjs";
import { useUserActions } from "./hooks/useUserActions";
import { useAdminActions } from "./hooks/useAdminActions";
import { useEmployeeActions } from "./hooks/useEmployeeActions";

const ParkingContext = createContext();


let isDatabaseInitialized = false;

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

  const initializeDatabase = useCallback(async () => {
  
    if (isDatabaseInitialized) {
      return;
    }

    isDatabaseInitialized = true;
    console.log("Database initialization process started...");

    try {
      if (!db.isOpen()) {
        await db.open();
      }

      const userCount = await db.user.count();

      if (userCount === 0) {
        localStorage.clear();
        console.log("User table is empty, seeding default data...");
        const salt = await bcrypt.genSalt(10);
        const defaultPassword = await bcrypt.hash("asdfghjkl;'", salt);
        
        await db.user.bulkAdd([
          { email: "admin@gmail.com", username: "admin", password: defaultPassword, phone: "111-222-3333", vehicleNumber: "ADMIN", role: "admin" },
          { email: "employee@gmail.com", username: "employee", password: defaultPassword, phone: "444-555-6666", vehicleNumber: "STAFF", role: "employee" },
        ]);
        console.log("Default users added successfully.");
      } else {
        console.log("Database already contains data.");
      }
    } catch (err) {
      console.error("A critical error occurred during database initialization:", err);
      dispatch({ type: "SET_ERROR", payload: "Could not initialize the database." });
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
      console.error("Failed to fetch data:", err);
      dispatch({ type: "SET_ERROR", payload: err.message });
    }
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      await initializeDatabase();
      await fetchData();
    };
    initializeApp();
  }, [initializeDatabase, fetchData]);

  const userActions = useUserActions(user, fetchData);
  const adminActions = useAdminActions(user, fetchData);
  const employeeActions = useEmployeeActions(user, fetchData);
  
  let contextValue = {
    ...state,
    fetchData,
    ...userActions
  };
  if (user?.role === 'admin') {
    contextValue = { ...state, fetchData, ...adminActions };
  } else if (user?.role === 'employee') {
    contextValue = { ...state, fetchData, ...employeeActions };
  }

  return (
    <ParkingContext.Provider value={contextValue}>
      {children}
    </ParkingContext.Provider>
  );
};

export const useParking = () => useContext(ParkingContext);