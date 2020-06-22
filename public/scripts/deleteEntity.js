// Deletes the specified client from the database.
function deleteClient(cid) {
    fetch('/deleteClient', {
        method: 'delete',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            clientId: cid
        })
    }).then(res => {
        if (res.ok) return res.json();
    }).then(response => {
        if (response == `Client ${cid} deleted.`) {
            window.location.reload();
        }
    })
}

// Deletes the specified employee from the database.
function deleteEmployee(eid) {
    fetch('/deleteEmployee', {
        method: 'delete',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            employeeId: eid
        })
    }).then(res => {
        if (res.ok) return res.json();
    }).then(response => {
        if (response == `Employee ${eid} deleted.`) {
            window.location.reload();
        }
    })
}

// Deletes the specified appointment from the database.
function deleteAppointment(aid) {
    fetch('/deleteAppointment', {
        method: 'delete',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            appointmentId: aid
        })
    }).then(res => {
        if (res.ok) return res.json();
    }).then(response => {
        if (response == `Appointment ${aid} deleted.`) {
            window.location.reload();
        }
    })
}