import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

# ---------------------------------------------------------
# CONSTANTS & STYLING
# ---------------------------------------------------------
DARK_BG = RGBColor(11, 15, 25)       # Slate Dark (#0B0F19)
LIGHT_BG = RGBColor(248, 250, 252)   # Ice Light (#F8FAFC)
TEXT_WHITE = RGBColor(255, 255, 255)
TEXT_DARK = RGBColor(30, 27, 75)     # Deep Slate Indigo (#1E1B4B)
TEXT_MUTED = RGBColor(100, 116, 139) # Muted Gray (#64748B)
PRIMARY_BLUE = RGBColor(14, 165, 233) # Ocean Blue (#0EA5E9)
ACCENT_TEAL = RGBColor(20, 184, 166)  # Teal (#14B8A6)
CARD_BG = RGBColor(255, 255, 255)
CARD_BORDER = RGBColor(226, 232, 240)

# ---------------------------------------------------------
# HELPER FUNCTIONS
# ---------------------------------------------------------
def set_slide_background(slide, color):
    background = slide.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = color

def add_textbox(slide, left, top, width, height, margin=0):
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(margin)
    tf.margin_right = Inches(margin)
    tf.margin_top = Inches(margin)
    tf.margin_bottom = Inches(margin)
    return tf

def add_paragraph(tf, text, size=14, bold=False, color=TEXT_DARK, align=PP_ALIGN.LEFT, space_after=6, italic=False):
    if len(tf.paragraphs) == 1 and tf.paragraphs[0].text == "":
        p = tf.paragraphs[0]
    else:
        p = tf.add_paragraph()
    p.text = text
    p.font.name = "Segoe UI"
    p.font.size = Pt(size)
    p.font.bold = bold
    p.font.italic = italic
    p.font.color.rgb = color
    p.alignment = align
    p.space_after = Pt(space_after)
    return p

def add_card(slide, left, top, width, height, bg_color=CARD_BG, border_color=CARD_BORDER):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = bg_color
    if border_color:
        shape.line.color.rgb = border_color
        shape.line.width = Pt(1.5)
    else:
        shape.line.fill.background()
    return shape

def draw_card(slide, left, top, width, height, title, subtitle=None, bg_color=CARD_BG, border_color=CARD_BORDER, is_dark=False):
    # Draw background card shape
    add_card(slide, left, top, width, height, bg_color, border_color)
    
    # Place text frame over the shape with margin offsets
    tf = add_textbox(slide, left + Inches(0.2), top + Inches(0.2), width - Inches(0.4), height - Inches(0.4))
    
    title_color = TEXT_WHITE if is_dark else TEXT_DARK
    sub_color = PRIMARY_BLUE if is_dark else TEXT_MUTED
    
    add_paragraph(tf, title, size=16, bold=True, color=title_color, space_after=2)
    if subtitle:
        add_paragraph(tf, subtitle, size=11, italic=True, color=sub_color, space_after=10)
        
    return tf

def draw_header_footer(slide, title, subtitle=None):
    set_slide_background(slide, LIGHT_BG)
    
    # Title Text Frame
    tf = add_textbox(slide, Inches(0.8), Inches(0.4), Inches(11.73), Inches(1.1))
    add_paragraph(tf, title, size=32, bold=True, color=TEXT_DARK, space_after=2)
    if subtitle:
        add_paragraph(tf, subtitle, size=13, color=PRIMARY_BLUE)
        
    # Blue horizontal accent line below the title
    accent = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.4), Inches(1.5), Inches(0.04))
    accent.fill.solid()
    accent.fill.fore_color.rgb = PRIMARY_BLUE
    accent.line.fill.background()
    
    # Footer Text Frame
    tf_footer = add_textbox(slide, Inches(0.8), Inches(6.9), Inches(11.73), Inches(0.4))
    add_paragraph(tf_footer, "AI Travel Planner • Project Overview & System Architecture", size=10, color=TEXT_MUTED)

