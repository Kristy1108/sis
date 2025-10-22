import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from "axios";
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRefresh, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { Button } from 'react-bootstrap';
import '../classTime/manageclassTime.css';
import Sidebar from "../global/Sidebar";
import SidebarEmployee from "../global/SidebarEmployee";
import Topbar from "../global/Topbar";
import TopbarEmployee from '../global/TopbarEmployee';
import { adminLocalhost } from '../../localhost/adminLocalhost';
import { employeeLocalhost } from '../../localhost/employeeLocalhost';
import Cookies from 'js-cookie';

export default function ManageAdminFeedback() {

  const [state, setState] = useState({
    feedbackItem: "",
    feedbackStatus: "Pending",
    feedbackName: "",
    feedbackDate: "",
    feedbackDateSolved: ""
});

const [data, setData] = useState([]);
const [data3, setData3] = useState([]);
const [show, setShow] = useState(false);
const [editData, setEditData] = useState(null);
const [editShow, setEditShow] = useState(false);
const [showEditModal, setShowEditModal] = useState(false);
const [selectedFeedback, setSelectedFeedback] = useState(null);
const handleClose = () => setShow(false);
const handleShow = () => setShow(true);
const handleEditClose = () => setEditShow(false);
const [progCoursesCode, setProgCoursesCode] = useState([]);


const loadData3 = async () => {
    try {
      const username = Cookies.get("sisUsername") || Cookies.get("employeeUsername");
  
      if (!username) {
        console.error("No username found in cookies.");
        return; // Exit if no valid cookie is found
      }
  
      const response = await axios.get(`${employeeLocalhost}/employeeGroup/getAccessTypeAndCategory/${username}`);
      setData3(response.data);
    } catch (error) {
      console.error("Error occurred while fetching access details:", error);
    }
  }; 

  useEffect(() => {
    loadData3();
  }, []);

const loadData = async () => {
    try {
        const response = await axios.get(`${adminLocalhost}/feedback/getFeedbackDetails`);
        setData(response.data);
    } catch (error) {
        console.error('Error occurred while fetching time details:', error);
    }
};

useEffect(() => {
    loadData();
}, []);

{/* List down all Course Codes */}
useEffect(() => {
    if (state.TimeProg || (editData && editData.TimeProg)) {
        const program = state.TimeProg || editData.TimeProg;
        axios.get(`${adminLocalhost}/course/getCourseCode/${program}`)
            .then(response => {
                setProgCoursesCode(response.data);
            })
            .catch(error => {
                console.error('Error fetching course code:', error);
            });
    }
}, [state.TimeProg, editData]);

const updateStatus = async (item) => {

    try {
        const formData = {
            feedbackItem: item.feedbackItem,
            feedbackStatus: "solved", 
            feedbackName: item.feedbackName,
            feedbackDate: item.feedbackDate,
            feedbackSolveDate: new Date().toLocaleDateString()
        };

        await axios.put(`${adminLocalhost}/feedback/updateFeedback/${item.id}`, formData);

        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Feedback updated successfully!',
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            loadData();
        });

    } catch (error) {
        console.error('Error occurred while updating feedback:', error);
    }
};

  return (
    <div>
        <div className='manageClassTimetopBarDiv'>
            {Cookies.get("sisUsername") ? (
                <Topbar />
            ) : Cookies.get("employeeUsername") ? (
                <TopbarEmployee />
            ) : null}
        </div>
        <div className='manageClassTimeSideBarDiv'>
            {Cookies.get("sisUsername") ? (
                <Sidebar />
            ) : Cookies.get("employeeUsername") ? (
                <SidebarEmployee />
            ) : null}
        </div>
      <div className='manageClassTimeBoxDiv'>
        <div className="manageClassTimecontainer">
            <div className="manageClassTimediv1">
                <h2 className="fs-2 m-0">FEEDBACK INFO</h2>
            </div>
            <div className="manageClassTimediv2 d-flex justify-content-between align-items-center">
                <Button id='btnRefresh' className='btn btn-contact me-2' onClick={() => window.location.reload()}><FontAwesomeIcon icon={faRefresh} /></Button>
            </div>

            <table className="styled-table" style={{ width: '100%' }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: "center" }}>No</th>
                        <th style={{ textAlign: "center" }}>Teacher</th>
                        <th style={{ textAlign: "center" }}>Item</th>
                        <th style={{ textAlign: "center" }}>Date</th>
                        <th style={{ textAlign: "center" }}>Status</th>
                        <th style={{ textAlign: "center" }}>Date Solved</th>
                        <th style={{ textAlign: "center" }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => {
                        return (
                            <tr key={item.id}>
                                <td scope="row">{index + 1}</td>
                                <td>{item.feedbackName}</td>
                                <td>{item.feedbackItem}</td>
                                <td>{item.feedbackDate}</td>
                                <td>{item.feedbackStatus}</td>
                                <td>{item.feedbackSolveDate}</td>
                                <td>
                                    <button
                                        id="btnFontIcon"
                                        className="btn btn-info"
                                        style={{fontSize: "10px"}}
                                        onClick={() => updateStatus(item)}
                                        disabled={item.feedbackStatus.toLowerCase() === "solved"}
                                    >
                                        <FontAwesomeIcon icon={faThumbsUp} />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

        </div>
      </div>
    </div>
  );
}