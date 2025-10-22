import React, { useState, useEffect } from 'react';
import axios from "axios";
import Swal from 'sweetalert2';
import "./managecourse.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faRefresh, faEye, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { Button, Modal, Form, Table } from 'react-bootstrap';
import "./managecourse.css";
import Sidebar from "../global/Sidebar";
import SidebarEmployee from "../global/SidebarEmployee";
import Topbar from "../global/Topbar";
import TopbarEmployee from '../global/TopbarEmployee';
import { adminLocalhost } from '../../localhost/adminLocalhost';
import { employeeLocalhost } from '../../localhost/employeeLocalhost';
import Cookies from 'js-cookie';

export default function ManageMarkingScheme() {

const [state, setState] = useState({
    courseCode: "",
    courseName: "",
    markCourseTemplate: "",
    mark1: 0,
    mark2: 0,
    mark3: 0,
    mark4: 0,
    mark5: 0,
    exam1: "",
    exam2: "",
    exam3: "",
    exam4: "",
    exam5: "",
    progCode: "",
    totalMarks: "",
    totalWT: "",
    totalOT: "",
    totalAss: "",
    totalResearchProj: "",
    markPractical: ""
});

const [editData, setEditData] = useState({
    courseCode: "",
    courseName: "",
    mark1: "",
    mark2: "",
    mark3: "",
    mark4: "",
    mark5: "",
    progCode: "",
    totalMarks: "",
    totalWT: "",
    totalOT: "",
    totalAss: "",
    totalResearchProj: "",
    markPractical: ""
});

const { mark1, mark2, mark3, mark4, mark5, exam1, exam2, exam3, exam4, exam5, totalMarks, totalWT, totalOT, totalAss, totalResearchProj } = state;

const [data, setData] = useState([]);
const [data3, setData3] = useState([]);
const [show, setShow] = useState(false);
const [editShow, setEditShow] = useState(false);

const handleClose = () => setShow(false);
const handleShow = () => setShow(true);
const handleEditClose = () => setEditShow(false);

const [selectedOption, setSelectedOption] = useState('');
const [selectedExam1, setSelectedExam1] = useState('');
const [selectedExam2, setSelectedExam2] = useState('');
const [selectedExam3, setSelectedExam3] = useState('');
const [selectedExam4, setSelectedExam4] = useState('');
const [selectedExam5, setSelectedExam5] = useState('');
const [selectedCourseCode, setSelectedCourseCode] = useState('');
const [selectedProgCode, setSelectedProgCode] = useState('');
const [progCoursesCode, setProgCoursesCode] = useState([]);

const [selectedCourse, setSelectedCourse] = useState('');
const [selectedProg, setSelectedProg] = useState('');
const [progCourses, setProgCourses] = useState([]);
const [selectedProgram, setSelectedProgram] = useState([]);
const [progCoursesName, setProgCoursesName] = useState([]);

const [searchTerm, setSearchTerm] = useState('');

const [selectedTotalMark1, setSelectedTotakMark1] = useState('');
const [selectedTotalMark2, setSelectedTotakMark2] = useState('');
const [selectedTotalMark3, setSelectedTotakMark3] = useState('');
const [selectedTotalMark4, setSelectedTotakMark4] = useState('');
const [selectedTotalMark5, setSelectedTotakMark5] = useState('');

const [selectedTotalScore1, setSelectedTotakScore1] = useState('');
const [selectedTotalScore2, setSelectedTotakScore2] = useState('');
const [selectedTotalScore3, setSelectedTotakScore3] = useState('');
const [selectedTotalScore4, setSelectedTotakScore4] = useState('');
const [selectedTotalScore5, setSelectedTotakScore5] = useState('');

const [selectedTotalMarkA1, setSelectedTotakMarkA1] = useState('');
const [selectedTotalMarkA2, setSelectedTotakMarkA2] = useState('');
const [selectedTotalMarkA3, setSelectedTotakMarkA3] = useState('');
const [selectedTotalMarkA4, setSelectedTotakMarkA4] = useState('');
const [selectedTotalMarkA5, setSelectedTotakMarkA5] = useState('');

const [selectedTotalScoreB1, setSelectedTotakScoreB1] = useState('');
const [selectedTotalScoreB2, setSelectedTotakScoreB2] = useState('');
const [selectedTotalScoreB3, setSelectedTotakScoreB3] = useState('');
const [selectedTotalScoreB4, setSelectedTotakScoreB4] = useState('');
const [selectedTotalScoreB5, setSelectedTotakScoreB5] = useState('');

const [totalWrittenTest, setSelectedTotalWrittenTest] = useState('');
const [totalOralTest, setSelectedTotalOralTest] = useState('');
const [totalAssignment, setSelectedTotalAssignment] = useState('');
const [totalResearch, setSelectedTotalResearch] = useState('');
const [courseTemplateCount, setCourseTemplateCount] = useState();
const [selectedPractical, setSelectedPractical] = useState('');

const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
};

