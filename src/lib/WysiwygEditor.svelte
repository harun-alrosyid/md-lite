<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { Editor, type Extensions } from "@tiptap/core";
  import StarterKit from "@tiptap/starter-kit";
  import Placeholder from "@tiptap/extension-placeholder";
  import Typography from "@tiptap/extension-typography";
  import TaskList from "@tiptap/extension-task-list";
  import TaskItem from "@tiptap/extension-task-item";
  import Link from "@tiptap/extension-link";
  import Image from "@tiptap/extension-image";
  import Table from "@tiptap/extension-table";
  import TableRow from "@tiptap/extension-table-row";
  import TableCell from "@tiptap/extension-table-cell";
  import TableHeader from "@tiptap/extension-table-header";
  import Highlight from "@tiptap/extension-highlight";
  import Subscript from "@tiptap/extension-subscript";
  import Superscript from "@tiptap/extension-superscript";
  import Underline from "@tiptap/extension-underline";
  import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
  import { common, createLowlight } from "lowlight";
  import { Markdown } from "tiptap-markdown";

  // Import syntax highlighting theme
  import "./hljs-theme.css";

  // Create lowlight instance with common languages
  // Includes: javascript, typescript, python, rust, go, html/xml, css,
  //           json, yaml, bash, java, c, cpp, csharp, php, ruby,
  //           swift, kotlin, sql, markdown, and more.
  const lowlight = createLowlight(common);

  type Props = {
    content: string;
    onUpdate: (markdown: string) => void;
  };

  let { content, onUpdate }: Props = $props();
  let element: HTMLDivElement;
  let editor: Editor | null = null;
  let isSettingContent = false;

  onMount(() => {
    const extensions: Extensions = [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        codeBlock: false, // Replaced by CodeBlockLowlight
        code: { HTMLAttributes: { class: "inline-code" } },
        strike: {}, // ~~strikethrough~~
        blockquote: {}, // > quote
        bulletList: {}, // - item
        orderedList: {}, // 1. item
        listItem: {},
        horizontalRule: {}, // ---
        bold: {}, // **bold**
        italic: {}, // *italic*
      }),
      Placeholder.configure({
        placeholder: "Start writing…",
      }),
      Typography,
      // Task lists: - [x] done, - [ ] todo
      TaskList,
      TaskItem.configure({ nested: true }),
      // Links: [title](url)
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      // Images: ![alt](url)
      Image,
      // Tables: | col | col |
      Table.configure({
        resizable: false,
        HTMLAttributes: { class: "md-table" },
      }),
      TableRow,
      TableCell,
      TableHeader,
      // ==highlight==
      Highlight.configure({
        multicolor: false,
      }),
      // Subscript: H~2~O
      Subscript,
      // Superscript: X^2^
      Superscript,
      // Underline
      Underline,
      // Code block with syntax highlighting
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: { class: "code-block" },
      }),
      // Markdown serialization/deserialization
      Markdown.configure({
        html: true,
        tightLists: true,
        bulletListMarker: "-",
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ];

    editor = new Editor({
      element,
      extensions,
      content: "",
      editorProps: {
        attributes: {
          class: "wysiwyg-editor",
          spellcheck: "false",
        },
      },
      onUpdate: ({ editor: e }) => {
        if (!isSettingContent) {
          const md = e.storage.markdown.getMarkdown();
          onUpdate(md);
        }
      },
      onTransaction: ({ editor: e }) => {
        editor = e;
      },
    });

    if (content) {
      setContent(content);
    }
  });

  onDestroy(() => {
    editor?.destroy();
  });

  export function setContent(md: string) {
    if (!editor) return;
    isSettingContent = true;
    editor.commands.setContent(md);
    isSettingContent = false;
  }

  export function focus() {
    editor?.commands.focus();
  }

  $effect(() => {
    if (editor && content !== undefined) {
      const currentMd = editor.storage.markdown?.getMarkdown() || "";
      if (currentMd !== content) {
        setContent(content);
      }
    }
  });

  // Keyboard shortcuts for formatting:
  // Cmd+1-6: heading levels  |  Cmd+0: paragraph
  // Cmd+B: bold  |  Cmd+I: italic  (handled by Tiptap)
  // Cmd+Shift+X: strikethrough  |  Cmd+Shift+H: highlight
  function handleKeydown(e: KeyboardEvent) {
    if (!editor) return;
    const mod = e.metaKey || e.ctrlKey;
    if (!mod) return;

    const key = e.key;
    if (key >= "1" && key <= "6") {
      e.preventDefault();
      const level = parseInt(key) as 1 | 2 | 3 | 4 | 5 | 6;
      if (editor.isActive("heading", { level })) {
        editor.chain().focus().setParagraph().run();
      } else {
        editor.chain().focus().setHeading({ level }).run();
      }
    } else if (key === "0") {
      e.preventDefault();
      editor.chain().focus().setParagraph().run();
    }
  }
