import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_presentation():
    prs = Presentation()
    # 16:9 widescreen
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_slide_layout = prs.slide_layouts[6]

    # Theme Colors
    BG_COLOR = RGBColor(13, 13, 18)       # Midnight Caviar
    CARD_BG = RGBColor(22, 22, 30)        # Elevated Obsidian
    CARD_BORDER = RGBColor(218, 185, 120) # Champagne Gold
    GOLD = RGBColor(218, 185, 120)        # Champagne Gold
    GOLD_LIGHT = RGBColor(247, 232, 197)  # Pale Gold
    WHITE = RGBColor(248, 247, 244)       # Platinum Silk
    MUTED = RGBColor(165, 160, 150)       # Warm Taupe Muted
    ACCENT_BLUE = RGBColor(80, 150, 240)
    ACCENT_GREEN = RGBColor(60, 190, 120)
    ACCENT_ORANGE = RGBColor(245, 130, 60)

    def set_slide_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_COLOR
        bg.line.fill.background() # no line

    def add_header(slide, category, title, slide_num=None):
        # Category / Kicker
        tb_cat = slide.shapes.add_textbox(Inches(0.8), Inches(0.45), Inches(11.5), Inches(0.4))
        p_cat = tb_cat.text_frame.paragraphs[0]
        p_cat.text = category.upper()
        p_cat.font.size = Pt(11)
        p_cat.font.bold = True
        p_cat.font.color.rgb = GOLD
        p_cat.font.name = 'Trebuchet MS'

        # Main Title
        tb_title = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(11.5), Inches(0.8))
        p_title = tb_title.text_frame.paragraphs[0]
        p_title.text = title
        p_title.font.size = Pt(26)
        p_title.font.bold = True
        p_title.font.color.rgb = WHITE
        p_title.font.name = 'Georgia'

        if slide_num:
            tb_num = slide.shapes.add_textbox(Inches(11.5), Inches(0.45), Inches(1.0), Inches(0.4))
            p_num = tb_num.text_frame.paragraphs[0]
            p_num.text = f"{slide_num:02d} / 08"
            p_num.alignment = PP_ALIGN.RIGHT
            p_num.font.size = Pt(11)
            p_num.font.color.rgb = MUTED
            p_num.font.name = 'Trebuchet MS'

    def create_card(slide, left, top, width, height, title="", title_color=GOLD):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = RGBColor(45, 45, 60)
        card.line.width = Pt(1)

        if title:
            tb = slide.shapes.add_textbox(left + Inches(0.2), top + Inches(0.15), width - Inches(0.4), Inches(0.5))
            p = tb.text_frame.paragraphs[0]
            p.text = title
            p.font.size = Pt(15)
            p.font.bold = True
            p.font.color.rgb = title_color
            p.font.name = 'Georgia'
        return card

    # ==========================================
    # SLIDE 1: TITLE SLIDE
    # ==========================================
    s1 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s1)

    # Ambient Card Center
    main_card = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.5), Inches(1.0), Inches(10.333), Inches(5.5))
    main_card.fill.solid()
    main_card.fill.fore_color.rgb = CARD_BG
    main_card.line.color.rgb = CARD_BORDER
    main_card.line.width = Pt(1.5)

    tb = s1.shapes.add_textbox(Inches(2.0), Inches(1.5), Inches(9.333), Inches(1.5))
    tf = tb.text_frame
    p0 = tf.paragraphs[0]
    p0.text = "CSE FESTIVAL — INNOVESTA 2026"
    p0.alignment = PP_ALIGN.CENTER
    p0.font.size = Pt(12)
    p0.font.bold = True
    p0.font.color.rgb = GOLD
    p0.font.name = 'Trebuchet MS'

    p1 = tf.add_paragraph()
    p1.text = "IRONPULSE"
    p1.alignment = PP_ALIGN.CENTER
    p1.font.size = Pt(54)
    p1.font.bold = True
    p1.font.color.rgb = GOLD_LIGHT
    p1.font.name = 'Georgia'

    p2 = tf.add_paragraph()
    p2.text = "Haute Performance Fitness, Attendance & Lifestyle System"
    p2.alignment = PP_ALIGN.CENTER
    p2.font.size = Pt(18)
    p2.font.color.rgb = WHITE
    p2.font.name = 'Georgia'

    # Divider bar
    div = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(5.666), Inches(3.9), Inches(2.0), Inches(0.03))
    div.fill.solid()
    div.fill.fore_color.rgb = GOLD
    div.line.fill.background()

    # Meta Info
    tb_meta = s1.shapes.add_textbox(Inches(2.0), Inches(4.3), Inches(9.333), Inches(1.8))
    tf_meta = tb_meta.text_frame
    
    p3 = tf_meta.paragraphs[0]
    p3.text = "Presenter: Rahasin Kabir | Department of Computer Science & Engineering"
    p3.alignment = PP_ALIGN.CENTER
    p3.font.size = Pt(14)
    p3.font.color.rgb = WHITE
    p3.font.name = 'Trebuchet MS'

    p4 = tf_meta.add_paragraph()
    p4.text = "Live Deployment: https://rahasinkabir-ai.github.io/gym-tracker/"
    p4.alignment = PP_ALIGN.CENTER
    p4.font.size = Pt(12)
    p4.font.bold = True
    p4.font.color.rgb = GOLD
    p4.font.name = 'Courier New'

    p5 = tf_meta.add_paragraph()
    p5.text = "Offline-First PWA • Android APK • Real-Time Firestore Sync"
    p5.alignment = PP_ALIGN.CENTER
    p5.font.size = Pt(11)
    p5.font.color.rgb = MUTED
    p5.font.name = 'Trebuchet MS'

    # ==========================================
    # SLIDE 2: THE REAL-WORLD PROBLEM
    # ==========================================
    s2 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s2)
    add_header(s2, "Problem Identification", "The 3-App Dilemma in Modern Gym Fitness", 2)

    problems = [
        ("01", "Fragmented Tooling", 
         "Gym-goers juggle 3 to 4 separate apps:\n• Spreadsheets for weights/sets\n• Standalone stopwatch for rest\n• Notes app for meal budgets\nNo cohesive central source of truth.", ACCENT_ORANGE),
        ("02", "In-Gym Friction", 
         "High-intensity workouts leave seconds to log:\n• Tedious multi-step form modals\n• Apps locking out without active WiFi\n• Screen timeouts losing unsaved sets\nInterrupts flow state and workout tempo.", ACCENT_BLUE),
        ("03", "The Dropout Phenomenon", 
         "50%+ of new gym members quit in 6 months:\n• Zero streak accountability\n• Lack of visual progression metrics\n• Neglecting recurring gym & diet costs\nDiscipline collapses without holistic tracking.", ACCENT_GREEN)
    ]

    for i, (num, title, desc, color) in enumerate(problems):
        x = Inches(0.8 + i * 4.0)
        y = Inches(1.7)
        w = Inches(3.7)
        h = Inches(4.2)
        create_card(s2, x, y, w, h)

        # Number Badge
        tb_num = s2.shapes.add_textbox(x + Inches(0.25), y + Inches(0.2), Inches(1.5), Inches(0.4))
        p = tb_num.text_frame.paragraphs[0]
        p.text = num
        p.font.size = Pt(22)
        p.font.bold = True
        p.font.color.rgb = color
        p.font.name = 'Trebuchet MS'

        # Title
        tb_t = s2.shapes.add_textbox(x + Inches(0.25), y + Inches(0.7), w - Inches(0.5), Inches(0.6))
        p = tb_t.text_frame.paragraphs[0]
        p.text = title
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = WHITE
        p.font.name = 'Georgia'

        # Description
        tb_d = s2.shapes.add_textbox(x + Inches(0.25), y + Inches(1.35), w - Inches(0.5), Inches(2.6))
        tf_d = tb_d.text_frame
        tf_d.word_wrap = True
        lines = desc.split('\n')
        for idx, line in enumerate(lines):
            p = tf_d.paragraphs[0] if idx == 0 else tf_d.add_paragraph()
            p.text = line
            p.font.size = Pt(12)
            p.font.color.rgb = MUTED if line.startswith('•') else WHITE
            p.font.name = 'Trebuchet MS'

    # Bottom Callout Bar
    callout = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.15), Inches(11.733), Inches(0.85))
    callout.fill.solid()
    callout.fill.fore_color.rgb = RGBColor(30, 26, 20)
    callout.line.color.rgb = GOLD
    callout.line.width = Pt(1)
    
    tb_c = s2.shapes.add_textbox(Inches(1.0), Inches(6.25), Inches(11.333), Inches(0.65))
    p_c = tb_c.text_frame.paragraphs[0]
    p_c.text = "🎯 Core Need: An ultra-fast, zero-friction system that unifies Training, Discipline & Finances in one pane."
    p_c.font.size = Pt(13)
    p_c.font.bold = True
    p_c.font.color.rgb = GOLD_LIGHT
    p_c.font.name = 'Trebuchet MS'

    # ==========================================
    # SLIDE 3: THE PROPOSED SOLUTION
    # ==========================================
    s3 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s3)
    add_header(s3, "Product Architecture", "IronPulse: The Haute Performance Triad", 3)

    pillars = [
        ("🏋️ Granular Training Engine", 
         [
             "Progressive Overload Tracking: Reps, weights & calculated volume per workout session.",
             "Muscle Split System: Dedicated modules for Push/Pull/Legs, Arnold Splits & Custom splits.",
             "1-Tap Set Completion: Interactive set pills that turn gold with strike-through and rest prompt."
         ]),
        ("📅 Discipline & Streaks", 
         [
             "Automated Attendance Detection: Logging any workout immediately registers attendance.",
             "Heatmap Calendar Grid: Full monthly view with high-contrast attended gold badges.",
             "Streak Engine: Dynamic flame counter and 60 FPS champagne celebration sparkles on milestones."
         ]),
        ("💳 Health & Fee Budgeting", 
         [
             "Dual-Pillar Expense Tracking: Gym memberships & recurring diet/supplement spending.",
             "Visual Allocation Ratios: Live dynamic percentage bar indicating fitness budget split.",
             "Due Date Auditing: Overdue and pending fee detection to prevent membership lapses."
         ])
    ]

    for i, (title, points) in enumerate(pillars):
        x = Inches(0.8 + i * 4.0)
        y = Inches(1.7)
        w = Inches(3.7)
        h = Inches(5.1)
        create_card(s3, x, y, w, h, title)

        tb_pts = s3.shapes.add_textbox(x + Inches(0.25), y + Inches(0.9), w - Inches(0.5), Inches(3.9))
        tf_pts = tb_pts.text_frame
        tf_pts.word_wrap = True
        
        for idx, pt in enumerate(points):
            p = tf_pts.paragraphs[0] if idx == 0 else tf_pts.add_paragraph()
            p.text = f"• {pt}"
            p.font.size = Pt(12)
            p.font.color.rgb = WHITE
            p.font.name = 'Trebuchet MS'
            p.space_after = Pt(14)

    # ==========================================
    # SLIDE 4: ERGONOMIC INNOVATIONS
    # ==========================================
    s4 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s4)
    add_header(s4, "Ergonomic Usability", "Engineered for In-Gym Execution & Single-Thumb Control", 4)

    innovations = [
        ("🔍 Spotlight Command Hub (Ctrl+K / ⌘K)", 
         "A global Raycast-style search palette accessible via shortcut or header.\nInstant jump to any section, filter routines, or execute quick actions in < 0.5 seconds.",
         Inches(0.8), Inches(1.7), Inches(5.7), Inches(2.4)),
        ("🎙️ Hands-Free Voice Protocol (Hotkey: V)", 
         "Zero-touch in-gym voice assistant using Web Speech API & SpeechSynthesis.\nSupports natural voice commands: timer, check-in, 1RM calculator, navigation & audio feedback.",
         Inches(6.8), Inches(1.7), Inches(5.7), Inches(2.4)),
        ("⏱️ Picture-in-Picture Floating HUD", 
         "When rest timer starts, navigating to other views docks a floating mini-player.\nDisplays live countdown, +30s boost, pause/reset, and Web Audio melodic chimes on completion.",
         Inches(0.8), Inches(4.4), Inches(5.7), Inches(2.4)),
        ("⚡ 1-Tap Quick Action Speed-Dial (FAB)", 
         "Floating action button pinned at bottom-right for instant one-thumb reach.\nOpens 1-tap shortcuts: Log Workout, Voice Assistant, 1RM Engine, 90s Rest, or Check-In.",
         Inches(6.8), Inches(4.4), Inches(5.7), Inches(2.4))
    ]

    for title, desc, left, top, width, height in innovations:
        create_card(s4, left, top, width, height, title)
        tb = s4.shapes.add_textbox(left + Inches(0.25), top + Inches(0.8), width - Inches(0.5), height - Inches(0.9))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = desc
        p.font.size = Pt(12)
        p.font.color.rgb = WHITE
        p.font.name = 'Trebuchet MS'

    # ==========================================
    # SLIDE 5: SYSTEM ARCHITECTURE & TECH STACK
    # ==========================================
    s5 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s5)
    add_header(s5, "Software Engineering", "Technical Underpinnings: Zero-Bloat, Offline-First PWA", 5)

    # 4 Stack Cards
    layers = [
        ("Client Tier", "Vanilla JS (ES6+)\nTailwind CSS\nSemantic Luxury Tokens\nBodoni / Tenor Typo", Inches(0.8), Inches(1.7), Inches(2.7), Inches(4.2)),
        ("Storage & Cache", "Service Worker (Cache v10)\nLocal Storage Resilience\nIndexed Asset Pre-caching\n100% Offline Capability", Inches(3.8), Inches(1.7), Inches(2.7), Inches(4.2)),
        ("Cloud Sync Tier", "Firebase Cloud Firestore\nGoogle Identity Auth\nMulti-Device Sync\nZero-Cost Serverless", Inches(6.8), Inches(1.7), Inches(2.7), Inches(4.2)),
        ("Multi-Target Deploy", "Progressive Web App (PWA)\nStandalone Android APK\nDesktop Web (GitHub Pages)\nTotal Payload < 2 MB", Inches(9.8), Inches(1.7), Inches(2.7), Inches(4.2)),
    ]

    for layer, details, left, top, width, height in layers:
        create_card(s5, left, top, width, height, layer, GOLD)
        tb = s5.shapes.add_textbox(left + Inches(0.2), top + Inches(0.9), width - Inches(0.4), height - Inches(1.1))
        tf = tb.text_frame
        tf.word_wrap = True
        for idx, line in enumerate(details.split('\n')):
            p = tf.paragraphs[0] if idx == 0 else tf.add_paragraph()
            p.text = f"✔ {line}"
            p.font.size = Pt(12)
            p.font.color.rgb = WHITE
            p.font.name = 'Trebuchet MS'
            p.space_after = Pt(12)

    # Bottom Banner
    tech_banner = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.15), Inches(11.733), Inches(0.85))
    tech_banner.fill.solid()
    tech_banner.fill.fore_color.rgb = CARD_BG
    tech_banner.line.color.rgb = CARD_BORDER
    tech_banner.line.width = Pt(1)

    tb_tb = s5.shapes.add_textbox(Inches(1.0), Inches(6.25), Inches(11.333), Inches(0.65))
    p_tb = tb_tb.text_frame.paragraphs[0]
    p_tb.text = "⚡ Engineering Metric: Zero heavy frameworks (React/Vue/Node server overhead). Boots in < 250ms on mobile."
    p_tb.font.size = Pt(12)
    p_tb.font.bold = True
    p_tb.font.color.rgb = GOLD_LIGHT
    p_tb.font.name = 'Trebuchet MS'

    # ==========================================
    # SLIDE 6: UI & SENSORY DESIGN
    # ==========================================
    s6 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s6)
    add_header(s6, "Biomechanical Intelligence", "Algorithmic Precision & Haute Aesthetic", 6)

    visual_features = [
        ("🗺️ Muscular Anatomy Heatmap", 
         "SVG anatomical front/back visualizer scanning 7-day cumulative set volume.\nDynamically maps 8 muscle groups across Cold, Active, Balanced, Optimal Gold, and CNS Fatigue.",
         Inches(0.8), Inches(1.7), Inches(5.7), Inches(2.4)),
        ("🧬 1RM & Progressive Overload Engine", 
         "Multi-equation consensus (Epley, Brzycki & Lombardi models).\nCalculates true 1RM, 50%-95% working zones, and automated +2.5kg/+5kg next-session overload.",
         Inches(6.8), Inches(1.7), Inches(5.7), Inches(2.4)),
        ("⚡ Athletic Readiness & Circadian Protocol", 
         "Daily composite biometric index (Sleep, Muscle Freshness, CNS Energy).\n6-phase daily timeline covering hydration, pre-workout fuel, training windows, and recovery.",
         Inches(0.8), Inches(4.4), Inches(5.7), Inches(2.4)),
        ("✨ 60 FPS Particle Canvas & Atelier Palette", 
         "Midnight Caviar (#08080A) and Champagne Gold (#DAB978) dark palette.\nHardware-accelerated 55+ particle confetti physics on attendance check-in and set PRs.",
         Inches(6.8), Inches(4.4), Inches(5.7), Inches(2.4))
    ]

    for title, desc, left, top, width, height in visual_features:
        create_card(s6, left, top, width, height, title)
        tb = s6.shapes.add_textbox(left + Inches(0.25), top + Inches(0.8), width - Inches(0.5), height - Inches(0.9))
        tf = tb.text_frame
        tf.word_wrap = True
        for idx, line in enumerate(desc.split('\n')):
            p = tf.paragraphs[0] if idx == 0 else tf.add_paragraph()
            p.text = line
            p.font.size = Pt(12)
            p.font.color.rgb = WHITE
            p.font.name = 'Trebuchet MS'
            p.space_after = Pt(4)

    # ==========================================
    # SLIDE 7: REAL-WORLD IMPACT & METRICS
    # ==========================================
    s7 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s7)
    add_header(s7, "Outcome & Value", "Quantifiable Real-World Significance", 7)

    impacts = [
        ("⏱️ 15-20 Min", "Saved Per Session", "Eliminates rest timer app switching, distraction, and manual spreadsheet math during training.", ACCENT_BLUE),
        ("🔥 +40% Boost", "In Habit Retention", "Gamified streak persistence and instant sensory feedback make fitness adherence psychologically rewarding.", ACCENT_ORANGE),
        ("💰 100% Free", "Zero Subscriptions", "Completely free of paywalls, ads, and locked analytics, saving lifters $60-$120 annually.", ACCENT_GREEN),
        ("⚡ < 2 MB", "Instant Footprint", "Works on any low-end smartphone or laptop browser instantly without Play Store overhead.", GOLD)
    ]

    for i, (metric, label, desc, color) in enumerate(impacts):
        x = Inches(0.8 + i * 3.0)
        y = Inches(1.7)
        w = Inches(2.75)
        h = Inches(4.3)
        create_card(s7, x, y, w, h)

        tb_m = s7.shapes.add_textbox(x + Inches(0.15), y + Inches(0.3), w - Inches(0.3), Inches(0.8))
        p = tb_m.text_frame.paragraphs[0]
        p.text = metric
        p.font.size = Pt(22)
        p.font.bold = True
        p.font.color.rgb = color
        p.font.name = 'Trebuchet MS'

        tb_l = s7.shapes.add_textbox(x + Inches(0.15), y + Inches(1.1), w - Inches(0.3), Inches(0.5))
        p = tb_l.text_frame.paragraphs[0]
        p.text = label
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = WHITE
        p.font.name = 'Georgia'

        tb_d = s7.shapes.add_textbox(x + Inches(0.15), y + Inches(1.8), w - Inches(0.3), Inches(2.2))
        tf_d = tb_d.text_frame
        tf_d.word_wrap = True
        p = tf_d.paragraphs[0]
        p.text = desc
        p.font.size = Pt(12)
        p.font.color.rgb = MUTED
        p.font.name = 'Trebuchet MS'

    # Bottom Quote
    bq = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.2), Inches(11.733), Inches(0.8))
    bq.fill.solid()
    bq.fill.fore_color.rgb = CARD_BG
    bq.line.color.rgb = CARD_BORDER
    bq.line.width = Pt(1)

    tb_q = s7.shapes.add_textbox(Inches(1.0), Inches(6.28), Inches(11.333), Inches(0.6))
    p_q = tb_q.text_frame.paragraphs[0]
    p_q.text = "“Consistency is forged in the absence of friction.” — IronPulse Design Philosophy"
    p_q.alignment = PP_ALIGN.CENTER
    p_q.font.size = Pt(13)
    p_q.font.italic = True
    p_q.font.color.rgb = GOLD_LIGHT
    p_q.font.name = 'Georgia'

    # ==========================================
    # SLIDE 8: CONCLUSION & LIVE DEMO
    # ==========================================
    s8 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s8)
    add_header(s8, "Ready For Demonstration", "Experience IronPulse Live", 8)

    # Left Column: Summary
    card_l = create_card(s8, Inches(0.8), Inches(1.7), Inches(5.7), Inches(5.1), "Project Summary")
    tb_sum = s8.shapes.add_textbox(Inches(1.05), Inches(2.5), Inches(5.2), Inches(4.0))
    tf_sum = tb_sum.text_frame
    tf_sum.word_wrap = True
    
    summary_pts = [
        "Complete Fitness Lifecycle: Sets, attendance streaks, timers & fitness budget.",
        "Algorithmic Intelligence: 1RM multi-equation engine, SVG anatomy heatmap & daily readiness.",
        "Ergonomic & Hands-Free UX: Voice Assistant Protocol (V), Spotlight Hub (⌘K) & Floating HUD.",
        "Zero Framework Overhead: Offline-first PWA caching with Firebase cloud sync & 60 FPS particles."
    ]
    for idx, pt in enumerate(summary_pts):
        p = tf_sum.paragraphs[0] if idx == 0 else tf_sum.add_paragraph()
        p.text = f"✔ {pt}"
        p.font.size = Pt(13)
        p.font.color.rgb = WHITE
        p.font.name = 'Trebuchet MS'
        p.space_after = Pt(16)

    # Right Column: Access & QR Box
    card_r = create_card(s8, Inches(6.8), Inches(1.7), Inches(5.7), Inches(5.1), "Live Links & Repository")
    tb_acc = s8.shapes.add_textbox(Inches(7.05), Inches(2.5), Inches(5.2), Inches(4.0))
    tf_acc = tb_acc.text_frame
    tf_acc.word_wrap = True

    access_pts = [
        ("🌐 Live Web Application", "https://rahasinkabir-ai.github.io/gym-tracker/"),
        ("📂 Open-Source Repository", "https://github.com/rahasinkabir-ai/gym-tracker"),
        ("🤖 Standalone Android APK", "Direct install package in repo releases"),
        ("🏆 Festival Presentation", "CSE Festival — Innovesta 2026")
    ]
    for idx, (label, val) in enumerate(access_pts):
        p_l = tf_acc.paragraphs[0] if idx == 0 else tf_acc.add_paragraph()
        p_l.text = label
        p_l.font.size = Pt(13)
        p_l.font.bold = True
        p_l.font.color.rgb = GOLD
        p_l.font.name = 'Georgia'

        p_v = tf_acc.add_paragraph()
        p_v.text = val
        p_v.font.size = Pt(11)
        p_v.font.color.rgb = WHITE
        p_v.font.name = 'Courier New'
        p_v.space_after = Pt(14)

    # Save presentation
    output_path = "IronPulse_Innovesta_2026.pptx"
    prs.save(output_path)
    print(f"Presentation saved successfully to {output_path}")

if __name__ == "__main__":
    create_presentation()
