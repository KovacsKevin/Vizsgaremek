import React, { useEffect, useState } from 'react';
import axios from 'axios';

function User() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userData, setUserData] = useState({
    Email: '',
    Jelszo: '',
    Telefonszam: '',
    Felhasznalonev: '',
    Csaladnev: '',
    Keresztnev: '',
    Szuletesi_datum: ''
  });

  useEffect(() => {
    axios.get('http://localhost:8081/api/v1/getUser')
      .then((res) => setUsers(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      axios.put(`http://localhost:8081/api/v1/updateUser/${selectedUserId}`, userData)
        .then(() => {
          setUsers(users.map(user => user.Id === selectedUserId ? { ...user, ...userData } : user));
          setShowModal(false);
          setIsEditing(false);
        })
        .catch((err) => console.error(err));
    } else {
      axios.post('http://localhost:8081/api/v1/addUser', userData)
        .then((res) => {
          setUsers([...users, res.data]);
          setShowModal(false);
        })
        .catch((err) => console.error(err));
    }

    setUserData({
      Email: '',
      Jelszo: '',
      Telefonszam: '',
      Felhasznalonev: '',
      Csaladnev: '',
      Keresztnev: '',
      Szuletesi_datum: ''
    });
  };

  const handleEdit = (user) => {
    setUserData(user);
    setSelectedUserId(user.Id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:8081/api/v1/deleteUser/${id}`)
      .then(() => {
        setUsers(users.filter(user => user.Id !== id));
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className='min-h-screen bg-blue-500 flex justify-center items-center p-5'>
      <div className='w-full max-w-4xl bg-white rounded-lg shadow-lg p-6'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold text-blue-600'>Felhasználók</h2>
          <button 
            className='bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md'
            onClick={() => { setShowModal(true); setIsEditing(false); }}>
            Add +
          </button>
        </div>

        
        <div className="overflow-x-auto">
          <table className='min-w-full border border-gray-300'>
            <thead className='bg-gray-800 text-white'>
              <tr>
                <th className='p-2 border'>Id</th>
                <th className='p-2 border'>Email</th>
                <th className='p-2 border'>Jelszo</th>
                <th className='p-2 border'>Telefonszam</th>
                <th className='p-2 border'>Felhasznalonev</th>
                <th className='p-2 border'>Csaladnev</th>
                <th className='p-2 border'>Keresztnev</th>
                <th className='p-2 border'>Szuletesi_datum</th>
                <th className='p-2 border'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.Id} className="text-center">
                    <td className='p-2 border'>{user.Id}</td>
                    <td className='p-2 border'>{user.Email}</td>
                    <td className='p-2 border'>{user.Jelszo}</td>
                    <td className='p-2 border'>{user.Telefonszam}</td>
                    <td className='p-2 border'>{user.Felhasznalonev}</td>
                    <td className='p-2 border'>{user.Csaladnev}</td>
                    <td className='p-2 border'>{user.Keresztnev}</td>
                    <td className='p-2 border'>{user.Szuletesi_datum}</td>
                    <td className='p-2 border'>
                      <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded mr-2"
                        onClick={() => handleEdit(user)}>
                        ✏️
                      </button>
                      <button className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                        onClick={() => handleDelete(user.Id)}>
                        🗑
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan='9' className='text-center p-4 text-gray-500'>Nincsenek adatok</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        

        
        {showModal && (
          <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
            <div className='bg-white p-6 rounded-lg shadow-lg w-96'>
              <div className='flex justify-between items-center mb-4'>
                <h5 className='text-xl font-bold'>{isEditing ? 'Edit User' : 'Add New User'}</h5>
                <button className='text-gray-500' onClick={() => setShowModal(false)}>✖</button>
              </div>
              <form onSubmit={handleSubmit}>
                {Object.keys(userData).map((key) => (
                  <div className='mb-3' key={key}>
                    <label htmlFor={key} className='block text-gray-700'>{key}</label>
                    <input
                      type={key === 'Szuletesi_datum' ? 'date' : key === 'Jelszo' ? 'password' : 'text'}
                      className='w-full p-2 border rounded'
                      id={key}
                      name={key}
                      value={userData[key]}
                      onChange={handleChange}
                      required
                    />
                  </div>
                ))}
                <div className='flex justify-end gap-2'>
                  <button type='button' className='bg-gray-400 text-white px-4 py-2 rounded' onClick={() => setShowModal(false)}>
                    Close
                  </button>
                  <button type='submit' className='bg-blue-500 text-white px-4 py-2 rounded'>
                    {isEditing ? 'Update User' : 'Add User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}

export default User;
