import React, { useState, useEffect } from 'react';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { Box, IconButton, Typography, useTheme, Modal, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { tokens } from "../../theme";
import logo from '../../images/logo.png';
import profLogo from '../../images/user.jpg';
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import MoneyIcon from '@mui/icons-material/Money';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ImportContactsIcon from '@mui/icons-material/ImportContacts';
import FeedbackIcon from '@mui/icons-material/Feedback';
import SchoolIcon from '@mui/icons-material/School';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import Cookies from 'js-cookie';
import "./global.css";
import Swal from 'sweetalert2';
import axios from "axios";
import { adminLocalhost } from '../../localhost/adminLocalhost';
import { employeeLocalhost } from '../../localhost/employeeLocalhost';

const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleClick = () => {
    setSelected(title);
  };

  return (
    <div>
      <Link to={to} style={{ textDecoration: 'none' }}> {/* Override link style */}
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

export default function Sidebars() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [expanded1, setExpanded1] = useState(false);
  const [expanded2, setExpanded2] = useState(false);
  const [expanded3, setExpanded3] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const [file, setFile] = useState();
  const [modalOpen, setModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [responsePicture, setResponsePicture] = useState('');
  const [data, setData] = useState([]);
  const MAX_FILE_SIZE = 2 * 1024 * 1024;

  const loadData = async () => {
    try {
      const response = await axios.get(`${employeeLocalhost}/employeeGroup/getAccessTypeAndCategory/${Cookies.get('sisUsername')}`);
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
    try {
      const response = await fetch(`${adminLocalhost}/admin/adminDownload/${Cookies.get('sisUsername')}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setImageUrl(url);
      } else {
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

  const handleProfilePicture = () => {
    document.getElementById("file").click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const fileType = file.type;
      const fileSize = file.size;
      const allowedTypes = ["image/png", "image/jpeg"];
      const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

      if (!allowedTypes.includes(fileType)) {
        setModalOpen(false); // Close modal if invalid type
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Type',
          text: 'Only PNG and JPEG images are allowed!',
        });
        e.target.value = null; // Reset file input
        return;
      }

      if (fileSize > MAX_FILE_SIZE) {
        setModalOpen(false); // Close modal if file is too large
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: 'Image size must be less than 2MB!',
        });
        e.target.value = null; // Reset file input
        return;
      }

      setFile(file);
    }
  };

  const handleFileUpload = (event) => {
    handleUploadProfilePicture();
  };

  const handleUploadProfilePicture = async () => {

    if (!file) {
      handleModalClose();
      Swal.fire({
        icon: 'warning',
        title: 'No picture selected',
        text: 'Please click the icon to select picture',
      }).then(() => {
        handleProfilePictureClick();
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${adminLocalhost}/admin/adminAddFile/${Cookies.get('sisUsername')}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Profile Picture set!',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          setModalOpen(false); // Close modal after the success message
        });
      } else {
        throw new Error('Failed to upload profile picture');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Upload failed',
        text: 'An error occurred while uploading the profile picture',
      });
    }
  };

  const handleDelete = async () => {

    try {
      const response = await axios.get(`${adminLocalhost}/admin/getAdminDetails/${Cookies.get('sisUsername')}`);

      if (response.data.fileData === null) {
        handleModalClose();
        Swal.fire({
          icon: 'warning',
          title: 'No Profile Picture from database',
          text: 'Please select a profile picture!',
        }).then(() => {
          loadImage();
          handleProfilePictureClick();
        });
        return;
      }

    } catch (error) {
      console.error("Error fetching admin details:", error);
    }

    handleModalClose();
    Swal.fire({
      title: "Are you sure you want to delete?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .put(`${adminLocalhost}/admin/deleteAdminFile/${Cookies.get("sisUsername")}`)
          .then(() => {
            Swal.fire({
              position: "top-end",
              icon: "success",
              title: "Deleted successfully!",
              showConfirmButton: false,
              timer: 1500,
            }).then(() => {
              loadImage();
              handleProfilePictureClick();
            });
          })
          .catch((error) => {
            Swal.fire({
              icon: "error",
              title: "Error deleting profile picture",
              text: error.response?.data || "Something went wrong!",
            });
          });
      }
    });
  };

  return (
    <Box>
      <Sidebar collapsed={isCollapsed} style={{ background: colors.blueAccent[900], height: '100vh' }}>
        <Box style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "10px" }}>
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
                  {Cookies.get('sisRole')}
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
                      alt="profile-user"
                      src={URL.createObjectURL(file)}
                      title='Profile Picture'
                      style={{ cursor: "pointer", borderRadius: "50%" }}
                      onClick={handleProfilePictureClick}
                    />
                  ) : (
                    <img
                      className='sidbarSchoolProfLogo'
                      alt="profile-user"
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
                  {Cookies.get('sisUsername')}
                </Typography>
                <Typography variant="h5" color={colors.primary[500]}>
                  {Cookies.get('sisJobTitle')}
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Dashboard"
              to="/schoolHome"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            {/* General Section */}
            <>
              {data.some(item =>
                ["Manage Course", "Manage Marking Scheme", "Program"].includes(item.category) &&
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
                            ["Manage Course", "Manage MarkingScheme", "Program"].includes(item.category) &&
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
                ["Manage Intake", "Manage Enroll", "Manage Classroom", "Manage Lesson", "Manage Time"].includes(item.category) &&
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
                            ["Manage Intake", "Manage Enroll", "Manage Classroom", "Manage Lesson", "Manage Time"].includes(item.category) &&
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

            {/* Users Section */}
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

            {/* Attendance and Exam Section */}
            <>
              {data.some(item =>
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

            {/*<Typography
              variant="h6"
              color={colors.primary[900]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Attendance
            </Typography>
            <Item
              title="Feedback"
              to="/manageAdminFeedback"
              icon={<FeedbackIcon />}
              selected={selected}
              setSelected={setSelected}
            />*/}

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