/* Configurations */
const PORT = process.env.PORT || 3000;
const DB_URL = require('./credentials');
const connectionString = DB_URL;

/* Requirements */
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const moment = require('moment');
const session = require('express-session');

/* Initialize application */
const express = require('express');
const e = require('express');
const app = express();

/***************
 * Middlewares *
 ***************/
app.set('view engine', 'ejs');
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(express.static('public'));

app.use(session({
    name: 'seshapp',
    secret: process.env.SESSION_SECRET,
    secure: true,
    resave: false,
    saveUninitialized: false
}));

/********************
 * Backend/Database *
 ********************/
MongoClient.connect(connectionString, {
    useUnifiedTopology: true
}).then(client => {
    loginDb = client.db('login').collection('accounts');
    console.log(`Connected to mongoDB [login] database.`);

    app.listen(PORT, console.log(`Server listening to ${PORT}`));
}).catch(error => console.log(error));

/*************
 * Functions *
 *************/

// Returns the corresponding client name.
function findClientName(clientId, session) {
    let target;
    session.clients.forEach(client => {
        if (client._id.toString() == clientId) {
            target = client.clientName;
        }
    });
    return target;
}

// Returns the corresponding employee name.
function findEmployeeName(employeeId, session) {
    let target;
    session.employees.forEach(employee => {
        if (employee._id.toString() == employeeId) {
            target = employee.empName;
        }
    });
    return target;
}

// Returns the corresponding client id.
function findClientId(clientName, session) {
    let target;
    session.clients.forEach(client => {
        if (client.clientName == clientName) {
            target = client._id;
        }
    });
    return target;
}

// Returns the corresponding employee id.
function findEmployeeId(empName, session) {
    let target;
    session.employees.forEach(employee => {
        if (employee.empName == empName) {
            target = employee._id;
        }
    });
    return target;
}

// Appointments template
function appointmentTemplate(appointmentArr, session) {
    let appointmentHtml = '';

    appointmentArr.forEach(appointment => {
        // Convert to proper date (inc by 1 day).
        let date = new Date(`${appointment.apptDatetime}`);
        date = moment(date.toISOString()).add(1, 'd');
        date = date.format("MMM DD, YYYY @ h:mm a");

        let state = appointment.completed ? true : false;

        appointmentHtml +=
            `<tr>
                <td>
                    <button onclick="toggleStatus('${appointment._id}', ${state})" class="complete-btn ${appointment.completed ? 'btn-success' : 'btn-danger'}">
                        ${appointment.completed ? 'Complete' : 'In progress'}
                    </button>
                </td>
                <td>${findClientName(appointment.clientId, session)}</td>
                <td>${findEmployeeName(appointment.employeeId, session)}</td>
                <td>${date}</td>
                <td>$${appointment.apptPrice.toFixed(2)}</td>
                <td>${appointment.apptType}</td>
                <td>
                    <button type="button" data-container="body" data-toggle="popover" data-placement="left" data-content="${appointment.apptNotes}" class="view-btn btn-info">Notes</button>
                    <button onclick="deleteAppointment('${appointment._id}')" class="delete-btn btn-danger">Delete</button>
                </td>
            </tr>`
    });

    return appointmentHtml;
}

// Clients template
function clientTemplate(clientArr) {
    let clientHtml = '';

    clientArr.forEach(client => {
        clientHtml +=
            `<tr>
                <th scope="row">${client.clientName}</th>
                <td>${client.clientContact}</td>
                <td>$${client.clientValue.toFixed(2)}</td>
                <td>
                    <a href="/clients/${client._id}">
                        <button class="view-btn btn-info">View</button>
                    </a>
                    <button onclick="deleteClient('${client._id}')" class="delete-btn btn-danger">Delete</button>
                </td>
            </tr>`
    });

    return clientHtml;
}

// Employees template
function employeeTemplate(employeeArr) {
    let employeeHtml = '';

    employeeArr.forEach(employee => {
        employeeHtml +=
            `<tr>
                <th scope="row">${employee.empName}</th>
                <td>${employee.empContact}</td>
                <td>${employee.empPosition}</td>
                <td>
                    <a href="/employees/${employee._id}">
                        <button class="view-btn btn-info">View</button>
                    </a>
                    <button onclick="deleteEmployee('${employee._id}')" class="delete-btn btn-danger">Delete</button>
                </td>
            </tr>`
    });

    return employeeHtml;
}

