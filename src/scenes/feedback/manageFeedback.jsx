import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from "axios";
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faEye, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { Button, Modal, Form } from 'react-bootstrap';
import '../classTime/manageclassTime.css';
import Sidebar from "../global/Sidebar";
import SidebarEmployee from "../global/SidebarEmployee";
import Topbar from "../global/Topbar";
import TopbarEmployee from '../global/TopbarEmployee';
import { adminLocalhost } from '../../localhost/adminLocalhost';
import { employeeLocalhost } from '../../localhost/employeeLocalhost';
import Cookies from 'js-cookie';

export default function ManageFeedback() {

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
const [selectedCourseCode, setSelectedCourseCode] = useState('');
const [progCoursesCode, setProgCoursesCode] = useState([]);
const [searchTerm, setSearchTerm] = useState('');
const maxLength = 255;

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
        const response = await axios.get(`${adminLocalhost}/feedback/getFeedbackByName/${Cookies.get("employeeUsername")}`);
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

const deleteContact = (id) => {
    Swal.fire({
        title: 'Are you sure want to delete?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            axios.delete(`${adminLocalhost}/time/deleteTime/${id}`);
            Swal.fire(
                {
                    position: 'top-end',
                    icon: 'success',
                    title: 'Deleted successfully!',
                    showConfirmButton: false,
                    timer: 1500
                }
            ).then(() => {
                loadData(); 
            });
        }
    })
}

const handleSubmit = async (e) => {
    e.preventDefault();

    try {

        const formData = {
            feedbackItem: state.feedbackItem,
            feedbackStatus: state.feedbackStatus,
            feedbackName: Cookies.get("sisUsername") || Cookies.get("employeeUsername"),
            feedbackDate: new Date().toLocaleDateString()
        };

        await axios.post(`${adminLocalhost}/feedback/addFeedback`, formData);
        setState((prevState) => ({
            ...prevState,
            feedbackItem: ""
        }));

        setShow(false);

        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Feedback sent successfully!',
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            loadData();
          });

    } catch (error) {
        console.error('Error occurred while adding feedback:', error);
    }
};

const handleInputChange = (e) => {
    const { name, value } = e.target;
    setState({ ...state, [name]: value });
};

const convertToTimeInputFormat = (time) => {
    if (time.includes(":") && !time.includes("AM") && !time.includes("PM")) {
        // Already in 24-hour format (HH:mm)
        return time;
    }

    const [timePart, period] = time.split(" "); // Split "9:00 AM" into ["9:00", "AM"]
    let [hours, minutes] = timePart.split(":"); // Split "9:00" into ["9", "00"]

    hours = parseInt(hours, 10); // Ensure hours is a number
    if (period === "PM" && hours !== 12) {
        hours += 12; // Convert PM hours to 24-hour format
    }
    if (period === "AM" && hours === 12) {
        hours = 0; // Convert midnight (12 AM) to 00
    }

    return `${String(hours).padStart(2, "0")}:${minutes}`; // Convert hours to a string and pad with zero if needed
};

const handleEditShow = (feedback) => {
    setSelectedFeedback(feedback);
    setShowEditModal(true);
};

const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
        const formData = {
            feedbackItem: selectedFeedback.feedbackItem,
            feedbackStatus: selectedFeedback.feedbackStatus, 
            feedbackName: Cookies.get("sisUsername") || Cookies.get("employeeUsername"),
            feedbackDate: new Date().toLocaleDateString()
        };

        await axios.put(`${adminLocalhost}/feedback/updateFeedback/${selectedFeedback.id}`, formData);

        // Clear the feedback item in state
        setSelectedFeedback((prev) => ({
            ...prev,
            feedbackItem: ""
        }));

        setShowEditModal(false);

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

const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({
        ...prevData,
        [name]: value
    }));
};

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
};

