import { Link } from "@yext/sites-react-components";
import React, { useEffect, useRef, useState } from "react";
import { CardProfile } from "src/types/entities";
import { SimpleBreadcrumbs } from "./Breadcrumbs";
import { TiPencil } from "react-icons/ti";
import { BsChevronLeft, BsLink45Deg } from "react-icons/bs";
import { GrClose } from "react-icons/gr";
import "src/components/common/Card.css";
import { copyCardUrlToClipboard } from "src/common/clipboard";
import { Routes } from "src/common/routes";
import classNames from "classnames";
import Markdown from "src/components/common/Markdown";
import { useBreakpoint } from "src/common/useBreakpoints";
import { dateMessage } from "src/common/dateMessage";
import { SEARCH_PATH } from "src/common/consts";
import { useCardView } from "src/common/useCardView";
import { useTemplateData } from "src/common/useTemplateData";

interface CardProps {
  card: CardProfile;
  relativePrefixToRoot: string;
  onClose?: () => void;
  className?: string;
  hideNotebookLink?: boolean;
  loadBreadcrumbsDynamically?: boolean;
}

const InfoSection = (props: { title: string; children: React.ReactNode }) => {
  return (
    <div className="mb-4">
      <h3 className="Heading Heading--brow">{props.title}</h3>
      {props.children}
    </div>
  );
};

const CardRow = (props: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={classNames("Card-row", props.className)}>
      <div className="h-full mx-4 p-4 lg:mx-14 border-l-2 border-r-2 border-solid border-brand-gray-400">
        {props.children}
      </div>
    </div>
  );
};

