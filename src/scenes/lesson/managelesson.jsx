import React, { useState, useEffect } from 'react';
import axios from "axios";
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPencil, faEye, faCaretDown, faChevronUp, faChevronDown, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { Button, Modal, Form, Carousel, Table } from 'react-bootstrap';
import Sidebar from "../global/Sidebar";
import SidebarEmployee from "../global/SidebarEmployee";
import Topbar from "../global/Topbar";
import TopbarEmployee from '../global/TopbarEmployee';
import { adminLocalhost } from '../../localhost/adminLocalhost';
import { employeeLocalhost } from '../../localhost/employeeLocalhost';
import { studentLocalhost } from '../../localhost/studentLocalhost';
import Cookies from 'js-cookie';
import './managelesson.css';

export default function ManageClass() {

  const [editData, setEditData] = useState({
  classEnrollDateProgCode: "",
  classCourseCode: "",
  classStudents: "",
  classStudentsID: "",
  classTeacherName: "",
  classProgram: "",
  classTime: "",
  classStartDate: "",
  classEndDate: "",
  classCourse: "",
  classDayType: "",
  attendanceCourseName: "",
  classMarkingTemplate: ""
});

const [data, setData] = useState([]);
const [data3, setData3] = useState([]);
const [lessonShow, setLessonShow] = useState(false);
const [dates, setDates] = useState([]);
const [dates1, setDates1] = useState([]);
const [attendanceData, setAttendanceData] = useState([]);
const [classTimes, setClassTimes] = useState(dates.map(() => ""));
const [labels, setLabels] = useState(Array(dates.length).fill(""));
const [searchTerm, setSearchTerm] = useState('');
const [timeInfo, setTimeInfo] = useState([]);
const [selectedMarkingTemplate, setSelectedMarkingTemplate] = useState('');
const [expandedSemesters, setExpandedSemesters] = useState({});
const [expandedPrograms, setExpandedPrograms] = useState({});
const [lessonFetched, setLessonFetched] = useState(false);

const handleClassTimeChange = (index, value) => {
  const newClassTimes = [...classTimes];
  newClassTimes[index] = value;
  setClassTimes(newClassTimes);
};

const handleLabelChange = (index, value) => {
  const newLabels = [...labels];
  newLabels[index] = value;
  setLabels(newLabels);
};

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

// load data
useEffect(() => {
  loadData();
}, []);

//load data1
useEffect(() => {
  loadData1();
}, []);

//load data3
useEffect(() => {
  loadData3();
}, []);

// get date range
useEffect(() => {
  if (editData.classStartDate && editData.classEndDate) {
    const dateArray = getDatesInRange(editData.classStartDate, editData.classEndDate);
    const filteredDates = filterDatesByDayType(dateArray, editData.classDayType);
    setDates(filteredDates);
    setDates1(filteredDates);
  }
}, [editData.classStartDate, editData.classEndDate, editData.classDayType]);

{/* List down Time Info */}
useEffect(() => {
  axios.get(`${adminLocalhost}/time/time-info`)
    .then(response => {
      const sortedTimeInfo = [...response.data].sort((a, b) => a.localeCompare(b));
      setTimeInfo(sortedTimeInfo);
    })
    .catch(error => {
      console.error('Error fetching time info:', error);
    });
}, []);

//get course name
useEffect(() => {
if (editData && editData.classCourseCode !== '') {
  fetch(`${adminLocalhost}/course/getcourseName/${editData.classCourseCode}`)
    .then(response => response.json())
    .then(data => {
      setEditData(prevData => ({
        ...prevData,
        classCourse: data[0]
      }));
    })
    .catch(error => {
      console.error('Error fetching course name:', error);
    });
}
}, [editData, editData.classCourseCode]);

//Remember the expand table row
useEffect(() => {
  const savedSemester = localStorage.getItem("expandedSemester");
  const savedProgram = JSON.parse(localStorage.getItem("expandedProgram"));

  if (savedSemester) {
      setExpandedSemesters({ [savedSemester]: true });
  }

  if (savedProgram) {
      setExpandedPrograms({ [`${savedProgram.semester}-${savedProgram.program}`]: true });
  }
}, []);

// Remember the lesson data
useEffect(() => {
  if (dates.length > 0) {
    if (classTimes.length !== dates.length) {
      setClassTimes(Array(dates.length).fill(""));
    }
    if (labels.length !== dates.length) {
      setLabels(Array(dates.length).fill(""));
    }
  }
}, [dates]);

//fetch classTime data
useEffect(() => {
  if (lessonFetched && classTimes.length !== dates.length) {
    setClassTimes(prev => {
      const filled = [...prev];
      while (filled.length < dates.length) filled.push("");
      return filled.slice(0, dates.length); // match exact length
    });
    setLessonFetched(false); // reset flag
  }
}, [lessonFetched, dates, classTimes.length]);


const loadData1 = async () => {
  try {
    const response = await axios.get(`${employeeLocalhost}/attendance/getAttendanceDetails`);
    setAttendanceData(response.data);
  } catch (error) {
    console.error('Error occurred while fetching course details:', error);
  }
};

const filteredData = data.filter((item, index, self) => {
  // Check if the current item's EnrollDate or Course matches the search term
  const courseMatch = item.classCourseCode.toLowerCase().includes(searchTerm.toLowerCase());
  const enrollDateMatch = item.classEnrollDateProgCode.toLowerCase().includes(searchTerm.toLowerCase());
  
  // Check if the current item's EnrollDate and Course are unique
  const uniqueItem = index === self.findIndex((t) => (
      t.classEnrollDateProgCode === item.classEnrollDateProgCode && t.classCourseCode === item.classCourseCode
  ));

  // Return true if the item matches either the search term or is unique
  return (courseMatch || enrollDateMatch) && uniqueItem;
}).sort((a, b) => a.classCourseCode.localeCompare(b.classCourseCode));

const getDatesInRange = (start, end) => {
  const date = new Date(start);
  const endDate = new Date(end);
  const dates = [];

  while (date <= endDate) {
    dates.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }

  return dates;
};

const filterDatesByDayType = (dates, dayType) => {
  if (!dayType) return dates;

  const daysOfWeek = {
    '2 days Only - 1': [1, 3],
    '2 days Only - 2': [2, 4],
    '4 days': [1, 2, 3, 4],
    '5 days': [1, 2, 3, 4, 5],
    '7 days': [1, 2, 3, 4, 5, 6, 7],
    'Friday Only': [5],
    'Same Day': null
  };

  if (dayType === 'Same Day') {
    const duplicatedDates = [];
    for (const date of dates) {
      duplicatedDates.push(new Date(date));
      duplicatedDates.push(new Date(date));
    }
    return duplicatedDates;
  }

  const selectedDays = daysOfWeek[dayType];

  return dates.filter(date => selectedDays.includes(date.getDay()));
};

const formatDate = (date) => {
  const day = date.getDate().toString().padStart(2, '0');
  let month = date.toLocaleString('en-GB', { month: 'short' });
  const year = date.getFullYear();
  const weekday = date.toLocaleString('en-GB', { weekday: 'short' });

  if (month === "Sept") {
    month = "Sep";
  }

  return `${day}-${month}-${year} (${weekday})`;
};

const loadData = async () => {
  try {
      const classResponse = await axios.get(`${adminLocalhost}/class/getClassDetails`);
      setData(classResponse.data);
  } catch (error) {
      console.error('Error occurred while fetching data:', error);
  }
};

const deleteLessonData = (item) => {
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
          axios.delete(`${employeeLocalhost}/attendance/deleteAttendance/${item.classEnrollDateProgCode}/${item.classCourseCode}`);
          axios.delete(`${studentLocalhost}/studentAttendance/deleteStdAtd/${item.classEnrollDateProgCode}/${item.classCourseCode}`);
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
};

const handleSubmitLesson = async () => {
  try {
    const finalLabels = labels.map((label, index) => label || getLessonLabel(index));
    const finalClassTimes = classTimes.map((time) => time || "");
    const hasEmptyLesson = finalLabels.some(label => label.trim() === "");
    const hasEmptyClassTime = finalClassTimes.some(time => time.trim() === "");

    if (hasEmptyLesson || hasEmptyClassTime) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Data',
        text: 'Please fill in all Lesson Names and Class Times before submitting.',
      });
      return;
    }

    const formattedLessonNames = finalLabels.join(", ");
    const lessonDates = dates.map(date => formatDate(date));
    const attendanceCourse = editData.classCourseCode;
    const attendanceEnroll = editData.classEnrollDateProgCode;

    const attendanceFormData = {
      attendanceClassStartDate: editData.classStartDate,
      attendanceClassEndDate: editData.classEndDate,
      attendanceClassTime: finalClassTimes.join(", "),
      attendanceClassDayType: editData.classDayType,
      attendanceTeacherName: editData.classTeacherName,
      attendanceEnrollDate: attendanceEnroll,
      attendanceCourse: attendanceCourse,
      attendanceClassLessonDate: lessonDates.join(", "),
      attendanceClassLesson: formattedLessonNames,
      attendanceCourseName: editData.classCourse,
      attendanceProgram: editData.classProgram,
      attendanceMarkTemplate: selectedMarkingTemplate,
      attendanceSemester: editData.classSemester
    };

    const classTimeData = finalClassTimes.join(", ");

    // 1. Check if attendance header already exists
    const checkResponse = await axios.get(`${employeeLocalhost}/attendance/getAttendanceDetails1/${attendanceEnroll}/${attendanceCourse}`);
    const attendanceExists = checkResponse.data.length > 0;

    if (attendanceExists) {
      await axios.delete(`${employeeLocalhost}/attendance/deleteAttendance/${attendanceEnroll}/${attendanceCourse}`);
    }

    // 2. Add or re-add the lesson attendance header
    await axios.post(`${employeeLocalhost}/attendance/addAttendance`, attendanceFormData);

    // 3. Fetch existing studentAttendance records to preserve stdAtdName, ID, Status
    const existingAttendanceRes = await axios.get(`${studentLocalhost}/studentAttendance/getAttendanceByEnrollDateProgCodeAndCourse/${attendanceEnroll}/${attendanceCourse}`);
    const existingRecords = existingAttendanceRes.data;

    const findExisting = (date) =>
      existingRecords.find((entry) => entry.stdAtdDate === date);

    // 4. Upsert studentAttendance for each lesson date
    for (let i = 0; i < lessonDates.length; i++) {
      const date = lessonDates[i];
      const existing = findExisting(date);

      const uploadData = {
        stdAtdName: existing?.stdAtdName || "",
        stdAtdID: existing?.stdAtdID || "",
        stdAtdStatus: existing?.stdAtdStatus || "",
        stdAtdDate: date,
        stdAtdCourse: attendanceCourse,
        stdAtdEnrollDateProgCode: attendanceEnroll,
        stdAtdCourseName: editData.classCourse,
        stdAtdSemester: editData.classSemester
      };

      await axios.post(`${studentLocalhost}/studentAttendance/addStudentAttendance`, uploadData);
    }

    // 5. Update Class Time field in Class table
    await axios.put(`${adminLocalhost}/class/updateClassTime/${editData.id}`, classTimeData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: 'Lessons submitted successfully!',
      showConfirmButton: false,
      timer: 1500
    }).then(() => {
      setLabels(Array(dates.length).fill(""));
      setClassTimes(Array(dates.length).fill(""));
      setDates(dates1); // Assuming dates1 is your base reference
      setLessonShow(false);
      loadData(); // Refresh view
    });

  } catch (error) {
    console.error('Error occurred while submitting lesson:', error);
    Swal.fire({
      icon: 'error',
      title: 'Submission Failed',
      text: 'Something went wrong while submitting lessons.',
    });
  }
};

