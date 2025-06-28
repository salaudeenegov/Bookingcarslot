import React, { useState } from 'react';
import { useParking } from '../../context/ParkingContext'; 
import UserFormModal from "./components/UserFormModal"



const UserManagement = () => {
  const { users, addUser, updateUser, deleteUser, loading, error } = useParking();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const handleAddNew = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to permanently delete this user?')) {
      try {
        await deleteUser(userId);
      } catch (err) {
        alert(err.message); // Display error from the hook
      }
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, userData);
      } else {
        await addUser(userData);
      }
      setIsModalOpen(false);
      setEditingUser(null);
    } catch (err) {
      alert(`Operation failed: ${err.message}`);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading user data...</div>;
  if (error) return <div className="p-6 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <button onClick={handleAddNew} className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75">
            + Add User
          </button>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'employee' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                      <button onClick={() => handleEdit(user)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                      <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {isModalOpen && <UserFormModal userToEdit={editingUser} onSave={handleSaveUser} onCancel={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default UserManagement;