export const STORE_PROPERTY = "STORE_PROPERTY";

export const storeProperty = (property: any) => {
  return {
    type: STORE_PROPERTY,
    payload: property
  }
}