// Waitlist template
function waitlistTemplate(waitlistArr, session) {
    let waitlistHtml = '';

    waitlistArr.forEach((wlAppointment, index) => {
        let clientName = findClientName(wlAppointment.clientId, session);

        waitlistHtml +=
            `<tr>
                <th scope="row">${index + 1}</th>
                <td>${clientName}</td>
                <td>$${wlAppointment.waitlistPrice.toFixed(2)}</td>
                <td>${wlAppointment.waitlistType}</td>
                <td>${wlAppointment.waitlistNotes}</td>
                <td>

                    <button onclick="deleteWaitlist('${wlAppointment._id}')" class="delete-btn btn-danger">Delete</button>
                </td>
            </tr>`
    });

    return waitlistHtml;
}

// Appointment modal, clients template
function modalClientTemplate(clientArr) {
    let clientHtml = '';

    clientArr.forEach(client => {
        clientHtml +=
            `<option>${client.clientName}</option>`
    });

    return clientHtml;
}

// Appointment modal, employees template
function modalEmployeeTemplate(employeeArr) {
    let employeeHtml = '';

    employeeArr.forEach(employee => {
        employeeHtml +=
            `<option>${employee.empName}</option>`
    });

    return employeeHtml;
}

/**********
 * Routes *
 **********/

// Redirect basic URL to login.
app.get('/', (req, res) => {
    res.render('pages/login', {
        message: `<div class="alert alert-primary alert-small" role="alert">Welcome to sesh!</div>`
    });
});

// Perform login authentication.
app.get('/login', (req, res) => {
    loginDb.find().toArray().then(loginArr => {
        loginArr.forEach(login => {
            if (login.username == req.query.username && login.password == req.query.password) {
                // Sets company ID for later use.
                req.session.companyId = login._id.toString();
                // Sets logged in as true.
                req.session.logged = true;
                res.redirect('/dashboard');
            } else {
                res.render('pages/login', {
                    message: `<div class="alert alert-danger alert-small" role="alert">Invalid login credentials</div>`
                });
            }
        });
    })
});

// Log out and destroy session.
app.get('/logout', (req, res) => {
    if (req.session.logged) {
        req.session.destroy();
    }
    res.redirect('/');
});

// Load dashboard.
app.get('/dashboard', (req, res) => {
    if (req.session.logged) {
        MongoClient.connect(connectionString, {
            useUnifiedTopology: true
        }).then(client => {
            let db;
            let collections = {
                data: null,
                appointments: null,
                clients: null,
                employees: null,
                waitlist: null
            }

            db = client.db(req.session.companyId);
            collections.data = db.collection('companyData');
            collections.appointments = db.collection('appointments');
            collections.clients = db.collection('clients');
            collections.employees = db.collection('employees');
            collections.waitlist = db.collection('waitlist');

            console.log(`Connected to mongoDB [${req.session.companyId}] database.`);

            collections.data.find().toArray().then(dataArray => {
                // Assumed only one app user.
                dataArray.forEach(data => {
                    // Sets company data.
                    req.session.data = data.companyName;
                    // Sets appointments array.
                    collections.appointments.find().sort({
                        apptDatetime: 1
                    }).toArray().then(appArr => {
                        req.session.appointments = appArr;
                    }).then(result => {
                        // Sets clients array.
                        collections.clients.find().toArray().then(cliArr => {
                            req.session.clients = cliArr;
                        }).then(result => {
                            // Sets employees array.
                            collections.employees.find().toArray().then(empArr => {
                                req.session.employees = empArr;
                            }).then(result => {
                                // Sets waitlist array.
                                collections.waitlist.find().toArray().then(waitlistArr => {
                                    req.session.waitlist = waitlistArr;
                                }).then(result => {
                                    let first = {
                                        clientContact: ' '
                                    }

                                    if (req.session.clients[0] != undefined) {
                                        first.clientContact = req.session.clients[0].clientContact;
                                    }

                                    res.render('pages/dashboard', {
                                        companyName: req.session.data,
                                        appointments: appointmentTemplate(req.session.appointments, req.session),
                                        clients: clientTemplate(req.session.clients),
                                        employees: employeeTemplate(req.session.employees),
                                        waitlist: waitlistTemplate(req.session.waitlist, req.session),
                                        count: [req.session.appointments.length,
                                                req.session.clients.length,
                                                req.session.employees.length,
                                                req.session.waitlist.length],
                                        modalEmployees: modalEmployeeTemplate(req.session.employees),
                                        modalClients: modalClientTemplate(req.session.clients),
                                        firstClient: first,
                                    });
                                }).catch(error => console.log(error));
                            }).catch(error => console.log(error));
                        }).catch(error => console.log(error));
                    }).catch(error => console.log(error));
                });
            }).catch(error => console.log(error));

        }).catch(error => console.log(error));
    } else {
        res.render('pages/login', {
            message: `<div class="alert alert-warning alert-small" role="alert">Login required.</div>`
        });
    }
});

