import React,{ useState } from "react";
import Swal from 'sweetalert2';

const UserFormModal = ({ userToEdit, onSave, onCancel }) => {
  const isEditing = !!userToEdit;
  const [formData, setFormData] = useState({
    username: userToEdit?.username || '',
    email: userToEdit?.email || '',
    password: '', 
    phone: userToEdit?.phone || '',
    role: userToEdit?.role || 'user',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isEditing && !formData.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Password',
        text: 'Password is required for new users.'
      });
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Edit User' : 'Add New User'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Username" className="w-full p-2 border rounded" required />
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full p-2 border rounded" required />
          {!isEditing && (
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" className="w-full p-2 border rounded" required />
          )}
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" className="w-full p-2 border rounded" />
          
          <select name="role" value={formData.role} onChange={handleChange} className="w-full p-2 border rounded">
            <option value="user">User</option>
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
              Save User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default UserFormModal;
