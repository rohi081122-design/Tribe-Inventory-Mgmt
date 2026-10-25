// hooks/useFeeRules.js
// Loads the platform charge rules ({ percent, minimum }) and the delivery charge rules
// ({ delivery: { freeZoneKm, perKm, minimum, maximum } }) from the backend once,
// so pages can SHOW the charges before checkout. The real charges are always calculated
// by the backend when the order is placed.

import { useEffect, useState } from 'react';
import { orderAPI } from '../services/api.js';

let cachedRules = null; // shared by all pages, so the rules are loaded only once

export default function useFeeRules() {
  const [rules, setRules] = useState(cachedRules);

  useEffect(() => {
    if (cachedRules) return;
    orderAPI
      .getFeeRules()
      .then((data) => {
        cachedRules = { percent: data.percent, minimum: data.minimum, delivery: data.delivery };
        setRules(cachedRules);
      })
      .catch(() => setRules(null));
  }, []);

  return rules;
}

// Same formula as backend/config/platformFee.js (for display only)
export function estimatePlatformFee(lineTotal, rules) {
  if (!rules) return 0;
  return Math.max(rules.minimum, Math.round((lineTotal * rules.percent) / 100));
}