export default function Card(props: CardProps) {
  const { card, relativePrefixToRoot } = props;
  const {
    c_shareCount = 0,
    c_dateCreated,
    c_lastUpdateDate,
  } = card;
  const [isShared, setIsShared] = useState(false);
	const isTablet = useBreakpoint('lg');
	const isDesktop = useBreakpoint('xl');
	const siteDomain = useTemplateData().document.siteDomain;
	useCardView(card.uid);

	const createdDate = c_dateCreated
		? new Intl.DateTimeFormat("en-US", {year: "numeric", month: "long", day: "2-digit"}).format(new Date(c_dateCreated.replace(/-/g, '\/')))
		: <span className="text-brand-gray-500">n/a</span>;

	const updatedDate = c_lastUpdateDate
		? new Intl.DateTimeFormat("en-US", {year: "numeric", month: "long", day: "2-digit"}).format(new Date(c_lastUpdateDate.replace(/-/g, '\/')))
		: <span className="text-brand-gray-500">n/a</span>;

	const mobileInfoSections = [
		{title: "Created On", children: createdDate},
		{title: "", children: `${c_shareCount} Shares`},
	];

	const tabletInfoSections = [
		{title: "Created On", children: createdDate},
		{title: "Last Updated", children: updatedDate},
		{title: "", children: `${c_shareCount} Shares`},
	];

	const datesInfoSection = [
		{title: "Created On", children: createdDate},
		{title: "Last Updated", children: updatedDate},
	];

	function handleShare() {
		copyCardUrlToClipboard(card, siteDomain);
		if (!isShared) {
			fetch(Routes(relativePrefixToRoot).share(card.id));
			setIsShared(true);
		}
	}

	const teamName = card?.c_parentBoard?.[0]?.c_boardParentFolder?.[0]?.name;
	const mobileClass = classNames("Card sticky overflow-y-scroll bg-white", props.className);
	const desktopClass = classNames("Card sticky overflow-y-hidden bg-white", props.className);

	function renderTags() {
		return (
			card.c_tags && (
				<div className="flex flex-col items-start lg:flex-row lg:items-center">
					<div className="mb-2 lg:mr-2 lg:mb-0">Tags: </div>
					<ul className="flex flex-wrap gap-2">
						{card.c_tags.map(tag => (
							<a key={tag} className="Button Button--secondary" href={relativePrefixToRoot + SEARCH_PATH + `?tag=${tag}`}>#{tag}</a>
						))}
					</ul>
				</div>
			)
		)
	}

	if (!isTablet) {
		return (
			<div className={mobileClass}>
				<CardRow className="sticky top-0 bg-white">
					<div className="flex items-center">
						<button className="flex items-center" onClick={props.onClose}>
							<BsChevronLeft className="mr-2 text-brand-gray-600" /> Return to List
						</button>

						<div className="flex ml-auto gap-2">
							<button className="Button Button--primary p-2 rounded-full" onClick={handleShare}>
								<BsLink45Deg size={18} />
							</button>

							<Link target="_blank" className="Button Button--primary p-2 rounded-full" href={`https://www.yext.com/s/3151361/entity/edit3?entityIds=${card.uid}`}>
								<TiPencil size={18} />
							</Link>
						</div>
					</div>
				</CardRow>
				<CardRow>
					{teamName && <h3 className="Heading Heading--brow my-2 text-brand-gray-500">{teamName}</h3>}
					<h2 className="Heading Heading--head mb-2">{card.name}</h2>
					<div>
						<span className="Heading Heading--brow">Last Updated:</span> {dateMessage(c_lastUpdateDate || '')}
					</div>
					{card.c_parentBoard && !props.hideNotebookLink && <Link className="Button Button--secondary mt-5" href={`${relativePrefixToRoot}${card.c_parentBoard[0].slug}?selected=${card.id}`}>
						View on the Board
					</Link>}
				</CardRow>
				<CardRow className="">
					<div className="Card-content h-full">
						<div dangerouslySetInnerHTML={{__html: card.body_richtext_v2.html}}></div>
					</div>
				</CardRow>
				<CardRow>
					<div className="grid grid-cols-2 grid-rows-2">
						{mobileInfoSections.map((section, i) => <InfoSection key={i} {...section} />)}
					</div>
				</CardRow>
				<CardRow>
					{renderTags()}
				</CardRow>
				<div className={"Card-row"}>
					<div className="h-full p-4 lg:mx-14 border-l-2 border-r-2">
						<SimpleBreadcrumbs loadDynamically={props.loadBreadcrumbsDynamically} relativePrefixToRoot={relativePrefixToRoot} document={card}/>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className={desktopClass}>
			{props.onClose && <button onClick={props.onClose} className="absolute top-5 right-4"><GrClose size={24}/></button>}
			<CardRow>
				<div className="flex items-center justify-between">
					<SimpleBreadcrumbs loadDynamically={props.loadBreadcrumbsDynamically} relativePrefixToRoot={relativePrefixToRoot} document={card}/>
					{card.c_parentBoard && !props.hideNotebookLink && <Link className="Button Button--secondary" href={`${relativePrefixToRoot}${card.c_parentBoard[0].slug}?selected=${card.id}`}>
						View on the Board
					</Link>}
				</div>
			</CardRow>
			<CardRow>
				{teamName && <h3 className="Heading Heading--brow my-2 text-brand-gray-500">{teamName}</h3>}
				<h2 className="Heading Heading--head">{card.name}</h2>
				{isDesktop && <div className="flex gap-2 mt-2 rounded-md">
					<div>|</div>
					<div>{`${c_shareCount} Shares`}</div>
				</div>}
			</CardRow>
			<CardRow className="overflow-y-hidden">
				<div className="h-full flex flex-col">
					<div className="overflow-y-scroll h-full flex flex-col justify-between">
						<div dangerouslySetInnerHTML={{__html: card.body_richtext_v2.html}}></div>

						{isTablet && !isDesktop && <div className="flex justify-end gap-2">
							<button className="Button Button--primary" onClick={handleShare}>
								<BsLink45Deg size={24} /> Copy link
							</button>

							<Link target="_blank" className="Button Button--primary" href={`https://www.yext.com/s/3151361/entity/edit3?entityIds=${card.uid}`}>
								<TiPencil size={24} /> Edit
							</Link>
						</div>}
						{isDesktop && <div className="flex justify-center gap-20 mt-8 bg-brand-gray-200 rounded-md p-1 pt-4">
							{datesInfoSection.map((section, i) => <InfoSection key={i} {...section} />)}
						</div>}
					</div>
				</div>
			</CardRow>
			{isTablet && !isDesktop && (
				<CardRow>
					<div className="grid grid-rows-2 grid-cols-2 xl:flex xl:flex-col">
						{tabletInfoSections.map((section, i) => <InfoSection key={i} {...section} />)}
					</div>
				</CardRow>
			)}
			<CardRow>
				<div className="flex justify-between items-center">
					{renderTags()}

					{isDesktop && <div className="flex ml-auto gap-2">
						<button className="Button Button--primary" onClick={handleShare}>
							<BsLink45Deg size={24} /> Copy link
						</button>

						<Link target="_blank" className="Button Button--primary" href={`https://www.yext.com/s/3151361/entity/edit3?entityIds=${card.uid}`}>
							<TiPencil size={24} /> Edit
						</Link>
					</div>}
				</div>
			</CardRow>
		</div>
	)
}
