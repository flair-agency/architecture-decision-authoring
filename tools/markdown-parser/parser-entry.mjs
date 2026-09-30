import MarkdownIt from "markdown-it";

// CommonMark blocks with markdown-it's GFM table and strikethrough extensions.
// HTML must be parsed so validation can distinguish comments and raw HTML.
export default new MarkdownIt("default", { html: true, linkify: false, typographer: false });
