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
import { studentLocalhost } from '../../localhost/studentLocalhost';

const StudentLogin = () => {

  const [state, setState] = useState({
    studentName: "",
    studentNewStdID: "",
    studentPasswd: "",
    studentRole: "",
  });

  const { studentName, studentNewStdID, studentPasswd, studentRole } = state;

  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const authToken = Cookies.get('studentAuthToken');
    if (authToken) {
      navigate('/studentHome');
    }
  }, [navigate]);

  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 1000 },
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!studentNewStdID || !studentPasswd) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please provide all details'
      });
    } else {
      try {
        const result = await axios.get(`${studentLocalhost}/student/student-info`);

        const resultLoginStatus = await axios.get(`${studentLocalhost}/student/getStudentIDInfo/${studentNewStdID}`)

        const credentialsFound = result.data.find((student) => {
          return student[0] === studentNewStdID && student[1] === studentPasswd;
        });

        if (credentialsFound) 
        {
          const studentData = resultLoginStatus.data[0];

          const { loginStatus, studentStatus } = studentData;

          if (studentStatus === "Active") 
          {
            const authToken = Math.random().toString(36).substr(2);
    
                // Set the token in browser's cookies
                Cookies.set('studentAuthToken', authToken);
                Cookies.set('studentName', credentialsFound[3])
                Cookies.set('studentRole', credentialsFound[2])
                Cookies.set('studentStdID', credentialsFound[0])
                Cookies.set('id', credentialsFound[4])
                Cookies.set('NationalIC', credentialsFound[5])
    
              Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: 'Login Success!',
                showConfirmButton: false,
                timer: 1500
              });
              navigate('/studentHome');
          } 
          else if (studentStatus === "Disabled" || studentStatus === null || studentStatus === undefined || studentStatus === "") 
          {
            Swal.fire({
              position: 'top-end',
              icon: 'info',
              title: 'Your Account is disable. Please contact your administrator',
              showConfirmButton: false,
              timer: 2000
            });
          } 
        }
        else
        {
          Swal.fire({
            icon: 'error',
            title: 'Incorrect Login',
            text: 'Username or password is incorrect'
          });
          return;
        }
      } catch (error) {
        if (error.response) {
          if (error.response.status === 404) {
            Swal.fire({
              icon: 'error',
              title: 'Account Not Found',
              text: 'Student username not found in system'
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
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setState({ ...state, [name]: value });
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <animated.div style={fadeIn}>
      <div className="container">
        {/*Header*/}
        <div className="fixed-header">
          <Link to="/">
            <img src={logo} alt="Company Logo" className="logoLeft" />
          </Link>
          <p>SBIT SCHOOL INFORMATION SYSTEM</p>
          <hr />
        </div>

        <div className="d-flex w-100 justify-content-center align-items-center">
          <div className="bg-white p-3 rounded w-25">
          <h2 style={{ color: 'black', fontSize: '24px', textAlign: 'center', fontWeight: 'bold' }}>Student Login</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="studentNewStdID">
                  <strong style={{ color: 'black', fontSize: '14px' }}>Student ID</strong>
                </label>
                <input
                  type="text"
                  placeholder="Enter Student ID"
                  name="studentNewStdID"
                  className="form-control rounded-0"
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="studentPasswd">
                  <strong style={{ color: 'black', fontSize: '14px' }}>Password</strong>
                </label>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter Password"
                    name="studentPasswd"
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

        {/*Footer*/}
        <div className="fixed-footer">
          <hr />
          <p>Copyright © 2025 SBIT Training Sdn Bhd</p>       
        </div>
      </div>
    </animated.div>
  );
};

export default StudentLogin;