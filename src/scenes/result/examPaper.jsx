import React, { useState, useEffect } from 'react';
import axios from "axios";
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button, Modal, Form, Dropdown, ButtonGroup } from 'react-bootstrap';
import Sidebar from "../global/Sidebar";
import SidebarEmployee from "../global/SidebarEmployee";
import Topbar from "../global/Topbar";
import TopbarEmployee from '../global/TopbarEmployee';
import { employeeLocalhost } from '../../localhost/employeeLocalhost';
import Cookies from 'js-cookie';

export default function ExamPaper() {

const [state, setState] = useState({
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    answer: [],
    teacherName: "",
    courseCode: "",
    approvalBtn: ""
});

const [data, setData] = useState([]);
const [data3, setData3] = useState([]);
const [searchTerm, setSearchTerm] = useState('');
const [setTeacherName, selectedTeacherName] = useState('');
const handleClose = () => setShow(false);
const [show, setShow] = useState(false);

const loadData = async () => {
    try {
        const response = await axios.get(`${employeeLocalhost}/examPaper/getExamPaperDetails`);
        setData(response.data);
    } catch (error) {
        console.error('Error occurred while fetching course details:', error);
    }
};

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

  useEffect(() => {
    loadData();
    loadData3();
  }, []);

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const sortedFilteredData = [...data].sort((a, b) => a.courseCode.localeCompare(b.courseCode)).filter((item) => {
    const roleMatch = item.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    return roleMatch;
  });

  const handleEditShow = (item) => {
    //console.log(item);

    selectedTeacherName(item.courseCode);

    setShow(true);

  };

  const deleteContact = () => {

  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!state.answer.length) {
        Swal.fire("Error", "Please select at least one correct answer", "error");
        return;
    }

    try {
        const payload = {
        question: state.question,
        optionA: state.optionA,
        optionB: state.optionB,
        optionC: state.optionC,
        optionD: state.optionD,
        answer: state.answer.join(",")
        };

        await axios.post(`${employeeLocalhost}/examPaper/addExamPaper`, payload);

        Swal.fire("Success", "Exam paper added successfully!", "success");
        handleClose();
        loadData(); // refresh table
        setState({ question: "", optionA: "", optionB: "", optionC: "", optionD: "", answer: [] }); // reset form
    } catch (error) {
        console.error("Error adding exam paper:", error);
        Swal.fire("Error", "Something went wrong!", "error");
    }
    };

  const handleCorrectAnswerChange = (option) => {
    setState((prevState) => {
        const updatedanswer = prevState.answer.includes(option)
        ? prevState.answer.filter((ans) => ans !== option)
        : [...prevState.answer, option];

        return { ...prevState, answer: updatedanswer };
    });
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
                    <h2 className="fs-2 m-0">EXAM PAPER INFORMATION</h2>
                </div>
                <div className="manageCoursediv2 d-flex justify-content-between align-items-center">
                    <div className="d-flex custom-margin">
                        <input
                                type="text"
                                placeholder="Search by course code"
                                value={searchTerm}
                                onChange={handleSearchInputChange}
                                className="mr-2"
                                style={{width: '180px'}}
                            />
                    </div>
                </div>

                <table className="styled-table" style={{width: '100%'}}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: "center" }}>No</th>
                            <th style={{ textAlign: "center" }}>Course Code</th>
                            <th style={{ textAlign: "center" }}>Questions</th>
                            <th style={{ textAlign: "center" }}>Answer</th>
                            <th style={{ textAlign: "center" }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                    {sortedFilteredData.map((item, index) => {
                        return (
                            <tr key={item.id}>
                                <td scope="row">{index + 1}</td>
                                <td>{item.courseCode}</td>
                                <td>{item.question}</td>
                                <td>{item.answer}</td>
                                <td>
                                    <Dropdown as={ButtonGroup}>
                                        <Dropdown.Toggle variant="primary" size="sm" style={{ fontSize: "10px" }}>
                                            Action
                                        </Dropdown.Toggle>
                
                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={() => handleEditShow(item)}>
                                            <FontAwesomeIcon icon={faEdit} className="me-2" /> Edit
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => deleteContact(item)}>
                                            <FontAwesomeIcon icon={faTrash} className="me-2" /> Delete
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
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
                    <Modal.Title style={{ color: '#151632' }}>Add Exam for {setTeacherName}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="custom-modal-body">
                    <Form onSubmit={handleSubmit}>

                        <div className="row">
                            <div className="col-md-12 mb-3">
                                <Form.Group>
                                <Form.Label>Question</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter the question"
                                    value={state.question}
                                    onChange={(e) => setState({ ...state, question: e.target.value })}
                                    required
                                />
                                </Form.Group>
                            </div>

                            {/* Option A */}
                            <div className="col-md-6 mb-3">
                                <Form.Group>
                                <Form.Label>Option A</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Option A"
                                    value={state.optionA}
                                    onChange={(e) => setState({ ...state, optionA: e.target.value })}
                                    required
                                />
                                <Form.Check
                                    type="checkbox"
                                    label="Correct Answer"
                                    checked={state.answer.includes("A")}
                                    onChange={() => handleCorrectAnswerChange("A")}
                                />
                                </Form.Group>
                            </div>

                            {/* Option B */}
                            <div className="col-md-6 mb-3">
                                <Form.Group>
                                <Form.Label>Option B</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Option B"
                                    value={state.optionB}
                                    onChange={(e) => setState({ ...state, optionB: e.target.value })}
                                    required
                                />
                                <Form.Check
                                    type="checkbox"
                                    label="Correct Answer"
                                    checked={state.answer.includes("B")}
                                    onChange={() => handleCorrectAnswerChange("B")}
                                />
                                </Form.Group>
                            </div>

                            {/* Option C */}
                            <div className="col-md-6 mb-3">
                                <Form.Group>
                                <Form.Label>Option C</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Option C"
                                    value={state.optionC}
                                    onChange={(e) => setState({ ...state, optionC: e.target.value })}
                                    required
                                />
                                <Form.Check
                                    type="checkbox"
                                    label="Correct Answer"
                                    checked={state.answer.includes("C")}
                                    onChange={() => handleCorrectAnswerChange("C")}
                                />
                                </Form.Group>
                            </div>

                            {/* Option D */}
                            <div className="col-md-6 mb-3">
                                <Form.Group>
                                <Form.Label>Option D</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Option D"
                                    value={state.optionD}
                                    onChange={(e) => setState({ ...state, optionD: e.target.value })}
                                    required
                                />
                                <Form.Check
                                    type="checkbox"
                                    label="Correct Answer"
                                    checked={state.answer.includes("D")}
                                    onChange={() => handleCorrectAnswerChange("D")}
                                />
                                </Form.Group>
                            </div>
                            </div>
                        <Button type='submit' variant="primary" style={{float: 'right', width: '15%'}}>Add</Button>
                    </Form>
                    </Modal.Body>
                </Modal>
            </div>
        </div>
    </div>
  );
}