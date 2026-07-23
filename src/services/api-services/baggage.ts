/**
 * ⚠️ BACKEND REALITY CHECK: there is no baggage module, table, or
 * endpoint ANYWHERE in pss_modular_cqrs. checkin's request body has a
 * baggage_count/baggage_weight_kg pair recorded alongside a check-in
 * (see checkIn.ts), but that's it -- no baggage tracking, status,
 * listing, or update capability exists server-side. This whole file has
 * nothing real to call.
 *
 * Every function below throws instead of hitting a 404 silently. Either
 * build a baggage module/endpoints on the backend first, or remove the
 * Baggage feature from this admin app until they exist.
 */

const NOT_IMPLEMENTED =
  'Baggage tracking has no backend module in pss_modular_cqrs at all. ' +
  'See the comment at the top of baggage.ts.';

function notImplemented(): never {
  throw new Error(NOT_IMPLEMENTED);
}

export const baggageApi = {
  async getBaggage(): Promise<never> { return notImplemented(); },
  async updateBaggageStatus(_id: string, _status: string): Promise<never> { return notImplemented(); },
};