// Load clients.
app.get('/clients', (req, res) => {
    if (req.session.logged) {
        MongoClient.connect(connectionString, {
            useUnifiedTopology: true
        }).then(client => {
            let db;
            let collections = {
                clients: null,
                waitlist: null
            }

            db = client.db(req.session.companyId);
            collections.clients = db.collection('clients');
            collections.waitlist = db.collection('waitlist');

            console.log(`Connected to mongoDB [${req.session.companyId}] database.`);
            // Sets clients array.
            collections.clients.find().toArray().then(cliArr => {
                req.session.clients = cliArr;
            }).then(result => {
                // Sets waitlist array.
                collections.waitlist.find().toArray().then(waitlistArr => {
                    req.session.waitlist = waitlistArr;
                }).then(result => {
                    let first = {
                        clientContact: ' '
                    }

                    if (req.session.clients[0] != undefined) {
                        first.clientContact = req.session.clients[0].clientContact;
                    }

                    res.render('pages/clients', {
                        companyName: req.session.data,
                        clients: clientTemplate(req.session.clients),
                        count: [req.session.clients.length],
                        modalEmployees: modalEmployeeTemplate(req.session.employees),
                        modalClients: modalClientTemplate(req.session.clients),
                        firstClient: first,
                    });
                }).catch(error => console.log(error));
            }).catch(error => console.log(error));
        }).catch(error => console.log(error));
    } else {
        res.render('pages/login', {
            message: `<div class="alert alert-warning alert-small" role="alert">Login required.</div>`
        });
    }
});

// Load employees.
app.get('/employees', (req, res) => {
    if (req.session.logged) {
        MongoClient.connect(connectionString, {
            useUnifiedTopology: true
        }).then(client => {
            let db;
            let collections = {
                employees: null,
                waitlist: null
            }

            db = client.db(req.session.companyId);
            collections.employees = db.collection('employees');
            collections.waitlist = db.collection('waitlist');

            console.log(`Connected to mongoDB [${req.session.companyId}] database.`);

            // Sets employees array.
            collections.employees.find().toArray().then(empArr => {
                req.session.employees = empArr;
            }).then(result => {
                // Sets waitlist array.
                collections.waitlist.find().toArray().then(waitlistArr => {
                    req.session.waitlist = waitlistArr;
                }).then(result => {
                    let first = {
                        clientContact: ' '
                    }

                    if (req.session.clients[0] != undefined) {
                        first.clientContact = req.session.clients[0].clientContact;
                    }

                    res.render('pages/employees', {
                        companyName: req.session.data,
                        employees: employeeTemplate(req.session.employees),
                        count: [req.session.employees.length],
                        modalEmployees: modalEmployeeTemplate(req.session.employees),
                        modalClients: modalClientTemplate(req.session.clients),
                        firstClient: first,
                    });
                }).catch(error => console.log(error));
            }).catch(error => console.log(error));
        }).catch(error => console.log(error));
    } else {
        res.render('pages/login', {
            message: `<div class="alert alert-warning alert-small" role="alert">Login required.</div>`
        });
    }
});

