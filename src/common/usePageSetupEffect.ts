// From https://hitchhikers.yext.com/guides/search-react-state-in-url/02-search-state-url/

import { Matcher, useSearchActions } from "@yext/search-headless-react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export const usePageSetupEffect = (verticalKey?: string) => {
  const [searchParams] = useSearchParams();
  const searchActions = useSearchActions();

  useEffect(() => {
    searchActions.setQuery(searchParams.get("query") || "");
    const tagParam = searchParams.get("tag") || "";

    if (verticalKey) {
      searchActions.setVertical(verticalKey);
      searchActions.executeVerticalQuery()
        .then(() => {
          if (tagParam) {
            searchActions.setFacetOption("c_tags", {
              value: tagParam,
              matcher: Matcher.Equals,
            }, true);
            searchActions.executeVerticalQuery()
          }
        });
    } else {
      searchActions.setUniversal();
      searchActions.executeUniversalQuery();
    }

  }, [searchActions]);
};