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
      pins: ["maquinit", "tao-office", "levine"] },
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
      pins: ["elnido-town", "corong-corong", "bella-vita"] },
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
    "ceb-airport":   { name: "Mactan-Cebu Airport (CEB)", cat: "transport", region:"cebu", lng:123.979, lat:10.307, hub:"mactan1", note:"International gateway. Draw your Palawan cash here — fee-free HSBC at Ayala Center Cebu, or airport ATMs. Airport-side hotels for buffer nights." },
    "usu-airport":   { name: "Busuanga Airport (USU)", cat: "transport", region:"coron", lng:120.100, lat:12.121, hub:"coron", note:"~40 min van transfer to Coron town." },
    "ens-airport":   { name: "El Nido Airport (LIO)", cat: "transport", region:"elnido", lng:119.417, lat:11.203, hub:"elnido", note:"AirSWIFT to Cebu. Small planes — 7 kg hand luggage, pre-buy checked allowance." },

    "mt-tapyas":     { name: "Mt Tapyas Viewpoint", cat:"viewpoint", region:"coron", lng:120.2023, lat:12.0022, hub:"coron", star:true, fee:"Free (donation box)", url:"https://maps.app.goo.gl/hZ6cQqjD1Wn6Fz9v9", note:"720 concrete steps — start ~45 min before sunset. Bring water; steps are steep and can be slick.", rec:"One of the best free sunset views in Coron — recommended by nearly every travel blog." },
    "kayangan":      { name: "Kayangan Lake", cat:"lagoon", region:"coron", lng:120.2229, lat:11.9539, hub:"coron", star:true, fee:"₱300 (often bundled ₱200 w/ Twin Lagoon on Tour A)", url:"https://maps.app.goo.gl/8m1t7Yh1nQqzq6club6", book:"https://www.travelincoron.com/guides/coron-island-hopping", note:"Be at the landing before 8am — it's the most photographed lagoon in the country and gets very crowded by mid-morning. Steep steps to the viewpoint, then a swim in the lake.", rec:"Widely rated the top single sight in Palawan — often called the ‘cleanest lake in Asia’. Must-do." },
    "twin-lagoon":   { name: "Twin Lagoon", cat:"lagoon", region:"coron", lng:120.234, lat:12.002, hub:"coron", star:true, fee:"₱200", url:"https://maps.app.goo.gl/nJmVe7pDo9nAn1QW8", book:"https://philippinetravels.ph/twin-lagoon/", note:"Two lagoons joined by a small tunnel/climb-over at low tide, or swim/kayak around at high tide. Usually paired with Kayangan on Tour A.", rec:"Consistently a top-3 Coron stop in traveller reviews." },
    "siete-pecados": { name: "Siete Pecados", cat:"dive", region:"coron", lng:120.220, lat:12.020, hub:"coron", note:"Protected marine park, easy reef snorkel over coral gardens." },
    "malcapuya":     { name: "Malcapuya Island", cat:"beach", region:"coron", lng:120.083, lat:11.833, hub:"coron", star:true, fee:"~₱1,800–2,500pp dedicated day tour", url:"https://maps.app.goo.gl/9GVnkq3vLxHqZP4z8", note:"Furthest beach island (~1.5–2h boat each way) — book as its own day, don't squeeze in with Kayangan.", rec:"Repeatedly cited as the best ‘powder sand’ beach near Coron." },
    "banana-is":     { name: "Banana Island", cat:"beach", region:"coron", lng:120.093, lat:11.852, hub:"coron", fee:"Bundled w/ Malcapuya day", url:"https://maps.app.goo.gl/wTn3q1r4o8fXW1nJ9", note:"Calm, shallow water good for swimming; smaller and quieter than Malcapuya.", rec:"Good complement to Malcapuya on the same day." },
    "bulog":         { name: "Bulog Dos (Sandbar)", cat:"beach", region:"coron", lng:120.101, lat:11.861, hub:"coron", fee:"Bundled w/ Malcapuya day", url:"https://maps.app.goo.gl/eNqzq3s5Yt7Yb1yV7", note:"A thin sandbar that partly submerges at high tide — great for photos.", rec:"Popular add-on stop on the beach-hopping route." },
    "barracuda":     { name: "Barracuda Lake", cat:"dive", region:"coron", lng:120.2241, lat:11.9572, hub:"coron", star:true, fee:"In tour ₱1,500–2,000pp", url:"https://maps.app.goo.gl/xrRZbF3q9ivN4Fka6", note:"Thermocline lake with a dramatic temperature/visibility change at ~14m — a favourite for freedivers and a great intro dive.", rec:"Rated excellent for freediving/diving; less crowded than Kayangan — worth the detour." },
    "skeleton-wreck":{ name: "Skeleton Wreck", cat:"dive", region:"coron", lng:120.190, lat:12.045, hub:"coron", note:"Shallow WWII Japanese wreck, snorkellable from the surface." },
    "cyc":           { name: "CYC Beach", cat:"beach", region:"coron", lng:120.208, lat:11.985, hub:"coron", note:"Coron Youth Club — quick easy sandbar stop near town." },
    "maquinit":      { name: "Maquinit Hot Springs", cat:"springs", region:"coron", lng:120.234, lat:11.989, hub:"coron", fee:"₱200", url:"https://maps.app.goo.gl/2yV2Nk3z6bWQqjLA9", note:"One of few saltwater hot springs in the world; best in the evening. ~15 min tricycle from town.", rec:"A nice low-key way to end a Coron touring day." },
    "levine":        { name: "Levine's Rooftop", cat:"food", region:"coron", lng:120.2035, lat:11.9991, hub:"coron", fee:"Meals ₱150–400", url:"https://maps.app.goo.gl/1E9x1nq9m8vVj9ZC7", note:"Multi-storey family restaurant with a 3rd-floor rooftop patio over Coron Bay.", rec:"Reliable, well-priced dinner spot in town." },
    "tao-office":    { name: "Tao Coron Office", cat:"transport", region:"coron", lng:120.203, lat:12.004, hub:"coron", star:true, fee:"Expedition ~$560–680pp (+ ~$90 protection)", url:"https://maps.app.goo.gl/9k1qGZzR2m9vN6qz9", book:"https://www.taophilippines.com/experiences/original-coron-to-el-nido", note:"Briefing evening of 18 Feb; grab mosquito oil here. Book this date FIRST, then build everything else around it. Sells out months ahead.", rec:"Consistently rated the trip highlight — ‘best few days of the holiday’. Small groups (15–20), no wifi." },

    "tao-camp1":     { name: "Tao camp — West Busuanga", cat:"camp", region:"linapacan", lng:120.02, lat:12.02, hub:"tao", note:"Approx. Bamboo basecamp, open-air huts, fresh-caught dinner. Untouched, rarely-visited islands." },
    "tao-camp2":     { name: "Tao camp — Culion area", cat:"camp", region:"linapacan", lng:119.95, lat:11.85, hub:"tao", note:"Approx. Route varies with weather & tide." },
    "tao-camp3":     { name: "Tao camp — Linapacan", cat:"camp", region:"linapacan", lng:119.80, lat:11.55, hub:"tao", note:"Approx. Clearest water of the trip." },
    "tao-camp4":     { name: "Tao camp — near El Nido", cat:"camp", region:"linapacan", lng:119.65, lat:11.35, hub:"tao", note:"Approx. Last night before the El Nido arrival." },
    "linapacan-clear":{ name: "Linapacan Islands", cat:"dive", region:"linapacan", lng:119.8833, lat:11.5833, hub:"tao", star:true, book:"https://www.taophilippines.com/tao-original-expedition/", note:"Some of the clearest water in the Philippines. Bring reef-safe sunscreen and a dry bag.", rec:"Frequently named the visual highlight of the whole expedition by past guests." },

    "elnido-town":   { name: "El Nido Town", cat:"town", region:"elnido", lng:119.3917, lat:11.1812, hub:"elnido", fee:"Meals ₱200–500", url:"https://maps.app.goo.gl/8q1nJz6yV3Nn9k1q7", note:"Main strip for dinner, bars and last-minute tours — busier and more ‘buzz’ than Coron. Cash top-up node: draw pesos mid-week.", rec:"Good base for the buzz-and-beach bookend of the trip." },
    "corong-corong": { name: "Corong-Corong Beach", cat:"viewpoint", region:"elnido", lng:119.389, lat:11.172, hub:"elnido", fee:"Free", url:"https://maps.app.goo.gl/1u9Wq7z7hZC3jvQK8", note:"Quieter than El Nido town beach; easy west-facing sunset for your first evening after Tao.", rec:"Good low-key alternative to the busier town beach." },
    "bella-vita":    { name: "Bella Vita Pizza", cat:"food", region:"elnido", lng:119.3938, lat:11.1592, hub:"elnido", fee:"Meals ₱300–600", url:"https://maps.app.goo.gl/1u9Wq7z7hZC3jvQK8", note:"Authentic Neapolitan wood-fired pizza on Corong-Corong Beach — pair with the sunset.", rec:"A perennial favourite for dinner in El Nido." },
    "big-lagoon":    { name: "Big Lagoon (Tour A)", cat:"lagoon", region:"elnido", lng:119.3175, lat:11.1558, hub:"elnido", star:true, fee:"₱1,200–1,800pp + ₱200 park + ₱400 eco (10-day) + ₱150 kayak", url:"https://maps.app.goo.gl/hXW2k6z3qN9v1yF98", book:"https://www.elnidoparadise.com/booking/main-island-hopping-tours/tour-a/", note:"Book the EARLIEST slot to beat crowds. Small Lagoon is kayak/paddleboard entry only — motorboats can't enter.", rec:"Rated the single best day tour in El Nido — and the most crowded, so an early start matters." },
    "small-lagoon":  { name: "Small Lagoon", cat:"lagoon", region:"elnido", lng:119.303, lat:11.155, hub:"elnido", star:true, note:"Swim/kayak through a narrow gap into a hidden pool. Kayak-only access." },
    "secret-lagoon": { name: "Secret Lagoon", cat:"lagoon", region:"elnido", lng:119.312, lat:11.143, hub:"elnido", note:"Crawl through a small hole in the rock into an enclosed pool." },
    "shimizu":       { name: "Shimizu Island", cat:"dive", region:"elnido", lng:119.330, lat:11.170, hub:"elnido", note:"Lunch + snorkel stop on Tour A." },
    "nacpan":        { name: "Nacpan Beach", cat:"beach", region:"elnido", lng:119.4243, lat:11.3256, hub:"elnido", star:true, fee:"Free; trike ~₱600–800 round trip", url:"https://maps.app.goo.gl/6z1nJq9vQZC3jvQ7z", note:"4km of nearly empty white sand — best as a full lazy day with a beach-bar lunch. Combine with Las Cabanas at sunset.", rec:"One of the most-cited ‘best beach in Palawan’ picks." },
    "hidden-beach":  { name: "Hidden Beach (Tour C)", cat:"beach", region:"elnido", lng:119.272, lat:11.152, hub:"elnido", fee:"₱1,300–1,800pp + ₱200 park", book:"https://www.getyourguide.com/el-nido-l974/el-nido-tour-c-t555249/", url:"https://maps.app.goo.gl/xQ1z8yV3nJp9k1qz6", note:"Tour C: Secret Beach, Hidden Beach, Matinloc Shrine. Longer/rougher boat day — better in calm weather.", rec:"Frequently the second must-do tour after Tour A." },
    "matinloc":      { name: "Matinloc Shrine", cat:"viewpoint", region:"elnido", lng:119.288, lat:11.118, hub:"elnido", note:"Tour C. Short scramble to a cliff viewpoint over the archipelago." },
    "secret-beach":  { name: "Secret Beach", cat:"beach", region:"elnido", lng:119.276, lat:11.132, hub:"elnido", note:"Tour C. Swim through a crack in the cliff to a hidden strip of sand." },
    "las-cabanas":   { name: "Las Cabañas Beach", cat:"viewpoint", region:"elnido", lng:119.3956, lat:11.1444, hub:"elnido", star:true, fee:"Free; beach-bar drinks optional", url:"https://maps.app.goo.gl/3yV9k1qz6Nn7m8Fw9", note:"West-facing, unobstructed horizon — go for golden hour, stay for dinner at a beach bar. Zipline across the bay optional.", rec:"Repeatedly rated El Nido's best sunset location." },

    "panagsama":     { name: "Panagsama Beach / Sardine Run", cat:"town", region:"cebu", lng:123.3683, lat:9.9547, hub:"moalboal", star:true, fee:"Free–₱600 (env/fin fee)", url:"https://maps.app.goo.gl/7z1nJq9vQZC3jvQ8y", note:"Millions of sardines swim right off the shore — often visible without a guide. Just walk in and snorkel; sea turtles common on the same swim.", rec:"One of the standout free/cheap wildlife encounters in the Philippines — consistently 5-star." },
    "pescador":      { name: "Pescador Island", cat:"dive", region:"cebu", lng:123.363, lat:9.925, hub:"moalboal", star:true, fee:"₱3,500–5,000 charter or ₱1,500–2,500pp shared", url:"https://maps.app.goo.gl/9k1qGZzR2m9vN6qz8", note:"Best for divers — swim-throughs, dense schools, the occasional reef shark. Short boat ride from Panagsama.", rec:"Rated a top Cebu dive site by most operators." },
    "kawasan":       { name: "Kawasan Falls Canyoneering", cat:"dive", region:"cebu", lng:123.3745, lat:9.8041, hub:"moalboal", star:true, fee:"~₱2,000–2,100pp all-in (₱200 to just visit)", url:"https://maps.app.goo.gl/2yV2Nk3z6bWQqjLB9", book:"https://whycebu.com/kawasan-falls-canyoneering/", note:"Full day in Badian (~30–45 min) — cliff jumps and river rappels into turquoise pools. Book an accredited guide only (mandatory).", rec:"One of the most-recommended adventures in the Visayas — not for the faint-hearted." },
    "white-beach-m": { name: "White (Basdaku) Beach", cat:"beach", region:"cebu", lng:123.386, lat:9.930, hub:"moalboal", fee:"Free; loungers extra", url:"https://maps.app.goo.gl/4z1nJq9vQZC3jvQ9x", note:"Fine white sand, calmer and less coral-strewn than Panagsama — a good pure rest-day beach.", rec:"Solid, secondary to the sardine run as Moalboal's headline." }
  },

  /* ---- Cash & liquidity plan (Philippines is cash-heavy off the main hubs) ---- */
  cash: {
    rules: [
      "Draw your big pesos at fee-free HSBC in Metro Cebu (Ayala Center) before flying to Palawan — most provincial ATMs charge ₱250–300 per withdrawal and cap it at ₱10,000, so ₱30,000 = 3 fees.",
      "Always DECLINE ‘pay in your home currency’ (Dynamic Currency Conversion) at ATMs and card terminals — choose PHP so your own bank sets the rate.",
      "Cards where accepted often add a 3–4% surcharge; assume cash for tricycles, markets, small eateries, dive shops and tips.",
      "Island ATMs run dry (especially weekends) and lose network — never arrive on a low balance."
    ],
    phases: [
      { hub:"Cebu + Coron", risk:"Moderate", draw:"₱30,000–40,000", where:"HSBC Ayala Center Cebu / Mactan airport", note:"Coron town has ATMs but they deplete on weekends." },
      { hub:"Tao expedition", risk:"Severe", draw:"All crew tips + emergency cash", where:"Secure it in Coron before boarding", note:"Zero ATMs or power across Culion & Linapacan — 100% cash." },
      { hub:"El Nido", risk:"High", draw:"~₱20,000 top-up", where:"El Nido town, mid-week bank hours", note:"ATMs drop network and queue; cards +3–4%." },
      { hub:"Moalboal + return", risk:"Low–Mod", draw:"Remaining cash", where:"On landing at Mactan-Cebu", note:"Panagsama & Moalboal town are well served." }
    ]
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
    { icon:"🏧", t:"Decline DCC at every terminal", b:"ATMs and card machines ask to charge in your home currency (Dynamic Currency Conversion) — always choose Philippine Pesos so your own bank sets the rate. Draw big amounts fee-free at HSBC in Metro Cebu before Palawan." },
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
  ],

  /* ---- Quests: gamified goals. cat: photo | do | culture | rest ---- */
  quests: [
    { id:"q_tapyas",   hub:"coron",    cat:"photo",   pts:20, t:"Sunset from Mt Tapyas", h:"720 steps, giant cross, the whole bay glowing. Snap it." },
    { id:"q_kayangan", hub:"coron",    cat:"photo",   pts:30, t:"Kayangan before 8am", h:"Beat the boats. The empty-lagoon shot is the trophy of the trip." },
    { id:"q_barracuda",hub:"coron",    cat:"do",      pts:25, t:"Feel Barracuda's thermocline", h:"Dive/freedive through the warm→cold layer at ~14m." },
    { id:"q_malcapuya",hub:"coron",    cat:"photo",   pts:15, t:"Powder sand at Malcapuya", h:"Worth the long boat. Footprints-in-flour photo." },
    { id:"q_disconnect",hub:"tao",     cat:"rest",    pts:30, t:"One full phone-free Tao day", h:"No signal anyway — lean in. Be all the way here." },
    { id:"q_stars",    hub:"tao",      cat:"photo",   pts:20, t:"Stars from a Tao camp", h:"No light pollution for miles. Look up." },
    { id:"q_linapacan",hub:"tao",      cat:"do",      pts:25, t:"Float in Linapacan's clear water", h:"Some of the clearest sea on earth. Just float." },
    { id:"q_biglagoon",hub:"elnido",   cat:"photo",   pts:30, t:"Kayak into Big Lagoon", h:"Earliest slot. Paddle in before the crowd — mirror water." },
    { id:"q_nacpan",   hub:"elnido",   cat:"do",      pts:15, t:"Walk to the end of Nacpan", h:"4km of gold. Reach the twin-beach viewpoint." },
    { id:"q_lascabanas",hub:"elnido",  cat:"photo",   pts:20, t:"Las Cabañas sunset", h:"The postcard. Beach bar, feet in sand, sky on fire." },
    { id:"q_sardines", hub:"moalboal", cat:"photo",   pts:30, t:"Swim into the sardine ball", h:"Millions of fish, 20m off shore. Dive down into it." },
    { id:"q_turtle",   hub:"moalboal", cat:"do",      pts:25, t:"Meet a sea turtle", h:"They graze the same reef wall. Keep your distance, say hi." },
    { id:"q_kawasan",  hub:"moalboal", cat:"do",      pts:25, t:"Take the Kawasan cliff jump", h:"Turquoise pools, real jumps. Send it." },
    { id:"q_phrases",  hub:null,       cat:"culture", pts:15, t:"Learn 5 Tagalog phrases", h:"Salamat goes a long way. Use the Phrasebook." },
    { id:"q_dish",     hub:null,       cat:"culture", pts:15, t:"Eat something you can't pronounce", h:"Sinigang? Kinilaw? Point and trust." },
    { id:"q_sunsets",  hub:null,       cat:"photo",   pts:20, t:"Photograph 3 different sunsets", h:"Coron, El Nido, Moalboal all deliver." },
    { id:"q_market",   hub:null,       cat:"culture", pts:10, t:"Buy something at a local market", h:"Practise ‘Magkano?’ and a friendly haggle." }
  ],

  /* ---- Offline Tagalog phrasebook ---- */
  phrases: [
    { g:"Basics", items:[
      ["Hello","Kumusta","koo-mus-TAH"],
      ["Good morning","Magandang umaga","ma-gan-DANG oo-MA-ga"],
      ["Good evening","Magandang gabi","ma-gan-DANG ga-BEE"],
      ["Thank you","Salamat","sa-LA-mat"],
      ["Thank you so much","Maraming salamat","ma-RA-ming sa-LA-mat"],
      ["Yes / No","Oo / Hindi","OH-oh / hin-DEE"],
      ["Please","Pakiusap","pa-ki-OO-sap"],
      ["Sorry / Excuse me","Pasensya na","pa-SEN-sha na"]
    ]},
    { g:"Getting around", items:[
      ["Where is…?","Nasaan ang…?","NA-sa-an ang"],
      ["Left / Right","Kaliwa / Kanan","ka-li-WA / KA-nan"],
      ["Straight ahead","Diretso","di-RET-so"],
      ["Stop here! (jeepney/trike)","Para!","PA-ra"],
      ["Bathroom","Banyo / CR","BAN-yo"]
    ]},
    { g:"Money & food", items:[
      ["How much?","Magkano?","mag-KA-no"],
      ["Too expensive!","Ang mahal!","ang ma-HAL"],
      ["Water","Tubig","TOO-big"],
      ["Delicious","Masarap","ma-SA-rap"],
      ["The bill, please","Yung bill, paki","yoong bill PA-ki"],
      ["Cheers!","Tagay!","ta-GAI"]
    ]},
    { g:"When stuck", items:[
      ["I don't understand","Hindi ko maintindihan","hin-DEE ko ma-in-tin-di-HAN"],
      ["Do you speak English?","Marunong ka ba mag-Ingles?","ma-ROO-nong ka ba"],
      ["Help!","Tulong!","TOO-long"],
      ["Beautiful","Maganda","ma-gan-DA"]
    ]}
  ],

  /* ---- Packing / deck lists ---- */
  packing: [
    { g:"📄 Documents", items:["Passport (+ photocopies)","Emirates boarding passes","Domestic e-tickets (CEB↔Coron, El Nido↔CEB)","Tao voucher + booking protection","Travel + dive insurance","USD cash to exchange","Cards (tell bank you're travelling)"] },
    { g:"🛶 Tao dry-bag (25–40L)", items:["Heavy-duty dry bag","Small 5–10L dry pouch (camera/phone)","Power bank 10–20k mAh (no charging)","Headlamp","Reef booties","Reef-safe sunscreen","Quick-dry clothes","Motion-sickness tablets","Mosquito oil (buy at Tao office)"] },
    { g:"🤿 Beach & water", items:["Rash guard","Mask + snorkel","GoPro / action cam","Microfiber towel","Flip-flops","Dry phone pouch"] },
    { g:"💊 Health & misc", items:["First-aid kit","Rehydration salts","Blister plasters","Personal meds","Universal adapter (Type A/C, 220V)","Earplugs"] }
  ]
};
