import React, { Component } from 'react';
import 'dhtmlx-scheduler';
import 'dhtmlx-scheduler/codebase/dhtmlxscheduler.css';
import axios from 'axios';
import Cookies from 'js-cookie';

const scheduler = window.scheduler;

export default class Scheduler extends Component {

    state = {
        deleteData: null // State variable to store event data to be deleted
    };

    initSchedulerEvents() {
        if (scheduler._$initialized) {
            return;
        }

        const onDataUpdated = this.props.onDataUpdated;

        const createEvent = (id, event) => {
            const eventData = {
                dailyReportTeacherName: Cookies.get('teacherUsername'),
                dailyReportStartDate: formatDate(event.start_date),
                dailyReportEndDate: formatDate(event.end_date),
                dailyReportStartTime: formatTime(event.start_date),
                dailyReportEndTime: formatTime(event.end_date),
                dailyReportEvent: event.text
            };
        
            axios.post('http://localhost:9000/dailyReport/addDailyReport', eventData)
                .then(response => {
                    console.log('Event created successfully');
                    // Handle success message or update UI as needed
                })
                .catch(error => {
                    console.error('Error creating event:', error);
                    // Handle error message or update UI as needed
                });
        };      
        
        const updateEvent = (id, event) => {
            // Create updated event data
            const updatedEventData = {
                dailyReportStartDate: formatDate(event.start_date),
                dailyReportEndDate: formatDate(event.end_date),
                dailyReportStartTime: formatTime(event.start_date),
                dailyReportEndTime: formatTime(event.end_date),
                dailyReportEvent: event.text,
            };

            // Send PUT request to update event
            axios.put(`http://localhost:9000/dailyReport/updateailyReport/${id}`, updatedEventData)
                .then(response => {
                    console.log('Event updated successfully:');
                    // Handle success message or update UI as needed
                })
                .catch(error => {
                    console.error('Error updating event:', error);
                    // Handle error message or update UI as needed
                });
        };

        const deleteEvent = (id, event) => {
            axios.delete(`http://localhost:9000/dailyReport/deleteDailyReport/5`)
                .then(response => {
                    console.log('Event delted successfully');
                    // Handle success message or update UI as needed
                })
                .catch(error => {
                    console.error('Error deleting event:', error);
                    // Handle error message or update UI as needed
                });
        };

        scheduler.attachEvent('onEventAdded', (id, ev) => {
            if (onDataUpdated) {
                onDataUpdated('create', ev, id);
                
                createEvent(id, ev);
            }
        });
        
        function formatDate(date) {
            const day = ("0" + date.getDate()).slice(-2);
            const month = ("0" + (date.getMonth() + 1)).slice(-2);
            const year = date.getFullYear();
            return day + '/' + month + '/' + year;
        }     
        
        function formatTime(date) {
            const hours = ("0" + date.getHours()).slice(-2);
            const minutes = ("0" + date.getMinutes()).slice(-2);
            return hours + ":" + minutes;
        }

        scheduler.attachEvent('onEventChanged', (id, ev) => {
            if (onDataUpdated) {
                onDataUpdated('update', ev, id);
                // Call updateEvent function to send updated event details to backend
                updateEvent(id, ev);
            }
        });

        scheduler.attachEvent('onEventDeleted', (id, event) => {
            if (onDataUpdated) {
                onDataUpdated('delete', event, id);
                deleteEvent(id, event);
            }
        });  

        /*scheduler.attachEvent('onClick', (id, e) => {
            console.log('Clicked event id:', id);
            
        });*/
        
        scheduler._$initialized = true;
    }

    componentDidMount() {
        scheduler.skin = 'material';
        scheduler.config.header = [
            'day',
            'week',
            'month',
            'date',
            'prev',
            'today',
            'next'
        ];
        scheduler.config.hour_date = '%g:%i %A';
        scheduler.xy.scale_width = 70;

        this.initSchedulerEvents();

        const { events } = this.props;
        scheduler.init(this.schedulerContainer, new Date(2020, 5, 10));
        scheduler.clearAll();
        scheduler.parse(events);
    }

    shouldComponentUpdate(nextProps) {
        return this.props.timeFormatState !== nextProps.timeFormatState;
    }

    componentDidUpdate() {
        scheduler.render();
    }

    setHoursScaleFormat(state) {
        scheduler.config.hour_date = state ? '%H:%i' : '%g:%i %A';
        scheduler.templates.hour_scale = scheduler.date.date_to_str(scheduler.config.hour_date);
    }

    render() {
        const { timeFormatState } = this.props;
        this.setHoursScaleFormat(timeFormatState);
        return (
            <div
                ref={ (input) => { this.schedulerContainer = input } }
                style={ { width: '84.5%', height: '99vh' } }
            ></div>
        );
    }
}