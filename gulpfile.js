var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task('default', function() {
gulp.src(['src/game.js', 'src/*.js'])
    .pipe(concat('randomzelda.js'))
    .pipe(gulp.dest('dist/'));
});

// To Do: Add gulp-watch, run js-hint, run tests
