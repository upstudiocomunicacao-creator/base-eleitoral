export type AddressLike = {
  cep?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
};

export function buildFullAddress(record: AddressLike) {
  return [
    joinStreet(record.street, record.number),
    record.complement,
    record.neighborhood,
    record.city,
    record.state,
    "Brasil",
  ].filter((item) => item && String(item).trim()).join(", ");
}

export function buildShortAddress(record: AddressLike) {
  return [
    joinStreet(record.street, record.number),
    record.neighborhood,
    record.city,
    record.state,
  ].filter((item) => item && String(item).trim()).join(", ");
}

function joinStreet(street?: string | null, number?: string | null) {
  if (street && number) return `${street}, ${number}`;
  return street ?? number ?? "";
}
