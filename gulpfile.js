/**
 * Created by sonste on 03.10.2015.
 */
var gulp = require('gulp');
var mocha = require('gulp-mocha');
var gutil = require('gulp-util');
var babel = require('babel-core/register');
var bower = require('gulp-bower');
var runSequence = require('run-sequence');
var crisper = require('gulp-crisper');
var del = require('del');

gulp.task('clean',function(callback){
    runSequence('clean-popup',callback);
});

gulp.task('build', function(callback) {
    runSequence('bower-popup',
        ['cspify-popup-components','cspify-option-components'], // <- in parallel
        'mocha_unit',
        'mocha_integration',
        callback);
});

gulp.task('bower-popup',function(){
    return bower({ cwd: './src/js/popup' })
});

gulp.task('cspify-popup-components',function(){
    gulp.src('./src/js/popup/bower_components/**/*.html')
        .pipe(crisper({
            scriptInHead: false
        }))
        .pipe(gulp.dest('./src/js/popup/bower_components'));
});

gulp.task('cspify-option-components',function(){
    gulp.src('./src/js/option/bower_components/**/*.html')
        .pipe(crisper({
            scriptInHead: false
        }))
        .pipe(gulp.dest('./src/js/popup/bower_components'));
});



gulp.task('clean-popup',function(){
    return del('./src/js/popup/bower_components',{force:true});
});


gulp.task('mocha_unit', function() {
    return gulp.src(['test/unit/**/*.js'], { read: false })
        .pipe(mocha({ reporter: 'list'}))
        .on('error', gutil.log);
});


gulp.task('mocha_specific', function() {
    return gulp.src(['test/unit/movie_information/*.js'], { read: false })
        .pipe(mocha({ reporter: 'list'}))
        .on('error', gutil.log);
});


gulp.task('mocha_integration', function() {
    return gulp.src(['test/integration/**/*.js'], { read: false })
        .pipe(mocha({ reporter: 'list'}))
        .on('error', gutil.log);
});

gulp.task('watch-mocha', function() {
    gulp.watch(['src/js/**', 'src/test/**'], ['mocha']);
});