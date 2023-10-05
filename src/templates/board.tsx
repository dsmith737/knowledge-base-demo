/**
 * This is an example of how to create a template that makes use of streams data.
 * The stream data originates from Yext's Knowledge Graph. When a template in
 * concert with a stream is built by the Yext Sites system, a static html page
 * is generated for every corresponding (based on the filter) stream document.
 *
 * Another way to think about it is that a page will be generated using this
 * template for every eligible entity in your Knowledge Graph.
 */

import React, { useEffect, useRef, useState } from "react";
import {
  TemplateProps,
  TemplateRenderProps,
  Template,
  GetPath,
  TemplateConfig,
  GetHeadConfig,
  HeadConfig,
} from "@yext/pages";
import "src/index.css";
import { defaultHeadConfig } from "src/common/head";
import { BoardProfile, CardProfile, YexterProfile } from "src/types/entities";
import { Breadcrumbs } from "src/components/common/Breadcrumbs";
import { recursiveFields } from "src/common/streams";
import { FaBook } from "react-icons/fa";
import { TiPencil } from "react-icons/ti";
import { BsLink45Deg, BsStar, BsStarFill } from "react-icons/bs";
import { Link } from "@yext/pages/components";
import { copyCurrentUrlToClipboard } from "src/common/clipboard";
import { ButtonClass } from "src/styleguide";
import "src/styles/board.css";
import List from "src/components/common/TileList";
import Card from "src/components/common/Card";
import classNames from "classnames";
import { Routes } from "src/common/routes";
import useUser from "src/common/useUser";
import { wrappedFetch } from "src/common/utils/wrappedFetch";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BiDownArrow, BiUpArrow } from "react-icons/bi";
import { useClickOutside } from "src/common/useClickOutside";
import { CardTile } from "src/components/board/CardTile";
import Markdown from "src/components/common/Markdown";
import { useSelectedCard } from "src/common/useSelectedCard";
import { BrowserRouter, useSearchParams } from "react-router-dom";
import { getRuntime, isProduction } from "@yext/pages/util";
import { useBreakpoint } from "src/common/useBreakpoints";
import { SplitLayout } from "src/components/search/SplitLayout";
import { Main, shiftMain, unshiftMain } from "src/components/Main";
import { CSSTransition } from "react-transition-group";
import { useSwipeRight } from "src/common/useSwipeRight";
import { providePagesAnalytics } from "@yext/analytics";


/**
 * Required when Knowledge Graph data is used for a template.
 */
export const config: TemplateConfig = {
  stream: {
    $id: "boards",
    // Specifies the exact data that each generated document will contain. This data is passed in
    // directly as props to the default exported function.
    fields: [
      "id",
      "uid",
      "meta",
      "name",
      "slug",
      "body_richtext_v2",
      "c_cards.name",
      "c_cards.slug",
      "c_cards.meta",
      "c_cards.body_richtext_v2.html",
      "c_cards.id",
      "c_cards.uid",
      "c_cards.c_status",
      "c_cards.c_tags",
      "c_cards.c_shareCount",
      "c_cards.c_lastUpdateDate",
      "c_cards.c_dateCreated",
      "c_cards.c_parentBoard.name",
      "c_cards.c_parentBoard.slug",
      "c_cards.c_parentBoard.c_boardParentFolder.name",
      "c_cards.c_parentBoard.c_boardParentFolder.slug",
      "c_boardParentFolder.name",
      "c_boardParentFolder.slug",
      "c_boardParentFolder.id",
      "c_boardParentFolder.uid",
      ...(recursiveFields("c_parentFolder", ["name", "slug", "id", "uid"], 7).map(field => 'c_cards.c_parentBoard.c_boardParentFolder.' + field)),
      ...(recursiveFields("c_parentFolder", ["name", "slug", "id", "uid"], 7).map(field => 'c_boardParentFolder.' + field))
    ],
    // Defines the scope of entities that qualify for this stream.
    filter: {
      entityTypes: ["ce_knowledgeboard"],
    },
    // The entity language profiles that documents will be generated for.
    localization: {
      locales: ["en"],
      primary: false,
    },
  },
};

/**
 * Defines the path that the generated file will live at for production.
 *
 * NOTE: This currently has no impact on the local dev path. Local dev urls currently
 * take on the form: featureName/entityId
 */
export const getPath: GetPath<TemplateProps> = (data) => {
  return data.document.slug || `board/${data.document.id}`;
};

/**
 * This allows the user to define a function which will take in their template
 * data and procude a HeadConfig object. When the site is generated, the HeadConfig
 * will be used to generate the inner contents of the HTML document's <head> tag.
 * This can include the title, meta tags, script tags, etc.
 */
export const getHeadConfig: GetHeadConfig<TemplateRenderProps> = (
  data: TemplateRenderProps
): HeadConfig => {
  return defaultHeadConfig(data);
};

interface SortOption {
  label: string
  shortLabel?: string
  value: (a: CardProfile, b: CardProfile) => number
}

