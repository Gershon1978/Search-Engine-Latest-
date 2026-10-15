/**
 * Candidate Scorer Engine for Multi-View Frame Recognition
 * Implements:
 * 1. Hard exclusion on structural vetoes
 * 2. Feature-scoped vocabulary normalization & alias resolution
 * 3. Cross-view conflict detection
 * 4. Information-value next-view ranking
 */

export type ObservationStatus =
  | "observed"
  | "ambiguous"
  | "obscured"
  | "not_visible";

export type FeatureId =
  | "frame_architecture"
  | "rear_shock_position"
  | "rear_shock_orientation"
  | "seatstay_junction"
  | "dropout_fastener_style"
  | "cable_routing";

export type FeatureObservation = {
  id: FeatureId;
  value: string;
  status: ObservationStatus;
  confidence: number;
  source_view?: string;
  timestamp_ms?: number;
};

export type VisualEvidencePackage = {
  schema_version?: string;
  manufacturer: {
    value: string | null;
    status: "confirmed" | "candidate" | "unknown";
    confidence: number;
  };
  features: FeatureObservation[];
};

export type VisualFingerprint = Partial<Record<FeatureId, string>>;

export type BikeCandidate = {
  id: string;
  manufacturer: string;
  model: string;
  generationName: string;
  yearStart: number;
  yearEnd: number;
  visual_fingerprint: VisualFingerprint;
};

export type FeatureDefinition = {
  weight: number;
  /** Hard structural exclusion when observation confidence >= structuralVetoMinConfidence */
  isStructuralVeto: boolean;
  /** 0.0 to 1.0: How easy it is for a customer to capture this angle clearly on a phone */
  practicalObservability: number;
  recommendedViewPrompt: string;
  allowedValues: readonly string[];
  aliases: Record<string, string>;
};

export const CONTROLLED_FEATURE_DEFINITIONS: Record<FeatureId, FeatureDefinition> = {
  frame_architecture: {
    weight: 5,
    isStructuralVeto: true,
    practicalObservability: 0.98,
    recommendedViewPrompt: "Full drive-side profile showing whether the frame is a hardtail or full-suspension.",
    allowedValues: ["hardtail", "full_suspension", "rigid", "folding"],
    aliases: {
      ht: "hardtail",
      full_sus: "full_suspension",
      fs: "full_suspension",
      dualsuspension: "full_suspension",
      suspension: "full_suspension",
    },
  },
  rear_shock_position: {
    weight: 5,
    isStructuralVeto: true,
    practicalObservability: 0.92,
    recommendedViewPrompt: "Side view of the main frame triangle showing the rear shock (or enclosed bottom-bracket/top-tube shock area).",
    allowedValues: ["none", "exposed", "partially_integrated", "fully_integrated"],
    aliases: {
      hidden: "fully_integrated",
      internal: "fully_integrated",
      enclosed: "fully_integrated",
      no_shock: "none",
      noshock: "none",
    },
  },
  rear_shock_orientation: {
    weight: 3,
    isStructuralVeto: false,
    practicalObservability: 0.88,
    recommendedViewPrompt: "Mid-frame view showing shock orientation (horizontal along top tube vs vertical against seat tube).",
    allowedValues: ["horizontal", "vertical", "slanted", "none"],
    aliases: {
      horiz: "horizontal",
      vert: "vertical",
      diagonal: "slanted",
    },
  },
  seatstay_junction: {
    weight: 4,
    isStructuralVeto: true,
    practicalObservability: 0.90,
    recommendedViewPrompt: "Close-up of the seat tube / top tube / seatstay juncture (check for floating stays or weld lines).",
    allowedValues: ["triple_triangle_floating", "triple_triangle_welded", "standard_weld", "dropped_seatstays", "split_pivot"],
    aliases: {
      floating: "triple_triangle_floating",
      floating_stays: "triple_triangle_floating",
      welded_tt: "triple_triangle_welded",
      welded_triple: "triple_triangle_welded",
      dropped: "dropped_seatstays",
      traditional: "standard_weld",
    },
  },
  dropout_fastener_style: {
    weight: 4,
    isStructuralVeto: true,
    practicalObservability: 0.85,
    recommendedViewPrompt: "Macro close-up photo of rear drive-side dropout showing hanger mounting bolts or UDH washer ring.",
    allowedValues: ["udh_direct_mount", "twin_m3_screws", "single_barrel_bolt", "abp_concentric_nut", "qr_open"],
    aliases: {
      udh: "udh_direct_mount",
      sram_udh: "udh_direct_mount",
      m3_twin: "twin_m3_screws",
      twin_screws: "twin_m3_screws",
      barrel_bolt: "single_barrel_bolt",
      m8_barrel: "single_barrel_bolt",
      abp: "abp_concentric_nut",
    },
  },
  cable_routing: {
    weight: 2,
    isStructuralVeto: false,
    practicalObservability: 0.80,
    recommendedViewPrompt: "View of the headtube and downtube cable entries.",
    allowedValues: ["internal_headset", "internal_downtube", "external"],
    aliases: {
      headset: "internal_headset",
      icr: "internal_headset",
      downtube_ports: "internal_downtube",
      ports: "internal_downtube",
      ext: "external",
      cables_outside: "external",
    },
  },
};

