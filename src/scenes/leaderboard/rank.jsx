import React, { useState, useEffect, useContext } from 'react';
import { useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, Cell, Legend, ResponsiveContainer } from 'recharts';
import { Button, Modal, Tooltip as BootstrapTooltip, OverlayTrigger } from 'react-bootstrap';
import { faRefresh, faTrophy, faBarChart, faExclamationCircle, faFilter, faGear, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import Sidebar from "../global/Sidebar";
import SidebarEmployee from "../global/SidebarEmployee";
import Topbar from "../global/Topbar";
import TopbarEmployee from '../global/TopbarEmployee';
import { employeeLocalhost } from '../../localhost/employeeLocalhost';
import Cookies from 'js-cookie';
import { adminLocalhost } from '../../localhost/adminLocalhost';
import { studentLocalhost } from '../../localhost/studentLocalhost';
import { LeaderboardContext } from '../leaderboard/LeaderboardContext';

export default function Rank() {

  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCalculationModal, setShowCalculationModal] = useState(false);
  const [calculationStudent, setCalculationStudent] = useState(null);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [tempSelectedCourses, setTempSelectedCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedIntakes, setSelectedIntakes] = useState([]);
  const [tempSelectedProgram, setTempSelectedProgram] = useState('');
  const [tempSelectedIntakes, setTempSelectedIntakes] = useState([]);
  const [availableIntakes, setAvailableIntakes] = useState([]);
  const { showLeaderboardModal, setShowLeaderboardModal, showExamDetails, setShowExamDetails } = useContext(LeaderboardContext);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const response = await axios.get(`${employeeLocalhost}/examResult/getExamResultDetails`);
      setData(response.data);
    } catch (error) {
      console.error('Error occurred while fetching student details:', error);
    }
  };

  const loadCourses = async () => {
    try {
      const response = await axios.get(`${adminLocalhost}/course/progCourse`);
      setAvailableCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const loadIntakes = async () => {
    try {
      const response = await axios.get(`${studentLocalhost}/student/student-program-enroll-date`);
      setAvailableIntakes(response.data);
    } catch (error) {
      console.error("Error loading intakes:", error);
    }
  };

  useEffect(() => {
    loadData();
    loadCourses();
    loadIntakes();
  }, []);

  /*const rankedData = useMemo(() => {
    const grouped = Object.values(
      data.reduce((acc, curr) => {
        const key = `${curr.examStdID}-${curr.examStdName}-${curr.examProgram}`;
        if (!acc[key]) {
          acc[key] = {
            examStdID: curr.examStdID,
            examStdName: curr.examStdName,
            examProgram: curr.examProgram,
            examStdIntake: curr.examStdIntake,
            examCourses: [],
            examPoints: [],
            examTotalScore: [],
            examGrades: [],
            avgPoints: 0,
            weightedPoints: 0
          };
        }
        acc[key].examCourses.push(curr.examCourseCode);
        acc[key].examPoints.push(Number(curr.examPoints));
        acc[key].examTotalScore.push(curr.examTotalScore);
        acc[key].examGrades.push(curr.examTotalGrade);
        return acc;
      }, {})
    );

    const updated = grouped.map((item) => {
      const pointsToUse =
        selectedCourses.length > 0
          ? item.examCourses
            .map((course, i) =>
              selectedCourses.includes(course) ? item.examPoints[i] : null
            )
            .filter((p) => p !== null)
          : item.examPoints;

      const total = pointsToUse.reduce((sum, p) => sum + p, 0);
      item.avgPoints = pointsToUse.length ? total / pointsToUse.length : 0;
      item.weightedPoints = item.avgPoints + 0.5 * pointsToUse.length;

      return item;
    });

    const filteredByCourses =
      selectedCourses.length > 0
        ? updated.filter((item) => {
          return item.examCourses.some((course) =>
            selectedCourses.includes(course)
          );
        })
        : updated;

    const sorted = [...filteredByCourses].sort(
      (a, b) => b.weightedPoints - a.weightedPoints
    );
    sorted.forEach((item, index) => {
      item.rank = index + 1;
    });

    return sorted;
  }, [data, selectedCourses]);*/

  const rankedData = useMemo(() => {
    // group
    const grouped = Object.values(
      data.reduce((acc, curr) => {
        const key = `${curr.examStdID}-${(curr.examProgram || '').trim()}`;
        if (!acc[key]) {
          acc[key] = {
            examStdID: curr.examStdID,
            examStdName: curr.examStdName,
            examProgram: curr.examProgram,
            examStdIntake: curr.examStdIntake,
            examCourses: [],
            examPoints: [],
            examTotalScore: [],
            examGrades: [],
            avgPoints: 0,
            weightedPoints: 0,
          };
        }
        acc[key].examCourses.push(curr.examCourseCode);
        acc[key].examPoints.push(Number(curr.examPoints));
        acc[key].examTotalScore.push(curr.examTotalScore);
        acc[key].examGrades.push(curr.examTotalGrade);
        return acc;
      }, {})
    );

    // compute points without mutating
    const updated = grouped.map((item) => {
      const pointsToUse =
        selectedCourses.length > 0
          ? item.examCourses
            .map((course, i) => (selectedCourses.includes(course) ? item.examPoints[i] : null))
            .filter((p) => p !== null)
          : item.examPoints;

      const total = pointsToUse.reduce((sum, p) => sum + p, 0);
      const avgPoints = pointsToUse.length ? total / pointsToUse.length : 0;
      const weightedPoints = avgPoints + 0.5 * pointsToUse.length;

      return {
        ...item,
        avgPoints,
        weightedPoints,
      };
    });

    const filteredByCourses =
      selectedCourses.length > 0
        ? updated.filter((item) => item.examCourses.some((course) => selectedCourses.includes(course)))
        : updated;

    // sort & assign rank (create new objects)
    const sorted = [...filteredByCourses].sort((a, b) => b.weightedPoints - a.weightedPoints);
    return sorted.map((item, idx) => ({ ...item, rank: idx + 1 }));
  }, [data, selectedCourses]);

  const groupedData = Object.values(
    data.reduce((acc, curr) => {
      const key = `${curr.examStdID}-${(curr.examProgram || '').trim()}`;
      if (!acc[key]) {
        acc[key] = {
          examStdID: curr.examStdID,
          examStdName: curr.examStdName,
          examProgram: curr.examProgram,
          examCourses: [],
          examPoints: [],
          examTotalScore: [],
          examGrades: [],
          avgPoints: 0
        };
      }
      acc[key].examCourses.push(curr.examCourseCode);
      acc[key].examPoints.push(Number(curr.examPoints));
      acc[key].examTotalScore.push(curr.examTotalScore);
      acc[key].examGrades.push(curr.examTotalGrade);
      return acc;
    }, {})
  ).map((item) => {
    const total = item.examPoints.reduce((sum, p) => sum + p, 0);
    item.avgPoints = item.examPoints.length ? total / item.examPoints.length : 0;

    /*const weightedTotal = item.examPoints.reduce(
      (sum, p, i) => sum + p * (i + 1),
      0
    );

    item.weightedPoints = weightedTotal;*/

    item.weightedPoints = item.avgPoints + (0.5 * item.examPoints.length); //Average + Small Bonus for More Exams

    return item;
  });

  const sortedGroupedData = [...groupedData].sort(
    (a, b) => b.weightedPoints - a.weightedPoints
  );

  sortedGroupedData.forEach((item, index) => {
    item.rank = index + 1;
  });

  /*const filteredData = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    const filtered = rankedData.filter((item) => {
      const matchSearch =
        !search ||
        item.examStdID.toLowerCase().includes(search) ||
        item.examStdName.toLowerCase().includes(search) ||
        item.examProgram.toLowerCase().includes(search);

      const matchProgram = !selectedProgram || item.examProgram?.trim().toLowerCase() === selectedProgram.toLowerCase();

      const matchIntake =
        selectedIntakes.length === 0 || selectedIntakes.includes(item.examStdIntake);

      return matchSearch && matchProgram && matchIntake;
    });

    filtered.forEach((item, index) => {
      item.localRank = index + 1;
    });

    return filtered;
  }, [rankedData, searchTerm, selectedProgram, selectedIntakes]);*/

  const filteredData = useMemo(() => {
    const search = (searchTerm || '').toLowerCase().trim();
    const progSel = (selectedProgram || '').trim().toLowerCase();
    const intakeSet = new Set((selectedIntakes || []).map(s => (s || '').trim()));

    const filtered = rankedData.filter((item) => {
      const id = (item.examStdID || '').toLowerCase();
      const name = (item.examStdName || '').toLowerCase();
      const prog = (item.examProgram || '').trim().toLowerCase();
      const intake = (item.examStdIntake || '').trim();

      const matchSearch =
        !search || id.includes(search) || name.includes(search) || prog.includes(search);

      const matchProgram = !progSel || prog === progSel;

      const matchIntake = intakeSet.size === 0 || intakeSet.has(intake);

      return matchSearch && matchProgram && matchIntake;
    });

    // local, contiguous ranks for the filtered subset
    return filtered.map((it, i) => ({ ...it, localRank: i + 1 }));
  }, [rankedData, searchTerm, selectedProgram, selectedIntakes]);

  const handlePerformance = (item) => {
    setSelectedStudent(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  const getChartData = () => {
    if (!selectedStudent) return [];

    return selectedStudent.examTotalScore.map((score, index) => {
      let displayScore = 0;
      if (!isNaN(parseFloat(score))) {
        displayScore = parseFloat(score);
      } else if (score === "Pass") {
        displayScore = 50;
      } else if (score === "Fail") {
        displayScore = 10;
      }
      return {
        exam: selectedStudent.examCourses[index] || `Exam ${index + 1}`,
        score: displayScore,
        label: score // keep original text for tooltip
      };
    });
  };

  const renderCustomLegend = () => {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginRight: '15px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#007bff', marginRight: '5px' }}></div>
          <span>Pass</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginRight: '15px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#dc3545', marginRight: '5px' }}></div>
          <span>Fail</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#28a745', marginRight: '5px' }}></div>
          <span>Exam Result</span>
        </div>
      </div>
    );
  };

  const viewCalculation = async (item) => {
    try {
      const response = await axios.get(
        `${employeeLocalhost}/attendanceEligible/getAttendanceEligiblePercentageFromStudentID/${item.examStdID}`
      );

      const attendanceData = response.data;

      const attendanceMap = {};
      attendanceData.forEach(record => {
        attendanceMap[record.eligibleStudentCourseID] = parseFloat(record.eligiblePercentage);
      });

      const updatedStudent = {
        ...item,
        attendancePercentages: item.examCourses.map(
          (courseID) => attendanceMap[courseID] || 0
        )
      };

      setCalculationStudent(updatedStudent);
      setShowCalculationModal(true);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  };

  const closeCalculationModal = () => {
    setShowCalculationModal(false);
    setCalculationStudent(null);
  };

  const getCalculationDetails = () => {
    if (!calculationStudent) return [];

    return calculationStudent.examPoints.map((points, index) => {
      const examName = calculationStudent.examCourses[index] || `Exam ${index + 1}`;
      const order = index + 1;
      const grade = calculationStudent.examGrades[index] || "-";
      const attendancePercentage = calculationStudent.attendancePercentages?.[index] || 0;
      return {
        examName,
        grade,
        attendancePercentage,
        points,
        order,
        total: points * order
      };
    });
  };

  const gradeTooltip = (
    <BootstrapTooltip id="grade-tooltip">
      <div style={{ textAlign: "left", display: "inline-block" }}>
        <div style={{ display: "flex", justifyContent: "space-between", width: "58px" }}>
          <span>A+</span> <span>= 10</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", width: "50px" }}>
          <span>A</span> <span>= 9</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", width: "50px" }}>
          <span>A-</span> <span>= 8</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", width: "50px" }}>
          <span>B+</span> <span>= 7</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", width: "50px" }}>
          <span>B</span> <span>= 6</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", width: "50px" }}>
          <span>B-</span> <span>= 5</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", width: "50px" }}>
          <span>C+</span> <span>= 4</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", width: "50px" }}>
          <span>C</span> <span>= 3</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", width: "50px" }}>
          <span>C-</span> <span>= 2</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", width: "56px" }}>
          <span>F</span> <span>= -5</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", width: "50px" }}>
          <span>P</span> <span>= 1</span>
        </div>
      </div>
    </BootstrapTooltip >
  );

  const attendanceTooltip = (
    <BootstrapTooltip id="grade-tooltip">
      <div style={{ textAlign: "left", display: "inline-block" }}>
        <div style={{ display: "flex", justifyContent: "space-between", width: "108px" }}>
          <span>100%</span> <span>= 10</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", width: "100px" }}>
          <span>90% - 99%</span> <span>= 7</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", width: "100px" }}>
          <span>80% - 89%</span> <span>= 5</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", width: "106px" }}>
          <span>&lt; 80%</span> <span>= -3</span>
        </div>
      </div>
    </BootstrapTooltip >
  );

  const pointsTooltip = (
    <BootstrapTooltip id="grade-tooltip">
      <div style={{ textAlign: "left", display: "inline-block" }}>
        <div style={{ display: "flex", justifyContent: "space-between", width: "128px" }}>
          <span>Grade + Attendance</span>
        </div>
      </div>
    </BootstrapTooltip >
  );

  const totalTooltip = (
    <BootstrapTooltip id="grade-tooltip">
      <div style={{ textAlign: "left", display: "inline-block" }}>
        <div style={{ display: "flex", justifyContent: "space-between", width: "95px" }}>
          <span>Points x Order</span>
        </div>
      </div>
    </BootstrapTooltip >
  );

  const handleGenerate = async () => {
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await fetch(`${employeeLocalhost}/examResult/generatePoints`, {
        method: "PUT",
      });

      await Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Points generated successfully!',
        showConfirmButton: false,
        timer: 1500
      });

      loadData();
    } catch (err) {
      console.error(err);
      await Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'Error generating points!',
        showConfirmButton: false,
        timer: 1500
      });

      loadData();
    } finally {
      setLoading(false);
    }
  };

  const programToIntakes = useMemo(() => {
    const map = new Map(); // program -> Set of intakes
    data.forEach((row) => {
      if (!row.examProgram || !row.examStdIntake) return;
      const prog = row.examProgram.trim();
      if (!map.has(prog)) map.set(prog, new Set());
      map.get(prog).add(row.examStdIntake);
    });
    return map;
  }, [data]);

  const programToCourses = useMemo(() => {
    const map = new Map(); // program -> Set of course codes
    data.forEach((row) => {
      if (!row.examProgram || !row.examCourseCode) return;
      const prog = row.examProgram.trim();
      if (!map.has(prog)) map.set(prog, new Set());
      map.get(prog).add(row.examCourseCode);
    });
    return map;
  }, [data]);

  const clearAllFilters = () => {
    setTempSelectedCourses([]);
    setTempSelectedProgram('');
    setTempSelectedIntakes([]);
    setSelectedCourses([]);
    setSelectedProgram('');
    setSelectedIntakes([]);
    setSearchTerm(''); // optional reset
    setShowCourseModal(false);
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
            <h2 className="fs-2 m-0">LEADERBOARD {/*<p style={{fontSize: '20px', marginBottom: "-10px"}}>Formula: Points = Average(Exam Points + Attendance Points) + (0.1 × Total Exams)</p>*/}</h2>
          </div>
          <div className="employeeHomediv2 d-flex justify-content-between align-items-center">
            <div className="d-flex custom-margin">
              <input
                type="text"
                placeholder="Search by Name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginRight: '10px' }}
              />
              <Button id='btnRefresh' title='Refresh' className='btn btn-contact me-1' onClick={() => window.location.reload()}><FontAwesomeIcon icon={faRefresh} /></Button>
              <Button
                variant="secondary"
                className='btn btn-contact me-1'
                title='Filter'
                onClick={() => {
                  setTempSelectedCourses(selectedCourses);
                  setTempSelectedProgram(selectedProgram);
                  setTempSelectedIntakes(selectedIntakes);
                  setShowCourseModal(true);
                }}
              >
                <FontAwesomeIcon icon={faFilter} />
              </Button>
              <Button
                variant="info"
                className='btn btn-contact me-1'
                title="Generate Points"
                onClick={handleGenerate}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faGear} spin={loading} style={{ color: "white" }} />
              </Button>
              <Button
                title="SPM Rank"
                className="btn btn-secondary"
                onClick={() => navigate("/spmRank")}
              >
                <FontAwesomeIcon icon={faArrowRight} />
              </Button>
            </div>
          </div>

          {/* Table */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <table className="styled-table" style={{ width: '80%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "center" }}>Trophy</th>
                  <th style={{ textAlign: "center" }}>Rank</th>
                  <th style={{ textAlign: "center" }}>Program</th>
                  <th style={{ textAlign: "center" }}>Student Name</th>
                  <th style={{ textAlign: "center" }}>Student ID</th>
                  <th style={{ textAlign: "center" }}>Intake</th>
                  {showExamDetails && (
                    <>
                      <th style={{ textAlign: "center" }}>Exam Course</th>
                      <th style={{ textAlign: "center" }}>Exam Points</th>
                    </>
                  )}
                  <th style={{ textAlign: "center" }}>Points</th>
                  <th style={{ textAlign: "center" }}>Performance</th>
                </tr>
              </thead>
              <tbody>
                {/*{filteredData
                  .filter(item => !selectedProgram || item.examProgram?.trim().toLowerCase() === selectedProgram.toLowerCase())
                  .map((item, index)*/} {filteredData.map((item) => {
                  const rank = item.localRank;
                  return (
                    <tr key={`${item.examStdID}-${item.examProgram}`}>
                      {/* Trophy */}
                      <td style={{ textAlign: "center" }}>
                        <FontAwesomeIcon
                          icon={faTrophy}
                          style={{
                            color:
                              rank === 1
                                ? "#FFD700" // Gold
                                : rank === 2
                                  ? "#C0C0C0" // Silver
                                  : rank === 3
                                    ? "#CD7F32" // Bronze
                                    : "#808080", // Grey for others
                          }}
                        />
                      </td>

                      {/* Rank */}
                      <td style={{ textAlign: "center" }}>
                        {rank === 1
                          ? "1st"
                          : rank === 2
                            ? "2nd"
                            : rank === 3
                              ? "3rd"
                              : `${rank}th`}
                      </td>

                      <td>{item.examProgram}</td>
                      <td>{item.examStdName}</td>
                      <td>{item.examStdID}</td>
                      <td style={{ textAlign: "center" }}>{item.examStdIntake}</td>
                      {showExamDetails && (
                        <>
                          <td>{item.examCourses.join(", ")}</td>
                          <td>{item.examPoints.join(", ")}</td>
                        </>
                      )}
                      <td>{item.weightedPoints ? item.weightedPoints.toFixed(2) : "-"}</td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-1">
                          <Button
                            variant="primary"
                            title="Performance"
                            style={{ fontSize: "10px" }}
                            onClick={() => handlePerformance(item)}
                          >
                            <FontAwesomeIcon icon={faBarChart} />
                          </Button>
                          <Button
                            variant="info"
                            title="Calculation"
                            style={{ fontSize: "10px" }}
                            onClick={() => viewCalculation(item)}
                          >
                            <FontAwesomeIcon icon={faExclamationCircle} style={{ color: 'White' }} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Performance Modal */}
      <Modal show={showModal} onHide={closeModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ color: 'Black' }}>
            Performance - {selectedStudent?.examStdName} ({selectedStudent?.examStdID})
            {selectedStudent?.examPoints?.length > 0 && (
              <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>
                Total number of exam: {selectedStudent.examPoints.length}
              </p>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedStudent && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="exam" interval={0} angle={-30} textAnchor="end" />
                <YAxis domain={[0, 100]} />
                <RechartsTooltip formatter={(value, name, props) => [`${props.payload.label}%`, "Score"]} />
                <Legend wrapperStyle={{ color: '#000', fontSize: 14 }} content={renderCustomLegend} />
                <Bar dataKey="score" name="Exam Performance">
                  {getChartData().map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.label === "Pass"
                          ? "#007bff"
                          : entry.label === "Fail"
                            ? "#dc3545"
                            : "#28a745"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Modal.Body>
      </Modal>

      {/* Calculation Modal */}
      <Modal show={showCalculationModal} onHide={closeCalculationModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title style={{ color: 'Black' }}>
            Calculation - {calculationStudent?.examStdName} ({calculationStudent?.examStdID})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {calculationStudent && (
            <>
              <p style={{ fontWeight: "bold", color: 'Black' }}>
                Formula: Average(Grade Points + Attendance Points) + (0.5 × Total Exams)
              </p>
              <table className="table table-bordered">
                <thead>
                  <tr style={{ textAlign: 'center' }}>
                    <th>Exam</th>
                    <th>
                      Grade{" "}
                      <OverlayTrigger placement="bottom" overlay={gradeTooltip}>
                        <FontAwesomeIcon
                          icon={faExclamationCircle}
                          style={{ cursor: "pointer", color: "#007bff" }}
                        />
                      </OverlayTrigger>
                    </th>
                    <th>
                      Attendance{" "}
                      <OverlayTrigger placement="bottom" overlay={attendanceTooltip}>
                        <FontAwesomeIcon
                          icon={faExclamationCircle}
                          style={{ cursor: "pointer", color: "#007bff" }}
                        />
                      </OverlayTrigger>
                    </th>
                    <th>
                      Points{" "}
                      <OverlayTrigger placement="bottom" overlay={pointsTooltip}>
                        <FontAwesomeIcon
                          icon={faExclamationCircle}
                          style={{ cursor: "pointer", color: "#007bff" }}
                        />
                      </OverlayTrigger>
                    </th>
                    {/*<th>Order</th>
                    <th>
                      Total{" "}
                      <OverlayTrigger placement="bottom" overlay={totalTooltip}>
                        <FontAwesomeIcon
                          icon={faExclamationCircle}
                          style={{ cursor: "pointer", color: "#007bff" }}
                        />
                      </OverlayTrigger>
                    </th>*/}
                  </tr>
                </thead>
                <tbody style={{ textAlign: 'center' }}>
                  {getCalculationDetails().map((item, index) => (
                    <tr key={index}>
                      <td>{item.examName}</td>
                      <td>{item.grade}</td>
                      <td>{item.attendancePercentage}%</td>
                      <td>{item.points}</td>
                      {/*<td>{item.order}</td>
                      <td>{item.total}</td>*/}
                    </tr>
                  ))}
                </tbody>
              </table>
              <h6 style={{ textAlign: "right", fontWeight: "bold", color: "Black" }}>
                Average Points:{" "}
                {(
                  calculationStudent.examPoints.reduce((sum, p) => sum + p, 0) /
                  calculationStudent.examPoints.length
                ).toFixed(2)}
              </h6>

              <h6 style={{ textAlign: "right", fontWeight: "bold", color: "Black" }}>
                0.5 × Total Exams: {(0.5 * calculationStudent.examPoints.length).toFixed(2)}
              </h6>

              <h6 style={{ textAlign: "right", fontWeight: "bold", color: "Black" }}>
                Weighted Points: {calculationStudent.weightedPoints?.toFixed(2)}
              </h6>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Filter Modal */}
      <Modal show={showCourseModal} onHide={() => setShowCourseModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ color: "Black" }}>Filter Ranked</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Program Filter */}
          <div className="mb-3">
            <label className="form-label" style={{ color: "Black" }}>Select Program</label>
            <select
              className="form-select"
              value={tempSelectedProgram}
              onChange={(e) => setTempSelectedProgram(e.target.value)}
            >
              <option value="">All Programs</option>
              {["DSE", "DIP", "DSG", "DIT", "DSEPT", "DIPPT", "DSGPT", "DITPT", "CITS1", "CITS2"].map((prog) => (
                <option key={prog} value={prog}>{prog}</option>
              ))}
            </select>
          </div>

          {/* Intake Filter */}
          <div className="mb-3">
            <label className="form-label" style={{ color: "Black" }}>Select Intakes</label>
            <select
              multiple
              className="form-select"
              style={{ height: "150px" }}
              value={tempSelectedIntakes}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                setTempSelectedIntakes(selected);
              }}
            >
              {availableIntakes
                .map((item) => item.studentIntake)
                .filter((intake, index, self) => intake && self.indexOf(intake) === index) // unique non-empty
                .sort((a, b) => {
                  const parse = (s) => {
                    if (!s) return { year: 0, month: 0 };
                    const safe = s.replace("`", "-");
                    const [monthStr, yearStrRaw] = safe.split("-");
                    const monthOrder = {
                      Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
                      jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
                    };
                    const m = monthOrder[monthStr] || 0;
                    const yy = (yearStrRaw || '').trim();
                    const year = /^\d{2}$/.test(yy) ? parseInt(`20${yy}`, 10) : parseInt(yy || '0', 10) || 0;
                    return { year, month: m };
                  };
                  {/*const parse = (s) => {
                    const [monthStr, yearStr] = s.replace("`", "-").split("-");
                    const monthOrder = {
                      Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
                      Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
                      jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
                      jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
                    };
                    return {
                      year: parseInt(`20${yearStr}`),
                      month: monthOrder[monthStr] || 0
                    };
                  };*/}

                  const dateA = parse(a);
                  const dateB = parse(b);
                  if (dateA.year !== dateB.year) return dateA.year - dateB.year;
                  return dateA.month - dateB.month;
                })
                .map((intake) => (
                  <option key={intake} value={intake}>
                    {intake}
                  </option>
                ))}
            </select>
          </div>

          {/* Course Filter */}
          <label className="form-label" style={{ color: "Black" }}>Select Courses</label>
          <select
            multiple
            className="form-select"
            style={{ height: "200px" }}
            value={tempSelectedCourses}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, (option) => option.value);
              setTempSelectedCourses(selected);
            }}
          >
            {availableCourses.map((course, idx) => (
              <option key={idx} value={course}>
                {course}
              </option>
            ))}
          </select>
          <p style={{ marginTop: "10px", fontSize: "12px", color: "#555" }}>
            Hold CTRL (Windows) or CMD (Mac) to select multiple courses
          </p>
        </Modal.Body>
        <Modal.Footer>
          {/*<Button
            variant="primary"
            onClick={() => {
              setSelectedCourses(tempSelectedCourses);
              setSelectedProgram(tempSelectedProgram);
              setSelectedIntakes(tempSelectedIntakes);
              setShowCourseModal(false);
            }}
          >
            Apply Filter
          </Button>*/}
          <Button
            variant="primary"
            onClick={() => {
              // Program ↔ Intake/Course validation (as you already have)
              if (tempSelectedProgram) {
                const allowedIntakes = programToIntakes.get(tempSelectedProgram) || new Set();
                const invalidIntakes = tempSelectedIntakes.filter((i) => !allowedIntakes.has(i));
                if (invalidIntakes.length > 0) {
                  Swal.fire({
                    icon: 'warning',
                    title: 'No Results',
                    text: `Program "${tempSelectedProgram}" does not have intake(s): ${invalidIntakes.join(", ")}`,
                  });
                  return;
                }

                const allowedCourses = programToCourses.get(tempSelectedProgram) || new Set();
                const invalidCourses = tempSelectedCourses.filter((c) => !allowedCourses.has(c));
                if (invalidCourses.length > 0) {
                  Swal.fire({
                    icon: 'warning',
                    title: 'No Results',
                    text: `Program "${tempSelectedProgram}" does not offer course(s): ${invalidCourses.join(", ")}`,
                  });
                  return;
                }
              }

              // 🛡️ Predict results after applying to avoid confusing ranks
              const progSel = (tempSelectedProgram || '').trim().toLowerCase();
              const intakeSet = new Set((tempSelectedIntakes || []).map(s => (s || '').trim()));
              const wouldShow = rankedData.filter((item) => {
                const prog = (item.examProgram || '').trim().toLowerCase();
                const intake = (item.examStdIntake || '').trim();
                const matchProgram = !progSel || prog === progSel;
                const matchIntake = intakeSet.size === 0 || intakeSet.has(intake);
                return matchProgram && matchIntake;
              }).length;

              if (wouldShow === 0) {
                Swal.fire({
                  icon: 'info',
                  title: 'No Results',
                  text: 'No student matches the selected Program/Intake (and Courses). Try different filters.',
                });
                return;
              }

              // ✅ Apply
              setSelectedCourses(tempSelectedCourses);
              setSelectedProgram(tempSelectedProgram);
              setSelectedIntakes(tempSelectedIntakes);
              setShowCourseModal(false);
            }}
          >
            Apply Filter
          </Button>
          <Button variant="outline-danger" onClick={clearAllFilters}>
            Clear Filter
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Leaderboard setting Modal */}
      <Modal show={showLeaderboardModal} onHide={() => setShowLeaderboardModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ color: "Black" }}>Leaderboard Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ color: "Black" }}>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="toggleExamDetails"
              checked={showExamDetails}
              onChange={() => setShowExamDetails(!showExamDetails)}
            />
            <label className="form-check-label" htmlFor="toggleExamDetails">
              Show Exam Courses & Points
            </label>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}