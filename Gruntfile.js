'use strict';

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.initConfig({
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
            options: {
                hostname: 'localhost'
            },
            test: {
                options: {
                    port: 9500,
                    open: false,
                    base: ['test', 'app']
                }
            },
            testBrowser: {
                options: {
                    port: 9750,
                    open: true,
                    keepalive: true,
                    base: ['test', 'app']
                }
            }
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
