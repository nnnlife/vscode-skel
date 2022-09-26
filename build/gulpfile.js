'use strict';

const gulp = require('gulp');
const util = require('./lib/util');
const { compileTask } = require('./lib/compilation');
const task = require('./lib/task');

const compileClientTask = task.define('compile-client', task.series(util.rimraf('out'), util.buildWebNodePaths('out'),compileTask('src', 'out', false)))
gulp.task(compileClientTask);

gulp.task('default', compileClientTask);
