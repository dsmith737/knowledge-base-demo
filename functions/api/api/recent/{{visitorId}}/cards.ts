const API_KEY = "9c217d4ed871f6a5ddd2cff38675787f";
const LOGS_API_KEY = "1d9766e662104857e98c3797c3b5e45c"

interface PluginInput {
  urlArgs: {
    visitorId: string;
  }
}

interface PluginResponse {
  body: string,
  statusCode: number,
  headers?: Record<string, string>
}

interface LogRecord {
	entityExternalId: string
}

const baseParams = new URLSearchParams({
	v: "20221010",
});

const headers = {'Content-Type': 'application/json'}

export async function main(input: PluginInput): Promise<PluginResponse> {
	const { visitorId } = input.urlArgs;
	const logsRequestBody = {
		"descending": true,
    "filter": `action == 'C_CARD-VIEW' && visitor.id == '${visitorId}'`,
    "pageSize": 5
	}
	const logsRequestParams = new URLSearchParams({
    ...Object.fromEntries(baseParams),
		api_key: LOGS_API_KEY,
	});

	const logs = await fetch(`https://api.yext.com/v2/accounts/me/logs/tables/analyticsEvents/query?${logsRequestParams.toString()}`, {
		method: "POST",
		body: JSON.stringify(logsRequestBody),
		headers,
	})
		.then(resp => resp.json())
		.then(resp => resp.response.logRecords);

	const ids: string[] = logs.map((record: LogRecord) => record.entityExternalId);
	const streamRequestParams = new URLSearchParams({
    ...Object.fromEntries(baseParams),
		api_key: API_KEY,
	});
	ids.forEach(id => streamRequestParams.append("id__in", id));
	const cardData = await fetch(`https://streams.yext.com/v2/accounts/me/api/mostViewedCardsByOrg?${streamRequestParams.toString()}`)
		.then(resp => resp.json());

	return {
		body: JSON.stringify(cardData),
		statusCode: 200,
		headers,
	}
}

// main({urlArgs: {visitorId: "00u19we1au8z9NNAt1d8"}})
// 	.then(x => console.log(JSON.stringify(x)))