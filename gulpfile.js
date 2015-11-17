'use strict';

var connect = require('gulp-connect');
var data = require('gulp-data');
var gulp = require('gulp');
var nconf = require('nconf');
var nunjucksRender = require('gulp-nunjucks-render');
var rename = require('gulp-rename');

var CONFIG = {
  MARKUP: {
    INPUT: 'web/trelloConnector.nunjucks'
  }
}

nconf
  .argv()
  .env()
  .file({ file: __dirname + '/local.env.json' });
var TRELLO_API_KEY = nconf.get('TRELLO_API_KEY');

gulp.task('buildMarkup', function() {
    nunjucksRender.nunjucks.configure(['web/'], {watch: false});
    return gulp.src(CONFIG.MARKUP.INPUT)
    .pipe(data(function() {
        return {
          "TRELLO_API_KEY": TRELLO_API_KEY
        };
    }))
    .pipe(nunjucksRender())
    .pipe(gulp.dest('web'))
    .pipe(connect.reload());
});

gulp.task('tryConnect', function () {
  connect.server({
    root: ['web'],
    port: 8000,
    livereload: true
  });
});

gulp.task('build', ['buildMarkup']);

gulp.task('watch', ['build', 'tryConnect'], function() {
  // setup up watches
  gulp.watch(CONFIG.MARKUP.INPUT, ['buildMarkup']);
});

gulp.task('default', ['build']);