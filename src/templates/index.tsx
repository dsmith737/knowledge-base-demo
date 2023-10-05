/**
 * !!!This is an example of how to create a static template that uses transformProps to retrieve data.
 */
import React, { useEffect, useRef, useState } from "react";
import {
  TemplateRenderProps,
  Template,
  TemplateConfig,
  GetHeadConfig,
} from "@yext/pages";
import "src/styles/index.css";
import "src/index.css";
import { SearchBar } from "@yext/search-ui-react";
import { CardProfile, SiteProfile } from "src/types/entities";
import ExploreYext from "src/components/ExploreYext";
import { defaultHeadConfig } from "src/common/head";
// import Section from "src/components/common/Section";
// import List from "src/components/common/TileList";
import { CustomBreadcrumbs } from "@yext/sites-react-components";
// import Card from "src/components/common/Card";
import classNames from "classnames";
import useUser from "src/common/useUser";
import { getRuntime } from "@yext/pages/util";
import {
  HOME_PATH,
  SEARCH_PATH,
  STREAMS_API_KEY,
  SEARCH_API_KEY,
  V_PARAM_LIVE,
} from "src/common/consts";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { BoardTile, CardTile } from "src/components/home/Tile";
import { useBreakpoint } from "src/common/useBreakpoints";
// import { SplitLayout } from "src/components/search/SplitLayout";
import { BrowserRouter } from "react-router-dom";
// import { CSSTransition } from "react-transition-group";
import { Main, shiftMain, unshiftMain } from "src/components/Main";
import "src/styles/search.css";
import { useSwipeRight } from "src/common/useSwipeRight";
import { Routes } from "src/common/routes";
import "react-cmdk/dist/cmdk.css";
// import { FaArrowDown } from "react-icons/fa";
import { useTemplateData } from "src/common/useTemplateData";
import { isProduction } from "@yext/pages/util";
import { providePagesAnalytics } from "@yext/analytics";
import { handleAnalytics } from "src/common/useCardView";

declare global {
  interface Window {
    YEXT_AUTH: { visitor: { id: string; telescopeEmail: string } };
  }
}

/**
 * Not required depending on your use case.
 */
export const config: TemplateConfig = {
  // The name of the feature. If not set the name of this file will be used (without extension).
  // Use this when you need to override the feature name.
  name: "index",
};

/**
 * Defines the path that the generated file will live at for production.
 *
 * NOTE: This currently has no impact on the local dev path. Local dev urls currently
 * take on the form: featureName/entityId
 */
export const getPath = (): string => {
  return HOME_PATH;
};

export const getHeadConfig: GetHeadConfig<TemplateRenderProps> = (data) => {
  return defaultHeadConfig(data);
};

/**
 * This is the main template. It can have any name as long as it's the default export.
 * The props passed in here are the direct result from `transformProps`
 */
const Index: Template<TemplateRenderProps> = (data) => {
  const document = data.document;
  // if (getRuntime().isServerSide) return <></>;
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
        staticPageId: "index"
      },
      pageUrl: window.location.href,
      production: inProduction,
      referrer: window.document.referrer || "",
      siteId: data.document.siteId as number,
    });
    // if (window?.YEXT_AUTH?.visitor) {
    //   pagesAnalytics.setVisitor(window.YEXT_AUTH.visitor);
    // }
    pagesAnalytics.pageView();
  }, []);

  return (
    <BrowserRouter>
      <Main data={data}>
        <IndexInternal {...data} />
      </Main>
    </BrowserRouter>
  );
};

// function scrollToBottom() {
//   window.scrollTo({
//     top: document.body.scrollHeight,
//     behavior: "smooth",
//   });
// }

