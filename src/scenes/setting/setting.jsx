import React, { useState, useEffect } from 'react';
import axios from "axios";
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import './setting.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRefresh, faUsers, faArrowLeft, faCog } from '@fortawesome/free-solid-svg-icons';
import { Button, Modal, Table } from 'react-bootstrap';
import Sidebar from "../global/Sidebar";
import Topbar from "../global/Topbar";
import { adminLocalhost } from '../../localhost/adminLocalhost';
import { employeeLocalhost } from '../../localhost/employeeLocalhost';
import { studentLocalhost } from '../../localhost/studentLocalhost';

export default function Setting() {

  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  const [setUserName, setSelecteduserName] = useState("");
  const [searchTerm, setSearchTerm] = useState('');

  const jobDepartRowspan = {};
  let lastJobDepart = null;
  let rowCounter = 0;   

  const loadData1 = async () => {
    try {
      const response = await axios.get(`${employeeLocalhost}/employee/jobTitles`);
      setData1(response.data);
    } catch (error) {
      console.error('Error occurred while fetching employee group details:', error);
    }
  };

  useEffect(() => {
    loadData1();
  }, []);

  data1.forEach((item) => {
    if (!jobDepartRowspan[item.jobDepart]) {
      jobDepartRowspan[item.jobDepart] = 1; // Initialize rowspan
    } else {
      jobDepartRowspan[item.jobDepart] += 1; // Increment rowspan for duplicate values
    }
  });

  const handleSetting = async (item) => {
    setSelecteduserName(item.name);
    try {
      const response = await axios.get(`${employeeLocalhost}/employeeGroup/getAccessTypeAndCategory/${item.name}`);
      setData2(response.data);
      setShowModal(true); // open modal
    } catch (error) {
      console.error('Error occurred while fetching employee user details:', error);
    }
  };

  const handleAccessTypeChange = (index, newAccessType) => {
    const updated = [...data2];
    updated[index].accessType = newAccessType;
    setData2(updated);
  };

  const handleUpdate = async () => {
    try {
      for (const item of data2) {
        await axios.put(`${employeeLocalhost}/employeeGroup/updateEmployeeGroup/${item.id}`, item);
      }
      Swal.fire({
        icon: 'success',
        title: 'Permissions Updated',
        showConfirmButton: false,
        timer: 1500
      });
      setShowModal(false);
      loadData1(); // reload main data if needed
    } catch (error) {
      console.error('Error updating access permissions:', error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Please try again later.',
      });
    }
  };
  
  return (
    <div>
      <div className='InfoTopBarDiv'>
        <Topbar />
      </div>
      <div className='InfoSideBarDiv'>
        <Sidebar />
      </div>
      <div className='InfoBoxDiv'>
        <div className="InfoContainer">

          <div className="InfoDiv1">
            <h2 className="fs-2 m-0">EMPLOYEE PERMISSION</h2>
          </div>
          <div className="InfoDiv2 d-flex justify-content-between align-items-center">
            <Button id='btnRefresh' className='btn btn-contact me-2' title='Home' onClick={() => navigate('/schoolHome')}>
              <FontAwesomeIcon icon={faArrowLeft} />
            </Button>
            <Button id='btnRefresh' className='btn btn-contact me-2' title='Refresh' onClick={() => window.location.reload()}>
              <FontAwesomeIcon icon={faRefresh} />
            </Button>
          </div>

          <table className="styled-table" style={{width: '100%'}}>
            <thead>
              <tr>
                <th style={{ textAlign: "center" }}>No</th>
                <th style={{ textAlign: "center" }}>Category</th>
                <th style={{ textAlign: "center" }}>Employee / Level</th>
                <th style={{ textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {data1.map((item, index) => {
                const showRowspan = lastJobDepart !== item.jobDepart;
                if (showRowspan) {
                  lastJobDepart = item.jobDepart;
                  rowCounter++;
                }

                return (
                  <tr key={item.id}>
                    {showRowspan ? (
                      <td scope="row" rowSpan={jobDepartRowspan[item.jobDepart]}>{rowCounter}</td>
                    ) : null}
                    {showRowspan ? (
                      <td rowSpan={jobDepartRowspan[item.jobDepart]}>{item.jobDepart}</td>
                    ) : null}
                    <td>{item.name}</td>
                    <td>
                      <button
                          id='btnFontIcon'
                          className="btn btn-warning"
                          style={{fontSize: "10px"}}
                          onClick={() => handleSetting(item)}
                      >
                          <FontAwesomeIcon icon={faCog} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
            <Modal.Header closeButton>
              <Modal.Title style={{ color: '#151632' }}>Access Settings for {setUserName}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Search by category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Category</th>
                    <th>Access Type</th>
                  </tr>
                </thead>
                <tbody>
                  {data2
                    .filter(item => item.category.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{item.category}</td>
                      <td>
                        <select
                          className="form-select"
                          value={item.accessType}
                          onChange={(e) => handleAccessTypeChange(index, e.target.value)}
                        >
                          <option value="Read/Write">Read/Write</option>
                          <option value="Read Only">Read Only</option>
                          <option value="No Access">No Access</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={handleUpdate}>
                Update
              </Button>
            </Modal.Footer>
          </Modal>

        </div>
      </div>
    </div>
  );
}