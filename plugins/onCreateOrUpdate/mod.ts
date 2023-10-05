declare const API_KEY: string;
const STREAMS_API_KEY = "9c217d4ed871f6a5ddd2cff38675787f";

interface Entity {
  meta: {
    entityType: string
  };
  c_ownerEmail: string;
}

interface WebhookEvent {
  meta: {
    eventType: string;
  };
  entityId: string;
  primaryProfile: Entity;
  changedFields: {
    fieldNames: string[];
  };
}

interface YexterStreamProfile {
  id: string;
  c_team?: string;
}

export async function updateCreatedDate(event: WebhookEvent) {
  if (!(isEntityCreate(event) || isEntityUpdate(event))) return;


  const today = new Date();
  const timestamp = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const updateReqBody = {'c_lastUpdateDate': timestamp};
  if (isEntityCreate(event)) {
    updateReqBody['c_dateCreated'] = timestamp;
  }

  const headers = new Headers();
  headers.set("content-type", "application/json");
  await fetch(`https://api.yext.com/v2/accounts/me/entities/${event.entityId}?v=20221010&api_key=${API_KEY}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(updateReqBody)
  })
}

async function getYexterByEmail(email: string) {
  const params = new URLSearchParams({
    v: "20220913",
    api_key: STREAMS_API_KEY,
    "emails": email,
    "limit": "1",
  });
  let yexterData = <YexterStreamProfile> await fetch(`https://streams.yext.com/v2/accounts/me/api/yexterByEmailStream?${params.toString()}`)
    .then(resp => resp.json())
    .then(resp => resp.response.docs ? resp.response.docs[0] : null)
	return yexterData;
}

export async function updateTeam(event: WebhookEvent) {
  if (!(isEntityCreate(event) || isEntityUpdate(event))) return;

  const ownerEmail = event.primaryProfile.c_ownerEmail;
  if (!ownerEmail) return;
  const headers = new Headers();
  headers.set("content-type", "application/json");
  const yexter = await getYexterByEmail(ownerEmail);
  if (!yexter || !yexter.c_team) return;
  const updateReqBody = {'c_team': yexter.c_team}
  await fetch(`https://api.yext.com/v2/accounts/me/entities/${event.entityId}?v=20221010&api_key=${API_KEY}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(updateReqBody)
  })
}

function isEntityCreate(event: WebhookEvent) {
  return event.meta.eventType === "ENTITY_CREATED" && event.primaryProfile?.meta?.entityType === "card";
}

function isEntityUpdate(event: WebhookEvent) {
  return event.meta.eventType === "ENTITY_UPDATED" && event.primaryProfile?.meta?.entityType === "card" &&
    (event.changedFields.fieldNames.includes("body") || event.changedFields.fieldNames.includes("name") || event.changedFields.fieldNames.includes("c_ownerEmail"));
}