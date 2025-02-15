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
    axios.get('http://localhost:8081/')
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
      // Update existing user
      axios.put(`http://localhost:8081/updateUser/${selectedUserId}`, userData)
        .then(() => {
          setUsers(users.map(user => user.Id === selectedUserId ? { ...user, ...userData } : user));
          setShowModal(false);
          setIsEditing(false);
        })
        .catch((err) => console.error(err));
    } else {
      // Add new user
      axios.post('http://localhost:8081/addUser', userData)
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
    axios.delete(`http://localhost:8081/deleteUser/${id}`)
      .then(() => {
        setUsers(users.filter(user => user.Id !== id));
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className='container-fluid bg-primary min-vh-100'>
      <div className='d-flex justify-content-center align-items-center py-5'>
        <div className='w-100 w-md-75 w-lg-50 bg-white rounded shadow-sm p-4'>
          <div className='d-flex justify-content-between align-items-center mb-4'>
            <h2 className='text-primary'>Felhasználók</h2>
            <button className='btn btn-success' onClick={() => { setShowModal(true); setIsEditing(false); }}>
              Add +
            </button>
          </div>

          {/* Table start */}
          <table className='table table-striped table-hover'>
            <thead className='table-dark'>
              <tr>
                <th>Id</th>
                <th>Email</th>
                <th>Jelszo</th>
                <th>Telefonszam</th>
                <th>Felhasznalonev</th>
                <th>Csaladnev</th>
                <th>Keresztnev</th>
                <th>Szuletesi_datum</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.Id}>
                    <td>{user.Id}</td>
                    <td>{user.Email}</td>
                    <td>{user.Jelszo}</td>
                    <td>{user.Telefonszam}</td>
                    <td>{user.Felhasznalonev}</td>
                    <td>{user.Csaladnev}</td>
                    <td>{user.Keresztnev}</td>
                    <td>{user.Szuletesi_datum}</td>
                    <td>
                      <button className="btn btn-success btn-sm me-2" onClick={() => handleEdit(user)}>
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user.Id)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan='9' className='text-center'>Nincsenek adatok</td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Table end */}

          {/* Modal start */}
          {showModal && (
            <div className='modal fade show' style={{ display: 'block' }}>
              <div className='modal-dialog'>
                <div className='modal-content'>
                  <div className='modal-header'>
                    <h5 className='modal-title'>{isEditing ? 'Edit User' : 'Add New User'}</h5>
                    <button type='button' className='btn-close' onClick={() => setShowModal(false)}></button>
                  </div>
                  <div className='modal-body'>
                    <form onSubmit={handleSubmit}>
                      {Object.keys(userData).map((key) => (
                        <div className='mb-3' key={key}>
                          <label htmlFor={key} className='form-label'>{key}</label>
                          <input
                            type={key === 'Szuletesi_datum' ? 'date' : key === 'Jelszo' ? 'password' : 'text'}
                            className='form-control'
                            id={key}
                            name={key}
                            value={userData[key]}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      ))}
                      <div className='modal-footer'>
                        <button type='button' className='btn btn-secondary' onClick={() => setShowModal(false)}>
                          Close
                        </button>
                        <button type='submit' className='btn btn-primary'>
                          {isEditing ? 'Update User' : 'Add User'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Modal end */}
        </div>
      </div>
    </div>
  );
}

export default User;
