# ⚜ AUREVANT — Haute Maison de Paris & Mumbai
### Luxury Menswear & Bespoke Sartorial E-Commerce Platform

> **“DISTINCTION IS EARNED.”**  
> *Secondary Campaign: “NOT MADE FOR EVERYONE.”*

AUREVANT is a production-oriented luxury menswear e-commerce application built for affluent customers in India, with an international European luxury visual identity, quiet elegance, and meticulous craftsmanship.

---

## 🏛 1. Brand Identity & Visual Design

- **Brand Category:** Luxury Menswear & Premium Designer Clothing.
- **Brand Positioning:** Understated wealth, European tailoring heritage, disciplined batch production, exceptional single-origin natural fibers.
- **Pricing Architecture (INR):**
  - **Signature T-Shirts:** ₹19,999 – ₹24,999 (260+ GSM Egyptian Giza & Peruvian Pima cotton)
  - **Tailored Shirts:** ₹24,999 – ₹29,999 (140/2 Italian Thomas Mason poplin & Royal Oxford)
  - **Premium Denim:** ₹24,999 – ₹29,999 (14oz Kuroki Mills Japanese low-tension selvedge)
  - **Outerwear & Jackets:** From ₹29,999 to ₹79,999 (Double-faced Mongolian cashmere, Vitale Barberis Canonico wool, Tuscan calfskin suede)
- **Palette (Exact Specification):**
  - **Obsidian Black:** `#0B0B0B`
  - **Deep Charcoal:** `#171614`
  - **Champagne Gold:** `#C6A875`
  - **Warm Ivory:** `#F2EBDD`
  - **Muted Stone:** `#A49A89`
- **Original Brand Assets:**
  - **Custom Monogram:** Symmetrical interlocking **A** apex and **V** chevron vector SVG emblem with fine architectural European shield frame.
  - **Wordmark:** Uppercase serif Roman typography with balanced wide tracking (`0.38em`).

---

## 📑 2. Homepage Structure (Sections in Exact Order)

1. **A. Announcement Bar:** Real-time Indian delivery notices, COD eligibility, and 256-bit SSL encrypted payment messaging.
2. **B. Luxury Navigation Header:** Vector Monogram and Wordmark, Home, Shop, Collections, The House, Journal, Catalog Search, Concierge Desk, and Shopping Bag with live counter.
3. **C. Cinematic Hero Section:** High-resolution editorial campaign portrait, AUREVANT wordmark, *“DISTINCTION IS EARNED.”*, supporting text, and primary/secondary CTAs.
4. **D. Category Collections:** 4 fundamental luxury pillars with pricing ranges and direct filtering.
5. **E. Featured Collection:** Curated garment cards with INR prices, size selectors, color swatches, quick inspection, and detail routing.
6. **F. Brand Philosophy:** Editorial layout on quiet wealth, material discipline, and timeless tailoring.
7. **G. Craftsmanship Section:** Fiber architecture, structural construction (22 SPI tailoring), and garment longevity specifications.
8. **H. Private Collection / Limited Releases:** Numbered allocation showcase (*The Sovereign Double-Faced Cashmere Overcoat — Numbered 08/25*).
9. **I. Luxury Service Strip:** Secure checkout, real-time Order Tracking by Order ID, delivery information, and atelier return policies.
10. **J. Editorial Journal:** Garment care, textile lore, and monochromatic styling features.
11. **K. Premium Footer:** Brand credentials, Mumbai/Delhi contact desks, GSTIN placeholder, privacy charter, terms, and private ledger newsletter.

---

## 🇮🇳 3. Indian Logistics & PIN Code Verification

