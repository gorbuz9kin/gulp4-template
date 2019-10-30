/* BASE */
const gulp = require('gulp');
const watch = require('gulp-watch');

/* HTML */
const htmlmin = require('gulp-htmlmin');

/* CSS */
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const notify = require("gulp-notify");

/* Plugin for JS*/
const concat = require('gulp-concat');
const minify = require('gulp-minify');

/* Plugin for webserver*/
const browserSync = require("browser-sync");
const reload = browserSync.reload;

/* Plugin for Images */
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');

/* HELPERS*/
const newer = require('gulp-newer'); /*  Plugin look for new changes in files */
const clean = require('gulp-clean'); /* Plugin delete some folder, content */

/* Task Clean (delete folder [build/]) */
function cleanFolder() {
  return gulp.src('./build', { read: false })
    .pipe(clean());
};

/*Task for webserver*/
function webserver(done) {
  browserSync.init({
    server: {
      baseDir: "./build"
    },
    tunnel: false,
    host: 'localhost',
    port: 9000,
    logPrefix: "denys.horobzieiev"
  };);
  done();
};

// BrowserSync Reload (callback)
function browserSyncReload(done) {
  browserSync.reload();
  done();
}

// Task for HTML
function html() {
  return gulp
    .src('./src/index.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('./build'))
    .pipe(reload({ stream: true }));
};

/*Task for CSS*/
function styles() {
  gulp.src('./src/css/main.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' })
      .on('error', function (err) {
        return notify().write(err);
      }))
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./build/css'))
    .pipe(reload({ stream: true }));
};

/*Task for JS*/
function scripts() {
  return gulp.src([
    // './node_modules/jquery/dist/jquery.js',
    // './node_modules/slick-carousel/slick/slick.js',
    './src/js/**/*.js'
  ])
    .pipe(concat('main.js'))
    .pipe(minify({
      ext: {
        min: '.js'
      },
      compress: true,
      noSource: true,
    }))
    .pipe(gulp.dest('./build/js'))
    .pipe(reload({ stream: true }));
};

/*Task for Images*/
function images() {
  return gulp.src('./src/img/**/*.*')
    .pipe(newer('./build/img/'))
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      use: [pngquant()],
      interlaced: true
    }))
    .pipe(gulp.dest('./build/img/'))
    .pipe(reload({ stream: true }));
};

/* Task for Fonts */
function fonts() {
  return gulp.src('./src/fonts/**/*.*')
    .pipe(newer('./build/fonts/'))
    .pipe(gulp.dest('./build/fonts/'))
    .pipe(reload({ stream: true }));
};

/* Task Watch */
function watchChanges() {
  gulp.watch('./src/*.html', html);
  gulp.watch('./src/css/**/*.scss', styles);
  gulp.watch('./src/js/**/*.js', scripts);
  gulp.watch('./src/img/**/*.*', images);
  gulp.watch('./src/fonts/**/*.*', fonts);
};

/* Task Build */
function build(done) {
  return gulp.series(
    gulp.parallel(html, styles, scripts, images, fonts),
    // webserver,
    // watchChanges
  )(done);
};

exports.cleanFolder = cleanFolder;
exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.fonts = fonts;
exports.watchChanges = watchChanges;
exports.build = build;

/* default task */
exports.default = build;
