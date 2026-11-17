const Trip = require("../models/Trip");
const Itinerary = require("../models/Itinerary");
const mongoose = require("mongoose");

const inMemoryTrips = [];

const parseCostBackend = (costStr) => {
  if (!costStr) return 0;
  const cleaned = costStr.replace(/,/g, "");
  const matches = [...cleaned.matchAll(/\d+/g)].map(m => parseInt(m[0], 10));
  if (matches.length === 0) return 0;
  return Math.max(...matches);
};

// Preset database for popular destinations for high-quality mock fallbacks
const presetDestinations = {
  goa: {
    title: "Goa Tropical Beach Vacation",
    packingList: ["Swimwear & beach towel", "Sunscreen (SPF 50+)", "Light cotton clothing & flip flops", "Waterproof phone pouch", "Insect repellent"],
    localTips: [
      "Rent a scooter (₹300-₹500/day) to explore North and South Goa at your own pace.",
      "Carry cash as many beach shacks and local market stalls do not accept digital payments.",
      "Avoid swimming in beaches during late evenings or red-flag warning conditions.",
      "Dress conservatively when visiting churches in Old Goa and temples in Ponda."
    ],
    budgetDistribution: { acc: 0.4, food: 0.3, act: 0.2 },
    stays: {
      Budget: [
        { name: "Happy Panda Hostel (Arambol)", description: "Social backpacker hostel near the beach with comfortable dorms and a garden cafe.", estimatedPrice: "₹800/night", rating: "4.7" },
        { name: "Zostel Goa (Morjim)", description: "Vibrant beachside hostel offering clean dorms, private rooms, and regular social events.", estimatedPrice: "₹1,100/night", rating: "4.6" }
      ],
      Standard: [
        { name: "Resort Marinha Dourada (Arpora)", description: "Spacious resort set in scenic grounds with two lakes, swimming pools, and standard amenities.", estimatedPrice: "₹3,500/night", rating: "4.4" },
        { name: "Whispering Palms Beach Resort (Candolim)", description: "Mid-scale family resort with beautiful gardens, swimming pool, and proximity to Candolim beach.", estimatedPrice: "₹5,200/night", rating: "4.5" }
      ],
      Luxury: [
        { name: "Taj Exotica Resort & Spa (Benaulim)", description: "Mediterranean-style luxury resort spread across 56 acres of manicured gardens along a private beach.", estimatedPrice: "₹18,000/night", rating: "4.9" },
        { name: "The Leela Goa (Cavelossim)", description: "Super-luxury riverside resort featuring a private golf course, lagoon villas, and world-class spa.", estimatedPrice: "₹22,000/night", rating: "4.8" }
      ]
    },
    days: [
      {
        day: 1,
        theme: "Arrive in Goa & North Goa Beaches",
        activities: [
          { time: "Morning", title: "Check-in & Arambol Beach Stroll", description: "Arrive, check into your stay, and take a relaxing walk along the peaceful Arambol beach.", cost: "Free" },
          { time: "Afternoon", title: "Explore Fort Aguada Lighthouse", description: "Visit the 17th-century Portuguese fort offering panoramic views of the Arabian Sea.", cost: "₹50/person" },
          { time: "Evening", title: "Sunset & Dinner at Curlies beach shack", description: "Watch the sunset from Anjuna cliffs, followed by fresh seafood and drinks.", cost: "₹800/person" }
        ]
      },
      {
        day: 2,
        theme: "Historical Old Goa & Panaji Latin Quarter",
        activities: [
          { time: "Morning", title: "Old Goa Heritage Churches Tour", description: "Visit the historic Basilica of Bom Jesus and Se Cathedral, showcasing baroque architecture.", cost: "Free" },
          { time: "Afternoon", title: "Walk through Fontainhas Latin Quarter", description: "Stroll through the bright yellow and blue heritage homes of Panaji's old Portuguese quarter.", cost: "Free" },
          { time: "Evening", title: "Mandovi River Sunset Cruise", description: "Enjoy a scenic 1-hour cruise with traditional Goan folk music and dances on board.", cost: "₹500/person" }
        ]
      },
      {
        day: 3,
        theme: "Adventure, Scuba & Water Sports",
        activities: [
          { time: "Morning", title: "Scuba Diving & Dolphin Spotting at Grand Island", description: "Take a boat to Grand Island for underwater diving, spotting colorful reefs and fish.", cost: "₹2,500/person" },
          { time: "Afternoon", title: "Thrilling Beach Parasailing", description: "Fly high over the sea on a parasail, followed by jet-skiing and banana boat rides.", cost: "₹1,200/person" },
          { time: "Evening", title: "Explore Calangute Night Markets", description: "Browse local garments, hand-carved souvenirs, and sample local street food.", cost: "₹300/person" }
        ]
      },
      {
        day: 4,
        theme: "Dudhsagar Waterfalls & Spice Plantation",
        activities: [
          { time: "Morning", title: "Jeep Safari to Dudhsagar Waterfalls", description: "Ride through Bhagwan Mahavir Wildlife Sanctuary to witness the roaring four-tiered falls.", cost: "₹1,000/person" },
          { time: "Afternoon", title: "Spice Farm Tour & Traditional Goan Buffet", description: "Take a guided walk among spices at Sahakari Spice Farm, followed by a buffet lunch.", cost: "₹600/person" },
          { time: "Evening", title: "Relax at Miramar Beach", description: "Unwind on the soft sand where the Mandovi river merges into the Arabian sea.", cost: "Free" }
        ]
      },
      {
        day: 5,
        theme: "Scenic South Goa Coastal Exploration",
        activities: [
          { time: "Morning", title: "Relax at Palolem Beach", description: "Swim in the calm, crescent-shaped bay of South Goa, surrounded by coconut palms.", cost: "Free" },
          { time: "Afternoon", title: "Boat Ride to Butterfly Beach", description: "Ride a local boat to Butterfly Beach, a secluded cove famous for crabs and dolphins.", cost: "₹800/boat" },
          { time: "Evening", title: "Fine Dining at Thalassa Cliffside", description: "Dine at Thalassa in Siolim, enjoying Greek delicacies and dramatic sunset views.", cost: "₹1,500/person" }
        ]
      },
      {
        day: 6,
        theme: "Artsy Flea Markets & Vagator Cliff Walks",
        activities: [
          { time: "Morning", title: "Anjuna Flea Market Shopping", description: "Bargain for clothes, spices, and handmade jewelry at the famous weekly flea market.", cost: "Free" },
          { time: "Afternoon", title: "Hike up Chapora Fort ruins", description: "Climb the historic fort ruins, famous for its views overlooking the Vagator shoreline.", cost: "Free" },
          { time: "Evening", title: "Sunset Cocktails at Purple Martini", description: "Listen to chillout tunes while enjoying premium cocktails with views of the cliffs.", cost: "₹1,200/person" }
        ]
      },
      {
        day: 7,
        theme: "Hidden Beaches & Quiet Retreats",
        activities: [
          { time: "Morning", title: "Surf Lessons at Ashwem Beach", description: "Take an introductory surfing lesson in the calm waves of northern Goa.", cost: "₹1,500/person" },
          { time: "Afternoon", title: "Scenic Lunch at Morjim River Estuary", description: "Enjoy local fish curry rice overlooking the Chapora river estuary.", cost: "₹500/person" },
          { time: "Evening", title: "Yoga & Sunset Meditation", description: "Join a beachside wellness session under the palms.", cost: "₹400/person" }
        ]
      },
      {
        day: 8,
        theme: "Island Exploring & Bird Watching",
        activities: [
          { time: "Morning", title: "Dr. Salim Ali Bird Sanctuary", description: "Take a canoe through mangrove marshes to spot rare migratory birds.", cost: "₹200/person" },
          { time: "Afternoon", title: "Ferry Ride to Divar Island", description: "Explore the quiet village roads and baroque churches on this peaceful island.", cost: "Free" },
          { time: "Evening", title: "Dinner at a Heritage Goan Tavern", description: "Sample authentic pork vindaloo or rawa fried prawns at Mum's Kitchen in Panaji.", cost: "₹1,000/person" }
        ]
      },
      {
        day: 9,
        theme: "Temples of Ponda & Mansions of Margao",
        activities: [
          { time: "Morning", title: "Visit Mangueshi Temple", description: "Visit the beautiful 450-year-old temple dedicated to Lord Shiva in Ponda.", cost: "Free" },
          { time: "Afternoon", title: "Tour Palacio do Deao (Quepem)", description: "Explore a stunning 18th-century Portuguese mansion with lush formal gardens.", cost: "₹500/person" },
          { time: "Evening", title: "Walk along Margao Municipal Park", description: "Stroll the commercial hub of South Goa, enjoying street snacks.", cost: "₹150/person" }
        ]
      },
      {
        day: 10,
        theme: "Farewell Goan Souvenirs",
        activities: [
          { time: "Morning", title: "Panaji Local Cashew & Spice Shopping", description: "Buy premium local cashews, feni liquor, and local spices to take home.", cost: "₹500" },
          { time: "Afternoon", title: "Final Beachside Lunch", description: "Enjoy a final seafood lunch at a beach shack.", cost: "₹600/person" },
          { time: "Evening", title: "Departure", description: "Pack bags and transfer to Mopa/Dabolim Airport or Madgaon railway station.", cost: "Free" }
        ]
      }
    ]
  },
  paris: {
    title: "Romantic Paris City & Culture Tour",
    packingList: ["Comfortable walking shoes", "Chic layers & a light jacket", "Power adapter (Type C/E)", "Crossbody anti-theft bag", "Umbrella"],
    localTips: [
      "Buy the Paris Museum Pass if you plan to visit more than three major museums.",
      "Beware of pickpockets in crowded tourist spots like Montmartre and Metro stations.",
      "Always say 'Bonjour' (Good morning) or 'Bonsoir' (Good evening) when entering shops.",
      "Use the Metro (RATP) to travel; it's faster and cheaper than taxis."
    ],
    budgetDistribution: { acc: 0.5, food: 0.25, act: 0.25 },
    stays: {
      Budget: [
        { name: "Generator Hostel Paris (10th Arr.)", description: "Trendy design hostel located near Canal Saint-Martin, offering a rooftop bar and clean dorms.", estimatedPrice: "₹3,500/night", rating: "4.5" },
        { name: "Hotel ibis Paris Montmartre", description: "Reliable and budget-friendly hotel located within walking distance of Sacré-Cœur.", estimatedPrice: "₹7,500/night", rating: "4.3" }
      ],
      Standard: [
        { name: "Hotel Caron de Beaumarchais (Marais)", description: "Charming 18th-century style boutique hotel located in the heart of the historic Marais district.", estimatedPrice: "₹15,000/night", rating: "4.7" },
        { name: "Hotel Les Deux Gares (10th Arr.)", description: "Boutique stay featuring vibrant, colorful interiors designed by Luke Edward Hall.", estimatedPrice: "₹18,000/night", rating: "4.6" }
      ],
      Luxury: [
        { name: "The Ritz Paris (Place Vendôme)", description: "World-famous legendary 5-star hotel offering legendary grandeur, private pools, and Michelin dining.", estimatedPrice: "₹95,000/night", rating: "4.9" },
        { name: "Le Bristol Paris (Rue du Faubourg Saint-Honoré)", description: "Palace-status hotel offering classic French luxury, beautiful gardens, and exceptional service.", estimatedPrice: "₹85,000/night", rating: "4.8" }
      ]
    },
    days: [
      {
        day: 1,
        theme: "Iconic Landmarks & Eiffel Tower",
        activities: [
          { time: "Morning", title: "Trocadéro Square & Eiffel Tower climb", description: "Enjoy the best views of the Eiffel Tower from Trocadéro, then climb to the summit.", cost: "₹2,400/person" },
          { time: "Afternoon", title: "Walk along the Seine to Place de la Concorde", description: "Stroll along the historic riverbanks, passing the Grand Palais and Pont Alexandre III.", cost: "Free" },
          { time: "Evening", title: "Seine River Dinner Cruise", description: "Glided down the river on a glass-canopy boat, enjoying fine French food and seeing monuments light up.", cost: "₹6,500/person" }
        ]
      },
      {
        day: 2,
        theme: "World-Class Art at the Louvre & Tuileries",
        activities: [
          { time: "Morning", title: "Louvre Museum Treasures", description: "See the Mona Lisa, Winged Victory, and Venus de Milo in the world's largest museum.", cost: "₹1,800/person" },
          { time: "Afternoon", title: "Luxembourg Gardens & Latin Quarter Cafe", description: "Walk through the beautiful Luxembourg Gardens, then grab a coffee at a Latin Quarter bistro.", cost: "₹300/person" },
          { time: "Evening", title: "Sunset at Arc de Triomphe", description: "Climb to the top of the Arc de Triomphe for panoramic views of the Champs-Élysées.", cost: "₹1,100/person" }
        ]
      },
      {
        day: 3,
        theme: "Artsy Montmartre & Sacré-Cœur",
        activities: [
          { time: "Morning", title: "Sacré-Cœur Basilica & Montmartre Walk", description: "Climb the hill to the white basilica for a panoramic view of Paris.", cost: "Free" },
          { time: "Afternoon", title: "Artists of Place du Tertre & Coffee", description: "Watch local portrait painters at work, then stop at the famous Café des Deux Moulins.", cost: "₹400/person" },
          { time: "Evening", title: "Moulin Rouge Cabaret Show", description: "Experience the world-famous cabaret show with champagne in the heart of Pigalle.", cost: "₹9,500/person" }
        ]
      },
      {
        day: 4,
        theme: "Versailles Royal Palace Day Trip",
        activities: [
          { time: "Morning", title: "Versailles Palace Tour", description: "Take the RER C train to Versailles. Tour the magnificent Hall of Mirrors and King's Chambers.", cost: "₹2,200/person" },
          { time: "Afternoon", title: "Marie Antoinette's Estate & Gardens", description: "Rent a bike to explore the massive palace gardens and the Queen's Hamlet.", cost: "₹800/person" },
          { time: "Evening", title: "Dinner in Saint-Germain-des-Prés", description: "Return to Paris for a warm dinner in the historic literary district.", cost: "₹1,800/person" }
        ]
      },
      {
        day: 5,
        theme: "Marais Boutiques & Centre Pompidou",
        activities: [
          { time: "Morning", title: "Historic Marais District & Place des Vosges", description: "Explore the narrow medieval streets, mansions, and the oldest square in Paris.", cost: "Free" },
          { time: "Afternoon", title: "Centre Pompidou Modern Art", description: "Browse Europe's largest collection of modern art in this colorful, high-tech building.", cost: "₹1,300/person" },
          { time: "Evening", title: "Macarons tasting at Ladurée", description: "Sample famous French macarons and French pastries in a luxury tea room.", cost: "₹600/person" }
        ]
      },
      {
        day: 6,
        theme: "Notre-Dame & Left Bank Literary Tour",
        activities: [
          { time: "Morning", title: "Île de la Cité & Notre-Dame Exterior", description: "Walk around the legendary Cathedral and cross the ancient Pont Neuf.", cost: "Free" },
          { time: "Afternoon", title: "Sainte-Chapelle Stained Glass", description: "Witness the breathtaking 13th-century stained glass windows that bathe the chapel in rich colors.", cost: "₹1,000/person" },
          { time: "Evening", title: "Browse Shakespeare & Company Bookstore", description: "Explore the iconic bookstore, followed by dinner at a classic crêperie.", cost: "₹800/person" }
        ]
      },
      {
        day: 7,
        theme: "Underground Catacombs & Invalides",
        activities: [
          { time: "Morning", title: "Paris Catacombs Exploration", description: "Take a chilling underground walk through the bone-lined tunnels of Paris.", cost: "₹2,400/person" },
          { time: "Afternoon", title: "Les Invalides & Napoleon's Tomb", description: "Visit the army museum and the dome church holding Napoleon Bonaparte's tomb.", cost: "₹1,200/person" },
          { time: "Evening", title: "Sunset at Pont Alexandre III", description: "Take photos on Paris's most ornate bridge as the city lights turn on.", cost: "Free" }
        ]
      },
      {
        day: 8,
        theme: "Canal Saint-Martin & Covered Passages",
        activities: [
          { time: "Morning", title: "Walk along Canal Saint-Martin", description: "Stroll the scenic locks and iron bridges, stopping at artisanal bakeries.", cost: "Free" },
          { time: "Afternoon", title: "Passage des Panoramas Shopping", description: "Explore 19th-century glass-roofed shopping arcades filled with vintage stamp dealers.", cost: "Free" },
          { time: "Evening", title: "French Wine & Cheese Tasting Session", description: "Learn to pair French wines with artisanal cheeses from a local sommelier.", cost: "₹3,500/person" }
        ]
      },
      {
        day: 9,
        theme: "Musée de l'Orangerie & Opera Garnier",
        activities: [
          { time: "Morning", title: "Monet's Water Lilies at l'Orangerie", description: "Sit in the oval rooms designed to showcase Claude Monet's massive water lily paintings.", cost: "₹1,100/person" },
          { time: "Afternoon", title: "Opera Garnier Grand Tour", description: "Tour the breathtaking, gold-gilded opera house that inspired the Phantom of the Opera.", cost: "₹1,200/person" },
          { time: "Evening", title: "Dine at Le Train Bleu", description: "Enjoy a luxury dinner inside the beautifully preserved Belle Époque dining room.", cost: "₹5,000/person" }
        ]
      },
      {
        day: 10,
        theme: "Au Revoir Paris",
        activities: [
          { time: "Morning", title: "Galeries Lafayette Rooftop View", description: "Enjoy a free 360-degree view of Paris from the terrace of this historic department store.", cost: "Free" },
          { time: "Afternoon", title: "Final Cafe & Croissant", description: "Savor a final French coffee and warm pastry on a sidewalk patio.", cost: "₹400/person" },
          { time: "Evening", title: "Departure", description: "Pack bags and take the RER B train to Charles de Gaulle Airport.", cost: "Free" }
        ]
      }
    ]
  },
  kyoto: {
    title: "Kyoto Traditional Temples & Nature Explorer",
    packingList: ["Slip-on shoes (for temple entries)", "Hand fan or pocket warmer (seasonal)", "Camera & spare batteries", "Cash (for temples & street stalls)", "Reusable hand towel"],
    localTips: [
      "Many temples only accept cash for entry fees (usually ¥400-¥600 each).",
      "Remove your shoes before entering temple halls or tatami rooms.",
      "Buy the Kyoto City Bus 1-Day Pass for unlimited bus travel (around ¥700).",
      "Respect Geishas in Gion; do not touch them or block their paths for photos."
    ],
    budgetDistribution: { acc: 0.45, food: 0.3, act: 0.25 },
    stays: {
      Budget: [
        { name: "Gojo Guesthouse (Kyoto)", description: "Charming traditional wooden townhouse offering affordable dorms and a cozy tatami lounge.", estimatedPrice: "₹2,500/night", rating: "4.6" },
        { name: "Piece Hostel Kyoto", description: "Modern, clean design hostel located near Kyoto station, offering free breakfast and rental bikes.", estimatedPrice: "₹3,200/night", rating: "4.8" }
      ],
      Standard: [
        { name: "Kyoto Machiya Hotel", description: "Boutique hotel styled as a traditional Kyoto townhouse, providing a balance of comfort and heritage.", estimatedPrice: "₹9,000/night", rating: "4.7" },
        { name: "The Pocket Hotel Kyoto Shijo Karasuma", description: "Compact, smart-lock private rooms in an excellent downtown location close to markets.", estimatedPrice: "₹6,500/night", rating: "4.5" }
      ],
      Luxury: [
        { name: "Sowaka Ryokan (Gion)", description: "Ultra-luxury traditional ryokan offering private Japanese gardens, tatami rooms, and multi-course kaiseki meals.", estimatedPrice: "₹45,000/night", rating: "4.9" },
        { name: "The Ritz-Carlton Kyoto", description: "Luxury riverside resort blending modern luxury with traditional Japanese design accents.", estimatedPrice: "₹75,000/night", rating: "4.9" }
      ]
    },
    days: [
      {
        day: 1,
        theme: "Historic Higashiyama & Kiyomizu-dera",
        activities: [
          { time: "Morning", title: "Kiyomizu-dera Temple Hike", description: "Explore the ancient wooden temple built without a single nail, offering panoramic balcony views.", cost: "₹300/person" },
          { time: "Afternoon", title: "Walk Ninenzaka & Sannenzaka Alleys", description: "Walk down preserved stone streets lined with wooden tea houses, incense shops, and studios.", cost: "Free" },
          { time: "Evening", title: "Gion District Lantern Walk", description: "Walk through Gion's paved alleys at dusk, hoping to spot geishas heading to appointments.", cost: "Free" }
        ]
      },
      {
        day: 2,
        theme: "Golden Pavilion & Zen Gardens",
        activities: [
          { time: "Morning", title: "Kinkaku-ji (Golden Pavilion)", description: "Admir the Zen temple covered in brilliant gold leaf, reflecting in its surrounding pond.", cost: "₹350/person" },
          { time: "Afternoon", title: "Ryoan-ji Temple Rock Garden", description: "Meditate at Japan's most famous dry landscape garden (Karesansui) featuring 15 stones.", cost: "₹400/person" },
          { time: "Evening", title: "Kyoto Station Ramen Street", description: "Dine at the 10th floor of Kyoto Station, sampling different regional styles of hot ramen.", cost: "₹800/person" }
        ]
      },
      {
        day: 3,
        theme: "Arashiyama Bamboo Grove & River Walks",
        activities: [
          { time: "Morning", title: "Arashiyama Bamboo Forest Walk", description: "Walk among towering stalks of green bamboo whispering in the wind.", cost: "Free" },
          { time: "Afternoon", title: "Tenryu-ji Temple & Monkey Park", description: "Visit the grand Zen temple, then hike up Iwatayama to feed wild macaque monkeys.", cost: "₹800/person" },
          { time: "Evening", title: "Riverside Dinner in Pontocho Alley", description: "Enjoy dining along the narrow pedestrian alley lined with atmospheric lanterns.", cost: "₹2,500/person" }
        ]
      },
      {
        day: 4,
        theme: "Fushimi Inari Shrine Hike & Sake Tasting",
        activities: [
          { time: "Morning", title: "Fushimi Inari vermilion torii gates hike", description: "Hike up Mount Inari through tunnels of over 10,000 vermilion wooden shrine gates.", cost: "Free" },
          { time: "Afternoon", title: "Fushimi Sake Brewing District", description: "Visit historic wooden sake breweries and sample premium local sake made with soft spring water.", cost: "₹1,200/person" },
          { time: "Evening", title: "Sample Yakitori in Kyoto Downtown", description: "Sit at a lively counter bar enjoying freshly grilled chicken skewers.", cost: "₹1,000/person" }
        ]
      },
      {
        day: 5,
        theme: "Philosopher's Path & Ginkaku-ji",
        activities: [
          { time: "Morning", title: "Ginkaku-ji (Silver Pavilion) & Sand Garden", description: "Explore the peaceful temple grounds and its meticulously shaped silver sand cone.", cost: "₹400/person" },
          { time: "Afternoon", title: "Walk the Philosopher's Path", description: "Walk the stone path along a canal lined with cherry trees and small temples.", cost: "Free" },
          { time: "Evening", title: "Traditional Matcha Tea Ceremony", description: "Participate in a private, quiet tea ceremony learning the art of preparing whisked matcha.", cost: "₹2,000/person" }
        ]
      },
      {
        day: 6,
        theme: "Nishiki Market Foodie Exploration",
        activities: [
          { time: "Morning", title: "Kyoto Imperial Palace Gardens", description: "Explore the gravel pathways and pine-shaded parks of the former Emperor's residence.", cost: "Free" },
          { time: "Afternoon", title: "Nishiki Food Market Crawl", description: "Graze on skewers of baby octopus, matcha ice cream, and tamagoyaki in a narrow market arcade.", cost: "₹1,500/person" },
          { time: "Evening", title: "Craft Beer Tasting in Downtown", description: "Visit a local microbrewery serving beers infused with yuzu and green tea.", cost: "₹1,200/person" }
        ]
      },
      {
        day: 7,
        theme: "Nijo Castle & Samurai Heritage",
        activities: [
          { time: "Morning", title: "Nijo Castle Nightingale Floors", description: "Tour the palace halls featuring squeaking floors designed to detect assassins.", cost: "₹800/person" },
          { time: "Afternoon", title: "Kyoto International Manga Museum", description: "Relax on the lawn reading manga from an archive of over 300,000 books.", cost: "₹900/person" },
          { time: "Evening", title: "Shabu-Shabu Dinner", description: "Enjoy a hot pot dinner dipping thin slices of beef and vegetables in sesame dipping sauce.", cost: "₹3,000/person" }
        ]
      },
      {
        day: 8,
        theme: "Uji Matcha Day Trip",
        activities: [
          { time: "Morning", title: "Train to Uji & Byodoin Temple", description: "Visit the Phoenix Hall of Byodoin Temple, a stunning lakeside Buddhist hall.", cost: "₹600/person" },
          { time: "Afternoon", title: "Matcha Grinding & Soba Lunch", description: "Grind your own matcha powder using stone mills, then eat matcha-infused green tea buckwheat noodles.", cost: "₹1,800/person" },
          { time: "Evening", title: "Return to Kyoto, shopping at Shijo-Dori", description: "Shop for local crafts, fabrics, and sweets.", cost: "Free" }
        ]
      },
      {
        day: 9,
        theme: "Kurama to Kibune Mountain Hike",
        activities: [
          { time: "Morning", title: "Kurama Temple & Mountain Hike", description: "Take the Eizan train to Kurama, hike over the forested ridge to the river village of Kibune.", cost: "₹500/person" },
          { time: "Afternoon", title: "Riverside Platform Dining (Kawadoko)", description: "Dine on platforms built directly over the rushing river currents.", cost: "₹4,000/person" },
          { time: "Evening", title: "Relax at Kurama Onsen hot springs", description: "Soak in outdoor hot spring baths surrounded by mountains.", cost: "₹1,200/person" }
        ]
      },
      {
        day: 10,
        theme: "Farewell Kyoto",
        activities: [
          { time: "Morning", title: "Souvenir Shopping at Kyoto Station", description: "Buy local specialty snacks like Yatsuhashi (cinnamon-rice sweets) and Uji tea.", cost: "Free" },
          { time: "Afternoon", title: "Final Bento Lunch box", description: "Enjoy a beautifully boxed multi-course lunch in a station restaurant.", cost: "₹1,500/person" },
          { time: "Evening", title: "Departure", description: "Board the Shinkansen bullet train or take the Haruka express train to Kansai Airport.", cost: "Free" }
        ]
      }
    ]
  },
  dharmasthala: {
    title: "Dharmasthala Spiritual & Nature Retreat",
    packingList: ["Traditional conservative clothing", "Comfortable walking shoes", "Umbrella", "Hand sanitizer", "Sandalwood products pouch"],
    localTips: [
      "Dress modestly: Men must wear dhotis/pants (no shorts) and women must wear sarees/salwars to enter the temple.",
      "The temple offers free nutritious lunch and dinner (Annaprasada) daily to all visitors.",
      "Hire local auto-rickshaws to travel between Netravathi River, Bahubali Hill, and the main temple.",
      "Visit the museums early in the afternoon as they close by 6:00 PM."
    ],
    budgetDistribution: { acc: 0.35, food: 0.3, act: 0.35 },
    stays: {
      Budget: [
        { name: "Ganga Guest House (Temple Run)", description: "Convenient temple-managed guest house offering clean, basic rooms at nominal rates.", estimatedPrice: "₹400/night", rating: "4.5" },
        { name: "Nethravathi Guest House", description: "Spacious pilgrim rooms near the main entrance with standard amenities.", estimatedPrice: "₹500/night", rating: "4.4" }
      ],
      Standard: [
        { name: "Sannidhi Guest House", description: "Modern air-conditioned guest rooms managed by the temple administration with great cleanliness.", estimatedPrice: "₹1,200/night", rating: "4.6" },
        { name: "Hotel Keerthana (Ujire)", description: "Comfortable hotel in Ujire (6km from temple) with clean bedding, parking, and multi-cuisine restaurant.", estimatedPrice: "₹1,800/night", rating: "4.5" }
      ],
      Luxury: [
        { name: "Sakleshpur Valley Resort", description: "Premium estate resort located in the foothills (approx. 40 mins drive) offering private luxury cottages.", estimatedPrice: "₹8,500/night", rating: "4.7" },
        { name: "Rajatadri Hill Villas", description: "Sleek private villas overlooking the Western Ghats with high-end amenities.", estimatedPrice: "₹9,500/night", rating: "4.8" }
      ]
    },
    days: [
      {
        day: 1,
        theme: "Arrival & Holy Temple Darshan",
        activities: [
          { time: "Morning", title: "Netravathi River Bathing (Snanaghatta)", description: "Arrive in Dharmasthala, check-in, and visit the Netravathi river bank for a holy dip or to enjoy the scenic forest views.", cost: "Free" },
          { time: "Afternoon", title: "Sri Manjunatha Swamy Temple Darshan", description: "Visit the historical Shiva temple, famous for its unique blend of Jain administration and Hindu worship.", cost: "Free" },
          { time: "Evening", title: "Temple Annaprasada & Garden Walk", description: "Participate in the grand community dining hall (Annadaana) for dinner, followed by a walk in the temple gardens.", cost: "Free" }
        ]
      },
      {
        day: 2,
        theme: "Bahubali Monolith & Museums Heritage",
        activities: [
          { time: "Morning", title: "Bahubali Statue Trek (Ratnagiri Hill)", description: "Walk up the scenic steps of Ratnagiri Hill to witness the majestic 39-foot monolithic statue of Lord Bahubali.", cost: "Free" },
          { time: "Afternoon", title: "Manjusha Heritage Museum", description: "Explore the fascinating repository of ancient stone sculptures, scripts, and paintings collected by the Heggade family.", cost: "₹20/person" },
          { time: "Evening", title: "Vintage Car Museum Exhibition", description: "Admire the incredible collection of antique automobiles, classic carriages, and historic coaches near the temple.", cost: "₹50/person" }
        ]
      },
      {
        day: 3,
        theme: "Charmadi Ghat Views & Surya Temple",
        activities: [
          { time: "Morning", title: "Charmadi Ghat Valley Drive", description: "Enjoy a scenic drive along the spectacular mountain pass of Charmadi Ghat, capturing misty valley views.", cost: "₹800/cab" },
          { time: "Afternoon", title: "Surya Sadashiva Rudra Temple", description: "Visit the Sun Temple in nearby Surya village, famous for the tradition of offering clay idols to fulfill wishes.", cost: "Free" },
          { time: "Evening", title: "Netravathi Barrage Sunset Walk", description: "Walk along the Netravathi river barrage, enjoying the sunset views over the water and surrounding forests.", cost: "Free" }
        ]
      },
      {
        day: 4,
        theme: "Neliyadi Cave & Pilgrimage Sites",
        activities: [
          { time: "Morning", title: "Neliyadi Cave Temple Visit", description: "Explore the historic cave temple, the original sanctuary where the guardian deities of Dharmasthala were first worshipped.", cost: "Free" },
          { time: "Afternoon", title: "Ram Mandir Hilltop Visit", description: "Visit the beautiful hilltop temple dedicated to Lord Ram, featuring white marble shrines and manicured lawns.", cost: "Free" },
          { time: "Evening", title: "Local Bazaar Shopping", description: "Browse local bazaar stalls for sandalwood items, home spices, traditional brass lamps, and sweets.", cost: "₹300/person" }
        ]
      },
      {
        day: 5,
        theme: "Ujire Exploration & Departure",
        activities: [
          { time: "Morning", title: "Sri Janardhana Swamy Temple (Ujire)", description: "Visit the ancient Janardhana temple in Ujire town, popular for its serene architecture.", cost: "Free" },
          { time: "Afternoon", title: "Picnic at Didupe Waterfalls", description: "Take a short drive to the Didupe waterfalls, enjoying a refreshing dip in the clean forest waters.", cost: "Free" },
          { time: "Evening", title: "Departure", description: "Savor a cup of local filter coffee, purchase final souvenirs, and proceed to the bus stand for departure.", cost: "Free" }
        ]
      }
    ]
  }
};

