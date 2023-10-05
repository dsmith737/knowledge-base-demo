// TODO(bhaines): pull this from YEXT_AUTH visitor information
// after Aether exposes it

import { isProduction } from "@yext/pages/util";
import { useEffect, useState } from "react";
import { YexterStreamProfile } from "src/types/entities";
import { STREAMS_API_KEY } from "./consts";

interface DomainInfo {
	siteInternalHostName?: string
	siteDomain?: string
}
export default function useUser(info: DomainInfo) {
	const [yexterData, setYexterData] = useState<YexterStreamProfile | null>(null);

	useEffect(() => {
		async function getData() {
			const inProduction = isProduction(info?.siteInternalHostName || '') || isProduction(info?.siteDomain || '');
			const userName = inProduction ? window?.YEXT_AUTH?.visitor.telescopeEmail : 'bhaines@yext.com';
			const params = new URLSearchParams({
				v: "20220913",
				api_key: STREAMS_API_KEY,
				"emails": userName,
				"limit": "1",
			});
			const yexterData = await fetch(`https://streams.yext.com/v2/accounts/me/api/yexterByEmailStream?${params.toString()}`)
				.then(resp => resp.json())
				.then(resp => resp.response.docs ? resp.response.docs[0] : null)
			setYexterData(yexterData);
		}

		getData();
	}, []);

	return yexterData;
}
