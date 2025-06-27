import React, { useEffect, useState, useMemo } from 'react';
import { useParking } from '../../context/ParkingContext';
import { FaHistory, FaSearch, FaSpinner, FaArrowUp, FaArrowDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const AdminLogs = () => {
  const { getAllLogsDetailed } = useParking();
  

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'inTime', direction: 'descending' });
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

  // Data Fetching
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const res = await getAllLogsDetailed();
      if (res.success) {
        setLogs(res.logs);
      } else {
        setError(res.error);
      }
      setLoading(false);
    };

    fetchLogs();
  }, [getAllLogsDetailed]);


  const processedLogs = useMemo(() => {
    let filteredLogs = [...logs];


    if (searchTerm) {
      filteredLogs = filteredLogs.filter(log =>
        Object.values(log).some(value => {
            if (typeof value === 'string') {
                return value.toLowerCase().includes(searchTerm.toLowerCase());
            }
            if (typeof value === 'object' && value !== null && value.username) {
                 return value.username.toLowerCase().includes(searchTerm.toLowerCase()) || value.phone.toLowerCase().includes(searchTerm.toLowerCase());
            }
            return false;
        })
      );
    }


    if (sortConfig.key) {
      filteredLogs.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        
        if (sortConfig.key === 'inTime' || sortConfig.key === 'outTime') {
            const dateA = valA ? new Date(valA).getTime() : 0;
            const dateB = valB ? new Date(valB).getTime() : 0;
            if (dateA < dateB) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (dateA > dateB) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        } else {
            if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        }
      });
    }

    return filteredLogs;
  }, [logs, searchTerm, sortConfig]);
  

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = processedLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(processedLogs.length / logsPerPage);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const SortableHeader = ({ tkey, title }) => (
    <th className="p-4 text-sm font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => requestSort(tkey)}>
        <div className="flex items-center justify-between">
          {title}
          {sortConfig.key === tkey && (
            <span>
              {sortConfig.direction === 'ascending' ? <FaArrowUp className="text-gray-500" /> : <FaArrowDown className="text-gray-500" />}
            </span>
          )}
        </div>
    </th>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-amber-500" />
        <p className="ml-4 text-lg">Loading Log History...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center border-b pb-4 mb-6">
            <div className="flex items-center gap-3">
                <FaHistory className="text-3xl text-gray-700" />
                <h1 className="text-3xl font-bold text-gray-800">Parking Log History</h1>
            </div>
            <div className="relative mt-4 md:mt-0">
                <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
            </div>
        </div>

        {error && <div className="text-center p-4 bg-red-100 text-red-600 rounded-md">{error}</div>}

        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead className="bg-gray-100">
              <tr>
                <SortableHeader tkey="slotNumber" title="Slot" />
                <SortableHeader tkey="vehicleNumber" title="Vehicle" />
                <th className="p-4 text-sm font-semibold text-gray-600 uppercase">User</th>
                <th className="p-4 text-sm font-semibold text-gray-600 uppercase">Phone</th>
                <SortableHeader tkey="inTime" title="In Time" />
                <SortableHeader tkey="outTime" title="Out Time" />
              </tr>
            </thead>
            <tbody>
              {currentLogs.length > 0 ? (
                currentLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{log.slotNumber}</td>
                    <td className="py-3 px-4 text-gray-600">{log.vehicleNumber}</td>
                    <td className="py-3 px-4 text-gray-600">{log.user?.username || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-600">{log.user?.phone || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{new Date(log.inTime).toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm">
                      {log.outTime ? (
                         <span className="text-gray-600">{new Date(log.outTime).toLocaleString()}</span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-bold text-green-800 bg-green-100 rounded-full">Still Parked</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center p-8 text-gray-500">
                    {searchTerm ? "No results found for your search." : "No logs available."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      
        {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
                <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                    <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
                        <FaChevronLeft />
                    </button>
                    <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
                        <FaChevronRight />
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogs;