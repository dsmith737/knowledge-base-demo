const API_KEY = "9c217d4ed871f6a5ddd2cff38675787f";
const BASE_URL = "https://api.yext.com/v2/accounts/me/analytics/reports";

interface PluginInput {
  urlArgs: {
    cardId: string;
  }
}

interface PluginResponse {
  body: string,
  statusCode: number,
  headers?: Record<string, string>
}

interface ApiResponse<T = Record<string, unknown>> {
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

async function wrappedFetch<T>(req: Request) {
  const response = await fetch(req);
  const responseBody = (await response.json()) as ApiResponse<T>;

  if (response.status < 200 || response.status >= 300) {
    return Promise.reject(responseBody);
  }

  return responseBody.response;
}

interface AnalyticsData {
  data: {
    entity_id: string
    "Page Views": number
  }[]
}

const headers = { 'Content-Type': 'application/json' };
const baseParams = new URLSearchParams({
  "v": "20220922",
  "api_key": API_KEY,
})

async function getViews(cardId: string) {
  const params = new URLSearchParams({
    ...Object.fromEntries(baseParams),
  })

  const requestBody = {
    metrics: ["STOREPAGES_PAGEVIEWS"],
    dimensions: ["ENTITY_IDS"],
    filters: {
        entityIds: [cardId]
    }
  }

  const response = await wrappedFetch<AnalyticsData>(new Request(`${BASE_URL}?${params.toString()}`, { 
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
   }))

  const entities = response.data.filter(entry => entry.entity_id === cardId)

  return entities?.[0]?.["Page Views"] || 0
}

export async function main(argumentJson: PluginInput): Promise<PluginResponse> {
  const cardId = argumentJson.urlArgs.cardId;

  return await getViews(cardId)
    .then(count => ({
      headers,
      body: JSON.stringify({response: count}),
      statusCode: 200,
    }))
    .catch(resp => {
      return {body: JSON.stringify({meta: {errors: resp.meta.errors}}), statusCode: 500}
    })
}