// Generic dynamic fallback itinerary generator
const generateDynamicFallback = (destination, days, budget, travelStyle, interests, totalBudget = null) => {
  const daySchedule = [];
  
  // Format budget items based on travel style and input budget
  const accPct = travelStyle === "Luxury" ? 0.55 : travelStyle === "Budget" ? 0.35 : 0.45;
  const foodPct = travelStyle === "Luxury" ? 0.25 : travelStyle === "Budget" ? 0.35 : 0.30;
  const actPct = 1.0 - accPct - foodPct;
  
  const estimatedAccommodation = Math.round((budget * accPct) / days);
  const estimatedFood = Math.round((budget * foodPct) / days);
  const estimatedActivities = Math.round((budget * actPct) / days);

  const activeInterests = (interests && interests.length > 0) ? interests : ["Sightseeing", "Foodie", "Culture"];

  // Activity templates based on specific interests
  const interestPool = {
    Nature: [
      { time: "Morning", title: "Scenic Nature Trail & Sunrise Hike", description: `Explore the breathtaking natural landscapes of ${destination}. Walk through scenic trails, forests, or hills to watch the sunrise over the valleys.`, cost: "Free" },
      { time: "Afternoon", title: "Eco-Park & Botanical Gardens Tour", description: `Visit the famous local botanical reserves or national parks of ${destination}. Learn about local flora and fauna.`, cost: `₹${Math.round(estimatedActivities * 0.4)}/person` },
      { time: "Evening", title: "Sunset Lakeside walk or Shore Cruise", description: `Relax after a long day with a quiet walk along the rivers or lakes of ${destination} as the sun dips below the horizon.`, cost: "Free" }
    ],
    Adventure: [
      { time: "Morning", title: "High-Energy Zip-Lining & Outdoor Climbing", description: `Get your adrenaline pumping in ${destination}! Challenge yourself with rope courses, climbing, or hiking through rugged terrains.`, cost: `₹${Math.round(estimatedActivities * 0.9)}/person` },
      { time: "Afternoon", title: "Water Sports & River Rafting Experience", description: `Engage in thrilling water activities like kayaking, canoeing, or white-water river rafting with local guides.`, cost: `₹${Math.round(estimatedActivities * 0.8)}/person` },
      { time: "Evening", title: "Off-Road Quad Biking Tour", description: `Ride across the unpaved dirt tracks and hidden valleys of ${destination} on a guided ATV/quad bike ride.`, cost: `₹${Math.round(estimatedActivities * 0.6)}/person` }
    ],
    Foodie: [
      { time: "Morning", title: "Traditional Breakfast & Food Walk", description: `Stroll through the active morning street markets of ${destination}. Sample freshly prepared local breakfast delicacies.`, cost: `₹${Math.round(estimatedFood * 0.3)}/person` },
      { time: "Afternoon", title: "Hands-on Cooking Masterclass", description: `Learn how to prepare authentic regional delicacies of ${destination} from an experienced local chef in an interactive class.`, cost: `₹${Math.round(estimatedActivities * 0.7)}/person` },
      { time: "Evening", title: "Gourmet Tasting & Dinner Crawl", description: `Visit the top-rated local eateries in ${destination} to sample the signature dishes and street food sweets.`, cost: `₹${Math.round(estimatedFood * 0.6)}/person` }
    ],
    History: [
      { time: "Morning", title: "Historical Landmarks & Ruins Tour", description: `Explore the deep history of ${destination} by touring historic castles, ancient temples, or monumental ruins.`, cost: `₹${Math.round(estimatedActivities * 0.3)}/person` },
      { time: "Afternoon", title: "National Museum & Archives Visit", description: `Step inside ${destination}'s premier historical museum, housing ancient relics, weapons, and historical paintings.`, cost: `₹${Math.round(estimatedActivities * 0.4)}/person` },
      { time: "Evening", title: "Heritage Quarter Walk & Lantern Tour", description: `Take an atmospheric evening walking tour through the oldest preservation quarters of ${destination}.`, cost: "Free" }
    ],
    Culture: [
      { time: "Morning", title: "Artisan Workshop & Craft Center", description: `Observe local craftsmen in ${destination} making traditional pottery, hand-woven fabrics, or wooden carvings.`, cost: "Free" },
      { time: "Afternoon", title: "Modern & Folk Art Gallery Exhibition", description: `Browse beautiful paintings, sculptures, and galleries featuring talented artists from ${destination}.`, cost: `₹${Math.round(estimatedActivities * 0.3)}/person` },
      { time: "Evening", title: "Traditional Live Music & Folk Performance", description: `Attend a fascinating theatrical show showcasing the local folk dances and musical heritage of ${destination}.`, cost: `₹${Math.round(estimatedActivities * 0.6)}/person` }
    ],
    Shopping: [
      { time: "Morning", title: "Local Flea Market Exploration", description: `Hunt for unique vintage goods, spices, and handmade souvenirs in the busy flea markets of ${destination}.`, cost: "Free" },
      { time: "Afternoon", title: "Boutique Alley & Handloom Shopping", description: `Walk along the indie shopping streets of ${destination} to browse local designers and handloom shops.`, cost: "Free" },
      { time: "Evening", title: "Modern Mall & Entertainment Arcade", description: `Explore the grandest modern shopping arcade in ${destination} for shopping, tax-free outlets, and food.`, cost: "Free" }
    ],
    Nightlife: [
      { time: "Morning", title: "Specialty Coffee Shop Brunch", description: `Unwind and enjoy a late-morning slow drip coffee and fresh pastries at a trendy local cafe.`, cost: `₹${Math.round(estimatedFood * 0.3)}` },
      { time: "Afternoon", title: "Artsy Neighborhood Street Art Walk", description: `Explore the colorful alleys of ${destination} decorated with beautiful murals, street art, and vinyl record stores.`, cost: "Free" },
      { time: "Evening", title: "Rooftop lounge & Cocktail Pub Crawl", description: `Enjoy a vibrant night out in ${destination} visiting highly recommended lounges and live music venues.`, cost: `₹${Math.round(estimatedFood * 0.7)}/person` }
    ],
    Relaxation: [
      { time: "Morning", title: "Sunrise Yoga & Meditation", description: `Stretch and practice mindfulness surrounded by the quiet natural atmosphere of ${destination}.`, cost: "Free" },
      { time: "Afternoon", title: "Rejuvenating Spa & Wellness therapy", description: `Indulge in a relaxing hot oil massage or herbal steam bath at a top-rated wellness center.`, cost: `₹${Math.round(estimatedActivities * 0.9)}/person` },
      { time: "Evening", title: "Leisurely Sunset Cruise & Mocktails", description: `Sip on drinks at a sunset deck overlooking the valleys or waterfront in ${destination}.`, cost: `₹${Math.round(estimatedActivities * 0.5)}/person` }
    ]
  };

  // Default style activities if no matching interest is found
  const styleDefaults = {
    Budget: [
      { time: "Morning", title: "Free Walking Tour", description: `Explore ${destination}'s core sights on a guided walking tour starting from the town hall.`, cost: "Free" },
      { time: "Afternoon", title: "Picnic at Public Gardens", description: `Buy cheap local breads and cheese and enjoy a relaxing afternoon at a central park in ${destination}.`, cost: "Free" },
      { time: "Evening", title: "Sunset Hike & Local Bazaars", description: `Walk up to a famous scenic overlook for sunset views, followed by shopping at cheap local stalls.`, cost: "Free" }
    ],
    Standard: [
      { time: "Morning", title: "Explore Main Attractions", description: `Visit the primary historical landmarks, squares, and monuments of ${destination}.`, cost: `₹${Math.round(estimatedActivities * 0.4)}/person` },
      { time: "Afternoon", title: "Local Museum & Restaurant lunch", description: `Dine at a local favorite bistro, followed by a visit to the city's central history museum.`, cost: `₹${Math.round(estimatedActivities * 0.3)}/person` },
      { time: "Evening", title: "Scenic City Cruise & Walk", description: `Take a evening boat ride or walk through the lively downtown lanes of ${destination}.`, cost: `₹${Math.round(estimatedActivities * 0.3)}/person` }
    ],
    Luxury: [
      { time: "Morning", title: "VIP Private Tour", description: `Enjoy a custom private tour of ${destination} in a luxury vehicle with a professional guide.`, cost: `₹${Math.round(estimatedActivities * 0.8)}/person` },
      { time: "Afternoon", title: "Fine Dining Lunch & Exclusive Access", description: `Savor an exceptional Michelin-style lunch, followed by behind-the-scenes access to a top landmark.`, cost: `₹${Math.round(estimatedActivities * 0.9)}/person` },
      { time: "Evening", title: "Private Yacht Charter for Sunset", description: `Watch the sunset from your private boat charter on the waters of ${destination}, complete with champagne.`, cost: `₹${Math.round(estimatedActivities * 1.2)}/person` }
    ]
  };

  let interestIndex = 0;

  for (let i = 1; i <= days; i++) {
    const dayThemes = [
      `Welcome to ${destination} & Introduction`,
      `Cultural Sights & Core Landmarks`,
      `Natural Landscapes & Exploration`,
      `Local Flavors, Foods & Markets`,
      `Scenic Vistas & Hidden Pathways`,
      `Artsy Neighborhoods & Modern Hubs`,
      `Flea Markets & Local Souvenirs`,
      `Historical Castle & Museums`,
      `High Points & Panoramic Views`,
      `Farewell Memories of ${destination}`
    ];

    const currentTheme = dayThemes[(i - 1) % dayThemes.length];
    const activities = [];

    // Select activities: Mix one interest-based activity and style defaults
    const times = ["Morning", "Afternoon", "Evening"];
    times.forEach((t, idx) => {
      // Rotate interests
      const chosenInterest = activeInterests[interestIndex % activeInterests.length];
      const interestActivities = interestPool[chosenInterest];
      
      let activity = null;
      if (interestActivities && interestActivities[idx]) {
        // Clone and customize
        activity = { ...interestActivities[idx] };
      } else {
        const styleList = styleDefaults[travelStyle] || styleDefaults.Standard;
        activity = { ...styleList[idx] };
      }
      
      activities.push(activity);
      interestIndex++;
    });

    daySchedule.push({
      day: i,
      theme: currentTheme,
      activities
    });
  }

  // Generate customized packing lists
  const defaultPacking = ["Comfortable footwear", "Power bank & charger", "Camera", "Sunscreen & sunglasses", "Reusable water flask"];
  const interestPacking = {
    Nature: ["Hiking boots", "Rain jacket", "Insect repellent"],
    Adventure: ["Dry bags", "Active wear", "Small first-aid kit"],
    Foodie: ["Digestive tablets", "Hand sanitizer"],
    History: ["Notebook & pen", "Comfortable walking shoes"],
    Culture: ["Conservative clothing (for temples)", "Handkerchief"],
    Shopping: ["Foldable canvas shopping bag", "Cash"],
    Nightlife: ["Smart casual outfits"],
    Relaxation: ["Comfortable lounge wear", "Book/Kindle"]
  };

  const packingList = [...defaultPacking];
  activeInterests.forEach(interest => {
    if (interestPacking[interest]) {
      interestPacking[interest].forEach(item => {
        if (!packingList.includes(item)) packingList.push(item);
      });
    }
  });

  // Generate customized local tips
  const localTips = [
    `Download offline maps of ${destination} to navigate without network dropouts.`,
    `Check local calendar events in ${destination} for seasonal festivals or holidays.`,
    `Keep small cash change since local shops and public transports might not accept cards.`
  ];
  if (activeInterests.includes("Foodie")) {
    localTips.push("Always check online ratings or ask locals before dining at tourist traps.");
  }
  if (activeInterests.includes("Adventure")) {
    localTips.push("Ensure you have active travel insurance covering high-altitude sports or hiking.");
  }
  if (travelStyle === "Luxury") {
    localTips.push("Book premium dining tables and private yacht transfers at least 48 hours in advance.");
  }

  // Customize hotels based on destination and style
  const hotelList = [
    {
      name: `${destination} Grand Central Plaza`,
      description: `Centrally located accommodation tailored for a ${travelStyle.toLowerCase()} traveler. Offers clean rooms and quick transport access.`,
      estimatedPrice: `₹${estimatedAccommodation}/night`,
      rating: travelStyle === "Luxury" ? "4.8" : "4.4"
    },
    {
      name: `${destination} Heritage Inn & Suites`,
      description: `A charming local property reflecting the traditional decor and hospitality of ${destination}. Great breakfasts.`,
      estimatedPrice: `₹${Math.round(estimatedAccommodation * 0.85)}/night`,
      rating: "4.5"
    }
  ];

  return {
    tripTitle: `Exquisite ${days}-Day ${travelStyle} Trip to ${destination}`,
    summary: `A personalized ${days}-day itinerary covering the highlights of ${destination} crafted for a ${travelStyle.toLowerCase()} traveler with interests in ${activeInterests.join(", ")}. Enjoy local sights, food recommendations, and travel tips tailored for a budget of ₹${(totalBudget || budget).toLocaleString()}.`,
    packingList: packingList.slice(0, 7),
    budgetEstimation: {
      accommodation: `₹${Math.round(estimatedAccommodation * 0.85)} - ₹${Math.round(estimatedAccommodation * 1.15)} / night`,
      food: `₹${Math.round(estimatedFood * 0.8)} - ₹${Math.round(estimatedFood * 1.2)} / day`,
      activities: `₹${Math.round(estimatedActivities * 0.8)} - ₹${Math.round(estimatedActivities * 1.2)} / day`,
      totalEstimated: `₹${Math.round((totalBudget || budget) * 0.9).toLocaleString()} - ₹${Math.round((totalBudget || budget) * 1.05).toLocaleString()}`
    },
    hotelRecommendations: hotelList,
    days: daySchedule,
    localTips
  };
};

