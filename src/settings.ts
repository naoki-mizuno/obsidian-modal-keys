export interface ModalKeysSettings {
	nextKeys: string[];
	previousKeys: string[];
	confirmKeys: string[];
	closeKeys: string[];
	targetClasses: string;
	// Legacy fields for backward compatibility (will be migrated)
	nextKey?: string;
	previousKey?: string;
	closeKey?: string;
}

export const DEFAULT_SETTINGS: ModalKeysSettings = {
	nextKeys: ["Ctrl+KeyN"],
	previousKeys: ["Ctrl+KeyP"],
	confirmKeys: [""],
	closeKeys: [""],
	targetClasses: ".suggestion-container\n.modal-container",
};

/**
 * Migrates old settings format (single strings) to new format (arrays).
 * This ensures backward compatibility with existing user settings.
 */
export function migrateSettings(
	settings: Partial<ModalKeysSettings>,
): ModalKeysSettings {
	const migrated: ModalKeysSettings = {
		nextKeys: settings.nextKeys || [],
		previousKeys: settings.previousKeys || [],
		closeKeys: settings.closeKeys || [],
		// Fields that do not need migration
		confirmKeys: settings.confirmKeys || DEFAULT_SETTINGS.confirmKeys,
		targetClasses: settings.targetClasses || DEFAULT_SETTINGS.targetClasses,
	};

	// Migrate from old single-string format if arrays are empty
	if (migrated.nextKeys.length === 0) {
		if (settings.nextKey) {
			migrated.nextKeys = [settings.nextKey];
		} else {
			migrated.nextKeys = [...DEFAULT_SETTINGS.nextKeys];
		}
	}
	if (migrated.previousKeys.length === 0) {
		if (settings.previousKey) {
			migrated.previousKeys = [settings.previousKey];
		} else {
			migrated.previousKeys = [...DEFAULT_SETTINGS.previousKeys];
		}
	}

	if (migrated.closeKeys.length === 0) {
		if (settings.closeKey) {
			migrated.closeKeys = [settings.closeKey];
		} else {
			migrated.closeKeys = [...DEFAULT_SETTINGS.closeKeys];
		}
	}

	return migrated;
}

/**
 * Removes duplicate non-empty entries from shortcut arrays.
 * Ensures at least one entry remains (even if empty) to maintain minimum requirement.
 * Note: Multiple empty entries are prevented by the UI (plus button only shows when no empty entries exist).
 */
export function cleanupShortcutArrays(settings: ModalKeysSettings): void {
	const cleanupArray = (arr: string[]): string[] => {
		if (arr.length === 0) {
			return [""];
		}

		// Remove duplicate non-empty entries while preserving order
		const seen = new Set<string>();
		const result: string[] = [];
		let hasEmpty = false;

		for (const item of arr) {
			const trimmed = item.trim();
			if (trimmed === "") {
				// Keep only the first empty entry
				if (!hasEmpty) {
					result.push(item);
					hasEmpty = true;
				}
			} else {
				// Keep only unique non-empty entries
				if (!seen.has(trimmed)) {
					seen.add(trimmed);
					result.push(item);
				}
			}
		}

		// Ensure at least one entry exists
		return result.length > 0 ? result : [""];
	};

	settings.nextKeys = cleanupArray(settings.nextKeys);
	settings.previousKeys = cleanupArray(settings.previousKeys);
	settings.confirmKeys = cleanupArray(settings.confirmKeys);
	settings.closeKeys = cleanupArray(settings.closeKeys);
}

export interface ParsedKeyBinding {
	ctrl: boolean;
	alt: boolean;
	shift: boolean;
	meta: boolean;
	key: string;
}

/**
 * Parses a key binding string like "Ctrl+KeyN" or "Alt+Shift+KeyJ"
 * into a structured format for matching against KeyboardEvents.
 */
export function parseKeyBinding(input: string): ParsedKeyBinding | null {
	if (!input || input.trim() === "") {
		return null;
	}

	const parts = input.split("+").map((p) => p.trim());
	if (parts.length === 0) {
		return null;
	}

	const result: ParsedKeyBinding = {
		ctrl: false,
		alt: false,
		shift: false,
		meta: false,
		key: "",
	};

	for (const part of parts) {
		const lower = part.toLowerCase();
		if (lower === "ctrl" || lower === "control") {
			result.ctrl = true;
		} else if (lower === "alt") {
			result.alt = true;
		} else if (lower === "shift") {
			result.shift = true;
		} else if (lower === "meta" || lower === "cmd" || lower === "command") {
			result.meta = true;
		} else {
			// Last non-modifier part is the key
			result.key = part;
		}
	}

	// Must have at least a key
	if (!result.key) {
		return null;
	}

	return result;
}

/**
 * Checks if a KeyboardEvent matches a parsed key binding.
 */
export function matchesKeyEvent(
	event: KeyboardEvent,
	binding: ParsedKeyBinding | null,
): boolean {
	if (!binding) {
		return false;
	}

	return (
		event.ctrlKey === binding.ctrl &&
		event.altKey === binding.alt &&
		event.shiftKey === binding.shift &&
		event.metaKey === binding.meta &&
		event.code === binding.key
	);
}

/**
 * Formats a KeyboardEvent into a human-readable string like "Ctrl+KeyN"
 */
export function formatKeyEvent(event: KeyboardEvent): string {
	const parts: string[] = [];

	if (event.ctrlKey) parts.push("Ctrl");
	if (event.altKey) parts.push("Alt");
	if (event.shiftKey) parts.push("Shift");
	if (event.metaKey) parts.push("Meta");

	// Use code instead of key for consistency
	if (event.code) {
		parts.push(event.code);
	}

	return parts.join("+");
}

/**
 * Gets the list of target CSS classes from settings.
 */
export function getTargetClasses(settings: ModalKeysSettings): string[] {
	return settings.targetClasses
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line.length > 0);
}

/**
 * Checks if any of the target CSS classes are present in the DOM.
 */
export function isModalActive(settings: ModalKeysSettings): boolean {
	const classes = getTargetClasses(settings);
	return classes.some((className) => document.querySelector(className));
}
