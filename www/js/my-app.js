var $$ = Dom7;

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
    var db = firebase.firestore();
   
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
$$(document).on('page:init', '.page[data-name="form"]', function (e) {
    // Do something here when page with data-name="about" attribute loaded and initialized
    console.log(e);
    $$('#register').on('click', register);
})
//FUNCTIONS
//register
function register() {
   
    var hasError = false;
    var email = $$('#email').val();
    var password = $$('#password').val();
    console.log(hasError, email, password);
    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function (error) {

        var errorCode = error.code;
        var errorMessage = error.message;
        alert(error);
        hasError = true;
    }).then(function (resp) {
        if (!hasError) {
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
            logHasError= true;
            var errorCode = error.code;
            var errorMessage = error.message;
           alert(error);
        })
        .then(function () {
            //En caso de que esté correcto el inicio de sesión y no haya errores, se dirige a la siguiente página
            if (!logHasError) {
                mainView.router.navigate('/about/');
            }
        });

}
