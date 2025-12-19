import { Plugin } from "obsidian";
import {
	ModalKeysSettings,
	DEFAULT_SETTINGS,
	parseKeyBinding,
	matchesKeyEvent,
	isModalActive,
	migrateSettings,
	cleanupShortcutArrays,
} from "./src/settings";
import { ModalKeysSettingTab } from "./src/settings-tab";

export default class ModalKeysPlugin extends Plugin {
	settings: ModalKeysSettings;

	async onload() {
		await this.loadSettings();

		// Register settings tab
		this.addSettingTab(new ModalKeysSettingTab(this.app, this));

		// Register keyboard event handler
		this.registerDomEvent(document, "keydown", (e: KeyboardEvent) => {
			this.handleKeyboardEvent(e);
		});
	}

	private handleKeyboardEvent(e: KeyboardEvent): void {
		// Check if any target modal is active
		if (!isModalActive(this.settings)) {
			return;
		}

		// Check for "next" action (move down) - check all shortcuts
		for (const keyStr of this.settings.nextKeys) {
			const binding = parseKeyBinding(keyStr);
			if (binding && matchesKeyEvent(e, binding)) {
				e.preventDefault();
				e.stopPropagation();
				const target = document.activeElement || document.body;
				target.dispatchEvent(
					new KeyboardEvent("keydown", {
						key: "ArrowDown",
						code: "ArrowDown",
					}),
				);
				return;
			}
		}

		// Check for "previous" action (move up) - check all shortcuts
		for (const keyStr of this.settings.previousKeys) {
			const binding = parseKeyBinding(keyStr);
			if (binding && matchesKeyEvent(e, binding)) {
				e.preventDefault();
				e.stopPropagation();
				const target = document.activeElement || document.body;
				target.dispatchEvent(
					new KeyboardEvent("keydown", {
						key: "ArrowUp",
						code: "ArrowUp",
					}),
				);
				return;
			}
		}

		// Check for "confirm" action - check all shortcuts
		for (const keyStr of this.settings.confirmKeys) {
			const binding = parseKeyBinding(keyStr);
			if (binding && matchesKeyEvent(e, binding)) {
				e.preventDefault();
				e.stopPropagation();
				const target = document.activeElement || document.body;
				target.dispatchEvent(
					new KeyboardEvent("keydown", {
						key: "Enter",
						code: "Enter",
					}),
				);
				return;
			}
		}

		// Check for "close" action - check all shortcuts
		for (const keyStr of this.settings.closeKeys) {
			const binding = parseKeyBinding(keyStr);
			if (binding && matchesKeyEvent(e, binding)) {
				e.preventDefault();
				e.stopPropagation();
				const target = document.activeElement || document.body;
				target.dispatchEvent(
					new KeyboardEvent("keydown", {
						key: "Escape",
						code: "Escape",
					}),
				);
				return;
			}
		}
	}

	onunload() {
		// Cleanup is handled automatically by registerDomEvent
	}

	async loadSettings() {
		const loadedData = (await this.loadData()) as Partial<ModalKeysSettings> | null;
		this.settings = loadedData ? migrateSettings(loadedData) : DEFAULT_SETTINGS;
		// Save migrated settings to ensure old format is converted
		await this.saveSettings();
	}

	async saveSettings() {
		// Clean up duplicate empty entries before saving
		cleanupShortcutArrays(this.settings);
		await this.saveData(this.settings);
	}
}
