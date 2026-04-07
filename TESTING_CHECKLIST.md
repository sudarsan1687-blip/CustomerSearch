# CustomerSearch Application - Testing Checklist

## Test Requirements

### 1. Customer List Scrollbar
- [ ] Open the application
- [ ] Check if you can see more than 3 customers in the list
- [ ] Scroll down in the customer list - does a scrollbar appear?
- [ ] Is the scrollbar visible (8px wide, purple/primary color)?
- [ ] Can you scroll to see ALL customers in the list?

**Expected Result:** Scrollbar should be visible on the right side of the customer list panel, allowing you to see all customers.

---

### 2. Customer Details Scrollbar
- [ ] Click on any customer from the list
- [ ] Check the right panel - can you see all customer details?
- [ ] Scroll down in the customer details panel - does a scrollbar appear?
- [ ] Can you see all sections: Location, Contact, Buyer, Website?

**Expected Result:** Scrollbar should be visible on the customer details panel, allowing you to see all customer information.

---

### 3. Map Filtering by Country
- [ ] Look at the filter bar in the header (next to the CustomerMap logo)
- [ ] Select a specific country from the "Country" dropdown (e.g., "United Kingdom")
- [ ] Observe the map - does it zoom to show only UK customers?
- [ ] Check if markers outside UK disappear from the map

**Expected Result:** When filtering by country, the map should zoom to show only customers from that country.

---

### 4. UK Addresses Mapping Correctly
- [ ] Find a customer with UK address (e.g., "London, UK" or "Manchester, UK")
- [ ] Click on that customer
- [ ] Check if the pin is located in the United Kingdom (not USA or Asia)
- [ ] Verify coordinates in customer details show UK coordinates (Latitude ~50-59, Longitude ~-8 to 2)

**Expected Result:** UK addresses should be pinned in the United Kingdom, not in USA or Asia.

**UK Coordinates Reference:**
- London: ~51.5074, -0.1278
- Manchester: ~53.4808, -2.2426
- Birmingham: ~52.4862, -1.8904

---

### 5. Cache Test (For Previously Mapped Customers)
- [ ] Open the application and note how long it takes for pins to appear
- [ ] Refresh the page (F5)
- [ ] Pins should appear instantly (from cache) without waiting for geocoding
- [ ] Only NEW addresses (if any) should take time to geocode

**Expected Result:** Previously mapped customers should appear instantly on refresh.

---

## How to Clear Cache (If Needed)

If UK addresses are still showing in wrong locations, clear the cache:

1. Open Browser DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Expand **Local Storage**
4. Delete the key: `cs_geocode_cache`
5. Or run this in Console:
   ```javascript
   localStorage.removeItem('cs_geocode_cache');
   ```
6. Refresh the page to re-geocode with improved country filtering

---

## Issues to Report

If any test fails, please provide:
1. Which test failed (1-5)
2. What you observed vs. what was expected
3. A screenshot if possible
4. Sample customer name/address that demonstrates the issue
