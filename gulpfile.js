const gulp = require("gulp");
const ghPages = require("gulp-gh-pages");

const ghOpts = {
    origin : "origin",
    branch : "gh-pages"
 };

gulp.task('gh-pages', function() {
    return gulp.src(["./**/*", "!./.git/**/*", "!./node_modules", "!./gulpfile.js"])
        .pipe(ghPages(ghOpts)); 
});


gulp.task('watch', ["gh-pages"], function() {
    gulp.watch([
	"./**/*", 
	"!./.git/**/*", 
	"!./.publish/**/*", 
	"!_DS_Store", 
	"!./node_modules", 
	"!./gulpfile.js"
    ], ["gh-pages"]);
});
          

gulp.task("default", ["watch"]);
