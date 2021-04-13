const { src, dest, watch, parallel, series } = require('gulp');
const scss = require('gulp-sass');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');

function browsersync() {
  browserSync.init({
    server: {
      baseDir: 'app/',
    },
  });
}

function cleanDist() {
  return del('dist');
}

function images() {
  return src('app/img/**/*')
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ]),
    )
    .pipe(dest('dist/img'));
}

function scripts() {
  return (
    src(['app/js/main.js'])
      // .pipe(concat('main.min.js'))
      // .pipe(uglify())
      // .pipe(dest('app/js'))
      .pipe(browserSync.stream())
  );
}
function jsLibs(cb) {
  const libs = [
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/bootstrap/dist/js/bootstrap.min.js',
    'node_modules/aos/dist/aos.js',
    'node_modules/swiper/swiper-bundle.js',
    'node_modules/jquery-sticky/jquery.sticky.js',
    'node_modules/jquery-easing/dist/jquery.easing.1.3.umd.min.js',
    'node_modules/typeit/dist/typeit.min.js',
  ];

  if (!libs.length) return cb();

  return src(libs).pipe(concat('libs.min.js')).pipe(uglify()).pipe(dest('app/js'));
}

function styles() {
  return src('app/scss/style.scss')
    .pipe(scss({ outputStyle: 'compressed' }))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ['last 10 version'],
        grid: true,
      }),
    )
    .pipe(dest('app/css'))
    .pipe(browserSync.stream());
}

function build() {
  return src(
    ['app/css/style.css', 'app/fonts/**/*', 'app/js/libs.min.js', 'app/js/main.js', 'app/*.html'],
    { base: 'app' },
  ).pipe(dest('dist'));
}

function watching() {
  watch(['app/scss/**/*.scss'], styles);
  watch(['app/js/**/*.js'], scripts);
  watch(['app/*.html']).on('change', browserSync.reload);
}

exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.jsLibs = jsLibs;
exports.images = images;
exports.cleanDist = cleanDist;

exports.build = series(cleanDist, images, build);
exports.default = parallel(styles, scripts, jsLibs, browsersync, watching);
