import React, { useState, useEffect } from 'react';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { Box, Typography, useTheme, Modal, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { tokens } from "../../theme";
import logo from '../../images/sbitLogo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import MoneyIcon from '@mui/icons-material/Money';
import profLogo from '../../images/user.jpg';
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ImportContactsIcon from '@mui/icons-material/ImportContacts';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import FeedbackIcon from '@mui/icons-material/Feedback';
import SchoolIcon from '@mui/icons-material/School';
import Cookies from 'js-cookie';
import "./global.css";
import Swal from 'sweetalert2';
import axios from "axios";
import { employeeLocalhost } from '../../localhost/employeeLocalhost';

const employeeJobTitle = Cookies.get('employeeJobTitle');

const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleClick = () => {
    setSelected(title);
  };

  return (
    <div>
      <Link to={to} style={{ textDecoration: 'none' }}> 
        <MenuItem
          active={selected === title}
          style={{
            color: colors.primary[700], //sidebar font
            textDecoration: 'none' // Override link style
          }}
          icon={icon}
          onClick={handleClick} // Handle onClick event
        >
          <Typography>{title}</Typography>
        </MenuItem>
      </Link>
    </div>
  );
};

const SidebarEmployee = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate(); 
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [expanded1, setExpanded1] = useState(false);
  const [expanded2, setExpanded2] = useState(false);
  const [expanded3, setExpanded3] = useState(false);
  const [expanded4, setExpanded4] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const [file, setFile] = useState();
  const [modalOpen, setModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [responsePicture, setResponsePicture] = useState('');
  const [data, setData] = useState([]);
  const MAX_FILE_SIZE = 2 * 1024 * 1024;

  const loadData = async () => {
    try {
        const response = await axios.get(`${employeeLocalhost}/employeeGroup/getAccessTypeAndCategory/${Cookies.get('employeeUsername')}`);
        setData(response.data);
    } catch (error) {
        console.error('Error occurred while fetching course details:', error);
    }
  };

  useEffect(() => {
      loadData();
  }, []);

  useEffect(() => {
    loadImage();
  }, []);

  const loadImage = async () => {
    // Fetch the image data from the backend based on its ID
    try {
      const response = await fetch(`${employeeLocalhost}/employee/employeeDownload/${Cookies.get('employeeUsername')}`);
      if (response.ok) {
        // Create a blob URL for the image data
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setImageUrl(url);
      } else {
        // If the image is not found or there's an error, display the default profile picture
        setResponsePicture(response.status);
        setImageUrl(profLogo);
      }
    } catch (error) {
      console.error('Error loading image:', error);
      setImageUrl(profLogo);
    }
  };

  const handleProfilePictureClick = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
  
    if (file) {
      const fileType = file.type;
      const fileSize = file.size;
      const allowedTypes = ["image/png", "image/jpeg"];
      const MAX_FILE_SIZE = 1 * 1024 * 1024; // ✅ 1MB
  
      if (!allowedTypes.includes(fileType)) {
        setModalOpen(false); 
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Type',
          text: 'Only PNG and JPEG images are allowed!',
        }).then(() => {
          setModalOpen(true); 
        });
        e.target.value = null; 
        return;
      }
  
      if (fileSize > MAX_FILE_SIZE) {
        setModalOpen(false); 
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          html: `<strong>The image size is ${Math.round(fileSize / 1024)} KB.</strong><br><br>Please choose another picture. Image must be smaller than <strong>1MB (1024 KB)</strong>.`,
        }).then(() => {
          setModalOpen(true); 
        });
        e.target.value = null;
        return;
      }
  
      setFile(file);
    }
  };  

  const handleFileUpload = async () => {
    try {
      const username = Cookies.get('employeeUsername');
  
      if (!file) {
        Swal.fire({
          position: 'top-end',
          icon: 'warning',
          title: 'Please select a picture to upload!',
          showConfirmButton: false,
          timer: 1500
        });
        return;
      }
  
      const response = await axios.get(`${employeeLocalhost}/employee/getEmployeeIDInfo/${username}`);
      const fileName = response.data[0]?.fileName;
  
      if (fileName) {
        handleModalClose();
        Swal.fire({
          icon: 'warning',
          title: 'Profile Picture already exists!',
          text: 'Please remove your profile picture before uploading a new one!',
        }).then(() => {
          loadImage();
          handleProfilePictureClick();
        });
        return;
      }
  
      const formData = new FormData();
      formData.append('file', file);
  
      const uploadResponse = await axios.post(
        `${employeeLocalhost}/employee/employeeAddFile/${username}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
  
      handleModalClose();
  
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Profile Picture set!',
        showConfirmButton: false,
        timer: 1500
      }).then(() => {
        loadImage();
      });
  
    } catch (error) {
      console.error("Error in file upload:", error);
      handleModalClose();
  
      Swal.fire({
        icon: 'error',
        title: 'Upload failed',
        text: error.response?.data || 'Check your profile picture and try again!',
      }).then(() => {
        setModalOpen(true);
      });
    }
  };   

  const handleDelete = async () => {
    try {
      const response = await axios.get(`${employeeLocalhost}/employee/getEmployeeIDInfo/${Cookies.get('employeeUsername')}`);
      const fileName = response.data[0]?.fileName;
  
      // Check if picture exists first
      if (!fileName) {
        Swal.fire({
          position: 'top-end',
          icon: 'warning',
          title: 'No Profile Picture in Database',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          loadImage(); // refresh image if needed
          handleProfilePictureClick(); // open file picker
        });
        return; // stop further execution
      }
  
      // Ask for confirmation only if picture exists
      handleModalClose();
  
      const result = await Swal.fire({
        title: "Are you sure you want to delete?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Delete it!",
      });
  
      if (result.isConfirmed) {
        await axios.put(`${employeeLocalhost}/employee/deleteemployeeFile/${Cookies.get("employeeUsername")}`);
  
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Deleted successfully!",
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          setFile(null);
          setImageUrl(profLogo)            
        });
      }
  
    } catch (error) {
      console.error("Error during delete:", error);
      Swal.fire({
        icon: "error",
        title: "Error deleting profile picture",
        text: error.response?.data || "Something went wrong!",
      });
    }
  };  

  return (
    <Box>
      <Sidebar collapsed={isCollapsed} style={{ background: colors.blueAccent[900], height: '100vh' }}>
        <Box style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "10px"}}>
          <Link to="/">
            <img
              className='sidbarSchoolSbitLogo'
              alt="sbit-logo"
              src={logo}
              style={{ cursor: "pointer" }}
            />
          </Link>
        </Box>
        <Menu iconShape="square" >
          <MenuItem
            //onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.primary[700], /* shrink 3 line color*/
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h3" color={colors.primary[500]}> {/* Admin color*/}
                {Cookies.get('employeeRole')}
                </Typography>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <input 
                  type="file" 
                  id="file" 
                  style={{ display: "none" }} 
                  onChange={handleFileChange} 
                  accept="image/*"
                />
                  <label htmlFor="fileInput">
                    {/* Display the selected profile picture if available */}
                    {file ? (
                      <img
                        className='sidbarSchoolProfLogo'
                        alt="profile-user1"
                        src={URL.createObjectURL(file)}
                        title='Profile Picture'
                        style={{ cursor: "pointer", borderRadius: "50%" }}
                        onClick={handleProfilePictureClick}
                      />
                    ) : (
                      <img
                        className='sidbarSchoolProfLogo'
                        alt="profile-user2"
                        src={imageUrl}
                        title='Profile Picture'
                        style={{ cursor: "pointer", borderRadius: "50%" }}
                        onClick={handleProfilePictureClick}
                      />
                    )}
                  </label>
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h2"
                  color={colors.primary[500]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  {Cookies.get('employeeUsername')}
                </Typography>
                <Typography variant="h5" color={colors.primary[500]}>
                {Cookies.get('employeeJobTitle')}
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Dashboard"
              to="/employeeHome"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            {/* General Section */}
            <>
              {data.some(item =>
                ["Manage Course", "Manage MarkingScheme"].includes(item.category) &&
                (item.accessType === "Read Only" || item.accessType === "Read/Write")
              ) && (
                <>
                  <MenuItem
                    icon={<AccountBalanceIcon />}
                    onClick={() => setExpanded(!expanded)}
                    style={{
                      color: colors.primary[700]
                    }}
                  >
                    <Typography>General</Typography>
                    <FontAwesomeIcon
                      icon={faCaretDown}
                      style={{
                        position: 'absolute',
                        right: 10,
                        top: '50%',
                        transform: 'translateY(-50%)'
                      }}
                    />
                  </MenuItem>

                  {expanded && (
                    <Box pl="20px">
                      {data
                        .filter(item =>
                          ["Manage Course", "Manage MarkingScheme"].includes(item.category) &&
                          (item.accessType === "Read Only" || item.accessType === "Read/Write")
                        )
                        .map(item => (
                          <Item
                            key={item.id}
                            title={`${item.category}`}
                            to={`/${item.category.replace(" ", "")}`}
                            icon={item.category === "Manage Course" ? <ImportContactsIcon /> : <MoneyIcon />}
                            selected={selected}
                            setSelected={setSelected}
                          />
                        ))}
                    </Box>
                  )}
                </>
              )}
            </>

            {/* Course Coordinator Section */}
            <>
              {data.some(item =>
                ["Manage Intake", "Manage Enroll", "Manage Classroom", "Manage Lesson"].includes(item.category) &&
                (item.accessType === "Read Only" || item.accessType === "Read/Write")
              ) && (
                <>
                  <MenuItem
                    icon={<SupervisedUserCircleIcon />}
                    onClick={() => setExpanded1(!expanded1)}
                    style={{
                      color: colors.primary[700]
                    }}
                  >
                    <Typography>Course Coordinator</Typography>
                    <FontAwesomeIcon
                      icon={faCaretDown}
                      style={{
                        position: 'absolute',
                        right: 10,
                        top: '50%',
                        transform: 'translateY(-50%)'
                      }}
                    />
                  </MenuItem>

                  {expanded1 && (
                    <Box pl="20px">
                      {data
                        .filter(item =>
                          ["Manage Intake", "Manage Enroll", "Manage Classroom", "Manage Lesson"].includes(item.category) &&
                          (item.accessType === "Read Only" || item.accessType === "Read/Write")
                        )
                        .map(item => (
                          <Item
                            key={item.id}
                            title={`${item.category}`}
                            to={`/${item.category.replace(" ", "")}`}
                            icon={item.category === "Manage Course" ? <ImportContactsIcon /> : <MoneyIcon />}
                            selected={selected}
                            setSelected={setSelected}
                          />
                        ))}
                    </Box>
                  )}
                </>
              )}
            </>

            {/* Course User Section */}
            <>
              {data.some(item =>
                ["Manage Admin", "Manage Staff", "Manage Student"].includes(item.category) &&
                (item.accessType === "Read Only" || item.accessType === "Read/Write")
              ) && (
                <>
                  <MenuItem
                    icon={<PeopleOutlinedIcon />}
                    onClick={() => setExpanded2(!expanded2)}
                    style={{
                      color: colors.primary[700]
                    }}
                  >
                    <Typography>Users</Typography>
                    <FontAwesomeIcon
                      icon={faCaretDown}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}
                    />
                  </MenuItem>

                  {expanded2 && (
                    <Box pl="20px">
                      {data
                        .filter(item =>
                          ["Manage Admin", "Manage Staff", "Manage Student"].includes(item.category)
                        )
                        .map(item =>
                          item.accessType === "Read Only" || item.accessType === "Read/Write" ? (
                            <Item
                              key={item.id}
                              title={`${item.category}`}
                              to={`/${item.category.replace(" ", "")}`}
                              icon={<PersonAddIcon />}
                              selected={selected}
                              setSelected={setSelected}
                            />
                          ) : null
                        )}
                    </Box>
                  )}
                </>
              )}
            </>

            {/* Student Section */}
            <>
              {employeeJobTitle !== 'Course Counsellor' && 
                data.some(item =>
                  ["Manage Attendance", "Manage ExamReport"].includes(item.category) &&
                  (item.accessType === "Read Only" || item.accessType === "Read/Write")
                ) && (
                  <>
                    <MenuItem
                      icon={<SchoolIcon />}
                      onClick={() => setExpanded3(!expanded3)}
                      style={{
                        color: colors.primary[700]
                      }}
                    >
                      <Typography>Student</Typography>
                      <FontAwesomeIcon
                        icon={faCaretDown}
                        style={{
                          position: 'absolute',
                          right: 10,
                          top: '50%',
                          transform: 'translateY(-50%)'
                        }}
                      />
                    </MenuItem>

                    {expanded3 && (
                      <Box pl="20px">
                        {data
                          .filter(item =>
                            ["Manage Attendance", "Manage ExamReport"].includes(item.category) &&
                            (item.accessType === "Read Only" || item.accessType === "Read/Write")
                          )
                          .map(item => (
                            <Item
                              key={item.id}
                              title={`${item.category}`}
                              to={`/${item.category.replace(" ", "")}`}
                              icon={item.category === "Manage Attendance" ? <ImportContactsIcon /> : <MoneyIcon />}
                              selected={selected}
                              setSelected={setSelected}
                            />
                          ))}
                      </Box>
                    )}
                  </>
              )}
            </>

            {/* Feedback Section 
            <>
              {data.some(item =>
                ["Manage Feedback"].includes(item.category) &&
                (item.accessType === "Read Only" || item.accessType === "Read/Write")
              ) && (
                <>
                  <MenuItem
                    icon={<FeedbackIcon />}
                    onClick={() => setExpanded4(!expanded4)}
                    style={{
                      color: colors.primary[700]
                    }}
                  >
                    <Typography>Feedback</Typography>
                    <FontAwesomeIcon
                      icon={faCaretDown}
                      style={{
                        position: 'absolute',
                        right: 10,
                        top: '50%',
                        transform: 'translateY(-50%)'
                      }}
                    />
                  </MenuItem>

                  {expanded4 && (
                    <Box pl="20px">
                      {data
                        .filter(item =>
                          ["Manage Feedback"].includes(item.category) &&
                          (item.accessType === "Read Only" || item.accessType === "Read/Write")
                        )
                        .map(item => (
                          <Item
                            key={item.id}
                            title={`${item.category}`}
                            to={`/${item.category.replace(" ", "")}`}
                            icon={item.category === "Manage Course" ? <ImportContactsIcon /> : <FeedbackIcon />}
                            selected={selected}
                            setSelected={setSelected}
                          />
                        ))}
                    </Box>
                  )}
                </>
              )}
            </>*/}

            {/* Leaderboard */}
              {data.some(item =>
                item.category === "Leaderboard" &&
                (item.accessType === "Read Only" || item.accessType === "Read/Write")
              ) && (
                <>
                  <Typography
                    variant="h6"
                    color={colors.primary[900]}
                    sx={{ m: "15px 0 5px 20px" }}
                  >
                    Leaderboard
                  </Typography>
                  <Item
                    title="Rank"
                    to="/leaderboard"
                    icon={<FeedbackIcon />}
                    selected={selected}
                    setSelected={setSelected}
                  />
                </>
              )}

          </Box>
        </Menu>
      </Sidebar>

      {/* Profile Picture Modal */}
      <Modal
        open={modalOpen}
        aria-labelledby="profile-picture-modal"
        aria-describedby="profile-picture-upload"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 401,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {/* Image Preview */}
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleFileChange}
            accept="image/png, image/jpeg"
          />

          <label htmlFor="file" style={{ marginBottom: "10px", cursor: "pointer" }}>
            {file ? (
              <img
                className="sidbarSchoolProfLogo"
                alt="profile-user"
                src={URL.createObjectURL(file)}
                title="Profile Picture"
                style={{ cursor: "pointer", borderRadius: "50%", width: 100, height: 100 }}
              />
            ) : (
              <img
                className="sidbarSchoolProfLogo"
                alt="profile-user"
                src={imageUrl}
                title="Profile Picture"
                style={{ cursor: "pointer", borderRadius: "50%", width: 100, height: 100 }}
              />
            )}
          </label>

          {/* Text Below Image */}
          <span style={{ color: "white", marginBottom: "10px" }}>Click me!</span>

          {/* Buttons Container */}
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "10px" }}>
            <Button onClick={handleDelete} title='Delete' variant="contained">
              Delete
            </Button>
            <Button onClick={handleFileUpload} title='Select picture, then upload!' variant="contained">
              Upload
            </Button>
            <Button onClick={handleModalClose} title='Close' variant="contained">
              Close
            </Button>
          </div>
        </Box>
      </Modal>
    </Box>
  )
}

export default SidebarEmployee;
