import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { format } from 'date-fns';
import "./managestudent.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faRefresh, faClipboardList, faDownload, faFileAlt, faBook, faUserPlus, faCalendarCheck, faEye } from '@fortawesome/free-solid-svg-icons';
import { Button, Modal, Form, Table, Dropdown, ButtonGroup } from 'react-bootstrap';
import Sidebar from "../global/Sidebar";
import SidebarEmployee from "../global/SidebarEmployee";
import Topbar from "../global/Topbar";
import TopbarEmployee from '../global/TopbarEmployee';
import { adminLocalhost } from '../../localhost/adminLocalhost';
import { employeeLocalhost } from '../../localhost/employeeLocalhost';
import { studentLocalhost } from '../../localhost/studentLocalhost';
import { jsPDF } from "jspdf";
import sbitLogo from '../../images/sbitLogo.png';
import frontHeader from '../../images/front.png';
import backFooter from '../../images/back.png';
import Cookies from 'js-cookie';
import { programModules } from './programModules';
import { programNameMapping } from './programNameMapping';
import Swal from 'sweetalert2';

export default function ManageProgram() {

  const [data, setData] = useState([]);
  const [data3, setData3] = useState([]);
  const [programmesData, setProgrammesData] = useState([]);
  const [academicData, setAcademicData] = useState([]);
  const [transcriptData, setTranscriptData] = useState([]);
  const [enrollData, setEnrollData] = useState([]);
  const [examData, setExamData] = useState([]);
  const [editData, setEditData] = useState(null);
  const [programmesShow, setProgrammesShow] = useState(false);
  const [transcriptShow, setTranscriptShow] = useState(false);
  const [enrollShow, setEnrollShow] = useState(false);
  const [academicShow, setAcademicShow] = useState(false);
  const navigate = useNavigate();

  const handleProgrammesClose = () => setProgrammesShow(false);
  const handleTranscriptClose = () => setTranscriptShow(false);
  const handleEnrollClose = () => setEnrollShow(false);
  const handleAcademicClose = () => setAcademicShow(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [transcriptStudentName, setTranscriptStudentName] = useState('');
  const [transcriptStudentNRIC, setTranscriptStudentNRIC] = useState('');
  const [transcriptStudentID, setTranscriptStudentID] = useState('');
  const [transcriptStudentProgram, setTranscriptStudentProgram] = useState('');
  const [transcriptStudentCommencementDate, setTranscriptStudentCommencementDate] = useState('');
  const [transcriptStudentCompletedDate, setTranscriptStudentCompletedDate] = useState('');
  const [selectedStudentProgram, setSelectedStudentProgram] = useState('');
  const [transcriptProjectInfo, setTranscriptProjectInfo] = useState([]);
  const [semesterInfoMap, setSemesterInfoMap] = useState({});
  const [semesterTeacherMap, setSemesterTeacherMap] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [progCodes, setProgCodes] = useState([]);
  const [intakeYears, setIntakeYears] = useState([]); 

  const [credits, setCredits] = useState({});
  const employeeJobTitle = Cookies.get('employeeJobTitle');
  const [searchMode, setSearchMode] = useState("all");

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

  // Fetch programmes information for programmes modal
  useEffect(() => {
    if (programmesShow && editData) {
      axios.get(`${studentLocalhost}/student/getStudentIDInfo/${editData.studentNewStdID}`)
        .then(response => {
          setProgrammesData(response.data);
        })
        .catch(error => {
          console.error('There was an error fetching the student information!', error);
        });
    }
  }, [programmesShow, editData]);

   // Fetch programmes information for academic modal
   useEffect(() => {
    if (academicShow && editData) {
      axios.get(`${employeeLocalhost}/examResult/getAllExamDetailsOfStudent/${editData.studentNewStdID}/${editData.studentProgram}`)
        .then(response => {
          setAcademicData(response.data);
        })
        .catch(error => {
          console.error('There was an error fetching the student information!', error);
        });
    }
  }, [academicShow, editData]);

  // Fetch transcript information for transcript modal
  useEffect(() => {
    if (setTranscriptShow && editData) {
      axios.get(`${employeeLocalhost}/examResult/getAllExamDetailsOfStudent/${editData.studentNewStdID}/${editData.studentProgram}`)
        .then(response => {
          setTranscriptData(response.data);
        })
        .catch(error => {
          console.error('There was an error fetching the student information!', error);
        });
    }
  }, [transcriptShow, editData]);

  // Fetch project information for download transcript modal
  useEffect(() => {
    if (setTranscriptShow && editData) {
      axios.get(`${employeeLocalhost}/project/getProjectInfo/${transcriptStudentID}`)
        .then(response => {
          setTranscriptProjectInfo(response.data);
        })
        .catch(error => {
          console.error('There was an error fetching the project information!', error);
        });
    }
  }, [transcriptShow, transcriptStudentID]);

  // Fetch course credit information for transcript modal
  useEffect(() => {
    const fetchCredits = async () => {
      const creditMap = {};
      for (const info of transcriptData) {
        try {
          const response = await axios.get(`${adminLocalhost}/course/getcourseCredit/${info.examCourseCode}`);
          creditMap[info.examCourseCode] = response.data[0]; // Assuming API response has a "credit" field
        } catch (error) {
          console.error(`Error fetching credit for ${info.examCourseCode}:`, error);
          creditMap[info.examCourseCode] = "N/A"; // Default value in case of error
        }
      }
      setCredits(creditMap);
    };

    if (transcriptData.length > 0) {
      fetchCredits();
    }
  }, [transcriptData]);

  // Fetch semester information for transcript modal
  useEffect(() => {
    const fetchSemesterInfo = async () => {
      const semesterMap = {};
      const teacherMap = {};
      const seenKeys = new Set();
  
      for (const info of transcriptData) {
        const key = info.examEnrollDate;
  
        if (key && !seenKeys.has(key)) {
          seenKeys.add(key);
  
          try {
            // First: get semester and teacher username
            const semesterRes = await axios.get(`${adminLocalhost}/classTime/getEnrollDateProgCode/${key}`);
            const semesterData = semesterRes.data[0] || {};
            const teacherUsername = semesterData.enrollTeacher || 'N/A';
  
            semesterMap[key] = semesterData.enrollSemester || 'N/A';
  
            // Second: fetch full name of teacher using the username
            if (teacherUsername !== 'N/A') {
              try {
                const teacherRes = await axios.get(`${employeeLocalhost}/employee/employee-info/${teacherUsername}`);
                teacherMap[key] = teacherRes.data[0][5] || teacherUsername;
              } catch (error) {
                console.error(`Error fetching teacher name for ${teacherUsername}:`, error);
                teacherMap[key] = teacherUsername;
              }
            } else {
              teacherMap[key] = 'N/A';
            }
  
          } catch (error) {
            console.error(`Error fetching semester for ${key}:`, error);
            semesterMap[key] = 'N/A';
            teacherMap[key] = 'N/A';
          }
        }
      }
  
      setSemesterInfoMap(semesterMap);
      setSemesterTeacherMap(teacherMap);
    };
  
    if (transcriptData.length > 0) {
      fetchSemesterInfo();
    }
  }, [transcriptData]);     

  // Fetch enroll information for enroll modal
  useEffect(() => {
    if (setEnrollShow && editData) {
      axios.get(`${adminLocalhost}/class/getStudentIDInfo/${editData.studentNewStdID}/${editData.studentProgram}`)
        .then(response => {
          setEnrollData(response.data);
        })
        .catch(error => {
          console.error('There was an error fetching the student information!', error);
        });
    }
  }, [setEnrollShow, editData]);

  // Fetch exam status for academic modal
  useEffect(() => {
    if (academicShow && editData) {
      axios.get(`${employeeLocalhost}/examResult/getAllExamDetailsOfStudent/${editData.studentNewStdID}`)
          .then(response => {
              setExamData(response.data);
          })
          .catch(error => {
              console.error('There was an error fetching the exam status', error);
          });
      }
  }, [academicShow, editData]);

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
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

  useEffect(() => {
    loadData();
  }, []);

  const handleTranscript = (item) => {
    setEditData(item);
    setTranscriptShow(true);
    setTranscriptStudentName(item.studentName);
    setTranscriptStudentNRIC(item.studentMalaysiaIC);
    setTranscriptStudentID(item.studentNewStdID);
    setTranscriptStudentProgram(item.studentProgram);
    setTranscriptStudentCommencementDate(item.studentIntake);
    setTranscriptStudentCompletedDate(
      item.studentCompleted ? format(new Date(item.studentCompleted), 'MMM-yy') : "N/A"
    );
  };

  const handleProgrammes = (item) => {
    setEditData(item);
    setProgrammesShow(true);
  };

  const handleEnroll = (item) => {
    setEditData(item);
    setSelectedStudentProgram(item.studentProgram);
    setEnrollShow(true);
  };

  const handleAcademic = (item) => {
    setEditData(item);
    setSelectedStudentProgram(item.studentProgram);
    setAcademicShow(true);
  };

  function renderHeader(doc, studentName, stuidentNRIC, studentID, studentProg, studentCredit, page, completedDate) {
    // Header Section
    const headerimgWidth = 220; 
    const headerimgHeight = 7; 
    doc.addImage(frontHeader, 'PNG', 0, 0, headerimgWidth, headerimgHeight);

    const imgWidth = 25; 
    const imgHeight = 20; 
    doc.addImage(sbitLogo, 'PNG', 12, 12, imgWidth, imgHeight);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(54, 48, 85);
    doc.text("SBIT TRAINING SDN. BHD. (894857-H)", 200, 14, { align: "right" });
    doc.setFontSize(9);
    doc.text("SBIT TRAINING SDN. BHD. (L02428)", 200, 18, { align: "right" });

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("18A & 18B, Jalan 20/16A, Taman Paramount, 46300 Petaling Jaya, Selangor.", 200, 22, { align: "right" });
    doc.text("+603 7496 7883 | info@sbit.edu.my", 200, 26, { align: "right" });
    doc.text("www.sbit.edu.my", 200, 30, { align: "right" });

    doc.setFillColor(220, 132, 245);
    doc.rect(97, 27, 25, 7, 'F');
    doc.setFontSize(12); 
    doc.setFont("helvetica", "bold");
    doc.setTextColor(54, 48, 85); 
    doc.text("RESULTS", 100, 32);

    doc.setLineWidth(0.5);
    doc.line(10, 34, 200, 34);

    // Student Information
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0); 
    doc.text(`Name           :   ${studentName}`, 12, 40);
    doc.text("Date of commencement     :   2024 Apr", 132, 40);
    doc.text(`NRIC            :   ${stuidentNRIC}`, 12, 46);
    doc.text(`Date of completion             :   ${completedDate}`, 132, 46);
    doc.text(`Student ID    :   ${studentID}`, 12, 52);
    doc.text(`Credit Achieved                  :   ${studentCredit}`, 132, 52);

    let programText;
    if (studentProg === "DIT") {
        programText = "Professional Degree in IT Support";
    } else if (studentProg === "DIP") {
        programText = "Professional Diploma in IT Support";
    } else if (studentProg === "DSE") {
        programText = "Professional Diploma in Software Engineering";
    } else if (studentProg === "DSG") {
        programText = "Professional Degree in Software Engineering";
    }

    doc.text(`Programme  :   ${programText}`, 12, 58);
    //doc.text(`Partially completed the ${programText} with the result below:`, 43, 72);
  }

  const handleDownloadClick = async (e, mode = 'download', studentName, stuidentNRIC, studentID, studentProg, studentCredit, commencementDate, completedDate) => {
    e.preventDefault();   

    const doc = new jsPDF();

    // Header Section
    const headerimgWidth = 220; 
    const headerimgHeight = 7; 
    doc.addImage(frontHeader, 'PNG', 0, 0, headerimgWidth, headerimgHeight);

    const imgWidth = 25; 
    const imgHeight = 20; 
    doc.addImage(sbitLogo, 'PNG', 12, 12, imgWidth, imgHeight);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(54, 48, 85);
    doc.text("SBIT TRAINING SDN. BHD. (894857-H)", 200, 14, { align: "right" });
    doc.setFontSize(9);
    doc.text("SBIT TRAINING SDN. BHD. (L02428)", 200, 18, { align: "right" });

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("18A & 18B, Jalan 20/16A, Taman Paramount, 46300 Petaling Jaya, Selangor.", 200, 22, { align: "right" });
    doc.text("+603 7496 7883 | info@sbit.edu.my", 200, 26, { align: "right" });
    doc.text("www.sbit.edu.my", 200, 30, { align: "right" });

    doc.setFillColor(220, 132, 245);
    doc.rect(97, 27, 25, 7, 'F');
    doc.setFontSize(12); 
    doc.setFont("helvetica", "bold");
    doc.setTextColor(54, 48, 85); 
    doc.text("RESULTS", 100, 32);

    doc.setLineWidth(0.5);
    doc.line(10, 34, 200, 34);

    // Student Information
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0); 
    doc.text(`Name           :   ${studentName}`, 12, 40);
    doc.text(`Date of commencement     :   ${commencementDate}`, 132, 40);
    doc.text(`NRIC            :   ${stuidentNRIC}`, 12, 46);
    doc.text(`Date of completion             :   ${completedDate}`, 132, 46);
    doc.text(`Student ID    :   ${studentID}`, 12, 52);
    doc.text(`Credit Achieved                  :   ${studentCredit}`, 132, 52);

    studentProg = studentProg.trim();
    let programText;
    if (studentProg === "DIT" || studentProg === "DITPT") {
        programText = "Professional Degree in Information Technology";
    } else if (studentProg === "DIP" || studentProg === "DIPPT") {
        programText = "Professional Diploma in Information Technology";
    } else if (studentProg === "DSE" || studentProg === "DSEPT") {
        programText = "Professional Diploma in Software Engineering";
    } else if (studentProg === "DSG" || studentProg === "DSGPT") {
        programText = "Professional Degree in Software Engineering";
    } 

    doc.text(`Programme  :   ${programText}`, 12, 58);
    doc.text(`Partially completed the ${programText} with the result below:`, 38, 70);

    try {
        const response = await axios.get(`${employeeLocalhost}/marking/categorized/${studentProg}`);
        const numTables = response.data[response.data.length - 1][0];

        let startY = 72;
        let page = 1;
        const startX = 12;
        const endX = 200; 

        const specialCourses = ["SI441", "SI442", "DP451", "SP241", "SP441"];
        const headerRowHeight = 12;
        const dataRowHeight = 6;
        const specialCourseRows = transcriptData.filter(row => specialCourses.includes(row.examCourseCode));
       addFooter(page);

        // Course tables
        for (let i = 1; i <= numTables; i++) {
          const examData = response.data[i - 1];
          const courseCodes = examData[10]?.split(",") || [];
          const labels = examData.slice(0, 5).filter(label => label !== "");
          const scores = examData.slice(5, 10).filter(score => score !== "0" && score !== 0 && score !== "");
          const hasData = labels.length > 0;

          if (!hasData || !courseCodes.some(code => transcriptData.some(row => row.examCourseCode === code))) {
            continue; // skip if no data
          }

          const filteredCourses = transcriptData.filter(row => courseCodes.includes(row.examCourseCode));

          // Recalculate after confirming data
          const columnPositions = {
            code: 15,
            course: 34,
            totalResult: endX - 24,
            grade: endX - 8
          };

          const totalSpace1 = (endX - 33) - 73;
          const columnSpacing1 = totalSpace1 / labels.length;

          // 🧠 Check space before drawing header
          if (startY + headerRowHeight > 260) {
            doc.addPage();
            page += 1;
            addFooter(page);
            renderHeader(doc, studentName, stuidentNRIC, studentID, studentProg, studentCredit, page, completedDate);
            startY = 70;
            doc.text(`Partially completed the ${programText} with the result below:`, 38, startY - 2);
          }

          // Draw table header
          const midY = startY + headerRowHeight / 2;
          doc.setFillColor(211, 211, 211);
          doc.rect(startX, startY, endX - startX, headerRowHeight, 'F');
          doc.setTextColor(0, 0, 0);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7);
          doc.text("Code", columnPositions.code - 1, midY);
          doc.text("Course", columnPositions.course + 4, midY);
          doc.text("Total Result", columnPositions.totalResult + 4, midY, { align: "center" });
          doc.text("Grade", columnPositions.grade + 2.5, midY, { align: "center" });

          let scoreX = 73 + columnSpacing1 / 2;
          labels.forEach((label, idx) => {
            const labelWithScore = [`${label}`, `(${scores[idx]}%)`];
            const adjustedX = label.toLowerCase().includes("group discussion") ? scoreX + 2 : scoreX;
            doc.text(labelWithScore, adjustedX, midY, { align: "center" });
            scoreX += columnSpacing1;
          });

          doc.line(startX, startY, endX, startY); // Top border
          startY += headerRowHeight;

          // Data Rows
          let previousCourseCode = null;
          let currentY = startY;
          let rowHeights = [];

          transcriptData
            .filter(row => courseCodes.includes(row.examCourseCode))
            .forEach((transcriptRow) => {
              const courseText = doc.splitTextToSize(transcriptRow.examCourseName, 48); // This line will adjust the special course text width
              const courseTextHeight = courseText.length * 4;
              const isSpecialCourse = ["HD221", "NS221", "DS211", "NS121", "AW421", "AW221", "MD221", "WD222", "RD211", "WF211", "WD211", "SS411", "AI411"].includes(transcriptRow.examCourseCode);
              const rowHeight = isSpecialCourse ? Math.max(dataRowHeight, courseTextHeight + 2) : dataRowHeight;

              // 🔁 Page overflow check per row
              if (currentY + rowHeight > 260) {
                doc.line(startX, currentY, endX, currentY); // close previous block
                doc.addPage();
                page += 1;
                renderHeader(doc, studentName, stuidentNRIC, studentID, studentProg, studentCredit, page, completedDate);
                startY = 70;
                doc.text(`Partially completed the ${programText} with the result below:`, 38, startY - 2);

                // Redraw table header
                const midY2 = startY + headerRowHeight / 2;
                doc.setFillColor(211, 211, 211);
                doc.rect(startX, startY, endX - startX, headerRowHeight, 'F');
                doc.setTextColor(0, 0, 0);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(7);
                doc.text("Code", columnPositions.code - 1, midY2);
                doc.text("Course", columnPositions.course + 4, midY2);
                doc.text("Total Result", columnPositions.totalResult + 4, midY2, { align: "center" });
                doc.text("Grade", columnPositions.grade + 2.5, midY2, { align: "center" });

                let scoreX2 = 73 + columnSpacing1 / 2;
                labels.forEach((label, idx) => {
                  const labelWithScore = [`${label}`, `(${scores[idx]}%)`];
                  const adjustedX = label.toLowerCase().includes("group discussion") ? scoreX2 + 2 : scoreX2;
                  doc.text(labelWithScore, adjustedX, midY2, { align: "center" });
                  scoreX2 += columnSpacing1;
                });

                doc.line(startX, startY, endX, startY);
                startY += headerRowHeight;
                currentY = startY;
              }

              const currentRowY = currentY;
              rowHeights.push(rowHeight);
              doc.line(startX, currentRowY, endX, currentRowY);

              const score = parseFloat(transcriptRow.examTotalScore);
              const formattedScore = isNaN(score) ? transcriptRow.examTotalScore : score.toFixed(1);

              const shortText =
                (studentProg?.trim().toUpperCase() === "DSE" || studentProg?.trim().toUpperCase() === "DSEPT") &&
                transcriptRow.examCourseCode?.trim().toUpperCase() === "MD221"
                  ? "Android Application Development - Kotlin"
                  : transcriptRow.examCourseCode?.trim().toUpperCase() === "MD221"
                  ? "Mobile Device Service & Repairs"
                  : courseText;

              if (transcriptRow.examCourseCode !== previousCourseCode) {
                doc.setFontSize(6);
                doc.setFont("helvetica", "normal");
                doc.text(transcriptRow.examCourseCode, columnPositions.code - 1, currentRowY + dataRowHeight - 2);
                doc.text(shortText, columnPositions.course - 11, currentRowY + dataRowHeight - 2);
                doc.text(formattedScore, columnPositions.totalResult + 4, currentRowY + dataRowHeight - 2, { align: "center" });
                doc.text(transcriptRow.examTotalGrade, columnPositions.grade + 2, currentRowY + dataRowHeight - 2, { align: "center" });

                let scoreX3 = 73 + columnSpacing1 / 2;
                labels.forEach((label, idx) => {
                  let value = label.toLowerCase().includes('group discussion') ?
                    transcriptRow['exam5_GroupDiscussion'] || "0" :
                    transcriptRow[`exam${idx + 1}_1stTest`] || "0";

                  const fullMark = parseFloat(scores[idx] || 0);
                  const scoreValue = parseFloat(value || 0);

                  if (transcriptRow.examTotalScore === "Pass" && scoreValue < (fullMark / 2)) {
                    doc.text("Pass", scoreX3, currentRowY + dataRowHeight - 2, { align: "center" });
                  } else {
                    doc.text(scoreValue.toFixed(1).toString(), scoreX3, currentRowY + dataRowHeight - 2, { align: "center" });
                  }

                  scoreX3 += columnSpacing1;
                });

                previousCourseCode = transcriptRow.examCourseCode;
              }

              currentY += rowHeight;
            });

          doc.line(startX, currentY, endX, currentY); // close last row

          const totalDynamicHeight = rowHeights.reduce((sum, h) => sum + h, 0);

          // Vertical lines
          doc.line(startX, startY - headerRowHeight, startX, startY + totalDynamicHeight);
          doc.line(22, startY - headerRowHeight, 22, startY + totalDynamicHeight);
          doc.line(endX - 29, startY - headerRowHeight, endX - 29, startY + totalDynamicHeight);
          doc.line(endX - 11, startY - headerRowHeight, endX - 11, startY + totalDynamicHeight);
          doc.line(endX, startY - headerRowHeight, endX, startY + totalDynamicHeight);

          // Dynamic columns
          labels.forEach((_, idx) => {
            const x = 72 + idx * columnSpacing1;
            doc.line(x, startY - headerRowHeight, x, startY + totalDynamicHeight);
          });

          startY = currentY + 3;
        }
        
        // Move special courses table to appear **after** all exam result tables
        if (specialCourseRows.length > 0) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7);
      
          // Set background color for the header
          doc.setFillColor(211, 211, 211); // Light gray
          doc.rect(startX, startY, endX - startX, headerRowHeight - 5, 'F'); 
      
          // Table Headers
          doc.setTextColor(0, 0, 0); // Black text
          doc.text("Code", 15, startY + 5);
          doc.text("Course", 34, startY + 5);
          doc.text("Title", startX + 80, startY + 5);
          doc.text("Description", startX + 140, startY + 5);
      
          startY += headerRowHeight; // Move below header
      
          // Draw header row boundaries
          doc.line(startX, startY - headerRowHeight, endX, startY - headerRowHeight); // Top border
          doc.line(startX, startY - 5, endX, startY - 5); // Bottom border
      
          let dynamicStartY = startY; // Track the row Y position dynamically
      
          // Populate the special course table
          specialCourseRows.forEach((row, idx) => {
              const projectInfo = transcriptProjectInfo.find(p => p.projectCourse === row.examCourseCode);
      
              let title = projectInfo ? projectInfo.projectTitle : "N/A";
              let description = projectInfo ? projectInfo.projectDescription : "N/A";
      
              // Estimate text height based on word length (jsPDF doesn't auto-wrap)
              let descriptionLines = doc.splitTextToSize(description, 65);
              let titleLines = doc.splitTextToSize(title, 45);
              let rowHeight = Math.max(dataRowHeight, descriptionLines.length * 4); // Increase row height if needed
      
              let currentRowY = dynamicStartY;
      
              doc.setFont("helvetica", "normal");
              doc.setFontSize(6);
      
              doc.text(row.examCourseCode, 15, currentRowY - 1);
              doc.text(row.examCourseName, 26, currentRowY - 1);
              doc.text(titleLines, 75, currentRowY - 1);
              doc.text(descriptionLines, 123, currentRowY - 1); // Multi-line description
      
              // Draw **Horizontal** row lines (adjusted for new height)
              doc.line(startX, currentRowY + rowHeight - 5, endX, currentRowY + rowHeight - 5);
      
              // Adjust the next row Y position dynamically
              dynamicStartY += rowHeight;
          });
      
          // Draw **Vertical** Borders (Adjusted for new height)
          doc.line(startX, startY - headerRowHeight, startX, dynamicStartY - 5); // Left border
          doc.line(25, startY - headerRowHeight, 25, dynamicStartY - 5); // Code
          doc.line(73, startY - headerRowHeight, 73, dynamicStartY - 5); // Course
          doc.line(121, startY - headerRowHeight, 121, dynamicStartY - 5); // Title
          doc.line(endX, startY - headerRowHeight, endX, dynamicStartY - 5); // Right border
      
          // Finalize table boundary
          startY = dynamicStartY + 4; // Adjust spacing for next section
        }      

        // Check if the score table will fit within the current page
        const remainingSpace = 273 - startY;
        const scoreTableHeight = 96; // Approximate height of the score table

        if (remainingSpace < scoreTableHeight) {
            doc.addPage(); // Move score table to a new page
            startY = 10; // Reset position for new page
            page += 1;
            renderHeader(doc, studentName, stuidentNRIC, studentID, studentProg, studentCredit, page, completedDate);
            addFooter(page);
            startY += 55; // Increase this value if needed
        }

        let startYY = startY;
        let startYYY = startY;

        //Score Table
       doc.setFillColor(196, 196, 196);
       doc.rect(30, startYY, 150, 6, 'F');
       doc.line(30, startYY, 180, startYY); // Horizontal - 1
       startYY += 6;
       doc.line(30, startYY, 180, startYY); // Horizontal - 2
       startYY += 6;  
       doc.line(30, startYY, 180, startYY); // Horizontal - 3
       startYY += 6; 
       doc.line(30, startYY, 180, startYY); // Horizontal - 4
       startYY += 6; 
       doc.line(30, startYY, 120, startYY); // Horizontal - 5
       startYY += 6;  
       doc.line(30, startYY, 180, startYY); // Horizontal - 6
       startYY += 6; 
       doc.line(30, startYY, 120, startYY); // Horizontal - 7
       startYY += 6; 
       doc.line(30, startYY, 180, startYY); // Horizontal - 8
       startYY += 6; 
       doc.line(30, startYY, 120, startYY); // Horizontal - 9
       startYY += 6;  
       doc.line(30, startYY, 180, startYY); // Horizontal - 10
       startYY += 6;  
       doc.line(30, startYY, 180, startYY); // Horizontal - 11
       startYY += 6;  
       doc.line(30, startYY, 180, startYY); // Horizontal - 12
       startYY += 6; 
       doc.line(30, startYY, 180, startYY); // Horizontal - 13
       startYY += 6;  
       doc.line(30, startYY, 180, startYY); // Horizontal - 14
       startYY += 6;  
       doc.line(30, startYY, 180, startYY); // Horizontal - 15
       startYY += 6;  
       doc.line(30, startYY, 180, startYY); // Horizontal - 16
       startYY += 6;       
       doc.line(30, startYYY, 30, startYY-6); // Vertical - 1
       doc.line(53, startYYY + 6, 53, startYY-6); // Vertical - 2
       doc.line(120, startYYY + 6, 120,startYY-6); // Vertical - 3
       doc.line(180, startYYY, 180, startYY-6); // Vertical - 4

       doc.setFont("helvetica", "bold");
       doc.setFontSize(8);
       doc.text("Grading Schema", 93, startY+4);
       startY += 10; 
       doc.text("Grade", 37, startY);
       doc.text("Marks", 82, startY);
       doc.text("Evidence", 143, startY);
       startY += 6; 
       doc.setFont("helvetica", "normal");
       doc.text("A+", 39, startY);
       doc.text("90% - 100%", 78, startY);
       doc.text("Distinction", 142, startY);
       startY += 6;
       doc.text("A", 39, startY);
       doc.text("85% - 89%", 78, startY);
       startY += 6;
       doc.text("Very Good", 142, startY-3);
       doc.text("A-", 39, startY);
       doc.text("80% - 84%", 78, startY);
       startY += 6;
       doc.text("B+", 39, startY);
       doc.text("75% - 79%", 78, startY);
       startY += 6;
       doc.text("Good", 144, startY-3);
       doc.text("B", 39, startY);
       doc.text("70% - 74%", 78, startY);
       doc.text("Satisfactory", 140, startY+9);
       startY += 6;
       doc.text("B-", 39, startY);
       doc.text("65% - 69%", 78, startY);
       startY += 6;
       doc.text("C+", 39, startY);
       doc.text("60% - 64%", 78, startY);
       startY += 6;
       doc.text("C", 39, startY);
       doc.text("55% - 59%", 78, startY);
       doc.text("Weak", 144, startY);
       startY += 6;
       doc.text("C-", 39, startY);
       doc.text("50% - 54%", 78, startY);
       doc.text("Pass", 144, startY);
       startY += 6;
       doc.text("F", 39, startY);
       doc.text("0% - 49%", 78, startY);
       doc.text("Fail", 145, startY);
       startY += 6;
       doc.text("P", 39, startY);
       doc.text("Pass after trying more than one attempt", 62, startY);
       doc.text("Pass after trying more than one attempt", 126, startY);
       startY += 6;
       doc.text("*Pass", 37, startY);
       doc.text("Pass after trying more than one attempt", 62, startY);
       doc.text("Pass after trying more than one attempt", 126, startY);
       startY += 6;
       doc.text("N/A", 39, startY);
       doc.text("Not Available", 76, startY);
       doc.text("Not Available", 140, startY);

        function addFooter(page) {
            const footerimgWidth = 220;
            const footerimgHeight = 10;
            doc.addImage(backFooter, 'PNG', 0, 287, footerimgWidth, footerimgHeight);
            doc.setFontSize(10);
            doc.text("* This document is computer-generated and no signature is required.", 10, 290);
            doc.text(`Page ${page}`, 188, 293);
        }
        
        if (startY >= 273) {
            doc.addPage();
            startY = 10;
            page += 1;
            addFooter(page);
        }

        if (mode === 'view') {
            window.open(doc.output("bloburl"), "_blank");
        } else {
          if (completedDate === 'N/A') {
            Swal.fire({
              icon: 'warning',
              title: 'Completion Date Not Available',
              text: 'Please add completion date in Manage Student!',
              position: 'top-end',
              toast: true,
              showConfirmButton: false,
              timer: 4000,
              timerProgressBar: true,
            });
          } 
            doc.save(`Transcript-${studentProg}-${studentName}.pdf`);
        }

    } catch (error) {
        console.error("Error fetching transcript info", error);
    }
  };

  const totalCreditsAchieved = transcriptData.reduce((total, info) => {
    const credit = info.examTotalGrade === "F" ? 0 : credits[info.examCourseCode] || 0;
    return total + parseFloat(credit);
  }, 0).toFixed(2); 

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
  
  const cleanProgramName = selectedStudentProgram?.replace(/\r/g, '') || "";
  const modulesToDisplay = programModules[cleanProgramName] || [];

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
            <h2 className="fs-2 m-0">STUDENT MORE INFORMATION</h2>
          </div>
          <div className="manageStudentdiv2 d-flex align-items-center flex-wrap gap-2 mb-3">
            {/*<div className="d-flex custom-margin">
              <input
                type="text"
                placeholder="Search by name || ID || IC || Prog"
                value={searchTerm}
                style={{ width: "200px" }}
                onChange={handleSearchInputChange}
                className="mr-2"
              />
            </div>*/}
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
            <div>
              <Button id='btnRefresh' className='btn btn-contact me-2' title='Refresh' onClick={() => window.location.reload()}>
                <FontAwesomeIcon icon={faRefresh} />
              </Button>
              <Button className='btn btn-secondary' title='Go back' onClick={() => navigate("/managestudent")}>
                <FontAwesomeIcon icon={faArrowLeft} />
              </Button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
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
                  <th style={{ textAlign: "center" }}>Student IC</th>
                  <th style={{ textAlign: "center", cursor: "pointer" }} onClick={() => handleSort('studentEnrollDate')}>
                    Enroll Date {sortConfig.key === 'studentEnrollDate' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </th>
                  <th style={{ textAlign: "center", cursor: "pointer" }} onClick={() => handleSort('studentSalesPerson')}>
                    Course Advisor {sortConfig.key === 'studentSalesPerson' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </th>
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
                    <td>{item.studentMalaysiaIC}</td>
                    <td>{item.studentEnrollDate}</td>
                    <td>{item.studentSalesPerson}</td>
                    <td>
                      <Dropdown as={ButtonGroup}>
                        <Dropdown.Toggle variant="primary" size="sm" style={{ fontSize: "10px" }}>
                          Action
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => handleTranscript(item)}>
                            <FontAwesomeIcon icon={faFileAlt} className="me-2" /> Transcript
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleProgrammes(item)}>
                            <FontAwesomeIcon icon={faBook} className="me-2" /> Programmes
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleEnroll(item)}>
                            <FontAwesomeIcon icon={faUserPlus} className="me-2" /> Enroll
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleAcademic(item)}>
                            <FontAwesomeIcon icon={faClipboardList} className="me-2" /> Academic Progress
                          </Dropdown.Item>
                          {employeeJobTitle === 'Course Counsellor' && (
                            <>
                              <Dropdown.Item onClick={() => navigate(`/ManageAttendance?studentID=${item.studentNewStdID}`)}                            >
                                <FontAwesomeIcon icon={faCalendarCheck} className="me-2" /> Attendance
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => navigate(`/ManageExamReport?studentID=${item.studentNewStdID}`)}>
                                <FontAwesomeIcon icon={faFileAlt} className="me-2" /> Exam Report
                              </Dropdown.Item>
                            </>
                          )}
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/*Programmes Modal*/}
          <Modal
            show={programmesShow}
            onHide={handleProgrammesClose}
            dialogClassName="custom-modal"
            backdrop="static"
            keyboard={false}
            enforceFocus={true}
          >
            <Modal.Header closeButton>
                <Modal.Title style={{ color: '#151632' }}>Programmes Information</Modal.Title>
            </Modal.Header>
            <Modal.Body className="custom-modal-body">
              <Form>
                <Table>
                  <thead>
                    <tr>
                      <th>Enrollment Date</th>
                      <th>Student ID</th>
                      <th>Programme ID</th>
                      <th>Programme Name</th>
                      <th>Intake</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programmesData.length > 0 ? (
                      programmesData.map((info, index) => (
                        <tr key={index}>
                          <td>{info.studentEnrollDate}</td>
                          <td>{info.studentNewStdID}</td>
                          <td>{info.studentProgram}</td>
                          <td>
                            {programNameMapping[info.studentProgram?.replace(/\r/g, '') || ''] || 'Unknown Programme'}
                          </td>
                          <td>{info.studentIntake}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">No data available</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Form>
            </Modal.Body>
          </Modal>

          {/*Transcript Modal*/}
          <Modal
            show={transcriptShow}
            onHide={handleTranscriptClose}
            dialogClassName="custom-modal"
            backdrop="static"
            keyboard={false}
            enforceFocus={true}
          >
            <Modal.Header closeButton>
                <Modal.Title style={{ color: '#151632' }}>Transcript Information</Modal.Title>
            </Modal.Header>
            <Modal.Body className="custom-modal-body">
              <Form>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", gap: "30px" }}>
                  <p><strong>Name:</strong> {transcriptStudentName}</p>
                  <p><strong>NRIC:</strong> {transcriptStudentNRIC}</p>
                  <p><strong>Student ID:</strong> {transcriptStudentID}</p>
                  <p><strong>Programme:</strong> {transcriptStudentProgram}</p>
                  <p><strong>Date of completion:</strong> {transcriptStudentCompletedDate}</p>
                  <p><strong>Credit Achieved: </strong> 
                    {transcriptData.reduce((total, info) => {
                      const credit = info.examTotalGrade === "F" ? 0 : credits[info.examCourseCode] || 0;
                      return total + parseFloat(credit);
                    }, 0).toFixed(2)}
                  </p>
                  <p><strong>Date of commencement:</strong> {transcriptStudentCommencementDate}</p>                  
                </div>
              </div>
                <Table>
                  <thead>
                    <tr>
                      <th>Semester</th>
                      <th>Teacher</th>
                      <th>Enroll ID</th>
                      <th>Course Name</th>
                      <th>Course ID</th>
                      <th>Credit</th>
                      <th>Credit Achieved</th>
                      <th>Score(%)</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transcriptData.length > 0 ? (
                      [...transcriptData]
                        .sort((a, b) => {
                          const semA = semesterInfoMap[a.examEnrollDate] || "";
                          const semB = semesterInfoMap[b.examEnrollDate] || "";
                      
                          const semCompare = semA.localeCompare(semB);
                          if (semCompare !== 0) return semCompare; 
                      
                          return a.examCourseCode.localeCompare(b.examCourseCode);
                        })
                        .map((info, index) => (
                        <tr key={index}>
                          <td>{semesterInfoMap[info.examEnrollDate] || "Loading..."}</td>
                          <td>{semesterTeacherMap[info.examEnrollDate] || "Loading..."}</td>
                          <td>{info.examEnrollDate}</td>
                          <td>
                            {(transcriptStudentProgram?.trim().toUpperCase() === "DSE" || transcriptStudentProgram?.trim().toUpperCase() === "DSEPT") &&
                            info.examCourseCode?.trim().toUpperCase() === "MD221"
                              ? "Android Application Development - Kotlin"
                              : info.examCourseCode?.trim().toUpperCase() === "MD221"
                              ? "Mobile Device Service & Repairs"
                              : info.examCourseName}
                          </td>
                          <td>{info.examCourseCode}</td>
                          <td>{credits[info.examCourseCode] || "N/A"}</td>
                          <td>{info.examTotalGrade === "F" ? 0 : credits[info.examCourseCode] || "N/A"}</td>
                          <td>{isNaN(info.examTotalScore) ? info.examTotalScore : parseFloat(info.examTotalScore).toFixed(1)}</td>
                          <td>{info.examTotalGrade}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center">No data available</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <button 
                  id='btnFontIcon'
                  className="btn btn-success" 
                  title='Download' 
                  onClick={(e) => handleDownloadClick(e, "download", transcriptStudentName, transcriptStudentNRIC, transcriptStudentID, transcriptStudentProgram, totalCreditsAchieved, transcriptStudentCommencementDate, transcriptStudentCompletedDate)}
                  style={{ float: "right", marginRight: "10px" }}
              >
                  <FontAwesomeIcon icon={faDownload} />
              </button>
              <button 
                  id='btnFontIcon'
                  className="btn btn-primary" 
                  title='View' 
                  onClick={(e) => handleDownloadClick(e, "view", transcriptStudentName, transcriptStudentNRIC, transcriptStudentID, transcriptStudentProgram, totalCreditsAchieved, transcriptStudentCommencementDate, transcriptStudentCompletedDate)}
                  style={{ float: "right", marginRight: "10px" }}
              >
                  <FontAwesomeIcon icon={faEye} />
              </button>
            </Modal.Footer>
          </Modal>

          {/*Enroll Modal*/}
          <Modal
            show={enrollShow}
            onHide={handleEnrollClose}
            dialogClassName="custom-modal"
            backdrop="static"
            keyboard={false}
            enforceFocus={true}
          >
            <Modal.Header closeButton>
                <Modal.Title style={{ color: '#151632' }}>{`Enrolled Information ${selectedStudentProgram}`}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="custom-modal-body">
              <Form>
                <Table>
                  <thead>
                    <tr>
                      <th>Course Name</th>
                      <th>Course ID</th>
                      <th>Semester</th>
                      <th>Enroll ID</th>
                      <th>Teacher</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollData.length > 0 ? (
                      enrollData.map((info, index) => (
                        <tr key={index}>
                          <td>
                            {(selectedStudentProgram?.trim().toUpperCase() === "DSE" || selectedStudentProgram?.trim().toUpperCase() === "DSEPT") &&
                            info.classCourseCode?.trim().toUpperCase() === "MD221"
                              ? "Android Application Development - Kotlin"
                              : info.classCourseCode?.trim().toUpperCase() === "MD221"
                              ? "Mobile Device Service & Repairs"
                              : info.classCourse}
                          </td>
                          <td>{info.classCourseCode}</td>
                          <td>{info.classSemester}</td>
                          <td>{info.classEnrollDateProgCode}</td>
                          <td>{info.classTeacherName}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">No data available</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Form>
            </Modal.Body>
          </Modal>

          {/*Academic Modal*/}
          <Modal
            show={academicShow}
            onHide={handleAcademicClose}
            dialogClassName="custom-modal"
            backdrop="static"
            keyboard={false}
            enforceFocus={true}
          >
            <Modal.Header closeButton>
              <div style={{ width: '100%' }}>
                <Modal.Title style={{ color: '#151632' }}>Academic Progress</Modal.Title>
                <p style={{ fontSize: '12px', color: '#6c757d', marginTop: '5px', marginBottom: '-5px' }}>
                  <span style={{ color: '#dc3545', fontWeight: 'bold' }}>Red</span> : Fail, 
                  <span style={{ color: '#28a745', fontWeight: 'bold' }}> Green</span> : Pass,
                  <span style={{ color: '#e3e3e3', fontWeight: 'bold' }}> White</span> : Not Enroll.
                </p>
              </div>
            </Modal.Header>
            <Modal.Body className="custom-modal-body">
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {modulesToDisplay.map((module, index) => {
                  const exam = academicData.find((exam) => exam.examCourseCode === module);

                  const isFail = exam?.examTotalScore === "Fail";
                  const isPass = exam && !isFail;

                  return (
                    <Button
                      key={index}
                      variant="outline-primary"
                      style={{
                        fontSize: "12px",
                        cursor: "default",
                        pointerEvents: "none",
                        color: isFail ? "#ffffff" : "#000000",
                        backgroundColor: isFail ? "#dc3545" : isPass ? "#28a745" : "#ffffff",
                      }}
                      disabled
                    >
                      {module}
                    </Button>
                  );
                })}
              </div>
            </Modal.Body>
          </Modal>
          
        </div>
      </div>
    </div>
  );
}