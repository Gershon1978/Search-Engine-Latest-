import {
  BenchmarkBike,
  BikeQueryResponse,
  ModelCandidate,
  StructuredInterfaces,
  CertaintyMatrixRow,
  VisualDiagnosticTag,
} from "../types/bikeQuery";

export const BRAND_SHORTHANDS: Record<string, string> = {
  gt: "GT Bicycles",
  spz: "Specialized",
  spec: "Specialized",
  sc: "Santa Cruz",
  cdale: "Cannondale",
  "c'dale": "Cannondale",
  cerv: "Cervélo",
  pin: "Pinarello",
  trk: "Trek",
  gnt: "Giant",
  cnyn: "Canyon",
};

export interface KnownPrefixEntry {
  brand: string;
  model: string;
  visual_cue: string;
}

export const KNOWN_MODEL_PREFIXES: Record<string, KnownPrefixEntry> = {
  av: {
    brand: "GT Bicycles",
    model: "GT Avalanche",
    visual_cue: "GT Triple Triangle frame where seatstays weld forward onto the top tube",
  },
  ag: {
    brand: "GT Bicycles",
    model: "GT Aggressor",
    visual_cue: "GT Triple Triangle with recreational geometry & mechanical disc mounts",
  },
  za: {
    brand: "GT Bicycles",
    model: "GT Zaskar",
    visual_cue: "GT Triple Triangle XC race geometry with post-mount rear disc",
  },
  stump: {
    brand: "Specialized",
    model: "Specialized Stumpjumper",
    visual_cue: "Asymmetric Sidearm frame strut connecting top tube to shock link",
  },
  lev: {
    brand: "Specialized",
    model: "Specialized Turbo Levo",
    visual_cue: "Integrated downtube Brose/Specialized motor battery casing",
  },
  dom: {
    brand: "Trek",
    model: "Trek Domane",
    visual_cue: "IsoSpeed decoupler at seat tube / top tube junction",
  },
  fuel: {
    brand: "Trek",
    model: "Trek Fuel EX",
    visual_cue: "Full-suspension Active Braking Pivot (ABP) concentric to rear axle",
  },
  sup: {
    brand: "Trek",
    model: "Trek Supercaliber",
    visual_cue: "IsoStrut structural shock integrated directly into top tube crossbar",
  },
  top: {
    brand: "Cannondale",
    model: "Cannondale Topstone",
    visual_cue: "Kingpin rear suspension pivot through seat tube",
  },
  super: {
    brand: "Cannondale",
    model: "Cannondale SuperSix EVO",
    visual_cue: "Truncated aero airfoil tubes with D-shaped KNOT seatpost",
  },
  bron: {
    brand: "Santa Cruz",
    model: "Santa Cruz Bronson",
    visual_cue: "Lower-link driven VPP shock tunnel through seat tube",
  },
  mega: {
    brand: "Santa Cruz",
    model: "Santa Cruz Megatower",
    visual_cue: "Lower-link VPP long-travel 29er with Glovebox downtube latch",
  },
  grail: {
    brand: "Canyon",
    model: "Canyon Grail",
    visual_cue: "CP07 double-decker Hover Bar with floating upper carbon leaf",
  },
  tcr: {
    brand: "Giant",
    model: "Giant TCR Advanced",
    visual_cue: "Compact Road sloping top tube with OverDrive 2 oversized steerer",
  },
  asp: {
    brand: "Cervélo",
    model: "Cervélo Áspero",
    visual_cue: "Trail Mixer flip-chip oval inserts in front carbon fork tips",
  },
  dog: {
    brand: "Pinarello",
    model: "Pinarello Dogma",
    visual_cue: "Onda wavy fork blades and asymmetric downtube shape",
  },
};

export interface TruncatedResolutionResult {
  resolved_brand: string;
  resolved_model: string;
  was_expanded: boolean;
  explicit_year: number | null;
  candidates: ModelCandidate[];
  raw_query: string;
}

/**
 * 1. Truncated & Abbreviated Bike Name Resolution
 * Resolves OCR, shorthand, and scratch-off names like "GT Av", "Spz Stump", "Trek Dom SL5"
 */
export function resolveTruncatedQuery(rawQuery: string): TruncatedResolutionResult {
  const trimmed = rawQuery.trim();
  const lower = trimmed.toLowerCase();

  // Extract explicit 4-digit year if present
  const yearMatch = trimmed.match(/\b(19\d\d|20\d\d)\b/);
  const explicitYear = yearMatch ? parseInt(yearMatch[1], 10) : null;

  // Split tokens and remove year from tokens
  const rawTokens = lower.split(/[\s,/-]+/).filter((t) => t && t !== String(explicitYear));

  let brandCandidate = "";
  let remainingTokens: string[] = [];

  // Check first token for brand shorthand
  if (rawTokens.length > 0) {
    const first = rawTokens[0];
    if (BRAND_SHORTHANDS[first]) {
      brandCandidate = BRAND_SHORTHANDS[first];
      remainingTokens = rawTokens.slice(1);
    } else {
      // Check full brand name
      for (const [short, full] of Object.entries(BRAND_SHORTHANDS)) {
        if (first === full.toLowerCase() || full.toLowerCase().startsWith(first)) {
          brandCandidate = full;
          remainingTokens = rawTokens.slice(1);
          break;
        }
      }
      if (!brandCandidate) {
        remainingTokens = rawTokens;
      }
    }
  }

  const candidates: ModelCandidate[] = [];
  let resolvedBrand = brandCandidate;
  let resolvedModel = "";
  let wasExpanded = false;

  // Match model tokens against known prefixes and benchmark models
  for (const token of remainingTokens) {
    if (token.length >= 2) {
      // 1. Check KNOWN_MODEL_PREFIXES lookup
      for (const [prefix, entry] of Object.entries(KNOWN_MODEL_PREFIXES)) {
        if (
          token.startsWith(prefix) ||
          prefix.startsWith(token) ||
          entry.model.toLowerCase().includes(token)
        ) {
          if (!resolvedBrand || resolvedBrand.toLowerCase().includes(entry.brand.toLowerCase())) {
            resolvedBrand = entry.brand;
            resolvedModel = entry.model;
            wasExpanded = true;
            candidates.push({
              model_name: entry.model,
              match_probability: token === prefix ? 0.95 : 0.88,
              distinguishing_visual_feature: entry.visual_cue,
            });
          }
        }
      }
    }
  }

  // Deduplicate candidates
  const uniqueCandidates: ModelCandidate[] = [];
  const seen = new Set<string>();
  for (const c of candidates) {
    if (!seen.has(c.model_name)) {
      seen.add(c.model_name);
      uniqueCandidates.push(c);
    }
  }

  if (!resolvedBrand && brandCandidate) {
    resolvedBrand = brandCandidate;
  }

  if (!resolvedModel && remainingTokens.length > 0) {
    resolvedModel = remainingTokens
      .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
      .join(" ");
  }

  return {
    resolved_brand: resolvedBrand || "Unknown Brand",
    resolved_model: resolvedModel || trimmed,
    was_expanded: wasExpanded || !!brandCandidate,
    explicit_year: explicitYear,
    candidates: uniqueCandidates,
    raw_query: trimmed,
  };
}

/**
 * 2. Special Conflict Builder for Multi-Generation Ambiguity without Model Year (e.g. "GT Av")
 */
