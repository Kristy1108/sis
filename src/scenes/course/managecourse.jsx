import React, { useState, useEffect } from 'react';
import axios from "axios";
import Swal from 'sweetalert2';
import "./managecourse.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faRefresh, faEye, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { Button, Modal, Form } from 'react-bootstrap';
import "./managecourse.css";
import Sidebar from "../global/Sidebar";
import SidebarEmployee from "../global/SidebarEmployee";
import Topbar from "../global/Topbar";
import TopbarEmployee from '../global/TopbarEmployee';
import { adminLocalhost } from '../../localhost/adminLocalhost';
import { employeeLocalhost } from '../../localhost/employeeLocalhost';
import Cookies from 'js-cookie';

export default function Course() {

  const [state, setState] = useState({
    courseName: "",
    courseCode: "",
    courseTeachingDay: "",
    courseRevisionDay: "",
    coursePresentationDay: "",
    courseExamDay: "",
    courseBufferDay: "",
    progCode: "",
    courseTotalDay: "",
    courseCredit: "",
});

const [editData, setEditData] = useState({
    courseName: "",
    courseCode: "",
    courseTeachingDay: "",
    courseRevisionDay: "",
    coursePresentationDay: "",
    courseExamDay: "",
    courseBufferDay: "",
    progCode: "",
    courseTotalDay: "",
    courseTemplate: "",
    courseCredit: ""
  })

const { courseName, courseCode, progCode, courseTeachingDay, courseRevisionDay, coursePresentationDay, 
    courseExamDay, courseBufferDay, courseTotalDay } = state;

const [data, setData] = useState([]);
const [data3, setData3] = useState([]);
const [show, setShow] = useState(false);
const [editShow, setEditShow] = useState(false);

const handleClose = () => setShow(false);
const handleShow = () => setShow(true);
const handleEditClose = () => setEditShow(false);

const [programs, setPrograms] = useState([]);
const [selectedOption, setSelectedOption] = useState("");

const [progCodes, setProgCodes] = useState([]);
const [progCourseTemplate, setProgCourseTemplate] = useState([]);
const [progCourseTemplate1, setProgCourseTemplate1] = useState([]);
const [progCourseName, setProgCourseName] = useState([]);
const [selectedCourseName, setSelectedCourseName] = useState('');
const [selectedCourse, setSelectedCourse] = useState('');

const [searchTerm, setSearchTerm] = useState('');

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
    axios.get(`${employeeLocalhost}/marking/progCourseTemplate/${editData.courseCode}`)
        .then(response => {
            setProgCourseTemplate1(response.data);
        })
        .catch(error => {
            console.error('Error fetching course template:', error);
        });
}, [editData.courseCode]);

{/* List down Course Name */}
useEffect(() => {
    axios.get(`${adminLocalhost}/course/progCourseName`)
        .then(response => {
            setProgCourseName(response.data);
        })
        .catch(error => {
            console.error('Error fetching course template:', error);
        });
}, []);

{/* List down Course Code using CourseName */}
useEffect(() => {
    if (selectedCourseName !== '') {
        fetch(`${adminLocalhost}/course/getcourseCode/${selectedCourseName}`)
            .then(response => response.json())
            .then(data => {
              setSelectedCourse(data[0]);
            })
            .catch(error => {
                console.error('Error fetching course code:', error);
            });
    }
}, [selectedCourseName]);

{/* List down all Program Code */}
useEffect(() => {
    axios.get(`${adminLocalhost}/program/program-info`)
        .then(response => {
            setPrograms(response.data); // set programs array
        })
        .catch(error => {
            console.error('Error fetching program code:', error);
        });
}, []);

// OLD 
// useEffect(() => {
//   if (editData && editData.courseName !== '') {
//     fetch(`${adminLocalhost}/course/getcourseCode/${editData.courseName}`)
//       .then(r => r.json())
//       .then(data => setEditData(prev => ({ ...prev, courseCode: data[0] })));
//   }
// }, [editData, editData.courseName]);

useEffect(() => {
  if (editData?.courseName && !editData?.courseCode) {
    fetch(`${adminLocalhost}/course/getcourseCode/${editData.courseName}`)
      .then(r => r.json())
      .then(arr => setEditData(prev => ({ ...prev, courseCode: arr?.[0] ?? '' })))
      .catch(err => console.error('Error fetching course code:', err));
  }
}, [editData?.courseName]);

const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
};