# ---------------------------------------------------------
# SLIDE BUILDERS
# ---------------------------------------------------------
def make_slide_1(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_background(slide, DARK_BG)
    
    # Left border accent bar
    accent = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(0.3), Inches(7.5))
    accent.fill.solid()
    accent.fill.fore_color.rgb = PRIMARY_BLUE
    accent.line.fill.background()
    
    tf = add_textbox(slide, Inches(1.2), Inches(2.2), Inches(11.0), Inches(4.0))
    add_paragraph(tf, "AI Travel Planner", size=54, bold=True, color=TEXT_WHITE, space_after=8)
    add_paragraph(tf, "Your Intelligent Companion for Seamless Journeys", size=22, color=PRIMARY_BLUE, space_after=24)
    
    # Separator line
    divider = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1.2), Inches(4.3), Inches(4.0), Inches(0.02))
    divider.fill.solid()
    divider.fill.fore_color.rgb = ACCENT_TEAL
    divider.line.fill.background()
    
    tf_meta = add_textbox(slide, Inches(1.2), Inches(4.7), Inches(11.0), Inches(1.5))
    add_paragraph(tf_meta, "A Full-Stack AI-Driven Itinerary & Travel Assistant", size=14, bold=True, color=TEXT_WHITE, space_after=4)
    add_paragraph(tf_meta, "Powered by the MERN Stack, Google Gemini AI, and OpenWeather API", size=12, color=TEXT_MUTED, space_after=4)
    add_paragraph(tf_meta, "System Presentation • 10 Slides", size=12, italic=True, color=PRIMARY_BLUE)

