import React from "react";
import { Link } from "@yext/pages/components";
import logo from "src/assets/images/logo.svg";
import "src/components/common/Header.css";
import { useBreakpoint } from "src/common/useBreakpoints";
import { BiSearch, BiSearchAlt2 } from "react-icons/bi";
import { useTemplateData } from "src/common/useTemplateData";
import { HOME_PATH } from "src/common/consts";

export default function Header() {
	const isDesktop = useBreakpoint("sm");
	const templateData = useTemplateData();

	return (
		<header className="Header border-b border-solid border-brand-gray-400">
			<div className="container py-5 flex justify-between items-center">
				<div className="flex items-stretch">
					<Link className="flex items-center" href="https://telescope.yext.com">
					{/* Comment the below line back in to add your company's logo to the header */}
						{/* <img className="Header-logo mr-1" src={logo} alt="" /> */}
						<div className="flex items-stretch">
							{/* <div className="Heading Heading--head">
								Telescope
							</div> */}
						</div>
					</Link>
					{/* Comment the below line back in to add a vertical divider between "Knowledge Base" and your company's logo */}
					{/* <div className="w-[2px] bg-black ml-2 mr-2"></div> */} 
					<Link className="flex items-center" href="http://localhost:5173/index.html"> 
						<div className="Heading Heading--kb flex flex-col lg:flex-row self-center">
							<span className="mr-2">
								Knowledge
							</span>
							<span>
								Base
							</span>
						</div>
					</Link>
				</div>

				{!isDesktop && <Link href="https://telescope.yext.com/search">
					<BiSearchAlt2 size={24} />
				</Link>}

				{isDesktop && <div className="flex gap-4">
					{/*You comment in the below two lines and swap out the links to add additional buttons to your header.*/}
					{/* <Link target="_blank" className="Link Link--inverse Link--header font-light" href="https://initiatives.telescope.yext.com">Initiatives</Link> */} 
					{/* <Link target="_blank" className="Link Link--inverse Link--header font-light" href="https://hitchhikers.yext.com/community/">Hitchhikers</Link> */}
					{/*You can swap out the below Google Forms link and Yext.com link with your own form for feedback submission/website's home page.*/}
					<Link target="_blank" className="Link Link--inverse Link--header font-light" href="https://www.yext.com/">Home</Link>
					<Link target="_blank" className="Link Link--inverse Link--header font-light" href="https://www.google.com/forms/about/">Feedback</Link>
					<Link target="_blank" className="Link Link--inverse Link--header font-light" href="https://www.google.com/forms/about/">Help</Link>
				</div>}
			</div>
		</header>
	)
}