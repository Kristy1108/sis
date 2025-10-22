import React, { useState, useEffect } from 'react';
import axios from "axios";
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faRefresh, faCaretDown, faCheck, faTimes, faEye} from '@fortawesome/free-solid-svg-icons';
import { Button, Modal, Form, Table } from 'react-bootstrap';
import SidebarStudent from "../global/SidebarStudent";
import TopbarStudent from '../global/TopbarStudent';
import Cookies from 'js-cookie';
import { adminLocalhost } from '../../localhost/adminLocalhost';
import { employeeLocalhost } from '../../localhost/employeeLocalhost';
import { studentLocalhost } from '../../localhost/studentLocalhost';
import { eventTupleToStore } from '@fullcalendar/core/internal';

export default function StudentLeave() {

  const [state, setState] = useState({
    leaveIntake: "",
    leaveCourse: "",
    leaveName: "",
    leaveNoOfDay: "",
    leaveStartDay: "",
    leaveEndDay: "",
    leaveTypeOfLeave: "",
    leaveReasonForLeave: ""
});

let buttonClass, icon;

const { leaveIntake, leaveCourse, leaveName, leaveNoOfDay, leaveStartDay, leaveEndDay, 
    leaveTypeOfLeave, leaveReasonForLeave } = state;

const [data, setData] = useState([]);
const [data1, setData1] = useState([]);
const [show, setShow] = useState(false);
const [editData, setEditData] = useState(null);
const [editShow, setEditShow] = useState(false);

const handleClose = () => setShow(false);
const handleShow = () => setShow(true);
const handleEditClose = () => setEditShow(false);

const [selectedCourse, setSelectedCourse] = useState('');
const [selectedTypeOfLeave, setSelectedTypeOfLeave] = useState('');
const [selectedNoOfDay, setSelectedNoOfDay] = useState('');

const [searchTerm, setSearchTerm] = useState('');

const loadData = async () => {
    try {
        const response = await axios.get(`${studentLocalhost}/studentLeave/getStudentLeaveDetails`);
        if (!Array.isArray(response.data)) {
            setData([response.data]);
        } else {
            setData(response.data);
        }

    } catch (error) {
        console.error('Error occurred while fetching profile details:', error);
    }
};

useEffect(() => {
    loadData();
}, []);

const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
};

/*const filteredData = data.filter((item) => {
    const roleMatch = item.attendanceCourse.toLowerCase().includes(searchTerm.toLowerCase());
    //const statusMatch = item.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    return roleMatch;
  });*/

useEffect(() => {
    if (state.leaveStartDay && state.leaveEndDay) {
        const startDate = new Date(state.leaveStartDay);
        const endDate = new Date(state.leaveEndDay);
        const oneDay = 24 * 60 * 60 * 1000; // Hours * Minutes * Seconds * Milliseconds
        const diffDays = Math.round(Math.abs((endDate - startDate) / oneDay)) + 1; // Add 1 to include both start and end dates
        setSelectedNoOfDay(diffDays);
        setState(prevState => ({ ...prevState, leaveNoOfDay: diffDays.toString() }));
    }
}, [state.leaveStartDay, state.leaveEndDay]);

const getAttendanceData = async (program, intake) => {
    try {
        const response = await axios.get(`${employeeLocalhost}/attendance/getAttendanceDetails/${program}/${intake}`);
        return response.data;
    } catch (error) {
        console.error('Error occurred while fetching attendance details:', error);
        return []; // Return an empty array in case of error
    }
};

useEffect(() => {
    const fetchData = async () => {
        try {
            const response1 = await axios.get(`${studentLocalhost}/student/getStudentByID/${Cookies.get('id')}`);
            if (!Array.isArray(response1.data)) {
                setData1([response1.data]);
            } else {
                setData1(response1.data);
            }
    
            if (data1.length > 0) {
                const studentProgram = data1[0].studentProgram;
                const studentIntake = data1[0].studentIntake;
                const attendanceData = await getAttendanceData(studentProgram, studentIntake);
                setSelectedCourse(attendanceData[0].attendanceCourse);
            }
        } catch (error) {
            console.error('Error occurred while fetching data:', error);
            // Handle error gracefully (e.g., show error message to the user)
        }
    };

    fetchData();
}, [data1]); // Ensure useEffect runs whenever data1 changes

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
            axios.delete(`${studentLocalhost}/studentLeave/deleteStudentLeave/${id}`);
            Swal.fire(
                {
                    position: 'top-end',
                    icon: 'success',
                    title: 'Deleted successfully!',
                    showConfirmButton: false,
                    timer: 1500
                }
            ).then(() => {
                loadData(); // Reload the data after successful deletion
            });
        }
    })
}

