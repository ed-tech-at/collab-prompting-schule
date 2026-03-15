import { Marked } from 'marked';
import markedKatex from 'marked-katex-extension';

export const LATEX_DELIMITER_SYSTEM_PROMPT = `When writing mathematical formulas, always use valid LaTeX delimiters.
Rules:
- Use $...$ for inline math inside a sentence.
- Use $$...$$ for display math blocks.
  Display math blocks must:
  - Start with $$ on its own line.
  - End with $$ on its own line.
  - Be separated from surrounding text by a blank line before and after.
Do NOT use \\( ... \\), \\[ ... \\], plain parentheses, or brackets as math delimiters.`;

type RenderMarkdownOptions = {
	mathRender?: boolean;
};

const plainMarkdownRenderer = new Marked();
const markdownRenderer = new Marked(
	markedKatex({
		throwOnError: false,
		nonStandard: true
	})
);

const normalizeMathDelimiters = (md: string) =>
	md
		.replace(/\\\[((?:.|\n)*?)\\\]/g, '\n$$\n$1\n$$\n')
		.replace(/\\\(((?:.|\n)*?)\\\)/g, '$$$1$');

export const renderMarkdownWithBlankTargets = (md?: string) => {
	if (!md) return '';

	const html = plainMarkdownRenderer.parse(md, { async: false });
	if (typeof html !== 'string') return '';
	return html.replace(/<a\b/g, "<a target='_blank' rel='noopener noreferrer'");
};

export const renderMarkdown = (md?: string, options?: RenderMarkdownOptions) => {
	if (!options?.mathRender) return renderMarkdownWithBlankTargets(md);
	if (!md) return '';

	const normalizedMarkdown = normalizeMathDelimiters(md);
	const html = markdownRenderer.parse(normalizedMarkdown, { async: false });
	if (typeof html !== 'string') return '';
	return html.replace(/<a\b/g, "<a target='_blank' rel='noopener noreferrer'");
};
