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

		// Next keys setting
		this.createKeybindingsList(
			containerEl,
			"Next (move down)",
			"Trigger to move down in modal selections",
			"nextKeys",
			DEFAULT_SETTINGS.nextKeys,
		);

		// Previous keys setting
		this.createKeybindingsList(
			containerEl,
			"Previous (move up)",
			"Trigger to move up in modal selections",
			"previousKeys",
			DEFAULT_SETTINGS.previousKeys,
		);

		// Close modal keys setting
		this.createKeybindingsList(
			containerEl,
			"Close modal",
			"Trigger to close modal dialogs",
			"closeKeys",
			DEFAULT_SETTINGS.closeKeys,
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

	private createKeybindingsList(
		containerEl: HTMLElement,
		name: string,
		desc: string,
		settingKey: "nextKeys" | "previousKeys" | "closeKeys",
		defaultValues: string[],
	): void {
		const setting = new Setting(containerEl).setName(name).setDesc(desc);

		// Create container for the list of shortcuts
		const shortcutsContainer = setting.controlEl.createDiv({
			cls: "modal-keys-shortcuts-container",
		});

		let autoStartRecordingIndex: number | null = null;
		// Track active keydown handlers to stop them before re-rendering
		const activeHandlers: Set<(e: KeyboardEvent) => void> = new Set();

		const stopAllRecordings = () => {
			activeHandlers.forEach((handler) => {
				document.removeEventListener("keydown", handler, true);
			});
			activeHandlers.clear();
		};

		const renderShortcuts = () => {
			// Stop all active recordings before re-rendering
			stopAllRecordings();
			shortcutsContainer.empty();
			const shortcuts = this.plugin.settings[settingKey];
			const isTheOnlyShortcut = shortcuts.length === 1;
			const isMaxReached = shortcuts.length >= 10;
			// Check if there are any empty (non-set) shortcuts
			const hasEmptyShortcut = shortcuts.some((s) => s.trim() === "");

			// Render each shortcut
			shortcuts.forEach((keyStr, index) => {
				const shortcutRow = shortcutsContainer.createDiv({
					cls: "modal-keys-shortcut-row",
				});
				shortcutRow.style.display = "flex";
				shortcutRow.style.alignItems = "center";
				shortcutRow.style.marginBottom = "8px";
				shortcutRow.style.gap = "8px";

				// Display current binding
				const displayEl = shortcutRow.createDiv({
					cls: "modal-keys-binding-display",
				});
				displayEl.style.flex = "1";
				displayEl.style.padding = "4px 8px";
				displayEl.style.border = "1px solid var(--background-modifier-border)";
				displayEl.style.borderRadius = "4px";
				displayEl.style.fontFamily = "var(--font-monospace)";
				displayEl.style.minWidth = "120px";
				displayEl.style.textAlign = "center";
				displayEl.textContent = keyStr || "(not set)";

				// Record button
				const recordButton = shortcutRow.createEl("button", {
					text: "Record",
				});
				let isRecording = false;
				let keydownHandler: ((e: KeyboardEvent) => void) | null = null;

				const stopRecording = () => {
					if (keydownHandler) {
						document.removeEventListener("keydown", keydownHandler, true);
						activeHandlers.delete(keydownHandler);
						keydownHandler = null;
					}
					isRecording = false;
					recordButton.textContent = "Record";
					recordButton.removeClass("mod-warning");
				};

				const startRecording = () => {
					// Stop any other recording first
					stopAllRecordings();

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
						const shortcuts = [...this.plugin.settings[settingKey]];
						shortcuts[index] = formatted;
						this.plugin.settings[settingKey] = shortcuts;
						await this.plugin.saveSettings();

						stopRecording();
						renderShortcuts(); // Re-render to update display
					};

					activeHandlers.add(keydownHandler);
					document.addEventListener("keydown", keydownHandler, true);
				};

				recordButton.addEventListener("click", (e) => {
					e.preventDefault();
					startRecording();
				});

				// Auto-start recording if this is the newly added shortcut
				if (autoStartRecordingIndex === index) {
					// Use setTimeout to ensure DOM is ready
					setTimeout(() => {
						startRecording();
						autoStartRecordingIndex = null;
					}, 0);
				}

				// Minus icon button (clears when single, removes when multiple)
				const minusButton = shortcutRow.createEl("button", {
					text: "−",
					attr: {
						"aria-label": isTheOnlyShortcut
							? "Clear shortcut"
							: "Remove shortcut",
					},
				});
				minusButton.style.fontSize = "18px";
				minusButton.style.width = "28px";
				minusButton.style.height = "28px";
				minusButton.style.padding = "0";
				minusButton.style.lineHeight = "1";
				minusButton.addEventListener("click", async (e) => {
					e.preventDefault();
					stopRecording();
					const shortcuts = [...this.plugin.settings[settingKey]];
					if (isTheOnlyShortcut) {
						// Clear the value when only one shortcut
						shortcuts[index] = "";
					} else {
						// Remove from array when multiple shortcuts
						shortcuts.splice(index, 1);
					}
					this.plugin.settings[settingKey] = shortcuts;
					await this.plugin.saveSettings();
					renderShortcuts();
				});
			});

			// Plus button at the bottom - only show when no empty shortcuts exist
			if (!hasEmptyShortcut && !isMaxReached) {
				const plusRow = shortcutsContainer.createDiv({
					cls: "modal-keys-plus-row",
				});
				plusRow.style.display = "flex";
				plusRow.style.justifyContent = "flex-end";
				plusRow.style.marginTop = "4px";

				const plusButton = plusRow.createEl("button", {
					text: "+",
					attr: { "aria-label": "Add shortcut" },
				});
				plusButton.style.fontSize = "18px";
				plusButton.style.width = "28px";
				plusButton.style.height = "28px";
				plusButton.style.padding = "0";
				plusButton.style.lineHeight = "1";

				plusButton.addEventListener("click", async (e) => {
					e.preventDefault();
					if (isMaxReached) return;

					// Add new empty shortcut and start recording immediately
					const shortcuts = [...this.plugin.settings[settingKey], ""];
					this.plugin.settings[settingKey] = shortcuts;
					await this.plugin.saveSettings();

					// Set the index to auto-start recording
					autoStartRecordingIndex = shortcuts.length - 1;
					renderShortcuts();
				});
			}
		};

		// Initial render
		renderShortcuts();

		// Add default hint
		setting.descEl.createDiv({
			text: `Default: ${defaultValues.join(", ")}`,
			cls: "setting-item-description",
		});
	}
}
