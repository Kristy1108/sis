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
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ChecklistIcon from '@mui/icons-material/Checklist';
import Cookies from 'js-cookie';
import "./global.css";
import Swal from 'sweetalert2';
import axios from "axios";
import { adminLocalhost } from '../../localhost/adminLocalhost';
import { employeeLocalhost } from '../../localhost/employeeLocalhost';
import { studentLocalhost } from '../../localhost/studentLocalhost';

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

export default function SidebarStudent() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [expanded1, setExpanded1] = useState(false);
  const [expanded2, setExpanded2] = useState(false);
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
      const response = await fetch(`${studentLocalhost}/student/studentDownload/${Cookies.get('studentStdID')}`);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
        const fileType = file.type;
        const fileSize = file.size;
        const allowedTypes = ["image/png", "image/jpeg"];
        const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

        if (!allowedTypes.includes(fileType)) {
            setModalOpen(false); 
            Swal.fire({
                icon: 'error',
                title: 'Invalid File Type',
                text: 'Only PNG and JPEG images are allowed!',
            });
            e.target.value = null; 
            return;
        }

        if (fileSize > MAX_FILE_SIZE) {
            setModalOpen(false); 
            Swal.fire({
                icon: 'error',
                title: 'File Too Large',
                text: 'Image size must be less than 2MB!',
            });
            e.target.value = null; 
            return;
        }

        setFile(file);
    }
  };

  const handleFileUpload = async () => {
    try {
      const studentID = Cookies.get('studentStdID');
  
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
  
      // Check if already uploaded
      const response = await axios.get(`${studentLocalhost}/student/getStudentDetails/${studentID}`);
      const fileName = response.data.fileName;
  
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
  
      // Proceed Upload
      const formData = new FormData();
      formData.append('file', file);
  
      const uploadResponse = await axios.post(
        `${studentLocalhost}/student/studentAddFile/${studentID}`,
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
      const studentID = Cookies.get('studentStdID');
  
      const response = await axios.get(`${studentLocalhost}/student/getStudentDetails/${studentID}`);
      const fileData = response.data.fileData;
  
      if (!fileData) {
        Swal.fire({
          position: 'top-end',
          icon: 'warning',
          title: 'No Profile Picture in Database',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          loadImage();
          handleProfilePictureClick();
        });
        return;
      }
  
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
        await axios.put(`${studentLocalhost}/student/deleteStudentFile/${studentID}`);
  
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
                ml="65px"
              >
                <Typography variant="h3" color={colors.primary[500]}> {/* Admin color*/}
                  {Cookies.get('studentRole')}
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
                  {Cookies.get('studentName')}
                </Typography>
                <Typography variant="h5" color={colors.primary[500]}>
                {Cookies.get('studentStdID')}
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Dashboard"
              to="/studentHome"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
                      
            <Typography
              variant="h6"
              color={colors.primary[900]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Attendance
            </Typography>
            <Item
              title="Attendance"
              to="/studentAttendance"
              icon={<PeopleOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />         

            <Typography
              variant="h6"
              color={colors.primary[900]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Result
            </Typography>
            <Item
              title="Exam"
              to="/studentExamResult"
              icon={<ReceiptLongIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Transcript"
              to="/studentTranscript"
              icon={<ChecklistIcon />}
              selected={selected}
              setSelected={setSelected}
            />
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