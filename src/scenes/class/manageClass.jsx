import React, { useState, useEffect } from 'react';
import Select from "react-select";
import axios from "axios";
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faRefresh, faCaretDown, faPencil, faEye, faClone, faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { Button, Modal, Form, Carousel, Table } from 'react-bootstrap';
import Sidebar from "../global/Sidebar";
import SidebarEmployee from "../global/SidebarEmployee";
import Topbar from "../global/Topbar";
import TopbarEmployee from '../global/TopbarEmployee';
import "./manageClass.css";
import { adminLocalhost } from '../../localhost/adminLocalhost';
import { employeeLocalhost } from '../../localhost/employeeLocalhost';
import { studentLocalhost } from '../../localhost/studentLocalhost';
import Cookies from 'js-cookie';

export default function ManageClass() {

const [editData, setEditData] = useState({
  classEnrollDateProgCode: "",
  classCourseCode: "",
  classStudents: [], 
  classStudentsID: "",
  classTeacherName: "",
  classProgram: "",
  classStartDate: "",
  classEndDate: "",
  classCourse: "",
  classDayType: "",
  attendanceCourseName: "",
  classMarkTemplate: "",
  classMarkingTemplate: "",
  selectedTemplate: ""
});

const [data, setData] = useState([]);
const [data3, setData3] = useState([]);
const [show, setShow] = useState(false);
const [editShow, setEditShow] = useState(false);

const handleShow = () => setShow(true);

const [progClassTimes, setProgClassTimes] = useState([]);
const [progTeacherNames, setProgTeacherNames] = useState([]);
const [progCoursesCode, setProgCoursesCode] = useState([]);
const [selectedProgramCode, setSelectedProgramCode] = useState('');
const [selectedCourseCode, setSelectedCourseCode] = useState('');
const [selectedCourse, setSelectedCourse] = useState('');
const [selectedCourseMarkTemplate, setSelectedCourseMarkTemplate] = useState([]);
const [selectedStudents, setSelectedStudents] = useState('');
const [showSelectedOnly, setShowSelectedOnly] = useState(false);
const [students, setStudents] = useState([]);
const [searchTerm, setSearchTerm] = useState('');
const [enrollCode, setEnrollCode] = useState('');
const [enrollSemester, setEnrollSemester] = useState('');
const [expandedSemesters, setExpandedSemesters] = useState({});
const [expandedPrograms, setExpandedPrograms] = useState({});
const [searchStudentQuery, setSearchStudentQuery] = useState('');
const [isEdit, setIsEdit] = useState(false);
const [fetchedClassInfo, setFetchedClassInfo] = useState(null);
const [showStudentFilterModal, setShowStudentFilterModal] = useState(false);
const [studentFilter, setStudentFilter] = useState({
  intakeMonth: '',
  intakeYear: '',
  intake: '',
  program: ''
});
const [programAndEnrollDateInfo, setProgramAndEnrollDateInfo] = useState([]);
const [dateError, setDateError] = useState("");

const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchStudentQuery.toLowerCase()) ||
    student.studentID.toLowerCase().includes(searchStudentQuery.toLowerCase())
  ).filter(student => {
    if (studentFilter.intake && !student.intake.toLowerCase().includes(studentFilter.intake.toLowerCase())) {
      return false;
    }
    if (studentFilter.program && !student.program.toLowerCase().includes(studentFilter.program.toLowerCase())) {
      return false;
    }
    return true;
  });

