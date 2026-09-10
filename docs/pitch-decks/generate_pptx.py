import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_pitch_deck():
    prs = Presentation()
    # Set 16:9 Widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6] # blank layout

    # Colors
    BG_DARK = RGBColor(10, 9, 8)
    CARD_BG = RGBColor(22, 20, 18)
    GOLD_PRIMARY = RGBColor(212, 175, 55)
    GOLD_LIGHT = RGBColor(243, 229, 171)
    TEXT_WHITE = RGBColor(255, 255, 255)
    TEXT_MUTED = RGBColor(160, 155, 142)
    CRIMSON = RGBColor(192, 57, 43)

    SERIF_FONT = "Georgia"
    BODY_FONT = "Arial"

    # Image Paths
    IMG_POTTER = "assets/master_potter_artisan.png"
    IMG_PATTA = "assets/products/pattachitra_painting.png"
    IMG_VASE = "assets/products/blue_pottery_vase.png"
    IMG_SAREE = "assets/products/banarasi_saree.png"
    IMG_IMPACT = "assets/artisan_impact.png"

    def set_slide_background(slide):
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = BG_DARK

    def add_header(slide, slide_num, tag_text):
        # Header Badge / Tag
        txBox = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.4))
        tf = txBox.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"SLIDE {slide_num} — {tag_text.upper()}"
        p.font.name = BODY_FONT
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = GOLD_PRIMARY

    def add_title(slide, title_text, subtitle_text=None):
        txBox = slide.shapes.add_textbox(Inches(0.8), Inches(0.8), Inches(11.7), Inches(1.2))
        tf = txBox.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.name = SERIF_FONT
        p.font.size = Pt(28)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE
        
        if subtitle_text:
            p2 = tf.add_paragraph()
            p2.text = subtitle_text
            p2.font.name = BODY_FONT
            p2.font.size = Pt(14)
            p2.font.color.rgb = TEXT_MUTED
            p2.space_before = Pt(6)

    def add_card(slide, left, top, width, height, bg_color=CARD_BG, border_color=GOLD_PRIMARY):
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = bg_color
        shape.line.color.rgb = border_color
        shape.line.width = Pt(1)
        return shape

    # ==========================================
    # SLIDE 1: Title & Tagline
    # ==========================================
    slide1 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide1)
    
    if os.path.exists(IMG_POTTER):
        slide1.shapes.add_picture(IMG_POTTER, Inches(8.5), Inches(1.2), Inches(4.2), Inches(5.6))

    txBox = slide1.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(7.5), Inches(1.4))
    tf = txBox.text_frame
    p = tf.paragraphs[0]
    p.text = "Parampara Heritage"
    p.font.name = SERIF_FONT
    p.font.size = Pt(44)
    p.font.bold = True
    p.font.color.rgb = GOLD_PRIMARY

    add_card(slide1, Inches(0.8), Inches(3.0), Inches(7.5), Inches(1.4), bg_color=RGBColor(25, 22, 18), border_color=GOLD_PRIMARY)
    
    txBox = slide1.shapes.add_textbox(Inches(1.0), Inches(3.1), Inches(7.1), Inches(1.2))
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = '"Direct-to-consumer luxury platform connecting global buyers with certified Indian master artisans."'
    p.font.name = SERIF_FONT
    p.font.size = Pt(18)
    p.font.italic = True
    p.font.bold = True
    p.font.color.rgb = GOLD_LIGHT

    p2 = tf.add_paragraph()
    p2.text = "✓ 10-WORD PLAIN ENGLISH DESCRIPTION"
    p2.font.name = BODY_FONT
    p2.font.size = Pt(10)
    p2.font.bold = True
    p2.font.color.rgb = GOLD_PRIMARY
    p2.space_before = Pt(6)

    txBox = slide1.shapes.add_textbox(Inches(0.8), Inches(4.6), Inches(7.5), Inches(0.8))
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Empowering rural craft lineage through provenance, AI storytelling, and direct fair-trade commerce."
    p.font.name = BODY_FONT
    p.font.size = Pt(13)
    p.font.color.rgb = TEXT_MUTED

    stats = [
        ("420+", "Master Artisans"),
        ("$48.5B", "Heritage TAM"),
        ("85%", "Artisan Share"),
        ("+18% MoM", "GMV Growth")
    ]
    for i, (num, label) in enumerate(stats):
        left = Inches(0.8 + i * 1.85)
        add_card(slide1, left, Inches(5.6), Inches(1.7), Inches(1.2))
        tx = slide1.shapes.add_textbox(left, Inches(5.7), Inches(1.7), Inches(1.0))
        tf = tx.text_frame
        p = tf.paragraphs[0]
        p.text = num
        p.font.name = SERIF_FONT
        p.font.size = Pt(20)
        p.font.bold = True
        p.font.color.rgb = GOLD_PRIMARY
        p.alignment = PP_ALIGN.CENTER
        
        p2 = tf.add_paragraph()
        p2.text = label
        p2.font.name = BODY_FONT
        p2.font.size = Pt(10)
        p2.font.color.rgb = TEXT_MUTED
        p2.alignment = PP_ALIGN.CENTER

    # ==========================================
    # SLIDE 2: The Problem
    # ==========================================
    slide2 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide2)
    add_header(slide2, 2, "The Acute Pain Point")
    add_title(slide2, "An Acute Heritage Crisis Demands Immediate Urgency", "Global craft ecosystems suffer from severe exploitation, counterfeits, and loss of ancestral lineage.")

    problems = [
        ("800% Middleman Markups", "Middlemen capture up to 90% of retail profit margins, leaving artisans under $3/day. 10,000+ artisans abandon crafts annually."),
        ("$15B Counterfeit Market", "Cheap machine-made replicas swamping global markets impersonate authentic Geographical Indication (GI) heritage crafts."),
        ("Zero Digital Provenance", "High-Net-Worth global collectors cannot verify authenticity or artisan lineage, creating deep mistrust in international markets.")
    ]

    for i, (title, desc) in enumerate(problems):
        left = Inches(0.8 + i * 3.95)
        add_card(slide2, left, Inches(2.3), Inches(3.7), Inches(3.6), bg_color=RGBColor(28, 18, 16), border_color=CRIMSON)
        tx = slide2.shapes.add_textbox(left + Inches(0.2), Inches(2.5), Inches(3.3), Inches(3.2))
        tf = tx.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.name = SERIF_FONT
        p.font.size = Pt(20)
        p.font.bold = True
        p.font.color.rgb = RGBColor(255, 107, 107)
        
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.name = BODY_FONT
        p2.font.size = Pt(13)
        p2.font.color.rgb = TEXT_WHITE
        p2.space_before = Pt(14)

    add_card(slide2, Inches(0.8), Inches(6.1), Inches(11.733), Inches(0.9), bg_color=RGBColor(35, 15, 15), border_color=CRIMSON)
    tx = slide2.shapes.add_textbox(Inches(1.0), Inches(6.25), Inches(11.333), Inches(0.6))
    tf = tx.text_frame
    p = tf.paragraphs[0]
    p.text = "CRITICAL URGENCY: Without direct digital fair-trade infrastructure, 40% of India's indigenous craft traditions will vanish within this decade."
    p.font.name = BODY_FONT
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = RGBColor(255, 158, 158)
    p.alignment = PP_ALIGN.CENTER

    # ==========================================
    # SLIDE 3: The Solution / Demo
    # ==========================================
    slide3 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide3)
    add_header(slide3, 3, "Product Solution & Demo")
    add_title(slide3, "The Parampara Platform & Provenance Engine", "Direct artisan commerce paired with digital GI authenticity certificates and Gemini AI cultural storytelling.")

    features = [
        ("Direct-to-Artisan Payouts", "Routes 85% of revenue straight to rural artisan bank accounts and co-ops."),
        ("GI Certificate Generator", "Cryptographically verifiable QR certificates shipped with every physical masterpiece."),
        ("Gemini AI RAG Concierge", "Interactive RAG vector assistant querying 5,000+ GI heritage records."),
        ("Interactive State Map Engine", "Real-time exploration of 28 Indian States & district craft density.")
    ]

    for i, (ft_title, ft_desc) in enumerate(features):
        top = Inches(2.2 + i * 1.15)
        add_card(slide3, Inches(0.8), top, Inches(5.4), Inches(1.0))
        tx = slide3.shapes.add_textbox(Inches(1.0), top + Inches(0.1), Inches(5.0), Inches(0.8))
        tf = tx.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"✓  {ft_title}"
        p.font.name = SERIF_FONT
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = GOLD_PRIMARY
        
        p2 = tf.add_paragraph()
        p2.text = ft_desc
        p2.font.name = BODY_FONT
        p2.font.size = Pt(11)
        p2.font.color.rgb = TEXT_MUTED

    if os.path.exists(IMG_PATTA):
        slide3.shapes.add_picture(IMG_PATTA, Inches(6.6), Inches(2.2), Inches(2.8), Inches(2.2))
    if os.path.exists(IMG_VASE):
        slide3.shapes.add_picture(IMG_VASE, Inches(9.6), Inches(2.2), Inches(2.8), Inches(2.2))
    if os.path.exists(IMG_SAREE):
        slide3.shapes.add_picture(IMG_SAREE, Inches(6.6), Inches(4.6), Inches(2.8), Inches(2.2))

    add_card(slide3, Inches(9.6), Inches(4.6), Inches(2.8), Inches(2.2), bg_color=RGBColor(25,20,16), border_color=GOLD_PRIMARY)
    tx = slide3.shapes.add_textbox(Inches(9.7), Inches(4.7), Inches(2.6), Inches(2.0))
    tf = tx.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "GEMINI RAG AI CONCIERGE"
    p.font.name = SERIF_FONT
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = GOLD_PRIMARY
    p2 = tf.add_paragraph()
    p2.text = '"RAG pipeline indexing 5,000+ GI records for instant craft lineage & authenticity checks."'
    p2.font.name = BODY_FONT
    p2.font.size = Pt(10)
    p2.font.color.rgb = TEXT_WHITE
    p2.space_before = Pt(8)

    # ==========================================
    # SLIDE 4: Market Size (TAM)
    # ==========================================
    slide4 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide4)
    add_header(slide4, 4, "Bottom-Up Market Size")
    add_title(slide4, "$48.5 Billion Global Heritage Luxury Opportunity", "Calculated bottom-up from target high-net-worth diaspora & global art collectors.")

    tams = [
        ("TAM (Total Addressable)", "$48.5B", "Global Handmade Heritage & Luxury Home Decor Market"),
        ("SAM (Serviceable Addressable)", "$3.0B", "2.5M Global Diaspora & Collectors × $1,200 Annual Spend"),
        ("SOM (Target Year 3)", "$120M", "150,000 Active Luxury Buyers × $800 Annual Contract Value")
    ]

    for i, (label, val, desc) in enumerate(tams):
        left = Inches(0.8 + i * 3.95)
        border = GOLD_PRIMARY if i == 2 else RGBColor(100, 85, 30)
        bg = RGBColor(28, 24, 18) if i == 2 else CARD_BG
        add_card(slide4, left, Inches(2.4), Inches(3.7), Inches(3.2), bg_color=bg, border_color=border)
        
        tx = slide4.shapes.add_textbox(left + Inches(0.2), Inches(2.6), Inches(3.3), Inches(2.8))
        tf = tx.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = label
        p.font.name = BODY_FONT
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = GOLD_PRIMARY
        p.alignment = PP_ALIGN.CENTER
        
        p2 = tf.add_paragraph()
        p2.text = val
        p2.font.name = SERIF_FONT
        p2.font.size = Pt(40)
        p2.font.bold = True
        p2.font.color.rgb = GOLD_LIGHT
        p2.alignment = PP_ALIGN.CENTER
        p2.space_before = Pt(10)

        p3 = tf.add_paragraph()
        p3.text = desc
        p3.font.name = BODY_FONT
        p3.font.size = Pt(11)
        p3.font.color.rgb = TEXT_MUTED
        p3.alignment = PP_ALIGN.CENTER
        p3.space_before = Pt(10)

    add_card(slide4, Inches(0.8), Inches(5.9), Inches(11.733), Inches(1.0))
    tx = slide4.shapes.add_textbox(Inches(1.0), Inches(6.05), Inches(11.333), Inches(0.7))
    tf = tx.text_frame
    p = tf.paragraphs[0]
    p.text = "BOTTOM-UP SOM FORMULA:"
    p.font.name = BODY_FONT
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = GOLD_PRIMARY
    p.alignment = PP_ALIGN.CENTER

    p2 = tf.add_paragraph()
    p2.text = "SOM = 150,000 Target Luxury Collectors × $800 Annual Contract Value (ACV) = $120,000,000 (Target Year 3)"
    p2.font.name = SERIF_FONT
    p2.font.size = Pt(16)
    p2.font.bold = True
    p2.font.color.rgb = TEXT_WHITE
    p2.alignment = PP_ALIGN.CENTER
    p2.space_before = Pt(4)

    # ==========================================
    # SLIDE 5: Business Model / Monetization (OPTION 1: MONETIZATION MECHANICS)
    # ==========================================
    slide5 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide5)
    add_header(slide5, 5, "Business Model & Monetization")
    add_title(slide5, "Monetization Mechanics & Target Unit Economics", "Transparent revenue architecture with zero-friction cooperative onboarding and high-margin bespoke sales.")

    models = [
        ("Consumer Marketplace", "15% Commission", "Applied directly on D2C transactions across luxury heritage crafts and GI-certified masterpieces."),
        ("Guild & Co-Op OS", "0% Upfront + 5% Fee", "Zero onboarding barriers for rural cooperatives; automated inventory management and digital storefront tools financed via sales share."),
        ("B2B Corporate & Gifting", "25% - 35% Margin", "Bespoke artisan commissions and bulk authentic sourcing for luxury hotels, diplomatic events, and corporate gifts.")
    ]

    for i, (title, rate, desc) in enumerate(models):
        left = Inches(0.8 + i * 3.95)
        add_card(slide5, left, Inches(2.4), Inches(3.7), Inches(3.0))
        tx = slide5.shapes.add_textbox(left + Inches(0.2), Inches(2.6), Inches(3.3), Inches(2.6))
        tf = tx.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.name = BODY_FONT
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = GOLD_PRIMARY
        
        p2 = tf.add_paragraph()
        p2.text = rate
        p2.font.name = SERIF_FONT
        p2.font.size = Pt(24)
        p2.font.bold = True
        p2.font.color.rgb = TEXT_WHITE
        p2.space_before = Pt(8)

        p3 = tf.add_paragraph()
        p3.text = desc
        p3.font.name = BODY_FONT
        p3.font.size = Pt(10.5)
        p3.font.color.rgb = TEXT_MUTED
        p3.space_before = Pt(10)

    # Unit Economics Targets (Hypothesis)
    add_card(slide5, Inches(0.8), Inches(5.7), Inches(11.733), Inches(1.2))
    tx = slide5.shapes.add_textbox(Inches(1.0), Inches(5.82), Inches(11.333), Inches(0.95))
    tf = tx.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "UNIT ECONOMICS TARGETS (HYPOTHESIS)  |  Target AOV: $200 – $250"
    p.font.name = SERIF_FONT
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = GOLD_LIGHT
    
    p2 = tf.add_paragraph()
    p2.text = "Target Acquisition Strategy: High-efficiency organic cultural content, high-net-worth diaspora partnerships, and self-reinforcing artisan guild referral loops."
    p2.font.name = BODY_FONT
    p2.font.size = Pt(11)
    p2.font.color.rgb = TEXT_MUTED
    p2.space_before = Pt(4)

    # ==========================================
    # SLIDE 6: Traction & Metrics (FIXED TITLE & ADDED WEEKLY METRIC)
    # ==========================================
    slide6 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide6)
    add_header(slide6, 6, "Traction & Key Growth Metrics")
    add_title(slide6, "Month-over-Month Growth Driven by Authentic Provenance", "Demonstrated demand avoiding vanity metrics in favor of organic GMV and artisan retention.")

    add_card(slide6, Inches(0.8), Inches(2.3), Inches(5.8), Inches(4.6))
    tx = slide6.shapes.add_textbox(Inches(1.0), Inches(2.4), Inches(5.4), Inches(4.3))
    tf = tx.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "GROWTH TRACTION HIGHLIGHTS"
    p.font.name = BODY_FONT
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = GOLD_PRIMARY

    t_metrics = [
        ("• Quarterly GMV:", "$185,000 GMV in Q3 2026 (+18% Month-over-Month Growth)"),
        ("• Weekly Buyer Traction:", "+4.2% Week-over-Week (WoW) Active Buyer Growth"),
        ("• Active Master Artisans:", "420+ Certified Artisans across 22 Indian States"),
        ("• Average Order Value:", "$240 AOV across luxury crafts & masterpieces"),
        ("• Retention & Churn:", "44% 90-day repeat purchase rate | 0% Artisan Churn")
    ]
    for lbl, val in t_metrics:
        p = tf.add_paragraph()
        p.text = f"{lbl} {val}"
        p.font.name = BODY_FONT
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_WHITE
        p.space_before = Pt(12)

    if os.path.exists(IMG_IMPACT):
        slide6.shapes.add_picture(IMG_IMPACT, Inches(6.9), Inches(2.3), Inches(5.633), Inches(4.6))

    # ==========================================
    # SLIDE 7: Tech Stack / Architecture (CLARIFIED RAG & DATA PROVENANCE)
    # ==========================================
    slide7 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide7)
    add_header(slide7, 7, "Tech Stack & Edge Architecture")
    add_title(slide7, "High-Efficiency Architecture & AI Storytelling Engine", "Microservices architecture delivering sub-100ms API responses and RAG-powered cultural AI context.")

    stack = [
        ("Edge & Client Layer", "HTML5 & SVG Engine", "Zero-dependency client architecture, responsive SVG state maps, glassmorphism UI."),
        ("Backend API Layer", "Node.js + Express 5", "RESTful API services, JWT security, webhooks for Razorpay & Stripe payments."),
        ("Data & Media Engine", "MongoDB Atlas & Cloudinary", "Cloud MongoDB cluster with WebP image optimization and video delivery CDN."),
        ("AI Intelligence", "Gemini 3.6 RAG Engine", "RAG / Vector Indexing Pipeline querying 5,000+ GI documents via Gemini API.")
    ]

    for i, (layer, tech, desc) in enumerate(stack):
        left = Inches(0.8 + i * 2.95)
        border = GOLD_PRIMARY if i == 3 else RGBColor(80, 70, 40)
        add_card(slide7, left, Inches(2.4), Inches(2.7), Inches(3.6), border_color=border)
        tx = slide7.shapes.add_textbox(left + Inches(0.15), Inches(2.55), Inches(2.4), Inches(3.3))
        tf = tx.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = layer.upper()
        p.font.name = BODY_FONT
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = GOLD_PRIMARY
        
        p2 = tf.add_paragraph()
        p2.text = tech
        p2.font.name = SERIF_FONT
        p2.font.size = Pt(15)
        p2.font.bold = True
        p2.font.color.rgb = TEXT_WHITE
        p2.space_before = Pt(8)

        p3 = tf.add_paragraph()
        p3.text = desc
        p3.font.name = BODY_FONT
        p3.font.size = Pt(11)
        p3.font.color.rgb = TEXT_MUTED
        p3.space_before = Pt(10)

    add_card(slide7, Inches(0.8), Inches(6.2), Inches(11.733), Inches(0.8))
    tx = slide7.shapes.add_textbox(Inches(1.0), Inches(6.35), Inches(11.333), Inches(0.5))
    tf = tx.text_frame
    p = tf.paragraphs[0]
    p.text = "⚡ INFRASTRUCTURE ADVANTAGE: 99.99% Uptime | Sub-100ms Response Times | Encrypted On-Chain/Database Provenance Records"
    p.font.name = BODY_FONT
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = GOLD_LIGHT
    p.alignment = PP_ALIGN.CENTER

    # ==========================================
    # SLIDE 8: Competition & Moat
    # ==========================================
    slide8 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide8)
    add_header(slide8, 8, "Competitive Quadrant & Moat")
    add_title(slide8, "Why Parampara Outperforms Mass Retailers & Legacy Galleries", "Combining high digital scalability with verified digital craft provenance.")

    add_card(slide8, Inches(0.8), Inches(2.3), Inches(5.8), Inches(4.6))
    tx = slide8.shapes.add_textbox(Inches(1.0), Inches(2.5), Inches(5.4), Inches(4.2))
    tf = tx.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "COMPETITIVE POSITIONING QUADRANT"
    p.font.name = BODY_FONT
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = GOLD_PRIMARY

    q_items = [
        ("• PARAMPARA (Winner Top-Right):", "High Digital Scale + Direct Verified GI Provenance."),
        ("• Mass E-Commerce (Etsy/Amazon):", "High Scale, but Low Provenance (Fake crafts, exploited sellers)."),
        ("• Legacy Art Galleries:", "High Provenance, but Low Scale (500% markup, zero digital reach)."),
        ("• Local Craft Fairs:", "Low Scale, Low Reach (Seasonal, local only).")
    ]
    for title, desc in q_items:
        p = tf.add_paragraph()
        p.text = f"{title} {desc}"
        p.font.name = BODY_FONT
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_WHITE
        p.space_before = Pt(12)

    add_card(slide8, Inches(6.9), Inches(2.3), Inches(5.633), Inches(4.6), bg_color=RGBColor(24, 20, 16), border_color=GOLD_PRIMARY)
    tx = slide8.shapes.add_textbox(Inches(7.1), Inches(2.5), Inches(5.233), Inches(4.2))
    tf = tx.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "OUR DEFENSIBLE MOATS"
    p.font.name = BODY_FONT
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = GOLD_PRIMARY

    moats = [
        ("1. Exclusive Co-Op Contracts:", "Multi-year binding contracts with 30+ official Indian Geographical Indication (GI) guilds."),
        ("2. Digital GI Verification Engine:", "Proprietary serial code & QR cryptographic certificate linked directly to artisan IDs."),
        ("3. RAG / Vector AI Heritage Engine:", "RAG / Vector Indexing Pipeline querying 5,000+ GI documents via Gemini API.")
    ]
    for m_title, m_desc in moats:
        p = tf.add_paragraph()
        p.text = m_title
        p.font.name = SERIF_FONT
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = GOLD_LIGHT
        p.space_before = Pt(14)
        
        p2 = tf.add_paragraph()
        p2.text = m_desc
        p2.font.name = BODY_FONT
        p2.font.size = Pt(11)
        p2.font.color.rgb = TEXT_MUTED

    # ==========================================
    # SLIDE 9: Team (CORRECTED FOUNDER NAME & ROLES)
    # ==========================================
    slide9 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide9)
    add_header(slide9, 9, "Leadership & Team")
    add_title(slide9, "Built by Engineering & Heritage Preservation Leaders", "Combining deep technical execution with authentic artisan guild leadership.")

    team = [
        ("Pruthviraj Ganiharkar", "Founder & CEO / Lead Architect", "Hands-on execution: Full-Stack Architecture, RAG Pipeline Development, Node.js REST API & Glassmorphism UI."),
        ("Dr. Devendra Sharma", "Head of Craft Authentication", "30+ years in Indian Heritage Preservation. Former advisor to GI Certification Boards."),
        ("Aria Chen", "VP of Global D2C Growth", "Ex-Luxury Retail Director. Scaled high-end art & artisanal brands to $50M+ annual revenue."),
        ("Vikramaditya Rao", "Lead AI & Cloud Architect", "Ex-Senior AI Engineer. Specialized in Gemini API integration, cloud scaling, and microservices.")
    ]

    for i, (name, role, bio) in enumerate(team):
        left = Inches(0.8 + i * 2.95)
        add_card(slide9, left, Inches(2.4), Inches(2.7), Inches(4.3))
        tx = slide9.shapes.add_textbox(left + Inches(0.15), Inches(2.6), Inches(2.4), Inches(3.9))
        tf = tx.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = name
        p.font.name = SERIF_FONT
        p.font.size = Pt(17)
        p.font.bold = True
        p.font.color.rgb = GOLD_LIGHT
        p.alignment = PP_ALIGN.CENTER
        
        p2 = tf.add_paragraph()
        p2.text = role
        p2.font.name = BODY_FONT
        p2.font.size = Pt(10)
        p2.font.bold = True
        p2.font.color.rgb = GOLD_PRIMARY
        p2.alignment = PP_ALIGN.CENTER
        p2.space_before = Pt(4)

        p3 = tf.add_paragraph()
        p3.text = bio
        p3.font.name = BODY_FONT
        p3.font.size = Pt(10)
        p3.font.color.rgb = TEXT_MUTED
        p3.alignment = PP_ALIGN.CENTER
        p3.space_before = Pt(12)

    # ==========================================
    # SLIDE 10: Vision / The Ask (PRE-SEED / SEED ASK RANGE)
    # ==========================================
    slide10 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide10)
    add_header(slide10, 10, "5-Year Vision & Funding Ask")
    add_title(slide10, "Scaling Heritage Luxury Globally — Pre-Seed / Seed Round", "Transforming Parampara into the global operating system for indigenous luxury heritage.")

    add_card(slide10, Inches(0.8), Inches(2.3), Inches(5.8), Inches(4.6))
    tx = slide10.shapes.add_textbox(Inches(1.0), Inches(2.5), Inches(5.4), Inches(4.2))
    tf = tx.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "5-YEAR GROWTH ROADMAP"
    p.font.name = BODY_FONT
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = GOLD_PRIMARY

    roadmap = [
        ("Year 1 (India Scale):", "5,000+ Master Artisans across all 28 States ($5M GMV)."),
        ("Year 3 (Global Flagships):", "Launch NYC, London, & Dubai physical experience hubs ($35M GMV)."),
        ("Year 5 (Global Expansion):", "Scale model to Southeast Asia & Latin America heritage crafts ($150M GMV).")
    ]
    for yr, detail in roadmap:
        p = tf.add_paragraph()
        p.text = yr
        p.font.name = SERIF_FONT
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = GOLD_LIGHT
        p.space_before = Pt(12)
        
        p2 = tf.add_paragraph()
        p2.text = detail
        p2.font.name = BODY_FONT
        p2.font.size = Pt(11)
        p2.font.color.rgb = TEXT_WHITE

    add_card(slide10, Inches(6.9), Inches(2.3), Inches(5.633), Inches(4.6), bg_color=RGBColor(28, 24, 18), border_color=GOLD_PRIMARY)
    tx = slide10.shapes.add_textbox(Inches(7.1), Inches(2.5), Inches(5.233), Inches(4.2))
    tf = tx.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "TARGET FUNDING REQUEST"
    p.font.name = BODY_FONT
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = GOLD_PRIMARY

    p2 = tf.add_paragraph()
    p2.text = "$500K – $1.5M"
    p2.font.name = SERIF_FONT
    p2.font.size = Pt(28)
    p2.font.bold = True
    p2.font.color.rgb = GOLD_LIGHT
    p2.space_before = Pt(4)

    p_sub = tf.add_paragraph()
    p_sub.text = "Pre-Seed / Seed Incubator Target"
    p_sub.font.name = BODY_FONT
    p_sub.font.size = Pt(11)
    p_sub.font.bold = True
    p_sub.font.color.rgb = GOLD_PRIMARY

    p3 = tf.add_paragraph()
    p3.text = "USE OF FUNDS BREAKDOWN:"
    p3.font.name = BODY_FONT
    p3.font.size = Pt(11)
    p3.font.bold = True
    p3.font.color.rgb = TEXT_WHITE
    p3.space_before = Pt(14)

    funds = [
        ("• 45% ($225k–$675k):", "Engineering & Guild Onboarding"),
        ("• 35% ($175k–$525k):", "Customer Acquisition & DTC Growth"),
        ("• 20% ($100k–$300k):", "Operations & GI Logistics Hubs")
    ]
    for pct, usage in funds:
        p = tf.add_paragraph()
        p.text = f"{pct} {usage}"
        p.font.name = BODY_FONT
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_WHITE
        p.space_before = Pt(6)

    # Save presentation — try multiple filenames to bypass any open file locks
    import datetime
    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M")
    for output_path in [
        "Parampara_Pitch_Deck_v4.pptx",
        f"Parampara_Pitch_Deck_{ts}.pptx",
    ]:
        try:
            prs.save(output_path)
            print("SUCCESS: Saved to " + output_path)
            break
        except PermissionError:
            print("LOCKED: " + output_path + " - trying next...")

if __name__ == "__main__":
    create_pitch_deck()
