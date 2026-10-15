/**
 * Manufacturer Profiles and Component Blacklist
 * Stage B of the Frame Recognition Pipeline
 * Hi5.bike Query Engine
 */

import {
  ManufacturerProfile,
  SampleWalkaroundPreset,
} from "../types/frameRecognition";

export const COMPONENT_MANUFACTURERS_BLACKLIST: Array<{
  name: string;
  category: string;
  warning_tip: string;
}> = [
  {
    name: "Shimano",
    category: "Drivetrain & Brakes",
    warning_tip:
      "Shimano manufactures derailleurs, cranks, and brakes, NOT bicycle frames. Look at the frame down tube, top tube, or head badge.",
  },
  {
    name: "SRAM",
    category: "Drivetrain & Electronic Shifting",
    warning_tip:
      "SRAM makes Eagle drivetrains, AXS shifters, and RockShox suspension, NOT bicycle frames.",
  },
  {
    name: "Campagnolo",
    category: "Groupsets & Wheels",
    warning_tip:
      "Campagnolo makes Italian groupsets and wheels, not the bicycle frame itself.",
  },
  {
    name: "RockShox",
    category: "Suspension Forks & Shocks",
    warning_tip:
      "RockShox is a suspension brand. Check the bicycle frame for the actual bicycle manufacturer.",
  },
  {
    name: "Fox Racing Shox",
    category: "Suspension Forks & Shocks",
    warning_tip:
      "Fox makes suspension forks and rear dampers. This does not identify the bike manufacturer.",
  },
  {
    name: "DT Swiss",
    category: "Wheels, Hubs & Shocks",
    warning_tip:
      "DT Swiss makes wheels and hubs, not bicycle frames.",
  },
  {
    name: "Magura",
    category: "Hydraulic Disc Brakes",
    warning_tip:
      "Magura is a brake system manufacturer.",
  },
  {
    name: "Tektro",
    category: "Disc Brakes",
    warning_tip:
      "Tektro provides OEM brakes across dozens of budget brands.",
  },
  {
    name: "Microshift",
    category: "Budget Drivetrains",
    warning_tip:
      "Microshift provides budget derailleurs and cassettes.",
  },
];

