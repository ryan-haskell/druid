var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var sass = require('gulp-sass');

var paths = {
    html: 'src/**/*.html',
    js: './src/js/**/*.js',
    css: './src/css/*.scss'
};

gulp.task('browserify', function() {

    return browserify('./src/js/app.js')
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('./dist/static'));

});

gulp.task('copyHTML', function() {

    gulp.src(paths.html)
        .pipe(gulp.dest('dist'))

});

gulp.task('sass', function () {
  gulp.src('./src/css/styles.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./dist/static'));
});

gulp.task('watch', function() {

    gulp.watch(paths.html, ['copyHTML']);
    gulp.watch(paths.css, ['sass']);
    gulp.watch(paths.js, ['browserify']);

});

gulp.task('default', ['watch', 'browserify', 'sass', 'copyHTML']);
