'use strict';

define(['domReady!', 'jquery', 'angular', 'angular-animate', 'angular-sanitize'], function(ignore, $, angular) {
    return angular.module('app', ['ngAnimate', 'ngSanitize']);
});