const handleLessonClose = () => {

  //setLabels(Array(dates.length).fill(""));
  //setClassTimes(Array(dates.length).fill(""));
  //setDates(dates1);
  setLessonShow(false);
};

const handleLesson = async (item) => {
  setEditData(item);
  setSelectedMarkingTemplate(item.classMarkingTemplate);

  try {
    const response = await axios.get(`${employeeLocalhost}/attendance/getAttendanceDetails1/${item.classEnrollDateProgCode}/${item.classCourseCode}`);

    if (response.data.length > 0) {
      const lessonArray = response.data[0].attendanceClassLesson.split(',').map(name => name.trim());
      const lessonDateArray = response.data[0].attendanceClassLessonDate.split(',').map(date => date.trim());
      const timeArray = response.data[0].attendanceClassTime?.split(',').map(t => t.trim()) || [];

      const parsedDates = lessonDateArray.map(dateStr => new Date(dateStr));

      setLabels(lessonArray);
      setDates(parsedDates);
      setClassTimes(timeArray);
      setLessonFetched(true);
    } else {
      setLabels([]);
      setDates([]);
      setClassTimes([]);
    }

    setTimeout(() => setLessonShow(true), 0);
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    setLabels([]);
    setDates([]);
    setClassTimes([]);
  }
};

