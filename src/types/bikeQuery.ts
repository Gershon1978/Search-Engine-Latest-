export interface BikeTarget {
  manufacturer: string;
  model: string;
  model_year?: number | string;
  trim?: string;
}

export interface ModelCandidate {
  model_name: string;
  match_probability: number;
  distinguishing_visual_feature: string;
}

export interface CanonicalIdentity {
  standardized_brand: string;
  standardized_model: string;
  category: string;
  submitted_raw_query?: string;
  was_expanded_from_truncated?: boolean;
  closest_model_candidates?: ModelCandidate[];
}

export interface DrivetrainSpecs {
  rear_derailleur?: string;
  front_derailleur?: string;
  shifters?: string;
  cassette?: string;
  crankset?: string;
  chain?: string;
}

export interface BrakesSpecs {
  caliper_lever_model?: string;
  rotor_size_front_rear?: string;
  brake_type?: string;
}

export interface StandardsSpecs {
  bottom_bracket: string;
  headset: string;
  seatpost_diameter: string;
  seat_clamp_diameter?: string;
  rear_axle_spacing: string;
  front_axle_spacing?: string;
  brake_mount_standard?: string;
}

export interface ReplacementSkus {
  derailleur_hanger?: string;
  headset_bearings?: string;
  suspension_pivot_kit?: string;
  bottom_bracket_replacement?: string;
  battery_mount_or_charger?: string;
  [key: string]: string | undefined;
}

export interface ProprietaryHardware {
  component_name: string;
  part_number_or_sku?: string;
  technical_notes: string;
}

export interface CompetingHangerCandidate {
  sku_or_name: string;
  fits_years: string;
  description: string;
  mounting_notes?: string;
}

export interface DerailleurHangerSpec {
  status: "VERIFIED" | "CONFLICT" | "NOT_FOUND";
  sku: string | null;
  competing_candidates?: CompetingHangerCandidate[];
  resolution_action_prompt?: string;
}

export interface VerificationAudit {
  recommended_action: "VERIFIED" | "REQUIRE_PHYSICAL_CHECK" | "UNRESOLVED_CONFLICT";
  notes?: string;
}

export interface StructuredInterfaces {
  bb_shell_standard?: string;       // e.g. "BSA_73", "BB95", "BB86", "PF30A_73", "BBRIGHT_79", "ITALIAN_70", "PF92", "T47"
  hanger_standard?: string;         // e.g. "SRAM_UDH", "TREK_ABP_CONVERT", "CANYON_EP0716", "GT_ATIDH0233", "GT_ATIDH0021"
  headset_shis_upper?: string;      // e.g. "IS41/28.6", "IS42/28.6", "ZS44/28.6"
  headset_shis_lower?: string;      // e.g. "IS52/40", "ZS56/40"
  rear_axle_standard?: string;      // e.g. "142x12_1.75", "148x12_1.0", "135x10_QR"
  freehub_standard?: string;        // e.g. "SHIMANO_HG", "SRAM_XD", "SHIMANO_MICRO_SPLINE"
  max_rotor_mm?: number;            // e.g. 160, 180, 200, 203
}

export interface MechanicalSpecifications {
  frame_material: string;
  wheel_size: string;
  drivetrain: DrivetrainSpecs;
  brakes: BrakesSpecs;
  standards: StandardsSpecs;
  critical_replacement_skus: ReplacementSkus;
  derailleur_hanger_audit?: DerailleurHangerSpec;
  structured_interfaces?: StructuredInterfaces;
  proprietary_hardware: ProprietaryHardware[];
}

export interface ModelYearVariant {
  generation_name: string;
  year_range: [number | string, number | string];
  varying_parts: Record<string, string>;
  mechanic_warning?: string;
}

export interface WebSearchEvidence {
  query_dispatched: string;
  source_domain: string;
  verified_value: string;
  url?: string;
}

export interface BranchTrace {
  step: string;
  detail: string;
  source_url?: string;
  status: "verified" | "conflict" | "inferred";
}

export interface CertaintyMatrixRow {
  part_category: string;
  part_label: string;
  is_target_broken_part?: boolean;
  confirmed_baseline: {
    summary: string;
    locked_sku: string | null;
    status: 'LOCKED_SKU' | 'IMMUTABLE_STANDARD';
  };
  high_probability_candidate: {
    sku_or_spec: string;
    years_applicable: string;
    probability: number;
    visual_trigger_tag: string;
  } | null;
  competing_legacy_candidates: Array<{
    sku_or_spec: string;
    years_applicable: string;
    visual_trigger_tag: string;
  }>;
  speculative_aftermarket_risk: string;
  visual_diagnostic_cue: string;
}

export interface VisualDiagnosticTag {
  tag_id: string;
  label: string;
  locks_generation: string;
  resolves_part_skus: Record<string, string>;
}

export interface BikeQueryResponse {
  target: BikeTarget;
  canonical_identity: CanonicalIdentity;
  mechanical_specifications: MechanicalSpecifications;
  verification_audit?: VerificationAudit;
  certainty_matrix?: CertaintyMatrixRow[];
  available_visual_tags?: VisualDiagnosticTag[];
  model_year_variants: ModelYearVariant[];
  web_search_evidence: WebSearchEvidence[];
  branch_traces?: BranchTrace[];
  confidence_score: number;
  raw_sources?: Array<{ title: string; url: string }>;
  search_queries?: string[];
  execution_time_ms?: number;
  quota_notice?: string;
  is_cached_benchmark?: boolean;
}

export interface BenchmarkBike {
  id: string;
  name: string;
  category: string;
  year: number;
  focal_test: string;
  expected_bb: string;
  expected_hanger_or_feature: string;
  sample_data?: BikeQueryResponse;
}

export interface Hi5CatalogueItem {
  sku: string;
  name: string;
  category: "bottom_bracket" | "derailleur_hanger" | "headset" | "cassette" | "chain" | "brake_rotor" | "brake_pads" | "axle";
  brand: string;
  price_gbp: number;
  in_stock: boolean;
  orders_enabled: boolean;
  structured_spec: {
    interface_type: "bottom_bracket" | "derailleur_hanger" | "headset" | "rear_axle" | "freehub" | "brake_mount";
    standard: string;
    secondary_spec?: string;
  };
}

export interface FitmentEvaluation {
  item_sku: string;
  item_name: string;
  is_compatible: boolean;
  compatibility_level: "EXACT_MATCH" | "ADAPTER_REQUIRED" | "INCOMPATIBLE" | "REQUIRES_VERIFICATION";
  direct_match: boolean;
  secondary_dependencies: string[];
  notes: string;
  interface_compared?: {
    bike_interface: string;
    component_interface: string;
  };
}

export interface PhotoVerificationResult {
  matched_sku: string | null;
  confidence: number;
  detected_stamp?: string;
  identified_features: string[];
  mechanic_notes: string;
  is_resolved: boolean;
  suggested_action: string;
}
