# Release Notes - v0.2.0

We are excited to announce the release of **MD-Lite v0.2.0**! This version represents a massive step forward in terms of features, reliability, and code quality. We have refactored the entire core to ensure MD-Lite remains fast and scalable as we grow.

## ✨ What's New

### 🛠 Command Palette (⌘K)
Navigate MD-Lite without lifting your fingers from the keyboard. Search for commands, format text, and jump between files with a new, lightning-fast command interface.

### 🧘 Focus & Typewriter Mode (⌘⇧F)
A true distraction-free writing experience. Focus mode hides all UI elements except your text, and Typewriter mode keeps your active line perfectly centered vertically.

### 🛡️ Auto-Save & Shadow Recovery
Never lose your work again. MD-Lite now includes a background "Shadow Save" system. If the app exits unexpectedly, you'll see a recovery banner on the next launch allowing you to restore your unsaved session data instantly.

### 🖼️ Enhanced Media & Link Support
- **Local Images**: Drag and drop or link to local images—Tauri now resolves these paths automatically.
- **Markdown Link Parsing**: Type standard markdown links `[text](url)` and watch them transform into interactive elements in real-time.
- **Base64 Support**: Support for `data:` URI images directly in the editor.

### 📁 Advanced File Management
- **Open Recent**: A dynamic list of your most recent files in the sidebar and menu.
- **Inline Rename**: Double-click the filename in the title bar to rename your work without leaving the editor.

## 🏗 Technical Refactor

- **Modular Architecture**: Restructured the `src/lib/` directory into grouped domains: `components`, `core`, `extensions`, `workers`, `stores`, and `styles`.
- **Svelte 5 Runes**: Upgraded state management to Svelte 5 for cleaner reactive logic and better performance.
- **91% Global Test Coverage**: Added comprehensive unit tests for both the **Svelte Frontend** and the **Rust Backend**, ensuring high stability and preventing regressions.

## 🚀 How to Update
If you're building from source:
```bash
git pull origin main
npm install
npm run tauri dev
```

---
*Thank you for using MD-Lite! If you have any feedback or find a bug, please open an issue on GitHub.*
