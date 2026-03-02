# MD-Lite

A hyper-lightweight, minimalist Markdown editor built for speed and focus. MD-Lite provides a seamless WYSIWYG experience while maintaining the simplicity of plain text. Refactored for scalability with a robust core architecture and industry-standard test coverage.

## 🚀 Features

The current version includes:
- **WYSIWYG Markdown Editing**: Real-time formatting without the need for a separate preview pane—write and format in one place.
- **Command Palette (⌘K)**: Quickly search through commands, format text, and navigate the app without touching the mouse.
- **Focus & Typewriter Mode (⌘⇧F)**: Distraction-free writing that hides the UI and keeps your cursor vertically centered.
- **Auto-Save & Shadow Recovery**: Integrated background saving with a recovery banner to restore unsaved session data if the app closes unexpectedly.
- **Native macOS Integration**: Traffic light support, native file dialogs, and deep macOS menu bar integration.
- **Advanced Media Support**: Render local file system images (via Tauri) and web images directly in-line; automatic markdown link parsing.
- **Inline Renaming**: Double-click the file name in the custom title bar to rename files instantly.
- **Rich Text Engine**: Full support for bold, italic, code blocks, syntax highlighting, task lists, and tables.
- **Recent Files Management**: Dynamic sidebar and "Open Recent" menu to quickly resume previous drafts.

## 🛠 Tech Stack
- **Framework**: [Tauri v2](https://tauri.app/) (Rust-based backend)
- **Frontend**: [Svelte 5](https://svelte.dev/) (Rune-based state management)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & Vanilla CSS
- **Editor Engine**: [Tiptap](https://tiptap.dev/)
- **Testing**: [Vitest](https://vitest.dev/) (90%+ Frontend Coverage) & Rust `cargo test` (Backend Coverage)
- **Language**: TypeScript & Rust

## 💻 Getting Started

### Prerequisites
- [Rust](https://www.rust-lang.org/tools/install)
- [Node.js](https://nodejs.org/) (v18 or later)
- [pnpm](https://pnpm.io/) (or your preferred package manager)

### Installation
1. Clone the repository:
   ```bash
   git clone git@github.com:harun-alrosyid/md-lite.git
   cd md-lite
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run in development mode:
   ```bash
   npm run tauri dev
   ```

### Build
To build the production-ready application:
```bash
npm run tauri build
```

## 🤝 Contributing
We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to get involved.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