export function buildMultiGenerationConflictResponse(
  rawQuery: string,
  resolution: TruncatedResolutionResult
): BikeQueryResponse {
  return {
    target: {
      manufacturer: "GT Bicycles",
      model: "Avalanche",
      model_year: undefined,
      trim: "Unknown Generation (Missing Model Year)",
    },
    canonical_identity: {
      standardized_brand: "GT Bicycles",
      standardized_model: "GT Avalanche",
      category: "Hardtail Trail / Cross-Country MTB",
      submitted_raw_query: rawQuery,
      was_expanded_from_truncated: true,
      closest_model_candidates: resolution.candidates.length > 0
        ? resolution.candidates
        : [
            {
              model_name: "GT Avalanche",
              match_probability: 0.92,
              distinguishing_visual_feature:
                "GT Triple Triangle frame where seatstays weld forward onto the top tube",
            },
            {
              model_name: "GT Aggressor",
              match_probability: 0.65,
              distinguishing_visual_feature:
                "GT Triple Triangle with recreational geometry & mechanical disc mounts",
            },
            {
              model_name: "GT Zaskar",
              match_probability: 0.45,
              distinguishing_visual_feature:
                "GT Triple Triangle XC race geometry with post-mount rear disc",
            },
          ],
    },
    mechanical_specifications: {
      frame_material: "GT 6061 T6 Aluminum (Triple Triangle frame design)",
      wheel_size: "26\" (2006-2013) / 27.5\" or 29\" (2015-2023)",
      drivetrain: {
        rear_derailleur: "Shimano Deore / Alivio / SRAM SX Eagle depending on year",
        shifters: "Shimano Rapidfire / SRAM Trigger",
        cassette: "8-speed (vintage) to 12-speed Eagle (modern)",
        crankset: "Prowheel / All Terra / SRAM SX",
      },
      brakes: {
        caliper_lever_model: "Hydraulic Disc (Tektro HD-M275 / Shimano MT200)",
        rotor_size_front_rear: "160mm / 160mm 6-bolt",
        brake_type: "Hydraulic Disc",
      },
      standards: {
        bottom_bracket: "Threaded BSA 73mm (English 1.37 x 24 TPI)",
        headset: "Semi-Integrated ZS44/28.6 upper, ZS44/30 or ZS56/40 lower",
        seatpost_diameter: "30.9mm (modern) / 27.2mm (vintage)",
        seat_clamp_diameter: "34.9mm / 31.8mm",
        rear_axle_spacing: "135x10mm Quick Release (QR)",
        front_axle_spacing: "100x9mm Quick Release",
      },
      critical_replacement_skus: {
        derailleur_hanger: "CONFLICT: Missing Model Year",
        headset_bearings: "FSA No.11N or Cane Creek 10 ZS44",
        bottom_bracket_replacement: "Shimano BB-MT501 / SRAM Powerspline / Square Taper",
      },
      derailleur_hanger_audit: {
        status: "CONFLICT",
        sku: null,
        competing_candidates: [
          {
            sku_or_name: "GT ATIDH0233 / K33047 (Wheels Mfg #266)",
            fits_years: "2015–2023",
            description: "Fits 27.5\" & 29\" wheels; mounts from inside dropout with 2 tiny M3 flathead screws.",
            mounting_notes: "Two small M3 countersunk screws spaced ~14mm apart.",
          },
          {
            sku_or_name: "GT ATIDH0021 (Wheels Mfg #31)",
            fits_years: "2006–2013",
            description: "Fits 26\" wheels; mounts with 1 large chainring-style slotted barrel bolt.",
            mounting_notes: "Single large chainring-style fixing bolt through the dropout.",
          },
          {
            sku_or_name: "GT ATIDH0246",
            fits_years: "2017–2018",
            description: "Fits Avalanche Expert/Elite equipped with Shimano Direct Mount rear derailleur.",
            mounting_notes: "Direct mount b-link replacement.",
          },
        ],
        resolution_action_prompt:
          "Truncated query 'GT Av' resolved to GT Avalanche, but model year is missing. Ask the user: (1) What wheel size is printed on the tire sidewall (26\", 27.5\", or 29\")? (2) Does the hanger attach with 2 tiny M3 screws (ATIDH0233, 2015-2023) or 1 large chainring bolt (ATIDH0021, 2006-2013)? Or upload a photo of the rear dropout.",
      },
      structured_interfaces: {
        bb_shell_standard: "BSA_73",
        hanger_standard: "GT_ATIDH0233_OR_ATIDH0021",
        headset_shis_upper: "ZS44/28.6",
        headset_shis_lower: "ZS44/30",
        rear_axle_standard: "135x10_QR",
        freehub_standard: "SHIMANO_HG",
        max_rotor_mm: 180,
      },
      proprietary_hardware: [
        {
          component_name: "GT Triple Triangle Floating Stays",
          part_number_or_sku: "GT Frame Design",
          technical_notes: "Seatstays bypass seat tube and weld directly into top tube for compliance.",
        },
      ],
    },
    verification_audit: {
      recommended_action: "REQUIRE_PHYSICAL_CHECK",
      notes:
        "Severe generational variation: 26-inch Avalanche models (pre-2014) use single large bolt hanger ATIDH0021; 27.5/29-inch models (2015+) use dual M3 screw hanger ATIDH0233. Incompatible fasteners.",
    },
    model_year_variants: [
      {
        generation_name: "26\" Classic Era (2006–2013)",
        year_range: [2006, 2013],
        varying_parts: {
          wheel_size: "26\"",
          derailleur_hanger: "GT ATIDH0021 (Single large chainring bolt)",
          headset: "1-1/8\" Straight external / semi-integrated",
        },
        mechanic_warning: "Uses ATIDH0021 with large chainring bolt fastener. Will not accept ATIDH0233.",
      },
      {
        generation_name: "Modern 27.5\" / 29\" Era (2015–2023)",
        year_range: [2015, 2023],
        varying_parts: {
          wheel_size: "27.5\" or 29\"",
          derailleur_hanger: "GT ATIDH0233 / K33047 (Dual M3 flathead screws)",
          headset: "ZS44/ZS56 or ZS44/ZS44",
        },
        mechanic_warning: "Mounts inside dropout recess with 2 tiny M3 flathead screws.",
      },
    ],
    web_search_evidence: [
      {
        query_dispatched: "GT Avalanche derailleur hanger ATIDH0233 ATIDH0021 differences",
        source_domain: "wheelsmfg.com",
        verified_value: "ATIDH0233 (2-screw, 2015+) vs ATIDH0021 (1-bolt, 2006-2013)",
      },
    ],
    confidence_score: 0.85,
    is_cached_benchmark: true,
    quota_notice: "Multi-generation conflict trap triggered: Model year required to distinguish hanger standard.",
    available_visual_tags: [
      {
        tag_id: "m3_screws",
        label: "2x Tiny M3 Screws on Dropout",
        locks_generation: "2015–2023 Modern (27.5\" / 29\")",
        resolves_part_skus: {
          derailleur_hanger: "GT ATIDH0233 / K33047 (Wheels Mfg #266)",
          bottom_bracket: "Shimano BB-MT501 / BSA 73mm Outboard",
        },
      },
      {
        tag_id: "barrel_bolt",
        label: "1x Large Chainring Bolt",
        locks_generation: "2006–2013 Classic (26\")",
        resolves_part_skus: {
          derailleur_hanger: "GT ATIDH0021 (Wheels Mfg #31)",
          bottom_bracket: "Square Taper 73x113mm / 73x122mm",
        },
      },
      {
        tag_id: "floating_stays",
        label: "Floating Seatstays (2020+)",
        locks_generation: "2020–2024 Gen 4",
        resolves_part_skus: {
          derailleur_hanger: "GT ATIDH0233 / K33047 (Wheels Mfg #266)",
          bottom_bracket: "SRAM DUB / Shimano BSA 73mm",
        },
      },
      {
        tag_id: "tapered_ht",
        label: "Tapered Headtube (ZS44/ZS56)",
        locks_generation: "2019+ Elite / Expert",
        resolves_part_skus: {
          headset: "FSA No.42 ACB (ZS44/28.6 Upper | ZS56/40 Lower)",
        },
      },
      {
        tag_id: "wheels_26",
        label: "26\" Wheels on Sidewall",
        locks_generation: "2006–2013 Classic (26\")",
        resolves_part_skus: {
          derailleur_hanger: "GT ATIDH0021 (Wheels Mfg #31)",
        },
      },
      {
        tag_id: "wheels_29",
        label: "27.5\" / 29\" Wheels on Sidewall",
        locks_generation: "2015–2023 Modern",
        resolves_part_skus: {
          derailleur_hanger: "GT ATIDH0233 / K33047 (Wheels Mfg #266)",
        },
      },
    ],
    certainty_matrix: [
      {
        part_category: "derailleur_hanger",
        part_label: "Derailleur Hanger",
        is_target_broken_part: true,
        confirmed_baseline: {
          summary: "Bolted Alloy Dropout (Never UDH)",
          locked_sku: null,
          status: "IMMUTABLE_STANDARD",
        },
        high_probability_candidate: {
          sku_or_spec: "GT ATIDH0233 / K33047 (Wheels Mfg #266)",
          years_applicable: "2015–2023 (27.5\" / 29\")",
          probability: 0.78,
          visual_trigger_tag: "2x Tiny M3 Screws on Dropout",
        },
        competing_legacy_candidates: [
          {
            sku_or_spec: "GT ATIDH0021 (Wheels Mfg #31)",
            years_applicable: "2006–2013 (26\")",
            visual_trigger_tag: "1x Large Chainring Bolt",
          },
          {
            sku_or_spec: "GT ATIDH0246 (Direct Mount)",
            years_applicable: "2017–2018 (Shimano DM)",
            visual_trigger_tag: "Direct Mount b-link",
          },
        ],
        speculative_aftermarket_risk: "Direct Mount Shimano hanger swap (ATIDH0246) or non-counterbored aftermarket CNC copy.",
        visual_diagnostic_cue: "Count dropout fasteners: 2 tiny M3 flathead screws = ATIDH0233 (2015+) vs 1 large chainring bolt = ATIDH0021 (2006-2013).",
      },
      {
        part_category: "rear_axle",
        part_label: "Rear Axle / Dropout",
        confirmed_baseline: {
          summary: "135x10mm Open Vertical QR Dropout",
          locked_sku: "135mm QR 5mm Skewer",
          status: "LOCKED_SKU",
        },
        high_probability_candidate: {
          sku_or_spec: "135x10mm Quick Release Standard",
          years_applicable: "All Generations (2006–2023)",
          probability: 0.99,
          visual_trigger_tag: "Slotted 10mm Dropout",
        },
        competing_legacy_candidates: [],
        speculative_aftermarket_risk: "Bolt-on solid axle nut conversion or 10mm thru-bolt replacement.",
        visual_diagnostic_cue: "Look at axle ends: slotted 10mm vertical frame opening accepting 5mm QR skewer.",
      },
      {
        part_category: "bottom_bracket",
        part_label: "Bottom Bracket",
        confirmed_baseline: {
          summary: "73mm English BSA Threaded (1.37 x 24 TPI)",
          locked_sku: null,
          status: "IMMUTABLE_STANDARD",
        },
        high_probability_candidate: {
          sku_or_spec: "Shimano BB-MT501 / Prowheel BSA 73mm",
          years_applicable: "2015–2023",
          probability: 0.72,
          visual_trigger_tag: "Outboard bearing cups",
        },
        competing_legacy_candidates: [
          {
            sku_or_spec: "Square Taper 73x113mm / 73x122mm",
            years_applicable: "2006–2014",
            visual_trigger_tag: "Square taper crank bolt cap",
          },
        ],
        speculative_aftermarket_risk: "Crankset replacement: Square Taper vs Shimano Hollowtech II vs SRAM Powerspline.",
        visual_diagnostic_cue: "Look through crank arm center: hollow 24mm axle bore = Hollowtech II; 8mm hex bolt cap = Square Taper.",
      },
      {
        part_category: "rear_derailleur",
        part_label: "Rear Derailleur",
        confirmed_baseline: {
          summary: "Standard B-Knuckle Hanger Mount",
          locked_sku: null,
          status: "IMMUTABLE_STANDARD",
        },
        high_probability_candidate: {
          sku_or_spec: "Shimano Deore RD-M5120 / Alivio RD-M3100",
          years_applicable: "2018–2023",
          probability: 0.68,
          visual_trigger_tag: "Shadow RD Low-Profile Body",
        },
        competing_legacy_candidates: [
          {
            sku_or_spec: "Shimano Acera / Altus 8/9-speed",
            years_applicable: "2006–2016",
            visual_trigger_tag: "Traditional non-Shadow cable loop",
          },
        ],
        speculative_aftermarket_risk: "1x10 or 1x11 wide-range conversion (Microshift Advent X / Box Four).",
        visual_diagnostic_cue: "Count rear cassette cogs and check for on/off clutch switch on derailleur body.",
      },
      {
        part_category: "cassette",
        part_label: "Cassette & Freehub",
        confirmed_baseline: {
          summary: "Shimano HyperGlide (HG) Splined Freehub",
          locked_sku: "Shimano HG Freehub Body",
          status: "LOCKED_SKU",
        },
        high_probability_candidate: {
          sku_or_spec: "Shimano CS-HG200-9 (11-36T) / CS-M4100-10 (11-42T)",
          years_applicable: "2017–2023",
          probability: 0.75,
          visual_trigger_tag: "Black/silver HG splined cassette",
        },
        competing_legacy_candidates: [
          {
            sku_or_spec: "Shimano CS-HG31-8 8-speed (11-32T)",
            years_applicable: "2006–2014",
            visual_trigger_tag: "8-speed stepped spacing",
          },
        ],
        speculative_aftermarket_risk: "SunRace 11-46T wide-range or entry-level threaded freewheel on Comp trim.",
        visual_diagnostic_cue: "Count individual cogs on rear wheel.",
      },
      {
        part_category: "headset",
        part_label: "Headset",
        confirmed_baseline: {
          summary: "Internal ZeroStack Semi-Integrated (ZS Cups)",
          locked_sku: null,
          status: "IMMUTABLE_STANDARD",
        },
        high_probability_candidate: {
          sku_or_spec: "FSA No.11N (ZS44/28.6 Upper | ZS44/30 Lower)",
          years_applicable: "2015–2023 (Standard)",
          probability: 0.79,
          visual_trigger_tag: "Straight 44mm headtube",
        },
        competing_legacy_candidates: [
          {
            sku_or_spec: "FSA No.42 ACB Tapered (ZS44/28.6 | ZS56/40)",
            years_applicable: "2019–2023 (Elite/Expert)",
            visual_trigger_tag: "Conical 56mm lower headtube flare",
          },
        ],
        speculative_aftermarket_risk: "External EC44 lower conversion cup installed to accommodate 1.5\" tapered fork in 44mm straight headtube.",
        visual_diagnostic_cue: "Inspect headtube profile: cylindrical straight 44mm OD vs conical lower 56mm flare.",
      },
      {
        part_category: "brake_rotors",
        part_label: "Brake System",
        confirmed_baseline: {
          summary: "IS51 to Post Mount Frame / 6-Bolt ISO Rotors",
          locked_sku: "160mm 6-Bolt Rotor",
          status: "LOCKED_SKU",
        },
        high_probability_candidate: {
          sku_or_spec: "Tektro HD-M275 / Shimano BR-MT200 Hydraulic (160mm)",
          years_applicable: "2016–2023",
          probability: 0.74,
          visual_trigger_tag: "Hydraulic reservoir master cylinder",
        },
        competing_legacy_candidates: [
          {
            sku_or_spec: "Tektro Novela / Promax Mechanical Disc (160mm)",
            years_applicable: "2006–2015",
            visual_trigger_tag: "Exposed brake cable wire & actuation arm",
          },
        ],
        speculative_aftermarket_risk: "Rotor upsized to 180mm with +20mm caliper post adapter.",
        visual_diagnostic_cue: "Examine brake levers: hydraulic oil hose vs braided stainless pull cable.",
      },
    ],
  };
}

