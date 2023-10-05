import classNames from "classnames";
import React from "react";
import "src/components/search/SplitLayout.css";

interface LayoutProps {
	left: React.ReactNode
	right: React.ReactNode
	className?: string
	leftClassName?: string
	rightClassName?: string
}

export function SplitLayout(props: LayoutProps) {
	const clss = classNames("SplitLayout", props.className)
	const lclss = classNames("SplitLayout-left", props.leftClassName)
	const rclss = classNames("SplitLayout-right", props.rightClassName)
	return (
		<div className={clss}>
			<div className={lclss}></div>
			<div className="SplitLayout-content lg:container lg:px-0">
				<div className="SplitLayout-leftContent">{props.left}</div>
				<div className="SplitLayout-rightContent">{props.right}</div>
			</div>
			<div className={rclss}></div>
		</div>
	)
}