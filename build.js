#!/usr/bin/env node
import { Platform as _Platform, build } from 'electron-builder';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const Platform = _Platform;

// Set your target platform here.
// You can also alternatively use an env var or CLI argument to choose platform.
const platform = 'WINDOWS';
// const platform = 'LINUX';
// const platform = 'MAC';

/**
 * @type {import('electron-builder').CompressionLevel}
 */
const compression = 'maximum'; // set to 'maximum' for production builds

console.time(`build (${compression} compression-level)`);

/**
 * Programmatically ensure that dependencies are installed in the packaged directory.
 * We assume that ./.dist has been populated with package.json, pnpm-lock.yaml, and other needed resources.
 */
const distDir = path.resolve('.dist');
const nodeModulesDir = path.join(distDir, 'node_modules');

if (!fs.existsSync(nodeModulesDir)) {
	console.log('node_modules missing in .dist. Installing dependencies in .dist via pnpm...');
	try {
		// Runs: pnpm install --prefix ./.dist
		execSync('pnpm install --prefix ./.dist', { stdio: 'inherit' });
	} catch (error) {
		console.error('Error installing dependencies in .dist:', error);
		process.exit(1);
	}
}

/**
 * @type {import('electron-builder').Configuration}
 */
const options = {
	appId: 'com.mindofthomas.taskmate',
	productName: 'TaskMate',
	compression,
	removePackageScripts: true,

	nodeGypRebuild: false,
	buildDependenciesFromSource: false,

	directories: {
		output: '.electron-dist',
		app: '.dist',
	},
	extraResources: ['.dist/frontend/**/*'],

	win: {
		artifactName: '${productName}-Setup-${version}.${ext}',
		target: [
			{
				target: 'nsis',
				arch: ['x64'],
			},
		],
	},
	nsis: {
		deleteAppDataOnUninstall: true,
	},
	mac: {
		category: 'public.app-category.utilities',
		hardenedRuntime: false,
		gatekeeperAssess: false,
		target: [
			{
				target: 'default',
				arch: ['x64', 'arm64'],
			},
		],
	},
	linux: {
		maintainer: 'parsehex',
		desktop: {
			StartupNotify: 'false',
			Encoding: 'UTF-8',
			MimeType: 'x-scheme-handler/deeplink',
		},
		target: ['AppImage'],
	},
};

build({
	targets: Platform[platform].createTarget(),
	config: options,
})
	.then((result) => {
		console.log('----------------------------');
		console.log(new Date().toLocaleString());
		console.log('Platform:', platform);
		console.log('Output:', JSON.stringify(result, null, 2));
		console.timeEnd(`build (${compression} compression-level)`);
	})
	.catch((err) => {
		console.error('Error during electron build:', err);
		process.exit(1);
	});
