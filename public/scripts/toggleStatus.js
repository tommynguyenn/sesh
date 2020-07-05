// Toggles the status of an appointment.
function toggleStatus(aid, state) {
    fetch('/toggleStatus', {
        method: 'put',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            appointmentId: aid,
            status: !state
        })
    }).then(res => {
        if (res.ok) return res.json();
    }).then(response => {
        if (response == `Status of ${aid} toggled.`) {
            window.location.reload();
        }
    })
}