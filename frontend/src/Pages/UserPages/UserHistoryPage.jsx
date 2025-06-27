import React, { useState, useEffect, useContext } from 'react';
import { useParking } from '../../context/ParkingContext';
import { AuthContext } from '../../context/AuthContext';
import { db } from '../../db/db'; 
import { FiClock, FiCalendar, FiHash, FiCheckCircle, FiXCircle, FiAlertCircle, FiPower } from 'react-icons/fi';
import { FaParking } from 'react-icons/fa';


const StatusBadge = ({ status }) => {
    const statusStyles = {
        pending: { icon: <FiClock />, text: 'Pending', color: 'yellow' },
        active: { icon: <FaParking />, text: 'Active', color: 'blue' },
        completed: { icon: <FiCheckCircle />, text: 'Completed', color: 'green' },
        cancelled: { icon: <FiXCircle />, text: 'Cancelled', color: 'gray' },
        expired: { icon: <FiPower />, text: 'Expired', color: 'red' },
    };

    const style = statusStyles[status] || { icon: <FiAlertCircle />, text: 'Unknown', color: 'gray' };

    const colorClasses = {
        yellow: 'bg-yellow-100 text-yellow-800',
        blue: 'bg-blue-100 text-blue-800',
        green: 'bg-green-100 text-green-800',
        gray: 'bg-gray-100 text-gray-800',
        red: 'bg-red-100 text-red-800',
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[style.color]}`}>
            {style.icon}
            <span className="ml-1.5">{style.text}</span>
        </span>
    );
};

const UserHistoryPage = () => {
    const { user } = useContext(AuthContext);
    const { getBookingsForUser, loading: contextLoading } = useParking();
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            const fetchHistory = async () => {
                setIsLoading(true);
                const userBookings = await getBookingsForUser(user.id);
                
                // Enrich booking data with slot and log details
                const detailedHistory = await Promise.all(
                    userBookings.map(async (booking) => {
                        const slot = await db.slot.get(booking.slotId);
                        const log = await db.logs.where('bookingId').equals(booking.id).first();
                        return { booking, slot, log: log || null }; 
                    })
                );

              
                detailedHistory.sort((a, b) => new Date(b.booking.startTime) - new Date(a.booking.startTime));
                setHistory(detailedHistory);
                setIsLoading(false);
            };
            fetchHistory();
        }
    }, [user, getBookingsForUser]);

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleString(undefined, options);
    };
    
    const formatDuration = (milliseconds) => {
        if (!milliseconds || milliseconds < 0) return '—';
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
    };

    const calculateDuration = (inTime, outTime) => {
        if (!inTime || !outTime) return null;
        return new Date(outTime) - new Date(inTime);
    };

    if (isLoading || (contextLoading && history.length === 0)) {
         return (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mb-4"></div>
                <p className="text-gray-600">Loading your booking history...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">My Bookings & History</h1>

            {history.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slot</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Time</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual Entry</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual Exit</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {history.map((item) => (
                                    <tr key={item.booking.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                                                    <span className="text-amber-800 font-medium">{item.slot?.number || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.booking.vehicleNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.booking.startTime)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={item.booking.status} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.log?.inTime)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.log?.outTime)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatDuration(calculateDuration(item.log?.inTime, item.log?.outTime))}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center bg-white p-12 rounded-xl shadow-sm border border-gray-200">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                        <FaParking className="h-6 w-6 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-medium text-gray-800">No Bookings Found</h2>
                    <p className="text-gray-500 mt-2 max-w-md mx-auto">You haven't booked any slots yet. Your future and past bookings will appear here.</p>
                </div>
            )}
        </div>
    );
};

export default UserHistoryPage;