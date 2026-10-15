import {
  resolveTruncatedQuery,
  matchBikeQuery,
} from './src/data/benchmarkBikes';
import { executeBikeResearch } from './server';
import { HI5_CATALOGUE_ITEMS, evaluateComponentFitment } from './src/data/hi5Catalogue';

async function runMechanicalTestSuite() {
  console.log('====================================================');
  console.log('🚲 Starting Hi5.bike "Andrey" Mechanical Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}: ${detail || 'Assertion failed'}`);
      failed++;
    }
  }

  // TEST 1: "GT Av" Truncated Resolution and Multi-Gen Conflict Trap
  console.log('--- Test 1: "GT Av" Truncated Resolution & Multi-Gen Conflict Trap ---');
  const gtResolution = resolveTruncatedQuery('GT Av');
  assert(
    gtResolution.resolved_brand === 'GT Bicycles',
    'Brand shorthand "gt" resolves to "GT Bicycles"',
    `Got ${gtResolution.resolved_brand}`
  );
  assert(
    gtResolution.resolved_model === 'GT Avalanche',
    'Model prefix "av" resolves to "GT Avalanche"',
    `Got ${gtResolution.resolved_model}`
  );
  assert(
    gtResolution.was_expanded === true,
    'Flag was_expanded_from_truncated is true',
    `Got ${gtResolution.was_expanded}`
  );

  const gtResearch = await executeBikeResearch({ query: 'GT Av' });
  const hangerAudit = gtResearch.mechanical_specifications.derailleur_hanger_audit;
  const verificationAudit = gtResearch.verification_audit;

  assert(
    hangerAudit?.status === 'CONFLICT',
    'Derailleur hanger status is CONFLICT due to missing model year',
    `Got ${hangerAudit?.status}`
  );
  assert(
    hangerAudit?.sku === null,
    'Derailleur hanger SKU is null (no single SKU guessed)',
    `Got ${hangerAudit?.sku}`
  );
  assert(
    verificationAudit?.recommended_action === 'REQUIRE_PHYSICAL_CHECK',
    'Verification audit recommended_action is REQUIRE_PHYSICAL_CHECK',
    `Got ${verificationAudit?.recommended_action}`
  );

  const hasATIDH0233 = hangerAudit?.competing_candidates?.some((c) =>
    c.sku_or_name.includes('ATIDH0233')
  );
  const hasATIDH0021 = hangerAudit?.competing_candidates?.some((c) =>
    c.sku_or_name.includes('ATIDH0021')
  );
  assert(
    Boolean(hasATIDH0233 && hasATIDH0021),
    'Competing candidates contain both ATIDH0233 (2015-2023) and ATIDH0021 (2006-2013)',
    `Candidates: ${JSON.stringify(hangerAudit?.competing_candidates)}`
  );

  // Test Certainty Matrix & Visual Diagnostic Tags
  assert(
    Boolean(gtResearch.certainty_matrix && gtResearch.certainty_matrix.length >= 6),
    'Certainty Matrix table contains all key mechanical part categories',
    `Found ${gtResearch.certainty_matrix?.length || 0} rows`
  );
  assert(
    Boolean(gtResearch.available_visual_tags && gtResearch.available_visual_tags.length >= 2),
    'Available visual clue tags populated for video/photo disambiguation',
    `Found ${gtResearch.available_visual_tags?.length || 0} visual tags`
  );
  const hangerRow = gtResearch.certainty_matrix?.find((r) => r.part_category === 'derailleur_hanger');
  assert(
    Boolean(hangerRow?.high_probability_candidate?.sku_or_spec.includes('ATIDH0233')),
    'Certainty Matrix Column 2 (High-Probability) contains modern ATIDH0233',
    `Got ${hangerRow?.high_probability_candidate?.sku_or_spec}`
  );
  assert(
    Boolean(hangerRow?.competing_legacy_candidates.some((c) => c.sku_or_spec.includes('ATIDH0021'))),
    'Certainty Matrix Column 3 (Legacy Variant) contains vintage 26" ATIDH0021',
    `Got ${JSON.stringify(hangerRow?.competing_legacy_candidates)}`
  );

  // TEST 2: "Spz Levo 2021" Resolves to 2021 Specialized Turbo Levo Benchmark
  console.log('\n--- Test 2: "Spz Levo 2021" Shorthand Benchmark Resolution ---');
  const spzResolution = resolveTruncatedQuery('Spz Levo 2021');
  assert(
    spzResolution.resolved_brand === 'Specialized',
    'Brand shorthand "spz" resolves to "Specialized"',
    `Got ${spzResolution.resolved_brand}`
  );
  assert(
    spzResolution.explicit_year === 2021,
    'Explicit year 2021 extracted correctly',
    `Got ${spzResolution.explicit_year}`
  );

  const levoBenchmark = matchBikeQuery('Spz Levo 2021');
  assert(
    levoBenchmark !== null && levoBenchmark.id === 'specialized-turbo-levo-2021',
    'matchBikeQuery("Spz Levo 2021") resolves to specialized-turbo-levo-2021 benchmark',
    `Got ${levoBenchmark?.id || 'null'}`
  );
  assert(
    levoBenchmark?.sample_data?.mechanical_specifications.critical_replacement_skus.derailleur_hanger?.includes('S182600001') ?? false,
    '2021 Levo uses pre-UDH proprietary hanger S182600001',
    `Got ${levoBenchmark?.sample_data?.mechanical_specifications.critical_replacement_skus.derailleur_hanger}`
  );

  // TEST 3: Strict Year Guard - Zero Generational Bleed for "Specialized Turbo Levo 2023"
  console.log('\n--- Test 3: Zero Generational Bleed ("Specialized Turbo Levo 2023") ---');
  const levo2023Benchmark = matchBikeQuery('Specialized Turbo Levo 2023');
  assert(
    levo2023Benchmark === null,
    'matchBikeQuery("Specialized Turbo Levo 2023") returns null (strict year guard avoids bleeding 2021 benchmark)',
    `Expected null, got benchmark id: ${levo2023Benchmark?.id}`
  );

  // TEST 4: Deterministic Fitment Graph Check
  console.log('\n--- Test 4: Deterministic Component Fitment Graph ---');
  const udhItem = HI5_CATALOGUE_ITEMS.find((c) => c.sku === 'HI5-HGR-SRAM-UDH')!;
  const levoHangerItem = HI5_CATALOGUE_ITEMS.find((c) => c.sku === 'HI5-HGR-SPZ-S182600001')!;

  if (levoBenchmark?.sample_data) {
    const udhFitment = evaluateComponentFitment(
      levoBenchmark.sample_data.mechanical_specifications,
      udhItem
    );
    assert(
      udhFitment.is_compatible === false && udhFitment.compatibility_level === 'INCOMPATIBLE',
      'SRAM UDH is evaluated as INCOMPATIBLE on 2021 Levo (pre-UDH frame)',
      `Got ${udhFitment.compatibility_level}: ${udhFitment.notes}`
    );

    const levoFitment = evaluateComponentFitment(
      levoBenchmark.sample_data.mechanical_specifications,
      levoHangerItem
    );
    assert(
      levoFitment.is_compatible === true && levoFitment.compatibility_level === 'EXACT_MATCH',
      'Specialized S182600001 is evaluated as EXACT_MATCH on 2021 Levo',
      `Got ${levoFitment.compatibility_level}`
    );
  }

  // TEST 5: Stage A Manufacturer Gating & Component-Only Decal Rejection
  console.log('\n--- Test 5: Stage A Manufacturer Gating & Component Brand Guard ---');
  const {
    identifyManufacturerFromInput,
    activateManufacturerProfile,
    executeMultiViewRecognitionPipeline,
  } = await import('./src/server/frameRecognitionEngine');

  const shimanoTest = identifyManufacturerFromInput({
    text_or_notes: 'Shimano Deore RD-M5100 rear derailleur and brake caliper',
  });
  assert(
    shimanoTest.status === 'COMPONENT_ONLY_WARNING',
    'Stage A halts when only component manufacturer (Shimano) is visible',
    `Got ${shimanoTest.status}`
  );
  assert(
    Boolean(shimanoTest.requested_additional_view),
    'Stage A requests targeted additional view (down tube or head badge)',
    `Got: ${shimanoTest.requested_additional_view}`
  );

  const gtStageA = identifyManufacturerFromInput({
    text_or_notes: 'GT Avalanche 29er frame',
  });
  assert(
    gtStageA.status === 'CONFIRMED' && gtStageA.manufacturer === 'GT Bicycles',
    'Stage A confirms "GT Bicycles" from frame decal',
    `Got ${gtStageA.manufacturer}`
  );

  // TEST 6: Stage B Manufacturer Profile Activation
  console.log('\n--- Test 6: Stage B Manufacturer Profile Activation ---');
  const gtProfile = activateManufacturerProfile('GT Bicycles');
  assert(
    Boolean(gtProfile && gtProfile.distinguishing_rules.length >= 3),
    'GT Bicycles profile activated with signature Triple Triangle rules',
    `Rules count: ${gtProfile?.distinguishing_rules.length}`
  );
  const spzProfile = activateManufacturerProfile('Specialized');
  assert(
    Boolean(spzProfile && spzProfile.signature_architectures.some((a) => a.includes('FSR') || a.includes('Sidearm'))),
    'Specialized profile activated with FSR & Sidearm architectures',
    `Architectures: ${JSON.stringify(spzProfile?.signature_architectures)}`
  );

  // TEST 7: Stage C & D Multi-View Frame Analysis (GT Avalanche 2021 Preset)
  console.log('\n--- Test 7: Stage C & D Multi-View Frame Analysis (GT Avalanche 2021 Preset) ---');
  const gtReport = await executeMultiViewRecognitionPipeline({
    preset_id: 'preset-gt-avalanche-walkaround',
  });
  assert(
    gtReport.stage_a_manufacturer.status === 'CONFIRMED',
    'GT Avalanche Walkaround passes Stage A Manufacturer Gate',
    `Status: ${gtReport.stage_a_manufacturer.status}`
  );
  assert(
    gtReport.stage_c_views_analyzed.length === 6,
    'All 6 canonical video views analyzed',
    `Views analyzed: ${gtReport.stage_c_views_analyzed.length}`
  );
  const topGtCandidate = gtReport.stage_e_confirmed_bike;
  assert(
    Boolean(topGtCandidate && topGtCandidate.candidate_id === 'gt-avalanche-2020-2024'),
    'Top candidate is GT Avalanche 2020-2024 (Floating Seatstays Gen)',
    `Got: ${topGtCandidate?.candidate_id}`
  );
  assert(
    Boolean(topGtCandidate?.confirmed_hanger_sku?.includes('ATIDH0233')),
    'GT 2020+ floating stays locks hanger ATIDH0233 (2x M3 screws)',
    `Got: ${topGtCandidate?.confirmed_hanger_sku}`
  );
  assert(
    Boolean(topGtCandidate?.confirmed_bb_standard?.includes('BSA 73mm')),
    'GT 2020+ locks Threaded BSA 73mm bottom bracket',
    `Got: ${topGtCandidate?.confirmed_bb_standard}`
  );

  // TEST 8: Specialized Turbo Levo 2021 Walkaround (Pre-UDH S182600001 Confirmation)
  console.log('\n--- Test 8: Specialized Turbo Levo Gen 2 Walkaround (Pre-UDH S182600001) ---');
  const levoReport = await executeMultiViewRecognitionPipeline({
    preset_id: 'preset-spz-levo-2021-walkaround',
  });
  const topLevoCandidate = levoReport.stage_e_confirmed_bike;
  assert(
    Boolean(topLevoCandidate && topLevoCandidate.candidate_id === 'specialized-turbo-levo-gen2-2021'),
    'Top candidate is Specialized Turbo Levo Gen 2 (Pre-UDH Sidearm 2019-2021)',
    `Got: ${topLevoCandidate?.candidate_id}`
  );
  assert(
    Boolean(topLevoCandidate?.confirmed_hanger_sku?.includes('S182600001')),
    'Pre-UDH dropout interface locks proprietary hanger S182600001',
    `Got: ${topLevoCandidate?.confirmed_hanger_sku}`
  );
  assert(
    Boolean(topLevoCandidate?.conflicting_features.some((c) => c.includes('UDH')) || topLevoCandidate?.matching_features.some((m) => m.includes('S182600001'))),
    'Confirms pre-UDH status and differentiates from Gen 3 UDH models',
    `Matching: ${JSON.stringify(topLevoCandidate?.matching_features)}`
  );

  // TEST 9: Negative Component-Only Preset Rejection
  console.log('\n--- Test 9: Negative Component-Only Preset Rejection ---');
  const negativeReport = await executeMultiViewRecognitionPipeline({
    preset_id: 'preset-component-only-rejection',
  });
  assert(
    negativeReport.stage_a_manufacturer.status === 'COMPONENT_ONLY_WARNING',
    'Shimano-only video rejected at Stage A with COMPONENT_ONLY_WARNING',
    `Status: ${negativeReport.stage_a_manufacturer.status}`
  );
  assert(
    negativeReport.stage_d_candidates.length === 0,
    'Zero frame candidates evaluated when manufacturer gate is halted',
    `Candidates: ${negativeReport.stage_d_candidates.length}`
  );

  // TEST 10: Stage E Query Engine String Handoff
  console.log('\n--- Test 10: Stage E Query Engine Handoff String ---');
  assert(
    gtReport.query_engine_string.includes('GT Avalanche') && gtReport.query_engine_string.includes('2021'),
    'Query engine string formatted for seamless Certainty Matrix handoff ("GT Avalanche 2021")',
    `Got: ${gtReport.query_engine_string}`
  );
  assert(
    levoReport.query_engine_string.includes('Specialized Turbo Levo') && levoReport.query_engine_string.includes('2021'),
    'Levo query engine string formatted for Certainty Matrix handoff ("Specialized Turbo Levo 2021")',
    `Got: ${levoReport.query_engine_string}`
  );

  // TEST 11: Candidate Scorer Unit Tests (Structural Vetoes, Vocabulary Normalization, Cross-View Conflict, Next-View Ranking)
  console.log('\n--- Test 11: Candidate Scorer Unit Tests ---');
  const {
    normalizeFeatureValue,
    detectCrossViewConflicts,
    scoreCandidatesAgainstEvidence,
    rankNextViewsByInformationValue,
  } = await import('./src/server/candidateScorer');

  // 11a: Feature-scoped vocabulary normalization
  const normHt = normalizeFeatureValue('frame_architecture', 'ht');
  assert(normHt === 'hardtail', 'Vocabulary normalization: "ht" -> "hardtail"', `Got: ${normHt}`);

  const normFs = normalizeFeatureValue('frame_architecture', 'full_sus');
  assert(normFs === 'full_suspension', 'Vocabulary normalization: "full_sus" -> "full_suspension"', `Got: ${normFs}`);

  const normUdh = normalizeFeatureValue('dropout_fastener_style', 'sram_udh');
  assert(normUdh === 'udh_direct_mount', 'Vocabulary normalization: "sram_udh" -> "udh_direct_mount"', `Got: ${normUdh}`);

  const normFloating = normalizeFeatureValue('seatstay_junction', 'floating');
  assert(normFloating === 'triple_triangle_floating', 'Vocabulary normalization: "floating" -> "triple_triangle_floating"', `Got: ${normFloating}`);

  // 11b: Hard exclusion on structural vetoes
  const testCandidates = [
    {
      id: 'gt-avalanche-ht',
      manufacturer: 'GT Bicycles',
      model: 'Avalanche',
      generationName: 'Floating Stays Gen',
      yearStart: 2020,
      yearEnd: 2024,
      visual_fingerprint: {
        frame_architecture: 'hardtail',
        rear_shock_position: 'none',
        seatstay_junction: 'triple_triangle_floating',
        dropout_fastener_style: 'twin_m3_screws',
      },
    },
    {
      id: 'gt-force-fs',
      manufacturer: 'GT Bicycles',
      model: 'Force',
      generationName: 'LTS Full Suspension',
      yearStart: 2020,
      yearEnd: 2024,
      visual_fingerprint: {
        frame_architecture: 'full_suspension',
        rear_shock_position: 'exposed',
        seatstay_junction: 'standard_weld',
        dropout_fastener_style: 'udh_direct_mount',
      },
    },
  ];

  // Evidence observing hardtail with 0.95 confidence
  const hardtailEvidence = {
    manufacturer: { value: 'GT Bicycles', status: 'confirmed' as const, confidence: 0.95 },
    features: [
      {
        id: 'frame_architecture' as const,
        value: 'hardtail',
        status: 'observed' as const,
        confidence: 0.95,
        source_view: 'view_1_drive_side',
      },
      {
        id: 'rear_shock_position' as const,
        value: 'none',
        status: 'observed' as const,
        confidence: 0.92,
        source_view: 'view_1_drive_side',
      },
    ],
  };

  const scored = scoreCandidatesAgainstEvidence(testCandidates, hardtailEvidence);
  const fullSusCandidate = scored.find((c) => c.candidate.id === 'gt-force-fs');
  const hardtailCandidate = scored.find((c) => c.candidate.id === 'gt-avalanche-ht');

  assert(
    fullSusCandidate?.isExcluded === true,
    'Hard exclusion on structural veto: Full suspension candidate is excluded when hardtail is observed',
    `isExcluded: ${fullSusCandidate?.isExcluded}`
  );
  assert(
    fullSusCandidate?.score === 0,
    'Excluded candidate receives 0 score on structural veto',
    `Score: ${fullSusCandidate?.score}`
  );
  assert(
    Boolean(fullSusCandidate?.exclusionReason?.includes('structural veto')),
    'Exclusion reason explicitly documents structural veto violation',
    `Reason: ${fullSusCandidate?.exclusionReason}`
  );
  assert(
    hardtailCandidate?.isExcluded === false && (hardtailCandidate?.score || 0) > 0.5,
    'Matching hardtail candidate survives with high score',
    `Score: ${hardtailCandidate?.score}`
  );

  // 11c: Cross-view conflict detection
  const conflictingViews = [
    {
      id: 'frame_architecture' as const,
      value: 'hardtail',
      status: 'observed' as const,
      confidence: 0.95,
      source_view: 'view_1_drive_side',
    },
    {
      id: 'frame_architecture' as const,
      value: 'full_suspension',
      status: 'observed' as const,
      confidence: 0.88,
      source_view: 'view_2_non_drive_side',
    },
  ];
  const detectedConflicts = detectCrossViewConflicts(conflictingViews);
  assert(
    detectedConflicts.length === 1 && detectedConflicts[0].featureId === 'frame_architecture',
    'Cross-view conflict detected between View 1 (hardtail) and View 2 (full_suspension)',
    `Conflicts found: ${detectedConflicts.length}`
  );
  assert(
    detectedConflicts[0].description.includes('Cross-view conflict on frame_architecture'),
    'Conflict description documents opposing observed values',
    `Got: ${detectedConflicts[0].description}`
  );

  // 11d: Information-value next-view ranking
  const disambiguationCandidates = [
    {
      id: 'gt-avalanche-floating',
      manufacturer: 'GT Bicycles',
      model: 'Avalanche',
      generationName: 'Floating Stays Gen',
      yearStart: 2020,
      yearEnd: 2024,
      visual_fingerprint: {
        frame_architecture: 'hardtail',
        seatstay_junction: 'triple_triangle_floating',
        dropout_fastener_style: 'twin_m3_screws',
      },
    },
    {
      id: 'gt-avalanche-vintage',
      manufacturer: 'GT Bicycles',
      model: 'Avalanche',
      generationName: 'Vintage Gen',
      yearStart: 2008,
      yearEnd: 2013,
      visual_fingerprint: {
        frame_architecture: 'hardtail',
        seatstay_junction: 'triple_triangle_welded',
        dropout_fastener_style: 'single_barrel_bolt',
      },
    },
  ];
  const scoredDisambig = scoreCandidatesAgainstEvidence(disambiguationCandidates, {
    manufacturer: { value: 'GT Bicycles', status: 'confirmed', confidence: 0.95 },
    features: [
      {
        id: 'frame_architecture' as const,
        value: 'hardtail',
        status: 'observed' as const,
        confidence: 0.95,
      },
    ],
  });

  const nextViews = rankNextViewsByInformationValue(scoredDisambig, ['frame_architecture']);
  assert(
    nextViews.length >= 2,
    'Information-value next-view ranking proposes top discriminative views',
    `Next views count: ${nextViews.length}`
  );
  assert(
    nextViews[0].totalPriorityScore > 0,
    'Top recommended view has positive information value and practical observability',
    `Top view: ${nextViews[0].featureId} (Score: ${nextViews[0].totalPriorityScore})`
  );
  assert(
    Boolean(nextViews[0].recommendedViewPrompt),
    'Recommended next view includes practical prompt for user phone angle',
    `Prompt: ${nextViews[0].recommendedViewPrompt}`
  );

  // Summary
  console.log('\n====================================================');
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('test_suite')) {
  runMechanicalTestSuite().catch((err) => {
    console.error('Test suite uncaught error:', err);
    process.exit(1);
  });
}
