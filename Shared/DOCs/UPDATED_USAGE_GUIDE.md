# Excalidraw Link-Based Clipboard System - Complete Usage Guide

## Prerequisites

Before using this script, make sure you have:

1. **Obsidian** installed
2. **Excalidraw Plugin** installed and enabled
3. **Excalidraw Automate Plugin** installed and enabled

## Installation (CORRECT METHOD)

### Method 1: Add to Startup Script (RECOMMENDED)
1. In Obsidian, go to **Settings → Excalidraw → Startup Script**
2. This will create/open the `ExcalidrawStartup.md` file
3. **Scroll to the very bottom** of the file (after all the existing hooks)
4. **Copy and paste** the entire contents of `startup-integration.js`
5. **Save the file** (`Ctrl+S`)
6. The script will now run automatically every time you open an Excalidraw drawing!

### Method 2: Manual Script Execution (Alternative)
1. Open an Excalidraw drawing in Obsidian
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) to open the command palette
3. Type "Excalidraw: Run script" and select it
4. Copy and paste the contents of `final-link-clipboard.js` into the script editor
5. Click "Run" or press `Ctrl+Enter`

**Note**: Method 1 is recommended because the script will work automatically in all your Excalidraw drawings.

## How to Use

### Step 1: The Script is Already Running!
If you used Method 1 (startup script), the clipboard system is automatically active in every Excalidraw drawing. You'll see a brief notification: "🔗 Link-based clipboard system loaded!"

### Step 2: Create Clipboard Elements

#### Method A: Using Any Element
1. **Draw any shape or text** in Excalidraw:
   - Rectangle, circle, ellipse, diamond
   - Text elements
   - Arrows, lines
   - Any drawable element!

2. **Select the element** by clicking on it

3. **Press `Ctrl+K`** (or `Cmd+K` on Mac) to add a link

4. **Enter the text you want to copy** (NOT a web URL):
   ```
   Examples:
   john.doe@example.com
   +1-555-123-4567
   My important note text
   console.log('Hello World');
   ```

5. **Click OK**

#### Method B: Using Special Prefixes (Auto-cleanup)
You can use special prefixes that get automatically cleaned up when copied:
- `email:john@example.com` → copies just `john@example.com`
- `tel:+1-555-1234` → copies just `+1-555-1234`
- `copy:Some text` → copies just `Some text`

### Step 3: Copy Content
1. **Simply click on any element** that has a clipboard link
2. The content is **automatically copied to your clipboard**
3. You'll see a **success notification** showing what was copied
4. **Paste anywhere** using `Ctrl+V` (or `Cmd+V` on Mac)

## Visual Examples

Here's what your Excalidraw might look like:

```
┌─────────────────────┐
│ 📧 Email Template   │ ← Click copies full email template
└─────────────────────┘    (Link contains: "Dear customer...")

    🔵 Support Phone     ← Click copies phone number
                           (Link contains: "tel:+1-800-HELP")

┌─────────────────────┐
│   Git Commands      │
│ ┌─────────────────┐ │
│ │ git status      │ │ ← Each box copies different command
│ └─────────────────┘ │    (Link: "git status -s")
│ ┌─────────────────┐ │
│ │ git commit      │ │ ← (Link: "git commit -m 'feat: '")
│ └─────────────────┘ │
└─────────────────────┘
```

## Available Commands

After the script is loaded, these commands are available in the command palette (`Ctrl+Shift+P`):

### `Show clipboard history`
- **Purpose**: View and reuse previously copied items
- **Usage**: Press `Ctrl+Shift+P`, type "Show clipboard history"
- **What it does**: Shows your last 10 copied items, lets you select and copy one again

### `Highlight clipboard elements`
- **Purpose**: Show which elements have clipboard links (adds dashed outline)
- **Usage**: Press `Ctrl+Shift+P`, type "Highlight clipboard elements"
- **What it does**: Makes all clipboard elements visible with dashed borders

## Practical Use Cases

### 1. Contact Information Card
```
┌─────────────────────┐
│ John Doe - Contact  │ ← Link: "John Doe\nEmail: john@example.com\nPhone: (555) 123-4567\nLinkedIn: linkedin.com/in/johndoe"
└─────────────────────┘
```

### 2. Code Snippets Library
```
┌─────────────────────┐
│ React Hook          │ ← Link: "const [state, setState] = useState('');"
└─────────────────────┘

┌─────────────────────┐
│ CSS Flexbox         │ ← Link: "display: flex;\njustify-content: center;\nalign-items: center;"
└─────────────────────┘
```

### 3. Email Templates
```
┌─────────────────────┐
│ Meeting Request     │ ← Link: "Subject: Meeting Request\n\nHi [Name],\n\nI'd like to schedule a meeting to discuss..."
└─────────────────────┘
```

