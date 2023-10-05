import React from "react"
import { AiFillInfoCircle } from "react-icons/ai"
import { FiChevronRight } from "react-icons/fi";
import { FaBook } from "react-icons/fa";
import { CardProfile, BoardProfile } from "src/types/entities"
import "src/components/home/Tile.css";
import classNames from "classnames";
import { dateMessage } from "src/common/dateMessage";

interface TileProps {
	left: React.ReactNode
	title: React.ReactNode
	info: React.ReactNode
	right: React.ReactNode
	variant?: string
	className?: string
	snippet?: string
}

function Tile(props: TileProps) {
	const clss = classNames("Tile w-full p-6 border border-solid border-brand-gray-400", props.className, {[`Tile--${props.variant}`]: props.variant})
	const iconClass = props.snippet ? "Tile-left self-start" : "Tile-left"

	return (
		<div className={clss}>
			<div className={iconClass}>
				{props.left}
			</div>
			<div className="Tile-content">
				<div className="Tile-title text-left Heading Heading--flag">
					{props.title}
				</div>
				{props.snippet &&
					<div className="Tile-snippet text-left">
						{props.snippet}
					</div>
				}
			</div>
			<div className="Tile-info">
				{props.info}
			</div>
			<div className="Tile-right">
				{props.right}
			</div>
		</div>
	)
}

export function CardTile({profile, className, variant}: {profile: CardProfile, className?: string, variant?: string}) {
	const folder = profile.c_parentBoard?.[0]?.c_boardParentFolder?.[0]?.name || ''

	return (
		<Tile 
			variant={variant}
			className={className}
			left={<AiFillInfoCircle className="TileList-icon flex-shrink-0" size={24} />}
			title={profile.name}
			info={folder}
			right={
				<div className="Tile-updated text-brand-gray-500">
					<div className="mr-2">
						Last updated:
					</div>
					<div>
						{dateMessage(profile.c_lastUpdateDate || '')}
					</div>
				</div>
			}
			snippet={profile.s_snippet}
		/>
	)
}

export function BoardTile({profile, className, variant}: {profile: BoardProfile, className?: string, variant?: string}) {
	const folder = profile.c_boardParentFolder?.[0]?.name || ''
	const snippet = profile.c_cards?.[0]?.s_snippet || ''

	return (
		<Tile 
			className={className}
			variant={variant}
			left={<FaBook size={24} />}
			title={profile.name}
			info={
				<span className="Tile-boardFolder">
					{folder}
				</span>
			}
			right={<FiChevronRight className="Tile-arrow relative" size={38}/>}
			snippet={snippet}
		/>
	)
}
