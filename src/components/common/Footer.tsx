import React from "react";
import logo from "src/assets/images/logo.svg";
import "src/components/common/Footer.css";

function scrollToTop() {
	window.scrollTo({
			top: 0,
			behavior: 'smooth',
	});
}

export default function Footer() {
	return (
		<footer className="Footer py-8 border-t border-black">
			<div className="container flex items-center flex-col">
				<button className="mb-4 Heading Heading--flag text-brand-blue" onClick={scrollToTop}>Back to Top</button>
				<img className="Footer-logo" src={logo} alt="" />
			</div>
		</footer>
	)
}