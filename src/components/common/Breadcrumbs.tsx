import React, { useEffect, useRef, useState } from "react";
import {
  Link,
  CustomBreadcrumbs,
  Breadcrumbs as What,
} from "@yext/sites-react-components";
import { CardProfile, BoardProfile, FolderProfile } from "src/types/entities";
import { useClickOutside } from "src/common/useClickOutside";
import { getPath as getRootPath } from "src/templates/index";
import { useBreakpoint } from "src/common/useBreakpoints";
import classNames from "classnames";
import "src/components/common/Breadcrumbs.css";
import { BsSlashLg } from "react-icons/bs";
import { CSSTransition } from "react-transition-group";
import { STREAMS_API_KEY } from "src/common/consts";
import { FilterCombinator } from "@yext/search-headless-react";

export function getBreadcrumbs(
  document: CardProfile | BoardProfile | FolderProfile,
  relativePrefixToRoot: string
) {
  const out = [document];

  while (
    document && 
    typeof document === "object" && 
    "c_parentBoard" in document &&
    document?.c_parentBoard?.length
  ) {
    out.push(document.c_parentBoard[0]);
    document = document.c_parentBoard[0];
  }

  while (
    document && 
    typeof document === "object" && 
    "c_boardParentFolder" in document &&
    document?.c_boardParentFolder?.length
  ) {
    out.push(document.c_boardParentFolder[0]);
    document = document?.c_boardParentFolder?.[0];
  }

  while (typeof(document) === "object" && "c_parentFolder" in document) {
		out.push(document.c_parentFolder[0]);
    document = document.c_parentFolder[0];
  }

  out.reverse();
  return out;
}

interface BreadcrumbsProps {
  document: CardProfile | BoardProfile | FolderProfile;
  relativePrefixToRoot: string;
  levelsToSkip?: number;
}

type SimpleBreadcrumbsProps = BreadcrumbsProps & {
  loadDynamically?: boolean;
};

export function SimpleBreadcrumbs(props: SimpleBreadcrumbsProps) {
  const { levelsToSkip = 1 } = props;
  const crumbData = getBreadcrumbs(props.document, props.relativePrefixToRoot);
  const [dynamicCrumbData, setDynamicCrumbData] = useState<
    (CardProfile | BoardProfile | FolderProfile)[]
  >([]);
  useEffect(() => {
    if (!props.loadDynamically) return;
    async function loadCrumbs() {
      const params = new URLSearchParams({
        api_key: STREAMS_API_KEY,
        v: "20221010",
      });
      let crumb = await fetch(
        `https://streams.yext.com/v2/accounts/me/api/cardCrumbs/${
          props.document.uid
        }?${params.toString()}`
      )
        .then((resp) => resp.json())
        .then((resp) => resp.response.docs?.[0]);

      const crumbList = getBreadcrumbs(crumb, props.relativePrefixToRoot);

      setDynamicCrumbData(crumbList);
    }

    loadCrumbs();
  }, [props.document]);

  // In some situations like folder we want to show a crumb for the current page to allow
  // for navigation to siblings. But on boards we don't need to show the card or the board
  const crumbDataCopy = [
    ...(dynamicCrumbData.length ? dynamicCrumbData : crumbData),
  ];
  for (let i = 0; i < levelsToSkip; i++) {
    crumbDataCopy.pop();
  }

  return (
    <CustomBreadcrumbs
      className="flex flex-wrap"
      breadcrumbs={crumbDataCopy.map(
        (crumb) =>
          [crumb.name, props.relativePrefixToRoot + crumb.slug] as [
            string,
            string
          ]
      )}
    />
  );
}

