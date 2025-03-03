const { src, dest, watch, series, parallel } = require("gulp");
const del = require("del");
const mode = require("gulp-mode")({
  modes: ["production", "development"],
  default: "development",
  verbose: false,
});
const sass = require("gulp-dart-sass");
const plumber = require("gulp-plumber");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const gcmq = require("gulp-group-css-media-queries");
const cleanCSS = require("gulp-clean-css");
const rename = require("gulp-rename");


const browserSync = require("browser-sync");

const babel = require("gulp-babel");

const srcPath = "./src/";
const distPath = "./wp-content/themes/cigr-cosmostyle-theme/";

const source = {
  html: srcPath + "*.php",
  css: srcPath + "scss/**/*.scss",
  img: srcPath + "img/**/*",
  js: srcPath + "js/**/*.js",
  lib: srcPath + "lib/**/*",
  php: srcPath + "php/**/*",
  fontSvg: srcPath + "font-svg/**/*",
  pdf: srcPath + "pdf/**/*",
  video: srcPath + "video/**/*",
};
const dist = {
  html: distPath,
  css: distPath + "css/",
  img: distPath + "img/",
  js: distPath + "js/",
  lib: distPath + "lib/",
  php: distPath + "",
  fontSvg: distPath + "font-svg/",
  pdf: distPath + "pdf/",
  video: distPath + "video/",
};

const clean = () => {
  return del(distPath + "**");
};

const compileSass = () => {
  return src(srcPath + "scss/style.scss", {
    sourcemaps: true,
  })
    .pipe(plumber())
    .pipe(sass())
    .pipe(
      postcss([
        autoprefixer({
          // プロパティのインデントを整形しない
          cascade: false,
        }),
      ])
    )
    .pipe(gcmq())
    .pipe(mode.production(cleanCSS()))
    .pipe(mode.production(rename({ extname: ".min.css" })))
    .pipe(dest(dist.css));
};


const jsBabel = () => {
  return src(source.js)
    .pipe(plumber())
    .pipe(
      babel({
        presets: ["@babel/preset-env"],
      })
    )
    .pipe(dest(dist.js));
};


const copyLibrary = () => {
  return src(source.lib).pipe(dest(dist.lib));
};

const copyPHP = () => {
  return src(source.php).pipe(dest(dist.php));
};

const copyFontSvg = () => {
  return src(source.fontSvg).pipe(dest(dist.fontSvg));
};



const copyImages = () => {
  return src(source.img).pipe(dest(dist.img));
};

const browserSyncFunc = (done) => {
  browserSync.init({
    port: 3000,
    open: true,
    notify: false,
    reloadOnRestart: true,
    files: [srcPath + "**/*"],
    proxy: "http://localhost:3010",
  });
  done();
};

// ブラウザ自動リロード
const browserReloadFunc = (done) => {
  browserSync.reload();
  done();
};

const watchFile = () => {
  watch(source.css, series(compileSass, browserReloadFunc));
  watch(source.js, series(jsBabel, browserReloadFunc));
  watch(source.lib, series(copyLibrary, browserReloadFunc));
  watch(source.php, series(copyPHP, browserReloadFunc));
  watch(source.fontSvg, series(copyFontSvg, browserReloadFunc));
  watch(source.img, series(copyImages, browserReloadFunc));
};

exports.default = series(
  clean,
  compileSass,
  jsBabel,
  copyLibrary,
  copyPHP,
  copyFontSvg,
  copyImages,
  parallel(watchFile, browserSyncFunc)
);

exports.build = series(
  clean,
  compileSass,
  jsBabel,
  copyLibrary,
  copyPHP,
  copyFontSvg,
  copyImages
);