const sortedFilteredData = [...data]
  .sort((a, b) => a.progCode.localeCompare(b.progCode))
  .filter((item) => {
    const roleMatch = item.progCode.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = item.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    return roleMatch || statusMatch;
  });

useEffect(() => {
    axios.get(`${adminLocalhost}/course/progCodes`)
        .then(response => {
            setProgCodes(response.data);
        })
        .catch(error => {
            console.error('Error fetching progCodes:', error);
        });
}, []);

const handleSelectChange = (e) => {
    const { value } = e.target;
    setSelectedOption(value);
};

const loadData = async () => {
    try {
        const response = await axios.get(`${adminLocalhost}/course/getCourseDetails`);
        setData(response.data);
    } catch (error) {
        console.error('Error occurred while fetching course details:', error);
    }
};

useEffect(() => {
    loadData();
}, []);

const deleteContact = (id) => {
    Swal.fire({
        title: 'Are you sure want to delete?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            axios.delete(`${adminLocalhost}/course/deleteCourse/${id}`);
            Swal.fire(
                {
                    position: 'top-end',
                    icon: 'success',
                    title: 'Deleted successfully!',
                    showConfirmButton: false,
                    timer: 1500
                }
            ).then(() => {
                loadData(); // Reload the data after successful deletion
            });
        }
    })
}

const handleSubmit = async (e) => {
    e.preventDefault();

    const totalDays = Number(state.courseTeachingDay) + Number(state.courseRevisionDay) + 
                      Number(state.coursePresentationDay) + Number(state.courseExamDay) + 
                      Number(state.courseBufferDay);

    if(!selectedOption || !state.courseName || !state.courseCode || !state.courseCredit) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please fill in all required fields!',
        });
        return;
    }

    try {
        await axios.post(`${adminLocalhost}/course/addCourse`, {
            ...state,
            progCode: selectedOption,
            courseTotalDay: totalDays,
            courseName: selectedCourseName,
            courseCode: selectedCourse
        });

        setState({
            courseName: "",
            courseCode: "",
            courseTeachingDay: "",
            courseRevisionDay: "",
            coursePresentationDay: "",
            courseExamDay: "",
            courseBufferDay: "",
            progCode: "",
            courseTotalDay: "",
            courseCredit: ""
        });

        setSelectedOption("");
        setSelectedCourseName("");
        setSelectedCourse("");

        setShow(false);

        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Course added successfully!',
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            loadData();
        });

    } catch (error) {
        console.error('Error occurred while adding course:', error);
    }
};

const handleInputChange = (e) => {
    const { name, value } = e.target;

    setState(prevState => ({
        ...prevState,
        [name]: value 
    }));
};

const handleEditShow = (item) => {
    setEditData(item); // Set the data for editing
    setEditShow(true);
};

const handleEditSubmit = async (e) => {
    e.preventDefault();

    const totalDays = Number(editData.courseTeachingDay) + Number(editData.courseRevisionDay) + 
                      Number(editData.coursePresentationDay) + Number(editData.courseExamDay) + 
                      Number(editData.courseBufferDay);

    try {
        await axios.put(`${adminLocalhost}/course/updateCourse/${editData.id}`, {
            ...editData,
            courseTotalDay: totalDays 
        });

        setEditShow(false);

        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Course updated successfully!',
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            loadData();
          });
    } catch (error) {
        console.error('Error occurred while updating course:', error);
    }
};

const handleEditInputChange = (fieldName, value) => {
    setEditData((prevData) => ({
        ...prevData,
        [fieldName]: value 
    }));
};

