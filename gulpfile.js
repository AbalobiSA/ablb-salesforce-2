let gulp = require("gulp");
const bump = require('gulp-bump');
let ts = require("gulp-typescript");
const sourcemaps = require('gulp-sourcemaps');
let tsProject = ts.createProject("tsconfig.json");


gulp.task("default", () => {
    let tsResult = tsProject
        .src()
        .pipe(sourcemaps.init())
        .pipe(tsProject());

    gulp.src('./package.json')
        .pipe(bump())
        .pipe(gulp.dest("./"));

    tsResult.js
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest("dist"));

    return
});