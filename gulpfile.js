const gulp = require("gulp");
const ghPages = require("gulp-gh-pages");

const ghOpts = {
    origin : "origin",
    branch : "gh-pages"
 };

gulp.task('gh-pages', function()
          {
    return gulp.src("./**/*").pipe(ghPages(ghOpts)); 
});


//gulp.task('watch', ["gh-pages"], function()
//{
//    gulp.watch("./**/*", "gh-pages");
//});
          

gulp.task("default", ["gh-pages"]);