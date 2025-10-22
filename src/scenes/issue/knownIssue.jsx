import React, { useState, useEffect } from 'react';
import Select from "react-select";
import axios from "axios";
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faEye, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { Button, Modal, Form, Carousel, Table } from 'react-bootstrap';
import Sidebar from "../global/Sidebar";
import SidebarEmployee from "../global/SidebarEmployee";
import Topbar from "../global/Topbar";
import TopbarEmployee from '../global/TopbarEmployee';
import { adminLocalhost } from '../../localhost/adminLocalhost';
import { employeeLocalhost } from '../../localhost/employeeLocalhost';
import Cookies from 'js-cookie';

export default function KnownIssue() {

  const [state, setState] = useState({
    issueName: "",
    issueDescription: "",
    issueStatus: "",
    issueMarkStatus: "",
    pdfFileName: "",
    id: null
});

const [pdfFile, setPdfFile] = useState(null);
const [data, setData] = useState([]);
const [data3, setData3] = useState([]);
const [show, setShow] = useState(false);
const [editData, setEditData] = useState(null);
const [editShow, setEditShow] = useState(false);

const handleClose = () => {
  resetForm();
  setShow(false);
};
const handleShow = () => setShow(true);
const [selectedCourse, setSelectedCourse] = useState('');
const [selectedCourseCode, setSelectedCourseCode] = useState('');
const [selectedStatus, setSelectedStatus] = useState('');
const [progCoursesCode, setProgCoursesCode] = useState([]);
const [searchTerm, setSearchTerm] = useState('');

const loadData3 = async () => {
    try {
      const username = Cookies.get("sisUsername") || Cookies.get("employeeUsername");
  
      if (!username) {
        console.error("No username found in cookies.");
        return; 
      }
  
      const response = await axios.get(`${employeeLocalhost}/employeeGroup/getAccessTypeAndCategory/${username}`);
      setData3(response.data);
    } catch (error) {
      console.error("Error occurred while fetching access details:", error);
    }
}; 

const loadData = async () => {
    try {
        const response = await axios.get(`${adminLocalhost}/knownIssue/getKnownIssueDetails`);
        setData(response.data);
    } catch (error) {
        console.error('Error occurred while fetching known issue details:', error);
    }
};

useEffect(() => {
    loadData();
    loadData3();
}, []);

const deleteContact = async (id) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'This will permanently delete the known issue.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  });

  if (result.isConfirmed) {
    try {
      await axios.delete(`${adminLocalhost}/knownIssue/deleteKnownIssue/${id}`);
      Swal.fire('Deleted!', 'The known issue has been removed.', 'success');
      loadData();
    } catch (error) {
      console.error('Error deleting:', error);
      Swal.fire('Error', 'Failed to delete known issue.', 'error');
    }
  }
};

const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("issueName", state.issueName);
    formData.append("issueDescription", state.issueDescription);
    formData.append("issueStatus", state.issueStatus);
    formData.append("issueTeacher", Cookies.get("sisUsername"));
    formData.append("issueMarkStatus", "Not Marked");

    if (pdfFile) {
      formData.append("file", pdfFile);
    }

    try {

        await axios.post(`${adminLocalhost}/knownIssue/addKnownIssue`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setState((prevState) => ({
            ...prevState,
            issueName: "",
            issueDescription: "",
            issueStatus: ""
        }));
        
        setShow(false);

        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: `Saved Successfully`,
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            loadData(); 
        });

    } catch (error) {
        console.error('❌ Error occurred while adding known issue:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Something went wrong while adding the known issue!',
        });
    }
};

const handleDeletePDF = async (id) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'This will permanently delete the known issue.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  });

  if (result.isConfirmed) {
    try {
      await axios.delete(`${adminLocalhost}/knownIssue/deletePDF/${id}`);
      Swal.fire('Deleted!', 'PDF deleted successfully', 'success');
      loadData();
    } catch (error) {
      console.error('Error deleting:', error);
      Swal.fire('Error', 'Failed to delete PDF.', 'error');
    }
  }
};

const handleEditSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("issueName", state.issueName);
  formData.append("issueDescription", state.issueDescription);
  formData.append("issueStatus", state.issueStatus);
  formData.append("issueMarkStatus", state.issueMarkStatus);

  if (pdfFile) {
    formData.append("file", pdfFile);
  }

  try {
    await axios.put(`${adminLocalhost}/knownIssue/updateKnownIssue/${state.id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: `Updated Successfully`,
      showConfirmButton: false,
      timer: 1500
    }).then(() => {
      loadData();
    });

    setEditShow(false);
    setState({
      issueName: "",
      issueDescription: "",
      issueStatus: "",
      issueMarkStatus: "",
    });
    setPdfFile(null);
  } catch (err) {
    console.error("Error:", err);
    Swal.fire({
      icon: 'error',
      title: 'Update Failed',
      text: 'Something went wrong!',
    });
  }
};

const handleInputChange = (e) => {
  const { name, value } = e.target;
  setState((prevState) => ({
    ...prevState,
    [name]: value
  }));
};

const handleEditShow = async (item) => {
  try {
    const res = await axios.get(`${adminLocalhost}/knownIssue/getKnownIssueByID/${item.id}`);
    const data = res.data;

    setState({
      id: data.id,
      issueName: data.issueName,
      issueDescription: data.issueDescription,
      issueStatus: data.issueStatus,
      issueMarkStatus: data.issueMarkStatus,
      pdfFileName: data.pdfFileName || "",
      id: data.id
    });

    setEditShow(true);
  } catch (error) {
    console.error("❌ Failed to load issue data for editing:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Unable to load the issue details for editing.",
    });
  }
};

const handleEditClose = () => {
    setEditShow(false);
    setState({
        issueName: "",
        issueDescription: "",
        issueStatus: "",
        id: null
    });
};

const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
};

const filteredData = data.filter(item =>
  item.issueName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  item.issueDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
  item.issueStatus.toLowerCase().includes(searchTerm.toLowerCase())
);

const resetForm = () => {
  setState({
    issueName: '',
    issueDescription: '',
    issueStatus: ''
  });
};

const handlePDFChange = (e) => {
  setPdfFile(e.target.files[0]);
};

  return (
    <div>
        <div className='manageClassTimetopBarDiv'>
            {Cookies.get("sisUsername") ? (
                <Topbar />
            ) : Cookies.get("employeeUsername") ? (
                <TopbarEmployee />
            ) : null}
        </div>
        <div className='manageClassTimeSideBarDiv'>
            {Cookies.get("sisUsername") ? (
                <Sidebar />
            ) : Cookies.get("employeeUsername") ? (
                <SidebarEmployee />
            ) : null}
        </div>
      <div className='manageClassTimeBoxDiv'>
        <div className="manageClassTimecontainer">
            <div className="manageClassTimediv1">
                <h2 className="fs-2 m-0">KNOWN ISSUES</h2>
            </div>
            <div className="manageClassTimediv2 d-flex justify-content-between align-items-center">
                <div className="d-flex custom-margin">
                    <input
                        type="text"
                        placeholder="Search by keyword || status"
                        value={searchTerm}
                        onChange={handleSearchInputChange}
                        className="mr-2"
                        style={{width: '180px'}}
                    />
                </div>
                <Button id='btnRefresh' className='btn btn-contact me-2' title='Refresh' onClick={() => window.location.reload()}><FontAwesomeIcon icon={faRefresh} /></Button>
                {Cookies.get("sisUsername") && (
                    <Button className="btn btn-contact" title="Add" onClick={handleShow}>
                        <FontAwesomeIcon icon={faPlus} />
                    </Button>
                )}
            </div>

            <table className="styled-table" style={{ width: "100%" }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: "center" }}>No</th>
                        <th style={{ textAlign: "center" }}>Issue</th>
                        <th style={{ textAlign: "center" }}>Description</th>
                        <th style={{ textAlign: "center" }}>Status</th>
                        <th style={{ textAlign: "center" }}>Notes</th>
                        <th style={{ textAlign: "center" }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map((item, index) => (
                        <tr key={item.id}>
                            <td>{index + 1}</td>
                            <td>{item.issueName}</td>
                            <td>{item.issueDescription}</td>
                            <td>{item.issueStatus}</td>
                            <td>{item.pdfFileName || "N/A"}</td>
                            <td style={{ textAlign: "center" }}>
                                <div className="d-flex justify-content-center align-items-center">
                                {(Cookies.get("sisUsername") || Cookies.get("employeeUsername")) && (
                                    <button
                                    id="btnFontIcon"
                                    className="btn btn-info me-2"
                                    style={{ fontSize: "10px" }}
                                    title={Cookies.get("employeeUsername") ? "View" : "Edit"}
                                    onClick={() => handleEditShow(item)}
                                    >
                                    <FontAwesomeIcon icon={Cookies.get("employeeUsername") ? faEye : faEdit} />
                                    </button>
                                )}

                                {Cookies.get("sisUsername") && (
                                    <button
                                    id="btnFontIcon"
                                    className="btn btn-warning"
                                    style={{ fontSize: "10px" }}
                                    title="Delete"
                                    onClick={() => deleteContact(item.id)}
                                    >
                                    <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
            </table>

            {/* Add Modal */}
            <Modal 
                show={show} 
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
                enforceFocus={true}>
                <Modal.Header closeButton>
                    <Modal.Title style={{ color: '#151632' }}>Add Known Issue</Modal.Title>
                </Modal.Header>
                <Modal.Body className="custom-modal-body">
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="issueName">
                            <Form.Label>Issue</Form.Label>
                            <Form.Control
                                type="text"
                                name='issueName'
                                placeholder='Enter Issue'
                                value={state.issueName}
                                onChange={handleInputChange}
                                required
                                autoFocus
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="issueDescription">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                type="text"
                                name='issueDescription'
                                placeholder='Enter Description'
                                value={state.issueDescription}
                                required
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="issueStatus">
                            <Form.Label>Status</Form.Label>
                            <Form.Select
                                name="issueStatus"
                                value={state.issueStatus || ""}
                                required
                                onChange={handleInputChange}
                            >
                                <option value="">Select Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Inprogress">Inprogress</option>
                                <option value="Completed">Completed</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="issuePDF">
                          <Form.Label>Attach PDF</Form.Label>
                          <Form.Control
                            type="file"
                            accept="application/pdf"
                            onChange={handlePDFChange}
                          />
                        </Form.Group>

                        <Button type='submit' variant="primary" style={{ float: 'right', width: '15%' }}>Add</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Edit Modal */}
            <Modal 
                show={editShow} 
                onHide={handleEditClose}
                backdrop="static"
                keyboard={false}
                enforceFocus={true}>
                <Modal.Header closeButton>
                    <Modal.Title style={{ color: '#151632' }}>Edit Known Issue</Modal.Title>
                </Modal.Header>
                <Modal.Body className="custom-modal-body">
                    <Form onSubmit={handleEditSubmit}>
                        <Form.Group className="mb-3" controlId="editIssueName">
                            <Form.Label>Issue</Form.Label>
                            <Form.Control
                                type="text"
                                name='issueName'
                                placeholder='Enter Issue'
                                value={state.issueName}
                                onChange={handleInputChange}
                                required
                                autoFocus
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="editIssueDescription">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                type="text"
                                name='issueDescription'
                                placeholder='Enter Description'
                                value={state.issueDescription}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="editIssueStatus">
                            <Form.Label>Status</Form.Label>
                            <Form.Select
                                name="issueStatus"
                                value={state.issueStatus || ""}
                                required
                                onChange={handleInputChange}
                            >
                                <option value="">Select Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Inprogress">Inprogress</option>
                                <option value="Completed">Completed</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="editIssuePDF">
                          <Form.Label>Attach/Replace PDF</Form.Label>
                          <Form.Control
                            type="file"
                            accept="application/pdf"
                            onChange={handlePDFChange}
                          />
                        </Form.Group>

                        {state.pdfFileName && (
                          <div className="mb-3">
                            <Form.Label>Current PDF:</Form.Label><br />
                            <a
                              href={`${adminLocalhost}/knownIssue/downloadPDF/${state.pdfFileName}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ textDecoration: 'underline', color: 'blue', marginRight: '10px' }}
                            >
                              {state.pdfFileName}
                            </a>
                            {Cookies.get("sisUsername") && (
                              <Button
                                variant="danger"
                                size="sm"
                                style={{ fontSize: '10px' }}
                                title="Delete pdf"
                                onClick={() => handleDeletePDF(state.id)}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </Button>
                            )}
                          </div>
                        )}

                        {Cookies.get("sisUsername") && (
                            <Button type="submit" variant="primary" style={{ float: 'right', width: '20%' }}>
                                Update
                            </Button>
                        )}
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
      </div>
    </div>
  );
}