const IndexInternal: Template<TemplateRenderProps> = (data) => {
  const _site = data.document._site as SiteProfile;
  const { relativePrefixToRoot } = data;
  // const { c_highlightedCards } = _site;
  const [cardsCreatedByCurrentUser, setCardsCreatedByCurrentUser] = useState<
    CardProfile[]
  >([]);
  const [recentlyViewedCards, setRecentlyViewedCards] = useState<CardProfile[]>(
    []
  );
  const user = useUser(data.document);
  const [popularCardsInUsersOrg, setPopularCardsInUsersOrg] = useState<
    CardProfile[]
  >([]);
  const [cardViewOpen, setCardViewOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardProfile | null>(null);
  const [remoCards, setRemoCards] = useState<
    CardProfile[]
  >([]);

  const [remoTitle, setRemoTitle] = useState("Recently Created Cards");

  function closePanel() {
    setCardViewOpen(false);
  }

  const swipeHandlers = useSwipeRight(closePanel);

  function openPanel(card: CardProfile) {
    setSelectedCard(card);
    setCardViewOpen(true);
  }

  const tplData = useTemplateData();

  useEffect(() => {
    async function fetchCreatedCards() {
      if (!user || !user.emails?.length) return;
      const params = new URLSearchParams({
        v: "20220913",
        api_key: STREAMS_API_KEY,
        c_ownerEmail: user.emails[0],
        limit: "5",
      });

      const createdCards = await fetch(
        `https://streams.yext.com/v2/accounts/me/api/cardByOwner?${params.toString()}`
      )
        .then((resp) => resp.json())
        .then((resp) => resp.response.docs);

      setCardsCreatedByCurrentUser(createdCards);
    }

    async function fetchPopularCards() {
      if (!user || !user.c_team) return;
      const endpoint =
        "https://streams.yext.com/v2/accounts/me/api/mostViewedCardsByOrg?";
      const team = user.c_team?.toUpperCase().replaceAll("/s/g", "_");
      const params = new URLSearchParams({
        v: "20221001",
        api_key: STREAMS_API_KEY,
        limit: "5",
        c_team: team,
      });
      const popularCards = await fetch(`${endpoint}${params.toString()}`)
        .then((resp) => resp.json())
        .then((resp) => resp.response.docs);
      setPopularCardsInUsersOrg(popularCards);
    }

    async function fetchCardsFromRemo() {
      const endpoint = "https://recommendations.optimizelocation.com/models";
      let visitorVal = window?.YEXT_AUTH?.visitor.id || "0"
      visitorVal = visitorVal.replace(/\D/g, "");
      const visitorValue =
        visitorVal.length > 4
        ? Number(visitorVal.charAt(3)) % 2
        : Number(visitorVal.charAt(visitorVal.length - 1)) % 2;

      const params = visitorValue != 1 ? "tel-kg-basic-trending" : "tel-kg-basic-trending";
      const remoData = await fetch(`${endpoint}/${params}/query?entityType=card`).then(response => {
                if (response.status >= 400 || response.statusCode >= 400) {
                  return response;
                } else {
                  return response.json();

                };
               })
               .catch(error => {
                        console.log(error);
                        return {
                          status: 500,
                          body: error
                        };
                      });

      setRemoCards(remoData.recommendations.map((x: any) => ({...x, ...x.profile, uid: x.profile.meta.uid})))

      //set the title of the section based on visitor id
      if (visitorValue != 1) {
        //NOTE: when we turn on a second arm of an experiment-swap the correct one out
        //TODO(lroberts): figure out a clean way to couple the two aspects together
        setRemoTitle("Trending Cards");
      } else {
        setRemoTitle("Trending Cards");
      }
    }

    fetchCreatedCards();
    fetchPopularCards();
    fetchCardsFromRemo();
  }, [user]);

  useEffect(() => {
    async function fetchRecentlyViewedCards() {
      if (!window?.YEXT_AUTH?.visitor.id) return;

      const createdCards = await fetch(
        Routes(relativePrefixToRoot).recent(window.YEXT_AUTH.visitor.id)
      )
        .then((resp) => resp.json())
        .then((resp) => resp.response.docs);

      setRecentlyViewedCards(createdCards);
    }

    fetchRecentlyViewedCards();
  }, [user]);

  function handleCardSelect(card: CardProfile) {
    openPanel(card);
  }

  function handleRemoTrendingCardSelect(card: CardProfile) {
    openPanel(card);
    handleAnalytics(card.uid, "remo-trending-card-view", tplData)
  }

  function handleRemoRecentlyCreatedCardSelect(card: CardProfile) {
    openPanel(card);
    handleAnalytics(card.uid, "remo-recently-created-card-view", tplData)
  }

  const sections = [
    // {
    //   title: "Highlighted Cards from Yext",
    //   cards: c_highlightedCards,
    //   isRemo: false,
    // },
    {
      title: "Recently Viewed Cards",
      cards: recentlyViewedCards,
      isRemo: false,
    },
    {
      title: "Popular Cards in your Org",
      cards: popularCardsInUsersOrg,
      isRemo: false,
    },
    {
      title: "Cards You've Created",
      cards: cardsCreatedByCurrentUser,
      isRemo: false,
    },
    {
      title: remoTitle,
      cards: remoCards,
      isRemo: true,
    },
  ];

  const layoutClass = classNames({
    "Index-layout": true,
    "is-open": cardViewOpen,
  });

  const isDesktop = useBreakpoint("md");
  const useCompactCards = !isDesktop || cardViewOpen;
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  return (
    <>
      <div className="Index">
        <ToastContainer autoClose={1500} />
        <div className="container">
          <CustomBreadcrumbs
            className="text-2xl py-4"
            breadcrumbs={[["Home", ""]]}
          />
        </div>
        <div className="flex flex-col">
          <div className="Index-grid bg-brand-gray-100">
            <div className="border-b border-t border-solid border-brand-gray-400">
              <div className="lg:container h-full">
                <div className="h-full mx-10 lg:mx-0 border-l border-r border-solid border-brand-gray-400"></div>
              </div>
            </div>
            <div className="lg:container h-full">
              <div className="mx-10 lg:mx-0 px-6 lg:px-8 border-l py-6 lg:py-16 border-r border-solid border-brand-gray-400">
                <h1 className="Index-title Heading mb-4">
                  Welcome to the Knowledge Base
                </h1>
                <h3 className="Heading Heading--flag mb-6">
                  Use the search bar to find the info you need!
                </h3>
                <SearchBar
                  placeholder="Search or Quick Find with ⌘ + K "
                  customCssClasses={{
                    searchBarContainer: "SearchBar-container mb-0 md:w-[550px]",
                    inputElement: "py-4 w-[0px]", // This doesn't actually set the width to 0, but it does override a built in min-width
                  }}
                  onSearch={({ query, verticalKey }) => {
                    window.location.href = `${relativePrefixToRoot}${SEARCH_PATH}?query=${query}`;
                  }}
                />
                {/* <button
                  onClick={scrollToBottom}
                  className="flex items-center mt-6 ml-auto mr-auto md:ml-0 md:mr-0"
                >
                  <span className="Link Link--underline text-lg font-bold">
                    Jump to Folders
                  </span>{" "}
                  <FaArrowDown className="ml-2" />
                </button> */}
              </div>
            </div>
            <div className="border-b border-t border-solid border-brand-gray-400">
              <div className="lg:container h-full">
                <div className="h-full mx-10 lg:mx-0 border-l border-r border-solid border-brand-gray-400"></div>
              </div>
            </div>
          </div>

          {/* <SplitLayout
            className={layoutClass}
            left={
              <CSSTransition
                nodeRef={leftRef}
                in={isDesktop || !cardViewOpen}
                timeout={200}
                classNames="Index-results"
              >
                <div ref={leftRef}>
                  {user?.c_starredBoards && (
                    <Section title="Starred Boards">
                      <List
                        selectedProfile={selectedCard?.id}
                        profiles={user.c_starredBoards}
                        Card={(profile) => (
                          <BoardTile
                            className="Tile--boardView"
                            profile={profile}
                            variant={useCompactCards ? "compact" : ""}
                          />
                        )}
                      />
                    </Section>
                  )}

                  {sections.map(
                    (section, i) =>
                      !!section.cards?.length && (
                        <Section
                          key={i}
                          title={section.title}
                          isRemo={section.isRemo}
                        >
                          <List
                            selectedProfile={selectedCard?.id}
                            onClick={
                              section.isRemo ?
                                section.title === "Recently Created Cards" ?
                                  handleRemoRecentlyCreatedCardSelect
                                  :
                                  handleRemoTrendingCardSelect
                                : handleCardSelect
                            }
                            profiles={section.cards}
                            Card={(profile) => (
                              <CardTile
                                profile={profile}
                                variant={useCompactCards ? "compact" : ""}
                              />
                            )}
                          />
                        </Section>
                      )
                  )}
                </div>
              </CSSTransition>
            }
            rightClassName={selectedCard ? "bg-brand-gray-100" : " bg-white"}
            right={
              <CSSTransition
                onEnter={shiftMain}
                onExit={unshiftMain}
                onExited={() => {
                  setSelectedCard(null);
                }}
                nodeRef={rightRef}
                in={cardViewOpen}
                timeout={200}
                classNames="Index-panel"
              >
                <div
                  ref={rightRef}
                  className="Index-cardPanel bg-brand-gray-100 h-full relative lg:px-8 lg:py-16"
                  {...swipeHandlers}
                >
                  {selectedCard && (
                    <Card
                      className="shadow-card-shadow"
                      onClose={closePanel}
                      card={selectedCard}
                      relativePrefixToRoot={relativePrefixToRoot}
                    />
                  )}
                </div>
              </CSSTransition>
            }
          /> */}
        </div>

        {/* {_site.c_rootFolders && <ExploreYext folders={_site.c_rootFolders} />} */}
      </div>
    </>
  );
};

export default Index;
