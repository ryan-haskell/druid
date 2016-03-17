var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');

var paths = {
    html: 'src/**/*.html',
    js: './src/js/**/*.js',
    constants: './src/js/constants.js',
    css: './src/css/*.css',
    img: './src/img/**/*.png'
};

gulp.task('JS', function() {

    gulp.src(paths.constants)
        .pipe(gulp.dest('dist/static'))

    return browserify('./src/js/app.js')
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('./dist/static'));

});

gulp.task('HTML', function() {
    gulp.src(paths.html)
        .pipe(gulp.dest('dist'))

});

gulp.task('images', function() {

    gulp.src(paths.img)
        .pipe(gulp.dest('dist/static/img'))

});

gulp.task('css', function () {
  gulp.src(paths.css)
    .pipe(gulp.dest('./dist/static'));
});

gulp.task('watch', function() {

    gulp.watch(paths.html, ['HTML']);
    gulp.watch(paths.css, ['css']);
    gulp.watch(paths.js, ['JS']);   
    gulp.watch(paths.img, ['images']);

});

gulp.task('default', ['watch', 'JS', 'HTML', 'images', 'css']);
