interface BaseProfile {
  id: string;
  businessId: number;
  name: string;
  locale: string;
  siteDomain: string;
  siteId: number;
  siteInternalHostName: string;
  uid: number;
  meta: {
    entityType: {
      id: string;
      uid: number;
    };
    locale: string;
  };
}

export type RawProfile<ProfileType> = Omit<ProfileType, 'meta'> & {type: string};

export type SearchResult<ProfileType> = {
  entityType: string
  rawData: RawProfile<ProfileType>
}

export interface BasicRelationshipData {
  name: string;
  slug: string;
}

export interface FolderProfile extends BaseProfile {
  slug: string
  c_subfolders: FolderProfile[];
  c_boards: BoardProfile[];
  c_parentFolder: FolderProfile[];
  c_status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
}

export interface CardProfile extends BaseProfile {
  body: string;
  body_richtext_v2: {
    html: string
  }
  id: string;
  slug: string;
  c_shareCount?: number;
  c_parentBoard?: BoardProfile[];
  c_dateCreated?: string
  c_lastUpdateDate?: string
  c_tags?: string[]
  c_status?: "PUBLISHED" | "DRAFT" | "ARCHIVED"
  s_snippet?: string;
}

interface LinkedCardInfo {
  name: string;
  body: string;
  id: string;
  slug: string;
}

export interface BoardProfile extends BaseProfile {
  slug?: string
  body_richtext_v2?: string;
  c_cards?: CardProfile[];
  c_boardParentFolder?: FolderProfile[];
}

export interface SiteProfile {
  c_rootFolders: BasicRelationshipData[];
  c_highlightedCards: CardProfile[];
}

export interface YexterProfile extends BaseProfile {
  c_starredBoards?: string[];
}

// Yexter type returned from streams
export interface YexterStreamProfile {
  id: string;
  c_starredBoards?: BoardProfile[];
  emails?: string[];
  c_team?: string;
}

export interface ApiResponse<T = Record<string, unknown>> {
  meta: {
    uuid: string;
    errors: {
      code: number;
      message: string;
      type: string;
    }[];
  };
  response: T;
}
