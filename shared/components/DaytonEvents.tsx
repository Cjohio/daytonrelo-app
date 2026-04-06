/**
 * DaytonEvents — rotating event carousel for hub screens.
 * Fetches live from Supabase `events` table; falls back to static data.
 * "See All" routes to the full /dayton-events screen.
 */
import { useRef, useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, Dimensions, Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "../theme/colors";
import { supabase } from "../../lib/supabase";

const SCREEN_W = Dimensions.get("window").width;
const CARD_W   = SCREEN_W - 40; // full width minus horizontal padding

// ─── Event data ───────────────────────────────────────────────────────────────
export interface DaytonEvent {
  id:       string;
  title:    string;
  date:     string;       // display string, e.g. "May 3 – Sep 27"
  month:    string;       // short month for badge, e.g. "MAY"
  day:      string;       // day number or range, e.g. "3"
  venue:    string;
  category: "music" | "festival" | "sports" | "arts" | "family" | "food";
  isFree:   boolean;
  price?:   string;
  desc:     string;
  url:      string;
}

export const EVENTS: DaytonEvent[] = [
  // ── April ────────────────────────────────────────────────────────────────
  {
    id: "bob-dylan-2026",
    title: "Bob Dylan",
    date: "Apr 12, 2026",
    month: "APR", day: "12",
    venue: "Schuster Center, Downtown Dayton",
    category: "music", isFree: false, price: "$60–$150",
    desc: "A living legend on tour. Bob Dylan at the Schuster Center — one of those nights you'll talk about forever.",
    url: "https://www.daytonlive.org",
  },
  {
    id: "wgi-2026",
    title: "WGI World Championships",
    date: "Apr 15–18, 2026",
    month: "APR", day: "15",
    venue: "UD Arena & Nutter Center, Dayton",
    category: "arts", isFree: false, price: "$20–$80",
    desc: "The Super Bowl of indoor percussion and color guard. 30,000+ fans watch the world's best performing ensembles compete — Dayton hosts this every year.",
    url: "https://www.wgi.org",
  },
  {
    id: "eastern-europe-fest",
    title: "Eastern Europe Festival",
    date: "Apr 18, 2026",
    month: "APR", day: "18",
    venue: "Dayton Art Institute",
    category: "festival", isFree: true,
    desc: "Celebrate Eastern European food, folk dance, music, and cultural traditions from Polish, Ukrainian, Hungarian, and Czech communities. Free admission.",
    url: "https://www.daytonartinstitute.org",
  },
  {
    id: "sugar-maple-2026",
    title: "Bellbrook Sugar Maple Festival",
    date: "Apr 24–26, 2026",
    month: "APR", day: "24",
    venue: "Downtown Bellbrook",
    category: "festival", isFree: true,
    desc: "One of the Miami Valley's most beloved spring festivals — maple syrup demos, arts & crafts, food, live music, and carnival rides in charming downtown Bellbrook.",
    url: "https://bellbrooksugarmaplefestival.com",
  },
  {
    id: "alice-cooper-2026",
    title: "Alice Cooper",
    date: "Apr 25, 2026",
    month: "APR", day: "25",
    venue: "Rose Music Center, Huber Heights",
    category: "music", isFree: false, price: "$45–$95",
    desc: "The godfather of shock rock brings his full theatrical live show to the Rose Music Center. An unforgettable night of classic rock spectacle.",
    url: "https://rosemusiccenter.com",
  },
  {
    id: "dragons-2026",
    title: "Dayton Dragons Baseball",
    date: "Apr 7 – Sep 6, 2026",
    month: "APR", day: "7",
    venue: "Day Air Ballpark, Downtown Dayton",
    category: "sports", isFree: false, price: "$9–$16",
    desc: "Dayton's beloved Single-A Reds affiliate. Perennial sellout crowds, Fireworks Fridays, theme nights, and the best family entertainment deal in town.",
    url: "https://www.milb.com/dayton",
  },
  // ── May ──────────────────────────────────────────────────────────────────
  {
    id: "brit-floyd-2026",
    title: "Brit Floyd — Wish You Were Here 50th Anniversary",
    date: "May 15, 2026",
    month: "MAY", day: "15",
    venue: "Rose Music Center, Huber Heights",
    category: "music", isFree: false, price: "$40–$85",
    desc: "The world's greatest Pink Floyd tribute celebrates the 50th anniversary of Wish You Were Here with a full production light show and note-perfect performance.",
    url: "https://rosemusiccenter.com",
  },
  {
    id: "third-day-2026",
    title: "Third Day — 30th Anniversary Tour",
    date: "May 7, 2026",
    month: "MAY", day: "7",
    venue: "Nutter Center, Fairborn",
    category: "music", isFree: false, price: "$35–$75",
    desc: "Grammy-winning Christian rock band Third Day reunites for their 30th anniversary tour. An emotional and powerful night for longtime fans.",
    url: "https://www.nuttercenter.com",
  },
  {
    id: "george-thorogood-2026",
    title: "George Thorogood & The Destroyers",
    date: "May 22, 2026",
    month: "MAY", day: "22",
    venue: "Rose Music Center, Huber Heights",
    category: "music", isFree: false, price: "$35–$70",
    desc: "The legendary blues-rock outfit brings Who Do You Love and Bad to the Bone to the outdoor amphitheater. Pure American rock and roll.",
    url: "https://rosemusiccenter.com",
  },
  {
    id: "levitt-2026",
    title: "Levitt Pavilion Free Concert Series",
    date: "May – Sep 2026 (Fri & Sat nights)",
    month: "MAY", day: "1",
    venue: "Levitt Pavilion, West Carrollton",
    category: "music", isFree: true,
    desc: "50+ free outdoor concerts every summer on the riverfront stage. National touring acts and local legends — no tickets, no cover, just show up.",
    url: "https://levittdayton.org",
  },
  {
    id: "hamvention-2026",
    title: "Dayton Hamvention",
    date: "May 15–17, 2026",
    month: "MAY", day: "15",
    venue: "Greene County Expo Center, Xenia",
    category: "festival", isFree: false, price: "$30 (3-day pass)",
    desc: "The world's largest amateur radio event — 30,000+ attendees, massive flea market, tech exhibits, and awards. A Dayton tradition since 1952.",
    url: "https://hamvention.org",
  },
  {
    id: "miamisburg-spring-fest",
    title: "Miamisburg Spring Fest",
    date: "May 15–17, 2026",
    month: "MAY", day: "15",
    venue: "Riverfront Park, Miamisburg",
    category: "festival", isFree: true,
    desc: "Three days of local art, live music, food trucks, and carnival rides on the banks of the Great Miami River — a feel-good community kickoff to summer.",
    url: "https://www.miamisburg.org",
  },
  {
    id: "oregon-district-arts",
    title: "Oregon District Arts Festival",
    date: "May 16–17, 2026",
    month: "MAY", day: "16",
    venue: "Oregon District, Dayton",
    category: "arts", isFree: true,
    desc: "200+ artists fill Dayton's most vibrant neighborhood with fine art, crafts, and live music — plus the best restaurant strip in the city right outside.",
    url: "https://theoregondistrict.org",
  },
  {
    id: "jewish-cultural-fest",
    title: "Temple Israel Jewish Cultural Festival",
    date: "May 31, 2026",
    month: "MAY", day: "31",
    venue: "Temple Israel, Dayton",
    category: "festival", isFree: true,
    desc: "A welcoming community celebration of Jewish history and culture — food, music, dancing, games, and educational exhibits. Open and free to all.",
    url: "https://www.tioh.org",
  },
  // ── June ─────────────────────────────────────────────────────────────────
  {
    id: "warrant-fraze-2026",
    title: "Warrant, Firehouse & BulletBoys",
    date: "Jun 12, 2026",
    month: "JUN", day: "12",
    venue: "Fraze Pavilion, Kettering",
    category: "music", isFree: false, price: "$30–$60",
    desc: "Three iconic hair metal bands on one stage — Cherry Pie, I Live My Life for You, and Smooth Up In Ya. The ultimate 80s rock nostalgia night.",
    url: "https://fraze.com",
  },
  {
    id: "lynyrd-skynyrd-2026",
    title: "Lynyrd Skynyrd",
    date: "Jun 15, 2026",
    month: "JUN", day: "15",
    venue: "Rose Music Center, Huber Heights",
    category: "music", isFree: false, price: "$45–$100",
    desc: "Sweet Home Alabama. Free Bird. Simple Man. Southern rock royalty brings the classics to the outdoor amphitheater on a summer night.",
    url: "https://rosemusiccenter.com",
  },
  {
    id: "pride-2026",
    title: "Dayton Pride Festival",
    date: "Jun 5–6, 2026",
    month: "JUN", day: "5",
    venue: "Downtown Dayton",
    category: "festival", isFree: true,
    desc: "Dayton's annual Pride celebration with a parade, live entertainment, food, and vendors in the heart of downtown. A beloved community tradition.",
    url: "https://daytonpride.com",
  },
  {
    id: "st-helen-fest",
    title: "St. Helen Spring Festival",
    date: "Jun 5–7, 2026",
    month: "JUN", day: "5",
    venue: "St. Helen Parish, Dayton",
    category: "family", isFree: false, price: "Free entry · rides & food sold",
    desc: "A classic Dayton parish festival with carnival rides, fair food, bingo, kids' games, flea market, and a beer garden. A neighborhood summer staple.",
    url: "https://www.sthelenfestival.org",
  },
  {
    id: "air-show-2026",
    title: "Dayton Air Show — U.S. Navy Blue Angels",
    date: "Jun 13–14, 2026",
    month: "JUN", day: "13",
    venue: "Dayton International Airport",
    category: "family", isFree: false, price: "$30–$60",
    desc: "The 2026 headliner is the U.S. Navy Blue Angels. One of the nation's top air shows with WWII aircraft, aerobatics, and military flight demos. A true bucket list event.",
    url: "https://www.daytonairshow.com",
  },
  {
    id: "ys-street-fair-summer",
    title: "Yellow Springs Street Fair",
    date: "Jun 14, 2026",
    month: "JUN", day: "14",
    venue: "Xenia Ave, Yellow Springs",
    category: "arts", isFree: true,
    desc: "Hundreds of artisan vendors, food, and live music in Dave Chappelle's quirky, eclectic hometown — 25 minutes from Dayton and one of the best day trips around.",
    url: "https://www.yellowspringsohio.org/street-fair",
  },
  {
    id: "fraze-summer",
    title: "Fraze Pavilion Concert Series",
    date: "Jun – Aug 2026",
    month: "JUN", day: "5",
    venue: "Fraze Pavilion, Kettering",
    category: "music", isFree: false, price: "$20–$75",
    desc: "Beautiful outdoor amphitheater in Kettering with national touring headliners all summer. Lawn tickets are great value — bring blankets and chairs.",
    url: "https://fraze.com",
  },
  {
    id: "kettering-sundays",
    title: "Music Under the Stars — Kettering",
    date: "Jun – Aug 2026 (Sunday evenings)",
    month: "JUN", day: "7",
    venue: "Fraze Pavilion Lawn, Kettering",
    category: "music", isFree: true,
    desc: "Free Sunday evening concerts on the Fraze Pavilion lawn all summer long. Bring a blanket, grab food from the trucks, and enjoy the evening.",
    url: "https://www.ketteringoh.org/parks",
  },
  // ── July ─────────────────────────────────────────────────────────────────
  {
    id: "moulin-rouge-2026",
    title: "Moulin Rouge! The Musical (Broadway)",
    date: "Jul 22–26, 2026",
    month: "JUL", day: "22",
    venue: "Schuster Center, Downtown Dayton",
    category: "arts", isFree: false, price: "$50–$150",
    desc: "The dazzling Broadway hit comes to Dayton for a 5-night run. Spectacular costumes, iconic songs remixed, and a breathtaking love story. Don't miss it.",
    url: "https://www.daytonlive.org",
  },
  {
    id: "pop2000-fraze",
    title: "Pop 2000 Tour — *NSYNC, O-Town, BBMak & More",
    date: "Jul 10, 2026",
    month: "JUL", day: "10",
    venue: "Fraze Pavilion, Kettering",
    category: "music", isFree: false, price: "$30–$55",
    desc: "Chris Kirkpatrick of *NSYNC, O-Town, BBMak, Ryan Cabrera, and LFO bring the best of early 2000s pop to a warm Kettering summer night.",
    url: "https://fraze.com",
  },
  {
    id: "parker-mccollum-nutter",
    title: "Parker McCollum with Gabby Barrett & Kassi Ashton",
    date: "Jul 25, 2026",
    month: "JUL", day: "25",
    venue: "Nutter Center, Fairborn",
    category: "music", isFree: false, price: "$35–$75",
    desc: "Rising country star Parker McCollum headlines with Gabby Barrett and Kassi Ashton. A great outdoor country night just minutes from WPAFB.",
    url: "https://www.nuttercenter.com",
  },
  {
    id: "americana-fest",
    title: "Centerville Americana Festival",
    date: "Jul 4, 2026",
    month: "JUL", day: "4",
    venue: "Downtown Centerville",
    category: "family", isFree: true,
    desc: "Ohio's largest single-day Fourth of July celebration — 85,000 attendees, 5K run, parade, classic car show, street fair, and live entertainment all day long.",
    url: "https://www.centervilleamericana.org",
  },
  {
    id: "montgomery-fair",
    title: "Montgomery County Fair",
    date: "Jul 12–18, 2026",
    month: "JUL", day: "12",
    venue: "Montgomery County Fairgrounds, Dayton",
    category: "family", isFree: false, price: "$5–$10",
    desc: "Full week county fair with carnival rides, 4H exhibits, livestock shows, demolition derby, grandstand concerts, and all the fried fair food you can eat.",
    url: "https://www.montcofair.com",
  },
  {
    id: "miamisburg-mound",
    title: "Miamisburg Mound Festival",
    date: "Jul 10–12, 2026",
    month: "JUL", day: "10",
    venue: "Mound Park, Miamisburg",
    category: "festival", isFree: true,
    desc: "Annual celebration at one of the largest Adena mounds in Ohio — carnival rides, live music, food vendors, and fireworks. Free to attend.",
    url: "https://www.miamisburg.org",
  },
  {
    id: "celtic-fest",
    title: "Dayton Celtic Festival",
    date: "Jul 24–26, 2026",
    month: "JUL", day: "24",
    venue: "Riverscape, Downtown Dayton",
    category: "festival", isFree: true,
    desc: "Three days of Irish and Scottish culture on the riverfront — live Celtic music, highland games, traditional food, whiskey tastings, and clan tents.",
    url: "https://daytonceltfest.com",
  },
  {
    id: "brewfest-2026",
    title: "Dayton Craft Beer Fest",
    date: "Jul 18, 2026",
    month: "JUL", day: "18",
    venue: "Fifth Street Brewpub District",
    category: "food", isFree: false, price: "$35–$55",
    desc: "Sample 100+ craft beers from 30+ local breweries. Dayton has more craft breweries per capita than almost anywhere in the Midwest — this is the best way to prove it.",
    url: "https://www.visitdayton.com",
  },
  // ── August ───────────────────────────────────────────────────────────────
  {
    id: "for-king-country-fraze",
    title: "for KING + COUNTRY — World On Fire Tour",
    date: "Aug 5, 2026",
    month: "AUG", day: "5",
    venue: "Fraze Pavilion, Kettering",
    category: "music", isFree: false, price: "$30–$65",
    desc: "Australian Christian pop duo brings their massive World On Fire production to Fraze Pavilion — known for one of the most spectacular live shows in music today.",
    url: "https://fraze.com",
  },
  {
    id: "goo-goo-dolls-rose",
    title: "Goo Goo Dolls with Neon Trees",
    date: "Aug 12, 2026",
    month: "AUG", day: "12",
    venue: "Rose Music Center, Huber Heights",
    category: "music", isFree: false, price: "$35–$75",
    desc: "Iris. Slide. Broadway. The Goo Goo Dolls bring their biggest hits to the outdoor amphitheater with Neon Trees opening. A perfect summer night.",
    url: "https://rosemusiccenter.com",
  },
  {
    id: "get-led-out-fraze",
    title: "Get The Led Out — Led Zeppelin Tribute",
    date: "Aug 12, 2026",
    month: "AUG", day: "12",
    venue: "Fraze Pavilion, Kettering",
    category: "music", isFree: false, price: "$25–$50",
    desc: "The most celebrated Led Zeppelin tribute in the country brings a full-production show including Kashmir, Whole Lotta Love, and Stairway to Heaven.",
    url: "https://fraze.com",
  },
  {
    id: "arena-rock-fraze",
    title: "That Arena Rock Show — 70s & 80s Rock Celebration",
    date: "Aug 21, 2026",
    month: "AUG", day: "21",
    venue: "Fraze Pavilion, Kettering",
    category: "music", isFree: false, price: "$20–$45",
    desc: "A massive celebration of the greatest era of rock — Journey, Foreigner, REO Speedwagon, and more performed live. Pure nostalgia under the summer sky.",
    url: "https://fraze.com",
  },
  {
    id: "greene-fair",
    title: "Greene County Fair",
    date: "Aug 2–8, 2026",
    month: "AUG", day: "2",
    venue: "Greene County Fairgrounds, Xenia",
    category: "family", isFree: false, price: "$5–$10",
    desc: "Full week county fair with rides, 4H, demolition derby, grandstand acts, livestock judging, and all the classic fair food you can dream of.",
    url: "https://www.greenecountyfair.org",
  },
  {
    id: "porchfest-2026",
    title: "Dayton Porchfest",
    date: "Aug 22, 2026",
    month: "AUG", day: "22",
    venue: "Oregon District porches, Dayton",
    category: "music", isFree: true,
    desc: "Dozens of local bands play simultaneously on front porches across the Oregon District. A beloved Dayton original — wander the neighborhood all afternoon.",
    url: "https://daytonporchfest.com",
  },
  // ── September ────────────────────────────────────────────────────────────
  {
    id: "beavercreek-popcorn",
    title: "Beavercreek Popcorn Festival",
    date: "Sep 11–13, 2026",
    month: "SEP", day: "11",
    venue: "Downtown Beavercreek",
    category: "festival", isFree: true,
    desc: "One of the region's most unique fall festivals — live entertainment, arts & crafts, food vendors, and endless varieties of popcorn. Free and family-friendly.",
    url: "https://www.beavercreekpopcornfestival.com",
  },
  {
    id: "oktoberfest-dai",
    title: "Dayton Art Institute Oktoberfest",
    date: "Sep 25–27, 2026",
    month: "SEP", day: "25",
    venue: "Dayton Art Institute",
    category: "food", isFree: false, price: "Free entry · food & beer sold",
    desc: "One of Ohio's premier Oktoberfest events — authentic German food, imported beers on the museum's stunning terrace, live oompah music, and stein-holding contests.",
    url: "https://www.daytonartinstitute.org/oktoberfest",
  },
  // ── October ──────────────────────────────────────────────────────────────
  {
    id: "the-notebook-schuster",
    title: "The Notebook — Broadway Musical",
    date: "Oct 6–11, 2026",
    month: "OCT", day: "6",
    venue: "Schuster Center, Downtown Dayton",
    category: "arts", isFree: false, price: "$45–$130",
    desc: "The beloved love story comes to life on the Schuster stage for a 6-night Broadway run. Beautiful music, stunning staging, and a story that will leave you in tears.",
    url: "https://www.daytonlive.org",
  },
  {
    id: "outdoor-experience",
    title: "Wagner Subaru Outdoor Experience",
    date: "Oct 3–4, 2026",
    month: "OCT", day: "3",
    venue: "Eastwood MetroPark, Dayton",
    category: "family", isFree: true,
    desc: "Free outdoor adventure festival at Eastwood MetroPark — kayaking demos, archery, rock climbing, nature hikes, live entertainment, and activities for all ages.",
    url: "https://www.metroparks.org",
  },
  {
    id: "springboro-pumpkin",
    title: "Springboro Pumpkin Show",
    date: "Oct 8–11, 2026",
    month: "OCT", day: "8",
    venue: "Historic Downtown Springboro",
    category: "family", isFree: true,
    desc: "One of the region's favorite fall festivals — pumpkins, hayrides, carnival rides, live music, and fall food in a charming downtown setting.",
    url: "https://springboropumpkinshow.com",
  },
  {
    id: "ys-street-fair-fall",
    title: "Yellow Springs Street Fair (Fall)",
    date: "Oct 11, 2026",
    month: "OCT", day: "11",
    venue: "Xenia Ave, Yellow Springs",
    category: "arts", isFree: true,
    desc: "The fall edition of Yellow Springs' beloved bi-annual street fair — artisan vendors, food, and live music with the colors of autumn as the perfect backdrop.",
    url: "https://www.yellowspringsohio.org/street-fair",
  },
  {
    id: "tipp-apple-butter",
    title: "Tipp City Apple Butter Festival",
    date: "Oct 17–18, 2026",
    month: "OCT", day: "17",
    venue: "Historic Downtown Tipp City",
    category: "festival", isFree: true,
    desc: "Beloved harvest festival in charming Tipp City — apple butter making demos, arts & crafts, live music, and fall treats on historic Main Street.",
    url: "https://tippcityapplebutterestival.com",
  },
  {
    id: "zombie-walk",
    title: "Oregon District Halloween Night",
    date: "Oct 24, 2026",
    month: "OCT", day: "24",
    venue: "Oregon District, Dayton",
    category: "festival", isFree: true,
    desc: "Thousands gather in the Oregon District for Dayton's wildly popular Halloween street event. Epic costumes, great bars, live music, and organized chaos.",
    url: "https://theoregondistrict.org",
  },
  // ── November / December ──────────────────────────────────────────────────
  {
    id: "woodland-lights",
    title: "Woodland Lights",
    date: "Nov 20 – Dec 30, 2026",
    month: "NOV", day: "20",
    venue: "Carriage Hill MetroPark, Huber Heights",
    category: "family", isFree: false, price: "$10–$20 per car",
    desc: "Drive through millions of lights at Carriage Hill MetroPark. One of the Miami Valley's most magical holiday traditions — perfect for the whole family.",
    url: "https://www.metroparks.org",
  },
  {
    id: "holiday-festival",
    title: "Dayton Holiday Festival",
    date: "Nov 27 – Dec 31, 2026",
    month: "NOV", day: "27",
    venue: "Courthouse Square & Downtown Dayton",
    category: "family", isFree: true,
    desc: "Month-long downtown celebration with nightly light shows on the courthouse, ice skating, live music, tree lighting ceremony, and holiday markets every weekend.",
    url: "https://www.downtowndayton.org/holiday-festival",
  },
  // ── Year-Round ────────────────────────────────────────────────────────────
  {
    id: "art-after-dark",
    title: "Dayton Art Institute: Art After Dark",
    date: "Monthly (2nd Fri of each month)",
    month: "MON", day: "2nd",
    venue: "Dayton Art Institute",
    category: "arts", isFree: false, price: "$10–$15",
    desc: "Monthly themed evening events at DAI — cocktails, live music, and full gallery access. Themes change every month. One of Dayton's best date nights.",
    url: "https://www.daytonartinstitute.org",
  },
];

// ─── Category colors ──────────────────────────────────────────────────────────
const CAT_COLORS: Record<DaytonEvent["category"], string> = {
  music:    "#8B5CF6",
  festival: "#F59E0B",
  sports:   "#10B981",
  arts:     "#EC4899",
  family:   "#3B82F6",
  food:     "#EF4444",
};

const CAT_LABELS: Record<DaytonEvent["category"], string> = {
  music:    "🎵 Music",
  festival: "🎉 Festival",
  sports:   "🏟️ Sports",
  arts:     "🎨 Arts",
  family:   "👨‍👩‍👧 Family",
  food:     "🍺 Food & Drink",
};

// ─── Supabase row → DaytonEvent mapper ───────────────────────────────────────
function mapRow(row: any): DaytonEvent {
  return {
    id:       row.id,
    title:    row.title,
    date:     row.date,
    month:    row.month,
    day:      row.day,
    venue:    row.venue,
    category: row.category,
    isFree:   row.is_free,
    price:    row.price ?? undefined,
    desc:     row.description,
    url:      row.url,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DaytonEvents() {
  const [events,      setEvents]      = useState<DaytonEvent[]>(EVENTS);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef  = useRef<FlatList<DaytonEvent>>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch live events from Supabase; silently fall back to static data
  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setEvents(data.map(mapRow));
        }
        // on error or empty table → keep static EVENTS fallback
      });
  }, []);

  // Auto-rotate every 4.5 seconds
  const startTimer = (list: DaytonEvent[]) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % list.length;
        flatRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4500);
  };

  useEffect(() => {
    startTimer(events);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [events]);

  const handleScrollEnd = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / CARD_W);
    setActiveIndex(idx);
    startTimer(events);
  };

  return (
    <View style={s.wrap}>
      {/* ── Section header ─────────────────────────────────────────────── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.liveDot} />
          <Text style={s.title}>Upcoming in Dayton</Text>
        </View>
        <TouchableOpacity style={s.seeAllBtn} onPress={() => router.push("/dayton-events" as any)} activeOpacity={0.8}>
          <Text style={s.seeAllText}>See All</Text>
          <Ionicons name="arrow-forward" size={12} color={Colors.gold} />
        </TouchableOpacity>
      </View>

      {/* ── Rotating cards ─────────────────────────────────────────────── */}
      <FlatList
        ref={flatRef}
        data={events}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={handleScrollEnd}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        snapToInterval={CARD_W}
        decelerationRate="fast"
        renderItem={({ item }) => <EventCard event={item} />}
      />

      {/* ── Dot indicators ─────────────────────────────────────────────── */}
      <View style={s.dots}>
        {events.slice(0, 8).map((_, i) => (
          <View key={i} style={[s.dot, i === activeIndex % 8 && s.dotActive]} />
        ))}
        {events.length > 8 && <Text style={s.dotMore}>+{events.length - 8}</Text>}
      </View>
    </View>
  );
}