/**
 * 1. Feature-Scoped Vocabulary Normalization
 */
export function normalizeFeatureValue(featureId: FeatureId, rawValue: string): string {
  const def = CONTROLLED_FEATURE_DEFINITIONS[featureId];
  if (!def) return rawValue;

  const cleaned = rawValue.trim().toLowerCase().replace(/[\s-]+/g, "_");

  // Check direct match
  if (def.allowedValues.includes(cleaned)) {
    return cleaned;
  }

  // Check aliases
  if (def.aliases[cleaned]) {
    return def.aliases[cleaned];
  }

  // Check sub-matches in aliases
  for (const [alias, canonical] of Object.entries(def.aliases)) {
    if (cleaned.includes(alias)) {
      return canonical;
    }
  }

  return cleaned;
}

/**
 * 2. Cross-View Conflict Detection
 */
export interface CrossViewConflict {
  featureId: FeatureId;
  conflictingObservations: Array<{
    source_view?: string;
    normalizedValue: string;
    confidence: number;
  }>;
  description: string;
}

export function detectCrossViewConflicts(features: FeatureObservation[]): CrossViewConflict[] {
  const conflicts: CrossViewConflict[] = [];
  const grouped: Record<FeatureId, Array<{ raw: FeatureObservation; norm: string }>> = {
    frame_architecture: [],
    rear_shock_position: [],
    rear_shock_orientation: [],
    seatstay_junction: [],
    dropout_fastener_style: [],
    cable_routing: [],
  };

  for (const obs of features) {
    if (obs.status !== "observed" || obs.confidence < 0.6) continue;
    const norm = normalizeFeatureValue(obs.id, obs.value);
    grouped[obs.id]?.push({ raw: obs, norm });
  }

  for (const [fid, list] of Object.entries(grouped) as Array<[FeatureId, Array<{ raw: FeatureObservation; norm: string }>]>) {
    if (list.length <= 1) continue;
    const distinctNorms = Array.from(new Set(list.map((item) => item.norm)));
    if (distinctNorms.length > 1) {
      conflicts.push({
        featureId: fid,
        conflictingObservations: list.map((item) => ({
          source_view: item.raw.source_view,
          normalizedValue: item.norm,
          confidence: item.raw.confidence,
        })),
        description: `Cross-view conflict on ${fid}: observed ${distinctNorms.join(" vs ")} across separate camera angles.`,
      });
    }
  }

  return conflicts;
}

/**
 * 3. Scored Candidate Result & Hard Exclusion on Structural Veto
 */
export interface ScoredCandidate {
  candidate: BikeCandidate;
  score: number; // 0.0 - 1.0
  isExcluded: boolean;
  exclusionReason?: string;
  matchedFeatures: string[];
  conflictingFeatures: string[];
  unobservedFeatures: FeatureId[];
}

