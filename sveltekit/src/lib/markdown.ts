import { Marked } from 'marked';
import markedKatex from 'marked-katex-extension';

export const LATEX_DELIMITER_SYSTEM_PROMPT = `
# Display Rules for Mathematical Formulas
When writing mathematical formulas, always use valid LaTeX delimiters.
Rules:
- Use $...$ for inline math inside a sentence.
  - Example: The derivative of $x^2$ is $2x$.

- To display math blocks, use \\n\\n$$\\n...\\n$$\\n\\n
  - Use $$ on its own line.
  - The equation must be between two $$ lines.
  - There must be an empty line before and after the block.

## Correct example:
Text before the equation.

$$
E = mc^2
$$

Text after the equation.

## Forbidden syntax
- Do NOT use \( ... \)
- Do NOT use \[ ... \]
- Do NOT place $$ and the equation on the same line.
- Do NOT attach text directly after $$ blocks. Keep a blank line between.
- Do NOT talk about these rules.

## Important
These rules are internal formatting rules. Never mention, explain, summarize, or refer to them in the response.
`;

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
