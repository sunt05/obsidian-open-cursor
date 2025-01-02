import { FileSystemAdapter, Plugin, addIcon, MarkdownView, Menu, TAbstractFile } from "obsidian";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as obsidianInternal from "obsidian-typings";
import { DEFAULT_SETTINGS, OpenCursorSettings, OpenCursorSettingsTab } from "./settings";
import { exec } from "child_process";

type HotReloadPlugin = Plugin & {
    // https://github.com/pjeby/hot-reload/blob/0.1.11/main.js#L70
    enabledPlugins: Set<string>;
};

/**
 * Replace all references to VSCode with Cursor. The overall idea:
 * - We assume Cursor can be called via a shell command like `cursor <somePath>`
 * - If you have a custom installation or URL scheme for Cursor, adjust as needed.
 * - This version removes the 'useUrlInsiders' logic and simply uses `cursor://` for URL-based opening if desired.
 */
export default class OpenCursor extends Plugin {
    static iconId = "cursor-logo";
    // source: cursor.svg
    static iconSvgContent = `
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.925 24l10.425-6-10.425-6L1.5 18l10.425 6z" fill="currentColor" opacity="0.8"/>
    <path d="M22.35 18V6L11.925 0v12l10.425 6z" fill="currentColor" opacity="0.7"/>
    <path d="M11.925 0L1.5 6v12l10.425-6V0z" fill="currentColor" opacity="0.6"/>
    <path d="M22.35 6L11.925 24V12L22.35 6z" fill="currentColor" opacity="0.5"/>
    <path d="M22.35 6l-10.425 6L1.5 6h20.85z" fill="currentColor" opacity="0.9"/>
</svg>
`;

    DEV = false;

    ribbonIcon?: HTMLElement;
    settings!: OpenCursorSettings; // If you prefer, rename this to OpenCursorSettings in your own code.

    readonly logTag = `[open-cursor]`;

    override async onload(): Promise<void> {
        console.log("Loading Cursor plugin");
        addIcon(OpenCursor.iconId, OpenCursor.iconSvgContent);
        await this.loadSettings();
        this.refreshIconRibbon();

        // If you have your own settings tab, rename it:
        this.addSettingTab(new OpenCursorSettingsTab(this.app, this));

        this.addCommand({
            id: "open-cursor",
            name: "Open in Cursor (shell command)",
            callback: this.openCursor.bind(this),
        });

        this.addCommand({
            id: "open-cursor-url",
            name: "Open in Cursor (cursor://)",
            callback: this.openCursorUrl.bind(this),
        });

        this.registerEvent(
            this.app.workspace.on("file-menu", this.fileMenuHandler.bind(this)),
        );

        const hotReloadPlugin = this.app.plugins.getPlugin("hot-reload") as HotReloadPlugin | null;
        this.DEV = hotReloadPlugin?.enabledPlugins.has(this.manifest.id) ?? false;

        if (this.DEV) {
            this.addCommand({
                id: "open-cursor-reload",
                name: "Reload the plugin in dev",
                callback: this.reload.bind(this),
            });

            this.addCommand({
                id: "open-cursor-reset-settings",
                name: "Reset plugin settings to default in dev",
                callback: this.resetSettings.bind(this),
            });
        }
    }

    /**
     * Attempt to open the vault/file in Cursor via a shell command.
     * Adjust the 'executeTemplate' default to something like "cursor {{vaultpath}}" or your preference.
     */
    openCursor(file: TAbstractFile | null = this.app.workspace.getActiveFile()): void {
        if (!(this.app.vault.adapter instanceof FileSystemAdapter)) {
            return;
        }
        const { executeTemplate } = this.settings;

        const vaultPath = this.app.vault.adapter.getBasePath();
        const filePath = file?.path ?? "";
        const folderPath = file?.parent?.path ?? "";

        const cursorPos = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor.getCursor();
        // Cursor line/column are 1-based just like VSCode
        const line = (cursorPos?.line ?? 0) + 1;
        const ch = (cursorPos?.ch ?? 0) + 1;

        let command = executeTemplate.trim() === "" ? DEFAULT_SETTINGS.executeTemplate : executeTemplate;
        command = command
            .replaceAll("{{vaultpath}}", vaultPath)
            .replaceAll("{{filepath}}", filePath)
            .replaceAll("{{folderpath}}", folderPath)
            .replaceAll("{{line}}", line.toString())
            .replaceAll("{{ch}}", ch.toString());

        if (this.DEV) console.log(this.logTag, { command });
        exec(command, error => {
            if (error) {
                console.error(`${this.logTag} exec error: ${error.message}`);
            }
        });
    }

    /**
     * Attempt to open Cursor via a URL scheme. If 'cursor://' is not supported, adapt as needed.
     */
    openCursorUrl(): void {
        if (!(this.app.vault.adapter instanceof FileSystemAdapter)) {
            return;
        }
        const { openFile } = this.settings;

        const path = this.app.vault.adapter.getBasePath();
        const file = this.app.workspace.getActiveFile();
        const filePath = file?.path ?? "";
        if (this.DEV)
            console.log(this.logTag, { settings: this.settings, path, filePath });

        // Hypothetical 'cursor://file' approach
        let url = `cursor://file/${path}`;

        if (openFile) {
            url += `/${filePath}`;
            // If Cursor supports a single-window workflow, you might do something similar to the VSCode trick:
            // This is just an example; actual behaviour depends on Cursor's capabilities.
            const workspacePath = this.settings.workspacePath.replaceAll("{{vaultpath}}", path);
            window.open(`cursor://file/${workspacePath}`);

            setTimeout(() => {
                if (this.DEV) console.log(this.logTag, { url });
                window.open(url);
            }, 200);
        } else {
            if (this.DEV) console.log(this.logTag, { url });
            window.open(url);
        }
    }

    async loadSettings(): Promise<void> {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData()) as OpenCursorSettings;
    }

    async saveSettings(): Promise<void> {
        await this.saveData(this.settings);
    }

    refreshIconRibbon(): void {
        this.ribbonIcon?.remove();
        if (this.settings.ribbonIcon) {
            this.ribbonIcon = this.addRibbonIcon(OpenCursor.iconId, "Cursor", () => {
                // Decide which one to run based on your preference:
                this.openCursor();
            });
        }
    }

    fileMenuHandler(menu: Menu, file: TAbstractFile): void {
        if (!this.settings.showFileContextMenuItem) {
            return;
        }

        menu.addItem(item => {
            item.setTitle("Open in Cursor")
                .setIcon(OpenCursor.iconId)
                .onClick(() => {
                    this.openCursor(file);
                });
        });
    }

    async reload(): Promise<void> {
        const id = this.manifest.id;
        const plugins = this.app.plugins;
        await plugins.disablePlugin(id);
        await plugins.enablePlugin(id);
        console.log(`${this.logTag} reloaded`, this);
    }

    async resetSettings(): Promise<void> {
        console.log(this.logTag, { old: this.settings, default: DEFAULT_SETTINGS });
        this.settings = DEFAULT_SETTINGS;
        await this.saveData(this.settings);
    }
}