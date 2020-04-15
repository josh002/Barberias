
// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

var app = new Framework7({
    // App root element
    root: '#app',
    // App Name
    name: 'My App',
    // App id
    id: 'com.myapp.test',
    // Enable swipe panel
    panel: {
        swipe: 'left',
    },
    // Add default routes
    routes: [
        {
            path: '/home/',
            url: './pages/user/home.html'
        },
        {
            path: '/admin/',
            url: './pages/admin/admin.html'
        },
        {
            path: '/register/',
            url: './pages/register.html'
        },

    ]
    // ... other parameters
});

var mainView = app.views.create('.view-main');

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function () {
    console.log("Device is ready!");

});

//LOGIN
// Option 1. Using one 'page:init' handler for all pages
$$(document).on('page:init', function (e) {
    // Do something here when page loaded and initialized
    console.log(e,);
    console.log('LOGIN')
})

//REGISTRO
$$(document).on('page:init', '.page[data-name="register"]', function (e) {
    // Do something here when page with data-name="about" attribute loaded and initialized
    console.log(e);
    console.log('REGISTRO')
})
//>>>>>>>>>>>>>> USER  <<<<<<<<<<<<<<<
//HOME
$$(document).on('page:init', '.page[data-name="home"]', function (e) {
    // Do something here when page with data-name="about" attribute loaded and initialized
    console.log(e);
    console.log('HOME')

})
//>>>>>>>>>>>>>> ADMIN  <<<<<<<<<<<<<<<
$$(document).on('page:init', '.page[data-name="admin"]', function (e) {
    // Do something here when page with data-name="about" attribute loaded and initialized
    console.log(e);
    console.log('ADMIN')

})

/** FUNCIONES PROPIAS **/



