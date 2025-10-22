import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation  } from 'react-router-dom';
import axios from "axios";
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faRefresh, faPen, faEye, faUsers, faChevronUp, faChevronDown, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Button, Modal, Form, Table } from 'react-bootstrap';
import "./employee.css";
import Sidebar from "../global/Sidebar";
import SidebarEmployee from "../global/SidebarEmployee";
import Topbar from "../global/Topbar";
import TopbarEmployee from '../global/TopbarEmployee';
import Cookies from 'js-cookie';
import { adminLocalhost } from '../../localhost/adminLocalhost';
import { employeeLocalhost } from '../../localhost/employeeLocalhost';

export default function ManageAttendance() {

const [state, setState] = useState({
  leaveTypeOfLeave: "",
  leaveReasonForLeave: ""
});

const [data, setData] = useState([]);
const [data3, setData3] = useState([]);
const [editShow1, setEditShow1] = useState(false);
const [searchTerm, setSearchTerm] = useState('');
const [selectedStudentNameList, setStudentNameList] = useState([]);
const [selectedStudentIDList, setStudentIDList] = useState([]);
const [combinedStudentList, setCombinedStudentList] = useState([]);
const [checkedStudentID, setCheckStudentID] = useState('');
const [selectedEnrollDate, setSelectedEnrollDate] = useState('');
const [selectedCourseCode, setSelectedCourseCode] = useState('');
const [selectedClassTime, setSelectedClassTime] = useState('');
const [selectedProgram, setSelectedProgram] = useState('');
const [selectedSemester, setSelectedSemester] = useState('');
const [attendanceData, setAttendanceData] = useState([]);
const [uniqueDates, setUniqueDates] = useState([]);
const [checkboxStatus, setCheckboxStatus] = useState({});
const [checkedStudents, setCheckedStudents] = useState([]);
const [test, setTest] = useState([]);
const [selectedValues, setSelectedValues] = useState([]);
const [showModal, setShowModal] = useState(false);
const [showModal1, setShowModal1] = useState(false);
const [selectedLeave, setSelectedLeave] = useState('');
const [selectedLeaveStudent, setSelectedLeaveStudent] = useState('');
const [selectedStatus, setSelectedStatus] = useState('');
const [selectedLeaveStatus, setSelectedLeaveStatus] = useState('');
const [selectedChecked, setSelectedChecked] = useState('');
const [selectedStudentLeaveDetials, setSelectedStudentLeaveDetials] = useState('');
const [selectedLeaveInfo, setSelectedLeaveInfo] = useState('');
const [selectedLessonDate, setSelectedLessonDate] = useState('');
const [selectedNoOfDay, setSelectedNoOfDay] = useState('');
const [file, setFile] = useState();
const [attendanceResult, setAttendanceResults] = useState([]);
const [expandedSemesters, setExpandedSemesters] = useState({});
const [expandedPrograms, setExpandedPrograms] = useState({});
const [selectedstdAtdEligibility, setSelectedstdAtdEligibility] = useState('');
const navigate = useNavigate();
const employeeJobTitle = Cookies.get('employeeJobTitle');

const query = new URLSearchParams(useLocation().search);
const studentID = query.get('studentID');

const loadData3 = async () => {
  try {
    const username = Cookies.get("sisUsername") || Cookies.get("employeeUsername");

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
    const role = Cookies.get("sisRole");
    const jobTitle = Cookies.get("employeeJobTitle");
    let response;

    const adminRoles = ["Course Coordinator", "Head of Department"];

    if (role?.includes("Admin") || adminRoles.includes(jobTitle)) {
      response = await axios.get(`${employeeLocalhost}/attendance/getAttendanceDetails`);
    } else if (jobTitle === "Course Counsellor") {
      response = await axios.get(`${adminLocalhost}/class/getStudentIDInfo/${studentID}`);
    } else {
      const username = Cookies.get('employeeUsername');
      response = await axios.get(`${employeeLocalhost}/attendance/getAttendanceByTeacher/${username}`);
    }

    setData(response.data);
  } catch (error) {
    console.error('Error occurred while fetching course details:', error);
  }
};

useEffect(() => {
    loadData();
}, []);

//Get Attendance details
useEffect(() => {
  const fetchExamResults = async () => {
      try {
          const response = await axios.get(`${employeeLocalhost}/attendanceEligible/getAttendanceEligibleDetails1/${selectedEnrollDate}`);
          setAttendanceResults(response.data);         
          
      } catch (error) {
          console.error('Error fetching attendace results:', error);
      }
  };

  fetchExamResults();
}, [selectedEnrollDate]);

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

const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
};

const courseField = employeeJobTitle === 'Course Counsellor' ? 'classCourseCode' : 'attendanceCourse';
const enrollDateField = employeeJobTitle === 'Course Counsellor' ? 'classEnrollDateProgCode' : 'attendanceEnrollDate';
const isCounsellor = employeeJobTitle === 'Course Counsellor';
const semesterField = isCounsellor ? 'classSemester' : 'attendanceSemester';
const programField = isCounsellor ? 'classProgram' : 'attendanceProgram';

const filteredData = data.filter((item, index, self) => {
  const courseValue = item[courseField]?.toLowerCase() || ""; // Safe access with optional chaining
  const enrollDateValue = item[enrollDateField]?.toLowerCase() || "";

  const courseMatch = courseValue.includes(searchTerm.toLowerCase());
  const enrollDateMatch = enrollDateValue.includes(searchTerm.toLowerCase());

  const uniqueItem = index === self.findIndex((t) =>
    t[enrollDateField] === item[enrollDateField] &&
    t[courseField] === item[courseField]
  );

  return (courseMatch || enrollDateMatch) && uniqueItem;
}).sort((a, b) => 
  (a[courseField] || "").localeCompare(b[courseField] || "")
);

