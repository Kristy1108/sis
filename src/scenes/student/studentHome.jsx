import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import SidebarStudent from "../global/SidebarStudent";
import TopbarStudent from "../global/TopbarStudent";
import "./studentHome.css";

export default function StudentHome() {

    return (
    <div>
      <div className='studentHometopBarDiv'>
        <TopbarStudent />
      </div>
      <div className='studentHomesideBarDiv'>
        <SidebarStudent />
      </div>
      <div className='studentHomeBoxDiv'>
        <div className="studentHomecontainer">
        </div>
      </div>
    </div>
  );
}
