import * as gulp from 'gulp';
import * as fs from 'fs';
import * as path from 'path';
import * as util from './util';
import * as es from 'event-stream';
import { createReporter } from './reporter';
import * as os from 'os';
import ts = require('typescript');



function getTypeScriptCompilerOptions(src: string): ts.CompilerOptions {
	const rootDir = path.join(__dirname, `../../${src}`);
	const options: ts.CompilerOptions = {};
	options.verbose = false;
	options.sourceMap = true;
	// if (process.env['VSCODE_NO_SOURCEMAP']) { // To be used by developers in a hurry
	// 	options.sourceMap = false;
	// }
	options.rootDir = rootDir;
	options.baseUrl = rootDir;
	options.sourceRoot = util.toFileUri(rootDir);
	options.newLine = /\r\n/.test(fs.readFileSync(__filename, 'utf8')) ? 0 : 1;
	return options;
}

const reporter = createReporter();

function createCompile(src: string, build: boolean, emitError: boolean, transpileOnly: boolean) {
	const tsb = require('./tsb') as typeof import('./tsb');
	const sourcemaps = require('gulp-sourcemaps') as typeof import('gulp-sourcemaps');


	const projectPath = path.join(__dirname, '../../', src, 'tsconfig.json');
	const overrideOptions = { ...getTypeScriptCompilerOptions(src), inlineSources: Boolean(build) };
	if (!build) {
		overrideOptions.inlineSourceMap = true;
	}

	const compilation = tsb.create(projectPath, overrideOptions, { verbose: false, transpileOnly }, err => reporter(err));

	function pipeline(token?: util.ICancellationToken) {
		const bom = require('gulp-bom') as typeof import('gulp-bom');

		const utf8Filter = util.filter(data => /(\/|\\)test(\/|\\).*utf8/.test(data.path));
		const tsFilter = util.filter(data => /\.ts$/.test(data.path));
		const noDeclarationsFilter = util.filter(data => !(/\.d\.ts$/.test(data.path)));

		const input = es.through();
		const output = input
			.pipe(utf8Filter)
			.pipe(bom()) // this is required to preserve BOM in test files that loose it otherwise
			.pipe(utf8Filter.restore)
			.pipe(tsFilter)
			.pipe(util.loadSourcemaps())
			.pipe(compilation(token))
			.pipe(noDeclarationsFilter)
            .pipe(es.through())
			// .pipe(build ? nls.nls() : es.through())
			.pipe(noDeclarationsFilter.restore)
			.pipe(transpileOnly ? es.through() : sourcemaps.write('.', {
				addComment: false,
				includeContent: !!build,
				sourceRoot: overrideOptions.sourceRoot
			}))
			.pipe(tsFilter.restore)
			.pipe(reporter.end(!!emitError));

		return es.duplex(input, output);
	}
	pipeline.tsProjectSrc = () => {
		return compilation.src({ base: src });
	};
	return pipeline;
}


export function compileTask(src: string, out: string, build: boolean): () => NodeJS.ReadWriteStream {

	return function () {

		if (os.totalmem() < 4_000_000_000) {
			throw new Error('compilation requires 4GB of RAM');
		}

		const compile = createCompile(src, build, true, false);
		const srcPipe = gulp.src(`${src}/**`, { base: `${src}` });
		// const generator = new MonacoGenerator(false);
		// if (src === 'src') {
		// 	generator.execute();
		// }

		return srcPipe
			// .pipe(generator.stream)
			.pipe(compile())
			.pipe(gulp.dest(out));
	};
}