// Load appointments.
app.get('/appointments', (req, res) => {
    if (req.session.logged) {
        MongoClient.connect(connectionString, {
            useUnifiedTopology: true
        }).then(client => {
            let db;
            let collections = {
                appointments: null,
                clients: null,
                employees: null,
                waitlist: null
            }

            db = client.db(req.session.companyId);
            collections.appointments = db.collection('appointments');
            collections.clients = db.collection('clients');
            collections.employees = db.collection('employees');
            collections.waitlist = db.collection('waitlist');

            console.log(`Connected to mongoDB [${req.session.companyId}] database.`);

            // Sets appointments array.
            collections.appointments.find().sort({
                apptDatetime: 1
            }).toArray().then(appArr => {
                req.session.appointments = appArr;
            }).then(result => {
                // Sets clients array.
                collections.clients.find().toArray().then(cliArr => {
                    req.session.clients = cliArr;
                }).then(result => {
                    // Sets employees array.
                    collections.employees.find().toArray().then(empArr => {
                        req.session.employees = empArr;
                    }).then(result => {
                        // Sets waitlist array.
                        collections.waitlist.find().toArray().then(waitlistArr => {
                            req.session.waitlist = waitlistArr;
                        }).then(result => {
                            let first = {
                                clientContact: ' '
                            }

                            if (req.session.clients[0] != undefined) {
                                first.clientContact = req.session.clients[0].clientContact;
                            }

                            res.render('pages/appointments', {
                                companyName: req.session.data,
                                appointments: appointmentTemplate(req.session.appointments, req.session),
                                count: [req.session.appointments.length],
                                modalEmployees: modalEmployeeTemplate(req.session.employees),
                                modalClients: modalClientTemplate(req.session.clients),
                                firstClient: first,
                            });
                        }).catch(error => console.log(error));
                    }).catch(error => console.log(error));
                }).catch(error => console.log(error));
            }).catch(error => console.log(error));
        }).catch(error => console.log(error));
    } else {
        res.render('pages/login', {
            message: `<div class="alert alert-warning alert-small" role="alert">Login required.</div>`
        });
    }
});

// Load insights.
app.get('/insights', (req, res) => {
    if (req.session.logged) {
        MongoClient.connect(connectionString, {
            useUnifiedTopology: true
        }).then(client => {
            let db;
            let collections = {
                appointments: null,
                clients: null,
                employees: null,
                waitlist: null
            }

            db = client.db(req.session.companyId);
            collections.appointments = db.collection('appointments');
            collections.clients = db.collection('clients');
            collections.employees = db.collection('employees');
            collections.waitlist = db.collection('waitlist');

            console.log(`Connected to mongoDB [${req.session.companyId}] database.`);

            // Sets appointments array.
            collections.appointments.find().sort({
                apptDatetime: 1
            }).toArray().then(appArr => {
                req.session.appointments = appArr;
            }).then(result => {
                // Sets clients array.
                collections.clients.find().toArray().then(cliArr => {
                    req.session.clients = cliArr;
                }).then(result => {
                    // Sets employees array.
                    collections.employees.find().toArray().then(empArr => {
                        req.session.employees = empArr;
                    }).then(result => {
                        // Sets waitlist array.
                        collections.waitlist.find().toArray().then(waitlistArr => {
                            req.session.waitlist = waitlistArr;
                        }).then(result => {
                            let first = {
                                clientContact: ' '
                            }

                            if (req.session.clients[0] != undefined) {
                                first.clientContact = req.session.clients[0].clientContact;
                            }

                            res.render('pages/insights', {
                                companyName: req.session.data,
                                modalEmployees: modalEmployeeTemplate(req.session.employees),
                                modalClients: modalClientTemplate(req.session.clients),
                                firstClient: first,
                            });
                        }).catch(error => console.log(error));
                    }).catch(error => console.log(error));
                }).catch(error => console.log(error));
            }).catch(error => console.log(error));
        }).catch(error => console.log(error));
    } else {
        res.render('pages/login', {
            message: `<div class="alert alert-warning alert-small" role="alert">Login required.</div>`
        });
    }
});

// Access client profile.
app.get('/clients/:clientId', (req, res) => {
    let clientProfile;

    req.session.clients.forEach(client => {
        if (client._id == req.params.clientId) {
            console.log(client);
            clientProfile = client;
            res.render('pages/individuals/client', {
                client: clientProfile
            });
        }
    });
});

