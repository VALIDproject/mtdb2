module.exports = config:
  files:
    javascripts: 
      joinTo:
        'libraries.js': /^(?!app\/)/
        'app.js': /^app\//
    stylesheets: 
      joinTo:
        'vendor.css': /^(bower_components|vendor)\//
        'app.css': /^app\//
    templates: 
      joinTo: 
        'app.js'

config =
  plugins:
    uglify:
      mangle: false
      compress:
        global_defs: 
          DEBUG: false
    cleancss:
      keepSpecialComments: 0
      removeEmpty: true