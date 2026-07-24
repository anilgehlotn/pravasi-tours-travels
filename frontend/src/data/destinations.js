// Static data for the Explore South India feature.
// Image URLs use picsum.photos with deterministic seeds as safe placeholders —
// replace with real Unsplash photos in a follow-up pass (search terms noted per place if needed).

export const STATES = [
  { slug: "karnataka", name: "Karnataka" },
  { slug: "kerala", name: "Kerala" },
  { slug: "tamil-nadu", name: "Tamil Nadu" },
  { slug: "andhra-pradesh", name: "Andhra Pradesh" },
  { slug: "telangana", name: "Telangana" },
];

export const CATEGORIES = [
  "Nature",
  "Heritage",
  "Temple",
  "Adventure",
  "Local Life",
  "Hidden Gem",
];

export const CITIES = [
  // ─── KARNATAKA ──────────────────────────────────────────────
  {
    slug: "bangalore",
    name: "Bangalore",
    stateSlug: "karnataka",
    tagline: "Garden city of palaces, parks & cafes",
    heroImage: "https://picsum.photos/seed/bangalore-hero/1600/900",
    description: "Capital of Karnataka and gateway to South India — a blend of colonial-era gardens, royal palaces, buzzing cafes and a booming tech scene.",
    places: [
      { name: "Lalbagh Botanical Garden", category: "Nature", image: "https://picsum.photos/seed/blr-lalbagh/800/600", description: "Historic 240-acre garden famous for its glasshouse, boating lake and biannual flower shows in January and August.", duration: "2 hours" },
      { name: "Cubbon Park", category: "Nature", image: "https://picsum.photos/seed/blr-cubbon/800/600", description: "The green lung of central Bangalore — perfect for morning walks, reading, and escaping the city noise under old rain trees.", duration: "1.5 hours" },
      { name: "Bangalore Palace", category: "Heritage", image: "https://picsum.photos/seed/blr-palace/800/600", description: "Tudor-style royal residence inspired by Windsor Castle, with lush grounds, vintage cars and grand interiors open for tours.", duration: "2 hours" },
      { name: "Nandi Hills", category: "Adventure", image: "https://picsum.photos/seed/blr-nandi/800/600", description: "Legendary sunrise viewpoint 60km from the city, with winding roads, ancient temples and sweeping Deccan plateau views.", duration: "Half day" },
      { name: "ISKCON Temple", category: "Temple", image: "https://picsum.photos/seed/blr-iskcon/800/600", description: "One of the largest Krishna temples in the world, set atop Hare Krishna Hill with striking modern architecture and evening aarti.", duration: "1.5 hours" },
      { name: "Commercial Street", category: "Local Life", image: "https://picsum.photos/seed/blr-commst/800/600", description: "Bangalore's oldest shopping street — packed with fabric stores, street food stalls, jewellery shops and vintage bookstores.", duration: "2 hours" },
    ],
  },
  {
    slug: "mysore",
    name: "Mysore",
    stateSlug: "karnataka",
    tagline: "Royal palaces, silk & sandalwood heritage",
    heroImage: "https://picsum.photos/seed/mysore-hero/1600/900",
    description: "The former Wodeyar capital — home to India's most spectacular palace, sandalwood workshops and one of the country's grandest Dussehra celebrations.",
    places: [
      { name: "Mysore Palace", category: "Heritage", image: "https://picsum.photos/seed/mys-palace/800/600", description: "Indo-Saracenic marvel lit by nearly 100,000 bulbs every Sunday evening. Interiors feature stained glass, gold leaf and carved teak.", duration: "3 hours" },
      { name: "Chamundi Hills", category: "Temple", image: "https://picsum.photos/seed/mys-chamundi/800/600", description: "Hilltop shrine to Goddess Chamundeshwari with a giant Nandi bull carved from a single rock on the ascent.", duration: "3 hours" },
      { name: "Brindavan Gardens", category: "Nature", image: "https://picsum.photos/seed/mys-brindavan/800/600", description: "Terraced gardens below the KRS Dam, best seen at dusk when the musical fountain show lights up the terraces.", duration: "2 hours" },
      { name: "St. Philomena's Cathedral", category: "Heritage", image: "https://picsum.photos/seed/mys-cathedral/800/600", description: "One of India's tallest churches, with twin neo-Gothic spires and stained glass windows depicting the life of Christ.", duration: "1 hour" },
      { name: "Devaraja Market", category: "Local Life", image: "https://picsum.photos/seed/mys-devaraja/800/600", description: "A century-old market bursting with flowers, incense, spices and vibrant kumkum pyramids. Photographer's paradise.", duration: "1.5 hours" },
      { name: "Karanji Lake", category: "Hidden Gem", image: "https://picsum.photos/seed/mys-karanji/800/600", description: "Peaceful lake with a walk-in aviary, butterfly park and boating — often missed by tourists rushing to the palace.", duration: "2 hours" },
    ],
  },
  {
    slug: "coorg",
    name: "Coorg",
    stateSlug: "karnataka",
    tagline: "Misty coffee estates and rolling green hills",
    heroImage: "https://picsum.photos/seed/coorg-hero/1600/900",
    description: "Karnataka's coffee country — misty hills, cardamom-scented forests, Tibetan monasteries and cascading waterfalls hidden between plantations.",
    places: [
      { name: "Abbey Falls", category: "Nature", image: "https://picsum.photos/seed/coorg-abbey/800/600", description: "An 80-foot waterfall framed by coffee and cardamom plantations, best seen just after the monsoon when it's in full flow.", duration: "1 hour" },
      { name: "Raja's Seat", category: "Nature", image: "https://picsum.photos/seed/coorg-rajaseat/800/600", description: "Sunset viewpoint once favoured by the Coorg kings, overlooking layered valleys and mist-covered western ghats.", duration: "1 hour" },
      { name: "Namdroling Monastery", category: "Temple", image: "https://picsum.photos/seed/coorg-golden/800/600", description: "Also called the Golden Temple — a striking Tibetan Buddhist monastery at Bylakuppe with three giant gilded Buddha statues.", duration: "2 hours" },
      { name: "Dubare Elephant Camp", category: "Adventure", image: "https://picsum.photos/seed/coorg-dubare/800/600", description: "River camp where you can bathe and feed elephants, followed by a coracle ride on the Cauvery.", duration: "Half day" },
      { name: "Madikeri Fort", category: "Heritage", image: "https://picsum.photos/seed/coorg-fort/800/600", description: "17th-century hilltop fort with a small museum, palace ruins and views over the Madikeri town rooftops.", duration: "1.5 hours" },
      { name: "Mandalpatti Viewpoint", category: "Hidden Gem", image: "https://picsum.photos/seed/coorg-mandalpatti/800/600", description: "Reached by a bumpy jeep ride through reserve forest — the top opens to 360° views of endless green ridges.", duration: "Half day" },
    ],
  },
  {
    slug: "chikmagalur",
    name: "Chikmagalur",
    stateSlug: "karnataka",
    tagline: "Coffee country and cascading Western Ghats",
    heroImage: "https://picsum.photos/seed/chikmag-hero/1600/900",
    description: "The birthplace of Indian coffee — quiet, less-touristy than Coorg, with dramatic ghat views, ancient temples and offbeat trekking peaks.",
    places: [
      { name: "Mullayanagiri Peak", category: "Adventure", image: "https://picsum.photos/seed/chik-mullayan/800/600", description: "Karnataka's highest peak at 1,930m, with a short trek to a Shiva shrine and cloud-level panoramas.", duration: "Half day" },
      { name: "Baba Budangiri", category: "Nature", image: "https://picsum.photos/seed/chik-baba/800/600", description: "Sacred hill range where the first coffee beans were smuggled into India. Great trekking and unbeatable sunrises.", duration: "Half day" },
      { name: "Hebbe Falls", category: "Nature", image: "https://picsum.photos/seed/chik-hebbe/800/600", description: "Two-tiered 168m waterfall inside a coffee estate, reached by a jeep ride through the Bhadra reserve forest.", duration: "Half day" },
      { name: "Kemmangundi", category: "Hidden Gem", image: "https://picsum.photos/seed/chik-kemmang/800/600", description: "Old hill retreat of Mysore's kings — Z-Point sunset, Raj Bhavan gardens and Shanti Falls, all peaceful and empty.", duration: "Half day" },
      { name: "Sringeri Sharada Temple", category: "Temple", image: "https://picsum.photos/seed/chik-sringeri/800/600", description: "One of the four peethams established by Adi Shankaracharya, on the banks of the Tunga river.", duration: "2 hours" },
      { name: "Coffee Estate Walks", category: "Local Life", image: "https://picsum.photos/seed/chik-estate/800/600", description: "Guided plantation walks explaining the coffee-to-cup journey — most estate stays include a free tour.", duration: "2 hours" },
    ],
  },

  // ─── KERALA ─────────────────────────────────────────────────
  {
    slug: "kochi",
    name: "Kochi",
    stateSlug: "kerala",
    tagline: "Colonial port town with a spice-trade soul",
    heroImage: "https://picsum.photos/seed/kochi-hero/1600/900",
    description: "Kerala's coastal gateway — a layered mix of Portuguese, Dutch, Jewish and British history along salt-air lanes and old warehouses.",
    places: [
      { name: "Fort Kochi Beach", category: "Nature", image: "https://picsum.photos/seed/kochi-fort/800/600", description: "Historic beachfront where fishermen still cast the giant Chinese nets at sunrise and sunset. Great sea-facing cafes nearby.", duration: "2 hours" },
      { name: "Chinese Fishing Nets", category: "Heritage", image: "https://picsum.photos/seed/kochi-nets/800/600", description: "600-year-old cantilevered fishing nets introduced by traders from the court of Kublai Khan — icons of the city.", duration: "1 hour" },
      { name: "Mattancherry Palace", category: "Heritage", image: "https://picsum.photos/seed/kochi-mattan/800/600", description: "Also called the Dutch Palace — famed for stunning Ramayana murals and portraits of the Cochin rajas.", duration: "1.5 hours" },
      { name: "Jew Town & Paradesi Synagogue", category: "Heritage", image: "https://picsum.photos/seed/kochi-jew/800/600", description: "Antique lanes and India's oldest active synagogue (1568), with hand-painted Chinese tiles and Belgian chandeliers.", duration: "2 hours" },
      { name: "Marine Drive", category: "Local Life", image: "https://picsum.photos/seed/kochi-marine/800/600", description: "Waterfront promenade in Ernakulam — sunset boat rides, street food and the famous Rainbow Bridge.", duration: "1.5 hours" },
      { name: "Kathakali Performance", category: "Local Life", image: "https://picsum.photos/seed/kochi-katha/800/600", description: "Evening cultural show at Kerala Kathakali Centre — arrive early to watch the make-up ritual before the performance.", duration: "2 hours" },
    ],
  },
  {
    slug: "munnar",
    name: "Munnar",
    stateSlug: "kerala",
    tagline: "Emerald tea gardens above the clouds",
    heroImage: "https://picsum.photos/seed/munnar-hero/1600/900",
    description: "Kerala's hill jewel — endless tea plantations, cool mountain air, rare wildlife and viewpoints straight out of a postcard.",
    places: [
      { name: "Tea Museum", category: "Local Life", image: "https://picsum.photos/seed/mun-tea/800/600", description: "Run by Tata Tea — traces Munnar's colonial tea-planting history with vintage machinery and a tasting session.", duration: "1.5 hours" },
      { name: "Eravikulam National Park", category: "Nature", image: "https://picsum.photos/seed/mun-eravi/800/600", description: "Home to the endangered Nilgiri tahr. Rolling grasslands and shola forests make this Munnar's most scenic walk.", duration: "3 hours" },
      { name: "Mattupetty Dam", category: "Nature", image: "https://picsum.photos/seed/mun-mattu/800/600", description: "Reservoir with boating, backed by tea slopes — usually combined with the nearby Kundala and Echo Point stop.", duration: "2 hours" },
      { name: "Top Station", category: "Hidden Gem", image: "https://picsum.photos/seed/mun-top/800/600", description: "Highest point on the Munnar-Kodaikanal road, with jaw-dropping views into the Western Ghats. Often above the clouds.", duration: "2 hours" },
      { name: "Echo Point", category: "Nature", image: "https://picsum.photos/seed/mun-echo/800/600", description: "Lake bordered by hills — shout across the water for the famous echo. Nice pit-stop with tea and snack stalls.", duration: "1 hour" },
      { name: "Kundala Lake", category: "Adventure", image: "https://picsum.photos/seed/mun-kundala/800/600", description: "Man-made lake with pedal boats and shikara rides, ringed by cherry blossoms in spring.", duration: "1.5 hours" },
    ],
  },
  {
    slug: "alleppey",
    name: "Alleppey",
    stateSlug: "kerala",
    tagline: "Backwaters and houseboats through palm villages",
    heroImage: "https://picsum.photos/seed/alleppey-hero/1600/900",
    description: "The Venice of the East — a slow world of narrow canals, coir villages, coconut palms and traditional kettuvallam houseboats.",
    places: [
      { name: "Backwater Houseboat Ride", category: "Adventure", image: "https://picsum.photos/seed/all-house/800/600", description: "Overnight or day cruise on a converted rice barge — meals are cooked on board as you drift past palm-fringed villages.", duration: "Full day" },
      { name: "Alleppey Beach", category: "Nature", image: "https://picsum.photos/seed/all-beach/800/600", description: "Long stretch of Arabian Sea coastline with an old lighthouse and pier — great at sunset with fresh coconut water.", duration: "2 hours" },
      { name: "Vembanad Lake", category: "Nature", image: "https://picsum.photos/seed/all-vemb/800/600", description: "India's longest lake and the setting for the annual Nehru Trophy snake boat race every August.", duration: "3 hours" },
      { name: "Krishnapuram Palace", category: "Heritage", image: "https://picsum.photos/seed/all-krishnapuram/800/600", description: "Small 18th-century palace museum famous for the Gajendra Moksham — Kerala's largest single-panel mural.", duration: "1.5 hours" },
      { name: "Marari Beach", category: "Hidden Gem", image: "https://picsum.photos/seed/all-marari/800/600", description: "Quiet fishing-village beach 15km north of town — the best place to actually swim, without the tourist crowd.", duration: "Half day" },
      { name: "Kumarakom Bird Sanctuary", category: "Nature", image: "https://picsum.photos/seed/all-kumar/800/600", description: "14-acre riverside sanctuary — best from November to February when Siberian migratory birds nest here.", duration: "3 hours" },
    ],
  },
  {
    slug: "wayanad",
    name: "Wayanad",
    stateSlug: "kerala",
    tagline: "Wildlife, caves and cardamom-scented hills",
    heroImage: "https://picsum.photos/seed/wayanad-hero/1600/900",
    description: "Northern Kerala's greenest district — spice plantations, prehistoric caves, waterfalls and one of India's richest wildlife corridors.",
    places: [
      { name: "Edakkal Caves", category: "Heritage", image: "https://picsum.photos/seed/way-edakkal/800/600", description: "Neolithic rock shelters with 6,000-year-old petroglyphs. A short trek up rewards you with valley-wide views.", duration: "3 hours" },
      { name: "Chembra Peak", category: "Adventure", image: "https://picsum.photos/seed/way-chembra/800/600", description: "Wayanad's highest peak, famous for the heart-shaped lake halfway up. Permit required — trek early.", duration: "Half day" },
      { name: "Banasura Sagar Dam", category: "Nature", image: "https://picsum.photos/seed/way-banasura/800/600", description: "India's largest earthen dam, backed by mist-covered hills — speedboat rides to the small islands are a highlight.", duration: "2 hours" },
      { name: "Wayanad Wildlife Sanctuary", category: "Nature", image: "https://picsum.photos/seed/way-wildlife/800/600", description: "Part of the Nilgiri biosphere — jeep safaris commonly spot elephants, bison, spotted deer and (rarely) tigers.", duration: "Half day" },
      { name: "Soochipara Falls", category: "Nature", image: "https://picsum.photos/seed/way-soochi/800/600", description: "Three-tiered waterfall inside a dense forest, with a natural pool at the base — great for a splash.", duration: "2 hours" },
      { name: "Thirunelli Temple", category: "Temple", image: "https://picsum.photos/seed/way-thirunelli/800/600", description: "Ancient Vishnu temple in a forest clearing, surrounded on all sides by the Brahmagiri hills.", duration: "2 hours" },
    ],
  },

  // ─── TAMIL NADU ─────────────────────────────────────────────
  {
    slug: "chennai",
    name: "Chennai",
    stateSlug: "tamil-nadu",
    tagline: "Coastal capital of culture and cuisine",
    heroImage: "https://picsum.photos/seed/chennai-hero/1600/900",
    description: "Tamil Nadu's coastal capital — Dravidian temples, colonial forts, filter coffee and one of the longest urban beaches in the world.",
    places: [
      { name: "Marina Beach", category: "Nature", image: "https://picsum.photos/seed/che-marina/800/600", description: "13km stretch of coastline — India's longest urban beach. Best at sunrise for joggers or evenings for street food.", duration: "2 hours" },
      { name: "Kapaleeshwarar Temple", category: "Temple", image: "https://picsum.photos/seed/che-kapal/800/600", description: "7th-century Dravidian Shiva temple in Mylapore with a towering painted gopuram and vibrant morning rituals.", duration: "1.5 hours" },
      { name: "Fort St. George", category: "Heritage", image: "https://picsum.photos/seed/che-fort/800/600", description: "The first English fortress in India (1644), now housing a museum with colonial-era weapons, coins and portraits.", duration: "2 hours" },
      { name: "Santhome Cathedral", category: "Heritage", image: "https://picsum.photos/seed/che-santhome/800/600", description: "Neo-Gothic basilica built over the tomb of Apostle St. Thomas — one of only three such churches in the world.", duration: "1 hour" },
      { name: "T. Nagar Shopping", category: "Local Life", image: "https://picsum.photos/seed/che-tnagar/800/600", description: "Chennai's shopping heart — silk sarees, gold jewellery and family-run textile empires on Ranganathan Street.", duration: "3 hours" },
      { name: "DakshinaChitra Museum", category: "Hidden Gem", image: "https://picsum.photos/seed/che-daksh/800/600", description: "Living-heritage museum on ECR with reconstructed South Indian village homes, folk artists and craft demos.", duration: "3 hours" },
    ],
  },
  {
    slug: "ooty",
    name: "Ooty",
    stateSlug: "tamil-nadu",
    tagline: "Queen of the Nilgiri hills",
    heroImage: "https://picsum.photos/seed/ooty-hero/1600/900",
    description: "The most famous hill station in South India — pine forests, tea slopes, a UNESCO-listed toy train and cool weather year-round.",
    places: [
      { name: "Ooty Lake", category: "Nature", image: "https://picsum.photos/seed/ooty-lake/800/600", description: "Artificial lake built in 1824 — pedal boats and pony rides on the shore are Ooty holiday classics.", duration: "1.5 hours" },
      { name: "Nilgiri Mountain Railway", category: "Adventure", image: "https://picsum.photos/seed/ooty-train/800/600", description: "UNESCO World Heritage toy train — the Ooty–Coonoor stretch winds through tunnels and tea gardens.", duration: "3 hours" },
      { name: "Government Botanical Gardens", category: "Nature", image: "https://picsum.photos/seed/ooty-botan/800/600", description: "55-acre terraced gardens laid out in 1848, with a 20-million-year-old fossilised tree trunk.", duration: "2 hours" },
      { name: "Doddabetta Peak", category: "Adventure", image: "https://picsum.photos/seed/ooty-dodda/800/600", description: "Highest peak in the Nilgiris at 2,637m — a short drive up ends at a telescope house with 360° views.", duration: "2 hours" },
      { name: "Tea Factory", category: "Local Life", image: "https://picsum.photos/seed/ooty-tea/800/600", description: "Working factory demonstrating the tea-making process — with a shop selling everything from CTC to white tea.", duration: "1 hour" },
      { name: "Pykara Falls", category: "Hidden Gem", image: "https://picsum.photos/seed/ooty-pykara/800/600", description: "A twin waterfall 20km from town, quieter than the main tourist stops, with a small lake and boating.", duration: "Half day" },
    ],
  },
  {
    slug: "kodaikanal",
    name: "Kodaikanal",
    stateSlug: "tamil-nadu",
    tagline: "The princess of hill stations",
    heroImage: "https://picsum.photos/seed/kodai-hero/1600/900",
    description: "Founded by American missionaries in 1845 — a quieter, foggier and greener alternative to Ooty, built around a star-shaped lake.",
    places: [
      { name: "Kodaikanal Lake", category: "Nature", image: "https://picsum.photos/seed/kod-lake/800/600", description: "Star-shaped man-made lake at the heart of town — rent a bicycle or a pedal boat to circle its 5km path.", duration: "2 hours" },
      { name: "Coaker's Walk", category: "Nature", image: "https://picsum.photos/seed/kod-coaker/800/600", description: "1km paved cliff walk with views of the Vaigai plains — best at sunrise before the mist rolls in.", duration: "1 hour" },
      { name: "Bryant Park", category: "Nature", image: "https://picsum.photos/seed/kod-bryant/800/600", description: "Landscaped park next to the lake, famous for the annual flower show in May with rare rose varieties.", duration: "1.5 hours" },
      { name: "Pillar Rocks", category: "Adventure", image: "https://picsum.photos/seed/kod-pillar/800/600", description: "Three vertical granite boulders rising 122m — one of Kodai's iconic viewpoints when the clouds clear.", duration: "1.5 hours" },
      { name: "Silver Cascade Falls", category: "Hidden Gem", image: "https://picsum.photos/seed/kod-silver/800/600", description: "180-foot roadside waterfall on the way into town — best in monsoon; a quick photo stop otherwise.", duration: "30 min" },
      { name: "Kurinji Andavar Temple", category: "Temple", image: "https://picsum.photos/seed/kod-kurinji/800/600", description: "Small hilltop Murugan temple — named after the kurinji flower which blooms only once every 12 years.", duration: "1 hour" },
    ],
  },
  {
    slug: "pondicherry",
    name: "Pondicherry",
    stateSlug: "tamil-nadu",
    tagline: "French quarter by the Bay of Bengal",
    heroImage: "https://picsum.photos/seed/pondy-hero/1600/900",
    description: "A former French colony where mustard-yellow villas, bougainvillea-lined lanes and Tamil temple towers exist side by side.",
    places: [
      { name: "Promenade Beach", category: "Nature", image: "https://picsum.photos/seed/pon-prom/800/600", description: "1.5km seafront closed to traffic in the evenings — with the Gandhi statue, old lighthouse and Rock Beach.", duration: "2 hours" },
      { name: "White Town (French Quarter)", category: "Heritage", image: "https://picsum.photos/seed/pon-white/800/600", description: "Colonial-era grid of streets in yellow and white — perfect for slow walks, photo stops and cafe hops.", duration: "3 hours" },
      { name: "Auroville", category: "Hidden Gem", image: "https://picsum.photos/seed/pon-auro/800/600", description: "Experimental township founded in 1968 around the golden Matrimandir — meditation, organic cafes, artisan boutiques.", duration: "Half day" },
      { name: "Sri Aurobindo Ashram", category: "Temple", image: "https://picsum.photos/seed/pon-ashram/800/600", description: "Spiritual centre founded in 1926 — quiet courtyards and the samadhi of Sri Aurobindo and The Mother.", duration: "1.5 hours" },
      { name: "Paradise Beach", category: "Nature", image: "https://picsum.photos/seed/pon-paradise/800/600", description: "Reachable only by ferry from Chunnambar backwaters — clean white sand and a proper island-getaway feel.", duration: "Half day" },
      { name: "Rue Suffren Cafes", category: "Local Life", image: "https://picsum.photos/seed/pon-rue/800/600", description: "Cafe-hop French Quarter classics — Cafe des Arts, Baker Street, Bread & Chocolate — all in a 5-minute radius.", duration: "2 hours" },
    ],
  },

  // ─── ANDHRA PRADESH ─────────────────────────────────────────
  {
    slug: "tirupati",
    name: "Tirupati",
    stateSlug: "andhra-pradesh",
    tagline: "Sacred hills of Lord Venkateswara",
    heroImage: "https://picsum.photos/seed/tirupati-hero/1600/900",
    description: "One of the most-visited pilgrimage sites in the world — the hills of Tirumala host the temple of Lord Venkateswara, surrounded by forests and waterfalls.",
    places: [
      { name: "Tirumala Venkateswara Temple", category: "Temple", image: "https://picsum.photos/seed/tir-tirumala/800/600", description: "The world's richest and most-visited Hindu temple — book a slot in advance and allow a full day for darshan.", duration: "Full day" },
      { name: "Sri Padmavathi Temple", category: "Temple", image: "https://picsum.photos/seed/tir-padma/800/600", description: "Dedicated to Goddess Padmavathi, consort of Venkateswara — traditionally visited before or after Tirumala.", duration: "1.5 hours" },
      { name: "Chandragiri Fort", category: "Heritage", image: "https://picsum.photos/seed/tir-chandra/800/600", description: "Vijayanagara-era fort with the striking Raja Mahal palace and a nightly sound-and-light show.", duration: "2 hours" },
      { name: "Talakona Waterfalls", category: "Nature", image: "https://picsum.photos/seed/tir-talakona/800/600", description: "Andhra's highest waterfall at 270ft, inside the Sri Venkateswara National Park — a short forest trek from the parking.", duration: "3 hours" },
      { name: "Silathoranam Natural Arch", category: "Hidden Gem", image: "https://picsum.photos/seed/tir-silathor/800/600", description: "1,500-million-year-old natural rock arch near Tirumala — a rare geological formation revered as sacred.", duration: "1 hour" },
      { name: "Kapila Theertham", category: "Nature", image: "https://picsum.photos/seed/tir-kapila/800/600", description: "Waterfall and Shiva temple at the foot of the Tirumala hills — cool refuge before the darshan queue.", duration: "1.5 hours" },
    ],
  },
  {
    slug: "visakhapatnam",
    name: "Visakhapatnam",
    stateSlug: "andhra-pradesh",
    tagline: "Coastal city of beaches and blue hills",
    heroImage: "https://picsum.photos/seed/vizag-hero/1600/900",
    description: "Also called Vizag — Andhra's port city with long beaches, dense hill drives, ancient caves and a naval-history heritage.",
    places: [
      { name: "RK Beach", category: "Nature", image: "https://picsum.photos/seed/viz-rk/800/600", description: "Vizag's main beach along Beach Road, lined with parks, statues and street food — busy but atmospheric at sunset.", duration: "2 hours" },
      { name: "Kailasagiri Hill", category: "Nature", image: "https://picsum.photos/seed/viz-kailas/800/600", description: "Hilltop park with panoramic Bay of Bengal views — reachable by cable car or a winding scenic drive.", duration: "2 hours" },
      { name: "Borra Caves", category: "Adventure", image: "https://picsum.photos/seed/viz-borra/800/600", description: "A million-year-old limestone cave system in the Ananthagiri hills — best combined with the Araku Valley train ride.", duration: "Half day" },
      { name: "INS Kursura Submarine Museum", category: "Heritage", image: "https://picsum.photos/seed/viz-kursura/800/600", description: "Real decommissioned submarine converted into a walk-through museum — Asia's first and one of the few in the world.", duration: "1.5 hours" },
      { name: "Yarada Beach", category: "Hidden Gem", image: "https://picsum.photos/seed/viz-yarada/800/600", description: "Quiet crescent beach surrounded on three sides by hills — much less crowded than RK, with a scenic drive to reach.", duration: "3 hours" },
      { name: "Simhachalam Temple", category: "Temple", image: "https://picsum.photos/seed/viz-simha/800/600", description: "11th-century Narasimha temple on a hilltop 300m above sea level — covered in sandalwood paste year-round.", duration: "2 hours" },
    ],
  },

  // ─── TELANGANA ──────────────────────────────────────────────
  {
    slug: "hyderabad",
    name: "Hyderabad",
    stateSlug: "telangana",
    tagline: "City of Nizams, pearls and biryani",
    heroImage: "https://picsum.photos/seed/hyd-hero/1600/900",
    description: "The old Nizami capital — a city where 400-year-old monuments, pearl bazaars, biryani legends and modern IT parks all share the same skyline.",
    places: [
      { name: "Charminar", category: "Heritage", image: "https://picsum.photos/seed/hyd-charminar/800/600", description: "The four-minaret gateway built in 1591 — the symbol of Hyderabad, surrounded by the buzzing Laad Bazaar.", duration: "2 hours" },
      { name: "Golconda Fort", category: "Heritage", image: "https://picsum.photos/seed/hyd-golconda/800/600", description: "16th-century hilltop fortress famed for its acoustics — a clap at the gate can be heard at the summit.", duration: "3 hours" },
      { name: "Hussain Sagar Lake", category: "Nature", image: "https://picsum.photos/seed/hyd-hussain/800/600", description: "Heart-shaped lake with a monolithic 18m Buddha statue on an island — evening boat rides are a Hyderabad classic.", duration: "2 hours" },
      { name: "Chowmahalla Palace", category: "Heritage", image: "https://picsum.photos/seed/hyd-chow/800/600", description: "The Nizams' official residence — vintage cars, crystal chandeliers and the grand Khilwat Mubarak durbar hall.", duration: "2 hours" },
      { name: "Laad Bazaar", category: "Local Life", image: "https://picsum.photos/seed/hyd-laad/800/600", description: "400-year-old market next to Charminar, famous for lacquered bangles, pearls, perfumes and bridal wear.", duration: "2 hours" },
      { name: "Ramoji Film City", category: "Adventure", image: "https://picsum.photos/seed/hyd-ramoji/800/600", description: "The world's largest film studio complex — themed sets, rides and stunt shows spread over 2,000 acres.", duration: "Full day" },
    ],
  },
];

// Helpers
export const getStateBySlug = (slug) => STATES.find((s) => s.slug === slug);
export const getCityBySlug = (slug) => CITIES.find((c) => c.slug === slug);
export const getCitiesByState = (stateSlug) =>
  CITIES.filter((c) => c.stateSlug === stateSlug);