const deleteLesson = (event, index) => {
  event.preventDefault();
  setDates(dates.filter((_, i) => i !== index));
};

const handleSearchInputChange = (e) => {
  setSearchTerm(e.target.value);
};

const handleDateChange = (index, newDateStr) => {
  const updatedDates = [...dates];
  updatedDates[index] = new Date(newDateStr);
  setDates(updatedDates);
};

const formatDateForInput = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (`0${d.getMonth() + 1}`).slice(-2);
  const day = (`0${d.getDate()}`).slice(-2);
  return `${year}-${month}-${day}`;
};

// Toggle Semester Expand/Collapse
const toggleSemester = (semester) => {
  const isExpanded = !expandedSemesters[semester];
  setExpandedSemesters({ [semester]: isExpanded });

  if (isExpanded) {
      localStorage.setItem("expandedSemester", semester); // Save last expanded semester
  } else {
      localStorage.removeItem("expandedSemester"); // Remove if collapsed
  }
};

// Toggle Program Expand/Collapse within a Semester
const toggleProgram = (semester, program) => {
  const isExpanded = !expandedPrograms[`${semester}-${program}`];
  setExpandedPrograms({ [`${semester}-${program}`]: isExpanded });

  if (isExpanded) {
      localStorage.setItem("expandedProgram", JSON.stringify({ semester, program })); // Save last expanded program
  } else {
      localStorage.removeItem("expandedProgram"); // Remove if collapsed
  }
};

