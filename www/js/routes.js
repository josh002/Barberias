
var routes = [
  {
    path: '/',
    url: './index.html',
  },
  {
    path: '/register/',
    url: './pages/register.html',
  },

  {
    path: '/wf7/',
    url: 'https://framework7.io',
  },

  //RUTAS ADMINISTRADOR
  {
      path: '/tabs-admin/',
      url: './pages/admin/tabs-admin.html',
  },
  //RUTAS USUARIO
  {
    path: '/tabs/',
    url: './pages/user/tabs.html',   
  },
  {
    path: '(.*)',
    url: './pages/404.html',
  },
];
