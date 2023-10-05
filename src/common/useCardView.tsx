import { isProduction } from "@yext/pages/util";
import { providePagesAnalytics } from "@yext/analytics";
import { useTemplateData } from "./useTemplateData";
import { useEffect } from "react";

export function useCardView(cardId: number) {
  const tplData = useTemplateData();
  useEffect(() => {
    const inProduction =
      isProduction(tplData.document.siteInternalHostName) ||
      isProduction(tplData.document.siteDomain);

    // We have to construct a new provider every time,
    // because there isn't a method to update the entity id after initialization
    const analyticsProvider = providePagesAnalytics({
      businessId: tplData.document.businessId as number,
      pageType: {
        name: "entity",
        pageSetId: tplData.document.__.name,
        id: cardId,
      },
      debug: !inProduction,
      pageUrl: window.location.href,
      production: inProduction,
      referrer: document.referrer || "",
      siteId: tplData.document.siteId as number,
    });
    if (window?.YEXT_AUTH?.visitor) {
      analyticsProvider.setVisitor(window.YEXT_AUTH.visitor);
    }

    analyticsProvider.track({ eventType: "card-view" });
  }, [cardId]);
}

export function handleAnalytics(cardId:number, eventName: string, tplData:any) {
	//analytics call
	const inProduction =
	isProduction(tplData.document.siteInternalHostName) ||
	isProduction(tplData.document.siteDomain);

	// We have to construct a new provider every time,
	// because there isn't a method to update the entity id after initialization
	const analyticsProvider = providePagesAnalytics({
		businessId: tplData.document.businessId as number,
		pageType: {
			name: "entity",
			pageSetId: tplData.document.__.name,
			id: cardId,
		},
		debug: !inProduction,
		pageUrl: window.location.href,
		production: inProduction,
		referrer: document.referrer || "",
		siteId: tplData.document.siteId as number,
	});
	if (window?.YEXT_AUTH?.visitor) {
		analyticsProvider.setVisitor(window.YEXT_AUTH.visitor);
	}

	analyticsProvider.track({ eventType: eventName });
}