export function Breadcrumbs(props: BreadcrumbsProps) {
  const crumbs = getBreadcrumbs(props.document, props.relativePrefixToRoot);
  for (
    let i = 0;
    i < (props.levelsToSkip === undefined ? 1 : props.levelsToSkip);
    i++
  ) {
    crumbs.pop();
  }
  const [activeLevel, setActiveLevel] = useState<number | null>(null);
  const [siblingsByFolder, setSiblingsByFolder] = useState<
    Record<string, { slug: string; name: string; id: string }[]>
  >({});
  const isDesktop = useBreakpoint("lg");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [collapsedHeight, setCollapsedHeight] = useState<number | null>(null);

  const relatedLinksRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  useClickOutside(relatedLinksRef, () => {
    setActiveLevel(null);
  });

  useEffect(() => {
    const handle = () => {
      setActiveLevel(null);
    };
    if (wrapperRef.current) {
      wrapperRef.current.addEventListener("mouseleave", handle);
      return () =>
        wrapperRef?.current?.removeEventListener("mouseleave", handle);
    }
  }, [wrapperRef]);

  const crumbsRef = useRef<HTMLOListElement>(null);
  const height = crumbsRef.current?.offsetHeight;

  const clearHeight = () => {
    if (!crumbsRef.current || !wrapperRef.current) return;
    crumbsRef.current.style.height = "";
  };

  return (
    <nav
      ref={wrapperRef}
      className="flex w-full items-end justify-between py-4"
      aria-label="Breadcrumbs"
    >
      <CSSTransition
        onEnter={() => {
          if (!crumbsRef.current || !wrapperRef.current) return;
          crumbsRef.current.style.height = `${height}px`;
          if (height) setCollapsedHeight(height);
        }}
        onExit={() => {
          if (!crumbsRef.current || !wrapperRef.current) return;
          crumbsRef.current.style.height = `${height}px`;
        }}
        onEntering={() => {
          if (!crumbsRef.current || !wrapperRef.current) return;
          const newHeight = crumbsRef.current.scrollHeight;
          crumbsRef.current.style.height = `${newHeight}px`;
        }}
        onExiting={() => {
          if (!crumbsRef.current || !wrapperRef.current) return;
          const newHeight = crumbsRef.current.scrollHeight;
          crumbsRef.current.style.height = `${collapsedHeight}px`;
        }}
        onEntered={clearHeight}
        onExited={clearHeight}
        timeout={200}
        classNames="Breadcrumbs-list"
        nodeRef={crumbsRef}
        in={isExpanded}
      >
        <ol
          ref={crumbsRef}
          className="Breadcrumbs-list flex flex-col lg:flex-row gap-2"
        >
          {(isDesktop || isExpanded || (!isDesktop && crumbs.length === 0)) && (
            <li>
              <Link
                className="text-2xl Link Link--underline"
                onMouseEnter={() => setActiveLevel(null)}
                href={props.relativePrefixToRoot + getRootPath()}
              >
                Home
              </Link>
              {crumbs.length !== 0 && (
                <span className="Breadcrumbs-separator text-2xl"> / </span>
              )}
            </li>
          )}
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1;
            const siblings = (siblingsByFolder[crumb.id] || []).filter(
              (folder) => folder.id !== crumb.id
            );
            if (!isDesktop && !isExpanded && !isLast) return null;

            return (
              <li
                className="relative"
                key={crumb.id}
                onMouseEnter={async () => {
                  if (!isDesktop) return;
                  setActiveLevel(i);
                  if (!siblingsByFolder[crumb.id]) {
                    const siblings = await fetch(
                      `https://streams.yext.com/v2/accounts/me/api/folderById/${crumb.uid}?api_key=9c217d4ed871f6a5ddd2cff38675787f&v=20221010`
                    )
                      .then((r) => r.json())
                      .then(
                        (r) =>
                          r.response.docs?.[0]?.c_parentFolder?.[0]
                            ?.c_subfolders
                      )
                      .then((subfolders) =>
                        subfolders.filter(
                          (folder: FolderProfile) =>
                            folder.c_status === "PUBLISHED"
                        )
                      );
                    setSiblingsByFolder((old) => ({
                      ...old,
                      [crumb.id]: siblings,
                    }));
                  }
                }}
              >
                <Link
                  className="text-2xl Link Link--underline"
                  href={props.relativePrefixToRoot + crumb.slug}
                >
                  {crumb.name}
                </Link>
                {activeLevel === i && (
                  <div
                    ref={relatedLinksRef}
                    className="absolute z-10 overflow-y-scroll max-h-[250px] mt-2 min-w-[260px] whitespace-nowrap flex flex-col py-2 bg-white border border-black border-solid rounded"
                  >
                    <div className="px-3">Jump to:</div>
                    <Link
                      className="px-3 py-2 font-bold hover:bg-brand-gray-200"
                      href={props.relativePrefixToRoot + crumb.slug}
                    >
                      {crumb.name}
                    </Link>
                    {siblings.length !== 0 && (
                      <>
                        <div className="mt-3 px-3">Related folders:</div>
                        <ol className="flex flex-col">
                          {siblings.map((sibling) => (
                            <li key={sibling.id} className="flex w-full">
                              <Link
                                className="px-3 py-2 w-full font-bold hover:bg-brand-gray-200"
                                href={props.relativePrefixToRoot + sibling.slug}
                              >
                                {sibling.name}
                              </Link>
                            </li>
                          ))}
                        </ol>
                      </>
                    )}
                  </div>
                )}
                {!isLast && (
                  <span className="Breadcrumbs-separator text-2xl"> / </span>
                )}
              </li>
            );
          })}
        </ol>
      </CSSTransition>
      {!isDesktop && crumbs.length !== 0 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={classNames(
            "Breadcrumbs-toggle Button p-2 rounded-full border border-solid border-black",
            { "is-expanded": isExpanded }
          )}
        >
          <BsSlashLg size={12} />
        </button>
      )}
    </nav>
  );
}