const Board: Template<TemplateRenderProps> = (data) => {
  React.useEffect(() => {
    const inProduction =
      isProduction(data.document.siteInternalHostName) ||
      isProduction(data.document.siteDomain);
    const pagesAnalytics = providePagesAnalytics({
      debug: !inProduction,
      businessId: data.document.businessId as number,
      pageType: {
        id: data.document.id,
        name: "entity",
        pageSetId: "board"
      },
      pageUrl: window.location.href,
      production: inProduction,
      referrer: window.document.referrer || "",
      siteId: data.document.siteId as number,
    });
    if (window?.YEXT_AUTH?.visitor) {
      pagesAnalytics.setVisitor(window.YEXT_AUTH.visitor);
    }
    pagesAnalytics.pageView();
  }, []);
  
  return (
    <>
      {getRuntime().name === "browser" && (
        <BrowserRouter>
          <Main data={data}>
            <BoardInternal {...data} />
          </Main>
        </BrowserRouter>
      )}
    </>
  )
}
/**
 * This is the main template. It can have any name as long as it's the default export.
 * The props passed in here are the direct stream document defined by `config`.
 *
 * There are a bunch of custom components being used from the src/components folder. These are
 * an example of how you could create your own. You can set up your folder structure for custom
 * components any way you'd like as long as it lives in the src folder (though you should not put
 * them in the src/templates folder as this is specific for true template files).
 */
