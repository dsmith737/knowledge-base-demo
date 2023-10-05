import React from "react";
import Footer from "./common/Footer";
import Header from "./common/Header";
import "src/components/Main.css";
import { TemplateRenderProps } from "@yext/pages/*";
import { TemplateDataProvider } from "src/common/useTemplateData";
import { FaPlus, FaPlusCircle } from "react-icons/fa";
import { Link } from "@yext/pages/components";
import CommandPalette from "src/components/common/CommandPalette";
import { provideHeadless, SearchHeadlessProvider } from "@yext/search-headless-react";
import { getSearchProviderConfig } from "src/common/consts";

interface LayoutProps {
	children: React.ReactNode;
	data: TemplateRenderProps;
}

export function shiftMain() {
	document.querySelector('.Main')?.classList.add('is-offset');
}

export function unshiftMain() {
	document.querySelector('.Main')?.classList.remove('is-offset');
}

export function Main(props: LayoutProps) {
	const { children, data } = props;
  const searcher = provideHeadless(getSearchProviderConfig(data.document.meta.locale));
 
	return (
    <SearchHeadlessProvider searcher={searcher}>
			<TemplateDataProvider value={data}>
				<div className="Main">
					<Header />
					<div className="Main-content h-full">
						{children}
						<Link href="https://yext.okta.com/home/yext_yextbookknowledgegraph_1/0oa1ix7e8yqA0XV0i1d8/aln1ix7pr1hC3YzAt1d8" target="_blank" className="hidden lg:flex fixed right-12 bottom-24 h-12 w-12 rounded-full shadow-card-shadow bg-black items-center justify-center">
							<div className="text-white rounded-full border-2 border-white border-solid h-6 w-6 flex items-center justify-center">
								<FaPlus size={12} />
							</div>
						</Link>
						<CommandPalette relativePrefixToRoot={data.relativePrefixToRoot} locale={data.document.meta.locale} />
					</div>
					<Footer />
				</div>
			</TemplateDataProvider>
		</SearchHeadlessProvider>
	)
}