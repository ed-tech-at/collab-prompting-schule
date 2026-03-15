import { Marked } from 'marked';
import markedKatex from 'marked-katex-extension';

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
