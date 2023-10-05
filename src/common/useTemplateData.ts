import { TemplateRenderProps } from "@yext/pages/*";
import React, { createContext, useContext, useEffect } from "react";

/**
 * A helper to create a Context and Provider with no upfront default value, and
 * without having to check for undefined all the time.
 */
 export function createCtx<A extends {} | null>() {
  const ctx = createContext<A | undefined>(undefined);
  function useCtx() {
    const c = useContext(ctx);
    if (c === undefined)
      throw new Error(
        "Attempted to call useProfile outside of TemplateDataProvider"
      );
    return c;
  }
  return [useCtx, ctx.Provider] as const; // 'as const' makes TypeScript infer a tuple
}

const [useTemplateData, TemplateDataProvider] = createCtx<TemplateRenderProps>();

export {
  useTemplateData,
  TemplateDataProvider
}
