import classNames from "classnames";
import React from "react";

interface SectionProps {
  title: string;
  children: React.ReactElement;
  hideBorder?: boolean;
  isRemo?: boolean;
}

export default function Section(props: SectionProps) {
  const classes = classNames(
    "Section py-8 lg:py-16 border-solid border-brand-gray-400",
    {
      "sm:border-b": !props.hideBorder,
    }
  );
  return (
    <section className={classes}>
      <div className="container">
        {props.isRemo ? (
          <>
            <h3 className="Heading Heading--head">{props.title}</h3>

            <p className="italic mb-6 sm:mb-8">
              Powered by Yext Recommendations! Data captured from this pilot will help guide
							development of the new Recommendations product.
            </p>
          </>
        ) : (
          <h3 className="mb-6 sm:mb-8 Heading Heading--head">{props.title}</h3>
        )}

        {props.children}
      </div>
    </section>
  );
}
