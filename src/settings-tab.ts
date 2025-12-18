import { App, PluginSettingTab, Setting } from "obsidian";
import ModalKeysPlugin from "../main";
import { DEFAULT_SETTINGS, formatKeyEvent } from "./settings";

export class ModalKeysSettingTab extends PluginSettingTab {
	plugin: ModalKeysPlugin;

	constructor(app: App, plugin: ModalKeysPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Modal Keys Settings" });

		// Next key setting
		this.createKeybindingSetting(
			containerEl,
			"Next (move down)",
			"Trigger to move down in modal selections",
			"nextKey",
			DEFAULT_SETTINGS.nextKey,
		);

		// Previous key setting
		this.createKeybindingSetting(
			containerEl,
			"Previous (move up)",
			"Trigger to move up in modal selections",
			"previousKey",
			DEFAULT_SETTINGS.previousKey,
		);

		// Close modal key setting
		this.createKeybindingSetting(
			containerEl,
			"Close modal",
			"Trigger to close modal dialogs",
			"closeKey",
			DEFAULT_SETTINGS.closeKey,
		);

		// Target CSS classes setting
		new Setting(containerEl)
			.setName("Target CSS classes")
			.setDesc(
				"CSS classes where keybindings should be active (one per line)",
			)
			.addTextArea((text) =>
				text
					.setPlaceholder(".suggestion-container\n.modal-container")
					.setValue(this.plugin.settings.targetClasses)
					.onChange(async (value) => {
						this.plugin.settings.targetClasses = value;
						await this.plugin.saveSettings();
					}),
			);

		// Reset to defaults button
		new Setting(containerEl).addButton((button) =>
			button
				.setButtonText("Reset to defaults")
				.setWarning()
				.onClick(async () => {
					this.plugin.settings = Object.assign({}, DEFAULT_SETTINGS);
					await this.plugin.saveSettings();
					this.display(); // Refresh the UI
				}),
		);
	}

	private createKeybindingSetting(
		containerEl: HTMLElement,
		name: string,
		desc: string,
		settingKey: "nextKey" | "previousKey" | "closeKey",
		defaultValue: string,
	): void {
		const setting = new Setting(containerEl).setName(name).setDesc(desc);

		let displayEl: HTMLElement;
		let recordButton: HTMLButtonElement;
		let clearButton: HTMLButtonElement;
		let isRecording = false;
		let keydownHandler: ((e: KeyboardEvent) => void) | null = null;

		const updateDisplay = () => {
			const currentValue = this.plugin.settings[settingKey];
			displayEl.textContent = currentValue || "(not set)";
		};

		const stopRecording = () => {
			if (keydownHandler) {
				document.removeEventListener("keydown", keydownHandler, true);
				keydownHandler = null;
			}
			isRecording = false;
			recordButton.textContent = "Record";
			recordButton.removeClass("mod-warning");
		};

		const startRecording = () => {
			if (isRecording) {
				stopRecording();
				return;
			}

			isRecording = true;
			recordButton.textContent = "Press any key...";
			recordButton.addClass("mod-warning");

			keydownHandler = async (e: KeyboardEvent) => {
				// Ignore modifier-only presses
				if (
					e.key === "Control" ||
					e.key === "Alt" ||
					e.key === "Shift" ||
					e.key === "Meta"
				) {
					return;
				}

				e.preventDefault();
				e.stopPropagation();

				const formatted = formatKeyEvent(e);
				this.plugin.settings[settingKey] = formatted;
				await this.plugin.saveSettings();

				updateDisplay();
				stopRecording();
			};

			document.addEventListener("keydown", keydownHandler, true);
		};

		// Create custom control container
		setting.controlEl.empty();

		// Display current binding
		displayEl = setting.controlEl.createDiv({
			cls: "modal-keys-binding-display",
		});
		displayEl.style.display = "inline-block";
		displayEl.style.marginRight = "10px";
		displayEl.style.padding = "4px 8px";
		displayEl.style.border = "1px solid var(--background-modifier-border)";
		displayEl.style.borderRadius = "4px";
		displayEl.style.fontFamily = "var(--font-monospace)";
		displayEl.style.minWidth = "120px";
		displayEl.style.textAlign = "center";
		updateDisplay();

		// Record button
		recordButton = setting.controlEl.createEl("button", {
			text: "Record",
		});
		recordButton.style.marginRight = "5px";
		recordButton.addEventListener("click", (e) => {
			e.preventDefault();
			startRecording();
		});

		// Clear button
		clearButton = setting.controlEl.createEl("button", {
			text: "Clear",
		});
		clearButton.addEventListener("click", async (e) => {
			e.preventDefault();
			stopRecording();
			this.plugin.settings[settingKey] = "";
			await this.plugin.saveSettings();
			updateDisplay();
		});

		// Add default hint
		setting.descEl.createDiv({
			text: `Default: ${defaultValue}`,
			cls: "setting-item-description",
		});
	}
}
