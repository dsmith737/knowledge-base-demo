export const Routes = (relativePrefixToRoot: string) => ({
	share: (cardId: string) => relativePrefixToRoot + `api/cards/${cardId}/share`,
	views: (cardId: string) => relativePrefixToRoot + `api/cards/${cardId}/views`,
	starBoard: (boardId: string, userId: string) => relativePrefixToRoot + `api/boards/${boardId}/${userId}/star`,
	recent: (visitorId: string) => relativePrefixToRoot + `api/recent/${visitorId}/cards`,
})