const generateMockItinerary = (destination, days, budget, travelStyle, interests, totalBudget = null) => {
  const cleanDest = destination.trim().toLowerCase();
  
  // Check if we have high-quality preset destination plans
  if (presetDestinations[cleanDest]) {
    const preset = presetDestinations[cleanDest];
    const daysNum = Math.min(days, preset.days.length);
    const daySchedule = preset.days.slice(0, daysNum);
    
    // Scale budget pricing based on user inputs
    const accPct = preset.budgetDistribution.acc;
    const foodPct = preset.budgetDistribution.food;
    const actPct = preset.budgetDistribution.act;
    const estimatedAccommodation = Math.round((budget * accPct) / days);
    
    const hotelList = (preset.stays[travelStyle] || preset.stays.Standard).map(hotel => ({
      ...hotel,
      estimatedPrice: `₹${estimatedAccommodation}/night`
    }));

    return {
      tripTitle: `Spectacular ${daysNum}-Day ${travelStyle} Getaway in ${destination}`,
      summary: `A carefully designed ${daysNum}-day journey in ${destination} tailored for a ${travelStyle.toLowerCase()} travel style. Enjoy rich local sights, local food recommendations, and memorable activities optimized for a budget of ₹${(totalBudget || budget).toLocaleString()}.`,
      packingList: preset.packingList,
      budgetEstimation: {
        accommodation: `₹${Math.round(estimatedAccommodation * 0.85)} - ₹${Math.round(estimatedAccommodation * 1.15)} / night`,
        food: `₹${Math.round((budget * foodPct) / days * 0.85)} - ₹${Math.round((budget * foodPct) / days * 1.15)} / day`,
        activities: `₹${Math.round((budget * actPct) / days * 0.85)} - ₹${Math.round((budget * actPct) / days * 1.15)} / day`,
        totalEstimated: `₹${Math.round((totalBudget || budget) * 0.95).toLocaleString()} - ₹${Math.round((totalBudget || budget) * 1.05).toLocaleString()}`
      },
      hotelRecommendations: hotelList,
      days: daySchedule,
      localTips: preset.localTips
    };
  }

  // Fallback to dynamic custom activity generator
  return generateDynamicFallback(destination, days, budget, travelStyle, interests, totalBudget);
};

