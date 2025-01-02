# Open in Cursor

This plugin for [Obsidian](https://obsidian.md/) makes a ribbon button, a file explorer context menu and a command to open your vault in Cursor. This is a fork of the excellent [Open in VSCode](https://github.com/NomarCub/obsidian-open-vscode) plugin by [NomarCub](https://github.com/NomarCub), modified to work with [Cursor](https://cursor.sh/) instead of VSCode.

## Features

- Ribbon button to quickly open your vault in Cursor
- File explorer context menu option to open files/folders
- Command palette integration
- Support for opening specific files and jumping to specific lines
- Beautiful light/dark mode compatible icons

## Settings

- **Display Ribbon Icon** - Toggle the Cursor icon in the ribbon
- **Display "Open in Cursor" option for files/folders** - Toggle the context menu option
- **Template for executing the 'cursor' command** - Customize how Cursor is launched

### Command Template Variables

You can use the following variables in the command template:
- `{{vaultpath}}` - Absolute path to the vault
- `{{filepath}}` - Relative path to the current file
- `{{folderpath}}` - Relative path to the current folder
- `{{line}}` - Current line number
- `{{ch}}` - Current character position

The default template is `cursor "{{vaultpath}}" "{{vaultpath}}/{{filepath}}"`, which opens the current file (if there is one) in the workspace that is the vault's root folder.

## Installation

You can install the plugin via the Community Plugins tab within Obsidian:
1. Open Settings > Community plugins
2. Turn off Safe mode if it's on
3. Click Browse and search for "Open in Cursor"
4. Install and enable the plugin

## Credits

This plugin is a fork of [Open in VSCode](https://github.com/NomarCub/obsidian-open-vscode) by [NomarCub](https://github.com/NomarCub). The original plugin's contributors include:

- [NomarCub](https://github.com/NomarCub) - Original plugin creator
- [Ozan Tellioglu](https://github.com/ozntel) - Toggle ribbon setting
- [Tim Osborn](https://github.com/ptim) - UseURL feature and restructure
- [Moy](https://github.com/Moyf) - Go to line support
- [Quinn McHugh](https://github.com/quinn-p-mchugh) - File explorer context menu

## Support the Original Author

If you find this plugin helpful, consider supporting the original author:
- GitHub Sponsors: [![Sponsor NomarCub](https://img.shields.io/static/v1?label=Sponsor%20NomarCub&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86)](https://github.com/sponsors/NomarCub)
- Ko-fi: [nomarcub](https://ko-fi.com/nomarcub)
- PayPal: [nomarcub](https://paypal.me/nomarcub)

## License

This project is licensed under the MIT License, the same as the original plugin.
