// ─────────────────────────────────────────────────────────────────────────────
//  app/things-to-do.tsx — Things To Do Within 1 Hour of Dayton
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "../shared/theme/colors";
import AppTabBar from "../shared/components/AppTabBar";
import ChatFAB from "../shared/components/ChatFAB";
import BrandHeader, { BackBtn } from "../shared/components/BrandHeader";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = "All" | "Museums & History" | "Nature & Outdoors" | "Amusement & Thrills" | "Arts & Culture" | "Local Gems";

interface Attraction {
  name:        string;
  city:        string;
  drive:       string;
  description: string;
  isFree:      boolean;
  priceRange:  "FREE" | "$" | "$$" | "$$$" | "$$$$";
  priceDetail: string;
  url:         string;
  category:    Category;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const ATTRACTIONS: Attraction[] = [

  // ── Museums & History ───────────────────────────────────────────────────────

  {
    name:        "National Museum of the U.S. Air Force",
    city:        "Wright-Patterson AFB",
    drive:       "10 min",
    description: "The world's largest military aviation museum — 360+ aircraft and missiles across 17 indoor acres. Includes presidential aircraft, space capsules, and WWII galleries. Open to the public.",
    isFree:      true,
    priceRange:  "FREE",
    priceDetail: "Always free admission",
    url:         "https://www.nationalmuseum.af.mil",
    category:    "Museums & History",
  },
  {
    name:        "Dayton Art Institute",
    city:        "Dayton",
    drive:       "5 min",
    description: "One of the top encyclopedic art museums in the Midwest with 27,000+ works spanning 5,000 years. Permanent collection is always free. Special exhibitions priced separately.",
    isFree:      true,
    priceRange:  "FREE",
    priceDetail: "Free (general collection) · Special exhibits extra",
    url:         "https://www.daytonartinstitute.org",
    category:    "Museums & History",
  },
  {
    name:        "Carillon Historical Park",
    city:        "Dayton",
    drive:       "10 min",
    description: "A 65-acre outdoor museum tracing Dayton's innovation history — from the Wright Brothers' 1905 Flyer III to Deeds Carillon. Ohio's Official Aviation Museum.",
    isFree:      false,
    priceRange:  "$",
    priceDetail: "$12 adult · $7 child (6–17) · Under 6 free",
    url:         "https://www.daytonhistory.org",
    category:    "Museums & History",
  },
  {
    name:        "Boonshoft Museum of Discovery",
    city:        "Dayton",
    drive:       "10 min",
    description: "Dayton's premier children's science museum with live animals, a planetarium, hands-on science exhibits, and an indoor nature center. Great for families with kids of all ages.",
    isFree:      false,
    priceRange:  "$$",
    priceDetail: "$15 adult · $13 child (2–12)",
    url:         "https://www.boonshoftmuseum.org",
    category:    "Museums & History",
  },
  {
    name:        "SunWatch Indian Village",
    city:        "Dayton",
    drive:       "10 min",
    description: "A reconstructed 800-year-old Fort Ancient Native American village on the banks of the Great Miami River. Includes a working solar calendar and archaeological dig site.",
    isFree:      false,
    priceRange:  "$",
    priceDetail: "$7 adult · $5 child (6–17) · Under 6 free",
    url:         "https://www.sunwatch.org",
    category:    "Museums & History",
  },
  {
    name:        "Champaign Aviation Museum",
    city:        "Urbana",
    drive:       "40 min",
    description: "A working restoration facility and aviation museum with WWII aircraft including a B-17 and B-25 bomber. Volunteers actively restore historic planes — you can watch them work.",
    isFree:      false,
    priceRange:  "$",
    priceDetail: "$12 adult · $8 child · Under 5 free",
    url:         "https://www.champaignaviationmuseum.org",
    category:    "Museums & History",
  },
  {
    name:        "Piatt Castles (Mac-A-Cheek & Mac-O-Chee)",
    city:        "West Liberty",
    drive:       "45 min",
    description: "Two Norman-style stone castles built by the Piatt brothers in the 1860s–70s. Filled with original European furnishings, Civil War artifacts, and Native American pieces. A genuinely surprising find.",
    isFree:      false,
    priceRange:  "$",
    priceDetail: "$10 adult per castle · $6 child · Combo tickets available",
    url:         "https://www.piattcastles.org",
    category:    "Museums & History",
  },
  {
    name:        "Fort Ancient Earthworks & Nature Preserve",
    city:        "Oregonia",
    drive:       "35 min",
    description: "A UNESCO World Heritage Site — one of the most extensive prehistoric earthworks in North America, built by the Hopewell culture 2,000 years ago. Museum + 3.5 miles of trails.",
    isFree:      false,
    priceRange:  "$",
    priceDetail: "$8 adult · $4 child (6–12) · Grounds FREE",
    url:         "https://www.fortancient.org",
    category:    "Museums & History",
  },
  {
    name:        "National Underground Railroad Freedom Center",
    city:        "Cincinnati",
    drive:       "55 min",
    description: "A powerful museum on the banks of the Ohio River honoring the courage of freedom seekers and the abolitionists who helped them. Includes a rare original slave pen.",
    isFree:      false,
    priceRange:  "$$",
    priceDetail: "$15 adult · $10.50 child (3–12)",
    url:         "https://www.freedomcenter.org",
    category:    "Museums & History",
  },
  {
    name:        "Cincinnati Museum Center",
    city:        "Cincinnati",
    drive:       "55 min",
    description: "A spectacular Art Deco Union Terminal housing natural history, history, and children's museums plus an Omnimax theater — all under one breathtaking rotunda.",
    isFree:      false,
    priceRange:  "$$",
    priceDetail: "$19 adult · $13 child (3–12) · Omnimax extra",
    url:         "https://www.cincymuseum.org",
    category:    "Museums & History",
  },
  {
    name:        "American Sign Museum",
    city:        "Cincinnati",
    drive:       "55 min",
    description: "A surprisingly fascinating museum tracing 200 years of American commercial sign-making — neon, painted, electric, and illuminated. Colorful, photogenic, and genuinely unique.",
    isFree:      false,
    priceRange:  "$$",
    priceDetail: "$15 adult · $8 student · Under 5 free",
    url:         "https://www.americansignmuseum.org",
    category:    "Museums & History",
  },
  {
    name:        "National Afro-American Museum (Wilberforce)",
    city:        "Wilberforce",
    drive:       "20 min",
    description: "Ohio's official museum of African American history and culture, on the campus of Central State University. Rotating exhibits covering the African diaspora from slavery through civil rights.",
    isFree:      false,
    priceRange:  "$",
    priceDetail: "$5 adult · $3 child · Free on Sundays",
    url:         "https://www.ohiohistory.org/naamc",
    category:    "Museums & History",
  },
  {
    name:        "Hopewell Culture National Historical Park",
    city:        "Chillicothe",
    drive:       "60 min",
    description: "A UNESCO World Heritage Site preserving the remarkable earthwork mounds built by the Hopewell people 2,000 years ago. The Mound City unit features 23 burial mounds inside a massive geometric enclosure. Free to enter.",
    isFree:      true,
    priceRange:  "FREE",
    priceDetail: "Free (National Park)",
    url:         "https://www.nps.gov/hocu",
    category:    "Museums & History",
  },
  {
    name:        "Piqua Historical Area",
    city:        "Piqua",
    drive:       "30 min",
    description: "A state history complex spanning 2,000 years — from Native American earthworks to a fully restored 1800s Ohio & Erie Canal lock, a frontier-era farm, and the grand Fort Piqua hotel. Canal boat rides available seasonally.",
    isFree:      false,
    priceRange:  "$",
    priceDetail: "$10 adult · $5 child (5–12) · Canal boat ride extra",
    url:         "https://www.piquahistoricalarea.org",
    category:    "Museums & History",
  },
  {
    name:        "Olentangy Indian Mounds",
    city:        "Delaware",
    drive:       "50 min",
    description: "Two large ceremonial mounds built by the Hopewell people around 100 BC–500 AD. A small museum tells the story of the Hopewell culture; you can actually walk through one excavated mound.",
    isFree:      false,
    priceRange:  "$",
    priceDetail: "$7 adult · $4 child (5–12) · Under 5 free",
    url:         "https://www.ohiohistory.org/visit/museum-and-site-locator/olentangy-indian-mounds",
    category:    "Museums & History",
  },
  {
    name:        "Woodland Cemetery & Arboretum",
    city:        "Dayton",
    drive:       "5 min",
    description: "One of America's great Victorian garden cemeteries — and the final resting place of Wilbur and Orville Wright, Paul Laurence Dunbar, and dozens of Dayton notables. Designated a state arboretum with 2,000+ labeled trees. Peaceful and genuinely moving.",
    isFree:      true,
    priceRange:  "FREE",
    priceDetail: "Free to visit",
    url:         "https://www.woodlandcemetery.org",
    category:    "Museums & History",
  },

  // ── Nature & Outdoors ───────────────────────────────────────────────────────

  {
    name:        "Five Rivers MetroParks",
    city:        "Dayton Metro",
    drive:       "5–20 min",
    description: "35+ parks, nature preserves, and trails across the Dayton area — hiking, fishing, kayaking, disc golf, playgrounds, and seasonal events. Something for everyone, always free.",
    isFree:      true,
    priceRange:  "FREE",
    priceDetail: "Always free",
    url:         "https://www.metroparks.org",
    category:    "Nature & Outdoors",
  },
  {
    name:        "John Bryan State Park",
    city:        "Yellow Springs",
    drive:       "25 min",
    description: "Stunning gorge trail along the Little Miami River through ancient limestone cliffs. Some of the best rock climbing in Ohio. Connects directly to Clifton Gorge Nature Preserve.",
    isFree:      true,
    priceRange:  "FREE",
    priceDetail: "Free (parking fee may apply)",
    url:         "https://ohiodnr.gov/go-and-do/plan-a-visit/find-a-property/john-bryan-state-park",
    category:    "Nature & Outdoors",
  },
  {
    name:        "Glen Helen Nature Preserve",
    city:        "Yellow Springs",
    drive:       "25 min",
    description: "1,000-acre preserve owned by Antioch College with old-growth forest, a yellow sulfur spring, and miles of trails. Home to the Trailside Museum and a stunning stone inhollow.",
    isFree:      true,
    priceRange:  "FREE",
    priceDetail: "Free to enter",
    url:         "https://glenhelen.org",
    category:    "Nature & Outdoors",
  },
  {
    name:        "Clifton Gorge State Nature Preserve",
    city:        "Yellow Springs",
    drive:       "25 min",
    description: "A dramatic 3.5-mile gorge carved from dolomite and limestone. One of the most botanically diverse natural areas in Ohio. Easy trail access — spectacular any time of year.",
    isFree:      true,
    priceRange:  "FREE",
    priceDetail: "Free",
    url:         "https://ohiodnr.gov/go-and-do/plan-a-visit/find-a-property/clifton-gorge-state-nature-preserve",
    category:    "Nature & Outdoors",
  },
  {
    name:        "Caesar Creek State Park",
    city:        "Waynesville",
    drive:       "30 min",
    description: "Over 2,800 acres of lake and forest with boating, fishing, swimming beach, hiking, and some of Ohio's best fossil hunting. The spillway area is prime Ordovician-era fossil territory.",
    isFree:      true,
    priceRange:  "FREE",
    priceDetail: "Free (boat launch & beach day-use fee applies)",
    url:         "https://ohiodnr.gov/go-and-do/plan-a-visit/find-a-property/caesar-creek-state-park",
    category:    "Nature & Outdoors",
  },
  {
    name:        "Hueston Woods State Park",
    city:        "College Corner",
    drive:       "40 min",
    description: "A beautiful 625-acre lake surrounded by one of Ohio's last old-growth forests. Canoe/kayak rentals, a nature center, zip line, swimming beach, and family cabins available.",
    isFree:      true,
    priceRange:  "FREE",
    priceDetail: "Free entry · Rentals & activities extra",
    url:         "https://ohiodnr.gov/go-and-do/plan-a-visit/find-a-property/hueston-woods-state-park",
    category:    "Nature & Outdoors",
  },
  {
    name:        "Aullwood Audubon Center & Farm",
    city:        "Dayton",
    drive:       "15 min",
    description: "A 350-acre nature sanctuary with wooded trails, a working organic farm, and wildlife education. Kids can see farm animals and native Ohio wildlife up close. Part of the National Audubon Society.",
    isFree:      false,
    priceRange:  "$",
    priceDetail: "$8 adult · $5 child · Members free",
    url:         "https://aullwood.audubon.org",
    category:    "Nature & Outdoors",
  },
  {
    name:        "Pyramid Hill Sculpture Park",
    city:        "Hamilton",
    drive:       "35 min",
    description: "Over 300 acres of rolling hills dotted with monumental outdoor sculptures by world-renowned artists. Also features a 10-acre lake, a museum, and seasonal events. Truly one-of-a-kind.",
    isFree:      false,
    priceRange:  "$",
    priceDetail: "$10 adult · $5 child (5–12) · Under 5 free",
    url:         "https://www.pyramidhill.org",
    category:    "Nature & Outdoors",
  },
  {
    name:        "Dawes Arboretum",
    city:        "Newark",
    drive:       "55 min",
    description: "1,800 acres of themed gardens, natural areas, and a famous 2,160-foot cypress hedge spelling 'DAWESARBORETUM' from the air. 9 miles of trails through stunning seasonal landscapes.",
    isFree:      true,
    priceRange:  "FREE",
    priceDetail: "Free admission",
    url:         "https://www.dawesarb.org",
    category:    "Nature & Outdoors",
  },
  {
    name:        "Indian Mound Reserve",
    city:        "Oregonia",
    drive:       "30 min",
    description: "A Warren County MetroPark preserving prehistoric earthworks and natural forest along the Little Miami River. Quiet, beautiful, and rarely crowded. Excellent birdwatching.",
    isFree:      true,
    priceRange:  "FREE",
    priceDetail: "Free",
    url:         "https://www.wcpaoh.org/parks/indian-mound/",
    category:    "Nature & Outdoors",
  },
  {
    name:        "Buck Creek State Park",
    city:        "Springfield",
    drive:       "25 min",
    description: "A 4,000-acre park built around C.J. Brown Reservoir with a 2,120-acre lake. Popular for fishing, boating, and a sandy swimming beach. Bald eagles nest here year-round.",
    isFree:      true,
    priceRange:  "FREE",
    priceDetail: "Free (beach & launch fees may apply)",
    url:         "https://ohiodnr.gov/go-and-do/plan-a-visit/find-a-property/buck-creek-state-park",
    category:    "Nature & Outdoors",
  },
  {
    name:        "Eden Park",
    city:        "Cincinnati",
    drive:       "55 min",
    description: "Cincinnati's crown jewel park perched above the Ohio River, featuring the Cincinnati Art Museum, Mirror Lake, Twin Lakes, a flower garden, and the Krohn Conservatory. Stunning views.",
    isFree:      true,
    priceRange:  "FREE",
    priceDetail: "Free (park & Art Museum general admission free)",
    url:         "https://www.cincinnatiparks.com/eden-park/",
    category:    "Nature & Outdoors",
  },
  {
    name:        "Cox Arboretum MetroPark",
    city:        "Dayton",
    drive:       "10 min",
    description: "A beautiful 189-acre botanical garden and nature preserve with themed gardens, a children's maze, butterfly house (seasonal), and forested trails. One of the prettiest free spots in the entire Dayton metro.",
    isFree:      true,
    priceRange:  "FREE",
    priceDetail: "Free",
    url:         "https://www.metroparks.org/places-to-go/cox-arboretum/",
    category:    "Nature & Outdoors",
  },
  {
    name:        "Wegerzyn Gardens MetroPark",
    city:        "Dayton",
    drive:       "10 min",
    description: "A 134-acre botanical garden featuring formal rose and perennial gardens, woodland boardwalks, and the historic Wegerzyn Horticultural Center. The Children's Discovery Garden is a highlight for families. Free year-round.",
    isFree:      true,
    priceRange:  "FREE",
    priceDetail: "Free",
    url:         "https://www.metroparks.org/places-to-go/wegerzyn-gardens/",
    category:    "Nature & Outdoors",
  },
  {
    name:        "Little Miami Scenic State Park & Trail",
    city:        "Dayton to Cincinnati",
    drive:       "20 min",
    description: "A 78-mile paved trail along a federally designated Wild & Scenic River — perfect for cycling, running, kayaking, and canoeing. Multiple access points from Dayton south toward Cincinnati. Outfitters rent kayaks and bikes.",
    isFree:      true,
    priceRange:  "FREE",
    priceDetail: "Free (trail access) · Kayak/bike rentals extra",
    url:         "https://ohiodnr.gov/go-and-do/plan-a-visit/find-a-property/little-miami-scenic-state-park",
    category:    "Nature & Outdoors",
  },
  {
    name:        "Miamisburg Mound",
    city:        "Miamisburg",
    drive:       "15 min",
    description: "The largest conical burial mound in Ohio — 65 feet tall and 800 feet in circumference, built by the Adena people over 2,000 years ago. A short hike to the top gives sweeping views of the Miami River valley. Quiet, free, and surprisingly impressive.",
    isFree:      true,
    priceRange:  "FREE",
    priceDetail: "Free",
    url:         "https://www.miamisburg.gov/Parks/Miamisburg-Mound",
    category:    "Nature & Outdoors",
  },

  // ── Amusement & Thrills ─────────────────────────────────────────────────────

  {
    name:        "Kings Island",
    city:        "Mason",
    drive:       "55 min",
    description: "One of the best regional amusement parks in the country — 100 rides including the Beast (world's longest wooden coaster), Orion giga coaster, and a full water park. Can easily spend 2 days.",
    isFree:      false,
    priceRange:  "$$$$",
    priceDetail: "~$75–$100+ single day · Season passes ~$79",
    url:         "https://www.visitkingsisland.com",
    category:    "Amusement & Thrills",
  },
  {
    name:        "Newport Aquarium",
    city:        "Newport, KY",
    drive:       "55 min",
    description: "Voted one of the top aquariums in the U.S. — walk-through shark tunnels, touch pools, penguins, and a jawdropping 1,000-pound alligator snapping turtle. Right across the river from Cincinnati.",
    isFree:      false,
    priceRange:  "$$$",
    priceDetail: "$30 adult · $20 child (2–12) · Under 2 free",
    url:         "https://www.newportaquarium.com",
    category:    "Amusement & Thrills",
  },
  {
    name:        "Ark Encounter",
    city:        "Williamstown, KY",
    drive:       "50 min",
    description: "A life-size, 510-foot recreation of Noah's Ark — one of the largest timber-frame structures in the world. Interactive exhibits across three decks. Unique and visually impressive regardless of belief.",
    isFree:      false,
    priceRange:  "$$$",
    priceDetail: "$49 adult · $28 child (5–17) · Parking $15",
    url:         "https://arkencounter.com",
    category:    "Amusement & Thrills",
  },
  {
    name:        "Creation Museum",
    city:        "Petersburg, KY",
    drive:       "55 min",
    description: "A state-of-the-art natural history museum presenting a biblical worldview with planetarium, botanical gardens, zip lines, petting zoo, and well-produced exhibits. Popular with families.",
    isFree:      false,
    priceRange:  "$$$",
    priceDetail: "$35 adult · $20 child (5–17) · Combo tickets with Ark",
    url:         "https://creationmuseum.org",
    category:    "Amusement & Thrills",
  },
  {
    name:        "Ohio Caverns",
    city:        "West Liberty",
    drive:       "45 min",
    description: "Ohio's largest natural cavern system — spectacular white crystal stalactites and stalagmites formed over millions of years. Year-round 54°F underground. Kid-friendly guided tours.",
    isFree:      false,
    priceRange:  "$$",
    priceDetail: "$20 adult · $12 child (5–12) · Under 5 free",
    url:         "https://www.ohiocaverns.com",
    category:    "Amusement & Thrills",
  },
  {
    name:        "Zane Shawnee Caverns",
    city:        "Bellefontaine",
    drive:       "45 min",
    description: "A unique cave system with rare cave pearls — smooth, round mineral formations found in fewer than 80 caves worldwide. Above ground: a campground and small Shawnee Nation museum.",
    isFree:      false,
    priceRange:  "$$",
    priceDetail: "~$16 adult · ~$10 child",
    url:         "https://www.zaneshawneecaverns.org",
    category:    "Amusement & Thrills",
  },
  {
    name:        "Eldora Speedway",
    city:        "New Weston",
    drive:       "45 min",
    description: "A legendary half-mile clay oval track — one of the premier dirt racing venues in the world. Hosts major NASCAR and World of Outlaws events. Loud, fast, and genuinely exciting.",
    isFree:      false,
    priceRange:  "$$",
    priceDetail: "$20–$75 depending on event",
    url:         "https://www.eldoraspeedway.com",
    category:    "Amusement & Thrills",
  },
  {
    name:        "Great Wolf Lodge",
    city:        "Mason",
    drive:       "55 min",
    description: "A massive indoor water park resort — perfect for families with young kids. Multiple water slides, wave pools, a ropes course, arcade, and MagiQuest interactive game. Book in advance.",
    isFree:      false,
    priceRange:  "$$$$",
    priceDetail: "$80–$180+/night (includes water park)",
    url:         "https://www.greatwolf.com/mason",
    category:    "Amusement & Thrills",
  },
  {
    name:        "COSI Columbus",
    city:        "Columbus",
    drive:       "55 min",
    description: "One of the top science centers in the U.S. — hands-on exhibits on space, ocean, dinosaurs, energy, and gadgets. A high-wire unicycle, giant pendulum, and planetarium rounds it out.",
    isFree:      false,
    priceRange:  "$$",
    priceDetail: "$26 adult · $21 child (2–12)",
    url:         "https://cosi.org",
    category:    "Amusement & Thrills",
  },
  {
    name:        "Sky Zone Dayton",
    city:        "Dayton",
    drive:       "15 min",
    description: "Indoor trampoline park with open jump, dodgeball, ninja warrior course, foam pits, and climb walls. Great for kids and adults alike — no weather concerns.",
    isFree:      false,
    priceRange:  "$$",
    priceDetail: "$20–$30 per 60–90 min session",
    url:         "https://www.skyzone.com/dayton",
    category:    "Amusement & Thrills",
  },
  {
    name:        "Cincinnati Zoo & Botanical Garden",
    city:        "Cincinnati",
    drive:       "55 min",
    description: "Consistently voted one of the top zoos in the country — home to 500+ animal species including rare white lions, giant pandas, manatees, and a famous hippo. The botanical gardens are spectacular year-round. Plan for a full day.",
    isFree:      false,
    priceRange:  "$$",
    priceDetail: "$23 adult · $18 child (2–12) · Parking extra",
    url:         "https://cincinnatizoo.org",
    category:    "Amusement & Thrills",
  },
  {
    name:        "Coney Island Cincinnati",
    city:        "Cincinnati",
    drive:       "55 min",
    description: "A classic amusement park on the Ohio River with the massive Sunlite Pool (largest recirculating pool in the U.S.), waterslides, midway rides, and a traditional carousel. A more affordable, old-school alternative to Kings Island.",
    isFree:      false,
    priceRange:  "$$",
    priceDetail: "$20–$35 depending on day/season",
    url:         "https://www.coneyislandpark.com",
    category:    "Amusement & Thrills",
  },
  {
    name:        "Urban Air Adventure Park",
    city:        "Beavercreek",
    drive:       "15 min",
    description: "A massive indoor adventure park with trampolines, a warrior course, go-karts, skyride, laser tag, virtual reality, and a ropes course. More variety than a traditional trampoline park — great for older kids and teens.",
    isFree:      false,
    priceRange:  "$$",
    priceDetail: "$20–$45 depending on package",
    url:         "https://www.urbanair.com/ohio/beavercreek",
    category:    "Amusement & Thrills",
  },

  // ── Arts & Culture ──────────────────────────────────────────────────────────

  {
    name:        "Levitt Pavilion Dayton",
    city:        "Dayton",
    drive:       "5 min",
    description: "Dayton's premier free outdoor concert venue in RiverScape MetroPark. Hosts 50+ free concerts every summer — local, regional, and national acts across all genres. Bring a blanket.",
    isFree:      true,
    priceRange:  "FREE",
    priceDetail: "Free (most shows) · Some ticketed events",
    url:         "https://www.levittdayton.org",
    category:    "Arts & Culture",
  },
  {
    name:        "Schuster Center / Dayton Live",
    city:        "Dayton",
    drive:       "5 min",
    description: "Dayton's world-class performing arts venue — Broadway touring shows, the Dayton Philharmonic, opera, ballet, and comedy. Stunning concert hall with near-perfect acoustics.",
    isFree:      false,
    priceRange:  "$$",
    priceDetail: "Varies by show · $20–$150+",
    url:         "https://www.daytonlive.org",
    category:    "Arts & Culture",
  },
  {
    name:        "Victoria Theatre",
    city:        "Dayton",
    drive:       "5 min",
    description: "A beautifully restored 1866 theater in the heart of downtown — live music, comedy, film screenings, and performing arts. Check their calendar; something is always on.",
    isFree:      false,
    priceRange:  "$$",
    priceDetail: "Varies by show · $15–$80",
    url:         "https://www.victoriatheatre.com",
    category:    "Arts & Culture",
  },
  {
    name:        "Springfield Museum of Art",
    city:        "Springfield",
    drive:       "20 min",
    description: "A hidden gem — a serious fine art collection spanning American, European, and contemporary works. Free admission makes it the best deal in the region. Rotating exhibitions throughout the year.",
    isFree:      true,
    priceRange:  "FREE",
    priceDetail: "Free admission always",
    url:         "https://www.springfieldart.org",
    category:    "Arts & Culture",
  },
  {
    name:        "Cincinnati Art Museum",
    city:        "Cincinnati",
    drive:       "55 min",
    description: "A world-class encyclopedic art museum with 67,000+ works spanning 6,000 years in a stunning Neoclassical building in Eden Park. General admission is always free — one of the best museum deals in the Midwest.",
    isFree:      true,
    priceRange:  "FREE",
    priceDetail: "Free (general collection) · Special exhibitions extra",
    url:         "https://www.cincinnatiartmuseum.org",
    category:    "Arts & Culture",
  },
  {
    name:        "Contemporary Arts Center (CAC)",
    city:        "Cincinnati",
    drive:       "55 min",
    description: "A cutting-edge contemporary arts institution in a Zaha Hadid-designed building — genuinely stunning architecture. Free on Mondays. Known for provocative, thought-provoking exhibitions.",
    isFree:      false,
    priceRange:  "$",
    priceDetail: "$10 adult · Free on Mondays",
    url:         "https://www.contemporaryartscenter.org",
    category:    "Arts & Culture",
  },
  {
    name:        "Taft Museum of Art",
    city:        "Cincinnati",
    drive:       "55 min",
    description: "An intimate art museum in a stunning Federal-style mansion from 1820. Houses Old Masters including Rembrandt, Hals, Gainsborough, and Ingres alongside stunning decorative arts.",
    isFree:      false,
    priceRange:  "$",
    priceDetail: "$12 adult · $10 senior · Free on Sundays",
    url:         "https://www.taftmuseum.org",
    category:    "Arts & Culture",
  },
  {
    name:        "Little Art Theatre",
    city:        "Yellow Springs",
    drive:       "25 min",
    description: "Ohio's oldest continuously operating movie theater (since 1929) — indie films, foreign films, documentaries, and classics in a wonderfully quirky single-screen theater. A Yellow Springs institution.",
    isFree:      false,
    priceRange:  "$",
    priceDetail: "$9–$12 per film",
    url:         "https://www.littleart.com",
    category:    "Arts & Culture",
  },
  {
    name:        "Dayton Philharmonic Orchestra",
    city:        "Dayton",
    drive:       "5 min",
    description: "One of the Midwest's finest orchestras performing at the Schuster Center — classical masterworks, pops series, and family concerts. Occasional free performances in the parks.",
    isFree:      false,
    priceRange:  "$$",
    priceDetail: "$20–$100+ depending on series",
    url:         "https://www.daytonlive.org/dayton-philharmonic",
    category:    "Arts & Culture",
  },
  {
    name:        "Krohn Conservatory",
    city:        "Cincinnati",
    drive:       "55 min",
    description: "A stunning Art Deco greenhouse in Eden Park housing thousands of exotic plants from around the world. Famous for its annual butterfly show — tens of thousands of free-flying butterflies in a tropical rainforest setting. Truly magical.",
    isFree:      false,
    priceRange:  "$",
    priceDetail: "$6 adult · $4 child · Butterfly show $12/$8",
    url:         "https://www.cincinnatiparks.com/krohn-conservatory/",
    category:    "Arts & Culture",
  },
  {
    name:        "Columbus Museum of Art",
    city:        "Columbus",
    drive:       "55 min",
    description: "A dynamic art museum with an outstanding Wonder Room (hands-on creativity space for all ages), strong American and European collections, and impressive rotating exhibitions. The Wonder Room alone is worth the trip with kids.",
    isFree:      false,
    priceRange:  "$$",
    priceDetail: "$18 adult · $12 child (4–17) · Free Sundays 10am–noon",
    url:         "https://www.columbusmuseum.org",
    category:    "Arts & Culture",
  },
  {
    name:        "Sorg Opera House",
    city:        "Middletown",
    drive:       "30 min",
    description: "A beautifully restored 1891 opera house — one of the finest intact Victorian theaters in the Midwest. Hosts live performances, concerts, comedy, and community events. A real hidden gem just south of Dayton.",
    isFree:      false,
    priceRange:  "$",
    priceDetail: "$15–$50 depending on show",
    url:         "https://sorgoperahouse.org",
    category:    "Arts & Culture",
  },

  // ── Local Gems ──────────────────────────────────────────────────────────────

  {
    name:        "Yellow Springs Village",
    city:        "Yellow Springs",
    drive:       "25 min",
    description: "Dayton's favorite day trip — a quirky, artistic small town with independent shops, galleries, restaurants, and street performers. Home to the Tom's Ice Cream Bowl, Winds Café, and Miles of Smiles mural.",
    isFree:      true,
    priceRange:  "FREE",
    priceDetail: "Free to explore · Shopping & dining extra",
    url:         "https://www.yellowspringsohio.org",
    category:    "Local Gems",
  },
  {
    name:        "Young's Jersey Dairy",
    city:        "Yellow Springs",
    drive:       "25 min",
    description: "A working family dairy farm with a bakery, ice cream shop, miniature golf, batting cages, and putt-putt. The Dairy Store serves ice cream made fresh on-site. Beloved by Daytonians of all ages.",
    isFree:      true,
    priceRange:  "FREE",
    priceDetail: "Free to visit · Food & activities from $3",
    url:         "https://www.youngsdairy.com",
    category:    "Local Gems",
  },
  {
    name:        "Oregon District",
    city:        "Dayton",
    drive:       "5 min",
    description: "Dayton's historic entertainment and arts district — Victorian architecture, locally owned restaurants, craft breweries, live music venues, and boutique shops. The heart of Dayton's nightlife.",
    isFree:      true,
    priceRange:  "FREE",
    priceDetail: "Free to explore · Dining & drinks extra",
    url:         "https://www.daytonoregondistrict.com",
    category:    "Local Gems",
  },
  {
    name:        "Wright Brothers National Memorial — Huffman Prairie",
    city:        "Fairborn",
    drive:       "10 min",
    description: "The actual field where Wilbur and Orville Wright mastered controlled flight in 1904–05 — right here in the Dayton area. A National Park site. Interpretive signs and walking path mark the history.",
    isFree:      true,
    priceRange:  "FREE",
    priceDetail: "Free (National Park)",
    url:         "https://www.nps.gov/daav",
    category:    "Local Gems",
  },
  {
    name:        "Dayton Dragons Baseball",
    city:        "Dayton",
    drive:       "5 min",
    description: "The Cincinnati Reds' Single-A affiliate plays at Day Air Ballpark in the heart of downtown. Dayton's most beloved sports team — sold out nearly every home game for 20+ consecutive years.",
    isFree:      false,
    priceRange:  "$",
    priceDetail: "$10–$25 per ticket",
    url:         "https://www.daytondragons.com",
    category:    "Local Gems",
  },
  {
    name:        "Jungle Jim's International Market",
    city:        "Fairfield",
    drive:       "50 min",
    description: "A legendary 300,000+ sq ft international grocery experience — more entertainment than shopping. International foods from 70+ countries, an indoor waterfall, animatronic characters, and a wine shop with 50,000+ bottles.",
    isFree:      true,
    priceRange:  "FREE",
    priceDetail: "Free to browse",
    url:         "https://www.junglejims.com",
    category:    "Local Gems",
  },
  {
    name:        "Hartman Rock Garden",
    city:        "Springfield",
    drive:       "20 min",
    description: "A one-of-a-kind folk art environment created by Ben Hartman from 1932–1944 — thousands of quartz rocks assembled into miniature castles, biblical scenes, and American landmarks. Genuinely unique.",
    isFree:      true,
    priceRange:  "FREE",
    priceDetail: "Free",
    url:         "https://www.cityofspringfieldohio.com",
    category:    "Local Gems",
  },
  {
    name:        "Hawthorn Hill — Wright Brothers Home",
    city:        "Oakwood",
    drive:       "15 min",
    description: "The Italian Renaissance Revival mansion Wilbur and Orville Wright built at the height of their fame. Orville lived here until his death in 1948. Guided tours reveal original furnishings and inventions.",
    isFree:      false,
    priceRange:  "$",
    priceDetail: "$15 adult · $10 child",
    url:         "https://www.daytonhistory.org/visit/hawthorn-hill/",
    category:    "Local Gems",
  },
  {
    name:        "Carriage Hill MetroPark & Farm",
    city:        "Huber Heights",
    drive:       "20 min",
    description: "A living history farm from the 1880s — costumed interpreters demonstrate daily life in 19th-century Ohio. Draft horses, heritage breed animals, a farmhouse, and miles of beautiful trails.",
    isFree:      true,
    priceRange:  "FREE",
    priceDetail: "Free",
    url:         "https://www.metroparks.org/places-to-go/carriage-hill/",
    category:    "Local Gems",
  },
  {
    name:        "RiverScape MetroPark",
    city:        "Dayton",
    drive:       "5 min",
    description: "Dayton's downtown riverfront park at the confluence of the Great Miami and Mad Rivers. Seasonal ice skating rink, summer festivals, water bikes, and beautiful river views. Free year-round.",
    isFree:      true,
    priceRange:  "FREE",
    priceDetail: "Free (some rentals & events extra)",
    url:         "https://www.metroparks.org/places-to-go/riverscape/",
    category:    "Local Gems",
  },
  {
    name:        "Newport on the Levee",
    city:        "Newport, KY",
    drive:       "55 min",
    description: "A riverfront entertainment complex just across the Ohio River from downtown Cincinnati — restaurants, bars, a bowling alley, comedy club, mini-golf, and stunning skyline views. Newport Aquarium is right here too. Great for a full evening out.",
    isFree:      true,
    priceRange:  "FREE",
    priceDetail: "Free to explore · Dining & activities extra",
    url:         "https://www.newportonthelevee.com",
    category:    "Local Gems",
  },
  {
    name:        "Waynesville Antique Capital",
    city:        "Waynesville",
    drive:       "30 min",
    description: "A charming historic village with 30+ antique and specialty shops packed into a few walkable blocks — plus boutiques, bakeries, and a great small-town atmosphere. A beloved day trip for antique hunters and casual browsers alike.",
    isFree:      true,
    priceRange:  "FREE",
    priceDetail: "Free to browse · Shopping extra",
    url:         "https://www.waynesvilleohio.com",
    category:    "Local Gems",
  },
  {
    name:        "The Golden Lamb",
    city:        "Lebanon",
    drive:       "35 min",
    description: "Ohio's oldest continuously operating inn and restaurant, open since 1803. Charles Dickens, 10 U.S. Presidents, and Mark Twain all stayed here. The dining room is beloved for its comfort food; the Shaker antique collection throughout the building is remarkable.",
    isFree:      true,
    priceRange:  "FREE",
    priceDetail: "Free to visit · Dining $20–$50/person",
    url:         "https://www.goldenlamb.com",
    category:    "Local Gems",
  },
  {
    name:        "German Village",
    city:        "Columbus",
    drive:       "55 min",
    description: "A stunning 233-acre historic neighborhood of 1800s German brick homes, flower-filled sidewalks, and independent restaurants — just south of downtown Columbus. Free to walk, with some of the best brunch spots and bakeries in Ohio. The Book Loft (32-room independent bookstore) is a must.",
    isFree:      true,
    priceRange:  "FREE",
    priceDetail: "Free to explore · Dining & shopping extra",
    url:         "https://www.germanvillage.com",
    category:    "Local Gems",
  },
  {
    name:        "Dayton Arcade",
    city:        "Dayton",
    drive:       "5 min",
    description: "A stunning 1904 Beaux-Arts arcade building in the heart of downtown Dayton — completely revitalized with local restaurants, creative businesses, a food hall, and a rooftop bar. One of the best adaptive reuse projects in Ohio. Gorgeous architecture.",
    isFree:      true,
    priceRange:  "FREE",
    priceDetail: "Free to explore · Dining & drinks extra",
    url:         "https://www.daytonarcade.com",
    category:    "Local Gems",
  },
  {
    name:        "Warped Wing Brewing Company",
    city:        "Dayton",
    drive:       "5 min",
    description: "Dayton's flagship craft brewery in a beautifully converted 1890s industrial building — named after the Wright Brothers' wing-warping flight technique. Award-winning beers, a full food menu, and one of the best patios in the city. A great introduction to Dayton's beer scene.",
    isFree:      true,
    priceRange:  "FREE",
    priceDetail: "Free to visit · Beers from $6",
    url:         "https://www.warpedwing.com",
    category:    "Local Gems",
  },
];

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORIES: { label: Category; icon: React.ComponentProps<typeof Ionicons>["name"]; color: string }[] = [
  { label: "All",               icon: "apps-outline",          color: Colors.gold   },
  { label: "Museums & History", icon: "library-outline",       color: "#60A5FA"     },
  { label: "Nature & Outdoors", icon: "leaf-outline",          color: "#34D399"     },
  { label: "Amusement & Thrills",icon:"flash-outline",         color: "#FB923C"     },
  { label: "Arts & Culture",    icon: "color-palette-outline", color: "#A78BFA"     },
  { label: "Local Gems",        icon: "star-outline",          color: Colors.gold   },
];

function categoryColor(cat: Category): string {
  return CATEGORIES.find(c => c.label === cat)?.color ?? Colors.gold;
}

// ─── Price badge ──────────────────────────────────────────────────────────────

function PriceBadge({ range, isFree }: { range: string; isFree: boolean }) {
  if (isFree) {
    return (
      <View style={price.freeBadge}>
        <Text style={price.freeText}>FREE</Text>
      </View>
    );
  }
  return (
    <View style={price.rangeBadge}>
      <Text style={price.rangeText}>{range}</Text>
    </View>
  );
}

const price = StyleSheet.create({
  freeBadge:  { backgroundColor: "#DCFCE7", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  freeText:   { color: "#16A34A", fontSize: 10, fontWeight: "900", letterSpacing: 0.5 },
  rangeBadge: { backgroundColor: "#F3F4F6", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  rangeText:  { color: "#374151", fontSize: 10, fontWeight: "700" },
});

// ─── Attraction card ──────────────────────────────────────────────────────────

function AttractionCard({ item }: { item: Attraction }) {
  const accent = categoryColor(item.category);
  return (
    <View style={card.wrap}>
      {/* Top row */}
      <View style={card.topRow}>
        <View style={[card.accentBar, { backgroundColor: accent }]} />
        <View style={card.topMain}>
          <Text style={card.name}>{item.name}</Text>
          <View style={card.metaRow}>
            <View style={card.drivePill}>
              <Ionicons name="car-outline" size={11} color="#888" />
              <Text style={card.driveText}>{item.drive}</Text>
            </View>
            <Text style={card.cityText}>{item.city}</Text>
          </View>
        </View>
        <PriceBadge range={item.priceRange} isFree={item.isFree} />
      </View>

      {/* Description */}
      <Text style={card.desc}>{item.description}</Text>

      {/* Footer */}
      <View style={card.footer}>
        <Text style={card.priceDetail}>{item.priceDetail}</Text>
        <TouchableOpacity
          style={card.webBtn}
          onPress={() => Linking.openURL(item.url)}
          activeOpacity={0.75}
        >
          <Text style={card.webBtnText}>Website</Text>
          <Ionicons name="open-outline" size={12} color={Colors.black} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const card = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EBEBEB",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingRight: 14,
    paddingTop: 14,
    paddingBottom: 10,
  },
  accentBar: { width: 4, alignSelf: "stretch", borderRadius: 2, marginLeft: 0 },
  topMain:   { flex: 1 },
  name:      { color: Colors.black, fontSize: 15, fontWeight: "800", marginBottom: 5, lineHeight: 20 },
  metaRow:   { flexDirection: "row", alignItems: "center", gap: 8 },
  drivePill: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "#F3F4F6", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6,
  },
  driveText:  { color: "#555", fontSize: 10, fontWeight: "600" },
  cityText:   { color: "#999", fontSize: 11 },
  desc: {
    color: "#555", fontSize: 13, lineHeight: 19,
    paddingHorizontal: 14, paddingBottom: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingBottom: 12,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  priceDetail: { color: "#888", fontSize: 11, flex: 1 },
  webBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: Colors.gold, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
  },
  webBtnText: { color: Colors.black, fontSize: 12, fontWeight: "700" },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ThingsToDoScreen() {
  const router = useRouter();
  const [active, setActive] = useState<Category>("All");

  const filtered = active === "All"
    ? ATTRACTIONS
    : ATTRACTIONS.filter(a => a.category === active);

  const freeCount = filtered.filter(a => a.isFree).length;

  return (
    <>
      <BrandHeader left={<BackBtn onPress={() => router.back()} />} />
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
      >
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <View style={s.hero}>
          <View style={s.heroBadge}>
            <Ionicons name="compass" size={16} color={Colors.gold} />
            <Text style={s.heroBadgeText}>WITHIN 1 HOUR OF DAYTON</Text>
          </View>
          <Text style={s.heroTitle}>Things To Do</Text>
          <Text style={s.heroSub}>
            {ATTRACTIONS.length} attractions · {ATTRACTIONS.filter(a => a.isFree).length} are free
          </Text>
          <View style={s.heroStats}>
            <View style={s.heroStat}>
              <Text style={s.heroStatVal}>{ATTRACTIONS.length}</Text>
              <Text style={s.heroStatLbl}>Total Spots</Text>
            </View>
            <View style={[s.heroStat, s.heroStatMid]}>
              <Text style={[s.heroStatVal, { color: "#34D399" }]}>{ATTRACTIONS.filter(a => a.isFree).length}</Text>
              <Text style={s.heroStatLbl}>Free Entry</Text>
            </View>
            <View style={s.heroStat}>
              <Text style={s.heroStatVal}>5</Text>
              <Text style={s.heroStatLbl}>Categories</Text>
            </View>
          </View>
        </View>

        {/* ── Category tabs (sticky) ───────────────────────────────────────── */}
        <View style={s.tabsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.tabsRow}
          >
            {CATEGORIES.map(({ label, icon, color }) => {
              const isActive = active === label;
              return (
                <TouchableOpacity
                  key={label}
                  style={[s.tab, isActive && { backgroundColor: color, borderColor: color }]}
                  onPress={() => setActive(label)}
                  activeOpacity={0.8}
                >
                  <Ionicons name={icon} size={16} color={isActive ? Colors.black : "#888"} />
                  <Text style={[s.tabText, isActive && s.tabTextActive]}>
                    {label === "All" ? `All (${ATTRACTIONS.length})` : label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Results header ───────────────────────────────────────────────── */}
        <View style={s.resultsHeader}>
          <Text style={s.resultsCount}>
            {filtered.length} attraction{filtered.length !== 1 ? "s" : ""}
            {freeCount > 0 && active !== "All" ? ` · ${freeCount} free` : ""}
          </Text>
        </View>

        {/* ── Cards ────────────────────────────────────────────────────────── */}
        {filtered.map((item) => (
          <AttractionCard key={item.name} item={item} />
        ))}

        <View style={s.disclaimer}>
          <Ionicons name="information-circle-outline" size={13} color="#AAA" />
          <Text style={s.disclaimerText}>
            Prices and hours are approximate and subject to change. Always verify directly with the venue before visiting.
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
      <AppTabBar />
      <ChatFAB />
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  scroll:  { flex: 1, backgroundColor: Colors.white },
  content: { paddingBottom: 24 },

  // Hero
  hero: {
    backgroundColor: Colors.black,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  heroBadge: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, alignSelf: "flex-start",
    marginBottom: 14, borderWidth: 1, borderColor: Colors.goldDark,
  },
  heroBadgeText: {
    color: Colors.gold, fontSize: 10, fontWeight: "800", letterSpacing: 1.5,
  },
  heroTitle: {
    color: Colors.white, fontSize: 28, fontWeight: "900", marginBottom: 4,
  },
  heroSub: {
    color: "#777", fontSize: 13, marginBottom: 20,
  },
  heroStats: {
    flexDirection: "row",
    backgroundColor: "#111",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    overflow: "hidden",
  },
  heroStat: {
    flex: 1, alignItems: "center", paddingVertical: 14,
  },
  heroStatMid: {
    borderLeftWidth: 1, borderRightWidth: 1, borderColor: "#2A2A2A",
  },
  heroStatVal: { color: Colors.gold, fontSize: 22, fontWeight: "900" },
  heroStatLbl: { color: "#666", fontSize: 10, marginTop: 2 },

  // Sticky tabs
  tabsWrapper: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#EBEBEB",
    paddingVertical: 10,
  },
  tabsRow: { paddingHorizontal: 16, gap: 8 },
  tab: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 20, borderWidth: 1.5, borderColor: "#E0E0E0",
    backgroundColor: Colors.white,
  },
  tabText:       { color: "#888", fontSize: 14, fontWeight: "600" },
  tabTextActive: { color: Colors.black, fontWeight: "800" },

  // Results header
  resultsHeader: {
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8,
  },
  resultsCount: { color: "#AAA", fontSize: 12, fontWeight: "600" },

  // Disclaimer
  disclaimer: {
    flexDirection: "row", gap: 8, alignItems: "flex-start",
    marginHorizontal: 16, marginTop: 8,
    padding: 12, backgroundColor: "#F9F9F9", borderRadius: 10,
  },
  disclaimerText: { color: "#AAA", fontSize: 11, lineHeight: 16, flex: 1 },
});
