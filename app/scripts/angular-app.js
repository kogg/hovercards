'use strict';

define(['domReady!', 'jquery', 'angular', 'angular-animate', 'angular-sanitize', 'angular-inview'], function(ignore, $, angular) {
    return angular.module('app', ['ngAnimate', 'ngSanitize', 'angular-inview']);
});