</script>

<div
  class="editor-wrapper"
  onkeydown={handleKeydown}
  role="textbox"
  tabindex="-1"
>
  <div bind:this={element} class="editor-mount"></div>
</div>

<style>
  .editor-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    min-height: 0;
  }

  .editor-mount {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  /* ===== Editor root ===== */
  .editor-mount :global(.wysiwyg-editor) {
    flex: 1;
    max-width: 720px;
    width: 100%;
    margin: 0 auto;
    padding: 32px 24px;
    outline: none;
    font-family: var(--font-sans);
    font-size: 16px;
    line-height: 1.75;
    color: var(--color-text-primary);
    caret-color: var(--color-accent);
    cursor: text;
    user-select: text;
    -webkit-user-select: text;
  }

  /* ===== Placeholder ===== */
  .editor-mount :global(.tiptap p.is-editor-empty:first-child::before) {
    content: attr(data-placeholder);
    float: left;
    color: var(--color-text-muted);
    font-style: italic;
    pointer-events: none;
    height: 0;
  }

  /* ===== Headings ===== */
  .editor-mount :global(h1) {
    font-size: 2em;
    font-weight: 700;
    line-height: 1.2;
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    border-bottom: 1px solid var(--color-border-subtle);
    padding-bottom: 0.3em;
  }

  .editor-mount :global(h2) {
    font-size: 1.5em;
    font-weight: 600;
    line-height: 1.3;
    margin-top: 1.4em;
    margin-bottom: 0.4em;
    border-bottom: 1px solid var(--color-border-subtle);
    padding-bottom: 0.25em;
  }

  .editor-mount :global(h3) {
    font-size: 1.25em;
    font-weight: 600;
    margin-top: 1.3em;
    margin-bottom: 0.4em;
  }

  .editor-mount :global(h4) {
    font-size: 1.1em;
    font-weight: 600;
    margin-top: 1.2em;
    margin-bottom: 0.3em;
  }

  .editor-mount :global(h5),
  .editor-mount :global(h6) {
    font-size: 1em;
    font-weight: 600;
    margin-top: 1em;
    margin-bottom: 0.3em;
  }

  .editor-mount :global(h6) {
    color: var(--color-text-secondary);
  }

  /* ===== Paragraphs ===== */
  .editor-mount :global(p) {
    margin-bottom: 0.75em;
  }

  /* ===== Bold / Italic / Underline ===== */
  .editor-mount :global(strong) {
    font-weight: 600;
  }
  .editor-mount :global(em) {
    font-style: italic;
  }
  .editor-mount :global(u) {
    text-decoration: underline;
  }

  /* ===== Strikethrough ===== */
  .editor-mount :global(s),
  .editor-mount :global(del) {
    text-decoration: line-through;
    color: var(--color-text-secondary);
  }

  /* ===== Highlight ==highlight== ===== */
  .editor-mount :global(mark) {
    background: rgba(255, 214, 10, 0.35);
    color: inherit;
    padding: 0.1em 0.2em;
    border-radius: 2px;
  }

  :global(:root[data-theme="light"]) .editor-mount :global(mark) {
    background: rgba(255, 214, 10, 0.5);
  }

  /* ===== Subscript / Superscript ===== */
  .editor-mount :global(sub) {
    font-size: 0.75em;
    vertical-align: sub;
  }

  .editor-mount :global(sup) {
    font-size: 0.75em;
    vertical-align: super;
  }

  /* ===== Links ===== */
  .editor-mount :global(a) {
    color: var(--color-accent);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 0.15s ease;
  }

  .editor-mount :global(a:hover) {
    border-bottom-color: var(--color-accent);
  }

  /* ===== Inline code ===== */
  .editor-mount :global(.inline-code),
  .editor-mount :global(code) {
    font-family: var(--font-mono);
    font-size: 0.875em;
    background: var(--color-bg-elevated);
    padding: 0.15em 0.4em;
    border-radius: 4px;
    color: #e06c75;
  }

  :global(:root[data-theme="light"]) .editor-mount :global(code) {
    color: #d63384;
  }

  /* ===== Code blocks ===== */
  .editor-mount :global(pre) {
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 1em;
    overflow-x: auto;
    margin: 1em 0;
    font-family: var(--font-mono);
    font-size: 0.875em;
    line-height: 1.6;
  }

  .editor-mount :global(pre code) {
    background: none;
    padding: 0;
    color: var(--color-text-primary);
  }

  /* ===== Blockquote ===== */
  .editor-mount :global(blockquote) {
    border-left: 3px solid var(--color-accent);
    padding-left: 1em;
    margin: 1em 0;
    color: var(--color-text-secondary);
    font-style: italic;
  }

  /* ===== Lists ===== */
  .editor-mount :global(ul),
  .editor-mount :global(ol) {
    padding-left: 1.5em;
    margin-bottom: 0.75em;
  }

  .editor-mount :global(li) {
    margin-bottom: 0.25em;
  }
  .editor-mount :global(li p) {
    margin-bottom: 0.25em;
  }

  /* ===== Task lists ===== */
  .editor-mount :global(ul[data-type="taskList"]) {
    list-style: none;
    padding-left: 0;
  }

  .editor-mount :global(ul[data-type="taskList"] li) {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .editor-mount :global(ul[data-type="taskList"] li label) {
    margin-top: 3px;
  }

  .editor-mount :global(ul[data-type="taskList"] li input[type="checkbox"]) {
    cursor: pointer;
    accent-color: var(--color-accent);
    width: 16px;
    height: 16px;
  }

  /* ===== Tables ===== */
  .editor-mount :global(.md-table) {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
    overflow: hidden;
    border-radius: 6px;
    border: 1px solid var(--color-border);
  }

  .editor-mount :global(th),
  .editor-mount :global(td) {
    border: 1px solid var(--color-border);
    padding: 0.5em 0.75em;
    text-align: left;
    min-width: 80px;
    vertical-align: top;
  }

  .editor-mount :global(th) {
    background: var(--color-bg-elevated);
    font-weight: 600;
  }

  .editor-mount :global(td) {
    background: transparent;
  }

  .editor-mount :global(tr:hover td) {
    background: var(--color-bg-secondary);
  }

  /* ===== Horizontal rule ===== */
  .editor-mount :global(hr) {
    border: none;
    border-top: 1px solid var(--color-border);
    margin: 2em 0;
  }

  /* ===== Images ===== */
  .editor-mount :global(img) {
    max-width: 100%;
    border-radius: 8px;
    margin: 1em 0;
  }

  /* ===== Selection ===== */
  .editor-mount :global(::selection) {
    background: rgba(10, 132, 255, 0.3);
  }
</style>