const detectLocationContext = (locationStr) => {
  const loc = (locationStr || "").toLowerCase();
  
  // Check if international first
  const isUS = loc.includes("usa") || loc.includes("united states") || loc.includes("america") || loc.includes("us") || loc.includes("ny") || loc.includes("new york") || loc.includes("california") || loc.includes("ca") || loc.includes("texas") || loc.includes("tx") || loc.includes("boston") || loc.includes("san francisco") || loc.includes("los angeles") || loc.includes("chicago") || loc.includes("seattle") || loc.includes("albany");
  const isUK = loc.includes("uk") || loc.includes("united kingdom") || loc.includes("london") || loc.includes("england") || loc.includes("scotland") || loc.includes("oxford") || loc.includes("cambridge") || loc.includes("manchester");
  const isEurope = loc.includes("france") || loc.includes("paris") || loc.includes("germany") || loc.includes("berlin") || loc.includes("munich") || loc.includes("italy") || loc.includes("rome") || loc.includes("milan") || loc.includes("spain") || loc.includes("madrid") || loc.includes("barcelona") || loc.includes("switzerland") || loc.includes("zurich") || loc.includes("europe");
  const isJapan = loc.includes("japan") || loc.includes("tokyo") || loc.includes("kyoto") || loc.includes("osaka");
  const isSoutheastAsia = loc.includes("singapore") || loc.includes("malaysia") || loc.includes("thailand") || loc.includes("bangkok") || loc.includes("bali") || loc.includes("indonesia") || loc.includes("vietnam") || loc.includes("philippines");
  const isMiddleEast = loc.includes("dubai") || loc.includes("uae") || loc.includes("saudi") || loc.includes("qatar") || loc.includes("doha");
  const isAustralia = loc.includes("australia") || loc.includes("sydney") || loc.includes("melbourne") || loc.includes("brisbane");
  const isCanada = loc.includes("canada") || loc.includes("toronto") || loc.includes("vancouver") || loc.includes("montreal");

  if (isUS) return { country: "USA", region: "US", isHub: loc.includes("new york") || loc.includes("jfk") || loc.includes("san francisco") || loc.includes("los angeles") || loc.includes("chicago") || loc.includes("sfo") || loc.includes("lax") || loc.includes("dfw") || loc.includes("ord") };
  if (isUK) return { country: "UK", region: "UK", isHub: loc.includes("london") || loc.includes("lhr") || loc.includes("lgw") || loc.includes("manchester") };
  if (isEurope) return { country: "Europe", region: "Europe", isHub: loc.includes("paris") || loc.includes("cdg") || loc.includes("frankfurt") || loc.includes("munich") || loc.includes("rome") || loc.includes("zurich") };
  if (isJapan) return { country: "Japan", region: "Japan", isHub: loc.includes("tokyo") || loc.includes("nrt") || loc.includes("hnd") || loc.includes("osaka") || loc.includes("kix") };
  if (isSoutheastAsia) return { country: "Southeast Asia", region: "SEA", isHub: loc.includes("singapore") || loc.includes("sin") || loc.includes("bangkok") || loc.includes("bkk") || loc.includes("kuala lumpur") };
  if (isMiddleEast) return { country: "Middle East", region: "ME", isHub: loc.includes("dubai") || loc.includes("dxb") || loc.includes("abu dhabi") || loc.includes("doha") };
  if (isAustralia) return { country: "Australia", region: "AUS", isHub: loc.includes("sydney") || loc.includes("syd") || loc.includes("melbourne") || loc.includes("mel") };
  if (isCanada) return { country: "Canada", region: "CAN", isHub: loc.includes("toronto") || loc.includes("yyz") || loc.includes("vancouver") || loc.includes("yvr") };

  // Indian Regions matching
  const isKarnatakaHub = loc.includes("bengaluru") || loc.includes("bangalore") || loc.includes("blr");
  const isMaharashtraHub = loc.includes("mumbai") || loc.includes("bombay") || loc.includes("bom") || loc.includes("pune");
  const isDelhiHub = loc.includes("delhi") || loc.includes("new delhi") || loc.includes("del") || loc.includes("noida") || loc.includes("gurgaon");
  const isTelanganaHub = loc.includes("hyderabad") || loc.includes("hyd");
  const isTamilNaduHub = loc.includes("chennai") || loc.includes("madras") || loc.includes("maa");
  const isWestBengalHub = loc.includes("kolkata") || loc.includes("calcutta") || loc.includes("ccu");

  if (isKarnatakaHub || isMaharashtraHub || isDelhiHub || isTelanganaHub || isTamilNaduHub || isWestBengalHub) {
    return { country: "India", region: isKarnatakaHub ? "KA" : isMaharashtraHub ? "MH" : isDelhiHub ? "DL" : isTelanganaHub ? "TS" : isTamilNaduHub ? "TN" : "WB", isHub: true };
  }

  // Smaller Indian places
  const isSouthIndiaSmall = loc.includes("sindhanur") || loc.includes("raichur") || loc.includes("koppal") || loc.includes("bellary") || loc.includes("ballari") || loc.includes("hubli") || loc.includes("hubballi") || loc.includes("mysore") || loc.includes("mysuru") || loc.includes("hampi") || loc.includes("gokarna") || loc.includes("mangalore") || loc.includes("mangaluru") || loc.includes("davangere") || loc.includes("shimoga") || loc.includes("belgaum") || loc.includes("karnataka") || loc.includes("kerala") || loc.includes("coimbatore") || loc.includes("madurai") || loc.includes("kochi") || loc.includes("trivandrum") || loc.includes("anantapur") || loc.includes("kurnool") || loc.includes("tirupati") || loc.includes("vijayawada") || loc.includes("visakhapatnam") || loc.includes("andhra") || loc.includes("telangana");
  
  const isWestIndiaSmall = loc.includes("goa") || loc.includes("nagpur") || loc.includes("nashik") || loc.includes("aurangabad") || loc.includes("panaji") || loc.includes("margao") || loc.includes("surat") || loc.includes("vadodara") || loc.includes("rajkot") || loc.includes("gujarat") || loc.includes("maharashtra");
  
  const isNorthIndiaSmall = loc.includes("agra") || loc.includes("jaipur") || loc.includes("jodhpur") || loc.includes("udaipur") || loc.includes("rajasthan") || loc.includes("lucknow") || loc.includes("varanasi") || loc.includes("kanpur") || loc.includes("allahabad") || loc.includes("uttar pradesh") || loc.includes("amritsar") || loc.includes("ludhiana") || loc.includes("punjab") || loc.includes("haryana") || loc.includes("chandigarh") || loc.includes("shimla") || loc.includes("dehradun") || loc.includes("uttarakhand") || loc.includes("jammu") || loc.includes("srinagar");

  const isEastIndiaSmall = loc.includes("patna") || loc.includes("bihar") || loc.includes("ranchi") || loc.includes("jharkhand") || loc.includes("bhubaneswar") || loc.includes("odisha") || loc.includes("cuttack") || loc.includes("guwahati") || loc.includes("assam") || loc.includes("shillong") || loc.includes("darjeeling") || loc.includes("sikkim");

  const isCentralIndiaSmall = loc.includes("bhopal") || loc.includes("indore") || loc.includes("gwalior") || loc.includes("jabalpur") || loc.includes("madhya pradesh") || loc.includes("raipur") || loc.includes("chhattisgarh");

  if (isSouthIndiaSmall) return { country: "India", region: "SouthIndia", isHub: false };
  if (isWestIndiaSmall) return { country: "India", region: "WestIndia", isHub: false };
  if (isNorthIndiaSmall) return { country: "India", region: "NorthIndia", isHub: false };
  if (isEastIndiaSmall) return { country: "India", region: "EastIndia", isHub: false };
  if (isCentralIndiaSmall) return { country: "India", region: "CentralIndia", isHub: false };

  return { country: "India", region: "Default", isHub: false };
};