useEffect(() => {
  const fetchData = async () => {
      try {
          const response = await axios.get(`${employeeLocalhost}/attendance/getAttendanceDetails1/${selectedEnrollDate}/${selectedCourseCode}`);
          const attendanceData = response.data;

          // Extract unique dates and lessons from the fetched data
          const uniqueDates = [...new Set(attendanceData.map(item => item.attendanceClassLessonDate))];
          const uniqueLessons = [...new Set(attendanceData.map(item => item.attendanceClassLesson))];
          
          // Combine lesson numbers and dates
          const combinedData = uniqueDates[0].split(',').map((date, index) => {
              return {
                  lesson: uniqueLessons[0].split(',')[index].trim(),
                  date: date.trim()
              };
          });

          setUniqueDates(combinedData);
          setAttendanceData(attendanceData);
      } catch (error) {
          console.error('Error fetching attendance data:', error);
      }
  };

  fetchData();
}, [selectedEnrollDate, selectedCourseCode]);

//get student leave details
useEffect(() => {
  fetchStudentLeaveDetails();
}, [selectedEnrollDate, combinedStudentList, selectedLessonDate]);

//get student leave details from the modal
useEffect(() => {

  if (showModal1) {
    fetchLeaveDetails();
  }
}, [showModal1, selectedLessonDate, selectedEnrollDate, combinedStudentList]);

const fetchLeaveDetails = async () => {
  if (!selectedLessonDate || !selectedEnrollDate) return;

  try {
    for (const student of combinedStudentList) {
      try {
        const response = await axios.get(
          `${employeeLocalhost}/studentLeave/getStudentLeaveDetails/${selectedEnrollDate}/${student.id}/${selectedLessonDate}`
        );   
        
        setSelectedLeaveInfo(response.data);

      } catch (error) {
        console.error(`Error fetching data for ${student.id} on ${selectedLessonDate}:`, error);
      }
    }

  } catch (err) {
    console.error("Unexpected error while fetching leave data:", err);
  }
};

const fetchStudentLeaveDetails = async () => {
  try {    
      const leaveDetailsPromises = combinedStudentList.flatMap(student =>
          uniqueDates.map(({ date }) =>
              axios.get(`${employeeLocalhost}/studentLeave/getStudentLeaveDetails/${selectedEnrollDate}/${student.id}/${date}`)
                  .catch(error => {
                      console.error(`Error fetching data for ${student.id} on ${date}:`, error);
                      return null;
                  })
          )
      );

      const responses = await Promise.all(leaveDetailsPromises);

      const newLeaveStatuses = responses.reduce((acc, response, index) => {
          if (response && response.data) {
              const studentIndex = Math.floor(index / uniqueDates.length);
              const studentName = combinedStudentList[studentIndex].name;
              const dateIndex = index % uniqueDates.length;
              const leaveDate = uniqueDates[dateIndex].date;

              acc[studentName] = acc[studentName] || {};
              acc[studentName][leaveDate] = response.data.leaveTypeOfLeave;
          }
          return acc;
      }, {});

      setSelectedLeaveStatus(newLeaveStatuses);

  } catch (error) {
      console.error('Error fetching student leave data:', error);
  }
};

const handleButtonClick = async (id, EnrollDate, Course, ClassTime, program, semester) => {
  try {
    setSelectedProgram(program);
    setSelectedSemester(semester);
    setCheckStudentID(id);

    const isCounsellor = employeeJobTitle === 'Course Counsellor';
    const selectedEnrollDateValue = EnrollDate;
    const selectedCourseCodeValue = Course;
    const selectedClassTimeValue = ClassTime?.split(', ')[0] || '';

    setSelectedEnrollDate(selectedEnrollDateValue);
    setSelectedCourseCode(selectedCourseCodeValue);
    setSelectedClassTime(selectedClassTimeValue);

    const attendanceResponse = await axios.get(
      `${employeeLocalhost}/attendance/getAttendanceDetails1/${selectedEnrollDateValue}/${selectedCourseCodeValue}`
    );
    setAttendanceData(attendanceResponse.data[0]);

    const namesResponse = await axios.get(
      `${adminLocalhost}/class/studentNames/${selectedEnrollDateValue}/${selectedCourseCodeValue}`
    );
    const namesArray = namesResponse.data[0].split(',').map((name) => name.trim());
    const idsArray = namesResponse.data[1].split(',').map((id) => id.trim());
    const intakeArray = namesResponse.data[2].split(',').map((intake) => intake.trim());
    setStudentNameList(namesArray);
    setStudentIDList(idsArray);

    // Build UNSORTED base array (exact API order)
    const baseArray = namesArray.map((name, index) => ({
      name,
      id: idsArray[index],
      intake: intakeArray[index],
    }));

    // Sort only for display
    const combinedArray = [...baseArray].sort((a, b) => a.name.localeCompare(b.name));
    setCombinedStudentList(combinedArray);

    // Fetch saved statuses
    const attendanceStatusResponse = await axios.get(
      `${employeeLocalhost}/studentAttendance/getAttendanceByEnrollDateProgCodeAndCourse/${selectedEnrollDateValue}/${selectedCourseCodeValue}`
    );

    const statusesRaw = attendanceStatusResponse.data.map((item) => item.stdAtdStatus || "");
    const tokens = statusesRaw
      .flatMap((status) => status.split(',').map((s) => s.trim()))
      .filter(Boolean);

    // Map index→ID using UNSORTED baseArray
    const mapIndexToId = (idx) => {
      const i = Number(idx);
      const stu = baseArray[i];
      return stu?.id || `UNKNOWN_${idx}`;
    };

    const tokensInflated = tokens.map((t) => {
      const parsed = parseKey(t);
      if (!parsed) return t;
      const { type, mid, dateIndex } = parsed;
      const isId = isNaN(Number(mid)); // numeric = old index
      const studentId = isId ? mid : mapIndexToId(mid);
      return keyFor(type, studentId, dateIndex);
    });

    // Hydrate state with ID-based tokens
    const nextStatus = {};
    for (const tok of tokensInflated) nextStatus[tok] = true;
    setCheckboxStatus(nextStatus);
    setTest(tokensInflated);


    if (isCounsellor) {
      const getStudentAttendanceEligible = await axios.get(
        `${employeeLocalhost}/attendanceEligible/getAttendanceEligiblePercentage/${selectedEnrollDateValue}/${studentID}`
      );
      const eligibleData = getStudentAttendanceEligible.data[0];
      setSelectedstdAtdEligibility(eligibleData ? `${eligibleData.eligiblePercentage}%` : "N/A");
    } else {
      setSelectedstdAtdEligibility(null); // Or reset if needed
    }

    setEditShow1(true);
  } catch (error) {
    console.error('Error in handleButtonClick:', error);
    if (error.response?.status === 404) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Students are not found on given Enroll Date and Course!',
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'An unexpected error occurred!',
      });
    }
  }
};

