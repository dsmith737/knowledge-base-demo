/**
 * This is an example of how to create a template that makes use of streams data.
 * The stream data originates from Yext's Knowledge Graph. When a template in
 * concert with a stream is built by the Yext Sites system, a static html page
 * is generated for every corresponding (based on the filter) stream document.
 *
 * Another way to think about it is that a page will be generated using this
 * template for every eligible entity in your Knowledge Graph.
 */

import React from "react";
import {
  TemplateRenderProps,
  Template,
  TemplateProps,
  GetPath,
  TemplateConfig,
  GetHeadConfig,
} from "@yext/pages";
import "src/index.css";
import { defaultHeadConfig } from "src/common/head";
import { FolderProfile } from "src/types/entities";
import { Breadcrumbs } from "src/components/common/Breadcrumbs";
import { recursiveFields } from "src/common/streams";
import { Link } from "@yext/pages/components";
import { AiTwotoneFolderOpen } from "react-icons/ai";
import { FaBook } from "react-icons/fa";
import { Main } from "src/components/Main";
import { useBreakpoint } from "src/common/useBreakpoints";
import classNames from "classnames";
import { getRuntime, isProduction } from "@yext/pages/util";
import { providePagesAnalytics } from "@yext/analytics";


/**
 * Required when Knowledge Graph data is used for a template.
 */
export const config: TemplateConfig = {
  stream: {
    $id: "folders",
    // Specifies the exact data that each generated document will contain. This data is passed in
    // directly as props to the default exported function.
    fields: [
      "id",
      "uid",
      "meta",
      "name",
      "slug",
      ...recursiveFields('c_subfolders', ['name', 'slug', 'id', 'uid', 'c_status']),
      ...recursiveFields('c_boards', ['name', 'slug', 'id', 'uid', 'c_cards']),
      ...recursiveFields('c_parentFolder', ['name', 'slug', 'id', 'uid'], 7)
    ],
    // Defines the scope of entities that qualify for this stream.
    filter: {
      entityTypes: ["ce_knowledgefolder"],
    },
    // The entity language profiles that documents will be generated for.
    localization: {
      locales: ["en"],
      primary: false,
    },
  },
};

/**
 * Defines the path that the generated file will live at for production.
 *
 * NOTE: This currently has no impact on the local dev path. Local dev urls currently
 * take on the form: featureName/entityId
 */
export const getPath: GetPath<TemplateProps> = (data) => {
  return data.document.slug || `folder/${data.document.id}`;
};

/**
 * This allows the user to define a function which will take in their template
 * data and procude a HeadConfig object. When the site is generated, the HeadConfig
 * will be used to generate the inner contents of the HTML document's <head> tag.
 * This can include the title, meta tags, script tags, etc.
 */
export const getHeadConfig: GetHeadConfig<TemplateRenderProps> = (data) => {
  return defaultHeadConfig(data);
};


const Folder: Template<TemplateRenderProps> = (data) => {
  React.useEffect(() => {
    const inProduction =
      isProduction(data.document.siteInternalHostName) ||
      isProduction(data.document.siteDomain);
    const pagesAnalytics = providePagesAnalytics({
      debug: !inProduction,
      businessId: data.document.businessId as number,
      pageType: {
        id: data.document.id,
        name: "entity",
        pageSetId: "folder"
      },
      pageUrl: window.location.href,
      production: inProduction,
      referrer: window.document.referrer || "",
      siteId: data.document.siteId as number,
    });
    if (window?.YEXT_AUTH?.visitor) {
      pagesAnalytics.setVisitor(window.YEXT_AUTH.visitor);
    }
    pagesAnalytics.pageView();
  }, []);
  
  return (
    <Main data={data}>
      <FolderInternal {...data} />
    </Main>
  )
}

/**
 * This is the main template. It can have any name as long as it's the default export.
 * The props passed in here are the direct stream document defined by `config`.
 *
 * There are a bunch of custom components being used from the src/components folder. These are
 * an example of how you could create your own. You can set up your folder structure for custom
 * components any way you'd like as long as it lives in the src folder (though you should not put
 * them in the src/templates folder as this is specific for true template files).
 */
const FolderInternal: Template<TemplateRenderProps> = (data) => {
  const document = data.document as FolderProfile;
  const { name, c_subfolders = [], c_boards = []} = document;
  const { relativePrefixToRoot } = data;
  const isDesktop = useBreakpoint('lg');
  const borderClass = c_boards?.length ? "sm:border-b border-solid border-brand-gray-400" : "";

  const folders = c_subfolders.filter(folder => folder.c_status === "PUBLISHED");
  const boards = [...c_boards];
  folders.sort((a, b) => a.name.localeCompare(b.name));
  boards.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <div>
        <div className="border-b border-solid border-brand-gray-400">
          <div className="container">
            <Breadcrumbs document={document} relativePrefixToRoot={data.relativePrefixToRoot} levelsToSkip={0} />
          </div>
        </div>

        <div>
          {!!folders.length && (
            <div className={classNames("py-8 sm:py-16", borderClass)}>
              <div className="container">
                <h2 className="Heading Heading--head mb-6 lg:mb-8">Folders in {name}</h2>

                <ol className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
                  {folders.map(folder => (
                    <li className="border border-solid border-brand-gray-400" key={folder.slug}>
                      <Link className="hover:bg-brand-gray-100 h-full w-full flex flex-col items-center justify-center py-9 px-4 text-center" href={relativePrefixToRoot + folder.slug}>
                        <AiTwotoneFolderOpen className="mb-4" size={75} />
                        {folder.name}
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {!!boards.length && (
            <div className="container py-8 sm:py-16">
              <h2 className="Heading Heading--head mb-6 lg:mb-8">Boards in {name}</h2>

              <ol className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
                {boards.map(board => {
                  const iconSize = isDesktop ? 75 : 32;
                  return (
                    <li className="border border-solid border-brand-gray-400" key={board.slug}>
                      <Link className="hover:bg-brand-gray-100 h-full w-full flex lg:flex-col items-center p-6 text-center" href={relativePrefixToRoot + board.slug}>
                        {/* <FaBook className="mb-4 mr-5" size={iconSize} /> */}
                        <div className="flex flex-col items-start">
                          <div className="Heading Heading--flag">
                            {board.name}
                          </div>
                          {!isDesktop && !getRuntime().isServerSide && <div>
                            {board?.c_cards?.length} cards
                          </div>}
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ol>
            </div>
          )}

          {!folders.length && !boards.length && (
            <div className="container mt-8">
              <div className="bg-brand-gray-200 h-[500px] flex items-center justify-center">
                <h1 className="Heading Heading--lead">
                  There's nothing here!
                </h1>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Folder;
