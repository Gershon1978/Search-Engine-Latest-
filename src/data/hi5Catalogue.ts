import {
  Hi5CatalogueItem,
  MechanicalSpecifications,
  FitmentEvaluation,
} from "../types/bikeQuery";

export const HI5_CATALOGUE_ITEMS: Hi5CatalogueItem[] = [
  // 1. Derailleur Hangers
  {
    sku: "HI5-HGR-SRAM-UDH",
    name: "SRAM Universal Derailleur Hanger (UDH)",
    category: "derailleur_hanger",
    brand: "SRAM",
    price_gbp: 15.0,
    in_stock: true,
    orders_enabled: true,
    structured_spec: {
      interface_type: "derailleur_hanger",
      standard: "SRAM_UDH",
      secondary_spec: "Backwards rotating impact design; M12 x 1.0 thread",
    },
  },
  {
    sku: "HI5-HGR-SPZ-S182600001",
    name: "Specialized Derailleur Hanger S182600001 (Wheels Mfg #284)",
    category: "derailleur_hanger",
    brand: "Specialized",
    price_gbp: 26.5,
    in_stock: true,
    orders_enabled: true,
    structured_spec: {
      interface_type: "derailleur_hanger",
      standard: "SPECIALIZED_S182600001",
      secondary_spec: "Fits 2019–2021 Turbo Levo Gen 2 (pre-UDH) and Stumpjumper FSR",
    },
  },
  {
    sku: "HI5-HGR-TREK-301695",
    name: "Trek ABP Convert 142x12 Hanger (Trek SKU 301695 / Wheels Mfg #299)",
    category: "derailleur_hanger",
    brand: "Trek",
    price_gbp: 28.0,
    in_stock: true,
    orders_enabled: true,
    structured_spec: {
      interface_type: "derailleur_hanger",
      standard: "TREK_ABP_CONVERT",
      secondary_spec: "Concentric ABP rear axle nut retention",
    },
  },
  {
    sku: "HI5-HGR-CNYN-EP0716",
    name: "Canyon Derailleur Hanger GP0252-01 / EP0716-01",
    category: "derailleur_hanger",
    brand: "Canyon",
    price_gbp: 24.0,
    in_stock: true,
    orders_enabled: true,
    structured_spec: {
      interface_type: "derailleur_hanger",
      standard: "CANYON_EP0716",
      secondary_spec: "Fits Grail CF SL Gen 1, Endurace CF SL, Ultimate CF SLX",
    },
  },
  {
    sku: "HI5-HGR-CDLE-K33009",
    name: "Cannondale Speed Release 142x12 Disc Hanger (K33009)",
    category: "derailleur_hanger",
    brand: "Cannondale",
    price_gbp: 32.0,
    in_stock: true,
    orders_enabled: true,
    structured_spec: {
      interface_type: "derailleur_hanger",
      standard: "CANNONDALE_K33009",
      secondary_spec: "Double-lead threaded speed release axle interface",
    },
  },
  // GT Avalanche Generational Hangers (orders_enabled: false per spec)
  {
    sku: "HI5-HGR-GT-ATIDH0233",
    name: "GT ATIDH0233 / K33047 (Wheels Mfg #266)",
    category: "derailleur_hanger",
    brand: "GT Bicycles",
    price_gbp: 22.0,
    in_stock: false,
    orders_enabled: false,
    structured_spec: {
      interface_type: "derailleur_hanger",
      standard: "GT_ATIDH0233",
      secondary_spec: "Fits 2015–2023 GT Avalanche (27.5\" / 29\"); mounts with 2 tiny M3 flathead screws",
    },
  },
  {
    sku: "HI5-HGR-GT-ATIDH0021",
    name: "GT ATIDH0021 (Wheels Mfg #31)",
    category: "derailleur_hanger",
    brand: "GT Bicycles",
    price_gbp: 19.5,
    in_stock: false,
    orders_enabled: false,
    structured_spec: {
      interface_type: "derailleur_hanger",
      standard: "GT_ATIDH0021",
      secondary_spec: "Fits 2006–2013 GT Avalanche (26\"); mounts with 1 large chainring-style bolt",
    },
  },

  // 2. Bottom Brackets
  {
    sku: "HI5-BB-SRAM-DUB-BSA",
    name: "SRAM DUB English BSA 73mm Bottom Bracket",
    category: "bottom_bracket",
    brand: "SRAM",
    price_gbp: 38.0,
    in_stock: true,
    orders_enabled: true,
    structured_spec: {
      interface_type: "bottom_bracket",
      standard: "BSA_73",
      secondary_spec: "Requires 28.99mm SRAM DUB crank spindle. Threaded 1.37 x 24 TPI shell.",
    },
  },
  {
    sku: "HI5-BB-SHIMANO-MT800",
    name: "Shimano Deore XT BB-MT800 BSA Threaded Bottom Bracket",
    category: "bottom_bracket",
    brand: "Shimano",
    price_gbp: 32.0,
    in_stock: true,
    orders_enabled: true,
    structured_spec: {
      interface_type: "bottom_bracket",
      standard: "BSA_73",
      secondary_spec: "Requires 24mm Shimano Hollowtech II spindle.",
    },
  },
  {
    sku: "HI5-BB-TREK-BB95",
    name: "Trek BB95 Shimano Bearing Kit (Trek SKU 404700)",
    category: "bottom_bracket",
    brand: "Trek",
    price_gbp: 45.0,
    in_stock: true,
    orders_enabled: true,
    structured_spec: {
      interface_type: "bottom_bracket",
      standard: "BB95",
      secondary_spec: "95mm net shell width; direct bearing press into frame; 24mm spindle.",
    },
  },
  {
    sku: "HI5-BB-SHIMANO-BB72",
    name: "Shimano SM-BB72-41B PressFit BB86 Bottom Bracket",
    category: "bottom_bracket",
    brand: "Shimano",
    price_gbp: 29.0,
    in_stock: true,
    orders_enabled: true,
    structured_spec: {
      interface_type: "bottom_bracket",
      standard: "BB86",
      secondary_spec: "86.5mm shell with 41mm press-in bore; 24mm spindle.",
    },
  },
  {
    sku: "HI5-BB-CDLE-PF30A",
    name: "Wheels Mfg PF30a Outboard Bottom Bracket for Cannondale (73mm Asymmetric)",
    category: "bottom_bracket",
    brand: "Wheels Mfg",
    price_gbp: 85.0,
    in_stock: true,
    orders_enabled: true,
    structured_spec: {
      interface_type: "bottom_bracket",
      standard: "PF30A_73",
      secondary_spec: "73mm asymmetric shell width; thread-together design eliminates creaks.",
    },
  },

  // 3. Cassettes & Freehubs
  {
    sku: "HI5-CAS-SRAM-GX-1275",
    name: "SRAM GX Eagle XG-1275 10-52T 12-Speed Cassette",
    category: "cassette",
    brand: "SRAM",
    price_gbp: 185.0,
    in_stock: true,
    orders_enabled: true,
    structured_spec: {
      interface_type: "freehub",
      standard: "SRAM_XD",
      secondary_spec: "Strictly requires SRAM XD Driver Body. Incompatible with Shimano HG or Micro Spline.",
    },
  },
  {
    sku: "HI5-CAS-SHIMANO-M7100",
    name: "Shimano SLX CS-M7100 10-51T 12-Speed Cassette",
    category: "cassette",
    brand: "Shimano",
    price_gbp: 95.0,
    in_stock: true,
    orders_enabled: true,
    structured_spec: {
      interface_type: "freehub",
      standard: "SHIMANO_MICRO_SPLINE",
      secondary_spec: "Strictly requires Shimano Micro Spline freehub body. Incompatible with standard HG or XD.",
    },
  },
  {
    sku: "HI5-CAS-SHIMANO-HG500",
    name: "Shimano Deore CS-HG500 11-36T 10-Speed Cassette",
    category: "cassette",
    brand: "Shimano",
    price_gbp: 38.0,
    in_stock: true,
    orders_enabled: true,
    structured_spec: {
      interface_type: "freehub",
      standard: "SHIMANO_HG",
      secondary_spec: "Compatible with standard Shimano/SRAM 8/9/10/11-speed HyperGlide (HG) splined freehub.",
    },
  },

  // 4. Brake Rotors
  {
    sku: "HI5-ROT-SHIMANO-RT66-180",
    name: "Shimano SM-RT66 180mm 6-Bolt Disc Brake Rotor",
    category: "brake_rotor",
    brand: "Shimano",
    price_gbp: 24.0,
    in_stock: true,
    orders_enabled: true,
    structured_spec: {
      interface_type: "brake_mount",
      standard: "180",
      secondary_spec: "Standard 6-bolt ISO mount; requires 180mm post-mount adapter if frame is 160 direct.",
    },
  },
  {
    sku: "HI5-ROT-SRAM-CL-200",
    name: "SRAM Centerline 200mm 6-Bolt Disc Rotor",
    category: "brake_rotor",
    brand: "SRAM",
    price_gbp: 48.0,
    in_stock: true,
    orders_enabled: true,
    structured_spec: {
      interface_type: "brake_mount",
      standard: "200",
      secondary_spec: "200mm rotor diameter for heavy-duty trail/enduro braking.",
    },
  },
  {
    sku: "HI5-ROT-SRAM-CL-220",
    name: "SRAM Centerline 220mm 6-Bolt Disc Rotor (e-MTB)",
    category: "brake_rotor",
    brand: "SRAM",
    price_gbp: 55.0,
    in_stock: true,
    orders_enabled: true,
    structured_spec: {
      interface_type: "brake_mount",
      standard: "220",
      secondary_spec: "High thermal mass 2.0mm thick rotor for e-MTBs like Turbo Levo.",
    },
  },
];

