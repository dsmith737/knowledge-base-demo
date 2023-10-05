import { BoardProfile, CardProfile, RawProfile } from "src/types/entities";

export function isCard(profile: CardProfile | BoardProfile | RawProfile<CardProfile> | RawProfile<BoardProfile>): profile is CardProfile {
	 const targetTypes = ["ce_knowledgecard"]
	 if ('meta' in profile) {
		return targetTypes.includes(profile.meta.entityType.id) 
	 }

	return targetTypes.includes(profile.type);
} 
