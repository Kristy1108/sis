import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import Swal from 'sweetalert2';
import logo from '../../images/logo.png';
import { useSpring, animated } from 'react-spring';
import Cookies from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeSlash, faEye } from '@fortawesome/free-solid-svg-icons';
import { adminLocalhost } from '../../localhost/adminLocalhost';
import { employeeLocalhost } from '../../localhost/employeeLocalhost';
import { studentLocalhost } from '../../localhost/studentLocalhost';

const SchoolLogin = () => {

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const authToken = Cookies.get('schoolAuthToken');
    if (authToken) {
      navigate('/schoolHome');
    }
  }, [navigate]);

  const [state, setState] = useState({
    adminUsername: "",
    adminPasswd: ""
  });

  const { adminUsername, adminPasswd } = state;

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 1000 },
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!adminUsername || !adminPasswd) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please provide all details'
      });
      return;
    }
  
    try {
      if (Cookies.get('employeeUsername')) {
        Swal.fire({
          icon: 'error',
          title: 'Account Conflict',
          text: 'This browser is already associated with an employee account. Please use a different browser for another account.'
        });
        return;
      }
  
      const getAccountInfo = await axios.get(`${adminLocalhost}/admin/getAdminDetails/${adminUsername}`);
  
      const response = await axios.post(`${adminLocalhost}/admin/login`, {
        adminUsername,
        adminPassword: adminPasswd
      });
  
      if (response.status === 200) {
        const authToken = Math.random().toString(36).substr(2);
        const result = await axios.get(`${adminLocalhost}/admin/admin-info/${adminUsername}`);
  
        Cookies.set('sisAuthToken', authToken);
        Cookies.set('sisUsername', adminUsername);
        Cookies.set('sisJobTitle', result.data[0][4]);
        Cookies.set('sisRole', result.data[0][3]);
  
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Login Success!',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          window.location.reload();
        });
  
        navigate('/schoolHome');
      }
  
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          Swal.fire({
            icon: 'error',
            title: 'Account Not Found',
            text: 'Admin username not found in system'
          });
        } else if (error.response.status === 401 || error.response.status === 400) {
          Swal.fire({
            icon: 'error',
            title: 'Incorrect Login',
            text: 'Username or password is incorrect'
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Server Error',
            text: 'An unexpected error occurred. Please try again.'
          });
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Backend server offline!'
        });
      }
    }
  };      

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setState({ ...state, [name]: value });
  };

  return (
    <animated.div style={fadeIn}>
      <div className="container">
        {/* Header */}
        <div className="fixed-header">
          <Link to="/">
            <img src={logo} alt="Company Logo" className="logoLeft" />
          </Link>
          <p>SBIT SCHOOL INFORMATION SYSTEM</p>
          <hr />
        </div>

        <div className="d-flex w-100 justify-content-center align-items-center">
          <div className="bg-white p-3 rounded w-25">
            <h2 style={{ color: 'black', fontSize: '24px', textAlign: 'center', fontWeight: 'bold' }}>Admin Login</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="adminUsername">
                  <strong style={{ color: 'black', fontSize: '14px' }}>Username</strong>
                </label>
                <input
                  type="text"
                  placeholder="Enter Username"
                  name="adminUsername"
                  className="form-control rounded-0"
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="adminPasswd">
                  <strong style={{ color: 'black', fontSize: '14px' }}>Password</strong>
                </label>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter Password"
                    name="adminPasswd"
                    className="form-control rounded-0"
                    onChange={handleInputChange}
                  />
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={handleTogglePassword}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-success w-100 rounded-10">
                Login
              </button>
              <br />
              <br />
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="fixed-footer">
          <hr />
          <p>Copyright © 2025 SBIT Training Sdn Bhd</p>
        </div>
      </div>
    </animated.div>
  );
};

export default SchoolLogin;