const handleSubmit = async (e) => {
    e.preventDefault();
    /*console.log(state.leaveStartDay);
    console.log(state.leaveEndDay);
    console.log(selectedNoOfDay);
    console.log(selectedTypeOfLeave.leaveTypeOfLeave);
    console.log(data1[0].studentIntake);
    console.log(selectedCourse);
    console.log(state.leaveReasonForLeave);*/

    if (!leaveStartDay || !leaveEndDay || !selectedNoOfDay || !selectedTypeOfLeave.leaveTypeOfLeave || !leaveReasonForLeave) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please provide all details'
        });
        return;
    }

    try {
        await axios.post(`${studentLocalhost}/studentLeave/addStudentLeave`, {
            ...state,
            leaveIntake: data1[0].studentIntake,
            leaveCourse: selectedCourse,
            leaveName: Cookies.get('studentName'),
            leaveNoOfDay: selectedNoOfDay,
            leaveTypeOfLeave: selectedTypeOfLeave.leaveTypeOfLeave
        });
        
        setShow(false);

        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Leave Application send to teacher',
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            setSelectedTypeOfLeave(null);
            loadData();
          });
    } catch (error) {
        console.error('Error occurred while adding leave:', error);
    }
};

const handleInputChange = (e) => {
    const { name, value } = e.target;
    setState({ ...state, [name]: value });

    if (name === 'leaveStartDay' || name === 'leaveEndDay') {
        const startDate = new Date(state.leaveStartDay);
        const endDate = new Date(state.leaveEndDay);
        const oneDay = 24 * 60 * 60 * 1000; // Hours * Minutes * Seconds * Milliseconds
        const diffDays = Math.round(Math.abs((endDate - startDate) / oneDay)) + 1; // Add 1 to include both start and end dates
        setSelectedNoOfDay(diffDays);
        setState(prevState => ({ ...prevState, leaveNoOfDay: diffDays.toString() }));

        const date = new Date(value);
        const day = date.getDate().toString().padStart(2, '0'); // Ensure double digits for day
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        const formattedDate = `${day}-${month}-${year}`;
        setState(prevState => ({ ...prevState, [name]: formattedDate }));
    }
};

const handleEditShow = (item) => {
    setEditData(item); // Set the data for editing
    setEditShow(true);
};

const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
        // Send a request to update the teacher using the ID from editData
        await axios.put(`${studentLocalhost}/studentLeave/updateStudentLeave/${editData.id}`, editData);

        setEditShow(false); // Close the edit modal

        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Leave updated successfully!',
            showConfirmButton: false,
            timer: 1500
        });
        
        loadData(); // Reload the data after successfully updating a teacher
    } catch (error) {
        console.error('Error occurred while updating attendance:', error);
    }
};

