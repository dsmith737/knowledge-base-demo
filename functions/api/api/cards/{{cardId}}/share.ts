const API_KEY = "9c217d4ed871f6a5ddd2cff38675787f";
const BASE_URL = "https://api.yext.com/v2/accounts/me/entities/";

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
    return Promise.reject({status: response.status, response: responseBody});
  }

  return responseBody.response;
}

interface CardProfile {
  meta: {
    id: string,
  },
  c_shareCount?: number,
}

const headers = { 'Content-Type': 'application/json' };
const baseParams = new URLSearchParams({
  "v": "20220913",
  "api_key": API_KEY,
})

async function getCard(cardId: string) {
  const params = new URLSearchParams({
    ...Object.fromEntries(baseParams),
    "fields": "c_shareCount,meta",
  })

  return wrappedFetch<CardProfile>(new Request(`${BASE_URL}${cardId}?${params.toString()}`, { headers }))
}

async function updateCard(card: CardProfile) {
  const cardId = card.meta.id;
  const count = card.c_shareCount || 0;
  const update = { c_shareCount: String(Number(count) + 1) };

  return fetch(new Request(`${BASE_URL}${cardId}?${baseParams.toString()}`, {
    headers,
    method: "PUT",
    body: JSON.stringify(update),
  }))
}

export async function main(argumentJson: PluginInput): Promise<PluginResponse> {
  const cardId = argumentJson.urlArgs.cardId;

  return getCard(cardId)
    .then(updateCard)
    .then(async resp => ({
      body: JSON.stringify(await resp.json()),
      statusCode: resp.status,
      headers,
    }))
    .catch(resp => ({
      body: JSON.stringify(resp.response),
      statusCode: resp.status,
      headers,
    }))
}