function EventCard({ event }: { event: DaytonEvent }) {
  const color = CAT_COLORS[event.category];
  return (
    <View style={[s.card, { borderLeftColor: color }]}>
      {/* Date badge + category */}
      <View style={s.cardTop}>
        <View style={[s.dateBadge, { backgroundColor: color }]}>
          <Text style={s.dateMonth}>{event.month}</Text>
          <Text style={s.dateDay}>{event.day}</Text>
        </View>
        <View style={s.cardMeta}>
          <View style={[s.catChip, { backgroundColor: color + "22" }]}>
            <Text style={[s.catText, { color }]}>{CAT_LABELS[event.category]}</Text>
          </View>
          {event.isFree
            ? <View style={s.freeChip}><Text style={s.freeText}>FREE</Text></View>
            : event.price
              ? <Text style={s.priceText}>{event.price}</Text>
              : null
          }
        </View>
      </View>

      {/* Title + venue */}
      <Text style={s.eventTitle} numberOfLines={2}>{event.title}</Text>
      <View style={s.venueRow}>
        <Ionicons name="location-outline" size={12} color={Colors.grayLight} />
        <Text style={s.venueText} numberOfLines={1}>{event.venue}</Text>
      </View>
      <Text style={s.desc} numberOfLines={2}>{event.desc}</Text>

      {/* Date + link */}
      <View style={s.cardBottom}>
        <View style={s.dateRow}>
          <Ionicons name="calendar-outline" size={12} color={Colors.gray} />
          <Text style={s.dateText}>{event.date}</Text>
        </View>
        <TouchableOpacity
          style={s.linkBtn}
          onPress={() => Linking.openURL(event.url)}
          activeOpacity={0.8}
        >
          <Text style={s.linkText}>Website</Text>
          <Ionicons name="open-outline" size={11} color={Colors.gold} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 24, marginBottom: 4 },

  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20, marginBottom: 12,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  liveDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: "#2ECC71",
  },
  title: {
    color: Colors.black, fontSize: 16, fontWeight: "800",
    borderLeftWidth: 3, borderLeftColor: Colors.gold, paddingLeft: 10,
  },
  seeAllBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  seeAllText: { color: Colors.gold, fontSize: 13, fontWeight: "700" },

  card: {
    width: CARD_W,
    backgroundColor: Colors.white,
    borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: Colors.border,
    borderLeftWidth: 4,
    marginRight: 0,
  },

  cardTop: { flexDirection: "row", gap: 12, marginBottom: 10, alignItems: "flex-start" },
  dateBadge: {
    width: 46, borderRadius: 10, alignItems: "center",
    paddingVertical: 6, flexShrink: 0,
  },
  dateMonth: { color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  dateDay:   { color: "#fff", fontSize: 18, fontWeight: "900", lineHeight: 22 },

  cardMeta: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 6, alignItems: "center" },
  catChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  catText: { fontSize: 11, fontWeight: "700" },
  freeChip: {
    backgroundColor: "#D1FAE5", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  freeText: { color: "#065F46", fontSize: 11, fontWeight: "800" },
  priceText: { color: Colors.gray, fontSize: 11, fontWeight: "600" },

  eventTitle: { color: Colors.black, fontSize: 15, fontWeight: "800", marginBottom: 4, lineHeight: 20 },
  venueRow:   { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 6 },
  venueText:  { color: Colors.grayLight, fontSize: 12, flex: 1 },
  desc:       { color: Colors.gray, fontSize: 13, lineHeight: 18, marginBottom: 10 },

  cardBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dateRow:    { flexDirection: "row", alignItems: "center", gap: 4, flex: 1 },
  dateText:   { color: Colors.gray, fontSize: 11, flex: 1 },
  linkBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: Colors.offWhite, paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 8, borderWidth: 1, borderColor: Colors.border,
  },
  linkText: { color: Colors.gold, fontSize: 12, fontWeight: "700" },

  dots: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 10, gap: 5 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.border },
  dotActive: { width: 14, backgroundColor: Colors.gold },
  dotMore: { color: Colors.grayLight, fontSize: 10, marginLeft: 2 },
});
