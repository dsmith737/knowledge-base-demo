// check https://github.com/yext-pages/verizon-demo/blob/master/src/components/verizon/Navigation.tsx
// for potential more full implementation if necessary

import { Link } from "@yext/pages/components";
import { useSearchState } from "@yext/search-headless-react";
import React from "react";
import { FaExternalLinkAlt, FaExternalLinkSquareAlt } from "react-icons/fa";

interface NavigationProps {}

export default function Navigation(props: NavigationProps) { 
	const query = useSearchState(state => state.query.mostRecentSearch);

	return (
		<div className="flex w-full items-center justify-start mb-[1px]">
			<div className="Button cursor-default font-bold p-4 border-b-4 border-solid border-black">Knowledge Base</div>
			{/* <Link className="Button p-4 border-b-4 border-solid hover:border-brand-gray-300 border-white" target="_blank" href={`https://telescope.yext.com/search?query=${query}`}>
				Telescope <FaExternalLinkAlt className="ml-2" size={12}/>
			</Link> */}
		</div>
	)
}
