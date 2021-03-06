var $$ = Dom7;
var storage = window.localStorage;
var usuario = { "email": "", "clave": "" };
var usuarioLocal, claveLocal;
var cantTurnosLocal = 0;
var db; //base de datos
var userCollection, booking; //datos de los usuarios
var smartSelectDay, smartSelectHour;
var myServicesSelected;
var services;
var turnos;
var misTurnos = [];
var allServices = [];
var myBooking = {
    mail: '',
    services: [],
    price: 0,
    time: 0,
    date: new Date(),
    startTime: 0,
    day: '',
    name: '',
}
var newService = {
    name: '',
    description: '',
    price: 0,
    time: 0,
}
var hoursDayCheck = {};
var schedule;
var pickerInline, pickerInline2, today;
var servicesPrice = [300, 200, 100, 600];
var servicesTime = [30, 15, 10, 60];
//horarios de atencion
var startHour;
var endHour;
var app = new Framework7({
    root: '#app', // App root element

    id: 'io.framework7.myapp', // App bundle ID
    name: 'My App', // App name
    theme: 'auto', // Automatic theme detection
    // App root data
    // App root methods
    methods: {
        helloWorld: function () {
            app.dialog.alert('Hello World!');
        },
    },
    // App routes
    routes: routes,
    // Cordova Statusbar settings
    statusbar: {
        iosOverlaysWebView: true,
        androidOverlaysWebView: false,
    },
});


var mainView = app.views.create('.view-main');

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function () {
    console.log("Device is ready!");

    //base de datos
    db = firebase.firestore();
    userCollection = db.collection("users");
    booking = db.collection("booking");
    services = db.collection("services");
    schedule = db.collection("schedule");
    turnos = db.collection("turnos");
    consultarLocalStorage(); // AUTOLOGIN
    getStartEndHours();


})
function getAllBooking() {
    turnos.where("name", "==", myBooking.name)
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                // doc.data() is never undefined for query doc snapshots
                console.log(doc.id, " => ", doc.data());
                misTurnos.push(doc.data());
                $$('#cards-de-turnos').append(`
            <div class="card">
                <div class="card-header">Dia: ${doc.data().day} Hora: ${doc.data().startTime}:00</div>
                    <div class="card-content card-content-padding">
                        Servicios : ${doc.data().services}
                    </div>
                <div class="card-footer">Precio: ${doc.data().price}</div>
            </div>
            `)
            });
        })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
        });

}
//para iniciarlizar todas las colecciones de minutos por semana
function creatingBookings() {
    var dias = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
    for (let x = 0; x < dias.length; x++) {
        for (let i = 0; i < 23; i++) {
            let hora = i;
            hora < 10 ? hora = '0' + i : hora = hora.toString();
            booking.doc(`${dias[x]}/${hora}/minutos`).set({
                lleno: false,
                cantidad: 0,
            }).then(function () {
                console.log("Document successfully written!");
            }).catch(function (error) {
                console.error("Error writing document: ", error);
            });
        }
    }
}
//traer horario de apertura y de cierre
function getStartEndHours() {
    schedule.doc("horarios").get().then(function (doc) {
        if (doc.exists) {
            console.log("Document data:", doc.data());
            startHour = parseInt((doc.data().startTime.toString().split(':'))[0]);
            endHour = parseInt((doc.data().endTime.toString().split(':'))[0]);
            console.log('horario de apertura', startHour, 'horario de cierre:', endHour);
        } else {
            console.log("No such document!");
        }
    }).catch(function (error) {
        console.log("Error getting document:", error);
    });

}
// mostrar horas disponibles por dia
// Option 1. Using one 'page:init' handler for all pages
$$(document).on('page:init', function (e) {
    // Do something here when page loaded and initialized
    console.log(e);
    $$('#login').on('click', login);
})