The platform features an integrated **6-digit Indian PIN Code Logistics Engine** (`/api/pincode/check`):
- **Metro Hubs:**
  - **New Delhi & NCR:** `110001` (Connaught Place), `110003` (Golf Links), `110021` (Chanakyapuri), `122002` (DLF Golf Course Rd) -> Next-Day White-Glove Courier.
  - **Mumbai & MMR:** `400001` (Fort), `400005` (Colaba), `400006` (Malabar Hill), `400018` (Worli), `400050` (Bandra West), `400049` (Juhu) -> Next-Day White-Glove Courier.
  - **Bengaluru:** `560001` (MG Road), `560025` (Richmond Town), `560034` (Koramangala), `560038` (Indiranagar) -> 1-2 Days.
  - **Hyderabad, Chennai, Kolkata, Pune, Ahmedabad, Jaipur:** 2 Days express dispatch.
- **National Coverage:** Any valid 6-digit Indian postal code is serviced via regional hub dispatch (3-4 Business Days).
- **COD Eligibility Rules:** Cash on Delivery is automatically validated against order value (eligible up to ₹50,000). Orders exceeding this threshold require prepaid settlement in compliance with Indian luxury retail standards.

---

## 💳 4. Indian Payment Gateways & Razorpay Architecture

- **Payment Methods Supported:**
  1. **UPI:** Instant settlement via Google Pay, PhonePe, Paytm, BHIM, or direct VPA address.
  2. **Credit & Debit Cards:** RuPay, Visa, Mastercard, and American Express.
  3. **Net Banking:** HDFC Bank, ICICI Bank, State Bank of India, Axis Bank, Kotak Mahindra.
  4. **Cash on Delivery (COD):** Secure phone verification, armored delivery protocol, and distinct financial status tracking: marked as **"Payment Pending — To Be Collected on Delivery"**, NEVER falsely marked as "Paid".
- **Razorpay Integration Architecture:**
  - `POST /api/payments/razorpay/create-order` creates server-side order with amount in paise.
  - `POST /api/payments/razorpay/verify` performs **HMAC SHA-256 cryptographic signature verification** (`razorpay_order_id|razorpay_payment_id` against `RAZORPAY_KEY_SECRET`).
  - Pre-configured in development test mode (`rzp_test_aurevant_demo`). To enable live credentials, set:
    ```bash
    export RAZORPAY_KEY_ID="rzp_live_your_actual_key"
    export RAZORPAY_KEY_SECRET="your_actual_secret"
    ```

---

## 🛡 5. Administrative Director Portal

- Available via the navigation bar **"Director Portal"** or directly at **[http://localhost:8000/admin.html](http://localhost:8000/admin.html)**.
- **Default Master Credentials:**
  - **Director Email:** ``
  - **Passcode:** ``
- **Capabilities:**
  - View all commissioned orders, customer contacts, and delivery addresses.
  - Update order fulfillment status (*Processing*, *Handcrafted*, *Dispatched*, *Delivered*, *Cancelled*).
  - Inspect gross consignment revenue in INR.
  - Inscribe new garments into the database.
  - Configure store policies and COD maximum limits.

---

## 🚀 6. Quick Launch Instructions

### Run the Server
From the project folder, run:
```bash
./aurevant
```
or:
```bash
python3 server.py
```

The server automatically scans and binds to an open port (`8000`, `5000`, `8080`, etc.).

Then open:
👉 **[http://localhost:8000](http://localhost:8000)** (Storefront)  
👉 **[http://localhost:8000/admin.html](http://localhost:8000/admin.html)** (Director Portal)

---

## 📁 7. Project Architecture

```
luix.py/
├── index.html       # Luxury homepage (Sections A through K), PDP modal, bag & checkout
├── admin.html       # Standalone Maison Director administration dashboard
├── styles.css       # Obsidian & Champagne Gold design system, typography & responsive layouts
├── app.js           # E-commerce store, Indian PIN code engine, Razorpay/COD handlers
├── server.py        # Python 3 Tornado REST API & SQLite persistence engine
├── aurevant         # Executable server launcher (./aurevant)
├── aurevant.db      # SQLite database (products, orders, admins, settings)
└── README.md        # Comprehensive documentation & deployment guide
```
