
var routes = [
  {
    path: '/',
    url: './index.html',
  },
  {
    path: '/home-user/',
    url: './pages/user/home-user.html',
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
      tabs: [
        // First (default) tab has the same url as the page itself
        {
          // Tab path
          path: '/',
          // Tab id
          id: 'tabs-admin-1',
          // Fill this tab content from content string
          url: './pages/admin/tabs-admin/admin-home.html',
        },
        // Second tab
        {
          path: '/tabs-admin-2/',
          id: 'tabs-admin-2',
          // Fill this tab content with Ajax request:
          url: './pages/admin/tabs-admin/admin-appointment.html',
      
        },
        // Third tab
        {
          path: '/tabs-admin-3/',
          id: 'tabs-admin-3',
          // Load this tab content as a component with Ajax request:
          url: './pages/admin/tabs-admin/admin-profile.html',
        },
      ]
  },
  //RUTAS USUARIO
  {
    // Page main route
    path: '/tabs/',
    // Will load page from tabs/index.html file
    url: './pages/user/tabs.html',
    // Pass "tabs" property to route, must be array with tab routes:
   
  },
  {
    path: '(.*)',
    url: './pages/404.html',
  },
];
