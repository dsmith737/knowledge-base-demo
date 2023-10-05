const API_KEY = "9c217d4ed871f6a5ddd2cff38675787f"; // add your API Key
const BASE_URL = "https://api.yext.com/v2/accounts/me/entities/"; // Add your base URL

interface PluginInput {
  urlArgs: {
    boardId: string;
    userId: string;
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

interface UserProfile {
  meta: {
    id: string,
  },
  c_starredBoards?: string[],
}

const headers = { 'Content-Type': 'application/json' };
const baseParams = new URLSearchParams({
  "v": "20220913",
  "api_key": API_KEY,
})

async function getUser(userId: string) {
  const params = new URLSearchParams({
    ...Object.fromEntries(baseParams),
    "fields": "c_starredBoards,meta",
  });

  return wrappedFetch<UserProfile>(new Request(`${BASE_URL}${userId}?${params.toString()}`, { headers }))
}

async function updateUser(user: UserProfile, boardId: string) {
  const userId = user.meta.id;
  let starredBoards = user.c_starredBoards || [];

  if (!starredBoards.includes(boardId)) {
    starredBoards.push(boardId);
  } else {
    starredBoards = starredBoards.filter(id => id !== boardId);
  }
  const update = { c_starredBoards: starredBoards };

  return fetch(new Request(`${BASE_URL}${userId}?${baseParams.toString()}`, {
    headers,
    method: "PUT",
    body: JSON.stringify(update),
  }))
}

export async function main(argumentJson: PluginInput): Promise<PluginResponse> {
  const boardId = argumentJson.urlArgs.boardId;
  const userId = argumentJson.urlArgs.userId;

  return getUser(userId)
    .then(user => updateUser(user, boardId))
    .then(async resp => ({
      body: JSON.stringify(await resp.json()),
      statusCode: resp.status,
      headers,
    }))
    .catch(resp => ({
      body: JSON.stringify(resp.response),
      statusCode: resp.status,
      headers,
    }));
}
