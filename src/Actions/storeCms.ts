export const STORE_CMS = "STORE_CMS";

export const storeCms = (cms: any) => {
  return {
    type: STORE_CMS,
    payload: cms
  }
}