const handleStudentSearchChange = event => {
  setSearchStudentQuery(event.target.value);
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

useEffect(() => {
  loadData3();
}, []);

const loadData = async () => {
    try {
        const classResponse = await axios.get(`${adminLocalhost}/class/getClassDetails`);
        setData(classResponse.data);
        
    } catch (error) {
        console.error('Error occurred while fetching data:', error);
    }
};

const filteredData = data.filter((item, index, self) => {
  const courseMatch = item.classCourseCode.toLowerCase().includes(searchTerm.toLowerCase());
  const enrollDateMatch = item.classEnrollDateProgCode.toLowerCase().includes(searchTerm.toLowerCase());
  
  const uniqueItem = index === self.findIndex((t) => (
      t.classEnrollDateProgCode === item.classEnrollDateProgCode && t.classCourseCode === item.classCourseCode
  ));

  return (courseMatch || enrollDateMatch) && uniqueItem;
}).sort((a, b) => a.classCourseCode.localeCompare(b.classCourseCode));

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

{/* List down all Course Codes */}
useEffect(() => {
  if (selectedProgramCode) {
      axios.get(`${adminLocalhost}/course/progCourse`)
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

  {/* List down Mark Template using CourseCode */}
  useEffect(() => {
  if (selectedCourseCode) {
    fetch(`${employeeLocalhost}/marking/progCourseTemplate/${selectedCourseCode}`)
      .then(response => response.json())
      .then(data => {
        setSelectedCourseMarkTemplate(data);

        setEditData(prev => ({
          ...prev,
          selectedCourseMarkTemplate: data,
          selectedTemplate: data.includes(prev.classMarkingTemplate) 
            ? prev.classMarkingTemplate 
            : ''
        }));
      })
      .catch(error => {
        console.error('Error fetching marking template:', error);
      });
    }
  }, [selectedCourseCode]);  

   {/*Fetch marking template based on enrollCode */}
  useEffect(() => {
  if (enrollCode && Array.isArray(editData.selectedCourseMarkTemplate) && editData.selectedCourseMarkTemplate.length > 0) {
    fetch(`${adminLocalhost}/class/getClassInfo/${enrollCode}`)
      .then((response) => response.json())
      .then((data) => {
        const classInfo = data[0];
        if (classInfo) {
          setFetchedClassInfo(classInfo);

          setEditData((prev) => ({
            ...prev,
            selectedTemplate: prev.selectedCourseMarkTemplate.includes(classInfo.classMarkingTemplate)
              ? classInfo.classMarkingTemplate
              : ''
          }));
        }
      })
      .catch((error) => {
        console.error('Error fetching class info:', error);
      });
  }
}, [enrollCode, editData.selectedCourseMarkTemplate]);
  
  useEffect(() => {
    if (isEdit && Array.isArray(selectedCourseMarkTemplate)) {
      setEditData(prev => ({
        ...prev,
        selectedCourseMarkTemplate,
        selectedTemplate: selectedCourseMarkTemplate.length > 0 ? selectedCourseMarkTemplate[0] : '',
      }));
    }
  }, [isEdit, selectedCourseMarkTemplate]);  

  // Fetch data in useEffect
  useEffect(() => {
    const fetchProgramAndEnrollDateInfo = async () => {
      try {
        const response = await axios.get(`${studentLocalhost}/student/student-program-enroll-date`);
        setProgramAndEnrollDateInfo(response.data);
      } catch (error) {
        console.error('Error occurred while fetching intake details:', error);
      }
    };

    fetchProgramAndEnrollDateInfo();
  }, []);

// Extract unique intakes and programs
const uniqueIntakes = [
  ...new Set(programAndEnrollDateInfo.map((item) => item.studentIntake))
];

const uniquePrograms = [
  ...new Set(
    programAndEnrollDateInfo
      .map(item => item.studentProgram.replace(/\r/g, '').trim())
      .filter(program => program !== '')
  )
].sort((a, b) => a.localeCompare(b));

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

const programMapping = {
  "DSG": "Professional Degree in Software Engineering (DSG)",
  "DSE": "Professional Diploma in Software Engineering (DSE)",
  "DIT": "Professional Degree in IT Support (DIT)",
  "DIP": "Professional Diploma in IT Support (DIP)",
  "DSGPT": "Professional Part Time Degree in Software Engineering (DSGPT)",
  "DSEPT": "Professional Part Time Diploma in Software Engineering (DSEPT)",
  "DITPT": "Professional Part Time Degree in IT Support (DITPT)",
  "DIPPT": "Professional Part Time Diploma in IT Support (DIPPT)",
  "CITS1": "Professional Certificate of IT Support (CITS1)",
  "CITS2": "Professional Certificate of IT Studies (CITS2)"
};

const handleEditShow = (item) => {
  setIsEdit(true);
  setEnrollCode(item.classEnrollDateProgCode);
  setSelectedCourseCode(item.classCourseCode);
  setEnrollSemester(item.classSemester);

  const programCode = item.classProgram; 
  const fullProgramName = programMapping[programCode] || ""; 
  setSelectedProgramCode(programCode);

  const studentNameArray = item.classStudents
    ? (Array.isArray(item.classStudents)
        ? item.classStudents
        : item.classStudents.split(',').map(s => s.trim()))
    : [];

  // Step 1: Set initial edit data first (before template fetch)
  setEditData({
    ...item,
    classProgram: fullProgramName,
    classStudents: studentNameArray,
  });

  // Step 2: Fetch the marking template
  axios.get(`${employeeLocalhost}/marking/progCourseTemplate/${item.classCourseCode}`)
    .then(response => {
      const templates = response.data;

      setSelectedCourseMarkTemplate(templates);

      setEditData({
        ...item,
        classProgram: fullProgramName,
        classStudents: studentNameArray,
        selectedCourseMarkTemplate: templates
      });

    })
    .catch(error => {
      console.error('Error fetching marking template:', error);
    });

  setEditShow(true);
};

const handleEditSubmit = async () => {
  const studentNames = [];
  const studentIDs = [];
  const studentIntake = [];

  if (!editData.selectedTemplate) {
    Swal.fire({
      icon: "warning",
      title: "Missing Field",
      text: "Please select a Marking Template before submitting.",
    });
    return;
  }

  // === 2. Validate Template Matches Program Code ===
  const programCode = Object.keys(programMapping).find(
    (code) => programMapping[code] === editData.classProgram
  );

  const selectedPrefix = editData.selectedTemplate.split('-')[0];

  if (
    programCode &&
    editData.selectedTemplate &&
    selectedPrefix !== programCode
  ) {
    Swal.fire({
      icon: "error",
      title: "Marking Template Mismatch",
      text: `Marking Template should start with "${programCode}" to match the selected program.`,
    });
    return;
  }

  // === 3. Required field: Teacher Name ===
  if (!editData.classTeacherName || editData.classTeacherName.length === 0) {
    Swal.fire({
      icon: "warning",
      title: "Missing Field",
      text: "Please select at least one Teacher Name before submitting.",
    });
    return;
  }

  // === 4. Required field: End Date ===
  if (!editData.classEndDate) {
    Swal.fire({
      icon: "warning",
      title: "Missing Field",
      text: "Please select an End Date before submitting.",
    });
    return;
  }

  // === 5. Required field: Day Type ===
  if (!editData.classDayType) {
    Swal.fire({
      icon: "warning",
      title: "Missing Field",
      text: "Please select a Day Type before submitting.",
    });
    return;
  }

  try {
    editData.classStudents.forEach((studentStr) => {
      let name = "", id = "", intake = "", program = "";

      const match = studentStr.match(/^(.*?) \(([^)]+)\) \(([^)]+)\) \(([^)]+)\)$/);

      if (match) {
        // Format: Name (ID) (Intake) (Program)
        name = match[1];
        id = match[2];
        intake = match[3].replace(/\r$/, '');
        program = match[4];
      } else {
        // Format fallback: Full Name + ID + Intake + Program (space separated)
        const parts = studentStr.trim().split(" ");
        const last3 = parts.slice(-3);

        const possibleID = last3[0];
        const possibleIntake = last3[1];
        const possibleProgram = last3[2];

        if (/^ST\d{5}$/.test(possibleID)) {
          id = possibleID;
          intake = possibleIntake;
          program = possibleProgram;
          name = parts.slice(0, parts.length - 3).join(" ");
        } else {
          // Final fallback: try matching from known student list
          const matchedStudent = students.find((s) => {
            const fullInfo = `${s.name} (${s.studentID}) (${s.intake}) (${s.program})`;
            return fullInfo.includes(studentStr.trim());
          });

          if (matchedStudent) {
            name = matchedStudent.name;
            id = matchedStudent.studentID;
            intake = matchedStudent.intake;
            program = matchedStudent.program;
          } else {
            console.warn("Unrecognized student format:", studentStr);
            return; // skip this student
          }
        }
      }

      // Add only if ID is valid
      if (name && id && intake) {
        studentNames.push(name);
        studentIDs.push(id);
        studentIntake.push(intake);
      }
    });

    // Extract program code from full program name
    const getProgramCode = (fullProgramName) => {
      return Object.keys(programMapping).find(
        (code) => programMapping[code] === fullProgramName
      ) || null;
    };

    const programCode = getProgramCode(editData.classProgram);

    const teachersString = Array.isArray(editData.classTeacherName)
    ? editData.classTeacherName.join(',')
    : editData.classTeacherName;

    // Update editData with student names, IDs, and intake
    const updatedEditData = { 
      ...editData, 
      classMarkingTemplate: editData.selectedTemplate,
      classProgram: programCode,
      classStudents: studentNames.join(', '),
      classIntake: studentIntake.join(', '), 
      classStudentsID: studentIDs.join(', '),
      classTeacherName: teachersString
    };

    // Prepare the formData for updating classTime
    const formData1 = {
      enrollDate: editData.classStartDate,
      enrollProg: programCode,
      enrollCourse: editData.classCourseCode,
      enrollDateProgCode: editData.classEnrollDateProgCode,
      enrollEndDate: editData.classEndDate,
      enrollTeacher: teachersString,
      enrollDayType: editData.classDayType,
      enrollCourseName: editData.classCourse,
      enrollSemester: enrollSemester,
      enrollMarkTemplate: editData.selectedTemplate || 'N/A'
    };

    let classTimeID;
    try {
      const response = await axios.get(`${adminLocalhost}/classTime/getClassTimeID/${enrollCode}`);
      classTimeID = response.data;

    } catch (error) {
      console.error("Error fetching classTimeID:", error.response?.data || error.message);
      throw new Error("Failed to fetch ClassTime ID");
    }

    if (!classTimeID) {
      throw new Error("No classTimeID found for this enrollDateProgCode");
    }

    try {
      await axios.put(`${adminLocalhost}/classTime/updateClassTime/${classTimeID}`, formData1);

    } catch (error) {
      console.error("Error updating ClassTime:", error.response?.data || error.message);
      throw new Error("Failed to update ClassTime");
    }

    try {
      await axios.put(`${adminLocalhost}/class/updateClass/${editData.id}`, updatedEditData);

    } catch (error) {
      console.error("Error updating Class:", error.response?.data || error.message);
      throw new Error("Failed to update Class");
    }

    const attendanceUpdateData = {
      attendanceMarkTemplate: editData.selectedTemplate || "N/A",
      attendanceTeacherName: teachersString,
      attendanceClassEndDate: editData.classEndDate
    };
    
    try {
      const response = await axios.get(
        `${employeeLocalhost}/attendance/getAttendanceDetails1/${editData.classEnrollDateProgCode}/${editData.classCourseCode}`
      );
    
      if (response.data && response.data.length > 0) {
        await axios.put(
          `${employeeLocalhost}/attendance/updateAttendanceTemplateAndTeacher/${editData.classEnrollDateProgCode}/${editData.classCourseCode}`,
          attendanceUpdateData
        );
      } else {
        console.log("Attendance record not found or attendanceMarkTemplate is empty. Skipping update.");
      }
    } catch (error) {
      console.error("Error processing attendance:", error.response ? error.response.data : error.message);
      throw error;
    }     

    // Show success message
    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: 'Classroom updated successfully!',
      showConfirmButton: false,
      timer: 1500
    }).then(() => {
      setEditShow(false);
      loadData();
    });

  } catch (error) {
    console.error('Error occurred while updating classroom:', error.message);
    Swal.fire({
      icon: "error",
      title: "Update Failed",
      text: error.message,
    });
  }
};

