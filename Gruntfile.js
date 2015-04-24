'use strict';

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            main: {
                files: {
                    'dist/scripts/background-main.js': 'app/scripts/background-main.js',
                    'dist/scripts/everywhere-main.js': 'app/scripts/everywhere-main.js',
                    'dist/scripts/sidebar-main.js':    'app/scripts/sidebar-main.js',
                    'dist/scripts/top-frame-main.js':  'app/scripts/top-frame-main.js'
                }
            }
        },
        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            develop: {
                tasks: ['watch:non_js', 'watch:js']
            }
        },
        connect: {
            browser_tests: {
                options: {
                    hostname: 'localhost',
                    port: 9500,
                    open: false,
                    base: ['test', 'app', '.']
                }
            }
        },
        copy: {
            non_js: {
                files: [
                    { expand: true, cwd: 'app/', src: ['**', '!scripts/**'], dest: 'dist/' },
                    { expand: true, cwd: 'node_modules/angular/', src: ['angular-csp.css'], dest: 'dist/styles/' }
                ]
            }
        },
        mocha: {
            browser_tests: {
                options: {
                    run: true,
                    urls: ['http://localhost:<%= connect.browser_tests.options.port %>/index.html'],
                    log: true,
                    logErrors: true,
                    reporter: '<%= pkg.reporter %>'
                }
            }
        },
        watch: {
            options: {
                atBegin: true,
                interrupt: true
            },
            non_js: {
                files: ['app/**/*', '!app/scripts/**'],
                tasks: ['copy:non_js']
            },
            js: {
                files: ['app/scripts/**'],
                tasks: ['browserify:main']
            }
        }
    });

    grunt.registerTask('test', [
        'connect:browser_tests',
        'mocha:browser_tests'
    ]);

    grunt.registerTask('develop', [
        'concurrent'
    ]);
};
