// config/deliveryCharge.js
// The DELIVERY CHARGE added when the buyer lives far from the seller.
//
//   - Inside the free delivery zone (DELIVERY_FREE_ZONE_KM around the seller) delivery is free.
//   - Farther away, the buyer pays DELIVERY_CHARGE_PER_KM for every km beyond the zone,
//     at least DELIVERY_MIN_CHARGE and at most DELIVERY_MAX_CHARGE.
//
// Example with the default numbers (zone 50 km, Rs 1 per km, min Rs 30, max Rs 500):
//   Ranchi -> Khunti     ~ 39 km   -> free (inside the zone)
//   Ranchi -> Dhanbad    ~ 162 km  -> (162 - 50) x 1 = Rs 112
//   Ranchi -> New Delhi  ~ 1300 km -> Rs 500 (maximum)
//
// Change the numbers in backend/.env (no code changes needed).
// The distance is an estimate between district headquarters (see config/places.js).
// Like the platform charge, it is ALWAYS calculated here on the server.

const { readNumber } = require('./platformFee');
const { findPlace, estimateRoadDistanceKm } = require('./places');

function getDeliveryRules() {
  return {
    freeZoneKm: readNumber(process.env.DELIVERY_FREE_ZONE_KM, 50),
    perKm: readNumber(process.env.DELIVERY_CHARGE_PER_KM, 1),
    minimum: readNumber(process.env.DELIVERY_MIN_CHARGE, 30),
    maximum: readNumber(process.env.DELIVERY_MAX_CHARGE, 500),
  };
}

// Delivery charge in whole rupees for a distance in km
function calculateDeliveryCharge(distanceKm) {
  const { freeZoneKm, perKm, minimum, maximum } = getDeliveryRules();
  if (distanceKm <= freeZoneKm) {
    return 0;
  }
  const charge = Math.round((distanceKm - freeZoneKm) * perKm);
  return Math.min(maximum, Math.max(minimum, charge));
}

// Our sellers are tribal artisans from Jharkhand, so a seller whose address cannot be found
// on the map is treated as being in Ranchi
const DEFAULT_SELLER_PLACE = findPlace('Ranchi', 'Jharkhand');

// Distance and delivery charge from a seller to a delivery address ({ district, state }).
// Returns null when the buyer's place is unknown (for example no state chosen yet).
function getDeliveryQuote(seller, address) {
  const to = findPlace(address && address.district, address && address.state);
  if (!to) {
    return null;
  }
  const from = (seller && findPlace(seller.district, seller.state)) || DEFAULT_SELLER_PLACE;
  const distanceKm = estimateRoadDistanceKm(from, to);
  const deliveryCharge = calculateDeliveryCharge(distanceKm);

  return {
    distanceKm,
    deliveryCharge,
    outsideFreeZone: deliveryCharge > 0,
    from: from.label,
    to: to.label,
  };
}

module.exports = { getDeliveryRules, calculateDeliveryCharge, getDeliveryQuote };
