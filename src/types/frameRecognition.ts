/**
 * Types for Manufacturer-Gated, Multi-View Frame Recognition Pipeline
 * Hi5.bike Query Engine
 */

export type FrameType =
  | "hardtail"
  | "full_suspension"
  | "rigid"
  | "e_bike_full_suspension"
  | "e_bike_hardtail"
  | "gravel"
  | "road"
  | "time_trial";

export type SuspensionLayout =
  | "single_pivot"
  | "horst_link_fsr"
  | "vpp_dual_link"
  | "maestro"
  | "abp_concentric"
  | "isostrut"
  | "flex_stay"
  | "rigid_hardtail";

export type RearDropoutSystem =
  | "sram_udh"
  | "traditional_hanger_m3_twin"
  | "traditional_hanger_barrel_bolt"
  | "trek_abp_convert"
  | "direct_mount"
  | "qr_135"
  | "thru_axle_142"
  | "boost_148";

export type BottomBracketShellType =
  | "bsa_threaded"
  | "pressfit_pf92_bb86"
  | "bb30_pf30"
  | "bb95_trek"
  | "t47"
  | "ebike_motor_integrated";

export type CableRoutingType =
  | "internal_headset_routing"
  | "internal_downtube_ports"
  | "external_top_tube"
  | "external_down_tube";

export type BrakeInterfaceType =
  | "post_mount_disc"
  | "flat_mount_disc"
  | "rim_brake_caliper"
  | "v_brake";

export type FrameViewKey =
  | "view_1_drive_side"
  | "view_2_non_drive_side"
  | "view_3_cockpit_headtube"
  | "view_4_bottom_bracket"
  | "view_5_rear_dropouts"
  | "view_6_seatstay_junction";

export interface LogoDecalObservation {
  text_or_symbol: string;
  location: string;
  confidence: number;
  is_component_brand?: boolean;
}

export interface ManufacturerIdentificationResult {
  status: "CONFIRMED" | "AMBIGUOUS" | "UNKNOWN" | "COMPONENT_ONLY_WARNING";
  manufacturer: string;
  confidence: number; // 0.0 - 1.0
  evidence: string[];
  detected_logos_decals: LogoDecalObservation[];
  rejection_reason?: string;
  requested_additional_view?: string;
}

export interface ManufacturerRule {
  feature_name: string;
  observation_key: string;
  expected_value: string;
  implication: string;
  confidence_impact: number;
}

export interface ManufacturerProfile {
  id: string;
  brand_name: string;
  full_name: string;
  signature_architectures: string[];
  distinguishing_rules: ManufacturerRule[];
  model_families: string[];
  generational_markers: Record<string, string>;
  component_guard_warnings?: string[];
}

export interface ObservedView {
  view_key: FrameViewKey;
  view_name: string;
  description: string;
  thumbnail_url?: string;
  detected_features: string[];
  confidence: number;
}

export interface MultiViewObservations {
  frame_type?: FrameType;
  suspension_layout?: SuspensionLayout;
  rear_dropout_system?: RearDropoutSystem;
  bottom_bracket_shell_type?: BottomBracketShellType;
  cable_routing?: CableRoutingType;
  brake_interface?: BrakeInterfaceType;
  visible_components?: {
    drivetrain_tier?: string;
    rear_derailleur_model?: string;
    brake_model?: string;
    fork_model?: string;
    shock_model?: string;
    wheel_spec?: string;
    motor_generation?: string;
  };
  visual_generation_markers: string[];
  raw_view_notes?: Record<string, string>;
}

export interface FrameCandidateMatch {
  candidate_id: string;
  make: string;
  model: string;
  generation_name: string;
  year_range: string;
  exact_year?: number;
  trim_level?: string;
  confidence_score: number; // 0 - 100
  matching_features: string[];
  conflicting_features: string[];
  remaining_ambiguities: string[];
  confirmed_hanger_sku?: string;
  confirmed_bb_standard?: string;
  distinguishing_cue: string;
}

export interface DisambiguationQuestion {
  question_id: string;
  prompt: string;
  target_feature: string;
  options: Array<{
    option_id: string;
    label: string;
    resolves_to_trim_or_year: string;
  }>;
}

export interface FrameRecognitionReport {
  timestamp: string;
  video_source_name?: string;
  stage_a_manufacturer: ManufacturerIdentificationResult;
  stage_b_profile?: {
    brand_name: string;
    signature_architectures: string[];
    active_rules_count: number;
  };
  stage_c_views_analyzed: ObservedView[];
  stage_c_structured_observations: MultiViewObservations;
  stage_d_candidates: FrameCandidateMatch[];
  stage_e_confirmed_bike?: FrameCandidateMatch;
  stage_e_disambiguation?: DisambiguationQuestion;
  query_engine_string: string;
  summary_rationale: string;
}

export interface SampleWalkaroundPreset {
  id: string;
  title: string;
  bike_category: string;
  description: string;
  expected_brand: string;
  expected_model: string;
  expected_generation: string;
  expected_hanger: string;
  expected_bb: string;
  views: Array<{
    view_key: FrameViewKey;
    view_name: string;
    description: string;
    frame_image_placeholder: string;
    key_visible_features: string[];
  }>;
  simulated_observations: MultiViewObservations;
}
