import React from "react";
import { Link } from "@yext/pages/components";
import classNames from "classnames";

interface ListProps<T> {
	profiles: T[];
	onClick?: (profile: T) => void;
	itemClass?: string;
	selectedProfile?: string | null;
	className?: string;
	Card: (profile: T) => React.ReactNode;
}

interface ItemInfo {
	slug?: string
	id: string
}

export default function List<T extends ItemInfo>(props: ListProps<T>) {
	const { profiles, onClick, Card } = props;

	const Wrapper = ({profile, children}: {profile: T, children: React.ReactNode}) => {
		const baseClass = "flex items-center w-full";
		const hoverClass = classNames(baseClass, "hover:bg-brand-gray-100");
		if ("slug" in profile) {
			if (profile.slug !== undefined){
				return (<Link href={profile.slug} className={hoverClass}>{children}</Link>)
			}
		}
		if (onClick) {
			return (<button onClick={() => onClick(profile)} className={hoverClass}>{children}</button>)
		}

		return (<div className={baseClass}>{children}</div>)
	}

	const clss = classNames("TileList w-full flex flex-col justify-center items-center", props.className)
	return (
		<ol className={clss}>
			{profiles.map((profile) => {
				return (
					<li key={profile.id} className={classNames("w-full mb-4", props.itemClass)}>
						<Wrapper profile={profile}>
							{Card(profile)}
						</Wrapper>
					</li>
			)})}
		</ol>
	)
}