/*const sortedFilteredData = [...data].sort((b, a) => a.classStart.localeCompare(b.classStart)).filter((item) => {
    const roleMatch = item.classStart.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = item.classEnd.toLowerCase().includes(searchTerm.toLowerCase());
    return roleMatch || statusMatch;
  });*/

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
                {/*<div className="d-flex custom-margin">
                    <input
                        type="text"
                        placeholder="Search by Prog/Course/Date"
                        value={searchTerm}
                        onChange={handleSearchInputChange}
                        className="mr-2"
                        style={{width: '180px'}}
                    />
                </div>*/}
                <Button id='btnRefresh' className='btn btn-contact me-2' onClick={() => window.location.reload()}><FontAwesomeIcon icon={faRefresh} /></Button>
                {data3.some(
                    item => item.category === "Manage Feedback" && item.accessType === "Read/Write"
                    ) && (
                    <Button className="btn btn-contact" onClick={handleShow}>
                        <FontAwesomeIcon icon={faPlus} />
                    </Button>
                )}
            </div>

            <table className="styled-table" style={{ width: '100%' }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: "center" }}>No</th>
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
                                <td>{item.feedbackItem}</td>
                                <td>{item.feedbackDate}</td>
                                <td>{item.feedbackStatus}</td>
                                <td>{item.feedbackSolveDate}</td>
                                <td>
                                {data3.some(item => item.category === "Manage Feedback" && item.accessType === "Read/Write") && (
                                    <button
                                        id="btnFontIcon"
                                        className="btn btn-info"
                                        style={{fontSize: "10px"}}
                                        disabled={item.feedbackStatus.toLowerCase() === "solved"}
                                        onClick={() => handleEditShow(item)}
                                    >
                                        <FontAwesomeIcon
                                        icon={
                                            data3.some(
                                            item => item.category === "Manage Feedback" && item.accessType === "Read Only"
                                            )
                                            ? faEye
                                            : faEdit
                                        }
                                        />
                                    </button>
                                )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Add Feedback Modal */}
            <Modal 
                show={show} 
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
                enforceFocus={true}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title style={{ color: '#151632' }}>Add Feedack</Modal.Title>
                </Modal.Header>
                <Modal.Body className="custom-modal-body">
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="feedbackItem">
                            <Form.Label>Feedback:</Form.Label>
                            <Form.Control
                                as="textarea" 
                                rows={4} 
                                name="feedbackItem"
                                placeholder='Please give your feedback/complain/suggestion'
                                value={state.feedbackItem || ""}
                                onChange={handleInputChange}
                            />
                            <small style={{ color: state.feedbackItem.length >= maxLength ? "red" : "black" }}>
                                {state.feedbackItem.length} / {maxLength} characters
                            </small>
                        </Form.Group>

                        <Button type='submit' variant="primary" style={{ float: 'right', width: '15%' }}>Add</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Edit Feedback Modal */}
            <Modal 
                show={showEditModal} 
                onHide={() => setShowEditModal(false)}
                backdrop="static"
                keyboard={false}
                enforceFocus={true}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title style={{ color: '#151632' }}>Edit Feedback</Modal.Title>
                </Modal.Header>
                <Modal.Body className="custom-modal-body">
                    {selectedFeedback && (
                        <Form onSubmit={(e) => handleEditSubmit(e)}>
                            <Form.Group className="mb-3">
                                <Form.Label>Feedback:</Form.Label>
                                <Form.Control
                                    as="textarea" 
                                    rows={4} 
                                    name="feedbackItem"
                                    placeholder="Update your feedback"
                                    value={selectedFeedback.feedbackItem}
                                    onChange={(e) => setSelectedFeedback({ ...selectedFeedback, feedbackItem: e.target.value })}
                                />
                                <small style={{ color: selectedFeedback.feedbackItem.length >= maxLength ? "red" : "black" }}>
                                    {selectedFeedback.feedbackItem.length} / {maxLength} characters
                                </small>
                            </Form.Group>

                            <Button type="submit" variant="primary" style={{ float: 'right' }}>Update</Button>
                        </Form>
                    )}
                </Modal.Body>
            </Modal>

        </div>
      </div>
    </div>
  );
}