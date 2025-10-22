import React, { useEffect, useState } from 'react';
import Holidays from 'date-holidays';
import { Button, Modal, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const PublicHolidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [show, setShow] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ name: '', date: '', sub: '' });
  const [editMode, setEditMode] = useState(false); // State to track edit mode

  useEffect(() => {
    const hd = new Holidays('MY');
    const allHolidays = hd.getHolidays(2024);

    // Manually add missing holidays
    const additionalHolidays = [
      { name: "Thaipusam", date: "2024-01-25" },
      { name: "Federal Territory Day", date: "2024-02-01", sub: "KL" }
    ];

    const combinedHolidays = [
      ...allHolidays,
      ...additionalHolidays
    ];

    // Filter for national holidays and Selangor (SL) and Kuala Lumpur (KL) specific holidays
    const filteredHolidays = combinedHolidays.filter(holiday =>
      holiday.type?.includes('public') ||
      (holiday.type?.includes('state') && (holiday.sub === 'SL' || holiday.sub === 'KL')) ||
      !holiday.type // For manually added holidays without 'type'
    );

    // Sort holidays by date (earliest to latest)
    filteredHolidays.sort((a, b) => new Date(a.date) - new Date(b.date));

    setHolidays(filteredHolidays);
  }, []);

  const handleShow = () => {
    setShow(true);
    setEditMode(false); // Reset edit mode when showing modal
  };

  const handleClose = () => {
    setShow(false);
    setEditMode(false); // Reset edit mode when closing modal
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewHoliday({ ...newHoliday, [name]: value });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    
    // Options for formatting the date
    const day = date.toLocaleString('en-GB', { day: '2-digit' });
    const month = date.toLocaleString('en-GB', { month: 'short' });
    const year = date.toLocaleString('en-GB', { year: 'numeric' });
  
    // Concatenate the parts with a dash
    return `${day}-${month}-${year}`;
  };  

  const handleAddHoliday = () => {
    // Add new holiday to the list
    const updatedHolidays = [...holidays, newHoliday];
    
    // Sort updated list by date (earliest to latest)
    updatedHolidays.sort((a, b) => new Date(a.date) - new Date(b.date));

    setHolidays(updatedHolidays);
    setNewHoliday({ name: '', date: '', sub: '' });
    handleClose();
  };

  const editHoliday = (index) => {
    setNewHoliday(holidays[index]); // Set newHoliday to the holiday being edited
    setShow(true); // Show modal for editing
    setEditMode(true); // Set edit mode to true
  };

  const deleteHoliday = (index) => {
    // Create a copy of current holidays array
    const updatedHolidays = [...holidays];

    // Remove the holiday at the specified index
    updatedHolidays.splice(index, 1);

    // Update state with the updated holidays array
    setHolidays(updatedHolidays);
  };

  return (
    <div>
      <div className="manageClassTimediv2 d-flex justify-content-between align-items-center">
        <Button className='btn btn-contact' onClick={handleShow}>
          <FontAwesomeIcon icon={faPlus} />
        </Button>
      </div>

      <h1>Malaysia National, Selangor, and Kuala Lumpur Public Holidays 2024</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Holiday Name</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {holidays.map((holiday, index) => (
            <tr key={index}>
              <td>{holiday.name}</td>
              <td>{formatDate(holiday.date)}</td>
              <td>
                <div className="action-buttons">
                  <button
                    className="btn btn-info"
                    title='Edit Holiday'
                    onClick={() => editHoliday(index)}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    className="btn btn-warning"
                    title='Delete Holiday'
                    onClick={() => deleteHoliday(index)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Edit Holiday' : 'Add New Holiday'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="holidayName">
              <Form.Label>Holiday Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter holiday name"
                name="name"
                value={newHoliday.name}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="holidayDate">
              <Form.Label>Holiday Date (dd/mm/yyyy)</Form.Label>
              <Form.Control
                type="date" // Use text type for custom formatted input
                name="date"
                value={newHoliday.date}
                onChange={handleInputChange}
                placeholder="e.g., 6-Jun-2024"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddHoliday}>
            {editMode ? 'Save Changes' : 'Add Holiday'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PublicHolidays;