const AIRPORT_HUBS = [
  { name: "Bengaluru Airport (BLR)", code: "BLR", lat: 13.1986, lon: 77.7066 },
  { name: "Hyderabad Airport (HYD)", code: "HYD", lat: 17.2403, lon: 78.4294 },
  { name: "Mumbai Airport (BOM)", code: "BOM", lat: 19.0896, lon: 72.8656 },
  { name: "Delhi Airport (DEL)", code: "DEL", lat: 28.5562, lon: 77.1000 },
  { name: "Chennai Airport (MAA)", code: "MAA", lat: 12.9941, lon: 80.1709 },
  { name: "Kolkata Airport (CCU)", code: "CCU", lat: 22.6547, lon: 88.4467 },
  { name: "Goa Mopa Airport (DXN)", code: "DXN", lat: 15.7291, lon: 73.8681 },
  { name: "Mangaluru Airport (IXE)", code: "IXE", lat: 12.9613, lon: 74.8900 },
  { name: "Lucknow Airport (LKO)", code: "LKO", lat: 26.7606, lon: 80.8893 },
  { name: "Ayodhya Airport (AYJ)", code: "AYJ", lat: 26.7570, lon: 82.1480 },
  { name: "Dehradun Airport (DED)", code: "DED", lat: 30.1897, lon: 78.1803 },
  { name: "London Heathrow Airport (LHR)", code: "LHR", lat: 51.4700, lon: -0.4543 },
  { name: "New York JFK Airport (JFK)", code: "JFK", lat: 40.6413, lon: -73.7781 },
  { name: "Paris Charles de Gaulle Airport (CDG)", code: "CDG", lat: 49.0097, lon: 2.5479 },
  { name: "Tokyo Narita Airport (NRT)", code: "NRT", lat: 35.7720, lon: 140.3929 }
];

const RAILWAY_HUBS = [
  { name: "KSR Bengaluru Junction (SBC)", code: "SBC", lat: 12.9784, lon: 77.5694 },
  { name: "Hubli Junction (UBL)", code: "UBL", lat: 15.3438, lon: 75.1492 },
  { name: "Raichur Junction (RC)", code: "RC", lat: 16.2082, lon: 77.3468 },
  { name: "Secunderabad Junction (SC)", code: "SC", lat: 17.4344, lon: 78.5016 },
  { name: "Mumbai CSMT (CSMT)", code: "CSMT", lat: 18.9400, lon: 72.8353 },
  { name: "New Delhi Railway Station (NDLS)", code: "NDLS", lat: 28.6430, lon: 77.2223 },
  { name: "Howrah Junction (HWH)", code: "HWH", lat: 22.5831, lon: 88.3411 },
  { name: "Chennai Central (MAS)", code: "MAS", lat: 13.0827, lon: 80.2707 },
  { name: "Ayodhya Dham Junction (AY)", code: "AY", lat: 26.7909, lon: 82.2036 },
  { name: "Haridwar Junction (HW)", code: "HW", lat: 29.9442, lon: 78.1566 }
];

const geocodeLocation = async (locName) => {
  try {
    const cleanQuery = encodeURIComponent(locName);
    const url = `https://nominatim.openstreetmap.org/search?q=${cleanQuery}&format=json&limit=1`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 seconds timeout

    const response = await fetch(url, {
      headers: {
        "User-Agent": "AITravelPlanner/1.0 (contact: veeresh@example.com)"
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
          displayName: data[0].display_name
        };
      }
    }
  } catch (error) {
    console.error("Geocoding failed for", locName, error);
  }
  return null;
};

const getHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const resolveNearestHubStatic = (locName) => {
  const loc = (locName || "").toLowerCase();

  // 1. South India (Karnataka, AP, Telangana)
  if (loc.includes("sindhanur") || loc.includes("raichur") || loc.includes("koppal") || loc.includes("bellary") || loc.includes("ballari") || loc.includes("hampi") || loc.includes("gangavathi") || loc.includes("gadag") || loc.includes("hosapete") || loc.includes("hospet")) {
    return {
      hubName: "Bengaluru Airport (BLR) or Hyderabad Airport (HYD)",
      railHubName: "Hubli Junction (UBL) or Raichur Junction (RC)",
      localBusDetails: `Take a KSRTC bus from ${locName} to Bengaluru Airport (BLR) or Hyderabad Airport (HYD) (approx. 360km).`,
      localRailDetails: `Take a local bus or cab from ${locName} to Hubli Junction (UBL) or Raichur Junction (RC) railway station (approx. 90-180km).`,
      localBusCost: "₹700 - ₹1,500",
      localBusTime: "7h - 9h",
      localRailCost: "₹200 - ₹600",
      localRailTime: "2h - 4h"
    };
  }
  if (loc.includes("mysore") || loc.includes("mysuru") || loc.includes("coorg") || loc.includes("madikeri") || loc.includes("wayanad") || loc.includes("kabini") || loc.includes("bandipur")) {
    return {
      hubName: "Bengaluru Airport (BLR)",
      railHubName: "Mysuru Junction (MYS) or KSR Bengaluru Junction (SBC)",
      localBusDetails: `Take a KSRTC Flybus or taxi from ${locName} to Bengaluru Airport (BLR) (approx. 140-180km).`,
      localRailDetails: `Take a local auto-rickshaw or taxi to Mysuru Junction or Bengaluru SBC station.`,
      localBusCost: "₹800 - ₹2,500",
      localBusTime: "3h - 4.5h",
      localRailCost: "₹100 - ₹300",
      localRailTime: "30m - 1h"
    };
  }
  if (loc.includes("gokarna") || loc.includes("karwar") || loc.includes("udupi") || loc.includes("mangalore") || loc.includes("mangaluru") || loc.includes("murudeshwar") || loc.includes("colva") || loc.includes("calangute") || loc.includes("panaji")) {
    return {
      hubName: "Goa Mopa Airport (DXN) or Mangaluru Airport (IXE)",
      railHubName: "Gokarna Road (GOK) or Mangaluru Junction (MAJN) or Madgaon (MAO)",
      localBusDetails: `Take a regional bus or taxi from ${locName} to Goa Mopa Airport or Mangaluru Airport.`,
      localRailDetails: `Take a local auto-rickshaw or cab to Gokarna Road, Madgaon, or Mangaluru railway station.`,
      localBusCost: "₹500 - ₹1,500",
      localBusTime: "2h - 4h",
      localRailCost: "₹100 - ₹250",
      localRailTime: "30m - 1h"
    };
  }

  // 2. North India / Pilgrimage Hubs
  if (loc.includes("ayodhya") || loc.includes("ram mandir") || loc.includes("faizabad") || loc.includes("hanuman garhi") || loc.includes("nayanagar")) {
    return {
      hubName: "Ayodhya Airport (AYJ) or Lucknow Airport (LKO)",
      railHubName: "Ayodhya Dham Junction (AY) or Ayodhya Cantt (AYC)",
      localBusDetails: `Take a local taxi or bus to Ayodhya Airport or Lucknow Airport (approx. 130km).`,
      localRailDetails: `Take an auto-rickshaw or E-rickshaw directly to Ayodhya Dham or Ayodhya Cantt station (approx 5-10km).`,
      localBusCost: "₹200 - ₹1,500",
      localBusTime: "30m - 2.5h",
      localRailCost: "₹50 - ₹100",
      localRailTime: "15m - 30m"
    };
  }
  if (loc.includes("kedarnath") || loc.includes("badrinath") || loc.includes("gaurikund") || loc.includes("sonprayag") || loc.includes("guptkashi") || loc.includes("pipalkoti") || loc.includes("joshimath")) {
    return {
      hubName: "Dehradun Airport (DED)",
      railHubName: "Haridwar Junction (HW) or Rishikesh (RKSH)",
      localBusDetails: `Travel by mountain bus or taxi from ${locName} to Dehradun Airport (approx. 40-220km depending on altitude).`,
      localRailDetails: `Take a shared jeep or bus from Gaurikund/Sonprayag/Rishikesh to Haridwar Junction (approx. 100-240km).`,
      localBusCost: "₹500 - ₹3,000",
      localBusTime: "2h - 8h",
      localRailCost: "₹400 - ₹1,200",
      localRailTime: "3h - 9h"
    };
  }
  if (loc.includes("agra") || loc.includes("taj mahal") || loc.includes("mathura") || loc.includes("vrindavan") || loc.includes("fatehpur sikri")) {
    return {
      hubName: "Delhi Airport (DEL)",
      railHubName: "Agra Cantt (AGC) or Mathura Junction (MTJ)",
      localBusDetails: `Take an express bus or cab via Yamuna Expressway to Delhi Airport (DEL) (approx. 200km).`,
      localRailDetails: `Take a local auto-rickshaw or taxi directly to Agra Cantt railway station.`,
      localBusCost: "₹600 - ₹2,500",
      localBusTime: "3h - 4h",
      localRailCost: "₹50 - ₹200",
      localRailTime: "15m - 40m"
    };
  }

  // 3. UK & US Small Towns
  if (loc.includes("oxford") || loc.includes("cambridge") || loc.includes("bath") || loc.includes("windsor") || loc.includes("stratford")) {
    return {
      hubName: "London Heathrow Airport (LHR) or Gatwick Airport (LGW)",
      railHubName: "London Paddington (PAD) or King's Cross (KGX)",
      localBusDetails: `Take a National Express coach from ${locName} to London Heathrow.`,
      localRailDetails: `Take a Great Western Railway train to London.`,
      localBusCost: "₹1,500 - ₹3,000",
      localBusTime: "1.5h - 2.5h",
      localRailCost: "₹1,000 - ₹2,500",
      localRailTime: "1h - 1.5h"
    };
  }
  if (loc.includes("albany") || loc.includes("worcester") || loc.includes("new haven") || loc.includes("providence") || loc.includes("springfield")) {
    return {
      hubName: "New York JFK Airport (JFK) or Boston Airport (BOS)",
      railHubName: "Penn Station (NYP) or Boston South Station",
      localBusDetails: `Take a Greyhound bus or rideshare from ${locName} to JFK airport.`,
      localRailDetails: `Take an Amtrak train from ${locName} to Penn Station.`,
      localBusCost: "₹2,500 - ₹5,000",
      localBusTime: "2.5h - 4h",
      localRailCost: "₹2,000 - ₹4,500",
      localRailTime: "2h - 3h"
    };
  }

  const context = detectLocationContext(locName);
  if (context.isHub) {
    return null;
  }

  if (context.country === "USA") {
    return {
      hubName: "New York JFK Airport (JFK) or Boston Airport (BOS)",
      railHubName: "Penn Station (NYP) or Boston South Station",
      localBusDetails: `Take local bus/shuttle from ${locName} to New York JFK Airport (JFK) or Boston Airport (BOS).`,
      localRailDetails: `Take local transit to Penn Station (NYP) or Boston South Station.`,
      localBusCost: "₹2,500 - ₹5,000",
      localBusTime: "2h - 3h",
      localRailCost: "₹2,000 - ₹4,500",
      localRailTime: "2h - 3h"
    };
  }
  if (context.country === "UK") {
    return {
      hubName: "London Heathrow Airport (LHR)",
      railHubName: "London King's Cross (KGX) or Paddington (PAD)",
      localBusDetails: `Take coach/bus from ${locName} to London Heathrow Airport (LHR).`,
      localRailDetails: `Take local train/transit to London King's Cross (KGX) or Paddington.`,
      localBusCost: "₹1,500 - ₹3,000",
      localBusTime: "1h - 2h",
      localRailCost: "₹1,000 - ₹2,500",
      localRailTime: "45m - 1.5h"
    };
  }
  if (context.country === "Europe") {
    return {
      hubName: "Paris Charles de Gaulle Airport (CDG)",
      railHubName: "Paris Gare du Nord",
      localBusDetails: `Take regional bus or shuttle to Paris Charles de Gaulle Airport (CDG).`,
      localRailDetails: `Take local rail/transit to Paris Gare du Nord.`,
      localBusCost: "₹1,800 - ₹3,500",
      localBusTime: "1h - 2h",
      localRailCost: "₹800 - ₹2,000",
      localRailTime: "45m - 1.5h"
    };
  }
  if (context.country === "Japan") {
    return {
      hubName: "Tokyo Narita Airport (NRT)",
      railHubName: "Tokyo Station",
      localBusDetails: `Take limousine bus or express train to Narita Airport (NRT).`,
      localRailDetails: `Take JR local/express train to Tokyo Station.`,
      localBusCost: "₹1,500 - ₹3,000",
      localBusTime: "1h - 1.5h",
      localRailCost: "₹1,000 - ₹2,000",
      localRailTime: "30m - 1h"
    };
  }

  if (context.country === "India") {
    if (context.region === "SouthIndia" || context.region === "KA" || context.region === "TS" || context.region === "TN" || loc.includes("karnataka") || loc.includes("channapatna") || loc.includes("ramanagara") || loc.includes("mandya")) {
      return {
        hubName: "Bengaluru Airport (BLR)",
        railHubName: "KSR Bengaluru Junction (SBC)",
        localBusDetails: `Take local bus/cab from ${locName} to Bengaluru Airport (BLR) (approx. 60-120km).`,
        localRailDetails: `Take local train/bus from ${locName} to KSR Bengaluru Junction (SBC).`,
        localBusCost: "₹200 - ₹800",
        localBusTime: "1.5h - 3h",
        localRailCost: "₹50 - ₹150",
        localRailTime: "1h - 2h"
      };
    }
    if (context.region === "WestIndia" || context.region === "MH" || loc.includes("maharashtra") || loc.includes("pune") || loc.includes("mumbai") || loc.includes("gujarat")) {
      return {
        hubName: "Mumbai Airport (BOM)",
        railHubName: "Mumbai CSMT (CSMT)",
        localBusDetails: `Take local cab/bus from ${locName} to Mumbai Airport (BOM).`,
        localRailDetails: `Take local train/cab from ${locName} to Mumbai CSMT (CSMT).`,
        localBusCost: "₹300 - ₹1,000",
        localBusTime: "1.5h - 3h",
        localRailCost: "₹100 - ₹300",
        localRailTime: "1h - 2.5h"
      };
    }
    if (context.region === "EastIndia" || context.region === "WB" || loc.includes("west bengal") || loc.includes("kolkata")) {
      return {
        hubName: "Kolkata Airport (CCU)",
        railHubName: "Howrah Junction (HWH)",
        localBusDetails: `Take local taxi/bus from ${locName} to Kolkata Airport (CCU).`,
        localRailDetails: `Take local transit/bus to Howrah Junction (HWH).`,
        localBusCost: "₹200 - ₹700",
        localBusTime: "1h - 2h",
        localRailCost: "₹50 - ₹150",
        localRailTime: "30m - 1.5h"
      };
    }
  }

  // Absolute fallback
  return {
    hubName: "Delhi Airport (DEL)",
    railHubName: "New Delhi Railway Station (NDLS)",
    localBusDetails: `Take local bus/metro/cab from ${locName} to Delhi Airport (DEL).`,
    localRailDetails: `Take metro/bus from ${locName} to New Delhi Railway Station (NDLS).`,
    localBusCost: "₹200 - ₹800",
    localBusTime: "1h - 3h",
    localRailCost: "₹80 - ₹250",
    localRailTime: "45m - 2h"
  };
};

