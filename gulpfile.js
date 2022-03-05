const gulp        = require('gulp');
const fileinclude = require('gulp-file-include');
const server = require('browser-sync').create();
const { watch, series } = require('gulp');
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
var concat = require('gulp-concat');

const paths = {
  scripts: {
    src: './src/',
    dest: './build/'
  },
  scss: {
    src: './src/assets/scss/**/*.scss'
  },
  js: {
    dest_dir: './assets/js'
  },
  css: {
    dest_dir: './assets/css'
  },
};

// Reload Server
async function reload() {
  server.reload();
}

// Sass compiler
async function compileScss() {
  gulp.src(paths.scss.src)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./assets/css'));
}

// JS vendor compiler
async function compileVendorJS() {
  gulp.src('./src/assets/js/vendor.js')
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest(paths.js.dest_dir));
}
async function compileJS() {
  gulp.src('./src/assets/js/index.js')
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest(paths.js.dest_dir));
}

// Copy assets after build
async function copyAssets() {
  gulp.src(['assets/**/*'])
    .pipe(gulp.dest(paths.scripts.dest));
}

// Build files html and reload server
async function buildAndReload() {
  await includeHTML();
  await copyAssets();
  reload();
}

async function includeHTML(){
  return gulp.src([
    './src/pages/*.html',
    './src/pages/**/*.html',
    '!./src/components/**/*.html', // ignore
    ])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest(paths.scripts.dest));
}
exports.includeHTML = includeHTML;

exports.default = async function() {
  // Init serve files from the build folder
  server.init({
    server: {
      baseDir: paths.scripts.dest
    }
  });
  // Build and reload at the first time
  buildAndReload();
  // Watch Sass task
  watch(paths.scss.src,  series(compileScss));
  // Watch js task
  watch('./src/assets/js/vendor.js',  series(compileVendorJS));
  watch(['./src/assets/js/index.js'],  series(compileJS));
  // Watch task
  watch(["*.html","assets/**/*"], series(buildAndReload));
};