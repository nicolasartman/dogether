// var es = require('event-stream');
// var babel = require('gulp-babel');
// var gutil = require('gulp-util');
// var sourcemaps = require('gulp-sourcemaps');
// var buffer = require('vinyl-buffer');
// var _ = require('lodash');
// var gulpif = require('gulp-if');
// var browserSync = require('browser-sync');
// var inject = require('gulp-inject');

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

var src = {};

var source = require('vinyl-source-stream');
var watchify = require('watchify');
var browserify = require('browserify');
var reactify = require('reactify');
var runSequence = require('run-sequence');
var del = require('del');
var concat = require('gulp-concat');
var babelify = require('babelify');
var argv = require('minimist')(process.argv.slice(2));
var connect = require('gulp-connect');
var gulpOpen = require('gulp-open');

var RELEASE = !!argv.release;






// this function exists to abstract away this functionality
// so both browserify and browserify-watch can use it
function bundleJS(watch) {
	var bundler = browserify({
		entries: ['./src/app.js'], // Just our entry point
		transform: [reactify], // We want to convert JSX to normal javascript
		debug: true, // give us sourcemapping
		cache: {}, packageCache: {}, fullPaths: true // Requirement of watchify
	});


	if (watch) {
		var watcher = watchify(bundler);

		watcher.transform(babelify);

		return watcher
			.on('update', function() {
				var updateStart = Date.now();
				console.log('Let\'s update!');
				var newBundle = watcher.bundle();

				newBundle
					.pipe(source('app.js'))
					.pipe(gulp.dest('./build/'));
				console.log('Updated in ' + (Date.now() - updateStart) + 'ms');
				// rebundle(bundler);
			})
			.bundle() // create the initial bundle when starting the task
			.pipe(source('app.js'))
			.pipe(gulp.dest('./build/'))
			.pipe(connect.reload());

	} else {
		bundler.transform(babelify);
	}



	// else {
	//   bundler
	//    .bundle()
	//    .pipe(source('app.js'))
	//    .pipe(gulp.dest('./build/'));
	// }
	// function rebundle(bundler) {
	//  bundler.transform(babelify);
	//  console.log('ohai');
	//   return bundler.bundle()
	//     .on('error', function(e) {
	//       gutil.log('Browserify Error', e);
	//     })
	//     .pipe(source('app.js'))
	//     .pipe(buffer())
	//     .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
	//     .pipe(sourcemaps.write()) // writes .map file
	//     .pipe(gulp.dest('.tmp/app'))
	//     // .pipe(gulpif(watch, browserSync.reload({
	//       // stream: true,
	//       // once: true
	//     // })));
	// }

	// return rebundle(bro);
}


gulp.task('browserify', function() {
	bundleJS(false);
});

gulp.task('browserify-watch', function() {
	bundleJS(true);
});

// Host static files and automatically
// livereload them when they change
gulp.task('connect', function() {
	connect.server({
		root: 'build',
		port: 9090,
		livereload: true
	});
});




// Clean build and temp directories
gulp.task('clean', del.bind(
	null, ['.tmp', 'build/*', '!build/.git'], {dot: true}
));


gulp.task('scripts', function(){
	var src = gulp.src('src/**/*.js');
	return src
		.pipe(gulp.dest('build'))
		.pipe(connect.reload());
});



gulp.task('index', function() {
	var target = gulp.src('src/index.html');

	return target
		.pipe(gulp.dest('build'))
		.pipe(connect.reload());
});



// copy libs/*
gulp.task('libs', function() {
	var sources = [
		'src/libs/**'
	];

	return gulp.src(sources)
		.pipe($.changed('build')) // only changed files
		.pipe(gulp.dest('build/libs')) // pipe them to our destination
		.pipe($.size({title: 'libs'}))
		.pipe(connect.reload()); // display sizes
});



// copy components/*
gulp.task('components', function() {
	var sources = [
		'src/components/**'
	];

	return gulp.src(sources)
		.pipe($.changed('build')) // only changed files
		.pipe(gulp.dest('build/components')) // pipe them to our destination
		.pipe($.size({title: 'components'})) // display sizes
		.pipe(connect.reload());
});


// copy bower components into /libs/bower_components
gulp.task('bower', function() {
	var sources = [
		'bower_components/**'
	];

	return gulp.src(sources)
		.pipe($.changed('build')) // only changed files
		.pipe(gulp.dest('build/libs/bower_components')) // pipe them to our destination
		.pipe($.size({title: 'bower'})) // display sizes
		.pipe(connect.reload());
});


// copy static assets
gulp.task('assets', function() {
	var sources = [
		'src/assets/**'
	];

	return gulp.src(sources)
		.pipe($.changed('build')) // only changed files
		.pipe(gulp.dest('build/assets')) // pipe them to our destination
		.pipe($.size({title: 'assets'})) // display sizes
		.pipe(connect.reload());
});


// SCSS and CSS
gulp.task('css', function() {
	return gulp.src('src/**/*.{css,scss}')
		.pipe($.plumber())
		.pipe($.sass({
			sourceMap: !RELEASE,
			sourceMapBasepath: __dirname
		}))
		.on('error', console.error.bind(console))
		// .pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
		// .pipe($.csscomb())
		// .pipe($.if(RELEASE, $.minifyCss()))
		.pipe(concat('main.css'))
		.pipe(gulp.dest('build/css'))
		.pipe($.size({title: 'styles'}))
		.pipe(connect.reload());
});

// Open the app in a browser
gulp.task('open', function () {
	var options = {
		url: 'http://localhost:9090/'
	};

	return gulp.src('./build/index.html')
		.pipe(gulpOpen('', options));
});


gulp.task('default', function () {
	return gulp.start('serve');
});

gulp.task('serve', ['build-watch', 'connect'], function () {
	runSequence(['open']);
});


gulp.task('build-watch', ['clean'], function(cb) {
	runSequence(['browserify-watch', 'css', 'assets', 'libs', 'bower', 'components', 'index'], cb);
	gulp.watch('src/**/*.{css,scss}', ['css']);
	// gulp.watch('src/assets/**', ['assets']);
	// gulp.watch('bower_components/**', ['bower']);
	// gulp.watch('src/libs/**', ['libs']);
	// gulp.watch('src/components/**', ['components']);
	gulp.watch('src/index.html', ['index']);
});

gulp.task('build', ['clean'], function(cb) {
	runSequence(['browserify', 'css', 'assets', 'libs', 'bower', 'components', 'index'], cb);
});