/**
 * 5. Deterministic Mechanical Interface Fitment Evaluation
 * Compares structured interfaces before string matching and highlights secondary dependencies.
 */
export function evaluateComponentFitment(
  specs: MechanicalSpecifications,
  item: Hi5CatalogueItem
): FitmentEvaluation {
  const structured = specs.structured_interfaces || {};
  const specType = item.structured_spec.interface_type;
  const itemStandard = item.structured_spec.standard;

  // 1. Derailleur Hanger Evaluation
  if (specType === "derailleur_hanger") {
    // Check if bike is in a multi-generation conflict state (e.g. "GT Av")
    if (specs.derailleur_hanger_audit?.status === "CONFLICT") {
      const isOneOfCandidates = specs.derailleur_hanger_audit.competing_candidates?.some((c) =>
        c.sku_or_name.toLowerCase().includes(item.sku.toLowerCase()) ||
        item.name.toLowerCase().includes(c.sku_or_name.toLowerCase())
      );

      return {
        item_sku: item.sku,
        item_name: item.name,
        is_compatible: false,
        compatibility_level: "REQUIRES_VERIFICATION",
        direct_match: false,
        secondary_dependencies: [
          "Check wheel size (26\" vs 27.5\"/29\")",
          "Check mounting screw: 2x M3 screws (ATIDH0233) vs 1x large chainring bolt (ATIDH0021)",
          "Customer visual confirmation or dropout photo required before purchase",
        ],
        notes: isOneOfCandidates
          ? `Potential candidate for GT Avalanche, but generation is unverified due to missing model year.`
          : `Unresolved conflict: model year missing. Verify against ATIDH0233 vs ATIDH0021.`,
        interface_compared: {
          bike_interface: structured.hanger_standard || "CONFLICT_UNRESOLVED",
          component_interface: itemStandard,
        },
      };
    }

    if (structured.hanger_standard) {
      if (structured.hanger_standard === itemStandard) {
        return {
          item_sku: item.sku,
          item_name: item.name,
          is_compatible: true,
          compatibility_level: "EXACT_MATCH",
          direct_match: true,
          secondary_dependencies: ["Torque fixing bolt to OEM specification (typically 8–10 Nm)."],
          notes: `Deterministic match: Bike dropout standard (${structured.hanger_standard}) matches ${item.name}.`,
          interface_compared: {
            bike_interface: structured.hanger_standard,
            component_interface: itemStandard,
          },
        };
      } else {
        return {
          item_sku: item.sku,
          item_name: item.name,
          is_compatible: false,
          compatibility_level: "INCOMPATIBLE",
          direct_match: false,
          secondary_dependencies: [],
          notes: `Incompatible hanger interface: Bike requires ${structured.hanger_standard}, but item is ${itemStandard}.`,
          interface_compared: {
            bike_interface: structured.hanger_standard,
            component_interface: itemStandard,
          },
        };
      }
    }

    // String fallback if structured interface is missing
    const hangerStr = (specs.standards?.rear_axle_spacing || "") + " " + (specs.critical_replacement_skus?.derailleur_hanger || "");
    const match = hangerStr.toLowerCase().includes(itemStandard.toLowerCase());
    return {
      item_sku: item.sku,
      item_name: item.name,
      is_compatible: match,
      compatibility_level: match ? "EXACT_MATCH" : "INCOMPATIBLE",
      direct_match: match,
      secondary_dependencies: [],
      notes: match ? "Matched via technical spec string audit." : "Did not match replacement SKU string.",
    };
  }

  // 2. Bottom Bracket Evaluation
  if (specType === "bottom_bracket") {
    if (structured.bb_shell_standard) {
      if (structured.bb_shell_standard === itemStandard) {
        const secDep: string[] = [];
        if (item.structured_spec.secondary_spec) {
          secDep.push(item.structured_spec.secondary_spec);
        }
        if (itemStandard === "BSA_73") {
          secDep.push("Crank spindle diameter dependency: 24mm (Shimano) vs 28.99mm DUB (SRAM).");
        }

        return {
          item_sku: item.sku,
          item_name: item.name,
          is_compatible: true,
          compatibility_level: "EXACT_MATCH",
          direct_match: true,
          secondary_dependencies: secDep,
          notes: `Shell interface match: ${structured.bb_shell_standard}. Ensure crankset spindle matches internal bearing ID.`,
          interface_compared: {
            bike_interface: structured.bb_shell_standard,
            component_interface: itemStandard,
          },
        };
      } else {
        return {
          item_sku: item.sku,
          item_name: item.name,
          is_compatible: false,
          compatibility_level: "INCOMPATIBLE",
          direct_match: false,
          secondary_dependencies: [],
          notes: `Incompatible shell: Frame has ${structured.bb_shell_standard}, but bottom bracket is ${itemStandard}.`,
          interface_compared: {
            bike_interface: structured.bb_shell_standard,
            component_interface: itemStandard,
          },
        };
      }
    }
  }

  // 3. Freehub / Cassette Evaluation
  if (specType === "freehub") {
    if (structured.freehub_standard) {
      if (structured.freehub_standard === itemStandard) {
        return {
          item_sku: item.sku,
          item_name: item.name,
          is_compatible: true,
          compatibility_level: "EXACT_MATCH",
          direct_match: true,
          secondary_dependencies: ["Check rear derailleur max cog capacity and chain length."],
          notes: `Freehub interface match: ${structured.freehub_standard}.`,
          interface_compared: {
            bike_interface: structured.freehub_standard,
            component_interface: itemStandard,
          },
        };
      } else {
        return {
          item_sku: item.sku,
          item_name: item.name,
          is_compatible: false,
          compatibility_level: "INCOMPATIBLE",
          direct_match: false,
          secondary_dependencies: [
            `Wheel has ${structured.freehub_standard} freehub body; cassette requires ${itemStandard}.`,
            `Freehub body replacement kit required to convert wheel driver standard.`,
          ],
          notes: `Freehub spline mismatch: Bike hub has ${structured.freehub_standard}, but cassette is ${itemStandard}.`,
          interface_compared: {
            bike_interface: structured.freehub_standard,
            component_interface: itemStandard,
          },
        };
      }
    }
  }

  // 4. Brake Rotor Evaluation
  if (specType === "brake_mount") {
    const rotorSize = parseInt(itemStandard, 10);
    const maxRotor = structured.max_rotor_mm || 180;
    if (rotorSize <= maxRotor) {
      return {
        item_sku: item.sku,
        item_name: item.name,
        is_compatible: true,
        compatibility_level: rotorSize === 160 ? "EXACT_MATCH" : "ADAPTER_REQUIRED",
        direct_match: rotorSize === 160,
        secondary_dependencies:
          rotorSize > 160
            ? [`Requires +${rotorSize - 160}mm post-mount caliper spacer adapter.`]
            : ["Ensure caliper alignment and bed in new brake pads."],
        notes: `Rotor size ${rotorSize}mm is within frame maximum of ${maxRotor}mm.`,
        interface_compared: {
          bike_interface: `Max ${maxRotor}mm`,
          component_interface: `${rotorSize}mm`,
        },
      };
    } else {
      return {
        item_sku: item.sku,
        item_name: item.name,
        is_compatible: false,
        compatibility_level: "INCOMPATIBLE",
        direct_match: false,
        secondary_dependencies: [],
        notes: `Exceeds frame max rotor rating of ${maxRotor}mm. Risk of frame caliper stay fatigue failure.`,
        interface_compared: {
          bike_interface: `Max ${maxRotor}mm`,
          component_interface: `${rotorSize}mm`,
        },
      };
    }
  }

  // Generic fallback
  return {
    item_sku: item.sku,
    item_name: item.name,
    is_compatible: true,
    compatibility_level: "REQUIRES_VERIFICATION",
    direct_match: false,
    secondary_dependencies: ["Physical measurement of interface recommended."],
    notes: "Requires mechanical inspection.",
  };
}