// Option 2. Using live 'page:init' event handlers for each page
$$(document).on('page:init', '.page[data-name="about"]', function (e) {
    // Do something here when page with data-name="about" attribute loaded and initialized
    console.log(e);

})
$$(document).on('page:init', '.page[data-name="main"]', function (e) {
    // Do something here when page with data-name="about" attribute loaded and initialized
    console.log(e);
    console.log('estas en pagina main');
})
$$(document).on('page:init', '.page[data-name="register"]', function (e) {
    // Do something here when page with data-name="about" attribute loaded and initialized
    console.log(e);
    $$('#register').on('click', register);
})
$$(document).on('page:init', '.page[data-name="tabs-admin"]', function (e) {
    // Do something here when page with data-name="about" attribute loaded and initialized
    console.log(e);
    console.log('estas en tabs admin');
    getAllServices(true);

    $$('#edit-schedule').on('click', startPickers);
    $$('#cancel-edit-schedule').on('click', cancelEdit);
    $$('#confirm-edit-schedule').on('click', confirmEdit)
    $$('.ok-right-button').on('click', hidePicker);
    $$('.ok-right-button-2').on('click', hideEndPicker);
    $$('#start-hour').on('click', showpicker);
    $$('#end-hour').on('click', showEndpicker)
    $$('.logoutButton').on('click', doLogOut);
    $$('#add-service').on('click', addNewService)
    getClients();
})
//----------c----FUNCIONES DE ADMINISTRADOR---------------
function getClients() {
    var xdays = ["lunes","martes","miercoles","jueves","viernes","sabado"]
    for (let i = 0; i < xdays.length; i++) {
        turnos.where("day", "==", xdays[i])
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                // doc.data() is never undefined for query doc snapshots
                console.log(doc.id, " => ", doc.data());
                misTurnos.push(doc.data());
                $$('#cards-' + xdays[i]).append(`
            <div class="card">
                <div class="card-header">Cliente ${doc.data().name}</div>
                    <div class="card-content card-content-padding">
                        <h3>Hora: ${doc.data().startTime}:00</h3>
                        <h3>Servicios : ${doc.data().services}</h3>
                    </div>
                <div class="card-footer">Precio: ${doc.data().price}</div>
            </div>
            `)
            });
        })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
        });
    }  
        
}
function addNewService() {
    newService.name = $$('#new-service-name').val();
    newService.description = $$('#new-service-description').val();
    newService.price = $$('#new-service-price').val();
    newService.time = $$('#new-service-time').val();
    services.doc(newService.name).set({
        name: newService.name,
        description: newService.description,
        price: newService.price,
        time: newService.time,
    }).then(function (docRef) {
        console.log("Document written with ID: ", docRef);
        console.log('servicio agregado', newService)
        resetNewService();
        getAllServices(true);
        showServices();
    })
        .catch(function (error) {
            console.error("Error adding document: ", error);
        });

}
function resetNewService() {
    newService = {
        name: '',
        description: '',
        price: 0,
        time: 0,
    };
    $$('#new-service-name').val('');
    $$('#new-service-description').val('');
    $$('#new-service-price').val('');
    $$('#new-service-time').val('');
    console.log('reseteo de variable newService', newService)
}
function showServices() {

    for (let i = 0; i < allServices.length; i++) {
        $$('#actual-services').append(`
        <div id="actual-services-${i}">
        </div>`
        );
        $$('#actual-services-' + i).html(`
        <div class="card">
            <div class="card-header title-case">${allServices[i].name}</div>
            <div class="card-content">
                <div class="list simple-list">
                    <ul>
                        <li>Description: <span>${allServices[i].description}</span></li>
                        <li>Tiempo: <span>${allServices[i].time}</span></li>
                        <li>Precio: <span>${allServices[i].price}</span></li>
                    </ul>
                </div>
            </div>
        </div>
    `);
    }

}
//--------------DATE TIME PICKER------------
function confirmEdit() {
    console.log('start hour', $$('#start-picker-date').val());
    console.log('end hour', $$('#end-picker-date').val());
    schedule.doc("horarios").set({
        startTime: $$('#start-picker-date').val(),
        endTime: $$('#end-picker-date').val(),
    })
        .then(function () {
            alert("Horario cambiado correctamente");
        })
        .catch(function (error) {
            alert("error al cambiar horario");
            console.log('error al cambiar horario:', error)
        });
    $$('#start-picker-date-container').show();
    $$('#end-picker-date-container').show();
    pickerInline.destroy();
    pickerInline2.destroy();
    $$('#start-picker-date-container').empty();
    $$('#end-picker-date-container').empty();
}
function cancelEdit() {
    $$('#start-picker-date-container').show();
    $$('#end-picker-date-container').show();
    pickerInline.destroy();
    pickerInline2.destroy();
    $$('#start-picker-date-container').empty();
    $$('#end-picker-date-container').empty();
}
function hidePicker() {
    $$('#start-picker-date-container').hide();
    $$('.ok-right-button').hide();
}
function hideEndPicker() {
    $$('#end-picker-date-container').hide();
    $$('.ok-right-button-2').hide();
}
function showpicker() {
    $$('#start-picker-date-container').show();
    $$('.ok-right-button').show();
}
function showEndpicker() {
    $$('#end-picker-date-container').show();
    $$('.ok-right-button-2').show();
}
function startPickers() {
    $$('.ok-right-button').hide();
    $$('.ok-right-button-2').hide();
    today = new Date();
    // para usar el desde
    pickerInline = app.picker.create({
        containerEl: '#start-picker-date-container',
        inputEl: '#start-picker-date',
        toolbar: false,
        rotateEffect: true,
        value: [
            today.getHours(),
            today.getMinutes() < 10 ? '0' + today.getMinutes() : today.getMinutes()
        ],
        formatValue: function (values, displayValues) {
            return displayValues[0] + ' : ' + values[1];
        },
        cols: [
            // Space divider
            {
                divider: true,
                content: '&nbsp;&nbsp;'
            },
            // Hours
            {
                values: (function () {
                    var arr = [];
                    for (var i = 0; i <= 23; i++) { arr.push(i); }
                    return arr;
                })(),
            },
            // Divider
            {
                divider: true,
                content: ':'
            },
            // Minutes
            {
                values: (function () {
                    var arr = [];
                    for (var i = 0; i <= 59; i++) { arr.push(i < 10 ? '0' + i : i); }
                    return arr;
                })(),
            }
        ],
    });
    //para usar hasta
    pickerInline2 = app.picker.create({
        containerEl: '#end-picker-date-container',
        inputEl: '#end-picker-date',
        toolbar: false,
        rotateEffect: true,
        value: [
            today.getHours(),
            today.getMinutes() < 10 ? '0' + today.getMinutes() : today.getMinutes()
        ],
        formatValue: function (values, displayValues) {
            return displayValues[0] + ' : ' + values[1];
        },
        cols: [
            // Space divider
            {
                divider: true,
                content: '&nbsp;&nbsp;'
            },
            // Hours
            {
                values: (function () {
                    var arr = [];
                    for (var i = 0; i <= 23; i++) { arr.push(i); }
                    return arr;
                })(),
            },
            // Divider
            {
                divider: true,
                content: ':'
            },
            // Minutes
            {
                values: (function () {
                    var arr = [];
                    for (var i = 0; i <= 59; i++) { arr.push(i < 10 ? '0' + i : i); }
                    return arr;
                })(),
            }
        ],
    });
    $$('#start-picker-date-container').hide();
    $$('#end-picker-date-container').hide();
}

