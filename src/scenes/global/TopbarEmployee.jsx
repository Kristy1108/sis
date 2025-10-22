import { Box, IconButton, useTheme, Tooltip } from "@mui/material";
import React, { useContext, useState, useEffect } from "react";
import { ColorModeContext, tokens } from "../../theme";
import axios from "axios";
import Swal from 'sweetalert2';
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import ExitToAppOutlinedIcon from '@mui/icons-material/ExitToAppOutlined';
import { Button, Modal, Form } from 'react-bootstrap';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeSlash, faEye } from '@fortawesome/free-solid-svg-icons';
import { employeeLocalhost } from '../../localhost/employeeLocalhost';

const TopbarEmployee = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate(); 

  const [data, setData] = useState([]);
  const [editData, setEditData] = useState(null);
  const [editShow, setEditShow] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handleEditClose = () => setEditShow(false);

  const { id } = useParams();

  const [state, setState] = useState({
    employeeUsername: "",
    employeePassword: "",
    employeePersonalEmail: "",
    employeeCooperateEmail: "",
    employeeRole: "",
    employeeJobTitle: "",
  });

  const loadData = async () => {
    try {
        const response = await axios.get(`${employeeLocalhost}/employee/getEmployeeByID/${Cookies.get('employeeID')}`);

        if (!Array.isArray(response.data)) {
            setData([response.data]);
        } else {
            setData(response.data);
        }
    } catch (error) {
        console.error('Error occurred while fetching profile details:', error);
    }
  };

  useEffect(() => {
      loadData();
  }, []);

  const handleLogout = () => {
    // Remove the cookie session
    Cookies.remove('employeeAuthToken');
    Cookies.remove('employeeUsername');
    Cookies.remove('employeeJobTitle');
    Cookies.remove('employeeRole');
    Cookies.remove('employeeID');
    Cookies.remove('employeeAdmin');
    Cookies.remove('employeeName');

    // Redirect to "/"
    navigate('/employeeLogin');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'Updating your profile will log you out to apply changes. Proceed?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, update and logout',
        cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) {
        return; // User cancelled
    }

    try {
        // Send update request
        await axios.put(`${employeeLocalhost}/employee/updateEmployee/${editData.id}`, {
            ...editData,
            employeePasswd: btoa(editData.employeePasswd)
        });

        // Set updated cookies
        Cookies.set('employeeUsername', editData.employeeUsername);
        Cookies.set('employeeJobTitle', editData.employeeJobTitle);
        Cookies.set('employeeRole', editData.employeeRole);

        // Close modal
        setEditShow(false);

        // Optional: Show success message before logout
        await Swal.fire({
            icon: 'success',
            title: 'Profile updated successfully!',
            text: 'You will now be logged out.',
            showConfirmButton: false,
            timer: 1500
        });

        // Logout and reload
        handleLogout();
    } catch (error) {
        console.error('Error occurred while updating profile:', error);
        Swal.fire('Error', 'Failed to update profile. Please try again.', 'error');
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

  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      {/* SEARCH BAR */}
      {/*<Box
        display="flex"
        backgroundColor={colors.primary[400]}
        borderRadius="3px"
      >
        <InputBase sx={{ ml: 2, flex: 1 }} placeholder="Search" />
        <IconButton type="button" sx={{ p: 1 }}>
          <SearchIcon />
        </IconButton>
        </Box>*/}

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

        {/*<Tooltip title="Notification">
          <IconButton>
            <NotificationsOutlinedIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Setting">
          <IconButton>
            <SettingsOutlinedIcon />
          </IconButton>
        </Tooltip>*/}
        
        {data.map((item, index) => {
          // Render the edit icon only for the first item
          if (index === 0) {
            return (
              <React.Fragment key={item.id}>
                <Tooltip title="Profile">
                  <IconButton onClick={() => handleEditShow(item)}>
                    <PersonOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </React.Fragment>
            );
          } else {
            return null; // Render nothing for other items
          }
        })}

        <Tooltip title="Logout">
          <IconButton onClick={handleLogout}>
            <ExitToAppOutlinedIcon />
          </IconButton>
        </Tooltip>
        
      </Box>
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
                <Form.Group className="mb-3" controlId="employeeUsername">
                <Form.Label>Username*</Form.Label>
                <Form.Control
                    type="text"
                    name='employeeUsername'
                    placeholder="Enter Username"
                    disabled
                    value={editData ? editData.employeeUsername : ""}
                    onChange={handleEditInputChange}
                    autoFocus
                />
                </Form.Group>

                <Form.Group className="mb-3" controlId="employeePasswd">
                <Form.Label>Password*</Form.Label>
                <div className="input-group">
                <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    name='employeePasswd'
                    placeholder="Enter Password"
                    value={editData ? decryptPassword(editData.employeePasswd) : ""}
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

                <Form.Group className="mb-3" controlId="employeePersonalEmail">
                <Form.Label>Personal Email*</Form.Label>
                <Form.Control
                    type="email"
                    name='employeePersonalEmail'
                    placeholder="Enter Personal Email"
                    value={editData ? editData.employeePersonalEmail : ""}
                    onChange={handleEditInputChange}
                />
                </Form.Group>
                <Form.Group className="mb-3" controlId="employeeCooperateEmail">
                <Form.Label>Cooperate Email*</Form.Label>
                <Form.Control
                    type="email"
                    name='employeeCooperateEmail'
                    placeholder="Enter Cooperate Email"
                    disabled
                    value={editData ? editData.employeeCooperateEmail : ""}
                    onChange={handleEditInputChange}
                />
                </Form.Group>
                <Form.Group className="mb-3" controlId="employeeRole">
                <Form.Label>Role</Form.Label>
                <Form.Control
                    type="text"
                    name='employeeRole'
                    placeholder="Enter Job Role"
                    disabled
                    value={editData ? editData.employeeRole : ""}
                    onChange={handleEditInputChange}
                />
                </Form.Group>
                <Form.Group className="mb-3" controlId="employeeJobTitle">
                <Form.Label>Job Title</Form.Label>
                <Form.Control
                    type="text"
                    name='employeeJobTitle'
                    placeholder="Enter Job Title"
                    disabled
                    value={editData ? editData.employeeJobTitle : ""}
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

export default TopbarEmployee;
