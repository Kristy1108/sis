import React, { useState, useEffect } from 'react';
import Select from "react-select";
import axios from "axios";
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faEye, faRefresh, faChevronDown, faChevronUp, faBook, faCalendar, faCaretDown, faPen } from '@fortawesome/free-solid-svg-icons';
import { Button, Modal, Form, Carousel, Table } from 'react-bootstrap';
import "./manageclassTime.css";
import Sidebar from "../global/Sidebar";
import SidebarEmployee from "../global/SidebarEmployee";
import Topbar from "../global/Topbar";
import TopbarEmployee from '../global/TopbarEmployee';
import { adminLocalhost } from '../../localhost/adminLocalhost';
import { employeeLocalhost } from '../../localhost/employeeLocalhost';
import { studentLocalhost } from '../../localhost/studentLocalhost';
import Cookies from 'js-cookie';

export default function ClassTime() {

  const [state, setState] = useState({
    enrollDate: "",
    enrollProg: "",
    enrollCourse: "",
    enrollDateProgCode: "",
    enrollSemester: ""
});

const [data, setData] = useState([]);
const [data3, setData3] = useState([]);
const [show, setShow] = useState(false);
const [editData, setEditData] = useState(null);
const [editShow, setEditShow] = useState(false);

const [showManageClassroom, setShowManageClassroom] = useState(false);
const [showManageClassroomEdit, setShowManageClassroomEdit] = useState(false);
const [showManageLesson, setShowManageLesson] = useState(false);
const [showManageLessonView, setShowManageLessonView] = useState(false);

const handleClose = () => setShow(false);
const handleCloseManageClassroom = () => setShowManageClassroom(false);
const handleCloseManageClassroomEdit = () => setShowManageClassroomEdit(false);
const handleCloseManageLesson = () => setShowManageLesson(false);
const handleCloseManageLessonView = () => setShowManageLessonView(false);
const handleShow = () => setShow(true);
const handleEditClose = () => setEditShow(false);
const [selectedCourse, setSelectedCourse] = useState('');
const [selectedCourseCode, setSelectedCourseCode] = useState('');
const [selectedCourseMarkTemplate, setSelectedCourseMarkTemplate] = useState('');
const [progCoursesCode, setProgCoursesCode] = useState([]);
const [searchTerm, setSearchTerm] = useState('');
const [expandedSemesters, setExpandedSemesters] = useState({});
const [expandedPrograms, setExpandedPrograms] = useState({});
const [selectedProgram, setSelectedProgram] = useState([]);
const [selectedProgram1, setSelectedProgram1] = useState([]);
const [dates, setDates] = useState([]);

const [progClassTimes, setProgClassTimes] = useState([]);
const [progTeacherNames, setProgTeacherNames] = useState([]);
const [selectedEnrollDate, setSelectedEnrollDate] = useState('');
const [selectedStartDate, setSelectedStartDate] = useState('');
const [selectedEndDate, setSelectedEndDate] = useState('');
const [selectedProgramCode, setSelectedProgramCode] = useState('');
const [selectedClassDayType, setSelectedClassDayType] = useState('');
const [selectedTeacherName, setSelectedTeacherName] = useState('');
const [selectedStudents, setSelectedStudents] = useState('');
const [students, setStudents] = useState([]);
const [enrollCode, setEnrollCode] = useState('');
const [showFilterModal, setShowFilterModal] = useState(false);
const [selectedIntake, setSelectedIntake] = useState("");
const [searchStudentQuery, setSearchStudentQuery] = useState('');

const [selectedEnrollInfo, setSelectedEnrollInfo] = useState('');
const [selectedEnrollLessonInfo, setSelectedEnrollLessonInfo] = useState('');
const [selectedEnrollClassroomInfo, setSelectedEnrollClassroomInfo] = useState('');

const [labels, setLabels] = useState(Array(dates.length).fill(""));
const [classTimes, setClassTimes] = useState(dates.map(() => ""));
const [timeInfo, setTimeInfo] = useState([]);
const [attendanceData, setAttendanceData] = useState([]);
const [isEdit, setIsEdit] = useState(false);

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
        const response = await axios.get(`${adminLocalhost}/classTime/getClassTimeDetails`);
        setData(response.data);
    } catch (error) {
        console.error('Error occurred while fetching class time details:', error);
    }
};

