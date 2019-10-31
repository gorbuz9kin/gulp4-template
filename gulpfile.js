/* BASE */
const gulp = require('gulp');
const watch = require('gulp-watch');
const cp = require("child_process");

/* HTML */
const pug = require('gulp-pug');
const htmlmin = require('gulp-htmlmin');

/* CSS */
const sass = require('gulp-sass');
const autoprefixer = require('autoprefixer');
const plumber = require('gulp-plumber');
const cssnano = require("cssnano");
const postcss = require("gulp-postcss");

/* Plugin for JS*/
const concat = require('gulp-concat');
const minify = require('gulp-minify');
const babel = require('gulp-babel');

/* Plugin for webserver*/
const browserSync = require("browser-sync").create();

/* Plugin for Images */
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');

/* HELPERS*/
const newer = require('gulp-newer'); /*  Plugin look for new changes in files */
const del = require('del'); /* Plugin delete some folder, content */

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
  });
  done();
};

// BrowserSync Reload (callback)
function browserSyncReload(done) {
  browserSync.reload();
  done();
}

/* Task Clean (delete folder [build/]) */
function clean() {
  return del(["./build"]);
};

// Task for HTML
function html() {
  return gulp
    .src('./src/layout/*.pug')
    .pipe(plumber())
    .pipe(pug({ pretty: true }))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('./build'))
    .pipe(browserSync.stream());
};

/*Task for CSS*/
function styles() {
  return gulp
    .src('./src/css/main.scss')
    .pipe(plumber())
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(gulp.dest('./build/css'))
    .pipe(browserSync.stream());
};

/*Task for JS*/
function scripts() {
  return gulp.src([
    './node_modules/jquery/dist/jquery.js',
    './node_modules/slick-carousel/slick/slick.js',
    './src/js/**/*.js'
  ])
    .pipe(concat('main.js'))
    .pipe(babel({ presets: ['@babel/env'] }))
    .pipe(minify({
      ext: {
        min: '.js'
      },
      compress: true,
      noSource: true,
    }))
    .pipe(gulp.dest('./build/js'))
    .pipe(browserSync.stream());
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
    .pipe(browserSync.stream());
};

/* Task for Fonts */
function fonts() {
  return gulp.src('./src/fonts/**/*.*')
    .pipe(newer('./build/fonts/'))
    .pipe(gulp.dest('./build/fonts/'))
    .pipe(browserSync.stream());
};

// Jekyll
function jekyll() {
  return cp.spawn("bundle", ["exec", "jekyll", "build"], { stdio: "inherit" });
};

/* Task Watch */
function watchChanges() {
  gulp.watch('./src/layout/**/*.pug', html);
  gulp.watch('./src/css/**/*.scss', styles);
  gulp.watch('./src/js/**/*.js', scripts);
  gulp.watch('./src/img/**/*.*', images);
  gulp.watch('./src/fonts/**/*.*', fonts);
  gulp.watch(
    [
      "./_includes/**/*",
      "./_layouts/**/*",
      "./_pages/**/*",
      "./_posts/**/*",
      "./_projects/**/*"
    ],
    gulp.series(jekyll, browserSyncReload)
  );
};

/* Tasks */
const watchFiles = gulp.parallel(watchChanges, webserver);
const build = gulp.series(gulp.parallel(html, styles, scripts, images, fonts), watchFiles);

/* export tasks */
exports.clean = clean;
exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.fonts = fonts;
exports.watchFiles = watchFiles;
exports.build = build;
exports.default = build;
