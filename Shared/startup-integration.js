// Add this code to your ExcalidrawStartup.md file
// Just paste it at the end of the file, after the existing hooks

// ============================================================================
// LINK-BASED CLIPBOARD SYSTEM
// ============================================================================

// Configuration
const CLIPBOARD_CONFIG = {
    clipboardPrefix: "clip:",
    showSuccessIndicator: true,
    successDuration: 2000,
    autoConvert: {
        enabled: true,
        patterns: [
            { match: /^email:(.+)/, transform: (m) => m[1] },
            { match: /^tel:(.+)/, transform: (m) => m[1] },
            { match: /^copy:(.+)/, transform: (m) => m[1] }
        ]
    }
};

// Store original hook if it exists
const originalLinkClickHook = ea.onLinkClickHook;

// Extract clipboard text from link
function extractClipboardText(link) {
    if (!link) return null;
    
    // Skip actual URLs
    if (link.match(/^https?:\/\//i)) {
        return null;
    }
    
    // Check for clipboard prefix
    if (CLIPBOARD_CONFIG.clipboardPrefix && link.startsWith(CLIPBOARD_CONFIG.clipboardPrefix)) {
        return link.substring(CLIPBOARD_CONFIG.clipboardPrefix.length);
    }
    
    // Apply auto-convert patterns
    if (CLIPBOARD_CONFIG.autoConvert.enabled) {
        for (const pattern of CLIPBOARD_CONFIG.autoConvert.patterns) {
            const match = link.match(pattern.match);
            if (match) {
                return pattern.transform(match);
            }
        }
    }
    
    // Treat entire link as clipboard text
    return link;
}

// Show success feedback
function showClipboardFeedback(element, clipboardText, ea) {
    if (!CLIPBOARD_CONFIG.showSuccessIndicator) return;
    
    try {
        const api = ea.getExcalidrawAPI();
        
        if (api && api.setToast) {
            const preview = clipboardText.substring(0, 30) + (clipboardText.length > 30 ? '...' : '');
            api.setToast({
                message: `✅ Copied: ${preview}`,
                duration: CLIPBOARD_CONFIG.successDuration,
                closable: true
            });
        } else {
            const preview = clipboardText.substring(0, 50) + (clipboardText.length > 50 ? '...' : '');
            new Notice(`✅ Copied: ${preview}`, CLIPBOARD_CONFIG.successDuration);
        }
    } catch (error) {
        new Notice("✅ Copied to clipboard!", CLIPBOARD_CONFIG.successDuration);
    }
}

// Log to history
function logClipboardHistory(element, text) {
    try {
        const history = JSON.parse(localStorage.getItem('ea-clipboard-history') || '[]');
        
        history.unshift({
            text: text,
            elementType: element.type,
            timestamp: new Date().toISOString(),
            label: element.text || `${element.type} element`
        });
        
        if (history.length > 50) {
            history.length = 50;
        }
        
        localStorage.setItem('ea-clipboard-history', JSON.stringify(history));
    } catch (error) {
        console.error("Error logging clipboard history:", error);
    }
}

// Set up the link click hook for clipboard functionality
ea.onLinkClickHook = async (element, linkText, event, view, ea) => {
    // Check if this is a clipboard link
    const clipboardText = extractClipboardText(linkText);
    
    if (clipboardText) {
        // This is a clipboard link - handle it
        try {
            await navigator.clipboard.writeText(clipboardText);
            
            // Show success feedback
            showClipboardFeedback(element, clipboardText, ea);
            
            // Log to history
            logClipboardHistory(element, clipboardText);
            
            // Return false to prevent default link handling
            return false;
            
        } catch (err) {
            new Notice(`❌ Failed to copy: ${err.message}`);
            return false;
        }
    } else {
        // This is a regular link - let the original handler deal with it
        if (originalLinkClickHook) {
            return originalLinkClickHook(element, linkText, event, view, ea);
        }
        // Return true to allow default link handling
        return true;
    }
};

// Add commands for clipboard functionality
if (app.commands) {
    // Show clipboard history command
    app.commands.addCommand({
        id: 'ea-show-clipboard-history-startup',
        name: 'Show clipboard history',
        callback: async () => {
            try {
                const history = JSON.parse(localStorage.getItem('ea-clipboard-history') || '[]');
                
                if (history.length === 0) {
                    new Notice("No clipboard history");
                    return;
                }
                
                const items = history.slice(0, 10);
                let selectedItem = null;
                
                // Try QuickAdd first
                if (app.plugins.plugins['quickadd']?.api?.suggester) {
                    try {
                        selectedItem = await app.plugins.plugins['quickadd'].api.suggester(
                            items.map(h => `${h.label} - ${new Date(h.timestamp).toLocaleString()}`),
                            items
                        );
                    } catch (error) {
                        // Fallback to most recent
                        selectedItem = items[0];
                        new Notice(`Copying most recent: ${selectedItem.label}`);
                    }
                } else {
                    selectedItem = items[0];
                    new Notice(`Copying most recent: ${selectedItem.label}`);
                }
                
                if (selectedItem) {
                    await navigator.clipboard.writeText(selectedItem.text);
                    new Notice("✅ Copied from history!");
                }
            } catch (error) {
                new Notice(`❌ Error accessing history: ${error.message}`);
            }
        }
    });
    
    // Highlight clipboard elements command
    app.commands.addCommand({
        id: 'ea-highlight-clipboard-elements-startup',
        name: 'Highlight clipboard elements',
        callback: () => {
            try {
                const api = ea.getExcalidrawAPI();
                if (!api) return;
                
                const elements = api.getSceneElements();
                const clipboardElements = elements.filter(el => 
                    el.link && extractClipboardText(el.link)
                );
                
                if (clipboardElements.length === 0) {
                    new Notice("No clipboard elements found");
                    return;
                }
                
                const modifiedElements = elements.map(element => {
                    if (clipboardElements.includes(element)) {
                        return {
                            ...element,
                            strokeStyle: element.strokeStyle === "dashed" ? "solid" : "dashed",
                            strokeWidth: Math.max(element.strokeWidth || 1, 2)
                        };
                    }
                    return element;
                });
                
                api.updateScene({ elements: modifiedElements });
                new Notice(`📋 Found ${clipboardElements.length} clipboard elements (dashed outline)`);
                
            } catch (error) {
                console.error("Error highlighting clipboard elements:", error);
            }
        }
    });
}

// Success message
new Notice("🔗 Link-based clipboard system loaded!", 2000);