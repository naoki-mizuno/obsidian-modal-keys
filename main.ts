import { Plugin } from "obsidian";
import {
	ModalKeysSettings,
	DEFAULT_SETTINGS,
	parseKeyBinding,
	matchesKeyEvent,
	isModalActive,
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

		// Parse key bindings
		const nextBinding = parseKeyBinding(this.settings.nextKey);
		const previousBinding = parseKeyBinding(this.settings.previousKey);
		const closeBinding = parseKeyBinding(this.settings.closeKey);

		// Check for "next" action (move down)
		if (nextBinding && matchesKeyEvent(e, nextBinding)) {
			e.preventDefault();
			document.dispatchEvent(
				new KeyboardEvent("keydown", {
					key: "ArrowDown",
					code: "ArrowDown",
				}),
			);
			return;
		}

		// Check for "previous" action (move up)
		if (previousBinding && matchesKeyEvent(e, previousBinding)) {
			e.preventDefault();
			document.dispatchEvent(
				new KeyboardEvent("keydown", {
					key: "ArrowUp",
					code: "ArrowUp",
				}),
			);
			return;
		}

		// Check for "close" action
		if (closeBinding && matchesKeyEvent(e, closeBinding)) {
			e.preventDefault();
			document.dispatchEvent(
				new KeyboardEvent("keydown", {
					key: "Escape",
					code: "Escape",
				}),
			);
			return;
		}
	}

	onunload() {
		// Cleanup is handled automatically by registerDomEvent
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
