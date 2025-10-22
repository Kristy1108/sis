import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./scenes/mainHome/MainHome";
import SchoolHome from "./scenes/school/schoolHome";
import ManageCourse from "./scenes/course/managecourse";
import ManageMarkingScheme from "./scenes/course/managemarkingScheme";
import ManageClassTime from "./scenes/classTime/manageclassTime";
import ManageIntake from "./scenes/intake/manageIntake";
import ManageAdmin from "./scenes/admin/manageAdmin";
import ManageEmployee from "./scenes/info/manageEmployee";
import ManageClass from "./scenes/class/manageClass";
import ManageLesson from "./scenes/lesson/managelesson";
import ManageStudent from "./scenes/student/managestudent";
import ManageProgram from "./scenes/student/manageProgram";
import StudentLogin from "./scenes/student/studentLogin";
import Setting from "./scenes/setting/setting";
import StudentHome from "./scenes/student/studentHome";
import SchoolLogin from "./scenes/school/schoolLogin";
import EmployeeLogin from "./scenes/employee/employeeLogin";
import EmployeeHome from "./scenes/employee/employeeHome";
import ManageAttendance from './scenes/employee/manageAttendance';
import KnownIssue from './scenes/issue/knownIssue';
import StudentTranscript from './scenes/transcript/studentTranscript';
import StudentAttendance from './scenes/student/studentAttendance';
import StudentExamResult from './scenes/student/studentExamResult';
import StudentLeave from './scenes/student/studentLeave';
import ExamResult from "./scenes/result/examResult";
import Rank from "./scenes/leaderboard/rank";
import SPMRank from "./scenes/leaderboard/spmRank";
import ExamPaper from "./scenes/result/examPaper";
import MarkingScheme from "./scenes/result/markingScheme";
import ManageTime from "./scenes/time/manageTime";
import ManageFeedback from "./scenes/feedback/manageFeedback";
import ManageAdminFeedback from "./scenes/feedback/manageAdminFeedback";
import Test from "./scenes/test/test";
import Program from "./scenes/program/program";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import PrivateEmployeeRoutes from './components/Utils/PrivateEmployeeRoutes';
import PrivateSchoolRoutes from './components/Utils/PrivateSchoolRoutes';
import PrivateStudentRoutes from './components/Utils/PrivateStudentRoutes';
import { LeaderboardProvider } from "./scenes/leaderboard/LeaderboardContext";
import Cookies from "js-cookie";

const App = () => {
  const [theme, colorMode] = useMode();
  const [isSchoolUser, setIsSchoolUser] = useState(false);
  const [isEmployeeUser, setIsEmployeeUser] = useState(false);

  useEffect(() => {
    // Check cookies and set state
    const sisUsername = Cookies.get("sisUsername");
    const employeeUsername = Cookies.get("employeeUsername");

    setIsSchoolUser(sisUsername);
    setIsEmployeeUser(employeeUsername);
  }, []);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
          <LeaderboardProvider>
            <div className="app">
              {/*<Sidebar isSidebar={isSidebar} setIsSidebar={setIsSidebar} />*/}
              <main className="content">
                {/*<Topbar setIsSidebar={setIsSidebar} />*/}
                <Routes>
                  {isEmployeeUser && (
                    <Route element={<PrivateEmployeeRoutes />} >
                      <Route path="/employeeHome" element={<EmployeeHome />} />
                      <Route path="/manageExamReport" element={<ExamResult />} />
                      <Route path="/manageExamPaper" element={<ExamPaper />} />
                      <Route path="/markingScheme" element={<MarkingScheme />} />
                      <Route path="/manageAttendance" element={<ManageAttendance />} />
                      <Route path="/managecourse" element={<ManageCourse />} />
                      <Route path="/managemarkingScheme" element={<ManageMarkingScheme />} />
                      <Route path="/manageAdmin" element={<ManageAdmin />} />
                      <Route path="/manageStaff" element={<ManageEmployee />} />
                      <Route path="/managestudent" element={<ManageStudent />} />
                      <Route path="/manageClassroom" element={<ManageClass />} />
                      <Route path="/manageLesson" element={<ManageLesson />} />
                      <Route path="/manageEnroll" element={<ManageClassTime />} />
                      <Route path="/manageIntake" element={<ManageIntake />} />
                      <Route path="/manageProgram" element={<ManageProgram />} />
                      <Route path="/manageTime" element={<ManageTime />} />
                      <Route path="/program" element={<Program />} />
                      <Route path="/knownIssue" element={<KnownIssue />} />
                      <Route path="/manageFeedback" element={<ManageFeedback />} />
                      <Route path="/manageAdminFeedback" element={<ManageAdminFeedback />} />
                      <Route path="/leaderboard" element={<Rank />} />
                      <Route path="/spmRank" element={<SPMRank />} />
                    </Route>
                  )}
                  <Route element={<PrivateStudentRoutes />} >
                    <Route path="/studentAttendance" element={<StudentAttendance />} />
                    <Route path="/studentTranscript" element={<StudentTranscript />} />
                    <Route path="/studentExamResult" element={<StudentExamResult />} />
                    <Route path="/studentHome" element={<StudentHome />} />
                    <Route path="/studentLeave" element={<StudentLeave />} />
                  </Route>
                  {isSchoolUser && (
                    <Route element={<PrivateSchoolRoutes />} >
                      <Route path="/schoolHome" element={<SchoolHome />} />
                      <Route path="/managecourse" element={<ManageCourse />} />
                      <Route path="/leaderboard" element={<Rank />} />
                      <Route path="/spmRank" element={<SPMRank />} />
                      <Route path="/managemarkingScheme" element={<ManageMarkingScheme />} />
                      <Route path="/manageEnroll" element={<ManageClassTime />} />
                      <Route path="/manageIntake" element={<ManageIntake />} />
                      <Route path="/manageStaff" element={<ManageEmployee />} />
                      <Route path="/managestudent" element={<ManageStudent />} />
                      <Route path="/manageProgram" element={<ManageProgram />} />
                      <Route path="/manageClassroom" element={<ManageClass />} />
                      <Route path="/manageLesson" element={<ManageLesson />} />
                      <Route path="/manageAdmin" element={<ManageAdmin />} />
                      <Route path="/knownIssue" element={<KnownIssue />} />
                      <Route path="/manageTime" element={<ManageTime />} />
                      <Route path="/setting" element={<Setting />} />
                      <Route path="/program" element={<Program />} />
                      <Route path="/manageFeedback" element={<ManageFeedback />} />
                      <Route path="/manageAdminFeedback" element={<ManageAdminFeedback />} />
                      <Route path="/manageExamReport" element={<ExamResult />} />
                      <Route path="/manageAttendance" element={<ManageAttendance />} />
                    </Route>
                  )}
                  <Route path="/" element={<Home />} />
                  <Route path="/studentLogin" element={<StudentLogin />} />
                  <Route path="/schoolLogin" element={<SchoolLogin />} />
                  <Route path="/employeeLogin" element={<EmployeeLogin />} />
                  <Route path="/test" element={<Test />} />
                </Routes>
              </main>
            </div>
          </LeaderboardProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;