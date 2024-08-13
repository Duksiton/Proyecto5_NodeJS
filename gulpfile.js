const gulp = require('gulp');
const less = require('gulp-less');
const sync = require('browser-sync').create();
const concat = require('gulp-concat');
const del = require('del');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const cache = require('gulp-cache');
const autoprefixer = require('autoprefixer');
const postcss = require('gulp-postcss');
const csso = require('gulp-csso');
const pug = require('gulp-pug');
const jsmin = require('gulp-jsmin');
const ghPages = require('gulp-gh-pages');
const include = require('gulp-include');

// HTML
gulp.task('html', function() {
  return gulp.src('src/templates/pages/**/*.pug')
    .pipe(pug({ basedir: 'src/templates' }))
    .pipe(gulp.dest('dest'))
    .pipe(sync.reload({ stream: true }));
});

// Styles
gulp.task('styles', function() {
  return gulp.src(['src/styles/**/*.less', '!src/styles/**/_*.less'])
    .pipe(less({ relativeUrls: true }))
    .pipe(concat('style.css'))
    .pipe(postcss([autoprefixer({ overrideBrowserslist: 'last 2 versions' })]))
    .pipe(csso())
    .pipe(gulp.dest('dest/styles'))
    .pipe(sync.reload({ stream: true }));
});

// Scripts
gulp.task('scripts', function() {
  return gulp.src('src/scripts/*.js')
    .pipe(include({ extensions: 'js', hardFail: true, includePaths: [__dirname + '/node_modules', __dirname + '/src/js'] }))
    .pipe(jsmin())
    .pipe(gulp.dest('dest/scripts'))
    .pipe(sync.reload({ stream: true }));
});

// Images
gulp.task('images', function() {
  return gulp.src('src/images/**/*')
    .pipe(cache(imagemin({ interlaced: true, progressive: true, svgoPlugins: [{ removeViewBox: false }], use: [pngquant()] })))
    .pipe(gulp.dest('dest/images'));
});

// Copy
gulp.task('copy', function() {
  return gulp.src(['src/*', 'src/fonts/*', '!src/images/*', '!src/styles/*', '!src/scripts/*'], { base: 'src' })
    .pipe(gulp.dest('dest'))
    .pipe(sync.reload({ stream: true }));
});

// Server
gulp.task('server', function() {
  sync.init({
    notify: false,
    server: { baseDir: 'dest' },
    ghostMode: false // Desactivar la sincronización del navegador entre múltiples pestañas
  });
});

// Clean
gulp.task('clean', function() {
  return del('dest');
});

// Clear Cache
gulp.task('clear', function() {
  return cache.clearAll();
});

// Watch
gulp.task('watch', function() {
  gulp.watch('src/templates/**/*.pug', gulp.series('html'));
  gulp.watch('src/styles/**/*.less', gulp.series('styles'));
  gulp.watch('src/scripts/*.js', gulp.series('scripts'));
  gulp.watch(['src/*', 'src/fonts/*', '!src/images/*', '!src/styles/*', '!src/scripts/*'], gulp.series('copy'));
});

// Build
gulp.task('build', gulp.series('clean', gulp.parallel('html', 'styles', 'scripts', 'images', 'copy')));

// Deploy
gulp.task('deploy', function () {
  return gulp.src('./dest/**/*')
    .pipe(ghPages());
});

// Default
gulp.task('default', gulp.series('build', gulp.parallel('watch', 'server')));
