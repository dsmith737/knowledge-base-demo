import { toast } from "react-toastify";
import { CardProfile } from "src/types/entities";
import { useTemplateData } from "./useTemplateData";

export function copyCurrentUrlToClipboard() {
	navigator.clipboard.writeText(globalThis.location.toString())
		.then(() => toast.success("Link copied to clipboard!"))
		.catch(() => toast.error("Unable to copy link to clipboard."));
}

export function copyCardUrlToClipboard(profile: CardProfile, domain: string) {
	const urlBase = `${domain}/${profile.c_parentBoard?.[0].slug}`;
	if (!urlBase) {
		// This can happen if a card is not linked to a board, but still
		// visible through search or the home page
		return toast.error("In order to link to this card, it must be added to a board!");
	}

	navigator.clipboard.writeText(`${urlBase}?selected=${profile.id}`)
		.then(() => toast.success("Link copied to clipboard!"))
		.catch(() => toast.error("Unable to copy link to clipboard."));
}

