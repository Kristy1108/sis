import { Box, IconButton, useTheme, Tooltip, Menu, MenuItem } from "@mui/material";
import React, { useContext, useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { ColorModeContext, tokens } from "../../theme";
import InputBase from "@mui/material/InputBase";
import axios from "axios";
import Swal from 'sweetalert2';
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import ExitToAppOutlinedIcon from '@mui/icons-material/ExitToAppOutlined';
import SearchIcon from "@mui/icons-material/Search";
import { Button, Modal, Form } from 'react-bootstrap';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom';
import { adminLocalhost } from '../../localhost/adminLocalhost';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeSlash, faEye } from '@fortawesome/free-solid-svg-icons';
import Badge from '@mui/material/Badge';
import { LeaderboardContext } from '../leaderboard/LeaderboardContext';

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [editData, setEditData] = useState(null);
  const [editShow, setEditShow] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handleEditClose = () => setEditShow(false);
  const [hasAttendanceError, setHasAttendanceError] = useState(false);
  const [attendanceErrorCount, setAttendanceErrorCount] = useState(0);
  const [errorReports, setErrorReports] = useState([]);
  const [showReportDropdown, setShowReportDropdown] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const checkForAttendanceErrors = async () => {
    try {
      const response = await axios.get(`${adminLocalhost}/attendanceReport/getFeedbackDetails`);
      const errorReportsFiltered = response.data.filter(report =>
        (report.reportStatus === "error" || report.reportStatus === "attendance eligible error") &&
        report.markStatus !== "Marked"
      );
      setHasAttendanceError(errorReportsFiltered.length > 0);
      setAttendanceErrorCount(errorReportsFiltered.length);
      setErrorReports(errorReportsFiltered);
    } catch (err) {
      console.error("Failed to fetch attendance report errors:", err);
    }
  };

  useEffect(() => {
    loadData();
    checkForAttendanceErrors();

    // Poll every 30 seconds
    const interval = setInterval(() => {
      checkForAttendanceErrors();
    }, 30000); // 30000ms = 30 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const { id } = useParams();

  const [state, setState] = useState({
    adminUsername: "",
    adminPassword: "",
    adminPersonalEmail: "",
    adminCooperateEmail: "",
    adminRole: "",
    adminJobTile: "",
  });

  const username = Cookies.get('sisUsername');

  const loadData = async () => {
      try {
          const response = await axios.get(`${adminLocalhost}/admin/getAdminDetails/${username}`);
          setData(response.data);
      } catch (error) {
          console.error('Error occurred while fetching profile details:', error);
      }
  };

  useEffect(() => {
      loadData();
  }, []);

  const handleLogout = () => {
    // Remove the cookie session
    Cookies.remove('sisAuthToken');
    Cookies.remove('sisUsername');
    Cookies.remove('sisJobTitle');
    Cookies.remove('sisRole');

    // Redirect to "/"
    navigate('/schoolLogin');
  };
  
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
        // Send a request to update the teacher using the ID from editData
        await axios.put(`${adminLocalhost}/admin/updateAdmin/${editData.id}`, editData);

        setEditShow(false); // Close the edit modal

        // Get the existing value of the cookie
        const username = Cookies.get('sisUsername');
        const jobTitle = Cookies.get('sisJobTitle');
        const role = Cookies.get('sisRole');

        // Update the values if needed
        const updatedUsername = editData.adminUsername;
        const updatedJobTitle = editData.adminJobTile;
        const updatedRole = editData.adminRole;

        // Set the updated values back to the cookies
        Cookies.set('sisUsername', updatedUsername);
        Cookies.set('sisJobTitle', updatedJobTitle);
        Cookies.set('sisRole', updatedRole);

        window.location.reload()

        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Profile updated successfully!',
            showConfirmButton: false,
            timer: 1500
        });

        loadData(); // Reload the data after successfully updating a teacher
    } catch (error) {
        console.error('Error occurred while updating program:', error);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({
        ...prevData,
        [name]: value
    }));
  };

  const handleEditShow = (item) => {
    setEditData(item); // Set the data for editing
    setEditShow(true);
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const decryptPassword = (encryptedPassword) => {
    try {
      return atob(encryptedPassword); // Base64 decoding
    } catch (error) {
      console.error('Failed to decrypt password:', error);
      return encryptedPassword; // Return encrypted if decryption fails
    }
  };

  const markAsResolved = async (reportId) => {
    try {
      // Step 1: Fetch full report object by ID
      const response = await axios.get(`${adminLocalhost}/attendanceReport/getFeedbackByID/${reportId}`);
      const reportData = response.data;

      // Step 2: Update markStatus
      const updatedReport = {
        ...reportData,
        markStatus: "Marked"
      };

      // Step 3: Send full updated data to backend
      await axios.put(`${adminLocalhost}/attendanceReport/updateFeedback/${reportId}`, updatedReport);

      // Step 4: Refresh error notification list
      checkForAttendanceErrors();
    } catch (error) {
      console.error("Failed to mark report as resolved:", error);
    }
  };

  const { setShowLeaderboardModal } = useContext(LeaderboardContext);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handlePermissionClick = () => {
    handleClose();
    navigate("/setting");
  };

  const handleLeaderboardClick = () => {
    handleClose();
    setShowLeaderboardModal(true);
  };

  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      {/* ICONS */}
      <Box sx={{ display: 'flex', position: 'absolute', right: 0 }}>
        <Tooltip title="Theme">
          <IconButton onClick={colorMode.toggleColorMode}>
            {theme.palette.mode === "dark" ? (
              <DarkModeOutlinedIcon />
            ) : (
              <LightModeOutlinedIcon />
            )}
          </IconButton>
        </Tooltip>

        <Tooltip title="Notification">
          <IconButton
            style={{
              backgroundColor: hasAttendanceError ? 'red' : 'transparent',
              color: hasAttendanceError ? 'white' : 'inherit'
            }}
            onClick={() => setShowReportDropdown(!showReportDropdown)}
          >
            <Badge
              badgeContent={attendanceErrorCount}
              color="error"
              invisible={attendanceErrorCount === 0}
              overlap="circular"
            >
              <NotificationsOutlinedIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <Tooltip title="Setting">
          <IconButton onClick={handleClick}>
            <SettingsOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={handlePermissionClick}>Permission</MenuItem>
          <MenuItem onClick={handleLeaderboardClick}>Leaderboard</MenuItem>
        </Menu>
        
        {data && (
          <React.Fragment key={data.id}>
              <Tooltip title="Profile">
                  <IconButton onClick={() => handleEditShow(data)}>
                      <PersonOutlinedIcon />
                  </IconButton>
              </Tooltip>
          </React.Fragment>
        )}
        
        <Tooltip title="Logout">
          <IconButton onClick={handleLogout}>
            <ExitToAppOutlinedIcon />
          </IconButton>
        </Tooltip>

      </Box>

      {showReportDropdown && errorReports.length > 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: 60,
            right: 10,
            width: 360,
            bgcolor: 'white',
            color: 'black',
            border: '1px solid #ccc',
            borderRadius: 2,
            boxShadow: 4,
            zIndex: 1300,
            p: 2,
          }}
        >
          <strong>Error Reports</strong>
          {errorReports.map((report) => {
            const attendanceDate = new Date(report.attendanceDate);

            return (
              <Box key={report.id} sx={{ mt: 2, borderBottom: '1px solid #eee', pb: 1 }}>
                <div><strong>{report.reportEnrollID}</strong></div>
                <div>{report.reportDate}</div>
                <div>{report.attendanceDate}</div>
                <div>{report.reportTeacher}</div>
                <div>{report.reportStatus}</div>
                <Button
                  size="sm"
                  variant="outline-success"
                  style={{ marginTop: 5 }}
                  onClick={() => markAsResolved(report.id)}
                >
                  Mark as Ready
                </Button>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Edit Modal */}
      <Modal 
        show={editShow} 
        onHide={handleEditClose}
        backdrop="static"
        keyboard={false}
        enforceFocus={true}>
            <Modal.Header closeButton>
                <Modal.Title style={{ color: '#151632' }}>Profile Info</Modal.Title>
            </Modal.Header>
            <Modal.Body className="custom-modal-body">
              <Form onSubmit={handleEditSubmit}>
                  <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                  <Form.Label>Username*</Form.Label>
                  <Form.Control
                      type="text"
                      name='adminUsername'
                      placeholder="Enter Username"
                      value={editData ? editData.adminUsername : ""}
                      onChange={handleEditInputChange}
                      autoFocus
                  />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                  <Form.Label>Password*</Form.Label>
                  <div className="input-group">
                  <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      name='adminPassword'
                      placeholder="Enter Password"
                      value={editData ? decryptPassword(editData.adminPassword) : ""}
                      onChange={handleEditInputChange}
                  />
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={handleTogglePassword}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                  </div>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                  <Form.Label>Personal Email*</Form.Label>
                  <Form.Control
                      type="email"
                      name='adminPersonalEmail'
                      placeholder="Enter Personal Email"
                      value={editData ? editData.adminPersonalEmail : ""}
                      onChange={handleEditInputChange}
                  />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                  <Form.Label>Cooperate Email*</Form.Label>
                  <Form.Control
                      type="email"
                      name='adminCooperateEmail'
                      placeholder="Enter Cooperate Email"
                      value={editData ? editData.adminCooperateEmail : ""}
                      onChange={handleEditInputChange}
                  />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                  <Form.Label>Role*</Form.Label>
                  <Form.Control
                      type="text"
                      name='adminRole'
                      placeholder="Enter Job Role"
                      readOnly
                      value={editData ? editData.adminRole : ""}
                      onChange={handleEditInputChange}
                  />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                  <Form.Label>Job Title*</Form.Label>
                  <Form.Control
                      type="text"
                      name='adminJobTile'
                      placeholder="Enter Job Title"
                      readOnly
                      value={editData ? editData.adminJobTitle : ""}
                      onChange={handleEditInputChange}
                  />
                  </Form.Group>

                  <Button type='submit' variant="primary" style={{float: 'right'}}>Update</Button>
              </Form>
            </Modal.Body>
        </Modal>
    </Box>
  );
};

export default Topbar;