const handleSelectCourseTemplate = (e) => {
    const { name, value } = e.target;
    switch (name) {
        case 'courseName':
            setSelectedCourseName(value);
            break;
    }
  };

  return (
    <div>
        <div className='manageCoursetopBarDiv'>
            {Cookies.get("sisUsername") ? (
                <Topbar />
            ) : Cookies.get("employeeUsername") ? (
                <TopbarEmployee />
            ) : null}
        </div>
        <div className='manageCourseSideBarDiv'>
            {Cookies.get("sisUsername") ? (
                <Sidebar />
            ) : Cookies.get("employeeUsername") ? (
                <SidebarEmployee />
            ) : null}
        </div>
        <div className='manageCourseBoxDiv'>
            <div className="manageCourseContainer">
                <div className="manageCoursediv1">
                    <h2 className="fs-2 m-0">COURSE INFORMATION</h2>
                </div>
                <div className="manageCoursediv2 d-flex justify-content-between align-items-center">
                    <div className="d-flex custom-margin">
                        <input
                                type="text"
                                placeholder="Search by Prog/Course Code"
                                value={searchTerm}
                                onChange={handleSearchInputChange}
                                className="mr-2"
                                style={{width: '180px'}}
                            />
                    </div>
                    <Button id='btnRefresh' className='btn btn-contact me-2' onClick={() => window.location.reload()}><FontAwesomeIcon icon={faRefresh} /></Button>
                    {data3.some(
                        item => item.category === "Manage Course" && item.accessType === "Read/Write"
                        ) && (
                        <Button className="btn btn-contact" onClick={handleShow}>
                            <FontAwesomeIcon icon={faPlus} />
                        </Button>
                    )}
                </div>

                <table className="styled-table" style={{width: '100%'}}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: "center" }}>No</th>
                            <th style={{ textAlign: "center" }}>Program Code</th>
                            <th style={{ textAlign: "center" }}>Course</th>
                            <th style={{ textAlign: "center" }}>Course Code</th>
                            <th style={{ textAlign: "center" }}>Credit</th>
                            <th style={{ textAlign: "center" }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                    {sortedFilteredData.map((item, index) => {
                        return (
                            <tr key={item.id}>
                                <td scope="row">{index + 1}</td>
                                <td>{item.progCode}</td>
                                <td>{item.courseName}</td>
                                <td>{item.courseCode}</td>
                                <td>{item.courseCredit}</td>
                                <td>
                                    {data3.some(item => item.category === "Manage Course") && (
                                        <button
                                            id="btnFontIcon"
                                            className="btn btn-info"
                                            style={{fontSize: "10px"}}
                                            onClick={() => handleEditShow(item)}
                                        >
                                            <FontAwesomeIcon
                                            icon={
                                                data3.some(
                                                item => item.category === "Manage Course" && item.accessType === "Read Only"
                                                )
                                                ? faEye
                                                : faEdit
                                            }
                                            />
                                        </button>
                                    )}
                                    {data3.some(item => item.category === "Manage Course" && item.accessType === "Read/Write"
                                    ) && (
                                        <button
                                            id='btnFontIcon'
                                            className="btn btn-warning"
                                            style={{fontSize: "10px"}}
                                            onClick={() => deleteContact(item.id)}
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

                {/* Add Modal */}
                <Modal 
                show={show} 
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
                enforceFocus={true}
                dialogClassName="custom-modal">
                    <Modal.Header closeButton>
                    <Modal.Title style={{ color: '#151632' }}>Add Course</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="custom-modal-body">
                    <Form onSubmit={handleSubmit}>

                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-3" controlId="courseName">
                                <Form.Label>Course Name</Form.Label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control
                                        as="select"
                                        value={selectedCourseName}
                                        name='courseName'
                                        onChange={handleSelectCourseTemplate}
                                    >
                                        <option value="">Select Course</option>
                                        {progCourseName.map(progEnrollDate => (
                                            <option key={progEnrollDate} value={progEnrollDate}>{progEnrollDate}</option>
                                        ))}
                                    </Form.Control>
                                    <FontAwesomeIcon icon={faCaretDown} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }} />
                                </div>
                                </Form.Group>
                            </div>

                            <div className="col-md-6">
                            <Form.Group className="mb-3" controlId="courseCode">
                            <Form.Label>Course Code</Form.Label>
                            <Form.Control
                                type="text"
                                name='courseCode'
                                value={selectedCourse}
                                readOnly
                                onChange={handleInputChange}
                            />
                            </Form.Group>
                            </div>

                            <div className="col-md-6">
                            <Form.Group className="mb-3" controlId="courseTeachingDay">
                            <Form.Label>No of Teaching Day</Form.Label>
                            <Form.Control
                                type="number"
                                name='courseTeachingDay'
                                value={state.courseTeachingDay}
                                placeholder="Enter Teaching days"
                                onChange={handleInputChange}
                            />
                            </Form.Group>
                            </div>

                            <div className="col-md-6">
                            <Form.Group className="mb-3" controlId="courseRevisionDay">
                            <Form.Label>No of Revision Day</Form.Label>
                            <Form.Control
                                type="number"
                                name='courseRevisionDay'
                                value={state.courseRevisionDay}
                                placeholder="Enter Revision days"
                                onChange={handleInputChange}
                            />
                            </Form.Group>
                            </div>

                            <div className="col-md-6">
                            <Form.Group className="mb-3" controlId="coursePresentationDay">
                            <Form.Label>No of Presentation Day</Form.Label>
                            <Form.Control
                                type="number"
                                name='coursePresentationDay'
                                value={state.coursePresentationDay}
                                placeholder="Enter Presentation days"
                                onChange={handleInputChange}
                            />
                            </Form.Group>
                            </div>

                            <div className="col-md-6">
                            <Form.Group className="mb-3" controlId="courseExamDay">
                            <Form.Label>No of Exam Day</Form.Label>
                            <Form.Control
                                type="number"
                                name='courseExamDay'
                                value={state.courseExamDay}
                                placeholder="Enter Exam days"
                                onChange={handleInputChange}
                            />
                            </Form.Group>
                            </div>

                            <div className="col-md-6">
                            <Form.Group className="mb-3" controlId="courseBufferDay">
                            <Form.Label>No of Buffer Day</Form.Label>
                            <Form.Control
                                type="number"
                                name='courseBufferDay'
                                value={state.courseBufferDay}
                                placeholder="Enter Buffer days"
                                onChange={handleInputChange}
                            />
                            </Form.Group>
                            </div>

                            <div className="col-md-6">
                            <Form.Group className="mb-3" controlId="courseTotalDay">
                            <Form.Label>Total Days</Form.Label>
                            <Form.Control
                                type="number"
                                name='courseTotalDay'
                                placeholder="Auto Filup"
                                onChange={handleInputChange}
                                readOnly
                            />
                            </Form.Group>
                            </div>

                            <div className="col-md-6">
                                <Form.Group controlId="progCode">
                                    <Form.Label>Select Program:</Form.Label>
                                    <Form.Select
                                        name="selectedOption" 
                                        onChange={handleSelectChange} 
                                        value={selectedOption}
                                    >
                                        <option value="">Select Program</option>
                                        {programs.map((program) => (
                                            <option key={program.id} value={program.programCode}>
                                                {program.programCode}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </div>

                            <div className="col-md-6">
                            <Form.Group className="mb-3" controlId="courseCredit">
                            <Form.Label>Credit</Form.Label>
                            <Form.Control
                                type="number"
                                name='courseCredit'
                                value={state.courseCredit}
                                placeholder="Enter Credit"
                                onChange={handleInputChange}
                            />
                            </Form.Group>
                            </div>
                        </div>
                        <Button type='submit' variant="primary" style={{float: 'right', width: '15%'}}>Add</Button>
                    </Form>
                    </Modal.Body>
                </Modal>

                {/* Edit Modal */}
                <Modal 
                show={editShow} 
                onHide={handleEditClose}
                backdrop="static"
                keyboard={false}
                enforceFocus={true}
                dialogClassName="custom-modal">
                    <Modal.Header closeButton>
                        <Modal.Title style={{ color: '#151632' }}>
                            {data3.some(item => item.category === "Manage Course" && item.accessType === "Read Only")
                            ? "View Course"
                            : "Update Course"
                            }
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="custom-modal-body">
                    <Form>
                        <div className="row">

                            <div className="col-md-6">
                                <Form.Group className="mb-3" controlId="courseName">
                                <Form.Label>Course Name</Form.Label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control
                                        as="select"
                                        value={editData ? editData.courseName : ""}
                                        onChange={e => {
                                            setEditData({
                                                ...editData,
                                                courseName: e.target.value
                                            });
                                        }}
                                        autoFocus
                                    >
                                        <option value="">Select Course</option>
                                        {progCourseName.map(progEnrollDate => (
                                            <option key={progEnrollDate} value={progEnrollDate}>{progEnrollDate}</option>
                                        ))}
                                    </Form.Control>
                                    <FontAwesomeIcon icon={faCaretDown} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }} />
                                </div>
                                </Form.Group>
                            </div>

                            <div className="col-md-6">
                                <Form.Group className="mb-3" controlId="courseCode">
                                <Form.Label>Course Code*</Form.Label>
                                <Form.Control
                                    type="text"
                                    name='courseCode'
                                    placeholder="Enter Course Code"
                                    value={editData ? editData.courseCode : ""}
                                    onChange={(e) => handleEditInputChange('courseCode', e.target.value)}
                                />
                                </Form.Group>
                            </div>

                            <div className="col-md-6">
                                <Form.Group className="mb-3" controlId="courseTeachingDay">
                                <Form.Label>No of Teaching Day*</Form.Label>
                                <Form.Control
                                    type="number"
                                    name='courseTeachingDay'
                                    placeholder="Enter Revision days"
                                    value={editData ? editData.courseTeachingDay : ""}
                                    onChange={(e) => handleEditInputChange('courseTeachingDay', e.target.value)}
                                />
                                </Form.Group>
                            </div>

                            <div className="col-md-6">
                                <Form.Group className="mb-3" controlId="courseRevisionDay">
                                <Form.Label>No of Revision Day*</Form.Label>
                                <Form.Control
                                    type="number"
                                    name='courseRevisionDay'
                                    placeholder="Enter Revision days"
                                    value={editData ? editData.courseRevisionDay : ""}
                                    onChange={(e) => handleEditInputChange('courseRevisionDay', e.target.value)}
                                />
                                </Form.Group>
                            </div>

                            <div className="col-md-6">
                                <Form.Group className="mb-3" controlId="coursePresentationDay">
                                <Form.Label>No of Presentation Day*</Form.Label>
                                <Form.Control
                                    type="number"
                                    name='coursePresentationDay'
                                    placeholder="Enter Presentation days"
                                    value={editData ? editData.coursePresentationDay : ""}
                                    onChange={(e) => handleEditInputChange('coursePresentationDay', e.target.value)}
                                />
                                </Form.Group>
                            </div>

                            <div className="col-md-6">
                                <Form.Group className="mb-3" controlId="courseExamDay">
                                <Form.Label>No of Exam Day*</Form.Label>
                                <Form.Control
                                    type="number"
                                    name='courseExamDay'
                                    placeholder="Enter Exam days"
                                    value={editData ? editData.courseExamDay : ""}
                                    onChange={(e) => handleEditInputChange('courseExamDay', e.target.value)}
                                />
                                </Form.Group>
                            </div>

                            <div className="col-md-6">
                                <Form.Group className="mb-3" controlId="courseBufferDay">
                                <Form.Label>No of Buffer Day*</Form.Label>
                                <Form.Control
                                    type="number"
                                    name='courseBufferDay'
                                    placeholder="Enter Buffer days"
                                    value={editData ? editData.courseBufferDay : ""}
                                    onChange={(e) => handleEditInputChange('courseBufferDay', e.target.value)}
                                />
                                </Form.Group>
                            </div>

                            <div className="col-md-6">
                                <Form.Group className="mb-3" controlId="courseTotalDay">
                                <Form.Label>Total Days*</Form.Label>
                                <Form.Control
                                    type="number"
                                    name='courseTotalDay'
                                    placeholder="Total days"
                                    readOnly
                                    value={editData ? editData.courseTotalDay : ""}
                                    onChange={(e) => handleEditInputChange('courseTotalDay', e.target.value)}
                                />
                                </Form.Group>
                            </div>

                            <div className="col-md-6">
                                <Form.Group className="mb-3" controlId="progCode">
                                    <Form.Label>Program</Form.Label>
                                    <Form.Select
                                    value={editData ? editData.progCode : ""}
                                    onChange={(e) => handleEditInputChange('progCode', e.target.value)}
                                    >
                                    <option value="">Select Program</option>
                                    <option value="DIT">DIT</option>
                                    <option value="DIP">DIP</option>
                                    <option value="DSE">DSE</option>
                                    <option value="DSG">DSG</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>

                            <div className="col-md-6">
                            <Form.Group className="mb-3" controlId="courseCredit">
                            <Form.Label>Credit</Form.Label>
                            <Form.Control
                                type="number"
                                name='courseCredit'
                                placeholder="Enter Credit"
                                value={editData ? editData.courseCredit : ""}
                                onChange={(e) => handleEditInputChange('courseCredit', e.target.value)}
                            />
                            </Form.Group>
                            </div>
                        </div>
                        </Form>
                    </Modal.Body>
                    {data3.some(item => item.category === "Manage Course" && item.accessType === "Read/Write") && (
                        <Modal.Footer>
                        <Button
                            className="submitBtn"
                            style={{float: 'right'}}
                            onClick={handleEditSubmit}
                            variant="primary"
                        >
                            Update
                        </Button>
                        </Modal.Footer>
                    )}
                </Modal>
            </div>
        </div>
    </div>
  );
}