// Group Data by `classSemester` and then by `classProgram`
const groupedClassData = filteredData.reduce((acc, item) => {
  if (!acc[item.classSemester]) {
      acc[item.classSemester] = {}; // Initialize semester grouping
  }
  if (!acc[item.classSemester][item.classProgram]) {
      acc[item.classSemester][item.classProgram] = []; // Initialize program grouping
  }
  acc[item.classSemester][item.classProgram].push(item);
  return acc;
}, {});

// Sort Semesters in Descending Order
const sortedSemesters = Object.keys(groupedClassData).sort((a, b) => b.localeCompare(a));

// Sort Programs Inside Each Semester & Sort Data by enrollCode
const sortedGroupedData = sortedSemesters.reduce((sortedAcc, semester) => {
  const sortedPrograms = Object.keys(groupedClassData[semester]).sort((a, b) => a.localeCompare(b)); // Sort programs alphabetically

  sortedAcc[semester] = sortedPrograms.reduce((sortedProgAcc, program) => {
      sortedProgAcc[program] = groupedClassData[semester][program].sort((x, y) =>
          (y.enrollCode || "").localeCompare(x.enrollCode || "") 
      );
      return sortedProgAcc;
  }, {});
  return sortedAcc;
}, {});

const getLessonLabel = (index) => {
  return labels[index] || (index === dates.length - 1 ? "Exam" : `Lesson ${index + 1}`);
};

  return (
    <div>
        <div className='employeeHometopBarDiv'>
          {Cookies.get("sisUsername") ? (
                <Topbar />
            ) : Cookies.get("employeeUsername") ? (
                <TopbarEmployee />
            ) : null}
        </div>
        <div className='employeeHomesideBarDiv'>
          {Cookies.get("sisUsername") ? (
                <Sidebar />
            ) : Cookies.get("employeeUsername") ? (
                <SidebarEmployee />
            ) : null}
        </div>
      <div className='employeeHomeBoxDiv'>
        <div className="employeeHomecontainer">
            <div className="employeeHomediv1">
                <h2 className="fs-2 m-0">LESSON INFORMATION</h2>
            </div>
            <div className="employeeHomediv2 d-flex justify-content-between align-items-center">
                <div className="d-flex custom-margin">
                  <input
                    type="text"
                    placeholder="Search by Course/Enroll Code"
                    value={searchTerm}
                    onChange={handleSearchInputChange}
                    className="mr-2"
                    style={{ width: '180px' }}
                  />
                </div>
                <Button id='btnRefresh' className='btn btn-contact me-2' onClick={() => window.location.reload()}><FontAwesomeIcon icon={faRefresh} /></Button>
            </div>

            <table className="styled-table" style={{ width: "100%" }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: "center" }}>Expand</th>
                        <th style={{ textAlign: "center" }}>No</th>
                        <th style={{ textAlign: "center" }}>Marking Template</th>
                        <th style={{ textAlign: "center" }}>Enroll Code</th>
                        <th style={{ textAlign: "center" }}>Course Code</th>
                        <th style={{ textAlign: "center" }}>Students Name</th>
                        <th style={{ textAlign: "center" }}>Students ID</th>
                        <th style={{ textAlign: "center" }}>P.I.C</th>
                        <th style={{ textAlign: "center" }}>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {sortedSemesters.map((semester) => (
                        <>
                            {/* Expand/Collapse Row for Semester */}
                            <tr key={semester} className="semester-row">
                                <td style={{ textAlign: "center" }}>
                                    <button
                                        className="btn btn-light"
                                        onClick={() => toggleSemester(semester)}
                                        style={{ fontSize: "10px" }}
                                    >
                                        <FontAwesomeIcon icon={expandedSemesters[semester] ? faChevronUp : faChevronDown} />
                                    </button>
                                </td>
                                <td colSpan="8" style={{ fontWeight: "bold", backgroundColor: "#f0f0f0" }}>
                                    {semester}
                                </td>
                            </tr>

                            {/* Render Programs inside Semester if expanded */}
                            {expandedSemesters[semester] &&
                                Object.keys(sortedGroupedData[semester]).map((program) => (
                                    <>
                                        {/* Expand/Collapse Row for Program */}
                                        <tr key={`${semester}-${program}`} className="program-row">
                                            <td></td>
                                            <td style={{ textAlign: "center" }}>
                                                <button
                                                    className="btn btn-light"
                                                    onClick={() => toggleProgram(semester, program)}
                                                    style={{ fontSize: "10px" }}
                                                >
                                                    <FontAwesomeIcon icon={expandedPrograms[`${semester}-${program}`] ? faChevronUp : faChevronDown} />
                                                </button>
                                            </td>
                                            <td colSpan="7" style={{ fontWeight: "bold", backgroundColor: "#e0e0e0" }}>
                                                {program}
                                            </td>
                                        </tr>

                                        {/* Render Rows only if Program is Expanded */}
                                        {expandedPrograms[`${semester}-${program}`] &&
                                            groupedClassData[semester][program].map((item, index) => (
                                                <tr key={item.id}>
                                                    <td></td> {/* Empty cell for alignment */}
                                                    <td>{index + 1}</td>
                                                    <td>{item.classMarkingTemplate || 'N/A'}</td>
                                                    <td>{item.classEnrollDateProgCode}</td>
                                                    <td>{item.classCourseCode}</td>
                                                    <td>{item.classStudents}</td>
                                                    <td>{item.classStudentsID}</td>
                                                    <td>{item.classTeacherName}</td>
                                                    <td>
                                                    <div className="action-buttons">
                                                        {data3.some((perm) => perm.category === "Manage Lesson" && perm.accessType === "Read/Write") && (
                                                            <button id="btnFontIcon" className="btn btn-success" title="Add Lesson" onClick={() => handleLesson(item)}>
                                                                <FontAwesomeIcon icon={faPencil} />
                                                            </button>
                                                        )}
                                                        {/*{data3.some((perm) => perm.category === "Manage Lesson" && perm.accessType === "Read/Write") && (
                                                            <button id="btnFontIcon" className="btn btn-warning" title="Empty Lesson" onClick={() => deleteLessonData(item)}>
                                                                <FontAwesomeIcon icon={faTrash} />
                                                            </button>
                                                        )}*/}
                                                        {/*<button id="btnFontIcon" className="btn btn-info" title="View Lesson" onClick={() => handleViewLesson(item)}>
                                                            <FontAwesomeIcon icon={faEye} />
                                                        </button>*/}
                                                    </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </>
                                ))}
                        </>
                    ))}
                </tbody>
            </table>

            {/* Lesson Create Modal */}
            <Modal 
              show={lessonShow} 
              onHide={handleLessonClose}
              dialogClassName="custom-modal"
              backdrop="static"
              keyboard={false}
              enforceFocus={true}
            >
              <Modal.Header closeButton>
                <Modal.Title style={{ color: '#151632' }}>
                {data3.some(item => item.category === "Manage Lesson" && item.accessType === "Read Only")
                  ? `View Lesson for ${editData ? editData.classCourseCode : ""}`
                  : `Update Lesson for ${editData ? editData.classCourseCode : ""}`
                }
                </Modal.Title>
              </Modal.Header>
              <Modal.Body className="custom-modal-body">
                <Carousel 
                  interval={null} // Prevent automatic sliding
                  controls={false} // Disable navigation arrows
                  indicators={false} // Disable pagination dots
                >
                  <Carousel.Item style={{ height: "100%" }}>
                    <Form>
                      {editData.classStartDate && editData.classEndDate ? (
                        dates.length > 0 ? (
                          <Table striped bordered hover>
                            <thead>
                              <tr style={{ textAlign: "center" }}>
                                <th>Action</th>
                                <th>Lesson Date</th>
                                <th>Lesson</th>
                                <th style={{width: "30%"}}>Class Time</th>
                                <th>P.I.C</th>

                              </tr>
                            </thead>
                            <tbody style={{ textAlign: "center" }}>
                                {dates.map((date, index) => (
                                    <tr key={index}>
                                      <td style={{ verticalAlign: "middle" }}>
                                        <div className="action-buttons">
                                            </div>
                                            <div className="action-buttons">
                                                <button
                                                    id='btnFontIcon'
                                                    className="btn btn-warning"
                                                    title='Delete'
                                                    onClick={(event) => deleteLesson(event, index)}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                        </td>
                                        <td style={{ verticalAlign: "middle" }}>
                                          <input
                                            type="date"
                                            value={formatDateForInput(date)}
                                            onChange={(e) => handleDateChange(index, e.target.value)}
                                            style={{ color: 'black', border: '1px solid #ccc', padding: '5px' }}
                                          />
                                        </td>
                                        <td style={{ verticalAlign: "middle" }}>
                                            <input
                                                type="text"
                                                value={getLessonLabel(index)}
                                                onChange={(e) => handleLabelChange(index, e.target.value)}
                                                style={{ color: 'black', border: '1px solid #ccc', padding: '5px' }}
                                            />
                                        </td>
                                        <td style={{ verticalAlign: "middle", position: "relative" }}>
                                            <Form.Select
                                                as="select"
                                                value={classTimes[index] !== undefined ? classTimes[index] : ""}
                                                onChange={e => handleClassTimeChange(index, e.target.value)}
                                            >
                                                <option value="">Select Time Info</option>
                                                {timeInfo.map(getTimeInfo => (
                                                  <option key={getTimeInfo} value={getTimeInfo}>
                                                    {getTimeInfo}
                                                  </option>
                                                ))}
                                            </Form.Select>
                                        </td>
                                        <td style={{ verticalAlign: "middle" }}>{editData ? editData.classTeacherName : ""}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                              <tr>
                                <td colSpan="5" className="text-center">
                                  <Button
                                    variant="outline-primary"
                                    onClick={() => {
                                      const today = new Date(); // Or default to blank
                                      setDates([...dates, today]);
                                      setLabels([...labels, ""]);
                                      setClassTimes([...classTimes, ""]);
                                    }}
                                  >
                                    + Add Lesson Row
                                  </Button>
                                </td>
                              </tr>
                            </tfoot>
                          </Table>
                        ) : (
                          <>
                            <div className="alert alert-info text-center">
                              No lessons found for this class. Click the button below to generate lesson dates from the class start and end date.
                            </div>
                            <div className="text-center mb-3">
                              <Button
                                variant="primary"
                                onClick={() => {
                                  const generated = filterDatesByDayType(
                                    getDatesInRange(editData.classStartDate, editData.classEndDate),
                                    editData.classDayType
                                  );
                                  setDates(generated);
                                  setLabels(Array(generated.length).fill(""));
                                  setClassTimes(Array(generated.length).fill(""));
                                }}
                              >
                                Generate Lesson Dates
                              </Button>
                            </div>
                          </>
                        )
                      ) : (
                        <div className="alert alert-danger text-center">
                          Please set <strong>class start date</strong> and <strong>end date</strong> before adding lessons.
                        </div>
                      )}
                    </Form>
                  </Carousel.Item>
                </Carousel>
              </Modal.Body>

              <Modal.Footer className="d-flex justify-content-end gap-2">
                <Button
                    className="submitBtn"
                    title='Create Lesson'
                    onClick={() => handleSubmitLesson()}
                    variant="primary"
                    type="button"
                >
                    Update
                </Button>
              </Modal.Footer>
            </Modal>
        </div>
      </div>
    </div>
  );
}