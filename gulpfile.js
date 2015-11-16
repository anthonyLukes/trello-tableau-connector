'use strict';

var data = require('gulp-data');
var gulp = require('gulp');
var nconf = require('nconf');
var nunjucksRender = require('gulp-nunjucks-render');
var rename = require('gulp-rename');

nconf
  .argv()
  .env()
  .file({ file: __dirname + '/local.env.json' });
var TRELLO_API_KEY = nconf.get('TRELLO_API_KEY');
console.log('TRELLO_API_KEY', TRELLO_API_KEY);

gulp.task('buildMarkup', function() {
    nunjucksRender.nunjucks.configure(['web/'], {watch: false});
    return gulp.src('web/trelloConnector.nunjucks')
    .pipe(data(function() {
        return {
          "TRELLO_API_KEY": TRELLO_API_KEY
        };
    }))
    .pipe(nunjucksRender())
    .pipe(gulp.dest('web'));
});

gulp.task('build', ['buildMarkup']);

gulp.task('default', ['build']);