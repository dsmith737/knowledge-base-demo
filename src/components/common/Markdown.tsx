import React from "react";
import MarkdownLib from "markdown-to-jsx";

interface MarkdownProps {
	children: string;
}

export default function Markdown(props: MarkdownProps) {
	let even = true;
	const children = props.children.replaceAll(/\+\+/g, () => {
		even = !even;
		return even ? '</ins>' : '<ins>';
	})
	
	return (
		<MarkdownLib
			options={{
				overrides: {
					a: { props: { id: '', target: '_blank', rel: 'noreferrer', className: 'underline hover:no-underline text-brand-blue', }},
					h1: { props: { id: '', className: "my-4 font-bold text-3xl"}},
					h2: { props: { id: '', className: "my-4 font-bold text-2xl"}},
					h3: { props: { id: '', className: "my-2 font-bold text-xl"}},
					h4: { props: { id: '', className: "my-2 font-bold text-lg"}},
					h5: { props: { id: '', className: "my-2 font-bold text-base"}},
					br: { props: { id: '', className: "my-3"}},
					p: { props: { id: '', className: "mb-3"}},
					ol: { props: { id: '', className: "mb-3 list-decimal list-inside ml-2"}},
					ul: { props: { id: '', className: "mb-3 list-disc list-inside ml-2"}},
					li: { props: { id: '', className: "my-1"}},
					code: { props: { id: '', className: "whitespace-normal"}},
				}
			}}
		>
			{children}
		</MarkdownLib>

	)
}
