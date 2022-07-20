const gulp = require("gulp");
const zip = require("gulp-zip");

var webpack = require("webpack-stream");

gulp.task("build-object", function () {
  return gulp
    .src("./index-player.ts")
    .pipe(webpack(require("./webpack.config.dist-player.js")))
    .pipe(gulp.dest("./dist"));
});

gulp.task("build-object-for-app", function () {
  return gulp
    .src("./index-app.ts")
    .pipe(webpack(require("./webpack.config.dist-app.js")))
    .pipe(gulp.dest("./dist"));
});

//var copy = require("gulp-copy");
gulp.task("copy-static", function () {
  return gulp.src("./static/**/*").pipe(gulp.dest("./dist"));
});

gulp.task("bundle", function () {
  return gulp
    .src("./dist/*")
    .pipe(zip("video-target.zip"))
    .pipe(gulp.dest("./dist/bundle"));
});

gulp.task(
  "default",
  gulp.series(["build-object", "build-object-for-app", "copy-static", "bundle"])
);
