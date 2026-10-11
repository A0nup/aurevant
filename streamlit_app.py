#!/usr/bin/env python3
"""
AUREVANT — Haute Maison de Paris & Mumbai
Streamlit Cloud Entry Point (https://share.streamlit.io/user/a0nup)
Seamlessly serves the full luxury menswear platform with integrated:
- Full interactive storefront (Sections A-K, PDP galleries, bag, checkout)
- SQLite database persistence (orders, products, settings)
- Indian Logistics & PIN code intelligence
- Razorpay / UPI / Cards / COD payment gateway architecture
- Streamlit native Maison Director admin portal
"""

import os
import json
import sqlite3
import datetime
from pathlib import Path
import streamlit as st
import streamlit.components.v1 as components

# ==============================================================================
# Streamlit Page Configuration
# ==============================================================================
st.set_page_config(
    page_title="AUREVANT — Haute Maison | Luxury Menswear",
    page_icon="⚜",
    layout="wide",
    initial_sidebar_state="collapsed"
)

BASE_DIR = Path(__file__).resolve().parent
DB_FILE = BASE_DIR / "aurevant.db"

# Custom Streamlit CSS injection for seamless luxury aesthetic
st.markdown("""
<style>
    /* Hide Streamlit default branding & reduce top padding */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    .block-container {
        padding-top: 0rem !important;
        padding-bottom: 0rem !important;
        padding-left: 0rem !important;
        padding-right: 0rem !important;
        max-width: 100% !important;
    }
    /* Streamlit sidebar custom styling */
    section[data-testid="stSidebar"] {
        background-color: #11100F;
        border-right: 1px solid rgba(198, 168, 117, 0.25);
    }
    section[data-testid="stSidebar"] h1, 
    section[data-testid="stSidebar"] h2, 
    section[data-testid="stSidebar"] h3 {
        color: #C6A875;
        font-family: 'Cinzel', serif;
        letter-spacing: 0.15em;
    }
    .stRadio > label {
        color: #F2EBDD !important;
        font-size: 0.85rem;
    }
    .stMetric {
        background: #171614;
        padding: 14px;
        border: 1px solid rgba(198, 168, 117, 0.2);
        border-radius: 2px;
    }
    .stMetric label {
        color: #A49A89 !important;
        font-size: 0.72rem !important;
        letter-spacing: 0.14em !important;
        text-transform: uppercase !important;
    }
    .stMetric div[data-testid="stMetricValue"] {
        color: #C6A875 !important;
        font-family: 'Cinzel', serif !important;
    }
</style>
""", unsafe_allow_html=True)

# ==============================================================================
# Database Helper
# ==============================================================================
def get_db_connection():
    if not DB_FILE.exists():
        import server
        server.init_db()
    return sqlite3.connect(DB_FILE)

# ==============================================================================
# Build Standalone Self-Contained HTML Bundle
# ==============================================================================
def build_html_bundle():
    html_file = BASE_DIR / "index.html"
    css_file = BASE_DIR / "styles.css"
    js_file = BASE_DIR / "app.js"

    html_content = html_file.read_text(encoding="utf-8") if html_file.exists() else "<h1>AUREVANT</h1>"
    css_content = css_file.read_text(encoding="utf-8") if css_file.exists() else ""
    js_content = js_file.read_text(encoding="utf-8") if js_file.exists() else ""

    # Replace external links with inlined content so components.v1.html runs cleanly
    html_content = html_content.replace(
        '<link rel="stylesheet" href="styles.css">',
        f'<style>\n{css_content}\n</style>'
    )
    html_content = html_content.replace(
        '<script src="app.js"></script>',
        f'<script>\n{js_content}\n</script>'
    )

    return html_content