### 4. Quick Commands
```
┌─────────────────────┐
│ Docker Commands     │
│ ┌─────────────────┐ │
│ │ Start Container │ │ ← Link: "docker run -d --name myapp myimage"
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ View Logs       │ │ ← Link: "docker logs -f myapp"
│ └─────────────────┘ │
└─────────────────────┘
```

## Tips and Best Practices

### 🎨 **Visual Organization**
- **Use colors** to categorize different types of content:
  - 🔵 Blue for contact information
  - 🟢 Green for templates and text
  - 🟡 Yellow for code snippets
  - 🔴 Red for important/urgent items

### 📱 **Emoji Indicators**
Add emojis to make items instantly recognizable:
- 📧 for emails and templates
- 📱 for phone numbers
- 🔗 for URLs and links
- 💻 for code and commands
- 📝 for notes and text
- 🏢 for business/work items
- 👤 for personal contacts

### 📁 **Organization Strategies**
1. **Group related items** in containers or frames
2. **Use consistent styling** for similar item types
3. **Create sections** with headers for different categories
4. **Use arrows** to show relationships between items

### 🔄 **Workflow Integration**
- **Project Templates**: Create clipboard elements for project-specific templates
- **Daily Standup**: Quick access to status update formats
- **Code Reviews**: Standard comments and feedback templates
- **Meeting Notes**: Agenda and action item templates

## Troubleshooting

### ❌ **"Nothing happens when I click"**
**Possible causes and solutions:**
- **Script not loaded**: Check if you see the "🔗 Link-based clipboard system loaded!" notification when opening Excalidraw
- **No link on element**: Select the element and press `Ctrl+K` to verify it has a link
- **Clicking wrong area**: Make sure you're clicking directly on the element, not empty space
- **Browser permissions**: Some browsers may block clipboard access - try allowing clipboard permissions

### ❌ **"It opens a URL instead of copying"**
**Solutions:**
- The script only handles non-URL links
- Make sure your link content doesn't start with `http://` or `https://`
- Use plain text content instead of web URLs

### ❌ **"Can't find my clipboard items"**
**Solutions:**
- Use the "Highlight clipboard elements" command to see all clipboard items
- Check the "Show clipboard history" command to see recent copies
- Elements with clipboard links should show dashed outlines when highlighted

### ❌ **"Script stops working after switching drawings"**
**Solutions:**
- If using Method 2 (manual execution), you need to run the script again
- If using Method 1 (startup script), it should work automatically
- Try refreshing Obsidian if issues persist

### ❌ **"Startup script not working"**
**Solutions:**
- Make sure you pasted the code at the very end of `ExcalidrawStartup.md`
- Check that the file was saved properly
- Restart Obsidian to reload the startup script
- Check the Developer Console (`F12`) for any error messages

## Advanced Features

### Clipboard History
The system automatically tracks your clipboard usage:
- Stores last 50 copied items
- Includes timestamp and element information
- Access via "Show clipboard history" command
- Persists between Obsidian sessions

### Smart Link Detection
The system intelligently handles different types of links:
- **Clipboard links**: Plain text content gets copied
- **Web URLs**: Regular links (http/https) work normally
- **Special prefixes**: Auto-cleanup for email:, tel:, copy: prefixes
- **Mixed usage**: You can have both clipboard and web links in the same drawing

### Integration with Other Plugins
- **QuickAdd Plugin**: Enhanced prompts and suggestions if available
- **Templater Plugin**: Can be used to create dynamic clipboard content
- **Dataview Plugin**: Can reference clipboard history in queries

## Security and Privacy

- **Local Storage**: Clipboard history is stored locally in your browser
- **No Network**: No data is sent to external servers
- **Privacy**: Your clipboard content stays on your device
- **Cleanup**: History is automatically limited to 50 items

## Example Workflow: Project Management

1. **Create a project dashboard** in Excalidraw
2. **Add clipboard elements** for:
   - Project status update template
   - Common Git commands
   - Team member contact info
   - Meeting agenda template
   - Bug report template
3. **Use colors and emojis** to organize visually
4. **Click elements** to quickly copy content for:
   - Slack updates
   - Email communications
   - Terminal commands
   - Documentation

---

## Quick Reference

### Essential Steps:
1. **Install**: Add `startup-integration.js` to your `ExcalidrawStartup.md`
2. **Create**: Draw element → Select → `Ctrl+K` → Enter text → OK
3. **Use**: Click element to copy content
4. **Organize**: Use colors, emojis, and grouping for better organization

### Key Commands:
- `Ctrl+K` / `Cmd+K`: Add link to selected element
- `Ctrl+Shift+P`: Open command palette
- `Ctrl+V` / `Cmd+V`: Paste copied content

The system is now ready to enhance your Excalidraw workflow! 🚀