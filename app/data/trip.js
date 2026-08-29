/* ============================================================
   Philippines Trip — content model
   All coordinates are [lng, lat]. Prices in PHP unless noted.
   FX baselines editable in the app; used only for estimates.
   ============================================================ */
window.TRIP = {
  meta: {
    title: "Philippines · 20 nights",
    subtitle: "Cebu gateway · Palawan-deep · quiet → wild → buzz",
    dates: "12 Feb – 6 Mar 2027",
    home: "TLV",
    people: 1,
    fx: { PHP: 1, USD: 58.5, ILS: 15.8 }, // 1 unit of currency = N PHP
    currencies: ["PHP", "USD", "ILS"]
  },

  /* ---- Hubs: the places you sleep, in order ---- */
  hubs: [
    { id: "mactan1", name: "Mactan (arrival)", region: "cebu", lng: 123.979, lat: 10.307,
      nights: 1, from: "2027-02-13", color: "#8aa0b6" },
    { id: "coron", name: "Coron", region: "coron", lng: 120.204, lat: 12.005,
      nights: 5, from: "2027-02-14", color: "#2ea9c9" },
    { id: "tao", name: "Tao expedition", region: "linapacan", lng: 119.85, lat: 11.55,
      nights: 4, from: "2027-02-19", color: "#e8823a" },
    { id: "elnido", name: "El Nido", region: "elnido", lng: 119.393, lat: 11.196,
      nights: 6, from: "2027-02-23", color: "#37a86b" },
    { id: "moalboal", name: "Moalboal", region: "cebu", lng: 123.383, lat: 9.947,
      nights: 3, from: "2027-03-01", color: "#c065b8" },
    { id: "mactan2", name: "Mactan (departure)", region: "cebu", lng: 123.979, lat: 10.307,
      nights: 1, from: "2027-03-04", color: "#8aa0b6" }
  ],

  /* ---- Day-by-day schedule ---- */
  days: [
    { d: "Fri 12 Feb", hub: null, title: "Fly out", type: "transit",
      body: "Depart TLV in the evening (Emirates via Dubai). Long-haul begins.",
      pins: [] },
    { d: "Sat 13 Feb", hub: "mactan1", title: "Land Cebu · sleep Mactan", type: "transit",
      body: "Arrive afternoon. Sleep near the airport. Recover — don't schedule anything.",
      pins: ["ceb-airport"] },
    { d: "Sun 14 Feb", hub: "coron", title: "Cebu → Coron", type: "travel",
      body: "Morning flight CEB → Busuanga (~1h20), transfer to Coron town (~40 min). Settle. Mt Tapyas sunset (720 steps) if you've got the legs.",
      pins: ["usu-airport", "mt-tapyas"] },
    { d: "Mon 15 Feb", hub: "coron", title: "Kayangan + Twin Lagoon", type: "highlight",
      body: "Kayangan Lake BEFORE 8am + Twin Lagoon — the single best sight of the trip. Book a private or early group boat.",
      pins: ["kayangan", "twin-lagoon", "siete-pecados"] },
    { d: "Tue 16 Feb", hub: "coron", title: "White-sand beach day", type: "beach",
      body: "Malcapuya + Banana + Bulog — powder sand, turquoise shallows. Long boat day, bring cash for island fees.",
      pins: ["malcapuya", "banana-is", "bulog"] },
    { d: "Wed 17 Feb", hub: "coron", title: "Barracuda + reef & wreck", type: "dive",
      body: "Barracuda Lake + reef and wreck snorkel — or an intro dive / freediving (Barracuda is world-class for it).",
      pins: ["barracuda", "skeleton-wreck", "cyc"] },
    { d: "Thu 18 Feb", hub: "coron", title: "Flex + Tao briefing", type: "rest",
      body: "Maquinit hot springs, town, or a pure rest day. EVENING: Tao briefing at the Coron office — don't miss it.",
      pins: ["maquinit", "tao-office"] },
    { d: "Fri 19 Feb", hub: "tao", title: "Tao day 1 — depart Coron", type: "expedition",
      body: "Depart Coron morning. Sail into remote West Busuanga. First bamboo camp. No wifi from here.",
      pins: ["tao-office", "tao-camp1"] },
    { d: "Sat 20 Feb", hub: "tao", title: "Tao day 2 — Culion waters", type: "expedition",
      body: "Snorkel stops, fresh-caught lunch on the boat, second island camp.",
      pins: ["tao-camp2"] },
    { d: "Sun 21 Feb", hub: "tao", title: "Tao day 3 — Linapacan", type: "expedition",
      body: "Linapacan — some of the clearest water anywhere on earth. Third camp.",
      pins: ["tao-camp3", "linapacan-clear"] },
    { d: "Mon 22 Feb", hub: "tao", title: "Tao day 4 — last camp", type: "expedition",
      body: "Final full day of islands and reefs. Last night in camp.",
      pins: ["tao-camp4"] },
    { d: "Tue 23 Feb", hub: "elnido", title: "Arrive El Nido", type: "travel",
      body: "Arrive El Nido ~noon. Rest day. Town wander, Corong-Corong sunset. Keep it loose after the expedition.",
      pins: ["elnido-town", "corong-corong"] },
    { d: "Wed 24 Feb", hub: "elnido", title: "Tour A — Big & Small Lagoon", type: "highlight",
      body: "Book the EARLIEST slot — it's the crowd-beater. Big Lagoon, Small Lagoon, Secret Lagoon, Shimizu, 7 Commandos.",
      pins: ["big-lagoon", "small-lagoon", "secret-lagoon", "shimizu"] },
    { d: "Thu 25 Feb", hub: "elnido", title: "Nacpan Beach", type: "beach",
      body: "Full lazy day at Nacpan — 4km of golden sand, ~45 min by trike/scooter. Sunset dinner beachside.",
      pins: ["nacpan"] },
    { d: "Fri 26 Feb", hub: "elnido", title: "Tour C or flex", type: "highlight",
      body: "Tour C (Hidden Beach, Matinloc Shrine, Secret Beach, Star Beach) — or a flex/rest day.",
      pins: ["hidden-beach", "matinloc", "secret-beach"] },
    { d: "Sat 27 Feb", hub: "elnido", title: "Las Cabanas + town", type: "beach",
      body: "Las Cabanas sunset (the classic), zipline over the water optional, town night.",
      pins: ["las-cabanas"] },
    { d: "Sun 28 Feb", hub: "elnido", title: "Chill / buffer", type: "rest",
      body: "Open day — repeat a favourite, dive, or do nothing. Pack for the early flight.",
      pins: [] },
    { d: "Mon 1 Mar", hub: "moalboal", title: "El Nido → Moalboal", type: "travel",
      body: "Morning flight El Nido → Cebu (~1h50), drive to Moalboal (~3h). The variety leg.",
      pins: ["ens-airport", "panagsama"] },
    { d: "Tue 2 Mar", hub: "moalboal", title: "Sardine run + turtles", type: "highlight",
      body: "Snorkel the sardine run + sea turtles straight off Panagsama beach — a 20m swim from shore.",
      pins: ["panagsama", "pescador"] },
    { d: "Wed 3 Mar", hub: "moalboal", title: "Kawasan canyoneering", type: "dive",
      body: "Kawasan Falls canyoneering (adrenaline) or a pure beach day at White Beach.",
      pins: ["kawasan", "white-beach-m"] },
    { d: "Thu 4 Mar", hub: "mactan2", title: "Moalboal → Mactan", type: "travel",
      body: "Drive back (~3h), sleep near the airport. Buffer before the flight home.",
      pins: ["ceb-airport"] },
    { d: "Fri 5 Mar", hub: "mactan2", title: "Fly home", type: "transit",
      body: "Depart Cebu in the evening. Land TLV Sat 6 Mar.",
      pins: ["ceb-airport"] }
  ],

  /* ---- POIs / pins ----
     cat: beach | lagoon | viewpoint | food | dive | transport | camp | town | springs
  ---- */
  pois: {
    "ceb-airport":   { name: "Mactan-Cebu Airport (CEB)", cat: "transport", region:"cebu", lng:123.979, lat:10.307, hub:"mactan1", note:"International gateway. Airport-side hotels for the buffer nights." },
    "usu-airport":   { name: "Busuanga Airport (USU)", cat: "transport", region:"coron", lng:120.100, lat:12.121, hub:"coron", note:"~40 min van transfer to Coron town." },
    "ens-airport":   { name: "El Nido Airport (ENI)", cat: "transport", region:"elnido", lng:119.417, lat:11.203, hub:"elnido", note:"AirSWIFT to Cebu. Small planes, tight baggage limits." },

    "mt-tapyas":     { name: "Mt Tapyas Viewpoint", cat:"viewpoint", region:"coron", lng:120.198, lat:12.008, hub:"coron", star:true, note:"720 steps, best at sunset. Giant cross + panorama over Coron Bay." },
    "kayangan":      { name: "Kayangan Lake", cat:"lagoon", region:"coron", lng:120.213, lat:11.978, hub:"coron", star:true, fee:"₱300 + eco fee ₱200", note:"THE shot of the Philippines. Be at the landing before 8am. ~300 steps to the viewpoint." },
    "twin-lagoon":   { name: "Twin Lagoon", cat:"lagoon", region:"coron", lng:120.234, lat:12.002, hub:"coron", star:true, note:"Duck under a limestone gap (or ladder over) between two lagoons. Thermocline of warm/cold water." },
    "siete-pecados": { name: "Siete Pecados", cat:"dive", region:"coron", lng:120.220, lat:12.020, hub:"coron", note:"Protected marine park, easy reef snorkel over coral gardens." },
    "malcapuya":     { name: "Malcapuya Island", cat:"beach", region:"coron", lng:120.083, lat:11.833, hub:"coron", star:true, fee:"~₱150", note:"Powder-white sand, the best beach around Coron. Far south — long boat day." },
    "banana-is":     { name: "Banana Island", cat:"beach", region:"coron", lng:120.093, lat:11.852, hub:"coron", note:"Sandbar and shady palms, usually paired with Malcapuya." },
    "bulog":         { name: "Bulog Dos / Two Seasons", cat:"beach", region:"coron", lng:120.101, lat:11.861, hub:"coron", note:"Iconic sandbar between two islets." },
    "barracuda":     { name: "Barracuda Lake", cat:"dive", region:"coron", lng:120.234, lat:11.998, hub:"coron", star:true, fee:"₱200", note:"Surreal thermoclines (28→38°C), sheer walls. World-class freediving & training." },
    "skeleton-wreck":{ name: "Skeleton Wreck", cat:"dive", region:"coron", lng:120.190, lat:12.045, hub:"coron", note:"Shallow WWII Japanese wreck, snorkellable from the surface." },
    "cyc":           { name: "CYC Beach", cat:"beach", region:"coron", lng:120.208, lat:11.985, hub:"coron", note:"Coron Youth Club — quick easy sandbar stop near town." },
    "maquinit":      { name: "Maquinit Hot Springs", cat:"springs", region:"coron", lng:120.234, lat:11.989, hub:"coron", fee:"~₱200", note:"Saltwater hot springs, ~38–40°C. Best at dusk when it cools." },
    "tao-office":    { name: "Tao Coron Office", cat:"transport", region:"coron", lng:120.203, lat:12.004, hub:"coron", star:true, note:"Briefing evening of 18 Feb. Grab mosquito oil here. Expedition departs from Coron." },

    "tao-camp1":     { name: "Tao camp — West Busuanga", cat:"camp", region:"linapacan", lng:120.02, lat:12.02, hub:"tao", note:"Approx. Bamboo basecamp, open-air huts, fresh-caught dinner." },
    "tao-camp2":     { name: "Tao camp — Culion area", cat:"camp", region:"linapacan", lng:119.95, lat:11.85, hub:"tao", note:"Approx. Route varies with weather & tide." },
    "tao-camp3":     { name: "Tao camp — Linapacan", cat:"camp", region:"linapacan", lng:119.80, lat:11.55, hub:"tao", note:"Approx. Clearest water of the trip." },
    "tao-camp4":     { name: "Tao camp — near El Nido", cat:"camp", region:"linapacan", lng:119.65, lat:11.35, hub:"tao", note:"Approx. Last night before the El Nido arrival." },
    "linapacan-clear":{ name: "Linapacan Strait", cat:"dive", region:"linapacan", lng:119.80, lat:11.50, hub:"tao", star:true, note:"Regularly rated among the clearest seawater on the planet." },

    "elnido-town":   { name: "El Nido Town", cat:"town", region:"elnido", lng:119.393, lat:11.196, hub:"elnido", note:"Compact, walkable. Book tours a day ahead. Eco fee ₱400 valid 10 days." },
    "corong-corong": { name: "Corong-Corong Beach", cat:"viewpoint", region:"elnido", lng:119.389, lat:11.172, hub:"elnido", note:"Flat 2km walk from town, easy west-facing sunset with beach bars." },
    "big-lagoon":    { name: "Big Lagoon", cat:"lagoon", region:"elnido", lng:119.302, lat:11.161, hub:"elnido", star:true, fee:"Tour A ~₱1,400 + lagoon ₱200", note:"Paddle a kayak through towering karst walls. Book the FIRST slot to beat the crowds." },
    "small-lagoon":  { name: "Small Lagoon", cat:"lagoon", region:"elnido", lng:119.303, lat:11.155, hub:"elnido", star:true, note:"Swim/kayak through a narrow gap into a hidden pool." },
    "secret-lagoon": { name: "Secret Lagoon", cat:"lagoon", region:"elnido", lng:119.312, lat:11.143, hub:"elnido", note:"Crawl through a small hole in the rock into an enclosed pool." },
    "shimizu":       { name: "Shimizu Island", cat:"dive", region:"elnido", lng:119.330, lat:11.170, hub:"elnido", note:"Lunch + snorkel stop on Tour A." },
    "nacpan":        { name: "Nacpan Beach", cat:"beach", region:"elnido", lng:119.410, lat:11.320, hub:"elnido", star:true, note:"4km golden crescent, ~45 min trike/scooter north. Twin-beach viewpoint at the end." },
    "hidden-beach":  { name: "Hidden Beach", cat:"beach", region:"elnido", lng:119.272, lat:11.152, hub:"elnido", note:"Tour C. Walled cove reached through a rock gap." },
    "matinloc":      { name: "Matinloc Shrine", cat:"viewpoint", region:"elnido", lng:119.288, lat:11.118, hub:"elnido", note:"Tour C. Short scramble to a cliff viewpoint over the archipelago." },
    "secret-beach":  { name: "Secret Beach", cat:"beach", region:"elnido", lng:119.276, lat:11.132, hub:"elnido", note:"Tour C. Swim through a crack in the cliff to a hidden strip of sand." },
    "las-cabanas":   { name: "Las Cabanas (Marimegmeg)", cat:"viewpoint", region:"elnido", lng:119.386, lat:11.163, hub:"elnido", star:true, note:"The classic El Nido sunset. Beach bars + a zipline across the bay." },

    "panagsama":     { name: "Panagsama Beach", cat:"town", region:"cebu", lng:123.383, lat:9.947, hub:"moalboal", note:"Moalboal's dive strip. Sardine run + turtles a short swim off the wall." },
    "pescador":      { name: "Pescador Island", cat:"dive", region:"cebu", lng:123.363, lat:9.925, hub:"moalboal", star:true, note:"Marine sanctuary, the region's signature dive/snorkel site." },
    "kawasan":       { name: "Kawasan Falls", cat:"dive", region:"cebu", lng:123.383, lat:9.813, hub:"moalboal", star:true, fee:"~₱1,200 canyoneering", note:"Turquoise waterfalls + canyoneering (jumps & swims) from Badian side. Adrenaline day." },
    "white-beach-m": { name: "White Beach (Moalboal)", cat:"beach", region:"cebu", lng:123.386, lat:9.930, hub:"moalboal", note:"The actual sandy beach — Panagsama is rocky. Sunset spot." }
  },

  /* ---- Tips (offline reference) ---- */
  tips: [
    { icon:"💵", t:"Cash is king", b:"El Nido & island ATMs are unreliable and often empty, with low withdrawal caps and big fees. Draw plenty of pesos in Cebu for all of Palawan + Tao extras." },
    { icon:"📶", t:"Connectivity", b:"Grab a Globe/Smart eSIM at Cebu airport. Coron & El Nido have patchy data; the Tao expedition has none — download this app + offline maps before you sail." },
    { icon:"🎒", t:"Domestic baggage", b:"Small planes (CEB↔Coron, El Nido↔CEB) cap checked bags at ~10–15 kg and overbook. Book flights early, travel light, keep valuables in your carry-on." },
    { icon:"🛶", t:"Pack for Tao", b:"Dry bag, reef shoes, reef-safe sunscreen, a power bank (no reliable charging), quick-dry clothes, cash for drinks/soap. Grab Tao's mosquito oil at the Coron office." },
    { icon:"🌅", t:"Beat the crowds", b:"Kayangan before 8am; El Nido Tour A on the earliest slot. The single biggest quality-of-trip lever is going early." },
    { icon:"🌦️", t:"Weather window", b:"February is Palawan's prime — dry, calm seas, sun. That's why this front-loads Palawan and skips Pacific-facing Siargao (wettest now)." },
    { icon:"🧴", t:"Reef-safe only", b:"Many sites ban regular sunscreen. Bring mineral/reef-safe or cover up with a rash guard — you'll be turned away otherwise." },
    { icon:"💸", t:"Eco & park fees", b:"Budget for repeat fees: Coron eco fee ₱200 (10 days), Kayangan ₱300, El Nido eco fee ₱400 (10 days), + per-lagoon fees. Keep small bills." },
    { icon:"🛥️", t:"Tao is the anchor", b:"Tao doesn't sail daily and sells out months ahead. Pick your expedition date FIRST, then slot Coron & El Nido nights around it. Add the ~$90 booking protection." },
    { icon:"🩹", t:"Health basics", b:"Bring motion-sickness tablets (boat days), rehydration salts, blister plasters, a basic first-aid kit. Clinics are limited on the islands." }
  ],

  /* ---- Booking checklist ---- */
  checklist: [
    { id:"tao", t:"Book Tao expedition (pick date first!)", urgent:true },
    { id:"intl", t:"Confirm Emirates TLV↔Cebu", urgent:false },
    { id:"dom1", t:"Book CEB → Busuanga flight", urgent:true },
    { id:"dom2", t:"Book El Nido → CEB (AirSWIFT)", urgent:true },
    { id:"esim", t:"Buy Globe/Smart eSIM", urgent:false },
    { id:"h-mactan1", t:"Hotel: Mactan arrival night", urgent:false },
    { id:"h-coron", t:"Hotel: Coron (5 nights)", urgent:false },
    { id:"h-elnido", t:"Hotel: El Nido (6 nights)", urgent:false },
    { id:"h-moalboal", t:"Hotel: Moalboal (3 nights)", urgent:false },
    { id:"h-mactan2", t:"Hotel: Mactan departure night", urgent:false },
    { id:"tao-prot", t:"Add Tao booking protection (~$90)", urgent:false },
    { id:"insure", t:"Travel + dive insurance", urgent:false },
    { id:"cash", t:"Plan to draw pesos in Cebu", urgent:false }
  ],

  /* ---- Budget (per person, USD) ---- */
  budget: [
    { k:"Intl flight (Emirates)", lo:700, hi:1100 },
    { k:"Domestic flights (2)", lo:120, hi:200 },
    { k:"Tao expedition", lo:560, hi:680 },
    { k:"Stays (~16 hotel nights)", lo:500, hi:950 },
    { k:"Food & drink", lo:350, hi:500 },
    { k:"Tours, scooter, entries", lo:300, hi:450 },
    { k:"Local transport / transfers", lo:120, hi:200 }
  ]
};