# ==============================================================================
# Sidebar Controls & View Switcher
# ==============================================================================
with st.sidebar:
    st.markdown("""
    <div style="text-align: center; padding: 20px 0 10px;">
        <svg style="width: 42px; height: 42px; fill: #C6A875; margin-bottom: 6px;" viewBox="0 0 100 100">
            <path d="M50 4 C68 4 84 14 84 34 C84 62 50 96 50 96 C50 96 16 62 16 34 C16 14 32 4 50 4 Z" stroke="#C6A875" stroke-width="2.5" fill="none"/>
            <polygon points="50,22 66,62 34,62" fill="none" stroke="#C6A875" stroke-width="2.5"/>
            <line x1="39" y1="52" x2="61" y2="52" stroke="#C6A875" stroke-width="2"/>
            <polyline points="34,44 50,78 66,44" fill="none" stroke="#C6A875" stroke-width="2.5"/>
        </svg>
        <div style="font-family: serif; font-size: 1.3rem; letter-spacing: 0.35em; color: #F2EBDD;">AUREVANT</div>
        <div style="font-size: 0.55rem; letter-spacing: 0.3em; color: #A49A89; text-transform: uppercase;">Haute Maison de Paris & Mumbai</div>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    view_mode = st.radio(
        "NAVIGATION PERSPECTIVE",
        [
            "⚜ Atelier Storefront (Live Website)",
            "🏛 Maison Director Portal (Orders & Admin)",
            "🇮🇳 Indian PIN Code Logistics Hub",
            "💳 Razorpay Gateway Architecture"
        ],
        index=0
    )

    st.markdown("---")
    st.markdown("""
    <div style="font-size: 0.72rem; color: #A49A89; line-height: 1.7;">
        <strong style="color: #C6A875;">“DISTINCTION IS EARNED.”</strong><br>
        Curated menswear for discerning patrons in India with an international luxury identity.<br><br>
        <span style="color: #F2EBDD;">Permanent Client Desk:</span><br>
        +91 (022) 4890 2600<br>
        concierge@aurevant.com
    </div>
    """, unsafe_allow_html=True)

# ==============================================================================
# MAIN VIEW 1: Full Interactive Storefront
# ==============================================================================
if view_mode == "⚜ Atelier Storefront (Live Website)":
    html_bundle = build_html_bundle()
    # Render with responsive iframe height
    components.html(html_bundle, height=1200, scrolling=True)

# ==============================================================================
# MAIN VIEW 2: Maison Director Portal (Streamlit Native Admin)
# ==============================================================================
elif view_mode == "🏛 Maison Director Portal (Orders & Admin)":
    st.markdown("<div style='padding: 30px 40px;'>", unsafe_allow_html=True)
    st.markdown("<h2 style='color: #C6A875; font-family: serif; letter-spacing: 0.16em;'>MAISON DIRECTOR PORTAL</h2>", unsafe_allow_html=True)
    st.markdown("<p style='color: #A49A89;'>Live Atelier Database & Consignment Management</p>", unsafe_allow_html=True)
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Load stats
        cursor.execute("SELECT COUNT(*), COALESCE(SUM(total), 0) FROM orders")
        order_count, total_revenue = cursor.fetchone()
        
        cursor.execute("SELECT COUNT(*) FROM products WHERE is_active = 1")
        product_count = cursor.fetchone()[0]

        # Top Metric Cards
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.metric("Gross Consignment Value", f"₹{total_revenue:,.0f}")
        with col2:
            st.metric("Total Commissioned Orders", f"{order_count}")
        with col3:
            st.metric("Active Atelier Allocations", f"{product_count}")
        with col4:
            st.metric("COD Order Threshold", "₹50,000")

        st.markdown("<br>", unsafe_allow_html=True)

        # Tab views
        tab_orders, tab_inventory, tab_settings = st.tabs(["Commissioned Orders Ledger", "Garment Allocations", "Maison Settings"])

        with tab_orders:
            cursor.execute("SELECT id, customer_name, customer_phone, city, state, pin_code, total, payment_method, payment_status, fulfillment_status, created_at FROM orders ORDER BY created_at DESC")
            rows = cursor.fetchall()
            
            if rows:
                table_data = []
                for r in rows:
                    table_data.append({
                        "Order ID": r[0],
                        "Patron": r[1],
                        "Contact": r[2],
                        "Destination": f"{r[3]}, {r[4]} ({r[5]})",
                        "Valuation (INR)": f"₹{r[6]:,}",
                        "Payment": f"{r[7]} ({r[8]})",
                        "Fulfillment": r[9],
                        "Date": r[10][:10] if r[10] else ""
                    })
                st.dataframe(table_data, use_container_width=True)
            else:
                st.info("No orders registered in the ledger yet. Place an order via the Atelier Storefront to see live transactions recorded.")

        with tab_inventory:
            cursor.execute("SELECT id, title, category_name, price, badge FROM products ORDER BY id ASC")
            prods = cursor.fetchall()
            inv_data = [{"ID": p[0], "Garment": p[1], "Pillar": p[2], "Price (INR)": f"₹{p[3]:,}", "Badge": p[4]} for p in prods]
            st.dataframe(inv_data, use_container_width=True)

        with tab_settings:
            cursor.execute("SELECT key, value FROM settings")
            settings = dict(cursor.fetchall())
            st.json(settings)

        conn.close()

    except Exception as e:
        st.error(f"Error accessing atelier records: {e}")

    st.markdown("</div>", unsafe_allow_html=True)

# ==============================================================================
# MAIN VIEW 3: Indian PIN Code Logistics Hub
# ==============================================================================
elif view_mode == "🇮🇳 Indian PIN Code Logistics Hub":
    st.markdown("<div style='padding: 30px 40px;'>", unsafe_allow_html=True)
    st.markdown("<h2 style='color: #C6A875; font-family: serif; letter-spacing: 0.16em;'>INDIAN POSTAL LOGISTICS INTELLIGENCE</h2>", unsafe_allow_html=True)
    st.markdown("<p style='color: #A49A89;'>Real-time White-Glove courier serviceability and COD eligibility test console</p>", unsafe_allow_html=True)

    col_input, col_info = st.columns([1, 1.2])

    with col_input:
        test_pin = st.text_input("Enter 6-Digit Indian PIN Code", value="400001", max_chars=6)
        if st.button("Check Serviceability", type="primary"):
            from server import verify_pincode
            result = verify_pincode(test_pin)
            st.session_state["pincode_test_result"] = result

    with col_info:
        if "pincode_test_result" in st.session_state:
            res = st.session_state["pincode_test_result"]
            if res.get("serviceable"):
                st.success(f"✓ {res.get('message')}")
                st.write(f"**City / Area:** {res.get('city')}")
                st.write(f"**Delivery Timeline:** {res.get('deliveryTimeline')}")
                st.write(f"**Estimated Arrival:** {res.get('estimatedDate')}")
                st.write(f"**Dispatch Hub:** {res.get('hub')}")
                st.write(f"**Cash on Delivery:** {'Eligible up to ₹50,000' if res.get('codAvailable') else 'Prepaid Only'}")
            else:
                st.error(res.get("error", "Unserviceable postal code."))
        else:
            st.info("Try checking metro codes: 110001 (Delhi), 400001 (Mumbai), 560001 (Bengaluru), 500033 (Hyderabad), 600028 (Chennai), 700019 (Kolkata).")

    st.markdown("</div>", unsafe_allow_html=True)

# ==============================================================================
# MAIN VIEW 4: Razorpay Gateway Architecture
# ==============================================================================
elif view_mode == "💳 Razorpay Gateway Architecture":
    st.markdown("<div style='padding: 30px 40px;'>", unsafe_allow_html=True)
    st.markdown("<h2 style='color: #C6A875; font-family: serif; letter-spacing: 0.16em;'>RAZORPAY & INDIAN PAYMENTS ARCHITECTURE</h2>", unsafe_allow_html=True)
    
    st.markdown("""
    ### 🛡 Cryptographic Security & Server-Side Verification
    
    AUREVANT implements strict compliance with RBI payment gateway regulations:
    - **Never hardcodes secret keys** in frontend bundles.
    - **Creates server-side orders** with values in paise (`amount_paise = amount_inr * 100`).
    - **Verifies payment signatures** via HMAC SHA-256 (`razorpay_order_id|razorpay_payment_id` against `RAZORPAY_KEY_SECRET`).
    - **Separate COD Accounting:** Orders placed with Cash on Delivery are marked as **`Pending - Collect on Delivery`** and are never falsely logged as paid.

    ### 🔑 Environment Variable Configuration
    To configure your live or sandbox Razorpay keys on Streamlit Cloud:
    Add the following in your **Streamlit App Secrets** (`Advanced Settings -> Secrets`):

    ```toml
    RAZORPAY_KEY_ID = "rzp_live_your_actual_key"
    RAZORPAY_KEY_SECRET = "your_actual_secret_key"
    ```
    """)
    st.markdown("</div>", unsafe_allow_html=True)
