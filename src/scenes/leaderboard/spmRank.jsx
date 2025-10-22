import React, { useState, useEffect } from 'react';
import { useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Tooltip as BootstrapTooltip, OverlayTrigger } from 'react-bootstrap';
import { faRefresh, faTrophy, faArrowLeft, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import Sidebar from "../global/Sidebar";
import SidebarEmployee from "../global/SidebarEmployee";
import Topbar from "../global/Topbar";
import TopbarEmployee from '../global/TopbarEmployee';
import { employeeLocalhost } from '../../localhost/employeeLocalhost';
import Cookies from 'js-cookie';

export default function Rank() {

  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const response = await axios.get(`${employeeLocalhost}/student/getStudentDetails`);
      setData(response.data);
    } catch (error) {
      console.error('Error occurred while fetching student details:', error);
    }
  };  

  useEffect(() => {
    loadData();
  }, []); 

  const gradePointMap = {
    "A+": 9, "A": 8, "A-": 7,
    "B+": 6, "B": 5,  "C+": 4, 
    "C": 3,  "D": 2, "E": 1, "G": -5
  };

  const rankedData = useMemo(() => {
    const acc = {};

    data.forEach(curr => {
      if (!acc[curr.studentNewStdID]) {
        const grades = curr.spmGrade ? curr.spmGrade.split(',').map(g => g.trim()) : [];
        const subjects = curr.spmSubject ? curr.spmSubject.split(',').map(s => s.trim()) : [];
        const gradePoints = grades.map(g => gradePointMap[g] ?? 0);
        const totalPoints = gradePoints.reduce((sum, val) => sum + val, 0);
        const avgPoints = gradePoints.length > 0
          ? gradePoints.reduce((sum, val) => sum + val, 0) / gradePoints.length
          : 0;

        acc[curr.studentNewStdID] = {
          studentNewStdID: curr.studentNewStdID,
          studentName: curr.studentName,
          studentProgram: curr.studentProgram,
          spmSubject: subjects,
          spmGrade: grades,
          gradePoints,
          avgPoints,
          totalPoints
        };
      }
    });

    const grouped = Object.values(acc);

    const sorted = [...grouped].sort((a, b) => b.avgPoints - a.avgPoints);
    sorted.forEach((item, index) => {
      item.rank = index + 1;
    });

    return sorted;
  }, [data]);

  const groupedData = Object.values(
    data.reduce((acc, curr) => {
      const key = `${curr.examStdID}-${curr.examStdName}-${curr.examProgram}`;
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

  const filteredData = rankedData.filter((item) => {
    const search = searchTerm.toLowerCase().trim();
    return (
      !search ||
      item.studentNewStdID.toLowerCase().includes(search) ||
      item.studentName.toLowerCase().includes(search) ||
      item.studentProgram.toLowerCase().includes(search)
    );
  });

  const gradeTooltip = (
    <BootstrapTooltip  id="grade-tooltip">
      <div style={{ textAlign: "left", display: "inline-block" }}>
        <div style={{ display: "flex", justifyContent: "space-between", width: "58px" }}>
          <span>A+</span> <span>= 9</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", width: "50px" }}>
          <span>A</span> <span>= 8</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", width: "50px" }}>
          <span>A-</span> <span>= 7</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", width: "50px" }}>
          <span>B+</span> <span>= 6</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", width: "50px" }}>
          <span>B</span> <span>= 5</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", width: "50px" }}>
          <span>C+</span> <span>= 4</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", width: "50px" }}>
          <span>C</span> <span>= 3</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", width: "50px" }}>
          <span>D</span> <span>= 2</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", width: "56px" }}>
          <span>E</span> <span>= 1</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", width: "50px" }}>
          <span>G</span> <span>= -5</span>
        </div>
      </div>
    </BootstrapTooltip >
  );

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
            <h2 className="fs-2 m-0">SPM LEADERBOARD </h2>
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
                  title="Back"
                  className="btn btn-secondary"
                  onClick={() => navigate("/leaderboard")}
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
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
                  {/*<th style={{ textAlign: "center" }}>Program</th>*/}
                  <th style={{ textAlign: "center" }}>Student Name</th>
                  <th style={{ textAlign: "center" }}>Student ID</th>
                  <th style={{ textAlign: "center" }}>SPM Subject</th>
                  <th style={{ textAlign: "center" }}>SPM Grade</th>
                  <th style={{ textAlign: "center" }}>
                    Points{' '}
                    <OverlayTrigger placement="bottom" overlay={gradeTooltip}>
                      <FontAwesomeIcon icon={faExclamationCircle} style={{ color: "#007bff", cursor: "pointer" }} />
                    </OverlayTrigger>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => {
                  const rank = item.rank;
                  return (
                    <tr key={`${item.studentNewStdID}-${item.studentProgram}`}>
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

                      {/*<td>{item.studentProgram}</td>*/}
                      <td>{item.studentName}</td>
                      <td>{item.studentNewStdID}</td>
                      <td>{item.spmSubject.join(", ")}</td>
                      <td>{item.spmGrade.join(", ")}</td>
                      <td>{item.totalPoints}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}