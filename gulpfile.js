const gulp = require("gulp");
const concat = require("gulp-concat");
const replace = require("gulp-replace");
const pkg = require("./package.json");

gulp.task("bundle-player", function () {
  return (
    gulp
      .src("./build/static/js/*.js")
      .pipe(concat("wsplayer.js"))
      //.pipe(gulp.dest(`./player-dist/player/wsplayer/${pkg.version}/`));
      .pipe(gulp.dest(`./player-dist/player/wsplayer`))
  );
});

gulp.task("bucket-preview-html", function () {
  return (
    gulp
      .src("./player-static/bucket-preview/index.html")
      //.pipe(replace("{$VERSION}", pkg.version))
      .pipe(gulp.dest(`./player-dist/player/bucket-preview`))
  );
});
gulp.task("bucket-debug-html", function () {
  return (
    gulp
      .src("./player-static/bucket-preview/debug.html")
      //.pipe(replace("{$VERSION}", pkg.version))
      //.pipe(gulp.dest(`./player-dist/player/bucket-preview/${pkg.version}`))
      .pipe(gulp.dest(`./player-dist/player/bucket-preview`))
  );
});

gulp.task(
  "default",
  gulp.series("bundle-player", "bucket-preview-html", "bucket-debug-html")
);