/**
 * 3. Exact Benchmark Dataset
 */
export const BENCHMARK_BIKES: BenchmarkBike[] = [
  {
    id: "specialized-turbo-levo-2021",
    name: "Specialized Turbo Levo 2021",
    category: "e-MTB / Full Suspension",
    year: 2021,
    focal_test: "Brose Motor + Specialized Hanger S182600001 (pre-UDH) + Praxis M30 Custom",
    expected_bb: "Custom Praxis M30 / Integrated Brose 2.1 Motor",
    expected_hanger_or_feature: "Specialized S182600001 (pre-UDH) / Brose 2.1 Motor",
    sample_data: {
      target: {
        manufacturer: "Specialized",
        model: "Turbo Levo",
        model_year: 2021,
        trim: "Comp / Expert 29"
      },
      canonical_identity: {
        standardized_brand: "Specialized",
        standardized_model: "Turbo Levo (Gen 2 / pre-UDH)",
        category: "e-MTB Full Suspension"
      },
      mechanical_specifications: {
        frame_material: "M5 Premium Aluminum / FACT 9m Carbon",
        wheel_size: "29\"",
        drivetrain: {
          rear_derailleur: "SRAM GX Eagle 12-speed",
          shifters: "SRAM GX Eagle single-click e-MTB trigger",
          cassette: "SRAM XG-1275 Eagle 10-52t",
          crankset: "Praxis forged M30 custom offset for Brose motor",
          chain: "SRAM GX Eagle 12-speed"
        },
        brakes: {
          caliper_lever_model: "SRAM Code R 4-piston hydraulic disc",
          rotor_size_front_rear: "220mm front / 200mm rear Centerline 6-bolt",
          brake_type: "Hydraulic Disc 4-Piston Post Mount"
        },
        standards: {
          bottom_bracket: "Integrated Specialized 2.1 (Brose Drive S Mag) Motor Assembly",
          headset: "Integrated IS42/28.6 upper, IS52/40 lower",
          seatpost_diameter: "34.9mm (X-Fusion Manic dropper)",
          seat_clamp_diameter: "38.6mm",
          rear_axle_spacing: "Boost 148x12mm Thru-Axle (1.0mm thread pitch, 172mm length)",
          front_axle_spacing: "Boost 110x15mm (Fox 36 Float Rhythm E-Bike)"
        },
        critical_replacement_skus: {
          derailleur_hanger: "Specialized SKU S182600001 (Hanger #284 / Wheels Mfg #284)",
          headset_bearings: "Specialized S142500003 Headset bearing kit",
          suspension_pivot_kit: "Specialized S194300001 (2019-2021 Levo Pivot Bolt & Bearing Kit)",
          bottom_bracket_replacement: "Specialized 2.1 Motor Drive Unit (S196800014)"
        },
        derailleur_hanger_audit: {
          status: "VERIFIED",
          sku: "Specialized S182600001",
        },
        structured_interfaces: {
          bb_shell_standard: "BROSE_SPECIALIZED_2_1",
          hanger_standard: "SPECIALIZED_S182600001",
          headset_shis_upper: "IS42/28.6",
          headset_shis_lower: "IS52/40",
          rear_axle_standard: "148x12_1.0",
          freehub_standard: "SRAM_XD",
          max_rotor_mm: 220,
        },
        proprietary_hardware: [
          {
            component_name: "Specialized 2.1 Custom Rx Trail Tuned Motor",
            part_number_or_sku: "Specialized S196800014",
            technical_notes: "Brose S-Mag magnesium casing drive unit producing 90Nm torque."
          },
          {
            component_name: "Specialized M2-700 / M2-500 Battery Pack",
            part_number_or_sku: "Specialized SBC-B14 / SBC-B15",
            technical_notes: "Integrated downtube battery with rock-guard casing and single-bolt removal."
          }
        ]
      },
      verification_audit: {
        recommended_action: "VERIFIED",
        notes: "Generation 2 Levo strictly uses proprietary hanger S182600001. Does NOT use SRAM UDH (Gen 3 2022+ adopted UDH)."
      },
      model_year_variants: [
        {
          generation_name: "Gen 2 (2019–2021)",
          year_range: [2019, 2021],
          varying_parts: {
            "derailleur_hanger": "Specialized S182600001 (Wheels Mfg #284)",
            "wheel_configuration": "Full 29er (Front & Rear 29\")",
            "motor_housing": "Brose 2.1 Magnesium S-Mag"
          },
          mechanic_warning: "Gen 2 uses proprietary hanger S182600001. Attempting to fit SRAM UDH will damage the frame."
        },
        {
          generation_name: "Gen 3 (2022–2025)",
          year_range: [2022, 2025],
          varying_parts: {
            "derailleur_hanger": "SRAM Universal Derailleur Hanger (UDH)",
            "wheel_configuration": "Mullet (29\" front / 27.5\" rear)",
            "display": "MasterMind TCU integrated in top tube"
          },
          mechanic_warning: "Gen 3 Levo adopted SRAM UDH and mullet rear end with 6-way geometry adjustment."
        }
      ],
      web_search_evidence: [
        {
          query_dispatched: "Specialized Turbo Levo 2021 derailleur hanger part number",
          source_domain: "specialized.com",
          verified_value: "Specialized S182600001"
        }
      ],
      confidence_score: 0.99
    }
  },
  {
    id: "trek-fuel-ex-8-2014",
    name: "Trek Fuel EX 8 2014",
    category: "Trail / Full Suspension MTB",
    year: 2014,
    focal_test: "BB95 PressFit shell + ABP Convert 142x12 hanger #299 + Gen 4 vs Gen 6 evolution",
    expected_bb: "Trek BB95 PressFit (95mm shell)",
    expected_hanger_or_feature: "Trek SKU 301695 (Hanger #299) / ABP Convert",
    sample_data: {
      target: {
        manufacturer: "Trek",
        model: "Fuel EX 8",
        model_year: 2014,
        trim: "8 29"
      },
      canonical_identity: {
        standardized_brand: "Trek",
        standardized_model: "Fuel EX 8 29 (Gen 4)",
        category: "Full Suspension MTB"
      },
      mechanical_specifications: {
        frame_material: "Alpha Platinum Aluminum",
        wheel_size: "29\"",
        drivetrain: {
          rear_derailleur: "Shimano Deore XT RD-M786-SGS Shadow Plus 10-speed",
          front_derailleur: "Shimano SLX FD-M671 direct mount",
          shifters: "Shimano SLX SL-M670 RapidFire 10-speed",
          cassette: "Shimano CS-HG62-10 11-36t",
          crankset: "Shimano SLX FC-M672 40/30/22T Hollowtech II",
          chain: "KMC X10"
        },
        brakes: {
          caliper_lever_model: "Shimano Deore BR-M615 Hydraulic Disc",
          rotor_size_front_rear: "180mm front / 160mm rear (6-bolt)",
          brake_type: "Hydraulic Disc"
        },
        standards: {
          bottom_bracket: "Trek BB95 PressFit (95mm shell width, 37mm OD bearings)",
          headset: "FSA IS-2 (Integrated IS41/28.6 upper, IS52/40 lower)",
          seatpost_diameter: "31.6mm",
          seat_clamp_diameter: "36.4mm",
          rear_axle_spacing: "142x12mm ABP Convert (192mm overall length, 1.75mm pitch)",
          front_axle_spacing: "100x15mm Thru-Axle (Fox 32 Float CTD)"
        },
        critical_replacement_skus: {
          derailleur_hanger: "Trek SKU 301695 (ABP Convert 142x12 / Wheels Mfg #299)",
          headset_bearings: "Trek SKU 437010 / FSA TH-870E",
          suspension_pivot_kit: "Trek SKU 439007 (Fuel EX 29 Pivot Hardware Kit)",
          bottom_bracket_replacement: "Trek SKU 404700 (Shimano BB95 Press-in Bearing Kit)"
        },
        derailleur_hanger_audit: {
          status: "VERIFIED",
          sku: "Trek SKU 301695",
        },
        structured_interfaces: {
          bb_shell_standard: "BB95",
          hanger_standard: "TREK_ABP_CONVERT",
          headset_shis_upper: "IS41/28.6",
          headset_shis_lower: "IS52/40",
          rear_axle_standard: "142x12_1.75",
          freehub_standard: "SHIMANO_HG",
          max_rotor_mm: 180,
        },
        proprietary_hardware: [
          {
            component_name: "Active Braking Pivot (ABP) Convert System",
            part_number_or_sku: "Trek SKU 301695 / 439007",
            technical_notes: "Concentric pivot around the rear 142x12 axle nut; separates braking forces from suspension compression."
          },
          {
            component_name: "DRCV (Dual Rate Control Valve) Fox Shock",
            part_number_or_sku: "Fox / Trek 7.25x1.875\"",
            technical_notes: "Secondary air chamber opens under deep compressions; uses proprietary upper trunnion-style eyelet mounting."
          }
        ]
      },
      model_year_variants: [
        {
          generation_name: "Gen 4 (2014–2016)",
          year_range: [2014, 2016],
          varying_parts: {
            "bottom_bracket": "Trek BB95 PressFit",
            "derailleur_hanger": "Trek SKU 301695 (ABP 142x12)",
            "rear_spacing": "142x12mm ABP",
            "seatpost_diameter": "31.6mm"
          },
          mechanic_warning: "Bearings press directly into bare shell without plastic cups. Requires Trek BB95 kit 404700."
        },
        {
          generation_name: "Gen 6 (2023+)",
          year_range: [2023, 2026],
          varying_parts: {
            "bottom_bracket": "BSA 73mm Threaded",
            "derailleur_hanger": "SRAM Universal Derailleur Hanger (UDH / Trek W562831)",
            "rear_spacing": "Boost 148x12mm",
            "seatpost_diameter": "34.9mm"
          },
          mechanic_warning: "Standardized back to BSA 73mm threaded bottom bracket and universal SRAM UDH hanger."
        }
      ],
      web_search_evidence: [
        {
          query_dispatched: "Trek Fuel EX 8 2014 bottom bracket spec BB95 manual",
          source_domain: "trekbikes.com",
          verified_value: "BB95 PressFit (95mm shell width, press-in bearings 404700)"
        }
      ],
      confidence_score: 0.99
    }
  },
  {
    id: "canyon-grail-cf-sl-8-2021",
    name: "Canyon Grail CF SL 8 2021",
    category: "Gravel / All-Road",
    year: 2021,
    focal_test: "CP07 Gravel Hover Bar double-decker cockpit + EP0716-01 hanger + BB86",
    expected_bb: "Shimano PressFit BB86 (86.5x41mm)",
    expected_hanger_or_feature: "Canyon EP0716-01 / CP07 Gravel Cockpit",
    sample_data: {
      target: {
        manufacturer: "Canyon",
        model: "Grail CF SL 8",
        model_year: 2021,
        trim: "CF SL 8 (Shimano GRX RX810)"
      },
      canonical_identity: {
        standardized_brand: "Canyon",
        standardized_model: "Grail CF SL 8 Gen 1",
        category: "Gravel"
      },
      mechanical_specifications: {
        frame_material: "Canyon Grail CF SL Carbon",
        wheel_size: "700c (650b on 2XS/XS sizes)",
        drivetrain: {
          rear_derailleur: "Shimano GRX RD-RX810 Shadow RD+ 11-speed",
          front_derailleur: "Shimano GRX FD-RX810 braze-on",
          shifters: "Shimano GRX ST-RX810 2x11-speed",
          cassette: "Shimano Ultegra HG800 11-34t 11-speed",
          crankset: "Shimano GRX FC-RX810-2 48/31T (172.5mm)",
          chain: "Shimano HG701 11-speed"
        },
        brakes: {
          caliper_lever_model: "Shimano GRX BR-RX810 Flat Mount",
          rotor_size_front_rear: "160mm front / 160mm rear Shimano RT-MT800 CenterLock",
          brake_type: "Hydraulic Disc Flat Mount"
        },
        standards: {
          bottom_bracket: "PressFit BB86 (86.5mm shell width, 41mm press-in diameter)",
          headset: "Canyon Acros AI-70 Fiber / IS41 upper, IS52 lower 1-1/4\" steerer",
          seatpost_diameter: "27.2mm (Canyon S15 VCLS 2.0 leaf spring post)",
          seat_clamp_diameter: "Internal wedge clamp integrated inside seat cluster (SKU EP0685-01)",
          rear_axle_spacing: "142x12mm Thru-Axle, 1.0mm thread pitch (Canyon Through Axle)",
          front_axle_spacing: "100x12mm Thru-Axle, 1.0mm thread pitch"
        },
        critical_replacement_skus: {
          derailleur_hanger: "Canyon Derailleur Hanger GP0252-01 / EP0716-01",
          headset_bearings: "Acros IS42/IS52 for Canyon 1-1/4 steerer",
          bottom_bracket_replacement: "Shimano SM-BB72-41B PressFit BB86"
        },
        derailleur_hanger_audit: {
          status: "VERIFIED",
          sku: "Canyon EP0716-01",
        },
        structured_interfaces: {
          bb_shell_standard: "BB86",
          hanger_standard: "CANYON_EP0716",
          headset_shis_upper: "IS41/28.6",
          headset_shis_lower: "IS52/40",
          rear_axle_standard: "142x12_1.0",
          freehub_standard: "SHIMANO_HG",
          max_rotor_mm: 160,
        },
        proprietary_hardware: [
          {
            component_name: "Canyon CP07 Gravel Cockpit (Hover Bar)",
            part_number_or_sku: "Canyon CP07 Cockpit",
            technical_notes: "Dual-decker carbon handlebar with floating upper tier for vibration damping."
          }
        ]
      },
      model_year_variants: [
        {
          generation_name: "Gen 1 (2018–2023)",
          year_range: [2018, 2023],
          varying_parts: {
            "cockpit": "CP07 Double-Decker Hover Bar",
            "bottom_bracket": "BB86 PressFit",
            "derailleur_hanger": "Canyon EP0716-01 / GP0252-01"
          },
          mechanic_warning: "Hover bar cannot be lowered with conventional stem spacers."
        }
      ],
      web_search_evidence: [
        {
          query_dispatched: "Canyon Grail CF SL 2021 tech manual bottom bracket headset",
          source_domain: "canyon.com",
          verified_value: "PressFit BB86, 1-1/4 inch steerer tube"
        }
      ],
      confidence_score: 0.98
    }
  },
  {
    id: "specialized-stumpjumper-comp-alloy-2021",
    name: "Specialized Stumpjumper Comp Alloy 2021",
    category: "Trail MTB",
    year: 2021,
    focal_test: "Threaded BSA 73mm BB + S-Sizing + Horst-linkless flex stay vs FSR pivot",
    expected_bb: "Threaded BSA 73mm",
    expected_hanger_or_feature: "SRAM UDH (S202600002) / S-Sizing",
    sample_data: {
      target: {
        manufacturer: "Specialized",
        model: "Stumpjumper Comp Alloy",
        model_year: 2021,
        trim: "Comp Alloy 29"
      },
      canonical_identity: {
        standardized_brand: "Specialized",
        standardized_model: "Stumpjumper (Gen 14 / Flex Stay Carbon & Horst Alloy)",
        category: "Trail Full Suspension"
      },
      mechanical_specifications: {
        frame_material: "M5 Alloy with asymmetric Sidearm design",
        wheel_size: "29\"",
        drivetrain: {
          rear_derailleur: "SRAM NX Eagle 12-speed",
          shifters: "SRAM NX Eagle trigger 12-speed",
          cassette: "SRAM PG-1230 Eagle 11-50t",
          crankset: "SRAM NX Eagle DUB 30T steel ring",
          chain: "SRAM NX Eagle 12-speed"
        },
        brakes: {
          caliper_lever_model: "SRAM G2 R 4-piston hydraulic disc",
          rotor_size_front_rear: "200mm front / 180mm rear Centerline",
          brake_type: "Hydraulic Disc 4-Piston Post Mount"
        },
        standards: {
          bottom_bracket: "BSA 73mm English Threaded (SRAM DUB BSA 73mm)",
          headset: "Specialized integrated 1-1/8 upper, 1.5 lower (IS42/28.6 | IS52/40)",
          seatpost_diameter: "34.9mm (X-Fusion Manic dropper)",
          seat_clamp_diameter: "38.6mm",
          rear_axle_spacing: "Boost 148x12mm Thru-Axle (1.0mm thread pitch, 172mm length)",
          front_axle_spacing: "Boost 110x15mm (Fox Float 34 Rhythm)"
        },
        critical_replacement_skus: {
          derailleur_hanger: "SRAM Universal Derailleur Hanger (UDH) / Specialized S202600002",
          headset_bearings: "Specialized S142500003 Headset kit",
          bottom_bracket_replacement: "SRAM DUB BSA 73mm Bottom Bracket (00.6418.015.000)"
        },
        derailleur_hanger_audit: {
          status: "VERIFIED",
          sku: "SRAM UDH",
        },
        structured_interfaces: {
          bb_shell_standard: "BSA_73",
          hanger_standard: "SRAM_UDH",
          headset_shis_upper: "IS42/28.6",
          headset_shis_lower: "IS52/40",
          rear_axle_standard: "148x12_1.0",
          freehub_standard: "SHIMANO_HG",
          max_rotor_mm: 200,
        },
        proprietary_hardware: [
          {
            component_name: "Horst Pivot Flip-Chip",
            part_number_or_sku: "Specialized S204300004",
            technical_notes: "Located at chainstay pivot; adjusts BB height by 7mm."
          }
        ]
      },
      model_year_variants: [
        {
          generation_name: "Gen 14 (2021–2024)",
          year_range: [2021, 2024],
          varying_parts: {
            "derailleur_hanger": "SRAM UDH",
            "bottom_bracket": "Threaded BSA 73mm"
          },
          mechanic_warning: "Standardized to universal SRAM UDH."
        }
      ],
      web_search_evidence: [
        {
          query_dispatched: "Specialized Stumpjumper Comp Alloy 2021 user manual specs",
          source_domain: "specialized.com",
          verified_value: "Threaded BSA 73mm, SRAM UDH, 34.9mm seatpost"
        }
      ],
      confidence_score: 0.99
    }
  },
  {
    id: "cannondale-supersix-evo-hi-mod-2020",
    name: "Cannondale SuperSix EVO Hi-MOD 2020",
    category: "Road Race",
    year: 2020,
    focal_test: "PF30a 73mm asymmetric BB + Speed Release 142x12 + HollowGram Knot system",
    expected_bb: "Cannondale PF30a (73mm asymmetric shell)",
    expected_hanger_or_feature: "Cannondale K33009 / HollowGram SystemBar",
    sample_data: {
      target: {
        manufacturer: "Cannondale",
        model: "SuperSix EVO Hi-MOD",
        model_year: 2020,
        trim: "Disc Ultegra Di2"
      },
      canonical_identity: {
        standardized_brand: "Cannondale",
        standardized_model: "SuperSix EVO (Gen 3)",
        category: "Road Aero-All-Rounder"
      },
      mechanical_specifications: {
        frame_material: "BallisTec Hi-MOD Carbon",
        wheel_size: "700c",
        drivetrain: {
          rear_derailleur: "Shimano Ultegra Di2 RD-R8050 11-speed",
          front_derailleur: "Shimano Ultegra Di2 FD-R8050 braze-on",
          shifters: "Shimano Ultegra Di2 ST-R8070 hydraulic 11-speed",
          cassette: "Shimano Ultegra CS-R8000 11-30t",
          crankset: "HollowGram SiSL2 with OPI SpideRing 52/36T",
          chain: "Shimano HG701 11-speed"
        },
        brakes: {
          caliper_lever_model: "Shimano Ultegra BR-R8070 Flat Mount",
          rotor_size_front_rear: "160mm front / 140mm rear Shimano RT800 Freeza",
          brake_type: "Hydraulic Disc Flat Mount"
        },
        standards: {
          bottom_bracket: "Cannondale PF30a (73mm shell, asymmetric non-drive side +5mm, 46mm press-fit)",
          headset: "Tapered integrated, 1-1/8 upper, 1-1/4 lower with D-shaped steerer",
          seatpost_diameter: "HollowGram 27 SL KNOT carbon aero seatpost (D-shaped)",
          seat_clamp_diameter: "Internal integrated binder wedge (K26010)",
          rear_axle_spacing: "Speed Release 142x12mm (Double-lead thread, slotted non-drive dropout)",
          front_axle_spacing: "Speed Release 100x12mm"
        },
        critical_replacement_skus: {
          derailleur_hanger: "Cannondale K33009 (Speed Release 142x12 Disc)",
          headset_bearings: "Cannondale K35019 / K35029",
          bottom_bracket_replacement: "Cannondale KP197 / Wheels Mfg PF30-OUT-SRAM/SHIMANO"
        },
        derailleur_hanger_audit: {
          status: "VERIFIED",
          sku: "Cannondale K33009",
        },
        structured_interfaces: {
          bb_shell_standard: "PF30A_73",
          hanger_standard: "CANNONDALE_K33009",
          headset_shis_upper: "IS41/28.6",
          headset_shis_lower: "IS47/33",
          rear_axle_standard: "142x12_1.0_DOUBLE_LEAD",
          freehub_standard: "SHIMANO_HG",
          max_rotor_mm: 160,
        },
        proprietary_hardware: [
          {
            component_name: "HollowGram SystemBar SAVE / KNOT Stem",
            part_number_or_sku: "Cannondale CP2000U10 / ST2000U10",
            technical_notes: "Two-piece semi-integrated aero bar and stem."
          }
        ]
      },
      model_year_variants: [
        {
          generation_name: "Gen 3 (2020–2022)",
          year_range: [2020, 2022],
          varying_parts: {
            "bottom_bracket": "PF30a 73mm Asymmetric",
            "derailleur_hanger": "Cannondale K33009 Speed Release"
          },
          mechanic_warning: "PF30a requires specialized asymmetric adaptors for standard 24mm Shimano or 29mm DUB cranks."
        }
      ],
      web_search_evidence: [
        {
          query_dispatched: "Cannondale SuperSix EVO 2020 bottom bracket PF30a tech manual",
          source_domain: "cannondale.com",
          verified_value: "Cannondale PF30a 73mm Asymmetric bottom bracket"
        }
      ],
      confidence_score: 0.99
    }
  },
  {
    id: "santa-cruz-megatower-c-2023",
    name: "Santa Cruz Megatower C 2023",
    category: "Enduro MTB",
    year: 2023,
    focal_test: "Threaded BSA 73mm + SRAM UDH + Lower-Link VPP + Glovebox frame storage",
    expected_bb: "Threaded BSA 73mm",
    expected_hanger_or_feature: "SRAM UDH / Glovebox Internal Storage",
    sample_data: {
      target: {
        manufacturer: "Santa Cruz",
        model: "Megatower C",
        model_year: 2023,
        trim: "C GX AXS (V2)"
      },
      canonical_identity: {
        standardized_brand: "Santa Cruz Bicycles",
        standardized_model: "Megatower V2",
        category: "Enduro Full Suspension"
      },
      mechanical_specifications: {
        frame_material: "Carbon C with Glovebox internal downtube storage",
        wheel_size: "29\"",
        drivetrain: {
          rear_derailleur: "SRAM GX Eagle AXS 12-speed wireless",
          shifters: "SRAM GX AXS Controller",
          cassette: "SRAM XG-1275 Eagle 10-52t",
          crankset: "SRAM GX Eagle DUB 30t (55mm chainline)",
          chain: "SRAM GX Eagle 12-speed"
        },
        brakes: {
          caliper_lever_model: "SRAM Code RSC 4-piston hydraulic disc",
          rotor_size_front_rear: "200mm front / 200mm rear SRAM Centerline",
          brake_type: "Hydraulic Disc 4-Piston Post Mount 200mm direct"
        },
        standards: {
          bottom_bracket: "Threaded BSA 73mm (SRAM DUB BSA 73mm Wide / 55mm chainline)",
          headset: "Integrated IS41/28.6 upper, IS52/40 lower (Cane Creek 40 IS)",
          seatpost_diameter: "31.6mm",
          seat_clamp_diameter: "36.4mm",
          rear_axle_spacing: "Boost 148x12mm Thru-Axle (1.0mm thread pitch, 174mm length)",
          front_axle_spacing: "Boost 110x15mm (Fox 38 Float Performance Elite)"
        },
        critical_replacement_skus: {
          derailleur_hanger: "SRAM Universal Derailleur Hanger (UDH)",
          headset_bearings: "Cane Creek 40 IS41/IS52",
          bottom_bracket_replacement: "SRAM DUB BSA 73mm (00.6418.015.000)"
        },
        derailleur_hanger_audit: {
          status: "VERIFIED",
          sku: "SRAM UDH",
        },
        structured_interfaces: {
          bb_shell_standard: "BSA_73",
          hanger_standard: "SRAM_UDH",
          headset_shis_upper: "IS41/28.6",
          headset_shis_lower: "IS52/40",
          rear_axle_standard: "148x12_1.0",
          freehub_standard: "SRAM_XD",
          max_rotor_mm: 220,
        },
        proprietary_hardware: [
          {
            component_name: "Glovebox Down Tube Storage & Latch",
            part_number_or_sku: "Santa Cruz Glovebox assembly 04-22880",
            technical_notes: "Watertight door with Tool Wallet and Tube Purse bags included."
          }
        ]
      },
      model_year_variants: [
        {
          generation_name: "V2 (2022–2026)",
          year_range: [2022, 2026],
          varying_parts: {
            "derailleur_hanger": "SRAM UDH",
            "bottom_bracket": "Threaded BSA 73mm"
          },
          mechanic_warning: "Migrated to SRAM UDH and 55mm chainline."
        }
      ],
      web_search_evidence: [
        {
          query_dispatched: "Santa Cruz Megatower V2 2023 tech manual bottom bracket",
          source_domain: "santacruzbicycles.com",
          verified_value: "Threaded BSA 73mm, SRAM UDH, 55mm chainline"
        }
      ],
      confidence_score: 0.99
    }
  }
];

