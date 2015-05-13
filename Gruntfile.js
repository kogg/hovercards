'use strict';

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        to_browserify: {
            'dist/scripts/background-main.js': 'app/scripts/background-main.js',
            'dist/scripts/everywhere-main.js': 'app/scripts/everywhere-main.js',
            'dist/scripts/sidebar-main.js':    'app/scripts/sidebar-main.js',
            'dist/scripts/top-frame-main.js':  'app/scripts/top-frame-main.js'
        },
        browserify: {
            js: {
                files: '<%= to_browserify %>'
            },
            js_watchify: {
                options: {
                    keepAlive: true,
                    watch: true
                },
                files: '<%= to_browserify %>'
            }
        },
        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            develop: {
                tasks: ['watch:non_js', 'browserify:js_watchify']
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
                    { expand: true, cwd: 'app/',                               src: ['**', '!scripts/**'], dest: 'dist/' },
                    { expand: true, cwd: 'node_modules/angular/',              src: ['angular-csp.css'],   dest: 'dist/styles/' },
                    { expand: true, cwd: 'node_modules/slick-carousel/slick/', src: ['slick.css'],         dest: 'dist/styles/' }
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
        uglify: {
            js: {
                files: {
                    'dist/scripts/background-main.js': 'dist/scripts/background-main.js',
                    'dist/scripts/everywhere-main.js': 'dist/scripts/everywhere-main.js',
                    'dist/scripts/sidebar-main.js':    'dist/scripts/sidebar-main.js',
                    'dist/scripts/top-frame-main.js':  'dist/scripts/top-frame-main.js'
                }
            }
        },
        watch: {
            options: {
                atBegin: true,
                interrupt: true
            },
            non_js: {
                files: ['app/**/*', '!app/**/*.js'],
                tasks: ['dist:non_js']
            }
        }
    });

    grunt.registerTask('develop',     ['concurrent:develop']);
    grunt.registerTask('dist:js',     ['browserify:js']);
    grunt.registerTask('dist:non_js', ['copy:non_js']);
    grunt.registerTask('pkg',         ['dist:non_js', 'dist:js', 'uglify:js']);
    grunt.registerTask('test',        ['connect:browser_tests', 'mocha:browser_tests']);
};
