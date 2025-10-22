import React, { useState, useEffect } from 'react';
import axios from "axios";
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faRefresh, faEyeSlash, faEye } from '@fortawesome/free-solid-svg-icons';
import { Button, Modal, Form, Carousel } from 'react-bootstrap';
import Sidebar from "../global/Sidebar";
import SidebarEmployee from "../global/SidebarEmployee";
import Topbar from "../global/Topbar";
import TopbarEmployee from '../global/TopbarEmployee';
import { adminLocalhost } from '../../localhost/adminLocalhost';
import { employeeLocalhost } from '../../localhost/employeeLocalhost';
import Cookies from 'js-cookie';

export default function ManageAdmin() {

  const [state, setState] = useState({
    /* Personal Information */
    adminUsername: "",
    adminPassword: "",
    adminPersonalEmail: "",
    adminCooperateEmail: "",
    adminRole: "",
    adminJobTitle: "",
    adminStatus: ""
  });

  const [data, setData] = useState([]);
  const [data1, setData1] = useState([]);
  const [data3, setData3] = useState([]);
  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);
  const handleShow = () => setShow(true);
  const handleShow1 = () => setShow1(true);
  const handleClose1 = () => setShow1(false);

  const loadData = async () => {
    try {
      const response = await axios.get(`${employeeLocalhost}/employee/getEmployeeDetails`);
      setData(response.data);
    } catch (error) {
      console.error('Error occurred while fetching data:', error);
    }
  };  

  const loadData1 = async () => {
    try {
      const response = await axios.get(`${adminLocalhost}/admin/getAdminDetails`);
      setData1(response.data);
    } catch (error) {
      console.error('Error occurred while fetching data:', error);
    }
  };  

  const loadData3 = async () => {
    try {
      const username = Cookies.get("sisUsername") || Cookies.get("employeeUsername");
  
      if (!username) {
        console.error("No username found in cookies.");
        return; // Exit if no valid cookie is found
      }
  
      const response = await axios.get(`${employeeLocalhost}/employeeGroup/getAccessTypeAndCategory/${username}`);
      setData3(response.data);
    } catch (error) {
      console.error("Error occurred while fetching access details:", error);
    }
  };

  useEffect(() => {
    loadData3();
  }, []);

  useEffect(() => {
    loadData();
    loadData1();
  }, []);

  const handleEditShow = (item) => {
    Swal.fire({
      title: `Are you sure you want to give admin access for ${item.employeeUsername}?`,
      text: `${item.employeeUsername} will get full access`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Confirm'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const adminData = {
            adminUsername: item.employeeUsername, 
            adminCooperateEmail: item.employeeCooperateEmail, 
            adminRole: item.employeeRole + ", Admin", 
            adminJobTitle: item.employeeJobTitle, 
            adminPassword: item.employeePasswd,
            adminPersonalEmail: item.employeePersonalEmail
          };

          await axios.post(`${adminLocalhost}/admin/addAdmin`, adminData);

          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Admin access granted successfully!',
            showConfirmButton: false,
            timer: 1500
          }).then(() => {
            loadData1();
          });

        } catch (error) {
          console.error('Error occurred while giving admin access:', error);
        }
      }
    });
  };

  const handleDelete = async (item) => {
    const adminResponse = await axios.get(`${adminLocalhost}/admin/countAdmin`);

    if(adminResponse.data === 1)
    {
      Swal.fire({
        title: `Unable to remove last admin account`,
        text: `You can't access anymore to admin page`,
        icon: 'warning',
      });
    }
    else
    {
      Swal.fire({
        title: `Are you sure you want to delete admin access for ${item.adminUsername}?`,
        text: `${item.adminUsername} will not get full access`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
          axios.delete(`${adminLocalhost}/admin/deleteAdmin/${item.id}`);
          Swal.fire(
            {
              position: 'top-end',
              icon: 'success',
              title: 'Deleted successfully!',
              showConfirmButton: false,
              timer: 1500
            }
          ).then(() => {
            loadData1();
          });
        }
      })
    }
  };

  return (
    <div>
      <div className='InfoTopBarDiv'>
        {Cookies.get("sisUsername") ? (
            <Topbar />
        ) : Cookies.get("employeeUsername") ? (
            <TopbarEmployee />
        ) : null}
      </div>
      <div className='InfoSideBarDiv'>
        {Cookies.get("sisUsername") ? (
            <Sidebar />
        ) : Cookies.get("employeeUsername") ? (
            <SidebarEmployee />
        ) : null}
      </div>
      <div className='InfoBoxDiv'>
        <div className="InfoContainer">
          <div className="InfoDiv1">
            <h2 className="fs-2 m-0">ADMIN INFORMATION</h2>
          </div>
          <div className="InfoDiv2 d-flex justify-content-between align-items-center">
            <Button id='btnRefresh' className='btn btn-contact me-2' title='Refresh' onClick={() => window.location.reload()}><FontAwesomeIcon icon={faRefresh} /></Button>
            {data3.some(
              item => item.category === "Manage Admin" && item.accessType === "Read/Write"
            ) && (
              <Button className="btn btn-contact" title='Add' onClick={handleShow1}>
                <FontAwesomeIcon icon={faPlus} />
              </Button>
            )}
          </div>

          <table className="styled-table" style={{width: '100%'}}>
            <thead>
              <tr>
                <th style={{ textAlign: "center" }}>No</th>
                <th style={{ textAlign: "center" }}>Name</th>
                <th style={{ textAlign: "center" }}>Cooperate Email</th>
                <th style={{ textAlign: "center" }}>Role</th>
                <th style={{ textAlign: "center" }}>Job Title</th>
                <th style={{ textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {data1.map((item, index) => {
                return (
                  <tr key={item.id}>
                    <td scope="row">{index + 1}</td>
                    <td>{item.adminUsername}</td>
                    <td>{item.adminCooperateEmail}</td>
                    <td>{item.adminRole}</td>
                    <td>{item.adminJobTitle}</td>
                    <td>
                      {data3.some(
                          item => item.category === "Manage Admin" && item.accessType === "Read/Write"
                        ) && (
                          <button
                          id='btnFontIcon'
                          className="btn btn-warning"
                          title='Delete'
                          style={{fontSize: "10px"}}
                          onClick={() => handleDelete(item)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/*Add Modal*/}
          <Modal
            show={show1}
            onHide={handleClose1}
            dialogClassName="custom-modal"
            backdrop="static"
            keyboard={false}
            enforceFocus={true}
          >
            <Modal.Header closeButton>
              <Modal.Title style={{ color: '#151632' }}>Employee Information</Modal.Title>
            </Modal.Header>
            <Modal.Body className="custom-modal-body">
              <Carousel 
                interval={null} // Prevent automatic sliding
                controls={false} // Disable navigation arrows
                indicators={false} // Disable pagination dots
              >
                <Carousel.Item style={{ height: "100%" }}>
                  <Form>
                    <table className="styled-table">
                      <thead>
                        <tr>
                          <th style={{ textAlign: "center" }}>No</th>
                          <th style={{ textAlign: "center" }}>Name</th>
                          <th style={{ textAlign: "center" }}>Cooperate Email</th>
                          <th style={{ textAlign: "center" }}>Role</th>
                          <th style={{ textAlign: "center" }}>Job Title</th>
                          <th style={{ textAlign: "center" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.map((item, index) => {
                          return (
                            <tr key={item.id}>
                              <td scope="row">{index + 1}</td>
                              <td>{item.employeeUsername}</td>
                              <td>{item.employeeCooperateEmail}</td>
                              <td>{item.employeeRole}</td>
                              <td>{item.employeeJobTitle}</td>
                              <td>
                                <button
                                  id='btnFontIcon'
                                  className="btn btn-info"
                                  title='Give Admin Access'
                                  type='button'
                                  onClick={() => handleEditShow(item)}
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                  </Form>
                </Carousel.Item>
              </Carousel>
            </Modal.Body>
          </Modal>
        </div>
      </div>
    </div>
  );
}