// Access employee profile.
app.get('/employees/:employeeId', (req, res) => {
    let employeeProfile;

    req.session.employees.forEach(employee => {
        if (employee._id == req.params.employeeId) {
            console.log(employee);
            employeeProfile = employee;
            res.render('pages/individuals/employee', {
                employee: employeeProfile
            });
        }
    });
});

// Access appointment page.
app.get('/appointments/:appointmentId', (req, res) => {
    let appointmentProfile;

    req.session.appointments.forEach(appointment => {
        if (appointment._id == req.params.appointmentId) {
            console.log(appointment);
            appointmentProfile = appointment;
            res.render('pages/individuals/appointment', {
                appointment: appointmentProfile
            });
        }
    });
});

// Add a client to the database.
app.post('/addClient', (req, res) => {
    const newClient = {
        name: req.body.name,
        contact: req.body.contact,
        value: parseFloat(req.body.value)
    }

    MongoClient.connect(connectionString, {
        useUnifiedTopology: true
    }).then(client => {
        let db;
        let clients;

        db = client.db(req.session.companyId);
        clients = db.collection('clients');

        clients.insertOne({
            clientName: newClient.name,
            clientContact: newClient.contact,
            clientValue: newClient.value,
            clientAppointments: []
        });

        res.json('New client added.');
    }).catch(error => console.log(error));
});

// Add an employee to the database.
app.post('/addEmployee', (req, res) => {
    const newEmployee = {
        name: req.body.name,
        contact: req.body.contact,
        position: req.body.position
    }

    MongoClient.connect(connectionString, {
        useUnifiedTopology: true
    }).then(client => {
        let db;
        let employees;

        db = client.db(req.session.companyId);
        employees = db.collection('employees');

        employees.insertOne({
            empName: newEmployee.name,
            empContact: newEmployee.contact,
            empPosition: newEmployee.position,
            empAppointments: []
        });

        res.json('New employee added.');
    }).catch(error => console.log(error));
});

// Add an appointment to the database.
app.post('/addAppointment', (req, res) => {
    const newAppointment = {
        employee: req.body.employee,
        client: req.body.client,
        datetime: req.body.datetime,
        type: req.body.type,
        notes: req.body.notes,
        price: parseFloat(req.body.price)
    }

    MongoClient.connect(connectionString, {
        useUnifiedTopology: true
    }).then(client => {
        let db;
        let appointments;

        db = client.db(req.session.companyId);
        appointments = db.collection('appointments');
        clients = db.collection('clients');
        employees = db.collection('employees');

        appointments.insertOne({
            apptType: newAppointment.type,
            apptNotes: newAppointment.notes,
            apptPrice: newAppointment.price,
            apptDatetime: newAppointment.datetime,
            clientId: ObjectId(findClientId(newAppointment.client, req.session)),
            employeeId: ObjectId(findEmployeeId(newAppointment.employee, req.session)),
            completed: false
        }).then(result => {
            clients.updateOne({
                _id: ObjectId(findClientId(newAppointment.client, req.session))
            }, {
                $inc: {
                    clientValue: newAppointment.price
                },
                $push: {
                    clientAppointments: ObjectId(result.insertedId)
                }
            });
            employees.updateOne({
                _id: ObjectId(findEmployeeId(newAppointment.employee, req.session)),
            }, {
                $push: {
                    empAppointments: ObjectId(result.insertedId)
                }
            });
            res.json('New appointment added.');
        });
    }).catch(error => console.log(error));
});

// Add an appointment to the waitlist on the database.
app.post('/addWaitlist', (req, res) => {
    const newWaitlist = {
        client: req.body.client,
        type: req.body.type,
        notes: req.body.notes,
        price: parseFloat(req.body.price)
    }

    MongoClient.connect(connectionString, {
        useUnifiedTopology: true
    }).then(client => {
        let db;
        let waitlist;

        db = client.db(req.session.companyId);
        waitlist = db.collection('waitlist');

        waitlist.insertOne({
            waitlistType: newWaitlist.type,
            waitlistNotes: newWaitlist.notes,
            waitlistPrice: newWaitlist.price,
            clientId: ObjectId(findClientId(newWaitlist.client, req.session))
        });

        res.json('New appointment added to waitlist.');
    }).catch(error => console.log(error));
});

