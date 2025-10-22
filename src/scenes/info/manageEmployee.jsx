import React, { useState, useEffect } from 'react';
import axios from "axios";
import Swal from 'sweetalert2';
import "./info.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faRefresh, faEyeSlash, faEye } from '@fortawesome/free-solid-svg-icons';
import { Button, Modal, Form, Carousel } from 'react-bootstrap';
import Sidebar from "../global/Sidebar";
import SidebarEmployee from "../global/SidebarEmployee";
import Topbar from "../global/Topbar";
import TopbarEmployee from '../global/TopbarEmployee';
import { employeeLocalhost } from '../../localhost/employeeLocalhost';
import Cookies from 'js-cookie';

export default function ManageEmployee() {

  const [state, setState] = useState({
    /* Personal Information */
    employeeName: "",
    employeeMobile: "",
    employeePersonalEmail: "",
    employeeCooperateEmail: "",
    employeeDateofBirth: "",
    employeeAge: "",
    employeeAddress: "",
    employeeRole: "",
    employeeJobTitle: "",
    employeeTitle: "",
    employeeIcNumber: "",
    /* Personal Information */
    employeeUsername: "",
    employeePasswd: "",
    employeeStatus: "",
    loginStatus: "Yes",
    employeeNewID: "",
    employeeTeacher: ""
  });

  const [data, setData] = useState([]);
  const [data1, setData1] = useState([]);
  const [data3, setData3] = useState([]);
  const [show, setShow] = useState(false);
  const [editData, setEditData] = useState(null);
  const [editShow, setEditShow] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleEditClose = () => {
    setEditData(false);
    setEditShow(false);
    setNewPassword("");
  };  
  const [newPassword, setNewPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedemployeeStatus, setSelectedemployeeStatus] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  const [selectedJobRole, setSelectedJobRole] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [originalData, setOriginalData] = useState({});

  const jobDepartRowspan = {};

  const sortedFilteredData = [...data].sort((a, b) => a.employeeNewID.localeCompare(b.employeeNewID)).filter((item) => {
    const employeeName = item.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    const employeeJobTitle = item.employeeJobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const employeeRole = item.employeeRole.toLowerCase().includes(searchTerm.toLowerCase());
    return employeeName || employeeJobTitle || employeeRole;
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

  const handleEmployeeStatusChange = (e) => {
    setSelectedemployeeStatus(e.target.value);
  };

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'employeeIcNumber') {
        if (value.length >= 6) {
            const dateOfBirth = extractDateOfBirthFromIC(value);
            const age = calculateAge(dateOfBirth);
            setState({ ...state, employeeIcNumber: value, employeeDateofBirth: dateOfBirth, employeeAge: age });
        } else {
            setState({ ...state, [name]: value });
        }
    } else if (name === 'employeeDateofBirth') {
        const age = calculateAge(value);
        setState({ ...state, employeeDateofBirth: value, employeeAge: age });
    } else {
        setState({ ...state, [name]: value });
    }
  };

  const handleSelectChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleSelectChange1 = (e) => {
    setSelectedJobTitle(e.target.value);
  };

  const handleSelectChange2 = (e) => {
    setSelectedJobRole(e.target.value);
  };

  const handleSelectChange3 = (e) => {
    setSelectedTeacher(e.target.value);
  };

  const extractDateOfBirthFromIC = (icNumber) => {
    const year = icNumber.substring(0, 2);
    const month = icNumber.substring(2, 4);
    const day = icNumber.substring(4, 6);

    // Determine the century, assuming 1900-1999 for simplicity.
    const fullYear = parseInt(year) > parseInt((new Date()).getFullYear().toString().substring(2)) ? `19${year}` : `20${year}`;

    return `${fullYear}-${month}-${day}`;
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age.toString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      await axios.post(`${employeeLocalhost}/employee/addEmployee`, {
        ...state,
        employeeStatus: selectedemployeeStatus,
        employeeTitle: selectedOption,
        employeeJobTitle: selectedJobTitle,
        employeePasswd: btoa(state.employeePasswd),
        employeeRole: selectedJobRole,
        employeeTeacher: selectedTeacher
      });
  
      const categories = [
        /*Users*/
        "Manage Student",
        "Manage Staff",
        "Manage Admin",
        /*General*/
        "Manage ExamReport",
        "Manage Transcript",
        "Manage Attendance",
        "Manage Marking Scheme",
        /*Course Coordinator*/
        "Manage Course",
        "Manage Classroom",
        "Manage Lesson",
        "Manage Enroll",
        "Manage Intake",
        "Manage Time",
        "Program",
        "Manage Feedback",
        "Leaderboard",
      ];

      const permissions = {
        "Trainee": {
          "Manage Student"       : "No Access",
          "Manage Staff"         : "No Access",
          "Manage Admin"         : "No Access",
          "Manage ExamReport"    : "No Access",
          "Manage Transcript"    : "No Access",
          "Manage Attendance"    : "No Access",
          "Manage Marking Scheme": "No Access",
          "Manage Course"        : "No Access",
          "Manage Classroom"     : "No Access",
          "Manage Lesson"        : "No Access",
          "Manage Enroll"        : "No Access",
          "Manage Intake"        : "No Access",
          "Manage Time"          : "No Access",
          "Program"              : "No Access",
          "Manage Feedback"      : "No Access",
          "Leaderboard"          : "No Access",
        },
        "Lecturer": {
          "Manage Student"       : "Read Only",
          "Manage Staff"         : "No Access",
          "Manage Admin"         : "No Access",
          "Manage ExamReport"    : "Read/Write",
          "Manage Transcript"    : "Read/Write",
          "Manage Attendance"    : "Read/Write",
          "Manage Marking Scheme": "Read Only",
          "Manage Course"        : "No Access",
          "Manage Classroom"     : "No Access",
          "Manage Lesson"        : "No Access",
          "Manage Enroll"        : "No Access",
          "Manage Intake"        : "No Access",
          "Manage Time"          : "No Access",
          "Program"              : "No Access",
          "Manage Feedback"      : "No Access",
          "Leaderboard"          : "No Access",
        },
        "Program Leader": {
          "Manage Student"       : "Read Only",
          "Manage Staff"         : "No Access",
          "Manage Admin"         : "No Access",
          "Manage ExamReport"    : "Read/Write",
          "Manage Transcript"    : "Read/Write",
          "Manage Attendance"    : "Read/Write",
          "Manage Marking Scheme": "Read/Write",
          "Manage Course"        : "No Access",
          "Manage Classroom"     : "No Access",
          "Manage Lesson"        : "No Access",
          "Manage Enroll"        : "No Access",
          "Manage Intake"        : "No Access",
          "Manage Time"          : "No Access",
          "Program"              : "No Access",
          "Manage Feedback"      : "No Access",
          "Leaderboard"          : "No Access",
        },
        "Course Counsellor": {
          "Manage Student"       : "Read Only",
          "Manage Staff"         : "No Access",
          "Manage Admin"         : "No Access",
          "Manage ExamReport"    : "Read Only",
          "Manage Transcript"    : "Read Only",
          "Manage Attendance"    : "Read Only",
          "Manage Marking Scheme": "Read Only",
          "Manage Course"        : "No Access",
          "Manage Classroom"     : "No Access",
          "Manage Lesson"        : "No Access",
          "Manage Enroll"        : "No Access",
          "Manage Intake"        : "No Access",
          "Manage Time"          : "No Access",
          "Program"              : "No Access",
          "Manage Feedback"      : "No Access",
          "Leaderboard"          : "Read/Write",
        },
        "Marketing": {
          "Manage Student"       : "Read Only",
          "Manage Staff"         : "No Access",
          "Manage Admin"         : "No Access",
          "Manage ExamReport"    : "Read Only",
          "Manage Transcript"    : "Read Only",
          "Manage Attendance"    : "Read Only",
          "Manage Marking Scheme": "Read Only",
          "Manage Course"        : "No Access",
          "Manage Classroom"     : "No Access",
          "Manage Lesson"        : "No Access",
          "Manage Enroll"        : "No Access",
          "Manage Intake"        : "No Access",
          "Manage Time"          : "No Access",
          "Program"              : "No Access",
          "Manage Feedback"      : "No Access",
          "Leaderboard"          : "Read/Write",
        },
        "Course Coordinator": {
          "Manage Student"       : "Read/Write",
          "Manage Staff"         : "Read/Write",
          "Manage Admin"         : "No Access",
          "Manage ExamReport"    : "Read Only",
          "Manage Transcript"    : "Read Only",
          "Manage Attendance"    : "Read Only",
          "Manage Marking Scheme": "Read Only",
          "Manage Course"        : "Read/Write",
          "Manage Classroom"     : "Read/Write",
          "Manage Lesson"        : "Read/Write",
          "Manage Enroll"        : "Read/Write",
          "Manage Intake"        : "Read/Write",
          "Manage Time"          : "Read/Write",
          "Program"              : "Read/Write",
          "Manage Feedback"      : "Read/Write",
          "Leaderboard"          : "Read/Write",
        },
        "Head Of Department": {
          "Manage Student"       : "Read Only",
          "Manage Staff"         : "No Access",
          "Manage Admin"         : "No Access",
          "Manage ExamReport"    : "Read Only",
          "Manage Transcript"    : "Read Only",
          "Manage Attendance"    : "Read Only",
          "Manage Marking Scheme": "Read Only",
          "Manage Course"        : "No Access",
          "Manage Classroom"     : "No Access",
          "Manage Lesson"        : "No Access",
          "Manage Enroll"        : "No Access",
          "Manage Intake"        : "No Access",
          "Manage Time"          : "No Access",
          "Program"              : "No Access",
          "Manage Feedback"      : "No Access",
          "Leaderboard"          : "Read/Write",
        }
      };      
  
      await axios.post(`${employeeLocalhost}/employeeGroup/addEmployeeGroups`, categories.map((category) => ({
        jobDepart: selectedJobTitle,
        employee: state.employeeUsername,
        category,
        accessType: permissions[selectedJobTitle][category] || "No Access"
      })));
  
      // Clear all form fields after successful submission
        setState({
            employeeName: "",
            employeeMobile: "",
            employeePersonalEmail: "",
            employeeCooperateEmail: "",
            employeeIcNumber: "",
            employeeDateofBirth: "",
            employeeAge: "",
            employeeAddress: "",
            employeeUsername: "",
            employeePasswd: "",
            employeeNewID: "",
            employeeStatus: "",
        });

        setSelectedOption("");
        setSelectedJobTitle("");
        setSelectedJobRole("");
        setSelectedTeacher("");
        setShow(false);
  
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Employee user added successfully!',
        showConfirmButton: false,
        timer: 1500
      }).then(() => {
        loadData();
      });
    } catch (error) {
      console.error('Error occurred while adding employee:', error);
  
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add employee user. Please try again.'
      });
    }
  };  

  const loadData = async () => {
    try {
      const response = await axios.get(`${employeeLocalhost}/employee/getEmployeeDetails`);
      setData(response.data);
    } catch (error) {
      console.error('Error occurred while fetching employee user details:', error);
    }
  };

  const loadData1 = async () => {
    try {
      const response = await axios.get(`${employeeLocalhost}/employee/jobTitles`);
      setData1(response.data);
    } catch (error) {
      console.error('Error occurred while fetching employee group details:', error);
    }
  };

  useEffect(() => {
    loadData();
    loadData1();
  }, []);

  const deleteContact = (id, name) => {
    Swal.fire({
      title: `Are you sure you want to delete ${name}?`,
      text: "This will delete the employee and all their access permissions!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        // Step 1: Get access list for the employee
        axios.get(`${employeeLocalhost}/employeeGroup/getAccessTypeAndCategory/${name}`)
          .then((res) => {
            const accessList = res.data;

            // Step 2: Delete all access entries (parallel)
            const deleteAccessRequests = accessList.map(entry =>
              axios.delete(`${employeeLocalhost}/employeeGroup/deleteEmployeeGroup/${entry.id}`)
            );

            // Step 3: Wait for all to finish
            Promise.all(deleteAccessRequests)
              .then(() => {
                // Step 4: Delete the employee record
                return axios.delete(`${employeeLocalhost}/employee/deleteEmployee/${id}`);
              })
              .then(() => {
                Swal.fire({
                  position: 'top-end',
                  icon: 'success',
                  title: 'Employee and permissions deleted successfully!',
                  showConfirmButton: false,
                  timer: 1500
                }).then(() => {
                  loadData(); // refresh list
                });
              })
              .catch((err) => {
                console.error(err);
                Swal.fire('Error!', 'Something went wrong while deleting.', 'error');
              });
          })
          .catch((err) => {
            console.error(err);
            Swal.fire('Error!', 'Failed to fetch access permissions.', 'error');
          });
      }
    });
  };

  const handleEditShow = (item) => {
    setOriginalData(item);
    setEditData(item); 
    setEditShow(true);
  };

  const handleEditSubmit = async () => {
  try {

    await axios.put(`${employeeLocalhost}/employee/updateEmployee/${editData.id}`, editData);

    setEditShow(false);
    setNewPassword("");
    setEditData(null);

    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: 'Employee updated successfully!',
      showConfirmButton: false,
      timer: 1500
    }).then(() => {
      loadData();
    });

  } catch (error) {
    console.error('Error occurred while updating employee:', error);
  }
  };
  
  const handleEditInputChange = (fieldName, value) => {
    if (fieldName === 'employeeIcNumber') {
      if (value.length >= 6) {
        const dateOfBirth = extractDateOfBirthFromIC(value);
        const age = calculateAge(dateOfBirth);
        setEditData((prevData) => ({
          ...prevData,
          employeeIcNumber: value,
          employeeDateofBirth: dateOfBirth,
          employeeAge: age.toString(),
        }));
      } else {
        setEditData((prevData) => ({
          ...prevData,
          [fieldName]: value,
        }));
      }
    } else if (fieldName === 'employeeDateofBirth') {
      const age = calculateAge(value);
      setEditData((prevData) => ({
        ...prevData,
        employeeDateofBirth: value,
        employeeAge: age.toString(),
      }));
    } else if (fieldName === 'employeePasswd') {
      // Encode the password using btoa() before storing
      const encodedPassword = btoa(value);
      setEditData((prevData) => ({
        ...prevData,
        employeePasswd: encodedPassword,
      }));
    } else {
      setEditData((prevData) => ({
        ...prevData,
        [fieldName]: value,
      }));
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  data1.forEach((item) => {
    if (!jobDepartRowspan[item.jobDepart]) {
      jobDepartRowspan[item.jobDepart] = 1; // Initialize rowspan
    } else {
      jobDepartRowspan[item.jobDepart] += 1; // Increment rowspan for duplicate values
    }
  });
  
  return (
    <div>
      <div className='InfoTopBarDiv'>
        {Cookies.get("sisUsername") ? (
            <Topbar />
        ) : Cookies.get("employeeUsername") ? (
            <TopbarEmployee />
        ) : null}
      </div>
      <div className='InfoSideBarDiv'>
        {Cookies.get("sisUsername") ? (
              <Sidebar />
          ) : Cookies.get("employeeUsername") ? (
              <SidebarEmployee />
          ) : null}
      </div>
      <div className='InfoBoxDiv'>
        <div className="InfoContainer">
          <div className="InfoDiv1">
            <h2 className="fs-2 m-0">EMPLOYEE INFORMATION</h2>
          </div>
          <div className="InfoDiv2 d-flex justify-content-between align-items-center">
            <div className="d-flex custom-margin">
              <input
                type="text"
                style={{width: '250px'}}
                placeholder="Search by name || category || department"
                value={searchTerm}
                onChange={handleSearchInputChange}
                className="mr-2"
              />
            </div>
            <Button id='btnRefresh' className='btn btn-contact me-2' title='Refresh' onClick={() => window.location.reload()}>
              <FontAwesomeIcon icon={faRefresh} />
            </Button>
            {data3.some(
              item => item.category === "Manage Staff" && item.accessType === "Read/Write"
            ) && (
              <Button className="btn btn-contact" title='Add' onClick={handleShow}>
                <FontAwesomeIcon icon={faPlus} />
              </Button>
            )}
          </div>

          <table className="styled-table" style={{width: '100%'}}>
            <thead>
              <tr>
                <th style={{ textAlign: "center" }}>No</th>
                <th style={{ textAlign: "center" }}>Name</th>
                <th style={{ textAlign: "center" }}>ID</th>
                <th style={{ textAlign: "center" }}>Cooperate Email</th>
                <th style={{ textAlign: "center" }}>Mobile</th>
                <th style={{ textAlign: "center" }}>Category</th>
                <th style={{ textAlign: "center" }}>Job Department</th>
                <th style={{ textAlign: "center" }}>Account Status</th>
                <th style={{ textAlign: "center" }}>Password</th>
                <th style={{ textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedFilteredData.map((item, index) => {
                return (
                  <tr key={item.id}>
                    <td scope="row">{index + 1}</td>
                    <td>{item.employeeName}</td>
                    <td>{item.employeeNewID}</td>
                    <td>{item.employeeCooperateEmail}</td>
                    <td>{item.employeeMobile}</td>
                    <td>{item.employeeJobTitle}</td>
                    <td>{item.employeeRole}</td>
                    <td>{item.employeeStatus}</td>
                    <td>{atob(item.employeePasswd)}</td>
                    <td>
                    {data3.some(item => item.category === "Manage Staff") && (
                      <button
                        id="btnFontIcon"
                        className="btn btn-info"
                        title='Edit'
                        style={{ fontSize: "10px" }}
                        onClick={() => handleEditShow(item)}
                      >
                        <FontAwesomeIcon
                          icon={
                            data3.some(
                              item => item.category === "Manage Staff" && item.accessType === "Read Only"
                            )
                              ? faEye
                              : faEdit
                          }
                        />
                      </button>
                    )}
                      {data3.some(
                        item => item.category === "Manage Staff" && item.accessType === "Read/Write"
                      ) && (
                        <button
                        id='btnFontIcon'
                        className="btn btn-warning"
                        title='Delete'
                        style={{ fontSize: "10px" }}
                        onClick={() => deleteContact(item.id, item.employeeUsername)}
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

          {/*User Add Modal*/}
          <Modal
            show={show}
            onHide={handleClose}
            dialogClassName="custom-modal"
            backdrop="static"
            keyboard={false}
            enforceFocus={true}
          >
            <Modal.Header closeButton>
                <Modal.Title style={{ color: '#151632' }}>Add Employee Information</Modal.Title>
            </Modal.Header>
            <Modal.Body className="custom-modal-body">
              <Carousel 
                interval={null} 
                controls={false} 
                indicators={false}
                style={{ height: "560px", overflow: "hidden" }}
              >
                {/* Personal Information Slide */}
              <Carousel.Item style={{ height: "100%" }}>
                <h6>PERSONAL INFORMATION</h6>
                <Form>
                  <div className="row">
                    <div className="col-md-4">
                      <Form.Group className="mb-3" controlId="employeeName">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          name='employeeName'
                          placeholder="Enter fullname"
                          onChange={handleInputChange}
                          autoFocus
                        />
                      </Form.Group>
                    </div>

                    <div className="col-md-4">
                      <Form.Group className="mb-3" controlId="employeeMobile">
                        <Form.Label>Mobile</Form.Label>
                        <div className="input-group">
                          <Form.Control
                            type="text"
                            name='employeeMobile'
                            placeholder="Enter Mobile number: 60"
                            onChange={handleInputChange}
                          />
                        </div>
                      </Form.Group>
                    </div>

                    <div className="col-md-4">
                      <Form.Group className="mb-3" controlId="employeePersonalEmail">
                        <Form.Label>Personal Email</Form.Label>
                        <Form.Control
                          type="email"
                          name='employeePersonalEmail'
                          placeholder="Enter personal email"
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </div>

                    <div className="col-md-4">
                      <Form.Group className="mb-3" controlId="employeeCooperateEmail">
                        <Form.Label>Cooperate Email</Form.Label>
                        <Form.Control
                          type="email"
                          name='employeeCooperateEmail'
                          placeholder="Enter cooperate email"
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </div>

                    <div className="col-md-4">
                      <Form.Group className="mb-3" controlId="employeeIcNumber">
                        <Form.Label>IC/Passport Number</Form.Label>
                        <Form.Control
                          type="text"
                          name='employeeIcNumber'
                          placeholder="Without '-'"
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </div>

                    <div className="col-md-4">
                      <Form.Group controlId="employeeTitle">
                      <Form.Label>Title</Form.Label>
                      <Form.Select value={selectedOption} onChange={handleSelectChange}>
                          <option value="">Select Title</option>
                          <option value="Mr">Mr.</option>
                          <option value="Mrs.">Mrs.</option>
                          <option value="Ms.">Ms.</option>
                          <option value="Miss">Miss</option>
                          <option value="Dr.">Dr.</option>
                          <option value="Prof.">Prof.</option>
                      </Form.Select>
                      </Form.Group>
                    </div>

                    <div className="col-md-4">
                      <Form.Group className="mb-3" controlId="employeeDateofBirth">
                        <Form.Label>Date of Birth</Form.Label>
                        <Form.Control
                          type="date"
                          name="employeeDateofBirth"
                          value={state.employeeDateofBirth}
                          onChange={handleInputChange}
                          readOnly
                        />
                      </Form.Group>
                    </div>

                    <div className="col-md-4">
                      <Form.Group className="mb-3" controlId="employeeAge">
                        <Form.Label>Age</Form.Label>
                        <Form.Control
                          type="text"
                          name='employeeAge'
                          placeholder="Enter Age"
                          readOnly
                          value={state.employeeAge}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </div>

                    <div className="col-md-4">
                      <Form.Group controlId="employeeJobTitle">
                      <Form.Label>Category</Form.Label>
                      <Form.Select value={selectedJobTitle} onChange={handleSelectChange1}>
                          <option value="">Select Category</option>
                          <option value="Trainee">Trainee</option>
                          <option value="Lecturer">Lecturer</option>
                          <option value="Program Leader">Program Leader</option>
                          <option value="Course Counsellor">Course Counsellor</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Course Coordinator">Course Coordinator</option>
                          <option value="Head of Department">Head of Department</option>
                      </Form.Select>
                      </Form.Group>
                    </div>

                    <div className="col-md-4">
                      <Form.Group controlId="employeeRole">
                      <Form.Label>Job Department</Form.Label>
                      <Form.Select value={selectedJobRole} onChange={handleSelectChange2}>
                            <option value="">Select Department</option>
                            <option value="ITS Trainee Department">ITS Trainee Department</option>
                            <option value="ITS Department">ITS Department</option>
                            <option value="SE Department">SE Department</option>
                            <option value="HR/Admin Department">HR/Admin Department</option>
                            <option value="Principle">Principle</option>
                            <option value="Sales and Marketing Department">Sales and Marketing Department</option>
                      </Form.Select>
                      </Form.Group>
                    </div>

                    <div className="col-md-4">
                      <Form.Group className="mb-3" controlId="employeeAddress">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                          type="text"
                          name='employeeAddress'
                          placeholder="Enter Address"
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </div>   

                    <div className="col-md-4">
                      <Form.Group controlId="employeeTeacher">
                      <Form.Label>Teacher?</Form.Label>
                      <Form.Select value={selectedTeacher} onChange={handleSelectChange3}>
                            <option value="">Is He/She teaching the class?</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                      </Form.Select>
                      </Form.Group>
                    </div>                 

                    <h6>ACCOUNT INFORMATION</h6>

                    <div className="col-md-4">
                      <Form.Group className="mb-3" controlId="employeeUsername">
                          <Form.Label>Username</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter Username"
                            autoComplete="off"
                            name="employeeUsername"
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                    </div>

                    <div className="col-md-4">
                      <Form.Group className="mb-3" controlId="employeePasswd">
                        <Form.Label>Password</Form.Label>
                        <div className="input-group">
                          <Form.Control
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter Password"
                            name="employeePasswd"
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
                      </Form.Group>
                    </div>
                  
                    <div className="col-md-4">
                      <Form.Group className="mb-3" controlId="employeeNewID">
                        <Form.Label>Employee ID</Form.Label>
                        <Form.Control
                          type="text"
                          name="employeeNewID"
                          placeholder='Auto Assign by system'
                          disabled
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </div> 

                    <div className="col-md-4">
                      <Form.Group className="mb-3" controlId="employeeStatus">
                        <Form.Label>Account Status</Form.Label>
                        <Form.Select
                          name="employeeStatus"
                          onChange={handleEmployeeStatusChange}
                        >
                          <option value="">Select Account Status</option>
                          <option value="Active">Active</option>
                          <option value="Disabled">Disabled</option>
                        </Form.Select>
                      </Form.Group>
                    </div>
                  </div>

                </Form>
              </Carousel.Item>

              </Carousel>
            </Modal.Body>
          
            <Modal.Footer>
              <Button className='submitBtn' onClick={handleSubmit} variant="primary">Add</Button>
            </Modal.Footer>
          </Modal>

          {/*User Edit Modal*/}
          <Modal show={editShow} onHide={handleEditClose} dialogClassName="custom-modal" backdrop="static" keyboard={false} enforceFocus={true}>

            <Modal.Header closeButton>
            <Modal.Title style={{ color: '#151632' }}>
              {data3.some(item => item.category === "Manage Staff" && item.accessType === "Read/Write")
                ? "Update Staff Information"
                : "View Staff Information"
              }
            </Modal.Title>
            </Modal.Header>

            <Modal.Body className="custom-modal-body">
              <Carousel interval={null} controls={false} indicators={false}>
                <Carousel.Item style={{ height: "100%" }}>
                  <h6>PERSONAL INFORMATION</h6>
                  <hr></hr>
                  <Form>
                    <div className="row">
                      <div className="col-md-4">
                        <Form.Group className="mb-3" controlId="employeeName">
                          <Form.Label>Fullname</Form.Label>
                          <Form.Control
                            type="text"
                            name='employeeName'
                            placeholder="Enter fullname"
                            value={editData ? editData.employeeName : ""}
                            onChange={(e) => handleEditInputChange('employeeName', e.target.value)}
                            autoFocus
                          />
                        </Form.Group>
                      </div>

                      <div className="col-md-4">
                        <Form.Group className="mb-3" controlId="employeeMobile">
                          <Form.Label>Mobile</Form.Label>
                          <div className="input-group">
                            <Form.Control
                              type="text"
                              name='employeeMobile'
                              placeholder="Enter Mobile number: 60"
                              value={editData ? editData.employeeMobile : ""}
                              onChange={(e) => handleEditInputChange('employeeMobile', e.target.value)}
                            />
                          </div>
                        </Form.Group>
                      </div>

                      <div className="col-md-4">
                        <Form.Group className="mb-3" controlId="employeePersonalEmail">
                          <Form.Label>Personal Email</Form.Label>
                          <Form.Control
                            type="email"
                            name='employeePersonalEmail'
                            placeholder="Enter personal email"
                            value={editData ? editData.employeePersonalEmail : ""}
                            onChange={(e) => handleEditInputChange('employeePersonalEmail', e.target.value)}
                          />
                        </Form.Group>
                      </div>

                      <div className="col-md-4">
                        <Form.Group className="mb-3" controlId="employeeCooperateEmail">
                          <Form.Label>Cooperate Email</Form.Label>
                          <Form.Control
                            type="email"
                            name='employeeCooperateEmail'
                            placeholder="Enter cooperate email"
                            value={editData ? editData.employeeCooperateEmail : ""}
                            onChange={(e) => handleEditInputChange('employeeCooperateEmail', e.target.value)}
                          />
                        </Form.Group>
                      </div>

                      <div className="col-md-4">
                        <Form.Group className="mb-3" controlId="employeeIcNumber">
                          <Form.Label>IC/Passport Number</Form.Label>
                          <Form.Control
                            type="text"
                            name='employeeIcNumber'
                            placeholder="Without '-'"
                            value={editData ? editData.employeeIcNumber : ""}
                            onChange={(e) => handleEditInputChange('employeeIcNumber', e.target.value)}
                          />
                        </Form.Group>
                      </div>

                      <div className="col-md-4">
                        <Form.Group controlId="employeeTitle">
                        <Form.Label>Title</Form.Label>
                        <Form.Select 
                          value={editData ? editData.employeeTitle : ""} 
                          onChange={(e) => handleEditInputChange('employeeTitle', e.target.value)}
                        >
                            <option value="">Select Title</option>
                            <option value="Mr">Mr.</option>
                            <option value="Mrs.">Mrs.</option>
                            <option value="Ms.">Ms.</option>
                            <option value="Miss">Miss</option>
                            <option value="Dr.">Dr.</option>
                            <option value="Prof.">Prof.</option>
                        </Form.Select>
                        </Form.Group>
                      </div>

                      <div className="col-md-4">
                        <Form.Group className="mb-3" controlId="employeeDateofBirth">
                          <Form.Label>Date of Birth</Form.Label>
                          <Form.Control
                            type="date"
                            name="employeeDateofBirth"
                            //value={editData ? format(new Date(editData.employeeDateofBirth), 'yyyy-MM-dd') : ""}
                            value={editData ? editData.employeeDateofBirth : ""}
                            onChange={(e) => handleEditInputChange('employeeDateofBirth', e.target.value)}
                            readOnly
                          />
                        </Form.Group>
                      </div>

                      <div className="col-md-4">
                        <Form.Group className="mb-3" controlId="employeeAge">
                          <Form.Label>Age</Form.Label>
                          <Form.Control
                            type="text"
                            name='employeeAge'
                            placeholder="Enter Age"
                            readOnly
                            value={editData ? editData.employeeAge : ""}
                            onChange={(e) => handleEditInputChange('employeeAge', e.target.value)}
                          />
                        </Form.Group>
                      </div>

                      <div className="col-md-4">
                        <Form.Group className="mb-3" controlId="employeeJobTitle">
                          <Form.Label>Category</Form.Label>
                          <Form.Select
                            name='employeeJobTitle'
                            value={editData ? editData.employeeJobTitle : ""}
                            onChange={(e) => handleEditInputChange('employeeJobTitle', e.target.value)}
                          >
                            <option value="">Select Category</option>
                            <option value="Lecturer">Lecturer</option>
                            <option value="Program Leader">Program Leader</option>
                            <option value="Course Counsellor">Course Counsellor</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Course Coordinator">Course Coordinator</option>
                            <option value="Head of Department">Head of Department</option>
                          </Form.Select>
                        </Form.Group>
                      </div>

                      <div className="col-md-4">
                        <Form.Group className="mb-3" controlId="employeeRole">
                          <Form.Label>Job Department</Form.Label>
                          <Form.Select
                            name='employeeRole'
                            value={editData ? editData.employeeRole : ""}
                            onChange={(e) => handleEditInputChange('employeeRole', e.target.value)}
                          >
                            <option value="">Select Department</option>
                            <option value="ITS Department">ITS Department</option>
                            <option value="SE Department">SE Department</option>
                            <option value="HR/Admin Department">HR/Admin Department</option>
                            <option value="Principle">Principle</option>
                            <option value="Sales and Marketing Department">Sales and Marketing Department</option>
                          </Form.Select>
                        </Form.Group>
                      </div>

                      <div className="col-md-4">
                        <Form.Group className="mb-3" controlId="employeeAddress">
                          <Form.Label>Address</Form.Label>
                          <Form.Control
                            type="text"
                            name='employeeAddress'
                            placeholder="Enter Address"
                            value={editData ? editData.employeeAddress : ""}
                            onChange={(e) => handleEditInputChange('employeeAddress', e.target.value)}
                          />
                        </Form.Group>
                      </div>

                      <div className="col-md-4">
                        <Form.Group controlId="employeeTeacher">
                        <Form.Label>Teacher?</Form.Label>
                        <Form.Select 
                        value={editData ? editData.employeeTeacher : ""}
                        onChange={(e) => handleEditInputChange('employeeTeacher', e.target.value)}
                        >
                              <option value="">Is He/She teaching the class?</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                        </Form.Select>
                        </Form.Group>
                      </div> 

                      <h6>ACCOUNT INFORMATION</h6>

                      <div className="col-md-4">
                        <Form.Group className="mb-3" controlId="employeeUsername">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                              type="text"
                              name="employeeUsername"
                              value={editData ? editData.employeeUsername : ""}
                              onChange={(e) => handleEditInputChange('employeeUsername', e.target.value)}
                            />
                          </Form.Group>
                      </div>

                      <div className="col-md-4">
                        <Form.Group className="mb-3" controlId="employeePasswd">
                          <Form.Label>Password</Form.Label>
                          <div className="input-group">
                          <Form.Control
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter Password"
                            name="employeePasswd"
                            className="form-control rounded-0"
                            value={newPassword !== '' ? newPassword : (editData ? editData.employeePasswd : '')}
                            onChange={(e) => {
                              setNewPassword(e.target.value);
                              handleEditInputChange('employeePasswd', e.target.value);
                            }}
                          />
                            <button
                              className="btn btn-outline-secondary"
                              type="button"
                              onClick={handleTogglePassword}
                            >
                              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                            </button>
                          </div>
                        </Form.Group>
                      </div>

                      <div className="col-md-4">
                        <Form.Group className="mb-3" controlId="employeeNewID">
                          <Form.Label>Employee ID</Form.Label>
                          <Form.Control
                            type="text"
                            name="employeeNewID"
                            value={editData ? editData.employeeNewID : ""}
                            readOnly
                            onChange={(e) => handleEditInputChange('employeeNewID', e.target.value)}
                          />
                        </Form.Group>
                      </div>                  

                      <div className="col-md-4">
                        <Form.Group className="mb-3" controlId="employeeStatus">
                          <Form.Label>Account Status</Form.Label>
                          <Form.Select
                            name="employeeStatus"
                            value={editData ? editData.employeeStatus : ""}
                            onChange={(e) => handleEditInputChange('employeeStatus', e.target.value)}
                          >
                            <option value="">Select Account Status</option>
                            <option value="Active">Active</option>
                            <option value="Disabled">Disabled</option>
                          </Form.Select>
                        </Form.Group>
                      </div>
                    </div>

                  </Form>
                </Carousel.Item>
              </Carousel>
            </Modal.Body>

            {data3.some(item => item.category === "Manage Staff" && item.accessType === "Read/Write") && (
              <Modal.Footer>
                <Button
                  className="submitBtn"
                  onClick={handleEditSubmit}
                  variant="primary"
                >
                  Update
                </Button>
              </Modal.Footer>
            )}
          </Modal>

        </div>
      </div>
    </div>
  );
}