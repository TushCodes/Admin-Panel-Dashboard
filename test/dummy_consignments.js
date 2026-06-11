export const BASE_PICKUP_DATE = new Date('2026-01-01T00:00:00.000Z');
export const STATUSES = ['created', 'pickup_scheduled', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'delayed', 'cancelled'];
export const PICKUP_CITIES = [['New York', '10001'], ['Los Angeles', '90001'], ['Chicago', '60601'], ['Houston', '77001'], ['Phoenix', '85001'], ['Philadelphia', '19101'], ['San Antonio', '78201'], ['San Diego', '92101'], ['Dallas', '75201'], ['San Jose', '95101']];
export const DROP_CITIES = [['Austin', '73301'], ['Jacksonville', '32099'], ['Fort Worth', '76101'], ['Columbus', '43004'], ['Charlotte', '28201'], ['San Francisco', '94102'], ['Indianapolis', '46201'], ['Seattle', '98101'], ['Denver', '80201'], ['Boston', '02108']];

function addDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function buildDummyConsignment(index) {
  const [pickupCity, pickupPincode] = PICKUP_CITIES[(index - 1) % PICKUP_CITIES.length];
  const [dropCity, dropPincode] = DROP_CITIES[(index + 2) % DROP_CITIES.length];
  const pickupDate = addDays(BASE_PICKUP_DATE, index - 1);
  return {
    consignmentNum: `CN${String(index).padStart(14, '0')}`,
    status: STATUSES[(index - 1) % STATUSES.length],
    pickupAddress: `Warehouse ${(index % 25) + 1}, ${100 + index} Test Pickup Road, ${pickupCity}`,
    pickupPincode,
    pickupTag: `${pickupCity} Pickup Hub`,
    pickupDate,
    dropAddress: `Customer Dock ${(index % 30) + 1}, ${500 + index} Test Drop Avenue, ${dropCity}`,
    dropPincode,
    dropTag: `${dropCity} Delivery Zone`,
    dropDate: addDays(pickupDate, (index % 5) + 1),
  };
}

export const DUMMY_CONSIGNMENTS = Array.from({ length: 100 }, (_, idx) => buildDummyConsignment(idx + 1));
export function getDummyConsignments() { return DUMMY_CONSIGNMENTS.map((record) => ({ ...record })); }