//XXXXXXX FIN DATE TIME PICKEER XXXXXXXXXXXXXXXXXXX
//------------------------------------FIN FUNCIONES ADMINISTRADOR -------------
// funciones compartidas
function getAllServices(isAdmin) {
    services.get().then(function (querySnapshot) {
        var cont = 0;
        querySnapshot.forEach(function (doc) {
            allServices[cont] = doc.data();
            cont++;
        })
        console.log('servicios disponibles', allServices);
        isAdmin ? showServices() : showUserServices();
    });
}
//fin funciones compartidas
$$(document).on('page:init', '.page[data-name="tabs"]', function (e) {
    console.log('estas en tabs de usuario');
    $$('.logoutButton').on('click', doLogOut);
    //empieza funcionalidades de los turnos
    $$('#select-my-services').on('click', selectMyServices);
    $$('#services-confirm').on('click', selectedServices);
    $$('#confirm-booking').on('click', addBooking);
    $$('#time-select').hide();
    $$('#selected-day').on('smartselect:closed', getBookingHours);
    $$('#selected-day').on('click', emptyHour);
    getUserName();
})
//-------------------------------FUNCIONES USUSARIO---------------------
//obtener el nombre de usuario
function getUserName() {
    var usuarioGuardado = storage.getItem("usuario");
    usuarioGuardado = JSON.parse(usuarioGuardado);
    userCollection.doc(`${usuarioGuardado.email}`).get().then(function (doc) {
        if (doc.exists) {
            console.log("Document data:", doc.data().name);
            myBooking.name = doc.data().name;
            getAllBooking();
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch(function (error) {
        console.log("Error getting document:", error);
    });
};
//traer y mostrar las horas disponibles para que usuario pueda pedir turno

function getBookingHours() {
    $$('#show-hour').append(`
    <div id="selected-hour" class="item-inner smart-select smart-select-init" data-open-in="sheet">
      <div class="item-header">Hora</div>
      <div class="item-after"><select id="hour-booking" name="hora">              
          </select>
      </div>
    `);
    $$('#selected-hour').hide();
    var disabled = '';
    var day = smartSelectDay.getValue();
    var cont = 0;
    var endStartDiference = endHour - startHour;
    console.log('dia seleccionado:', day);
    for (let j = startHour; j <= endHour; j++) {
        let xHour;
        j < 10 ? xHour = `0${j}` : xHour = j.toString();
        booking.doc(`${day}/${xHour}/minutos`).get().then(function (doc) {
            if (doc.exists) {
                hoursDayCheck[xHour] = doc.data();
                cont++;
                if (cont > endStartDiference) {
                    for (let i = startHour; i <= endHour; i++) {
                        var myhour = '';
                        var myHourPlus = '';
                        var myHourPlusPLus = '';
                        i < 10 ? myhour = `0${i}` : myhour = i.toString();
                        disabled = hoursDayCheck[myhour].lleno ? 'disabled' : ''; // esta ocupada esta hora?
                        if (disabled == '') { //si no esta ocupada
                            myHourPlus = (parseInt(myhour) + 1);
                            myHourPlusPLus = (parseInt(myhour) + 2);
                            myHourPlus = myHourPlus < 10 ? `0${myHourPlus}` : myHourPlus.toString();
                            myHourPlusPLus = myHourPlusPLus < 10 ? `0${myHourPlusPLus}` : myHourPlusPLus.toString();
                            if (myBooking.time < (60 - hoursDayCheck[myhour].cantidad)) { // el tiempo de todos mis servicios es menor al de esta hora?
                                disabled = '';
                            } else if (endHour < (parseInt(myHourPlus))) {
                                disabled = 'disabled';
                            } else if (myBooking.time < ((60 - hoursDayCheck[myhour].cantidad) + (60 - hoursDayCheck[myHourPlus].cantidad))) { //el tiempo de todos mis servicios es menor al de esta hora y la siguiente sumado
                                disabled = '';
                            } else if (myBooking.time < ((60 - hoursDayCheck[myhour].cantidad) + (60 - hoursDayCheck[myHourPlus].cantidad) + (60 - hoursDayCheck[myHourPlusPLus].cantidad))) {
                                disabled = '';
                            }
                        }
                        $$('#hour-booking').append(`
                            <option ${disabled} value="${i}">${i}:00</option>
                            `);
                    }

                    console.log('horas agregadas correctamente');
                    $$('#selected-hour').show();
                }
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        }).catch(function (error) {
            console.log("Error getting document:", error);
        });
    };
    console.log(`datos de las horas de ${day}`, hoursDayCheck);
}

//borrar seleccionar horarios
function emptyHour() {
    $$('#show-hour').empty();
}

function saludar() {
    console.log('hola')
}
function resetTurno(){
    $$('#total-price').text('0');
    $$('#total-time').text('0');
    $$('#time-select').hide();
}
//agregar el turno a la base de datos 
function addBooking() {
    smartSelectHour = app.smartSelect.get('#selected-hour');
    var hour = parseInt(smartSelectHour.getValue());
    var myday = smartSelectDay.getValue().toString();
    console.log('hora seleccionada:', hour);
    var usuarioLocal = storage.getItem("usuario");
    usuarioLocal = JSON.parse(usuarioLocal);
    var hourString = hour < 10 ? `0${hour}` : hour.toString();
    if (myBooking.services.length == 0) {
        alert('Tiene que elegir al menos un servicio')
    } else {
        
        cantTurnosLocal++;
        myBooking.startTime = parseInt(hour);
        myBooking.mail = usuarioLocal.email;
        myBooking.day = myday;
        var cantString = cantTurnosLocal.toString();
        var detailsActualHour;
        var excedente = 0;
        turnos.add(myBooking)
            .then(function (docRef) {
                console.log("Document written with ID: ", docRef.id);
                $$('#cards-de-turnos').empty();
                getAllBooking();
                alert('Turno Agendado con Exito');
            })
            .catch(function (error) {
                console.error("Error adding document: ", error);
            });
        booking.doc(`${myday}/${hourString}/minutos`).get().then(function (doc) {
            if (doc.exists) {
                detailsActualHour = doc.data();
                console.log('detalles de la hora actual seleccionada', detailsActualHour)
            } else {
                console.log("No such document!");
            }
        }).catch(function (error) {
            console.log("Error getting document:", error);
        });
        booking.doc(`${myday}/${hourString}/${myBooking.name}${cantString}`).set(myBooking)
            .then(function () {
                var cantidad = 0;
                var lleno = false;
                if (myBooking.time < 60) {
                    cantidad = myBooking.time;
                    lleno = false;
                } else {
                    lleno = true;
                    excedente = myBooking.time + parseInt(detailsActualHour.cantidad) - 60;
                    cantidad = 60;
                }
                console.log('excedente:', excedente);
                var myObject = {
                    cantidad: cantidad,
                    lleno: lleno,
                }
                console.log("turno pedido correctamente", myBooking);
                resetTurno();
                booking.doc(`${myday}/${hourString}/minutos`).update(myObject)
                    .then(function () {
                        console.log("update correcto");
                        if (excedente > 0) {
                            var myhourstring = parseInt(hourString) + 1;
                            myhourstring = myhourstring < 10 ? `0${myhourstring}` : myhourstring.toString();
                            booking.doc(`${myday}/${myhourstring}/minutos`).update({
                                cantidad: excedente,
                                lleno: false,
                            }).then(function (doc) {
                                console.log('exedecte añadido correctamente');
                            }).catch(function (error) {
                                console.log("Error updating document:", error);
                            });
                        }
                    })
                    .catch(function (error) {
                        console.error("Error al hacer update", error);
                    });
            })
            .catch(function (error) {
                console.error("Error al enviar turno", error);
            });
    }
}
//mostrar servicios
function showUserServices() {
    for (let i = 0; i < allServices.length; i++) {
        $$('#user-services-list').append(`
        <li>
             <label class="item-checkbox item-content">
                 <input id="service-${i}" type="checkbox" name="demo-media-checkbox"
                     value="${allServices[i].name}" />
                 <i class="icon icon-checkbox"></i>
                 <div class="item-inner">
                     <div class="item-title-row">
                         <div class="item-title">${allServices[i].name}</div>
                         <div class="item-after">Precio: $ ${allServices[i].price}</div>
                     </div>
                     <div class="item-subtitle">${allServices[i].description}</div>
                     <div class="item-text">Duracion aprox: ${allServices[i].time} min</div>
                 </div>
             </label>
         </li>
    `);
    }
}
//cambiar el total del precio y borrar los servicios pintado
function selectedServices() {
    for (let i = 0; i < allServices.length; i++) {
        if ($$('#service-' + i).is(':checked')) {
            myBooking.services.push($$('#service-' + i).val());
        }
    }
    console.log(myBooking.services);
    updatePrice();
    $$('#user-services-list').empty()
}
//selecccionar mis servicios y resetear el precio
function selectMyServices() {
    smartSelectDay = app.smartSelect.get('#selected-day');
    $$('#time-select').show();
    $$('#selected-hour').hide();
    myBooking.services = [];
    getAllServices(false);
    myBooking.price = 0;
    myBooking.time = 0;
}
//cambiar precio total
function updatePrice() {
    for (let i = 0; i < allServices.length; i++) {
        for (let x = 0; x < allServices.length; x++) {
            if (myBooking.services[i] == allServices[x].name) {
                myBooking.price += parseInt(allServices[x].price);
                myBooking.time += parseInt(allServices[x].time);
            }
        }
    }
    $$('#total-price').text(myBooking.price);
    $$('#total-time').text(myBooking.time);
}
//register
function register() {
    var hasError = false;
    var name = $$('#name').val();
    var lastName = $$('#lastName').val();
    var email = $$('#email').val();
    var password = $$('#password').val();
    console.log(hasError, email, password);
    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function (error) {

        var errorCode = error.code;
        var errorMessage = error.message;
        alert(error);
        hasError = true;
    }).then(function (resp) {
        console.log(resp);
        if (!hasError) {
            //agregamos
            userCollection.doc(email).set({
                name: name,
                lastName: lastName,
                email: email,
                admin: false,
            })
                .then(function (docRef) {
                    console.log("Document written with ID: ", docRef.id);
                })
                .catch(function (error) {
                    console.error("Error adding document: ", error);
                });
            mainView.router.navigate("/");
        }
    });
}
//login
function login() {
    // alert('ir a about');
    var logHasError = false;
    var logEmail = $$('#email-sign').val();
    var logPassword = $$('#password-sign').val();
    console.log(logHasError, logEmail, logPassword);
    firebase.auth().signInWithEmailAndPassword(logEmail, logPassword)
        .catch(function (error) {
            //Si hubo algun error, ponemos un valor referenciable en la variable huboError
            logHasError = true;
            var errorCode = error.code;
            var errorMessage = error.message;
            alert(error);
        })
        .then(function () {
            //En caso de que esté correcto el inicio de sesión y no haya errores, se dirige a la siguiente página
            if (!logHasError) {
                usuario = { email: logEmail, clave: logPassword };
                //storage.setItem("persona", persona); -> guardará [object Object]
                var usuarioAGuardar = JSON.stringify(usuario);
                // por eso convertimos el JSON en un string

                storage.setItem("usuario", usuarioAGuardar);
                console.log("usuarioAGuardar: " + usuarioAGuardar);
                console.log("usuario: " + usuario.email + "password: " + usuario.clave);
                //definir si es admin o user
                userCollection.doc(logEmail).get().then(function (doc) {
                    if (doc.exists) {
                        console.log("Es un administrador", doc.data().admin);
                        doc.data().admin ? mainView.router.navigate('/tabs-admin/') : mainView.router.navigate('/tabs/');
                    } else {
                        // doc.data() will be undefined in this case
                        console.log("No such document!");
                    }
                }).catch(function (error) {
                    console.log("Error getting document:", error);
                });
            }
        });

}
//-------------------->>>>>>>>>>  AUTOLOGIN <<<<<<<<<<<-------------
function consultarLocalStorage() {

    var usuarioGuardado = storage.getItem("usuario");
    usuarioGuardado = JSON.parse(usuarioGuardado);
    // convertimos el string en JSON

    if (usuarioGuardado.email == "") {
        console.log("no hay datos en el local");
    } else {

        console.log(" usuarioguardado.email: " + usuarioGuardado.email);
        console.log(" usuarioguardado.clave: " + usuarioGuardado.clave);
        //pasar los datos del json a dos variables independientes
        usuarioLocal = usuarioGuardado.email;
        claveLocal = usuarioGuardado.clave;
        console.log("usuariolocal + clavelocal: " + usuarioLocal + claveLocal)
        //si la variable tiene datos llamamos a una funcion de login pasandole las variables como parametros

        if (usuarioGuardado != null) {
            LoguearseConLocal(usuarioLocal, claveLocal);
        };
    };
};

function LoguearseConLocal(u, c) {
    console.log("loguearseconlocal, u+c" + u + c)

    //Se declara la variable huboError (bandera)
    var huboError = 0;
    firebase.auth().signInWithEmailAndPassword(u, c)
        .catch(function (error) {
            //Si hubo algun error, ponemos un valor referenciable en la variable huboError
            huboError = 1;
            var errorCode = error.code;
            var errorMessage = error.message;
            console.error(errorMessage);
            console.log(errorCode);


        })
        .then(function () {
            //En caso de que esté correcto el inicio de sesión y no haya errores, se dirige a la siguiente página
            if (huboError == 0) {
                console.log("te logueaste");
                userCollection.doc(u).get().then(function (doc) {
                    if (doc.exists) {
                        console.log("Es un administrador", doc.data().admin);
                        doc.data().admin ? mainView.router.navigate('/tabs-admin/') : mainView.router.navigate('/tabs/');
                    } else {
                        // doc.data() will be undefined in this case
                        console.log("No such document!");
                    }
                }
                );
            }
        })
}
//-------------->>>>>>TERMINA AUTOLOGIN<<<<-------------
//  LOGOUT
function doLogOut() {
    localStorage.clear();
    mainView.router.navigate('/');
}
