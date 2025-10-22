import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from "axios";
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faRefresh, faEye, faUser } from '@fortawesome/free-solid-svg-icons';
import { Button, Modal, Form, Table } from 'react-bootstrap';
import Sidebar from "../global/Sidebar";
import SidebarEmployee from "../global/SidebarEmployee";
import Topbar from "../global/Topbar";
import TopbarEmployee from '../global/TopbarEmployee';
import { adminLocalhost } from '../../localhost/adminLocalhost';
import { employeeLocalhost } from '../../localhost/employeeLocalhost';
import { studentLocalhost } from '../../localhost/studentLocalhost';
import Cookies from 'js-cookie';

export default function ManageIntake() {

const navigate = useNavigate();

const [data, setData] = useState([]);
const [data3, setData3] = useState([]);
const [show, setShow] = useState(false);
const [editData, setEditData] = useState(null);
const [intakeInfo, setIntakeInfo] = useState('');
const [editShow, setEditShow] = useState(false);
const [editShow1, setEditShow1] = useState(false);

const handleClose = () => setShow(false);
const handleShow = () => setShow(true);
const handleEditClose = () => setEditShow(false);
const handleEditClose1 = () => setEditShow1(false);
const [searchTerm, setSearchTerm] = useState('');
const [studentData, setStudentData] = useState([]);

const sortedFilteredData = [...data]
    .sort((b, a) => a.studentIntake.localeCompare(b.studentIntake))
    .filter((item) => {
        const programMatch = item.studentProgram.toLowerCase().includes(searchTerm.toLowerCase());
        const enrollDateMatch = item.studentIntake.toLowerCase().includes(searchTerm.toLowerCase());
        const formattedDate = new Date(item.studentIntake).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).replace(/\s/g, '-');
        const dateMatch = formattedDate.toLowerCase().includes(searchTerm.toLowerCase());
        return programMatch || enrollDateMatch || dateMatch;
    });

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
        const response = await axios.get(`${studentLocalhost}/student/student-program-enroll-date`);

        const seen = new Set();
        const cleanedData = response.data
            .map(item => ({
                studentIntake: formatIntake(item.studentIntake),
                studentProgram: (item.studentProgram || '').replace(/\r/g, '').trim()
            }))
            .filter(item => {
                const key = `${item.studentProgram}-${item.studentIntake}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });

        setData(cleanedData);
    } catch (error) {
        console.error('Error occurred while fetching intake details:', error);
    }
};

const formatIntake = (intake) => {
    if (!intake) return '';
    const match = intake.match(/^([A-Za-z]{3})(\d{2})$/);
    if (match) {
        return `${match[1]}-${match[2]}`;
    }
    return intake.trim();
};

{/*Student Info based on intakeProg and intakeDate */}
useEffect(() => {
    if (editShow1) {
        axios.get(`${studentLocalhost}/student/byCourseAndIntake/${intakeInfo.studentProgram}/${intakeInfo.studentIntake}`)
            .then(response => {
                setStudentData(response.data);
            })
            .catch(error => {
                console.error("There was an error fetching the student data!", error);
            });
    }
}, [editShow1, intakeInfo.intakeProg, intakeInfo.intakeDate]);

useEffect(() => {
    loadData();
}, []);

const handleStudentShow = (item) => {
    setIntakeInfo(item);
    setEditShow1(true);
};

const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
};

const handleStudentInfoShow = () => {
    navigate('/managestudent');
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
                <h2 className="fs-2 m-0">INTAKES INFO</h2>
            </div>
            <div className="manageClassTimediv2 d-flex justify-content-between align-items-center">
                <div className="d-flex custom-margin">
                    <input
                            type="text"
                            placeholder="Search by Prog || Intake"
                            value={searchTerm}
                            onChange={handleSearchInputChange}
                            className="mr-2"
                            style={{width: '180px'}}
                        />
                </div>
                <Button id='btnRefresh' className='btn btn-contact me-2' onClick={() => window.location.reload()}><FontAwesomeIcon icon={faRefresh} /></Button>
            </div>

            <table className="styled-table">
                <thead>
                    <tr>
                        <th style={{ textAlign: "center" }}>No</th>
                        <th style={{ textAlign: "center" }}>Program</th>
                        <th style={{ textAlign: "center" }}>Enroll Date</th>
                        <th style={{ textAlign: "center" }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedFilteredData.map((item, index) => {
                        return (
                            <tr key={item.id}>
                                <td scope="row">{index + 1}</td>
                                <td>{item.studentProgram}</td>
                                <td>{item.studentIntake}</td>
                                <td>
                                    <button
                                        id='btnFontIcon'
                                        className="btn btn-success"
                                        title='Student'
                                        onClick={() => handleStudentShow(item)}
                                    >
                                        <FontAwesomeIcon icon={faUser} />
                                    </button>                                    
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Student Modal */}
            <Modal 
                show={editShow1} 
                onHide={handleEditClose1}
                dialogClassName="custom-modal"
                backdrop="static"
                keyboard={false}
                enforceFocus={true}>
                <Modal.Header closeButton>
                    <Modal.Title style={{ color: '#151632' }}>Student Info: {intakeInfo ? intakeInfo.intakeStudent : ""} </Modal.Title>
                </Modal.Header>
                <Modal.Body className="custom-modal-body">
                    <Form>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Student ID</th>
                                    <th>Student Name</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentData.map(student => (
                                    <tr key={student.id}>
                                        <td>{student.studentNewStdID}</td>
                                        <td>{student.studentName}</td>
                                        <td>
                                            <button
                                                id='btnFontIcon'
                                                className="btn btn-success"
                                                title='Student Info'
                                                type="button"
                                                onClick={handleStudentInfoShow}
                                            >
                                                <FontAwesomeIcon icon={faUser} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
      </div>
    </div>
  );
}