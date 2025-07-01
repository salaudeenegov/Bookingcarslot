# ParkingWalla – Restaurant Vehicle Parking Console

![ParkingWalla](https://drive.google.com/uc?export=view&id=1hsPRtBWYT0dpqcgbu5X_DkeZdEP1OyJf)

ParkingWalla is a simple vehicle parking management system built with **React**.  
It is designed to help restaurants or small businesses manage their parking slots, staff, and visitors efficiently.  
All parking and vehicle data are stored locally using IndexedDB.

---

## Project Overview

ParkingWalla supports three user roles: **Admin**, **Employee**, and **User**.  
Each role has clear access and actions, so parking operations run smoothly with real-time logs and daily parking counts.

---

## User Roles

### Admin
- Log in: `admin@gmail.com` / `asdfghjkl;'`
- Add or delete parking slots
- Add employees
- View daily parking analytics (number of cars parked per day)
- View live logs of vehicle entry and exit
- Perform maintenance tasks

### Employee
- Log in: `employee@gmail.com` / `asdfghjkl;'`
- Add walk-in cars
- Mark cars as exited (only employees can do this)

### User
- Register with vehicle number and phone number
- Book an available parking slot
- View parking history
- Check which vehicle is currently parked under their account

---

## Features

- Real-time parking slot grid view (Occupied/Available)
- Prevent double-booking of slots
- Only registered users can book slots
- One active slot per vehicle/user at a time
- Timestamped logs for each vehicle entry and exit
- Admin dashboard for slot management and live logs
- Daily parking usage tracking
- All data stored locally with IndexedDB

---

## Tech Stack

- React for the frontend
- IndexedDB (with idb or Dexie.js) for local data storage
- React Context and useReducer for state management
- React Router for routing
- Tailwind CSS for styling

---

## How to Run

1. Clone this repository and install dependencies:

   ```bash
   npm install

2.Start the app locally:
  ```bash
  npm run dev
```
## Admin Console Screenshots

Here are some screenshots of the ParkingWalla Admin Console:

### Slot Management And Maintaince

![Admin Dashboard](https://drive.google.com/uc?export=view&id=156X-LufT6QQSFdMPdm4EDvRu-aU-POhz)

### User Management

![User Management](https://drive.google.com/uc?export=view&id=1lvr743sEDOUxKVdRNq4kiOqNHaTbvMwA)

### Live Logs View

![Logs View](https://drive.google.com/uc?export=view&id=1np_EB25O-FMmox5ATaTIPSzceLnaQEgf)

### Daily Analytics

![Daily Analytics](https://drive.google.com/uc?export=view&id=1tYhgh5wFn56IReNcFfO8jp1G-ex2lsCR)

## Employee Console Screenshots

Here are some screenshots that show how the employee console works.

### Employee Dashboard
![Employee Dashboard](https://drive.google.com/uc?export=view&id=1TOBbpedxLLQ5Xa8g-pwL-DueFAIYzh8p)

### Walk-In Car Entry
![Walk-In Car Entry](https://drive.google.com/uc?export=view&id=1RnQkev-MVlhzhMeweHEivzdQkbQDfHSs)

### Vehicle Exit Screen
![Vehicle Exit Screen](https://drive.google.com/uc?export=view&id=1IKi4aE_NOfHzLpLaBgy-getF7VBEyje9 )

## User Console Screenshots

Below are some screenshots of the user side.

### User Dashboard
![User Dashboard](https://drive.google.com/uc?export=view&id=1AD9dqODLbt3zCx0koSRbrh6weT7toYrB)




### Add Booking
![Parking History](https://drive.google.com/uc?export=view&id=1fLx9sUMYTBz8g-ozdnzYhvrUjdq8x0Dv)

### Active Parking View
![Active Parking View](https://drive.google.com/uc?export=view&id=1qp0wzIwt9WnjuCym2Zb4YQXYuTr2-c0k)

### Parking History
![User Dashboard](https://drive.google.com/uc?export=view&id=1DAC9XggPgBbnkk0_qk1f4uv4sX1RRelK)

### Profile
![Add Booking Screen](https://drive.google.com/uc?export=view&id=1YzaYQgY9gAlrddaW-VxthVVDs5u4d5CX)

