import React, { useEffect, useState } from 'react';
import { fetchConfig, updateConfig } from '@/lib/api/config';

const Settings = () => {
	const [config, setConfig] = useState<Record<string, string>>({});
	const [originalConfig, setOriginalConfig] = useState<Record<string, string>>(
		{}
	);
	const [hasChanges, setHasChanges] = useState(false);
	// Check for electron—if window.electron exists then we're running in electron mode.
	const isElectron = typeof (window as any).electron !== 'undefined';

	useEffect(() => {
		(async () => {
			const cfg = await fetchConfig();
			setConfig(cfg);
			setOriginalConfig(cfg);
		})();
	}, []);

	// Check for changes whenever config is updated
	useEffect(() => {
		// Compare current config with original config
		if (Object.keys(originalConfig).length === 0) return;

		const configChanged = Object.keys(config).some(
			(key) => config[key] !== originalConfig[key]
		);

		setHasChanges(configChanged);
	}, [config, originalConfig]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setConfig({ ...config, [e.target.name]: e.target.value });
	};

	const handleSave = async () => {
		if (!hasChanges) return;

		// Save configuration via your API endpoint which broadcasts the changes.
		await updateConfig(config);
		// Update the original config after saving
		setOriginalConfig({ ...config });
	};

	// New handler for selecting a folder for Projects Root (provided by Electron)
	const handleSelectFolder = async () => {
		if (isElectron) {
			// We're assuming you have an IPC exposed method called selectFolder.
			try {
				const folderPath = await (window as any).electron.selectFolder();
				if (folderPath) {
					setConfig((prev) => ({ ...prev, PROJECTS_ROOT: folderPath }));
				}
			} catch (error) {
				console.error('Folder selection failed:', error);
			}
		} else {
			console.warn('Folder selection is available only in Electron mode.');
		}
	};

	// New handler to trigger app restart (provided by Electron)
	const handleRestart = () => {
		if (isElectron) {
			(window as any).electron.restartApp();
		} else {
			console.warn('Restart functionality is only available in Electron mode.');
		}
	};

	return (
		<div className="p-4">
			<h2 className="text-2xl font-bold">Settings</h2>

			{/* Always allow changing the project root */}
			<div className="mt-4">
				<label htmlFor="PROJECTS_ROOT">Projects Root</label>
				<div className="flex gap-2">
					<input
						type="text"
						id="PROJECTS_ROOT"
						name="PROJECTS_ROOT"
						value={config.PROJECTS_ROOT || ''}
						onChange={handleChange}
						className="mt-1 block flex-1 border rounded px-2 py-1"
					/>
					{isElectron && (
						<button
							onClick={handleSelectFolder}
							className="mt-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-2 py-1 rounded"
						>
							Select Folder
						</button>
					)}
				</div>
			</div>

			{/* Only show server-related fields if not running under Electron */}
			{!isElectron && (
				<>
					<div className="mt-4">
						<label htmlFor="SERVER_PORT">Server Port</label>
						<input
							type="text"
							id="SERVER_PORT"
							name="SERVER_PORT"
							value={config.SERVER_PORT || ''}
							onChange={handleChange}
							className="mt-1 block w-full border rounded px-2 py-1"
						/>
					</div>
					<div className="mt-4">
						<label htmlFor="WEBSOCKET_PORT">WebSocket Port</label>
						<input
							type="text"
							id="WEBSOCKET_PORT"
							name="WEBSOCKET_PORT"
							value={config.WEBSOCKET_PORT || ''}
							onChange={handleChange}
							className="mt-1 block w-full border rounded px-2 py-1"
						/>
					</div>
				</>
			)}

			<div className="mt-4">
				<label htmlFor="OPENAI_API_KEY">OpenAI API Key</label>
				<input
					type="text"
					id="OPENAI_API_KEY"
					name="OPENAI_API_KEY"
					value={config.OPENAI_API_KEY || ''}
					onChange={handleChange}
					className="mt-1 block w-full border rounded px-2 py-1"
				/>
			</div>

			<div className="flex justify-center gap-4 mt-6">
				<button
					onClick={handleSave}
					className={`${
						hasChanges ? 'bg-blue-600' : 'bg-blue-400 cursor-not-allowed'
					} text-white px-4 py-2 rounded`}
					disabled={!hasChanges}
				>
					Save Settings
				</button>
				{isElectron && (
					<button
						onClick={handleRestart}
						className="bg-amber-600 text-white px-4 py-2 rounded"
					>
						Restart App
					</button>
				)}
			</div>
			{hasChanges && (
				<p className="mt-4 text-center text-amber-600">
					Save and restart to apply changes.
				</p>
			)}
		</div>
	);
};

export default Settings;