export function scoreCandidatesAgainstEvidence(
  candidates: BikeCandidate[],
  evidence: VisualEvidencePackage,
  structuralVetoMinConfidence: number = 0.80
): ScoredCandidate[] {
  // Map normalized feature values with highest confidence
  const normalizedObservations: Partial<Record<FeatureId, { value: string; confidence: number; status: ObservationStatus }>> = {};

  for (const obs of evidence.features) {
    if (obs.status !== "observed") continue;
    const normVal = normalizeFeatureValue(obs.id, obs.value);
    const existing = normalizedObservations[obs.id];
    if (!existing || obs.confidence > existing.confidence) {
      normalizedObservations[obs.id] = {
        value: normVal,
        confidence: obs.confidence,
        status: obs.status,
      };
    }
  }

  return candidates.map((cand) => {
    let totalWeight = 0;
    let earnedWeight = 0;
    let isExcluded = false;
    let exclusionReason: string | undefined;
    const matchedFeatures: string[] = [];
    const conflictingFeatures: string[] = [];
    const unobservedFeatures: FeatureId[] = [];

    for (const [fIdKey, def] of Object.entries(CONTROLLED_FEATURE_DEFINITIONS) as Array<[FeatureId, FeatureDefinition]>) {
      const candValue = cand.visual_fingerprint[fIdKey];
      if (!candValue) continue;

      totalWeight += def.weight;
      const obs = normalizedObservations[fIdKey];

      if (!obs) {
        unobservedFeatures.push(fIdKey);
        continue;
      }

      if (obs.value === candValue) {
        earnedWeight += def.weight * obs.confidence;
        matchedFeatures.push(`${fIdKey} matches '${candValue}' (${Math.round(obs.confidence * 100)}% conf)`);
      } else {
        conflictingFeatures.push(`${fIdKey} conflict: observed '${obs.value}' vs candidate '${candValue}'`);

        // Hard exclusion on structural veto
        if (def.isStructuralVeto && obs.confidence >= structuralVetoMinConfidence) {
          isExcluded = true;
          exclusionReason = `Hard exclusion on structural veto '${fIdKey}': observed '${obs.value}' (conf: ${obs.confidence.toFixed(2)}) conflicts with candidate '${candValue}'`;
        }
      }
    }

    const rawScore = totalWeight > 0 ? earnedWeight / totalWeight : 0;
    const finalScore = isExcluded ? 0 : Math.round(rawScore * 100) / 100;

    return {
      candidate: cand,
      score: finalScore,
      isExcluded,
      exclusionReason,
      matchedFeatures,
      conflictingFeatures,
      unobservedFeatures,
    };
  }).sort((a, b) => {
    if (a.isExcluded !== b.isExcluded) return a.isExcluded ? 1 : -1;
    return b.score - a.score;
  });
}

/**
 * 4. Information-Value Next-View Ranking
 * Computes which camera angle / view prompt has the highest entropy reduction
 * weighted by practical observability to disambiguate remaining non-excluded candidates.
 */
export interface NextViewRecommendation {
  featureId: FeatureId;
  recommendedViewPrompt: string;
  practicalObservability: number;
  distinguishingPower: number; // Disambiguation value
  totalPriorityScore: number;
}

export function rankNextViewsByInformationValue(
  scoredCandidates: ScoredCandidate[],
  alreadyObservedFeatures: FeatureId[]
): NextViewRecommendation[] {
  const activeCandidates = scoredCandidates.filter((c) => !c.isExcluded);
  if (activeCandidates.length <= 1) return [];

  const recommendations: NextViewRecommendation[] = [];

  for (const [fIdKey, def] of Object.entries(CONTROLLED_FEATURE_DEFINITIONS) as Array<[FeatureId, FeatureDefinition]>) {
    if (alreadyObservedFeatures.includes(fIdKey)) continue;

    // Count distribution of values among active candidates
    const valueCounts: Record<string, number> = {};
    for (const c of activeCandidates) {
      const val = c.candidate.visual_fingerprint[fIdKey];
      if (val) {
        valueCounts[val] = (valueCounts[val] || 0) + 1;
      }
    }

    const uniqueValues = Object.keys(valueCounts);
    if (uniqueValues.length <= 1) continue; // Does not discriminate among survivors

    // Calculate approximate entropy / distinguishing power (e.g., 2 distinct options = high split)
    const n = activeCandidates.length;
    let entropy = 0;
    for (const count of Object.values(valueCounts)) {
      const p = count / n;
      entropy -= p * Math.log2(p);
    }

    // Weight by practical observability and feature importance
    const distinguishingPower = entropy;
    const totalPriorityScore = distinguishingPower * def.practicalObservability * (def.weight / 5);

    recommendations.push({
      featureId: fIdKey,
      recommendedViewPrompt: def.recommendedViewPrompt,
      practicalObservability: def.practicalObservability,
      distinguishingPower: Math.round(distinguishingPower * 100) / 100,
      totalPriorityScore: Math.round(totalPriorityScore * 100) / 100,
    });
  }

  return recommendations.sort((a, b) => b.totalPriorityScore - a.totalPriorityScore);
}