export const MANUFACTURER_PROFILES: Record<string, ManufacturerProfile> = {
  "GT Bicycles": {
    id: "gt",
    brand_name: "GT Bicycles",
    full_name: "GT Bicycles Inc.",
    signature_architectures: [
      "Triple Triangle Frame (seatstays cross seat tube to weld onto top tube)",
      "Floating Seatstay design (2020+ models detach seatstays from seat tube for vertical flex)",
      "Headtube gusset reinforcement plates on older generations",
    ],
    distinguishing_rules: [
      {
        feature_name: "Floating Seatstay Junction",
        observation_key: "seatstay_junction",
        expected_value: "floating_detached_seatstay",
        implication: "Confirms modern generation (2020-2024) GT Avalanche or Zaskar. Derailleur hanger uses 2x M3 screws (ATIDH0233).",
        confidence_impact: 0.35,
      },
      {
        feature_name: "Welded Seatstay Junction",
        observation_key: "seatstay_junction",
        expected_value: "welded_triple_triangle",
        implication: "Confirms legacy generation (pre-2020) GT frame. If 26\" wheels with single barrel bolt, confirms 2006-2013 generation (ATIDH0021).",
        confidence_impact: 0.35,
      },
      {
        feature_name: "Dropout Fastener Geometry",
        observation_key: "rear_dropout_system",
        expected_value: "traditional_hanger_m3_twin",
        implication: "Rules out vintage 1-barrel bolt hangers; locks modern GT ATIDH0233 / Wheels Mfg #266.",
        confidence_impact: 0.4,
      },
    ],
    model_families: ["Avalanche", "Zaskar", "Aggressor", "Grade", "Force", "Sensor"],
    generational_markers: {
      "2006-2013": "Welded Triple Triangle, 26-inch wheels, 1x large barrel bolt hanger (ATIDH0021), straight 1-1/8 headtube.",
      "2015-2019": "Welded Triple Triangle, 27.5-inch wheels, 2x M3 screws hanger (ATIDH0233), tapered headtube.",
      "2020-2024": "Floating Triple Triangle (seatstays bypass seat tube freely), internal cable routing, 27.5 or 29-inch wheels, BSA 73mm BB.",
    },
    component_guard_warnings: [
      "Do not identify by All Terra stem/bars; All Terra is GT's house component brand.",
    ],
  },

  Specialized: {
    id: "specialized",
    brand_name: "Specialized",
    full_name: "Specialized Bicycle Components",
    signature_architectures: [
      "FSR 4-bar suspension linkage with Horst link pivot on chainstay in front of rear axle",
      "Asymmetric Sidearm frame strut connecting top tube to shock linkage (Stumpjumper & Turbo Levo)",
      "SWAT internal frame storage door on carbon down tubes",
      "Brain inertial valve damper on rear axle (Epic)",
    ],
    distinguishing_rules: [
      {
        feature_name: "Integrated Brose Motor & Downtube Battery",
        observation_key: "motor_type",
        expected_value: "specialized_brose_casing",
        implication: "Confirms Specialized Turbo Levo or Kenevo e-MTB platform.",
        confidence_impact: 0.4,
      },
      {
        feature_name: "Sidearm Frame Strut",
        observation_key: "frame_strut",
        expected_value: "asymmetric_sidearm",
        implication: "Confirms 2019-2023 Specialized Stumpjumper or Turbo Levo Gen 2/3.",
        confidence_impact: 0.3,
      },
      {
        feature_name: "Pre-UDH Dropout vs SRAM UDH",
        observation_key: "rear_dropout_system",
        expected_value: "traditional_hanger_barrel_bolt",
        implication: "Confirms 2019-2021 Turbo Levo Gen 2 requiring proprietary hanger S182600001 (NOT compatible with SRAM UDH!).",
        confidence_impact: 0.35,
      },
      {
        feature_name: "SRAM UDH Dropout",
        observation_key: "rear_dropout_system",
        expected_value: "sram_udh",
        implication: "Confirms 2022+ Turbo Levo Gen 3 or 2021+ Stumpjumper EVO.",
        confidence_impact: 0.35,
      },
    ],
    model_families: ["Turbo Levo", "Stumpjumper", "Epic", "Diverge", "Roubaix", "Tarmac", "Chisel", "Status"],
    generational_markers: {
      "2016-2018 (Levo Gen 1)": "Integrated battery with physical LED buttons on down tube side, proprietary motor casing, non-sidearm frame.",
      "2019-2021 (Levo Gen 2)": "Asymmetric Sidearm strut, Specialized 2.1 motor, proprietary hanger S182600001, TCU on top tube (simple LED line).",
      "2022-2024 (Levo Gen 3)": "MasterMind TCU full-color display on top tube, SRAM UDH derailleur hanger, mixed wheel setup (29 front / 27.5 rear), adjustable head angle.",
    },
  },

  Trek: {
    id: "trek",
    brand_name: "Trek",
    full_name: "Trek Bicycle Corporation",
    signature_architectures: [
      "ABP (Active Braking Pivot) concentric rear axle pivot",
      "Knock Block steering limiter headset integrated into frame",
      "IsoStrut structural shock embedded directly into top tube crossbar (Supercaliber)",
      "IsoSpeed decoupler at seat tube / top tube juncture (Domane, Madone, Checkpoint)",
      "Mino Link adjustable geometry flip chip at rocker arm",
    ],
    distinguishing_rules: [
      {
        feature_name: "ABP Concentric Rear Axle",
        observation_key: "suspension_layout",
        expected_value: "abp_concentric",
        implication: "Confirms Trek Full Suspension MTB platform (Fuel EX, Remedy, Slash, Top Fuel). Requires Trek ABP Convert hanger or UDH (2021+).",
        confidence_impact: 0.4,
      },
      {
        feature_name: "IsoStrut Embedded Damper",
        observation_key: "suspension_layout",
        expected_value: "isostrut",
        implication: "Confirms Trek Supercaliber XC race platform. BB is PressFit 92 (Gen 1) or T47 (Gen 2).",
        confidence_impact: 0.5,
      },
      {
        feature_name: "BB95 PressFit Shell",
        observation_key: "bottom_bracket_shell_type",
        expected_value: "bb95_trek",
        implication: "Confirms vintage carbon Trek mountain frame (e.g. 2011-2019 Fuel EX, Superfly). Bearings press directly into carbon frame with zero cups.",
        confidence_impact: 0.35,
      },
    ],
    model_families: ["Fuel EX", "Supercaliber", "Slash", "Top Fuel", "Domane", "Madone", "Checkpoint", "Marlin", "Procaliber"],
    generational_markers: {
      "2011-2015": "BB95 on carbon / BB86 on alloy, Full Floater shock link (shock mounts to chainstay extension, not main triangle), ABP Convert 142x12 hanger.",
      "2016-2020": "Fixed lower shock mount (Full Floater discontinued on Fuel EX), Knock Block 1.0 headset stop, Boost 148 rear axle, PressFit 92 BB.",
      "2021-2024": "SRAM UDH rear hanger transition, Knock Block 2.0 with larger turning radius, threaded BSA 73 or T47 bottom bracket.",
    },
  },

  Cannondale: {
    id: "cannondale",
    brand_name: "Cannondale",
    full_name: "Cannondale Bicycle Corporation",
    signature_architectures: [
      "Lefty single-sided suspension strut (Ocho / Oliver)",
      "Kingpin rear suspension thru-axle pivot through seat tube (Topstone Carbon)",
      "SAVE micro-suspension flattened chainstays and seatstays",
      "Ai (Asymmetric Integration) 6mm offset rear triangle & dished rear wheel",
      "HollowGram / Si spider & BB30A / PF30A 73mm asymmetric bottom bracket shell",
    ],
    distinguishing_rules: [
      {
        feature_name: "Kingpin Seat Tube Thru-Axle Pivot",
        observation_key: "suspension_layout",
        expected_value: "kingpin_pivot",
        implication: "Confirms Cannondale Topstone Carbon gravel frame. Provides up to 30mm leaf-spring compliance.",
        confidence_impact: 0.45,
      },
      {
        feature_name: "Lefty Fork Strut",
        observation_key: "fork_architecture",
        expected_value: "single_sided_lefty",
        implication: "Confirms Cannondale Lefty Ocho (XC) or Lefty Oliver (Gravel). Requires proprietary 50mm Lefty hub spacing.",
        confidence_impact: 0.5,
      },
      {
        feature_name: "BB30A / PF30A Asymmetric BB Shell",
        observation_key: "bottom_bracket_shell_type",
        expected_value: "bb30_pf30",
        implication: "Shell width is 73mm asymmetric (+5mm on non-drive side). Standard BB30 cups will NOT fit without Cannondale-specific spacers.",
        confidence_impact: 0.3,
      },
    ],
    model_families: ["Topstone", "SuperSix EVO", "SystemSix", "Scalpel", "Habit", "Synapse", "Trail"],
    generational_markers: {
      "2016-2019": "Ai offset rear triangle (wheel must be dished 6mm to drive-side), PF30A bottom bracket, quick release on budget / 142x12 on carbon.",
      "2020-2023": "Dropped seatstays on SuperSix / Topstone, Kingpin pivot on Topstone Carbon, KNOT integrated cockpit, Speed Release thru-axles.",
      "2024+": "Threaded BSA bottom bracket return, standard non-Ai rear spacing, SRAM UDH adoption on select MTB/Gravel frames.",
    },
  },

  "Santa Cruz": {
    id: "santacruz",
    brand_name: "Santa Cruz",
    full_name: "Santa Cruz Bicycles",
    signature_architectures: [
      "VPP (Virtual Pivot Point) dual counter-rotating linkages",
      "Lower-link driven VPP shock tunnelled through the lower seat tube (modern generation)",
      "Upper-link driven VPP shock attached under top tube (legacy generation)",
      "Grease ports on lower forged VPP link for easy servicing",
      "Glovebox internal downtube storage latch (modern carbon CC/C frames)",
    ],
    distinguishing_rules: [
      {
        feature_name: "Lower-Link Driven Shock Tunnel",
        observation_key: "suspension_layout",
        expected_value: "vpp_lower_link_shock_tunnel",
        implication: "Confirms modern generation Santa Cruz (Bronson 3/4, Megatower 1/2, Nomad 4/5/6, Hightower 2/3).",
        confidence_impact: 0.45,
      },
      {
        feature_name: "Upper-Link Driven Shock",
        observation_key: "suspension_layout",
        expected_value: "vpp_upper_link",
        implication: "Confirms legacy generation Santa Cruz (Bronson 1/2, Nomad 2/3, 5010 1/2). Standard shock placement under top tube.",
        confidence_impact: 0.4,
      },
      {
        feature_name: "Threaded BSA Bottom Bracket",
        observation_key: "bottom_bracket_shell_type",
        expected_value: "bsa_threaded",
        implication: "Santa Cruz exclusively specifies 73mm Threaded BSA bottom brackets across all modern carbon and alloy mountain frames.",
        confidence_impact: 0.3,
      },
    ],
    model_families: ["Bronson", "Megatower", "Nomad", "Hightower", "5010", "Tallboy", "Blur", "Chameleon", "Stigmata"],
    generational_markers: {
      "2013-2017": "Upper-link driven shock under top tube, 142x12 rear axle on Gen 1 / Boost 148 on Gen 2, non-tunnel seat tube.",
      "2018-2021": "Transition to lower-link driven shock through lower seat tube tunnel, Boost 148 spacing, flip-chip at shock mount.",
      "2022-2024": "SRAM UDH rear hanger adoption, Glovebox downtube storage door, proportional chainstay lengths per frame size.",
    },
  },

  Canyon: {
    id: "canyon",
    brand_name: "Canyon",
    full_name: "Canyon Bicycles GmbH",
    signature_architectures: [
      "CP07 Double-Decker Hover Bar (Grail CF gravel cockpit with floating carbon leaf)",
      "Shapeshifter pneumatic link on Strive (on-the-fly geometry switch)",
      "Integrated wedge seat clamp recessed behind the seat tube juncture",
      "IPU (Impact Protection Unit) rubber bumper on top tube behind headset",
    ],
    distinguishing_rules: [
      {
        feature_name: "Double-Decker Hover Bar",
        observation_key: "cockpit_architecture",
        expected_value: "canyon_hover_bar_cp07",
        implication: "Unambiguously identifies Canyon Grail CF (Gen 1 2018-2023). Requires Canyon EP0716-01 / EP0786-01 derailleur hanger.",
        confidence_impact: 0.5,
      },
      {
        feature_name: "Shapeshifter Auxiliary Piston",
        observation_key: "suspension_layout",
        expected_value: "shapeshifter_piston",
        implication: "Identifies Canyon Strive enduro platform with XC/DH geometry morphing.",
        confidence_impact: 0.5,
      },
      {
        feature_name: "Recessed Wedge Seat Clamp",
        observation_key: "seat_clamp_style",
        expected_value: "integrated_recessed_wedge",
        implication: "Characteristic Canyon carbon road/gravel frame detail. Fastener is an internal 4mm hex behind the seatstays.",
        confidence_impact: 0.3,
      },
    ],
    model_families: ["Grail", "Grizl", "Aeroad", "Ultimate", "Endurace", "Spectral", "Strive", "Lux", "Neuron"],
    generational_markers: {
      "2018-2022": "Grail CF with Hover Bar, proprietary hanger EP0716-01 / EP0786-01, PressFit BB86, recessed clamp.",
      "2023-2024": "Grail Gen 2 with integrated CP0039 cockpit, GEAR groove accessory mount, SRAM UDH adoption.",
    },
  },

  Pinarello: {
    id: "pinarello",
    brand_name: "Pinarello",
    full_name: "Cicli Pinarello S.r.l.",
    signature_architectures: [
      "Onda curved wave fork blades and wavy seatstay curves",
      "Asymmetric frame engineering (drive-side structural reinforcement)",
      "Aero seatpost with twin rear-facing clamp bolts",
      "Italian 70mm threaded bottom bracket shell on flagship frames",
    ],
    distinguishing_rules: [
      {
        feature_name: "Onda Wavy Fork & Stays",
        observation_key: "fork_stays_contour",
        expected_value: "onda_wave_curved",
        implication: "Signature Pinarello silhouette (Dogma F/F12/F10/F8, Prince, Paris).",
        confidence_impact: 0.5,
      },
      {
        feature_name: "Italian Threaded Bottom Bracket",
        observation_key: "bottom_bracket_shell_type",
        expected_value: "italian_70",
        implication: "70mm shell width, 36mm x 24 TPI with right-hand threading on both drive and non-drive sides.",
        confidence_impact: 0.35,
      },
    ],
    model_families: ["Dogma F", "Dogma F12", "Dogma F10", "Prince", "Paris", "Grevil", "Crossista"],
    generational_markers: {
      "Dogma F8 / F10 (2015-2019)": "Rim brake or early disc, Onda F10 fork, external or internal junction box in down tube.",
      "Dogma F12 (2019-2021)": "Full TiCR internal cable routing through MOST Talon cockpit, flat mount disc, aero Onda F12 fork.",
      "Dogma F (2022-2024)": "TorayCa T1100 1K carbon with Nanoalloy, narrower aero headtube, 3D printed titanium seat clamp.",
    },
  },

  Cervélo: {
    id: "cervelo",
    brand_name: "Cervélo",
    full_name: "Cervélo Cycles",
    signature_architectures: [
      "Squoval tube profile (square-oval aerodynamic structural shape)",
      "Dropped pencil-thin seatstays for comfort and reduced drag",
      "Trail Mixer front fork flip-chip dropout (Áspero)",
      "BBright 79mm asymmetric pressfit bottom bracket shell",
    ],
    distinguishing_rules: [
      {
        feature_name: "Trail Mixer Fork Flip-Chip",
        observation_key: "fork_dropout_chip",
        expected_value: "trail_mixer_chip",
        implication: "Exclusively identifies Cervélo Áspero gravel series (adjusts fork trail between 700c and 650b wheels).",
        confidence_impact: 0.5,
      },
      {
        feature_name: "BBright Asymmetric Pressfit Shell",
        observation_key: "bottom_bracket_shell_type",
        expected_value: "bbright_79",
        implication: "79mm shell width (+11mm on non-drive side). Requires BBright specific bottom bracket.",
        confidence_impact: 0.4,
      },
    ],
    model_families: ["Áspero", "Caledonia", "R5", "S5", "Soloist", "P5", "ZHT-5"],
    generational_markers: {
      "Áspero Gen 1 (2019-2023)": "BBright shell, Trail Mixer fork chip, bento box bosses, Cervélo DRH-WMN112 hanger.",
      "Áspero-5 (2021+)": "Full internal cable routing through C035 stem, carbon carbon bar, integrated cockpit.",
      "Áspero Gen 2 (2024+)": "Threaded T47A bottom bracket shell, SRAM UDH rear hanger, increased tire clearance.",
    },
  },

  Giant: {
    id: "giant",
    brand_name: "Giant",
    full_name: "Giant Manufacturing Co.",
    signature_architectures: [
      "Maestro Suspension dual-rocker floating pivot design",
      "OverDrive / OverDrive 2 oversized steerer (1-1/4 to 1-1/2 taper)",
      "D-Fuse composite D-shaped seatpost",
      "Compact Road sloping top tube geometry with low center of gravity",
    ],
    distinguishing_rules: [
      {
        feature_name: "Maestro Floating Pivot Suspension",
        observation_key: "suspension_layout",
        expected_value: "maestro_dual_rocker",
        implication: "Identifies Giant full-suspension models (Trance, Reign, Anthem, Stance).",
        confidence_impact: 0.45,
      },
      {
        feature_name: "D-Fuse D-Shaped Seatpost",
        observation_key: "seatpost_profile",
        expected_value: "d_fuse_d_shape",
        implication: "Identifies Giant Defy, Revolt, or TCX platforms.",
        confidence_impact: 0.4,
      },
    ],
    model_families: ["TCR", "Defy", "Propel", "Revolt", "Trance", "Reign", "Anthem"],
    generational_markers: {
      "2016-2020": "OverDrive 2 steerer on Pro models, PressFit BB86/BB92, 142x12 rear thru-axle, Giant proprietary hangers.",
      "2021-2024": "SRAM UDH adoption on new Trance X / Reign, internal cable routing through OverDrive Aero stem.",
    },
  },
};

