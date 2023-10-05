import React from "react"
import { AiFillInfoCircle } from "react-icons/ai"
import { CardProfile } from "src/types/entities"
import "src/components/home/Tile.css";
import { dateMessage } from "src/common/dateMessage";
import classNames from "classnames";

export function CardTile({profile, className}: {profile: CardProfile, className: string}) {
	const clss = classNames("flex", className)
	return (
		<div className={clss}>
			<AiFillInfoCircle className="flex-shrink-0 mr-3 mt-1" size={24} />
			<div className="flex flex-col items-start">
				<h4 className="Tile-title text-left Heading Heading--flag">
					{profile.name}
				</h4>
				<div className="Tile-update text-sm text-brand-gray-500">
					Last updated: {dateMessage(profile.c_lastUpdateDate || '')}
				</div>
			</div>
		</div>
	)
}