const sortedFilteredData = [...data].sort((a, b) => a.progCode.localeCompare(b.progCode)).filter((item) => {
    const roleMatch = item.progCode.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = item.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    return roleMatch || statusMatch;
  });

  const handleSelectChange = (e) => {
    const { name, value } = e.target;

    switch (name) {
        case 'exam1':
            setSelectedExam1(value);
            break;
        case 'exam2':
            setSelectedExam2(value);
            break;
        case 'exam3':
            setSelectedExam3(value);
            break;
        case 'exam4':
            setSelectedExam4(value);
            break;
        case 'exam5':
            setSelectedExam5(value);
            break;
        case 'selectedProgram': // Handle program selection
            setSelectedOption(value);
            break;
        default:
            console.warn("Unexpected field:", name);
    }
};

const handleSelectCourseCode = (event) => {
    setSelectedCourseCode(event.target.value);
  };

const handleSelectCourse = (event) => {
setSelectedCourse(event.target.value);
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

const loadData = async () => {
    try {
        const response = await axios.get(`${employeeLocalhost}/marking/getMarkingDetails`);
        setData(response.data);
    } catch (error) {
        console.error('Error occurred while fetching marking details:', error);
    }
};

useEffect(() => {
    loadData();
}, []);

useEffect(() => {
    setSelectedTotalWrittenTest(Number(selectedTotalMark1) + Number(selectedTotalMark2) + Number(selectedTotalMark3) + Number(selectedTotalMark4) + Number(selectedTotalMark5));
    setSelectedTotalOralTest(Number(selectedTotalScore1) + Number(selectedTotalScore2) + Number(selectedTotalScore3) + Number(selectedTotalScore4) + Number(selectedTotalScore5));
    setSelectedTotalAssignment(Number(selectedTotalMarkA1) + Number(selectedTotalMarkA2) + Number(selectedTotalMarkA3) + Number(selectedTotalMarkA4) + Number(selectedTotalMarkA5));
    setSelectedTotalResearch(Number(selectedTotalScoreB1) + Number(selectedTotalScoreB2) + Number(selectedTotalScoreB3) + Number(selectedTotalScoreB4) + Number(selectedTotalScoreB5));
});

useEffect(() => {
  const fetchCourseTemplateCount = async () => {
    if (!selectedCourseCode && !selectedOption) return; // Ignore if selectedCourseCode is empty

    try {
      const response = await axios.get(`${employeeLocalhost}/marking/getCourseTemplateCount/${selectedCourseCode}/${selectedOption}`);
      setCourseTemplateCount(response.data);
    } catch (error) {
      console.error("Error fetching course template count", error);
      setCourseTemplateCount(); // Fallback to 1 if there's an error
    }
  };

  fetchCourseTemplateCount();
}, [selectedCourseCode, selectedOption]);

{/* List down all Course Name */}
useEffect(() => {
    axios.get(`${adminLocalhost}/course/progCourse`)
    .then(response => {
        setProgCoursesCode(response.data);
    })
    .catch(error => {
        console.error('Error fetching course code:', error);
    });
}, [selectedProgCode]);

{/* List down all Course Name */}
useEffect(() => {
    axios.get(`${adminLocalhost}/course/progCourseName`)
    .then(response => {
        setProgCourses(response.data);
    })
    .catch(error => {
        console.error('Error fetching course code:', error);
    });
}, [selectedProg]);

{/* List down all Program Code */}
useEffect(() => {
    axios.get(`${adminLocalhost}/program/program-info`)
    .then(response => {
        setSelectedProgram(response.data);
    })
    .catch(error => {
        console.error('Error fetching program code:', error);
    });
}, []);

{/* Find Course Name by Course Code for add Modal*/}
useEffect(() => {
    axios.get(`${adminLocalhost}/course/getcourseName/${selectedCourseCode}`)
        .then(response => {
            setProgCoursesName(response.data[0]);
        })
        .catch(error => {
            console.error('Error fetching course name from edit modal:', error);
        });
}, [selectedCourseCode]);

{/* Find Course Name by Course Code for edit Modal*/}
useEffect(() => {
    axios.get(`${adminLocalhost}/course/getcourseName/${selectedCourseCode}`)
        .then(response => {
            setProgCoursesName(response.data[0]);
        })
        .catch(error => {
            console.error('Error fetching course name from edit modal:', error);
        });
}, [selectedCourseCode]);

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
            axios.delete(`${employeeLocalhost}/marking/deleteMarking/${id}`);
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

    const totalDays  = Number(state.mark1) + Number(state.mark2) + Number(state.mark3) + 
                       Number(state.mark4) + Number(state.mark5);

    if(!selectedOption || !selectedCourseCode) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please fill in program and course code fields!',
        });
        return;
    }

    if (!selectedPractical || selectedPractical === "") {
        Swal.fire({
            position: 'top-end',
            icon: 'warning',
            title: 'Please select the practical',
            showConfirmButton: false,
            timer: 1500
        });
    } else {
        try {
            await axios.post(`${employeeLocalhost}/marking/addMarking`, {
                ...state,
                progCode: selectedOption,
                courseCode: selectedCourseCode,
                courseName: progCoursesName,
                totalMarks: totalDays,
                totalWT: totalWrittenTest,
                totalOT: totalOralTest,
                totalAss: totalAssignment,
                totalResearchProj: totalResearch,
                exam1: selectedExam1,
                exam2: selectedExam2,
                exam3: selectedExam3,
                exam4: selectedExam4,
                exam5: selectedExam5,
                markCourseTemplate: selectedOption + "-" + courseTemplateCount,
                markPractical: selectedPractical
            });

            setState({
                courseCode: "",
                courseName: "",
                markCourseTemplate: "",
                mark1: "",
                mark2: "",
                mark3: "",
                mark4: "",
                mark5: "",
                exam1: "",
                exam2: "",
                exam3: "",
                exam4: "",
                exam5: "",
                progCode: "",
                totalMarks: "",
                totalWT: "",
                totalOT: "",
                totalAss: "",
                totalResearchProj: "",
                markPractical: ""
            });

            setSelectedProgram([]);
            setProgCoursesName("");
            setSelectedCourseCode("");
            setSelectedExam1("");
            setSelectedExam2("");
            setSelectedExam3("");
            setSelectedExam4("");
            setSelectedExam5("");
            setSelectedPractical(''); 

            setShow(false);

            Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: 'Marking Scheme added successfully!',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                loadData();
            });

        } catch (error) {
            console.error('Error occurred while adding marking:', error);
        }
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
    setEditData(item);
    setEditShow(true);
};

