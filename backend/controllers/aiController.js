const Chat = require("../models/Chat");

// Chat with Gemini AI and store log
exports.chatWithAI = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }

    let answerText = "";
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== "your_google_gemini_api_key_here") {
      try {
        const prompt = `You are Pravasi, the Official Karnataka Tourism AI assistant. Answer the user's travel question with helpful, expert, and practical advice on travelling in Karnataka (and other locations if asked). Keep it structured with markdown formatting (bullet points, bold text) where appropriate, and maintain a friendly, adventurous tone.
        
User Question: "${question}"`;

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

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
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            answerText = rawText.trim();
          }
        }
      } catch (geminiError) {
        console.error("Gemini Chat API error:", geminiError.name === "AbortError" ? "Request timed out" : geminiError);
      }
    }

    // Mock responses if Gemini key is missing or fails
    if (!answerText) {
      answerText = generateSmartMockResponse(question);
    }

    // Save chat exchange in database
    const chatLog = await Chat.create({
      userId: req.userId,
      question,
      answer: answerText,
    });

    res.status(201).json(chatLog);
  } catch (error) {
    console.error("Error in chatWithAI:", error);
    res.status(500).json({ message: error.message || "Failed to process chat" });
  }
};

// Fetch user's chat history
exports.getChatHistory = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.userId }).sort({ timestamp: 1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch chat logs" });
  }
};

