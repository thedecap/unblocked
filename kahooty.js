/**
 * Enhanced Developer Console
 * A professional, customizable browser developer console
 * Features: Dark/Light mode, Resizable, Modern UI
 * 
 * Original by SnowLord7, Enhanced version with dark mode and resize
 */

(() => {
    // ═══════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════
    const CONFIG = {
        defaultTheme: 'dark', // 'dark' or 'light'
        defaultHeight: 320,
        minHeight: 150,
        maxHeight: 800,
        animationDuration: 300,
        consoleMaxMessages: 50,
        storageKey: 'devConsole_settings'
    };

    // ═══════════════════════════════════════════════════════════════
    // THEMES
    // ═══════════════════════════════════════════════════════════════
    const THEMES = {
        dark: {
            name: 'dark',
            bg: '#1a1a2e',
            bgSecondary: '#16213e',
            bgTertiary: '#0f0f1a',
            bgHover: 'rgba(255, 255, 255, 0.05)',
            bgActive: 'rgba(0, 173, 216, 0.15)',
            text: '#e4e4e7',
            textMuted: '#71717a',
            textDim: '#52525b',
            border: '#27273a',
            borderLight: '#3f3f5a',
            accent: '#00d4ff',
            accentHover: '#00a8cc',
            success: '#22c55e',
            warning: '#eab308',
            error: '#ef4444',
            string: '#f472b6',
            number: '#60a5fa',
            boolean: '#a78bfa',
            null: '#6b7280',
            key: '#34d399',
            scrollThumb: '#3f3f5a',
            scrollTrack: '#1a1a2e'
        },
        light: {
            name: 'light',
            bg: '#ffffff',
            bgSecondary: '#f8fafc',
            bgTertiary: '#f1f5f9',
            bgHover: 'rgba(0, 0, 0, 0.04)',
            bgActive: 'rgba(0, 173, 216, 0.1)',
            text: '#1e293b',
            textMuted: '#64748b',
            textDim: '#94a3b8',
            border: '#e2e8f0',
            borderLight: '#cbd5e1',
            accent: '#0891b2',
            accentHover: '#0e7490',
            success: '#16a34a',
            warning: '#ca8a04',
            error: '#dc2626',
            string: '#be185d',
            number: '#2563eb',
            boolean: '#7c3aed',
            null: '#6b7280',
            key: '#059669',
            scrollThumb: '#cbd5e1',
            scrollTrack: '#f1f5f9'
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════
    const state = {
        loaded: true,
        showing: true,
        theme: CONFIG.defaultTheme,
        height: CONFIG.defaultHeight,
        isResizing: false,
        tooltipEnabled: false,
        hijackFunctions: true,
        hideLogs: false,
        originalConsole: {
            log: console.log,
            warn: console.warn,
            error: console.error,
            info: console.info,
            clear: console.clear
        }
    };

    // Load saved settings
    try {
        const saved = localStorage.getItem(CONFIG.storageKey);
        if (saved) {
            const settings = JSON.parse(saved);
            state.theme = settings.theme || CONFIG.defaultTheme;
            state.height = settings.height || CONFIG.defaultHeight;
        }
    } catch (e) {}

    // ═══════════════════════════════════════════════════════════════
    // UTILITY FUNCTIONS
    // ═══════════════════════════════════════════════════════════════
    function saveSettings() {
        try {
            localStorage.setItem(CONFIG.storageKey, JSON.stringify({
                theme: state.theme,
                height: state.height
            }));
        } catch (e) {}
    }

    function getTheme() {
        return THEMES[state.theme];
    }

    function getTimestamp() {
        return new Date().toLocaleTimeString('en-US', { hour12: false });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function downloadSiteInfo(filename, text) {
        const elem = document.createElement('a');
        elem.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        elem.setAttribute('download', filename);
        elem.style.display = 'none';
        document.body.appendChild(elem);
        elem.click();
        elem.remove();
    }

    // ═══════════════════════════════════════════════════════════════
    // CSS GENERATION
    // ═══════════════════════════════════════════════════════════════
    function generateCSS() {
        const t = getTheme();
        return `
            @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@400;500;600&display=swap');

            @keyframes devConsole-slideUp {
                from { transform: translateY(100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }

            @keyframes devConsole-fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes devConsole-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            .devConsole-container {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                position: fixed;
                bottom: 0;
                left: 0;
                width: 100%;
                height: ${state.height}px;
                min-height: ${CONFIG.minHeight}px;
                max-height: ${CONFIG.maxHeight}px;
                background: ${t.bg};
                border-top: 1px solid ${t.border};
                box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.3);
                z-index: 2147483647;
                display: flex;
                flex-direction: column;
                animation: devConsole-slideUp ${CONFIG.animationDuration}ms cubic-bezier(0.16, 1, 0.3, 1);
                box-sizing: border-box;
            }

            .devConsole-container * {
                box-sizing: border-box;
            }

            /* Resize Handle */
            .devConsole-resize-handle {
                position: absolute;
                top: -4px;
                left: 0;
                right: 0;
                height: 8px;
                cursor: ns-resize;
                background: transparent;
                transition: background 0.2s;
            }

            .devConsole-resize-handle:hover,
            .devConsole-resize-handle.active {
                background: ${t.accent};
            }

            .devConsole-resize-handle::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 40px;
                height: 4px;
                background: ${t.borderLight};
                border-radius: 2px;
                opacity: 0;
                transition: opacity 0.2s;
            }

            .devConsole-resize-handle:hover::after {
                opacity: 1;
            }

            /* Navigation */
            .devConsole-nav {
                display: flex;
                align-items: center;
                padding: 0 8px;
                height: 36px;
                min-height: 36px;
                background: ${t.bgSecondary};
                border-bottom: 1px solid ${t.border};
                gap: 2px;
                user-select: none;
            }

            .devConsole-nav-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 6px 12px;
                font-size: 12px;
                font-weight: 500;
                color: ${t.textMuted};
                background: transparent;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.15s;
                white-space: nowrap;
            }

            .devConsole-nav-btn:hover {
                background: ${t.bgHover};
                color: ${t.text};
            }

            .devConsole-nav-btn.active {
                background: ${t.bgActive};
                color: ${t.accent};
            }

            .devConsole-nav-btn.icon-btn {
                padding: 6px 8px;
                font-size: 14px;
            }

            .devConsole-nav-divider {
                width: 1px;
                height: 20px;
                background: ${t.border};
                margin: 0 4px;
            }

            .devConsole-nav-spacer {
                flex: 1;
            }

            .devConsole-nav-btn.close-btn:hover {
                background: ${t.error};
                color: white;
            }

            .devConsole-nav-btn.theme-btn {
                font-size: 14px;
            }

            /* Body */
            .devConsole-body {
                flex: 1;
                overflow: hidden;
                position: relative;
            }

            .devConsole-panel {
                position: absolute;
                inset: 0;
                display: none;
                flex-direction: column;
                overflow: hidden;
            }

            .devConsole-panel.active {
                display: flex;
            }

            /* Console Panel */
            .devConsole-console-messages {
                flex: 1;
                overflow-y: auto;
                padding: 8px;
                font-family: 'JetBrains Mono', 'Fira Code', monospace;
                font-size: 12px;
                line-height: 1.6;
            }

            .devConsole-console-messages::-webkit-scrollbar {
                width: 8px;
            }

            .devConsole-console-messages::-webkit-scrollbar-track {
                background: ${t.scrollTrack};
            }

            .devConsole-console-messages::-webkit-scrollbar-thumb {
                background: ${t.scrollThumb};
                border-radius: 4px;
            }

            .devConsole-console-messages::-webkit-scrollbar-thumb:hover {
                background: ${t.accent};
            }

            .devConsole-msg {
                display: flex;
                align-items: flex-start;
                padding: 4px 8px;
                border-radius: 4px;
                margin-bottom: 2px;
                animation: devConsole-fadeIn 0.15s ease;
            }

            .devConsole-msg:hover {
                background: ${t.bgHover};
            }

            .devConsole-msg-icon {
                width: 16px;
                margin-right: 8px;
                text-align: center;
                flex-shrink: 0;
            }

            .devConsole-msg-time {
                color: ${t.textDim};
                margin-right: 12px;
                font-size: 11px;
                flex-shrink: 0;
            }

            .devConsole-msg-content {
                flex: 1;
                color: ${t.text};
                word-break: break-word;
            }

            .devConsole-msg.log .devConsole-msg-icon { color: ${t.textMuted}; }
            .devConsole-msg.info .devConsole-msg-icon { color: ${t.accent}; }
            .devConsole-msg.warn .devConsole-msg-icon { color: ${t.warning}; }
            .devConsole-msg.warn { background: rgba(234, 179, 8, 0.08); }
            .devConsole-msg.error .devConsole-msg-icon { color: ${t.error}; }
            .devConsole-msg.error { background: rgba(239, 68, 68, 0.08); }
            .devConsole-msg.success .devConsole-msg-icon { color: ${t.success}; }

            .devConsole-console-input-container {
                display: flex;
                align-items: center;
                padding: 8px;
                background: ${t.bgSecondary};
                border-top: 1px solid ${t.border};
            }

            .devConsole-console-prompt {
                color: ${t.accent};
                margin-right: 8px;
                font-family: 'JetBrains Mono', monospace;
                font-weight: 600;
            }

            .devConsole-console-input {
                flex: 1;
                background: ${t.bgTertiary};
                border: 1px solid ${t.border};
                border-radius: 4px;
                padding: 8px 12px;
                color: ${t.text};
                font-family: 'JetBrains Mono', 'Fira Code', monospace;
                font-size: 12px;
                outline: none;
                resize: none;
                min-height: 36px;
                max-height: 100px;
            }

            .devConsole-console-input:focus {
                border-color: ${t.accent};
                box-shadow: 0 0 0 2px ${t.accent}33;
            }

            .devConsole-console-input::placeholder {
                color: ${t.textDim};
            }

            /* Elements Panel */
            .devConsole-elements-container {
                flex: 1;
                overflow: auto;
                padding: 12px;
                font-family: 'JetBrains Mono', monospace;
                font-size: 12px;
                line-height: 1.6;
                color: ${t.text};
                white-space: pre-wrap;
                word-break: break-all;
            }

            .devConsole-elements-container::-webkit-scrollbar {
                width: 8px;
            }

            .devConsole-elements-container::-webkit-scrollbar-track {
                background: ${t.scrollTrack};
            }

            .devConsole-elements-container::-webkit-scrollbar-thumb {
                background: ${t.scrollThumb};
                border-radius: 4px;
            }

            /* Sources Panel */
            .devConsole-sources-container {
                display: flex;
                height: 100%;
            }

            .devConsole-sources-sidebar {
                width: 250px;
                min-width: 200px;
                background: ${t.bgSecondary};
                border-right: 1px solid ${t.border};
                overflow-y: auto;
                padding: 12px;
            }

            .devConsole-sources-section {
                margin-bottom: 16px;
            }

            .devConsole-sources-title {
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: ${t.textMuted};
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .devConsole-sources-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .devConsole-sources-item {
                padding: 6px 10px;
                font-size: 12px;
                color: ${t.text};
                cursor: pointer;
                border-radius: 4px;
                margin-bottom: 2px;
                transition: background 0.15s;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .devConsole-sources-item:hover {
                background: ${t.bgHover};
            }

            .devConsole-sources-item.active {
                background: ${t.bgActive};
                color: ${t.accent};
            }

            .devConsole-sources-preview {
                flex: 1;
                background: ${t.bgTertiary};
                overflow: hidden;
            }

            .devConsole-sources-preview iframe {
                width: 100%;
                height: 100%;
                border: none;
                background: white;
            }

            .devConsole-sources-empty {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
                color: ${t.textDim};
                font-size: 13px;
            }

            /* Tools Panel */
            .devConsole-tools-container {
                padding: 16px;
                overflow-y: auto;
            }

            .devConsole-tools-section {
                margin-bottom: 24px;
            }

            .devConsole-tools-section-title {
                font-size: 13px;
                font-weight: 600;
                color: ${t.text};
                margin-bottom: 12px;
                padding-bottom: 8px;
                border-bottom: 1px solid ${t.border};
            }

            .devConsole-json-viewer {
                font-family: 'JetBrains Mono', monospace;
                font-size: 12px;
                line-height: 1.6;
                background: ${t.bgTertiary};
                border-radius: 6px;
                padding: 12px;
                overflow-x: auto;
            }

            .devConsole-json-viewer .string { color: ${t.string}; }
            .devConsole-json-viewer .number { color: ${t.number}; }
            .devConsole-json-viewer .boolean { color: ${t.boolean}; }
            .devConsole-json-viewer .null { color: ${t.null}; }
            .devConsole-json-viewer .key { color: ${t.key}; }

            /* Settings Panel */
            .devConsole-settings-container {
                padding: 16px;
                overflow-y: auto;
            }

            .devConsole-settings-group {
                margin-bottom: 24px;
            }

            .devConsole-settings-group-title {
                font-size: 13px;
                font-weight: 600;
                color: ${t.text};
                margin-bottom: 12px;
            }

            .devConsole-setting-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px 12px;
                background: ${t.bgSecondary};
                border-radius: 6px;
                margin-bottom: 8px;
            }

            .devConsole-setting-label {
                font-size: 13px;
                color: ${t.text};
            }

            .devConsole-setting-description {
                font-size: 11px;
                color: ${t.textMuted};
                margin-top: 2px;
            }

            .devConsole-toggle {
                position: relative;
                width: 40px;
                height: 22px;
                background: ${t.border};
                border-radius: 11px;
                cursor: pointer;
                transition: background 0.2s;
            }

            .devConsole-toggle.active {
                background: ${t.accent};
            }

            .devConsole-toggle::after {
                content: '';
                position: absolute;
                top: 2px;
                left: 2px;
                width: 18px;
                height: 18px;
                background: white;
                border-radius: 50%;
                transition: transform 0.2s;
                box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            }

            .devConsole-toggle.active::after {
                transform: translateX(18px);
            }

            /* Tooltip */
            .devConsole-tooltip {
                position: fixed;
                padding: 8px 12px;
                background: ${t.bgSecondary};
                border: 1px solid ${t.border};
                border-radius: 6px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                font-family: 'JetBrains Mono', monospace;
                font-size: 11px;
                z-index: 2147483648;
                pointer-events: none;
                display: none;
            }

            .devConsole-tooltip-tag { color: #c084fc; }
            .devConsole-tooltip-class { color: ${t.success}; }
            .devConsole-tooltip-id { color: ${t.warning}; }

            /* Minimized State */
            .devConsole-container.minimized {
                height: 36px !important;
                min-height: 36px !important;
            }

            .devConsole-container.minimized .devConsole-body,
            .devConsole-container.minimized .devConsole-resize-handle {
                display: none;
            }

            /* Status Bar */
            .devConsole-status {
                display: flex;
                align-items: center;
                padding: 4px 12px;
                background: ${t.bgTertiary};
                border-top: 1px solid ${t.border};
                font-size: 11px;
                color: ${t.textMuted};
                gap: 16px;
            }

            .devConsole-status-item {
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .devConsole-status-dot {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: ${t.success};
            }

            .devConsole-btn-small {
                padding: 4px 8px;
                font-size: 10px;
                background: ${t.bgSecondary};
                border: 1px solid ${t.border};
                border-radius: 3px;
                color: ${t.textMuted};
                cursor: pointer;
                transition: all 0.15s;
            }

            .devConsole-btn-small:hover {
                background: ${t.bgHover};
                color: ${t.text};
            }
        `;
    }

    // ═══════════════════════════════════════════════════════════════
    // HTML GENERATION
    // ═══════════════════════════════════════════════════════════════
    function generateHTML() {
        return `
            <div class="devConsole-resize-handle"></div>
            <nav class="devConsole-nav">
                <button class="devConsole-nav-btn icon-btn" data-action="inspect" title="Inspect Element">🔍</button>
                <button class="devConsole-nav-btn icon-btn" data-action="edit" title="Edit Mode">✏️</button>
                <div class="devConsole-nav-divider"></div>
                <button class="devConsole-nav-btn active" data-panel="console">Console</button>
                <button class="devConsole-nav-btn" data-panel="elements">Elements</button>
                <button class="devConsole-nav-btn" data-panel="sources">Sources</button>
                <button class="devConsole-nav-btn" data-panel="tools">Tools</button>
                <button class="devConsole-nav-btn" data-panel="settings">Settings</button>
                <div class="devConsole-nav-spacer"></div>
                <button class="devConsole-nav-btn icon-btn" data-action="clear" title="Clear Console">🗑️</button>
                <button class="devConsole-nav-btn icon-btn theme-btn" data-action="theme" title="Toggle Theme">${state.theme === 'dark' ? '☀️' : '🌙'}</button>
                <button class="devConsole-nav-btn icon-btn" data-action="minimize" title="Minimize">➖</button>
                <button class="devConsole-nav-btn icon-btn close-btn" data-action="close" title="Close">✕</button>
            </nav>
            <div class="devConsole-body">
                <!-- Console Panel -->
                <div class="devConsole-panel active" data-panel="console">
                    <div class="devConsole-console-messages"></div>
                    <div class="devConsole-console-input-container">
                        <span class="devConsole-console-prompt">❯</span>
                        <textarea class="devConsole-console-input" placeholder="Enable KaHoax by typing 'KaHoax'" rows="1"></textarea>
                    </div>
                </div>
                
                <!-- Elements Panel -->
                <div class="devConsole-panel" data-panel="elements">
                    <div class="devConsole-elements-container"></div>
                </div>
                
                <!-- Sources Panel -->
                <div class="devConsole-panel" data-panel="sources">
                    <div class="devConsole-sources-container">
                        <div class="devConsole-sources-sidebar">
                            <div class="devConsole-sources-section">
                                <div class="devConsole-sources-title">
                                    Scripts
                                    <button class="devConsole-btn-small" data-action="refresh-sources">↻</button>
                                </div>
                                <ul class="devConsole-sources-list" data-type="scripts"></ul>
                            </div>
                            <div class="devConsole-sources-section">
                                <div class="devConsole-sources-title">Stylesheets</div>
                                <ul class="devConsole-sources-list" data-type="styles"></ul>
                            </div>
                            <div class="devConsole-sources-section">
                                <div class="devConsole-sources-title">Meta Tags</div>
                                <ul class="devConsole-sources-list" data-type="meta"></ul>
                            </div>
                        </div>
                        <div class="devConsole-sources-preview">
                            <div class="devConsole-sources-empty">Select a file to preview</div>
                        </div>
                    </div>
                </div>
                
                <!-- Tools Panel -->
                <div class="devConsole-panel" data-panel="tools">
                    <div class="devConsole-tools-container">
                        <div class="devConsole-tools-section">
                            <div class="devConsole-tools-section-title">📦 Local Storage</div>
                            <div class="devConsole-json-viewer" data-storage="local"></div>
                        </div>
                        <div class="devConsole-tools-section">
                            <div class="devConsole-tools-section-title">🍪 Session Storage</div>
                            <div class="devConsole-json-viewer" data-storage="session"></div>
                        </div>
                        <div class="devConsole-tools-section">
                            <div class="devConsole-tools-section-title">📋 Page Info</div>
                            <div class="devConsole-json-viewer" data-info="page"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Settings Panel -->
                <div class="devConsole-panel" data-panel="settings">
                    <div class="devConsole-settings-container">
                        <div class="devConsole-settings-group">
                            <div class="devConsole-settings-group-title">Appearance</div>
                            <div class="devConsole-setting-row">
                                <div>
                                    <div class="devConsole-setting-label">Dark Mode</div>
                                    <div class="devConsole-setting-description">Use dark color scheme</div>
                                </div>
                                <div class="devConsole-toggle ${state.theme === 'dark' ? 'active' : ''}" data-setting="darkMode"></div>
                            </div>
                        </div>
                        <div class="devConsole-settings-group">
                            <div class="devConsole-settings-group-title">Console</div>
                            <div class="devConsole-setting-row">
                                <div>
                                    <div class="devConsole-setting-label">Hijack Console</div>
                                    <div class="devConsole-setting-description">Capture console output in this panel</div>
                                </div>
                                <div class="devConsole-toggle ${state.hijackFunctions ? 'active' : ''}" data-setting="hijackConsole"></div>
                            </div>
                            <div class="devConsole-setting-row">
                                <div>
                                    <div class="devConsole-setting-label">Hide Errors/Warnings</div>
                                    <div class="devConsole-setting-description">Suppress error and warning messages</div>
                                </div>
                                <div class="devConsole-toggle ${state.hideLogs ? 'active' : ''}" data-setting="hideLogs"></div>
                            </div>
                        </div>
                        <div class="devConsole-settings-group">
                            <div class="devConsole-settings-group-title">Actions</div>
                            <div class="devConsole-setting-row">
                                <div>
                                    <div class="devConsole-setting-label">Export Page Info</div>
                                    <div class="devConsole-setting-description">Download detailed page information</div>
                                </div>
                                <button class="devConsole-btn-small" data-action="export-info">Export</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="devConsole-status">
                <div class="devConsole-status-item">
                    <span class="devConsole-status-dot"></span>
                    <span>Ready</span>
                </div>
                <div class="devConsole-status-item">
                    <span>📄 ${document.title || 'Untitled'}</span>
                </div>
                <div class="devConsole-status-item">
                    <span>📐 ${window.innerWidth} × ${window.innerHeight}</span>
                </div>
            </div>
        `;
    }

    // ═══════════════════════════════════════════════════════════════
    // TOOLTIP HTML
    // ═══════════════════════════════════════════════════════════════
    function generateTooltipHTML() {
        return `
            <span class="devConsole-tooltip-tag"></span>
            <span class="devConsole-tooltip-class"></span>
            <span class="devConsole-tooltip-id"></span>
        `;
    }

    // ═══════════════════════════════════════════════════════════════
    // JSON HIGHLIGHTER
    // ═══════════════════════════════════════════════════════════════
    function highlightJSON(obj) {
        let json;
        try {
            json = typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);
        } catch (e) {
            return '<span class="null">Unable to parse</span>';
        }
        
        if (!json || json === '{}' || json === '[]') {
            return '<span class="null">Empty</span>';
        }

        json = escapeHtml(json);
        return json.replace(
            /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
            (match) => {
                let cls = 'number';
                if (/^"/.test(match)) {
                    cls = /:$/.test(match) ? 'key' : 'string';
                } else if (/true|false/.test(match)) {
                    cls = 'boolean';
                } else if (/null/.test(match)) {
                    cls = 'null';
                }
                return `<span class="${cls}">${match}</span>`;
            }
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // MAIN INITIALIZATION
    // ═══════════════════════════════════════════════════════════════
    function init() {
        // Create style element
        const style = document.createElement('style');
        style.id = 'devConsole-styles';
        style.textContent = generateCSS();
        (document.head || document.documentElement).appendChild(style);

        // Create container
        const container = document.createElement('div');
        container.className = 'devConsole-container';
        container.innerHTML = generateHTML();
        (document.body || document.documentElement).appendChild(container);

        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'devConsole-tooltip';
        tooltip.innerHTML = generateTooltipHTML();
        (document.body || document.documentElement).appendChild(tooltip);

        // Initialize features
        initResize(container);
        initNavigation(container);
        initConsole(container);
        initElements(container);
        initSources(container);
        initTools(container);
        initSettings(container);
        initTooltip(tooltip);
        initActions(container, tooltip);

        // Add welcome message
        logMessage('info', 'Enhanced DevConsole loaded! Type "help" for commands or "KaHoax" for a surprise 🎮');
    }

    // ═══════════════════════════════════════════════════════════════
    // RESIZE FUNCTIONALITY
    // ═══════════════════════════════════════════════════════════════
    function initResize(container) {
        const handle = container.querySelector('.devConsole-resize-handle');
        
        let startY, startHeight;

        handle.addEventListener('mousedown', (e) => {
            state.isResizing = true;
            startY = e.clientY;
            startHeight = container.offsetHeight;
            handle.classList.add('active');
            document.body.style.cursor = 'ns-resize';
            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!state.isResizing) return;
            
            const delta = startY - e.clientY;
            const newHeight = Math.min(Math.max(startHeight + delta, CONFIG.minHeight), CONFIG.maxHeight);
            container.style.height = newHeight + 'px';
            state.height = newHeight;
        });

        document.addEventListener('mouseup', () => {
            if (state.isResizing) {
                state.isResizing = false;
                handle.classList.remove('active');
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                saveSettings();
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // NAVIGATION
    // ═══════════════════════════════════════════════════════════════
    function initNavigation(container) {
        const navBtns = container.querySelectorAll('.devConsole-nav-btn[data-panel]');
        const panels = container.querySelectorAll('.devConsole-panel');

        navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const panelName = btn.dataset.panel;
                
                navBtns.forEach(b => b.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));
                
                btn.classList.add('active');
                container.querySelector(`.devConsole-panel[data-panel="${panelName}"]`).classList.add('active');
            });
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // CONSOLE HIJACKING
    // ═══════════════════════════════════════════════════════════════
    function logMessage(type, msg) {
        const messagesContainer = document.querySelector('.devConsole-console-messages');
        if (!messagesContainer) return;

        const icons = {
            log: '•',
            info: 'ℹ',
            warn: '⚠',
            error: '✕',
            success: '✓'
        };

        let content = msg;
        if (typeof msg === 'object') {
            try {
                content = JSON.stringify(msg, null, 2);
            } catch (e) {
                content = String(msg);
            }
        }

        const msgEl = document.createElement('div');
        msgEl.className = `devConsole-msg ${type}`;
        msgEl.innerHTML = `
            <span class="devConsole-msg-icon">${icons[type] || '•'}</span>
            <span class="devConsole-msg-time">${getTimestamp()}</span>
            <span class="devConsole-msg-content">${escapeHtml(String(content))}</span>
        `;

        messagesContainer.appendChild(msgEl);

        // Limit messages
        while (messagesContainer.children.length > CONFIG.consoleMaxMessages) {
            messagesContainer.removeChild(messagesContainer.firstChild);
        }

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function initConsole(container) {
        const input = container.querySelector('.devConsole-console-input');

        // Hijack console methods
        console.log = function(...args) {
            if (state.hijackFunctions) {
                args.forEach(arg => logMessage('log', arg));
            }
            state.originalConsole.log.apply(console, args);
        };

        console.info = function(...args) {
            if (state.hijackFunctions) {
                args.forEach(arg => logMessage('info', arg));
            }
            state.originalConsole.info.apply(console, args);
        };

        console.warn = function(...args) {
            if (state.hijackFunctions && !state.hideLogs) {
                args.forEach(arg => logMessage('warn', arg));
            }
            state.originalConsole.warn.apply(console, args);
        };

        console.error = function(...args) {
            if (state.hijackFunctions && !state.hideLogs) {
                args.forEach(arg => logMessage('error', arg));
            }
            state.originalConsole.error.apply(console, args);
        };

        // Input handling
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const code = input.value.trim();
                if (!code) return;

                // Built-in commands
                const cmd = code.toLowerCase();
                if (cmd === 'clear' || cmd === 'clear()') {
                    container.querySelector('.devConsole-console-messages').innerHTML = '';
                    logMessage('info', 'Console cleared');
                    input.value = '';
                    return;
                }

                if (cmd === 'help') {
                    logMessage('info', `
Available commands:
  clear       - Clear the console
  help        - Show this help
  info        - Download page information
  reload      - Reload the page
  kahoax      - Load KaHoax (Kahoot hack)
                    `.trim());
                    input.value = '';
                    return;
                }

                if (cmd === 'info') {
                    exportPageInfo();
                    input.value = '';
                    return;
                }

                if (cmd === 'reload') {
                    location.reload();
                    return;
                }

                // KaHoax easter egg - load KaHoax script
                if (cmd === 'kahoax') {
                    logMessage('info', '🎮 Loading KaHoax...');
                    loadKaHoax();
                    input.value = '';
                    return;
                }

                // Execute JavaScript
                try {
                    const result = eval(code);
                    logMessage('success', result);
                } catch (err) {
                    logMessage('error', err.message);
                }

                input.value = '';
            }

            // Clear with Ctrl+L
            if (e.key === 'l' && e.ctrlKey) {
                e.preventDefault();
                container.querySelector('.devConsole-console-messages').innerHTML = '';
                logMessage('info', 'Console cleared');
            }
        });

        // Auto-resize textarea
        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 100) + 'px';
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // ELEMENTS PANEL
    // ═══════════════════════════════════════════════════════════════
    function initElements(container) {
        const elementsContainer = container.querySelector('.devConsole-elements-container');
        
        function formatHTML(html) {
            // Simple HTML formatting
            return html
                .replace(/></g, '>\n<')
                .replace(/(<[^/][^>]*>)/g, '\n$1')
                .split('\n')
                .filter(line => line.trim())
                .join('\n');
        }

        // Update elements view
        function updateElements() {
            const html = document.body.innerHTML;
            elementsContainer.textContent = formatHTML(html);
        }

        // Initial update
        updateElements();
    }

    // ═══════════════════════════════════════════════════════════════
    // SOURCES PANEL
    // ═══════════════════════════════════════════════════════════════
    function initSources(container) {
        const scriptsList = container.querySelector('.devConsole-sources-list[data-type="scripts"]');
        const stylesList = container.querySelector('.devConsole-sources-list[data-type="styles"]');
        const metaList = container.querySelector('.devConsole-sources-list[data-type="meta"]');
        const preview = container.querySelector('.devConsole-sources-preview');

        function refreshSources() {
            scriptsList.innerHTML = '';
            stylesList.innerHTML = '';
            metaList.innerHTML = '';

            // Scripts
            document.querySelectorAll('script[src]').forEach(script => {
                const li = document.createElement('li');
                li.className = 'devConsole-sources-item';
                li.textContent = script.src.split('/').pop() || script.src;
                li.title = script.src;
                li.addEventListener('click', () => showPreview(script.src, li));
                scriptsList.appendChild(li);
            });

            // Styles
            document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
                const li = document.createElement('li');
                li.className = 'devConsole-sources-item';
                li.textContent = link.href.split('/').pop() || link.href;
                li.title = link.href;
                li.addEventListener('click', () => showPreview(link.href, li));
                stylesList.appendChild(li);
            });

            // Meta
            document.querySelectorAll('meta').forEach(meta => {
                const name = meta.name || meta.property || meta.httpEquiv || 'unnamed';
                const li = document.createElement('li');
                li.className = 'devConsole-sources-item';
                li.textContent = name;
                li.title = meta.content || '';
                li.addEventListener('click', () => {
                    alert(`${name}: ${meta.content || 'No content'}`);
                });
                metaList.appendChild(li);
            });

            if (scriptsList.children.length === 0) {
                scriptsList.innerHTML = '<li class="devConsole-sources-item" style="opacity: 0.5;">No external scripts</li>';
            }
            if (stylesList.children.length === 0) {
                stylesList.innerHTML = '<li class="devConsole-sources-item" style="opacity: 0.5;">No external styles</li>';
            }
            if (metaList.children.length === 0) {
                metaList.innerHTML = '<li class="devConsole-sources-item" style="opacity: 0.5;">No meta tags</li>';
            }
        }

        function showPreview(url, activeItem) {
            // Update active state
            container.querySelectorAll('.devConsole-sources-item').forEach(item => {
                item.classList.remove('active');
            });
            activeItem.classList.add('active');

            // Show iframe preview
            preview.innerHTML = `<iframe src="${url}" sandbox="allow-same-origin"></iframe>`;
        }

        // Initial load
        refreshSources();

        // Refresh button
        container.querySelector('[data-action="refresh-sources"]').addEventListener('click', refreshSources);
    }

    // ═══════════════════════════════════════════════════════════════
    // TOOLS PANEL
    // ═══════════════════════════════════════════════════════════════
    function initTools(container) {
        const localStorageView = container.querySelector('.devConsole-json-viewer[data-storage="local"]');
        const sessionStorageView = container.querySelector('.devConsole-json-viewer[data-storage="session"]');
        const pageInfoView = container.querySelector('.devConsole-json-viewer[data-info="page"]');

        function refreshTools() {
            // Local Storage
            try {
                localStorageView.innerHTML = highlightJSON(localStorage);
            } catch (e) {
                localStorageView.innerHTML = '<span class="null">Unable to access</span>';
            }

            // Session Storage
            try {
                sessionStorageView.innerHTML = highlightJSON(sessionStorage);
            } catch (e) {
                sessionStorageView.innerHTML = '<span class="null">Unable to access</span>';
            }

            // Page Info
            const pageInfo = {
                url: location.href,
                title: document.title,
                referrer: document.referrer || 'Direct',
                viewport: `${window.innerWidth} × ${window.innerHeight}`,
                scripts: document.scripts.length,
                stylesheets: document.styleSheets.length,
                images: document.images.length,
                links: document.links.length,
                cookies: document.cookie ? document.cookie.split(';').length : 0
            };
            pageInfoView.innerHTML = highlightJSON(pageInfo);
        }

        // Initial load
        refreshTools();

        // Refresh when panel becomes active
        const toolsPanel = container.querySelector('.devConsole-panel[data-panel="tools"]');
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.target.classList.contains('active')) {
                    refreshTools();
                }
            });
        });
        observer.observe(toolsPanel, { attributes: true, attributeFilter: ['class'] });
    }

    // ═══════════════════════════════════════════════════════════════
    // SETTINGS PANEL
    // ═══════════════════════════════════════════════════════════════
    function initSettings(container) {
        const toggles = container.querySelectorAll('.devConsole-toggle');

        toggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const setting = toggle.dataset.setting;
                toggle.classList.toggle('active');

                switch (setting) {
                    case 'darkMode':
                        state.theme = toggle.classList.contains('active') ? 'dark' : 'light';
                        updateTheme();
                        saveSettings();
                        break;
                    case 'hijackConsole':
                        state.hijackFunctions = toggle.classList.contains('active');
                        break;
                    case 'hideLogs':
                        state.hideLogs = toggle.classList.contains('active');
                        break;
                }
            });
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // TOOLTIP
    // ═══════════════════════════════════════════════════════════════
    function initTooltip(tooltip) {
        const tagEl = tooltip.querySelector('.devConsole-tooltip-tag');
        const classEl = tooltip.querySelector('.devConsole-tooltip-class');
        const idEl = tooltip.querySelector('.devConsole-tooltip-id');

        document.addEventListener('mousemove', (e) => {
            if (!state.tooltipEnabled || !state.loaded) return;

            const target = e.target;
            if (target.closest('.devConsole-container') || target.closest('.devConsole-tooltip')) {
                tooltip.style.display = 'none';
                return;
            }

            tooltip.style.display = 'block';
            tooltip.style.left = (e.pageX + 12) + 'px';
            tooltip.style.top = (e.pageY + 12) + 'px';

            tagEl.textContent = target.tagName.toLowerCase();
            classEl.textContent = target.className ? '.' + target.className.split(' ').join('.') : '';
            idEl.textContent = target.id ? '#' + target.id : '';
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // ACTIONS
    // ═══════════════════════════════════════════════════════════════
    function initActions(container, tooltip) {
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;

            const action = btn.dataset.action;

            switch (action) {
                case 'inspect':
                    state.tooltipEnabled = !state.tooltipEnabled;
                    btn.classList.toggle('active', state.tooltipEnabled);
                    tooltip.style.display = 'none';
                    logMessage('info', `Element inspector ${state.tooltipEnabled ? 'enabled' : 'disabled'}`);
                    break;

                case 'edit':
                    const isEditing = document.body.contentEditable === 'true';
                    document.body.contentEditable = isEditing ? 'false' : 'true';
                    document.designMode = isEditing ? 'off' : 'on';
                    btn.classList.toggle('active', !isEditing);
                    logMessage('info', `Edit mode ${!isEditing ? 'enabled' : 'disabled'}`);
                    break;

                case 'clear':
                    container.querySelector('.devConsole-console-messages').innerHTML = '';
                    logMessage('info', 'Console cleared');
                    break;

                case 'theme':
                    state.theme = state.theme === 'dark' ? 'light' : 'dark';
                    updateTheme();
                    btn.textContent = state.theme === 'dark' ? '☀️' : '🌙';
                    saveSettings();
                    // Update settings toggle
                    const darkModeToggle = container.querySelector('[data-setting="darkMode"]');
                    if (darkModeToggle) {
                        darkModeToggle.classList.toggle('active', state.theme === 'dark');
                    }
                    break;

                case 'minimize':
                    container.classList.toggle('minimized');
                    btn.textContent = container.classList.contains('minimized') ? '➕' : '➖';
                    break;

                case 'close':
                    if (confirm('Close Developer Console?')) {
                        cleanup(container, tooltip);
                    }
                    break;

                case 'export-info':
                    exportPageInfo();
                    break;
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // THEME UPDATE
    // ═══════════════════════════════════════════════════════════════
    function updateTheme() {
        const style = document.getElementById('devConsole-styles');
        if (style) {
            style.textContent = generateCSS();
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // EXPORT PAGE INFO
    // ═══════════════════════════════════════════════════════════════
    function exportPageInfo() {
        const info = `
═══════════════════════════════════════════════════════════════
                    WEBSITE INFORMATION EXPORT
═══════════════════════════════════════════════════════════════

📍 LOCATION
   URL: ${location.href}
   Protocol: ${location.protocol}
   Host: ${location.host}
   Pathname: ${location.pathname}

📄 DOCUMENT
   Title: ${document.title || 'Untitled'}
   Character Set: ${document.characterSet}
   Content Type: ${document.contentType}
   Referrer: ${document.referrer || 'Direct Navigation'}

📐 VIEWPORT
   Window Size: ${window.innerWidth} × ${window.innerHeight}
   Screen Size: ${screen.width} × ${screen.height}
   Device Pixel Ratio: ${window.devicePixelRatio}

📊 PAGE STATS
   HTML Length: ${document.documentElement.innerHTML.length.toLocaleString()} characters
   Scripts: ${document.scripts.length}
   Stylesheets: ${document.styleSheets.length}
   Images: ${document.images.length}
   Links: ${document.links.length}
   Forms: ${document.forms.length}

🌐 NAVIGATOR
   User Agent: ${navigator.userAgent}
   Language: ${navigator.language}
   Platform: ${navigator.platform}
   Cookies Enabled: ${navigator.cookieEnabled}
   Online: ${navigator.onLine}

⏰ TIMING
   Export Date: ${new Date().toISOString()}
   Timezone Offset: ${(new Date()).getTimezoneOffset() / 60} hours

🍪 COOKIES
${document.cookie || '   (none)'}

💾 LOCAL STORAGE
${JSON.stringify(localStorage, null, 2) || '   (empty)'}

💾 SESSION STORAGE
${JSON.stringify(sessionStorage, null, 2) || '   (empty)'}

═══════════════════════════════════════════════════════════════
        `.trim();

        downloadSiteInfo('page-info-' + new Date().toISOString().slice(0, 10) + '.txt', info);
        logMessage('success', 'Page info exported successfully');
    }

    // ═══════════════════════════════════════════════════════════════
    // CLEANUP
    // ═══════════════════════════════════════════════════════════════
    function cleanup(container, tooltip) {
        // Restore console
        console.log = state.originalConsole.log;
        console.warn = state.originalConsole.warn;
        console.error = state.originalConsole.error;
        console.info = state.originalConsole.info;

        // Reset edit mode
        document.body.contentEditable = 'false';
        document.designMode = 'off';

        // Remove elements
        container.remove();
        tooltip.remove();
        document.getElementById('devConsole-styles')?.remove();

        // Update state
        state.loaded = false;
        state.showing = false;
    }

    // ═══════════════════════════════════════════════════════════════
    // KAHOAX LOADER
    // ═══════════════════════════════════════════════════════════════
    function loadKaHoax() {
        // Check if KaHoax is already loaded
        if (window.KaHoaxLoaded) {
            logMessage('warn', 'KaHoax is already loaded!');
            return;
        }

        // KaHoax script URL - update this with your hosted URL
        const KAHOAX_CDN_URL = 'https://cdn.jsdelivr.net/gh/KRWCLASSIC/KaHoax@main/KaHoax.user.js';
        
        logMessage('info', '🔄 Fetching KaHoax script...');
        
        // Try loading from CDN first
        const script = document.createElement('script');
        script.src = KAHOAX_CDN_URL;
        script.onload = () => {
            window.KaHoaxLoaded = true;
            logMessage('success', '✅ KaHoax loaded successfully! The UI should appear on the page.');
        };
        script.onerror = () => {
            logMessage('warn', '⚠️ CDN failed, loading inline KaHoax...');
            loadInlineKaHoax();
        };
        
        document.head.appendChild(script);
    }
    
    function loadInlineKaHoax() {
        // Inline KaHoax loader - contains the full KaHoax script
        const kahoaxCode = `
// ==UserScript==
// @name         KaHoax
// @version      1.1.4.1
// @description  A hack for kahoot.it!
// ==/UserScript==
(function() {
    var Version = '1.1.4.1';
    var questions = [];
    var info = { numQuestions: 0, questionNum: -1, lastAnsweredQuestion: -1, defaultIL: true, ILSetQuestion: -1 };
    var PPT = 900, Answered_PPT = 900, autoAnswer = false, showAnswers = false, inputLag = 100, lastValidQuizID = null;

    function FindByAttributeValue(attribute, value, element_type) {
        element_type = element_type || "*";
        var All = document.getElementsByTagName(element_type);
        for (var i = 0; i < All.length; i++) { if (All[i].getAttribute(attribute) == value) return All[i]; }
    }

    function sanitizeInput(val) {
        val = val.trim();
        if (val.indexOf("https//") === 0) val = val.replace("https//", "https://");
        if (/^https?:\\/\\//i.test(val)) { var parts = val.replace(/^https?:\\/\\//i, '').split('/'); return parts.filter(Boolean).pop(); }
        return val;
    }

    function isValidGameId(str) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str); }

    // Create UI
    const uiElement = document.createElement('div');
    uiElement.className = 'floating-ui';
    uiElement.style.cssText = 'position:fixed;top:5%;left:5%;width:350px;max-width:90vw;height:auto;max-height:90vh;overflow-y:auto;background:#1e1e1e;border-radius:10px;box-shadow:0 0 10px rgba(0,0,0,0.5);z-index:9999;font-size:16px;font-family:"Montserrat","Helvetica Neue",Helvetica,Arial,sans-serif;';

    const handle = document.createElement('div');
    handle.style.cssText = 'width:100%;height:40px;background:#2c2c2c;border-radius:10px 10px 0 0;cursor:grab;display:flex;align-items:center;padding-left:15px;box-sizing:border-box;position:sticky;top:0;z-index:10001;';
    
    const kahootIcon = document.createElement('img');
    kahootIcon.src = 'https://icons.iconarchive.com/icons/simpleicons-team/simple/256/kahoot-icon.png';
    kahootIcon.style.cssText = 'height:22px;width:22px;margin-right:8px;filter:brightness(0) invert(1);';
    handle.appendChild(kahootIcon);

    const appTitle = document.createElement('span');
    appTitle.innerHTML = 'KaHoax <span style="font-size:0.8em;opacity:0.7;">v' + Version + '</span>';
    appTitle.style.color = 'white';
    handle.appendChild(appTitle);

    const closeButton = document.createElement('div');
    closeButton.textContent = '✕';
    closeButton.style.cssText = 'position:absolute;top:0;right:0;width:40px;height:40px;background:#ff4d4d;color:white;border-radius:0 10px 0 0;display:flex;justify-content:center;align-items:center;cursor:pointer;';
    closeButton.onclick = () => document.body.removeChild(uiElement);
    handle.appendChild(closeButton);

    const minimizeButton = document.createElement('div');
    minimizeButton.textContent = '─';
    minimizeButton.style.cssText = 'position:absolute;top:0;right:40px;width:40px;height:40px;background:#555;color:white;display:flex;justify-content:center;align-items:center;cursor:pointer;';
    handle.appendChild(minimizeButton);

    uiElement.appendChild(handle);

    // Header
    const headerText = document.createElement('h2');
    headerText.textContent = 'QUIZ ID or NAME';
    headerText.style.cssText = 'display:block;margin:15px 0;text-align:center;font-size:1.25em;color:white;text-shadow:0 0 5px rgba(0,0,0,0.5);';
    uiElement.appendChild(headerText);

    // Input container
    const inputContainer = document.createElement('div');
    inputContainer.style.cssText = 'display:flex;flex-direction:column;align-items:center;position:relative;width:90%;margin:0 auto 15px;';

    const inputBox = document.createElement('input');
    inputBox.type = 'text';
    inputBox.placeholder = 'Quiz Id or search for the Quiz here...';
    inputBox.style.cssText = 'color:#fff;width:100%;height:35px;padding:0 10px;border:1px solid #444;border-radius:10px;outline:none;text-align:center;font-size:0.9em;background:#333;box-sizing:border-box;';
    inputContainer.appendChild(inputBox);

    // Button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'display:flex;width:100%;margin-top:10px;gap:8px;justify-content:space-between;';

    const enterButton = document.createElement('button');
    enterButton.textContent = 'Enter';
    enterButton.style.cssText = 'flex-grow:1;height:35px;font-size:0.9em;cursor:pointer;background:#6c757d;color:white;border:none;border-radius:5px;padding:8px;transition:background 0.3s;';
    enterButton.onclick = handleInputChange;
    buttonContainer.appendChild(enterButton);

    inputContainer.appendChild(buttonContainer);
    uiElement.appendChild(inputContainer);

    // Dropdown
    const dropdown = document.createElement('div');
    dropdown.style.cssText = 'position:absolute;top:calc(100%+5px);left:0;width:100%;background:#2c2c2c;border:1px solid #444;border-radius:10px;z-index:10000;max-height:300px;overflow-y:auto;display:none;';
    inputContainer.appendChild(dropdown);

    // Answering section
    const header3 = document.createElement('h2');
    header3.textContent = 'ANSWERING';
    header3.style.cssText = 'display:block;margin:15px 0;text-align:center;font-size:1.25em;color:white;text-shadow:0 0 5px rgba(0,0,0,0.5);';
    uiElement.appendChild(header3);

    const answeringContainer = document.createElement('div');
    answeringContainer.style.cssText = 'display:flex;flex-direction:column;align-items:center;margin:15px auto;width:90%;';

    // Toggle switches
    const togglesContainer = document.createElement('div');
    togglesContainer.style.cssText = 'display:flex;align-items:center;justify-content:space-evenly;width:100%;margin-bottom:15px;';

    function createToggle(label, onChange) {
        const container = document.createElement('div');
        container.style.cssText = 'display:flex;align-items:center;gap:10px;';
        const labelEl = document.createElement('span');
        labelEl.textContent = label;
        labelEl.style.cssText = 'font-size:0.9em;color:white;';
        container.appendChild(labelEl);
        const switchEl = document.createElement('label');
        switchEl.style.cssText = 'position:relative;display:inline-block;width:40px;height:20px;';
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.style.cssText = 'opacity:0;width:0;height:0;';
        input.onchange = function() { onChange(this.checked); slider.style.background = this.checked ? '#4CAF50' : '#888'; knob.style.transform = this.checked ? 'translateX(20px)' : 'translateX(0)'; };
        switchEl.appendChild(input);
        const slider = document.createElement('span');
        slider.style.cssText = 'position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background:#888;transition:0.4s;border-radius:10px;';
        const knob = document.createElement('span');
        knob.style.cssText = 'position:absolute;height:16px;width:16px;left:2px;bottom:2px;background:#fff;transition:0.4s;border-radius:50%;';
        slider.appendChild(knob);
        switchEl.appendChild(slider);
        container.appendChild(switchEl);
        return container;
    }

    togglesContainer.appendChild(createToggle('Auto', (checked) => { autoAnswer = checked; info.ILSetQuestion = info.questionNum; }));
    togglesContainer.appendChild(createToggle('Show', (checked) => { showAnswers = checked; }));
    answeringContainer.appendChild(togglesContainer);

    // Points slider
    const sliderContainer = document.createElement('div');
    sliderContainer.style.cssText = 'width:100%;display:flex;flex-direction:column;align-items:center;';
    const pointsLabel = document.createElement('span');
    pointsLabel.textContent = 'Points per Question: ~900';
    pointsLabel.style.cssText = 'font-size:0.9em;margin:0 0 10px;color:white;';
    sliderContainer.appendChild(pointsLabel);
    const pointsSlider = document.createElement('input');
    pointsSlider.type = 'range';
    pointsSlider.min = '500';
    pointsSlider.max = '1000';
    pointsSlider.value = '900';
    pointsSlider.style.cssText = 'width:100%;cursor:pointer;';
    pointsSlider.oninput = () => { PPT = +pointsSlider.value; pointsLabel.textContent = 'Points per Question: ~' + PPT; };
    sliderContainer.appendChild(pointsSlider);
    answeringContainer.appendChild(sliderContainer);
    uiElement.appendChild(answeringContainer);

    // Info section
    const header4 = document.createElement('h2');
    header4.textContent = 'INFO';
    header4.style.cssText = 'display:block;margin:15px 0;text-align:center;font-size:1.25em;color:white;text-shadow:0 0 5px rgba(0,0,0,0.5);';
    uiElement.appendChild(header4);

    const questionsLabel = document.createElement('span');
    questionsLabel.textContent = 'Question 0 / ?';
    questionsLabel.style.cssText = 'display:block;font-size:0.9em;text-align:center;margin:10px 0;color:white;';
    uiElement.appendChild(questionsLabel);

    // Dragging
    let isDragging = false, offsetX, offsetY;
    handle.onmousedown = (e) => { isDragging = true; offsetX = e.clientX - uiElement.getBoundingClientRect().left; offsetY = e.clientY - uiElement.getBoundingClientRect().top; };
    document.onmousemove = (e) => { if (isDragging) { uiElement.style.left = (e.clientX - offsetX) + 'px'; uiElement.style.top = (e.clientY - offsetY) + 'px'; } };
    document.onmouseup = () => { isDragging = false; };

    // Minimize
    let isMinimized = false;
    minimizeButton.onclick = () => {
        isMinimized = !isMinimized;
        [headerText, header3, header4, inputContainer, answeringContainer, questionsLabel].forEach(el => el.style.display = isMinimized ? 'none' : el === inputContainer || el === answeringContainer ? 'flex' : 'block');
        uiElement.style.height = isMinimized ? '40px' : 'auto';
        uiElement.style.overflowY = isMinimized ? 'hidden' : 'auto';
    };

    function searchPublicUUID(searchTerm) {
        fetch('https://damp-leaf-16aa.johnwee.workers.dev/rest/kahoots/?query=' + encodeURIComponent(searchTerm))
            .then(r => r.json())
            .then(data => {
                dropdown.innerHTML = '';
                let results = data.entities || [];
                if (results.length > 0) {
                    results.forEach(entity => {
                        let card = entity.card || {};
                        const item = document.createElement('div');
                        item.style.cssText = 'display:flex;align-items:center;padding:8px;cursor:pointer;border-bottom:1px solid #444;';
                        item.onmouseover = () => item.style.background = '#444';
                        item.onmouseout = () => item.style.background = 'transparent';
                        const img = document.createElement('img');
                        img.src = card.cover || 'https://dummyimage.com/40x40/ccc/fff';
                        img.style.cssText = 'width:40px;height:40px;margin-right:10px;border-radius:5px;object-fit:cover;';
                        item.appendChild(img);
                        const text = document.createElement('span');
                        text.textContent = card.title || 'No title';
                        text.style.cssText = 'color:#fff;font-size:0.9em;flex:1;';
                        item.appendChild(text);
                        item.onclick = () => { inputBox.value = card.uuid || ''; dropdown.style.display = 'none'; handleInputChange(); };
                        dropdown.appendChild(item);
                    });
                    dropdown.style.display = 'block';
                }
            });
    }

    function handleInputChange() {
        var quizID = sanitizeInput(inputBox.value);
        if (quizID !== "") {
            fetch('https://damp-leaf-16aa.johnwee.workers.dev/api-proxy/' + encodeURIComponent(quizID))
                .then(r => { if (!r.ok) throw new Error(); return r.json(); })
                .then(data => {
                    inputBox.style.background = 'green';
                    dropdown.style.display = 'none';
                    questions = parseQuestions(data.questions);
                    info.numQuestions = questions.length;
                    lastValidQuizID = quizID;
                })
                .catch(() => { inputBox.style.background = 'red'; info.numQuestions = 0; searchPublicUUID(quizID); });
        } else {
            inputBox.style.background = '#333';
            info.numQuestions = 0;
        }
    }

    document.body.appendChild(uiElement);

    function parseQuestions(questionsJson) {
        let questions = [];
        questionsJson.forEach(q => {
            let parsed = { type: q.type, time: q.time, answers: [], incorrectAnswers: [] };
            if (['quiz', 'multiple_select_quiz'].includes(q.type)) {
                q.choices.forEach((c, i) => { if (c.correct) parsed.answers.push(i); else parsed.incorrectAnswers.push(i); });
            }
            if (q.type == 'open_ended') q.choices.forEach(c => parsed.answers.push(c.answer));
            questions.push(parsed);
        });
        return questions;
    }

    function onQuestionStart() {
        var question = questions[info.questionNum];
        if (showAnswers) highlightAnswers(question);
        if (autoAnswer) answer(question, (question.time - question.time / (500/(PPT-500))) - inputLag);
    }

    function highlightAnswers(question) {
        question.answers.forEach(a => { setTimeout(() => { const btn = FindByAttributeValue("data-functional-selector", 'answer-' + a, "button"); if (btn) btn.style.background = 'rgb(0,255,0)'; }, 0); });
        question.incorrectAnswers.forEach(a => { setTimeout(() => { const btn = FindByAttributeValue("data-functional-selector", 'answer-' + a, "button"); if (btn) btn.style.background = 'rgb(255,0,0)'; }, 0); });
    }

    function answer(question, time) {
        Answered_PPT = PPT;
        var delay = question.type == 'multiple_select_quiz' ? 60 : 0;
        setTimeout(() => {
            if (question.type == 'quiz') window.dispatchEvent(new KeyboardEvent('keydown', { key: (+question.answers[0] + 1).toString() }));
            if (question.type == 'multiple_select_quiz') {
                question.answers.forEach(a => { setTimeout(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: (+a + 1).toString() })), 0); });
                setTimeout(() => { const btn = FindByAttributeValue("data-functional-selector", 'multi-select-submit-button', "button"); if (btn) btn.click(); }, 0);
            }
        }, time - delay);
    }

    setInterval(() => {
        var textElement = FindByAttributeValue("data-functional-selector", "question-index-counter", "div");
        if (textElement) info.questionNum = +textElement.textContent - 1;
        if (FindByAttributeValue("data-functional-selector", 'answer-0', "button") && info.lastAnsweredQuestion != info.questionNum) {
            info.lastAnsweredQuestion = info.questionNum;
            onQuestionStart();
        }
        if (autoAnswer && info.ILSetQuestion != info.questionNum) {
            var ppt = Answered_PPT > 987 ? 1000 : Answered_PPT;
            var incrementElement = FindByAttributeValue("data-functional-selector", "score-increment", "span");
            if (incrementElement) {
                info.ILSetQuestion = info.questionNum;
                var increment = +incrementElement.textContent.split(" ")[1];
                if (increment != 0) { inputLag += (ppt - increment) * 15; if (inputLag < 0) inputLag = (ppt - increment/2) * 15; inputLag = Math.round(inputLag); }
            }
        }
        questionsLabel.textContent = 'Question ' + (info.questionNum + 1) + ' / ' + (info.numQuestions > 0 ? info.numQuestions : '?');
    }, 1);

    window.KaHoaxLoaded = true;
})();
        `;
        
        try {
            eval(kahoaxCode);
            window.KaHoaxLoaded = true;
            logMessage('success', '✅ KaHoax loaded successfully (inline)! The UI should appear on the page.');
        } catch (err) {
            logMessage('error', '❌ Failed to load KaHoax: ' + err.message);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // START
    // ═══════════════════════════════════════════════════════════════
    init();
})();

// Export for external use
window.DevConsoleEnhanced = {
    loaded: true,
    version: '1.0.0'
};
