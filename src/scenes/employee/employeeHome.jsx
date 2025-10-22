import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import SidebarEmployee from "../global/SidebarEmployee";
import TopbarEmployee from "../global/TopbarEmployee";
import './employee.css'

export default function EmployeeHome() {

    return (
    <div>
      <div className='employeeHometopBarDiv'>
        <TopbarEmployee />
      </div>
      <div className='employeeHomesideBarDiv'>
        <SidebarEmployee />
      </div>
      <div className='employeeHomeBoxDiv'>
        <div className="employeeHomecontainer">
        </div>
      </div>
    </div>
  );
}