const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchStudentQuery.toLowerCase()),
);
  
// Get unique programs and intakes
const programs = [...new Set(filteredStudents.map(student => student.program))];
const intakes = [...new Set(filteredStudents.map(student => student.intake))];

// Filter students based on selected criteria
const filteredList = filteredStudents.filter(student => {
return (selectedProgram1 === "" || student.program === selectedProgram1) &&
        (selectedIntake === "" || student.intake === selectedIntake);
});

useEffect(() => {
    loadData();
}, []);

  {/* List down Enroll DateProgCode */}
  useEffect(() => {
    axios.get(`${adminLocalhost}/classTime/dateProgCodes`)
        .then(response => {
            setProgClassTimes(response.data);
        })
        .catch(error => {
            console.error('Error fetching progCodes:', error);
        });
}, []);

  {/* List down Teacher Name */}
  useEffect(() => {
    axios.get(`${employeeLocalhost}/employee/teachers`)
        .then(response => {
          setProgTeacherNames(response.data);
        })
        .catch(error => {
            console.error('Error fetching teacher name:', error);
        });
}, []);

useEffect(() => {
    const dateArray = getDatesInRange(selectedEnrollLessonInfo.enrollDate, selectedEnrollLessonInfo.enrollEndDate);
    const filteredDates = filterDatesByDayType(dateArray, selectedEnrollLessonInfo.enrollDayType);
    setDates(filteredDates);
}, [selectedEnrollLessonInfo.enrollDate, selectedEnrollLessonInfo.enrollDate, selectedEnrollLessonInfo.enrollDayType]);

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
      '4 days': [1, 2, 3, 4], // Monday to Thursday
      '5 days': [1, 2, 3, 4, 5], // Monday to Friday
      'Weekly': [5], // Friday
      'Same Day': null // Handle separately
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
    const month = date.toLocaleString('en-GB', { month: 'short' });
    const year = date.getFullYear();
    const weekday = date.toLocaleString('en-GB', { weekday: 'short' });
  
    return `${day}-${month}-${year} (${weekday})`;
  };

{/* List down all Course Codes */}
useEffect(() => {
  if (selectedProgramCode) {
      axios.get(`${adminLocalhost}/course/getCourseCode/${selectedProgramCode}`)
          .then(response => {
              setProgCoursesCode(response.data);
          })
          .catch(error => {
              console.error('Error fetching course code:', error);
          });
  }
}, [selectedProgramCode]);

  {/* List down Student Info */}
  useEffect(() => {
    axios.get(`${studentLocalhost}/student/student-info`)
      .then(response => {
        const studentNames = response.data.map(student => ({
          id: student[4],
          intake: student[6],
          program: student[7],
          name: student[3], 
          studentID: student[0],
        }));
        setStudents(studentNames);
      })
      .catch(error => {
        console.error('Error fetching student names:', error);
      });
  }, []);

  {/* List down CourseName using CourseCode */}
  useEffect(() => {
    if (selectedEnrollInfo.enrollCourse !== '') {
        fetch(`${adminLocalhost}/course/getcourseName/${selectedEnrollInfo.enrollCourse}`)
            .then(response => response.json())
            .then(data => {
              setSelectedCourse(data[0]);
            })
            .catch(error => {
                console.error('Error fetching course name:', error);
            });
    }
}, [selectedEnrollInfo.enrollCourse]);

  {/* List down Mark Template using CourseCode */}
  useEffect(() => {
    if (selectedEnrollInfo.enrollCourse !== '') {
        fetch(`${adminLocalhost}/course/getCourseTemplate/${selectedEnrollInfo.enrollCourse}`)
            .then(response => response.json())
            .then(data => {
              setSelectedCourseMarkTemplate(data);
            })
            .catch(error => {
                console.error('Error fetching marking template:', error);
            });
    }
}, [selectedEnrollInfo.enrollCourse]);

