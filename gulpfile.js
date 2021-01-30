const gulp = require("gulp");
const sass = require("gulp-sass");
const uglify = require("gulp-uglify-es").default;
const cleanCss = require("gulp-clean-css");
const concat = require("gulp-concat");
const autoprefixer = require("gulp-autoprefixer");
const sourcemaps = require("gulp-sourcemaps");
const del = require("del");
const browserSync = require("browser-sync");
const webpackStream = require("webpack-stream");
const urlResolver = require("gulp-css-url-adjuster");

const webpackConfig = {
    mode: "development",
    output: {
        filename: "bundle.js"
    },
    resolve: {
        extensions: [
            ".js",
            ".ts"
        ],
    },
    devtool: "inline-source-map",
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: "ts-loader"
            }
        ]
    }
}
const urlResolverConfig = {
    replace: ["../", "assets/"]
}

function compileVendorScripts() {
    return gulp.src("./src/vendors/**/*.js")
        .pipe(uglify())
        .pipe(concat("vendors.js"))
        .pipe(gulp.dest("./dist"))
        .pipe(browserSync.stream())
}

function compileScripts() {
    return gulp.src("./src/index.ts")
        .pipe(sourcemaps.init())
        .pipe(webpackStream(webpackConfig))
        .pipe(concat("bundle.js"))
        .pipe(uglify())
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest("./dist"))
        .pipe(browserSync.stream())
}

function compileStyles() {
    return gulp.src("./src/index.scss", { base: "./src" })
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(cleanCss())
        .pipe(concat("style.css"))
        .pipe(urlResolver(urlResolverConfig))
        .pipe(gulp.dest("./dist/"))
        .pipe(browserSync.stream())
}

function copyHTMLs() {
    return gulp.src(["./src/index.html", "./src/pages/**/*.html"], {allowEmpty: true})
        .pipe(gulp.dest("./dist/"))
        .pipe(browserSync.stream());
}

function copyFonts() {
    return gulp.src("./src/assets/fonts/*")
        .pipe(gulp.dest("./dist/assets/fonts/"))
        .pipe(browserSync.stream());
}

function copyIcons() {
    return gulp.src("./src/assets/icons/*")
        .pipe(gulp.dest("./dist/assets/icons/"))
        .pipe(browserSync.stream());
}

function copyImages() {
    return gulp.src("./src/assets/images/*")
        .pipe(gulp.dest("./dist/assets/images/"))
        .pipe(browserSync.stream());
}

function copyFavicon() {
    return gulp.src("./src/favicon.ico", { allowEmpty: true })
        .pipe(gulp.dest("./dist/"));
}

function clearDistributive() {
    return del("./dist/*");
}

function watch() {
    browserSync.init({
        notify: false,
        port: 4200,
        server: {
            baseDir: "./dist/",
        },
        open: false
    });
    gulp.watch("./src/vendors/**/*.js", compileVendorScripts);
    gulp.watch("./src/scripts/**/*.ts", compileScripts);
    gulp.watch("./src/index.ts", compileScripts);
    gulp.watch("./src/index.scss", compileStyles);
    gulp.watch("./src/assets/styles/*", compileStyles);
    gulp.watch("./src/assets/fonts/*", copyFonts);
    gulp.watch("./src/assets/images/*", copyImages);
    gulp.watch("./src/assets/icons/*", copyIcons);
    gulp.watch("./src/**/*.html", copyHTMLs);
}

const buildTask = gulp.series(clearDistributive, gulp.parallel(compileVendorScripts, compileScripts, compileStyles, copyHTMLs, copyFonts, copyImages, copyIcons, copyFavicon));
const serveTask = gulp.series(buildTask, gulp.parallel(watch));

gulp.task("build", buildTask);
gulp.task("serve", serveTask);