const resolveNearestHub = async (locName) => {
  const coords = await geocodeLocation(locName);
  
  if (coords) {
    // Calculate distance to all airports
    let minAirDist = Infinity;
    let nearestAir = null;
    for (const air of AIRPORT_HUBS) {
      const dist = getHaversineDistance(coords.lat, coords.lon, air.lat, air.lon);
      if (dist < minAirDist) {
        minAirDist = dist;
        nearestAir = air;
      }
    }

    // Calculate distance to all railway stations
    let minRailDist = Infinity;
    let nearestRail = null;
    for (const rail of RAILWAY_HUBS) {
      const dist = getHaversineDistance(coords.lat, coords.lon, rail.lat, rail.lon);
      if (dist < minRailDist) {
        minRailDist = dist;
        nearestRail = rail;
      }
    }

    // Calculate times and costs based on distances
    const busTime = Math.max(1, Math.round(minAirDist / 45));
    const busCost = Math.max(100, Math.round(minAirDist * 2.5));

    const railTime = Math.max(1, Math.round(minRailDist / 45));
    const railCost = Math.max(50, Math.round(minRailDist * 3));

    return {
      hubName: nearestAir ? `${nearestAir.name}` : "Bengaluru Airport (BLR)",
      railHubName: nearestRail ? `${nearestRail.name}` : "Hubli Junction (UBL)",
      localBusDetails: `Take local bus/cab from ${locName} to ${nearestAir ? nearestAir.name : "nearest airport"} (approx. ${Math.round(minAirDist)}km).`,
      localRailDetails: `Take local transport or bus from ${locName} to ${nearestRail ? nearestRail.name : "nearest railway station"} (approx. ${Math.round(minRailDist)}km).`,
      localBusCost: `₹${Math.round(busCost * 0.8)} - ₹${Math.round(busCost * 1.2)}`,
      localBusTime: `${busTime}h`,
      localRailCost: `₹${Math.round(railCost * 0.8)} - ₹${Math.round(railCost * 1.2)}`,
      localRailTime: `${railTime}h`
    };
  }

  // If geocoding fails, check if we can resolve using Gemini AI
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "your_google_gemini_api_key_here") {
    try {
      const prompt = `Identify the single nearest major commercial airport and the single nearest major railway station (or major transit station if no railway exists in that country) for the location "${locName}".
Return a JSON object conforming exactly to this schema:
{
  "hubName": "Airport Name (IATA)",
  "railHubName": "Railway Station Name (CODE)",
  "localBusDetails": "Short description of local bus/cab transit from ${locName} to the airport, mentioning the road distance in km.",
  "localRailDetails": "Short description of local bus/train/cab transit from ${locName} to the railway station, mentioning the road distance in km.",
  "localBusCost": "Estimated cost range (e.g. ₹500 - ₹1,500 or regional currency)",
  "localBusTime": "Estimated duration (e.g. 2h or 45m)",
  "localRailCost": "Estimated cost range (e.g. ₹150 - ₹400)",
  "localRailTime": "Estimated duration (e.g. 1.5h)"
}
Return only raw JSON. Do not add markdown code blocks or explanations.`;

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 seconds timeout

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        let responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (responseText) {
          responseText = responseText.trim();
          if (responseText.startsWith("```")) {
            responseText = responseText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
          }
          const parsed = JSON.parse(responseText);
          if (parsed.hubName && parsed.railHubName) {
            console.log(`Successfully resolved hubs for "${locName}" via Gemini API:`, parsed.hubName, "and", parsed.railHubName);
            return parsed;
          }
        }
      }
    } catch (geminiError) {
      console.error(`Gemini failed to resolve hubs for "${locName}":`, geminiError);
    }
  }

  console.log(`Falling back to static resolver for "${locName}"`);
  return resolveNearestHubStatic(locName);
};

const getIntercityTransportOptions = async (startLocation, destination) => {
  const dest = (destination || "").toLowerCase();
  const startLoc = startLocation || "Bengaluru";
  const startLocLower = startLoc.toLowerCase();

  // Helper context detection
  const startContext = detectLocationContext(startLoc);
  const destContext = detectLocationContext(destination);
  const isInternational = startContext.country !== destContext.country;

  const startHub = await resolveNearestHub(startLoc);
  const destHub = await resolveNearestHub(destination);

  // -----------------------------------------------------------------
  // SPECIFIC PRESET 1: Ayodhya / Ram Mandir
  // -----------------------------------------------------------------
  if (dest.includes("ayodhya") || dest.includes("ram mandir") || dest.includes("rammandir") || dest.includes("ram temple")) {
    if (startContext.country === "India") {
      const sHub = startHub || {
        hubName: startLoc,
        railHubName: startLoc,
        localBusDetails: `Direct departure from ${startLoc}`,
        localRailDetails: `Direct departure from ${startLoc}`,
        localBusCost: "₹0",
        localBusTime: "0h",
        localRailCost: "₹0",
        localRailTime: "0h"
      };

      const startRailNode = sHub.railHubName.split(" or ")[0].split(" Junction")[0];
      const startAirNode = sHub.hubName.split(" or ")[0].split(" (")[0];

      return [
        {
          mode: "🚌 + 🚆 + 🛺 Multi-Leg Train (via Hub & Ayodhya Dham)",
          details: `Leg 1: ${sHub.localRailDetails} (Time: ${sHub.localRailTime}, Cost: ${sHub.localRailCost}). Leg 2: Express train from ${startRailNode} to Ayodhya Dham Junction (AY) / Ayodhya Cantt (AYC) (Time: 32h - 36h, Cost: ₹800 - ₹2,500). Leg 3: Local E-rickshaw/auto from Ayodhya station to Ram Mandir (approx 5km, Time: 20m, Cost: ₹50 - ₹100).`,
          cost: `₹${(parseCostBackend(sHub.localRailCost) + 850).toLocaleString()} - ₹${(parseCostBackend(sHub.localRailCost) + 2600).toLocaleString()}`,
          timings: `Total: ${parseInt(sHub.localRailTime || 2) + 34}h - ${parseInt(sHub.localRailTime || 4) + 38}h`
        },
        {
          mode: "🚌 + ✈️ + 🚗 Multi-Leg Flight (via Airport Hub & Lucknow)",
          details: `Leg 1: ${sHub.localBusDetails} (Time: ${sHub.localBusTime}, Cost: ${sHub.localBusCost}). Leg 2: Flight from ${startAirNode} Airport to Ayodhya Airport (AYJ) or Lucknow Airport (LKO) (Time: 2.5h - 5h, Cost: ₹5,500 - ₹9,500). Leg 3: Private cab or bus from LKO/AYJ Airport to Ram Mandir (approx 130km, Time: 2h, Cost: ₹300 - ₹1,800).`,
          cost: `₹${(parseCostBackend(sHub.localBusCost) + 5500 + 300).toLocaleString()} - ₹${(parseCostBackend(sHub.localBusCost) + 9500 + 1800).toLocaleString()}`,
          timings: `Total: ${parseInt(sHub.localBusTime || 6) + 6}h - ${parseInt(sHub.localBusTime || 8) + 9}h`
        }
      ];
    }
  }

  // -----------------------------------------------------------------
  // SPECIFIC PRESET 2: Kedarnath Temple
  // -----------------------------------------------------------------
  if (dest.includes("kedarnath") || dest.includes("gaurikund") || dest.includes("sonprayag")) {
    if (startContext.country === "India") {
      const sHub = startHub || {
        hubName: startLoc,
        railHubName: startLoc,
        localBusDetails: `Direct departure from ${startLoc}`,
        localRailDetails: `Direct departure from ${startLoc}`,
        localBusCost: "₹0",
        localBusTime: "0h",
        localRailCost: "₹0",
        localRailTime: "0h"
      };

      const startRailNode = sHub.railHubName.split(" or ")[0].split(" Junction")[0];
      const startAirNode = sHub.hubName.split(" or ")[0].split(" (")[0];

      return [
        {
          mode: "✈️ + 🚌 + 🚶 Multi-Leg Flight & Trek (via Dehradun & Gaurikund)",
          details: `Leg 1: ${sHub.localBusDetails} followed by flight to Dehradun (DED) Airport (Time: ${sHub.localBusTime} + 4h, Cost: ${sHub.localBusCost} + ₹6,500). Leg 2: Local cab or shared bus from Dehradun to Gaurikund (approx. 220km, Time: 8h, Cost: ₹800 - ₹2,000). Leg 3: 16km mountain trek on foot/pony/palki from Gaurikund to Kedarnath Temple (Time: 6h - 8h, Cost: ₹Free - ₹4,000).`,
          cost: `₹${(parseCostBackend(sHub.localBusCost) + 6500 + 800).toLocaleString()} - ₹${(parseCostBackend(sHub.localBusCost) + 12000 + 6000).toLocaleString()}`,
          timings: `Total: ${parseInt(sHub.localBusTime || 6) + 18}h - ${parseInt(sHub.localBusTime || 8) + 22}h`
        },
        {
          mode: "🚆 + 🚌 + 🚶 Multi-Leg Train & Trek (via Haridwar & Gaurikund)",
          details: `Leg 1: ${sHub.localRailDetails} followed by express train to Haridwar (HW) (Time: ${sHub.localRailTime} + 36h, Cost: ${sHub.localRailCost} + ₹900). Leg 2: Shared jeep or bus from Haridwar to Gaurikund (approx. 240km, Time: 9h, Cost: ₹600 - ₹1,500). Leg 3: 16km trek from Gaurikund to Kedarnath (Time: 6h - 8h, Cost: ₹Free - ₹4,000).`,
          cost: `₹${(parseCostBackend(sHub.localRailCost) + 900 + 600).toLocaleString()} - ₹${(parseCostBackend(sHub.localRailCost) + 2800 + 5500).toLocaleString()}`,
          timings: `Total: ${parseInt(sHub.localRailTime || 2) + 51}h - ${parseInt(sHub.localRailTime || 4) + 55}h`
        }
      ];
    }
  }

  // -----------------------------------------------------------------
  // SPECIFIC PRESET 3: Hampi (under 200km check from start location)
  // -----------------------------------------------------------------
  if (dest.includes("hampi")) {
    if (startLocLower.includes("sindhanur") || startLocLower.includes("raichur") || startLocLower.includes("gangavathi") || startLocLower.includes("koppal") || startLocLower.includes("bellary") || startLocLower.includes("ballari") || startLocLower.includes("gadag") || startLocLower.includes("hosapete") || startLocLower.includes("hospet")) {
      return [
        {
          mode: "🚌 Direct KSRTC Bus",
          details: `Board a direct KSRTC Karnataka Sarige or express bus from ${startLoc} to Hosapete (Hampi) (approx 35km - 100km).`,
          cost: "₹100 - ₹250",
          timings: "1.5h - 3h"
        },
        {
          mode: "🚗 Private Taxi / Self-Drive",
          details: `Drive via state highways directly from ${startLoc} to Hampi ruins via Kariganur/Hosapete.`,
          cost: "₹1,500 - ₹3,000",
          timings: "1h - 2.5h"
        }
      ];
    }
    return [
      {
        mode: "✈️ Flight (via Hubli / Jindal Vijayanagar)",
        details: `Fly to Hubli Airport (HBX) or Jindal Vijayanagar Airport (VDY). VDY is 35km from Hampi; Hubli is 160km.`,
        cost: "₹4,500 - ₹8,000",
        timings: `Daily flights from ${startLoc} departing at 10:15 AM & 3:45 PM`
      },
      {
        mode: "🚆 Overnight Train (Hampi Express)",
        details: `Board the KSRenu - Kariganur Hampi Express (16592) directly to Hosapete Junction (HPT), 13km from Hampi.`,
        cost: "₹350 (Sleeper) - ₹1,400 (3AC)",
        timings: `Departs ${startLoc} daily at 10:00 PM; arrives in Hosapete at 7:10 AM`
      },
      {
        mode: "🚌 KSRTC Airavat Sleeper Bus",
        details: `State-run KSRTC Club Class Volvo sleeper buses from Kempegowda Bus Station (Majestic), ${startLoc} to Hosapete.`,
        cost: "₹750 - ₹1,100",
        timings: "Overnight services departing hourly from 9:30 PM to 11:30 PM"
      }
    ];
  }

  // -----------------------------------------------------------------
  // SPECIFIC PRESET 4: Mysore (under 200km check)
  // -----------------------------------------------------------------
  if (dest.includes("mysore") || dest.includes("mysuru")) {
    if (startLocLower.includes("bengaluru") || startLocLower.includes("bangalore") || startLocLower.includes("mandya") || startLocLower.includes("channapatna") || startLocLower.includes("ramanagara")) {
      return [
        {
          mode: "🚆 Train (Vande Bharat / Shatabdi Express)",
          details: `Superfast and clean trains running daily between KSR Bengaluru (SBC) and Mysuru Junction (MYS).`,
          cost: "₹350 (CC) - ₹850 (EC)",
          timings: `Frequent daily connections; Vande Bharat departs SBC at 10:15 AM (takes 2 hours)`
        },
        {
          mode: "🚌 KSRTC Flybus (Direct from Airport)",
          details: `Direct air-conditioned luxury Volvo bus from Bengaluru Kempegowda International Airport (BLR) to Mysuru.`,
          cost: "₹800 - ₹1,000",
          timings: "Runs multiple times daily (e.g. 10:00 AM, 2:00 PM, 6:00 PM, 11:00 PM)"
        },
        {
          mode: "🚗 Private Taxi / Self-Drive",
          details: `Take the modern Bengaluru-Mysuru Expressway (NH 275) for a smooth 140km road trip from ${startLoc}.`,
          cost: "₹2,500 - ₹4,000",
          timings: "Anytime; typically takes 2 to 2.5 hours"
        }
      ];
    }
  }

  // -----------------------------------------------------------------
  // SPECIFIC PRESET 5: Goa from Karnataka villages (via Hubli railway hub!)
  // -----------------------------------------------------------------
  if (dest.includes("goa")) {
    if (startLocLower.includes("sindhanur") || startLocLower.includes("raichur") || startLocLower.includes("koppal") || startLocLower.includes("bellary") || startLocLower.includes("ballari") || startLocLower.includes("gadag")) {
      return [
        {
          mode: "🚌 + 🚆 Multi-Leg Train (via Hubli & Madgaon)",
          details: `Leg 1: Take a local KSRTC bus or taxi from ${startLoc} to Hubli railway station (approx 180km, Time: 4h, Cost: ₹250 - ₹500). Leg 2: Board the Goa Express (12779) or weekly train from Hubli to Madgaon (MAO) crossing the Dudhsagar waterfalls (Time: 5.5h, Cost: ₹200 - ₹800).`,
          cost: "₹450 - ₹1,300",
          timings: "Total: 10h - 12h"
        },
        {
          mode: "🚌 Inter-city Sleeper Bus (via Hubli)",
          details: `Take a connecting luxury sleeper bus from ${startLoc} via Hubli directly to Panaji or Margao, Goa.`,
          cost: "₹900 - ₹1,600",
          timings: "Total: 9h - 11h"
        }
      ];
    }
  }

  // -----------------------------------------------------------------
  // GENERAL GLOBAL MATRIX
  // -----------------------------------------------------------------
  if (isInternational) {
    let flightCost = "₹45,000 - ₹95,000";
    let flightTime = "10h - 18h";
    let destName = destination;

    if (dest.includes("usa") || dest.includes("united states") || dest.includes("america") || dest.includes("new york") || dest.includes("washington") || dest.includes("california")) {
      flightCost = "₹55,000 - ₹1,20,000";
      flightTime = "16h - 22h+";
      destName = "USA";
    } else if (dest.includes("uk") || dest.includes("london") || dest.includes("united kingdom") || dest.includes("england")) {
      flightCost = "₹40,000 - ₹75,000";
      flightTime = "9h - 14h";
      destName = "UK (London)";
    } else if (dest.includes("france") || dest.includes("paris") || dest.includes("europe")) {
      flightCost = "₹42,000 - ₹80,000";
      flightTime = "9h - 15h";
      destName = dest.includes("paris") ? "Paris" : "Europe";
    } else if (dest.includes("japan") || dest.includes("tokyo") || dest.includes("kyoto")) {
      flightCost = "₹35,000 - ₹65,000";
      flightTime = "8h - 12h";
      destName = "Japan";
    }

    if (startContext.country === "India") {
      if (startContext.isHub) {
        return [
          {
            mode: `✈️ International Flight (from ${startLoc})`,
            details: `Direct or connecting flight from ${startLoc} to major airports in ${destName}.`,
            cost: flightCost,
            timings: flightTime
          }
        ];
      } else {
        const sHub = startHub || {
          hubName: "Bengaluru (BLR)",
          localBusDetails: `Take a bus to nearest airport`,
          localBusCost: "₹800",
          localBusTime: "6h"
        };
        const startAirNode = sHub.hubName.split(" or ")[0].split(" (")[0];
        const baseFlightCost = parseInt(flightCost.replace(/[^\d]/g, "").substring(0,5)) || 45000;
        const maxFlightCost = parseInt(flightCost.replace(/[^\d]/g, "").substring(5)) || 95000;

        return [
          {
            mode: `🚌 + ✈️ Multi-Leg Flight (via ${startAirNode})`,
            details: `Leg 1: ${sHub.localBusDetails} (Time: ${sHub.localBusTime}, Cost: ${sHub.localBusCost}). Leg 2: International Flight from ${startAirNode} to ${destName} (Time: ${flightTime}).`,
            cost: `₹${(baseFlightCost + parseCostBackend(sHub.localBusCost)).toLocaleString()} - ₹${(maxFlightCost + parseCostBackend(sHub.localBusCost) + 1000).toLocaleString()}`,
            timings: `Total: ${parseInt(sHub.localBusTime) + parseInt(flightTime)}h - ${parseInt(sHub.localBusTime) + parseInt(flightTime) + 6}h`
          }
        ];
      }
    }

    if (destContext.country === "India") {
      const dHub = destHub || {
        hubName: "Bengaluru (BLR)",
        localBusDetails: `Take a bus from airport to destination`,
        localBusCost: "₹800",
        localBusTime: "6h"
      };
      const destAirNode = dHub.hubName.split(" or ")[0].split(" (")[0];
      const baseFlightCost = parseInt(flightCost.replace(/[^\d]/g, "").substring(0,5)) || 45000;
      const maxFlightCost = parseInt(flightCost.replace(/[^\d]/g, "").substring(5)) || 95000;

      return [
        {
          mode: `✈️ + 🚌 Flight + Bus/Train (via ${destAirNode})`,
          details: `Leg 1: International flight from ${startLoc} landing at ${destAirNode} Airport. Leg 2: ${dHub.localBusDetails} (Time: ${dHub.localBusTime}, Cost: ${dHub.localBusCost}).`,
          cost: `₹${(baseFlightCost + parseCostBackend(dHub.localBusCost)).toLocaleString()} - ₹${(maxFlightCost + parseCostBackend(dHub.localBusCost) + 1000).toLocaleString()}`,
          timings: `Total: ${parseInt(flightTime) + parseInt(dHub.localBusTime)}h`
        }
      ];
    }
  }

  // DOMESTIC TRAVEL FALLBACK
  if (startContext.country === "India" && destContext.country === "India") {
    if (!startContext.isHub && !destContext.isHub) {
      const sHub = startHub || { railHubName: "Raichur (RC)", localRailDetails: "Local rail connection", localRailCost: "₹200", localRailTime: "2h" };
      const dHub = destHub || { railHubName: "Agra Cantt (AGC)", localRailDetails: "Local rail connection", localRailCost: "₹200", localRailTime: "2h" };

      const startRailNode = sHub.railHubName.split(" or ")[0].split(" Junction")[0];
      const destRailNode = dHub.railHubName.split(" or ")[0].split(" Junction")[0];

      return [
        {
          mode: "🚌 + 🚆 + 🛺 Multi-Leg Train Junction Connection",
          details: `Leg 1: ${sHub.localRailDetails} (Time: ${sHub.localRailTime}, Cost: ${sHub.localRailCost}). Leg 2: Express Train from ${startRailNode} to ${destRailNode} (Time: 18h - 26h, Cost: ₹600 - ₹1,800). Leg 3: ${dHub.localRailDetails} (Time: ${dHub.localRailTime}, Cost: ${dHub.localRailCost}).`,
          cost: `₹${(parseCostBackend(sHub.localRailCost) + 600 + parseCostBackend(dHub.localRailCost)).toLocaleString()} - ₹${(parseCostBackend(sHub.localRailCost) + 1800 + parseCostBackend(dHub.localRailCost)).toLocaleString()}`,
          timings: `Total: ${parseInt(sHub.localRailTime || 2) + 18 + parseInt(dHub.localRailTime || 2)}h - ${parseInt(sHub.localRailTime || 3) + 26 + parseInt(dHub.localRailTime || 3)}h`
        }
      ];
    }

    if (startContext.isHub) {
      return [
        {
          mode: "✈️ Domestic Flight",
          details: `Fly directly from ${startLoc} to the nearest domestic/regional airport in ${destination}.`,
          cost: "₹3,500 - ₹8,500",
          timings: "1h 30m - 3h"
        },
        {
          mode: "🚆 Indian Railways (AC Sleeper / Chair Car)",
          details: `Book express/superfast trains from ${startLoc} to the closest railway junction in ${destination}.`,
          cost: "₹600 - ₹2,200",
          timings: "6h - 18h"
        }
      ];
    }
  }

  // Default fallback
  return [
    {
      mode: "✈️ Flight / Transit Option",
      details: `Travel from ${startLoc} to ${destination} via regional transport.`,
      cost: "₹4,000 - ₹12,000",
      timings: "4h - 12h"
    }
  ];
};

