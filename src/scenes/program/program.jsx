import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from "axios";
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faEye, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { Button, Modal, Form } from 'react-bootstrap';
import Sidebar from "../global/Sidebar";
import SidebarEmployee from "../global/SidebarEmployee";
import Topbar from "../global/Topbar";
import TopbarEmployee from '../global/TopbarEmployee';
import { adminLocalhost } from '../../localhost/adminLocalhost';
import { employeeLocalhost } from '../../localhost/employeeLocalhost';
import { studentLocalhost } from '../../localhost/studentLocalhost';
import Cookies from 'js-cookie';

export default function Program() {

  const [state, setState] = useState({
    programCode: "",
    programName: ""
});

const [data, setData] = useState([]);
const [data3, setData3] = useState([]);
const [show, setShow] = useState(false);
const [editData, setEditData] = useState(null);
const [editShow, setEditShow] = useState(false);

const handleClose = () => setShow(false);
const handleShow = () => setShow(true);
const handleEditClose = () => setEditShow(false);
const [selectedCourseCode, setSelectedCourseCode] = useState('');
const [progCoursesCode, setProgCoursesCode] = useState([]);
const [searchTerm, setSearchTerm] = useState('');

const loadData3 = async () => {
    try {
      const username = Cookies.get("sisUsername") || Cookies.get("employeeUsername");
  
      if (!username) {
        console.error("No username found in cookies.");
        return;
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
        const response = await axios.get(`${adminLocalhost}/program/getProgramDetails`);
        setData(response.data);
    } catch (error) {
        console.error('Error occurred while fetching program details:', error);
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
            axios.delete(`${adminLocalhost}/program/deleteProgram/${id}`);
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

    if (!state.programCode || !state.programName) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please fill in all fields!',
        });
        return;
    }

    try {

        const formData = {
            programCode: state.programCode,
            programName: state.programName
        };

        await axios.post(`${adminLocalhost}/program/addProgram`, formData);
        setState((prevState) => ({
            ...prevState,
            programCode: "",
            programName: ""
        }));

        setShow(false);

        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Program added successfully!',
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            loadData();
          });

    } catch (error) {
        console.error('Error occurred while adding class time:', error);
    }
};

const handleInputChange = (e) => {
    const { name, value } = e.target;
    setState({ ...state, [name]: value });
};

const handleEditShow = async (item) => {
    setEditData({
        ...item,
        programCode: item.programCode,
        programName: item.programName
    });
    setEditShow(true);
};

const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {

        const formData = {
            programCode: editData.programCode,
            programName: editData.programName
        };

        await axios.put(`${adminLocalhost}/program/updateProgram/${editData.id}`, formData);
        
        setEditShow(false);

        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Program updated successfully!',
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            loadData();
          });

    } catch (error) {
        console.error('Error occurred while updating program:', error);
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

const sortedFilteredData = [...data]
  .sort((a, b) => a.programCode.localeCompare(b.programCode))
  .filter((item) => {
    const roleMatch = item.programCode.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = item.programName.toLowerCase().includes(searchTerm.toLowerCase());
    return roleMatch || statusMatch;
  });

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
                <h2 className="fs-2 m-0">PROGRAM INFO</h2>
            </div>
            <div className="manageClassTimediv2 d-flex justify-content-between align-items-center">
                <div className="d-flex custom-margin">
                    <input
                        type="text"
                        placeholder="Search by Prog Code"
                        value={searchTerm}
                        onChange={handleSearchInputChange}
                        className="mr-2"
                        style={{width: '180px'}}
                    />
                </div>
                <Button id='btnRefresh' className='btn btn-contact me-2' onClick={() => window.location.reload()}><FontAwesomeIcon icon={faRefresh} /></Button>
                {data3.some(
                    item => item.category === "Manage Time" && item.accessType === "Read/Write"
                    ) && (
                    <Button className="btn btn-contact" onClick={handleShow}>
                        <FontAwesomeIcon icon={faPlus} />
                    </Button>
                )}
            </div>

            <table className="styled-table">
                <thead>
                    <tr>
                        <th style={{ textAlign: "center" }}>No</th>
                        <th style={{ textAlign: "center" }}>Program Code</th>
                        <th style={{ textAlign: "center" }}>Program Name</th>
                        <th style={{ textAlign: "center" }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedFilteredData.map((item, index) => {
                        return (
                            <tr key={item.id}>
                                <td scope="row">{index + 1}</td>
                                <td>{item.programCode}</td>
                                <td>{item.programName}</td>
                                <td>
                                {data3.some(item => item.category === "Program" && item.accessType === "Read/Write") && (
                                    <button
                                        id="btnFontIcon"
                                        className="btn btn-info"
                                        style={{ fontSize: "10px" }}
                                        onClick={() => handleEditShow(item)}
                                    >
                                        <FontAwesomeIcon
                                        icon={
                                            data3.some(
                                            item => item.category === "Program" && item.accessType === "Read Only"
                                            )
                                            ? faEye
                                            : faEdit
                                        }
                                        />
                                    </button>
                                )}
                                {data3.some(item => item.category === "Program" && item.accessType === "Read/Write"
                                ) && (
                                    <button
                                        id='btnFontIcon'
                                        className="btn btn-warning"
                                        style={{ fontSize: "10px" }}
                                        onClick={() => deleteContact(item.id)}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                )}
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
                enforceFocus={true}
            >
                <Modal.Header closeButton>
                    <Modal.Title style={{ color: '#151632' }}>Add Program</Modal.Title>
                </Modal.Header>
                <Modal.Body className="custom-modal-body">
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="TimeStart">
                            <Form.Label>Program Code:</Form.Label>
                            <Form.Control
                                type="text"
                                name="programCode"
                                placeholder='Enter Program Code'
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="TimeEnd">
                            <Form.Label>Program Name:</Form.Label>
                            <Form.Control
                                type="text"
                                name="programName"
                                placeholder='Enter Program Name'
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Button type='submit' variant="primary" style={{ float: 'right', width: '15%' }}>Add</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Edit Modal */}
            <Modal 
                show={editShow} 
                onHide={handleEditClose}
                backdrop="static"
                keyboard={false}
                enforceFocus={true}
            >
                <Modal.Header closeButton>
                    <Modal.Title style={{ color: '#151632' }}>
                        {data3.some(item => item.category === "Program" && item.accessType === "Read Only")
                        ? "View Program"
                        : "Update Program"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="custom-modal-body">
                    <Form onSubmit={handleEditSubmit}>
                        <Form.Group className="mb-3" controlId="TimeStart">
                            <Form.Label>Program Code:</Form.Label>
                            <Form.Control
                                type="text"
                                name="programCode"
                                value={editData?.programCode || ""} 
                                onChange={handleEditInputChange} 
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="TimeEnd">
                            <Form.Label>Program Code:</Form.Label>
                            <Form.Control
                                type="text"
                                name="programName"
                                value={editData?.programName || ""} 
                                onChange={handleEditInputChange} 
                            />
                        </Form.Group>

                        {data3.some(item => item.accessType === "Read Only") ? null : (
                            <Button type="submit" variant="primary" style={{ float: 'right'}}>Update</Button>
                        )}
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
      </div>
    </div>
  );
}