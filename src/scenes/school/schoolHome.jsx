import React, { useState, useEffect } from 'react';
import { Box, useTheme } from '@mui/material';
import { tokens } from '../../theme';
import { Email as EmailIcon, PointOfSale as PointOfSaleIcon, PersonAdd as PersonAddIcon, Traffic as TrafficIcon } from '@mui/icons-material';
import Header from '../../components/Header';
import StatBox from '../../components/StateBox';
import axios from 'axios';
import Sidebar from "../global/Sidebar";
import Topbar from "../global/Topbar";
import "./schoolHome.css";
import { adminLocalhost } from '../../localhost/adminLocalhost';
import { employeeLocalhost } from '../../localhost/employeeLocalhost';
import { studentLocalhost } from '../../localhost/studentLocalhost';

const SchoolHome = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [counts, setCounts] = useState({
    courses: 0,
    intake: 0,
    employee: 0,
    student: 0,
    admin: 0,
    intakeDIT: 0,
  });

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const coursesResponse = await axios.get(`${adminLocalhost}/course/countCourse`);
      const intakeResponse = await axios.get(`${adminLocalhost}/classTime/countClassTime`);
      const employeeResponse = await axios.get(`${employeeLocalhost}/employee/countEmployee`);
      const studentResponse = await axios.get(`${studentLocalhost}/student/countStudent`);
      const adminResponse = await axios.get(`${adminLocalhost}/admin/countAdmin`);
      const intakeDITResponse = await axios.get(`${studentLocalhost}/student/total-intakes-by-program`);
      const programResponse = await axios.get(`${adminLocalhost}/program/countProgram`);
  
      setCounts({
        courses: coursesResponse.data,
        intake: intakeResponse.data,
        employee: employeeResponse.data,
        student: studentResponse.data,
        admin: adminResponse.data,
        program: programResponse.data,
        intakeDIT: intakeDITResponse.data[0].totalIntake,
        intakeDSG: intakeDITResponse.data[1].totalIntake,
        intakeDIP: intakeDITResponse.data[2].totalIntake,
        intakeDSE: intakeDITResponse.data[5].totalIntake,
        intakePT_DIP: intakeDITResponse.data[4].totalIntake,
        intakePT_DSE: intakeDITResponse.data[3].totalIntake,
      });
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };  

  return (
    <div>
      <div className='schoolHometopBarDiv'>
        <Topbar />
      </div>
      <div className='schoolHomesideBarDiv'>
        <Sidebar />
      </div>
      <div className='schoolHomeBoxDiv'>
        <Box m="20px">
                {/* HEADER */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Header title="SCHOOL INFORMATION SYSTEM" />
          </Box>

          {/* GRID & CHARTS */}
          <Box
            display="grid"
            gridTemplateColumns="repeat(12, 1fr)"
            gridAutoRows="140px"
            gap="20px"
          >
            {/* ROW 1 */}
            <Box
              gridColumn="span 3"
              backgroundColor={colors.primary[400]}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <StatBox
                title="Courses"
                subtitle={counts.courses}
                icon={<PointOfSaleIcon sx={{ color: colors.greenAccent[600], fontSize: '26px' }} />}
              />
            </Box>

            <Box
              gridColumn="span 3"
              backgroundColor={colors.primary[400]}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <StatBox
                title="Enroll Date"
                subtitle={counts.intake}
                icon={<TrafficIcon sx={{ color: colors.greenAccent[600], fontSize: '26px' }} />}
              />
            </Box>

            <Box
              gridColumn="span 3"
              backgroundColor={colors.primary[400]}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <StatBox
                title="Employee"
                subtitle={counts.employee}
                icon={<TrafficIcon sx={{ color: colors.greenAccent[600], fontSize: '26px' }} />}
              />
            </Box>

            <Box
              gridColumn="span 3"
              backgroundColor={colors.primary[400]}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <StatBox
                title="Students"
                subtitle={counts.student}
                icon={<TrafficIcon sx={{ color: colors.greenAccent[600], fontSize: '26px' }} />}
              />
            </Box>

            <Box
              gridColumn="span 3"
              backgroundColor={colors.primary[400]}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <StatBox
                title="Admin"
                subtitle={counts.admin}
                icon={<TrafficIcon sx={{ color: colors.greenAccent[600], fontSize: '26px' }} />}
              />
            </Box>

            <Box
              gridColumn="span 4"
              backgroundColor={colors.primary[400]}
              display="flex"
              flexDirection="column"
              style={{ fontSize: '10px', padding: '16px' }}
              alignItems="center"
              justifyContent="center"
            >
              {/* Main Title */}
              <h3 style={{ marginBottom: '16px', color: colors.greenAccent[600] }}>FT - Intake</h3>

              {/* Program List */}
              <Box display="flex" justifyContent="space-around" width="100%">
                {[
                  { title: "DIT", subtitle: counts.intakeDIT },
                  { title: "DIP", subtitle: counts.intakeDIP },
                  { title: "DSG", subtitle: counts.intakeDSG },
                  { title: "DSE", subtitle: counts.intakeDSE },
                ].map((item, index) => (
                  <StatBox
                    key={index}
                    title={item.title} // Program name: DIT, DIP, etc.
                    subtitle={item.subtitle} // Intake count
                    icon={<TrafficIcon sx={{ color: colors.greenAccent[600], fontSize: '26px' }} />}
                  />
                ))}
              </Box>
            </Box>

            <Box
              gridColumn="span 2"
              backgroundColor={colors.primary[400]}
              display="flex"
              flexDirection="column"
              style={{ fontSize: '10px', padding: '16px' }}
              alignItems="center"
              justifyContent="center"
            >
              {/* Main Title */}
              <h3 style={{ marginBottom: '16px', color: colors.greenAccent[600] }}>PT - Intake</h3>

              {/* Program List */}
              <Box display="flex" justifyContent="space-around" width="100%">
                {[
                  //{ title: "DIT", subtitle: counts.intakeDIT },
                  { title: "DIP", subtitle: counts.intakePT_DIP },
                  //{ title: "DSG", subtitle: counts.intakeDSG },
                  { title: "DSE", subtitle: counts.intakePT_DSE },
                ].map((item, index) => (
                  <StatBox
                    key={index}
                    title={item.title} // Program name: DIT, DIP, etc.
                    subtitle={item.subtitle} // Intake count
                    icon={<TrafficIcon sx={{ color: colors.greenAccent[600], fontSize: '26px' }} />}
                  />
                ))}
              </Box>
            </Box>

            <Box
              gridColumn="span 3"
              backgroundColor={colors.primary[400]}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <StatBox
                title="Program"
                subtitle={counts.program}
                icon={<TrafficIcon sx={{ color: colors.greenAccent[600], fontSize: '26px' }} />}
              />
            </Box>
            
          </Box>
        </Box>
      </div>
    </div>
  );
};

export default SchoolHome;
