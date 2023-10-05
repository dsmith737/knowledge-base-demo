export const STREAMS_API_KEY = "e79b94b0fc927d04154863a23ee3428d"; 
export const SEARCH_API_KEY = "5b76ac601826e19e070973375eb7d602";
export const SEARCH_PATH = "search"; 
export const HOME_PATH = "index.html";
export const KB_VERTICAL_KEY = "cards"; 
export const V_PARAM_LIVE = "20230110";

export const getSearchProviderConfig = (locale: string) => ({
	apiKey: SEARCH_API_KEY,
	experienceKey: "knowledge-base-starter-search", 
	locale: locale,
	verticalKey: KB_VERTICAL_KEY,
	experienceVersion: "PRODUCTION",
	headlessId: 'general',
	additionalQueryParams: {
	  source: "knowledge_base"
	}
});