const now = new Date();

const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');
const day = String(now.getDate()).padStart(2, '0');
const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');

const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}`;

const handleSaveAttendance = async () => {
  const names = [];
  const ids = [];
  const statuses = [];
  const attendanceEligibility = [];
  let date, enrollDateProgCode, course;
  let backupData = null; 

  checkedStudents.forEach(student => {
    names.push(student.stdAtdName);
    ids.push(student.stdAtdID);
    statuses.push(student.stdAtdStatus);
    date = student.stdAtdDate;
    course = student.stdAtdCourse;
    enrollDateProgCode = student.stdAtdEnrollDateProgCode;
    attendanceEligibility.push(student.stdAtdEligibility);
  });

  if (checkedStudents.length === 0) {
      Swal.fire({
          position: "top-end",
          icon: "info",
          title: "No attendance selected to save",
          showConfirmButton: false,
          timer: 1500,
      });
      return;
  }

  const uploadData = {
    stdAtdName: names.join(', '),
    stdAtdID: ids.join(', '),
    stdAtdStatus: test.join(', ')
  };

  try {
    // Step 1: Fetch Existing Attendance Data (Backup)
    const response = await axios.get(
      `${employeeLocalhost}/studentAttendance/getAttendanceReportView/${selectedEnrollDate}/${selectedCourseCode}/${date}`
    );

    if (!response.data || response.data.length === 0) {
        throw new Error("No attendance record found.");
    }

    backupData = { ...response.data[0] }; // Store backup before updating to NULL

    // Step 2: Set Status to NULL
    await axios.put(`${employeeLocalhost}/studentAttendance/updateAttendance/${selectedEnrollDate}/${selectedCourseCode}/${response.data[0].id}`, uploadData);

    // Step 4: Update or Insert Eligibility Records
    try {
      const promises = names.map((_, i) => {
        const uploadData1 = {
          eligibleStudentName: names[i],
          eligibleStudentID: ids[i],
          eligibleStudentCourseEnroll: enrollDateProgCode,
          eligibleStudentCourseID: course,
          eligiblePercentage: attendanceEligibility[i],
        };
        return axios.post(`${employeeLocalhost}/attendanceEligible/saveOrUpdate`, uploadData1);
      });
      await Promise.all(promises);
    } catch (eligibleError) {
      console.error("Attendance Eligible Error:", eligibleError);

      // Log as 'attendance eligible error' in report
      try {
        await axios.post(`${adminLocalhost}/attendanceReport/addReportAutoClean`, {
          reportDate: formattedDateTime,
          attendanceDate: date,
          reportEnrollID: selectedEnrollDate,
          reportStatus: "attendance eligible error",
          markStatus: "Not Mark",
          reportTeacher: Cookies.get("employeeUsername")
        });
      } catch (logErr) {
        console.error("Failed to log attendance eligible error:", logErr);
      }
    } 

    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "Attendance saved successfully!",
      showConfirmButton: false,
      timer: 1500,
    }).then(async () => {
      try {
        await axios.post(`${adminLocalhost}/attendanceReport/addReportAutoClean`, {
          reportDate: formattedDateTime,
          attendanceDate: date,
          reportEnrollID: selectedEnrollDate,
          reportStatus: "success",
          markStatus: "Not Mark",
          reportTeacher: Cookies.get("employeeUsername")
        });
      } catch (err) {
        console.error("Failed to log success report:", err);
      }

      loadData();
      fetchLeaveDetails();
      fetchStudentLeaveDetails();
    });

  } catch (error) {
      console.error("Error saving attendance:", error);

      if (backupData) {
        await axios.put(
          `${employeeLocalhost}/studentAttendance/updateStudentAttendanceFields/${backupData.id}`, 
          backupData
        );
      }

      Swal.fire({
        position: "top-end",
        icon: "error",
        title: "Failed to save attendance",
        text: error.message || "An unknown error occurred.",
        showConfirmButton: false,
        timer: 1500,
      }).then(async () => {
        try {
          await axios.post(`${adminLocalhost}/attendanceReport/addReportAutoClean`, {
            reportDate: formattedDateTime,
            attendanceDate: date,
            reportEnrollID: selectedEnrollDate,
            reportStatus: "error",
            markStatus: "Not Mark",
            reportTeacher: Cookies.get("employeeUsername")
          });
        } catch (err) {
          console.error("Failed to log error report:", err);
        }
      });

      // Reset states
      setEditShow1(false);
      setCheckboxStatus({});
      setCheckedStudents([]);
      setTest([]);
  }
};

const keyFor = (type, studentId, dateIndex) => `${type}_${studentId}_${dateIndex}`;

const parseKey = (token) => {
  // Supports both new: "present_ST00246_2" and old: "present_1_2"
  const parts = token?.split('_') || [];
  // parts: [type, mid, tail]  (mid = studentId OR studentIndex)
  if (parts.length !== 3) return null;
  const [type, mid, tail] = parts;
  return { type, mid, dateIndex: Number(tail) };
};

const handleCheckboxChange = (e, item, student, date, name, id, selectedEnrollDate, selectedCourseCode, studentIndex, dateIndex, type) => {
  const { value, checked } = e.target;
  setSelectedChecked(checked);

  // Update the checkbox status (only one of present/late/absent is true for the cell)
  setCheckboxStatus(prev => ({
    ...prev,
    [keyFor('present', id, dateIndex)]: type === 'present' ? checked : false,
    [keyFor('late',    id, dateIndex)]: type === 'late'    ? checked : false,
    [keyFor('absent',  id, dateIndex)]: type === 'absent'  ? checked : false,
  }));

  // (Optional) If you don't use selectedValues elsewhere, remove that state entirely.
  // If you keep it, at least switch to the token value itself:
  setSelectedValues(prev => {
    const next = (Array.isArray(prev) ? prev : []).filter(t => {
      const p = parseKey(t);
      return !(p && p.mid === id && p.dateIndex === dateIndex);
    });
    if (checked) next.push(value);
    return next;
  });

  // Compute percentage with the current click applied synchronously
  let presentCount = 0, lateCount = 0, absentCount = 0;
  uniqueDates.forEach((_, i) => {
    let p = !!checkboxStatus[keyFor('present', id, i)];
    let l = !!checkboxStatus[keyFor('late',    id, i)];
    let a = !!checkboxStatus[keyFor('absent',  id, i)];
    if (i === dateIndex) { // apply current click
      p = (type === 'present') ? checked : false;
      l = (type === 'late')    ? checked : false;
      a = (type === 'absent')  ? checked : false;
    }
    if (p) presentCount++;
    if (l) lateCount++;
    if (a) absentCount++;
  });
  const totalPercentage = ((presentCount * 1) + (lateCount * 0.33)) / uniqueDates.length * 100;

  // Track row to save
  setCheckedStudents(prev => {
    const idx = prev.findIndex(s => s.stdAtdID === id && s.stdAtdDate === date);
    const payload = {
      stdAtdName: name,
      stdAtdID: id,
      stdAtdStatus: [value], // e.g. "present_ST00246_2"
      stdAtdDate: date,
      stdAtdEnrollDateProgCode: selectedEnrollDate,
      stdAtdCourse: selectedCourseCode,
      stdAtdEligibility: totalPercentage.toFixed(2),
    };
    if (idx === -1) return [...prev, payload];
    const copy = [...prev];
    copy[idx] = { ...copy[idx], ...payload };
    return copy;
  });

  // Keep flat token list for saving
  setTest(prev => {
    const isSameCell = (t) => {
      const p = parseKey(t);
      return p && p.mid === id && p.dateIndex === dateIndex;
    };
    const next = (prev || []).filter(t => !isSameCell(t));
    if (checked) next.push(value);
    return next;
  });

  // Absent → prompt leave
  if (type === 'absent' && checked) {
    Swal.fire({
      title: 'Did the student submit any form or inform about the absence?',
      showDenyButton: true,
      confirmButtonText: 'Yes',
      denyButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        setShowModal(true);
        setSelectedLeave(item);
        setSelectedLeaveStudent(student);
        setSelectedStatus(`${id}_${dateIndex}`); // store id + dateIndex
      }
    });
  }
}; 

const handleCloseCross = (e) => {
  setEditShow1(false);

  setCheckboxStatus({});
  setCheckedStudents([]);
  setTest([]);
};

const handleCloseCross1 = (e) => {
  setShowModal(false);
  
  setSelectedStudentLeaveDetials(prevDetails => ({
    ...prevDetails,
    leaveTypeOfLeave: "",   
    leaveReasonForLeave: "",
    fileName: ""
  }));
}; 

const handleCloseCross2 = (e) => {
  setShowModal1(false);
}; 

const handleInputChange = (e) => {
  const { name, value } = e.target;
  
  // Update the generic state (e.g., leaveTypeOfLeave)
  setState({ ...state, [name]: value });

  // If the field is 'leaveStartDay' or 'leaveEndDay', calculate the difference in days
  if (name === 'leaveStartDay' || name === 'leaveEndDay') {
    const startDate = new Date(state.leaveStartDay); // Ensure state.leaveStartDay is already a valid date string or Date object
    const endDate = new Date(state.leaveEndDay);     // Same for state.leaveEndDay

    if (!isNaN(startDate) && !isNaN(endDate)) { // Check if dates are valid
      const oneDay = 24 * 60 * 60 * 1000; // Hours * Minutes * Seconds * Milliseconds
      const diffDays = Math.round(Math.abs((endDate - startDate) / oneDay)) + 1; // Add 1 to include both start and end dates
      setSelectedNoOfDay(diffDays);

      // Update state with the calculated leaveNoOfDay
      setState(prevState => ({
        ...prevState,
        leaveNoOfDay: diffDays.toString(),
      }));
    }

    // Format the date to 'dd-MMM-yyyy' format
    const date = new Date(value);
    if (!isNaN(date)) { // Ensure the date is valid
      const day = date.getDate().toString().padStart(2, '0'); // Ensure double digits for day
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;
      
      // Update the field with the formatted date
      setState(prevState => ({ ...prevState, [name]: formattedDate }));
    }
  }

  if (e.target.name === 'leaveTypeOfLeave') 
  {
    setSelectedStudentLeaveDetials((prevDetails) => ({
      ...prevDetails,
      leaveTypeOfLeave: value,
    }));
  }
  else if (e.target.name === 'leaveReasonForLeave') 
    {
      setSelectedStudentLeaveDetials((prevDetails) => ({
        ...prevDetails,
        leaveReasonForLeave: value,
      }));
    }
};  

const handleSubmit = async (e) => {
  e.preventDefault();  

  if (!state.leaveTypeOfLeave || !state.leaveReasonForLeave || !file) {
      Swal.fire({
          position: 'top-end',
          icon: 'warning',
          title: 'Please fill up all details!',
          showConfirmButton: false,
          timer: 1500
      });
      return;
  }

  const formData = new FormData();

  // Append the file to the FormData
  formData.append('file', file);
  formData.append('leaveCourse', selectedCourseCode);
  formData.append('leaveName', selectedLeaveStudent.id); // Changed from name to id
  formData.append('leaveNoOfDay', "1");
  formData.append('leaveStartDay', selectedLeave.date);
  formData.append('leaveEndDay', selectedLeave.date);
  formData.append('leaveTypeOfLeave', state.leaveTypeOfLeave);
  formData.append('leaveReasonForLeave', state.leaveReasonForLeave);
  formData.append('leaveEnrollID', selectedEnrollDate);

  try {
      await axios.post(`${employeeLocalhost}/studentLeave/addStudentLeave`, formData, {
          headers: {
              'Content-Type': 'multipart/form-data'
          }
      });

      // selectedStatus is "studentId_dateIndex"
      const [leaveStudentId, leaveDateIndexStr] = String(selectedStatus).split('_');
      const leaveDateIndex = Number(leaveDateIndexStr);

      setCheckboxStatus(prev => ({
        ...prev,
        [keyFor('present', leaveStudentId, leaveDateIndex)]: true,
        [keyFor('late',    leaveStudentId, leaveDateIndex)]: false,
        [keyFor('absent',  leaveStudentId, leaveDateIndex)]: false,
      }));

      setCheckedStudents(prev => {
        const updated = [...prev];
        const index = updated.findIndex(s =>
          s.stdAtdID === selectedLeaveStudent.id && s.stdAtdDate === selectedLeave.date
        );
        if (index !== -1) {
          updated[index].stdAtdStatus = keyFor('present', leaveStudentId, leaveDateIndex);
        }
        return updated;
      });

      setTest(prev => {
        const next = (prev || []).filter(t => {
          const p = parseKey(t);
          return !(p && p.mid === leaveStudentId && p.dateIndex === leaveDateIndex);
        });
        next.push(keyFor('present', leaveStudentId, leaveDateIndex));
        return next;
      });

      setState({
        leaveTypeOfLeave: "",
        leaveReasonForLeave: "",
        leaveNoOfDay: "1",
      });

      setSelectedStudentLeaveDetials({
          leaveTypeOfLeave: "",
          leaveReasonForLeave: "",
          fileName: "",
      });
      
      setShowModal(false);
  } catch (error) {
      console.error('Error occurred while adding leave application:', error);
  }
};

const handleFileChange = (event) => {
  const selectedFile = event.target.files[0];

  if (!selectedFile) return;

  const maxSize = 2 * 1024 * 1024;
  if (selectedFile.size > maxSize) {
    Swal.fire({
      icon: 'error',
      title: 'File Too Large',
      text: 'The file size must be less than 2MB.',
    });
    return;
  }

  setFile(selectedFile);
};

const base64ToBlob = (base64, contentType) => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
};

const createFileUrl = () => {
  const { fileData, contentType, fileName } = selectedStudentLeaveDetials;
  if (fileData && contentType) {
    const blob = base64ToBlob(fileData, contentType);
    const url = URL.createObjectURL(blob);
    return url;
  }
  return null;
};

const createFileUrl1 = () => {
  const { fileData, contentType, fileName } = selectedLeaveInfo;
  if (fileData && contentType) {
    const blob = base64ToBlob(fileData, contentType);
    const url = URL.createObjectURL(blob);
    return url;
  }
  return null;
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

// Group data by attendanceSemester and attendanceProgram
const groupedData = filteredData.reduce((acc, item) => {
  const semester = item[semesterField];
  const program = item[programField];
  if (!acc[semester]) {
    acc[semester] = {};
  }
  if (!acc[semester][program]) {
    acc[semester][program] = [];
  }
  acc[semester][program].push(item);
  return acc;
}, {});

// Sort semesters and programs
const sortedSemesters = Object.keys(groupedData).sort((a, b) => b.localeCompare(a));

const sortedGroupedData = sortedSemesters.reduce((sortedAcc, semester) => {
  const sortedPrograms = Object.keys(groupedData[semester]).sort((a, b) => a.localeCompare(b));

  sortedAcc[semester] = sortedPrograms.reduce((sortedProgAcc, program) => {
    sortedProgAcc[program] = groupedData[semester][program].sort((y, x) =>
      (y[courseField] || "").localeCompare(x[courseField] || "")
    );
    return sortedProgAcc;
  }, {});
  return sortedAcc;
}, {});

const deleteStudentLeave = async (studentId, date) => {
  try {
      const confirmDelete = await Swal.fire({
          title: "Are you sure?",
          text: "You will not be able to recover this leave record!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, delete it!",
      });

      if (confirmDelete.isConfirmed) {
          await axios.delete(`${employeeLocalhost}/studentLeave/deleteStudentLeave/${selectedEnrollDate}/${studentId}/${date}`);

          Swal.fire({
              position: "top-end",
              icon: "success",
              title: "Leave deleted successfully!",
              showConfirmButton: false,
              timer: 1500,
          });

          fetchStudentLeaveDetails();
      }
  } catch (error) {
      Swal.fire({
          position: "top-end",
          icon: "error",
          title: "Failed to delete leave",
          showConfirmButton: false,
          timer: 1500,
      });
      console.error("Error deleting leave:", error);
  }
};

const fileUrl = createFileUrl();
const fileUrl1 = createFileUrl1();

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
                    <h2 className="fs-2 m-0">Manage Attendance</h2>
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
                    {employeeJobTitle === 'Course Counsellor' && (
                      <Button
                        className='btn btn-secondary'
                        title='Go back'
                        style={{ marginRight: "10px" }}
                        onClick={() => navigate("/manageProgram")}
                      >
                        <FontAwesomeIcon icon={faArrowLeft} />
                      </Button>
                    )}
                </div>

                <div className="table-container">
                  <table className="styled-table">
                      <thead>
                          <tr>
                              <th style={{ textAlign: "center" }}>Expand</th>
                              <th style={{ textAlign: "center" }}>No</th>
                              <th style={{ textAlign: "center" }}>Enroll Code</th>
                              <th style={{ textAlign: "center" }}>Program</th>
                              <th style={{ textAlign: "center" }}>Course</th>
                              <th style={{ textAlign: "center" }}>Start Date</th>
                              <th style={{ textAlign: "center" }}>End Date</th>
                              <th style={{ textAlign: "center" }}>Class Time</th>
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
                                      <td colSpan="9" style={{ fontWeight: "bold", backgroundColor: "#f0f0f0" }}>
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
                                                  <td colSpan="8" style={{ fontWeight: "bold", backgroundColor: "#e0e0e0" }}>
                                                      {program}
                                                  </td>
                                              </tr>

                                              {/* Render Rows only if Program is expanded */}
                                              {expandedPrograms[`${semester}-${program}`] &&
                                                  sortedGroupedData[semester][program].map((item, index) => (
                                                      <tr key={item.id}>
                                                          <td></td> {/* Empty cell for alignment */}
                                                          <td scope="row">{index + 1}</td>
                                                          {employeeJobTitle === 'Course Counsellor' ? (
                                                            <>
                                                              <td>{item.classEnrollDateProgCode}</td>
                                                              <td>{item.classProgram}</td>
                                                              <td>{item.classCourseCode}</td>
                                                              <td>{item.classStartDate}</td>
                                                              <td>{item.classEndDate}</td>
                                                              <td>{item.classTime.split(", ")[0]}</td>
                                                              <td>{item.classTeacherName}</td>
                                                            </>
                                                          ) : (
                                                            <>
                                                              <td>{item.attendanceEnrollDate}</td>
                                                              <td>{item.attendanceProgram}</td>
                                                              <td>{item.attendanceCourse}</td>
                                                              <td>{item.attendanceClassStartDate}</td>
                                                              <td>{item.attendanceClassEndDate}</td>
                                                              <td>{item.attendanceClassTime.split(", ")[0]}</td>
                                                              <td>{item.attendanceTeacherName}</td>
                                                            </>
                                                          )}

                                                          {/* Attendance Button Logic (Common for Both) */}
                                                          <td>
                                                            {data3.some((item) => item.category === "Manage Attendance") && (
                                                              <button
                                                                id="btnFontIcon"
                                                                className="btn btn-success"
                                                                style={{ fontSize: "10px" }}
                                                                title="Attendance"
                                                                onClick={() =>
                                                                  handleButtonClick(
                                                                    item.id,
                                                                    employeeJobTitle === 'Course Counsellor' ? item.classEnrollDateProgCode : item.attendanceEnrollDate,
                                                                    employeeJobTitle === 'Course Counsellor' ? item.classCourseCode : item.attendanceCourse,
                                                                    employeeJobTitle === 'Course Counsellor' ? item.classTime : item.attendanceClassTime,
                                                                    program,
                                                                    semester
                                                                  )
                                                                }                                                                
                                                              >
                                                                <FontAwesomeIcon
                                                                  icon={
                                                                    data3.some(
                                                                      (item) =>
                                                                        item.category === "Manage Attendance" &&
                                                                        item.accessType === "Read Only"
                                                                    )
                                                                      ? faEye
                                                                      : faUsers
                                                                  }
                                                                />
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
                </div>

                {/* Attendance View Modal */}
                <Modal show={editShow1} onHide={handleCloseCross} backdrop="static" keyboard={false} enforceFocus={true} dialogClassName="custom-modal">
                  <Modal.Header closeButton>
                  <Modal.Title style={{ color: 'black', fontSize: "20px" }}>
                      {data3.some(item => item.category === "Manage Attendance" && item.accessType === "Read Only")
                          ? `View Attendance Report`
                          : `Update Attendance Report`}
                  </Modal.Title>

                  <span style={{ fontSize: "14px", color: "gray", display: "block", marginTop: "auto", marginLeft: "auto" }}>
                      <strong>Enroll Date:</strong> {selectedEnrollDate} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      <strong>Semester:</strong> {selectedSemester} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      <strong>Program:</strong> {selectedProgram} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      <strong>Course Code:</strong> {selectedCourseCode} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      <strong>Time:</strong> {selectedClassTime}
                  </span>
                  </Modal.Header>
                  <Modal.Body>
                      <div className="scroll-container">
                          <Table striped bordered hover style={{ minWidth: "800px" }}>
                            <thead>
                                <tr style={{ textAlign: "center", fontSize: "13px" }}>
                                    <th className="sticky-header" style={{ verticalAlign: "middle" }}>Attendance Eligibility</th>
                                    <th className="sticky-header" style={{ verticalAlign: "middle" }}>Student</th>
                                    {/* Loop through combined lesson and date values */}
                                    {uniqueDates.map((item, index) => (
                                        <th key={index} style={{ verticalAlign: "middle" }}>
                                            <div>
                                                <span>{item.lesson} - ({item.date})</span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                              <tbody style={{ textAlign: "center" }}>
                                {(employeeJobTitle === 'Course Counsellor' 
                                  ? combinedStudentList.filter(student => student.id === studentID) 
                                  : combinedStudentList
                                ).map((student, studentIndex) => {
                                    // Initialize counters
                                    /*let presentCount = 0;
                                    let lateCount = 0;
                                    let absentCount = 0;

                                    const correctStudentIndex = employeeJobTitle === 'Course Counsellor'
                                    ? combinedStudentList.findIndex(s => s.id === studentID)
                                    : studentIndex;

                                    uniqueDates.forEach((date, dateIndex) => {
                                      const studentStatus = `${correctStudentIndex}_${dateIndex}`;
                                      if (checkboxStatus[`present_${studentStatus}`]) presentCount++;
                                      if (checkboxStatus[`late_${studentStatus}`]) lateCount++;
                                      if (checkboxStatus[`absent_${studentStatus}`]) absentCount++;
                                    });

                                    const totalPercentage = ((presentCount * 1) + (lateCount * 0.33) + (absentCount * 0)) / uniqueDates.length * 100;*/

                                    let presentCount = 0, lateCount = 0, absentCount = 0;

                                    uniqueDates.forEach((_, i) => {
                                      if (checkboxStatus[keyFor('present', student.id, i)]) presentCount++;
                                      if (checkboxStatus[keyFor('late',    student.id, i)]) lateCount++;
                                      if (checkboxStatus[keyFor('absent',  student.id, i)]) absentCount++;
                                    });

                                    const totalPercentage = ((presentCount * 1) + (lateCount * 0.33)) / uniqueDates.length * 100;

                                    return (
                                        <tr key={studentIndex}>
                                            <td className="sticky-column" style={{ verticalAlign: "middle", fontSize: "12px" }}>
                                              {employeeJobTitle === 'Course Counsellor'
                                                ? selectedstdAtdEligibility
                                                : `${totalPercentage.toFixed(2)}%`}
                                            </td>
                                            <td className="sticky-column" style={{ verticalAlign: "middle", fontSize: "12px" }}>{student.name}<br />({student.id}) <br />({student.intake})</td>
                                            {uniqueDates.map((item, dateIndex) => {
                                              /*const studentStatus = `${correctStudentIndex}_${dateIndex}`;
                                              const isCheckedPresent = checkboxStatus[`present_${studentStatus}`] || false;
                                              const isCheckedLate = checkboxStatus[`late_${studentStatus}`] || false;
                                              const isCheckedAbsent = checkboxStatus[`absent_${studentStatus}`] || false;*/

                                              const keyBase = `${student.id}_${dateIndex}`;
                                              const isCheckedPresent = checkboxStatus[keyFor('present', student.id, dateIndex)] || false;
                                              const isCheckedLate    = checkboxStatus[keyFor('late',    student.id, dateIndex)] || false;
                                              const isCheckedAbsent  = checkboxStatus[keyFor('absent',  student.id, dateIndex)] || false;

                                              return (
                                                  <td key={dateIndex}>
                                                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                          <Form.Check
                                                              type="checkbox"
                                                              checked={isCheckedPresent}
                                                              label="Present"
                                                              //value={`present_${studentStatus}`}
                                                              value={keyFor('present', student.id, dateIndex)}
                                                              onChange={(e) =>
                                                                  handleCheckboxChange(e, item, student, item.date, student.name, student.id, selectedEnrollDate, selectedCourseCode, studentIndex, dateIndex, 'present', totalPercentage.toFixed(2))
                                                              }
                                                              style={{ fontSize: '13px' }}
                                                          />
                                                          <Form.Check
                                                              type="checkbox"
                                                              checked={isCheckedLate}
                                                              label="Late"
                                                              //value={`late_${studentStatus}`}
                                                              value={keyFor('late', student.id, dateIndex)}
                                                              onChange={(e) =>
                                                                  handleCheckboxChange(e, item, student, item.date, student.name, student.id, selectedEnrollDate, selectedCourseCode, studentIndex, dateIndex, 'late', totalPercentage.toFixed(2))
                                                              }
                                                              style={{ fontSize: '13px' }}
                                                          />
                                                          <Form.Check
                                                              type="checkbox"
                                                              checked={isCheckedAbsent}
                                                              label="Absent"
                                                              //value={`absent_${studentStatus}`}
                                                              value={keyFor('absent', student.id, dateIndex)}
                                                              onChange={(e) =>
                                                                  handleCheckboxChange(e, item, student, item.date, student.name, student.id, selectedEnrollDate, selectedCourseCode, studentIndex, dateIndex, 'absent', totalPercentage.toFixed(2))
                                                              }
                                                              style={{ fontSize: '13px' }}
                                                          />
                                                          {/* Conditionally render <span> for the leave status */}
                                                          {selectedLeaveStatus[student.name]?.[item.date] === 'Sick/Medical Leave' && (
                                                            <span style={{ color: 'red', fontSize: '10px' }}>MC</span>
                                                          )}
                                                          {selectedLeaveStatus[student.name]?.[item.date] === 'Plan Leave' && (
                                                            <span style={{ color: 'red', fontSize: '10px' }}>PL</span>
                                                          )}
                                                          {(selectedLeaveStatus[student.name]?.[item.date] === 'Sick/Medical Leave' || 
                                                            selectedLeaveStatus[student.name]?.[item.date] === 'Plan Leave') && (
                                                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginTop: "5px" }}>
                                                              <div style={{ flex: 1, textAlign: "center" }}>
                                                                <a
                                                                  href="#"
                                                                  onClick={(e) => {
                                                                    e.preventDefault();
                                                                    setShowModal1(true);
                                                                    setSelectedLeaveStudent(student);
                                                                    setSelectedLessonDate(item.date);
                                                                  }}
                                                                  style={{ fontSize: '12px', textDecoration: "underline", color: "blue" }}
                                                                >
                                                                  Leave Info
                                                                </a>
                                                              </div>
                                                            
                                                              <a
                                                                href="#"
                                                                onClick={(e) => {
                                                                  e.preventDefault();
                                                                  deleteStudentLeave(student.id, item.date);
                                                                }}
                                                                style={{ fontSize: '12px', color: "red" }}
                                                                title="Delete Leave"
                                                              >
                                                                <FontAwesomeIcon icon={faTrash} />
                                                              </a>
                                                            </div>                                                            
                                                          )}
                                                      </div>
                                                  </td>
                                              );
                                            })}
                                        </tr>
                                    );
                                })}
                                </tbody>
                          </Table>
                      </div>
                  </Modal.Body>
                      <Modal.Footer>
                      {/*<span style={{ color: "red", marginRight: "auto" }}>*Please put attendance lesson by lesson</span>*/}
                      {data3.some(item => item.category === "Manage Attendance" && item.accessType === "Read/Write") && (
                        <div style={{ textAlign: "center", marginTop: "20px", display: "flex", justifyContent: "center", gap: "10px" }}>
                          <button className="btn btn-primary" title='Save Attendance' onClick={handleSaveAttendance}>Save Attendance</button>
                        </div>
                        )}
                      </Modal.Footer>
                </Modal>

                {/* Apply Leave Modal */}
                {data3.some(item => item.category === "Manage Attendance" && item.accessType === "Read/Write") && (
                  <Modal show={showModal} onHide={handleCloseCross1} backdrop="static" keyboard={false} enforceFocus={true}>
                    <Modal.Header closeButton>
                        <Modal.Title style={{ color: 'black' }}>Leave Application for {selectedCourseCode} on {selectedLeave.date} at {selectedClassTime}
                          <br/>
                          <small style={{ color: 'gray', fontSize: "15px" }}>{selectedLeaveStudent.name} - {selectedLeaveStudent.id}</small>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="custom-modal-body">
                      <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="leaveTypeOfLeave">
                          <Form.Label>Type of Leave</Form.Label>
                          <Form.Select
                            name='leaveTypeOfLeave'
                            value={selectedStudentLeaveDetials.leaveTypeOfLeave || ""}
                            onChange={handleInputChange}
                          >
                            <option value="">Select type of leave</option>
                            <option value="Sick/Medical Leave">Sick/Medical Leave</option>
                            <option value="Plan Leave">Plan Leave</option>
                          </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="leaveReasonForLeave">
                          <Form.Label>Reason for leave</Form.Label>
                          <Form.Control
                              type="text"
                              name='leaveReasonForLeave'
                              value={selectedStudentLeaveDetials.leaveReasonForLeave || ""}
                              onChange={handleInputChange} 
                          />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="leaveReasonForLeave">
                          <Form.Label>Proof of leave</Form.Label>
                          <Form.Control
                              type="file"
                              id="file"
                              onChange={handleFileChange}
                              accept="application/pdf"
                          />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="fileName">
                          <Form.Label>Download Documents</Form.Label>
                          <div>
                            {fileUrl ? (
                              <a href={fileUrl} download={selectedStudentLeaveDetials.fileName}>
                                {selectedStudentLeaveDetials.fileName}
                              </a>
                            ) : (
                              <p>No file available</p>
                            )}
                          </div>
                        </Form.Group>
                        
                        <Button type='submit' variant="primary" style={{float: 'right', width: '15%'}}>Apply</Button>
                      </Form>
                      </Modal.Body>
                  </Modal>
                )}

                {/* View Leave Modal */}
                <Modal show={showModal1} onHide={handleCloseCross2} backdrop="static" keyboard={false} enforceFocus={true}>
                  <Modal.Header closeButton>
                      <Modal.Title style={{ color: 'black' }}>Leave Application for {selectedCourseCode} on {selectedLeave.date} at {selectedClassTime}
                        <br/>
                        <small style={{ color: 'gray', fontSize: "15px" }}>{selectedLeaveStudent.name} - {selectedLeaveStudent.id}</small>
                      </Modal.Title>
                  </Modal.Header>
                  <Modal.Body className="custom-modal-body">
                    <Form>
                      <Form.Group className="mb-3" controlId="leaveTypeOfLeave">
                        <Form.Label>Type of Leave</Form.Label>
                        <Form.Select
                          name='leaveTypeOfLeave'
                          value={selectedLeaveInfo.leaveTypeOfLeave || ""}
                          readOnly
                        >
                          <option value="">Select type of leave</option>
                          <option value="Sick/Medical Leave">Sick/Medical Leave</option>
                          <option value="Plan Leave">Plan Leave</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="leaveReasonForLeave">
                        <Form.Label>Reason for leave</Form.Label>
                        <Form.Control
                            type="text"
                            name='leaveReasonForLeave'
                            value={selectedLeaveInfo.leaveReasonForLeave || ""}
                            readOnly
                        />
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="fileName">
                        <Form.Label>Download Documents</Form.Label>
                        <div>
                          {fileUrl1 ? (
                            <a href={fileUrl1} download={selectedLeaveInfo.fileName}>
                              {selectedLeaveInfo.fileName}
                            </a>
                          ) : (
                            <p>No file available</p>
                          )}
                        </div>
                      </Form.Group>
                    </Form>
                    </Modal.Body>
                </Modal>
            </div>
        </div>
    </div>
  );
}