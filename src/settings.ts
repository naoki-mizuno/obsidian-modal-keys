export interface ModalKeysSettings {
	nextKey: string;
	previousKey: string;
	closeKey: string;
	targetClasses: string;
}

export const DEFAULT_SETTINGS: ModalKeysSettings = {
	nextKey: "Ctrl+KeyN",
	previousKey: "Ctrl+KeyP",
	closeKey: "Escape",
	targetClasses: ".suggestion-container\n.modal-container",
};

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
