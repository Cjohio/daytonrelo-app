// ─── Global search index ───────────────────────────────────────────────────────
// Every page, tool, neighborhood, restaurant, and school is searchable here.

export type SearchCategory = "Hub" | "Tool" | "Tab" | "Neighborhood" | "Food" | "School" | "Park";

export interface SearchItem {
  id:       string;
  title:    string;
  subtitle: string;
  category: SearchCategory;
  icon:     string;
  route:    string;
  keywords: string[];
}

export const SEARCH_ITEMS: SearchItem[] = [
  // ── Hubs ─────────────────────────────────────────────────────────────────────
  {
    id: "military-hub", title: "Military Hub", subtitle: "PCS · VA loans · WPAFB resources",
    category: "Hub", icon: "shield-checkmark-outline", route: "/military-hub",
    keywords: ["military", "pcs", "va", "wpafb", "air force", "veteran", "base"],
  },
  {
    id: "relocation", title: "Job Relocation Hub", subtitle: "Corporate move resources",
    category: "Hub", icon: "briefcase-outline", route: "/relocation",
    keywords: ["job", "corporate", "relocation", "work", "employer", "company"],
  },
  {
    id: "discover", title: "Discover Dayton", subtitle: "Explore the city",
    category: "Hub", icon: "compass-outline", route: "/discover",
    keywords: ["discover", "explore", "dayton", "things to do", "about"],
  },

  // ── Tools ─────────────────────────────────────────────────────────────────────
  {
    id: "mortgage-calculator", title: "Mortgage Calculator", subtitle: "Affordability + payment breakdown",
    category: "Tool", icon: "home-outline", route: "/mortgage-calculator",
    keywords: ["mortgage", "payment", "afford", "loan", "calculator", "pmi", "interest", "home price", "down payment"],
  },
  {
    id: "bah-calculator", title: "BAH Calculator", subtitle: "Housing allowance by pay grade",
    category: "Tool", icon: "calculator-outline", route: "/bah-calculator",
    keywords: ["bah", "housing allowance", "military pay", "basic allowance", "pay grade"],
  },
  {
    id: "rent-vs-buy", title: "Rent vs. Buy Calculator", subtitle: "Is buying right for you?",
    category: "Tool", icon: "swap-horizontal-outline", route: "/rent-vs-buy",
    keywords: ["rent", "buy", "renting", "buying", "compare", "calculator"],
  },
  {
    id: "cost-of-living", title: "Cost of Living Comparison", subtitle: "Compare Dayton to your city",
    category: "Tool", icon: "swap-horizontal-outline", route: "/cost-of-living",
    keywords: ["cost of living", "col", "compare", "expenses", "affordable", "salary"],
  },
  {
    id: "neighborhood-quiz", title: "Neighborhood Quiz", subtitle: "Find your perfect Dayton neighborhood",
    category: "Tool", icon: "map-outline", route: "/neighborhood-quiz",
    keywords: ["quiz", "neighborhood", "match", "best area", "recommend", "which neighborhood"],
  },
  {
    id: "schools", title: "School Guide", subtitle: "Public, private, Montessori & Catholic schools",
    category: "Tool", icon: "school-outline", route: "/schools",
    keywords: ["school", "schools", "education", "district", "montessori", "catholic", "christian", "private", "kids", "children", "grades"],
  },
  {
    id: "parks", title: "Parks & Recreation", subtitle: "MetroParks + city parks with amenities",
    category: "Tool", icon: "leaf-outline", route: "/parks",
    keywords: ["park", "parks", "playground", "trails", "pickleball", "tennis", "splash pad", "fishing", "disc golf", "recreation", "outdoor", "metroparks", "five rivers"],
  },
  // ── Parks ─────────────────────────────────────────────────────────────────────
  {
    id: "riverscape", title: "RiverScape MetroPark", subtitle: "Splash pad · Ice skating · Downtown Dayton",
    category: "Park", icon: "water-outline", route: "/parks",
    keywords: ["riverscape", "splash pad", "ice skating", "dayton", "downtown", "river"],
  },
  {
    id: "eastwood", title: "Eastwood MetroPark", subtitle: "Lake · Disc golf · Dog park · Dayton",
    category: "Park", icon: "leaf-outline", route: "/parks",
    keywords: ["eastwood", "lake", "disc golf", "dog park", "fishing"],
  },
  {
    id: "caesar-creek", title: "Caesar Creek State Park", subtitle: "Swimming · Camping · Waynesville",
    category: "Park", icon: "bonfire-outline", route: "/parks",
    keywords: ["caesar creek", "camping", "swimming", "lake", "fossils", "waynesville"],
  },
  {
    id: "delco-park", title: "Delco Park", subtitle: "Pickleball · Splash pad · Tennis · Kettering",
    category: "Park", icon: "tennisball-outline", route: "/parks",
    keywords: ["delco", "kettering", "pickleball", "splash pad", "tennis", "playground"],
  },
  {
    id: "rotary-park", title: "Rotary Park", subtitle: "Splash pad · Pickleball · Beavercreek",
    category: "Park", icon: "happy-outline", route: "/parks",
    keywords: ["rotary", "beavercreek", "splash pad", "pickleball", "playground"],
  },
  {
    id: "carriage-hill", title: "Carriage Hill MetroPark", subtitle: "Working farm · Trails · Huber Heights",
    category: "Park", icon: "leaf-outline", route: "/parks",
    keywords: ["carriage hill", "farm", "trails", "sledding", "huber heights"],
  },
  {
    id: "first-30-days", title: "First 30 Days Checklist", subtitle: "Your move-in to-do list",
    category: "Tool", icon: "checkbox-outline", route: "/first-30-days",
    keywords: ["checklist", "moving", "first 30 days", "todo", "move in", "setup", "dmv", "utilities", "in-processing"],
  },
  {
    id: "employer-map", title: "Employer Map", subtitle: "Commute times from top employers",
    category: "Tool", icon: "business-outline", route: "/employer-map",
    keywords: ["employer", "commute", "jobs", "work", "map", "l3harris", "kettering health", "wpafb"],
  },
  {
    id: "va-lender", title: "VA Lender", subtitle: "Preferred VA loan specialist",
    category: "Tool", icon: "business-outline", route: "/va-lender",
    keywords: ["va lender", "va loan", "lender", "mortgage", "veteran", "0 down"],
  },
  {
    id: "military-va", title: "Military & VA Guide", subtitle: "VA loan eligibility and resources",
    category: "Tool", icon: "shield-checkmark-outline", route: "/military",
    keywords: ["va guide", "eligibility", "entitlement", "military guide"],
  },

  // ── Tabs ─────────────────────────────────────────────────────────────────────
  {
    id: "neighborhoods", title: "Neighborhoods", subtitle: "Browse all Dayton neighborhoods",
    category: "Tab", icon: "location-outline", route: "/(tabs)/explore",
    keywords: ["neighborhoods", "explore", "areas", "suburbs", "browse"],
  },
  {
    id: "tools-tab", title: "All Tools", subtitle: "Full relocation toolkit",
    category: "Tab", icon: "apps-outline", route: "/(tabs)/tools",
    keywords: ["tools", "resources", "calculators", "all tools"],
  },
  {
    id: "eats", title: "Dayton Eats Guide", subtitle: "Staples + Best of Dayton restaurants",
    category: "Tab", icon: "restaurant-outline", route: "/(tabs)/eats",
    keywords: ["food", "restaurants", "eat", "dining", "dayton eats", "bars"],
  },
  {
    id: "chat", title: "DaytonBot Chat", subtitle: "Ask AI anything about Dayton",
    category: "Tab", icon: "chatbubble-ellipses-outline", route: "/(tabs)/chat",
    keywords: ["chat", "bot", "ai", "ask", "question", "daytonbot", "assistant"],
  },
  {
    id: "contact", title: "Contact Chris", subtitle: "Reach your agent directly",
    category: "Tab", icon: "person-outline", route: "/(tabs)/contact",
    keywords: ["contact", "chris", "agent", "realtor", "call", "email", "message", "reach"],
  },

  // ── Neighborhoods ─────────────────────────────────────────────────────────────
  {
    id: "beavercreek", title: "Beavercreek", subtitle: "10 min to WPAFB · Schools: A",
    category: "Neighborhood", icon: "location", route: "/(tabs)/explore",
    keywords: ["beavercreek", "beaver creek"],
  },
  {
    id: "kettering", title: "Kettering", subtitle: "22 min to WPAFB · Schools: A-",
    category: "Neighborhood", icon: "location", route: "/(tabs)/explore",
    keywords: ["kettering"],
  },
  {
    id: "oakwood", title: "Oakwood", subtitle: "35 min to WPAFB · Schools: A+",
    category: "Neighborhood", icon: "location", route: "/(tabs)/explore",
    keywords: ["oakwood", "prestigious"],
  },
  {
    id: "centerville", title: "Centerville", subtitle: "30 min to WPAFB · Schools: A+",
    category: "Neighborhood", icon: "location", route: "/(tabs)/explore",
    keywords: ["centerville"],
  },
  {
    id: "fairborn", title: "Fairborn", subtitle: "3 min to WPAFB · Schools: B",
    category: "Neighborhood", icon: "location", route: "/(tabs)/explore",
    keywords: ["fairborn", "close to base"],
  },
  {
    id: "springboro", title: "Springboro", subtitle: "40 min to WPAFB · Schools: A",
    category: "Neighborhood", icon: "location", route: "/(tabs)/explore",
    keywords: ["springboro"],
  },
  {
    id: "huber-heights", title: "Huber Heights", subtitle: "13 min to WPAFB · Schools: B-",
    category: "Neighborhood", icon: "location", route: "/(tabs)/explore",
    keywords: ["huber heights", "huber"],
  },
  {
    id: "riverside", title: "Riverside", subtitle: "5 min to WPAFB · Schools: B",
    category: "Neighborhood", icon: "location", route: "/(tabs)/explore",
    keywords: ["riverside"],
  },
  {
    id: "miamisburg", title: "Miamisburg", subtitle: "25 min to WPAFB · Schools: B+",
    category: "Neighborhood", icon: "location", route: "/(tabs)/explore",
    keywords: ["miamisburg"],
  },
  {
    id: "tipp-city", title: "Tipp City", subtitle: "30 min to WPAFB · Schools: A-",
    category: "Neighborhood", icon: "location", route: "/(tabs)/explore",
    keywords: ["tipp city", "tipp"],
  },

  // ── Food ─────────────────────────────────────────────────────────────────────
  {
    id: "pine-club", title: "The Pine Club", subtitle: "Legendary steakhouse · Since 1947",
    category: "Food", icon: "restaurant-outline", route: "/(tabs)/eats",
    keywords: ["pine club", "steak", "steakhouse", "cash only", "no reservations"],
  },
  {
    id: "marions", title: "Marion's Piazza", subtitle: "Dayton's best pizza · Since 1965",
    category: "Food", icon: "restaurant-outline", route: "/(tabs)/eats",
    keywords: ["marions", "marion's", "pizza", "piazza"],
  },
  {
    id: "slyders", title: "Slyder's Tavern", subtitle: "Best burgers in Dayton · Since 1948",
    category: "Food", icon: "restaurant-outline", route: "/(tabs)/eats",
    keywords: ["slyders", "slyder's", "burgers", "wings", "tavern"],
  },
  {
    id: "salar", title: "Salar Restaurant", subtitle: "Peruvian/Mediterranean · Oregon District",
    category: "Food", icon: "restaurant-outline", route: "/(tabs)/eats",
    keywords: ["salar", "peruvian", "mediterranean", "ceviche", "pisco", "oregon district"],
  },
  {
    id: "wheat-penny", title: "Wheat Penny Oven & Bar", subtitle: "Wood-fired pizza · South Park",
    category: "Food", icon: "restaurant-outline", route: "/(tabs)/eats",
    keywords: ["wheat penny", "wood fired", "pizza", "artisan"],
  },
  {
    id: "jays-seafood-search", title: "Jay's Seafood", subtitle: "Premier seafood · Oregon District",
    category: "Food", icon: "restaurant-outline", route: "/(tabs)/eats",
    keywords: ["jay's", "seafood", "fish", "oregon district"],
  },

  // ── Schools ───────────────────────────────────────────────────────────────────
  {
    id: "s-beavercreek", title: "Beavercreek City Schools", subtitle: "Public · Grades PreK–12 · Rating: A",
    category: "School", icon: "school-outline", route: "/schools",
    keywords: ["beavercreek schools", "beavercreek district", "public school"],
  },
  {
    id: "s-centerville", title: "Centerville City Schools", subtitle: "Public · Grades PreK–12 · Rating: A+",
    category: "School", icon: "school-outline", route: "/schools",
    keywords: ["centerville schools", "centerville district"],
  },
  {
    id: "s-oakwood", title: "Oakwood City Schools", subtitle: "Public · Grades PreK–12 · Rating: A+",
    category: "School", icon: "school-outline", route: "/schools",
    keywords: ["oakwood schools", "oakwood district"],
  },
  {
    id: "s-cj", title: "Chaminade Julienne", subtitle: "Catholic · Grades 9–12 · Dayton",
    category: "School", icon: "school-outline", route: "/schools",
    keywords: ["chaminade", "julienne", "cj", "catholic high school"],
  },
  {
    id: "s-alter", title: "Archbishop Alter", subtitle: "Catholic · Grades 9–12 · Kettering",
    category: "School", icon: "school-outline", route: "/schools",
    keywords: ["alter", "archbishop alter", "catholic", "kettering"],
  },
  {
    id: "s-montessori", title: "Montessori School of Dayton", subtitle: "Montessori · Grades PreK–8",
    category: "School", icon: "school-outline", route: "/schools",
    keywords: ["montessori", "montessori school", "dayton montessori"],
  },
];

// ── Category display config ───────────────────────────────────────────────────
export const CATEGORY_CONFIG: Record<SearchCategory, { label: string; icon: string }> = {
  Hub:          { label: "Hubs",           icon: "grid-outline" },
  Tool:         { label: "Tools",          icon: "apps-outline" },
  Tab:          { label: "Navigation",     icon: "navigate-outline" },
  Neighborhood: { label: "Neighborhoods",  icon: "location-outline" },
  Food:         { label: "Food & Dining",  icon: "restaurant-outline" },
  School:       { label: "Schools",        icon: "school-outline" },
  Park:         { label: "Parks",          icon: "leaf-outline" },
};

export const CATEGORY_ORDER: SearchCategory[] = ["Hub", "Tool", "Tab", "Neighborhood", "Food", "School", "Park"];

export const POPULAR_IDS = ["mortgage-calculator", "schools", "parks", "first-30-days", "eats", "neighborhoods", "contact"];