const getLocalTransportGuide = (destination) => {
  const dest = (destination || "").toLowerCase();
  
  if (dest.includes("hampi")) {
    return [
      {
        mode: "🛺 Auto-Rickshaw (Tuk-tuk)",
        details: "Best for exploring the Hampi ruins. You can hire a rickshaw for a full-day guided tour between major monuments.",
        cost: "₹800 - ₹1,200 / day",
        timings: "Available all day (6:00 AM - 8:00 PM)"
      },
      {
        mode: "🚲 Rental Bicycle / Moped",
        details: "Rent a bicycle or moped to explore the ruins and cross the river to the Hippie Island side.",
        cost: "₹100 - ₹400 / day",
        timings: "Flexible rental hours"
      },
      {
        mode: "🚶 Walking",
        details: "Many main temple complexes (Virupaksha Temple, Hampi Bazaar) are best explored on foot.",
        cost: "Free",
        timings: "Anytime"
      }
    ];
  }
  
  if (dest.includes("mysore")) {
    return [
      {
        mode: "🛺 Auto-Rickshaw",
        details: "Abundant and convenient for short distances between Mysore Palace, Zoo, and local markets.",
        cost: "₹50 - ₹150 / ride",
        timings: "Available 24/7"
      },
      {
        mode: "🚌 City Bus (KSRTC)",
        details: "Affordable city buses connecting Mysore suburban bus stand to Chamundi Hills and Brindavan Gardens.",
        cost: "₹15 - ₹40 / ride",
        timings: "Every 15-30 minutes"
      },
      {
        mode: "🚶 Walking",
        details: "The Palace grounds and central heritage markets are highly pedestrian-friendly.",
        cost: "Free",
        timings: "Anytime"
      }
    ];
  }
  
  if (dest.includes("gokarna") || dest.includes("karwar") || dest.includes("udupi")) {
    return [
      {
        mode: "🛵 Scooter Rental",
        details: "Renting a scooter is the most popular way for tourists to travel between different beaches and temples.",
        cost: "₹300 - ₹500 / day",
        timings: "24 hours"
      },
      {
        mode: "🛺 Auto-Rickshaw",
        details: "Available at town center and beaches to transport you between Kudle, Om Beach, and town.",
        cost: "₹100 - ₹250 / ride",
        timings: "6:00 AM - 10:00 PM"
      },
      {
        mode: "🚶 Beach Trekking / Walking",
        details: "The famous Gokarna Beach Trek connects Kudle, Om, Half Moon, and Paradise beaches via cliffside trails.",
        cost: "Free",
        timings: "Daylight hours recommended"
      }
    ];
  }

  if (dest.includes("goa")) {
    return [
      {
        mode: "🛵 Scooter / Bike Rental",
        details: "The most economical and fun way to travel between beaches and shacks in North and South Goa.",
        cost: "₹350 - ₹600 / day",
        timings: "24 hours"
      },
      {
        mode: "🚕 GoaMiles / Local Taxi",
        details: "Use the local GoaMiles app or hire local yellow-black taxis for transfers and long drives.",
        cost: "₹800 - ₹2,000 / ride",
        timings: "Available 24/7"
      },
      {
        mode: "🚗 Self-Drive Car Rental",
        details: "Rent a self-drive car for group travel across national highways and coastal roads.",
        cost: "₹1,200 - ₹2,500 / day",
        timings: "Flexible"
      }
    ];
  }

  if (dest.includes("paris")) {
    return [
      {
        mode: "🚇 Paris Metro / RER",
        details: "Fastest and most efficient way to travel between major landmarks (Louvre, Eiffel Tower, Montmartre).",
        cost: "€2.15 / ticket (₹200)",
        timings: "5:30 AM - 1:15 AM daily"
      },
      {
        mode: "🚲 Vélib' Rental Bikes",
        details: "City-wide bike-sharing system with designated lanes along the Seine and main boulevards.",
        cost: "€5 - €10 / day (₹450 - ₹900)",
        timings: "24/7 access"
      },
      {
        mode: "🚶 Walking",
        details: "Paris is a highly walkable city; walking along the Seine and through historic quarters is highly recommended.",
        cost: "Free",
        timings: "Anytime"
      }
    ];
  }

  if (dest.includes("usa") || dest.includes("united states") || dest.includes("america") || dest.includes("new york") || dest.includes("washington") || dest.includes("california")) {
    return [
      {
        mode: "🚇 Metro / Subway (in major cities)",
        details: "In cities like New York (MTA), Washington DC, or Chicago, the subway is the fastest way to get from spot to spot.",
        cost: "$2.90 / ride (₹240)",
        timings: "24/7 (NY) or 5:00 AM - Midnight"
      },
      {
        mode: "🚕 Rideshare (Uber / Lyft)",
        details: "Convenient door-to-door transit between attractions, available instantly via smartphone apps.",
        cost: "$15 - $45 / ride (₹1,200 - ₹3,600)",
        timings: "24/7"
      },
      {
        mode: "🚗 Car Rental (for road trips & suburbs)",
        details: "Essential for traveling in places like Los Angeles, Florida, or national parks.",
        cost: "$45 - $95 / day (₹3,700 - ₹8,000)",
        timings: "Flexible"
      }
    ];
  }

  const internationalKeywords = ["uk", "united kingdom", "london", "canada", "toronto", "vancouver", "tokyo", "japan", "kyoto", "singapore", "dubai", "uae", "bali", "indonesia", "thailand", "bangkok", "phuket", "maldives", "europe", "germany", "switzerland", "italy", "rome", "australia", "sydney", "melbourne"];
  const isInternational = internationalKeywords.some(keyword => dest.includes(keyword));

  if (isInternational) {
    return [
      {
        mode: "🚇 Subway / Local Train",
        details: `Use the local metropolitan rapid transit systems (like Tokyo Metro, London Tube, Singapore MRT) in ${destination}.`,
        cost: "₹100 - ₹300 / ride",
        timings: "5:00 AM - Midnight"
      },
      {
        mode: "🚌 City Bus",
        details: `Public city bus routes serving areas not covered by trains inside ${destination}.`,
        cost: "₹50 - ₹150 / ride",
        timings: "Frequent daily schedules"
      },
      {
        mode: "🚕 Rideshare / Taxi",
        details: `Local taxi services or rideshare apps (Grab in Southeast Asia, Kakao T in Korea, Uber).`,
        cost: "₹400 - ₹1,500 / ride",
        timings: "24/7"
      }
    ];
  }

  // General domestic fallback
  return [
    {
      mode: "🛺 Auto-Rickshaw",
      details: `The most convenient way to travel locally within ${destination} from one spot to another.`,
      cost: "₹50 - ₹200 / ride",
      timings: "Available all day"
    },
    {
      mode: "🚕 App Cabs (Ola / Uber)",
      details: `Book hatchbacks, sedans, or SUVs for comfortable local travel between sightseeing points.`,
      cost: "₹150 - ₹500 / ride",
      timings: "24/7"
    },
    {
      mode: "🚶 Walking",
      details: "Local markets, temple areas, and heritage quarters are best explored on foot.",
      cost: "Free",
      timings: "Anytime"
    }
  ];
};

