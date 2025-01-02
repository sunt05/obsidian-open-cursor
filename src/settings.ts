import { App, PluginSettingTab, Setting } from "obsidian";
import OpenCursor from "./main";

/**
 * If you'd like, rename this interface to 'OpenCursorSettings' and adjust accordingly.
 * For simplicity, we preserve the same structure but replace "VSCode" references with "Cursor".
 */
export interface OpenCursorSettings {
    ribbonIcon: boolean;
    // use 'cursor' command if true, otherwise open via hypothetical 'cursor://' URL
    ribbonCommandUsesCursor: boolean;
    showFileContextMenuItem: boolean;
    executeTemplate: string;
    openFile: boolean;
    workspacePath: string;
    useUrlInsiders: boolean; // remove or repurpose if you don't need an 'insiders' version
}

/**
 * Adjust defaults:
 * - Replaced 'code' with 'cursor' in the default template
 * - Renamed 'ribbonCommandUsesCode' to 'ribbonCommandUsesCursor'
 */
export const DEFAULT_SETTINGS: OpenCursorSettings = {
    ribbonIcon: true,
    ribbonCommandUsesCursor: true,
    showFileContextMenuItem: true,
    executeTemplate: 'cursor "{{vaultpath}}" "{{vaultpath}}/{{filepath}}"',
    openFile: true,
    workspacePath: "{{vaultpath}}",
    useUrlInsiders: false,
};

export class OpenCursorSettingsTab extends PluginSettingTab {
    override plugin: OpenCursor;

    constructor(app: App, plugin: OpenCursor) {
        super(app, plugin);
        this.plugin = plugin;
    }

    override display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl("h3", { text: "General settings" });

        new Setting(containerEl)
            .setName("Display Ribbon Icon")
            .setDesc("Toggle this OFF if you want to hide the Ribbon Icon.")
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.ribbonIcon)
                .onChange(value => {
                    this.plugin.settings.ribbonIcon = value;
                    void this.plugin.saveSettings();
                    this.plugin.refreshIconRibbon();
                }),
            );

        new Setting(containerEl)
            .setName("Ribbon opens via 'cursor' command")
            .setDesc("Toggle this OFF if you'd prefer that the Ribbon Icon opens Cursor via a URL.")
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.ribbonCommandUsesCursor)
                .onChange(value => {
                    this.plugin.settings.ribbonCommandUsesCursor = value;
                    void this.plugin.saveSettings();
                }),
            );

        new Setting(containerEl)
            .setName('Display "Open in Cursor" option for files/folders')
            .setDesc('Toggle this OFF to hide the "Open in Cursor" option when right-clicking a file/folder.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showFileContextMenuItem)
                .onChange(value => {
                    this.plugin.settings.showFileContextMenuItem = value;
                    void this.plugin.saveSettings();
                }),
            );

        containerEl.createEl("h3", { text: "Open via 'cursor' CLI settings" });

        new Setting(containerEl)
            .setName("Template for executing the 'cursor' command")
            .setDesc("You can use '{{vaultpath}}', '{{filepath}}', '{{folderpath}}', '{{line}}', and '{{ch}}'. On macOS, you may need the full path to the Cursor executable. Example: \"'/usr/local/bin/cursor' '{{vaultpath}}' '{{vaultpath}}/{{filepath}}'\"")
            .addText(text => text
                .setPlaceholder(DEFAULT_SETTINGS.executeTemplate)
                .setValue(this.plugin.settings.executeTemplate || DEFAULT_SETTINGS.executeTemplate)
                .onChange(value => {
                    value = value.trim();
                    if (value === "") value = DEFAULT_SETTINGS.executeTemplate;
                    this.plugin.settings.executeTemplate = value;
                    void this.plugin.saveData(this.plugin.settings);
                }),
            );

        containerEl.createEl("h3", { text: "Open via 'cursor://' URL settings" });
        containerEl.createEl("p", { text: "If Cursor supports a URL scheme like 'cursor://', you can configure it here. Otherwise, leave these as is." });

        new Setting(containerEl)
            .setName("Open current file")
            .setDesc("Open the current file rather than the root of the vault.")
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.openFile || DEFAULT_SETTINGS.openFile)
                .onChange(value => {
                    this.plugin.settings.openFile = value;
                    void this.plugin.saveData(this.plugin.settings);
                }),
            );

        const workspacePathSetting = new Setting(containerEl)
            .setName("Path to Cursor Workspace")
            .setDesc('Defaults to the {{vaultpath}} template variable. If Cursor uses an actual workspace file, set it here.')
            .addText(text => text
                .setPlaceholder(DEFAULT_SETTINGS.workspacePath)
                .setValue(this.plugin.settings.workspacePath || DEFAULT_SETTINGS.workspacePath)
                .onChange(value => {
                    value = value.trim();
                    if (value === "") value = DEFAULT_SETTINGS.workspacePath;
                    this.plugin.settings.workspacePath = value;
                    void this.plugin.saveData(this.plugin.settings);
                }),
            );

        workspacePathSetting.descEl.appendText(" For instance, a multi-root workspace if Cursor supports it.");

        new Setting(containerEl)
            .setName("Open Cursor using a 'cursor-insiders://' URL")
            .setDesc("Toggle on if you have a Cursor Insiders build with a custom URL scheme.")
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.useUrlInsiders)
                .onChange(value => {
                    this.plugin.settings.useUrlInsiders = value;
                    void this.plugin.saveSettings();
                }),
            );
    }
}