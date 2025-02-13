import React, { useEffect, useState } from 'react';
import axios from 'axios';

function User() {
  const [users, setUsers] = useState([]);  // State to store user data
  const [showModal, setShowModal] = useState(false);  // State to control modal visibility
  const [newUser, setNewUser] = useState({
    Email: '',
    Jelszo: '',
    Telefonszam: '',
    Felhasznalonev: '',
    Csaladnev: '',
    Keresztnev: '',
    Szuletesi_datum: ''
  });  // State to store new user data

  useEffect(() => {
    axios.get('http://localhost:8081/')
      .then((res) => {
        setUsers(res.data);  // Set user data
      })
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser({
      ...newUser,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post('http://localhost:8081/addUser', newUser)
      .then((res) => {
        setUsers([...users, res.data]);  // Add new user to state
        setShowModal(false);  // Close the modal
        setNewUser({
          Email: '',
          Jelszo: '',
          Telefonszam: '',
          Felhasznalonev: '',
          Csaladnev: '',
          Keresztnev: '',
          Szuletesi_datum: ''
        });  // Reset form
      })
      .catch((err) => console.error(err));
  };

  const handleDelete = (id) => {
    axios
      .delete(`http://localhost:8081/deleteUser/${id}`)
      .then((res) => {
        setUsers(users.filter(user => user.Id !== id));  // Remove deleted user from the list
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className='container-fluid bg-primary min-vh-100'>
      <div className='d-flex justify-content-center align-items-center py-5'>
        <div className='w-100 w-md-75 w-lg-50 bg-white rounded shadow-sm p-4'>
          <div className='d-flex justify-content-between align-items-center mb-4'>
            <h2 className='text-primary'>Felhasználók</h2>
            <button
              className='btn btn-success'
              onClick={() => setShowModal(true)}  // Show modal when clicked
            >
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
                <th>Action</th> {/* Added Action column for the delete button */}
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
                      {/* Trash can (kuka) icon to delete the user */}
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(user.Id)}
                      >
                        <i className="fas fa-trash"></i> {/* Trash icon */}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan='9' className='text-center'>
                    Nincsenek adatok
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Table end */}

          {/* Modal start */}
          {showModal && (
            <div
              className='modal fade show'
              style={{ display: 'block' }}
              aria-labelledby='exampleModalLabel'
              aria-hidden='true'
            >
              <div className='modal-dialog'>
                <div className='modal-content'>
                  <div className='modal-header'>
                    <h5 className='modal-title' id='exampleModalLabel'>
                      Add New User
                    </h5>
                    <button
                      type='button'
                      className='btn-close'
                      data-bs-dismiss='modal'
                      aria-label='Close'
                      onClick={() => setShowModal(false)}  // Close the modal
                    ></button>
                  </div>
                  <div className='modal-body'>
                    <form onSubmit={handleSubmit}>
                      <div className='mb-3'>
                        <label htmlFor='Email' className='form-label'>
                          Email
                        </label>
                        <input
                          type='email'
                          className='form-control'
                          id='Email'
                          name='Email'
                          value={newUser.Email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className='mb-3'>
                        <label htmlFor='Jelszo' className='form-label'>
                          Jelszo
                        </label>
                        <input
                          type='password'
                          className='form-control'
                          id='Jelszo'
                          name='Jelszo'
                          value={newUser.Jelszo}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className='mb-3'>
                        <label htmlFor='Telefonszam' className='form-label'>
                          Telefonszam
                        </label>
                        <input
                          type='text'
                          className='form-control'
                          id='Telefonszam'
                          name='Telefonszam'
                          value={newUser.Telefonszam}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className='mb-3'>
                        <label htmlFor='Felhasznalonev' className='form-label'>
                          Felhasznalonev
                        </label>
                        <input
                          type='text'
                          className='form-control'
                          id='Felhasznalonev'
                          name='Felhasznalonev'
                          value={newUser.Felhasznalonev}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className='mb-3'>
                        <label htmlFor='Csaladnev' className='form-label'>
                          Csaladnev
                        </label>
                        <input
                          type='text'
                          className='form-control'
                          id='Csaladnev'
                          name='Csaladnev'
                          value={newUser.Csaladnev}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className='mb-3'>
                        <label htmlFor='Keresztnev' className='form-label'>
                          Keresztnev
                        </label>
                        <input
                          type='text'
                          className='form-control'
                          id='Keresztnev'
                          name='Keresztnev'
                          value={newUser.Keresztnev}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className='mb-3'>
                        <label htmlFor='Szuletesi_datum' className='form-label'>
                          Szuletesi_datum
                        </label>
                        <input
                          type='date'
                          className='form-control'
                          id='Szuletesi_datum'
                          name='Szuletesi_datum'
                          value={newUser.Szuletesi_datum}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className='modal-footer'>
                        <button
                          type='button'
                          className='btn btn-secondary'
                          data-bs-dismiss='modal'
                          onClick={() => setShowModal(false)}  // Close the modal
                        >
                          Close
                        </button>
                        <button type='submit' className='btn btn-primary'>
                          Add User
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
