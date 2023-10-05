/**
 * This is an example of how to create a static template that uses transformProps to retrieve data.
 */
import React, { useEffect, useRef, useState } from "react";
import {
  TemplateRenderProps,
  Template,
  TemplateConfig,
  GetHeadConfig,
} from "@yext/pages";
import { Pagination, SearchBar } from "@yext/search-ui-react";
import { useSearchActions, useSearchState } from "@yext/search-headless-react";
import { BoardProfile, CardProfile, SearchResult } from "src/types/entities";
import { defaultHeadConfig } from "src/common/head";
import List from "src/components/common/TileList";
import Card from "src/components/common/Card";
import classNames from "classnames";
import { ToastContainer } from "react-toastify";
import { provideHeadless, SearchHeadlessProvider } from "@yext/search-headless-react";
import 'react-toastify/dist/ReactToastify.css';
import { usePageSetupEffect } from "src/common/usePageSetupEffect";
import { BrowserRouter, useSearchParams } from "react-router-dom";
import { getRuntime, isProduction } from "@yext/pages/util";
import { getSearchProviderConfig, KB_VERTICAL_KEY, SEARCH_PATH } from "src/common/consts";
import { BoardTile, CardTile } from "src/components/home/Tile";
import "src/styles/search.css";
import { isCard } from "src/common/entities";
import { useBreakpoint } from "src/common/useBreakpoints";
import { SplitLayout } from "src/components/search/SplitLayout";
import { MdClose } from "react-icons/md";
// import logo from "src/assets/images/logo.svg";
import Navigation from "src/components/search/Navigation";
import { CSSTransition } from "react-transition-group";
import { Main, shiftMain, unshiftMain } from "src/components/Main";
import { useSwipeRight } from "src/common/useSwipeRight";
import { useSelectedCard } from "src/common/useSelectedCard";
import Markdown from "src/components/common/Markdown";
import { Link } from "@yext/pages/components";
import { providePagesAnalytics } from "@yext/analytics";


// declare global {
//   interface Window { YEXT_AUTH: {visitor: {id: string, telescopeEmail: string}}; }
// }

/**
 * Not required depending on your use case.
 */
export const config: TemplateConfig = {
  // The name of the feature. If not set the name of this file will be used (without extension).
  // Use this when you need to override the feature name.
  name: "search",
};

/**
 * Defines the path that the generated file will live at for production.
 *
 * NOTE: This currently has no impact on the local dev path. Local dev urls currently
 * take on the form: featureName/entityId
 */
export const getPath = () => {
  return SEARCH_PATH;
};

export const getHeadConfig: GetHeadConfig<TemplateRenderProps> = (data) => {
  return defaultHeadConfig(data);
}

/**
 * This is the main template. It can have any name as long as it's the default export.
 * The props passed in here are the direct result from `transformProps`
 */