// Gets the contact of the current client.
app.put('/getClientContact', (req, res) => {
    const clientName = req.body.name;

    req.session.clients.forEach(client => {
        if (client.clientName == clientName) {
            res.json(client.clientContact);
        }
    });
});

// Deletes the specified employee from the database.
app.delete('/deleteClient', (req, res) => {
    const clientId = req.body.clientId;

    MongoClient.connect(connectionString, {
        useUnifiedTopology: true
    }).then(client => {
        let db;
        let clients;

        db = client.db(req.session.companyId);
        clients = db.collection('clients');

        clients.deleteOne({
            _id: ObjectId(clientId)
        });

        res.json(`Client ${clientId} deleted.`);
    }).catch(error => console.log(error));
});

// Deletes the specified employee from the database.
app.delete('/deleteEmployee', (req, res) => {
    const employeeId = req.body.employeeId;

    MongoClient.connect(connectionString, {
        useUnifiedTopology: true
    }).then(client => {
        let db;
        let employees;

        db = client.db(req.session.companyId);
        employees = db.collection('employees');

        employees.deleteOne({
            _id: ObjectId(employeeId)
        });

        res.json(`Employee ${employeeId} deleted.`);
    }).catch(error => console.log(error));
});

// Deletes the specified appointment from the database.
app.delete('/deleteAppointment', (req, res) => {
    const appointmentId = req.body.appointmentId;

    MongoClient.connect(connectionString, {
        useUnifiedTopology: true
    }).then(client => {
        let db;
        let appointments;

        db = client.db(req.session.companyId);
        appointments = db.collection('appointments');
        clients = db.collection('clients');
        employees = db.collection('employees');

        appointments.find().toArray().then(apptArr => {
            apptArr.forEach(appointment => {
                if (appointment._id == appointmentId) {
                    const deleteAppt = {
                        clientId: appointment.clientId,
                        employeeId: appointment.employeeId,
                        price: appointment.apptPrice
                    }

                    clients.updateOne({
                        _id: deleteAppt.clientId
                    }, {
                        $inc: {
                            clientValue: -parseFloat(deleteAppt.price)
                        },
                        $pull: {
                            clientAppointments: ObjectId(appointmentId)
                        }
                    });

                    employees.updateOne({
                        _id: deleteAppt.employeeId
                    }, {
                        $pull: {
                            empAppointments: ObjectId(appointmentId)
                        }
                    });

                    appointments.deleteOne({
                        _id: ObjectId(appointmentId)
                    });

                    res.json(`Appointment ${appointmentId} deleted.`);
                }
            });
        })
    }).catch(error => console.log(error));
});

// Deletes the specified appointment from the waitlist in the database.
app.delete('/deleteWaitlist', (req, res) => {
    const wlAppointmentId = req.body.wlAppointmentId;

    MongoClient.connect(connectionString, {
        useUnifiedTopology: true
    }).then(client => {
        let db;
        let waitlist;

        db = client.db(req.session.companyId);
        waitlist = db.collection('waitlist');

        waitlist.find().toArray().then(wlApptArr => {
            wlApptArr.forEach(appointment => {
                if (appointment._id == wlAppointmentId) {
                    waitlist.deleteOne({
                        _id: ObjectId(wlAppointmentId)
                    });

                    res.json(`Waitlist appointment ${wlAppointmentId} deleted.`);
                }
            });
        })
    }).catch(error => console.log(error));
});

// Toggle the status of an appointment.
app.put('/toggleStatus', (req, res) => {
    const appointmentId = req.body.appointmentId;
    const appointmentState = req.body.status;

    MongoClient.connect(connectionString, {
        useUnifiedTopology: true
    }).then(client => {
        let db;
        let appointments;

        db = client.db(req.session.companyId);
        appointments = db.collection('appointments');

        appointments.updateOne({
            _id: ObjectId(appointmentId)
        }, {
            $set: {
                completed: appointmentState
            }
        });

        res.json(`Status of ${appointmentId} toggled.`);
    }).catch(error => console.log(error));
});