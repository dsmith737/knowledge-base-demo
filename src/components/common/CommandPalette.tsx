import { AutocompleteResult, Result, useSearchActions } from "@yext/search-headless-react";
import React, { useEffect, useState } from "react";
import CommandPalette, { useHandleOpenCommandPalette } from "react-cmdk";
import { FaBook, FaFolder, FaInfoCircle } from "react-icons/fa";
import { provideHeadless, SearchHeadlessProvider } from "@yext/search-headless-react";
import { getSearchProviderConfig } from "src/common/consts";

interface CommandPaletteProps {
  relativePrefixToRoot: string;
  locale: string;
}

function validResultFilter(result: AutocompleteResult) {
  if (!result.relatedItem) return false;
  if (['ce_knowledgecard', 'ce_knowledgefolder'].includes(result.relatedItem.entityType || '')) {
    return result.relatedItem.rawData.c_status === "Published";
  }

  return true;
}

export default function CustomCommandPalette(props: CommandPaletteProps) {
  // The CommandPalette needs its own headless provider so it doesn't interfere with the one on the search page
  const searcher = provideHeadless({
    ...getSearchProviderConfig(props.locale),
    verticalKey: 'cards',
    // verticalKey: 'kb_autocomplete',
    headlessId: 'cmd_pallette',
  });

  return (
    <SearchHeadlessProvider searcher={searcher}>
      <CustomCommandPaletteInternal {...props} />
    </SearchHeadlessProvider>
  );
}

function CustomCommandPaletteInternal(props: CommandPaletteProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [search, setSearch] = useState("");
  useHandleOpenCommandPalette(setOpen);
  const [items, setItems] = useState<AutocompleteResult[]>();
  const actions = useSearchActions();

  useEffect(() => {
    const getSuggestions = async () => {
      const suggestions = await actions.executeFilterSearch(search, true, [
        {
          fieldApiName: "name",
          entityType: "ce_knowledgecard",
          fetchEntities: true
        } // deleted a comma
        // {
        //   fieldApiName: "name",
        //   entityType: "ce_knowledgecard",
        //   fetchEntities: true
        // },
        // {
        //   fieldApiName: "name",
        //   entityType: "ce_folder",
        //   fetchEntities: true
        // }
      ]);
      setItems((suggestions?.sections?.[0]?.results || []).filter(validResultFilter))
    }
    getSuggestions();
  }, [search])

  function Icon(result: Result | undefined) {
    if (!result) return null;
    if (result.entityType === "ce_knowledgeboard") return <FaBook />
    if (result.entityType === "ce_knowledgefolder") return <FaFolder />
    return <FaInfoCircle />
  }

  function getUrl(result: Result | undefined) {
    if (!result) return '';
    if (result.entityType === "ce_knowledgeboard" || result.entityType === "ce_knowledgefolder") return `${props.relativePrefixToRoot}${result.rawData.slug}`;
    return `${props.relativePrefixToRoot}board/${(result.rawData.c_parentBoard as {entityId: string, name: string}[])?.[0].entityId.toLowerCase()}?selected=${result.id}`
  }

  return (
    <CommandPalette
      onChangeSearch={setSearch}
      onChangeOpen={(isOpen) => {setOpen(isOpen)}}
      search={search}
      isOpen={open}
      page="root"
    >
		{!!items?.length &&
      <CommandPalette.Page id="root">
        <CommandPalette.List heading={"Search Results"}>
          {items?.map((item, i) => {
            return (
              <CommandPalette.ListItem
                key={i}
                index={i}
                icon={() => Icon(item.relatedItem)}
                href={getUrl(item.relatedItem)}
              >
                {item.value}
              </CommandPalette.ListItem>
            )
					})}
        </CommandPalette.List>
      </CommandPalette.Page>}
    </CommandPalette>
  );
};
