# MD-Lite

A hyper-lightweight, minimalist Markdown editor built for speed and focus. MD-Lite provides a seamless WYSIWYG experience while maintaining the simplicity of plain text.

## 🚀 Features (MVP)
The current version includes:
- **WYSIWYG Markdown Editing**: Real-time formatting without the need for a separate preview pane.
- **Native macOS Menu**: Full integration with the macOS menu bar for file operations.
- **File Management**: Create, Open, Save, and Save As markdown files seamlessly.
- **Open Recent**: Quickly jump back into your work with a dynamic "Open Recent" menu.
- **Inline Renaming**: Rename your files directly from the title bar with a simple double-click.
- **Rich Text Support**: Supports bold, italic, lists, task items, tables, and code blocks with syntax highlighting.
- **Custom Title Bar**: Clean, distraction-free interface tailored for macOS with traffic light support.
- **Keyboard Shortcuts**: Common editor shortcuts (⌘N, ⌘O, ⌘S, ⌘⇧S) for lightning-fast editing.

## 🛠 Tech Stack
- **Framework**: [Tauri v2](https://tauri.app/) (Rust-based backend)
- **Frontend**: [Svelte 5](https://svelte.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Editor Engine**: [Tiptap](https://tiptap.dev/)
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
