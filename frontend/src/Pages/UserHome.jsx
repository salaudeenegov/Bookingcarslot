// src/pages/UserHome.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useParking } from '../context/ParkingContext';
import { AuthContext } from '../context/AuthContext';
import { FaCar, FaClock } from 'react-icons/fa';

const formatDuration = (milliseconds) => {
    if (milliseconds < 0) milliseconds = 0;
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (num) => num.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

const ParkingTimer = ({ startTime }) => {
    const [elapsedTime, setElapsedTime] = useState('00:00:00');
    useEffect(() => {
        if (!startTime) return;
        const startTimestamp = new Date(startTime).getTime();
        const intervalId = setInterval(() => {
            setElapsedTime(formatDuration(Date.now() - startTimestamp));
        }, 1000);
        return () => clearInterval(intervalId);
    }, [startTime]);
    return <span className="font-mono text-2xl font-bold">{elapsedTime}</span>;
};

const UserHome = () => {
    const { user } = useContext(AuthContext);
     const { getActiveParkingSession, loading } = useParking();
    const [activeSession, setActiveSession] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    console.log(user);

    useEffect(() => {
        if (user?.id) {
            const fetchActiveSession = async () => {
                setIsLoading(true);
                const session = await getActiveParkingSession(user.id);
                setActiveSession(session);
                setIsLoading(false);
            };
            fetchActiveSession();
        } else {
            setIsLoading(false);
        }
    }, [user, getActiveParkingSession]);

    if (loading || isLoading) {
        return <div className="text-center p-8">Loading your dashboard...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome, {user?.username || 'Guest'}!
            </h1>
            
            {activeSession ? (
                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-6 shadow-lg">
                    <h2 className="text-2xl font-semibold text-amber-800 mb-4">Your Active Parking Session</h2>
                    <div className="grid md:grid-cols-3 gap-4 text-center">
                        <div className="bg-white p-4 rounded-md shadow">
                            <h3 className="text-sm font-medium text-gray-500">Slot Number</h3>
                            {/* Access data via the new structure: activeSession.slot */}
                            <p className="text-2xl font-bold text-gray-800">{activeSession.slot.number}</p>
                        </div>
                         <div className="bg-white p-4 rounded-md shadow">
                            <h3 className="text-sm font-medium text-gray-500">Vehicle</h3>
                            <p className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
                                <FaCar /> 
                                {/* Access data via: activeSession.booking */}
                                {activeSession.booking.vehicleNumber}
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-md shadow">
                            <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                            <div className="flex items-center justify-center gap-2 text-amber-600">
                                <FaClock />
                                {/* Access data via: activeSession.log */}
                                <ParkingTimer startTime={activeSession.log.inTime} />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mt-8 text-center bg-gray-50 p-10 rounded-lg">
                    <h2 className="text-xl font-medium text-gray-700">You have no active parking sessions.</h2>
                    <p className="text-gray-500 mt-2">Ready to park your car?</p>
                    <Link 
                        to="/book" 
                        className="mt-6 inline-block bg-amber-500 text-white font-bold py-3 px-8 rounded-md hover:bg-amber-600 transition-colors duration-300"
                    >
                        Book a Parking Slot
                    </Link>
                </div>
            )}
        </div>
    );
};

export default UserHome;