import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from "axios";
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRefresh, faEye, faTrophy, faUsers, faStar, faDownload, faPen, faCalendar, faTrash, faChevronUp, faChevronDown, faEraser, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Button, Modal, Table, Form, Row, Col, ProgressBar, Dropdown } from 'react-bootstrap';
import Sidebar from "../global/Sidebar";
import SidebarEmployee from "../global/SidebarEmployee";
import Topbar from "../global/Topbar";
import TopbarEmployee from '../global/TopbarEmployee';
import Cookies from 'js-cookie';
import { jsPDF } from "jspdf";
import NotoSansCJK from "./NotoSansCJK.js";
import NotoSansCJKBold from "./NotoSansCJKBold.js";
import sbitLogo from '../../images/sbitLogo.png';
import { adminLocalhost } from '../../localhost/adminLocalhost';
import { employeeLocalhost } from '../../localhost/employeeLocalhost';
import { studentLocalhost } from '../../localhost/studentLocalhost';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import JSZip from "jszip";

export default function ExamResult() {

    const [sp442Data, setSp442Data] = useState({
        format: "",
        problemGoals: "",
        planning: "",
        approach: "",
        outcome: "",
        reflection: ""
    });

    const [FYPData, setFYPData] = useState({
        proposal: [],
        implementation: [],
        presentation: []
    });

    const [data, setData] = useState([]);
    const [data3, setData3] = useState([]);
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
    const [preparedBy, setPreparedBy] = useState(Cookies.get('employeeName') || '');
    const [datePrepared, setDatePrepared] = useState('');
    const [preparedByGlobal, setPreparedByGlobal] = useState([]);
    const [datePreparedGlobal, setDatePreparedGlobal] = useState([]);
    const [allStdAtdEligibility, setAllStdAtdEligibility] = useState([]);
    const [singleStdAtdEligibility, setSingleStdAtdEligibility] = useState("N/A");
    const [expandedSemesters, setExpandedSemesters] = useState({});
    const [expandedPrograms, setExpandedPrograms] = useState({});
    const [selectedProgram, setSelectedProgram] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [showSP442Modal, setShowSP442Modal] = useState(false);
    const [showProposalModal, setShowProposalModal] = useState(false);
    const [showImplementationModal, setShowImplementationModal] = useState(false);
    const [showPresentationModal, setShowPresentationModal] = useState(false);
    const [selectedStudentIndex, setSelectedStudentIndex] = useState(null);
    const [selectedSP442Exam, setSelectedSP442Exam] = useState('');
    const [selectedStudentID, setSelectedStudentID] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const role = Cookies.get("sisRole");
    const navigate = useNavigate();
    const employeeJobTitle = Cookies.get('employeeJobTitle');
    const jobTitle = Cookies.get('employeeJobTitle') || Cookies.get('sisJobTitle');
    const query = new URLSearchParams(useLocation().search);
    const studentID = query.get('studentID');
    const [showRankModal, setShowRankModal] = useState(false);
    const [rankedResults, setRankedResults] = useState([]);

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
            setPracticalCompetency(selectedStudentNameList.map(student => resultMap[student.id]?.practicalCompetency || ""));

        } catch (error) {
            console.error("Error fetching exam results:", error);
        }
    };

    // Call fetchExamResults inside useEffect
    useEffect(() => {
        if (selectedEnrollDate && selectedCourseReport && selectedMarkingTemplate && selectedStudentNameList.length > 0) {
            fetchExamResults();
        }
    }, [selectedEnrollDate, selectedCourseReport, selectedMarkingTemplate, selectedStudentNameList]);

    const fetchExamResults1 = async () => {
        try {
            const response = await axios.get(`${employeeLocalhost}/examResult/getExamResultDetails/${selectedEnrollDate}/${selectedCourseReport}/${selectedMarkingTemplate}`);
            setResult(response.data);
        } catch (error) {
            console.error("Error fetching selected results:", error);
        }
    };

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
                const response = await axios.get(`${employeeLocalhost}/marking/getMarkPractical/${selectedCourseReport}/${selectedProgram}/${selectedMarkingTemplate}`);
                setMarkPractice(response.data[0]);

            } catch (error) {
                console.error('Error fetching mark practice results:', error);
            }
        };

        fetchExamResults();
    }, [selectedEnrollDate, selectedCourseReport, selectedMarkingTemplate, selectedProgram]);

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
                        id: response.data[0].id || "",
                        approach: response.data[0].approach || "",
                        format: response.data[0].format || "",
                        outcome: response.data[0].outcome || "",
                        planning: response.data[0].planning || "",
                        problemGoals: response.data[0].problem || "",
                        reflection: response.data[0].reflection || ""
                    });
                } else {
                    setSp442Data({
                        approach: "",
                        format: "",
                        outcome: "",
                        planning: "",
                        problemGoals: "",
                        reflection: ""
                    });
                }
            } catch (error) {
                console.error("Error fetching all report details:", error);
            }
        };

        fetchReports();
    }, [selectedEnrollDate, selectedSP442Exam, selectedStudentID]);

    //Proposal fetch data
    useEffect(() => {
        if (!selectedEnrollDate || !selectedSP442Exam || !selectedStudentID) return;

        const fetchReports = async () => {
            try {
                const response = await axios.get(`${employeeLocalhost}/fyp/getAllReportDetails/${selectedEnrollDate}/${selectedSP442Exam}/${selectedStudentID}`);

                if (response.data && response.data.length > 0) {
                    setFYPData({
                        proposal: response.data[0].proposal ? response.data[0].proposal.split(",").map(Number) : [],
                        implementation: response.data[0].implementation ? response.data[0].implementation.split(",").map(Number) : [],
                        presentation: response.data[0].presentation ? response.data[0].presentation.split(",").map(Number) : []
                    });
                } else {
                    setFYPData({
                        proposal: [],
                        implementation: [],
                        presentation: []
                    });
                }
            } catch (error) {
                console.error("Error fetching all fyp details:", error);
            }
        };

        fetchReports();
    }, [selectedEnrollDate, selectedSP442Exam, selectedStudentID]);

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

    const handleButtonClick = async (item, program, semester) => {
        const markPrefix = item.markTemplate?.split('-')[0]?.toUpperCase();
        const programPrefix = program?.toUpperCase();

        if (markPrefix !== programPrefix) {
            Swal.fire({
                position: 'top-end',
                icon: 'warning',
                title: 'Incorrect marking template.',
                text: 'Please contact the Course Coordinator to verify the correct template. This may prevent data from being saved to the database.',
                showConfirmButton: false,
                timer: 3000
            });
            return;
        }
        try {
            handleOverallClick(item.enrollDate, item.courseCode, item.markTemplate);
            setSelectedEnrollDate(item.enrollDate);
            setSelectedCourseReport(item.courseCode);
            setSelectedCourseName(item.courseName);
            setSelectedMarkingTemplate(item.markTemplate);
            setSelectedSemester(semester);
            setSelectedProgram(program);

            const attendanceResponse = await axios.get(
                `${employeeLocalhost}/attendance/getAttendanceDetails1/${item.enrollDate}/${item.courseCode}`
            );
            setAttendanceData(attendanceResponse.data);

            const namesResponse = await axios.get(
                `${adminLocalhost}/class/studentNames/${item.enrollDate}/${item.courseCode}`
            );
            const namesArray = namesResponse.data[0].split(',').map((name) => name.trim());
            const idsArray = namesResponse.data[1].split(',').map((id) => id.trim());
            const intakesArray = namesResponse.data[2].split(',').map((intake) => intake.trim());

            let combinedArray = [];

            if (employeeJobTitle === 'Course Counsellor') {
                const studentIndex = idsArray.indexOf(studentID);
                if (studentIndex !== -1) {
                    combinedArray = [{
                        name: namesArray[studentIndex],
                        id: idsArray[studentIndex],
                        intake: intakesArray[studentIndex],
                    }];
                } else {
                    console.warn(`Student with ID ${studentID} not found`);
                    combinedArray = [];
                }
            } else {
                combinedArray = namesArray.map((name, index) => ({
                    name,
                    id: idsArray[index],
                    intake: intakesArray[index],
                })).sort((a, b) => a.name.localeCompare(b.name));
            }

            setStudentNameList(combinedArray);

            const markingResponse = await axios.get(
                `${employeeLocalhost}/marking/getMarkingByCourseCodeAndTemplate/${item.courseCode}/${item.markTemplate}`
            );
            if (markingResponse.data.length > 0) {
                setMarkingData(markingResponse.data[0]);
            }

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

            if (employeeJobTitle === 'Course Counsellor') {
                const getStudentAttendanceEligible = await axios.get(
                    `${employeeLocalhost}/attendanceEligible/getAttendanceEligiblePercentage/${item.enrollDate}/${studentID}`
                );
                const eligibleData = getStudentAttendanceEligible.data[0];
                setSingleStdAtdEligibility(eligibleData ? `${eligibleData.eligiblePercentage}%` : "N/A");
                setAllStdAtdEligibility([]);
            } else {
                const filteredAttendanceResponse = await axios.get(
                    `${employeeLocalhost}/attendanceEligible/getAttendanceEligibleDetails1/${item.enrollDate}`
                );
                const eligibilityMap = {};
                filteredAttendanceResponse.data.forEach((record) => {
                    eligibilityMap[record.eligibleStudentID] = `${record.eligiblePercentage}%`;
                });

                setAllStdAtdEligibility(eligibilityMap);
                setSingleStdAtdEligibility("N/A");
            }

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

    const handleSaveAttendance = async (attendanceData, selectedCourseReport, selectedEnrollDate, selectedMarkingTemplate, selectedCourseName, competentOrIncompetent, ennableOrDisable, selectedProgram) => {
        try {
            for (const data of attendanceData) {
                const foundResult = examResults.find(result =>
                    result.examEnrollDate === selectedEnrollDate &&
                    result.examCourseCode === selectedCourseReport &&
                    result.examMarkingTemplate === selectedMarkingTemplate &&
                    result.examStdName === data.examStdName
                );

                let examTotalScore = "Fail";
                let examTotalGrade = "F";

                // Thresholds
                const markThresholds = {
                    exam1: (markingData.mark1 || 0) / 2,
                    exam2: (markingData.mark2 || 0) / 2,
                    exam3: (markingData.mark3 || 0) / 2,
                    exam4: (markingData.mark4 || 0) / 2,
                };

                // Helper
                const getVal = (key) => parseFloat(data[key]) || 0;

                const checkExam = (examKey) => {
                    const t = getVal(`${examKey}_1stTest`);
                    const r1 = getVal(`${examKey}_1stResit`);
                    const r2 = getVal(`${examKey}_2ndResit`);
                    const r3 = getVal(`${examKey}_3rdResit`);
                    const threshold = markThresholds[examKey];

                    if (t >= threshold) return "original";
                    if (r1 >= threshold || r2 >= threshold || r3 >= threshold) return "resit";
                    return "fail";
                };

                const competencyOnlyCourses = ["IT241", "IT411", "SS415"];

                if (competencyOnlyCourses.includes(selectedCourseReport)) {
                    if (data.practicalCompetency === "Competent") {
                        examTotalScore = "Pass";
                        examTotalGrade = "P";
                    } else {
                        examTotalScore = "Fail";
                        examTotalGrade = "F";
                    }
                } else {
                    const res1 = checkExam("exam1");
                    const res2 = checkExam("exam2");
                    const res3 = checkExam("exam3");
                    const res4 = checkExam("exam4");

                    if ([res1, res2, res3, res4].includes("resit")) {
                        examTotalScore = "Pass";
                        examTotalGrade = "P";
                    } else if ([res1, res2, res3, res4].every(r => r === "original")) {
                        const total = (
                            getVal("exam1_1stTest") +
                            getVal("exam2_1stTest") +
                            getVal("exam3_1stTest") +
                            getVal("exam4_1stTest") +
                            getVal("exam5_GroupDiscussion")
                        );
                        examTotalScore = total.toFixed(1);
                        examTotalGrade = calculateGrade(total);
                    } else {
                        examTotalScore = "Fail";
                        examTotalGrade = "F";
                    }

                    if (data.practicalCompetency === "Incompetent") {
                        examTotalScore = "Fail";
                        examTotalGrade = "F";
                    }
                }

                // Insert or update the result
                if (!foundResult) {
                    if (ennableOrDisable == "Enable") {
                        await axios.post(`${employeeLocalhost}/examResult/addExamResult`, {
                            ...data,
                            examMarkingTemplate: selectedMarkingTemplate,
                            examCourseCode: selectedCourseReport,
                            examEnrollDate: selectedEnrollDate,
                            examCourseName: selectedCourseName,
                            examTotalScore: examTotalScore,
                            examProgram: selectedProgram,
                            examTotalGrade: examTotalGrade,
                            examProjectTitle: selectedProjectTitle,
                            examProjectDescription: selectedProjectDescription,
                            examTeacher: Cookies.get("employeeUsername"),
                            practicalCompetency: competentOrIncompetent.find((value, index) => data.examStdID === selectedStudentNameList[index].id) || ""
                        });
                    }
                    else if (ennableOrDisable == "Disable") {
                        await axios.post(`${employeeLocalhost}/examResult/addExamResult`, {
                            ...data,
                            examMarkingTemplate: selectedMarkingTemplate,
                            examCourseCode: selectedCourseReport,
                            examEnrollDate: selectedEnrollDate,
                            examCourseName: selectedCourseName,
                            examProgram: selectedProgram,
                            examTotalScore: examTotalScore,
                            examTotalGrade: examTotalGrade,
                            examProjectTitle: selectedProjectTitle,
                            examProjectDescription: selectedProjectDescription,
                            examTeacher: Cookies.get("employeeUsername")
                        });
                    }
                } else {
                    if (ennableOrDisable == "Enable") {
                        await axios.put(`${employeeLocalhost}/examResult/updateExamResult/${foundResult.id}`, {
                            ...data,
                            examMarkingTemplate: selectedMarkingTemplate,
                            examCourseCode: selectedCourseReport,
                            examEnrollDate: selectedEnrollDate,
                            examCourseName: selectedCourseName,
                            examProgram: selectedProgram,
                            examTotalScore: examTotalScore,
                            examTotalGrade: examTotalGrade,
                            examProjectTitle: selectedProjectTitle,
                            examProjectDescription: selectedProjectDescription,
                            examTeacher: Cookies.get("employeeUsername"),
                            practicalCompetency: competentOrIncompetent.find((value, index) => data.examStdID === selectedStudentNameList[index].id) || ""
                        });
                    }
                    else if (ennableOrDisable == "Disable") {
                        await axios.put(`${employeeLocalhost}/examResult/updateExamResult/${foundResult.id}`, {
                            ...data,
                            examMarkingTemplate: selectedMarkingTemplate,
                            examCourseCode: selectedCourseReport,
                            examEnrollDate: selectedEnrollDate,
                            examCourseName: selectedCourseName,
                            examProgram: selectedProgram,
                            examTotalScore: examTotalScore,
                            examTotalGrade: examTotalGrade,
                            examProjectTitle: selectedProjectTitle,
                            examTeacher: Cookies.get("employeeUsername"),
                            examProjectDescription: selectedProjectDescription
                        });
                    }
                }
            }

            Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: 'Exam Results saved successfully!',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                fetchExamResults();
                fetchExamResults1();
            });

        } catch (error) {
            console.error('Error occurred while saving exam results:', error);
        }
    };

    const saveAttendance = (selectedCourseReport, selectedEnrollDate, selectedMarkingTemplate, selectedCourseName, competentOrIncompetent, ennableOrDisable, selectedProgram) => {
        const attendanceData = selectedStudentNameList.map((student, studentIndex) => {
            const studentData = {
                examStdName: student.name,
                examStdID: student.id,
                examStdIntake: student.intake,
                practicalCompetency: practicalCompetency[studentIndex],
            };

            // Set exam5_GroupDiscussion once before the loop
            if (!studentData[`exam5_GroupDiscussion`]) {
                studentData[`exam5_GroupDiscussion`] = examMarks[studentIndex]?.[`exam5_GroupDiscussion`] || "";
            }

            // Convert to number for proper comparison
            const groupDiscussionValue = parseFloat(studentData[`exam5_GroupDiscussion`]);

            for (let i = 1; i <= 5; i++) {
                if (markingData[`mark${i}`] !== "0") {
                    // If exam5_GroupDiscussion is greater than 0, ignore exam5 fields
                    if (!(groupDiscussionValue > 0 && i === 5)) {
                        studentData[`exam${i}_1stTest`] = examMarks[studentIndex]?.[`exam${i}_1stTest`] || "";
                        studentData[`exam${i}_1stResit`] = examMarks[studentIndex]?.[`exam${i}_1stResit`] ?? "";
                        studentData[`exam${i}_2ndResit`] = examMarks[studentIndex]?.[`exam${i}_2ndResit`] ?? "";
                        studentData[`exam${i}_3rdResit`] = examMarks[studentIndex]?.[`exam${i}_3rdResit`] ?? "";
                    }
                }
            }

            return studentData;
        });

        handleSaveAttendance(attendanceData, selectedCourseReport, selectedEnrollDate, selectedMarkingTemplate, selectedCourseName, competentOrIncompetent, ennableOrDisable, selectedProgram);

    };

    const calculateGrade = (_1stTest) => {
        if (_1stTest >= 90) return "A+";
        if (_1stTest >= 85) return "A";
        if (_1stTest >= 80) return "A-";
        if (_1stTest >= 75) return "B+";
        if (_1stTest >= 70) return "B";
        if (_1stTest >= 65) return "B-";
        if (_1stTest >= 60) return "C+";
        if (_1stTest >= 55) return "C";
        return "C-";
    };

    const handleDownloadClick = async (mode = 'download', ignoreZeroMark, enrollDate, courseCode, markPractice, preparedByGlobal, datePreparedGlobal, name, id, intake, practicalCompetency, attendanceEligibleStatus) => {

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

                if (selectedCourseReport !== "IT241" && selectedCourseReport !== "IT411" && selectedCourseReport !== "SS415") {
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
                    //console.log(teacherResponse);
                    //const teacherUsername = teacherResponse.data[0] || 'N/A';
                    let teacherUsername = 'N/A';
                    if (teacherResponse.data && teacherResponse.data.length > 0) {
                        const rawData = teacherResponse.data[0];

                        teacherUsername = rawData.split(',')[0] || 'N/A';
                    }

                    const teacherFullNameResponse = await axios.get(`${employeeLocalhost}/employee/employee-info/${teacherUsername}`);
                    const teacherFullName = teacherFullNameResponse.data[0][5] || 'N/A';
                    doc.setFontSize(9);
                    doc.text(`Trainer (导师)             :      ${teacherFullName}`, 20, 78);

                } catch (error) {
                    console.error('Error fetching teacher name:', error);
                    //doc.text(`Trainer (导师)             :      N/A`, 20, 78); 
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
                if (selectedCourseReport !== "IT241" && selectedCourseReport !== "IT411" && selectedCourseReport !== "SS415") {
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
                if (selectedCourseReport !== "IT241" && selectedCourseReport !== "IT411" && selectedCourseReport !== "SS415") {
                    for (let i = 1; i <= 5; i++) {
                        const mark = markingData[`mark${i}`];
                        if (mark !== "0" && mark !== undefined) {
                            doc.text(`${markingData[`mark${i}`]}%`, 65, x);
                            x += 6;
                        }
                    }
                }

                // Show key in marks for 1stTest, 1stResist, 2ndResit, 3rdResit, GroupDiscussion
                if (selectedCourseReport !== "IT241" && selectedCourseReport !== "IT411" && selectedCourseReport !== "SS415") {

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

                            if (mark !== undefined && mark !== "" && (ignoreZeroMark || parseFloat(mark) !== 0)) { // && parseFloat(mark) !== 0 -> Don't remove this. If you remove, Group Discussion marks show 0 even got value in database
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

                    if (selectedCourseReport !== "IT241" && selectedCourseReport !== "IT411" && selectedCourseReport !== "SS415") {
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
                    else if (selectedCourseReport === "IT241" || selectedCourseReport === "IT411" && selectedCourseReport !== "SS415") {
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
                    if (selectedCourseReport !== "IT241" && selectedCourseReport !== "IT411" && selectedCourseReport !== "SS415") {
                        doc.setFont("helvetica", "bold");
                        doc.text(`${totalExamMarks}%`, 64, x + 10);
                    }
                    else if (selectedCourseReport === "IT241" || selectedCourseReport === "IT411" || selectedCourseReport === "SS415") {
                        doc.setFont("helvetica", "bold");
                        doc.text(`N/A`, 64, x + 10);
                    }

                    if (preparedByGlobal && preparedByGlobal.length > 0 && datePreparedGlobal && datePreparedGlobal.length > 0) {
                        doc.setFontSize(9);
                        doc.setFont("helvetica", "normal");
                        doc.text(`Prepared by       :       ${preparedByGlobal}`, 21, newYY - 2);
                        doc.text(`Date                   :       ${datePreparedGlobal}`, 21, newYY + 3);
                    } else {
                        try {
                            const teacherResponse = await axios.get(`${adminLocalhost}/class/getTeacherName/${enrollDate}`);
                            let teacherUsername = 'N/A';
                            if (teacherResponse.data && teacherResponse.data.length > 0) {
                                const rawData = teacherResponse.data[0];

                                teacherUsername = rawData.split(',')[0] || 'N/A';
                            }
                            //const teacherUsername = teacherResponse.data[0] || 'N/A';

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
                            doc.text(`Trainer (导师)             :      N/A4`, 20, 78);
                        }
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
                    if (selectedCourseReport !== "IT241" && selectedCourseReport !== "IT411" && selectedCourseReport !== "SS415") {
                        doc.setFont("helvetica", "bold");
                        doc.text(`${totalExamMarks}%`, 64, x + 3);
                    }
                    else if (selectedCourseReport === "IT241" || selectedCourseReport === "IT411" || selectedCourseReport === "SS415") {
                        doc.setFont("helvetica", "bold");
                        doc.text(`N/A`, 64, x + 3);
                    }

                    if (preparedByGlobal && preparedByGlobal.length > 0 && datePreparedGlobal && datePreparedGlobal.length > 0) {
                        doc.setFontSize(9);
                        doc.setFont("helvetica", "normal");
                        doc.text(`Prepared by       :       ${preparedByGlobal}`, 21, newYY - 10);
                        doc.text(`Date                   :       ${datePreparedGlobal}`, 21, newYY - 4);
                    } else {
                        try {
                            const teacherResponse = await axios.get(`${adminLocalhost}/class/getTeacherName/${enrollDate}`);
                            let teacherUsername = 'N/A';
                            if (teacherResponse.data && teacherResponse.data.length > 0) {
                                const rawData = teacherResponse.data[0];

                                teacherUsername = rawData.split(',')[0] || 'N/A';
                            }
                            //const teacherUsername = teacherResponse.data[0] || 'N/A';

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
                const isIT241orIT411 = (selectedCourseReport === "IT241" || selectedCourseReport === "IT411" || selectedCourseReport === "SS415");

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
                                    if (selectedCourseReport !== "IT241" && selectedCourseReport !== "IT411" && selectedCourseReport !== "SS415") {
                                        doc.setFontSize(11);
                                        doc.setFont("helvetica", "bold");
                                        doc.text(formatMark(last_of_Array_Score), 168, 43);
                                        doc.text(last_of_Array_Grade, 184, 43);
                                        doc.setFont("helvetica", "normal");
                                    }
                                    else if (selectedCourseReport === "IT241" || selectedCourseReport === "IT411" || selectedCourseReport === "SS415") {
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

    const handleDownloadSRPClick = (Program, CourseCode) => {
        const studentData = selectedStudentNameList.map((student, index) => {
            const studentIndex = index;
            const examKey = `exam1_1stTest`;
            const examKey1 = `exam2_1stTest`;
            const examKey2 = `exam3_1stTest`;
            const examKey3 = `exam4_1stTest`;
            const examKey4 = markingData.exam5 === "Group Discussion" ? "exam5_GroupDiscussion" : "exam5_1stTest";

            const mark1 = examMarks[studentIndex]?.[examKey] || 0;
            const mark2 = examMarks[studentIndex]?.[examKey1] || 0;
            const mark3 = examMarks[studentIndex]?.[examKey2] || 0;
            const mark4 = examMarks[studentIndex]?.[examKey3] || 0;
            const mark5 = examMarks[studentIndex]?.[examKey4] || 0;

            const totalValue =
                (parseFloat(mark1) || 0) +
                (parseFloat(mark2) || 0) +
                (parseFloat(mark3) || 0) +
                (parseFloat(mark4) || 0) +
                (parseFloat(mark5) || 0);

            const examEntries = [
                { key: 'exam1', mark: mark1, label: markingData.exam1, percent: markingData.mark1 },
                { key: 'exam2', mark: mark2, label: markingData.exam2, percent: markingData.mark2 },
                { key: 'exam3', mark: mark3, label: markingData.exam3, percent: markingData.mark3 },
                { key: 'exam4', mark: mark4, label: markingData.exam4, percent: markingData.mark4 },
                { key: 'exam5', mark: mark5, label: markingData.exam5, percent: markingData.mark5 },
            ];

            // Build the row
            const row = {
                "No.": index + 1,
                "Student Name": student.name || student.studentName || "-"
            };

            // Add exam columns only if their mark percentage is valid
            examEntries.forEach(({ mark, label, percent }) => {
                if (parseFloat(percent) > 0) {
                    row[`${label} (${percent}%)`] = mark;
                }
            });

            // Add remaining values
            row["Total (%)"] = totalValue.toFixed(1);
            row[""] = "";
            row["Exam Grade"] = totalValue >= 80 ? 30 :
                totalValue >= 65 ? 20 :
                    totalValue >= 50 ? 10 : 0;
            row["Attendance Grade"] = parseFloat(allStdAtdEligibility[studentIndex]) === 100 ? 20 : 0;

            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(studentData);

        // Auto-fit columns
        worksheet['!cols'] = Object.keys(studentData[0]).map(key => ({
            wch: Math.max(
                key.length,
                ...studentData.map(row => (row[key] ? row[key].toString().length : 0))
            ) + 2
        }));

        // Style headers
        const headerKeys = Object.keys(studentData[0]);
        // Style headers
        headerKeys.forEach((key, colIndex) => {
            const cellAddress = XLSX.utils.encode_cell({ c: colIndex, r: 0 });

            if (!worksheet[cellAddress]) return;

            // Check if it's the empty column
            const isEmptyColumn = key === "";

            worksheet[cellAddress].s = {
                fill: {
                    fgColor: { rgb: isEmptyColumn ? "000000" : "C6EFCE" } // black or light green
                },
                font: {
                    bold: true,
                    color: { rgb: isEmptyColumn ? "FFFFFF" : "006100" } // white or dark green text
                },
                alignment: {
                    horizontal: "center",
                    vertical: "center"
                },
                border: {
                    top: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } }
                }
            };
        });

        // Style body cells (row values)
        studentData.forEach((row, rowIndex) => {
            headerKeys.forEach((key, colIndex) => {
                const cellAddress = XLSX.utils.encode_cell({ c: colIndex, r: rowIndex + 1 });

                if (!worksheet[cellAddress]) return;

                const isLeftAlign = key === "No." || key === "Student Name";
                const isEmptyColumn = key === "";

                worksheet[cellAddress].s = {
                    fill: isEmptyColumn ? { fgColor: { rgb: "000000" } } : undefined,
                    font: isEmptyColumn ? { color: { rgb: "FFFFFF" } } : undefined,
                    alignment: {
                        horizontal: isLeftAlign ? "left" : "center",
                        vertical: "center"
                    },
                    border: {
                        top: { style: "thin", color: { rgb: "000000" } },
                        bottom: { style: "thin", color: { rgb: "000000" } },
                        left: { style: "thin", color: { rgb: "000000" } },
                        right: { style: "thin", color: { rgb: "000000" } }
                    }
                };
            });
        });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "SRP Points");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

        saveAs(blob, `${Program}-${CourseCode}-SRP.xlsx`);
    };

    const handleBulkDownload = async (ignoreZeroMark, selectedCourseReport, selectedProgram) => {
        setIsDownloading(true);
        setDownloadProgress(0);

        // Fake Progress Bar - 5 seconds
        for (let i = 1; i <= 100; i++) {
            await new Promise(resolve => setTimeout(resolve, 50)); // 50ms * 100 = 5sec
            setDownloadProgress(i);
        }

        // After Fake Progress Done -> Start Real Download
        const zip = new JSZip();

        const downloadStudentList = selectedStudentNameList.map((student, index) => ({
            ...student,
            practicalCompetency: practicalCompetency[index] || "",
        }));

        for (const student of downloadStudentList) {
            const { name, id, practicalCompetency, intake } = student;
            const result = await generatePDFForStudent(ignoreZeroMark, selectedCourseReport, name, id, practicalCompetency, intake);

            if (result && result.blob && result.filename) {
                zip.file(result.filename, result.blob);
            }
        }

        const zipBlob = await zip.generateAsync({ type: "blob" });
        saveAs(zipBlob, `${selectedProgram}-${selectedCourseReport}-Results.zip`);

        setIsDownloading(false);
        setDownloadProgress(0);
    };

    const generatePDFForStudent = async (ignoreZeroMark, courseCode, name, id, practicalCompetency, intake) => {
        return new Promise(async (resolve) => {
            const studentIndex = selectedStudentNameList.findIndex(student => student.name === name)
            const attendanceEligibleStatus = attendanceData[0]?.attendanceEligibleStatus || 100;
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

                    if (selectedCourseReport !== "IT241" && selectedCourseReport !== "IT411" && selectedCourseReport !== "SS415") {
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
                            doc.text(`Trainer (导师)             :      ${Cookies.get('employeeName')}`, 20, 78);
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
                    if (selectedCourseReport !== "IT241" && selectedCourseReport !== "IT411" && selectedCourseReport !== "SS415") {
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
                    if (selectedCourseReport !== "IT241" && selectedCourseReport !== "IT411" && selectedCourseReport !== "SS415") {
                        for (let i = 1; i <= 5; i++) {
                            const mark = markingData[`mark${i}`];
                            if (mark !== "0" && mark !== undefined) {
                                doc.text(`${markingData[`mark${i}`]}%`, 65, x);
                                x += 6;
                            }
                        }
                    }

                    // Show key in marks for 1stTest, 1stResist, 2ndResit, 3rdResit, GroupDiscussion
                    if (selectedCourseReport !== "IT241" && selectedCourseReport !== "IT411" && selectedCourseReport !== "SS415") {

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

                                if (mark !== undefined && mark !== "" && (ignoreZeroMark || parseFloat(mark) !== 0)) { // && parseFloat(mark) !== 0 -> Don't remove this. If you remove, Group Discussion marks show 0 even got value in database
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

                        if (selectedCourseReport !== "IT241" && selectedCourseReport !== "IT411" && selectedCourseReport !== "SS415") {
                            // Grey Shade for Total Result
                            doc.setLineWidth(0.3);
                            doc.setFont("helvetica", "normal");
                            doc.setFillColor(230, 230, 230); // Gray shade
                            doc.rect(20.5, x + 3.5, 58.8, 6, 'F'); // Draw shaded rectangle
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
                        else if (selectedCourseReport === "IT241" || selectedCourseReport === "IT411" || selectedCourseReport === "SS415") {
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
                        if (selectedCourseReport !== "IT241" && selectedCourseReport !== "IT411" && selectedCourseReport !== "SS415") {
                            doc.setFont("helvetica", "bold");
                            doc.text(`${totalExamMarks}%`, 64, x + 10);
                        }
                        else if (selectedCourseReport === "IT241" || selectedCourseReport === "IT411" || selectedCourseReport === "SS415") {
                            doc.setFont("helvetica", "bold");
                            doc.text(`N/A`, 64, x + 10);
                        }

                        if (preparedByGlobal && preparedByGlobal.length > 0 && datePreparedGlobal && datePreparedGlobal.length > 0) {
                            doc.setFontSize(9);
                            doc.setFont("helvetica", "normal");
                            doc.text(`Prepared by       :       ${preparedByGlobal}`, 21, newYY - 2);
                            doc.text(`Date                   :       ${datePreparedGlobal}`, 21, newYY + 3);
                        } else {
                            doc.setFontSize(9);
                            doc.setFont("helvetica", "normal");
                            doc.text(`Prepared by       :       ${Cookies.get('employeeName')}`, 21, newYY - 2);
                            const currentDate = new Date();
                            const options = { year: 'numeric', month: 'short', day: '2-digit' };
                            const formattedDate = currentDate.toLocaleDateString('en-GB', options).replace(/ /g, '-');
                            doc.text(`Date                   :       ${formattedDate}`, 21, newYY + 3);
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
                        if (selectedCourseReport !== "IT241" && selectedCourseReport !== "IT411" && selectedCourseReport !== "SS415") {
                            doc.setFont("helvetica", "bold");
                            doc.text(`${totalExamMarks}%`, 64, x + 3);
                        }
                        else if (selectedCourseReport === "IT241" || selectedCourseReport === "IT411" || selectedCourseReport === "SS415") {
                            doc.setFont("helvetica", "bold");
                            doc.text(`N/A`, 64, x + 3);
                        }

                        if (preparedByGlobal && preparedByGlobal.length > 0 && datePreparedGlobal && datePreparedGlobal.length > 0) {
                            doc.setFontSize(9);
                            doc.setFont("helvetica", "normal");
                            doc.text(`Prepared by       :       ${preparedByGlobal}`, 21, newYY - 10);
                            doc.text(`Date                   :       ${datePreparedGlobal}`, 21, newYY - 4);
                        } else {
                            doc.setFontSize(9);
                            doc.setFont("helvetica", "normal");
                            doc.text(`Prepared by       :       ${Cookies.get('employeeName')}`, 21, newYY - 10);
                            const currentDate = new Date();
                            const options = { year: 'numeric', month: 'short', day: '2-digit' };
                            const formattedDate = currentDate.toLocaleDateString('en-GB', options).replace(/ /g, '-');
                            doc.text(`Date                   :       ${formattedDate}`, 21, newYY - 4);
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
                    const isIT241orIT411 = (selectedCourseReport === "IT241" || selectedCourseReport === "IT411" || selectedCourseReport === "SS415");

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
                                        if (selectedCourseReport !== "IT241" && selectedCourseReport !== "IT411" && selectedCourseReport !== "SS415") {
                                            doc.setFontSize(11);
                                            doc.setFont("helvetica", "bold");
                                            doc.text(formatMark(last_of_Array_Score), 168, 43);
                                            doc.text(last_of_Array_Grade, 184, 43);
                                            doc.setFont("helvetica", "normal");
                                        }
                                        else if (selectedCourseReport === "IT241" || selectedCourseReport === "IT411" || selectedCourseReport === "SS415") {
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

                    let filename = "";
                    const safeName = name.replace(/[\/\\?%*:|"<>]/g, '_');
                    filename = `ReportCard-${courseCode}-${safeName}-${id}.pdf`;

                    const blob = doc.output("blob");
                    resolve({ blob, filename });

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
        });
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

    const handleDateChange = () => {
        setEditShow2(true);
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

    const saveDate = () => {
        // Convert datePrepared to DD-MMM-YYYY format
        const formattedDatePrepared = new Date(datePrepared).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).replace(/ /g, '-');

        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Date updated successfully!',
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            setPreparedByGlobal(preparedBy);
            setDatePreparedGlobal(formattedDatePrepared);
            setEditShow2(false);
        });
    };

    const saveProject = async (e) => {
        e.preventDefault();
        try {

            const foundResult = projectResults.find(result =>
                result.projectCourse === selectedCourseReport &&
                result.projectStudentName === selectedProjectStudentName
            );

            if (foundResult) {
                await axios.put(`${employeeLocalhost}/project/updateProject/${foundResult.id}`, {
                    projectTitle: selectedProjectTitle,
                    projectDescription: selectedProjectDescription,
                    projectCourse: selectedCourseReport,
                    projectStudentName: selectedProjectStudentName,
                    projectStudentID: selectedProjectStudentID,
                    projectEnrollID: selectedEnrollDate
                });

                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: 'Project updated successfully!',
                    showConfirmButton: false,
                    timer: 1500,
                }).then(() => { setEditShow4(false); });
            }
            else {
                await axios.post(`${employeeLocalhost}/project/addProject`, {
                    projectTitle: selectedProjectTitle,
                    projectDescription: selectedProjectDescription,
                    projectCourse: selectedCourseReport,
                    projectStudentName: selectedProjectStudentName,
                    projectStudentID: selectedProjectStudentID,
                    projectEnrollID: selectedEnrollDate
                });

                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: 'Project added successfully!',
                    showConfirmButton: false,
                    timer: 1500,
                }).then(() => { setEditShow4(false); });
            }

        } catch (error) {
            console.error('Error occurred while saving the project:', error);

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to save project. Please try again.',
            });
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

    const handleCloseSP442 = (e) => {

        setShowSP442Modal(false);
    };

    const handleCloseProposal = (e) => {

        setShowProposalModal(false);
    };

    const handleCloseImplementation = (e) => {

        setShowImplementationModal(false);
    };

    const handleClosePresentation = (e) => {

        setShowPresentationModal(false);
    };

    const eraseContact = async (enrollDate, courseCode, MarkTemplate, studentName, studentID) => {

        const foundResult = examResults.find(result =>
            result.examEnrollDate === enrollDate &&
            result.examCourseCode === courseCode &&
            result.examMarkingTemplate === MarkTemplate &&
            result.examStdName === studentName
        );

        setPracticalCompetency(prevCompetency =>
            prevCompetency.map((value, index) =>
                selectedStudentNameList[index]?.id === studentID ? "" : value
            )
        );

        setExamMarks(prevMarks =>
            prevMarks.map((marks, index) => {
                if (selectedStudentNameList[index]?.id !== studentID) {
                    return marks;
                }

                const updatedMarks = { ...marks };

                for (let i = 1; i <= 5; i++) {
                    updatedMarks[`exam${i}_1stTest`] = "";
                    updatedMarks[`exam${i}_1stResit`] = "";
                    updatedMarks[`exam${i}_2ndResit`] = "";
                    updatedMarks[`exam${i}_3rdResit`] = "";
                }

                updatedMarks["exam5_GroupDiscussion"] = "";

                return updatedMarks;
            })
        );

        setResult(prevResults =>
            prevResults.map(res =>
                res.examStdID === studentID
                    ? { ...res, examTotalScore: "N/A", examTotalGrade: "N/A" }
                    : res
            )
        );

    };

    const deleteContact = async (enrollDate, courseCode, MarkTemplate, studentName, studentID) => {

        const foundResult = examResults.find(result =>
            result.examEnrollDate === enrollDate &&
            result.examCourseCode === courseCode &&
            result.examMarkingTemplate === MarkTemplate &&
            result.examStdName === studentName
        );

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
                axios.delete(`${employeeLocalhost}/examResult/deleteExamResult/${foundResult.id}`);

                const fypCourseCodes = ["SI441", "SI442", "DP451", "DP452"];
                if (fypCourseCodes.includes(courseCode)) {
                    axios.delete(`${employeeLocalhost}/fyp/deleteByEnrollDateAndStudentID/${enrollDate}/${studentID}`);
                }

                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: 'Deleted successfully!',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    fetchExamResults();
                    fetchExamResults1();
                });
            }
        })

    };

    const handleSP442Submit = async (item, enrollDate, studentIndex, examType, studentID, selectedCourseReport) => {
        if (studentIndex === null || studentIndex === undefined) {
            console.error("Student index is not defined");
            return;
        }

        const { approach, format, outcome, planning, problemGoals, reflection } = item;
        const totalMarks = [approach, format, outcome, planning, problemGoals, reflection]
            .map(mark => parseFloat(mark) || 0)
            .reduce((sum, mark) => sum + mark, 0);

        const formData = {
            format: item.format,
            problem: item.problemGoals,
            planning: item.planning,
            approach: item.approach,
            outcome: item.outcome,
            reflection: item.reflection,
            enrollDate: enrollDate,
            examType: examType,
            studentID: studentID
        };

        try {
            await axios.post(`${employeeLocalhost}/report/saveOrUpdateReport`, formData);

            const examKeyPrefix = selectedCourseReport === "DP452" ? "exam2_" : "exam1_";
            const examKey = `${examKeyPrefix}${examType.replace(/\s/g, '')}`;

            setExamMarks(prevMarks => {
                const updatedMarks = [...prevMarks];
                updatedMarks[studentIndex] = {
                    ...updatedMarks[studentIndex],
                    [examKey]: totalMarks
                };
                return updatedMarks;
            });

            Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: 'Report processed successfully!',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                setShowSP442Modal(false);
            });

        } catch (error) {
            console.error('Error occurred while processing report:', error);
        }

    };

    const handleSP442Delete = async (item) => {
        const result = await Swal.fire({
            title: 'Are you sure want to delete?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Delete it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${employeeLocalhost}/report/deleteReport/${item.id}`);

                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: 'Deleted successfully!',
                    showConfirmButton: false,
                    timer: 1500
                });

                // Clear the form state
                setSp442Data({
                    approach: "",
                    format: "",
                    outcome: "",
                    planning: "",
                    problemGoals: "",
                    reflection: ""
                });

            } catch (error) {
                console.error("Delete error:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Failed to delete the record. Please try again later.'
                });
            }
        }
    };

    const handleProposalSubmit = async () => {
        const totalMarks = FYPData.proposal
            .map(val => parseFloat(val) || 0)
            .reduce((sum, val) => sum + val, 0);

        const scaledMark = (totalMarks / 100) * parseFloat(markingData.mark1 || 0);
        const examKey = `${selectedSP442Exam.replace(/\s/g, '')}`;

        const formData = {
            proposal: FYPData.proposal.join(","),
            implementation: "",
            presentation: "",
            enrollDate: selectedEnrollDate,
            examType: examKey,
            studentID: selectedStudentID
        };

        try {
            await axios.post(`${employeeLocalhost}/fyp/saveOrUpdateReport`, formData);

            setExamMarks(prev => {
                const updated = [...prev];
                const examKey = `${selectedSP442Exam.replace(/\s/g, '')}`;
                updated[selectedStudentIndex] = {
                    ...updated[selectedStudentIndex],
                    [examKey]: scaledMark.toFixed(1)
                };
                return updated;
            });

            Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: 'Proposal saved successfully!',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                setShowProposalModal(false);
            });

        } catch (error) {
            console.error("Error submitting proposal:", error);
        }
    };

    const handleImplementationSubmit = async () => {
        const totalMarks = FYPData.implementation
            .map(val => parseFloat(val) || 0)
            .reduce((sum, val) => sum + val, 0);

        const scaledMark = (totalMarks / 100) * parseFloat(markingData.mark2 || 0);
        const examKey = `${selectedSP442Exam.replace(/\s/g, '')}`;

        /*const formData = {
            proposal: FYPData.proposal.join(","), 
            implementation: FYPData.implementation.join(","),
            presentation: FYPData.presentation.join(","),
            enrollDate: selectedEnrollDate,
            examType: examKey,
            studentID: selectedStudentID
        };*/
        const formData = {
            proposal: "",
            implementation: FYPData.implementation.join(","),
            presentation: "",
            enrollDate: selectedEnrollDate,
            examType: examKey,
            studentID: selectedStudentID
        };

        try {
            await axios.post(`${employeeLocalhost}/fyp/saveOrUpdateReport`, formData);

            setExamMarks(prev => {
                const updated = [...prev];
                updated[selectedStudentIndex] = {
                    ...updated[selectedStudentIndex],
                    [examKey]: scaledMark.toFixed(1)
                };
                return updated;
            });

            Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: 'Implementation saved successfully!',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                setShowImplementationModal(false);
            });

        } catch (error) {
            console.error("Error submitting implementation:", error);
        }
    };

    const handleRanked = async (item) => {
        try {
            const response = await fetch(
                `${employeeLocalhost}/examResult/getExamResultDetails/${item.attendanceEnrollDate}/${item.attendanceCourse}/${item.attendanceMarkTemplate}`
            );
            const data = await response.json();

            const sortedData = data
                .map((res) => ({
                    ...res,
                    numericScore:
                        isNaN(parseFloat(res.examTotalScore)) ||
                            res.examTotalScore === "Fail"
                            ? 0
                            : parseFloat(res.examTotalScore),
                }))
                .sort((a, b) => b.numericScore - a.numericScore);

            const ranked = sortedData.map((res, index) => ({
                rank: index + 1,
                studentName: res.examStdName,
                studentID: res.examStdID,
                examResult: res.examTotalScore,
            }));

            setSelectedCourseReport(item.attendanceCourse);
            setRankedResults(ranked);
            setShowRankModal(true);
        } catch (error) {
            console.error("Error fetching ranked results", error);
        }
    };

    const handlePresentationSubmit = async () => {
        const totalMarks = FYPData.presentation
            .map(val => parseFloat(val) || 0)
            .reduce((sum, val) => sum + val, 0);

        const scaledMark = (totalMarks / 100) * parseFloat(markingData.mark3 || 0);
        const examKey = `${selectedSP442Exam.replace(/\s/g, '')}`;

        /*const formData = {
            proposal: FYPData.proposal.join(","), 
            implementation: FYPData.implementation.join(","),
            presentation: FYPData.presentation.join(","),
            enrollDate: selectedEnrollDate,
            examType: examKey,
            studentID: selectedStudentID
        };*/
        const formData = {
            proposal: "",
            implementation: "",
            presentation: FYPData.presentation.join(","),
            enrollDate: selectedEnrollDate,
            examType: examKey,
            studentID: selectedStudentID
        };

        try {
            await axios.post(`${employeeLocalhost}/fyp/saveOrUpdateReport`, formData);

            setExamMarks(prev => {
                const updated = [...prev];
                updated[selectedStudentIndex] = {
                    ...updated[selectedStudentIndex],
                    [examKey]: scaledMark.toFixed(1)
                };
                return updated;
            });

            Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: 'Presentation saved successfully!',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                setShowPresentationModal(false);
            });

        } catch (error) {
            console.error("Error submitting presentation:", error);
        }
    };

    let zeroCount = 0;

    if (markingData.mark1 === "0") {
        zeroCount++;
    }

    if (markingData.mark2 === "0") {
        zeroCount++;
    }

    if (markingData.mark3 === "0") {
        zeroCount++;
    }

    if (markingData.mark4 === "0") {
        zeroCount++;
    }

    if (markingData.mark5 === "0") {
        zeroCount++;
    }

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

    const maxLength = 255;

    const totalScore =
        (parseFloat(sp442Data.format) || 0) +
        (parseFloat(sp442Data.problemGoals) || 0) +
        (parseFloat(sp442Data.planning) || 0) +
        (parseFloat(sp442Data.approach) || 0) +
        (parseFloat(sp442Data.outcome) || 0) +
        (parseFloat(sp442Data.reflection) || 0);

    const totalProposalScore = FYPData.proposal?.reduce((acc, val) => acc + (parseFloat(val) || 0), 0) || 0;
    const ProposalScore = ((FYPData.proposal?.reduce((acc, val) => acc + (parseFloat(val) || 0), 0) || 0) / 100) * parseFloat(markingData.mark1 || 0);

    const totalImplementationScore = FYPData.implementation?.reduce((acc, val) => acc + (parseFloat(val) || 0), 0) || 0;
    const ImplementationScore = ((FYPData.implementation?.reduce((acc, val) => acc + (parseFloat(val) || 0), 0) || 0) / 100) * parseFloat(markingData.mark2 || 0);

    const totalPresentationScore = FYPData.presentation?.reduce((acc, val) => acc + (parseFloat(val) || 0), 0) || 0;
    const PresentationScore = ((FYPData.presentation?.reduce((acc, val) => acc + (parseFloat(val) || 0), 0) || 0) / 100) * parseFloat(markingData.mark3 || 0);

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
                        <h2 className="fs-2 m-0">Exam Result SCI</h2>
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
                                    <th style={{ textAlign: "center" }}>Semester</th>
                                    <th style={{ textAlign: "center" }}>Marking Template</th>
                                    <th style={{ textAlign: "center" }}>Enroll Date</th>
                                    <th style={{ textAlign: "center" }}>Course Code</th>
                                    <th style={{ textAlign: "center" }}>Course Name</th>
                                    <th style={{ textAlign: "center" }}>Start Date</th>
                                    <th style={{ textAlign: "center" }}>End Date</th>
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
                                                    style={{ fontSize: "12px" }}
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
                                                    {/* Expand/Collapse Row for Course */}
                                                    <tr key={`${semester}-${program}`} className="program-row">
                                                        <td></td>
                                                        <td style={{ textAlign: "center" }}>
                                                            <button
                                                                className="btn btn-light"
                                                                onClick={() => toggleProgram(semester, program)}
                                                                style={{ fontSize: "12px" }}
                                                            >
                                                                <FontAwesomeIcon icon={expandedPrograms[`${semester}-${program}`] ? faChevronUp : faChevronDown} />
                                                            </button>
                                                        </td>
                                                        <td colSpan="8" style={{ fontWeight: "bold", backgroundColor: "#e0e0e0" }}>
                                                            {program}
                                                        </td>
                                                    </tr>

                                                    {/* Render Rows only if program is expanded */}
                                                    {expandedPrograms[`${semester}-${program}`] &&
                                                        sortedGroupedData[semester][program].map((item, index) => (
                                                            <tr key={item.id}>
                                                                <td></td> {/* Empty cell for alignment */}
                                                                <td scope="row">{index + 1}</td>
                                                                {employeeJobTitle === 'Course Counsellor' ? (
                                                                    <>
                                                                        <td>{item.classSemester}</td>
                                                                        <td>{item.classMarkingTemplate}</td>
                                                                        <td>{item.classEnrollDateProgCode}</td>
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
                                                                        <td>{item.classEndDate}</td>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <td>{item.attendanceSemester}</td>
                                                                        <td>{item.attendanceMarkTemplate || "N/A"}</td>
                                                                        <td>{item.attendanceEnrollDate}</td>
                                                                        <td>{item.attendanceCourse}</td>
                                                                        <td>
                                                                            {(program?.trim().toUpperCase() === "DSE" || program?.trim().toUpperCase() === "DSEPT") &&
                                                                                item.attendanceCourse?.trim().toUpperCase() === "MD221"
                                                                                ? "Android Application Development - Kotlin"
                                                                                : item.attendanceCourse?.trim().toUpperCase() === "MD221"
                                                                                    ? "Mobile Device Service & Repairs"
                                                                                    : item.attendanceCourseName}
                                                                        </td>
                                                                        <td>{item.attendanceClassStartDate}</td>
                                                                        <td>{item.attendanceClassEndDate}</td>
                                                                    </>
                                                                )}

                                                                {/* Attendance Button Logic (Common for Both) */}
                                                                <td>
                                                                    <div className="d-flex gap-1">
                                                                        {/* Existing Manage Attendance Button */}
                                                                        {data3.some((item) => item.category === "Manage Attendance") && (
                                                                            <div className="d-flex gap-1">
                                                                                {/* Attendance Button */}
                                                                                <button
                                                                                    id="btnFontIcon"
                                                                                    className="btn btn-success"
                                                                                    style={{ fontSize: "10px" }}
                                                                                    title="Attendance"
                                                                                    onClick={() =>
                                                                                        handleButtonClick(
                                                                                            employeeJobTitle === "Course Counsellor"
                                                                                                ? {
                                                                                                    enrollDate: item.classEnrollDateProgCode,
                                                                                                    courseCode: item.classCourseCode,
                                                                                                    startDate: item.classStartDate,
                                                                                                    endDate: item.classEndDate,
                                                                                                    markTemplate: item.classMarkingTemplate,
                                                                                                    courseName: item.classCourse,
                                                                                                }
                                                                                                : {
                                                                                                    enrollDate: item.attendanceEnrollDate,
                                                                                                    courseCode: item.attendanceCourse,
                                                                                                    startDate: item.attendanceClassStartDate,
                                                                                                    endDate: item.attendanceClassEndDate,
                                                                                                    markTemplate: item.attendanceMarkTemplate,
                                                                                                    courseName: item.attendanceCourseName,
                                                                                                },
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

                                                                                {/* Ranked Button */}
                                                                                {["Head of Department", "Course Coordinator"].includes(jobTitle) && (
                                                                                    <button
                                                                                        id="btnFontIcon"
                                                                                        className="btn btn-primary"
                                                                                        style={{ fontSize: "10px" }}
                                                                                        title="Ranked"
                                                                                        onClick={() => handleRanked(item)}
                                                                                    >
                                                                                        <FontAwesomeIcon icon={faStar} />
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        )}
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
                    </div>

                    {/* Exam Score Modal */}
                    <Modal show={editShow1} onHide={handleCloseCross} backdrop="static" keyboard={false} enforceFocus={true} dialogClassName="custom-modal">
                        <Modal.Header closeButton>
                            <Modal.Title style={{ color: 'black', fontSize: "20px" }}>
                                {(role?.includes("Admin") || data3.some(item => item.category === "Manage ExamReport" && item.accessType === "Read/Write"))
                                    ? `Update Exam Result`
                                    : `View Exam Result`}
                            </Modal.Title>
                            <span style={{ fontSize: "14px", color: "gray", display: "block", marginTop: "auto", marginLeft: "auto" }}>
                                <strong>Enroll Date:</strong> {selectedEnrollDate} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
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
                                            {/*{!(selectedCourseReport === "IT241" || selectedCourseReport === "IT411") && (
                                            <>
                                                
                                            </>
                                        )}*/}
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
                                                <th
                                                    colSpan={["Exercise", "Homework", "Presentation"].includes(markingData.exam3) ? undefined : "4"}
                                                    rowSpan={["Exercise", "Homework", "Presentation"].includes(markingData.exam3) ? "2" : undefined}
                                                    style={["Exercise", "Homework", "Presentation"].includes(markingData.exam3) ? { verticalAlign: "middle" } : {}}
                                                >
                                                    {markingData.exam3} - {markingData.mark3}%
                                                </th>
                                            )}

                                            {markingData.mark4 !== "0" && (
                                                <th
                                                    colSpan={["Exercise", "Homework"].includes(markingData.exam4) ? undefined : "4"}
                                                    rowSpan={["Exercise", "Homework"].includes(markingData.exam4) ? "2" : undefined}
                                                    style={["Exercise", "Homework", "Project"].includes(markingData.exam4) ? { verticalAlign: "middle" } : {}}
                                                >
                                                    {markingData.exam4} - {markingData.mark4}%
                                                </th>
                                            )}

                                            {markingData.mark5 !== "0" && (
                                                markingData.exam5 === "Group Discussion" ? (
                                                    <th rowSpan="2" style={{ verticalAlign: "middle" }}>
                                                        {markingData.exam5} -<br />{markingData.mark5}%
                                                    </th>
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
                                            {["RW211", "SF221", "NS221", "DI221", "SW223", "IT241", "IT411", "SS415", "HP211", "SS411", "SP241", "SP442", "SP441", "AI411"].includes(selectedCourseReport) && (
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
                                            const eligibility = employeeJobTitle === 'Course Counsellor'
                                                ? singleStdAtdEligibility
                                                : allStdAtdEligibility[student.id] || "N/A";

                                            const eligibilityConvertToFloat = parseFloat(eligibility);

                                            const eligibilityValue = eligibility !== "N/A"
                                                ? parseFloat(eligibility.toString().replace('%', ''))
                                                : null;

                                            const status = eligibilityValue === null
                                                ? "N/A"
                                                : eligibilityValue >= 80
                                                    ? "Passed"
                                                    : "Failed";

                                            const color = eligibilityValue === null
                                                ? "black"
                                                : eligibilityValue >= 80
                                                    ? "green"
                                                    : "red";
                                            return (
                                                <tr key={studentIndex}>
                                                    <td style={{ verticalAlign: "middle", width: '70px', fontSize: "12px" }}>{student.name}{" ("}{student.id}{")"}{" ("}{student.intake}{")"}</td>
                                                    {markingData.markPractical === "Enable" && (
                                                        <td style={{ verticalAlign: "middle", fontSize: "12px" }}>
                                                            <select
                                                                value={practicalCompetency[studentIndex]}
                                                                onChange={(e) => handlePracticalCompetencyChange(e, studentIndex)}
                                                            >
                                                                <option value="">Status?</option>
                                                                <option value="Incompetent">Incompetent</option>
                                                                <option value="Competent">Competent</option>
                                                            </select>
                                                        </td>
                                                    )}
                                                    {/* Display eligibility percentage */}
                                                    <td style={{ color, verticalAlign: "middle" }}>{eligibility}</td>
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
                                                                    onClick={() => {
                                                                        if (selectedCourseReport === "SP442") {
                                                                            setSelectedStudentIndex(studentIndex);
                                                                            setSelectedSP442Exam("1st Test");
                                                                            setSelectedStudentID(student.id);
                                                                            setShowSP442Modal(true);
                                                                        } else if (["SI441", "SI442", "DP451"].includes(selectedCourseReport)) {
                                                                            setSelectedStudentIndex(studentIndex);
                                                                            setSelectedSP442Exam("exam1_1stTest");
                                                                            setSelectedStudentID(student.id);
                                                                            setShowProposalModal(true);
                                                                        }
                                                                    }}
                                                                    readOnly={["SP442", "SI441", "SI442", "DP451"].includes(selectedCourseReport)}
                                                                    style={{ width: "60px" }}
                                                                    disabled={markingData.markPractical === "Enable" && practicalCompetency.length === 0}
                                                                />
                                                            </td>

                                                            <td style={{ verticalAlign: "middle" }}>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    name={`exam1_1stResit_${studentIndex}`}
                                                                    value={examMarks[studentIndex]?.exam1_1stResit || ""}
                                                                    onChange={(e) => handleExamResultChange(e, "exam1_1stResit", studentIndex)}
                                                                    onClick={() => {
                                                                        if (selectedCourseReport === "SP442") {
                                                                            setSelectedStudentIndex(studentIndex);
                                                                            setSelectedSP442Exam("1stResit");
                                                                            setSelectedStudentID(student.id);
                                                                            setShowSP442Modal(true);
                                                                        } else if (["SI441", "SI442", "DP451"].includes(selectedCourseReport)) {
                                                                            setSelectedStudentIndex(studentIndex);
                                                                            setSelectedSP442Exam("exam1_1stResit");
                                                                            setSelectedStudentID(student.id);
                                                                            setShowProposalModal(true);
                                                                        }
                                                                    }}
                                                                    readOnly={["SP442", "SI441", "SI442", "DP451"].includes(selectedCourseReport)}
                                                                    style={{ width: "60px" }}
                                                                    disabled={markingData.markPractical === "Enable" && practicalCompetency.length === 0}
                                                                />
                                                            </td>

                                                            <td style={{ verticalAlign: "middle" }}>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    name={`exam1_2ndResit_${studentIndex}`}
                                                                    value={examMarks[studentIndex]?.exam1_2ndResit || ""}
                                                                    onChange={(e) => handleExamResultChange(e, "exam1_2ndResit", studentIndex)}
                                                                    onClick={() => {
                                                                        if (selectedCourseReport === "SP442") {
                                                                            setSelectedStudentIndex(studentIndex);
                                                                            setSelectedSP442Exam("2ndResit");
                                                                            setSelectedStudentID(student.id);
                                                                            setShowSP442Modal(true);
                                                                        } else if (["SI441", "SI442", "DP451"].includes(selectedCourseReport)) {
                                                                            setSelectedStudentIndex(studentIndex);
                                                                            setSelectedSP442Exam("exam1_2ndResit");
                                                                            setSelectedStudentID(student.id);
                                                                            setShowProposalModal(true);
                                                                        }
                                                                    }}
                                                                    readOnly={["SP442", "SI441", "SI442", "DP451"].includes(selectedCourseReport)}
                                                                    style={{ width: "60px" }}
                                                                    disabled={markingData.markPractical === "Enable" && practicalCompetency.length === 0}
                                                                />
                                                            </td>

                                                            <td style={{ verticalAlign: "middle" }}>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    name={`exam1_3rdResit_${studentIndex}`}
                                                                    value={examMarks[studentIndex]?.exam1_3rdResit || ""}
                                                                    onChange={(e) => handleExamResultChange(e, "exam1_3rdResit", studentIndex)}
                                                                    onClick={() => {
                                                                        if (selectedCourseReport === "SP442") {
                                                                            setSelectedStudentIndex(studentIndex);
                                                                            setSelectedSP442Exam("3rd Resit");
                                                                            setSelectedStudentID(student.id);
                                                                            setShowSP442Modal(true);
                                                                        } else if (["SI441", "SI442", "DP451"].includes(selectedCourseReport)) {
                                                                            setSelectedStudentIndex(studentIndex);
                                                                            setSelectedSP442Exam("exam1_3rdResit");
                                                                            setSelectedStudentID(student.id);
                                                                            setShowProposalModal(true);
                                                                        }
                                                                    }}
                                                                    readOnly={["SP442", "SI441", "SI442", "DP451"].includes(selectedCourseReport)}
                                                                    style={{ width: "60px" }}
                                                                    disabled={markingData.markPractical === "Enable" && practicalCompetency.length === 0}
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
                                                                            disabled={markingData.markPractical === "Enable" && practicalCompetency.length === 0}
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
                                                                            disabled={markingData.markPractical === "Enable" && practicalCompetency.length === 0}
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
                                                                            disabled={markingData.markPractical === "Enable" && practicalCompetency.length === 0}
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
                                                                            disabled={markingData.markPractical === "Enable" && practicalCompetency.length === 0}
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
                                                                        onClick={() => {
                                                                            if (["SI441", "SI442", "DP451"].includes(selectedCourseReport)) {
                                                                                setSelectedStudentIndex(studentIndex);
                                                                                setSelectedSP442Exam("exam2_1stTest");
                                                                                setSelectedStudentID(student.id);
                                                                                setShowImplementationModal(true);
                                                                            }
                                                                            else if (selectedCourseReport === "DP452") {
                                                                                setSelectedStudentIndex(studentIndex);
                                                                                setSelectedSP442Exam("1st Test");
                                                                                setSelectedStudentID(student.id);
                                                                                setShowSP442Modal(true);
                                                                            }
                                                                        }}
                                                                        readOnly={["SI441", "SI442", "DP451"].includes(selectedCourseReport)}
                                                                        style={{ width: "60px" }}
                                                                        disabled={markingData.markPractical === "Enable" && practicalCompetency.length === 0}
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
                                                                        onClick={() => {
                                                                            if (["SI441", "SI442", "DP451"].includes(selectedCourseReport)) {
                                                                                setSelectedStudentIndex(studentIndex);
                                                                                setSelectedSP442Exam("exam3_1stTest");
                                                                                setSelectedStudentID(student.id);
                                                                                setShowPresentationModal(true);
                                                                            }
                                                                        }}
                                                                        readOnly={["SI441", "SI442", "DP451"].includes(selectedCourseReport)}
                                                                        style={{ width: "60px" }}
                                                                        disabled={markingData.markPractical === "Enable" && practicalCompetency.length === 0}
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
                                                                            disabled={markingData.markPractical === "Enable" && practicalCompetency.length === 0}
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
                                                                            disabled={markingData.markPractical === "Enable" && practicalCompetency.length === 0}
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
                                                                            disabled={markingData.markPractical === "Enable" && practicalCompetency.length === 0}
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
                                                                            disabled={markingData.markPractical === "Enable" && practicalCompetency.length === 0}
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
                                                                        disabled={practicalCompetency.length === 0}
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
                                                                            disabled={practicalCompetency.length === 0}
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
                                                                            disabled={practicalCompetency.length == 0}
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
                                                                            disabled={practicalCompetency.length == 0}
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
                                                                            disabled={practicalCompetency.length == 0}
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
                                                                        disabled={practicalCompetency.length == 0}
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
                                                                            disabled={practicalCompetency.length === 0}
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
                                                                            disabled={practicalCompetency.length == 0}
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
                                                                            disabled={practicalCompetency.length == 0}
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
                                                                            disabled={practicalCompetency.length == 0}
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
                                                        ).toFixed(1) + '%'}
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
                                                        ).toFixed(1) + '%'}
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
                                                        ).toFixed(1) + '%'}
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
                                                        ).toFixed(1) + '%'}
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

                                                            const hasPassedExam1 =
                                                                isPassing(markingData.mark1, examMarks[studentIndex]?.exam1_1stTest) ||
                                                                isPassing(markingData.mark1, examMarks[studentIndex]?.exam1_1stResit) ||
                                                                isPassing(markingData.mark1, examMarks[studentIndex]?.exam1_2ndResit) ||
                                                                isPassing(markingData.mark1, examMarks[studentIndex]?.exam1_3rdResit);

                                                            const hasPassedExam2 =
                                                                isPassing(markingData.mark2, examMarks[studentIndex]?.exam2_1stTest) ||
                                                                isPassing(markingData.mark2, examMarks[studentIndex]?.exam2_1stResit) ||
                                                                isPassing(markingData.mark2, examMarks[studentIndex]?.exam2_2ndResit) ||
                                                                isPassing(markingData.mark2, examMarks[studentIndex]?.exam2_3rdResit);

                                                            const hasPassedExam3 =
                                                                isPassing(markingData.mark3, examMarks[studentIndex]?.exam3_1stTest) ||
                                                                isPassing(markingData.mark3, examMarks[studentIndex]?.exam3_1stResit) ||
                                                                isPassing(markingData.mark3, examMarks[studentIndex]?.exam3_2ndResit) ||
                                                                isPassing(markingData.mark3, examMarks[studentIndex]?.exam3_3rdResit);

                                                            const hasPassedExam4 =
                                                                isPassing(markingData.mark4, examMarks[studentIndex]?.exam4_1stTest) ||
                                                                isPassing(markingData.mark4, examMarks[studentIndex]?.exam4_1stResit) ||
                                                                isPassing(markingData.mark4, examMarks[studentIndex]?.exam4_2ndResit) ||
                                                                isPassing(markingData.mark4, examMarks[studentIndex]?.exam4_3rdResit);

                                                            const hasAnyResit =
                                                                examMarks[studentIndex]?.exam1_1stResit || examMarks[studentIndex]?.exam1_2ndResit || examMarks[studentIndex]?.exam1_3rdResit ||
                                                                examMarks[studentIndex]?.exam2_1stResit || examMarks[studentIndex]?.exam2_2ndResit || examMarks[studentIndex]?.exam2_3rdResit ||
                                                                examMarks[studentIndex]?.exam3_1stResit || examMarks[studentIndex]?.exam3_2ndResit || examMarks[studentIndex]?.exam3_3rdResit ||
                                                                examMarks[studentIndex]?.exam4_1stResit || examMarks[studentIndex]?.exam4_2ndResit || examMarks[studentIndex]?.exam4_3rdResit;

                                                            const isPass = !failedPractical && hasPassedExam1 && hasPassedExam2 && hasPassedExam3 && hasPassedExam4;

                                                            const totalScore = (
                                                                (parseFloat(examMarks[studentIndex]?.exam1_1stTest) || 0) +
                                                                (parseFloat(examMarks[studentIndex]?.exam2_1stTest) || 0) +
                                                                (parseFloat(examMarks[studentIndex]?.exam3_1stTest) || 0) +
                                                                (parseFloat(examMarks[studentIndex]?.exam4_1stTest) || 0) +
                                                                (parseFloat(examMarks[studentIndex]?.exam5_GroupDiscussion) || 0)
                                                            ).toFixed(1);

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

                                                            if (selectedCourseReport === "IT411" || selectedCourseReport === "IT241" || selectedCourseReport === "SS415") {
                                                                const isCompetent = practicalCompetency[studentIndex] === "Competent";

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
                                                                            {isCompetent ? "Pass" : (isPass ? (hasAnyResit ? "Pass" : `${totalScore}`) : "Fail")}
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
                                                                            {isCompetent ? "P" : (isPass ? (hasAnyResit ? "P" : finalGrade) : "F")}
                                                                        </td>
                                                                    </>
                                                                );

                                                            } else {
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
                                                                            {isPass ? (hasAnyResit ? "Pass" : `${totalScore}`) : "Fail"}
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
                                                                            {isPass ? (hasAnyResit ? "P" : finalGrade) : "F"}
                                                                        </td>
                                                                    </>
                                                                );
                                                            }
                                                        })()}
                                                    </React.Fragment>
                                                    {/* Button */}
                                                    <td style={{ verticalAlign: "middle", whiteSpace: "nowrap" }}>
                                                        <Dropdown>
                                                            <Dropdown.Toggle variant="primary" size="sm" id="dropdown-basic" style={{ fontSize: '10px' }}>
                                                                Actions
                                                            </Dropdown.Toggle>

                                                            <Dropdown.Menu>
                                                                {data3.some(item => item.category === "Manage ExamReport" && item.accessType === "Read/Write") && (
                                                                    <>
                                                                        <Dropdown.Item onClick={() => eraseContact(selectedEnrollDate, selectedCourseReport, selectedMarkingTemplate, student.name, student.id)}>
                                                                            <FontAwesomeIcon icon={faEraser} className="me-2" /> Clear Only
                                                                        </Dropdown.Item>

                                                                        <Dropdown.Item onClick={() => deleteContact(selectedEnrollDate, selectedCourseReport, selectedMarkingTemplate, student.name, student.id)}>
                                                                            <FontAwesomeIcon icon={faTrash} className="me-2" /> Delete from DB
                                                                        </Dropdown.Item>

                                                                        <Dropdown.Item onClick={() => handleDateChange()}>
                                                                            <FontAwesomeIcon icon={faCalendar} className="me-2" /> Date Change
                                                                        </Dropdown.Item>
                                                                    </>
                                                                )}

                                                                <Dropdown.Item onClick={() =>
                                                                    handleDownloadClick(
                                                                        "download",
                                                                        false,
                                                                        selectedEnrollDate,
                                                                        selectedCourseReport,
                                                                        markPractice,
                                                                        preparedByGlobal,
                                                                        datePreparedGlobal,
                                                                        student.name,
                                                                        student.id,
                                                                        student.intake,
                                                                        practicalCompetency[studentIndex],
                                                                        eligibilityConvertToFloat,
                                                                        Object.values(markingData).slice(0, 5),
                                                                        examMarks[studentIndex]
                                                                    )
                                                                }>
                                                                    <FontAwesomeIcon icon={faDownload} className="me-2" /> Download
                                                                </Dropdown.Item>

                                                                <Dropdown.Item onClick={() =>
                                                                    handleDownloadClick(
                                                                        "view",
                                                                        false,
                                                                        selectedEnrollDate,
                                                                        selectedCourseReport,
                                                                        markPractice,
                                                                        preparedByGlobal,
                                                                        datePreparedGlobal,
                                                                        student.name,
                                                                        student.id,
                                                                        student.intake,
                                                                        practicalCompetency[studentIndex],
                                                                        eligibilityConvertToFloat,
                                                                        Object.values(markingData).slice(0, 5),
                                                                        examMarks[studentIndex]
                                                                    )
                                                                }>
                                                                    <FontAwesomeIcon icon={faEye} className="me-2" /> View
                                                                </Dropdown.Item>

                                                                <Dropdown.Item onClick={() =>
                                                                    handleDownloadClick(
                                                                        "download",
                                                                        true,
                                                                        selectedEnrollDate,
                                                                        selectedCourseReport,
                                                                        markPractice,
                                                                        preparedByGlobal,
                                                                        datePreparedGlobal,
                                                                        student.name,
                                                                        student.id,
                                                                        student.intake,
                                                                        practicalCompetency[studentIndex],
                                                                        eligibilityConvertToFloat,
                                                                        Object.values(markingData).slice(0, 5),
                                                                        examMarks[studentIndex]
                                                                    )
                                                                }>
                                                                    <FontAwesomeIcon icon={faDownload} className="me-2" /> Allow Zero & Download
                                                                </Dropdown.Item>

                                                                <Dropdown.Item onClick={() =>
                                                                    handleDownloadClick(
                                                                        "view",
                                                                        true,
                                                                        selectedEnrollDate,
                                                                        selectedCourseReport,
                                                                        markPractice,
                                                                        preparedByGlobal,
                                                                        datePreparedGlobal,
                                                                        student.name,
                                                                        student.id,
                                                                        student.intake,
                                                                        practicalCompetency[studentIndex],
                                                                        eligibilityConvertToFloat,
                                                                        Object.values(markingData).slice(0, 5),
                                                                        examMarks[studentIndex]
                                                                    )
                                                                }>
                                                                    <FontAwesomeIcon icon={faEye} className="me-2" /> Allow Zero & View
                                                                </Dropdown.Item>

                                                                {showProjectFields && (
                                                                    <Dropdown.Item onClick={() => handleProject(student.name, student.id)}>
                                                                        <FontAwesomeIcon icon={faPen} className="me-2" /> Project Info
                                                                    </Dropdown.Item>
                                                                )}
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            </div>
                        </Modal.Body>
                        {(role?.includes("Admin") || data3.some(item => item.category === "Manage ExamReport" && item.accessType === "Read/Write")) && (
                            <Modal.Footer>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                                    {/* Left side message 
                                <span style={{ fontSize: "12px", color: "red", fontStyle: "italic", marginRight: "10px" }}>
                                    * End of Apr 2025, SRP button will be removed
                                </span>*/}

                                    <span style={{ fontSize: "12px", color: "red", fontStyle: "italic", marginRight: "10px" }}>
                                        SISv2 doesn't accept zero marks. Use "Accept Zero" only if the score includes zero.
                                    </span>

                                    {/* Right side buttons */}
                                    <div style={{ display: "flex", gap: "5px" }}>
                                        {/*<button 
                                        id="btnFontIcon"
                                        className="btn btn-success"
                                        title="Download SRP"
                                        onClick={() => handleDownloadSRPClick(selectedProgram, selectedCourseReport)}
                                    >
                                        <FontAwesomeIcon icon={faDownload} /> Download SRP
                                    </button>*/}
                                        <Dropdown>
                                            <Dropdown.Toggle variant="warning" size="sm" id="dropdown-basic" style={{ fontSize: '18px' }}>
                                                Download
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu>
                                                <Dropdown.Item
                                                    onClick={() => handleBulkDownload(false, selectedCourseReport, selectedProgram)}
                                                >
                                                    <FontAwesomeIcon icon={faDownload} /> Download All
                                                </Dropdown.Item>
                                                <Dropdown.Item
                                                    onClick={() => handleBulkDownload(true, selectedCourseReport, selectedProgram)}
                                                >
                                                    <FontAwesomeIcon icon={faDownload} /> Allow Zero & Download All
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                        {/*<button 
                                        className="btn btn-warning"
                                        title="Download All SRPs"
                                        onClick={() => handleBulkDownload(selectedCourseReport, selectedProgram)}
                                    >
                                        <FontAwesomeIcon icon={faDownload} /> Download All
                                    </button>*/}
                                        <button
                                            className="btn btn-primary"
                                            title="Save Attendance"
                                            onClick={() => saveAttendance(selectedCourseReport, selectedEnrollDate, selectedMarkingTemplate, selectedCourseName, practicalCompetency, markPractice, selectedProgram)}
                                        >
                                            Save Result
                                        </button>
                                    </div>
                                </div>
                            </Modal.Footer>
                        )}
                    </Modal>

                    {/* Edit Report Card */}
                    <Modal show={editShow2} onHide={() => setEditShow2(false)} backdrop="static" keyboard={false} enforceFocus={true}>
                        <Modal.Header closeButton>
                            <Modal.Title style={{ color: '#151632' }}>
                                {data3.some(item => item.category === "Manage ExamReport" && item.accessType === "Read Only")
                                    ? `View Report Card ${selectedCourseReport}`
                                    : `Update Report Card ${selectedCourseReport}`
                                }
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body style={{ overflowX: "auto" }}>
                            <div style={{ marginBottom: "15px" }}>
                                <label style={{ color: 'black', fontWeight: "bold" }}>Prepared By:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={preparedBy}
                                    onChange={(e) => setPreparedBy(e.target.value)}
                                />
                            </div>
                            <div>
                                <label style={{ color: 'black', fontWeight: "bold" }}>Date Prepared:</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={datePrepared}
                                    onChange={(e) => setDatePrepared(e.target.value)}
                                />
                            </div>
                        </Modal.Body>
                        {data3.some(item => item.category === "Manage ExamReport" && item.accessType === "Read Only") ? null : (
                            <Modal.Footer>
                                <div style={{ float: "right" }}>
                                    <button className="btn btn-primary" title='Edit Report Card' onClick={saveDate}>Update</button>
                                </div>
                            </Modal.Footer>
                        )}
                    </Modal>

                    {/* Edit Project Info */}
                    <Modal show={editShow4} onHide={() => setEditShow4(false)} backdrop="static" keyboard={false} enforceFocus={true}>
                        <Modal.Header closeButton>
                            <Modal.Title style={{ color: '#151632' }}>
                                {data3.some(item => item.category === "Manage ExamReport" && item.accessType === "Read Only")
                                    ? "View Project Info"
                                    : "Update Project Info"
                                }
                            </Modal.Title>
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
                                            onChange={handleDescriptionChange}
                                        />
                                        <small style={{ color: selectedProjectDescription.length >= maxLength ? "red" : "black" }}>
                                            {selectedProjectDescription.length} / {maxLength} characters
                                        </small>
                                    </Form.Group>
                                </Form>
                            </div>
                        </Modal.Body>
                        {data3.some(item => item.category === "Manage ExamReport" && item.accessType === "Read/Write") && (
                            <Modal.Footer>
                                <div style={{ float: "right" }}>
                                    <button className="btn btn-primary" title='Save Project Info' onClick={(e) => saveProject(e, selectedProjectTitle, selectedProjectDescription, selectedCourseReport, selectedProjectStudentName, selectedProjectStudentID, selectedEnrollDate)}>Submit</button>
                                </div>
                            </Modal.Footer>
                        )}
                    </Modal>

                    {/* SP442 Modal*/}
                    <Modal
                        show={showSP442Modal}
                        onHide={handleCloseSP442}
                        backdrop="static"
                        keyboard={false}
                    >
                        <Modal.Header closeButton>
                            <Modal.Title style={{ color: 'black' }}>{`${selectedCourseReport} Marking Details`}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form>
                                <Form.Group controlId="sp442_exam" className="mb-3">
                                    <Form.Label style={{ color: 'black' }}>Exam</Form.Label>
                                    <Form.Control
                                        type="text"
                                        readOnly
                                        value={selectedSP442Exam}
                                    />
                                </Form.Group>
                                <Form.Group controlId="sp442_format" className="mb-3">
                                    <Form.Label style={{ color: 'black' }}>Format (10%)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Enter Format Score"
                                        value={sp442Data.format || ""}
                                        onChange={(e) => setSp442Data(prev => ({ ...prev, format: e.target.value }))}
                                    />
                                </Form.Group>
                                <Form.Group controlId="sp442_problemGoals" className="mb-3">
                                    <Form.Label style={{ color: 'black' }}>Problem and Goals (15%)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Enter Problem and Goals Score"
                                        value={sp442Data.problemGoals || ""}
                                        onChange={(e) => setSp442Data(prev => ({ ...prev, problemGoals: e.target.value }))}
                                    />
                                </Form.Group>
                                <Form.Group controlId="sp442_planning" className="mb-3">
                                    <Form.Label style={{ color: 'black' }}>Planning (10%)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Enter Planning Score"
                                        value={sp442Data.planning || ""}
                                        onChange={(e) => setSp442Data(prev => ({ ...prev, planning: e.target.value }))}
                                    />
                                </Form.Group>
                                <Form.Group controlId="sp442_approach" className="mb-3">
                                    <Form.Label style={{ color: 'black' }}>Approach (10%)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Enter Approach Score"
                                        value={sp442Data.approach || ""}
                                        onChange={(e) => setSp442Data(prev => ({ ...prev, approach: e.target.value }))}
                                    />
                                </Form.Group>
                                <Form.Group controlId="sp442_outcome" className="mb-3">
                                    <Form.Label style={{ color: 'black' }}>Outcome (10%)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Enter Outcome Score"
                                        value={sp442Data.outcome || ""}
                                        onChange={(e) => setSp442Data(prev => ({ ...prev, outcome: e.target.value }))}
                                    />
                                </Form.Group>
                                <Form.Group controlId="sp442_reflection" className="mb-3">
                                    <Form.Label style={{ color: 'black' }}>Reflection (45%)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Enter Reflection Score"
                                        value={sp442Data.reflection || ""}
                                        onChange={(e) => setSp442Data(prev => ({ ...prev, reflection: e.target.value }))}
                                    />
                                </Form.Group>
                                <Form.Group controlId="sp442_total" className="mb-3">
                                    <Form.Label style={{ color: 'black', fontWeight: 'bold' }}>Total Score</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={totalScore.toFixed(1)}
                                        readOnly
                                        style={{ backgroundColor: "#e9ecef", fontWeight: 'bold' }}
                                    />
                                </Form.Group>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                variant="danger"
                                title="Delete"
                                onClick={() => handleSP442Delete(sp442Data)}
                            >
                                Delete
                            </Button>
                            <Button
                                variant="primary"
                                title="Save"
                                onClick={() => handleSP442Submit(sp442Data, selectedEnrollDate, selectedStudentIndex, selectedSP442Exam, selectedStudentID, selectedCourseReport)}
                            >
                                Save
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    {/* Proposal Modal*/}
                    <Modal show={showProposalModal} onHide={handleCloseProposal} dialogClassName="custom-modal" backdrop="static" keyboard={false}>
                        <Modal.Header closeButton>
                            <Modal.Title style={{ color: 'black' }}>{`${selectedCourseReport} Marking Details`}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form>
                                <h6>Proposal - 40%</h6>
                                <hr style={{ color: "black" }}></hr>

                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_front_cover">
                                            <Form.Label style={{ color: 'black' }}>Front Cover (5%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Front Cover (5%)"
                                                value={FYPData.proposal[0] || ""}
                                                onChange={(e) => {
                                                    let newProposal = [...FYPData.proposal];
                                                    newProposal[0] = parseInt(e.target.value) || 0;
                                                    setFYPData(prev => ({ ...prev, proposal: newProposal }));
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_page_layout">
                                            <Form.Label style={{ color: 'black' }}>Page Layout / Margin (5%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Page Layout (5%)"
                                                value={FYPData.proposal[1] || ""}
                                                onChange={(e) => {
                                                    let newProposal = [...FYPData.proposal];
                                                    newProposal[1] = parseInt(e.target.value) || 0;
                                                    setFYPData(prev => ({ ...prev, proposal: newProposal }));
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_page_number">
                                            <Form.Label style={{ color: 'black' }}>Page Number (5%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Page Number (5%)"
                                                value={FYPData.proposal[2] || ""}
                                                onChange={(e) => {
                                                    let newProposal = [...FYPData.proposal];
                                                    newProposal[2] = parseInt(e.target.value) || 0;
                                                    setFYPData(prev => ({ ...prev, proposal: newProposal }));
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_table_content">
                                            <Form.Label style={{ color: 'black' }}>Table of Contents (5%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Table of Contents (5%)"
                                                value={FYPData.proposal[3] || ""}
                                                onChange={(e) => {
                                                    let newProposal = [...FYPData.proposal];
                                                    newProposal[3] = parseInt(e.target.value) || 0;
                                                    setFYPData(prev => ({ ...prev, proposal: newProposal }));
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_numbering">
                                            <Form.Label style={{ color: 'black' }}>Numbering (5%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Numbering (5%)"
                                                value={FYPData.proposal[4] || ""}
                                                onChange={(e) => {
                                                    let newProposal = [...FYPData.proposal];
                                                    newProposal[4] = parseInt(e.target.value) || 0;
                                                    setFYPData(prev => ({ ...prev, proposal: newProposal }));
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_footnotes">
                                            <Form.Label style={{ color: 'black' }}>Footnotes (10%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Footnotes (10%)"
                                                value={FYPData.proposal[5] || ""}
                                                onChange={(e) => {
                                                    let newProposal = [...FYPData.proposal];
                                                    newProposal[5] = parseInt(e.target.value) || 0;
                                                    setFYPData(prev => ({ ...prev, proposal: newProposal }));
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_project_scope">
                                            <Form.Label style={{ color: 'black' }}>Project Scope (5%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Project Scope (5%)"
                                                value={FYPData.proposal[6] || ""}
                                                onChange={(e) => {
                                                    let newProposal = [...FYPData.proposal];
                                                    newProposal[6] = parseInt(e.target.value) || 0;
                                                    setFYPData(prev => ({ ...prev, proposal: newProposal }));
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_project_deliverable">
                                            <Form.Label style={{ color: 'black' }}>Project Deliverables (5%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Project Deliverables (5%)"
                                                value={FYPData.proposal[7] || ""}
                                                onChange={(e) => {
                                                    let newProposal = [...FYPData.proposal];
                                                    newProposal[7] = parseInt(e.target.value) || 0;
                                                    setFYPData(prev => ({ ...prev, proposal: newProposal }));
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_project_activities">
                                            <Form.Label style={{ color: 'black' }}>Project Activities (15%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Project Activities (15%)"
                                                value={FYPData.proposal[8] || ""}
                                                onChange={(e) => {
                                                    let newProposal = [...FYPData.proposal];
                                                    newProposal[8] = parseInt(e.target.value) || 0;
                                                    setFYPData(prev => ({ ...prev, proposal: newProposal }));
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_technical_information">
                                            <Form.Label style={{ color: 'black' }}>Technical Information (5%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Technical Information (5%)"
                                                value={FYPData.proposal[9] || ""}
                                                onChange={(e) => {
                                                    let newProposal = [...FYPData.proposal];
                                                    newProposal[9] = parseInt(e.target.value) || 0;
                                                    setFYPData(prev => ({ ...prev, proposal: newProposal }));
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_background_study">
                                            <Form.Label style={{ color: 'black' }}>Background of Study (5%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Background of Study (5%)"
                                                value={FYPData.proposal[10] || ""}
                                                onChange={(e) => {
                                                    let newProposal = [...FYPData.proposal];
                                                    newProposal[10] = parseInt(e.target.value) || 0;
                                                    setFYPData(prev => ({ ...prev, proposal: newProposal }));
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_resource_allocation">
                                            <Form.Label style={{ color: 'black' }}>Resources Allocation (5%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Resources Allocation (5%)"
                                                value={FYPData.proposal[11] || ""}
                                                onChange={(e) => {
                                                    let newProposal = [...FYPData.proposal];
                                                    newProposal[11] = parseInt(e.target.value) || 0;
                                                    setFYPData(prev => ({ ...prev, proposal: newProposal }));
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_reference">
                                            <Form.Label style={{ color: 'black' }}>Reference (5%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Reference (5%)"
                                                value={FYPData.proposal[12] || ""}
                                                onChange={(e) => {
                                                    let newProposal = [...FYPData.proposal];
                                                    newProposal[12] = parseInt(e.target.value) || 0;
                                                    setFYPData(prev => ({ ...prev, proposal: newProposal }));
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_schedule_planning">
                                            <Form.Label style={{ color: 'black' }}>Schedule Planning (10%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Schedule Planning (10%)"
                                                value={FYPData.proposal[13] || ""}
                                                onChange={(e) => {
                                                    let newProposal = [...FYPData.proposal];
                                                    newProposal[13] = parseInt(e.target.value) || 0;
                                                    setFYPData(prev => ({ ...prev, proposal: newProposal }));
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_project_costing">
                                            <Form.Label style={{ color: 'black' }}>Project Costing (10%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Project Costing (10%)"
                                                value={FYPData.proposal[14] || ""}
                                                onChange={(e) => {
                                                    let newProposal = [...FYPData.proposal];
                                                    newProposal[14] = parseInt(e.target.value) || 0;
                                                    setFYPData(prev => ({ ...prev, proposal: newProposal }));
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_total_score" className="mb-3">
                                            <Form.Label style={{ color: 'black', fontWeight: 'bold' }}>Total Score - 100%</Form.Label>
                                            <Form.Control
                                                type="number"
                                                value={totalProposalScore.toFixed(1)}
                                                readOnly
                                                style={{ backgroundColor: "#e9ecef", fontWeight: 'bold' }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_score" className="mb-3">
                                            <Form.Label style={{ color: 'black', fontWeight: 'bold' }}>Total Score - {markingData.mark1}%</Form.Label>
                                            <Form.Control
                                                type="number"
                                                value={ProposalScore.toFixed(1)}
                                                readOnly
                                                style={{ backgroundColor: "#e9ecef", fontWeight: 'bold' }}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                variant="primary"
                                title="Save"
                                onClick={() => handleProposalSubmit()}
                            >
                                Save
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    {/* Implementation Modal*/}
                    <Modal show={showImplementationModal} onHide={handleCloseImplementation} dialogClassName="custom-modal" backdrop="static" keyboard={false}>
                        <Modal.Header closeButton>
                            <Modal.Title style={{ color: 'black' }}>{`${selectedCourseReport} Marking Details`}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form>
                                <h6>Implementation - 40%</h6>
                                <hr style={{ color: "black" }}></hr>

                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_project_delivery">
                                            <Form.Label style={{ color: 'black' }}>Project delivery (15%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Project delivery (15%)"
                                                value={FYPData.implementation[0] || ""}
                                                onChange={(e) => {
                                                    let newImplementation = [...FYPData.implementation];
                                                    newImplementation[0] = parseInt(e.target.value) || 0;
                                                    setFYPData(prev => ({ ...prev, implementation: newImplementation }));
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_project_meeting">
                                            <Form.Label style={{ color: 'black' }}>Project meeting  deliverables (15%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Project meeting  deliverables (15%)"
                                                value={FYPData.implementation[1] || ""}
                                                onChange={(e) => {
                                                    let newImplementation = [...FYPData.implementation];
                                                    newImplementation[1] = parseInt(e.target.value) || 0;
                                                    setFYPData(prev => ({ ...prev, implementation: newImplementation }));
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_project_start_time">
                                            <Form.Label style={{ color: 'black' }}>Project starts time (15%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Project starts time (15%)"
                                                value={FYPData.implementation[2] || ""}
                                                onChange={(e) => {
                                                    let newImplementation = [...FYPData.implementation];
                                                    newImplementation[2] = parseInt(e.target.value) || 0;
                                                    setFYPData(prev => ({ ...prev, implementation: newImplementation }));
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_project_end_time">
                                            <Form.Label style={{ color: 'black' }}>Project end time (15%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Project end time (15%)"
                                                value={FYPData.implementation[3] || ""}
                                                onChange={(e) => {
                                                    let newImplementation = [...FYPData.implementation];
                                                    newImplementation[3] = parseInt(e.target.value) || 0;
                                                    setFYPData(prev => ({ ...prev, implementation: newImplementation }));
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_project_completion">
                                            <Form.Label style={{ color: 'black' }}>Project completion (40%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Project completion (40%)"
                                                value={FYPData.implementation[4] || ""}
                                                onChange={(e) => {
                                                    let newImplementation = [...FYPData.implementation];
                                                    newImplementation[4] = parseInt(e.target.value) || 0;
                                                    setFYPData(prev => ({ ...prev, implementation: newImplementation }));
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_total_score" className="mb-3">
                                            <Form.Label style={{ color: 'black', fontWeight: 'bold' }}>Total Score - 100%</Form.Label>
                                            <Form.Control
                                                type="number"
                                                value={totalImplementationScore.toFixed(1)}
                                                readOnly
                                                style={{ backgroundColor: "#e9ecef", fontWeight: 'bold' }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_score" className="mb-3">
                                            <Form.Label style={{ color: 'black', fontWeight: 'bold' }}>Total Score - {markingData.mark2}%</Form.Label>
                                            <Form.Control
                                                type="number"
                                                value={ImplementationScore.toFixed(1)}
                                                readOnly
                                                style={{ backgroundColor: "#e9ecef", fontWeight: 'bold' }}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                variant="primary"
                                title="Save"
                                onClick={() => handleImplementationSubmit()}
                            >
                                Save
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    {/* Presentation Modal*/}
                    <Modal show={showPresentationModal} onHide={handleClosePresentation} dialogClassName="custom-modal" backdrop="static" keyboard={false}>
                        <Modal.Header closeButton>
                            <Modal.Title style={{ color: 'black' }}>{`${selectedCourseReport} Marking Details`}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form>
                                <h6>Presentation - 20%</h6>
                                <hr style={{ color: "black" }}></hr>

                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_preparation">
                                            <Form.Label style={{ color: 'black' }}>Preparation (5%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Preparation (5%)"
                                                value={FYPData.presentation[0] || ""}
                                                onChange={(e) => {
                                                    let newPresentation = [...FYPData.presentation];
                                                    newPresentation[0] = parseInt(e.target.value) || 0;
                                                    setFYPData(prev => ({ ...prev, presentation: newPresentation }));
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_greeting">
                                            <Form.Label style={{ color: 'black' }}>Greeting (5%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Greeting (5%)"
                                                value={FYPData.presentation[1] || ""}
                                                onChange={(e) => {
                                                    let newPresentation = [...FYPData.presentation];
                                                    newPresentation[1] = parseInt(e.target.value) || 0;
                                                    setFYPData(prev => ({ ...prev, presentation: newPresentation }));
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_body_language">
                                            <Form.Label style={{ color: 'black' }}>Body language / Gesture (5%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Body language / Gesture (5%)"
                                                value={FYPData.presentation[2] || ""}
                                                onChange={(e) => {
                                                    let newPresentation = [...FYPData.presentation];
                                                    newPresentation[2] = parseInt(e.target.value) || 0;
                                                    setFYPData(prev => ({ ...prev, presentation: newPresentation }));
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_eye_contact">
                                            <Form.Label style={{ color: 'black' }}>Eye Contact (5%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Eye Contact (5%)"
                                                value={FYPData.presentation[3] || ""}
                                                onChange={(e) => {
                                                    let newPresentation = [...FYPData.presentation];
                                                    newPresentation[3] = parseInt(e.target.value) || 0;
                                                    setFYPData(prev => ({ ...prev, presentation: newPresentation }));
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_clear_articulation">
                                            <Form.Label style={{ color: 'black' }}>Clear articulatio (5%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Clear articulatio (5%)"
                                                value={FYPData.presentation[4] || ""}
                                                onChange={(e) => {
                                                    let newPresentation = [...FYPData.presentation];
                                                    newPresentation[4] = parseInt(e.target.value) || 0;
                                                    setFYPData(prev => ({ ...prev, presentation: newPresentation }));
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_speed_speech">
                                            <Form.Label style={{ color: 'black' }}>Speed of the speech (2%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Speed of the speech (2%)"
                                                value={FYPData.presentation[5] || ""}
                                                onChange={(e) => {
                                                    let newPresentation = [...FYPData.presentation];
                                                    newPresentation[5] = parseInt(e.target.value) || 0;
                                                    setFYPData(prev => ({ ...prev, presentation: newPresentation }));
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_intonation">
                                            <Form.Label style={{ color: 'black' }}>Intonation (3%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Intonation (3%)"
                                                value={FYPData.presentation[6] || ""}
                                                onChange={(e) => {
                                                    let newPresentation = [...FYPData.presentation];
                                                    newPresentation[6] = parseInt(e.target.value) || 0;
                                                    setFYPData(prev => ({ ...prev, presentation: newPresentation }));
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_content">
                                            <Form.Label style={{ color: 'black' }}>Content (50%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Content (50%)"
                                                value={FYPData.presentation[7] || ""}
                                                onChange={(e) => {
                                                    let newPresentation = [...FYPData.presentation];
                                                    newPresentation[7] = parseInt(e.target.value) || 0;
                                                    setFYPData(prev => ({ ...prev, presentation: newPresentation }));
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_application">
                                            <Form.Label style={{ color: 'black' }}>Application (10%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Application (10%)"
                                                value={FYPData.presentation[8] || ""}
                                                onChange={(e) => {
                                                    let newPresentation = [...FYPData.presentation];
                                                    newPresentation[8] = parseInt(e.target.value) || 0;
                                                    setFYPData(prev => ({ ...prev, presentation: newPresentation }));
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_confirmation">
                                            <Form.Label style={{ color: 'black' }}>Confirmation (10%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Confirmation (10%)"
                                                value={FYPData.presentation[9] || ""}
                                                onChange={(e) => {
                                                    let newPresentation = [...FYPData.presentation];
                                                    newPresentation[9] = parseInt(e.target.value) || 0;
                                                    setFYPData(prev => ({ ...prev, presentation: newPresentation }));
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_total_score" className="mb-3">
                                            <Form.Label style={{ color: 'black', fontWeight: 'bold' }}>Total Score - 100%</Form.Label>
                                            <Form.Control
                                                type="number"
                                                value={totalPresentationScore.toFixed(1)}
                                                readOnly
                                                style={{ backgroundColor: "#e9ecef", fontWeight: 'bold' }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="fyp_score" className="mb-3">
                                            <Form.Label style={{ color: 'black', fontWeight: 'bold' }}>Total Score - {markingData.mark3}%</Form.Label>
                                            <Form.Control
                                                type="number"
                                                value={PresentationScore.toFixed(1)}
                                                readOnly
                                                style={{ backgroundColor: "#e9ecef", fontWeight: 'bold' }}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                variant="primary"
                                title="Save"
                                onClick={() => handlePresentationSubmit()}
                            >
                                Save
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    {/* Progress Bar*/}
                    <Modal show={isDownloading} backdrop="static" keyboard={false} centered>
                        <Modal.Header closeButton={false}>
                            <Modal.Title style={{ color: 'black' }}>{`Generating Report for ${selectedCourseReport}`}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body style={{ color: 'black' }}>
                            <p>Please wait while generating PDFs for all students...</p>
                            <ProgressBar now={downloadProgress} label={`${downloadProgress}%`} />
                        </Modal.Body>
                    </Modal>

                    {/* Ranked Results Modal */}
                    <Modal
                        show={showRankModal}
                        onHide={() => setShowRankModal(false)}
                        size="lg"
                        centered
                    >
                        <Modal.Header closeButton>
                            <Modal.Title style={{ color: 'Black' }}>Ranked Exam Results for {selectedCourseReport}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {rankedResults.length > 0 ? (
                                <Table striped bordered hover>
                                    <thead>
                                        <tr style={{ textAlign: "center" }}>
                                            <th>Trophy</th>
                                            <th>Rank</th>
                                            <th>Student Name</th>
                                            <th>Student ID</th>
                                            <th>Exam Result (%)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rankedResults.map((student) => (
                                            <tr key={student.studentID} style={{ textAlign: "center" }}>
                                                <td>
                                                    <FontAwesomeIcon
                                                        icon={faTrophy}
                                                        style={{
                                                            color:
                                                                student.rank === 1
                                                                    ? "#FFD700"
                                                                    : student.rank === 2
                                                                        ? "#C0C0C0"
                                                                        : student.rank === 3
                                                                            ? "#CD7F32"
                                                                            : "#808080",
                                                        }}
                                                    />
                                                </td>
                                                <td>
                                                    {student.rank === 1
                                                        ? "1st"
                                                        : student.rank === 2
                                                            ? "2nd"
                                                            : student.rank === 3
                                                                ? "3rd"
                                                                : `${student.rank}th`}
                                                </td>
                                                <td>{student.studentName}</td>
                                                <td>{student.studentID}</td>
                                                <td>{student.examResult}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <div style={{ textAlign: "center", fontWeight: "bold", padding: "20px", color: 'black' }}>
                                    No Record Found
                                </div>
                            )}
                        </Modal.Body>
                    </Modal>
                </div>
            </div>
        </div>
    );
}