// Standalone itinerary generator (utility API)
exports.generateItineraryDirect = async (req, res) => {
  try {
    const { destination, days, budget, travelStyle } = req.body;
    if (!destination || !days || !budget || !travelStyle) {
      return res.status(400).json({ message: "Destination, days, budget, and travelStyle are required" });
    }

    const daysNum = parseInt(days);
    const budgetNum = parseFloat(budget);
    
    // We can call the same mock generator
    const tripController = require("./tripController");
    // Generate a direct mock itinerary for responsiveness
    res.status(200).json({
      destination,
      days: daysNum,
      budget: budgetNum,
      travelStyle,
      itinerary: {
        tripTitle: `Spectacular ${daysNum}-Day Travel Plan for ${destination}`,
        summary: `Tailored itinerary for a ${travelStyle} style trip to ${destination} with an overall budget of ₹${budgetNum.toLocaleString()}.`,
        packingList: ["Comfortable outfits", "Travel charger", "Camera", "First aid kits"],
        localTips: ["Enjoy local street food!", "Verify tourist timings online."],
        days: [
          {
            day: 1,
            theme: "Arrival & Orientation",
            activities: [
              { time: "Morning", title: "Arrival & Check-in", description: "Get settled in your lodging.", cost: "Free" },
              { time: "Afternoon", title: "City Center Walk", description: "Walk around standard neighborhoods.", cost: "Free" },
              { time: "Evening", title: "Welcome Dinner", description: "Dine at a classic restaurant.", cost: "₹800/person" }
            ]
          }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to generate itinerary" });
  }
};

function generateSmartMockResponse(question) {
  const lower = question.toLowerCase().trim();
  
  // 1. Identify destination(s) mentioned
  const destinations = [];
  if (lower.includes("goa")) destinations.push("Goa");
  if (lower.includes("hampi")) destinations.push("Hampi");
  if (lower.includes("mysore") || lower.includes("mysuru")) destinations.push("Mysore");
  if (lower.includes("gokarna")) destinations.push("Gokarna");
  if (lower.includes("coorg") || lower.includes("kodagu")) destinations.push("Coorg");
  if (lower.includes("chikmagalur") || lower.includes("chikkamagaluru")) destinations.push("Chikmagalur");
  if (lower.includes("bengaluru") || lower.includes("bangalore")) destinations.push("Bengaluru");
  if (lower.includes("badami") || lower.includes("pattadakal") || lower.includes("aihole")) destinations.push("Badami & Pattadakal Heritage Site");
  if (lower.includes("dandeli")) destinations.push("Dandeli");
  if (lower.includes("karnataka")) destinations.push("Karnataka");
  if (lower.includes("paris")) destinations.push("Paris");
  if (lower.includes("kyoto")) destinations.push("Kyoto");
  if (lower.includes("bali")) destinations.push("Bali");
  if (lower.includes("rome")) destinations.push("Rome");

  // 2. Identify topics mentioned
  const topics = [];
  if (lower.includes("beach") || lower.includes("sea") || lower.includes("ocean") || lower.includes("coast")) topics.push("Beaches & Coastal activities");
  if (lower.includes("palace") || lower.includes("heritage") || lower.includes("history") || lower.includes("temple") || lower.includes("ruin") || lower.includes("fort") || lower.includes("monument") || lower.includes("culture")) topics.push("Historical Heritage & Culture");
  if (lower.includes("food") || lower.includes("restaurant") || lower.includes("eat") || lower.includes("cuisine") || lower.includes("dish") || lower.includes("cafe") || lower.includes("dining")) topics.push("Local Cuisine & Dining");
  if (lower.includes("hotel") || lower.includes("stay") || lower.includes("resort") || lower.includes("accommodation") || lower.includes("hostel") || lower.includes("room") || lower.includes("homestay")) topics.push("Accommodations & Stays");
  if (lower.includes("pack") || lower.includes("packing") || lower.includes("wear") || lower.includes("carry") || lower.includes("checklist") || lower.includes("gear")) topics.push("Packing Essentials & Gear");
  if (lower.includes("weather") || lower.includes("rain") || lower.includes("monsoon") || lower.includes("climate") || lower.includes("season") || lower.includes("temp") || lower.includes("best time")) topics.push("Weather & Best Time to Visit");
  if (lower.includes("transport") || lower.includes("cab") || lower.includes("bus") || lower.includes("train") || lower.includes("flight") || lower.includes("reach") || lower.includes("travel") || lower.includes("route") || lower.includes("map") || lower.includes("drive")) topics.push("Transport, Route & Getting There");
  if (lower.includes("budget") || lower.includes("cheap") || lower.includes("expensive") || lower.includes("cost") || lower.includes("price") || lower.includes("money") || lower.includes("rupees") || lower.includes("fare")) topics.push("Budget Planning & Costs");
  if (lower.includes("trek") || lower.includes("hike") || lower.includes("adventure") || lower.includes("wildlife") || lower.includes("safari") || lower.includes("nature") || lower.includes("waterfall") || lower.includes("forest")) topics.push("Adventure, Trekking & Nature");

  // Specific high-quality custom combinations
  
  // GOA SPECIFICS
  if (destinations.includes("Goa")) {
    if (lower.includes("beach") || lower.includes("coast")) {
      return `### 🌴 Exploring Goa's Stunning Coastline
Goa has beaches suited for every type of traveler:
* **North Goa (Vibrant & Energetic)**:
  * *Baga & Calangute*: Best for nightlife, water sports, and beach shacks.
  * *Anjuna & Vagator*: Known for rocky cliffs, sunset points, and psytrance parties.
  * *Arambol*: A bohemian paradise popular for drum circles and sunset yoga.
* **South Goa (Serene & Relaxed)**:
  * *Palolem*: Beautiful crescent-shaped bay, safe for swimming, offers kayak trips.
  * *Agonda*: Super quiet, pristine, perfect for reading and spotting dolphins.
  * *Colva & Benaulim*: Wide silver-sand beaches lined with seafood restaurants.
* **💡 Pro Tip**: If visiting between June and September, avoid swimming entirely due to high undertows and monsoon currents!`;
    }
    if (lower.includes("weather") || lower.includes("rain") || lower.includes("monsoon") || lower.includes("best time") || lower.includes("july") || lower.includes("august") || lower.includes("june")) {
      return `### 🌧️ Goa in the Monsoon Season (June - September)
Visiting Goa during the rains offers a very different, lush green perspective:
* **What to Expect**: Continuous heavy rain showers, cool temperatures (24°C - 30°C), and nature in full bloom.
* **The Positives**:
  * Accommodations are discounted by up to 50%.
  * Popular waterfalls like **Dudhsagar Waterfall** are in their grandest, roaring form.
  * Spice plantations in Ponda are incredibly aromatic and fresh.
* **The Drawbacks**: 
  * All water sports (jet skiing, parasailing, scuba) are closed.
  * No beach shacks are built on the sand; swimming is strictly forbidden due to dangerous tides.
* **💡 Pro Tip**: Focus on visiting spice farms, historical churches in Old Goa, and trekking in the Western Ghats (e.g., Netravali Wildlife Sanctuary).`;
    }
    if (lower.includes("food") || lower.includes("cuisine") || lower.includes("eat") || lower.includes("restaurant") || lower.includes("cafe")) {
      return `### 🍛 Goa Food Guide: Seafood & Portuguese Influence
Goan cuisine is an exotic blend of local Konkan tastes and Portuguese ingredients:
* **Must-Try Dishes**:
  * *Goan Fish Curry Rice*: The daily staple, rich with fresh coconut and local spices.
  * *Pork Vindaloo*: Spicy, tangy, and slow-cooked with vinegar and garlic.
  * *Chicken Xacuti*: Prepared with roasted coconut and white poppy seeds.
  * *Bebinca*: The famous layered Goan dessert made with egg yolk, coconut milk, and ghee.
* **Top Places to Eat**:
  * *Shacks (South Goa)*: Fisherman's Wharf (Cavelossim) for scenic seafood dining by the river.
  * *Cafes (North Goa)*: Artjuna (Anjuna) or Baba Au Rhum (Anjuna) for fantastic bakery items.
  * *Heritage*: Mum's Kitchen (Panaji) for traditional, home-style Goan cooking.`;
    }
    if (lower.includes("stay") || lower.includes("hotel") || lower.includes("resort") || lower.includes("hostel")) {
      return `### 🏨 Where to Stay in Goa
Choose your base based on your travel vibe:
* **North Goa (Parties & Activities)**:
  * *Candolim/Calangute*: Mid-range to premium beach resorts near all the action.
  * *Anjuna/Vagator*: High-end boutique stays, hostels (like *HostelCrowd*), and villas.
* **South Goa (Peace & Nature)**:
  * *Palolem*: Cozy beachside wooden cottages built right under coconut trees.
  * *Varca/Cavelossim*: Five-star luxury resorts (Taj Exotica, Leela) with private beach access.
* **💡 Accommodation Tip**: Book at least 2 months in advance if you plan to visit during the peak season (December 15 - January 5) as rates double!`;
    }
    // General Goa
    return `### 🌴 Welcome to Goa!
Goa is India's pocket-sized paradise, offering a blend of Portuguese heritage, golden beaches, and vibrant culture.
* **Top Attractions**: Dudhsagar Waterfalls, Basilica of Bom Jesus (UNESCO site), Fort Aguada, and Palolem Beach.
* **Best Time to Visit**: November to February (cool, dry, and peak festival season).
* **Getting Around**: Renting a scooter or a self-drive car is the most economical and flexible way to explore (approx. ₹300-₹500/day for scooters).
* **💡 Need more details?** Ask me about specific beach recommendations, food spots, or a day-by-day Goa itinerary!`;
  }

  // HAMPI SPECIFICS
  if (destinations.includes("Hampi")) {
    if (lower.includes("history") || lower.includes("ruin") || lower.includes("temple") || lower.includes("heritage")) {
      return `### 🏛️ Ancient Temples & Ruins of Hampi (UNESCO World Heritage Site)
Hampi was the grand capital of the medieval Vijayanagara Empire. Essential monuments to explore:
1. **Virupaksha Temple**: An active place of worship since the 7th century, featuring a massive 160-foot entrance tower.
2. **Vittala Temple Complex**: Famous for its iconic **Stone Chariot** (pictured on the Indian ₹50 note) and the musical stone pillars.
3. **Lotus Mahal & Elephant Stables**: Stunning examples of Indo-Islamic architecture where royal elephants were housed.
4. **Ugra Narasimha & Badavilinga**: Massive monolithic sculptures carved out of single boulders.
* **💡 Travel Tip**: Hire a local certified guide at the Vittala temple entrance to understand the incredible engineering and folklore behind the ruins!`;
    }
    if (lower.includes("stay") || lower.includes("hotel") || lower.includes("resort") || lower.includes("hostel")) {
      return `### 🏡 Accommodation Guide for Hampi
Hampi is divided geographically by the Tungabhadra River:
* **Hampi Bazaar & Temple Side**:
  * *Vibe*: Traditional, strictly vegetarian, no alcohol. Great for walking to historical ruins.
  * *Stays*: Homestays and budget guest rooms run by local families.
* **Virupapur Gaddi / "Hippie Island" Side (Across the River)**:
  * *Note*: The government recently demolished many old shacks directly on the island, but the areas nearby (Sanapur, Anegundi) still hold a bohemian vibe.
  * *Stays*: Quirky riverside cottages, hostels, and eco-resorts.
* **Luxury Option**:
  * *Evolve Back Hampi* or *Heritage Resort Hampi* (near Hospet) for a luxurious, royal palace-style experience.`;
    }
    return `### 🏛️ Hampi: The Frozen Empire
Hampi is a surreal boulder-strewn landscape dotted with over 1,600 ruins of the Vijayanagara Empire.
* **Top Highlights**: Sunset view from **Matanga Hill**, coracle boat rides across the Tungabhadra River, exploring Anegundi village, and the Vittala Stone Chariot.
* **Best Time to Visit**: October to February (Hampi gets extremely hot during summer).
* **Getting There**: The nearest railway station and bus hub is **Hospet** (13 km away), which is well connected to Bangalore and Goa.
* **💡 Need more details?** Ask me about Hampi's history, where to catch the best sunset, or transport options!`;
  }

  // MYSORE SPECIFICS
  if (destinations.includes("Mysore")) {
    if (lower.includes("palace") || lower.includes("heritage") || lower.includes("history")) {
      return `### 👑 The Grand Mysore Palace (Amba Vilas)
Mysore Palace is one of the most famous tourist attractions in India, receiving millions of visitors annually:
* **Key Highlights**: Indo-Saracenic architectural style, golden throne, stunning Durbar Hall, and intricate stained glass ceilings.
* **Palace Illumination**: The palace is illuminated by nearly 100,000 lightbulbs every **Sunday and public holiday from 7:00 PM to 8:00 PM**. It is a breathtaking sight!
* **Timings & Entry**: Open daily from 10:00 AM to 5:30 PM. Entry fee is ₹100 for adults.
* **💡 Photography Tip**: Cameras are not allowed inside the palace rooms; you must deposit them at the locker counters.`;
    }
    if (lower.includes("food") || lower.includes("cuisine") || lower.includes("eat") || lower.includes("sweet")) {
      return `### 🍛 Culinary Delights of Mysore
Do not leave Mysore without trying these local specialties:
1. **Mysore Pak**: The royal sweet made of gram flour, pure ghee, and sugar. Buy the authentic, melt-in-your-mouth version from **Guru Sweet Mart** (Devaraja Market) or **Mahalaxmi Sweets**.
2. **Mysore Masala Dosa**: Distinctly crispy on the outside, soft inside, smeared with spicy red garlic chutney and loaded with butter. Best enjoyed at **Mylari Hotel** (Nazarbad) or **Gayatri Vihar**.
3. **Mysore Filter Coffee**: Rich, aromatic chicory-blend coffee served in traditional brass containers.`;
    }
    return `### 👑 Mysore: The Cultural Capital of Karnataka
Mysore (officially Mysuru) is renowned for its royal heritage, grand palaces, yoga hubs, and rich sandalwood/silk products.
* **Must-See Places**: Mysore Palace, Chamundi Hills (temple & view), Brindavan Gardens (fountain show), and the historic Devaraja Market.
* **Best Time to Visit**: October (during the world-famous **Mysore Dasara festival**) or anytime between October and March.
* **💡 Local Shopping**: Buy genuine Mysore Silk sarees from the KSIC showroom and pure sandalwood oil from government outlets. Let me know if you want a detailed shopping guide!`;
  }

  // COORG SPECIFICS
  if (destinations.includes("Coorg")) {
    if (lower.includes("coffee") || lower.includes("stay") || lower.includes("resort") || lower.includes("homestay")) {
      return `### ☕ Coorg Coffee Estates & Homestay Experience
Coorg is India's largest coffee-producing region. The best way to experience it is:
* **Book a Plantation Homestay**: Live in traditional estates surrounded by coffee plants, pepper vines, and cardamom trees.
* **Estate Walks**: Take guided tours to learn about Arabica and Robusta coffee bean processing, harvesting, and roasting.
* **Top Resorts**: For luxury, check out *Evolve Back Coorg*, *The Tamara Coorg*, or *Taj Madikeri Resort & Spa*.
* **💡 Pro Tip**: Enjoy fresh home-cooked Kodava cuisine (like *Pandi Curry* - pork curry, or *Kadamuttu* - rice dumplings) prepared by homestay hosts!`;
    }
    return `### 🏔️ Coorg: The Scotland of India
Coorg (Kodagu) is a mist-covered hill station in southwestern Karnataka, famous for its lush landscapes, spice plantations, and unique local culture.
* **Top Attractions**: Abbey Waterfalls, Raja's Seat (sunset view point), Dubare Elephant Camp, and Namdroling Monastery (Golden Temple in Bylakuppe).
* **Trekking & Adventure**: Trek up to **Tadiandamol Peak** (the highest peak in Coorg) or **Abbey Falls** trail.
* **Best Time to Visit**: October to April for cool, refreshing weather. June to September is beautiful but experiences very heavy rainfall.
* **💡 Need more details?** Ask me about how to reach Bylakuppe Golden Temple or the best trekking trails in Coorg!`;
  }

  // GOKARNA SPECIFICS
  if (destinations.includes("Gokarna")) {
    if (lower.includes("beach") || lower.includes("trek") || lower.includes("hike")) {
      return `### 🥾 Gokarna Beach Trek: 5 Beaches in One Day
Gokarna is famous for its rocky cliff treks that connect multiple pristine beaches. The legendary beach trek route:
1. **Kudle Beach**: Wide, sandy, and lined with cozy cafes. Start here.
2. **Om Beach**: Shaped naturally like the spiritual Hindu symbol 'Om'. Great for cafe-hopping (visit Namaste Cafe).
3. **Half Moon Beach**: Accessible only by trekking over the cliffs or taking a boat. Very secluded and quiet.
4. **Paradise Beach**: A rocky, raw cove popular for camping, bonfire nights, and absolute seclusion.
* **💡 Trek Details**: The total trek takes about 3-4 hours. Wear shoes with a good grip as you'll be walking on rocky edges and dirt trails!`;
    }
    return `### 🌊 Gokarna: Pilgrimage Meets Pristine Beaches
Gokarna is a unique temple town in Karnataka that doubles as a laid-back backpacking beach destination.
* **Highlights**: Mahabaleshwar Temple (ancient Shiva temple), Om Beach, Kudle Beach, and cliff sunset viewpoints.
* **Vibe**: More peaceful, spiritual, and less commercialized than Goa.
* **Best Time to Visit**: October to March. Monsoon brings rough seas and renders the beach trek unsafe.
* **💡 Need more details?** Ask me about Namaste Cafe, water sports availability, or hostel stays in Gokarna!`;
  }

  // CHIKMAGALUR SPECIFICS
  if (destinations.includes("Chikmagalur")) {
    return `### ⛰️ Chikmagalur: The Land of Coffee & Peaks
Chikmagalur is situated in the foothills of the Mullayanagiri range and is legendary as the birthplace of coffee in India.
* **Top Highlights**:
  * **Mullayanagiri Peak**: The highest peak in Karnataka (1,930m) offering stunning panoramic views of the clouds.
  * **Baba Budangiri**: A sacred pilgrim site and hills famous for trekking and scenic views.
  * **Hebbe Falls & Jhari Falls**: Pristine waterfalls located deep inside forest and estate lands.
* **Best Time to Visit**: September to March. Monsoon is spectacular but trekking can be slippery.
* **💡 Coffee History**: Baba Budan, a 17th-century Sufi saint, smuggled seven coffee beans from Yemen and planted them in these hills, introducing coffee to India!`;
  }

  // BENGALURU SPECIFICS
  if (destinations.includes("Bengaluru")) {
    return `### 🌆 Bengaluru (Bangalore): The Garden City & Silicon Valley
Bengaluru is a vibrant metropolitan city known for its pleasant climate, massive tech parks, beautiful parks, and lively pub culture.
* **Key Places to Visit**: Lalbagh Botanical Garden, Bangalore Palace, Cubbon Park, and Tipu Sultan's Summer Palace.
* **Weekend Getaways**: **Nandi Hills** (go early at 5:00 AM to see the sunrise above clouds) or trekking at Savandurga.
* **Food & Drinks**: Explore the microbreweries in Indiranagar/Koramangala, or try traditional South Indian breakfast (Idli/Vada/Dosa) at **MTR (Mavalli Tiffin Room)** or **Vidyarthi Bhavan**.`;
  }

  // GENERIC KARNATAKA / OTHER SITES
  if (destinations.includes("Karnataka")) {
    return `### 🗺️ Karnataka Tourism: One State, Many Worlds
Karnataka offers everything from ancient architectural marvels to pristine beaches and misty hills:
* **Heritage Triangle**: Hampi (Vijayanagara ruins), Badami (cave temples), and Mysore (royal palace).
* **Nature & Hills**: Coorg, Chikmagalur, and the Western Ghats forest reserves.
* **Beaches & Coast**: Gokarna, Karwar, and Udupi.
* **Wildlife Safaris**: Kabini, Bandipur, and Nagarhole National Parks (great for spotting tigers and elephants).
* **💡 Planning Help**: Let me know which of these regions you want to combine for a multi-day Karnataka itinerary!`;
  }

  // OTHER INTERNATIONAL DESTINATIONS (Paris, Kyoto, Bali, Rome)
  if (destinations.includes("Paris")) {
    return `### 🗼 Bienvenue à Paris!
The City of Light is a global center for art, fashion, gastronomy, and culture.
* **Must-See Icons**: Eiffel Tower, Louvre Museum (home of Mona Lisa), Musée d'Orsay, Notre-Dame Cathedral, and Arc de Triomphe.
* **Neighborhoods**: Wander through **Montmartre** (artists' quarter) and the historic **Latin Quarter**.
* **💡 Travel Tip**: Buy the *Paris Museum Pass* if you plan to visit multiple museums; it saves money and lets you bypass long ticket lines!`;
  }
  if (destinations.includes("Kyoto")) {
    return `### ⛩️ Kyoto: The Heart of Old Japan
Kyoto is famous for its thousands of classical Buddhist temples, gardens, imperial palaces, Shinto shrines, and traditional wooden houses.
* **Top Attractions**: Fushimi Inari Shrine (thousands of vermilion torii gates), Kinkaku-ji (Golden Pavilion), and the Arashiyama Bamboo Grove.
* **Culture**: Spot geishas in the historic **Gion** district and participate in a traditional tea ceremony.
* **Best Time**: Spring (late March to April) for Cherry Blossoms (*Sakura*), or Autumn (November) for vibrant maple leaves.`;
  }
  if (destinations.includes("Bali")) {
    return `### 🌴 Bali: The Island of the Gods
Bali offers spectacular volcanic mountains, iconic rice paddies, sandy beaches, and a rich spiritual culture.
* **Regions**:
  * *Ubud*: The cultural heart, famous for yoga retreats, rice terraces, and art markets.
  * *Seminyak & Canggu*: Hip beach towns filled with cafes, beach clubs, and surfing.
  * *Uluwatu*: Dramatic sea cliffs and temple overlooking the Indian Ocean.
* **💡 Pro Tip**: Rent a scooter to beat the heavy traffic in Ubud and Seminyak, but drive with absolute caution!`;
  }
  if (destinations.includes("Rome")) {
    return `### 🏛️ Rome: The Eternal City
Rome is a living museum, where nearly 3,000 years of globally influential art, architecture, and culture are on display.
* **Top Sights**: The Colosseum, Roman Forum, Pantheon, Trevi Fountain, and Vatican City (St. Peter's Basilica & Sistine Chapel).
* **Food**: Taste authentic Roman pastas: Carbonara, Cacio e Pepe, and Amatriciana.
* **💡 Pro Tip**: Carry a reusable water bottle! Rome has hundreds of public fountains (*Nasoni*) serving fresh, cold, drinkable spring water.`;
  }

  // TOPICS SPECIFICS (if no destination matched)
  if (topics.length > 0) {
    let response = `### 🗺️ Travel Information: ${topics.join(" & ")}\n\n`;
    
    if (topics.includes("Beaches & Coastal activities")) {
      response += `**🌊 Coastal & Beach Travel Advice:**
* **Safety First**: Check local swimming advisories. Never enter the sea after dark or during high tides.
* **Timing**: The best time for beach vacations in India is from October to April. Summers get extremely hot, and monsoon shuts down all activities.
* **Eco Travel**: Please avoid carrying single-use plastics to the shore, and respect turtle nesting sites (especially in South Goa and Gokarna).\n\n`;
    }
    if (topics.includes("Historical Heritage & Culture")) {
      response += `**🏛️ Heritage & Cultural Tourism:**
* **Dress Code**: Dress modestly when visiting active temples, mosques, or churches. Keep shoulders and knees covered.
* **Footwear**: You will need to remove shoes at the entrance of almost all religious sites. Consider wearing slip-on footwear.
* **Local Guides**: Consider hiring government-approved guides. Their stories and details breathe life into old stones and ruins.\n\n`;
    }
    if (topics.includes("Local Cuisine & Dining")) {
      response += `**🍛 Food & Culinary Tips:**
* **Street Food**: Go to vendors with long queues of locals—this ensures the food is fresh and rotated quickly. Drink bottled water only.
* **Dietary Preferences**: In India, check for green symbols (vegetarian) or red symbols (non-vegetarian) on packaged food and restaurant menus.
* **Spiciness**: If you have a low spice tolerance, always ask the waiter for "less spicy" (*kam tikha*).\n\n`;
    }
    if (topics.includes("Accommodations & Stays")) {
      response += `**🏨 Booking Accommodations:**
* **Verify Reviews**: Check reviews on multiple platforms (TripAdvisor, Google Maps) before booking. Look out for comments on Wi-Fi stability and hot water.
* **Location Strategy**: Book a stay central to the attractions you want to see. Spending less on hotels but more on cabs will blow your budget.
* **Homestays**: For a richer cultural experience, prefer local homestays. You'll enjoy home-cooked food and great local tips.\n\n`;
    }
    if (topics.includes("Packing Essentials & Gear")) {
      response += `**🎒 Packing Guidelines:**
* **Essentials**: Always have a power bank, a universal adapter, a light rain jacket, and comfortable walking shoes.
* **First Aid**: Carry basic medications for fever, cold, stomach upset, band-aids, and ORS hydration packets.
* **Eco-Friendly**: Bring a reusable bottle and canvas tote bags to reduce plastic waste during shopping.\n\n`;
    }
    if (topics.includes("Weather & Best Time to Visit")) {
      response += `**☀️ Weather & Seasonal Planning:**
* **Peak Season**: Usually corresponds to dry, cool winter months (October to February). Expect higher prices and crowded attractions.
* **Monsoon**: Great for nature lovers, waterfalls, and budget seekers, but travel can be delayed by landslides or flooding.
* **Summer**: Ideal for high-altitude hill stations (like Shimla, Ooty, Darjeeling) but coastal/plains areas will be uncomfortably humid.\n\n`;
    }
    if (topics.includes("Transport, Route & Getting There")) {
      response += `**🚗 Transport & Navigation:**
* **Navigation**: Download offline Google Maps for your destination as network connectivity can drop in remote forest or hill areas.
* **App Cabs**: In major cities (like Bangalore), use Ola, Uber, or Rapido for transparent, upfront pricing.
* **Public Transit**: Metro trains and local buses are highly economical and beat heavy peak-hour city traffic.\n\n`;
    }
    if (topics.includes("Budget Planning & Costs")) {
      response += `**💰 Budget & Financial Tips:**
* **Cash is King**: While digital payments (UPI) are widespread in India, carry some cash for remote areas, toll booths, and small street vendors.
* **Tracking**: Use apps like *Splitwise* or *Trabee Pocket* to log daily expenses and stay within budget.
* **Negotiation**: Bargaining is normal in local street markets, but keep it polite and respectful.\n\n`;
    }
    if (topics.includes("Adventure, Trekking & Nature")) {
      response += `**🥾 Adventure & Nature Activities:**
* **Permissions**: Some treks (like Mullayanagiri or Kudremukh) require forest department permissions or online booking beforehand.
* **Guides**: Never trek alone on unfamiliar forest trails. Leeches can be a major issue during or immediately after the monsoons—carry salt or anti-leech socks.
* **Leave No Trace**: Bring all plastic wraps, bottles, and snack packets back with you to keep trails pristine.\n\n`;
    }

    response += `*💡 Hope this helps! If you want information on a specific location (e.g., Goa, Hampi, Mysore, Kyoto), just mention its name in your question!*`;
    return response;
  }

  // 3. Fallback: Parse query and construct a personalized search acknowledgement
  // Try to find a reasonable noun phrase or keyword from the question to personalize the greeting
  let subject = "your query";
  const cleanedQ = question.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
  const words = cleanedQ.split(/\s+/);
  
  // Find a meaningful noun/word (length > 4, ignoring common words)
  const stopwords = ["about", "would", "could", "should", "there", "their", "where", "please", "thanks", "thank", "hello", "hi", "hey", "travel", "planner", "planning", "guide", "visit", "place", "places", "spots", "destination", "destinations"];
  const interestingWords = words.filter(w => w.length > 4 && !stopwords.includes(w.toLowerCase()));
  
  if (interestingWords.length > 0) {
    subject = `"${interestingWords.slice(0, 3).join(" ")}"`;
  }

  return `### 🗺️ Helpful Travel Assistant

I received your question regarding **${subject}**. 

To provide the most detailed and custom itinerary, could you let me know:
1. **Which destination** you are planning to visit? (e.g., *Goa, Hampi, Mysore, Gokarna, Kyoto, Paris*)
2. **How many days** your trip will be?
3. **What travel style** you prefer? (e.g., *Adventure, Relaxation, Heritage, Food tour, Budget, Luxury*)

---

#### 💡 Essential Travel Quick Tips:
* **Advance Booking**: Reserve flights and popular resorts at least 3-4 weeks in advance to secure the best rates.
* **Local Festivals**: Check if your trip aligns with local holidays or major cultural events, which might affect opening hours and crowd sizes.
* **Safety & Connectivity**: Always keep offline maps downloaded on your phone, and carry a power bank.

*Tell me more about your specific plans, and I'll generate a personalized guide for you!*`;
}
