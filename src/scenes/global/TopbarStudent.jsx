import { Box, IconButton, useTheme } from "@mui/material";
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
import { studentLocalhost } from '../../localhost/studentLocalhost';

const TopbarStudent = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate(); 

  const [data, setData] = useState([]);
  const [editData, setEditData] = useState(null);
  const [editShow, setEditShow] = useState(false);

  const handleEditClose = () => setEditShow(false);

  const [showPassword, setShowPassword] = useState(false);

  const [state, setState] = useState({
    studentName: "",
    studentPasswd: "",
    studentEmail1: "",
    studentMobile1: "",
    studentNewStdID: "",
    studentMalaysiaIC: ""
  });

  const loadData = async () => {
    try {
        const response = await axios.get(`${studentLocalhost}/student/getStudentByID/${Cookies.get('id')}`);
        //console.log(response.data); // Log the response data

        // Check if data is already an array
        if (!Array.isArray(response.data)) {
            // If not, convert the object into an array with a single item
            setData([response.data]);
        } else {
            // If it's already an array, set it directly
            setData(response.data);
        }
    } catch (error) {
        console.error('Error occurred while fetching profile details:', error);
    }
  };

  useEffect(() => {
      loadData();
  }, []);

  const { studentName, studentPasswd, studentEmail, studentMobile, studentStdID } = state;

  const handleLogout = () => {
    // Remove the cookie session
    Cookies.remove('studentAuthToken');
    Cookies.remove('studentName');
    Cookies.remove('studentRole');
    Cookies.remove('studentStdID');
    Cookies.remove('NationalIC');
    Cookies.remove('id');

    // Redirect to "/"
    navigate('/studentLogin');
  };

  /*const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
        // Send a request to update the teacher using the ID from editData
        await axios.put(`${studentLocalhost}/student/updateStudent/${editData.id}`, editData);

        setEditShow(false); // Close the edit modal

        // Get the existing value of the cookie
        const username = Cookies.get('studentName');
        const jobTitle = Cookies.get('studentStdID');

        // Update the values if needed
        const updatedUsername = editData.studentName;
        const updatedJobTitle = editData.studentStdID;

        // Set the updated values back to the cookies
        Cookies.set('studentName', updatedUsername);
        Cookies.set('studentStdID', updatedJobTitle);

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
        console.error('Error occurred while updating profile:', error);
    }
  };*/

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
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>
        {/*<IconButton>
          <NotificationsOutlinedIcon />
        </IconButton>
        <IconButton>
          <SettingsOutlinedIcon />
        </IconButton>*/}
        {data.map((item, index) => {
          return (
            <React.Fragment key={item.id}>
              <IconButton onClick={() => handleEditShow(item)}>
                <PersonOutlinedIcon />
              </IconButton>
            </React.Fragment>
          );
        })}
        <IconButton onClick={handleLogout}>
          <ExitToAppOutlinedIcon />
        </IconButton>
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
            {/*<Form onSubmit={handleEditSubmit}>*/}
            <Form>
                <Form.Group className="mb-3" controlId="studentName">
                <Form.Label>Username*</Form.Label>
                <Form.Control
                    type="text"
                    name='studentName'
                    placeholder="Enter Username"
                    value={editData ? editData.studentName : ""}
                    onChange={handleEditInputChange}
                    autoFocus
                    disabled
                />
                </Form.Group>

                <Form.Group className="mb-3" controlId="studentPasswd">
                <Form.Label>Password*</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    name='studentPasswd'
                    placeholder="Enter Password"
                    value={editData ? editData.studentPasswd : ""}
                    onChange={handleEditInputChange}
                    disabled
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

                <Form.Group className="mb-3" controlId="studentEmail1">
                <Form.Label>Email*</Form.Label>
                <Form.Control
                    type="email"
                    name='studentEmail1'
                    placeholder="Enter Personal Email"
                    value={editData ? editData.studentEmail1 : ""}
                    onChange={handleEditInputChange}
                    disabled
                />
                </Form.Group>

                <Form.Group className="mb-3" controlId="studentMobile1">
                <Form.Label>Phone Number*</Form.Label>
                <Form.Control
                    type="tel"
                    name='studentMobile1'
                    placeholder="Enter Mobile No"
                    value={editData ? editData.studentMobile1 : ""}
                    onChange={handleEditInputChange}
                    disabled
                />
                </Form.Group>

                <Form.Group className="mb-3" controlId="studentMalaysiaIC">
                <Form.Label>Student National ID</Form.Label>
                <Form.Control
                    type="text"
                    name='studentMalaysiaIC'
                    value={editData ? editData.studentMalaysiaIC : ""}
                    disabled
                />
                </Form.Group>

                <Form.Group className="mb-3" controlId="studentNewStdID">
                <Form.Label>Student New ID*</Form.Label>
                <Form.Control
                    type="text"
                    name='studentNewStdID'
                    placeholder="Enter Job Role"
                    value={editData ? editData.studentNewStdID : ""}
                    onChange={handleEditInputChange}
                    disabled
                />
                </Form.Group>
                
                {/*<Button type='submit' variant="primary" style={{float: 'right'}}>Update</Button>*/}
            </Form>
          </Modal.Body>
        </Modal>
    </Box>
  );
};

export default TopbarStudent;
