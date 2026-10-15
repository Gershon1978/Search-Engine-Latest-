# Andrey AI Mechanical Workbench: Live Camera Capture & Real-Time Inventory Integration

A comprehensive implementation plan to expand the Hi5.bike mechanical diagnostic engine into a real-time shop workbench, introducing interactive 6-angle camera capture with alignment overlays and live parts inventory synchronization.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The mechanical research and candidate scoring engine has been verified with 48 passing test assertions (zero generational bleed, structural vetoes, and component brand guards). The next phase connects the physical shop floor to the digital catalog.

- **Decision 1: Dual Capture Modes (Webcam & High-Res Mobile Upload)**:
  - *Chosen*: Support both live browser camera capture (with real-time viewfinder guide overlays) and high-resolution photo/video file drop for customers uploading footage recorded on phone cameras.
- **Decision 2: Live Inventory & Stock Status Overlay in the Certainty Matrix**:
  - *Chosen*: Overlay real-time shop inventory metrics (`In Stock: 4 units`, `Bin: H-04`, `Wholesale / Retail Pricing`, `Supplier Lead Time`) directly into Column 1 (Confirmed) and Column 2 (High Probability) of the Part Certainty Matrix.

---

## 1. Overview & Core Concept

Andrey AI serves professional bicycle mechanics and service advisors diagnosing bicycles with damaged, worn, or missing components.

- **What It Delivers**:
  1. **Interactive 6-Angle Camera Guide**: Guides the mechanic or customer through capturing the exact angles required for high-confidence identification:
     - View 1: Full Drive-Side Profile (Frame Silhouette & Suspension Type)
     - View 2: Non-Drive Side (Swingarm & Disc Caliper Mount)
     - View 3: Cockpit & Headtube (Cable Entry Ports & Headset)
     - View 4: Bottom Bracket Shell (Shell Width, Threading vs PressFit, Motor Housing)
     - View 5: Rear Dropout & Derailleur Hanger (Mounting Fasteners, Axle Pitch, UDH Ring)
     - View 6: Seatstay / Top-Tube Junction (Weld Seams vs Floating Triple Triangle)
  2. **Direct Frame Extraction**: Real-time snapshot capture from video stream or uploaded camera clips, feeding directly into the Stage A–E recognition pipeline.
  3. **Live Shop Inventory & Order Action**: Confirmed replacement parts automatically display local stock levels, shelf bin location, supplier part numbers (Wheels Mfg, SRAM, Shimano), and a 1-click purchase order / repair ticket generator.

---

## 2. User Experience & Visual Design

### Key User Flows

```
[Camera / Video Upload]
         │
         ▼
[6-Angle Guided Viewfinder Overlay]
         │
         ▼
[Stage A Gate: Manufacturer Decal Check]
    ├── (Component Only: Prompt for Head Badge)
    └── (Confirmed: Activate Brand Profile)
         │
         ▼
[Stage C/D: Multi-View Scoring & Structural Vetoes]
         │
         ▼
[Part Certainty Matrix: Confirmed Variant Locked]
         │
         ▼
[Live Inventory & Bin Location: 1-Click Order]
```

### Visual Identity & Theme
- **Theme**: Dark industrial workbench palette (`#0F172A` Slate canvas, `#1E293B` structural cards, `#334155` subtle hairline borders).
- **Accents**: High-contrast safety amber (`#F59E0B`) for diagnostic alerts and emerald (`#10B981`) for confirmed fitment & in-stock status.
- **Typography**: Clean display sans for headers, with monospace tabular numerals (`tabular-nums font-mono`) for part dimensions, thread pitches, and SKU codes.
- **Overlays**: Semi-transparent SVG bounding reticles on camera viewfinders indicating optimal frame placement.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Client-Side Video Capture vs. Server Video Upload**:
  - *Approach*: Extract high-quality keyframes in the browser canvas at 1080p resolution, sending lightweight frames to `/api/frame-recognition` rather than uploading multi-gigabyte video files.
  - *Rationale*: Zero server bandwidth bottlenecks, near-instantaneous round-trip analysis, and immediate feedback to the mechanic while holding the phone.
- **Decision 2: Inventory Graph Persistence**:
  - *Approach*: In-memory reactive inventory catalog backed by configurable local shop JSON, extensible to Lightspeed / Shopify POS APIs.
  - *Rationale*: Instant responsiveness without cloud latency during bench diagnosis.

---

## 4. Technical Architecture & Data Strategy

### System Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   Andrey AI Mechanic UI                     │
├──────────────────────────────┬──────────────────────────────┤
│    Live Camera / Viewfinder  │     Diagnostic Control Bar   │
│   (HTML5 MediaStream/Canvas) │  (Bike Name + Broken Part)   │
└──────────────┬───────────────┴──────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│ Multi-View Frame Recognition │ │   Part Certainty Matrix    │
│  - Stage A: Brand Guard      │ │  - Col 1: Confirmed SKU    │
│  - Stage B: Profile Engine   │ │  - Col 2: High Probability │
│  - Stage C: 6-View Analyzer  │ │  - Col 3: Legacy Variant   │
│  - Stage D: Scorer & Vetoes  │ └──────────────┬─────────────┘
└──────────────┬───────────────┘                │
               │                                │
               ▼                                ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│ Candidate Scorer & Next-View │ │ Live Shop Inventory Feed   │
│  (Hard Vetoes, Normalizer)   │ │  (Stock Bins, POS Pricing) │
└──────────────────────────────┘ └────────────────────────────┘
```

### Key API & Data Interfaces

1. `POST /api/frame-recognition`: Receives captured frame images or preset IDs, returning 5-stage diagnostic report with candidate scores and recommended next views.
2. `GET /api/inventory/part/:sku`: Returns live stock availability, bin location, distributor alternate SKUs, and retail pricing.
3. `POST /api/inventory/order`: Generates a pick-list or distributor purchase requisition for the confirmed repair item.