def make_slide_2(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    draw_header_footer(slide, "The Problem", "Why manual trip planning is stressful and time-consuming")
    
    col_w = Inches(3.64)
    col_h = Inches(4.8)
    top_y = Inches(1.8)
    
    # Card 1: Information Overload
    tf1 = draw_card(slide, Inches(0.8), top_y, col_w, col_h, "Information Overload", "Too many choices, too little structure")
    add_paragraph(tf1, "▪ Scattered Information", size=13, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf1, "Travelers must browse dozens of separate websites for hotel reviews, food blogs, safety guides, and transport options.", size=11.5, color=TEXT_MUTED, space_after=12)
    add_paragraph(tf1, "▪ Time Exhaustion", size=13, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf1, "Planning a single 5-day vacation takes an average of 10 to 20 hours of manual research, leading to planning fatigue.", size=11.5, color=TEXT_MUTED)

    # Card 2: Budget & Transit Blindspots
    tf2 = draw_card(slide, Inches(4.84), top_y, col_w, col_h, "Budget & Transit Blindspots", "Hidden costs and scheduling conflicts")
    add_paragraph(tf2, "▪ Price Estimations", size=13, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf2, "Estimating daily expenses, entry tickets, and local dining costs is often guesswork, resulting in overspending.", size=11.5, color=TEXT_MUTED, space_after=12)
    add_paragraph(tf2, "▪ Route Inefficiencies", size=13, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf2, "Failing to coordinate hotel locations with daily attraction routes leads to excessive transit times and wasted money.", size=11.5, color=TEXT_MUTED)

    # Card 3: Static & Rigid Itineraries
    tf3 = draw_card(slide, Inches(8.88), top_y, col_w, col_h, "Static & Rigid Itineraries", "Lack of adaptation on the road")
    add_paragraph(tf3, "▪ No Personalization", size=13, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf3, "Generic tour packages do not align with individual vibes (e.g., foodie, nature, photography, adventure, family-friendly).", size=11.5, color=TEXT_MUTED, space_after=12)
    add_paragraph(tf3, "▪ Zero Adaptability", size=13, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf3, "Static PDF travel plans cannot adapt to real-time weather warnings, changing moods, or unexpected closures.", size=11.5, color=TEXT_MUTED)

def make_slide_3(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    draw_header_footer(slide, "The Solution", "An all-in-one personalized AI travel planner")
    
    top_y = Inches(1.8)
    col_h = Inches(4.8)
    
    # Left Card: Platform Overview
    tf_left = draw_card(slide, Inches(0.8), top_y, Inches(7.4), col_h, "The AI Travel Planner Platform", "Interactive, dynamic, and tailor-made")
    add_paragraph(tf_left, "▪ 100% Customized Itineraries", size=14, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf_left, "Our application leverages Gemini generative AI models to construct complete daily schedules containing curated activities, timing suggestions, and meal plans matching your exact travel vibe.", size=12, color=TEXT_MUTED, space_after=14)
    add_paragraph(tf_left, "▪ Seamless Real-Time Enhancements", size=14, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf_left, "Unlike flat travel guides, itineraries are connected to live APIs. Users see real-time local weather forecasts, route coordinates, and live transport costs during the planning stage.", size=12, color=TEXT_MUTED, space_after=14)
    add_paragraph(tf_left, "▪ Interactive Tools & AI Chat", size=14, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf_left, "Includes packing checklists automatically tailored to your style, budget tracking tools, and an AI chat assistant for rapid on-the-road questions and adjustments.", size=12, color=TEXT_MUTED)

    # Right Card: Key Highlights
    tf_right = draw_card(slide, Inches(8.68), top_y, Inches(3.84), col_h, "Why It Stands Out", "Key value propositions", bg_color=RGBColor(240, 249, 255), border_color=PRIMARY_BLUE)
    add_paragraph(tf_right, "⚡ Sub-10s Gen Time", size=13, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf_right, "Generates full multi-day itineraries in seconds rather than hours of manual searches.", size=11.5, color=TEXT_MUTED, space_after=14)
    add_paragraph(tf_right, "🎯 High Accuracy", size=13, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf_right, "Takes start location, budget limits, travel companion, and 10+ interest tags into account.", size=11.5, color=TEXT_MUTED, space_after=14)
    add_paragraph(tf_right, "💖 Interactive UX", size=13, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf_right, "Smooth CSS micro-animations, canvas-confetti, step progress indicator, and clean dashboard layouts.", size=11.5, color=TEXT_MUTED)

def make_slide_4(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    draw_header_footer(slide, "System Architecture", "Robust MERN stack with modern third-party API integrations")
    
    top_y = Inches(1.8)
    col_w = Inches(2.7)
    col_h = Inches(4.8)
    
    # Card 1: Frontend Layer
    tf1 = draw_card(slide, Inches(0.8), top_y, col_w, col_h, "1. Frontend Layer", "React & Modern CSS")
    add_paragraph(tf1, "▪ UI Framework", size=11.5, bold=True, color=TEXT_DARK, space_after=1)
    add_paragraph(tf1, "React.js with Vite for blazing-fast HMR and build performance.", size=10.5, color=TEXT_MUTED, space_after=8)
    add_paragraph(tf1, "▪ Styling & Assets", size=11.5, bold=True, color=TEXT_DARK, space_after=1)
    add_paragraph(tf1, "Vanilla CSS custom tokens, glassmorphism, responsive grids, and Lucide React icons.", size=10.5, color=TEXT_MUTED, space_after=8)
    add_paragraph(tf1, "▪ UX Features", size=11.5, bold=True, color=TEXT_DARK, space_after=1)
    add_paragraph(tf1, "Step progress bars, dynamic loaders, rotating planning tips, and confetti bursts.", size=10.5, color=TEXT_MUTED)

    # Card 2: Backend API Layer
    tf2 = draw_card(slide, Inches(3.81), top_y, col_w, col_h, "2. Backend API", "Node.js & Express")
    add_paragraph(tf2, "▪ REST Architecture", size=11.5, bold=True, color=TEXT_DARK, space_after=1)
    add_paragraph(tf2, "Modular REST API endpoints for user accounts, trips, weather data, and chats.", size=10.5, color=TEXT_MUTED, space_after=8)
    add_paragraph(tf2, "▪ Middleware Rules", size=11.5, bold=True, color=TEXT_DARK, space_after=1)
    add_paragraph(tf2, "Structured Express routers, token verification middleware, and centralized error logs.", size=10.5, color=TEXT_MUTED, space_after=8)
    add_paragraph(tf2, "▪ CORS & Security", size=11.5, bold=True, color=TEXT_DARK, space_after=1)
    add_paragraph(tf2, "Configured Cross-Origin Resource Sharing and secure HTTP header settings.", size=10.5, color=TEXT_MUTED)

    # Card 3: AI & Integrations
    tf3 = draw_card(slide, Inches(6.82), top_y, col_w, col_h, "3. AI & Integrations", "Third-Party APIs")
    add_paragraph(tf3, "▪ Google Gemini AI", size=11.5, bold=True, color=TEXT_DARK, space_after=1)
    add_paragraph(tf3, "Uses gemini-flash-latest for lightning-fast itinerary drafts and natural chat support.", size=10.5, color=TEXT_MUTED, space_after=8)
    add_paragraph(tf3, "▪ OpenWeatherMap", size=11.5, bold=True, color=TEXT_DARK, space_after=1)
    add_paragraph(tf3, "Pulls real-time 5-day weather conditions for the destination to advise on packing.", size=10.5, color=TEXT_MUTED, space_after=8)
    add_paragraph(tf3, "▪ Route Calculator", size=11.5, bold=True, color=TEXT_DARK, space_after=1)
    add_paragraph(tf3, "Real-time routing costs (Flight, Train, Bus, Cab) based on origin & destination.", size=10.5, color=TEXT_MUTED)

    # Card 4: Database Layer
    tf4 = draw_card(slide, Inches(9.83), top_y, col_w, col_h, "4. Database Layer", "MongoDB & Mongoose")
    add_paragraph(tf4, "▪ Document Store", size=11.5, bold=True, color=TEXT_DARK, space_after=1)
    add_paragraph(tf4, "MongoDB NoSQL database handles flexible schemas for varied itineraries.", size=10.5, color=TEXT_MUTED, space_after=8)
    add_paragraph(tf4, "▪ Schema Models", size=11.5, bold=True, color=TEXT_DARK, space_after=1)
    add_paragraph(tf4, "Mongoose ODM schemas for User credentials, Trip details, and Chat logs.", size=10.5, color=TEXT_MUTED, space_after=8)
    add_paragraph(tf4, "▪ Encryption & Auth", size=11.5, bold=True, color=TEXT_DARK, space_after=1)
    add_paragraph(tf4, "Passwords hashed using bcryptjs and auth tokens managed via JSON Web Tokens (JWT).", size=10.5, color=TEXT_MUTED)

def make_slide_5(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    draw_header_footer(slide, "User Onboarding & Dashboard", "Securing user space and organizing travel workspaces")
    
    top_y = Inches(1.8)
    col_w = Inches(5.6)
    col_h = Inches(4.8)
    
    # Card 1: AuthPage
    tf1 = draw_card(slide, Inches(0.8), top_y, col_w, col_h, "Secure Authentication (AuthPage)", "Flexible and secure login mechanisms")
    add_paragraph(tf1, "▪ Dual-Mode Login / Signup UI", size=13.5, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf1, "A beautiful, glassmorphic layout allowing seamless toggling between Sign In and Sign Up in a single view.", size=11.5, color=TEXT_MUTED, space_after=12)
    add_paragraph(tf1, "▪ Standard JWT Login", size=13.5, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf1, "Authenticates email-password inputs with salted bcryptjs hashes and signs sessions using short-lived JWT tokens.", size=11.5, color=TEXT_MUTED, space_after=12)
    add_paragraph(tf1, "▪ Google OAuth Integration", size=13.5, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf1, "Uses google-auth-library on the backend to authenticate Google Sign-in accounts, ensuring standard single-click access.", size=11.5, color=TEXT_MUTED, space_after=12)
    add_paragraph(tf1, "▪ Secure Routing & Session", size=13.5, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf1, "AuthContext coordinates auth tokens, redirecting unauthenticated visitors automatically back to login.", size=11.5, color=TEXT_MUTED)

    # Card 2: User Dashboard
    tf2 = draw_card(slide, Inches(6.93), top_y, col_w, col_h, "Interactive Travel Workspace (Dashboard)", "Centralized control for user itineraries")
    add_paragraph(tf2, "▪ Active Itineraries Summary", size=13.5, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf2, "Displays upcoming travel events, active itineraries, and completed journeys in a structured visual summary.", size=11.5, color=TEXT_MUTED, space_after=12)
    add_paragraph(tf2, "▪ Quick Action Triggers", size=13.5, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf2, "One-click actions to edit existing trips, delete past drafts, view shared itineraries, or initiate a brand-new trip plan.", size=11.5, color=TEXT_MUTED, space_after=12)
    add_paragraph(tf2, "▪ Travel Stats Indicator", size=13.5, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf2, "Shows personalized summary metrics such as total days traveled, number of destinations explored, and total budget managed.", size=11.5, color=TEXT_MUTED, space_after=12)
    add_paragraph(tf2, "▪ Adaptive UI Layout", size=13.5, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf2, "Adapts dynamically to mobile, tablet, and desktop screens using flexible layout parameters.", size=11.5, color=TEXT_MUTED)

def make_slide_6(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    draw_header_footer(slide, "Core Flow: AI Itinerary Generator", "Step-by-step preference curation for customized results")
    
    top_y = Inches(1.8)
    col_w = Inches(2.7)
    col_h = Inches(4.8)
    
    # Step 1
    tf1 = draw_card(slide, Inches(0.8), top_y, col_w, col_h, "Step 1: Destination", "Duration & Geography")
    add_paragraph(tf1, "📍 Basic Inputs", size=11.5, bold=True, color=TEXT_DARK, space_after=1)
    add_paragraph(tf1, "User specifies their start location (origin) and dream destination.", size=10.5, color=TEXT_MUTED, space_after=8)
    add_paragraph(tf1, "📅 Day Range", size=11.5, bold=True, color=TEXT_DARK, space_after=1)
    add_paragraph(tf1, "Sets duration of the trip (1 to 10 days) using an interactive, custom range selector bar.", size=10.5, color=TEXT_MUTED, space_after=8)
    add_paragraph(tf1, "🎯 Validation", size=11.5, bold=True, color=TEXT_DARK, space_after=1)
    add_paragraph(tf1, "Guarantees location strings are populated before proceeding to fetch real-time routes.", size=10.5, color=TEXT_MUTED)

    # Step 2
    tf2 = draw_card(slide, Inches(3.81), top_y, col_w, col_h, "Step 2: Transit", "Real-Time Route Options")
    add_paragraph(tf2, "✈️ Multi-Mode Transit", size=11.5, bold=True, color=TEXT_DARK, space_after=1)
    add_paragraph(tf2, "Fetches active rates & duration for Flight, Train, Bus, or Cab.", size=10.5, color=TEXT_MUTED, space_after=8)
    add_paragraph(tf2, "⏰ Travel Times", size=11.5, bold=True, color=TEXT_DARK, space_after=1)
    add_paragraph(tf2, "Displays exact transit hours, route descriptions, and schedules.", size=10.5, color=TEXT_MUTED, space_after=8)
    add_paragraph(tf2, "💰 Cost Analysis", size=11.5, bold=True, color=TEXT_DARK, space_after=1)
    add_paragraph(tf2, "Auto-calculates ticket cost which is factored into total trip budget recommended minimum.", size=10.5, color=TEXT_MUTED)

    # Step 3
    tf3 = draw_card(slide, Inches(6.82), top_y, col_w, col_h, "Step 3: Budget & Style", "Financials & Atmosphere")
    add_paragraph(tf3, "💵 Smart Budgeting", size=11.5, bold=True, color=TEXT_DARK, space_after=1)
    add_paragraph(tf3, "User sets their budget, guided by a system-suggested baseline per day.", size=10.5, color=TEXT_MUTED, space_after=8)
    add_paragraph(tf3, "🎨 Travel Styles", size=11.5, bold=True, color=TEXT_DARK, space_after=1)
    add_paragraph(tf3, "Selects style matching their vibe: Budget, Standard, Luxury, Adventure, or Family.", size=10.5, color=TEXT_MUTED, space_after=8)
    add_paragraph(tf3, "🚨 Alert Checks", size=11.5, bold=True, color=TEXT_DARK, space_after=1)
    add_paragraph(tf3, "Displays warning if budget is lower than required minimum for lodging and transit.", size=10.5, color=TEXT_MUTED)

    # Step 4
    tf4 = draw_card(slide, Inches(9.83), top_y, col_w, col_h, "Step 4: Interests", "Personalization Filters")
    add_paragraph(tf4, "✨ Interest Tags", size=11.5, bold=True, color=TEXT_DARK, space_after=1)
    add_paragraph(tf4, "Selects up to 10 interest tags like Nature, Foodie, History, Culture, Shopping, or Nightlife.", size=10.5, color=TEXT_MUTED, space_after=8)
    add_paragraph(tf4, "⚙️ AI Prompting", size=11.5, bold=True, color=TEXT_DARK, space_after=1)
    add_paragraph(tf4, "Filters are sent directly to the Gemini API prompt to adjust attractions and dining suggestions.", size=10.5, color=TEXT_MUTED, space_after=8)
    add_paragraph(tf4, "🚀 Generation UI", size=11.5, bold=True, color=TEXT_DARK, space_after=1)
    add_paragraph(tf4, "A loading overlay guides users with rotating travel planning tips until the confetti transition.", size=10.5, color=TEXT_MUTED)

def make_slide_7(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    draw_header_footer(slide, "Interactive Experience: Trip Details", "A dashboard showing complete itinerary analytics and checklists")
    
    col_w = Inches(3.64)
    col_h = Inches(4.8)
    top_y = Inches(1.8)
    
    # Card 1: Daily Schedule & Map
    tf1 = draw_card(slide, Inches(0.8), top_y, col_w, col_h, "Daily Schedule & Map", "Time-anchored itinerary guides")
    add_paragraph(tf1, "▪ Chronological Timeline", size=13, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf1, "Arranges attractions into Morning, Afternoon, and Evening slots with start times, duration, and transit recommendations.", size=11.5, color=TEXT_MUTED, space_after=12)
    add_paragraph(tf1, "▪ Coordinate Mapping", size=13, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf1, "Each activity has geolocated coordinates mapping coordinates directly for visual travel guide lines.", size=11.5, color=TEXT_MUTED, space_after=12)
    add_paragraph(tf1, "▪ Cost Details", size=13, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf1, "Lists admission fees and activity costs, allowing easy visibility of daily costs.", size=11.5, color=TEXT_MUTED)

    # Card 2: Weather & Budget Tracker
    tf2 = draw_card(slide, Inches(4.84), top_y, col_w, col_h, "Weather & Budget Tracker", "Live environmental and financial stats")
    add_paragraph(tf2, "▪ Live Weather Integration", size=13, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf2, "Connects to OpenWeatherMap API to display the destination's 5-day temperature, rainfall, and wind forecast.", size=11.5, color=TEXT_MUTED, space_after=12)
    add_paragraph(tf2, "▪ Budget Breakdown UI", size=13, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf2, "An interactive budget estimator displaying transport, lodging, activities, and food costs in a clear pie-chart style.", size=11.5, color=TEXT_MUTED, space_after=12)
    add_paragraph(tf2, "▪ Remaining Balance Meter", size=13, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf2, "Compares total expenses with the user's budget ceiling, highlighting cost overflows.", size=11.5, color=TEXT_MUTED)

    # Card 3: Packing & Local Tips
    tf3 = draw_card(slide, Inches(8.88), top_y, col_w, col_h, "Packing List & Tips", "AI-curated recommendations and checklists")
    add_paragraph(tf3, "▪ Custom Packing Checklists", size=13, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf3, "Displays checkable lists for documents, gadgets, clothes, and toiletries tailored to the destination's climate.", size=11.5, color=TEXT_MUTED, space_after=12)
    add_paragraph(tf3, "▪ Local Rules & Culture", size=13, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf3, "Curates tips regarding local dining etiquette, tipping standards, dress codes, and basic phrasing.", size=11.5, color=TEXT_MUTED, space_after=12)
    add_paragraph(tf3, "▪ Safety Guidelines", size=13, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf3, "Includes emergency contacts, tourist helpline numbers, and safety tips for transport and scams.", size=11.5, color=TEXT_MUTED)

def make_slide_8(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    draw_header_footer(slide, "Interactive Agent: AI Chat Assistant", "Pravasi - Conversational travel advisor for quick modifications")
    
    top_y = Inches(1.8)
    col_h = Inches(4.8)
    
    # Left Card: The Chat Assistant
    tf_left = draw_card(slide, Inches(0.8), top_y, Inches(7.4), col_h, "The Pravasi Chatbot Experience", "Real-time travel assistant integrated directly into your workspace")
    add_paragraph(tf_left, "▪ Seamless Conversational Overlay", size=14, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf_left, "A toggleable side-chat widget built into the trip detail view, ensuring users don't have to leave their active schedule to get support.", size=12, color=TEXT_MUTED, space_after=14)
    add_paragraph(tf_left, "▪ Dynamic Itinerary Modifications", size=14, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf_left, "Users can request real-time modifications (e.g. 'swap day 3 afternoon for trekking') which are updated in the database dynamically.", size=12, color=TEXT_MUTED, space_after=14)
    add_paragraph(tf_left, "▪ Regional & Cultural Guidance", size=14, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf_left, "Configured with specialized system instructions to provide authentic local guidance (such as Karnataka Tourism details, local food tips, and rules).", size=12, color=TEXT_MUTED)

    # Right Card: Mock Conversation
    tf_right = draw_card(slide, Inches(8.68), top_y, Inches(3.84), col_h, "Pravasi Chat Interface", "Sample User Interaction", bg_color=RGBColor(15, 23, 42), border_color=PRIMARY_BLUE, is_dark=True)
    add_paragraph(tf_right, "👤 User", size=11.5, bold=True, color=PRIMARY_BLUE, space_after=1)
    add_paragraph(tf_right, "\"Can I visit Goa in July during monsoons?\"", size=10.5, color=TEXT_WHITE, space_after=10)
    add_paragraph(tf_right, "🤖 Pravasi (AI)", size=11.5, bold=True, color=ACCENT_TEAL, space_after=1)
    add_paragraph(tf_right, "\"Goa in July is beautiful and lush, but please note:\n• Rough seas: Swimming is strictly prohibited and water sports are closed.\n• Stays: Hotels are discounted by 40-50%.\n• Activities: Heritage walks in Panaji and Dudhsagar waterfall trekking are excellent!\"", size=10, color=RGBColor(226, 232, 240))

def make_slide_9(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    draw_header_footer(slide, "Admin Panel & Insights", "A central dashboard for server monitoring and user analytics")
    
    top_y = Inches(1.8)
    col_w = Inches(5.6)
    col_h = Inches(4.8)
    
    # Card 1: API & Usage Analytics
    tf1 = draw_card(slide, Inches(0.8), top_y, col_w, col_h, "API Usage & Latency Tracker", "Monitoring core platform services")
    add_paragraph(tf1, "▪ Gemini Token Tracking", size=13.5, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf1, "Tracks absolute token counts and model generation costs for the Google Gemini API to prevent billing spikes.", size=11.5, color=TEXT_MUTED, space_after=12)
    add_paragraph(tf1, "▪ API Response Latency", size=13.5, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf1, "Logs endpoint latency for key itineraries and weather updates to discover slow database queries and optimize routes.", size=11.5, color=TEXT_MUTED, space_after=12)
    add_paragraph(tf1, "▪ Rate Limiting & Failbacks", size=13.5, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf1, "Monitors user rate limits (to prevent script abuses) and reports fallback activations (when third-party services fail).", size=11.5, color=TEXT_MUTED)

    # Card 2: User & Data Administration
    tf2 = draw_card(slide, Inches(6.93), top_y, col_w, col_h, "User Account & Data Manager", "Security controls and usage statistics")
    add_paragraph(tf2, "▪ Global Statistics Cards", size=13.5, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf2, "Displays high-level indicators: total registered users, total active itineraries generated, average trip length, and top travel styles.", size=11.5, color=TEXT_MUTED, space_after=12)
    add_paragraph(tf2, "▪ User Activity Logs", size=13.5, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf2, "Lists recent logins, new sign-ups, and user-initiated itinerary modifications for security audits.", size=11.5, color=TEXT_MUTED, space_after=12)
    add_paragraph(tf2, "▪ API Key Configurations", size=13.5, bold=True, color=TEXT_DARK, space_after=2)
    add_paragraph(tf2, "Secure portal to check active credentials, edit prompt system instructions, and rotate API keys without code redeployment.", size=11.5, color=TEXT_MUTED)

def make_slide_10(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_background(slide, DARK_BG)
    
    # Top title
    tf = add_textbox(slide, Inches(0.8), Inches(0.4), Inches(11.73), Inches(1.1))
    add_paragraph(tf, "Future Roadmap", size=32, bold=True, color=TEXT_WHITE, space_after=2)
    add_paragraph(tf, "Next phases of the AI Travel Planner expansion", size=14, color=PRIMARY_BLUE)
    
    # Horizontal divider
    divider = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.4), Inches(1.5), Inches(0.04))
    divider.fill.solid()
    divider.fill.fore_color.rgb = PRIMARY_BLUE
    divider.line.fill.background()
    
    top_y = Inches(1.9)
    col_w = Inches(3.64)
    col_h = Inches(4.4)
    
    # Card 1: Collaboration
    tf1 = draw_card(slide, Inches(0.8), top_y, col_w, col_h, "1. Collaborative Planning", "Social Travel Integration", bg_color=RGBColor(15, 23, 42), border_color=PRIMARY_BLUE, is_dark=True)
    add_paragraph(tf1, "▪ Shared Live Links", size=11.5, bold=True, color=TEXT_WHITE, space_after=2)
    add_paragraph(tf1, "Enables users to share live read-only links with friends or generate custom PDF prints.", size=10.5, color=TEXT_MUTED, space_after=10)
    add_paragraph(tf1, "▪ Group Travel Rooms", size=11.5, bold=True, color=TEXT_WHITE, space_after=2)
    add_paragraph(tf1, "Allows friends to edit itineraries, select attractions, and review weather together in real-time.", size=10.5, color=TEXT_MUTED, space_after=10)
    add_paragraph(tf1, "▪ Split Bill Estimator", size=11.5, bold=True, color=TEXT_WHITE, space_after=2)
    add_paragraph(tf1, "Includes shared expense splitting tools directly inside the trip details panel.", size=10.5, color=TEXT_MUTED)

    # Card 2: Offline & Mobile
    tf2 = draw_card(slide, Inches(4.84), top_y, col_w, col_h, "2. Offline-First PWA", "Mobile-Optimized Experience", bg_color=RGBColor(15, 23, 42), border_color=PRIMARY_BLUE, is_dark=True)
    add_paragraph(tf2, "▪ Progressive Web App", size=11.5, bold=True, color=TEXT_WHITE, space_after=2)
    add_paragraph(tf2, "Converts the frontend into an offline-first PWA, caching the generated schedules local-side.", size=10.5, color=TEXT_MUTED, space_after=10)
    add_paragraph(tf2, "▪ Offline Maps", size=11.5, bold=True, color=TEXT_WHITE, space_after=2)
    add_paragraph(tf2, "Caches geographic markers and maps offline to let travelers review spots without cellular service.", size=10.5, color=TEXT_MUTED, space_after=10)
    add_paragraph(tf2, "▪ Push Notification Alerts", size=11.5, bold=True, color=TEXT_WHITE, space_after=2)
    add_paragraph(tf2, "Alerts users regarding flight delays, upcoming checklist tasks, or weather warnings in real-time.", size=10.5, color=TEXT_MUTED)

    # Card 3: Smart Bookings
    tf3 = draw_card(slide, Inches(8.88), top_y, col_w, col_h, "3. Smart Bookings", "Integrated Booking Flow", bg_color=RGBColor(15, 23, 42), border_color=PRIMARY_BLUE, is_dark=True)
    add_paragraph(tf3, "▪ Hotel & Flight Partners", size=11.5, bold=True, color=TEXT_WHITE, space_after=2)
    add_paragraph(tf3, "Integrates with aggregate APIs to let users secure hotel rooms and transit seats matching their budget.", size=10.5, color=TEXT_MUTED, space_after=10)
    add_paragraph(tf3, "▪ Tour Guide Bookings", size=11.5, bold=True, color=TEXT_WHITE, space_after=2)
    add_paragraph(tf3, "Links recommended activities with local booking services to buy entry tickets directly in-app.", size=10.5, color=TEXT_MUTED, space_after=10)
    add_paragraph(tf3, "▪ One-Click Checkout", size=11.5, bold=True, color=TEXT_WHITE, space_after=2)
    add_paragraph(tf3, "Combines flight, hotel, and attraction ticket checkout into a single checkout system.", size=10.5, color=TEXT_MUTED)

# ---------------------------------------------------------
# MAIN COMPILER
# ---------------------------------------------------------
def main():
    print("Initializing PowerPoint Generator...")
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    
    print("Building slides...")
    make_slide_1(prs)
    make_slide_2(prs)
    make_slide_3(prs)
    make_slide_4(prs)
    make_slide_5(prs)
    make_slide_6(prs)
    make_slide_7(prs)
    make_slide_8(prs)
    make_slide_9(prs)
    make_slide_10(prs)
    
    output_filename = "AI_Travel_Planner_Presentation.pptx"
    print(f"Saving presentation to '{output_filename}'...")
    prs.save(output_filename)
    print("PowerPoint presentation successfully generated!")

if __name__ == "__main__":
    main()
