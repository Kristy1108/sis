import React, { useState, useEffect } from 'react';
import axios from "axios";
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faRefresh, faChevronUp, faChevronDown} from '@fortawesome/free-solid-svg-icons';
import { Button, Modal, Form, Table } from 'react-bootstrap';
import "./studentAttendance.css";
import SidebarStudent from "../global/SidebarStudent";
import TopbarStudent from '../global/TopbarStudent';
import Cookies from 'js-cookie';
import { adminLocalhost } from '../../localhost/adminLocalhost';
import { employeeLocalhost } from '../../localhost/employeeLocalhost';
import { studentLocalhost } from '../../localhost/studentLocalhost';

export default function StudentAttendance() {

const [data, setData] = useState([]);
const [data3, setData3] = useState([]);
const [expandedSemesters, setExpandedSemesters] = useState({});
const [expandedPrograms, setExpandedPrograms] = useState({});
const [checkboxStatus, setCheckboxStatus] = useState({});
const [selectedStudentNameList, setStudentNameList] = useState([]);
const [selectedStudentIDList, setStudentIDList] = useState([]);
const [combinedStudentList, setCombinedStudentList] = useState([]);
const [attendanceData, setAttendanceData] = useState([]);
const [test, setTest] = useState([]);
const [checkedStudents, setCheckedStudents] = useState([]);
const [uniqueDates, setUniqueDates] = useState([]);
const [searchTerm, setSearchTerm] = useState('');
const [selectedProgram, setSelectedProgram] = useState('');
const [selectedSemester, setSelectedSemester] = useState('');
const [selectedEnrollDate, setSelectedEnrollDate] = useState('');
const [selectedCourseCode, setSelectedCourseCode] = useState('');
const [selectedClassTime, setSelectedClassTime] = useState('');
const [checkedStudentID, setCheckStudentID] = useState('');
const [selectedstdAtdEligibility, setSelectedstdAtdEligibility] = useState('');

const [editShow1, setEditShow1] = useState(false);

const loadData = async () => {
    try {
        const response = await axios.get(`${adminLocalhost}/class/getStudentIDInfo/${Cookies.get('studentStdID')}`);
        setData(response.data);
    } catch (error) {
        console.error('Error occurred while fetching course details:', error);
    }
};

useEffect(() => {
    loadData();
}, []);

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

const filteredData = data.filter((item, index, self) => {
    const courseMatch = item.classCourseCode.toLowerCase().includes(searchTerm.toLowerCase());

    return courseMatch;
  }).sort((a, b) => a.classCourseCode.localeCompare(b.classCourseCode));

const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
};

const toggleSemester = (semester) => {
    const isExpanded = !expandedSemesters[semester];
    setExpandedSemesters({ [semester]: isExpanded });

    if (isExpanded) {
        localStorage.setItem("expandedSemester", semester);
    } else {
        localStorage.removeItem("expandedSemester"); 
    }
  };