{/* List down all Course Codes */}
useEffect(() => {
    axios.get(`${adminLocalhost}/course/progCourse`)
        .then(response => {
            setProgCoursesCode(response.data);
        })
        .catch(error => {
            console.error('Error fetching course code:', error);
        });
}, []);

{/* List down all Program Code */}
useEffect(() => {
    axios.get(`${adminLocalhost}/program/program-info`)
    .then(response => {
        setSelectedProgram(response.data);
    })
    .catch(error => {
        console.error('Error fetching program code:', error);
    });
}, []);

 {/* List down CourseName using CourseCode */}
  useEffect(() => {
    if (selectedCourseCode !== '') {
        fetch(`${adminLocalhost}/course/getcourseName/${selectedCourseCode}`)
            .then(response => response.json())
            .then(data => {
              setSelectedCourse(data[0]);
            })
            .catch(error => {
                console.error('Error fetching course name:', error);
            });
    }
}, [selectedCourseCode]);

{/* List down Time Info */}
useEffect(() => {
    axios.get(`${adminLocalhost}/time/time-info`)
        .then(response => {
          setTimeInfo(response.data);
        })
        .catch(error => {
            console.error('Error fetching teacher name:', error);
        });
}, []);

{/* Get attendance data for lesson view modal */}
useEffect(() => async () => {
    try {
        const response = await axios.get(`${employeeLocalhost}/attendance/getAttendanceDetails`);
        setAttendanceData(response.data);
      } catch (error) {
        console.error('Error occurred while fetching course details:', error);
      }
}, []);

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

const deleteContact = async (item) => {
    try {
        const response = await axios.get(`${adminLocalhost}/class/getClassInfo/${item.enrollDateProgCode}/${item.enrollSemester}`);
        
        if (!response.data[0] || response.data[0].length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Class not found or already deleted!',
            });
            return;
        }

        const classId = response.data[0].id;

        // Show confirmation dialog
        Swal.fire({
            title: 'Are you sure you want to delete?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Perform deletion operations
                    await axios.delete(`${adminLocalhost}/classTime/deleteClassTime/${item.id}`);
                    await axios.delete(`${adminLocalhost}/class/deleteClass/${classId}`);

                    // Show success message
                    Swal.fire({
                        position: 'top-end',
                        icon: 'success',
                        title: 'Deleted successfully!',
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        loadData(); // Reload the data after successful deletion
                    });
                } catch (error) {
                    console.error("Error deleting:", error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to delete!',
                    });
                }
            }
        });
    } catch (error) {
        console.error("Error fetching class info:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to retrieve class info!',
        });
    }
};

const handleSubmit = async (e) => {
    e.preventDefault();

    if(!state.enrollDate || !state.enrollSemester || !state.selectedProgram || !selectedCourseCode) {
        Swal.fire({
            icon: 'warning',
            title: 'Empty Fields',
            text: 'Please fill in all fields!',
            confirmButtonText: 'OK'
        });
        return;
    }

    try {
        const enrollDate = new Date(state.enrollDate);
        const formattedDate = enrollDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).replace(/\s/g, '-').replace('Sept', 'Sep');

        const enrollDateProgCode = `${state.selectedProgram}-${selectedCourseCode}-${formattedDate}`;

        const checkResponse = await axios.get(`${adminLocalhost}/classTime/checkIfExists/${enrollDateProgCode}`);
        const getEnrollDate = await axios.get(`${adminLocalhost}/classTime/getEnrollDateProgCode/${enrollDateProgCode}`);
        
        if (Boolean(checkResponse.data)) {  
            Swal.fire({
                icon: 'warning',
                title: 'Duplicate Entry',
                text: `This enrollment record in ${getEnrollDate.data[0].enrollSemester} already exists!`,
                footer: `Here is the code ${getEnrollDate.data[0].enrollDateProgCode}`,
                confirmButtonText: 'OK'
            });
            return; 
        }

        const formData1 = {
            classCourseCode: selectedCourseCode,
            classEnrollDateProgCode: enrollDateProgCode,
            classProgram: state.selectedProgram,
            classStartDate: state.enrollDate,
            classSemester: state.enrollSemester, 
        };

        const formData = {
            enrollDate: state.enrollDate,
            enrollProg: state.selectedProgram,
            enrollCourse: selectedCourseCode,
            enrollDateProgCode: enrollDateProgCode,
            enrollSemester: state.enrollSemester 
        };

        const response = await axios.get(`${adminLocalhost}/class/getClassInfo/${enrollDateProgCode}`);

        console.log("formData:", formData);
        console.log("formData1:", formData1);

        /*if (!response.data[0]) {
            await axios.post(`${adminLocalhost}/class/addClass`, formData1);
        }
        
        await axios.post(`${adminLocalhost}/classTime/addClassTime`, formData);

        setState((prevState) => ({
            ...prevState,
            enrollDate: "",
            enrollSemester: "",
            selectedProgram: ""
        }));
        
        setSelectedCourseCode("");
        setShow(false);

        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: `${selectedCourseCode} added in ${state.enrollSemester}`,
            showConfirmButton: false,
            timer: 3000
        }).then(() => {
            loadData(); 
        });*/

    } catch (error) {
        console.error('Error occurred while adding class time:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Something went wrong while adding the class time!',
        });
    }
};

