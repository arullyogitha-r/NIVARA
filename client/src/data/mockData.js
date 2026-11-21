export const INITIAL_COMPLAINTS = [
  {
    id: "NVR-2024-089",
    title: "Deep pothole hazardous for two-wheelers near Metro Pillar 42",
    category: "Roads & Infrastructure",
    description: "A large crater has formed on the right lane of 80ft Road, right below metro pillar 42. Multiple bikers have slipped during recent rain. Requires immediate asphalt patch repair.",
    location: "80ft Road, Indiranagar, Ward 112",
    status: "Pending",
    priority: "High",
    date: "2024-11-20",
    votes: 38,
    reportedBy: "Kavita Raman",
    ward: "Ward 112",
    timeline: [
      { status: "Submitted", date: "Nov 20, 2024 - 10:15 AM", note: "Complaint logged by citizen with GPS coordinates" },
      { status: "Pending", date: "Nov 20, 2024 - 10:30 AM", note: "Assigned to Ward 112 Road Maintenance Cell" }
    ]
  },
  {
    id: "NVR-2024-077",
    title: "Frequent water supply interruption & muddy tap water",
    category: "Water Supply & Drainage",
    description: "For the past 4 days, pipeline water has been coming out muddy with high sediment levels. Household filters are completely clogged and drinking water is affected.",
    location: "Block 4, Koramangala, Ward 151",
    status: "In Progress",
    priority: "Urgent",
    date: "2024-11-18",
    votes: 54,
    reportedBy: "Arjun Mehta",
    ward: "Ward 151",
    timeline: [
      { status: "Submitted", date: "Nov 18, 2024 - 08:30 AM", note: "Complaint lodged" },
      { status: "Under Review", date: "Nov 18, 2024 - 11:00 AM", note: "Verified by Assistant Engineer" },
      { status: "In Progress", date: "Nov 19, 2024 - 02:45 PM", note: "Main feeder pipeline valve maintenance underway" }
    ]
  },
  {
    id: "NVR-2024-065",
    title: "Street lights non-functional along 2nd Main for 2 weeks",
    category: "Street Lighting & Power",
    description: "Entire stretch of 8 LED street lamps on 2nd Main road are dark after 7 PM, creating safety risks for women and pedestrians walking from bus stops.",
    location: "2nd Main, HSR Layout Sector 2, Ward 174",
    status: "Resolved",
    priority: "Medium",
    date: "2024-11-15",
    votes: 29,
    reportedBy: "Preeti Desai",
    ward: "Ward 174",
    timeline: [
      { status: "Submitted", date: "Nov 15, 2024 - 07:15 PM", note: "Complaint filed" },
      { status: "In Progress", date: "Nov 16, 2024 - 10:00 AM", note: "Electrician squad dispatched to examine transformer node" },
      { status: "Resolved", date: "Nov 17, 2024 - 04:30 PM", note: "Faulty control timer replaced. All 8 lamps operational" }
    ]
  },
  {
    id: "NVR-2024-058",
    title: "Overflowing community garbage dump attracting stray animals",
    category: "Sanitation & Waste",
    description: "The primary compactor bin near the municipal school has not been cleared for 3 consecutive days. Wet waste is spilling onto pedestrian walkway and creating foul odor.",
    location: "Near Govt Primary School, Jayanagar 4th T Block, Ward 168",
    status: "In Progress",
    priority: "High",
    date: "2024-11-14",
    votes: 42,
    reportedBy: "Suresh Babu",
    ward: "Ward 168",
    timeline: [
      { status: "Submitted", date: "Nov 14, 2024 - 09:00 AM", note: "Complaint logged with photograph" },
      { status: "In Progress", date: "Nov 14, 2024 - 01:20 PM", note: "Waste management vehicle scheduled for evening route clearance" }
    ]
  },
  {
    id: "NVR-2024-049",
    title: "Broken storm water drain slab causing pedestrian risk",
    category: "Roads & Infrastructure",
    description: "Heavy concrete slab over the roadside drain is cracked and partially collapsed. Several school students walk along this path every morning.",
    location: "14th Cross, Malleshwaram, Ward 65",
    status: "Resolved",
    priority: "High",
    date: "2024-11-10",
    votes: 61,
    reportedBy: "Ananya Rao",
    ward: "Ward 65",
    timeline: [
      { status: "Submitted", date: "Nov 10, 2024 - 11:20 AM", note: "Reported by citizen" },
      { status: "In Progress", date: "Nov 11, 2024 - 09:30 AM", note: "Temporary warning barricade placed" },
      { status: "Resolved", date: "Nov 13, 2024 - 03:00 PM", note: "Reinforced precast concrete slab installed and leveled" }
    ]
  },
  {
    id: "NVR-2024-034",
    title: "Illegal construction debris blocking public sidewalk",
    category: "Public Safety & Encroachment",
    description: "Piles of demolition bricks, sand, and iron rods dumped on public walking space outside plot 312 for over a week with no permits displayed.",
    location: "Outer Ring Road, Marathahalli, Ward 85",
    status: "Pending",
    priority: "Medium",
    date: "2024-11-09",
    votes: 19,
    reportedBy: "Rohan Varma",
    ward: "Ward 85",
    timeline: [
      { status: "Submitted", date: "Nov 09, 2024 - 04:45 PM", note: "Complaint submitted" },
      { status: "Pending", date: "Nov 10, 2024 - 10:00 AM", note: "Notice drafted for property developer by zonal inspector" }
    ]
  }
];

export const CATEGORIES = [
  { id: "roads", name: "Roads & Infrastructure", icon: "road", color: "#5B4BDB" },
  { id: "sanitation", name: "Sanitation & Waste", icon: "trash", color: "#00A896" },
  { id: "water", name: "Water Supply & Drainage", icon: "water", color: "#3B82F6" },
  { id: "lighting", name: "Street Lighting & Power", icon: "zap", color: "#FFB547" },
  { id: "safety", name: "Public Safety & Encroachment", icon: "shield", color: "#FF6B6B" },
  { id: "parks", name: "Parks & Green Spaces", icon: "tree", color: "#10B981" }
];

export const WARDS = [
  "Ward 65 - Malleshwaram",
  "Ward 85 - Marathahalli",
  "Ward 112 - Indiranagar",
  "Ward 151 - Koramangala",
  "Ward 168 - Jayanagar",
  "Ward 174 - HSR Layout",
  "Ward 198 - Whitefield"
];
