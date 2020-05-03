var $$ = Dom7;
var storage = window.localStorage;
var usuario = { "email": "", "clave": "" };
var usuarioLocal, claveLocal;
var db; //base de datos
var userCollection, booking; //datos de los usuarios
var myServicesSelected;
var services;
var allServices = [];
var myBooking = {
    mail: '',
    services: [false, false, false, false],
    price: 0,
    time: 0,
    date: new Date(),
}
var newService = {
    name: '',
    description: '',
    price: 0,
    time: 0,
}
var pickerInline, today;
var servicesPrice = [300, 200, 100, 600]
var servicesTime = [30, 15, 10, 60]
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
    db = firebase.firestore();

    userCollection = db.collection("users");
    booking = db.collection("booking");
    services = db.collection("services");

    consultarLocalStorage(); // AUTOLOGIN
})

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
    $$('#start-hour').on('click', showpicker);
    $$('.logoutButton').on('click', doLogOut);
    $$('#add-service').on('click', addNewService)
})
//--------------FUNCIONES DE ADMINISTRADOR---------------
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
function confirmEdit (){
    $$('#start-picker-date-container').show();
    pickerInline.destroy();
    $$('#start-picker-date-container').empty();    
}
function cancelEdit(){
    $$('#start-picker-date-container').show();
    pickerInline.destroy();
    $$('#start-picker-date-container').empty();   
}
function hidePicker() {
    $$('#start-picker-date-container').hide();
    $$('.ok-right-button').hide();
}
function showpicker() {
    $$('#start-picker-date-container').show();
    $$('.ok-right-button').show();
}
function startPickers() {
    $$('.ok-right-button').hide();
    today = new Date();
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
    $$('#start-picker-date-container').hide();
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

    console.log(e);
    console.log('estas en tabs de usuario');
    getAllServices(false);
    $$('.logoutButton').on('click', doLogOut);
    //empieza funcionalidades de los turnos
    $$('#reset-price').on('click', resetPrice)
    $$('#services-confirm').on('click', selectedServices)
})
//-------------------------------FUNCIONES USUSARIO---------------------
//mostrar servicios
function showUserServices() {
    for (let i = 0; i < allServices.length; i++) {
        $$('#user-services-list').append(`
        <li>
             <label class="item-checkbox item-content">
                 <input id="service-0" type="checkbox" name="demo-media-checkbox"
                     value="${i + 1}" />
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
//cambiar el total del precio
function selectedServices() {
    for (let i = 0; i < 4; i++) {
        $$('#service-' + i).is(':checked') ? myBooking.services[i] = true : myBooking.services[i] = false;
    }
    updatePrice();
}
//resetear el precio
function resetPrice() {
    myBooking.price = 0;
    myBooking.time = 0;
}
//cambiar precio total
function updatePrice() {
    for (let i = 0; i < 4; i++) {
        if (myBooking.services[i]) {
            myBooking.price += servicesPrice[i];
            myBooking.time += servicesTime[i];
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