// Generate Trip Itinerary
exports.generateTrip = async (req, res) => {
  try {
    const { destination, startLocation, days, budget, travelStyle, interests, selectedTransport } = req.body;
    const startLoc = startLocation || "Bengaluru";

    if (!destination || !days || !budget || !travelStyle) {
      return res.status(400).json({ message: "Destination, days, budget, and travelStyle are required" });
    }

    const daysNum = parseInt(days);
    const budgetNum = parseFloat(budget);
    if (isNaN(daysNum) || daysNum <= 0) {
      return res.status(400).json({ message: "Days must be a positive number" });
    }
    if (isNaN(budgetNum) || budgetNum <= 0) {
      return res.status(400).json({ message: "Budget must be a positive number" });
    }

    const MIN_BUDGET_PER_DAY = {
      "Budget": 1000,
      "Adventure": 2000,
      "Standard": 3000,
      "Family": 4000,
      "Luxury": 10000
    };
    const minPerDay = MIN_BUDGET_PER_DAY[travelStyle] || 1000;
    let chosenTransportCost = 0;
    if (selectedTransport) {
      chosenTransportCost = parseCostBackend(selectedTransport.cost);
    }
    const requiredMin = minPerDay * daysNum + chosenTransportCost;
    if (budgetNum < requiredMin) {
      return res.status(400).json({ 
        message: `For a ${daysNum}-day ${travelStyle} style trip (with ₹${chosenTransportCost.toLocaleString()} transport), a minimum budget of ₹${requiredMin.toLocaleString()} is recommended.` 
      });
    }

    let itineraryContent = null;
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== "your_google_gemini_api_key_here") {
      try {
        const prompt = `Create a detailed and highly accurate ${daysNum}-day travel itinerary for "${destination}" starting from "${startLoc}" under a budget of ₹${budgetNum.toLocaleString()}.
Travel style: ${travelStyle}.
Optional user interests: ${interests && interests.length > 0 ? interests.join(", ") : "Sightseeing, Food, Culture"}.

You MUST return a JSON object that adheres EXACTLY to the following structure. Do not wrap in markdown code blocks or add text before/after. Return only the raw JSON.

CRITICAL REQUIREMENT FOR ACCURACY:
1. Destination & Activities: Provide REAL, existing, and highly accurate tourist places, sightseeing spots, and activities in "${destination}". No fictitious or hallucinated places are allowed.
2. Transport: Provide accurate local and inter-city transit details (e.g. specific train names, flight routes, local buses, or actual highway names) connecting "${startLoc}" to "${destination}".
3. Budget & Expenses: Ensure that activity costs, hotel recommendations, and daily food expenses are realistic in Indian Rupees (INR) (use ₹ symbol) and strictly optimized to fit the "${travelStyle}" tier and total budget of ₹${budgetNum.toLocaleString()}.
4. Timing: Organize activities logically (Morning, Afternoon, Evening) with realistic timing, duration, and scheduling.

Expected JSON format:
{
  "tripTitle": "A catchy, custom title for the trip",
  "summary": "A detailed paragraph summarizing the vibe, highlight destinations, and unique qualities of this customized itinerary.",
  "packingList": ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"],
  "budgetEstimation": {
    "accommodation": "Estimated price range for hotels per night (e.g. '₹2,000 - ₹3,500 / night')",
    "food": "Estimated price range for food per day (e.g. '₹800 - ₹1,500 / day')",
    "activities": "Estimated price range for activities per day (e.g. '₹500 - ₹1,200 / day')",
    "totalEstimated": "Estimated total cost range for the entire duration (e.g. '₹18,000 - ₹21,000')"
  },
  "hotelRecommendations": [
    {
      "name": "Recommended Hotel Name",
      "description": "Short explanation of why it is great, its features, and suitability for this travel style.",
      "estimatedPrice": "Price per night (e.g. '₹3,200/night')",
      "rating": "Numerical rating out of 5 (e.g. '4.7')"
    },
    {
      "name": "Another Recommended Hotel Name",
      "description": "Short explanation of why it is great, its features, and suitability for this travel style.",
      "estimatedPrice": "Price per night",
      "rating": "Numerical rating out of 5"
    }
  ],
  "days": [
    {
      "day": 1,
      "theme": "Theme/Focus for Day 1",
      "activities": [
        {
          "time": "Morning",
          "title": "Specific attraction or activity name",
          "description": "Highly engaging 2-3 sentence description of what to do, see, and experience here.",
          "cost": "Cost (e.g., 'Free', '₹500/person')"
        },
        {
          "time": "Afternoon",
          "title": "Specific attraction or activity name",
          "description": "Engaging description of this afternoon activity.",
          "cost": "Cost"
        },
        {
          "time": "Evening",
          "title": "Dinner option or evening stroll activity name",
          "description": "Engaging description of this evening activity.",
          "cost": "Cost"
        }
      ]
    }
    // Repeat for all days up to day ${daysNum}
  ],
  "localTips": [
    "Useful culture/safety tip 1",
    "Transit tip 2",
    "Language or eating etiquette tip 3"
  ],
  "transportGuide": [
    {
      "mode": "Mode of local transit (e.g. 🚇 Metro/Subway, 🛺 Auto-Rickshaw, 🛵 Scooter Rental, 🚶 Walking)",
      "details": "Details on how to use this transit mode to travel between different visiting places/sightseeing spots locally within ${destination}",
      "cost": "Estimated cost range per ride or per day (e.g., '₹50 - ₹150 / ride' or '$5 - $15 / day')",
      "timings": "Operating hours or frequencies (e.g., 'Every 5-10 minutes' or '5:00 AM - Midnight')"
    }
  ]
}

Provide highly descriptive, engaging and realistic itineraries. Double check that you generate exactly ${daysNum} days.`;

        // Direct fetch to Gemini API
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
            },
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          let responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (responseText) {
            responseText = responseText.trim();
            // Remove markdown code fence if AI added it despite responseMimeType
            if (responseText.startsWith("```")) {
              responseText = responseText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
            }
            itineraryContent = JSON.parse(responseText);
          }
        } else {
          console.warn("Gemini API call failed. Falling back to mock generator.");
        }
      } catch (geminiError) {
        console.error("Gemini API generation error:", geminiError.name === "AbortError" ? "Request timed out" : geminiError);
      }
    }

    // Fallback to custom/dynamic mock itinerary
    if (!itineraryContent) {
      let transportCost = 0;
      if (selectedTransport) {
        transportCost = parseCostBackend(selectedTransport.cost);
      }
      const adjustedBudget = Math.max(budgetNum - transportCost, 1000 * daysNum);
      itineraryContent = generateMockItinerary(destination, daysNum, adjustedBudget, travelStyle, interests, budgetNum);
    }

    // Ensure transportGuide is populated with local transport options
    if (!itineraryContent.transportGuide || !Array.isArray(itineraryContent.transportGuide)) {
      itineraryContent.transportGuide = getLocalTransportGuide(destination);
    }

    // 1. Save Trip
    let trip = null;
    let itinerary = null;
    if (mongoose.connection.readyState === 1) {
      try {
        trip = await Trip.create({
          userId: req.userId,
          destination,
          startLocation: startLoc,
          days: daysNum,
          budget: budgetNum,
          travelStyle,
          interests: interests || [],
          selectedTransport: selectedTransport || null,
        });

        itinerary = await Itinerary.create({
          tripId: trip._id,
          content: itineraryContent,
        });
      } catch (dbErr) {
        console.warn("MongoDB Trip.create failed, falling back to memory:", dbErr.message);
      }
    }

    if (!trip) {
      const generatedId = "trip_" + Date.now();
      trip = {
        _id: generatedId,
        userId: req.userId,
        destination,
        startLocation: startLoc,
        days: daysNum,
        budget: budgetNum,
        travelStyle,
        interests: interests || [],
        selectedTransport: selectedTransport || null,
        createdAt: new Date(),
        toObject() { return { ...this }; }
      };
      inMemoryTrips.push({ trip, itineraryContent });
    }

    res.status(201).json({
      ...(trip.toObject ? trip.toObject() : trip),
      itinerary: itineraryContent,
    });
  } catch (error) {
    console.error("Error in generateTrip:", error);
    res.status(500).json({ message: error.message || "Failed to generate travel plan" });
  }
};

// Get all trips for the logged-in user
exports.getUserTrips = async (req, res) => {
  try {
    let tripsWithItinerary = [];
    if (mongoose.connection.readyState === 1) {
      try {
        const trips = await Trip.find({ userId: req.userId }).sort({ createdAt: -1 });
        tripsWithItinerary = await Promise.all(
          trips.map(async (trip) => {
            const itinerary = await Itinerary.findOne({ tripId: trip._id });
            return {
              ...trip.toObject(),
              itinerary: itinerary ? itinerary.content : null,
            };
          })
        );
      } catch (dbErr) {
        console.warn("MongoDB getUserTrips failed, using in-memory store:", dbErr.message);
      }
    }

    if (tripsWithItinerary.length === 0) {
      const userMemTrips = inMemoryTrips
        .filter(t => String(t.trip.userId) === String(req.userId))
        .map(t => ({
          ...(t.trip.toObject ? t.trip.toObject() : t.trip),
          itinerary: t.itineraryContent,
        }));
      tripsWithItinerary = userMemTrips;
    }

    res.json(tripsWithItinerary);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch trips" });
  }
};

// Get a single trip's details
exports.getTripById = async (req, res) => {
  try {
    let trip = null;
    let itinerary = null;
    if (mongoose.connection.readyState === 1) {
      try {
        trip = await Trip.findById(req.params.id);
        if (trip) {
          itinerary = await Itinerary.findOne({ tripId: trip._id });
        }
      } catch (dbErr) {
        console.warn("MongoDB getTripById failed:", dbErr.message);
      }
    }

    if (!trip) {
      const mem = inMemoryTrips.find(t => String(t.trip._id) === String(req.params.id));
      if (mem) {
        trip = mem.trip;
        itinerary = { content: mem.itineraryContent };
      }
    }

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Check if the trip belongs to this user or if requester is admin
    if (trip.userId.toString() !== String(req.userId) && req.userRole !== "admin") {
      return res.status(403).json({ message: "Not authorized to view this trip" });
    }

    res.json({
      ...(trip.toObject ? trip.toObject() : trip),
      itinerary: itinerary ? itinerary.content : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch trip details" });
  }
};

// Delete a trip
exports.deleteTrip = async (req, res) => {
  try {
    let deleted = false;
    if (mongoose.connection.readyState === 1) {
      try {
        const trip = await Trip.findById(req.params.id);
        if (trip) {
          if (trip.userId.toString() !== String(req.userId) && req.userRole !== "admin") {
            return res.status(403).json({ message: "Not authorized to delete this trip" });
          }
          await Trip.findByIdAndDelete(req.params.id);
          await Itinerary.deleteMany({ tripId: req.params.id });
          deleted = true;
        }
      } catch (dbErr) {
        console.warn("MongoDB deleteTrip failed:", dbErr.message);
      }
    }

    const idx = inMemoryTrips.findIndex(t => String(t.trip._id) === String(req.params.id));
    if (idx !== -1) {
      inMemoryTrips.splice(idx, 1);
      deleted = true;
    }

    if (!deleted) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.json({ message: "Trip and itinerary deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete trip" });
  }
};

// Fetch transport options for starting location and destination
exports.getTransportOptions = async (req, res) => {
  try {
    const { startLocation, destination } = req.body;
    const startLoc = startLocation || "Bengaluru";

    if (!destination) {
      return res.status(400).json({ message: "Destination is required" });
    }

    let transportOptions = null;
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== "your_google_gemini_api_key_here") {
      try {
        const prompt = `Provide 3-4 realistic modes of transport from "${startLoc}" to "${destination}" with travel time/duration and estimated cost in Indian Rupees (INR) (use ₹ symbol).
Ensure the modes of transport, routes, train names, and highways are highly accurate and actually connect "${startLoc}" and "${destination}".
If there is no direct transport (e.g. no direct flight or train) from "${startLoc}" to "${destination}", you MUST specify a multi-leg route (e.g. travel by local bus/train/cab from "${startLoc}" to the nearest major international airport or transit hub like Bengaluru, Hyderabad, Mumbai, Delhi, London Heathrow, JFK, etc., and then fly/train from there to "${destination}").
Format the output EXACTLY as a JSON array of objects. Do not write any explanations or markdown fences. Just return raw JSON.
JSON Schema:
[
  {
    "mode": "e.g., ✈️ Flight, 🚆 Train, 🚌 Bus, 🚗 Taxi, or 🚌 + ✈️ Multi-Leg",
    "details": "e.g., Direct flight to X airport, or KSRTC bus to BLR airport followed by flight to Y",
    "cost": "e.g., ₹4,500 - ₹6,000 or ₹1,200",
    "timings": "e.g., 2h 15m or 8-10 hours"
  }
]`;

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
            },
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          let responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (responseText) {
            responseText = responseText.trim();
            if (responseText.startsWith("```")) {
              responseText = responseText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
            }
            transportOptions = JSON.parse(responseText);
          }
        }
      } catch (geminiError) {
        console.error("Gemini Transport API error:", geminiError.name === "AbortError" ? "Request timed out" : geminiError);
      }
    }

    // Fallback if Gemini is not configured or fails
    if (!transportOptions || !Array.isArray(transportOptions)) {
      transportOptions = await getIntercityTransportOptions(startLoc, destination);
    }

    res.json(transportOptions);
  } catch (error) {
    console.error("Error in getTransportOptions:", error);
    res.status(500).json({ message: error.message || "Failed to retrieve transport options" });
  }
};