const handleEditInputChange = (fieldName, value) => {
    setSelectedTypeOfLeave((prevData) => ({
        ...prevData,
        [fieldName]: value
    }));
};

  return (
    <div>
        <div className='manageAttendancetopBarDiv'>
            <TopbarStudent />
        </div>
        <div className='manageAttendancesideBarDiv'>
            <SidebarStudent />
        </div>
        <div className='manageAttendanceBoxDiv'>
            <div className="manageAttendancecontainer">
                <div className="manageAttendancediv1">
                    <h2 className="fs-2 m-0">My Leave</h2>
                </div>
                <div className="manageAttendancediv2 d-flex justify-content-between align-items-center">
                    <div className="d-flex custom-margin">
                        <input
                                type="text"
                                placeholder="Search by Course"
                                value={searchTerm}
                                onChange={handleSearchInputChange}
                                className="mr-2"
                            />
                    </div>
                    <Button id='btnRefresh' className='btn btn-contact me-2' onClick={() => window.location.reload()}><FontAwesomeIcon icon={faRefresh} /></Button>
                    <Button className='btn btn-contact' onClick={handleShow}><FontAwesomeIcon icon={faPlus} /></Button>
                </div>

                <table className="styled-table">
                    <thead>
                        <tr>
                            <th style={{ textAlign: "center" }}>No</th>
                            <th style={{ textAlign: "center" }}>Intake</th>
                            <th style={{ textAlign: "center" }}>Course</th>
                            <th style={{ textAlign: "center" }}>Name</th>
                            <th style={{ textAlign: "center" }}>No of leave</th>
                            <th style={{ textAlign: "center" }}>Start Date</th>
                            <th style={{ textAlign: "center" }}>End Date</th>
                            <th style={{ textAlign: "center" }}>Type of Leave</th>
                            <th style={{ textAlign: "center" }}>Reason for Leave</th>
                            <th style={{ textAlign: "center" }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => {
                            
                            if (item.attendanceAssignStatus === "assigned") {
                                buttonClass = "btn btn-danger";
                                icon = faTimes;
                            } else {
                                buttonClass = "btn btn-success";
                                icon = faCheck;
                            }
                            return (
                                <tr key={item.id}>
                                    <td scope="row">{index + 1}</td>
                                    <td>{item.leaveIntake}</td>
                                    <td>{item.leaveCourse}</td>
                                    <td>{item.leaveName}</td>
                                    <td>{item.leaveNoOfDay}</td>
                                    <td>{item.leaveStartDay}</td>
                                    <td>{item.leaveEndDay}</td>
                                    <td>{item.leaveTypeOfLeave}</td>
                                    <td>{item.leaveReasonForLeave}</td>
                                    <td>
                                        <button
                                            id='btnFontIcon'
                                            className="btn btn-info"
                                            title='Edit'
                                            onClick={() => handleEditShow(item)}
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                            <title>Edit</title>
                                        </button>
                                        <button
                                            id='btnFontIcon'
                                            className="btn btn-warning"
                                            title='Delete'
                                            onClick={() => deleteContact(item.id)}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Add Modal */}
                <Modal 
                show={show} 
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
                enforceFocus={true}>
                    <Modal.Header closeButton>
                    <Modal.Title style={{ color: '#151632' }}>My Leave</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="custom-modal-body">
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="leaveStartDay">
                        <Form.Label>Start Day</Form.Label>
                        <Form.Control
                            type="date"
                            name='leaveStartDay'
                            onChange={handleInputChange}
                            autoFocus
                        />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="leaveEndDay">
                        <Form.Label>End Day</Form.Label>
                        <Form.Control
                            type="date"
                            name='leaveEndDay'
                            onChange={handleInputChange}
                        />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="leaveNoOfDay">
                        <Form.Label>No of day</Form.Label>
                        <Form.Control
                            type="number"
                            name='leaveNoOfDay'
                            value={selectedNoOfDay}
                            readOnly
                            onChange={handleInputChange}
                        />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="leaveTypeOfLeave">
                          <Form.Label>Type of Leave</Form.Label>
                          <Form.Select
                            name='leaveTypeOfLeave'
                            value={editData ? editData.leaveTypeOfLeave : ""}
                            onChange={(e) => handleEditInputChange('leaveTypeOfLeave', e.target.value)}
                          >
                            <option value="">Select type of leave</option>
                            <option value="Sick Leave">Sick Leave</option>
                            <option value="Emergency Leave">Emergency Leave</option>
                            <option value="Vacation Leave">Vacation Leave</option>
                            <option value="Personal Leave">Personal Leave</option>
                          </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="leaveReasonForLeave">
                        <Form.Label>Reason for leavey</Form.Label>
                        <Form.Control
                            type="text"
                            name='leaveReasonForLeave'
                            onChange={handleInputChange}
                        />
                        </Form.Group>
                        <Button type='submit' variant="primary" style={{float: 'right', width: '15%'}}>Apply</Button>
                    </Form>
                    </Modal.Body>
                </Modal>
            </div>
        </div>
    </div>
  );
}