var $$ = Dom7;
var storage = window.localStorage;
var usuario = { "email": "", "clave": "" };
var usuarioLocal, claveLocal;
var db; //base de datos
var userCollection; //datos de los usuarios

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
    consultarLocalStorage(); // AUTOLOGIN

});


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
//FUNCTIONS
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
//-------------->>>>>>TERMINA AUTOLOGIN<<<<---------------
