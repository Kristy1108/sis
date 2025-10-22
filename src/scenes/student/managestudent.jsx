import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import Swal from 'sweetalert2';
import "./managestudent.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faRefresh, faEye, faEyeSlash, faCaretDown, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Button, Modal, Form, Carousel, Table } from 'react-bootstrap';
import Sidebar from "../global/Sidebar";
import SidebarEmployee from "../global/SidebarEmployee";
import Topbar from "../global/Topbar";
import TopbarEmployee from '../global/TopbarEmployee';
import { format } from 'date-fns';
import { adminLocalhost } from '../../localhost/adminLocalhost';
import { employeeLocalhost } from '../../localhost/employeeLocalhost';
import { studentLocalhost } from '../../localhost/studentLocalhost';
import Cookies from 'js-cookie';

export default function ManageStudent() {

  const [state, setState] = useState({
    /* Student Info */
    studentName: "",
    studentMobile1: "",
    studentMobile2: "",
    studentEmail1: "",
    studentEmail2: "",
    studentBirthDate: "",
    studentAdress: "",
    studentAge: "",
    studentNationality: "",
    studentNewStdID: "",
    studentOldStdID: "",
    studentDisease: "",
    studentNotes: "",
    studentMalaysiaIC: "",
    /* Course Info */
    studentEnrollDate: "",
    studentSalesPerson: "",
    studentClassMethod: "",
    studentIntake: "",
    studentCompleted: "",
    studentCoursePackages: "",
    /* Account Info */
    studentRole: "Student",
    studentProgram: "",
    studentPasswd: "",
    studentStatus: "",
    loginStatus: "Yes",
    /* Parent/Guardian Info */    
    studentPrtName1: "",
    studentPrtName2: "",
    studentPrtIC1: "",
    studentPrtIC2: "",
    studentPrtMobile1: "",
    studentPrtMobile2: "",
    studentPrtMobile3: "",
    studentPrtMobile4: "",
    studentPrtEmail1: "",
    studentPrtEmail2: ""
  });

  const [data, setData] = useState([]);
  const [data1, setData1] = useState([]);
  const [show, setShow] = useState(false);
  const [editData, setEditData] = useState(null);
  const [editShow, setEditShow] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleEditClose = () => setEditShow(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [educationRows, setEducationRows] = useState([{ subject: "", grade: "" }]);
  const [editEducationRows, setEditEducationRows] = useState([{ subject: "", grade: "" }]);

  const [selectedstudentStatus, setSelectedstudentStatus] = useState('');
  const [selectedDateofBirth, setSelectedDateofBirth] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  
  const [progCodes, setProgCodes] = useState([]);
  const [intakeYears, setIntakeYears] = useState([]);

  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });

  const employeeJobTitle = Cookies.get('employeeJobTitle');
  const [searchMode, setSearchMode] = useState("all");

  const loadData1 = async () => {
    try {
      const username = Cookies.get("sisUsername") || Cookies.get("employeeUsername");
  
      if (!username) {
        console.error("No username found in cookies.");
        return; // Exit if no valid cookie is found
      }
  
      const response = await axios.get(`${employeeLocalhost}/employeeGroup/getAccessTypeAndCategory/${username}`);
      setData1(response.data);
    } catch (error) {
      console.error("Error occurred while fetching access details:", error);
    }
  };

  const loadData = async () => {
    try {
      const employeeName = Cookies.get('employeeUsername');

      if (employeeJobTitle === 'Course Counsellor') {
        /*const response = await axios.get(
          `${employeeLocalhost}/student/getStudentIDsBySalesPerson/${employeeName}`
        );*/
        const response = await axios.get(
          `${employeeLocalhost}/student/getStudentDetails`
        );
        setData(response.data);
      } else {
        const response = await axios.get(
          `${employeeLocalhost}/student/getStudentDetails`
        );
        setData(response.data);
      }
    } catch (error) {
      console.error('Error occurred while fetching student details:', error);
    }
  };  

  const filteredData = data.filter((item) => {
    const lowerSearch = searchTerm.toLowerCase();

    if (searchMode === "ca") {
      // Only search by Course Advisor
      return (item.studentSalesPerson || "").toLowerCase().includes(lowerSearch);
    }

    // General search
    const roleMatch = (item.studentName || "").toLowerCase().includes(lowerSearch);
    const statusMatch = (item.studentNewStdID || "").toLowerCase().includes(lowerSearch);
    const icMatch = (item.studentMalaysiaIC || "").toLowerCase().includes(lowerSearch);
    const progMatch = (item.studentProgram || "").toLowerCase().includes(lowerSearch);
    const salesName = (item.studentSalesPerson || "").toLowerCase().includes(lowerSearch);

    return roleMatch || statusMatch || icMatch || progMatch || salesName;
  });

  useEffect(() => {
    loadData();
    loadData1();
  }, []);

  useEffect(() => {
    axios.get(`${adminLocalhost}/course/progCodes`)
        .then(response => {
            setProgCodes(response.data);
        })
        .catch(error => {
            console.error('Error fetching progCodes:', error);
        });
  }, []);

  useEffect(() => {
    axios.get(`${adminLocalhost}/intakeYear/progCodes`)
        .then(response => {
            setIntakeYears(response.data);
        })
        .catch(error => {
            console.error('Error fetching intakeCodes:', error);
        });
  }, []);

  const handleStudentStatusChange = (e) => {
    setSelectedstudentStatus(e.target.value);
  };

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
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
  
    return age.toString();;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const cleanedValue = value.replace(/\D/g, '');
  
    if (name === 'studentMalaysiaIC') {
      if (value.length >= 6) {
        const dateOfBirth = extractDateOfBirthFromIC(cleanedValue);
        const age = calculateAge(dateOfBirth);
        setState({ ...state, studentMalaysiaIC: cleanedValue, studentBirthDate: dateOfBirth, studentAge: age });
      } else {
        setState({ ...state, [name]: value });
      }
    } else if (name === 'studentBirthDate') {
      const age = calculateAge(value);
      setState({ ...state, studentBirthDate: value, studentAge: age });
    } else if (name === 'studentEnrollDate') {
      const intake = getIntakeFromEnrollDate(value);
      setState({ ...state, studentEnrollDate: value, studentIntake: intake });
    } else if (name === "studentPrtIC1") {
      const firstSix = value.substring(0, 6);
  
      if (!/^\d{6}$/.test(firstSix)) {
        // If first 6 chars are not numbers, clear field
        setState(prev => ({
          ...prev,
          [name]: "",
          studentPasswd: "" // Also clear the password just in case
        }));
        return;
      } else {
        // Set password from first 6 digits of parent IC
        setState(prev => ({
          ...prev,
          [name]: value,
          studentPasswd: firstSix
        }));
      }
    } else {
      setState({ ...state, [name]: value });
    }
  };

  const getIntakeFromEnrollDate = (date) => {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const dateObj = new Date(date);
      const month = months[dateObj.getMonth()];
      const year = dateObj.getFullYear().toString().slice(-2); // Get last 2 digits of the year
      return `${month}-${year}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      { key: 'studentName', label: 'Student Name' },
      { key: 'studentMalaysiaIC', label: 'Student IC' },
      { key: 'studentMobile1', label: 'Mobile 1' },
      { key: 'studentEmail1', label: 'Email 1' },
      { key: 'studentAdress', label: 'Address' },
      { key: 'studentNationality', label: 'Nationality' },
      { key: 'studentSalesPerson', label: 'Sales Person' },
      { key: 'studentClassMethod', label: 'Class Method' },
      { key: 'studentCoursePackages', label: 'Course Package' },
      { key: 'studentEnrollDate', label: 'Enroll Date' },
      //{ key: 'studentPrtName1', label: 'Parent/Guardian Name 1' },
      //{ key: 'studentPrtIC1', label: 'Parent/Guardian IC 1' },
      //{ key: 'studentPrtMobile1', label: 'Parent/Guardian Mobile 1' },
      //{ key: 'studentPrtEmail1', label: 'Parent/Guardian Email 1' }
    ];
    
    const missingFields = requiredFields
      .filter(field => !state[field.key] || state[field.key].trim() === "")
      .map(field => field.label);
    
    //if (!selectedProgram) missingFields.push("Program");
    if (!selectedstudentStatus) missingFields.push("Active");
    
    /*if (missingFields.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Required Fields!',
        html: `<ul style="text-align:left">${missingFields.map(f => `<li>${f}</li>`).join('')}</ul>`,
        timer: 2000,
        showConfirmButton: false,
        position: 'top-end'
      });
      return;
    } */ 
  
    try {
      /*const payload = {
        ...state,
        studentStatus: selectedstudentStatus,
        studentProgram: selectedProgram
      };*/

      const spmSubject = educationRows.map(row => row.subject).join(', ');
      const spmGrade = educationRows.map(row => row.grade).join(', ');

      const fullStudentData = {
        ...state,
        spmSubject,
        spmGrade
      };

      console.log(fullStudentData);
  
      await axios.post(`${studentLocalhost}/student/smartAddStudent`, fullStudentData);
  
      setShow(false);
  
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Student added successfully!',
        showConfirmButton: false,
        timer: 1500
      }).then(() => {
        setSelectedstudentStatus(null);
        setSelectedProgram(null);
        loadData();
      });
  
    } catch (error) {
      if (error.response && error.response.status === 409) {
        Swal.fire({
          position: 'top-end',
          icon: 'info',
          title: error.response.data,
          showConfirmButton: false,
          timer: 2000
        });
      } else {
        console.error('Unexpected error:', error);
      }
    }
  };   

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
        axios.delete(`${studentLocalhost}/student/deleteStudent/${id}`);
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

  const handleEditShow = (item) => {
    setEditData(item);
    //console.log(item);
    const subjects = item.spmSubject ? item.spmSubject.split(',').map(s => s.trim()) : [];
    const grades = item.spmGrade ? item.spmGrade.split(',').map(g => g.trim()) : [];

    const rows = subjects.map((subject, i) => ({
      subject,
      grade: grades[i] || ""
    }));

    setEditEducationRows(rows.length ? rows : [{ subject: "", grade: "" }]);
    setEditShow(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const result = await axios.get(`${studentLocalhost}/student/getStudentDetails`);
      const allStudents = result.data;
  
      const duplicate = allStudents.find(student =>
        student.studentMalaysiaIC === editData.studentMalaysiaIC &&
        student.studentProgram === editData.studentProgram &&
        student.id !== editData.id
      );
  
      if (duplicate) {
        Swal.fire({
          position: 'top-end',
          icon: 'warning',
          title: 'Student with same IC and Program already exists!',
          showConfirmButton: false,
          timer: 2000
        });
        return;
      }

      const spmSubject = editEducationRows.map(r => r.subject).join(', ');
      const spmGrade = editEducationRows.map(r => r.grade).join(', ');

      const updatedStudent = {
        ...editData,
        studentIntake: editData.studentIntake,
        spmSubject,
        spmGrade
      };
  
      // Proceed with update
      await axios.put(`${studentLocalhost}/student/updateStudent/${editData.id}`, updatedStudent);
  
      setEditShow(false); // Close modal
  
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Student updated successfully!',
        showConfirmButton: false,
        timer: 1500
      });
  
      loadData();
      
    } catch (error) {
      console.error('Error occurred while updating student:', error);
    }
  };  

  const handleEditInputChange = (fieldName, value) => {
    const cleanedValue = value.replace(/\D/g, '');

    if (fieldName === 'studentMalaysiaIC') {
      if (value.length >= 6) {
        const dateOfBirth = extractDateOfBirthFromIC(cleanedValue);
        const age = calculateAge(dateOfBirth);
        setEditData((prevData) => ({
          ...prevData,
          studentMalaysiaIC: cleanedValue,
          studentBirthDate: dateOfBirth,
          studentAge: age.toString()
        }));
      } else {
        setEditData((prevData) => ({
          ...prevData,
          [fieldName]: value
        }));
      }
    } else if (fieldName === 'studentBirthDate') {
      const age = calculateAge(value);
      setEditData((prevData) => ({
        ...prevData,
        studentBirthDate: value,
        studentAge: age.toString()
      }));
    } else if (fieldName === 'studentEnrollDate') {
      const intake = getIntakeFromEnrollDate(value);
      setEditData((prevData) => ({
        ...prevData,
        studentEnrollDate: value,
        studentIntake: intake
      }));
    } else if (fieldName === 'studentPrtIC1') {
      const firstSix = value.substring(0, 6);
  
      if (!/^\d{6}$/.test(firstSix)) {
        setEditData((prevData) => ({
          ...prevData,
          studentPrtIC1: "",
          studentPasswd: ""
        }));
        return;
      }
  
      setEditData((prevData) => ({
        ...prevData,
        studentPrtIC1: value,
        studentPasswd: firstSix
      }));
    } else {
      setEditData((prevData) => ({
        ...prevData,
        [fieldName]: value
      }));
    }
  };  

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleProgramChange = (e) => {
    setSelectedProgram(e.target.value);
  };

  const sortedData = [...filteredData].sort((a, b) => {
    const key = sortConfig.key;
  
    if (!key) return 0;
  
    let valA = a[key] || '';
    let valB = b[key] || '';
  
    // Handle date sort for studentEnrollDate
    if (key === 'studentEnrollDate') {
      valA = new Date(valA);
      valB = new Date(valB);
      return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
    }
  
    // Default string sort
    return sortConfig.direction === 'asc'
      ? valA.toString().localeCompare(valB.toString())
      : valB.toString().localeCompare(valA.toString());
  });    

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };   
  
  const handleAddRow = () => {
    setEducationRows([...educationRows, { subject: "", grade: "" }]);
  };

  const handleRemoveRow = (index) => {
    const rows = [...educationRows];
    rows.splice(index, 1);
    setEducationRows(rows);
  };

  const handleEducationChange = (index, e) => {
    const { name, value } = e.target;
    const rows = [...educationRows];
    rows[index][name] = value;
    setEducationRows(rows);
  };

  const handleEditEducationChange = (index, e) => {
    const { name, value } = e.target;
    const updatedRows = [...editEducationRows];
    updatedRows[index][name] = value;
    setEditEducationRows(updatedRows);
  };

  const handleAddEditRow = () => {
    setEditEducationRows([...editEducationRows, { subject: "", grade: "" }]);
  };

  const handleRemoveEditRow = (index) => {
    const updatedRows = [...editEducationRows];
    updatedRows.splice(index, 1);
    setEditEducationRows(updatedRows);
  };

  return (
    <div>
      <div className='manageStudenttopBarDiv'>
        {Cookies.get("sisUsername") ? (
            <Topbar />
        ) : Cookies.get("employeeUsername") ? (
            <TopbarEmployee />
        ) : null}
      </div>
      <div className='manageStudentsideBarDiv'>
        {Cookies.get("sisUsername") ? (
            <Sidebar />
        ) : Cookies.get("employeeUsername") ? (
            <SidebarEmployee />
        ) : null}
      </div>
      <div className='manageStudentBoxDiv'>
        <div className="manageStudentcontainer">
          <div className="manageStudentdiv1">
            <h2 className="fs-2 m-0">STUDENT INFORMATION</h2>
          </div>
          <div className="manageStudentdiv2 d-flex align-items-center flex-wrap gap-2 mb-3">
            {/* Search input */}
            {/*<input
              type="text"
              placeholder="Name || ID || IC || Prog || CA"
              value={searchTerm}
              style={{ width: "200px" }}
              onChange={handleSearchInputChange}
              className="form-control me-2"
            />*/}

            <select
              value={searchMode}
              onChange={(e) => setSearchMode(e.target.value)}
              className="form-select me-2"
              style={{ width: "150px" }}
            >
              <option value="all">All Fields</option>
              <option value="ca">Course Advisor</option>
            </select>

            <input
              type="text"
              placeholder={
                searchMode === "ca" ? "Search by Course Advisor" : "Name / ID / IC / Prog"
              }
              value={searchTerm}
              onChange={handleSearchInputChange}
              className="form-control"
              style={{ width: "200px" }}
            />

            {/* Refresh button */}
            <Button
              id="btnRefresh"
              title="Refresh"
              className="btn btn-contact"
              onClick={() => window.location.reload()}
            >
              <FontAwesomeIcon icon={faRefresh} />
            </Button>

            {/* Conditionally show Add button */}
            {data1.some(item => item.category === "Manage Student" && item.accessType === "Read/Write") && (
              <Button
                title="Add"
                className="btn btn-contact"
                onClick={handleShow}
              >
                <FontAwesomeIcon icon={faPlus} />
              </Button>
            )}

            {/* More Info */}
            <Button
              title="More Info"
              className="btn btn-secondary"
              onClick={() => navigate("/manageProgram")}
            >
              <FontAwesomeIcon icon={faArrowRight} />
            </Button>
          </div>

          {/* Table Wrapper - Center Table */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <table className="styled-table" style={{ width: '80%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "center" }}>No</th>
                  <th style={{ textAlign: "center", cursor: "pointer" }} onClick={() => handleSort('studentProgram')}>
                    Program {sortConfig.key === 'studentProgram' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </th>
                  <th style={{ textAlign: "center", cursor: "pointer" }} onClick={() => handleSort('studentName')}>
                    Name {sortConfig.key === 'studentName' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </th>
                  <th style={{ textAlign: "center", cursor: "pointer" }} onClick={() => handleSort('studentIntake')}>
                    Intake {sortConfig.key === 'studentIntake' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </th>
                  <th style={{ textAlign: "center", cursor: "pointer" }} onClick={() => handleSort('studentNewStdID')}>
                    Student New ID {sortConfig.key === 'studentNewStdID' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </th>
                  <th style={{ textAlign: "center", cursor: "pointer" }} onClick={() => handleSort('studentEnrollDate')}>
                    Enroll Date {sortConfig.key === 'studentEnrollDate' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </th>
                  <th style={{ textAlign: "center", cursor: "pointer" }} onClick={() => handleSort('studentSalesPerson')}>
                    Course Advisor {sortConfig.key === 'studentSalesPerson' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </th>
                  <th style={{ textAlign: "center" }}>Student Password</th>
                  <th style={{ textAlign: "center" }}>Account Status</th>
                  <th style={{ textAlign: "center" }}>Remark</th>
                  <th style={{ textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((item, index) => (
                  <tr key={item.id}>
                    <td scope="row">{index + 1}</td>
                    <td>{item.studentProgram}</td>
                    <td>{item.studentName}</td>
                    <td>{item.studentIntake}</td>
                    <td>{item.studentNewStdID}</td>
                    <td>{item.studentEnrollDate}</td>
                    <td>{item.studentSalesPerson}</td>
                    <td>{item.studentPasswd}</td>
                    <td>{item.studentStatus}</td>
                    <td>{item.studentNotes}</td>
                    <td>
                      <div className="d-flex gap-1 justify-content-center">
                        {data1.some(item => item.category === "Manage Student") && (
                          <>
                            {employeeJobTitle === 'Course Counsellor' ? (
                              <button
                                id="btnFontIcon"
                                className="btn btn-info"
                                title="View"
                                style={{ fontSize: "10px" }}
                                onClick={() => handleEditShow(item)}
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </button>
                            ) : (
                              <>
                                <button
                                  id="btnFontIcon"
                                  className="btn btn-info"
                                  title="Edit"
                                  style={{ fontSize: "10px" }}
                                  onClick={() => handleEditShow(item)}
                                >
                                  <FontAwesomeIcon
                                    icon={
                                      data1.some(
                                        item =>
                                          item.category === "Manage Student" &&
                                          item.accessType === "Read Only"
                                      )
                                        ? faEye
                                        : faEdit
                                    }
                                  />
                                </button>

                                {data1.some(
                                  item =>
                                    item.category === "Manage Student" &&
                                    item.accessType === "Read/Write"
                                ) && (
                                  <button
                                    id="btnFontIcon"
                                    className="btn btn-warning"
                                    title="Delete"
                                    style={{ fontSize: "10px" }}
                                    onClick={() => deleteContact(item.id)}
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/*Add Modal*/}
          <Modal
            show={show}
            onHide={handleClose}
            dialogClassName="custom-modal"
            backdrop="static"
            keyboard={false}
            enforceFocus={true}
          >
            <Modal.Header closeButton>
                <Modal.Title style={{ color: '#151632' }}>Add Student Information</Modal.Title>
            </Modal.Header>
            <Modal.Body className="custom-modal-body">
              <Form>
                <Carousel 
                  interval={null} // Prevent automatic sliding
                  controls={false} // Disable navigation arrows
                  indicators={false} // Disable pagination dots
                >
                  {/* Personal Information Slide */}
                  <Carousel.Item style={{ height: "100%" }}>
                    <h6>PERSONAL INFORMATION</h6>
                    <hr></hr>
                      <div className="row">
                        {/* Fullname */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentName">
                            <Form.Label>Fullname*</Form.Label>
                            <Form.Control
                              type="text"
                              name='studentName'
                              placeholder="Enter Fullname"
                              onChange={handleInputChange}
                              autoFocus
                            />
                          </Form.Group>
                        </div>
                        {/* Student IC */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentMalaysiaIC">
                            <Form.Label>Student IC*</Form.Label>
                            <div className="input-group">
                              <Form.Control
                                type="text"
                                name='studentMalaysiaIC'
                                value={state.studentMalaysiaIC}
                                placeholder="Enter Student NRIC"
                                onChange={handleInputChange}
                                
                              />
                            </div>
                          </Form.Group>
                        </div>
                        {/* Student New ID */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentNewStdID">
                            <Form.Label>Student New ID*</Form.Label>
                            <Form.Control
                              type="text"
                              name="studentNewStdID"
                              placeholder="Auto Fill up"
                              disabled
                              onChange={handleInputChange}
                              
                            />
                          </Form.Group>
                        </div>
                        {/* Student Old ID */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentOldStdID">
                            <Form.Label>Student Old ID</Form.Label>
                            <Form.Control
                              type="text"
                              name="studentOldStdID"
                              placeholder="Enter Student Old ID"
                              onChange={handleInputChange}
                            />
                          </Form.Group>
                        </div>
                        {/* Mobile 1 */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentMobile1">
                            <Form.Label>Mobile 1*</Form.Label>
                            <div className="input-group">
                              <Form.Control
                                type="text"
                                name='studentMobile1'
                                placeholder="Enter Mobile 1 number: +60"
                                onChange={handleInputChange}
                                
                              />
                            </div>
                          </Form.Group>
                        </div>
                        {/* Mobile 2 */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentMobile2">
                            <Form.Label>Mobile 2</Form.Label>
                            <div className="input-group">
                              <Form.Control
                                type="text"
                                name='studentMobile2'
                                placeholder="Enter Mobile 2 number: +60"
                                onChange={handleInputChange}
                              />
                            </div>
                          </Form.Group>
                        </div>
                        {/* Email 1 */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentEmail1">
                            <Form.Label>Email 1*</Form.Label>
                            <Form.Control
                              type="email"
                              name='studentEmail1'
                              placeholder="Enter Email 1"
                              onChange={handleInputChange}
                              
                            />
                          </Form.Group>
                        </div>
                        {/* Email 2 */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentEmail2">
                            <Form.Label>Email 2</Form.Label>
                            <Form.Control
                              type="email"
                              name='studentEmail2'
                              placeholder="Enter Email 2"
                              onChange={handleInputChange}
                            />
                          </Form.Group>
                        </div>
                        {/* Date of Birth */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentBirthDate">
                            <Form.Label>Date of Birth</Form.Label>
                            <Form.Control
                              type="date"
                              name="studentBirthDate"
                              value={state.studentBirthDate}
                              onChange={handleInputChange}
                            />
                          </Form.Group>
                        </div>
                        {/* Age */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentAge">
                            <Form.Label>Age</Form.Label>
                            <Form.Control
                              type="text"
                              name="studentAge"
                              placeholder='Auto fill up'
                              disabled
                              value={state.studentAge}
                              onChange={handleInputChange}
                            />
                          </Form.Group>
                        </div>
                        {/* Address */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentAdress">
                            <Form.Label>Address*</Form.Label>
                            <Form.Control
                              type="text"
                              name="studentAdress"
                              placeholder="Enter Address"
                              onChange={handleInputChange}
                              
                            />
                          </Form.Group>
                        </div>
                        {/* Nationality */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentNationality">
                            <Form.Label>Nationality*</Form.Label>
                            <Form.Select
                              name="studentNationality"
                              onChange={handleInputChange}
                            >
                              <option value="">Select Nationality</option>
                              <option value="Malaysian">Malaysian</option>
                              <option value="Indonesian">Indonesian</option>
                              <option value="Singaporean">Singaporean</option>
                              <option value="Thai">Thai</option>
                              <option value="Filipino">Filipino</option>
                              <option value="Vietnamese">Vietnamese</option>
                              <option value="Indian">Indian</option>
                              <option value="Chinese">Chinese</option>
                              <option value="Bangladeshi">Bangladeshi</option>
                              <option value="Other">Other</option>
                            </Form.Select>
                          </Form.Group>
                        </div>
                        {/* Disease */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentDisease">
                            <Form.Label>Disease (If have)</Form.Label>
                            <Form.Control
                              type="text"
                              name='studentDisease'
                              placeholder="Enter Disease"
                              onChange={handleInputChange}
                            />
                          </Form.Group>
                        </div>
                        {/* Notes */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentNotes">
                            <Form.Label>Notes</Form.Label>
                            <Form.Control
                              type="text"
                              name='studentNotes'
                              placeholder="Enter Notes if any"
                              onChange={handleInputChange}
                            />
                          </Form.Group>
                        </div>
                      </div>

                    <br></br>

                    <h6>COURSE INFORMATION</h6>
                    <hr></hr>
                      <div className="row">
                        {/* Sales Person */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentSalesPerson">
                            <Form.Label>Sales Person*</Form.Label>
                            <Form.Select
                              name="studentSalesPerson"
                              onChange={handleInputChange}
                            >
                              <option value="">Select Sales Person</option>
                              <option value="Vicky">Vicky</option>
                              <option value="CK">CK</option>
                              <option value="Hsiao">Hsiao</option>
                              <option value="Colly">Colly</option>
                              <option value="Alan">Alan</option>
                              <option value="Kit">Kit</option>
                            </Form.Select>
                          </Form.Group>
                        </div>
                        {/* Select Program */}
                        <div className="col-md-6">
                        <Form.Group className="mb-3" controlId="selectedProgram">
                          <Form.Label>Select Program*</Form.Label>
                          <div style={{ position: 'relative' }}>
                            <Form.Control
                              as="select"
                              value={selectedProgram}
                              
                              onChange={handleProgramChange}
                            >
                              <option value="">Select Program</option>
                              <option value="DSG">Professional Degree in Software Engineering (DSG)</option>
                              <option value="DSE">Professional Diploma in Software Engineering (DSE)</option>
                              <option value="DIT">Professional Degree in IT Support (DIT)</option>
                              <option value="DIP">Professional Diploma in IT Support (DIP)</option>
                              <option value="DSGPT">Professional Part Time Degree in Software Engineering (DSGPT)</option>
                              <option value="DSEPT">Professional Part Time Diploma in Software Engineering (DSEPT)</option>
                              <option value="DITPT">Professional Part Time Degree in IT Support (DITPT)</option>
                              <option value="DIPPT">Professional Part Time Diploma in IT Support (DIPPT)</option>
                              <option value="CITS1">Professional Certificate if IT Support (CITS1)</option>
                              <option value="CITS2">Professional Certificate if IT Studies (CITS2)</option>
                            </Form.Control>
                            <FontAwesomeIcon icon={faCaretDown} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }} />
                          </div>
                        </Form.Group>
                        </div>
                        {/* Class Method */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentClassMethod">
                            <Form.Label>Class Method*</Form.Label>
                            <Form.Select
                              name="studentClassMethod"
                              onChange={handleInputChange}
                            >
                              <option value="">Select Class Method</option>
                              <option value="Physical">Physical</option>
                              <option value="Online">Online</option>
                            </Form.Select>
                          </Form.Group>
                        </div>
                        {/* Course Package */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentCoursePackages">
                            <Form.Label>Course Package*</Form.Label>
                            <Form.Select
                              name="studentCoursePackages"
                              onChange={handleInputChange}
                            >
                              <option value="">Select Course Package</option>
                              <option value="Basic">Basic</option>
                              <option value="Standard">Standard</option>
                              <option value="Premium">Premium</option>
                              <option value="Trial Class">Trial Class</option>
                              <option value="CITS">CITS</option>
                              <option value="DSE upgrade DSG">DSE upgrade DSG</option>
                              <option value="DIP upgrade DIT">DIP upgrade DIT</option>
                            </Form.Select>
                          </Form.Group>
                        </div>
                        {/* Enroll Date */}
                          <div className="col-md-6">
                            <Form.Group className="mb-3" controlId="studentEnrollDate">
                              <Form.Label>Enroll Date*</Form.Label>
                              <Form.Control
                                type="date"
                                name="studentEnrollDate"
                                onChange={handleInputChange}
                              />
                            </Form.Group>
                          </div>
                          {/* Intake */}
                          <div className="col-md-6">
                            <Form.Group className="mb-3" controlId="studentIntake">
                              <Form.Label>Intake</Form.Label>
                              <Form.Control
                                type="text"
                                name="studentIntake"
                                placeholder='Auto fill up'
                                value={state.studentIntake}
                                disabled
                              />
                            </Form.Group>
                          </div>
                      </div>

                    <br></br>

                    <h6>PARENT/GUARDIAN INFORMATION</h6>
                    <hr></hr>
                      <div className="row">
                        {/* Parent Name 1*/}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentPrtName1">
                            <Form.Label>Parent/Guardian Name 1*</Form.Label>
                            <Form.Control
                              type="text"
                              name="studentPrtName1"
                              placeholder="Enter Parent/Guardian Name 1"
                              onChange={handleInputChange}
                            />
                          </Form.Group>
                        </div>
                        {/* Parent Name 2*/}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentPrtName2">
                            <Form.Label>Parent/Guardian Name 2</Form.Label>
                            <Form.Control
                              type="text"
                              name="studentPrtName2"
                              placeholder="Enter Parent/Guardian Name 2"
                              onChange={handleInputChange}
                            />
                          </Form.Group>
                        </div>
                        {/* Parent IC 1*/}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentPrtIC1">
                            <Form.Label>First Parent 1/Guardian 1 IC*</Form.Label>
                            <Form.Control
                              type="text"
                              name="studentPrtIC1"
                              placeholder="Enter First Parent/Guardian IC"
                              onChange={handleInputChange}
                            />
                          </Form.Group>
                        </div>
                        {/* Parent IC 2*/}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentPrtIC2">
                            <Form.Label>Second Parent 2/Guardian 2 IC</Form.Label>
                            <Form.Control
                              type="text"
                              name="studentPrtIC2"
                              placeholder="Enter Second Parent/Guardian IC"
                              onChange={handleInputChange}
                            />
                          </Form.Group>
                        </div>
                        {/* Parent Mobile 1*/}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentPrtMobile1">
                            <Form.Label>Parent/Guardian Mobile 1*</Form.Label>
                            <Form.Control
                              type="text"
                              name="studentPrtMobile1"
                              placeholder="Enter Parent/Guardian Mobile 1"
                              onChange={handleInputChange}
                            />
                          </Form.Group>
                        </div>
                        {/* Parent Mobile 2*/}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentPrtMobile2">
                            <Form.Label>Parent/Guardian Mobile 2</Form.Label>
                            <Form.Control
                              type="text"
                              name="studentPrtMobile2"
                              placeholder="Enter Parent/Guardian Mobile 2"
                              onChange={handleInputChange}
                            />
                          </Form.Group>
                        </div>
                        {/* Parent Mobile 3*/}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentPrtMobile3">
                            <Form.Label>Parent/Guardian Mobile 3</Form.Label>
                            <Form.Control
                              type="text"
                              name="studentPrtMobile3"
                              placeholder="Enter Parent/Guardian Mobile 3"
                              onChange={handleInputChange}
                            />
                          </Form.Group>
                        </div>
                        {/* Parent Mobile 4*/}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentPrtMobile4">
                            <Form.Label>Parent/Guardian Mobile 4</Form.Label>
                            <Form.Control
                              type="text"
                              name="studentPrtMobile4"
                              placeholder="Enter Parent/Guardian Mobile 4"
                              onChange={handleInputChange}
                            />
                          </Form.Group>
                        </div>
                        {/* Parent Email 1*/}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentPrtEmail1">
                            <Form.Label>Parent/Guardian Email 1*</Form.Label>
                            <Form.Control
                              type="email"
                              name="studentPrtEmail1"
                              placeholder="Enter Parent/Guardian Email 1"
                              onChange={handleInputChange}
                            />
                          </Form.Group>
                        </div>
                        {/* Parent Email 2*/}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentPrtEmail2">
                            <Form.Label>Parent/Guardian Email 2</Form.Label>
                            <Form.Control
                              type="email"
                              name="studentPrtEmail2"
                              placeholder="Enter Parent/Guardian Email 2"
                              onChange={handleInputChange}
                            />
                          </Form.Group>
                        </div>
                      </div>
                    
                    <br></br>

                    <h6>ACCOUNT INFORMATION</h6>
                    <hr></hr>
                      <div className="row">
                        {/* Password*/}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentPasswd">
                            <Form.Label>Password</Form.Label>
                            <div className="input-group">
                              <Form.Control
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter Password"
                                name="studentPasswd"
                                className="form-control rounded-0"
                                onChange={handleInputChange}
                                value={state.studentPasswd || ""}
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
                        {/* Account Status*/}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentStatus">
                            <Form.Label>Account Status*</Form.Label>
                            <Form.Select
                              name="studentStatus"
                              onChange={handleStudentStatusChange}
                            >
                              <option value="">Select Account Status</option>
                              <option value="Active">Active</option>
                              <option value="Disabled">Disabled</option>
                            </Form.Select>
                          </Form.Group>
                        </div>
                      </div>

                    <br></br>

                    <h6>EDUCATION INFORMATION</h6>
                    <hr />
                    <div className="education-section">
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th>Subject</th>
                            <th>Grade</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {educationRows.map((row, index) => (
                            <tr key={index}>
                              <td>
                              <Form.Select
                                name="subject"
                                value={row.subject}
                                onChange={(e) => handleEducationChange(index, e)}
                              >
                                <option value="">Select Subject</option>
                                <option value="Bahasa Melayu">Bahasa Melayu</option>
                                <option value="Bahasa Inggeris">Bahasa Inggeris</option>
                                <option value="Pendidikan Moral">Pendidikan Moral</option>
                                <option value="Sejarah">Sejarah</option>
                                <option value="Mathematics">Mathematics</option>
                                <option value="Additional Mathematics">Additional Mathematics</option>
                                <option value="Physics">Physics</option>
                                <option value="Chemistry">Chemistry</option>
                                <option value="Biology">Biology</option>
                                <option value="Bahasa Tamil">Bahasa Tamil</option>
                                <option value="Bahasa Cina">Bahasa Cina</option>
                              </Form.Select>
                            </td>
                              <td>
                                <Form.Control
                                  type="text"
                                  name="grade"
                                  placeholder="Enter Grade"
                                  value={row.grade}
                                  onChange={(e) => handleEducationChange(index, e)}
                                />
                              </td>
                              <td>
                                <Button
                                  variant="danger"
                                  onClick={() => handleRemoveRow(index)}
                                  disabled={educationRows.length === 1}
                                >
                                  Remove
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <Button variant="secondary" onClick={handleAddRow}>
                        + Add Row
                      </Button>
                    </div>

                  </Carousel.Item>
                  
                </Carousel>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button className='submitBtn' onClick={handleSubmit} variant="primary">Add</Button>
            </Modal.Footer>
          </Modal>
          
          {/* Edit Modal */}
          <Modal
            show={editShow}
            onHide={handleEditClose}
            dialogClassName="custom-modal"
            backdrop="static"
            keyboard={false}
            enforceFocus={true}
          >
            <Modal.Header closeButton>
            <Modal.Title style={{ color: '#151632' }}>
              {employeeJobTitle === 'Course Counsellor'
                ? "View Student Information"
                : data1.some(item => item.category === "Manage Student" && item.accessType === "Read Only")
                  ? "View Student Information"
                  : "Update Student Information"
              }
            </Modal.Title>
            </Modal.Header>
            <Modal.Body className="custom-modal-body">
              <Form>
                <Carousel 
                  interval={null} // Prevent automatic sliding
                  controls={false} // Disable navigation arrows
                  indicators={false} // Disable pagination dots
                >
                  {/* Personal Information Slide */}
                  <Carousel.Item style={{ height: "100%" }}>
                    <h6>PERSONAL INFORMATION</h6>
                    <hr></hr>
                      <div className="row">
                        {/* Fullname */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentName">
                            <Form.Label>Fullname*</Form.Label>
                            <Form.Control
                              type="text"
                              name='studentName'
                              placeholder="Enter Fullname"
                              value={editData ? editData.studentName : ""}
                              onChange={(e) => handleEditInputChange('studentName', e.target.value)}
                              autoFocus
                            />
                          </Form.Group>
                        </div>
                        {/* Student IC */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentMalaysiaIC">
                            <Form.Label>Student IC*</Form.Label>
                            <div className="input-group">
                              <Form.Control
                                type="text"
                                name='studentMalaysiaIC'
                                placeholder="Without Dash"
                                value={editData ? editData.studentMalaysiaIC : ""}
                                onChange={(e) => handleEditInputChange('studentMalaysiaIC', e.target.value)}
                              />
                            </div>
                          </Form.Group>
                        </div>
                        {/* Student New ID */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentNewStdID">
                            <Form.Label>Student New ID*</Form.Label>
                            <Form.Control
                              type="text"
                              name="studentNewStdID"
                              placeholder="Auto Fill up"
                              disabled
                              value={editData ? editData.studentNewStdID : ""}
                              onChange={(e) => handleEditInputChange('studentNewStdID', e.target.value)}
                            />
                          </Form.Group>
                        </div>
                        {/* Student Old ID */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentOldStdID">
                            <Form.Label>Student Old ID</Form.Label>
                            <Form.Control
                              type="text"
                              name="studentOldStdID"
                              placeholder="Enter Student Old ID"
                              value={editData ? editData.studentOldStdID : ""}
                              onChange={(e) => handleEditInputChange('studentOldStdID', e.target.value)}
                            />
                          </Form.Group>
                        </div>
                        {/* Mobile 1 */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentMobile1">
                            <Form.Label>Mobile 1*</Form.Label>
                            <div className="input-group">
                              <Form.Control
                                type="text"
                                name='studentMobile1'
                                placeholder="Enter Mobile 1 number: +60"
                                value={editData ? editData.studentMobile1 : ""}
                                onChange={(e) => handleEditInputChange('studentMobile1', e.target.value)}
                              />
                            </div>
                          </Form.Group>
                        </div>
                        {/* Mobile 2 */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentMobile2">
                            <Form.Label>Mobile 2</Form.Label>
                            <div className="input-group">
                              <Form.Control
                                type="text"
                                name='studentMobile2'
                                placeholder="Enter Mobile 2 number: +60"
                                value={editData ? editData.studentMobile2 : ""}
                                onChange={(e) => handleEditInputChange('studentMobile2', e.target.value)}
                              />
                            </div>
                          </Form.Group>
                        </div>
                        {/* Email 1 */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentEmail1">
                            <Form.Label>Email 1*</Form.Label>
                            <Form.Control
                              type="email"
                              name='studentEmail1'
                              placeholder="Enter Email 1"
                              value={editData ? editData.studentEmail1 : ""}
                              onChange={(e) => handleEditInputChange('studentEmail1', e.target.value)}
                            />
                          </Form.Group>
                        </div>
                        {/* Email 2 */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentEmail2">
                            <Form.Label>Email 2</Form.Label>
                            <Form.Control
                              type="email"
                              name='studentEmail2'
                              placeholder="Enter Email 2"
                              value={editData ? editData.studentEmail2 : ""}
                              onChange={(e) => handleEditInputChange('studentEmail2', e.target.value)}
                            />
                          </Form.Group>
                        </div>
                        {/* Date of Birth */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentBirthDate">
                            <Form.Label>Date of Birth</Form.Label>
                            <Form.Control
                              type="date"
                              name="studentBirthDate"
                              value={editData ? editData.studentBirthDate : ""}
                              onChange={(e) => handleEditInputChange('studentBirthDate', e.target.value)}
                            />
                          </Form.Group>
                        </div>
                        {/* Age */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentAge">
                            <Form.Label>Age</Form.Label>
                            <Form.Control
                              type="text"
                              name="studentAge"
                              disabled
                              value={editData ? editData.studentAge : ""}
                              onChange={(e) => handleEditInputChange('studentAge', e.target.value)}
                            />
                          </Form.Group>
                        </div>
                        {/* Address */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentAdress">
                            <Form.Label>Address*</Form.Label>
                            <Form.Control
                              type="text"
                              name="studentAdress"
                              placeholder="Enter Address"
                              value={editData ? editData.studentAdress : ""}
                              onChange={(e) => handleEditInputChange('studentAdress', e.target.value)}
                            />
                          </Form.Group>
                        </div>
                        {/* Nationality */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentNationality">
                            <Form.Label>Nationality*</Form.Label>
                            <Form.Select
                              name="studentNationality"
                              value={editData ? editData.studentNationality : ""}
                              onChange={(e) => handleEditInputChange('studentNationality', e.target.value)}
                            >
                              <option value="">Select Nationality</option>
                              <option value="Malaysian">Malaysian</option>
                              <option value="Indonesian">Indonesian</option>
                              <option value="Singaporean">Singaporean</option>
                              <option value="Thai">Thai</option>
                              <option value="Filipino">Filipino</option>
                              <option value="Vietnamese">Vietnamese</option>
                              <option value="Indian">Indian</option>
                              <option value="Chinese">Chinese</option>
                              <option value="Bangladeshi">Bangladeshi</option>
                              <option value="Other">Other</option>
                            </Form.Select>
                          </Form.Group>
                        </div>
                        {/* Disease */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentDisease">
                            <Form.Label>Disease (If have)</Form.Label>
                            <Form.Control
                              type="text"
                              name='studentDisease'
                              placeholder="Enter Disease"
                              value={editData ? editData.studentDisease : ""}
                              onChange={(e) => handleEditInputChange('studentDisease', e.target.value)}
                            />
                          </Form.Group>
                        </div>
                        {/* Notes */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentNotes">
                            <Form.Label>Notes</Form.Label>
                            <Form.Control
                              type="text"
                              name='studentNotes'
                              placeholder="Enter Notes if any"
                              value={editData ? editData.studentNotes : ""}
                              onChange={(e) => handleEditInputChange('studentNotes', e.target.value)}
                            />
                          </Form.Group>
                        </div>
                      </div>

                    <br></br>

                    <h6>COURSE INFORMATION</h6>
                    <hr></hr>
                      <div className="row">
                        {/* Sales Person */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentSalesPerson">
                            <Form.Label>Sales Person*</Form.Label>
                            <Form.Select
                              name="studentSalesPerson"
                              value={editData ? editData.studentSalesPerson : ""}
                              onChange={(e) => handleEditInputChange('studentSalesPerson', e.target.value)}
                            >
                              <option value="">Select Sales Person</option>
                              <option value="Vicky">Vicky</option>
                              <option value="CK">CK</option>
                              <option value="Hsiao">Hsiao</option>
                              <option value="Colly">Colly</option>
                              <option value="Alan">Alan</option>
                              <option value="Kit">Kit</option>
                            </Form.Select>
                          </Form.Group>
                        </div>
                        {/* Course */}
                        <div className="col-md-6">
                        <Form.Group className="mb-3" controlId="editSelectedProgram">
                        <Form.Label>Select Program*</Form.Label>
                        <div style={{ position: 'relative' }}>
                          <Form.Control
                            as="select"
                            value={editData ? editData.studentProgram : ""}
                            onChange={e => {
                              setEditData({
                                ...editData,
                                studentProgram: e.target.value
                              });
                            }}
                          >
                            <option value="">Select Program</option>
                              <option value="DSG">Professional Degree in Software Engineering (DSG)</option>
                              <option value="DSE">Professional Diploma in Software Engineering (DSE)</option>
                              <option value="DIT">Professional Degree in IT Support (DIT)</option>
                              <option value="DIP">Professional Diploma in IT Support (DIP)</option>
                              <option value="DSGPT">Professional Part Time Degree in Software Engineering (DSGPT)</option>
                              <option value="DSEPT">Professional Part Time Diploma in Software Engineering (DSEPT)</option>
                              <option value="DITPT">Professional Part Time Degree in IT Support (DITPT)</option>
                              <option value="DIPPT">Professional Part Time Diploma in IT Support (DIPPT)</option>
                              <option value="CITS1">Professional Certificate if IT Support (CITS1)</option>
                              <option value="CITS2">Professional Certificate if IT Studies (CITS2)</option>
                          </Form.Control>
                          <FontAwesomeIcon 
                            icon={faCaretDown} 
                            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }} 
                          />
                        </div>
                      </Form.Group>
                        </div>
                        {/* Class Method */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentClassMethod">
                            <Form.Label>Class Method</Form.Label>
                            <Form.Select
                              name="studentClassMethod"
                              value={editData ? editData.studentClassMethod : ""}
                              onChange={(e) => handleEditInputChange('studentClassMethod', e.target.value)}
                            >
                              <option value="">Select Class Method</option>
                              <option value="Physical">Physical</option>
                              <option value="Online">Online</option>
                            </Form.Select>
                          </Form.Group>
                        </div>
                        {/* Course Package */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentCoursePackages">
                            <Form.Label>Course Package*</Form.Label>
                            <Form.Select
                              name="studentCoursePackages"
                              value={editData ? editData.studentCoursePackages : ""}
                              onChange={(e) => handleEditInputChange('studentCoursePackages', e.target.value)}
                            >
                              <option value="">Select Course Package</option>
                              <option value="Basic">Basic</option>
                              <option value="Standard">Standard</option>
                              <option value="Premium">Premium</option>
                              <option value="Trial Class">Trial Class</option>
                              <option value="CITS">CITS</option>
                              <option value="DSE upgrade DSG">DSE upgrade DSG</option>
                              <option value="DIP upgrade DIT">DIP upgrade DIT</option>
                            </Form.Select>
                          </Form.Group>
                        </div>
                        {/* Enroll Date */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentEnrollDate">
                            <Form.Label>Enroll Date*</Form.Label>
                            <Form.Control
                              type="date"
                              name="studentEnrollDate"
                              value={
                                editData && editData.studentEnrollDate
                                  ? format(new Date(editData.studentEnrollDate), 'yyyy-MM-dd')
                                  : ""
                              }
                              onChange={(e) => handleEditInputChange('studentEnrollDate', e.target.value)}
                            />
                          </Form.Group>
                        </div>
                        {/* Intake */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentIntake">
                            <Form.Label>Intake</Form.Label>
                            <Form.Control
                              type="text"
                              name="studentIntake"
                              value={editData ? editData.studentIntake : ""}
                              disabled
                            />
                          </Form.Group>
                        </div>
                        {/* Date of Complete */}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentCompleted">
                            <Form.Label>Date of Completed</Form.Label>
                            <Form.Control
                              type="date"
                              name="studentCompleted"
                              value={
                                editData && editData.studentCompleted
                                  ? format(new Date(editData.studentCompleted), 'yyyy-MM-dd')
                                  : ""
                              }
                              onChange={(e) => handleEditInputChange('studentCompleted', e.target.value)}
                            />
                          </Form.Group>
                        </div>
                      </div>

                    <br></br>

                    <h6>PARENT/GUARDIAN INFORMATION</h6>
                    <hr></hr>
                      <div className="row">
                        {/* Parent Name 1*/}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentPrtName1">
                            <Form.Label>Parent/Guardian Name 1*</Form.Label>
                            <Form.Control
                              type="text"
                              name="studentPrtName1"
                              placeholder="Enter Parent/Guardian Name 1"
                              value={editData ? editData.studentPrtName1 : ""}
                              onChange={(e) => handleEditInputChange('studentPrtName1', e.target.value)}
                            />
                          </Form.Group>
                        </div>
                        {/* Parent Name 2*/}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentPrtName2">
                            <Form.Label>Parent/Guardian Name 2</Form.Label>
                            <Form.Control
                              type="text"
                              name="studentPrtName2"
                              placeholder="Enter Parent/Guardian Name 2"
                              value={editData ? editData.studentPrtName2 : ""}
                              onChange={(e) => handleEditInputChange('studentPrtName2', e.target.value)}
                            />
                          </Form.Group>
                        </div>
                        {/* Parent IC 1*/}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentPrtIC1">
                            <Form.Label>First Parent/Guardian IC 1*</Form.Label>
                            <Form.Control
                              type="text"
                              name="studentPrtIC1"
                              placeholder="Enter First Parent/Guardian IC"
                              value={editData ? editData.studentPrtIC1 : ""}
                              onChange={(e) => handleEditInputChange('studentPrtIC1', e.target.value)}
                            />
                          </Form.Group>
                        </div>
                        {/* Parent IC 2*/}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentPrtIC2">
                            <Form.Label>Second Parent/Guardian IC 2</Form.Label>
                            <Form.Control
                              type="text"
                              name="studentPrtIC2"
                              placeholder="Enter Second Parent/Guardian IC"
                              value={editData ? editData.studentPrtIC2 : ""}
                              onChange={(e) => handleEditInputChange('studentPrtIC2', e.target.value)}
                            />
                          </Form.Group>
                        </div>
                        {/* Parent Mobile 1*/}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentPrtMobile1">
                            <Form.Label>Parent/Guardian Mobile 1*</Form.Label>
                            <Form.Control
                              type="text"
                              name="studentPrtMobile1"
                              placeholder="Enter Parent/Guardian Mobile 1"
                              value={editData ? editData.studentPrtMobile1 : ""}
                              onChange={(e) => handleEditInputChange('studentPrtMobile1', e.target.value)}
                            />
                          </Form.Group>
                        </div>
                        {/* Parent Mobile 2*/}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentPrtMobile2">
                            <Form.Label>Parent/Guardian Mobile 2</Form.Label>
                            <Form.Control
                              type="text"
                              name="studentPrtMobile2"
                              placeholder="Enter Parent/Guardian Mobile 2"
                              value={editData ? editData.studentPrtMobile2 : ""}
                              onChange={(e) => handleEditInputChange('studentPrtMobile2', e.target.value)}
                            />
                          </Form.Group>
                        </div>
                        {/* Parent Mobile 3*/}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentPrtMobile3">
                            <Form.Label>Parent/Guardian Mobile 3</Form.Label>
                            <Form.Control
                              type="text"
                              name="studentPrtMobile3"
                              placeholder="Enter Parent/Guardian Mobile 3"
                              value={editData ? editData.studentPrtMobile3 : ""}
                              onChange={(e) => handleEditInputChange('studentPrtMobile3', e.target.value)}
                            />
                          </Form.Group>
                        </div>
                        {/* Parent Mobile 4*/}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentPrtMobile4">
                            <Form.Label>Parent/Guardian Mobile 4</Form.Label>
                            <Form.Control
                              type="text"
                              name="studentPrtMobile4"
                              placeholder="Enter Parent/Guardian Mobile 4"
                              value={editData ? editData.studentPrtMobile4 : ""}
                              onChange={(e) => handleEditInputChange('studentPrtMobile4', e.target.value)}
                            />
                          </Form.Group>
                        </div>
                        {/* Parent Email 1*/}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentPrtEmail1">
                            <Form.Label>Parent/Guardian Email 1*</Form.Label>
                            <Form.Control
                              type="email"
                              name="studentPrtEmail1"
                              placeholder="Enter Parent/Guardian Email 1"
                              value={editData ? editData.studentPrtEmail1 : ""}
                              onChange={(e) => handleEditInputChange('studentPrtEmail1', e.target.value)}
                            />
                          </Form.Group>
                        </div>
                        {/* Parent Email 2*/}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentPrtEmail2">
                            <Form.Label>Parent/Guardian Email 2</Form.Label>
                            <Form.Control
                              type="email"
                              name="studentPrtEmail2"
                              placeholder="Enter Parent/Guardian Email 2"
                              value={editData ? editData.studentPrtEmail2 : ""}
                              onChange={(e) => handleEditInputChange('studentPrtEmail2', e.target.value)}
                            />
                          </Form.Group>
                        </div>
                      </div>
                    
                    <br></br>

                    <h6>ACCOUNT INFORMATION</h6>
                    <hr></hr>
                      <div className="row">
                        {/* Password*/}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentPasswd">
                            <Form.Label>Password</Form.Label>
                            <div className="input-group">
                              <Form.Control
                                type={showPassword ? 'text' : 'password'}
                                name="studentPasswd"
                                placeholder="Enter Password"
                                value={editData ? editData.studentPasswd : ""}
                                onChange={(e) => handleEditInputChange('studentPasswd', e.target.value)}
                                className="form-control rounded-0"
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
                        {/* Account Status*/}
                        <div className="col-md-6">
                          <Form.Group className="mb-3" controlId="studentStatus">
                            <Form.Label>Account Status</Form.Label>
                            <Form.Select
                              name="studentStatus"
                              value={editData ? editData.studentStatus : ""}
                              onChange={(e) => handleEditInputChange('studentStatus', e.target.value)}
                            >
                              <option value="">Select Account Status</option>
                              <option value="Active">Active</option>
                              <option value="Disabled">Disabled</option>
                            </Form.Select>
                          </Form.Group>
                        </div>
                      </div>

                    <br />

                    <h6>EDUCATION INFORMATION</h6>
                    <hr />
                    <div className="education-section">
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th>Subject</th>
                            <th>Grade</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {editEducationRows.map((row, index) => (
                            <tr key={index}>
                              <td>
                                <Form.Select
                                  name="subject"
                                  value={row.subject}
                                  onChange={(e) => handleEditEducationChange(index, e)}
                                >
                                  <option value="">Select Subject</option>
                                  <option value="Bahasa Melayu">Bahasa Melayu</option>
                                  <option value="Bahasa Inggeris">Bahasa Inggeris</option>
                                  <option value="Pendidikan Moral">Pendidikan Moral</option>
                                  <option value="Sejarah">Sejarah</option>
                                  <option value="Mathematics">Mathematics</option>
                                  <option value="Additional Mathematics">Additional Mathematics</option>
                                  <option value="Physics">Physics</option>
                                  <option value="Chemistry">Chemistry</option>
                                  <option value="Biology">Biology</option>
                                  <option value="Bahasa Tamil">Bahasa Tamil</option>
                                  <option value="Bahasa Cina">Bahasa Cina</option>
                                </Form.Select>
                              </td>
                              <td>
                                <Form.Control
                                  type="text"
                                  name="grade"
                                  placeholder="Enter Grade"
                                  value={row.grade}
                                  onChange={(e) => handleEditEducationChange(index, e)}
                                />
                              </td>
                              <td>
                                <Button
                                  variant="danger"
                                  onClick={() => handleRemoveEditRow(index)}
                                  disabled={editEducationRows.length === 1}
                                >
                                  Remove
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <Button variant="secondary" onClick={handleAddEditRow}>
                        + Add Row
                      </Button>
                    </div>
                  </Carousel.Item>
                  
                </Carousel>
              </Form>
            </Modal.Body>

            {employeeJobTitle !== 'Course Counsellor' &&
              data1.some(item => item.category === "Manage Student" && item.accessType === "Read/Write") && (
                <Modal.Footer>
                  <Button
                    className="submitBtn"
                    style={{ float: 'right' }}
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