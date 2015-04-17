require.config({
    baseUrl: 'scripts',
    paths: {
        angular:            '../bower_components/angular/angular',
        'angular-animate':  '../bower_components/angular-animate/angular-animate',
        'angular-sanitize': '../bower_components/angular-sanitize/angular-sanitize',
        'angular-inview':   '../bower_components/angular-inview/angular-inview',
        async:              '../bower_components/requirejs-plugins/src/async',
        domReady:           '../bower_components/requirejs-domready/domReady',
        dotdotdot:          '../bower_components/jQuery.dotdotdot/src/js/jquery.dotdotdot',
        jquery:             '../bower_components/jquery/dist/jquery',
        oboe:               '../bower_components/oboe/dist/oboe-browser'
    },
    shim: {
        angular:            { exports: 'angular' },
        'angular-animate':  ['angular'],
        'angular-inview':   ['angular'],
        'angular-sanitize': ['angular'],
        'dotdotdot':        ['jquery']
    }
});
