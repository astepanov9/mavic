const { src, dest, watch, parallel, series } = require('gulp');

const scss  = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');

function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'app/'
        }
    });
}

function cleanDist() {
    return del('dist')
}

function images() {
    return src('app/images/**/*')
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.mozjpeg({ quality: 75, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ]))
        .pipe(dest('dist/images'))
}

function scripts() {
    return src([
        'app/js/main.js'
    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())  
        .pipe(dest('app/js'))
        .pipe(browserSync.stream())
}

function libsScripts() {
    return src([
        'node_modules/jquery/dist/jquery.js',
        'node_modules/slick-slider/slick/slick.js',
        'node_modules/fullpage.js/dist/fullpage.js',
        'node_modules/fullpage.js/dist/fullpage.extensions.min.js'
    ])
        .pipe(concat('libs.min.js'))
        .pipe(uglify())  
        .pipe(dest('app/js'))
        .pipe(browserSync.stream())
}

function libsStyles() {
    return src([
        'node_modules/slick-slider/slick/slick.css',
        'node_modules/slick-slider/slick/slick-theme.css',
        'node_modules/fullpage.js/dist/fullpage.css'
    ])
        .pipe(concat('_libs.scss'))
        .pipe(dest('app/scss'))
        .pipe(browserSync.stream())
}

function styles() {
    return src('app/scss/style.scss')
        .pipe(scss({outputStyle: 'compressed'}))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}

function build() {
    return src([
        'app/css/**/*',
        'app/fonts/**/*',
        'app/js/**/*',
        'app/*.html'
    ], {base: 'app'})
        .pipe(dest('dist'))
}

function watching() {
    watch(['app/scss/**/*.scss'], styles)
    watch(['app/js/**/*.js','!app/js/main.min.js'], scripts)
    watch(['app/*.html']).on('change', browserSync.reload);
}

exports.styles = styles;
exports.libsStyles= libsStyles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.libsScripts = libsScripts;
exports.images = images;
exports.cleanDist = cleanDist;

exports.build = series(cleanDist, images, build);
exports.default = parallel(styles ,scripts, browsersync, watching);