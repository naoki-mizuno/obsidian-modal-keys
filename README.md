# Modal Keys Remapper

An Obsidian plugin that allows you to customize keyboard shortcuts for navigating modal dialogs and suggestion lists.

## Features

- **Customizable Navigation Keys**: Remap keys for moving up/down in modal selections (default: Ctrl+n/Ctrl+p)
- **Modal Confirm/Close Shortcut**: Configure custom keys to confirm/close in modals (default: Enter/Escape)
- **Target Specific Elements**: Define which CSS classes trigger the custom keybindings
- **Multiple Keyboard Shortcuts**: Configure multiple shortcuts for each action (up to 10 per action)

## Default Keybindings

- **Next (Move Down)**: `Ctrl+n` → Arrow Down
- **Previous (Move Up)**: `Ctrl+p` → Arrow Up
- **Confirm**: `Enter` → Confirm/accept in modal
- **Close Modal**: `Escape` → Close modal

## Settings

Navigate to **Settings → Modal Keys Remapper** to customize:

1. **Navigation Keys**:
   - Click "Record" next to each shortcut and press your desired key combination
   - Add multiple shortcuts by clicking the "+" button (appears when all shortcuts are set)
   - Remove shortcuts by clicking the "−" icon (clears value when only one exists, removes when multiple exist)
   - Each action supports up to 10 shortcuts
2. **Target CSS Classes**: Specify which modal elements should respond to your custom keys (one per line)
    - Default: `.suggestion-container` and `.modal-container`

**Notes**:

- Hotkeys take precedence over this plugin's settings.
- Duplicate keys are removed automatically.

## How It Works

The plugin listens for keyboard events when specific modal elements are present in the DOM. When you press a configured key combination, it dispatches the corresponding arrow key, enter key, or escape key event to navigate, confirm, or close in the modal.

If you would like to add more elements for the shortcut to be effective in, open the developer tool (Ctrl+Shift+i or Cmd+Shift+i) to find the class name, then append that in the Target CSS classes setting.

## Installation

### From Obsidian Community Plugins

1. Open **Settings** in Obsidian
2. Navigate to **Community plugins** and disable Safe mode
3. Click **Browse** and search for "Modal Keys Remapper"
4. Click **Install** and then **Enable**

### Manual Installation

1. Download the latest release from the [releases page](https://github.com/naoki-mizuno/obsidian-modal-keys/releases)
2. Extract the files to your vault's plugins folder: `<vault>/.obsidian/plugins/obsidian-modal-keys/`
3. Reload Obsidian
4. Enable the plugin in **Settings → Community plugins**

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/naoki-mizuno/obsidian-modal-keys.git

# Install dependencies
npm install

# Start development build (watch mode)
npm run dev
```

### Building

```bash
# Production build
npm run build
```

For development, you can also place the repository folder directly in your vault's `.obsidian/plugins/` folder and run `npm run dev` to automatically rebuild on changes.

## Credits

This plugin is largely based on [`obsidian-command-palette-keys`](https://github.com/danihodovic/obsidian-command-palette-keys) and the discussion at [the Obsidian forum](https://forum.obsidian.md/t/ctrl-j-ctrl-k-hotkey-for-navigation-within-command-palette-and-quick-switcher/7751).

## License

MIT License - see [LICENSE](LICENSE) for details.
