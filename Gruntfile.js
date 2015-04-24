'use strict';

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.initConfig({
        copy: {
            dist: {
                files: [
                    { expand: true, cwd: 'app/', src: ['**'/*, '!bower_components/**', '!scripts/**'*/], dest: 'dist/' },
                ]
            }
        },
        browserify: {
            scripts: {
                files: {
                    'dist/scripts/background-main.js': 'app/scripts/background-main.js',
                    'dist/scripts/everywhere-main.js': 'app/scripts/everywhere-main.js',
                    'dist/scripts/sidebar-main.js':    'app/scripts/sidebar-main.js',
                    'dist/scripts/top-frame-main.js':  'app/scripts/top-frame-main.js'
                }
            }
        },
        jshint: {
            options: {
                jshintrc: true,
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                'app/scripts/{,*/}*.js',
                'test/spec/{,*/}*.js'
            ]
        },
        connect: {
            test: {
                options: {
                    hostname: 'localhost',
                    port: 9500,
                    open: false,
                    base: ['test', 'app', '.']
                }
            }
        },
        mocha: {
            all: {
                options: {
                    run: true,
                    urls: ['http://localhost:<%= connect.test.options.port %>/index.html'],
                    log: true,
                    logErrors: true,
                    reporter: 'Spec'
                }
            }
        },
        watch: {
            dist: {
                files: ['app/**/*'],
                tasks: ['copy', 'browserify'],
                options: {
                    interrupt: true
                }
            }
        }
    });

    grunt.registerTask('test', [
        'jshint',
        'connect:test',
        'mocha'
    ]);
};