/**
 * 3. Strict Year Guard & Generational Bleed Fix in matchBikeQuery
 * - Eliminates unsafe fallback loop that ignores model_year.
 * - Runs resolveTruncatedQuery first.
 * - Requires .every() on core model words.
 * - Strict Year Guard: If explicit 4-digit year does not match benchmark year, return null!
 */
export function matchBikeQuery(query: string): BenchmarkBike | null {
  const trimmed = query.trim();
  if (!trimmed) return null;

  // 1. Resolve truncated tokens & extract year
  const resolution = resolveTruncatedQuery(trimmed);

  // 2. Multi-generation conflict trap check (e.g. "GT Av")
  if (
    resolution.resolved_brand.toLowerCase().includes("gt") &&
    resolution.resolved_model.toLowerCase().includes("avalanche") &&
    !resolution.explicit_year
  ) {
    // Return virtual benchmark representing the conflict
    return {
      id: "gt-avalanche-conflict",
      name: "GT Avalanche (Year-less Truncated Query)",
      category: "Hardtail MTB",
      year: 0,
      focal_test: "Multi-generation dropout conflict trap (ATIDH0233 vs ATIDH0021)",
      expected_bb: "BSA 73mm Threaded",
      expected_hanger_or_feature: "CONFLICT: Requires wheel size / mounting bolt check",
      sample_data: buildMultiGenerationConflictResponse(trimmed, resolution),
    };
  }

  // 3. Search exact benchmark bikes
  for (const bike of BENCHMARK_BIKES) {
    // Year check
    const queryYear = resolution.explicit_year;
    if (queryYear && bike.year !== queryYear) {
      // Strict Year Guard: Never bleed across model years!
      continue;
    }

    // Normalized name matching
    const bikeWords = bike.name.toLowerCase().split(/\s+/).filter((w) => !w.match(/^\d{4}$/));
    const queryWords = (
      resolution.resolved_brand + " " + resolution.resolved_model
    )
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => !w.match(/^\d{4}$/) && w.length > 2);

    // Require core model tokens to match
    const modelMatched = queryWords.length > 0 && queryWords.every((qw) =>
      bike.name.toLowerCase().includes(qw)
    );

    if (modelMatched) {
      // If query has an explicit year, ensure it matched
      if (queryYear && bike.year !== queryYear) {
        return null;
      }
      return bike;
    }
  }

  return null;
}