const Search: Template<TemplateRenderProps> = (data) => {
  // if (getRuntime().isServerSide) return <></>
  if (getRuntime().name !== "browser") return <></>

  React.useEffect(() => {
    const inProduction =
      isProduction(data.document.siteInternalHostName) ||
      isProduction(data.document.siteDomain);

    const pagesAnalytics = providePagesAnalytics({
      businessId: data.document.businessId as number,
      debug: !inProduction,
      pageType: {
        name: "static",
        staticPageId: "search"
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
    <BrowserRouter>
      <Main data={data}>
        <SearchInternal {...data} />
      </Main>
    </BrowserRouter>
  );
};

const SearchInternal: Template<TemplateRenderProps> = (data) => {
  const { relativePrefixToRoot } = data;
  const [selectedCard, setSelectedCard] = useState<CardProfile | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const results = useSearchState(state => state.vertical.results) || [];
  const rawResults = results.map(result => result.rawData);
  const directAnswer = useSearchState(state => state.directAnswer.result)
  const lastQuery = useSearchState(state => state.query.mostRecentSearch);
  const urlSelectedCard = useSelectedCard();

  usePageSetupEffect(KB_VERTICAL_KEY);
  const [searchParams, setSearchParams] = useSearchParams();
  const onSearch = (searchEventData: {
    verticalKey?: string,
    query?: string
  }) => {
    const { query } = searchEventData;
    if (query) {
      searchParams.set("query", query);
    } else {
      searchParams.delete("query");
    }
    setSearchParams(searchParams);
    actions.executeVerticalQuery();
    closePanel();
  };

  useEffect(() => {
    if (isInitialLoad && urlSelectedCard && rawResults.length)  {
      const selected = rawResults.find(card => card.id === urlSelectedCard);
      if (selected) {
        openPanel(selected as unknown as CardProfile);
      }
      setIsInitialLoad(false);
    }
  }, [rawResults])

  const [cardViewOpen, setCardViewOpen] = useState(false);
  const layoutClass = classNames({
    "Search-layout": true,
    "is-open": cardViewOpen,
  });

  const isDesktop = useBreakpoint('md');
  const cardVariant = (!isDesktop || selectedCard) ? 'compact' : '';
  const facets = useSearchState(state => state.filters.facets)
  const actions = useSearchActions();
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  function openPanel(card: CardProfile) {
    setSelectedCard(card);
    setCardViewOpen(true);
    searchParams.set("selected", card.id);
    setSearchParams(searchParams);
  }

  function closePanel() {
    setCardViewOpen(false);
    searchParams.delete("selected");
    setSearchParams(searchParams);
  }

  const swipeHandlers = useSwipeRight(closePanel);

  const listClss = cardViewOpen ? "pr-8 lg:pr-8" : '';

  return (
    <>
      <div className="Search">
        <ToastContainer autoClose={1500} />
        <div className="container">
          <div className="flex justify-center items-center py-8">
            {/* Comment in the below line to add your company's logo to the header of the Search Results Page /> */}
            {/* <img className="mr-4" src={logo} alt="" width={93} height={93} /> */}
            <h1 className="Heading Heading--lead">
              Knowledge Base
            </h1>
          </div>
          <div className="flex justify-center">
            <div className="w-full flex flex-col items-center max-w-[1000px] border-b border-solid border-brand-gray-400">
              <SearchBar
                customCssClasses={{
                  searchBarContainer: "SearchBar-container w-full",
                  inputElement: "py-4",
                }}
                onSearch={onSearch}
              />
              <div className="w-full flex flex-row justify-start">
                {facets?.filter(facet => facet.fieldId === 'c_tags')?.map(facet => {
                  facet.options.map
                  return facet?.options.filter(option => option.selected).map(option => {
                    return (
                      <button
                        onClick={() => {
                          searchParams.delete('tag');
                          setSearchParams(searchParams);
                          actions.setFacetOption(facet.fieldId, option, !option.selected)
                          actions.executeVerticalQuery();
                        }}
                        key={option.displayName}
                        className="Button Button--secondary flex items-center">
                        <MdClose className="mr-1" /> #{option.value}
                      </button>
                    )
                  })
                })}
              </div>
              <Navigation />
            </div>
          </div>
        </div>

        {/* @ts-ignore */}
        {directAnswer && directAnswer.snippet && directAnswer.snippet.value && (
          <div className="container bg-brand-gray-200 flex flex-col py-4 px-8 mt-4">
            <Markdown>
              {/* @ts-ignore */}
              {directAnswer.snippet.value}
            </Markdown>
            {/* @ts-ignore */}
            {directAnswer?.relatedResult?.rawData?.c_parentBoard?.[0]?.slug && <Link className="Button Button--primary self-start" href={relativePrefixToRoot + directAnswer?.relatedResult?.rawData?.c_parentBoard?.[0]?.slug + `?selected=${directAnswer.relatedResult?.id}`}>Read More</Link>}
          </div>
        )}

        <SplitLayout
          className={layoutClass}
          rightClassName={selectedCard ? 'bg-brand-gray-100' : 'bg-white'}
          left={
            <CSSTransition
              nodeRef={leftRef} in={(isDesktop || !cardViewOpen)} timeout={200} classNames="Search-results">
              <div ref={leftRef}>
                {(!rawResults.length && lastQuery) && (
                  <div className="py-8">
                    <div className="mb-6">
                      Your search - {<span className="font-bold">{lastQuery}</span>} - did not match any answers we have.
                    </div>

                    <div className="italic">
                      Suggestions:
                    </div>
                    <ul className="list-disc list-inside">
                      <li>Make sure all words are spelled correctly.</li>
                      <li>Try to ask your question a different way.</li>
                      <li>Try more general words.</li>
                      <li>Try fewer words.</li>
                    </ul>
                  </div>
                )}
                <List
                  className={classNames("px-4 lg:px-0 pt-8 lg:pt-16", listClss)}
                  onClick={(profile) => {
                    if (isCard(profile.rawData)) {
                      openPanel(profile.rawData);
                    }
                  }}
                  profiles={results as unknown as SearchResult<CardProfile>[]}
                  Card={(profile) => {
                    const selected = profile.id === selectedCard?.id;
                    const clss = classNames("p-6 w-full border border-solid", selected ? 'border-black' : 'border-brand-gray-400')

                    return <CardTile className={clss} profile={profile.rawData as unknown as CardProfile} variant={cardVariant} />
                  }}
                />
              </div>
            </CSSTransition>
          }
          right={
            <CSSTransition
              onEnter={shiftMain}
              onExit={unshiftMain}
              onExited={() => {
                setSelectedCard(null);
              }}
              nodeRef={rightRef} in={cardViewOpen} timeout={200} classNames="Search-panel">
              <div ref={rightRef} className="Search-cardPanel bg-brand-gray-100 lg:px-8 lg:py-16 h-full" {...swipeHandlers}>
                {selectedCard && <Card
                  className="shadow-card-shadow"
                  onClose={closePanel}
                  card={selectedCard}
                  loadBreadcrumbsDynamically={true}
                  relativePrefixToRoot={relativePrefixToRoot}
                />}
              </div>
            </CSSTransition>
          }
        />
        <Pagination 
          customCssClasses={{
            paginationContainer: 'mt-3',
            selectedLabel: 'font-bold bg-brand-gray-200',
          }}
        />
      </div>
    </>
  )
}

export default Search;
