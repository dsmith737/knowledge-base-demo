import { ApiResponse } from "src/types/entities";

export async function wrappedFetch<T>(req: Request) {
  const response = await fetch(req);
  const responseBody = (await response.json()) as ApiResponse<T>;

  if (response.status < 200 || response.status >= 300) {
    return Promise.reject({status: response.status, response: responseBody});
  }

  return responseBody.response;
}