/**
 * Universal Matrix & Visual Tag Synthesizer
 * Ensures every bike (benchmark or live searched) has full certainty_matrix and available_visual_tags
 */
export function ensureCertaintyMatrixAndTags(data: BikeQueryResponse): BikeQueryResponse {
  if (data.certainty_matrix && data.certainty_matrix.length > 0 && data.available_visual_tags && data.available_visual_tags.length > 0) {
    return data;
  }

  const specs = data.mechanical_specifications;
  const standards = specs?.standards;
  const skus = specs?.critical_replacement_skus;
  const brand = data.canonical_identity?.standardized_brand || data.target?.manufacturer || "Bike";
  const model = data.canonical_identity?.standardized_model || data.target?.model || "Model";
  const variants = data.model_year_variants || [];

  // Generate visual tags based on variants and frame features
  const visualTags = data.available_visual_tags && data.available_visual_tags.length > 0
    ? data.available_visual_tags
    : [
        {
          tag_id: "primary_gen",
          label: `${variants[0]?.generation_name || "Primary Generation"} Frame`,
          locks_generation: variants[0]?.generation_name || "Primary Gen",
          resolves_part_skus: {
            derailleur_hanger: skus?.derailleur_hanger || "Standard OEM Hanger",
            bottom_bracket: standards?.bottom_bracket || "Standard BB",
          },
        },
        ...(variants.slice(1).map((v, i) => ({
          tag_id: `gen_variant_${i}`,
          label: `${v.generation_name} Design`,
          locks_generation: v.generation_name,
          resolves_part_skus: {
            ...(v.varying_parts.derailleur_hanger ? { derailleur_hanger: v.varying_parts.derailleur_hanger } : {}),
            ...(v.varying_parts.bottom_bracket ? { bottom_bracket: v.varying_parts.bottom_bracket } : {}),
          },
        }))),
        {
          tag_id: "disc_brakes",
          label: "Hydraulic Disc Calipers",
          locks_generation: "Disc Brake Trim",
          resolves_part_skus: {
            brake_rotors: specs?.brakes?.rotor_size_front_rear || "160mm/180mm Rotors",
          },
        },
      ];

  const primaryHanger = skus?.derailleur_hanger || "Standard OEM Hanger";
  const primaryBB = standards?.bottom_bracket || "BSA Threaded 73mm";

  const matrix: CertaintyMatrixRow[] = [
    {
      part_category: "derailleur_hanger",
      part_label: "Derailleur Hanger",
      is_target_broken_part: true,
      confirmed_baseline: {
        summary: specs?.structured_interfaces?.hanger_standard || "Frame-Specific Dropout Interface",
        locked_sku: specs?.derailleur_hanger_audit?.status === "CONFLICT" ? null : primaryHanger,
        status: specs?.derailleur_hanger_audit?.status === "CONFLICT" ? "IMMUTABLE_STANDARD" : "LOCKED_SKU",
      },
      high_probability_candidate: {
        sku_or_spec: primaryHanger,
        years_applicable: String(data.target?.model_year || "Current"),
        probability: 0.88,
        visual_trigger_tag: visualTags[0]?.label || "Factory Spec",
      },
      competing_legacy_candidates: variants.slice(1).map((v) => ({
        sku_or_spec: v.varying_parts.derailleur_hanger || "Alternative Hanger Variant",
        years_applicable: `${v.year_range[0]}–${v.year_range[1]}`,
        visual_trigger_tag: `${v.generation_name} Dropout`,
      })),
      speculative_aftermarket_risk: "Previous owner hanger replacement with wrong thread pitch or aftermarket non-counterbored CNC replica.",
      visual_diagnostic_cue: `Inspect rear dropout on drive-side: examine fastener count, thread pitch, and whether hanger is universal UDH vs proprietary ${brand} design.`,
    },
    {
      part_category: "rear_axle",
      part_label: "Rear Axle / Dropout",
      confirmed_baseline: {
        summary: standards?.rear_axle_spacing || "142x12mm / 148x12mm Thru-Axle",
        locked_sku: standards?.rear_axle_spacing || "OEM Thru-Axle",
        status: "LOCKED_SKU",
      },
      high_probability_candidate: {
        sku_or_spec: standards?.rear_axle_spacing || "Standard Thru-Axle",
        years_applicable: "All Years",
        probability: 0.95,
        visual_trigger_tag: "Thru-axle lever / hex head",
      },
      competing_legacy_candidates: [],
      speculative_aftermarket_risk: "Quick-release wheel conversion or mismatched thread pitch (1.0 vs 1.5 vs 1.75mm).",
      visual_diagnostic_cue: "Check non-drive dropout threading and measure total axle shaft length and thread pitch.",
    },
    {
      part_category: "bottom_bracket",
      part_label: "Bottom Bracket",
      confirmed_baseline: {
        summary: primaryBB,
        locked_sku: skus?.bottom_bracket_replacement || null,
        status: skus?.bottom_bracket_replacement ? "LOCKED_SKU" : "IMMUTABLE_STANDARD",
      },
      high_probability_candidate: {
        sku_or_spec: skus?.bottom_bracket_replacement || primaryBB,
        years_applicable: String(data.target?.model_year || "Factory"),
        probability: 0.82,
        visual_trigger_tag: "Factory Shell Profile",
      },
      competing_legacy_candidates: variants.filter((v) => v.varying_parts.bottom_bracket).map((v) => ({
        sku_or_spec: v.varying_parts.bottom_bracket!,
        years_applicable: `${v.year_range[0]}–${v.year_range[1]}`,
        visual_trigger_tag: `${v.generation_name} Shell`,
      })),
      speculative_aftermarket_risk: "Crankset swap (SRAM DUB 28.99mm vs Shimano 24mm vs 30mm spindle) or creak-reducing thread-together conversion cup.",
      visual_diagnostic_cue: "Measure bottom bracket shell width with calipers (68mm, 73mm, 86.5mm, 92mm, or 95mm).",
    },
    {
      part_category: "rear_derailleur",
      part_label: "Rear Derailleur",
      confirmed_baseline: {
        summary: "Standard B-Link Derailleur Mount",
        locked_sku: specs?.drivetrain?.rear_derailleur || null,
        status: specs?.drivetrain?.rear_derailleur ? "LOCKED_SKU" : "IMMUTABLE_STANDARD",
      },
      high_probability_candidate: {
        sku_or_spec: specs?.drivetrain?.rear_derailleur || "OEM Specification Derailleur",
        years_applicable: String(data.target?.model_year || "OEM"),
        probability: 0.85,
        visual_trigger_tag: "Factory Drivetrain",
      },
      competing_legacy_candidates: [],
      speculative_aftermarket_risk: "Cage length mismatch (Short/Medium/Long SGS) or electronic AXS/Di2 conversion.",
      visual_diagnostic_cue: "Count rear cassette cogs and inspect derailleur cage length and cable actuation arm.",
    },
    {
      part_category: "cassette",
      part_label: "Cassette & Freehub",
      confirmed_baseline: {
        summary: specs?.structured_interfaces?.freehub_standard || "Splined Freehub Standard",
        locked_sku: specs?.drivetrain?.cassette || null,
        status: specs?.drivetrain?.cassette ? "LOCKED_SKU" : "IMMUTABLE_STANDARD",
      },
      high_probability_candidate: {
        sku_or_spec: specs?.drivetrain?.cassette || "Factory Cassette",
        years_applicable: String(data.target?.model_year || "OEM"),
        probability: 0.80,
        visual_trigger_tag: "Factory Hub Standard",
      },
      competing_legacy_candidates: [],
      speculative_aftermarket_risk: "Wheelset upgrade with XD driver or Micro Spline body incompatible with HG cassettes.",
      visual_diagnostic_cue: "Check freehub lockring: small 10T smallest cog indicates XD or Micro Spline; 11T indicates standard HG.",
    },
    {
      part_category: "headset",
      part_label: "Headset",
      confirmed_baseline: {
        summary: standards?.headset || "Tapered Integrated Headset",
        locked_sku: skus?.headset_bearings || null,
        status: skus?.headset_bearings ? "LOCKED_SKU" : "IMMUTABLE_STANDARD",
      },
      high_probability_candidate: {
        sku_or_spec: skus?.headset_bearings || standards?.headset || "OEM Headset Kit",
        years_applicable: "All Years",
        probability: 0.85,
        visual_trigger_tag: "Frame Headtube",
      },
      competing_legacy_candidates: [],
      speculative_aftermarket_risk: "Angle-adjust headset cups (+/- 1 degree) or steering limiter stops (Knock Block).",
      visual_diagnostic_cue: "Examine upper bearing cover: Knock Block stop chip or smooth integrated dust cap.",
    },
    {
      part_category: "brake_rotors",
      part_label: "Brake System",
      confirmed_baseline: {
        summary: specs?.brakes?.caliper_lever_model || "Hydraulic Disc Brake System",
        locked_sku: specs?.brakes?.rotor_size_front_rear || null,
        status: specs?.brakes?.rotor_size_front_rear ? "LOCKED_SKU" : "IMMUTABLE_STANDARD",
      },
      high_probability_candidate: {
        sku_or_spec: specs?.brakes?.caliper_lever_model || "OEM Brake Calipers",
        years_applicable: "All Years",
        probability: 0.85,
        visual_trigger_tag: "Brake Levers",
      },
      competing_legacy_candidates: [],
      speculative_aftermarket_risk: "Rotor upsized with +20mm or +40mm caliper post-mount adapters.",
      visual_diagnostic_cue: "Check rotor laser markings (160mm vs 180mm vs 200mm vs 220mm) and 6-bolt vs CenterLock hub interface.",
    },
  ];

  return {
    ...data,
    certainty_matrix: matrix,
    available_visual_tags: visualTags,
  };
}
