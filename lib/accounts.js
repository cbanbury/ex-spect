AccountsTemplates.configure({
    defaultLayout: 'master_layout',
    defaultLayoutRegions: {
        nav: 'navbar',
        footer: 'footer'
    },
    defaultContentRegion: 'main'
});


AccountsTemplates.configure({
  showLabels: false,
  texts: {
    errors: {
      mustBeLoggedIn: "Please sign in or register to view this page.",
    }
  },
})
