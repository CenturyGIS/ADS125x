/* eslint-disable import/no-extraneous-dependencies */

import gulp from 'gulp';
import babel from 'gulp-babel';
import del from 'del';
import { exec } from 'child_process';
import mocha from 'gulp-mocha';
import eslint from 'gulp-eslint';

const paths = {
  allSrcJs: 'src/**/*.js',
  allLibTests: 'lib/test/**/*.js',
  gulpFile: 'gulpfile.babel.js',
  libDir: 'lib',
};

gulp.task('lint', () =>
  gulp.src([
    paths.allSrcJs,
    paths.gulpFile,
  ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError()));

gulp.task('clean', () => del(paths.libDir));

gulp.task('build', ['lint', 'clean'], () =>
  gulp.src(paths.allSrcJs)
    .pipe(babel())
    .pipe(gulp.dest(paths.libDir)));

gulp.task('test', ['build'], () =>
  gulp.src(paths.allLibTests)
    .pipe(mocha()));

gulp.task('main', ['build'], callback =>
  exec(`node ${paths.libDir}`, error => callback(error)));

gulp.task('watch', () => {
  gulp.watch(paths.allSrcJs, ['lint']);
});

gulp.task('default', ['watch', 'main']);