const toggleProgram = (semester, program) => {
    const isExpanded = !expandedPrograms[`${semester}-${program}`];
    setExpandedPrograms({ [`${semester}-${program}`]: isExpanded });
  
    if (isExpanded) {
        localStorage.setItem("expandedProgram", JSON.stringify({ semester, program })); 
    } else {
        localStorage.removeItem("expandedProgram"); 
    }
  };
  
  const groupedData = filteredData.reduce((acc, item) => {
    if (!acc[item.classSemester]) {
        acc[item.classSemester] = {}; 
    }
    if (!acc[item.classSemester][item.classProgram]) {
        acc[item.classSemester][item.classProgram] = [];
    }
    acc[item.classSemester][item.classProgram].push(item);
    return acc;
  }, {});
  
  const sortedSemesters = Object.keys(groupedData).sort((a, b) => b.localeCompare(a));
  
  const sortedGroupedData = sortedSemesters.reduce((sortedAcc, semester) => {
    const sortedPrograms = Object.keys(groupedData[semester]).sort((a, b) => a.localeCompare(b)); 
  
    sortedAcc[semester] = sortedPrograms.reduce((sortedProgAcc, program) => {
        sortedProgAcc[program] = groupedData[semester][program].sort((y, x) =>
            (y.classCourseCode || "").localeCompare(x.classCourseCode || "") 
        );
        return sortedProgAcc;
    }, {});
    return sortedAcc;
  }, {});

  const handleButtonClick = async (id, EnrollDate, Course, ClassTime, program, semester) => {
    try {
      setSelectedProgram(program);
      setSelectedSemester(semester);
      setSelectedEnrollDate(EnrollDate);
      setSelectedCourseCode(Course);
      setCheckStudentID(id);
      setSelectedClassTime(ClassTime.split(', ')[0]);
  
      // Fetch attendance details
      const attendanceResponse = await axios.get(`${employeeLocalhost}/attendance/getAttendanceDetails1/${EnrollDate}/${Course}`);
      setAttendanceData(attendanceResponse.data[0]);
  
      // Fetch student names
      const namesResponse = await axios.get(`${adminLocalhost}/class/studentNames/${EnrollDate}/${Course}`);
      const namesArray = namesResponse.data[0].split(',').map((name) => name.trim());
      const idsArray = namesResponse.data[1].split(',').map((id) => id.trim());
      const intakeArray = namesResponse.data[2].split(',').map((intake) => intake.trim());
      const combinedArray = namesArray.map((name, index) => ({
        name,
        id: idsArray[index],
        intake: intakeArray[index]
      })).sort((a, b) => a.name.localeCompare(b.name));
      setCombinedStudentList(combinedArray);

      const getStudentAttendanceEligible = await axios.get(
        `${employeeLocalhost}/attendanceEligible/getAttendanceEligiblePercentage/${EnrollDate}/${Cookies.get('studentStdID')}`
      );

      // Fetch student attendance eligibility      
      const eligibleData = getStudentAttendanceEligible.data[0];
      setSelectedstdAtdEligibility(eligibleData ? `${eligibleData.eligiblePercentage}%` : "N/A");      
  
      // Fetch student attendance statuses
      const attendanceStatusResponse = await axios.get(
        `${studentLocalhost}/studentAttendance/getAttendanceByEnrollDateProgCodeAndCourse/${EnrollDate}/${Course}`
      );
      const statuses = attendanceStatusResponse.data.map((item) => item.stdAtdStatus);
      const combinedStatuses = statuses.flatMap((status) => status.split(',').map((s) => s.trim()));
      //const filteredStatuses = combinedStatuses.filter((status) => status !== '');
      //setTest(filteredStatuses);
  
      for (let i = 0; i < combinedStatuses.length; i++) {
        setCheckboxStatus((prevState) => ({
          ...prevState,
          [combinedStatuses[i]]: true,
        }));
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

  const handleCloseCross = (e) => {
    setEditShow1(false);
  
    setCheckboxStatus({});
    setCheckedStudents([]);
    setTest([]);
  };

  return (
    <div>
        <div className='studentAttendancetopBarDiv'>
            <TopbarStudent />
        </div>
        <div className='studentAttendancesideBarDiv'>
            <SidebarStudent />
        </div>
        <div className='studentAttendanceBoxDiv'>
            <div className="studentAttendancecontainer">
                <div className="studentAttendancediv1">
                    <h2 className="fs-2 m-0">Manage Attendance</h2>
                </div>
                <div className="studentAttendancediv2 d-flex justify-content-between align-items-center">
                    <div className="d-flex custom-margin">
                        <input
                            type="text"
                            placeholder="Search by Course Code"
                            value={searchTerm}
                            onChange={handleSearchInputChange}
                            className="mr-2"
                        />
                    </div>
                    <Button id='btnRefresh' className='btn btn-contact me-2' onClick={() => window.location.reload()}><FontAwesomeIcon icon={faRefresh} /></Button>
                </div>

                <table className="styled-table">
                    <thead>
                        <tr>
                            <th style={{ textAlign: "center" }}>No</th>
                            <th style={{ textAlign: "center" }}>Semester</th>
                            <th style={{ textAlign: "center" }}>Program</th>
                            <th style={{ textAlign: "center" }}>Enroll Code</th>
                            <th style={{ textAlign: "center" }}>Course Code</th>
                            <th style={{ textAlign: "center" }}>Course Name</th>
                            <th style={{ textAlign: "center" }}>Class Date</th>
                            <th style={{ textAlign: "center" }}>Teacher Name</th>
                            <th style={{ textAlign: "center" }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedSemesters.map((semester) => (
                            <React.Fragment key={semester}>
                                <tr className="semester-row">
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

                                {expandedSemesters[semester] &&
                                    Object.keys(sortedGroupedData[semester]).map((program) => (
                                        <React.Fragment key={`${semester}-${program}`}>
                                            <tr className="program-row">
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

                                            {expandedPrograms[`${semester}-${program}`] &&
                                                sortedGroupedData[semester][program].map((item, index) => (
                                                    <tr key={item.id}>
                                                        <td scope="row">{index + 1}</td>
                                                        <td>{item.classSemester}</td>
                                                        <td>{item.classEnrollDateProgCode}</td>
                                                        <td>{item.classProgram}</td>
                                                        <td>{item.classCourseCode}</td>
                                                        <td>{item.classCourse}</td>
                                                        <td>{item.classStartDate}</td>
                                                        <td>{item.classTeacherName}</td>
                                                        <td>
                                                            <button
                                                                id="btnFontIcon"
                                                                className="btn btn-primary"
                                                                style={{ fontSize: "10px" }}
                                                                title="View"
                                                                onClick={() =>
                                                                    handleButtonClick(
                                                                        item.id,
                                                                        item.classEnrollDateProgCode,
                                                                        item.classCourseCode,
                                                                        item.classStartDate,
                                                                        program,
                                                                        semester
                                                                    )
                                                                }
                                                            >
                                                                <FontAwesomeIcon icon={faEye} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </React.Fragment>
                                    ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>

                {/* Attendance View Modal */}
                <Modal show={editShow1} onHide={handleCloseCross} backdrop="static" keyboard={false} enforceFocus={true} dialogClassName="custom-modal">
                  <Modal.Header closeButton>
                  <Modal.Title style={{ color: 'black', fontSize: "20px" }}>
                      {data3.some(item => item.category === "Manage Attendance" && item.accessType === "Read Only")
                          ? `View Attendance Report`
                          : `Update Attendance Report`}
                  </Modal.Title>

                  <span style={{ fontSize: "14px", color: "gray", display: "block", marginTop: "auto", marginLeft: "auto" }}>
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
                                {combinedStudentList
                                    .filter(student => student.id === Cookies.get('studentStdID'))
                                    .map((student, studentIndex) => {
                                    const correctStudentIndex = combinedStudentList.findIndex(
                                        s => s.id === Cookies.get('studentStdID')
                                );
                                return (
                                    <tr key={studentIndex}>
                                        <td className="sticky-column" style={{ verticalAlign: "middle", fontSize: "12px" }}>
                                            {selectedstdAtdEligibility}
                                        </td>

                                        <td className="sticky-column" style={{ verticalAlign: "middle", fontSize: "12px" }}>
                                            {student.name} <br />({student.id}) <br />({student.intake})
                                        </td>

                                        {uniqueDates.map((item, dateIndex) => {
                                            const studentStatus = `${correctStudentIndex}_${dateIndex}`;
                                            const isCheckedPresent = checkboxStatus[`present_${studentStatus}`] || false;
                                            const isCheckedLate = checkboxStatus[`late_${studentStatus}`] || false;
                                            const isCheckedAbsent = checkboxStatus[`absent_${studentStatus}`] || false;

                                            return (
                                                <td key={dateIndex}>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <Form.Check
                                                            type="checkbox"
                                                            checked={isCheckedPresent}
                                                            label="Present"
                                                            value={`present_${studentStatus}`}
                                                            style={{ fontSize: '13px' }}
                                                            disabled 
                                                        />
                                                        <Form.Check
                                                            type="checkbox"
                                                            checked={isCheckedLate}
                                                            label="Late"
                                                            value={`late_${studentStatus}`}
                                                            style={{ fontSize: '13px' }}
                                                            disabled
                                                        />
                                                        <Form.Check
                                                            type="checkbox"
                                                            checked={isCheckedAbsent}
                                                            label="Absent"
                                                            value={`absent_${studentStatus}`}
                                                            style={{ fontSize: '13px' }}
                                                            disabled
                                                        />
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
                </Modal>
            </div>
        </div>
    </div>
  );
}