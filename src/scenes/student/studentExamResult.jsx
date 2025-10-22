import React, { useState, useEffect } from 'react';
import axios from "axios";
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRefresh, faEye, faDownload, faPen, faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { Button, Modal, Table, Form } from 'react-bootstrap';
import SidebarStudent from "../global/SidebarStudent";
import TopbarStudent from '../global/TopbarStudent';
import Cookies from 'js-cookie';
import { jsPDF } from "jspdf";
import NotoSansCJK from "../result/NotoSansCJK.js";
import NotoSansCJKBold from "../result/NotoSansCJKBold.js";
import sbitLogo from '../../images/sbitLogo.png';
import { adminLocalhost } from '../../localhost/adminLocalhost';
import { employeeLocalhost } from '../../localhost/employeeLocalhost';
import { studentLocalhost } from '../../localhost/studentLocalhost';

export default function StudentExamResult() {

    const [state, setState] = useState({
        examStdName: "",
        examStdTeacher: "",
        examStdCourseCode: "",
        examStdCourseName: "",
        examStdProgram: "",
        examStdIntake: "",
        examStdID: "",
        examStdClassStartDate: "",
        examStdClassEndDate: "",
        exam1: "",
        exam2: "",
        mark1: "",
        mark2: ""
    });

    const [sp442Data, setSp442Data] = useState({
        format: "",
        problemGoals: "",
        planning: "",
        approach: "",
        outcome: "",
        reflection: ""
    });

    const [data, setData] = useState([]);
    const [show, setShow] = useState(false);
    const [editShow, setEditShow] = useState(false);
    const [editShow1, setEditShow1] = useState(false);
    const [editShow2, setEditShow2] = useState(false);
    const [editShow3, setEditShow3] = useState(false);
    const [editShow4, setEditShow4] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleEditClose = () => setEditShow(false);
    const handleEditClose1 = () => setEditShow1(false);
    const handleEditClose2 = () => setEditShow2(false);
    const handleEditClose3 = () => setEditShow3(false);
    const handleEditClose4 = () => setEditShow4(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudentNameList, setStudentNameList] = useState([]);
    const [selectedResult, setResult] = useState([]);
    const [selectedEnrollDate, setSelectedEnrollDate] = useState('');
    const [selectedCourseReport, setSelectedCourseReport] = useState('');
    const [selectedProjectStudentName, setSelectedProjectStudentName] = useState('');
    const [selectedProjectStudentID, setSelectedProjectStudentID] = useState('');
    const [selectedProjectTitle, setSelectedProjectTitle] = useState('');
    const [selectedProjectDescription, setSelectedProjectDescription] = useState('');
    const [selectedHeight, setSelectedHeight] = useState('');
    const showProjectFields = ['SI441', 'SI442', 'DP451', 'SP241', 'SP441'].includes(selectedCourseReport);
    const [selectedCourseName, setSelectedCourseName] = useState('');
    const [selectedTeacherName, setSelectedTeacherName] = useState('');
    const [selectedTeacherName1, setSelectedTeacherName1] = useState('');
    const [selectedMarkingTemplate, setSelectedMarkingTemplate] = useState('');
    const [attendanceData, setAttendanceData] = useState([]);
    const [uniqueDates, setUniqueDates] = useState([]);
    const [checkboxStatus, setCheckboxStatus] = useState({});
    const [markingData, setMarkingData] = useState({});
    const [examMarks, setExamMarks] = useState(() =>
        selectedStudentNameList.map(() => ({
            exam1_1stTest: "0",
            exam1_1stResit: "0",
            exam1_2ndResit: "0",
            exam1_3rdResit: "0",
            exam2_1stTest: "0",
            exam2_1stResit: "0",
            exam2_2ndResit: "0",
            exam2_3rdResit: "0",
            exam3_1stTest: "0",
            exam3_1stResit: "0",
            exam3_2ndResit: "0",
            exam3_3rdResit: "0",
            exam4_1stTest: "0",
            exam4_1stResit: "0",
            exam4_2ndResit: "0",
            exam4_3rdResit: "0",
            exam5_1stTest: "0",
            exam5_1stResit: "0",
            exam5_2ndResit: "0",
            exam5_3rdResit: "0",
            exam5_GroupDiscussion: "0",
        }))
    );
    const [practicalCompetency, setPracticalCompetency] = useState([]);
    const [markPractice, setMarkPractice] = useState('');
    const [examResults, setExamResults] = useState([]);
    const [projectResults, setProjectResults] = useState([]);
    const [datePrepared, setDatePrepared] = useState('');
    const [selectedStdAtdEligibility, setSelectedstdAtdEligibility] = useState([]);
    const [expandedSemesters, setExpandedSemesters] = useState({});
    const [expandedPrograms, setExpandedPrograms] = useState({});
    const [selectedProgram, setSelectedProgram] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [showSP442Modal, setShowSP442Modal] = useState(false);
    const [selectedStudentIndex, setSelectedStudentIndex] = useState(null);
    const [selectedSP442Exam, setSelectedSP442Exam] = useState('');
    const [selectedStudentID, setSelectedStudentID] = useState('');

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setDatePrepared(today);
    }, []);

    //Get exam details
    const fetchExamResults = async () => {
        try {
            const response = await axios.get(`${employeeLocalhost}/examResult/getExamResultDetails/${selectedEnrollDate}/${selectedCourseReport}/${selectedMarkingTemplate}`);
            setExamResults(response.data);

            // Function to safely assign values
            const safeValue = (value, defaultValue = "") => (value === null || value === undefined || value === "") ? defaultValue : value;

            // Map fetched results to student IDs
            const resultMap = response.data.reduce((acc, result) => {
                acc[result.examStdID] = {
                    exam5_GroupDiscussion: safeValue(result.exam5_GroupDiscussion, "0"),
                    exam1_1stTest: safeValue(result.exam1_1stTest, "0"),
                    exam1_1stResit: safeValue(result.exam1_1stResit),
                    exam1_2ndResit: safeValue(result.exam1_2ndResit),
                    exam1_3rdResit: safeValue(result.exam1_3rdResit),
                    exam2_1stTest: safeValue(result.exam2_1stTest, "0"),
                    exam2_1stResit: safeValue(result.exam2_1stResit),
                    exam2_2ndResit: safeValue(result.exam2_2ndResit),
                    exam2_3rdResit: safeValue(result.exam2_3rdResit),
                    exam3_1stTest: safeValue(result.exam3_1stTest, "0"),
                    exam3_1stResit: safeValue(result.exam3_1stResit),
                    exam3_2ndResit: safeValue(result.exam3_2ndResit),
                    exam3_3rdResit: safeValue(result.exam3_3rdResit),
                    exam4_1stTest: safeValue(result.exam4_1stTest, "0"),
                    exam4_1stResit: safeValue(result.exam4_1stResit),
                    exam4_2ndResit: safeValue(result.exam4_2ndResit),
                    exam4_3rdResit: safeValue(result.exam4_3rdResit),
                    exam5_1stTest: safeValue(result.exam5_1stTest, "0"),
                    exam5_1stResit: safeValue(result.exam5_1stResit),
                    exam5_2ndResit: safeValue(result.exam5_2ndResit),
                    exam5_3rdResit: safeValue(result.exam5_3rdResit),
                    practicalCompetency: safeValue(result.practicalCompetency)
                };
                return acc;
            }, {});

            // Map student list to ensure correct student-data mapping
            const updatedExamMarks = selectedStudentNameList.map(student => resultMap[student.id] || {
                exam5_GroupDiscussion: "",
                exam1_1stTest: "",
                exam1_1stResit: "",
                exam1_2ndResit: "",
                exam1_3rdResit: "",
                exam2_1stTest: "",
                exam2_1stResit: "",
                exam2_2ndResit: "",
                exam2_3rdResit: "",
                exam3_1stTest: "",
                exam3_1stResit: "",
                exam3_2ndResit: "",
                exam3_3rdResit: "",
                exam4_1stTest: "",
                exam4_1stResit: "",
                exam4_2ndResit: "",
                exam4_3rdResit: "",
                exam5_1stResit: "",
                exam5_2ndResit: "",
                exam5_3rdResit: "",
                practicalCompetency: ""
            });

            setExamMarks(updatedExamMarks);
            //const fetchedPracticalCompetency = response.data.map(result => result.practicalCompetency || "");
            //setPracticalCompetency(fetchedPracticalCompetency);
            setPracticalCompetency(selectedStudentNameList.map(student => resultMap[student.id]?.practicalCompetency || ""));

        } catch (error) {
            console.error("Error fetching exam results:", error);
        }
    };

    // Call fetchExamResults inside useEffect
    useEffect(() => {
        fetchExamResults();
    }, [selectedEnrollDate, selectedCourseReport, selectedMarkingTemplate, selectedStudentNameList]);

    // get teacher full name using username from cookies
    useEffect(() => {
        const fetchTeacherInfo = async () => {
            if (!selectedTeacherName) return; // Prevent API call if no teacher name is selected

            try {
                const response = await axios.get(`${employeeLocalhost}/employee/employee-info/${selectedTeacherName}`);

                if (response.data && response.data.length > 0 && response.data[0].length > 5) {
                    setSelectedTeacherName1(response.data[0][5]);
                } else {
                    console.warn("Unexpected API response:", response.data);
                }
            } catch (error) {
                console.error("Error fetching teacher info:", error);
            }
        };

        fetchTeacherInfo();
    }, [selectedTeacherName]);

    useEffect(() => {
        const fetchExamResults = async () => {
            try {
                const response = await axios.get(`${employeeLocalhost}/examResult/getExamResultDetails/${selectedEnrollDate}/${selectedCourseReport}/${selectedMarkingTemplate}`);
                setExamResults(response.data);
                // Populate practicalCompetency and examMarks state based on fetched data
                const fetchedPracticalCompetency = response.data.map(result => result.practicalCompetency || "");
                setPracticalCompetency(fetchedPracticalCompetency);

                const fetchedExamMarks = response.data.map(result => ({
                    exam5_GroupDiscussion: result.exam5_GroupDiscussion || '',
                    exam1_1stTest: result.exam1_1stTest || '',
                    exam1_1stResit: result.exam1_1stResit || '',
                    exam1_2ndResit: result.exam1_2ndResit || '',
                    exam1_3rdResit: result.exam1_3rdResit || '',
                    exam2_1stTest: result.exam2_1stTest || '',
                    exam2_1stResit: result.exam2_1stResit || '',
                    exam2_2ndResit: result.exam2_2ndResit || '',
                    exam2_3rdResit: result.exam2_3rdResit || '',
                    exam3_1stTest: result.exam3_1stTest || '',
                    exam3_1stResit: result.exam3_1stResit || '',
                    exam3_2ndResit: result.exam3_2ndResit || '',
                    exam3_3rdResit: result.exam3_3rdResit || '',
                    exam4_1stTest: result.exam4_1stTest || '',
                    exam4_1stResit: result.exam4_1stResit || '',
                    exam4_2ndResit: result.exam4_2ndResit || '',
                    exam4_3rdResit: result.exam4_3rdResit || '',
                    exam5_1stTest: result.exam5_1stTest || '',
                    exam5_1stResit: result.exam5_1stResit || '',
                    exam5_2ndResit: result.exam5_2ndResit || '',
                    exam5_3rdResit: result.exam5_3rdResit || '',
                    practicalCompetency: result.practicalCompetency || ''
                }));
                setExamMarks(fetchedExamMarks);

            } catch (error) {
                console.error('Error fetching exam results:', error);
            }
        };

        fetchExamResults();
    }, [selectedEnrollDate, selectedCourseReport, selectedMarkingTemplate]);

    //Get markPractice details
    useEffect(() => {
        const fetchExamResults = async () => {
            try {
                const response = await axios.get(`${employeeLocalhost}/marking/getMarkPractical/${selectedCourseReport}`);
                setMarkPractice(response.data[0]);

            } catch (error) {
                console.error('Error fetching mark practice results:', error);
            }
        };

        fetchExamResults();
    }, [selectedEnrollDate, selectedCourseReport, selectedMarkingTemplate]);

    //Get project details
    useEffect(() => {
        const fetchProjectResults = async () => {
            try {
                const response = await axios.get(`${employeeLocalhost}/project/getProjectDetails/${selectedProjectStudentName}/${selectedCourseReport}`);
                setProjectResults(response.data);

            } catch (error) {
                console.error('Error fetching project results:', error);
            }
        };

        fetchProjectResults();
    }, [selectedProjectStudentName, selectedCourseReport]);

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

    //SP442 fetch data
    useEffect(() => {
        if (!selectedEnrollDate || !selectedSP442Exam || !selectedStudentID) return;

        const fetchReports = async () => {
            try {
                const response = await axios.get(`${employeeLocalhost}/report/getAllReportDetails/${selectedEnrollDate}/${selectedSP442Exam}/${selectedStudentID}`);

                if (response.data && response.data.length > 0) {

                    setSp442Data({
                        approach: response.data[0].approach || "",
                        format: response.data[0].format || "",
                        outcome: response.data[0].outcome || "",
                        planning: response.data[0].planning || "",
                        problemGoals: response.data[0].problem || "",
                        reflection: response.data[0].reflection || ""
                    });
                }
            } catch (error) {
                console.error("Error fetching all report details:", error);
            }
        };

        fetchReports();
    }, [selectedEnrollDate, selectedSP442Exam, selectedStudentID]);

    const handleSearchInputChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredData = data.filter((item, index, self) => {
        const courseMatch = item.classCourseCode.toLowerCase().includes(searchTerm.toLowerCase());

        return courseMatch;
    }).sort((a, b) => a.classCourseCode.localeCompare(b.classCourseCode));

    const handleButtonClick = async (item, program, semester) => {
        try {
            // Set the selected states
            handleOverallClick(item.classEnrollDateProgCode, item.classCourseCode, item.classMarkingTemplate);
            setSelectedEnrollDate(item.classEnrollDateProgCode);
            setSelectedCourseReport(item.classCourseCode);
            setSelectedCourseName(item.classCourse);
            setSelectedMarkingTemplate(item.classMarkingTemplate);
            setSelectedSemester(semester);
            setSelectedProgram(program);
            setSelectedTeacherName(item.classTeacherName);

            // Fetch attendance data
            const attendanceResponse = await axios.get(
                `${employeeLocalhost}/attendance/getAttendanceDetails1/${item.classEnrollDateProgCode}/${item.classCourseCode}`
            );
            setAttendanceData(attendanceResponse.data);

            // Fetch student names
            const namesResponse = await axios.get(
                `${adminLocalhost}/class/studentNames/${item.classEnrollDateProgCode}/${item.classCourseCode}`
            );

            // Extract data from response
            const namesArray = namesResponse.data[0].split(',').map((name) => name.trim());
            const idsArray = namesResponse.data[1].split(',').map((id) => id.trim());
            const intakesArray = namesResponse.data[2].split(',').map((intake) => intake.trim());

            // Get student ID from cookies
            const currentStudentID = Cookies.get("studentStdID");

            // Find the index of the student ID
            const studentIndex = idsArray.indexOf(currentStudentID);

            let filteredStudents = [];
            if (studentIndex !== -1) {
                // If student is found, store only that student
                filteredStudents = [{
                    name: namesArray[studentIndex],
                    id: idsArray[studentIndex],
                    intake: intakesArray[studentIndex],
                }];
            } else {
                // If student is not found, clear the list
                console.warn(`Student with ID ${currentStudentID} not found`);
            }

            // Set student list state
            setStudentNameList(filteredStudents);

            // Fetch marking data
            const markingResponse = await axios.get(
                `${employeeLocalhost}/marking/getMarkingByCourseCodeAndTemplate/${item.classCourseCode}/${item.classMarkingTemplate}`
            );
            if (markingResponse.data.length > 0) {
                setMarkingData(markingResponse.data[0]);
            }

            // Fetch student attendance details
            const studentAttendanceResponse = await axios.get(
                `${studentLocalhost}/studentAttendance/getStudentAttendanceDetails`
            );
            const statuses = studentAttendanceResponse.data.map((item) => ({
                stdAtdName: item.stdAtdName,
                stdAtdDate: item.stdAtdDate,
                stdAtdStatus: item.stdAtdStatus,
            }));
            const checkboxStatus = generateCheckboxStatus(statuses);
            setCheckboxStatus(checkboxStatus);

            // Fetch attendance eligibility details
            const filteredAttendanceResponse = await axios.get(
                `${employeeLocalhost}/attendanceEligible/getAttendanceEligibleDetails1/${item.classEnrollDateProgCode}`
            );

            const rows = Array.isArray(filteredAttendanceResponse.data) ? filteredAttendanceResponse.data : [];
            const matched = rows.find(r => (r.eligibleStudentID || '').trim().toUpperCase() === `${Cookies.get('studentStdID')}`);

            //const eligibilityArray = filteredAttendanceResponse.data.map(item => item.eligiblePercentage);
            //const numberOfStudents = filteredStudents.length;
            //const lastNEligibility = eligibilityArray.slice(-numberOfStudents);
            setSelectedstdAtdEligibility(matched.eligiblePercentage);

        } catch (error) {
            console.error('Error during handleButtonClick process:', error);
        } finally {
            setEditShow1(true);
        }
    };

    const handlePracticalCompetencyChange = (e, studentIndex) => {
        const newPracticalCompetency = [...practicalCompetency];
        newPracticalCompetency[studentIndex] = e.target.value;
        setPracticalCompetency(newPracticalCompetency);
    };

    const handleExamResultChange = (e, field, studentIndex) => {
        const value = e.target.value.trim() === "" || e.target.value === null ? "" : e.target.value;

        setExamMarks(prevMarks => {
            const updatedMarks = [...prevMarks];
            updatedMarks[studentIndex] = {
                ...updatedMarks[studentIndex],
                [field]: value
            };
            return updatedMarks;
        });
    };

    const handleDownloadClick = async (mode = 'download', enrollDate, courseCode, markPractice, name, id, intake, practicalCompetency, attendanceEligibleStatus) => {
        const studentIndex = selectedStudentNameList.findIndex(student => student.name === name)
        setSelectedProjectStudentName(name);
        setSelectedProjectStudentID(id);
        if (studentIndex !== -1) {
            const studentExamMarks = examMarks[studentIndex];
            if (studentExamMarks) {
                const marksArray = [];
                let totalExamMarks = 0;
                let total = 0;
                let overallTotalMarks = 0;
                let overallTotalMarks1 = 0;
                let overallTotalMarks2 = 0;
                let overallTotalMarks3 = 0;
                const programNameMap = {};

                // Pre-fetch all program names
                await Promise.all(attendanceData.map(async (item) => {
                    const programCode = item.attendanceProgram;

                    if (!programNameMap[programCode]) {
                        const response = await axios.get(`${adminLocalhost}/program/getProgramName/${programCode}`);
                        programNameMap[programCode] = response.data;
                    }
                }));

                if (selectedCourseReport !== "IT241" && selectedCourseReport !== "IT411") {
                    //Show Full Mark from Marking Scheme
                    for (let i = 1; i <= 5; i++) {
                        const mark = markingData[`mark${i}`];
                        if (mark !== "0" && mark !== undefined) {
                            const examMark = parseInt(markingData[`mark${i}`]);
                            if (!isNaN(examMark)) {
                                totalExamMarks += examMark;
                            }
                        }
                    }

                    //Calculate overallTotalMark that key in for 1st Test
                    for (let i = 1; i <= 5; i++) {
                        const mark = markingData[`mark${i}`];
                        if (mark !== "0" && mark !== undefined) {
                            let examTotal = 0;

                            const exam1stTestKey = `exam${i}_1stTest`;
                            const mark1stTest = parseFloat(studentExamMarks[exam1stTestKey]);
                            if (!isNaN(mark1stTest)) {
                                examTotal += mark1stTest;
                            }

                            overallTotalMarks += examTotal;
                        }
                    }

                    //Calculate overallTotalMark1 that key in for 1st Resist
                    for (let i = 1; i <= 5; i++) {
                        const mark = markingData[`mark${i}`];
                        if (mark !== "0" && mark !== undefined) {
                            let examTotal = 0;

                            const examKey = `exam${i}_1stResit`;
                            const mark = parseFloat(studentExamMarks[examKey]);
                            if (!isNaN(mark)) {
                                examTotal += mark;
                            }

                            overallTotalMarks1 += examTotal;
                        }
                    }

                    //Calculate overallTotalMark2 that key in for 2ndResit
                    for (let i = 1; i <= 5; i++) {
                        const mark = markingData[`mark${i}`];
                        if (mark !== "0" && mark !== undefined) {
                            let examTotal = 0;

                            const examKey = `exam${i}_2ndResit`;
                            const mark = parseFloat(studentExamMarks[examKey]);
                            if (!isNaN(mark)) {
                                examTotal += mark;
                            }

                            overallTotalMarks2 += examTotal;
                        }
                    }

                    //Calculate overallTotalMark3 that key in for 3rdResit
                    for (let i = 1; i <= 5; i++) {
                        const mark = markingData[`mark${i}`];
                        if (mark !== "0" && mark !== undefined) {
                            let examTotal = 0;

                            const examKey = `exam${i}_3rdResit`;
                            const mark = parseFloat(studentExamMarks[examKey]);
                            if (!isNaN(mark)) {
                                examTotal += mark;
                            }

                            overallTotalMarks3 += examTotal;
                        }
                    }
                }

                const doc = new jsPDF();

                doc.addFileToVFS("NotoSansCJK-Regular.ttf", NotoSansCJK);
                doc.addFont("NotoSansCJK-Regular.ttf", "NotoSansCJK", "normal");

                doc.addFileToVFS("NotoSansCJK-Bold.ttf", NotoSansCJKBold);
                doc.addFont("NotoSansCJK-Bold.ttf", "NotoSansCJKBold", "bold");

                const imgWidth = 25;
                const imgHeight = 20;
                const imgData = sbitLogo;
                doc.addImage(imgData, 'PNG', 20, 12, imgWidth, imgHeight);

                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("SBIT Training Academy (L02428)", 190, 18, { align: "right" });

                doc.setFontSize(8);
                doc.setFont("helvetica", "normal");
                doc.text("No.18A, Jalan 20/16A, Taman Paramount,", 190, 22, { align: "right" });
                doc.text("46300 Petaling Jaya, Selangor.", 190, 26, { align: "right" });

                // Add Grade table content
                doc.setFontSize(10);
                doc.setFillColor(200, 200, 200); // Gray shade
                doc.rect(165, 32, 25, 6, 'F'); // Draw shaded rectangle (Right side, go up, Left side, go down)
                doc.setFont("helvetica", "bold");
                doc.text("Score", 168, 36.2);
                doc.setFont("NotoSansCJKBold", "bold");
                doc.text("(成绩)", 178, 36.2);

                // Add small table beside the Student Result Slip
                doc.setLineWidth(0.3);
                doc.line(165, 32, 165, 45); // Vertical line 1 (Right X, Up Y, Left X, Down Y)
                doc.line(181, 38, 181, 45); // Vertical line 2
                doc.line(190, 32, 190, 45); // Vertical line 2
                doc.line(165, 32, 190, 32); // Horizontal line 1
                doc.line(165, 38, 190, 38); // Horizontal line 2
                doc.line(165, 45, 190, 45); // Horizontal line 3

                // Add Student Result Slip text in the middle
                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                doc.text("Student Result Slip", 87, 36);
                doc.setFont("NotoSansCJK", "normal");
                doc.text("学生成绩单", 96, 42);

                try {
                    const teacherResponse = await axios.get(`${adminLocalhost}/class/getTeacherName/${enrollDate}`);
                    const teacherUsername = teacherResponse.data[0] || 'N/A';

                    const teacherFullNameResponse = await axios.get(`${employeeLocalhost}/employee/employee-info/${teacherUsername}`);
                    const teacherFullName = teacherFullNameResponse.data[0][5] || 'N/A';
                    doc.setFontSize(9);
                    doc.text(`Trainer (导师)             :      ${teacherFullName}`, 20, 78);

                } catch (error) {
                    console.error('Error fetching teacher name:', error);
                    doc.text(`Trainer (导师)             :      N/A`, 20, 78); // fallback
                }

                // Add form data
                {
                    attendanceData.map((item, index) => {
                        doc.setFontSize(9);
                        doc.setFont("NotoSansCJK", "normal");
                        const programName = programNameMap[item.attendanceProgram] || "N/A";
                        doc.text(`Course (课程)             :       ${programName}`, 20, 54);
                        doc.text(`Student (学生)           :       ${name}`, 20, 60);
                        doc.text(`Intake (入学月份)      :      ${item.attendanceProgram} ${intake}`, 20, 66);
                        doc.text(`Student ID (学号)      :      ${id}`, 20, 72);
                        const formatDate = (dateStr) => {
                            const options = { day: '2-digit', month: 'short', year: 'numeric' };
                            return new Date(dateStr).toLocaleDateString('en-GB', options).replace(/ /g, '-');
                        };
                        doc.text(`Start Date (开始日期)        :       ${formatDate(item.attendanceClassStartDate)}`, 120, 66);
                        doc.text(`End Date (结束日期)          :       ${formatDate(item.attendanceClassEndDate)}`, 120, 72);

                        let subjectLabel = "Subject (科目)             :  ";
                        const program = item.attendanceProgram?.trim().toUpperCase();
                        const course = item.attendanceCourse?.trim().toUpperCase();

                        let subjectName =
                            (program === "DSE" || program === "DSEPT") && course === "MD221"
                                ? "Android Application Development - Kotlin"
                                : course === "MD221"
                                    ? "Mobile Device Service & Repairs"
                                    : item.attendanceCourseName;

                        let subjectX = 20, subjectY = 85;
                        let subjectTextX = 38.5;

                        let wrappedSubjectName = doc.splitTextToSize(subjectName, 100);

                        doc.text(`${subjectLabel}    ${wrappedSubjectName[0]}`, subjectX, subjectY);

                        wrappedSubjectName.slice(1).forEach((line, index) => {
                            doc.text(line, subjectTextX, subjectY + ((index + 1) * 6));
                        });

                        doc.text(`Subject Code (科目码)      :       ${item.attendanceCourse}`, 120, 78);
                    })
                }

                // Add new table below Subject
                doc.setFillColor(185, 185, 185); // Gray shade
                doc.rect(20, 92, 180, 6.2, 'F'); // Draw shaded rectangle
                doc.setTextColor(0, 0, 0); // Set text color back to black
                doc.setFont("helvetica", "bold");
                doc.text("Test", 39, 96);
                doc.setFont("NotoSansCJK", "normal");
                doc.text("(测验)", 47, 96);
                doc.setFont("helvetica", "bold");
                doc.setFillColor(230, 230, 230); // Gray shade
                doc.rect(20, 98, 59, 9.2, 'F'); // Draw shaded rectangle
                doc.setTextColor(0, 0, 0); // Set text color back to black
                doc.text("Final Test", 24, 102);
                doc.setFont("NotoSansCJK", "normal");
                doc.text("(期末考)", 25, 106);
                doc.setFont("helvetica", "bold");
                doc.text("Full Mark", 60, 102);
                doc.setFont("NotoSansCJK", "normal");
                doc.text("(满分)", 64, 106);
                doc.setFont("helvetica", "bold");
                doc.text("Score", 130, 96);
                doc.setFont("NotoSansCJK", "normal");
                doc.text("(成绩)", 140, 96);
                doc.setFont("helvetica", "bold");
                doc.text("1st Test", 86, 102);
                doc.setFont("NotoSansCJK", "normal");
                doc.text("(第一次测试)", 82, 106);
                doc.setFont("helvetica", "bold");
                doc.text("1st Resit", 113, 102);
                doc.setFont("NotoSansCJK", "normal");
                doc.text("(第一次重考)", 110, 106);
                doc.setFont("helvetica", "bold");
                doc.text("2nd Resit", 145, 102);
                doc.setFont("NotoSansCJK", "normal");
                doc.text("(第二次重考)", 143, 106);
                doc.setFont("helvetica", "bold");
                doc.text("3rd Resit", 178, 102);
                doc.setFont("NotoSansCJK", "normal");
                doc.text("(第三次重考)", 175, 106);

                // Add line on table above Assessment
                doc.line(20, 92, 200, 92); // Horizontal - 1
                doc.line(20, 98, 200, 98); // Horizontal - 2

                //Exam list in table
                let y = 111.5;
                const testArray = [];
                let x = 111.5;
                let z = 111.5;
                let z1 = 101;
                let zPosition = 111.5;
                let zPosition1 = 111.5;
                let zPosition2 = 111.5;
                let zPosition3 = 119;
                const passFailArray1stTest = [];
                const passFailArray1stResit = [];
                const passFailArray2ndResit = [];
                const passFailArray3rdResit = [];
                const lastOverallTotalWithGD = [];
                let failedTestPositions1st = {}; // For 1st Resit
                let failedTestPositions2nd = {}; // For 2nd Resit
                let failedTestPositions3rd = {}; // For 3rd Resit

                //All Final Test in table
                if (selectedCourseReport !== "IT241" && selectedCourseReport !== "IT411") {
                    doc.setFontSize(10); // Optional: set font size for consistency
                    doc.setTextColor(0, 0, 0); // Ensure text color is black
                    doc.setFontSize(8);

                    for (let i = 1; i <= 5; i++) {
                        const mark = markingData[`mark${i}`];
                        if (mark !== "0" && mark !== undefined) {
                            const exam = markingData[`exam${i}`];

                            doc.setFillColor(230, 230, 230);
                            doc.rect(20, y - 4, 58.8, 6, 'F');
                            doc.setTextColor(0, 0, 0);
                            doc.text(`${exam}`, 23, y);

                            y += 6;
                            testArray.push(exam);
                        }
                    }
                }

                const testArrayLength = testArray.length;
                const baseHeight = 6;
                const calculatedHeight = testArrayLength + 1 * baseHeight;
                setSelectedHeight(calculatedHeight);

                //All Full Mark list in table            
                if (selectedCourseReport !== "IT241" && selectedCourseReport !== "IT411") {
                    for (let i = 1; i <= 5; i++) {
                        const mark = markingData[`mark${i}`];
                        if (mark !== "0" && mark !== undefined) {
                            doc.text(`${markingData[`mark${i}`]}%`, 65, x);
                            x += 6;
                        }
                    }
                }

                // Show key in marks for 1stTest, 1stResist, 2ndResit, 3rdResit, GroupDiscussion
                if (selectedCourseReport !== "IT241" && selectedCourseReport !== "IT411") {

                    const formatMark = (mark) => {
                        const val = parseFloat(mark);
                        const display = val % 1 === 0 ? val.toFixed(0) : val.toFixed(1);
                        return display.padStart(5, ' ');
                    };

                    for (let i = 1; i <= 5; i++) {
                        const examTests = ['1stTest', '1stResit', '2ndResit', '3rdResit', 'GroupDiscussion'];

                        // If GroupDiscussion has a value, remove other exams from the list for exam5
                        if (
                            i === 5 &&
                            studentExamMarks[`exam5_GroupDiscussion`] !== undefined &&
                            studentExamMarks[`exam5_GroupDiscussion`] !== ""
                        ) {
                            examTests.splice(0, 4); // Remove '1stTest', '1stResit', '2ndResit', '3rdResit'
                        }

                        examTests.forEach(test => {
                            const examKey = `exam${i}_${test}`;
                            const mark = studentExamMarks[examKey];

                            if (mark !== undefined && mark !== "" && parseFloat(mark) !== 0) {
                                const fullMark = parseFloat(markingData[`mark${i}`]);
                                const halfMark = fullMark / 2;
                                const status = parseFloat(mark) >= halfMark ? "Pass" : "Fail";

                                switch (test) {
                                    case '1stTest':
                                        const testYPosition = z;
                                        if (status === "Fail") {
                                            doc.setTextColor(255, 0, 0);
                                            failedTestPositions1st[i] = testYPosition; // Store for 1st Resit
                                        }
                                        doc.text(`${formatMark(mark)}%`, 82, testYPosition);
                                        doc.text(`${status}`, 95, testYPosition);
                                        passFailArray1stTest.push(status);
                                        doc.setTextColor(0, 0, 0);
                                        z += 6;
                                        break;

                                    case '1stResit':
                                        const resit1Y = failedTestPositions1st[i] || zPosition;
                                        if (status === "Fail") {
                                            doc.setTextColor(255, 0, 0);
                                            failedTestPositions2nd[i] = resit1Y; // Store for 2nd Resit
                                        }
                                        doc.text(`${formatMark(mark)}%`, 109, resit1Y);
                                        doc.text(`${status}`, 125, resit1Y);
                                        passFailArray1stResit.push(status);
                                        doc.setTextColor(0, 0, 0);
                                        zPosition += 6;
                                        break;

                                    case '2ndResit':
                                        const resit2Y = failedTestPositions2nd[i] || zPosition1;
                                        if (status === "Fail") {
                                            doc.setTextColor(255, 0, 0);
                                            failedTestPositions3rd[i] = resit2Y; // Store for 3rd Resit
                                        }
                                        doc.text(`${formatMark(mark)}%`, 140, resit2Y);
                                        doc.text(`${status}`, 159, resit2Y);
                                        passFailArray2ndResit.push(status);
                                        doc.setTextColor(0, 0, 0);
                                        zPosition1 += 6;
                                        break;

                                    case '3rdResit':
                                        const resit3Y = failedTestPositions3rd[i] || zPosition2;
                                        doc.text(`${formatMark(mark)}%`, 175, resit3Y);
                                        doc.text(`${status}`, 189, resit3Y);
                                        passFailArray3rdResit.push(status);
                                        doc.setTextColor(0, 0, 0);
                                        zPosition2 += 6;
                                        break;

                                    case 'GroupDiscussion':
                                        doc.text(`${formatMark(mark)}%`, 82, z);
                                        doc.text(`Pass`, 95, z);
                                        z += 6;
                                        break;
                                }
                            }
                        });
                    }
                }

                const startY = 107.5;
                const rowHeight = 6; // Height between rows

                const lastValue = (startY + rowHeight * testArray.length);

                const yValues = [];
                // Draw dynamic horizontal lines based on testArray length
                for (let i = 0; i <= testArray.length; i++) {
                    const y = startY + rowHeight * i;
                    doc.line(20, y, 200, y); // Horizontal line
                    yValues.push(y);
                }

                const lastY = yValues.length > 0 ? yValues[yValues.length - 1] : 0;
                const newY = lastY + 14;
                const newYY = lastY + 28;
                const newYYY = lastY + 25;
                // Initialize arrays to store scores and grades
                let scoreArray = [];
                let gradeArray = [];

                const groupDiscussionMarks = studentExamMarks['exam5_GroupDiscussion'];

                const overallTotalWithGD = overallTotalMarks
                    ? (groupDiscussionMarks && groupDiscussionMarks.trim() !== ''
                        ? overallTotalMarks + parseFloat(groupDiscussionMarks)
                        : overallTotalMarks)
                    : null;

                const overallTotalWithGD1 = overallTotalMarks1
                    ? (groupDiscussionMarks && groupDiscussionMarks.trim() !== ''
                        ? overallTotalMarks1 + parseFloat(groupDiscussionMarks)
                        : overallTotalMarks1)
                    : null;

                const overallTotalWithGD2 = overallTotalMarks2
                    ? (groupDiscussionMarks && groupDiscussionMarks.trim() !== ''
                        ? overallTotalMarks2 + parseFloat(groupDiscussionMarks)
                        : overallTotalMarks2)
                    : null;

                const overallTotalWithGD3 = overallTotalMarks3
                    ? (groupDiscussionMarks && groupDiscussionMarks.trim() !== ''
                        ? overallTotalMarks3 + parseFloat(groupDiscussionMarks)
                        : overallTotalMarks3)
                    : null;

                const formatMark = (mark) => {
                    const val = parseFloat(mark);
                    return val % 1 === 0 ? `${val.toFixed(0)}%` : `${val.toFixed(1)}%`;
                };

                const grade = getGrade(overallTotalWithGD);

                function getGrade(overallTotalMarks) {
                    if (overallTotalMarks >= 90) {
                        return "A+";
                    } else if (overallTotalMarks >= 85) {
                        return "A";
                    } else if (overallTotalMarks >= 80) {
                        return "A-";
                    } else if (overallTotalMarks >= 75) {
                        return "B+";
                    } else if (overallTotalMarks >= 70) {
                        return "B";
                    } else if (overallTotalMarks >= 65) {
                        return "B-";
                    } else if (overallTotalMarks >= 60) {
                        return "C+";
                    } else if (overallTotalMarks >= 55) {
                        return "C";
                    } else if (overallTotalMarks >= 50) {
                        return "C-";
                    } else {
                        return "F";
                    }
                }

                if (markPractice == "Enable") {
                    // Draw vertical lines
                    doc.line(20, 92, 20, lastValue + 18); // Vertical - 1
                    doc.line(55, 98, 55, lastValue); // Vertical - 2
                    doc.line(93, 108, 93, lastValue); // Vertical - 4
                    doc.line(105, 98, 105, lastValue); // Vertical - 5
                    doc.line(121, 108, 121, lastValue); // Vertical - 6
                    doc.line(137, 98, 137, lastValue); // Vertical - 7
                    doc.line(153, 108, 153, lastValue); // Vertical - 8
                    doc.line(169, 98, 169, lastValue); // Vertical - 9
                    doc.line(185, 108, 185, lastValue); // Vertical - 10
                    doc.line(200, 92, 200, lastValue + 18); // Vertical - 11

                    doc.line(20, newYY - 10, 200, newYY - 10); // last horizontal line

                    if (selectedCourseReport !== "IT241" && selectedCourseReport !== "IT411") {
                        // Grey Shade for Total Result
                        doc.setLineWidth(0.3);
                        doc.setFont("helvetica", "normal");
                        doc.setFillColor(230, 230, 230); // Gray shade
                        doc.rect(20.5, x - 3.5, 58.8, 6, 'F'); // Draw shaded rectangle
                        doc.setTextColor(0, 0, 0); // Set text color back to black
                        doc.setFontSize(9);
                        doc.text("Practical", 23, x + 0.5);
                        doc.setFont("helvetica", "bold");
                        doc.text(`${practicalCompetency}`, 130, x + 0.5);
                        doc.setFont("helvetica", "normal");
                        doc.setFillColor(185, 185, 185); // Gray shade
                        doc.rect(20.3, x + 3, 179.5, 10.5, 'F'); // Draw shaded rectangle
                        doc.line(20, newY - 7, 200, newY - 7); // Horizontal line
                        doc.line(55, lastValue + 7, 55, lastValue + 18); // Vertical - 2.1 
                        doc.line(79, 92, 79, lastValue + 18); // Vertical - 3 
                        doc.line(105, lastValue + 7, 105, lastValue + 18); // Vertical - 5.1   
                        doc.line(137, lastValue + 7, 137, lastValue + 18); // Vertical - 7.1        
                        doc.line(169, lastValue + 7, 169, lastValue + 18); // Vertical - 9.1  
                    }
                    else if (selectedCourseReport === "IT241" || selectedCourseReport === "IT411") {
                        doc.setLineWidth(0.3);
                        doc.setFont("helvetica", "normal");
                        doc.setFillColor(230, 230, 230); // Gray shade
                        doc.rect(20.3, 108, 58.8, 6, 'F'); // Draw shaded rectangle
                        doc.setTextColor(0, 0, 0); // Set text color back to black
                        doc.setFontSize(9);
                        doc.text("Internship", 23, x + 0.5);
                        doc.setFont("helvetica", "bold");
                        doc.text(`${practicalCompetency}`, 130, x + 0.5);
                        doc.setFont("helvetica", "normal");
                        doc.setFillColor(185, 185, 185); // Gray shade for Total Result
                        doc.rect(20.3, x + 3, 179.5, 10.5, 'F'); // Draw shaded rectangle // Draw shaded rectangle
                        doc.line(20, newY - 7, 200, newY - 7); // Horizontal line
                        doc.line(55, lastValue + 7, 55, lastValue + 18); // Vertical - 2.1 
                        doc.line(79, 92, 79, lastValue + 18); // Vertical - 3 
                    }

                    doc.setFont("helvetica", "bold");
                    doc.text("Total Result", 23, x + 7);
                    doc.setFont("NotoSansCJK", "normal");
                    doc.text("(总成绩)", 23, x + 12);
                    if (selectedCourseReport !== "IT241" && selectedCourseReport !== "IT411") {
                        doc.setFont("helvetica", "bold");
                        doc.text(`${totalExamMarks}%`, 64, x + 10);
                    }
                    else if (selectedCourseReport === "IT241" || selectedCourseReport === "IT411") {
                        doc.setFont("helvetica", "bold");
                        doc.text(`N/A`, 64, x + 10);
                    }

                    try {
                        const teacherResponse = await axios.get(`${adminLocalhost}/class/getTeacherName/${enrollDate}`);
                        const teacherUsername = teacherResponse.data[0] || 'N/A';

                        const teacherFullNameResponse = await axios.get(`${employeeLocalhost}/employee/employee-info/${teacherUsername}`);
                        const teacherFullName = teacherFullNameResponse.data[0][5] || 'N/A';
                        doc.setFontSize(9);
                        doc.setFont("helvetica", "normal");
                        doc.text(`Prepared by       :       ${teacherFullName}`, 21, newYY - 2);
                        const currentDate = new Date();
                        const options = { year: 'numeric', month: 'short', day: '2-digit' };
                        const formattedDate = currentDate.toLocaleDateString('en-GB', options).replace(/ /g, '-');
                        doc.text(`Date                   :       ${formattedDate}`, 21, newYY + 3);

                    } catch (error) {
                        console.error('Error fetching teacher name:', error);
                        doc.text(`Trainer (导师)             :      N/A`, 20, 78); // fallback
                    }

                    // Grey share for Garding Schema
                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(0, 0, 0);
                    doc.setFillColor(200, 200, 200); // Gray shade for Grading Schema
                    doc.rect(20, newYYY - 18 + 29, 150, 6, 'F'); // Draw shaded rectangle for Grading Schema

                    // === Table Configuration ===
                    const tableX = 20;
                    const tableWidth = 150;
                    const col1Width = 30; // Grade
                    const col2Width = 60; // Marks
                    const col3Width = 60; // Evidence
                    const rowHeightTest = 5.5;

                    const gradingSchema = [
                        { grade: "A+", marks: "90% - 100%", evidence: "Distinction" },
                        { grade: "A", marks: "85% - 89%", evidence: "Very Good" },
                        { grade: "A-", marks: "80% - 84%", evidence: "" },
                        { grade: "B+", marks: "75% - 79%", evidence: "Good" },
                        { grade: "B", marks: "70% - 74%", evidence: "Satisfactory" },
                        { grade: "B-", marks: "65% - 69%", evidence: "" },
                        { grade: "C+", marks: "60% - 64%", evidence: "" },
                        { grade: "C", marks: "55% - 59%", evidence: "Weak" },
                        { grade: "C-", marks: "50% - 54%", evidence: "Pass" },
                        { grade: "F", marks: "0% - 49%", evidence: "Fail" },
                        { grade: "P", marks: "Pass after trying more than one attempt", evidence: "Pass after trying more than one attempt" },
                        { grade: "*Pass", marks: "Pass after trying more than one attempt", evidence: "Pass after trying more than one attempt" },
                        { grade: "N/A", marks: "Not Available", evidence: "Not Available" }
                    ];

                    // === Y Position Setup ===
                    const headerY = newYYY - 19 + 30; // Top of Grading Schema title
                    const startYTest = headerY + rowHeightTest;
                    const totalRows = gradingSchema.length + 1; // 1 header + 13 rows
                    const tableHeight = rowHeightTest * totalRows;
                    const bottomY = startYTest + rowHeightTest * gradingSchema.length;

                    // === Draw Title ===
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(9);
                    doc.setTextColor(0, 0, 0);
                    doc.text("Grading Schema", tableX + tableWidth / 2 - 20, headerY + 4);

                    // === Draw Column Headers ===
                    doc.setFont("helvetica", "bold");
                    doc.text("Grade", tableX + 2, startYTest + 4);
                    doc.text("Marks", tableX + col1Width + 15, startYTest + 4);
                    doc.text("Evidence", tableX + col1Width + col2Width + 24, startYTest + 4);

                    // === Draw Top Border Line ===
                    doc.line(tableX, headerY, tableX + tableWidth, headerY); // Line 1

                    // === Draw Header Row Bottom Line ===
                    doc.line(tableX, startYTest, tableX + tableWidth, startYTest); // Line 2

                    // === Draw Row Data & Horizontal Lines ===
                    doc.setFont("helvetica", "normal");
                    gradingSchema.forEach((item, index) => {
                        const y = startYTest + rowHeightTest * (index + 1);

                        // For line numbers 5, 7, 9 (i.e., index 4, 6, 8)
                        const isShortLine = (index + 1 === 3 || index + 1 === 5 || index + 1 === 7);
                        const lineEndX = isShortLine ? tableX + col1Width + col2Width : tableX + tableWidth;

                        // Draw horizontal line for each row
                        doc.line(tableX, y, lineEndX, y);

                        // Insert data
                        const gradeX = item.grade === "*Pass" ? tableX + 1 : tableX + 4;
                        doc.text(item.grade, gradeX + 1, y - 1.5 + rowHeightTest);

                        const marksX = item.marks === "Pass after trying more than one attempt"
                            ? tableX + 24
                            : item.marks === "Not Available"
                                ? tableX + col1Width + 10
                                : tableX + col1Width + 12;
                        doc.text(item.marks, marksX, y - 1.5 + rowHeightTest);

                        let evidenceX;

                        if (item.evidence === "Pass after trying more than one attempt") {
                            evidenceX = tableX + col1Width + col2Width + 2;
                        } else if (item.evidence === "Not Available") {
                            evidenceX = tableX + col1Width + col2Width + 23;
                        } else if (["Good", "Weak", "Pass"].includes(item.evidence)) {
                            evidenceX = tableX + col1Width + col2Width + 25;
                        } else if (item.evidence === "Fail") {
                            evidenceX = tableX + col1Width + col2Width + 26;
                        } else if (item.evidence === "Satisfactory") {
                            evidenceX = tableX + col1Width + col2Width + 23;
                        } else {
                            evidenceX = tableX + col1Width + col2Width + 24;
                        }

                        // Adjust vertical position for specific evidences
                        let evidenceY = y - 1.5 + rowHeightTest;

                        if (item.evidence === "Very Good" || item.evidence === "Good") {
                            evidenceY += 2;
                        } else if (item.evidence === "Satisfactory") {
                            evidenceY += 8;
                        }

                        doc.text(item.evidence, evidenceX, evidenceY);
                    });

                    // === Final Bottom Line (Line 16) ===
                    const finalBottomY = bottomY + rowHeightTest;
                    doc.line(tableX, finalBottomY, tableX + tableWidth, finalBottomY);

                    // === Draw Vertical Lines (only once, no overlap) ===
                    doc.line(tableX, headerY, tableX, finalBottomY); // Vertical 1
                    doc.line(tableX + 13, startYTest, tableX + 13, finalBottomY); // Vertical 2
                    doc.line(tableX + col1Width + col2Width, startYTest, tableX + col1Width + col2Width, finalBottomY); // Vertical 3
                    doc.line(tableX + tableWidth, headerY, tableX + tableWidth, finalBottomY); // Vertical 4
                }
                else if (markPractice == "Disable") {
                    // Draw vertical lines
                    doc.line(20, 92, 20, lastValue + 11); // Vertical - 1
                    doc.line(55, 98, 55, lastValue); // Vertical - 2
                    doc.line(93, 108, 93, lastValue); // Vertical - 4
                    doc.line(105, 98, 105, lastValue); // Vertical - 5
                    doc.line(121, 108, 121, lastValue); // Vertical - 6
                    doc.line(137, 98, 137, lastValue); // Vertical - 7
                    doc.line(153, 108, 153, lastValue); // Vertical - 8
                    doc.line(169, 98, 169, lastValue); // Vertical - 9
                    doc.line(185, 108, 185, lastValue); // Vertical - 10
                    doc.line(200, 92, 200, lastValue + 11); // Vertical - 11

                    doc.setLineWidth(0.3);
                    doc.setFillColor(200, 200, 200); // Gray shade for Total Result
                    doc.rect(20.3, x - 3.8, 179.5, 11, 'F'); // Draw shaded rectangle
                    doc.line(55, lastValue, 55, lastValue + 11); // Vertical - 2.1
                    doc.line(79, 92, 79, lastValue + 11); // Vertical - 3
                    doc.line(105, lastValue, 105, lastValue + 11); // Vertical - 5.1   
                    doc.line(137, lastValue, 137, lastValue + 11); // Vertical - 7.1        
                    doc.line(169, lastValue, 169, lastValue + 11); // Vertical - 9.1 

                    doc.line(20, newYY - 17, 200, newYY - 17); // last horizontal line

                    doc.setFont("helvetica", "bold");
                    doc.text("Total Result", 23, x);
                    doc.setFont("NotoSansCJK", "normal");
                    doc.text("(总成绩)", 23, x + 5);
                    if (selectedCourseReport !== "IT241" && selectedCourseReport !== "IT411") {
                        doc.setFont("helvetica", "bold");
                        doc.text(`${totalExamMarks}%`, 64, x + 3);
                    }
                    else if (selectedCourseReport === "IT241" || selectedCourseReport === "IT411") {
                        doc.setFont("helvetica", "bold");
                        doc.text(`N/A`, 64, x + 3);
                    }

                    try {
                        const teacherResponse = await axios.get(`${adminLocalhost}/class/getTeacherName/${enrollDate}`);
                        const teacherUsername = teacherResponse.data[0] || 'N/A';

                        const teacherFullNameResponse = await axios.get(`${employeeLocalhost}/employee/employee-info/${teacherUsername}`);
                        const teacherFullName = teacherFullNameResponse.data[0][5] || 'N/A';
                        doc.setFontSize(9);
                        doc.setFont("helvetica", "normal");
                        doc.text(`Prepared by       :       ${teacherFullName}`, 21, newYY - 10);
                        const currentDate = new Date();
                        const options = { year: 'numeric', month: 'short', day: '2-digit' };
                        const formattedDate = currentDate.toLocaleDateString('en-GB', options).replace(/ /g, '-');
                        doc.text(`Date                   :       ${formattedDate}`, 21, newYY - 4);

                    } catch (error) {
                        console.error('Error fetching teacher name:', error);
                        doc.text(`Trainer (导师)             :      N/A`, 20, 78); // fallback
                    }

                    // Grey share for Garding Schema
                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(0, 0, 0);
                    doc.setFillColor(200, 200, 200); // Gray shade for Grading Schema
                    doc.rect(20, (newYY - 4) + 5.3, 150, 5, 'F'); // Draw shaded rectangle for Grading Schema

                    // === Table Configuration ===
                    const tableX = 20;
                    const tableWidth = 150;
                    const col1Width = 30; // Grade
                    const col2Width = 60; // Marks
                    const col3Width = 60; // Evidence
                    const rowHeightTest = 5.5;

                    const gradingSchema = [
                        { grade: "A+", marks: "90% - 100%", evidence: "Distinction" },
                        { grade: "A", marks: "85% - 89%", evidence: "Very Good" },
                        { grade: "A-", marks: "80% - 84%", evidence: "" },
                        { grade: "B+", marks: "75% - 79%", evidence: "Good" },
                        { grade: "B", marks: "70% - 74%", evidence: "Satisfactory" },
                        { grade: "B-", marks: "65% - 69%", evidence: "" },
                        { grade: "C+", marks: "60% - 64%", evidence: "" },
                        { grade: "C", marks: "55% - 59%", evidence: "Weak" },
                        { grade: "C-", marks: "50% - 54%", evidence: "Pass" },
                        { grade: "F", marks: "0% - 49%", evidence: "Fail" },
                        { grade: "P", marks: "Pass after trying more than one attempt", evidence: "Pass after trying more than one attempt" },
                        { grade: "*Pass", marks: "Pass after trying more than one attempt", evidence: "Pass after trying more than one attempt" },
                        { grade: "N/A", marks: "Not Available", evidence: "Not Available" }
                    ];

                    // === Y Position Setup ===
                    const headerY = (newYY - 4) + 5;  // Top of Grading Schema title
                    const startYTest = headerY + rowHeightTest;
                    const totalRows = gradingSchema.length + 1; // 1 header + 13 rows
                    const tableHeight = rowHeightTest * totalRows;
                    const bottomY = startYTest + rowHeightTest * gradingSchema.length;

                    // === Draw Title ===
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(9);
                    doc.setTextColor(0, 0, 0);
                    doc.text("Grading Schema", tableX + tableWidth / 2 - 20, headerY + 4);

                    // === Draw Column Headers ===
                    doc.setFont("helvetica", "bold");
                    doc.text("Grade", tableX + 2, startYTest + 4);
                    doc.text("Marks", tableX + col1Width + 15, startYTest + 4);
                    doc.text("Evidence", tableX + col1Width + col2Width + 24, startYTest + 4);

                    // === Draw Top Border Line ===
                    doc.line(tableX, headerY, tableX + tableWidth, headerY); // Line 1

                    // === Draw Header Row Bottom Line ===
                    doc.line(tableX, startYTest, tableX + tableWidth, startYTest); // Line 2

                    // === Draw Row Data & Horizontal Lines ===
                    doc.setFont("helvetica", "normal");
                    gradingSchema.forEach((item, index) => {
                        const y = startYTest + rowHeightTest * (index + 1);

                        // For line numbers 5, 7, 9 (i.e., index 4, 6, 8)
                        const isShortLine = (index + 1 === 3 || index + 1 === 5 || index + 1 === 7);
                        const lineEndX = isShortLine ? tableX + col1Width + col2Width : tableX + tableWidth;

                        // Draw horizontal line for each row
                        doc.line(tableX, y, lineEndX, y);

                        // Insert data
                        const gradeX = item.grade === "*Pass" ? tableX + 1 : tableX + 4;
                        doc.text(item.grade, gradeX + 1, y - 1.5 + rowHeightTest);

                        const marksX = item.marks === "Pass after trying more than one attempt"
                            ? tableX + 24
                            : item.marks === "Not Available"
                                ? tableX + col1Width + 10
                                : tableX + col1Width + 12;
                        doc.text(item.marks, marksX, y - 1.5 + rowHeightTest);

                        let evidenceX;

                        if (item.evidence === "Pass after trying more than one attempt") {
                            evidenceX = tableX + col1Width + col2Width + 2;
                        } else if (item.evidence === "Not Available") {
                            evidenceX = tableX + col1Width + col2Width + 23;
                        } else if (["Good", "Weak", "Pass"].includes(item.evidence)) {
                            evidenceX = tableX + col1Width + col2Width + 25;
                        } else if (item.evidence === "Fail") {
                            evidenceX = tableX + col1Width + col2Width + 26;
                        } else if (item.evidence === "Satisfactory") {
                            evidenceX = tableX + col1Width + col2Width + 23;
                        } else {
                            evidenceX = tableX + col1Width + col2Width + 24;
                        }

                        // Adjust vertical position for specific evidences
                        let evidenceY = y - 1.5 + rowHeightTest;

                        if (item.evidence === "Very Good" || item.evidence === "Good") {
                            evidenceY += 2;
                        } else if (item.evidence === "Satisfactory") {
                            evidenceY += 8;
                        }

                        doc.text(item.evidence, evidenceX, evidenceY);
                    });

                    // === Final Bottom Line (Line 16) ===
                    const finalBottomY = bottomY + rowHeightTest;
                    doc.line(tableX, finalBottomY, tableX + tableWidth, finalBottomY);

                    // === Draw Vertical Lines (only once, no overlap) ===
                    doc.line(tableX, headerY, tableX, finalBottomY); // Vertical 1
                    doc.line(tableX + 13, startYTest, tableX + 13, finalBottomY); // Vertical 2
                    doc.line(tableX + col1Width + col2Width, startYTest, tableX + col1Width + col2Width, finalBottomY); // Vertical 3
                    doc.line(tableX + tableWidth, headerY, tableX + tableWidth, finalBottomY); // Vertical 4
                }

                doc.setFont("helvetica", "bold");

                // Set default text color
                doc.setTextColor(0, 0, 0);

                // 1st Test: Check Fail condition
                const isFirstTestFail = passFailArray1stTest.includes("Fail");
                const isIT241orIT411 = (selectedCourseReport === "IT241" || selectedCourseReport === "IT411");

                // First check: Disable Practice
                if (markPractice === "Disable") {
                    if (isFirstTestFail || attendanceEligibleStatus < 80) {
                        doc.setTextColor(255, 0, 0);
                        doc.text("F", 91, x + 4);
                        doc.setTextColor(0, 0, 0);
                    } else {
                        doc.text(formatMark(overallTotalWithGD), 89, x + 1);
                        doc.text(grade, 90, x + 5);
                    }
                }
                // Second check: Enable Practice
                else if (markPractice === "Enable") {
                    if (isFirstTestFail) {
                        doc.setTextColor(255, 0, 0);
                        doc.text("F", 91, x + 10); // Only print ONCE at position for Enable
                        doc.setTextColor(0, 0, 0);
                    } else {
                        if (practicalCompetency === "Incompetent" || practicalCompetency === "") {
                            doc.setTextColor(255, 0, 0);
                            if (isIT241orIT411) {
                                doc.text("Fail", 134, x + 10);
                            } else {
                                doc.text("F", 90, x + 10);
                            }
                            doc.setTextColor(0, 0, 0);
                        } else if (practicalCompetency === "Competent") {
                            if (isIT241orIT411) {
                                doc.text("Pass", 134, x + 10);
                            } else {
                                doc.text(formatMark(overallTotalWithGD), 88, x + 8);
                                doc.text(grade, 90, x + 12);
                            }
                        }
                    }
                }

                function drawResitResult({
                    doc,
                    overallTotalWithGD,
                    passFailArray,
                    xPosition,
                    xTextOffset1 = 8,
                    xTextOffset2 = 13,
                    markPractice,
                    practicalCompetency,
                    attendanceEligibleStatus
                }) {
                    if (overallTotalWithGD !== null) {
                        const isFail = passFailArray.includes("Fail");
                        const yPosition = (markPractice === "Disable") ? (x + 4) : (x + 10); // Always use this for both Fail and Pass
                        const passTextOffset1 = (markPractice === "Disable") ? (x + 1) : (x + xTextOffset1);
                        const passTextOffset2 = (markPractice === "Disable") ? (x + 5) : (x + xTextOffset2);

                        if (isFail || (markPractice === "Disable" && attendanceEligibleStatus < 81)) {
                            doc.setTextColor(255, 0, 0);
                            doc.text('F', xPosition, yPosition);
                            doc.setTextColor(0, 0, 0);
                        }
                        else if (markPractice === "Enable") {
                            if (practicalCompetency === "Incompetent" || practicalCompetency === "") {
                                doc.setTextColor(255, 0, 0);
                                doc.text('F', xPosition, yPosition);
                                doc.setTextColor(0, 0, 0);
                            }
                            else if (practicalCompetency === "Competent") {
                                doc.text('*Pass', xPosition - 4, passTextOffset1);
                                doc.text('P', xPosition, passTextOffset2);
                            }
                        }
                        else if (markPractice === "Disable" && attendanceEligibleStatus >= 81) {
                            doc.text('*Pass', xPosition - 4, passTextOffset1);
                            doc.text('P', xPosition, passTextOffset2);
                        }
                    }
                }

                drawResitResult({
                    doc,
                    overallTotalWithGD: overallTotalWithGD1,
                    passFailArray: passFailArray1stResit,
                    xPosition: 120,
                    markPractice,
                    practicalCompetency,
                    attendanceEligibleStatus
                });

                drawResitResult({
                    doc,
                    overallTotalWithGD: overallTotalWithGD2,
                    passFailArray: passFailArray2ndResit,
                    xPosition: 151,
                    markPractice,
                    practicalCompetency,
                    attendanceEligibleStatus
                });

                drawResitResult({
                    doc,
                    overallTotalWithGD: overallTotalWithGD3,
                    passFailArray: passFailArray3rdResit,
                    xPosition: 184,
                    markPractice,
                    practicalCompetency,
                    attendanceEligibleStatus
                });

                // Use the last non-null value from overallTotalWithGD, overallTotalWithGD1, overallTotalWithGD2, overallTotalWithGD3
                const lastScore = overallTotalWithGD3 !== null ? overallTotalWithGD3 :
                    overallTotalWithGD2 !== null ? overallTotalWithGD2 : overallTotalWithGD1 !== null ? overallTotalWithGD1 : overallTotalWithGD;

                const lastGrade = getGrade(lastScore);

                scoreArray.push(lastScore);
                gradeArray.push(lastGrade);
                const last_of_Array_Score = scoreArray[scoreArray.length - 1];
                const last_of_Array_Grade = gradeArray[gradeArray.length - 1];
                const isLastScoreNumeric = !isNaN(last_of_Array_Score);

                // Display the last score with or without percentage symbol
                if (overallTotalWithGD1 !== null || overallTotalWithGD2 !== null || overallTotalWithGD3 !== null) {

                    if (passFailArray1stResit.includes("Pass") && passFailArray2ndResit.length === 0 && passFailArray3rdResit.length === 0) {
                        doc.setFont("helvetica", "bold");
                        doc.text("*Pass", 168, 43);
                        doc.text("P", 184, 43);
                        doc.setTextColor(0, 0, 0);
                        doc.setFont("helvetica", "normal");
                    }
                    else if (passFailArray1stResit.includes("Fail") && passFailArray2ndResit.length === 0 && passFailArray3rdResit.length === 0) {
                        doc.setFont("helvetica", "bold");
                        doc.setTextColor(255, 0, 0);
                        doc.text("Fail", 168, 43);
                        doc.text("F", 184, 43);
                        doc.setTextColor(0, 0, 0);
                        doc.setFont("helvetica", "normal");
                    }
                    else if (passFailArray1stResit.includes("Fail") && passFailArray2ndResit.includes("Pass")) {
                        doc.setFont("helvetica", "bold");
                        doc.text("*Pass", 168, 43);
                        doc.text("P", 184, 43);
                        doc.setFont("helvetica", "normal");
                    }
                    else if (passFailArray1stResit.includes("Fail") && passFailArray2ndResit.includes("Fail") && passFailArray3rdResit.length === 0) {
                        doc.setFont("helvetica", "bold");
                        doc.setTextColor(255, 0, 0);
                        doc.text("Fail", 168, 43);
                        doc.text("F", 184, 43);
                        doc.setTextColor(0, 0, 0);
                        doc.setFont("helvetica", "normal");
                    }
                    else if (passFailArray1stResit.includes("Fail") && passFailArray2ndResit.includes("Fail") && passFailArray3rdResit.includes("Pass")) {
                        doc.setFont("helvetica", "bold");
                        doc.text("*Pass", 168, 43);
                        doc.text("P", 184, 43);
                        doc.setFont("helvetica", "normal");
                    }
                    else if (passFailArray1stResit.includes("Fail") && passFailArray2ndResit.includes("Fail") && passFailArray3rdResit.includes("Fail")) {
                        doc.setFont("helvetica", "bold");
                        doc.setTextColor(255, 0, 0);
                        doc.text("Fail", 168, 43);
                        doc.text("F", 184, 43);
                        doc.setTextColor(0, 0, 0);
                        doc.setFont("helvetica", "normal");
                    }
                    else {
                        if (markPractice == "Enable") {
                            if (practicalCompetency == "Incompetent" || practicalCompetency == "") {
                                doc.setFont("helvetica", "bold");
                                doc.setTextColor(255, 0, 0);
                                doc.text("Fail", 168, 43);
                                doc.text("F", 184, 43);
                                doc.setTextColor(0, 0, 0);
                                doc.setFont("helvetica", "normal");

                            }
                            else if (practicalCompetency == "Competent") {
                                doc.setFont("helvetica", "bold");
                                doc.text("*Pass", 168, 43);
                                doc.text("P", 184, 43);
                                doc.setTextColor(0, 0, 0);
                                doc.setFont("helvetica", "normal");
                            }
                        }
                        else {
                            if (attendanceEligibleStatus < 81) {
                                doc.setFont("helvetica", "bold");
                                doc.setTextColor(255, 0, 0);
                                doc.text("Fail", 168, 43);
                                doc.text("F", 184, 43);
                                doc.setTextColor(0, 0, 0);
                                doc.setFont("helvetica", "normal");

                            }
                            else if (attendanceEligibleStatus > 80 && attendanceEligibleStatus <= 100) {
                                doc.setFont("helvetica", "bold");
                                doc.text("*Pass", 168, 43);
                                doc.text("P", 184, 43);
                                doc.setFont("helvetica", "normal");

                            }
                        }
                    }
                } else {
                    if (isLastScoreNumeric) {
                        if (passFailArray1stTest.includes("Fail")) {
                            doc.setFont("helvetica", "bold");
                            doc.setTextColor(255, 0, 0);
                            doc.text(`Fail`, 168, 43);
                            doc.setFont("helvetica", "normal");
                            doc.setFont("helvetica", "bold");
                            doc.text("F", 184, 43);
                            doc.setFont("helvetica", "normal");
                            doc.setTextColor(0, 0, 0);

                        }
                        else {
                            if (markPractice == "Enable") {
                                if (practicalCompetency == "Incompetent" || practicalCompetency == "") {
                                    doc.setFont("helvetica", "bold");
                                    doc.setTextColor(255, 0, 0);
                                    doc.text(`Fail`, 168, 43);
                                    doc.setFont("helvetica", "normal");
                                    doc.setFont("helvetica", "bold");
                                    doc.text("F", 184, 43);
                                    doc.setFont("helvetica", "normal");
                                    doc.setTextColor(0, 0, 0);
                                }
                                else if (practicalCompetency == "Competent") {
                                    if (selectedCourseReport !== "IT241" && selectedCourseReport !== "IT411") {
                                        doc.setFontSize(11);
                                        doc.setFont("helvetica", "bold");
                                        doc.text(formatMark(last_of_Array_Score), 168, 43);
                                        doc.text(last_of_Array_Grade, 184, 43);
                                        doc.setFont("helvetica", "normal");
                                    }
                                    else if (selectedCourseReport === "IT241" || selectedCourseReport === "IT411") {
                                        doc.setFont("helvetica", "bold");
                                        doc.text(`Pass`, 168, 43);
                                        doc.text("P", 184, 43);
                                        doc.setFont("helvetica", "normal");
                                    }
                                }
                            }
                            else {
                                if (attendanceEligibleStatus < 81) {
                                    doc.setFont("helvetica", "bold");
                                    doc.setTextColor(255, 0, 0);
                                    doc.text(`Fail`, 168, 43);
                                    doc.setFont("helvetica", "normal");
                                    doc.setFont("helvetica", "bold");
                                    doc.text("F", 184, 43);
                                    doc.setFont("helvetica", "normal");
                                    doc.setTextColor(0, 0, 0);
                                }
                                else if (attendanceEligibleStatus > 80 && attendanceEligibleStatus <= 100) {
                                    doc.setFont("helvetica", "bold");
                                    doc.text(formatMark(overallTotalWithGD), 168, 43);
                                    doc.text(grade, 184, 43);
                                    doc.setFont("helvetica", "normal");
                                }
                            }
                        }

                    }
                }

                lastOverallTotalWithGD.push(overallTotalWithGD, overallTotalWithGD1, overallTotalWithGD2, overallTotalWithGD3);

                const filteredOverallTotal = lastOverallTotalWithGD.filter(value => value !== null);

                const lastTotalValue = filteredOverallTotal[filteredOverallTotal.length - 1];

                /*if(selectedCourseReport !== "IT241" && selectedCourseReport !== "IT411")
                {
                    // Save the PDF
                    attendanceData.forEach((item, index) => {
                        if (lastTotalValue === overallTotalWithGD) {
                            doc.save(`ReportCard-${item.attendanceCourse}-${name}-${id}-1st-Test.pdf`);
                        } else if (lastTotalValue === overallTotalWithGD1) {
                            doc.save(`ReportCard-${item.attendanceCourse}-${name}-${id}-1st-Resit.pdf`);
                        } else if (lastTotalValue === overallTotalWithGD2) {
                            doc.save(`ReportCard-${item.attendanceCourse}-${name}-${id}-2nd-Resit.pdf`);
                        } else if (lastTotalValue === overallTotalWithGD3) {
                            doc.save(`ReportCard-${item.attendanceCourse}-${name}-${id}-3rd-Resit.pdf`);
                        }
                    });
                }
                else if(selectedCourseReport === "IT241" || selectedCourseReport === "IT411")
                {
                    doc.save(`ReportCard-${courseCode}-${name}-${id}.pdf`);
                }*/
                if (mode === 'view') {
                    window.open(doc.output("bloburl"), "_blank");
                } else {
                    doc.save(`ReportCard-${courseCode}-${name}-${id}.pdf`);
                }

            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Please provide all marks details'
                });
            }
        } else {
            console.error('Student not found.');
        }
    };

    const generateCheckboxStatus = (statuses) => {
        const checkboxStatus = {};

        selectedStudentNameList.forEach((name, studentIndex) => {
            uniqueDates.forEach((date, dateIndex) => {
                const statusIndex = statuses.findIndex(item => item.stdAtdName === name && item.stdAtdDate === date);
                // Check if the status for the current student and date exists
                if (statusIndex !== -1) {
                    const status = statuses[statusIndex].stdAtdStatus;
                    if (status === "Present") {
                        checkboxStatus[`present_${studentIndex}_${dateIndex}`] = true;
                        checkboxStatus[`late_${studentIndex}_${dateIndex}`] = false;
                        checkboxStatus[`absent_${studentIndex}_${dateIndex}`] = false;
                    } else if (status === "Late") {
                        checkboxStatus[`present_${studentIndex}_${dateIndex}`] = false;
                        checkboxStatus[`late_${studentIndex}_${dateIndex}`] = true;
                        checkboxStatus[`absent_${studentIndex}_${dateIndex}`] = false;
                    } else if (status === "Absent") {
                        checkboxStatus[`present_${studentIndex}_${dateIndex}`] = false;
                        checkboxStatus[`late_${studentIndex}_${dateIndex}`] = false;
                        checkboxStatus[`absent_${studentIndex}_${dateIndex}`] = true;
                    }
                }
            });
        });

        return checkboxStatus;
    };

    const handleProject = async (studentName, studentID) => {
        try {
            setSelectedProjectStudentName(studentName);
            setSelectedProjectStudentID(studentID);

            // Set the modal to open
            setEditShow4(true);

            // Perform the Axios GET request and await the response
            const response = await axios.get(`${employeeLocalhost}/project/getProjectDetails/${studentName}/${selectedCourseReport}`);

            if (response.data) {
                // Use the response data to set the state
                setSelectedProjectTitle(response.data[0].projectTitle || "");
                setSelectedProjectDescription(response.data[0].projectDescription || "");
            } else {
                // If no data exists, set the fields to empty
                setSelectedProjectTitle("");
                setSelectedProjectDescription("");
            }

        } catch (error) {
            console.error("Error fetching project details:", error);

            // Ensure the fields are reset in case of an error
            setSelectedProjectTitle("");
            setSelectedProjectDescription("");
        }
    };

    const handleOverallClick = (EnrollDate, Course, MarkTemplate) => {
        //setEditShow3(true);
        setSelectedCourseReport(Course);

        // Fetch attendance data
        axios.get(`${employeeLocalhost}/attendance/getAttendanceDetails1/${EnrollDate}/${Course}`)
            .then(response => {
                setAttendanceData(response.data);

                // Fetch student names
                axios.get(`${adminLocalhost}/class/studentNames/${EnrollDate}/${Course}`)
                    .then(response => {
                        const namesArray = response.data[0].split(',').map(name => name.trim());
                        const idsArray = response.data[1].split(',').map(id => id.trim());

                        const combinedArray = namesArray.map((name, index) => ({
                            name: name,
                            id: idsArray[index]
                        })).sort((a, b) => a.name.localeCompare(b.name));
                        setStudentNameList(combinedArray);
                    })
                    .catch(error => {
                        console.error('Error fetching student names:', error);
                    });

                // Fetch exam result details and set result
                axios.get(`${employeeLocalhost}/examResult/getExamResultDetails/${EnrollDate}/${Course}/${MarkTemplate}`)
                    .then(response => {
                        setResult(response.data);
                    })
                    .catch(error => {
                        console.error('Error fetching exam results:', error);
                    });
            })
            .catch(error => {
                console.error('Error fetching attendance data:', error);
            });
    };

    const handleCloseCross = (e) => {
        setEditShow1(false);
    };

    let zeroCount = 0;

    for (let i = 1; i <= 5; i++) {
        if (markingData[`mark${i}`] === "0") {
            zeroCount++;
        }
    }

    const nonZeroCount = 5 - zeroCount;

    const handleDescriptionChange = (e) => {
        if (e.target.value.length <= maxLength) {
            setSelectedProjectDescription(e.target.value);
        }
    };

    // Toggle Semester Expand/Collapse
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

    const maxLength = 255;

    return (
        <div>
            <div className='employeeHometopBarDiv'>
                <TopbarStudent />
            </div>
            <div className='employeeHomesideBarDiv'>
                <SidebarStudent />
            </div>
            <div className='employeeHomeBoxDiv'>
                <div className="employeeHomecontainer">
                    <div className="employeeHomediv1">
                        <h2 className="fs-2 m-0">Exam Result SCI</h2>
                    </div>
                    <div className="employeeHomediv2 d-flex justify-content-between align-items-center">
                        <div className="d-flex custom-margin">
                            <input
                                type="text"
                                placeholder="Search by Course"
                                value={searchTerm}
                                onChange={handleSearchInputChange}
                                className="mr-2"
                                style={{ width: '180px' }}
                            />
                        </div>
                        <Button id='btnRefresh' className='btn btn-contact me-2' onClick={() => window.location.reload()}><FontAwesomeIcon icon={faRefresh} /></Button>
                    </div>

                    <div className="table-container">
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
                                                                <td>
                                                                    {(program?.trim().toUpperCase() === "DSE" || program?.trim().toUpperCase() === "DSEPT") &&
                                                                        item.classCourseCode?.trim().toUpperCase() === "MD221"
                                                                        ? "Android Application Development - Kotlin"
                                                                        : item.classCourseCode?.trim().toUpperCase() === "MD221"
                                                                            ? "Mobile Device Service & Repairs"
                                                                            : item.classCourse}
                                                                </td>
                                                                <td>{item.classStartDate}</td>
                                                                <td>{item.classTeacherName}</td>
                                                                <td>
                                                                    <button
                                                                        id="btnFontIcon"
                                                                        className="btn btn-success"
                                                                        title="View mark"
                                                                        style={{ fontSize: "10px" }}
                                                                        onClick={() => handleButtonClick(item, program, semester)}
                                                                    >
                                                                        <FontAwesomeIcon
                                                                            icon={
                                                                                faEye
                                                                            }
                                                                        />
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
                    </div>

                    {/* Exam Score Modal */}
                    <Modal show={editShow1} onHide={handleCloseCross} backdrop="static" keyboard={false} enforceFocus={true} dialogClassName="custom-modal">
                        <Modal.Header closeButton>
                            <Modal.Title style={{ color: 'black', fontSize: "20px" }}>{`View Exam Result`}</Modal.Title>

                            <span style={{ fontSize: "14px", color: "gray", display: "block", marginTop: "auto", marginLeft: "auto" }}>
                                <strong>Semester:</strong> {selectedSemester} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <strong>Program:</strong> {selectedProgram} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <strong>Course Code:</strong> {selectedCourseReport} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            </span>
                        </Modal.Header>
                        <Modal.Body style={{ overflowX: "auto" }}>
                            <div style={{ position: "relative", border: "1px solid #ddd" }}>
                                <Table striped bordered hover style={{ minWidth: "800px", borderCollapse: "collapse" }}>
                                    <thead style={{
                                        position: "sticky",
                                        top: 0,
                                        background: "white",
                                        zIndex: 100,
                                        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
                                        borderBottom: "2px solid #ddd"
                                    }}>
                                        <tr style={{ textAlign: "center", fontSize: "12px" }}>
                                            <th rowSpan="2" style={{ verticalAlign: "middle" }}>Student</th>
                                            {markingData.markPractical == "Enable" && (
                                                <th rowSpan="2" style={{ verticalAlign: "middle" }}>Practical</th>
                                            )}
                                            <th colSpan="2" style={{ verticalAlign: "middle" }}>Attendance</th>
                                            {markingData.mark1 !== "0" && (
                                                <th
                                                    colSpan={["SS411", "DI221"].includes(selectedCourseReport) || markingData.exam1 !== "Exercise" ? "4" : undefined}
                                                    rowSpan={!(["SS411", "DI221"].includes(selectedCourseReport)) && markingData.exam1 === "Exercise" ? "2" : undefined}
                                                    style={markingData.exam1 === "Exercise" ? { verticalAlign: "middle" } : {}}
                                                >
                                                    {markingData.exam1} - {markingData.mark1}%
                                                </th>
                                            )}

                                            {markingData.mark2 !== "0" && (
                                                <th
                                                    colSpan={
                                                        markingData.exam2 === "Mini Project" ? "4" :
                                                            (selectedCourseReport === "RW211" ||
                                                                (selectedCourseReport === "HD221" && markingData.exam2 === "Oral Test")) ? "4"
                                                                : (selectedCourseReport === "PS211" && markingData.exam2 === "Exercise") ? "1"
                                                                    : (["Exercise", "Homework", "Implementation"].includes(markingData.exam2) ? undefined : "4")
                                                    }
                                                    rowSpan={
                                                        (selectedCourseReport !== "RW211" &&
                                                            ["Exercise", "Homework", "Implementation"].includes(markingData.exam2)) ? "2"
                                                            : undefined
                                                    }
                                                    style={
                                                        (["Exercise", "Homework", "Implementation"].includes(markingData.exam2))
                                                            ? { verticalAlign: "middle" }
                                                            : { width: "300px" }
                                                    }
                                                >
                                                    {markingData.exam2} - {markingData.mark2}%
                                                </th>
                                            )}

                                            {markingData.mark3 !== "0" && (
                                                <th colSpan={["Exercise", "Homework", "Presentation"].includes(markingData.exam3) ? undefined : "4"}
                                                    rowSpan={["Exercise", "Homework", "Presentation"].includes(markingData.exam3) ? "2" : undefined}
                                                    style={["Exercise", "Homework", "Presentation"].includes(markingData.exam3) ? { verticalAlign: "middle" } : {}}>
                                                    {markingData.exam3} - {markingData.mark3}%
                                                </th>
                                            )}

                                            {markingData.mark4 !== "0" && (
                                                <th colSpan={["Exercise", "Homework"].includes(markingData.exam4) ? undefined : "4"}
                                                    rowSpan={["Exercise", "Homework"].includes(markingData.exam4) ? "2" : undefined}
                                                    style={["Exercise", "Homework", "Project"].includes(markingData.exam4) ? { verticalAlign: "middle" } : {}}>
                                                    {markingData.exam4} - {markingData.mark4}%
                                                </th>
                                            )}
                                            {markingData.mark5 !== "0" && (
                                                markingData.exam5 === "Group Discussion" ? (
                                                    <th rowSpan="2" style={{ verticalAlign: "middle" }}>{markingData.exam5} -<br /> {markingData.mark5}%</th>
                                                ) : (
                                                    <th colSpan="4">{markingData.exam5} - {markingData.mark5}%</th>
                                                )
                                            )}
                                            <th colSpan="4" style={{ verticalAlign: "middle" }}>Total(100%)</th>
                                            <th rowSpan="2" style={{ verticalAlign: "middle" }}>Final Result(100%)</th>
                                            <th rowSpan="2" style={{ verticalAlign: "middle" }}>Final Grade</th>
                                            <th rowSpan="2" style={{ verticalAlign: "middle" }}>Action</th>
                                        </tr>
                                        <tr style={{ textAlign: "center", verticalAlign: "middle", fontSize: "12px" }}>
                                            <th>(%)</th>
                                            <th>Status</th>

                                            {(selectedCourseReport === "SS411" || selectedCourseReport === "RW211" ||
                                                selectedCourseReport === "DI221"
                                            ) ? (
                                                markingData.mark1 !== "0" && (
                                                    <>
                                                        <th>1st<br />Test</th>
                                                        <th>1st<br />Resit</th>
                                                        <th>2nd<br />Resit</th>
                                                        <th>3rd<br />Resit</th>
                                                    </>
                                                )
                                            ) : (
                                                markingData.mark1 !== "0" && (
                                                    (markingData.exam1 === "Presentation" || markingData.exam1 === "Written Test" ||
                                                        markingData.exam1 === "Proposal" || markingData.exam1 === "Project" ||
                                                        markingData.exam1 === "Service Report" || markingData.exam1 === "Assessment"
                                                    ) && (
                                                        <>
                                                            <th>1st<br />Test</th>
                                                            <th>1st<br />Resit</th>
                                                            <th>2nd<br />Resit</th>
                                                            <th>3rd<br />Resit</th>
                                                        </>
                                                    )
                                                )
                                            )}

                                            {markingData.mark2 !== "0" && markingData.exam2 === "Mini Project" && (
                                                (["RW211", "HD221", "SF221"].includes(selectedCourseReport) || markingData.exam2 !== "Oral Test") && (
                                                    <>
                                                        <th>1st<br />Test</th>
                                                        <th>1st<br />Resit</th>
                                                        <th>2nd<br />Resit</th>
                                                        <th>3rd<br />Resit</th>
                                                    </>
                                                )
                                            )}

                                            {markingData.mark3 !== "0" &&
                                                !["Homework", "Exercise", "Presentation"].includes(markingData.exam3)
                                                && (
                                                    <>
                                                        <th>1st<br />Test</th>
                                                        <th>1st<br />Resit</th>
                                                        <th>2nd<br />Resit</th>
                                                        <th>3rd<br />Resit</th>
                                                    </>
                                                )
                                            }
                                            {markingData.mark4 !== "0" && markingData.exam4 === "Project" && (
                                                <>
                                                    <th>1st<br />Test</th>
                                                    <th>1st<br />Resit</th>
                                                    <th>2nd<br />Resit</th>
                                                    <th>3rd<br />Resit</th>
                                                </>
                                            )}

                                            {markingData.mark4 !== "0" && !["Homework", "Exercise"].includes(markingData.exam4) && (
                                                <>
                                                    <th>1st<br />Test</th>
                                                    <th>1st<br />Resit</th>
                                                    <th>2nd<br />Resit</th>
                                                    <th>3rd<br />Resit</th>
                                                </>
                                            )}

                                            {markingData.mark5 !== "0" && markingData.exam5 !== "Group Discussion" && (
                                                <>
                                                    <th>1st<br />Test</th>
                                                    <th>1st<br />Resit</th>
                                                    <th>2nd<br />Resit</th>
                                                    <th>3rd<br />Resit</th>
                                                </>
                                            )}
                                            {["RW211", "SF221", "NS221", "DI221", "SW223", "HP211", "SS411", "SP241", "SP442", "IT411", "SP441", "AI411"].includes(selectedCourseReport) && (
                                                <>
                                                    <th>1st<br />Test</th>
                                                    <th>1st<br />Resit</th>
                                                    <th>2nd<br />Resit</th>
                                                    <th>3rd<br />Resit</th>
                                                </>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody style={{ textAlign: "center" }}>
                                        {selectedStudentNameList.map((student, studentIndex) => {
                                            const result = selectedResult.find(res => res.examStdID === student.id);
                                            const eligibility = selectedStdAtdEligibility || "N/A";
                                            const status = eligibility === "N/A"
                                                ? "N/A"
                                                : eligibility >= 80
                                                    ? "Passed"
                                                    : "Failed";

                                            const color = eligibility === "N/A"
                                                ? "black"
                                                : eligibility >= 80
                                                    ? "green"
                                                    : "red";
                                            return (
                                                <tr key={studentIndex}>
                                                    <td style={{ verticalAlign: "middle", width: '70px', fontSize: "12px" }}>{student.name}{" ("}{student.id}{")"}</td>
                                                    {markingData.markPractical === "Enable" && (
                                                        <td style={{ verticalAlign: "middle", fontSize: "12px" }}>
                                                            <select
                                                                value={practicalCompetency[studentIndex]}
                                                                disabled
                                                                onChange={(e) => handlePracticalCompetencyChange(e, studentIndex)}
                                                            >
                                                                <option value="">Status?</option>
                                                                <option value="Incompetent">Incompetent</option>
                                                                <option value="Competent">Competent</option>
                                                            </select>
                                                        </td>
                                                    )}
                                                    {/* Display eligibility percentage */}
                                                    <td style={{ verticalAlign: "middle" }}>{eligibility ? `${eligibility}%` : "N/A"}</td>
                                                    {/* Display eligibility status */}
                                                    <td
                                                        style={{
                                                            verticalAlign: "middle",
                                                            color: color,
                                                        }}
                                                    >
                                                        {status}
                                                    </td>
                                                    {markingData.mark1 !== "0" && (
                                                        <>
                                                            <td style={{ verticalAlign: "middle" }}>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    name={`exam1_1stTest_${studentIndex}`}
                                                                    value={examMarks[studentIndex]?.exam1_1stTest || ""}
                                                                    onChange={(e) => handleExamResultChange(e, "exam1_1stTest", studentIndex)}
                                                                    onClick={selectedCourseReport === "SP442" ? () => {
                                                                        setSelectedStudentIndex(studentIndex);
                                                                        setSelectedSP442Exam("1st Test");
                                                                        setSelectedStudentID(student.id);
                                                                        setShowSP442Modal(true);
                                                                    } : undefined}
                                                                    readOnly={selectedCourseReport === "SP442"}
                                                                    style={{ width: "60px" }}
                                                                    disabled
                                                                />
                                                            </td>

                                                            <td style={{ verticalAlign: "middle" }}>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    name={`exam1_1stResit_${studentIndex}`}
                                                                    value={examMarks[studentIndex]?.exam1_1stResit}
                                                                    onChange={(e) => handleExamResultChange(e, "exam1_1stResit", studentIndex)}
                                                                    onClick={selectedCourseReport === "SP442" ? () => {
                                                                        setSelectedStudentIndex(studentIndex);
                                                                        setSelectedSP442Exam("1st Resit");
                                                                        setSelectedStudentID(student.id);
                                                                        setShowSP442Modal(true);
                                                                    } : undefined}
                                                                    readOnly={selectedCourseReport === "SP442"}
                                                                    style={{ width: "60px" }}
                                                                    disabled
                                                                />
                                                            </td>

                                                            <td style={{ verticalAlign: "middle" }}>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    name={`exam1_2ndResit_${studentIndex}`}
                                                                    value={examMarks[studentIndex]?.exam1_2ndResit}
                                                                    onChange={(e) => handleExamResultChange(e, "exam1_2ndResit", studentIndex)}
                                                                    onClick={selectedCourseReport === "SP442" ? () => {
                                                                        setSelectedStudentIndex(studentIndex);
                                                                        setSelectedSP442Exam("2nd Resit");
                                                                        setSelectedStudentID(student.id);
                                                                        setShowSP442Modal(true);
                                                                    } : undefined}
                                                                    readOnly={selectedCourseReport === "SP442"}
                                                                    style={{ width: "60px" }}
                                                                    disabled
                                                                />
                                                            </td>

                                                            <td style={{ verticalAlign: "middle" }}>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    name={`exam1_3rdResit_${studentIndex}`}
                                                                    value={examMarks[studentIndex]?.exam1_3rdResit}
                                                                    onChange={(e) => handleExamResultChange(e, "exam1_3rdResit", studentIndex)}
                                                                    onClick={selectedCourseReport === "SP442" ? () => {
                                                                        setSelectedStudentIndex(studentIndex);
                                                                        setSelectedSP442Exam("3rd Resit");
                                                                        setSelectedStudentID(student.id);
                                                                        setShowSP442Modal(true);
                                                                    } : undefined}
                                                                    readOnly={selectedCourseReport === "SP442"}
                                                                    style={{ width: "60px" }}
                                                                    disabled
                                                                />
                                                            </td>
                                                        </>
                                                    )}
                                                    {markingData.mark2 !== "0" && (
                                                        <>
                                                            {(["RW211"].includes(selectedCourseReport) && markingData.exam2 === "Exercise") ||
                                                                (["HD221", "HD211", "SW221", "SW222", "SW223", "HN221", "NS221", "NS231", "SF221", "SS211", "HP211"].includes(selectedCourseReport) && markingData.exam2 === "Oral Test") ||
                                                                markingData.exam2 === "Mini Project" ? (
                                                                <>
                                                                    <td style={{ verticalAlign: "middle" }}>
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            max="100"
                                                                            name={`exam2_1stTest_${studentIndex}`}
                                                                            value={examMarks[studentIndex]?.exam2_1stTest || ""}
                                                                            onChange={(e) => handleExamResultChange(e, "exam2_1stTest", studentIndex)}
                                                                            style={{ width: "60px" }}
                                                                            disabled
                                                                        />
                                                                    </td>

                                                                    <td style={{ verticalAlign: "middle" }}>
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            max="100"
                                                                            name={`exam2_1stResit_${studentIndex}`}
                                                                            value={examMarks[studentIndex]?.exam2_1stResit || ""}
                                                                            onChange={(e) => handleExamResultChange(e, "exam2_1stResit", studentIndex)}
                                                                            style={{ width: "60px" }}
                                                                            disabled
                                                                        />
                                                                    </td>

                                                                    <td style={{ verticalAlign: "middle" }}>
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            max="100"
                                                                            name={`exam2_2ndResit_${studentIndex}`}
                                                                            value={examMarks[studentIndex]?.exam2_2ndResit || ""}
                                                                            onChange={(e) => handleExamResultChange(e, "exam2_2ndResit", studentIndex)}
                                                                            style={{ width: "60px" }}
                                                                            disabled
                                                                        />
                                                                    </td>

                                                                    <td style={{ verticalAlign: "middle" }}>
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            max="100"
                                                                            name={`exam2_3rdResit_${studentIndex}`}
                                                                            value={examMarks[studentIndex]?.exam2_3rdResit || ""}
                                                                            onChange={(e) => handleExamResultChange(e, "exam2_3rdResit", studentIndex)}
                                                                            style={{ width: "60px" }}
                                                                            disabled
                                                                        />
                                                                    </td>
                                                                </>
                                                            ) : (
                                                                <td style={{ verticalAlign: "middle" }}>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        max="100"
                                                                        name={`exam2_1stTest_${studentIndex}`}
                                                                        value={examMarks[studentIndex]?.exam2_1stTest || ""}
                                                                        onChange={(e) => handleExamResultChange(e, "exam2_1stTest", studentIndex)}
                                                                        style={{ width: "60px" }}
                                                                        disabled
                                                                    />
                                                                </td>
                                                            )}
                                                        </>
                                                    )}
                                                    {markingData.mark3 !== "0" && (
                                                        <>
                                                            {["Exercise", "Homework", "Presentation"].includes(markingData.exam3) ? (
                                                                <td style={{ verticalAlign: "middle" }}>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        max="100"
                                                                        name={`exam3_1stTest_${studentIndex}`}
                                                                        value={examMarks[studentIndex]?.exam3_1stTest || ""}
                                                                        onChange={(e) => handleExamResultChange(e, "exam3_1stTest", studentIndex)}
                                                                        style={{ width: "60px" }}
                                                                        disabled
                                                                    />
                                                                </td>
                                                            ) : (
                                                                /* Otherwise, show 4 columns (1st Test + 3 Resits) */
                                                                <>
                                                                    <td style={{ verticalAlign: "middle" }}>
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            max="100"
                                                                            name={`exam3_1stTest_${studentIndex}`}
                                                                            value={examMarks[studentIndex]?.exam3_1stTest || ""}
                                                                            onChange={(e) => handleExamResultChange(e, "exam3_1stTest", studentIndex)}
                                                                            style={{ width: "60px" }}
                                                                            disabled
                                                                        />
                                                                    </td>

                                                                    <td style={{ verticalAlign: "middle" }}>
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            max="100"
                                                                            name={`exam3_1stResit_${studentIndex}`}
                                                                            value={examMarks[studentIndex]?.exam3_1stResit}
                                                                            onChange={(e) => handleExamResultChange(e, "exam3_1stResit", studentIndex)}
                                                                            style={{ width: "60px" }}
                                                                            disabled
                                                                        />
                                                                    </td>

                                                                    <td style={{ verticalAlign: "middle" }}>
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            max="100"
                                                                            name={`exam3_2ndResit_${studentIndex}`}
                                                                            value={examMarks[studentIndex]?.exam3_2ndResit}
                                                                            onChange={(e) => handleExamResultChange(e, "exam3_2ndResit", studentIndex)}
                                                                            style={{ width: "60px" }}
                                                                            disabled
                                                                        />
                                                                    </td>

                                                                    <td style={{ verticalAlign: "middle" }}>
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            max="100"
                                                                            name={`exam3_3rdResit_${studentIndex}`}
                                                                            value={examMarks[studentIndex]?.exam3_3rdResit}
                                                                            onChange={(e) => handleExamResultChange(e, "exam3_3rdResit", studentIndex)}
                                                                            style={{ width: "60px" }}
                                                                            disabled
                                                                        />
                                                                    </td>
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                    {markingData.mark4 !== "0" && (
                                                        (markingData.exam4 === "Exercise" || markingData.exam4 === "Homework") ? (
                                                            <td style={{ verticalAlign: "middle" }}>
                                                                {markingData.markPractical === "Enable" ? (
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        max="100"
                                                                        name={`exam4_1stTest_${studentIndex}`}
                                                                        value={examMarks[studentIndex]?.exam4_1stTest || ""}
                                                                        onChange={(e) => handleExamResultChange(e, "exam4_1stTest", studentIndex)}
                                                                        style={{ width: "60px" }}
                                                                        disabled
                                                                    />
                                                                ) : markingData.markPractical === "Disable" ? (
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        max="100"
                                                                        name={`exam4_1stTest_${studentIndex}`}
                                                                        value={examMarks[studentIndex]?.exam4_1stTest || ""}
                                                                        onChange={(e) => handleExamResultChange(e, "exam4_1stTest", studentIndex)}
                                                                        style={{ width: "60px" }}
                                                                        disabled
                                                                    />
                                                                ) : null}
                                                            </td>
                                                        ) : (
                                                            <>
                                                                <td style={{ verticalAlign: "middle" }}>
                                                                    {markingData.markPractical === "Enable" ? (
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            max="100"
                                                                            name={`exam4_1stTest_${studentIndex}`}
                                                                            value={examMarks[studentIndex]?.exam4_1stTest || ""}
                                                                            onChange={(e) => handleExamResultChange(e, "exam4_1stTest", studentIndex)}
                                                                            style={{ width: "60px" }}
                                                                            disabled
                                                                        />
                                                                    ) : markingData.markPractical === "Disable" ? (
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            max="100"
                                                                            name={`exam4_1stTest_${studentIndex}`}
                                                                            value={examMarks[studentIndex]?.exam4_1stTest || ""}
                                                                            onChange={(e) => handleExamResultChange(e, "exam4_1stTest", studentIndex)}
                                                                            style={{ width: "60px" }}
                                                                            disabled
                                                                        />
                                                                    ) : null}
                                                                </td>

                                                                <td style={{ verticalAlign: "middle" }}>
                                                                    {markingData.markPractical === "Enable" ? (
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            max="100"
                                                                            name={`exam4_1stResit_${studentIndex}`}
                                                                            value={examMarks[studentIndex]?.exam4_1stResit}
                                                                            onChange={(e) => handleExamResultChange(e, 'exam4_1stResit', studentIndex)}
                                                                            style={{ width: '60px' }}
                                                                            disabled
                                                                        />
                                                                    ) : markingData.markPractical === "Disable" ? (
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            max="100"
                                                                            name={`exam4_1stResit_${studentIndex}`}
                                                                            value={examMarks[studentIndex]?.exam4_1stResit}
                                                                            onChange={(e) => handleExamResultChange(e, 'exam4_1stResit', studentIndex)}
                                                                            style={{ width: '60px' }}
                                                                            disabled
                                                                        />
                                                                    ) : null}
                                                                </td>

                                                                <td style={{ verticalAlign: "middle" }}>
                                                                    {markingData.markPractical === "Enable" ? (
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            max="100"
                                                                            name={`exam4_2ndResit_${studentIndex}`}
                                                                            value={examMarks[studentIndex]?.exam4_2ndResit}
                                                                            onChange={(e) => handleExamResultChange(e, 'exam4_2ndResit', studentIndex)}
                                                                            style={{ width: '60px' }}
                                                                            disabled
                                                                        />
                                                                    ) : markingData.markPractical === "Disable" ? (
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            max="100"
                                                                            name={`exam4_2ndResit_${studentIndex}`}
                                                                            value={examMarks[studentIndex]?.exam4_2ndResit}
                                                                            onChange={(e) => handleExamResultChange(e, 'exam4_2ndResit', studentIndex)}
                                                                            style={{ width: '60px' }}
                                                                            disabled
                                                                        />
                                                                    ) : null}
                                                                </td>

                                                                <td style={{ verticalAlign: "middle" }}>
                                                                    {markingData.markPractical === "Enable" ? (
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            max="100"
                                                                            name={`exam4_3rdResit_${studentIndex}`}
                                                                            value={examMarks[studentIndex]?.exam4_3rdResit}
                                                                            onChange={(e) => handleExamResultChange(e, 'exam4_3rdResit', studentIndex)}
                                                                            style={{ width: '60px' }}
                                                                            disabled
                                                                        />
                                                                    ) : markingData.markPractical === "Disable" ? (
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            max="100"
                                                                            name={`exam4_3rdResit_${studentIndex}`}
                                                                            value={examMarks[studentIndex]?.exam4_3rdResit}
                                                                            onChange={(e) => handleExamResultChange(e, 'exam4_3rdResit', studentIndex)}
                                                                            style={{ width: '60px' }}
                                                                            disabled
                                                                        />
                                                                    ) : null}
                                                                </td>
                                                            </>
                                                        )
                                                    )}
                                                    {markingData.mark5 !== "0" && (
                                                        markingData.exam5 === "Group Discussion" ? (
                                                            <td style={{ verticalAlign: "middle" }}>
                                                                {markingData.markPractical === "Enable" ? (
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        max="100"
                                                                        name={`exam5_GroupDiscussion_${studentIndex}`}
                                                                        value={examMarks[studentIndex]?.exam5_GroupDiscussion || ''}
                                                                        onChange={(e) => handleExamResultChange(e, 'exam5_GroupDiscussion', studentIndex)}
                                                                        style={{ width: '60px' }}
                                                                        disabled
                                                                    />
                                                                ) : markingData.markPractical === "Disable" ? (
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        max="100"
                                                                        name={`exam5_GroupDiscussion_${studentIndex}`}
                                                                        value={examMarks[studentIndex]?.exam5_GroupDiscussion || ''}
                                                                        onChange={(e) => handleExamResultChange(e, 'exam5_GroupDiscussion', studentIndex)}
                                                                        style={{ width: '60px' }}
                                                                        disabled
                                                                    />
                                                                ) : null}
                                                            </td>
                                                        ) : (
                                                            <>
                                                                <td style={{ verticalAlign: "middle" }}>
                                                                    {markingData.markPractical === "Enable" ? (
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            max="100"
                                                                            name={`exam5_1stTest_${studentIndex}`}
                                                                            value={examMarks[studentIndex]?.exam5_1stTest || ""}
                                                                            onChange={(e) => handleExamResultChange(e, "exam5_1stTest", studentIndex)}
                                                                            style={{ width: "60px" }}
                                                                            disabled
                                                                        />
                                                                    ) : markingData.markPractical === "Disable" ? (
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            max="100"
                                                                            name={`exam5_1stTest_${studentIndex}`}
                                                                            value={examMarks[studentIndex]?.exam5_1stTest || ""}
                                                                            onChange={(e) => handleExamResultChange(e, "exam5_1stTest", studentIndex)}
                                                                            style={{ width: "60px" }}
                                                                            disabled
                                                                        />
                                                                    ) : null}
                                                                </td>

                                                                <td style={{ verticalAlign: "middle" }}>
                                                                    {markingData.markPractical === "Enable" ? (
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            max="100"
                                                                            name={`exam5_1stResit_${studentIndex}`}
                                                                            value={examMarks[studentIndex]?.exam5_1stResit}
                                                                            onChange={(e) => handleExamResultChange(e, 'exam5_1stResit', studentIndex)}
                                                                            style={{ width: '60px' }}
                                                                            disabled
                                                                        />
                                                                    ) : markingData.markPractical === "Disable" ? (
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            max="100"
                                                                            name={`exam5_1stResit_${studentIndex}`}
                                                                            value={examMarks[studentIndex]?.exam5_1stResit}
                                                                            onChange={(e) => handleExamResultChange(e, 'exam5_1stResit', studentIndex)}
                                                                            style={{ width: '60px' }}
                                                                            disabled
                                                                        />
                                                                    ) : null}
                                                                </td>

                                                                <td style={{ verticalAlign: "middle" }}>
                                                                    {markingData.markPractical === "Enable" ? (
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            max="100"
                                                                            name={`exam5_2ndResit_${studentIndex}`}
                                                                            value={examMarks[studentIndex]?.exam5_2ndResit}
                                                                            onChange={(e) => handleExamResultChange(e, 'exam5_2ndResit', studentIndex)}
                                                                            style={{ width: '60px' }}
                                                                            disabled
                                                                        />
                                                                    ) : markingData.markPractical === "Disable" ? (
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            max="100"
                                                                            name={`exam5_2ndResit_${studentIndex}`}
                                                                            value={examMarks[studentIndex]?.exam5_2ndResit}
                                                                            onChange={(e) => handleExamResultChange(e, 'exam5_2ndResit', studentIndex)}
                                                                            style={{ width: '60px' }}
                                                                            disabled
                                                                        />
                                                                    ) : null}
                                                                </td>

                                                                <td style={{ verticalAlign: "middle" }}>
                                                                    {markingData.markPractical === "Enable" ? (
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            max="100"
                                                                            name={`exam5_3rdResit_${studentIndex}`}
                                                                            value={examMarks[studentIndex]?.exam5_3rdResit}
                                                                            onChange={(e) => handleExamResultChange(e, 'exam5_3rdResit', studentIndex)}
                                                                            style={{ width: '60px' }}
                                                                            disabled
                                                                        />
                                                                    ) : markingData.markPractical === "Disable" ? (
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            max="100"
                                                                            name={`exam5_3rdResit_${studentIndex}`}
                                                                            value={examMarks[studentIndex]?.exam5_3rdResit}
                                                                            onChange={(e) => handleExamResultChange(e, 'exam5_3rdResit', studentIndex)}
                                                                            style={{ width: '60px' }}
                                                                            disabled
                                                                        />
                                                                    ) : null}
                                                                </td>
                                                            </>
                                                        )
                                                    )}
                                                    {/* Calculate totals */}
                                                    <td style={{ verticalAlign: "middle" }}>
                                                        {(
                                                            (examMarks[studentIndex]?.exam1_1stTest ? parseFloat(examMarks[studentIndex]?.exam1_1stTest) : 0) +
                                                            (examMarks[studentIndex]?.exam2_1stTest ? parseFloat(examMarks[studentIndex]?.exam2_1stTest) : 0) +
                                                            (examMarks[studentIndex]?.exam3_1stTest ? parseFloat(examMarks[studentIndex]?.exam3_1stTest) : 0) +
                                                            (examMarks[studentIndex]?.exam4_1stTest ? parseFloat(examMarks[studentIndex]?.exam4_1stTest) : 0) +
                                                            (examMarks[studentIndex]?.exam5_1stTest ? parseFloat(examMarks[studentIndex]?.exam5_1stTest) : 0) +
                                                            (examMarks[studentIndex]?.exam5_GroupDiscussion && (
                                                                examMarks[studentIndex]?.exam1_1stTest ||
                                                                examMarks[studentIndex]?.exam2_1stTest ||
                                                                examMarks[studentIndex]?.exam3_1stTest ||
                                                                examMarks[studentIndex]?.exam4_1stTest ||
                                                                examMarks[studentIndex]?.exam5_1stTest
                                                            ) ? parseFloat(examMarks[studentIndex]?.exam5_GroupDiscussion) : 0)
                                                        ).toFixed(2) + '%'}
                                                    </td>
                                                    <td style={{ verticalAlign: "middle" }}>
                                                        {(
                                                            // Check if exam2_1stResit is present
                                                            (examMarks[studentIndex]?.exam1_1stResit ? (
                                                                // Sum up the 1st Resit marks
                                                                (examMarks[studentIndex]?.exam1_1stResit ? parseFloat(examMarks[studentIndex]?.exam1_1stResit) : 0) +
                                                                (examMarks[studentIndex]?.exam2_1stResit ? parseFloat(examMarks[studentIndex]?.exam2_1stResit) : 0) +
                                                                (examMarks[studentIndex]?.exam3_1stResit ? parseFloat(examMarks[studentIndex]?.exam3_1stResit) : 0) +
                                                                (examMarks[studentIndex]?.exam4_1stResit ? parseFloat(examMarks[studentIndex]?.exam4_1stResit) : 0) +
                                                                (examMarks[studentIndex]?.exam5_1stResit ? parseFloat(examMarks[studentIndex]?.exam5_1stResit) : 0) +
                                                                (examMarks[studentIndex]?.exam5_GroupDiscussion && (
                                                                    examMarks[studentIndex]?.exam1_1stResit ||
                                                                    examMarks[studentIndex]?.exam2_1stResit ||
                                                                    examMarks[studentIndex]?.exam3_1stResit ||
                                                                    examMarks[studentIndex]?.exam4_1stResit ||
                                                                    examMarks[studentIndex]?.exam5_1stResit
                                                                ) ? parseFloat(examMarks[studentIndex]?.exam5_GroupDiscussion) : 0) +
                                                                (markingData.mark2 && (markingData.exam2 === "Exercise" || markingData.exam2 === "Homework"
                                                                    || markingData.exam3 === "Exercise" || markingData.exam3 === "Homework" ||
                                                                    markingData.exam4 === "Exercise" || markingData.exam4 === "Homework") ? (
                                                                    (examMarks[studentIndex]?.exam2_1stTest ? parseFloat(examMarks[studentIndex]?.exam2_1stTest) : 0) +
                                                                    (examMarks[studentIndex]?.exam3_1stTest ? parseFloat(examMarks[studentIndex]?.exam3_1stTest) : 0) +
                                                                    (examMarks[studentIndex]?.exam4_1stTest ? parseFloat(examMarks[studentIndex]?.exam4_1stTest) : 0)
                                                                ) : 0)
                                                            ) : 0)
                                                        ).toFixed(2) + '%'}
                                                    </td>
                                                    <td style={{ verticalAlign: "middle" }}>
                                                        {(
                                                            (examMarks[studentIndex]?.exam1_2ndResit ? (
                                                                (examMarks[studentIndex]?.exam1_2ndResit ? parseFloat(examMarks[studentIndex]?.exam1_2ndResit) : 0) +
                                                                (examMarks[studentIndex]?.exam2_2ndResit ? parseFloat(examMarks[studentIndex]?.exam2_2ndResit) : 0) +
                                                                (examMarks[studentIndex]?.exam3_2ndResit ? parseFloat(examMarks[studentIndex]?.exam3_2ndResit) : 0) +
                                                                (examMarks[studentIndex]?.exam4_2ndResit ? parseFloat(examMarks[studentIndex]?.exam4_2ndResit) : 0) +
                                                                (examMarks[studentIndex]?.exam5_2ndResit ? parseFloat(examMarks[studentIndex]?.exam5_2ndResit) : 0) +
                                                                (examMarks[studentIndex]?.exam5_GroupDiscussion && (
                                                                    examMarks[studentIndex]?.exam1_2ndResit ||
                                                                    examMarks[studentIndex]?.exam2_2ndResit ||
                                                                    examMarks[studentIndex]?.exam3_2ndResit ||
                                                                    examMarks[studentIndex]?.exam4_2ndResit ||
                                                                    examMarks[studentIndex]?.exam5_2ndResit
                                                                ) ? parseFloat(examMarks[studentIndex]?.exam5_GroupDiscussion) : 0) +
                                                                (markingData.mark2 && (markingData.exam2 === "Exercise" || markingData.exam2 === "Homework"
                                                                    || markingData.exam3 === "Exercise" || markingData.exam3 === "Homework" ||
                                                                    markingData.exam4 === "Exercise" || markingData.exam4 === "Homework") ? (
                                                                    (examMarks[studentIndex]?.exam2_1stTest ? parseFloat(examMarks[studentIndex]?.exam2_1stTest) : 0) +
                                                                    (examMarks[studentIndex]?.exam3_1stTest ? parseFloat(examMarks[studentIndex]?.exam3_1stTest) : 0) +
                                                                    (examMarks[studentIndex]?.exam4_1stTest ? parseFloat(examMarks[studentIndex]?.exam4_1stTest) : 0)
                                                                ) : 0)
                                                            ) : 0)
                                                        ).toFixed(2) + '%'}
                                                    </td>
                                                    <td style={{ verticalAlign: "middle" }}>
                                                        {(
                                                            (examMarks[studentIndex]?.exam1_3rdResit ? (
                                                                (examMarks[studentIndex]?.exam1_3rdResit ? parseFloat(examMarks[studentIndex]?.exam1_3rdResit) : 0) +
                                                                (examMarks[studentIndex]?.exam2_3rdResit ? parseFloat(examMarks[studentIndex]?.exam2_3rdResit) : 0) +
                                                                (examMarks[studentIndex]?.exam3_3rdResit ? parseFloat(examMarks[studentIndex]?.exam3_3rdResit) : 0) +
                                                                (examMarks[studentIndex]?.exam4_3rdResit ? parseFloat(examMarks[studentIndex]?.exam4_3rdResit) : 0) +
                                                                (examMarks[studentIndex]?.exam5_3rdResit ? parseFloat(examMarks[studentIndex]?.exam5_3rdResit) : 0) +
                                                                (examMarks[studentIndex]?.exam5_GroupDiscussion && (
                                                                    examMarks[studentIndex]?.exam1_3rdResit ||
                                                                    examMarks[studentIndex]?.exam2_3rdResit ||
                                                                    examMarks[studentIndex]?.exam3_3rdResit ||
                                                                    examMarks[studentIndex]?.exam4_3rdResit ||
                                                                    examMarks[studentIndex]?.exam5_3rdResit
                                                                ) ? parseFloat(examMarks[studentIndex]?.exam5_GroupDiscussion) : 0) +
                                                                (markingData.mark2 && (markingData.exam2 === "Exercise" || markingData.exam2 === "Homework"
                                                                    || markingData.exam3 === "Exercise" || markingData.exam3 === "Homework" ||
                                                                    markingData.exam4 === "Exercise" || markingData.exam4 === "Homework") ? (
                                                                    (examMarks[studentIndex]?.exam2_1stTest ? parseFloat(examMarks[studentIndex]?.exam2_1stTest) : 0) +
                                                                    (examMarks[studentIndex]?.exam3_1stTest ? parseFloat(examMarks[studentIndex]?.exam3_1stTest) : 0) +
                                                                    (examMarks[studentIndex]?.exam4_1stTest ? parseFloat(examMarks[studentIndex]?.exam4_1stTest) : 0)
                                                                ) : 0)
                                                            ) : 0)
                                                        ).toFixed(2) + '%'}
                                                    </td>
                                                    {/* Final Report */}
                                                    <React.Fragment key={studentIndex}>
                                                        {(() => {
                                                            const isPassing = (mark, testScore) =>
                                                                testScore !== undefined &&
                                                                testScore !== null &&
                                                                parseFloat(testScore) >= (mark / 2);

                                                            const failedPractical =
                                                                markingData.markPractical === "Enable" &&
                                                                (practicalCompetency[studentIndex] === "Incompetent" || practicalCompetency[studentIndex] === "");

                                                            const failedFirstTest =
                                                                !isPassing(markingData.mark1, examMarks[studentIndex]?.exam1_1stTest) ||
                                                                !isPassing(markingData.mark2, examMarks[studentIndex]?.exam2_1stTest) ||
                                                                !isPassing(markingData.mark3, examMarks[studentIndex]?.exam3_1stTest) ||
                                                                !isPassing(markingData.mark4, examMarks[studentIndex]?.exam4_1stTest);

                                                            const passesResit =
                                                                isPassing(markingData.mark1, examMarks[studentIndex]?.exam1_1stResit) ||
                                                                isPassing(markingData.mark2, examMarks[studentIndex]?.exam2_1stResit) ||
                                                                isPassing(markingData.mark3, examMarks[studentIndex]?.exam3_1stResit) ||
                                                                isPassing(markingData.mark4, examMarks[studentIndex]?.exam4_1stResit) ||
                                                                isPassing(markingData.mark1, examMarks[studentIndex]?.exam1_2ndResit) ||
                                                                isPassing(markingData.mark2, examMarks[studentIndex]?.exam2_2ndResit) ||
                                                                isPassing(markingData.mark3, examMarks[studentIndex]?.exam3_2ndResit) ||
                                                                isPassing(markingData.mark4, examMarks[studentIndex]?.exam4_2ndResit) ||
                                                                isPassing(markingData.mark1, examMarks[studentIndex]?.exam1_3rdResit) ||
                                                                isPassing(markingData.mark2, examMarks[studentIndex]?.exam2_3rdResit) ||
                                                                isPassing(markingData.mark3, examMarks[studentIndex]?.exam3_3rdResit) ||
                                                                isPassing(markingData.mark4, examMarks[studentIndex]?.exam4_3rdResit);

                                                            const isPass = !failedPractical && (!failedFirstTest || passesResit);

                                                            const totalScore = (
                                                                (parseFloat(examMarks[studentIndex]?.exam1_1stTest) || 0) +
                                                                (parseFloat(examMarks[studentIndex]?.exam2_1stTest) || 0) +
                                                                (parseFloat(examMarks[studentIndex]?.exam3_1stTest) || 0) +
                                                                (parseFloat(examMarks[studentIndex]?.exam4_1stTest) || 0) +
                                                                (parseFloat(examMarks[studentIndex]?.exam5_GroupDiscussion) || 0)
                                                            ).toFixed(2);

                                                            const getGrade = (score) => {
                                                                if (score >= 90) return "A+";
                                                                if (score >= 85) return "A";
                                                                if (score >= 80) return "A-";
                                                                if (score >= 75) return "B+";
                                                                if (score >= 70) return "B";
                                                                if (score >= 65) return "B-";
                                                                if (score >= 60) return "C+";
                                                                if (score >= 55) return "C";
                                                                if (score >= 50) return "C-";
                                                                return "F";
                                                            };

                                                            const finalGrade = getGrade(parseFloat(totalScore));

                                                            return (
                                                                <>
                                                                    {/* Final Result */}
                                                                    <td
                                                                        style={{
                                                                            color: !isPass || result?.examTotalScore === "Fail"
                                                                                ? "red"
                                                                                : result?.examTotalScore === "N/A"
                                                                                    ? "black"
                                                                                    : "black",
                                                                            verticalAlign: "middle",
                                                                        }}
                                                                    >
                                                                        {isPass ? (passesResit ? "Pass" : `${totalScore}`) : "Fail"}
                                                                    </td>

                                                                    {/* Final Grade */}
                                                                    <td
                                                                        style={{
                                                                            color: !isPass || result?.examTotalGrade === "F"
                                                                                ? "red"
                                                                                : result?.examTotalGrade === "N/A"
                                                                                    ? "black"
                                                                                    : "black",
                                                                            verticalAlign: "middle",
                                                                        }}
                                                                    >
                                                                        {isPass ? (passesResit ? "P" : finalGrade) : "F"}
                                                                    </td>
                                                                </>
                                                            );
                                                        })()}
                                                    </React.Fragment>
                                                    {/* Button */}
                                                    <td style={{ verticalAlign: "middle", whiteSpace: "nowrap" }}>
                                                        <button
                                                            id='btnFontIcon'
                                                            className="btn btn-success"
                                                            title='Download'
                                                            onClick={() => handleDownloadClick("download", selectedEnrollDate, selectedCourseReport, markingData.markPractical, student.name, student.id, student.intake, practicalCompetency[studentIndex], selectedStdAtdEligibility, Object.values(markingData).slice(0, 5), examMarks[studentIndex])}
                                                            style={{ fontSize: '10px', marginRight: "4px" }}
                                                        >
                                                            <FontAwesomeIcon icon={faDownload} />
                                                        </button>
                                                        <button
                                                            id='btnFontIcon'
                                                            className="btn btn-primary"
                                                            title='View'
                                                            onClick={() => handleDownloadClick("view", selectedEnrollDate, selectedCourseReport, markingData.markPractical, student.name, student.id, student.intake, practicalCompetency[studentIndex], selectedStdAtdEligibility, Object.values(markingData).slice(0, 5), examMarks[studentIndex])}
                                                            style={{ fontSize: '10px', marginRight: "4px" }}
                                                        >
                                                            <FontAwesomeIcon icon={faEye} />
                                                        </button>
                                                        {showProjectFields && (
                                                            <button
                                                                id='btnFontIcon'
                                                                className="btn btn-secondary"
                                                                title='Project Info'
                                                                style={{ fontSize: "10px" }}
                                                                onClick={() => handleProject(student.name, student.id)}
                                                            >
                                                                <FontAwesomeIcon icon={faEye} />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            </div>
                        </Modal.Body>
                    </Modal>

                    {/* Project Info */}
                    <Modal show={editShow4} onHide={() => setEditShow4(false)} backdrop="static" keyboard={false} enforceFocus={true}>
                        <Modal.Header closeButton>
                            <Modal.Title style={{ color: '#151632' }}>View Project Info</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div>
                                <Form>
                                    <Form.Group>
                                        <Form.Label style={{ color: "black" }}>Project Title</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter Project Title"
                                            value={selectedProjectTitle}
                                            readOnly
                                            onChange={(e) => setSelectedProjectTitle(e.target.value)}
                                        />
                                    </Form.Group>
                                    <br></br>
                                    <Form.Group>
                                        <Form.Label style={{ color: "black" }}>Project Description</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            maxLength={maxLength}
                                            placeholder="Enter Project Description"
                                            value={selectedProjectDescription}
                                            readOnly
                                            onChange={handleDescriptionChange}
                                        />
                                        <small style={{ color: selectedProjectDescription.length >= maxLength ? "red" : "black" }}>
                                            {selectedProjectDescription.length} / {maxLength} characters
                                        </small>
                                    </Form.Group>
                                </Form>
                            </div>
                        </Modal.Body>
                    </Modal>
                </div>
            </div>
        </div>
    );
}