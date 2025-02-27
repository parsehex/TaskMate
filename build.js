// from https://github.com/parsehex/BuddyGenAI
import { Platform as _Platform, build } from 'electron-builder';
const Platform = _Platform;

const platform = 'WINDOWS';
// const platform = 'LINUX';
// const platform = 'MAC';

/**
 * @type {import('electron-builder').CompressionLevel}
 */
const compression = 'maximum';
// set to 'maximum' for production builds

console.time(`build (${compression} compression-level)`);

/**
 * @type {import('electron-builder').Configuration}
 */
const options = {
	appId: 'com.mindofthomas.taskmate',
	productName: 'TaskMate',

	// "store" | "normal" | "maximum" - For testing builds, use 'store' to reduce build time significantly.
	compression,
	removePackageScripts: true,

	nodeGypRebuild: false,
	buildDependenciesFromSource: false,

	directories: {
		output: '.electron-dist',

		app: '.dist',
	},
	extraResources: [
		'.dist/frontend/**/*'
	],

	win: {
		artifactName: '${productName}-Setup-${version}.${ext}',
		icon: './build/icon.ico',
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
		// target: ['dir'],
		target: ['AppImage'],
		// target: ['AppImage', 'rpm', 'deb']
	},
};

// TODO how can we install deps programmatically?
// source = './node_modules';
// dest = './.output/node_modules';
// fs.copySync(source, dest);

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
	});
