import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';  
import SchoolImage from '../../images/school.png'; 
import EmployeeImage from '../../images/teacher.png'; 
import StudentImage from '../../images/student.png';
import './MainHome.css';
import logo from '../../images/logo.png';
import { useSpring, animated } from 'react-spring';

export default function Home() {
  const navigate = useNavigate();

  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 1000 },
  });

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
        
        {/*Body*/}
        <div className="fixed-body">
          {/*First Row*/}
          <div className="row">
            <div className="column">
              <Link to="/schoolLogin" className="image-link">
                <div className="fixed-body">
                  <img src={SchoolImage} alt="School" />
                  <p>Admin</p>
                </div>
              </Link>
            </div>

            <div className="column">
              <Link to="/employeeLogin" className="image-link">
                <div className="fixed-body">
                  <img src={EmployeeImage} alt="Employee" />
                  <p>Employee</p>
                </div>
              </Link>
            </div>

            <div className="column">
              <Link to="/studentLogin" className="image-link">
                <div className="fixed-body">
                  <img src={StudentImage} alt="Student" />
                  <p>Student</p>
                </div>
              </Link>
            </div>
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
}