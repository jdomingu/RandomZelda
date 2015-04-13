var gulp = require('gulp'),
    concat = require('gulp-concat'),
    jshint  = require('gulp-jshint'),
    plumber = require('gulp-plumber'),
    watch = require('gulp-watch');

var sources  = ['src/game.js', 'src/*.js'];
gulp.task('default', function() {
    gulp.src(sources)
        .pipe(plumber())
        .pipe(concat('randomzelda.js'))
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest('dist/'));
});

gulp.task('watch', function() {
    gulp.watch(sources, ['default']);
});