const handleEditSubmit = async (e) => {
    e.preventDefault();

    const totalDays = Number(editData.mark1) + Number(editData.mark2) + Number(editData.mark3) + Number(editData.mark4) + 
                      Number(editData.mark5);
    
    try {
        await axios.put(`${employeeLocalhost}/marking/updateMarking/${editData.id}`, {
            ...editData,
            totalMarks: totalDays,
            mark1: editData.mark1 === "" ? 0 : Number(editData.mark1),
            mark2: editData.mark2 === "" ? 0 : Number(editData.mark2),
            mark3: editData.mark3 === "" ? 0 : Number(editData.mark3),
            mark4: editData.mark4 === "" ? 0 : Number(editData.mark4),
            mark5: editData.mark5 === "" ? 0 : Number(editData.mark5),
        });

        setEditShow(false);

        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Marking Scheme updated successfully!',
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            loadData();
          });
        
        loadData();
    } catch (error) {
        console.error('Error occurred while updating marking:', error);
    }
};

const handleEditInputChange = (name, value) => {
    setEditData({ ...editData, [name]: value });
};

const handleCheckboxChange = (e) => {
    setSelectedPractical(e.target.value);
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
                    <h2 className="fs-2 m-0">MARKING SCHEME</h2>
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
                    <Button id='btnRefresh' className='btn btn-contact me-2' title='Refresh' onClick={() => window.location.reload()}><FontAwesomeIcon icon={faRefresh} /></Button>
                    {data3.some(
                        item => item.category === "Manage MarkingScheme" && item.accessType === "Read/Write"
                        ) && (
                        <Button className="btn btn-contact" title='Add' onClick={handleShow}>
                            <FontAwesomeIcon icon={faPlus} />
                        </Button>
                    )}
                </div>

                <table className="styled-table" style={{width: '100%'}}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: "center" }}>No</th>
                            <th style={{ textAlign: "center" }}>Program Code</th>
                            <th style={{ textAlign: "center" }}>Course Template</th>
                            <th style={{ textAlign: "center" }}>Course</th>
                            <th style={{ textAlign: "center" }}>Course Code</th>
                            <th style={{ textAlign: "center" }}>Mark 1</th>
                            <th style={{ textAlign: "center" }}>Mark 2</th>
                            <th style={{ textAlign: "center" }}>Mark 3</th>
                            <th style={{ textAlign: "center" }}>Mark 4</th>
                            <th style={{ textAlign: "center" }}>Mark 5</th>
                            <th style={{ textAlign: "center" }}>Total Mark</th>
                            <th style={{ textAlign: "center" }}>Practical</th>
                            <th style={{ textAlign: "center" }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                    {sortedFilteredData.map((item, index) => {
                        return (
                            <tr key={item.id}>
                                <td scope="row">{index + 1}</td>
                                <td>{item.progCode}</td>
                                <td>{item.markCourseTemplate}</td>
                                <td>{item.courseName}</td>
                                <td>{item.courseCode}</td>
                                <td>{item.mark1}</td>
                                <td>{item.mark2}</td>
                                <td>{item.mark3}</td>
                                <td>{item.mark4}</td>
                                <td>{item.mark5}</td>
                                <td>{item.totalMarks}</td>
                                <td>{item.markPractical}</td>
                                <td style={{ verticalAlign: "middle", whiteSpace: "nowrap" }}>
                                    {data3.some(item => item.category === "Manage MarkingScheme") && (
                                        <button
                                            id="btnFontIcon"
                                            className="btn btn-info"
                                            title='Edit'
                                            style={{ fontSize: "10px", marginRight: "4px" }}
                                            onClick={() => handleEditShow(item)}
                                        >
                                            <FontAwesomeIcon
                                            icon={
                                                data3.some(
                                                item => item.category === "Manage MarkingScheme" && item.accessType === "Read Only"
                                                )
                                                ? faEye
                                                : faEdit
                                            }
                                            />
                                        </button>
                                    )}
                                    {data3.some(item => item.category === "Manage MarkingScheme" && item.accessType === "Read/Write"
                                        ) && (
                                            <button
                                            id='btnFontIcon'
                                            title='Delete'
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
                    <Modal.Title style={{ color: '#151632' }}>Add Marking Scheme</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="custom-modal-body">
                    <Form>

                        <Form.Group controlId="programCourseSelection">
                        <Form.Label className="fw-bold">Program and Course Selection</Form.Label>
                            <div className="row">
                                <div className="col-md-6">
                                    <Form.Group controlId="progCode">
                                    <Form.Label>Select Program:</Form.Label>
                                    <Form.Select
                                        as="select"
                                        name="selectedProgram" 
                                        onChange={handleSelectChange} 
                                    >
                                        <option value="">Select Program</option>
                                        {selectedProgram.map((program) => (
                                            <option key={program.id} value={program.programCode}>
                                                {program.programCode}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    </Form.Group>
                                </div>

                                <div className="col-md-6">
                                <Form.Group className="mb-3" controlId="courseCode">
                                    <Form.Label>Course Code*</Form.Label>
                                    <div style={{ position: 'relative' }}>
                                        <Form.Control
                                            as="select"
                                            value={selectedCourseCode}
                                            onChange={handleSelectCourseCode}
                                        >
                                            <option value="">Select Course Code</option>
                                            {progCoursesCode.map(Coursecode => (
                                                <option key={Coursecode} value={Coursecode}>{Coursecode}</option>
                                            ))}
                                        </Form.Control>
                                        <FontAwesomeIcon icon={faCaretDown} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }} />
                                    </div>
                                </Form.Group>
                                </div>

                                <div className="col-md-6">
                                <Form.Group className="mb-3" controlId="courseTemplate">
                                <Form.Label>Course Template:</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="courseTemplate"
                                    placeholder='Auto select by system'
                                    readOnly
                                />
                                </Form.Group>
                                </div>                           
                            </div>
                        </Form.Group>

                        <Form.Group controlId="examMarkSelection">
                        <Form.Label className="fw-bold">Exam and Mark Selection</Form.Label>
                            <div className="row">

                                <div className="col-md-6">
                                    <Form.Group controlId="exam1">
                                    <Form.Label>Exam 1</Form.Label>
                                    <Form.Select name="exam1" value={selectedExam1} onChange={handleSelectChange}>
                                        <option value="">Select Exam</option>
                                        <option value="Written Test">Written Test</option>
                                        <option value="Oral Test">Oral Test</option>
                                        <option value="Assessment">Assessment</option>
                                        <option value="Exercise">Exercise</option>
                                        <option value="Homework">Homework</option>
                                        <option value="Service Report">Service Report</option>
                                        <option value="Proposal">Proposal</option>
                                        <option value="Implementation">Implementation</option>
                                        <option value="Project">Project</option>
                                        <option value="Presentation">Presentation</option>
                                        <option value="Exercise - Role Play">Exercise</option>
                                    </Form.Select>
                                    </Form.Group>
                                </div>

                                <div className="col-md-6">
                                <Form.Group className="mb-3" controlId="mark1">
                                <Form.Label>Mark 1 (%)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name='mark1'
                                    value={state.mark1}
                                    placeholder="Enter Mark 1"
                                    onChange={handleInputChange}
                                />
                                </Form.Group>
                                </div>
                        
                            </div>

                            <div className="row">

                                <div className="col-md-6">
                                    <Form.Group controlId="exam2">
                                    <Form.Label>Exam 2</Form.Label>
                                    <Form.Select name="exam2" value={selectedExam2} onChange={handleSelectChange}>
                                        <option value="">Select Exam</option>
                                        <option value="Written Test">Written Test</option>
                                        <option value="Oral Test">Oral Test</option>
                                        <option value="Assessment">Assessment</option>
                                        <option value="Exercise">Exercise</option>
                                        <option value="Homework">Homework</option>
                                        <option value="Service Report">Service Report</option>
                                        <option value="Proposal">Proposal</option>
                                        <option value="Implementation">Implementation</option>
                                        <option value="Project">Project</option>
                                        <option value="Mini Project">Mini Project</option>
                                        <option value="Presentation">Presentation</option>
                                        <option value="Exercise - Role Play">Exercise</option>
                                    </Form.Select>
                                    </Form.Group>
                                </div>

                                <div className="col-md-6">
                                <Form.Group className="mb-3" controlId="mark2">
                                <Form.Label>Mark 2 (%)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name='mark2'
                                    value={state.mark2}
                                    placeholder="Enter Mark 2"
                                    onChange={handleInputChange}
                                />
                                </Form.Group>
                                </div>
                                                        
                            </div>

                            <div className="row">

                                <div className="col-md-6">
                                    <Form.Group controlId="exam1">
                                    <Form.Label>Exam 3</Form.Label>
                                    <Form.Select name="exam3" value={selectedExam3} onChange={handleSelectChange}>
                                        <option value="">Select Exam</option>
                                        <option value="Written Test">Written Test</option>
                                        <option value="Oral Test">Oral Test</option>
                                        <option value="Assessment">Assessment</option>
                                        <option value="Exercise">Exercise</option>
                                        <option value="Homework">Homework</option>
                                        <option value="Service Report">Service Report</option>
                                        <option value="Proposal">Proposal</option>
                                        <option value="Implementation">Implementation</option>
                                        <option value="Project">Project</option>
                                        <option value="Presentation">Presentation</option>
                                        <option value="Exercise - Role Play">Exercise</option>
                                    </Form.Select>
                                    </Form.Group>
                                </div>

                                <div className="col-md-6">
                                <Form.Group className="mb-3" controlId="mark3">
                                <Form.Label>Mark 3 (%)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name='mark3'
                                    value={state.mark3}
                                    placeholder="Enter Mark 3"
                                    onChange={handleInputChange}
                                />
                                </Form.Group>
                                </div>
                            
                            </div>

                            <div className="row">

                                <div className="col-md-6">
                                    <Form.Group controlId="exam1">
                                    <Form.Label>Exam 4</Form.Label>
                                    <Form.Select name="exam4" value={selectedExam4} onChange={handleSelectChange}>
                                        <option value="">Select Exam</option>
                                        <option value="Written Test">Written Test</option>
                                        <option value="Oral Test">Oral Test</option>
                                        <option value="Assessment">Assessment</option>
                                        <option value="Exercise">Exercise</option>
                                        <option value="Homework">Homework</option>
                                        <option value="Service Report">Service Report</option>
                                        <option value="Proposal">Proposal</option>
                                        <option value="Implementation">Implementation</option>
                                        <option value="Project">Project</option>
                                        <option value="Presentation">Presentation</option>
                                        <option value="Exercise - Role Play">Exercise</option>
                                    </Form.Select>
                                    </Form.Group>
                                </div>

                                <div className="col-md-6">
                                <Form.Group className="mb-3" controlId="mark4">
                                <Form.Label>Mark 4 (%)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name='mark4'
                                    value={state.mark4}
                                    placeholder="Enter Mark 4"
                                    onChange={handleInputChange}
                                />
                                </Form.Group>
                                </div>                            
                            </div>

                            <div className="row">

                                <div className="col-md-6">
                                    <Form.Group controlId="exam1">
                                    <Form.Label>Exam 5</Form.Label>
                                    <Form.Select name="exam5" value={selectedExam5} onChange={handleSelectChange}>
                                        <option value="">Select Exam</option>
                                        <option value="Written Test">Written Test</option>
                                        <option value="Oral Test">Oral Test</option>
                                        <option value="Assessment">Assessment</option>
                                        <option value="Exercise">Exercise</option>
                                        <option value="Homework">Homework</option>
                                        <option value="Service Report">Service Report</option>
                                        <option value="Proposal">Proposal</option>
                                        <option value="Implementation">Implementation</option>
                                        <option value="Project">Project</option>
                                        <option value="Presentation">Presentation</option>
                                        <option value="Group Discussion">Group Discussion</option>
                                    </Form.Select>
                                    </Form.Group>
                                </div>

                                <div className="col-md-6">
                                <Form.Group className="mb-3" controlId="mark5">
                                <Form.Label>Mark 5 (%)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name='mark5'
                                    value={state.mark5}
                                    placeholder="Enter Mark 5"
                                    onChange={handleInputChange}
                                />
                                </Form.Group>
                                </div>                            
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <Form.Group controlId="practicalSelection">
                                    <Form.Label className="fw-bold">Practical: </Form.Label>
                                    <div style={{ display: 'inline-block', marginLeft: "10px" }}>
                                    <Form.Check 
                                        inline
                                        type="radio" 
                                        name="practicalSelection" 
                                        label="Enable" 
                                        value="Enable"
                                        checked={selectedPractical === "Enable"}
                                        onChange={handleCheckboxChange}
                                    />
                                    <Form.Check 
                                        inline
                                        type="radio" 
                                        name="practicalSelection" 
                                        label="Disable" 
                                        value="Disable"
                                        checked={selectedPractical === "Disable"}
                                        onChange={handleCheckboxChange}
                                    />
                                    </div>
                                    </Form.Group>
                                </div>
                            </div>
                        </Form.Group>

                    </Form>
                    </Modal.Body>
                    <Modal.Footer style={{ position: 'sticky', bottom: 0, background: 'white', zIndex: 999 }}>
                        <Button type='submit' variant="primary" style={{ width: '100%' }} onClick={handleSubmit}>Add</Button>
                    </Modal.Footer>
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
                            {data3.some(item => item.category === "Manage MarkingScheme" && item.accessType === "Read Only")
                            ? "View Marking Scheme"
                            : "Update Marking Scheme"
                            }
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="custom-modal-body">
                    <Form>

                        <Form.Group controlId="programCourseSelection">
                            <Form.Label className="fw-bold">Program and Course Selection</Form.Label>
                            <div className="row">
                                <div className="col-md-6">
                                    <Form.Group controlId="progCode">
                                        <Form.Label>Select Program:</Form.Label>
                                        <Form.Select 
                                            value={editData ? editData.progCode : ""} 
                                            onChange={(e) => handleEditInputChange('progCode', e.target.value)}
                                        >
                                            <option value="">Select Program</option>
                                            {selectedProgram.map((program) => (
                                                <option key={program.id} value={program.programCode}>
                                                    {program.programCode}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>

                                <div className="col-md-6">
                                <Form.Group className="mb-3" controlId="courseCode">
                                    <Form.Label>Course Code*</Form.Label>
                                    <div style={{ position: 'relative' }}>
                                        <Form.Control
                                            as="select"
                                            value={selectedCourseCode}
                                            onChange={(e) => handleEditInputChange('courseCode', e.target.value)}
                                        >
                                            <option value={editData?.courseCode || ""}>{editData?.courseCode || "Select Course Code"}</option>
                                            {progCoursesCode.map(Coursecode => (
                                                <option key={Coursecode} value={Coursecode}>{Coursecode}</option>
                                            ))}
                                        </Form.Control>
                                        <FontAwesomeIcon icon={faCaretDown} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }} />
                                    </div>
                                </Form.Group>
                                </div>   

                                <div className="col-md-6">
                                    <Form.Group className="mb-3" controlId="courseTemplate">
                                    <Form.Label>Course Template:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="courseTemplate"
                                        readOnly
                                        value={editData ? editData.markCourseTemplate : ""} 
                                        onChange={(e) => handleEditInputChange('markCourseTemplate', e.target.value)}
                                    />
                                    </Form.Group>
                                </div>                          
                            </div>
                        </Form.Group>

                        <Form.Group controlId="examMarkSelection">
                            <Form.Label className="fw-bold">Exam and Mark Selection</Form.Label>
                            <div className="row">
                                <div className="col-md-6">
                                    <Form.Group controlId="exam1">
                                    <Form.Label>Exam 1</Form.Label>
                                    <Form.Select name="exam1" 
                                    value={editData ? editData.exam1 : ""} 
                                    onChange={(e) => handleEditInputChange('exam1', e.target.value)}
                                    >
                                        <option value="">Select Exam</option>
                                        <option value="Written Test">Written Test</option>
                                        <option value="Oral Test">Oral Test</option>
                                        <option value="Assessment">Assessment</option>
                                        <option value="Exercise">Exercise</option>
                                        <option value="Homework">Homework</option>
                                        <option value="Service Report">Service Report</option>
                                        <option value="Proposal">Proposal</option>
                                        <option value="Implementation">Implementation</option>
                                        <option value="Project">Project</option>
                                        <option value="Presentation">Presentation</option>
                                        <option value="Group Discussion">Group Discussion</option>
                                    </Form.Select>
                                    </Form.Group>
                                </div>

                                <div className="col-md-6">
                                <Form.Group className="mb-3" controlId="mark1">
                                <Form.Label>Mark 1</Form.Label>
                                <Form.Control
                                    type="number"
                                    name='mark1'
                                    value={editData ? editData.mark1 : ""} 
                                    onChange={(e) => handleEditInputChange('mark1', e.target.value)}
                                />
                                </Form.Group>
                                </div>
                            </div>

                            <div className="row">

                                <div className="col-md-6">
                                    <Form.Group controlId="exam2">
                                    <Form.Label>Exam 2</Form.Label>
                                    <Form.Select name="exam2" 
                                    value={editData ? editData.exam2 : ""} 
                                    onChange={(e) => handleEditInputChange('exam2', e.target.value)}
                                    >
                                        <option value="">Select Exam</option>
                                        <option value="Written Test">Written Test</option>
                                        <option value="Oral Test">Oral Test</option>
                                        <option value="Assessment">Assessment</option>
                                        <option value="Exercise">Exercise</option>
                                        <option value="Homework">Homework</option>
                                        <option value="Service Report">Service Report</option>
                                        <option value="Proposal">Proposal</option>
                                        <option value="Implementation">Implementation</option>
                                        <option value="Project">Project</option>
                                        <option value="Mini Project">Mini Project</option>
                                        <option value="Presentation">Presentation</option>
                                        <option value="Group Discussion">Group Discussion</option>
                                    </Form.Select>
                                    </Form.Group>
                                </div>

                            <div className="col-md-6">
                            <Form.Group className="mb-3" controlId="mark2">
                            <Form.Label>Mark 2</Form.Label>
                            <Form.Control
                                type="number"
                                name='mark2'
                                value={editData ? editData.mark2 : ""} 
                                onChange={(e) => handleEditInputChange('mark2', e.target.value)}
                            />
                            </Form.Group>
                            </div>
                                                    
                            </div>

                            <div className="row">

                                <div className="col-md-6">
                                    <Form.Group controlId="exam3">
                                    <Form.Label>Exam 3</Form.Label>
                                    <Form.Select name="exam3" 
                                    value={editData ? editData.exam3 : ""} 
                                    onChange={(e) => handleEditInputChange('exam3', e.target.value)}
                                    >
                                        <option value="">Select Exam</option>
                                        <option value="Written Test">Written Test</option>
                                        <option value="Oral Test">Oral Test</option>
                                        <option value="Assessment">Assessment</option>
                                        <option value="Exercise">Exercise</option>
                                        <option value="Homework">Homework</option>
                                        <option value="Service Report">Service Report</option>
                                        <option value="Proposal">Proposal</option>
                                        <option value="Implementation">Implementation</option>
                                        <option value="Project">Project</option>
                                        <option value="Presentation">Presentation</option>
                                        <option value="Group Discussion">Group Discussion</option>
                                    </Form.Select>
                                    </Form.Group>
                                </div>

                            <div className="col-md-6">
                            <Form.Group className="mb-3" controlId="mark3">
                            <Form.Label>Mark 3</Form.Label>
                            <Form.Control
                                type="number"
                                name='mark3'
                                placeholder="Enter Mark 3"
                                value={editData ? editData.mark3 : ""} 
                                onChange={(e) => handleEditInputChange('mark3', e.target.value)}
                            />
                            </Form.Group>
                            </div>

                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <Form.Group controlId="exam4">
                                    <Form.Label>Exam 4</Form.Label>
                                    <Form.Select name="exam4" 
                                    value={editData ? editData.exam4 : ""} 
                                    onChange={(e) => handleEditInputChange('exam4', e.target.value)}
                                    >
                                        <option value="">Select Exam</option>
                                        <option value="Written Test">Written Test</option>
                                        <option value="Oral Test">Oral Test</option>
                                        <option value="Assessment">Assessment</option>
                                        <option value="Exercise">Exercise</option>
                                        <option value="Homework">Homework</option>
                                        <option value="Service Report">Service Report</option>
                                        <option value="Proposal">Proposal</option>
                                        <option value="Implementation">Implementation</option>
                                        <option value="Project">Project</option>
                                        <option value="Presentation">Presentation</option>
                                        <option value="Group Discussion">Group Discussion</option>
                                    </Form.Select>
                                    </Form.Group>
                                </div>

                                <div className="col-md-6">
                                <Form.Group className="mb-3" controlId="mark4">
                                <Form.Label>Mark 4</Form.Label>
                                <Form.Control
                                    type="number"
                                    name='mark4'
                                    value={editData ? editData.mark4 : ""} 
                                    onChange={(e) => handleEditInputChange('mark4', e.target.value)}
                                />
                                </Form.Group>
                                </div>    
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <Form.Group controlId="exam5">
                                    <Form.Label>Exam 5</Form.Label>
                                    <Form.Select name="exam5" 
                                    value={editData ? editData.exam5 : ""} 
                                    onChange={(e) => handleEditInputChange('exam5', e.target.value)}
                                    >
                                        <option value="">Select Exam</option>
                                        <option value="Written Test">Written Test</option>
                                        <option value="Assessment">Assessment</option>
                                        <option value="Exercise">Exercise</option>
                                        <option value="Homework">Homework</option>
                                        <option value="Service Report">Service Report</option>
                                        <option value="Proposal">Proposal</option>
                                        <option value="Implementation">Implementation</option>
                                        <option value="Project">Project</option>
                                        <option value="Presentation">Presentation</option>
                                        <option value="Group Discussion">Group Discussion</option>
                                    </Form.Select>
                                    </Form.Group>
                                </div>

                                <div className="col-md-6">
                                <Form.Group className="mb-3" controlId="mark5">
                                <Form.Label>Mark 5</Form.Label>
                                <Form.Control
                                    type="number"
                                    name='mark5'
                                    value={editData ? editData.mark5 : ""} 
                                    onChange={(e) => handleEditInputChange('mark5', e.target.value)}
                                />
                                </Form.Group>
                                </div>                            
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <Form.Group controlId="practicalSelection">
                                    <Form.Label className="fw-bold">Practical: </Form.Label>
                                    <div style={{ display: 'inline-block', marginLeft: "10px" }}>
                                        <Form.Check 
                                        inline
                                        type="radio" 
                                        name="practicalSelection" 
                                        label="Enable" 
                                        value="Enable"  
                                        checked={editData.markPractical === "Enable"}  
                                        onChange={(e) => handleEditInputChange('markPractical', e.target.value)}
                                        />
                                        <Form.Check 
                                        inline
                                        type="radio" 
                                        name="practicalSelection" 
                                        label="Disable" 
                                        value="Disable"  
                                        checked={editData.markPractical === "Disable"} 
                                        onChange={(e) => handleEditInputChange('markPractical', e.target.value)}  
                                        />
                                    </div>
                                    </Form.Group>
                                </div>
                            </div>
                        </Form.Group>

                    </Form>
                    </Modal.Body>
                    {data3.some(item => item.category === "Manage MarkingScheme" && item.accessType === "Read/Write") && (
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