const handleInputChange = (e) => {
    const { name, value } = e.target;
    setState((prevState) => ({ ...prevState, [name]: value }));
};

const handleEditShow = async (item) => {
    setEditData(item);

    try {
        const response = await axios.get(`${adminLocalhost}/course/progCourse`);
        setProgCoursesCode(response.data);
    } catch (error) {
        console.error('Error fetching course code:', error);
    }

    setEditShow(true);
};

const handleEditSubmit = async (e) => {
    e.preventDefault();
    const enrollDate = new Date(editData.enrollDate);
    const formattedDate = enrollDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).replace(/\s/g, '-');

    try {
        // Add enrollDateProgCode to the editData object with the latest semester
        const editedDataWithProgCode = {
            ...editData,
            enrollDateProgCode: `${editData.enrollProg}-${editData.enrollCourse}-${formattedDate}`,
        };

        // Make the PUT request with the updated data
        await axios.put(`${adminLocalhost}/classTime/updateClassTime/${editData.id}`, editedDataWithProgCode);

        setEditShow(false);

        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Enroll Date updated successfully!',
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            loadData();
        });

    } catch (error) {
        console.error('Error occurred while updating class time:', error);
    }
};

const handleEditInputChange = (e) => {
    const { name, value } = e.target;

    setEditData((prevData) => ({
        ...prevData,
        [name]: value,
        ...(name === "enrollProg" ? { enrollCourse: "" } : {})
    }));
};

const handleSelectCourseCode = (event) => {
    setSelectedCourseCode(event.target.value);
  };

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
};

  const sortedFilteredData = [...data].sort((b, a) => (a.enrollCode || "").localeCompare(b.enrollCode || "")).filter((item) => {
      const roleMatch = item.enrollProg.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = item.enrollCourse.toLowerCase().includes(searchTerm.toLowerCase());
      const enrollCode = item.enrollDateProgCode.toLowerCase().includes(searchTerm.toLowerCase());
      const formattedDate = new Date(item.enrollDate).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
      }).replace(/\s/g, '-');
      const dateMatch = formattedDate.toLowerCase().includes(searchTerm.toLowerCase());
      return roleMatch || statusMatch || dateMatch || enrollCode;
  });

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

// Group data by enrollSemester and enrollProg
const groupedData = sortedFilteredData.reduce((acc, item) => {
    if (!acc[item.enrollSemester]) {
        acc[item.enrollSemester] = {}; // Initialize semester grouping
    }
    if (!acc[item.enrollSemester][item.enrollProg]) {
        acc[item.enrollSemester][item.enrollProg] = []; // Initialize program grouping
    }
    acc[item.enrollSemester][item.enrollProg].push(item);
    return acc;
}, {});

// Sort Semesters in Descending Order (Latest First)
const sortedSemesters = Object.keys(groupedData).sort((a, b) => b.localeCompare(a));