const BoardInternal: Template<TemplateRenderProps> = (data) => {
  const profileDocument = data.document as BoardProfile;
  const { name, body_richtext_v2, c_cards = [], uid, id } = data.document;
  const urlSelectedCard = useSelectedCard();
  const { relativePrefixToRoot } = data;
  const [favorite, setFavorite] = useState(false);
  const [filter, setFilter] = useState('');
  const [selectedCard, setSelectedCard] = useState<CardProfile | null>();
  const [sortOptionsExpanded, setSortOptionsExpanded] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const cardRef = useRef(null);
  const isDesktop = useBreakpoint('lg');
  const [cardViewOpen, setCardViewOpen] = useState(false);
  const fallbackBoardDescription = 
    `# Welcome to the ${name} board

This board does not have a description.
    `;

  const cards: CardProfile[] = c_cards.filter((card: CardProfile) => card.c_status === "PUBLISHED");

  function closePanel() {
    setCardViewOpen(false);
  }

  function openPanel(card: CardProfile) {
    setSelectedCard(card);
    setCardViewOpen(true);
  }

  const swipeHandlers = useSwipeRight(closePanel);

  useEffect(() => {
    const initialSelectedCard = cards.find((card: CardProfile) => card.id === urlSelectedCard);
    if (initialSelectedCard) {
      openPanel(initialSelectedCard);
    }
  }, [urlSelectedCard])

  const sortOptions: SortOption[] = [
    { value: (a, b) => a.name.localeCompare(b.name), label: 'A - Z' },
    { value: (a, b) => b.name.localeCompare(a.name), label: 'Z - A' },
    {
      value: (a, b) => {
        const aDate = a.c_lastUpdateDate || a.c_dateCreated;
        const bDate = b.c_lastUpdateDate || b.c_dateCreated;
        if (aDate && bDate) {
          return new Date(bDate).getTime() - new Date(aDate).getTime()
        }

        if (aDate && !bDate) return -1;
        if (!aDate && bDate) return 1;

        return a.name.localeCompare(b.name);
      }, label: 'Recently Updated', shortLabel: 'Recent'
    },
  ];

  const [sortOption, setSortOption] = useState<SortOption>(sortOptions[0]);
  cards.sort(sortOption.value);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  useClickOutside(wrapperRef, (e: MouseEvent) => {
    if (e.target instanceof Element && buttonRef.current && !buttonRef.current.contains(e.target)) {
      setSortOptionsExpanded(false);
    }
  });

  const user = useUser(data.document);
  useEffect(() => {
    if (user && user.c_starredBoards?.map(board => board.id).includes(id)) {
      setFavorite(true);
    }
  }, [user])

  function handleFavorite() {
    if (!user) return;
    const currentFavoriteStatus = favorite;
    // Optimistically update the favorite so the UI feels fast to users.
    setFavorite(!currentFavoriteStatus);
    wrappedFetch<YexterProfile>(new Request(Routes(relativePrefixToRoot).starBoard(id, user.id)))
      .then(resp => {
        toast.success(`You ${currentFavoriteStatus ? 'unstarred' : 'starred'} this board!`);
      })
      .catch(error => {
        // Revert UI
        setFavorite(currentFavoriteStatus);
        toast.error('An error occurred');
        console.error(error);
      });
  }

  const filteredCards = cards.filter((card: CardProfile) => card.name.toLowerCase().includes(filter.toLowerCase()) || card.body.toLowerCase().includes(filter.toLowerCase()));

  function renderFilterAndSortControls() {
    return (
      <div className="flex flex-col items-end lg:flex-row lg:items-center mt-6 mb-4 lg:mt-0 relative">
        <input
          onChange={(e) => setFilter(e.target.value)}
          className="w-full text-sm mb-6 lg:mb-0 lg:mr-6 rounded-md border-brand-gray-400 border py-2 px-4 h-[40px]"
          placeholder="Type a keyword to filter cards on this board"
          type="text"
          value={filter}
        />
        <button ref={buttonRef} onClick={() => setSortOptionsExpanded(!sortOptionsExpanded)} className="flex h-[40px] text-sm p-3 bg-white rounded-full flex-shrink-0 items-center border border-black">
          <div className="flex flex-col mr-3">
            <BiUpArrow size={10} />
            <BiDownArrow size={10} />
          </div>
          {sortOption.shortLabel || sortOption.label}
        </button>
        {sortOptionsExpanded && (
          <div ref={wrapperRef} className="Board-sortOptions absolute mt-2 top-full right-0 bg-white border-black border border-solid rounded">
            {sortOptions.map((option, i) => {
              const selected = option.label === sortOption.label;
              const clss = classNames({
                'bg-brand-gray-400': selected,
                'rounded-t': i === 0,
                'rounded-b': i === sortOptions.length - 1,
              }, 'hover:bg-brand-gray-200')
              return (
                <div key={option.label} className={clss}>
                  <button className="flex w-full h-full items-center p-3" onClick={() => {
                    setSortOption(option);
                    setSortOptionsExpanded(false);
                  }}>
                    <div className="rounded-full mr-2 h-5 w-5 border-black border-solid border flex items-center justify-center">
                      {selected && <div className="rounded-full h-3 w-3 bg-black"></div>}
                    </div>
                    {option.label}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="Board h-full bg-brand-gray-100">
        <ToastContainer autoClose={1500} />
        <div className="bg-white">
          <div className="border-b border-solid border-brand-gray-400">
            <div className="container">
              <Breadcrumbs document={profileDocument} relativePrefixToRoot={data.relativePrefixToRoot} />
            </div>
          </div>
          <div className="container">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between py-4">
              {/* <h1 className="flex items-start lg:items-center Heading Heading--head mb-4 lg:mb-0">
                <FaBook className="mr-4 mt-1 lg:mt-0" /> <div>{name}</div>
              </h1> */}

              <div className="flex items-center gap-2 lg:gap-4 mb-4 lg:mb-0">
                <button className={"Button Button--primary"} onClick={handleFavorite}>
                  {favorite ? <BsStarFill size={16} className="mr-2" fill="gold" /> : <BsStar size={16} className="mr-2" />}
                  Star Board
                </button>
                <button className={ButtonClass("primary")} onClick={copyCurrentUrlToClipboard}>
                  <BsLink45Deg size={16} className="flex-shrink-0 mr-2" />
                  <div className="whitespace-nowrap">
                    Copy Link
                  </div>
                </button>
                <Link target="_blank" className={ButtonClass("primary")} href={`https://www.yext.com/s/3151361/entity/edit3?entityIds=${uid}`}>
                  <TiPencil size={16} className="mr-2" /> Edit
                </Link>
              </div>

              {!isDesktop && <Markdown>{body_richtext_v2 || ''}</Markdown>}
            </div>
          </div>
        </div>

        {!isDesktop && <div className="container">{renderFilterAndSortControls()}</div>}

        <div className="Board-layout container pb-10 lg:py-10 bg-brand-gray-100 grid grid-cols-2">
          <div>
            <div className="flex">
              {filteredCards && (
                <div className="container px-0 lg:mr-12">
                  {isDesktop && renderFilterAndSortControls()}
                  {!filteredCards.length && (
                    <div>
                      No cards on this board. Go to your <Link className="Link Link--underline" href="https://www.yext.com/s/3151361/entities2">Content</Link> to add or update cards.
                    </div>
                  )}
                  <List
                    onClick={(card: CardProfile) => {
                      searchParams.set('selected', card.id);
                      setSearchParams(searchParams);
                      openPanel(card);
                    }}
                    profiles={filteredCards}
                    itemClass={classNames("bg-white hover:bg-brand-gray-200")}
                    Card={(profile) => {
                      const selected = profile.id === selectedCard?.id;
                      const clss = classNames("p-6 w-full border border-solid", selected ? 'border-black' : 'border-brand-gray-400')
                      return <CardTile className={clss} profile={profile} />
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <div>
            <CSSTransition
              onEnter={shiftMain}
              onExit={unshiftMain}
              onExited={() => {
                setSelectedCard(null);
              }}
              nodeRef={cardRef} in={cardViewOpen} timeout={200} classNames="Board-panel">
              <div ref={cardRef} className="Board-panel h-full" {...swipeHandlers}>
                {selectedCard && <Card
                  className="Board-card shadow-card-shadow"
                  onClose={() => {
                    closePanel();
                    searchParams.delete('selected');
                    setSearchParams();
                  }}
                  card={selectedCard}
                  relativePrefixToRoot={relativePrefixToRoot}
                  hideNotebookLink={true}
                />}
              </div>
            </CSSTransition>
            {isDesktop && !cardViewOpen && <div className="Board-description"><Markdown>{body_richtext_v2 || fallbackBoardDescription}</Markdown></div>}
          </div>
        </div>
      </div>
    </>
  );
};

export default Board;
