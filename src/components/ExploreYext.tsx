import React from "react";
import { BasicRelationshipData } from "src/types/entities";
import Section from "src/components/common/Section";
import { AiTwotoneFolderOpen } from "react-icons/ai";
import { Link } from "@yext/sites-react-components";

interface Props {
  folders: BasicRelationshipData[];
}

export default function ExploreYext(props: Props) {
  const { folders } = props;

  return (
    <Section title="Explore Yext Organizations" hideBorder={true}>
      <ol className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
        {folders.map((folder, i) => (
          <li className="border border-solid border-brand-gray-400" key={i}>
            <Link className="hover:bg-brand-gray-100 w-full flex flex-col items-center justify-center py-9" href={folder.slug}>
              <AiTwotoneFolderOpen size={75} />
              {folder.name}
            </Link>
          </li>
        ))}
      </ol>
    </Section>
  );
}
