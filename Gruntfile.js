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
            gruntfile: ['Gruntfile.js'],
            chrome: ['app/scripts/{,*/}*.js'],
            tests: ['test/spec/{,*/}*.js']
        },
        connect: {
            options: {
                hostname: 'localhost',
                base: ['test', 'app']
            },
            chrome: {
                options: {
                    port: 9500,
                    open: false
                }
            }
        },
        mocha: {
            options: {
                run: true,
                log: true,
                reporter: 'Nyan'
            },
            chrome: {
                options: {
                    urls: ['http://localhost:<%= connect.chrome.options.port %>/chrome.html']
                }
            }
        },
    });


    grunt.registerTask('test', ['jshint', 'connect', 'mocha']);
};
