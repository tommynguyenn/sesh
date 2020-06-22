// Client references
const clientName = $('#addClient-name');
const clientContact = $('#addClient-contact');
const clientValue = $('#addClient-value');
const addClient = $('#addClient');

// Employee references
const empName = $('#addEmployee-name');
const empContact = $('#addEmployee-contact');
const empPosition = $('#addEmployee-position');
const addEmployee = $('#addEmployee');

// Appointment references
const appEmployee = $('#addAppointment-employee');
const appClient = $('#addAppointment-client');
const clientIdentifier = $('#addAppointment-clientidentifier');
const appDatetime = $('#addAppointment-datetime');
const appType = $('#addAppointment-type');
const appNotes = $('#addAppointment-notes');
const appPrice = $('#addAppointment-price');
const addAppointment = $('#addAppointment');

// Form button references
const clientForm = $('#client-form');
const employeeForm = $('#employee-form');
const appointmentForm = $('#appointment-form');

// Show message to user.
function showMessage(message, modal) {
    modal.prepend(`<div class="alert alert-danger" role="alert">${message}</div>`);
}

// Add a new client.
addClient.click(event => {
    $('.alert.alert-danger').remove();
    if (clientName.val()) {
        if (clientContact.val()) {
            if (clientValue.val()) {
                fetch('/addClient', {
                    method: 'post',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: clientName.val(),
                        contact: clientContact.val(),
                        value: clientValue.val()
                    })
                }).then(res => {
                    if (res.ok) return res.json();
                }).then(response => {
                    if (response == 'New client added.') {
                        window.location.reload();
                    }
                })
            } else {
                showMessage('Client value required.', clientForm);
            }
        } else {
            showMessage('Client contact required.', clientForm);
        }
    } else {
        showMessage('Client name required.', clientForm);
    }
});

// Add a new employee.
addEmployee.click(event => {
    $('.alert.alert-danger').remove();
    if (empName.val()) {
        if (empContact.val()) {
            if (empPosition.val()) {
                fetch('/addEmployee', {
                    method: 'post',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: empName.val(),
                        contact: empContact.val(),
                        position: empPosition.val()
                    })
                }).then(res => {
                    if (res.ok) return res.json();
                }).then(response => {
                    if (response == 'New employee added.') {
                        window.location.reload();
                    }
                })
            } else {
                showMessage('Employee position required.', employeeForm);
            }
        } else {
            showMessage('Employee contact required.', employeeForm);
        }
    } else {
        showMessage('Employee name required.', employeeForm);
    }
});

// Add a new appointment.
addAppointment.click(event => {
    $('.alert.alert-danger').remove();
    if (appEmployee.val()) {
        if (appClient.val()) {
            if (appType.val()) {
                if (appNotes.val()) {
                    if (appPrice.val()) {
                        fetch('/addAppointment', {
                            method: 'post',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                employee: appEmployee.val(),
                                client: appClient.val(),
                                datetime: appDatetime.val(),
                                type: appType.val(),
                                notes: appNotes.val(),
                                price: appPrice.val()
                            })
                        }).then(res => {
                            if (res.ok) return res.json();
                        }).then(response => {
                            if (response == 'New appointment added.') {
                                window.location.reload();
                            }
                        })
                    } else {
                        showMessage('Appointment price required.', appointmentForm);
                    }
                } else {
                    showMessage('Appointment notes required.', appointmentForm);
                }  
            } else {
                showMessage('Appointment type required.', appointmentForm);
            }
        }
    }
});

// Changes the client's contact value on client name change.
appClient.change(event => {
    fetch('/getClientContact', {
        method: 'put',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: appClient.val()
        })
    }).then(res => {
        if (res.ok) return res.json();
    }).then(response => {
        clientIdentifier.val(response);
    })
});
