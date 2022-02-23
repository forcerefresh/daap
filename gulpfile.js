var gulp = require("gulp");
var concat = require("gulp-concat");
var count = require("gulp-count");
var replace = require("gulp-replace");

var package = require("./package.json");

gulp.task("bundle-player", function () {
  return gulp
    .src("./build/static/js/*.js")
    .pipe(concat("wsplayer.js"))
    .pipe(gulp.dest(`./dist/wsplayer/${package.version}/`));
});

gulp.task("bucket-preview-html", function () {
  return (
    gulp
      .src("./player-static/bucket-preview/index.html")
      .pipe(replace("{$VERSION}", package.version))
      //.pipe(concat("wsplayer.js"))
      .pipe(gulp.dest(`./dist/bucket-preview/${package.version}`))
  );
});
gulp.task("default", gulp.series("bundle-player", "bucket-preview-html"));