// Sort Programs Inside Each Semester & Sort Data by enrollCode
const sortedGroupedData = sortedSemesters.reduce((sortedAcc, semester) => {
    const sortedPrograms = Object.keys(groupedData[semester]).sort((a, b) => a.localeCompare(b)); // Sort programs alphabetically

    sortedAcc[semester] = sortedPrograms.reduce((sortedProgAcc, program) => {
        sortedProgAcc[program] = groupedData[semester][program].sort((x, y) =>
            (y.enrollCode || "").localeCompare(x.enrollCode || "") // ✅ Sort by enrollCode instead of date
        );
        return sortedProgAcc;
    }, {});
    return sortedAcc;
}, {});

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
                <h2 className="fs-2 m-0">ENROLL INFO</h2>
            </div>
            <div className="manageClassTimediv2 d-flex justify-content-between align-items-center">
                <div className="d-flex custom-margin">
                    <input
                        type="text"
                        placeholder="Search by Prog/Course/Date"
                        value={searchTerm}
                        onChange={handleSearchInputChange}
                        className="mr-2"
                        style={{width: '180px'}}
                    />
                </div>
                <Button id='btnRefresh' className='btn btn-contact me-2' title='Refresh' onClick={() => window.location.reload()}><FontAwesomeIcon icon={faRefresh} /></Button>
                {data3.some(
                    item => item.category === "Manage Enroll" && item.accessType === "Read/Write"
                    ) && (
                    <Button className="btn btn-contact" title='Add' onClick={handleShow}>
                        <FontAwesomeIcon icon={faPlus} />
                    </Button>
                )}
            </div>

            <table className="styled-table" style={{ width: "100%" }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: "center" }}>Expand</th>
                        <th style={{ textAlign: "center" }}>No</th>
                        <th style={{ textAlign: "center" }}>Semester</th>
                        <th style={{ textAlign: "center" }}>Prog</th>
                        <th style={{ textAlign: "center" }}>Course</th>
                        <th style={{ textAlign: "center" }}>Enroll Code</th>
                        <th style={{ textAlign: "center" }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedSemesters.map((semester) => (
                        <>
                            {/* Expand/Collapse Row for Enroll Semester */}
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
                                <td colSpan="11" style={{ fontWeight: "bold", backgroundColor: "#f0f0f0" }}>
                                    {semester}
                                </td>
                            </tr>

                            {/* Render Programs inside Semester if expanded */}
                            {expandedSemesters[semester] &&
                                Object.keys(sortedGroupedData[semester]).map((program) => (
                                    <>
                                        {/* Expand/Collapse Row for Enroll Program */}
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
                                            <td colSpan="10" style={{ fontWeight: "bold", backgroundColor: "#e0e0e0" }}>
                                                {program}
                                            </td>
                                        </tr>

                                        {/* Render Rows only if program is expanded */}
                                        {expandedPrograms[`${semester}-${program}`] &&
                                            groupedData[semester][program].map((item, index) => (
                                                <tr key={item.id}>
                                                    <td></td> {/* Empty cell for alignment */}
                                                    <td scope="row">{index + 1}</td>
                                                    <td>{item.enrollSemester}</td>
                                                    <td>{item.enrollProg}</td>
                                                    <td>{item.enrollCourse}</td>
                                                    <td>{item.enrollDateProgCode}</td>
                                                    <td>
                                                        {data3.some((item) => item.category === "Manage Enroll" && item.accessType === "Read/Write") && (
                                                            <button
                                                                id="btnFontIcon"
                                                                className="btn btn-info"
                                                                style={{ fontSize: "10px" }}
                                                                title="Edit"
                                                                onClick={() => handleEditShow(item)}
                                                            >
                                                                <FontAwesomeIcon
                                                                    icon={
                                                                        data3.some(
                                                                            (item) => item.category === "Manage Enroll" && item.accessType === "Read Only"
                                                                        )
                                                                            ? faEye
                                                                            : faEdit
                                                                    }
                                                                />
                                                            </button>
                                                        )}
                                                        {data3.some(
                                                            (item) => item.category === "Manage Enroll" && item.accessType === "Read/Write"
                                                        ) && (
                                                            <button
                                                                id="btnFontIcon"
                                                                className="btn btn-warning"
                                                                style={{ fontSize: "10px" }}
                                                                title="Delete"
                                                                onClick={() => deleteContact(item)}
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                    </>
                                ))}
                        </>
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
                    <Modal.Title style={{ color: '#151632' }}>Add Enroll Date</Modal.Title>
                </Modal.Header>
                <Modal.Body className="custom-modal-body">
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="enrollSemester">
                            <Form.Label>Enroll Semester</Form.Label>
                            <Form.Control
                                type="text"
                                name='enrollSemester'
                                placeholder='Enter Semester ID'
                                value={state.enrollSemester}
                                onChange={handleInputChange}
                                autoFocus
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="enrollProg">
                            <Form.Label>Enroll Program</Form.Label>
                            <Form.Select
                                as="select"
                                name="selectedProgram"
                                value={state.selectedProgram || ""} // Ensure controlled component
                                onChange={handleInputChange}
                            >
                                <option value="">Select Program</option>
                                {selectedProgram.map((program) => (
                                    <option key={program.id} value={program.programCode}>
                                        {program.programCode}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="classCourseCode">
                          <Form.Label>Course Code</Form.Label>
                          <div style={{ position: 'relative' }}>
                            <Form.Select
                              as="select"
                              onChange={handleSelectCourseCode}
                            >
                              <option value="">Select Course</option>
                              {progCoursesCode.map(course => (
                                <option key={course} value={course}>{course}</option>
                              ))}
                            </Form.Select>
                          </div>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="enrollDate">
                            <Form.Label>Class Start Date</Form.Label>
                            <Form.Control
                                type="date"
                                name='enrollDate'
                                value={state.enrollDate}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        {/*<span style={{color: "red"}}>*Search for the course code before clicking 'Add' to proceed.</span>*/}
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
            enforceFocus={true}>
                <Modal.Header closeButton>
                    <Modal.Title style={{ color: '#151632' }}>
                        {data3.some(item => item.category === "Manage Enroll" && item.accessType === "Read Only")
                        ? "View Enroll"
                        : "Update Enroll"
                        }
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="custom-modal-body">
                    <Form onSubmit={handleEditSubmit}>

                    <Form.Group className="mb-3" controlId="enrollSemester">
                        <Form.Label>Enroll Semester</Form.Label>
                        <Form.Control
                            type="text"
                            name='enrollSemester'
                            placeholder='Enter Semester ID'
                            value={editData?.enrollSemester || ""}
                            onChange={handleEditInputChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="enrollProg">
                        <Form.Label>Enroll Program</Form.Label>
                        <Form.Select
                            name="enrollProg"
                            onChange={handleEditInputChange}
                            value={editData?.enrollProg || ""}
                        >
                            <option value="">Select Program</option>
                            {selectedProgram.map((program) => (
                                <option key={program.id} value={program.programCode}>
                                    {program.programCode}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                        <Form.Group className="mb-3" controlId="classCourseCode">
                            <Form.Label>Course Code</Form.Label>
                            <div style={{ position: 'relative' }}>
                                <Form.Select
                                    name="enrollCourse"
                                    value={editData?.enrollCourse || ""}
                                    onChange={handleEditInputChange}
                                >
                                    <option value="">Select Course</option>
                                    {progCoursesCode.map((course) => (
                                        <option key={course} value={course}>
                                            {course}
                                        </option>
                                    ))}
                                </Form.Select>
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                            <Form.Label>Enroll Date</Form.Label>
                            <Form.Control
                                type="date"
                                name="enrollDate"
                                value={editData ? editData.enrollDate : ""}
                                onChange={handleEditInputChange}
                            />
                        </Form.Group>

                        {/*<span style={{color: "red"}}>*Search for the course code before clicking 'Update' to proceed.</span>*/}
                        {data3.some(item => item.category === "Manage Enroll" && item.accessType === "Read Only") ? null : (
                            <Button
                                className="submitBtn"
                                style={{float: 'right'}}
                                variant="primary"
                                type='submit'
                            >
                                Update
                            </Button>
                        )}
                    </Form>
                </Modal.Body>
            </Modal>

        </div>
      </div>
    </div>
  );
}
