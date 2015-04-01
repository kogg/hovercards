// Generated on 2015-02-25 using generator-chrome-extension 0.3.0
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Configurable paths
    var config = {
        app: 'app',
        dist: 'dist'
    };

    grunt.initConfig({

        // Project settings
        config: config,

        // Grunt server and debug server setting
        connect: {
            options: {
                livereload: 35729,
                // change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            test: {
                options: {
                    port: 9500,
                    open: false,
                    base: [
                        'test',
                        '<%= config.app %>'
                    ]
                }
            },
            testBrowser: {
                options: {
                    port: 9750,
                    open: true,
                    keepalive: true,
                    base: [
                        'test',
                        '<%= config.app %>'
                    ]
                }
            }
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: true,
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '<%= config.app %>/scripts/{,*/}*.js',
                'test/spec/{,*/}*.js'
            ]
        },
        mocha: {
            all: {
                options: {
                    run: true,
                    urls: ['http://localhost:<%= connect.test.options.port %>/index.html'],
                    log: true,
                    reporter: 'Nyan'
                }
            }
        },
    });

    grunt.registerTask('test', [
        'jshint',
        'connect:test',
        'mocha'
    ]);

    grunt.registerTask('test:browser', [
        'connect:testBrowser'
    ]);
};
