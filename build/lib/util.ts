import * as _rimraf from 'rimraf';
import * as path from 'path';
import * as fs from 'fs';
import * as es from 'event-stream';
import { ThroughStream } from 'through';
import * as VinylFile from 'vinyl';
import * as sm from 'source-map';


export interface ICancellationToken {
	isCancellationRequested(): boolean;
}

export interface FilterStream extends NodeJS.ReadWriteStream {
	restore: ThroughStream;
}

export function filter(fn: (data: any) => boolean): FilterStream {
	const result = <FilterStream><any>es.through(function (data) {
		if (fn(data)) {
			this.emit('data', data);
		} else {
			result.restore.push(data);
		}
	});

	result.restore = es.through();
	return result;
}


export function toFileUri(filePath: string): string {
	const match = filePath.match(/^([a-z])\:(.*)$/i);

	if (match) {
		filePath = '/' + match[1].toUpperCase() + ':' + match[2];
	}

	return 'file://' + filePath.replace(/\\/g, '/');
}



export function rimraf(dir: string): () => Promise<void> {
	const result = () => new Promise<void>((c, e) => {
		let retries = 0;

		const retry = () => {
			_rimraf(dir, { maxBusyTries: 1 }, (err: any) => {
				if (!err) {
					return c();
				}

				if (err.code === 'ENOTEMPTY' && ++retries < 5) {
					return setTimeout(() => retry(), 10);
				}

				return e(err);
			});
		};

		retry();
	});

	result.taskName = `clean-${path.basename(dir).toLowerCase()}`;
	return result;
}


export function acquireWebNodePaths() {
	const root = path.join(__dirname, '..', '..');
	const webPackageJSON = path.join(root, '/remote/web', 'package.json');
	const webPackages = JSON.parse(fs.readFileSync(webPackageJSON, 'utf8')).dependencies;
	const nodePaths: { [key: string]: string } = {};
	for (const key of Object.keys(webPackages)) {
		const packageJSON = path.join(root, 'node_modules', key, 'package.json');
		const packageData = JSON.parse(fs.readFileSync(packageJSON, 'utf8'));
		let entryPoint: string = packageData.browser ?? packageData.main;

		// On rare cases a package doesn't have an entrypoint so we assume it has a dist folder with a min.js
		if (!entryPoint) {
			// TODO @lramos15 remove this when jschardet adds an entrypoint so we can warn on all packages w/out entrypoint
			if (key !== 'jschardet') {
				console.warn(`No entry point for ${key} assuming dist/${key}.min.js`);
			}

			entryPoint = `dist/${key}.min.js`;
		}

		// Remove any starting path information so it's all relative info
		if (entryPoint.startsWith('./')) {
			entryPoint = entryPoint.substring(2);
		} else if (entryPoint.startsWith('/')) {
			entryPoint = entryPoint.substring(1);
		}

		// Search for a minified entrypoint as well
		if (/(?<!\.min)\.js$/i.test(entryPoint)) {
			const minEntryPoint = entryPoint.replace(/\.js$/i, '.min.js');

			if (fs.existsSync(path.join(root, 'node_modules', key, minEntryPoint))) {
				entryPoint = minEntryPoint;
			}
		}

		nodePaths[key] = entryPoint;
	}

	// @TODO lramos15 can we make this dynamic like the rest of the node paths
	// Add these paths as well for 1DS SDK dependencies.
	// Not sure why given the 1DS entrypoint then requires these modules
	// they are not fetched from the right location and instead are fetched from out/
	// nodePaths['@microsoft/dynamicproto-js'] = 'lib/dist/umd/dynamicproto-js.min.js';
	// nodePaths['@microsoft/applicationinsights-shims'] = 'dist/umd/applicationinsights-shims.min.js';
	// nodePaths['@microsoft/applicationinsights-core-js'] = 'browser/applicationinsights-core-js.min.js';
	return nodePaths;
}



export function buildWebNodePaths(outDir: string) {
	const result = () => new Promise<void>((resolve, _) => {
		const root = path.join(__dirname, '..', '..');
		const nodePaths = acquireWebNodePaths();
		// Now we write the node paths to out/vs
		const outDirectory = path.join(root, outDir, 'vs');
		fs.mkdirSync(outDirectory, { recursive: true });
		const headerWithGeneratedFileWarning = `/*---------------------------------------------------------------------------------------------
	 *  Copyright (c) Microsoft Corporation. All rights reserved.
	 *  Licensed under the MIT License. See License.txt in the project root for license information.
	 *--------------------------------------------------------------------------------------------*/

	// This file is generated by build/npm/postinstall.js. Do not edit.`;
		const fileContents = `${headerWithGeneratedFileWarning}\nself.webPackagePaths = ${JSON.stringify(nodePaths, null, 2)};`;
		fs.writeFileSync(path.join(outDirectory, 'webPackagePaths.js'), fileContents, 'utf8');
		resolve();
	});
	result.taskName = 'build-web-node-paths';
	return result;
}

declare class FileSourceMap extends VinylFile {
	public sourceMap: sm.RawSourceMap;
}

export function loadSourcemaps(): NodeJS.ReadWriteStream {
	const input = es.through();

	const output = input
		.pipe(es.map<FileSourceMap, FileSourceMap | undefined>((f, cb): FileSourceMap | undefined => {
			if (f.sourceMap) {
				cb(undefined, f);
				return;
			}

			if (!f.contents) {
				cb(undefined, f);
				return;
			}

			const contents = (<Buffer>f.contents).toString('utf8');

			const reg = /\/\/# sourceMappingURL=(.*)$/g;
			let lastMatch: RegExpExecArray | null = null;
			let match: RegExpExecArray | null = null;

			while (match = reg.exec(contents)) {
				lastMatch = match;
			}

			if (!lastMatch) {
				f.sourceMap = {
					version: '3',
					names: [],
					mappings: '',
					sources: [f.relative],
					sourcesContent: [contents]
				};

				cb(undefined, f);
				return;
			}

			f.contents = Buffer.from(contents.replace(/\/\/# sourceMappingURL=(.*)$/g, ''), 'utf8');

			fs.readFile(path.join(path.dirname(f.path), lastMatch[1]), 'utf8', (err, contents) => {
				if (err) { return cb(err); }

				f.sourceMap = JSON.parse(contents);
				cb(undefined, f);
			});
		}));

	return es.duplex(input, output);
}