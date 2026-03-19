# Excalidraw Scripting Guide: Complete Implementation Explanation

## Table of Contents
1. [Understanding the Architecture](#understanding-the-architecture)
2. [The Hook System](#the-hook-system)
3. [Code Structure Analysis](#code-structure-analysis)
4. [Key Concepts](#key-concepts)
5. [Building Your Own Scripts](#building-your-own-scripts)
6. [Advanced Techniques](#advanced-techniques)
7. [Best Practices](#best-practices)

---

## Understanding the Architecture

### The Excalidraw Plugin Ecosystem

```
Obsidian
├── Excalidraw Plugin (Core drawing functionality)
├── Excalidraw Automate Plugin (Scripting & automation)
└── Your Scripts (Custom functionality)
```

### Key Objects Available

```javascript
// Global objects available in scripts:
ea          // ExcalidrawAutomate - Main scripting interface
app         // Obsidian App - Access to vault, plugins, etc.
window      // Browser window object
```

---

## The Hook System

### What are Hooks?

Hooks are **callback functions** that get triggered when specific events occur in Excalidraw. Think of them as "event listeners" that let you intercept and customize behavior.

### Available Hooks

```javascript
// File lifecycle hooks
ea.onFileOpenHook = (data) => { /* File opened */ };
ea.onFileCreateHook = (data) => { /* File created */ };
ea.onViewUnloadHook = (view) => { /* View closed */ };

// User interaction hooks
ea.onLinkClickHook = (element, linkText, event, view, ea) => { /* Link clicked */ };
ea.onLinkHoverHook = (element, linkText, view, ea) => { /* Link hovered */ };
ea.onDropHook = (data) => { /* Something dropped on canvas */ };
ea.onPasteHook = (data) => { /* Something pasted */ };

// Canvas state hooks
ea.onViewModeChangeHook = (isViewMode, view, ea) => { /* View mode changed */ };
ea.onCanvasColorChangeHook = (ea, view, color) => { /* Canvas color changed */ };
```

### Hook Return Values

**Important**: Many hooks expect a **boolean return value**:
- `return false` = "I handled this, don't do the default action"
- `return true` = "Continue with the default action"

---

## Code Structure Analysis

Let's break down our clipboard script step by step:

### 1. Configuration Object

```javascript
const CLIPBOARD_CONFIG = {
    clipboardPrefix: "clip:",           // Optional prefix for clipboard links
    showSuccessIndicator: true,         // Show feedback when copying
    successDuration: 2000,              // How long to show feedback
    autoConvert: {
        enabled: true,
        patterns: [                     // Auto-cleanup patterns
            { match: /^email:(.+)/, transform: (m) => m[1] },
            { match: /^tel:(.+)/, transform: (m) => m[1] },
            { match: /^copy:(.+)/, transform: (m) => m[1] }
        ]
    }
};
```

**Why this pattern?**
- **Centralized configuration** makes the script easy to customize
- **Regex patterns** allow flexible text processing
- **Feature flags** let users enable/disable functionality

### 2. State Management

```javascript
// Store original hook if it exists
const originalLinkClickHook = ea.onLinkClickHook;
```

**Why preserve the original hook?**
- **Compatibility**: Other scripts might also use this hook
- **Chaining**: We can call the original hook for non-clipboard links
- **Clean uninstall**: We can restore the original behavior

### 3. Core Logic Functions

#### Text Processing Function

```javascript
function extractClipboardText(link) {
    if (!link) return null;
    
    // Skip actual URLs - let them work normally
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
```

**Key Concepts:**
- **Early returns** for cleaner code flow
- **Regex matching** for pattern detection
- **Fallback behavior** - if no special patterns match, use the whole link

#### User Feedback Function

```javascript
function showClipboardFeedback(element, clipboardText, ea) {
    if (!CLIPBOARD_CONFIG.showSuccessIndicator) return;
    
    try {
        const api = ea.getExcalidrawAPI();
        
        // Try to use Excalidraw's native toast system
        if (api && api.setToast) {
            const preview = clipboardText.substring(0, 30) + (clipboardText.length > 30 ? '...' : '');
            api.setToast({
                message: `✅ Copied: ${preview}`,
                duration: CLIPBOARD_CONFIG.successDuration,
                closable: true
            });
        } else {
            // Fallback to Obsidian's notice system
            const preview = clipboardText.substring(0, 50) + (clipboardText.length > 50 ? '...' : '');
            new Notice(`✅ Copied: ${preview}`, CLIPBOARD_CONFIG.successDuration);
        }
    } catch (error) {
        // Ultimate fallback
        new Notice("✅ Copied to clipboard!", CLIPBOARD_CONFIG.successDuration);
    }
}
```

**Design Patterns:**
- **Progressive enhancement**: Try the best option first, fall back gracefully
- **Error handling**: Always have a fallback that works
- **Text truncation**: Prevent UI overflow with long text

### 4. The Main Hook Implementation

```javascript
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
```

**Critical Concepts:**
- **Async/await**: Modern JavaScript for handling clipboard operations
- **Conditional logic**: Different behavior for different link types
- **Hook chaining**: Calling the original hook when appropriate
- **Return values**: `false` prevents default, `true` allows it

### 5. Command Registration

```javascript
if (app.commands) {
    app.commands.addCommand({
        id: 'ea-show-clipboard-history-startup',
        name: 'Show clipboard history',
        callback: async () => {
            // Command implementation
        }
    });
}
```

**Why register commands?**
- **User accessibility**: Commands appear in the command palette
- **Keyboard shortcuts**: Users can assign hotkeys
- **Discoverability**: Users can find your features

---

## Key Concepts

### 1. The ExcalidrawAutomate Object (`ea`)

```javascript
// Getting the API
const api = ea.getExcalidrawAPI();

// Working with elements
const elements = api.getSceneElements();
const selectedElements = ea.getViewSelectedElements();

// Creating elements
ea.addRect(x, y, width, height);
ea.addText(x, y, text);
ea.create(); // Actually add elements to the scene

// Styling
ea.style.strokeColor = "#ff0000";
ea.style.backgroundColor = "#00ff00";
```

### 2. Element Structure

Every Excalidraw element has these properties:

```javascript
{
    id: "unique-id",
    type: "rectangle" | "text" | "arrow" | "line" | "ellipse" | "diamond",
    x: 100,              // X position
    y: 200,              // Y position
    width: 150,          // Width
    height: 100,         // Height
    strokeColor: "#000", // Border color
    backgroundColor: "#fff", // Fill color
    link: "optional-link-text", // Our clipboard content goes here!
    text: "text content", // For text elements
    // ... many other properties
}
```

### 3. Browser APIs

```javascript
// Clipboard API (modern browsers)
await navigator.clipboard.writeText(text);
const text = await navigator.clipboard.readText();

// Local Storage (persistent data)
localStorage.setItem('key', JSON.stringify(data));
const data = JSON.parse(localStorage.getItem('key') || '{}');

// Obsidian Notice System
new Notice("Message", duration_in_ms);
```

### 4. Event Handling Patterns

```javascript
// Pattern 1: Simple event handler
ea.onSomeHook = (data) => {
    // Do something
    return true; // or false
};

// Pattern 2: Preserving original behavior
const original = ea.onSomeHook;
ea.onSomeHook = (data) => {
    if (myCondition) {
        // Handle my case
        return false;
    } else {
        // Let original handler deal with it
        return original ? original(data) : true;
    }
};

// Pattern 3: Async operations
ea.onSomeHook = async (data) => {
    try {
        await someAsyncOperation();
        return false;
    } catch (error) {
        console.error(error);
        return true;
    }
};
```

---

## Building Your Own Scripts

### Script Template

```javascript
// ============================================================================
// YOUR SCRIPT NAME
// ============================================================================

// Configuration
const CONFIG = {
    // Your settings here
};

// Store original hooks if needed
const originalHook = ea.onSomeHook;

// Helper functions
function helperFunction(param) {
    // Your logic here
}

// Main hook implementation
ea.onSomeHook = async (data) => {
    try {
        // Your main logic here
        
        if (yourCondition) {
            // Handle your case
            return false; // Prevent default
        } else {
            // Let original handler deal with it
            return originalHook ? originalHook(data) : true;
        }
    } catch (error) {
        console.error("Your Script Error:", error);
        return true; // Allow default on error
    }
};

// Register commands (optional)
if (app.commands) {
    app.commands.addCommand({
        id: 'your-command-id',
        name: 'Your Command Name',
        callback: () => {
            // Command implementation
        }
    });
}

// Success message
new Notice("🚀 Your Script Loaded!", 2000);
```

### Example Scripts

#### 1. Auto-Save Script

```javascript
// Auto-save when elements are modified
let saveTimeout;

ea.onViewModeChangeHook = (isViewMode, view, ea) => {
    if (!isViewMode) { // Entering edit mode
        // Clear existing timeout
        if (saveTimeout) clearTimeout(saveTimeout);
        
        // Set up auto-save
        saveTimeout = setTimeout(() => {
            view.save();
            new Notice("📁 Auto-saved!", 1000);
        }, 5000); // Save after 5 seconds of inactivity
    }
};
```

#### 2. Element Counter

```javascript
// Show element count in status
ea.onFileOpenHook = (data) => {
    const { view } = data;
    
    setTimeout(() => {
        const api = ea.getExcalidrawAPI();
        const elements = api.getSceneElements();
        const count = elements.filter(el => !el.isDeleted).length;
        
        new Notice(`📊 This drawing has ${count} elements`, 3000);
    }, 1000);
};
```

#### 3. Link Validator

```javascript
// Validate links when they're clicked
ea.onLinkClickHook = async (element, linkText, event, view, ea) => {
    // Check if it's a web URL
    if (linkText.match(/^https?:\/\//i)) {
        try {
            // Test if URL is reachable (simplified)
            const response = await fetch(linkText, { method: 'HEAD' });
            if (!response.ok) {
                new Notice(`⚠️ Link might be broken: ${response.status}`, 3000);
            }
        } catch (error) {
            new Notice(`❌ Cannot reach link: ${linkText}`, 3000);
        }
    }
    
    return true; // Allow normal link handling
};
```

---

## Advanced Techniques

### 1. Working with Element Selection

```javascript
// Get selected elements
const selected = ea.getViewSelectedElements();

// Filter by type
const textElements = selected.filter(el => el.type === 'text');
const shapes = selected.filter(el => ['rectangle', 'ellipse', 'diamond'].includes(el.type));

// Modify selected elements
const api = ea.getExcalidrawAPI();
const allElements = api.getSceneElements();

const updatedElements = allElements.map(element => {
    if (selected.includes(element)) {
        return {
            ...element,
            strokeColor: '#ff0000' // Make selected elements red
        };
    }
    return element;
});

api.updateScene({ elements: updatedElements });
```

### 2. Creating Complex Elements

```javascript
// Create a button-like element
function createButton(x, y, text, clickAction) {
    ea.reset();
    
    // Style the button
    ea.style.backgroundColor = "#007acc";
    ea.style.strokeColor = "#005a9e";
    ea.style.fillStyle = "solid";
    
    // Create rectangle
    const rect = ea.addRect(x, y, 120, 40);
    
    // Add text
    ea.style.strokeColor = "#ffffff";
    ea.addText(x + 10, y + 10, text);
    
    // Create elements
    ea.create().then(() => {
        // Add click functionality via link
        const api = ea.getExcalidrawAPI();
        const elements = api.getSceneElements();
        
        const updatedElements = elements.map(element => {
            if (element.type === 'rectangle' && element.x === x && element.y === y) {
                return { ...element, link: `action:${clickAction}` };
            }
            return element;
        });
        
        api.updateScene({ elements: updatedElements });
    });
}

// Usage
createButton(100, 100, "Save", "save-file");
```

### 3. Data Persistence

```javascript
// Save script data
function saveScriptData(key, data) {
    const scriptData = JSON.parse(localStorage.getItem('my-script-data') || '{}');
    scriptData[key] = data;
    localStorage.setItem('my-script-data', JSON.stringify(scriptData));
}

// Load script data
function loadScriptData(key, defaultValue = null) {
    const scriptData = JSON.parse(localStorage.getItem('my-script-data') || '{}');
    return scriptData[key] || defaultValue;
}

// Example usage
const userPreferences = loadScriptData('preferences', {
    autoSave: true,
    showNotifications: true
});
```

### 4. Integration with Obsidian

```javascript
// Access vault files
const files = app.vault.getMarkdownFiles();
const currentFile = app.workspace.getActiveFile();

// Read file content
const content = await app.vault.read(currentFile);

// Create new file
const newFile = await app.vault.create('path/to/new-file.md', 'content');

// Access metadata
const metadata = app.metadataCache.getFileCache(currentFile);
const frontmatter = metadata?.frontmatter;

// Work with plugins
const quickAddPlugin = app.plugins.plugins['quickadd'];
if (quickAddPlugin) {
    // Use QuickAdd features
}
```

---

## Best Practices

### 1. Error Handling

```javascript
// Always wrap risky operations
try {
    await navigator.clipboard.writeText(text);
    new Notice("✅ Success!");
} catch (error) {
    console.error("Script error:", error);
    new Notice(`❌ Error: ${error.message}`);
}
```

### 2. Performance Considerations

```javascript
// Debounce frequent operations
let debounceTimer;
function debouncedFunction() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        // Actual operation
    }, 300);
}

// Cache expensive operations
let cachedElements;
let cacheTime = 0;

function getElementsWithCache() {
    const now = Date.now();
    if (!cachedElements || now - cacheTime > 1000) {
        cachedElements = ea.getExcalidrawAPI().getSceneElements();
        cacheTime = now;
    }
    return cachedElements;
}
```

### 3. User Experience

```javascript
// Provide clear feedback
new Notice("🔄 Processing...", 1000);

try {
    // Long operation
    await longOperation();
    new Notice("✅ Complete!", 2000);
} catch (error) {
    new Notice(`❌ Failed: ${error.message}`, 3000);
}

// Make features discoverable
app.commands.addCommand({
    id: 'my-feature',
    name: 'My Amazing Feature',
    callback: myFeature
});
```

### 4. Code Organization

```javascript
// Use modules/namespaces
const MyScript = {
    config: {
        // Configuration
    },
    
    utils: {
        // Utility functions
    },
    
    handlers: {
        // Event handlers
    },
    
    init() {
        // Initialization
        this.setupHooks();
        this.registerCommands();
    },
    
    setupHooks() {
        ea.onLinkClickHook = this.handlers.linkClick.bind(this);
    }
};

// Initialize
MyScript.init();
```

### 5. Documentation

```javascript
/**
 * Extracts clipboard text from a link, applying configured transformations
 * @param {string} link - The link text to process
 * @returns {string|null} - Processed clipboard text or null if not a clipboard link
 */
function extractClipboardText(link) {
    // Implementation
}
```

---

## Debugging Tips

### 1. Console Logging

```javascript
// Add debug logging
console.log("Script loaded");
console.log("Processing link:", linkText);
console.log("Elements:", api.getSceneElements());
```

### 2. Visual Debugging

```javascript
// Highlight elements for debugging
function debugHighlight(elements) {
    const api = ea.getExcalidrawAPI();
    const allElements = api.getSceneElements();
    
    const highlighted = allElements.map(el => {
        if (elements.includes(el)) {
            return { ...el, strokeColor: '#ff0000', strokeWidth: 3 };
        }
        return el;
    });
    
    api.updateScene({ elements: highlighted });
}
```

### 3. Error Boundaries

```javascript
// Wrap your entire script
(function() {
    try {
        // Your script code here
        
    } catch (error) {
        console.error("Script initialization error:", error);
        new Notice(`Script failed to load: ${error.message}`);
    }
})();
```

---

## Conclusion

This clipboard script demonstrates several key patterns for Excalidraw scripting:

1. **Hook-based architecture** for event handling
2. **Configuration objects** for customization
3. **Progressive enhancement** with fallbacks
4. **State management** and data persistence
5. **User feedback** and error handling
6. **Command registration** for discoverability

Use these patterns as building blocks for your own scripts. Start simple, add features incrementally, and always test thoroughly!

Happy scripting! 🚀