/**
 * 6 Realistic Customer Video Walkaround Presets
 * Each preset models structured observation data from a short customer walkaround video.
 */
export const SAMPLE_WALKAROUND_PRESETS: SampleWalkaroundPreset[] = [
  {
    id: "preset-gt-avalanche-walkaround",
    title: "Customer Video: GT Avalanche 2021 (Walkaround)",
    bike_category: "Hardtail Trail MTB",
    description: "Customer pans camera around hardtail MTB showing GT Triple Triangle, floating seatstays, and rear derailleur with 2x M3 screws.",
    expected_brand: "GT Bicycles",
    expected_model: "GT Avalanche",
    expected_generation: "2020-2024 (Modern Floating Stays)",
    expected_hanger: "GT ATIDH0233 / K33047 (2x M3 Screws)",
    expected_bb: "Threaded BSA 73mm",
    views: [
      {
        view_key: "view_1_drive_side",
        view_name: "Drive-Side Full Silhouette",
        description: "Hardtail frame with 29-inch wheels, large white GT wordmark on down tube, Shimano Deore 1x11 drivetrain.",
        frame_image_placeholder: "drive_side_gt_profile",
        key_visible_features: ["GT brand wordmark", "Hardtail silhouette", "Shimano Deore 1x11", "29er wheels"],
      },
      {
        view_key: "view_2_non_drive_side",
        view_name: "Non-Drive Side Profile",
        description: "Post-mount hydraulic disc brake caliper mounted inside rear triangle, quick release skewer.",
        frame_image_placeholder: "non_drive_gt_brakes",
        key_visible_features: ["Post-mount disc", "160mm rotor", "135mm QR axle"],
      },
      {
        view_key: "view_3_cockpit_headtube",
        view_name: "Cockpit & Headtube",
        description: "GT wing head-badge on tapered headtube, internal cable ports entering lower down tube sides.",
        frame_image_placeholder: "gt_headtube_badge",
        key_visible_features: ["GT wing metal badge", "Tapered ZS44/ZS56", "Internal downtube cable ports"],
      },
      {
        view_key: "view_4_bottom_bracket",
        view_name: "Bottom Bracket & Under-Downtube",
        description: "Threaded external bottom bracket cups stamped Shimano BB-MT501, 73mm shell, plastic cable guide underneath.",
        frame_image_placeholder: "gt_bottom_bracket",
        key_visible_features: ["Threaded BSA 73mm", "Shimano Hollowtech II cups"],
      },
      {
        view_key: "view_5_rear_dropouts",
        view_name: "Rear Triangle & Dropout Close-Up",
        description: "Black aluminum derailleur hanger secured to inside of dropout using 2x tiny M3 flathead countersunk screws spaced 14mm apart.",
        frame_image_placeholder: "gt_dropout_m3_screws",
        key_visible_features: ["2x tiny M3 countersunk screws", "Inside dropout mount", "ATIDH0233 geometry"],
      },
      {
        view_key: "view_6_seatstay_junction",
        view_name: "Seatstay / Seat Tube Triple Triangle Junction",
        description: "Clear air gap visible between seatstays and seat tube! Seatstays bypass seat tube freely to weld onto top tube.",
        frame_image_placeholder: "gt_floating_seatstays",
        key_visible_features: ["Floating Triple Triangle (detached seatstays)", "30.9mm seatpost"],
      },
    ],
    simulated_observations: {
      frame_type: "hardtail",
      suspension_layout: "rigid_hardtail",
      rear_dropout_system: "traditional_hanger_m3_twin",
      bottom_bracket_shell_type: "bsa_threaded",
      cable_routing: "internal_downtube_ports",
      brake_interface: "post_mount_disc",
      visible_components: {
        drivetrain_tier: "Shimano Deore M5100 1x11",
        rear_derailleur_model: "RD-M5100-SGS",
        brake_model: "Tektro HD-M275 Hydraulic Disc",
        fork_model: "SR Suntour XCR32-Air 100mm",
        wheel_spec: "29 x 2.25 WTB Ranger",
      },
      visual_generation_markers: [
        "floating_seatstays_detached",
        "two_m3_countersunk_dropout_screws",
        "tapered_headtube",
        "twenty_nine_inch_wheels",
      ],
      raw_view_notes: {
        view_6_seatstay_junction: "Confirmed floating seatstays with clear daylight between stay and seat tube, proving 2020+ generation.",
        view_5_rear_dropouts: "Identified twin M3 screws confirming GT ATIDH0233 and eliminating vintage barrel-bolt ATIDH0021.",
      },
    },
  },

  {
    id: "preset-spz-levo-2021-walkaround",
    title: "Customer Video: Specialized Turbo Levo 2021 (Walkaround)",
    bike_category: "Full Suspension e-MTB",
    description: "Customer records 15s clip of an e-MTB showing Specialized 'S' logo, Brose motor, Sidearm frame bridge, and non-UDH hanger.",
    expected_brand: "Specialized",
    expected_model: "Specialized Turbo Levo",
    expected_generation: "2019-2021 (Gen 2 - Pre-UDH)",
    expected_hanger: "Specialized S182600001 (Proprietary Pre-UDH)",
    expected_bb: "Specialized Brose 2.1 Integrated Motor",
    views: [
      {
        view_key: "view_1_drive_side",
        view_name: "Drive-Side Full Silhouette",
        description: "Full suspension e-bike with large motor housing in BB area, battery down tube, SRAM GX Eagle 12-speed.",
        frame_image_placeholder: "levo_drive_side",
        key_visible_features: ["Specialized wordmark", "Brose motor casing", "Asymmetric Sidearm strut", "SRAM Eagle"],
      },
      {
        view_key: "view_2_non_drive_side",
        view_name: "Non-Drive Side Suspension & Linkage",
        description: "FSR Horst link pivot visible on chainstay forward of rear axle. Charging port flap near bottom bracket.",
        frame_image_placeholder: "levo_fsr_linkage",
        key_visible_features: ["FSR Horst link", "RockShox Deluxe Select shock", "Charge port cover"],
      },
      {
        view_key: "view_3_cockpit_headtube",
        view_name: "Cockpit & Headtube",
        description: "Top tube shows Gen 2 TCU display (LED battery bars and circular power button, not full-color MasterMind screen).",
        frame_image_placeholder: "levo_tcu_top_tube",
        key_visible_features: ["Gen 2 TCU display (simple LED line)", "Specialized S head badge"],
      },
      {
        view_key: "view_4_bottom_bracket",
        view_name: "Motor Housing & Skid Plate",
        description: "Specialized 2.1 custom Rx Trail-tuned Brose motor with composite rock guard skid plate.",
        frame_image_placeholder: "levo_motor_housing",
        key_visible_features: ["Specialized 2.1 motor casing", "Full e-bike integrated chassis"],
      },
      {
        view_key: "view_5_rear_dropouts",
        view_name: "Rear Triangle & Hanger Interface",
        description: "Proprietary black cast hanger fixed via large barrel nut through dropout. Clearly NOT a SRAM UDH concentric washer!",
        frame_image_placeholder: "levo_pre_udh_dropout",
        key_visible_features: ["Proprietary S182600001 hanger", "Non-UDH dropout interface", "148x12 Boost axle"],
      },
      {
        view_key: "view_6_seatstay_junction",
        view_name: "Seat Tube & Shock Linkage",
        description: "Asymmetric carbon Sidearm connects top tube to shock linkage on the right side only.",
        frame_image_placeholder: "levo_sidearm_bridge",
        key_visible_features: ["Asymmetric Sidearm frame strut", "FSR forged rocker link"],
      },
    ],
    simulated_observations: {
      frame_type: "e_bike_full_suspension",
      suspension_layout: "horst_link_fsr",
      rear_dropout_system: "traditional_hanger_barrel_bolt",
      bottom_bracket_shell_type: "ebike_motor_integrated",
      cable_routing: "internal_downtube_ports",
      brake_interface: "post_mount_disc",
      visible_components: {
        drivetrain_tier: "SRAM GX Eagle 12-Speed",
        rear_derailleur_model: "RD-GX-1-B2",
        brake_model: "SRAM Code R 4-Piston",
        fork_model: "RockShox 35 Gold RL 160mm",
        shock_model: "RockShox Deluxe Select+ RT",
        motor_generation: "Specialized 2.1 (Brose Drive S Mag)",
      },
      visual_generation_markers: [
        "specialized_2_1_motor",
        "asymmetric_sidearm_strut",
        "tcu_simple_led_display",
        "pre_udh_s182600001_dropout",
        "twenty_nine_inch_front_rear",
      ],
      raw_view_notes: {
        view_5_rear_dropouts: "Pre-UDH dropout interface confirmed. Locks S182600001 and rejects SRAM UDH.",
        view_3_cockpit_headtube: "LED line TCU confirms Gen 2 (2019-2021) and eliminates Gen 3 MasterMind (2022+).",
      },
    },
  },

  {
    id: "preset-trek-fuel-ex-walkaround",
    title: "Customer Video: Trek Fuel EX 8 2014 (Walkaround)",
    bike_category: "Full Suspension Trail MTB",
    description: "Walkaround video of 2014 Trek Fuel EX 8 with ABP concentric pivot, Full Floater shock mount, and BB95 shell.",
    expected_brand: "Trek",
    expected_model: "Trek Fuel EX",
    expected_generation: "2011-2015 (Full Floater & ABP Convert)",
    expected_hanger: "Trek ABP Convert 142x12 (W301805 / 318001)",
    expected_bb: "BB95 PressFit / BB86",
    views: [
      {
        view_key: "view_1_drive_side",
        view_name: "Drive-Side Full Silhouette",
        description: "Silver/Black alloy full-suspension bike, 29-inch wheels, Trek typography across down tube, Shimano XT rear derailleur.",
        frame_image_placeholder: "trek_fuel_drive_side",
        key_visible_features: ["Trek down tube logo", "Full suspension alloy", "Shimano Deore XT", "Fox Float DRCV shock"],
      },
      {
        view_key: "view_2_non_drive_side",
        view_name: "Non-Drive Side Rear Triangle",
        description: "ABP pivot concentric with rear axle. Disc brake caliper mounted on chainstay inside rear triangle.",
        frame_image_placeholder: "trek_abp_non_drive",
        key_visible_features: ["ABP concentric axle pivot", "Shimano SLX brake caliper", "142x12 thru-axle"],
      },
      {
        view_key: "view_3_cockpit_headtube",
        view_name: "Cockpit & Headtube",
        description: "E2 tapered head tube with Trek shield crest. External shift cables running along under-side of down tube.",
        frame_image_placeholder: "trek_e2_headtube",
        key_visible_features: ["Trek shield crest", "E2 tapered headtube", "External down tube cable guides"],
      },
      {
        view_key: "view_4_bottom_bracket",
        view_name: "Bottom Bracket Shell Area",
        description: "PressFit bottom bracket shell with Shimano pressfit bearings flush against the shell with no external flange threads.",
        frame_image_placeholder: "trek_fuel_bb",
        key_visible_features: ["PressFit BB shell", "Mino Link rocker pivot"],
      },
      {
        view_key: "view_5_rear_dropouts",
        view_name: "Rear Dropout & ABP Pivot",
        description: "Concentric ABP pivot with Trek ABP Convert nut clamping the 142x12 rear thru axle. Hanger skus W301805.",
        frame_image_placeholder: "trek_abp_dropout",
        key_visible_features: ["Trek ABP Convert dropout", "Concentric axle bearing", "W301805 hanger profile"],
      },
      {
        view_key: "view_6_seatstay_junction",
        view_name: "Full Floater Suspension Linkage",
        description: "Lower shock eyelet attaches directly to extended chainstay strut, floating between rocker and chainstay (Full Floater).",
        frame_image_placeholder: "trek_full_floater",
        key_visible_features: ["Full Floater shock linkage (pre-2017)", "Fox DRCV dual chamber shock"],
      },
    ],
    simulated_observations: {
      frame_type: "full_suspension",
      suspension_layout: "abp_concentric",
      rear_dropout_system: "trek_abp_convert",
      bottom_bracket_shell_type: "pressfit_pf92_bb86",
      cable_routing: "external_down_tube",
      brake_interface: "post_mount_disc",
      visible_components: {
        drivetrain_tier: "Shimano Deore XT 2x10",
        rear_derailleur_model: "RD-M786 Shadow Plus",
        brake_model: "Shimano SLX M675 Hydraulic Disc",
        fork_model: "Fox 32 Float CTD Evolution 120mm",
        shock_model: "Fox Float CTD DRCV",
        wheel_spec: "29er Bontrager Duster Tubeless Ready",
      },
      visual_generation_markers: [
        "abp_concentric_pivot",
        "full_floater_floating_lower_mount",
        "drcv_dual_chamber_shock",
        "abp_convert_142x12_hanger",
        "external_cable_routing",
      ],
      raw_view_notes: {
        view_6_seatstay_junction: "Full Floater floating shock confirms 2011-2015 generation before Trek moved to fixed frame lower mounts in 2017.",
        view_5_rear_dropouts: "ABP Convert 142x12 confirms hanger W301805 and rejects modern UDH.",
      },
    },
  },

  {
    id: "preset-canyon-grail-walkaround",
    title: "Customer Video: Canyon Grail CF SL 8 2021 (Walkaround)",
    bike_category: "Carbon Gravel Bike",
    description: "Customer pans around sleek gravel bike featuring Canyon's iconic CP07 double-decker carbon hover bar and recessed seat clamp.",
    expected_brand: "Canyon",
    expected_model: "Canyon Grail",
    expected_generation: "2018-2023 (Hover Bar Gen 1)",
    expected_hanger: "Canyon EP0716-01 / EP0786-01",
    expected_bb: "PressFit BB86",
    views: [
      {
        view_key: "view_1_drive_side",
        view_name: "Drive-Side Full Silhouette",
        description: "Carbon gravel bike in sand tan finish, dropped pencil seatstays, Shimano GRX RX810 2x11 drivetrain.",
        frame_image_placeholder: "canyon_grail_drive_side",
        key_visible_features: ["Canyon block letters on down tube", "Shimano GRX RX810", "Carbon gravel silhouette", "DT Swiss C1850 wheels"],
      },
      {
        view_key: "view_2_non_drive_side",
        view_name: "Non-Drive Side & Brakes",
        description: "Flat mount disc brake calipers mounted cleanly on carbon stays, 142x12 thru-axle.",
        frame_image_placeholder: "canyon_grail_brakes",
        key_visible_features: ["Flat mount disc brakes", "Shimano RT800 160mm rotors", "Thru-axle 142x12"],
      },
      {
        view_key: "view_3_cockpit_headtube",
        view_name: "Cockpit & Double-Decker Hover Bar",
        description: "Iconic Canyon CP07 double-decker carbon hover handlebar with upper floating leaf flex zone.",
        frame_image_placeholder: "canyon_hover_bar",
        key_visible_features: ["Canyon CP07 Double-Decker Hover Bar", "Floating carbon leaf spring", "Canyon headset cap"],
      },
      {
        view_key: "view_4_bottom_bracket",
        view_name: "Bottom Bracket & Downtube Armor",
        description: "PressFit BB86 shell with Token Ninja / Shimano pressfit cups, rubber downtube rock strike protector.",
        frame_image_placeholder: "canyon_bb_armor",
        key_visible_features: ["PressFit BB86 shell (86.5mm width)", "Integrated down tube protector"],
      },
      {
        view_key: "view_5_rear_dropouts",
        view_name: "Rear Dropout & Hanger Profile",
        description: "Proprietary Canyon EP0716-01 / EP0786-01 derailleur hanger with single countersunk mounting screw.",
        frame_image_placeholder: "canyon_ep0716_dropout",
        key_visible_features: ["Canyon EP0716-01 hanger profile", "Single countersunk retention screw"],
      },
      {
        view_key: "view_6_seatstay_junction",
        view_name: "Integrated Seat Clamp",
        description: "Internal seatpost wedge clamp integrated flush into seat tube with rubber grommet behind seatstay junction.",
        frame_image_placeholder: "canyon_wedge_clamp",
        key_visible_features: ["Recessed internal seat wedge clamp", "VCLS 2.0 split carbon seatpost"],
      },
    ],
    simulated_observations: {
      frame_type: "gravel",
      suspension_layout: "flex_stay",
      rear_dropout_system: "thru_axle_142",
      bottom_bracket_shell_type: "pressfit_pf92_bb86",
      cable_routing: "internal_downtube_ports",
      brake_interface: "flat_mount_disc",
      visible_components: {
        drivetrain_tier: "Shimano GRX RX810 2x11",
        rear_derailleur_model: "RD-RX810 Shadow RD+",
        brake_model: "Shimano GRX BR-RX810 Flat Mount",
        fork_model: "Canyon FK0070 CF Disc Carbon",
        wheel_spec: "700x40c Schwalbe G-One Bite",
      },
      visual_generation_markers: [
        "double_decker_hover_bar_cp07",
        "recessed_internal_seat_wedge_clamp",
        "vcls_split_leaf_seatpost",
        "canyon_ep0716_hanger",
        "pressfit_bb86",
      ],
      raw_view_notes: {
        view_3_cockpit_headtube: "CP07 double-decker hover bar unambiguously locks Canyon Grail CF Gen 1 (2018-2023).",
        view_5_rear_dropouts: "EP0716 hanger verified.",
      },
    },
  },

  {
    id: "preset-cannondale-topstone-walkaround",
    title: "Customer Video: Cannondale Topstone Carbon (Walkaround)",
    bike_category: "Carbon Gravel Bike",
    description: "Customer pans around gravel bike with Cannondale Kingpin rear thru-axle pivot through the seat tube and SAVE carbon stays.",
    expected_brand: "Cannondale",
    expected_model: "Cannondale Topstone",
    expected_generation: "2020-2023 (Kingpin Carbon Gen 1)",
    expected_hanger: "Cannondale K33009 (Speed Release TA)",
    expected_bb: "BB30A / PF30A 73mm Asymmetric",
    views: [
      {
        view_key: "view_1_drive_side",
        view_name: "Drive-Side Full Silhouette",
        description: "Carbon gravel bike, large Cannondale script logo, Shimano GRX drivetrain, dropped seatstays with pivot.",
        frame_image_placeholder: "cannondale_topstone_profile",
        key_visible_features: ["Cannondale wordmark", "Kingpin rear pivot", "Shimano GRX 1x11"],
      },
      {
        view_key: "view_2_non_drive_side",
        view_name: "Non-Drive Side & Flat Mount",
        description: "Flat mount disc brake, Speed Release slotted thru axle dropout, Kingpin thru-axle pivot visible on seat tube.",
        frame_image_placeholder: "cannondale_kingpin_pivot",
        key_visible_features: ["Kingpin seat tube thru-axle pivot", "Speed release dropout", "Flat mount disc"],
      },
      {
        view_key: "view_3_cockpit_headtube",
        view_name: "Cockpit & Headtube",
        description: "Clean carbon headtube with Cannondale crest, internal cables entering through frame down tube port.",
        frame_image_placeholder: "cannondale_headtube",
        key_visible_features: ["Cannondale crest", "Internal routing down tube entry", "FSA headset"],
      },
      {
        view_key: "view_4_bottom_bracket",
        view_name: "Bottom Bracket Shell Area",
        description: "BB30A asymmetric pressfit shell, Cannondale One crankset, SmartForm carbon layup around bottom bracket.",
        frame_image_placeholder: "cannondale_bb30a",
        key_visible_features: ["BB30A asymmetric 73mm shell", "Cannondale One alloy crank"],
      },
      {
        view_key: "view_5_rear_dropouts",
        view_name: "Rear Dropout & Speed Release",
        description: "Cannondale Speed Release double-lead 142x12 dropout with K33009 hanger.",
        frame_image_placeholder: "cannondale_speed_release",
        key_visible_features: ["Speed release slotted dropout", "K33009 hanger"],
      },
      {
        view_key: "view_6_seatstay_junction",
        view_name: "Kingpin Suspension Pivot",
        description: "Maintenance-free thru-axle pivot passing directly through seat tube with internal low-friction bushings.",
        frame_image_placeholder: "cannondale_kingpin_detail",
        key_visible_features: ["Kingpin thru-axle pivot through seat tube", "SAVE flattened seatstays"],
      },
    ],
    simulated_observations: {
      frame_type: "gravel",
      suspension_layout: "flex_stay",
      rear_dropout_system: "thru_axle_142",
      bottom_bracket_shell_type: "bb30_pf30",
      cable_routing: "internal_downtube_ports",
      brake_interface: "flat_mount_disc",
      visible_components: {
        drivetrain_tier: "Shimano GRX 800 / 600 Mix 1x11",
        rear_derailleur_model: "RD-RX812",
        brake_model: "Shimano GRX RX400 Hydraulic Flat Mount",
        fork_model: "BallisTec Carbon 12x100 Speed Release",
        wheel_spec: "WTB ST i23 TCS 700c",
      },
      visual_generation_markers: [
        "kingpin_seat_tube_thru_axle_pivot",
        "speed_release_dropouts",
        "bb30a_asymmetric_bottom_bracket",
        "save_flattened_stays",
      ],
      raw_view_notes: {
        view_6_seatstay_junction: "Kingpin pivot unequivocally confirms Cannondale Topstone Carbon platform.",
        view_4_bottom_bracket: "BB30A shell identified.",
      },
    },
  },

  {
    id: "preset-component-only-rejection",
    title: "Negative Test: Close-Up of Shimano Derailleur (No Frame Logo)",
    bike_category: "Component Only (Trigger Stage A Rejection)",
    description: "Camera is zoomed in too closely on a Shimano Deore derailleur and cassette; no frame decals or head badge are visible.",
    expected_brand: "UNKNOWN (Component Only)",
    expected_model: "REJECTED_STAGE_A",
    expected_generation: "N/A",
    expected_hanger: "N/A",
    expected_bb: "N/A",
    views: [
      {
        view_key: "view_1_drive_side",
        view_name: "Drive-Side Derailleur Close-up",
        description: "Extreme close-up of Shimano Deore RD-M5100 rear derailleur cage and 11-speed cassette. Frame tubing is out of frame.",
        frame_image_placeholder: "shimano_derailleur_closeup",
        key_visible_features: ["Shimano Deore logo", "11-speed cassette", "Chain"],
      },
      {
        view_key: "view_2_non_drive_side",
        view_name: "Brake Caliper Close-up",
        description: "Close-up of Shimano hydraulic caliper on disc rotor. Frame brand decals not visible.",
        frame_image_placeholder: "shimano_caliper_closeup",
        key_visible_features: ["Shimano logo on caliper", "6-bolt rotor"],
      },
      {
        view_key: "view_3_cockpit_headtube",
        view_name: "Handlebar Zoom",
        description: "Zoom on Shimano brake lever clamp. Head tube badge is cut off outside the camera frame.",
        frame_image_placeholder: "shimano_lever_closeup",
        key_visible_features: ["Shimano brake lever clamp", "Bell"],
      },
    ],
    simulated_observations: {
      frame_type: "hardtail",
      visible_components: {
        drivetrain_tier: "Shimano Deore M5100",
        rear_derailleur_model: "RD-M5100",
      },
      visual_generation_markers: ["shimano_component_only"],
      raw_view_notes: {
        stage_a: "Only Shimano drivetrain visible. Frame manufacturer decals are absent.",
      },
    },
  },
];
