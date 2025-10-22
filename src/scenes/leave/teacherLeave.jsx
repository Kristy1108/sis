import React, { useState, useEffect } from 'react';
import axios from "axios";
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faRefresh, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button, Modal, Form } from 'react-bootstrap';
import SidebarTeacher from "../global/SidebarTeacher";
import TopbarTeacher from '../global/TopbarTeacher';
import Cookies from 'js-cookie';
import { adminLocalhost } from '../../localhost/adminLocalhost';
import { employeeLocalhost } from '../../localhost/employeeLocalhost';
import { studentLocalhost } from '../../localhost/studentLocalhost';

export default function TeacherLeave() {

    const [state, setState] = useState({
        teacherStartDate: "",
        teacherEndDate: "",
        teacherLeaveType: "",
        teacherLeaveDays: "",
        teacherReasonLeave: "",
        teacherLeaveStatus: "Not Approve",
        teacherName: Cookies.get('teacherName')
    });

    const [editData, setEditData] = useState({
        teacherStartDate: "",
        teacherEndDate: "",
        teacherLeaveType: "",
        teacherLeaveDays: "",
        teacherReasonLeave: "",
        teacherName: Cookies.get('teacherName')
      });

    const { teacherStartDate, teacherEndDate, teacherLeaveType, teacherReasonLeave } = state;

    const [selectedLeaveType, setSelectedLeaveType] = useState('');
    const [show, setShow] = useState(false);
    const [data, setData] = useState([]);

    useEffect(() => {
        if (state.teacherStartDate && state.teacherEndDate) {
            const startDate = new Date(state.teacherStartDate);
            const endDate = new Date(state.teacherEndDate);
            const differenceMs = endDate - startDate;
            const differenceDays = differenceMs / (1000 * 60 * 60 * 24);

            if (differenceDays < 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid Date Range',
                    text: 'End date cannot be before start date',
                });
                setState(prevState => ({ ...prevState, teacherLeaveDays: "" }));
            } else {
                setState(prevState => ({ ...prevState, teacherLeaveDays: differenceDays + 1 }));
            }
        }
    }, [state.teacherStartDate, state.teacherEndDate]); 

    useEffect(() => {
        if (state.teacherStartDate && state.teacherEndDate) {
            const startDate = new Date(state.teacherStartDate);
            const endDate = new Date(state.teacherEndDate);
            const differenceMs = endDate - startDate;
            const differenceDays = differenceMs / (1000 * 60 * 60 * 24);
    
            if (differenceDays < 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid Date Range',
                    text: 'End date cannot be before start date',
                });
                setState(prevState => ({ ...prevState, teacherLeaveDays: "" }));
            } else {
                setState(prevState => ({ ...prevState, teacherLeaveDays: differenceDays + 1 }));
            }
        }
    
        if (editData && editData.teacherStartDate && editData.teacherEndDate) {
            const startDate = new Date(editData.teacherStartDate);
            const endDate = new Date(editData.teacherEndDate);
            const differenceMs = endDate - startDate;
            const differenceDays = differenceMs / (1000 * 60 * 60 * 24);
            setEditData(prevData => ({ ...prevData, teacherLeaveDays: differenceDays + 1 }));
        }
    }, [state.teacherStartDate, state.teacherEndDate, editData]);
    

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [editShow, setEditShow] = useState(false);
    const handleEditClose = () => setEditShow(false);

    const loadData = async () => {
        try {
            const response = await axios.get(`${employeeLocalhost}/teacherLeave/getTeacherLeaveDetails`);
            setData(response.data);
        } catch (error) {
            console.error('Error occurred while fetching teacher leave details:', error);
        }
    };
    
    useEffect(() => {
        loadData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setState(prevState => ({ ...prevState, [name]: value }));
    }

    const handleSelectChange = (e) => {
        setSelectedLeaveType(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!teacherStartDate || !teacherEndDate || !selectedLeaveType || !teacherReasonLeave) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Please provide all details'
            });
            return;
        }

        try {
            await axios.post(`${employeeLocalhost}/teacherLeave/addTeacherLeave`, {
                ...state,
                teacherLeaveType: selectedLeaveType
            });

            setShow(false);

            Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: 'Leave submit successfully!',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                window.location.reload();
            });
        } catch (error) {
            console.error('Error occurred while applying leave:', error);
        }
    };

    const EditLeave = (item) => {
        setEditData(item); 
        setEditShow(true);
    };

    const deleteLeave = (id) => {
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
                axios.delete(`${employeeLocalhost}/teacherLeave/deleteTeacherLeave/${id}`);
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

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.put(`${employeeLocalhost}/teacherLeave/updateTeacherLeave/${editData.id}`, editData);
    
            setEditShow(false);
    
            Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: 'Leave updated successfully!',
                showConfirmButton: false,
                timer: 1500
            });
            
            loadData();
        } catch (error) {
            console.error('Error occurred while updating leave:', error);
        }
    };

    const handleEditInputChange = (fieldName, value) => {
        setEditData((prevData) => ({
            ...prevData,
            [fieldName]: value 
        }));
    };           

    return (
        <div>
            <div className='manageAttendancetopBarDiv'>
                <TopbarTeacher />
            </div>
            <div className='manageAttendancesideBarDiv'>
                <SidebarTeacher />
            </div>
            <div className='manageAttendanceBoxDiv'>
                <div className="manageAttendancecontainer">
                    <div className="manageAttendancediv1">
                        <h2 className="fs-2 m-0">Teacher Leave</h2>
                    </div>
                    <div className="manageAttendancediv2 d-flex justify-content-between align-items-center">
                        <Button id='btnRefresh' className='btn btn-contact me-2' onClick={() => window.location.reload()}><FontAwesomeIcon icon={faRefresh} /></Button>
                        <Button className='btn btn-contact' onClick={handleShow}><FontAwesomeIcon icon={faPlus} /></Button>
                    </div>

                    <table className="styled-table">
                        <thead>
                            <tr>
                                <th style={{ textAlign: "center" }}>No</th>
                                <th style={{ textAlign: "center" }}>Date From</th>
                                <th style={{ textAlign: "center" }}>Date To</th>
                                <th style={{ textAlign: "center" }}>Days</th>
                                <th style={{ textAlign: "center" }}>Type</th>
                                <th style={{ textAlign: "center" }}>Reason</th>
                                <th style={{ textAlign: "center" }}>Status</th>
                                <th style={{ textAlign: "center" }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.teacherStartDate}</td>
                                    <td>{item.teacherEndDate}</td>
                                    <td>{item.teacherLeaveDays}</td>
                                    <td>{item.teacherLeaveType}</td>
                                    <td>{item.teacherReasonLeave}</td>
                                    <td>{item.teacherLeaveStatus}</td>
                                    <td>
                                    <button
                                        id='btnFontIcon'
                                        className="btn btn-info"
                                        title='Edit'
                                        onClick={() => EditLeave(item)}
                                    >
                                        <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                    <button
                                        id='btnFontIcon'
                                        className="btn btn-warning"
                                        title='Delete'
                                        onClick={() => deleteLeave(item.id)}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </td>
                                </tr>
                            ))}
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
                        <Modal.Title style={{ color: '#151632' }}>Apply Leave</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="custom-modal-body">
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="teacherStartDate">
                                    <Form.Label>Start Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name='teacherStartDate'
                                        onChange={handleInputChange}
                                        autoFocus
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="teacherEndDate">
                                    <Form.Label>End Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name='teacherEndDate'
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="teacherLeaveDays">
                                    <Form.Label>Leave Days</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name='teacherLeaveDays'
                                        value={state.teacherLeaveDays}
                                        readOnly
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="teacherLeaveType">
                                    <Form.Label>Leave Type</Form.Label>
                                    <Form.Select value={selectedLeaveType} onChange={handleSelectChange}>
                                        <option value="">Select Leave Type</option>
                                        <option value="Annual Leave (AL)">Annual Leave (AL)</option>
                                        <option value="Emergency Leave (EL)">Emergency Leave (EL)</option>
                                        <option value="Medical Leave (MC)">Medical Leave (MC)</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="teacherReasonLeave">
                                    <Form.Label>Reason</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name='teacherReasonLeave'
                                        placeholder="Enter Reason"
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                                <Button type='submit' variant="primary" style={{float: 'right', width: '15%'}}>Submit</Button>
                            </Form>
                        </Modal.Body>
                    </Modal>

                    {/* Edit Modal */}
                    <Modal 
                        show={editShow} 
                        onHide={handleEditClose}
                        backdrop="static"
                        keyboard={false}
                        enforceFocus={true}>
                        <Modal.Header closeButton>
                        <Modal.Title style={{ color: '#151632' }}>Edit Leave</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="custom-modal-body">
                            <Form>
                                <Form.Group className="mb-3" controlId="teacherStartDate">
                                    <Form.Label>Start Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name='teacherStartDate'
                                        onChange={(e) => handleEditInputChange('teacherStartDate', e.target.value)}
                                        value={editData ? editData.teacherStartDate : ""}
                                        autoFocus
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="teacherEndDate">
                                    <Form.Label>End Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name='teacherEndDate'
                                        onChange={(e) => handleEditInputChange('teacherEndDate', e.target.value)}
                                        value={editData ? editData.teacherEndDate : ""}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="teacherLeaveDays">
                                    <Form.Label>Leave Days</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name='teacherLeaveDays'
                                        onChange={(e) => handleEditInputChange('teacherLeaveDays', e.target.value)}
                                        value={editData ? editData.teacherLeaveDays : ""}
                                        readOnly
                                    />
                                </Form.Group>

                                <Form.Group controlId="teacherLeaveType">
                                    <Form.Label>Leave Type</Form.Label>
                                    <Form.Select 
                                        value={editData ? editData.teacherLeaveType : ""}
                                        onChange={(e) => handleEditInputChange('teacherLeaveType', e.target.value)}>
                                        <option value="">Select Leave Type</option>
                                        <option value="Annual Leave (AL)">Annual Leave (AL)</option>
                                        <option value="Emergency Leave (EL)">Emergency Leave (EL)</option>
                                        <option value="Medical Leave (MC)">Medical Leave (MC)</option>
                                    </Form.Select>
                                </Form.Group>
                                
                                <Form.Group className="mb-3" controlId="teacherReasonLeave">
                                    <Form.Label>Reason</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name='teacherReasonLeave'
                                        placeholder="Enter Reason"
                                        onChange={(e) => handleEditInputChange('teacherReasonLeave', e.target.value)}
                                        value={editData ? editData.teacherReasonLeave : ""}
                                    />
                                </Form.Group>
                                <Button variant="primary" style={{float: 'right'}} onClick={handleEditSubmit}>Update</Button>
                            </Form>
                        </Modal.Body>
                    </Modal>
                </div>
            </div>
        </div>
    );
}