let gulp = require("gulp");
let ts = require("gulp-typescript");
const sourcemaps = require('gulp-sourcemaps');
let tsProject = ts.createProject("tsconfig.json");


gulp.task("default", () => {
    let tsResult = tsProject
        .src()
        .pipe(sourcemaps.init())
        .pipe(tsProject());

    return tsResult.js
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest("dist"));
});