const handleSelectStudent = (studentKey, isEdit, studentName) => {
  if (isEdit) {
    setEditData(prevEditData => {
      const newClassStudents = [...prevEditData.classStudents];
      // Remove both the full key and the plain name (support both formats)
      const indexFullKey = newClassStudents.indexOf(studentKey);
      const indexNameOnly = newClassStudents.indexOf(studentName);

      if (indexFullKey !== -1) {
        newClassStudents.splice(indexFullKey, 1);
      } else if (indexNameOnly !== -1) {
        newClassStudents.splice(indexNameOnly, 1);
      } else {
        // If not found, add the studentKey
        newClassStudents.push(studentKey);
      }

      return {
        ...prevEditData,
        classStudents: newClassStudents
      };
    });
  } /*else {
    setSelectedStudents(prevSelectedStudents => {
      if (prevSelectedStudents.includes(studentKey)) {
        return prevSelectedStudents.filter(key => key !== studentKey);
      } else {
        return [...prevSelectedStudents, studentKey];
      }
    });
  }*/
};

const handleSearchInputChange = (e) => {
  setSearchTerm(e.target.value);
};

const handleEditCloseCross = (e) => {
  setEditData(prev => ({
    ...prev,
    selectedTemplate: ""
  }));

  setDateError("");
  
  setEditShow(false);
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

const handleDateChange = (e) => {
  const { name, value } = e.target;
  const updatedData = { ...editData, [name]: value };

  // Validation: Ensure classEndDate is not before classStartDate
  if (name === "classEndDate" && updatedData.classStartDate && value < updatedData.classStartDate) {
    setDateError("End Date cannot be before Start Date");
  } else {
    setDateError("");
  }

  setEditData(updatedData);
};

const teacherOptions = progTeacherNames.map(name => ({
  value: name,
  label: name
}));

const formatDate = (dateString) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day}-${months[parseInt(month, 10) - 1]}-${year}`;
};

const getStudentKey = (student) => `${student.name} ${student.studentID} ${student.intake} ${student.program}`;

const displayedStudents = showSelectedOnly
  ? filteredStudents.filter(student =>
      editData.classStudents.includes(student.name) || 
      editData.classStudents.includes(getStudentKey(student))
    )
  : filteredStudents;

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const years = ['21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];

  const fullIntake = `${studentFilter.intakeMonth}-${studentFilter.intakeYear}`

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
                <h2 className="fs-2 m-0">CLASSROOM INFORMATION</h2>
            </div>
            <div className="manageClassTimediv2 d-flex justify-content-between align-items-center">
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
                        <th style={{ textAlign: "center" }}>Semester</th>
                        <th style={{ textAlign: "center" }}>Program</th>
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
                                <td colSpan="10" style={{ fontWeight: "bold", backgroundColor: "#f0f0f0" }}>
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
                                            <td colSpan="9" style={{ fontWeight: "bold", backgroundColor: "#e0e0e0" }}>
                                                {program}
                                            </td>
                                        </tr>

                                        {/* Render Rows only if Program is Expanded */}
                                        {expandedPrograms[`${semester}-${program}`] &&
                                            groupedClassData[semester][program].map((item, index) => (
                                                <tr key={item.id}>
                                                    <td></td> {/* Empty cell for alignment */}
                                                    <td>{index + 1}</td>
                                                    <td>{item.classSemester}</td>
                                                    <td>{item.classProgram}</td>
                                                    <td>{item.classMarkingTemplate || 'N/A'}</td>
                                                    <td>{item.classEnrollDateProgCode}</td>
                                                    <td>{item.classCourseCode}</td>
                                                    <td>{item.classStudents}</td>
                                                    <td>{item.classStudentsID}</td>
                                                    <td>{item.classTeacherName}</td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            {data3.some((perm) => perm.category === "Manage Classroom") && (
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
                                                                                (perm) =>
                                                                                    perm.category === "Manage Classroom" &&
                                                                                    perm.accessType === "Read Only"
                                                                            )
                                                                                ? faEye
                                                                                : faEdit
                                                                        }
                                                                    />
                                                                </button>
                                                            )}
                                                            {/*{data3.some(
                                                                (perm) =>
                                                                    perm.category === "Manage Classroom" &&
                                                                    perm.accessType === "Read/Write"
                                                            ) && (
                                                                <button
                                                                    id="btnFontIcon"
                                                                    className="btn btn-warning"
                                                                    style={{ fontSize: "10px" }}
                                                                    title="Delete"
                                                                    onClick={() => deleteContact(item.id)}
                                                                >
                                                                    <FontAwesomeIcon icon={faTrash} />
                                                                </button>
                                                            )}*/}
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

            {/* Edit Modal */}
            <Modal 
              show={editShow} 
              onHide={handleEditCloseCross}
              dialogClassName="custom-modal"
              backdrop="static"
              keyboard={false}
              enforceFocus={true}
            >
              <Modal.Header closeButton>
                <Modal.Title style={{ color: '#151632' }}>
                    {data3.some(item => item.category === "Manage Classroom" && item.accessType === "Read Only")
                    ? "View Classroom"
                    : "Update Classroom"
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

                  <div className="row">
                    <div className="col-md-6">
                      <Form.Group className="mb-3" controlId="editSelectedProgram">
                        <Form.Label>Select Program</Form.Label>
                        <div style={{ position: 'relative' }}>
                        <Form.Control
                          as="select"
                          value={editData ? editData.classProgram : ""}
                          disabled
                          onChange={(e) => {
                            const selectedProgram = e.target.value;
                            const programCode = selectedProgram.match(/\((.*?)\)/)?.[1]; 
                            setEditData((prev) => ({
                              ...prev,
                              classProgram: selectedProgram,
                              classCourseCode: "", 
                            }));
                            setSelectedProgramCode(programCode); 
                          }}
                        >
                          <option value="">Select Program</option>
                          <option value="Professional Degree in Software Engineering (DSG)">Professional Degree in Software Engineering (DSG)</option>
                          <option value="Professional Diploma in Software Engineering (DSE)">Professional Diploma in Software Engineering (DSE)</option>
                          <option value="Professional Degree in IT Support (DIT)">Professional Degree in IT Support (DIT)</option>
                          <option value="Professional Diploma in IT Support (DIP)">Professional Diploma in IT Support (DIP)</option>
                          <option value="Professional Part Time Degree in Software Engineering (DSGPT)">Professional Part Time Degree in Software Engineering (DSGPT)</option>
                          <option value="Professional Part Time Diploma in Software Engineering (DSEPT)">Professional Part Time Diploma in Software Engineering (DSEPT)</option>
                          <option value="Professional Part Time Degree in IT Support (DITPT)">Professional Part Time Degree in IT Support (DITPT)</option>
                          <option value="Professional Part Time Diploma in IT Support (DIPPT)">Professional Part Time Diploma in IT Support (DIPPT)</option>
                          <option value="Professional Certificate of IT Support (CITS1)">Professional Certificate of IT Support (CITS1)</option>
                          <option value="Professional Certificate of IT Studies (CITS2)">Professional Certificate of IT Studies (CITS2)</option>
                        </Form.Control>
                          <FontAwesomeIcon 
                            icon={faCaretDown} 
                            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }} 
                          />
                        </div>
                      </Form.Group>
                    </div>

                    <div className="col-md-6">
                      <Form.Group className="mb-3" controlId="classCourseCode">
                        <Form.Label>Course Code</Form.Label>
                        <div style={{ position: 'relative' }}>
                          <Form.Control
                            as="select"
                            disabled
                            value={editData ? editData.classCourseCode : ""}
                            onChange={e => {
                              setEditData({
                                ...editData,
                                classCourseCode: e.target.value
                              });
                            }}
                          >
                            <option value="">Select Course</option>
                            {progCoursesCode.map(course => (
                              <option key={course} value={course}>{course}</option>
                            ))}
                          </Form.Control>
                          <FontAwesomeIcon 
                            icon={faCaretDown} 
                            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }} 
                          />
                        </div>
                      </Form.Group>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                    <Form.Group className="mb-3" controlId="classCourse">
                      <Form.Label>Course Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={
                          editData.classProgram === "Professional Diploma in Software Engineering (DSE)" &&
                          selectedCourseCode === "MD221"
                            ? "Android Application Development - Kotlin"
                            : selectedCourseCode?.trim().toUpperCase() === "MD221"
                            ? "Mobile Device Service & Repairs"
                            : selectedCourse || ""
                        }
                        disabled
                      />
                    </Form.Group>
                    </div>

                    <div className="col-md-6">
                      <Form.Group className="mb-3" controlId="selectedCourseMarkTemplate">
                        <Form.Label>Marking Template</Form.Label>
                        <Form.Select
                          value={editData.selectedTemplate || ''}
                          onChange={(e) =>
                            setEditData((prev) => ({
                              ...prev,
                              selectedTemplate: e.target.value,
                            }))
                          }
                        >
                          <option value="">Select Marking Template</option>
                          {Array.isArray(editData.selectedCourseMarkTemplate) &&
                            editData.selectedCourseMarkTemplate.map((template, index) => (
                              <option key={index} value={template}>
                                {template}
                              </option>
                            ))}
                        </Form.Select>
                      </Form.Group>
                    </div>

                    <div className="col-md-6">
                      <Form.Group className="mb-3" controlId="classTeacherName">
                        <Form.Label>Teacher Name</Form.Label>
                        <Select
                          isMulti
                          options={teacherOptions}
                          value={teacherOptions.filter(option =>
                            editData.classTeacherName?.includes(option.value)
                          )}
                          onChange={(selectedOptions) => {
                            const selected = selectedOptions.map(option => option.value);
                            setEditData({
                              ...editData,
                              classTeacherName: selected
                            });
                          }}
                          placeholder="Select Teacher Name(s)"
                          menuShouldScrollIntoView={false}
                          closeMenuOnSelect={false}
                        />
                      </Form.Group>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <Form.Group className="mb-3" controlId="classStartDate">
                        <Form.Label>Start Date*</Form.Label>
                        <Form.Control
                          type="date"
                          name="classStartDate"
                          value={editData ? editData.classStartDate : ""}
                          onChange={handleDateChange}
                        />
                      </Form.Group>
                    </div>

                    <div className="col-md-6">
                      <Form.Group className="mb-3" controlId="classEndDate">
                        <Form.Label>End Date*</Form.Label>
                        <Form.Control
                          type="date"
                          name="classEndDate"
                          value={editData ? editData.classEndDate : ""}
                          onChange={handleDateChange}
                        />
                        {dateError && <small className="text-danger">{dateError}</small>}
                      </Form.Group>
                    </div>
                  </div>

                  <div className="row">
                      <div className="col-md-6">
                        <Form.Group className="mb-3" controlId="classEnrollDateProgCode">
                          <Form.Label>Enroll Date*</Form.Label>
                          <div style={{ position: 'relative' }}>
                          <Form.Control
                            type="text"
                            disabled
                            value={
                              editData && selectedProgramCode && editData.classCourseCode && editData.classStartDate
                                ? `${selectedProgramCode}-${editData.classCourseCode}-${formatDate(editData.classStartDate)}`
                                : ""
                            }                                                        
                            onChange={e => {
                              setEditData({
                                ...editData,
                                classEnrollDateProgCode: e.target.value
                              });
                            }}
                          >
                          </Form.Control>
                          </div>
                        </Form.Group>
                      </div>

                      <div className="col-md-6">
                        <Form.Group className="mb-3" controlId="selectedClassDayType">
                          <Form.Label>Day Type</Form.Label>
                          <div style={{ position: 'relative' }}>
                            <Form.Control
                              as="select"
                              value={editData ? editData.classDayType : ""}
                              onChange={e => {
                                setEditData({
                                  ...editData,
                                  classDayType: e.target.value
                                });
                              }}
                            >
                              <option value="">How many session per week is the class?</option>
                              <option value="Same Day">Same Day</option>
                              <option value="2 days Only - 1">2 days Only - 1</option>
                              <option value="2 days Only - 2">2 days Only - 2</option>
                              <option value="4 days">4 days</option>
                              <option value="5 days">5 days</option>
                              <option value="7 days">7 days</option>
                              <option value="Friday Only">Friday Only</option>
                            </Form.Control>
                            <FontAwesomeIcon icon={faCaretDown} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }} />
                          </div>
                        </Form.Group>
                      </div>
                    </div>

                    <Form.Group className="mb-3" controlId="selectedStudents">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                      <Form.Label>Selected Students ({editData.classStudents.length})*</Form.Label>

                      <div style={{ display: "flex", gap: "10px" }}>
                        <Button variant="outline-primary" onClick={() => setShowStudentFilterModal(true)}>
                          Filter Students
                        </Button>
                        <Button variant="outline-success" onClick={() => setShowSelectedOnly(prev => !prev)}>
                          {showSelectedOnly ? 'Show All' : 'Selected Students'}
                        </Button>
                      </div>
                    </div>

                      {/* Search Input */}
                      <Form.Control
                        type="text"
                        placeholder="Search Students"
                        value={searchStudentQuery}
                        onChange={handleStudentSearchChange}
                        style={{ marginBottom: "10px" }}
                      />

                      <div className="row">
                        {displayedStudents.map(student => (
                          <div key={student.id} className="col-md-3">
                            <Form.Check
                              type="checkbox"
                              id={`checkbox-${student.id}`}
                              label={`${student.name} (${student.studentID}) (${student.intake}) (${student.program})`}
                              checked={
                                editData.classStudents.includes(student.name) || 
                                editData.classStudents.includes(getStudentKey(student))
                              }                              
                              onChange={() => handleSelectStudent(getStudentKey(student), isEdit, student.name)}
                            />
                          </div>
                        ))}
                      </div>
                    </Form.Group>

                </Form>

                </Carousel.Item>
                </Carousel>
              </Modal.Body>
              
              <Modal.Footer>
              <span style={{color: "red", marginRight: "auto"}}>*Verify the student list before updating</span>
              {data3.some(item => item.category === "Manage Classroom" && item.accessType === "Read/Write") && (
                <Button
                    className="submitBtn"
                    style={{float: 'right'}}
                    onClick={handleEditSubmit}
                    variant="primary"
                >
                    Update
                </Button>
              )}
              </Modal.Footer>
            </Modal>

            {/* Filter Student Modal */}
            <Modal
              show={showStudentFilterModal}
              onHide={() => {
                setStudentFilter({ intake: '', program: '', intakeMonth: '', intakeYear: '' });
                setShowStudentFilterModal(false);
              }}
            >
              <Modal.Header closeButton>
                <Modal.Title style={{ color: '#151632' }}>Filter Students</Modal.Title>
              </Modal.Header>
              <Modal.Body>

              <Form.Group controlId="filterIntake" className="mb-3">
                <Form.Label style={{ color: '#151632' }}>Intake</Form.Label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Form.Select
                    value={studentFilter.intakeMonth}
                    onChange={(e) =>
                      setStudentFilter(prev => ({ ...prev, intakeMonth: e.target.value }))
                    }
                  >
                    <option value="">Month</option>
                    {months.map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </Form.Select>

                  <Form.Select
                    value={studentFilter.intakeYear}
                    onChange={(e) => {
                      const selectedYear = e.target.value;
                      const selectedMonth = studentFilter.intakeMonth;
                      const fullIntake = selectedMonth && selectedYear ? `${selectedMonth}-${selectedYear}` : '';

                      setStudentFilter(prev => ({
                        ...prev,
                        intakeYear: selectedYear,
                        intake: fullIntake
                      }));
                    }}
                  >
                    <option value="">Year</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </Form.Select>
                </div>
              </Form.Group>

              <Form.Group controlId="filterProgram" className="mb-3">
                <Form.Label style={{ color: '#151632' }}>Program</Form.Label>
                <div style={{ position: 'relative' }}>
                  <Form.Control
                    as="select"
                    value={studentFilter.program}
                    onChange={(e) =>
                      setStudentFilter((prev) => ({ ...prev, program: e.target.value }))
                    }
                  >
                    <option value="">Select Program</option>
                    {uniquePrograms.map((program) => (
                      <option key={program} value={program}>
                        {program}
                      </option>
                    ))}
                  </Form.Control>
                  <FontAwesomeIcon 
                    icon={faCaretDown} 
                    style={{ 
                      position: 'absolute', 
                      right: 10, 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      color: '#151632'
                    }} 
                  />
                </div>
              </Form.Group>

              </Modal.Body>

              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setStudentFilter({ intake: '', program: '', intakeMonth: '', intakeYear: '' });
                  }}
                >
                  Reset
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    const fullIntake = `${studentFilter.intakeMonth}-${studentFilter.intakeYear}`;

                    setStudentFilter(prev => ({
                      ...prev,
                      intake: fullIntake
                    }));

                    setShowStudentFilterModal(false);
                  }}
                >
                  Apply
                </Button>
              </Modal.Footer>
            </Modal>

        </div>
      </div>
    </div>
  );
}