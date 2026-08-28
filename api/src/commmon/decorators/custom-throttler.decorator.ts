import { Throttle } from '@nestjs/throttler';

//strict rate for auth,payment
export const StrictThrottle = () =>
  Throttle({
    default: {
      ttl: 10000,
      limit: 3,
    },
  });

//Moderate rate for orders
export const ModerateThrottle = () =>
  Throttle({
    default: {
      ttl: 100000,
      limit: 5,
    },
  });

//Relaxed for read operatiors

export const RelaxedThrottle = () =>
  Throttle({
    default: {
      ttl: 100000,
      limit: 5,
    },
  });
