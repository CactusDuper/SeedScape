const mainWorldCanvas = document.getElementById('mainWorldCanvas');
const mainCtx = mainWorldCanvas.getContext('2d');
mainCtx.imageSmoothingEnabled = false;

const logContainer = document.getElementById('logContainer');


// Global Controls
const numWorldsInput = document.getElementById('numWorldsInput');
const baseSeedInput = document.getElementById('baseSeedInput');
const randomBaseSeedButton = document.getElementById('randomBaseSeedButton');
const worldSizeSelect = document.getElementById('worldSizeSelect');
const stepDelayInput = document.getElementById('stepDelayInput');
const generateWorldsButton = document.getElementById('generateWorldsButton');
const regenerateSelectedButton = document.getElementById('regenerateSelectedButton');
const clearAllButton = document.getElementById('clearAllButton');


// Selected World UI Elements (Info)
const selectedWorldIdDisplay = document.getElementById('selectedWorldIdDisplay');
const currentFunctionDisplay = document.getElementById('currentFunction');
const currentEventDisplay = document.getElementById('currentEventDisplay');
const progressBar = document.getElementById('progressBar');
const tileInfoDisplay = document.getElementById('tileInfoDisplay');
const saveSelectedWldButton = document.getElementById('saveSelectedWldButton');

// Render Controls (for selected world, shown globally)
const zoomSlider = document.getElementById('zoomSlider');
const zoomValueDisplay = document.getElementById('zoomValue');

// --- Constants for packed tile data structure (5 bytes per tile) ---
const TILE_DATA_STRIDE = 5;    // Bytes per tile
const TILE_OFFSET_TYPE = 0;    // uint8  (Tile ID)
const TILE_OFFSET_WALL = 1;    // uint8  (Wall ID)
const TILE_OFFSET_FLAGS = 2;   // uint16 (Bit 0: Active, Bits 9,10: Liquid Type)
const TILE_OFFSET_LIQUID = 4;  // uint8  (Liquid Amount)

// Flags within the 16-bit TILE_OFFSET_FLAGS field
const TILE_FLAG_ACTIVE = 0x0001;    // Is the tile an active block?
const TILE_FLAG_LIQ_TYPE = 0x0600;  // Mask for liquid type (bits 9 and 10)
const LIQUID_TYPE_SHIFT = 9;       // Shift to get liquid type to 0-3 range
const MAX_SEED_VALUE = 2147483647; // 2^31 - 1

const tiles = [
    { name: "Dirt", color: "#976B4B"}, // NM
    { name: "Stone", color: "#808080"}, // NM
    { name: "Grass", color: "#1CD85E"}, // NM
    { name: "Plants", color: "#1BC56D"}, // NM
    { name: "Torches", color: "#FDDD03"}, // NM
    { name: "Trees", color: "#976B4B"}, // NM
    { name: "Iron", color: "#8C6550"}, // NM
    { name: "Copper", color: "#964316"}, // NM
    { name: "Gold", color: "#B9A417"}, // NM
    { name: "Silver", color: "#B9C2C3"}, // NM
    { name: "ClosedDoor", color: "#77694F"}, // NM
    { name: "Heart", color: "#AE1845"}, // NM
    { name: "Bottles", color: "#85D5F7"}, // NM
    { name: "Tables", color: "#BF8E6F"}, // NM
    { name: "Chairs", color: "#BF8E6F"}, // NM
    { name: "Anvils", color: "#8C8274"}, // NM
    { name: "WorkBenches", color: "#BF8E6F"}, // NM
    { name: "Platforms", color: "#BF8E6F"}, // NM
    { name: "Containers", color: "#E9CF5E"}, // NM
    { name: "Demonite", color: "#625FA7"}, // NM
    { name: "CorruptGrass", color: "#8D89DF"}, // NM
    { name: "CorruptPlants", color: "#7A74DA"}, // NM
    { name: "Ebonstone", color: "#6D5A80"}, // NM
    { name: "DemonAltar", color: "#77657D"}, // NM
    { name: "Sunflower", color: "#E2C431"}, // NM
    { name: "Pots", color: "#974F50"}, // NM
    { name: "WoodBlock", color: "#AA7854"}, // NM
    { name: "ShadowOrbs", color: "#8D78A8"}, // NM
    { name: "CorruptThorns", color: "#9787B7"}, // NM
    { name: "Candles", color: "#FDDD03"}, // NM
    { name: "Chandeliers", color: "#EBA687"}, // NM
    { name: "ClayBlock", color: "#925144"}, // NM
    { name: "BlueDungeonBrick", color: "#42546D"}, // NM
    { name: "HangingLanterns", color: "#FBEB7F"}, // NM
    { name: "GreenDungeonBrick", color: "#54643F"}, // NM
    { name: "PinkDungeonBrick", color: "#6B4463"}, // NM
    { name: "GoldBrick", color: "#B9A417"}, // NM
    { name: "Spikes", color: "#808080"}, // NM
    { name: "WaterCandle", color: "#2B8FFF"}, // NM
    { name: "Books", color: "#AA3072"}, // NM
    { name: "Cobweb", color: "#C0CACB"}, // NM
    { name: "Vines", color: "#17B14C"}, // NM
    { name: "Sand", color: "#FFDA38"}, // NM
    { name: "Obsidian", color: "#2B2854"}, // NM
    { name: "Ash", color: "#44444C"}, // NM
    { name: "Hellstone", color: "#8E4242"}, // NM
    { name: "Mud", color: "#5C4449"}, // NM
    { name: "JungleGrass", color: "#8FD71D"}, // NM
    { name: "JunglePlants", color: "#87C41A"}, // NM
    { name: "JungleVines", color: "#79B018"}, // NM
    { name: "Sapphire", color: "#6E8CB6"}, // NM
    { name: "Ruby", color: "#C46072"}, // NM
    { name: "Emerald", color: "#389661"}, // NM
    { name: "Topaz", color: "#A0763A"}, // NM
    { name: "Amethyst", color: "#8C3AA6"}, // NM
    { name: "Diamond", color: "#7DBFC5"}, // NM
    { name: "JungleThorns", color: "#BE965C"}, // NM
    { name: "MushroomGrass", color: "#5D7FFF"}, // NM
    { name: "MushroomPlants", color: "#B6AF82"}, // NM
    { name: "MushroomTrees", color: "#B6AF82"}, // NM
    { name: "Plants2", color: "#1BC56D"}, // NM
    { name: "JunglePlants2", color: "#60C51B"}, // NM
    { name: "ObsidianBrick", color: "#242424"}, // NM
    { name: "HellstoneBrick", color: "#8E4242"}, // NM
    { name: "Hellforge", color: "#EE5546"}, // NM
    { name: "Beds", color: "#BF8E6F"}, // NM
    { name: "Cactus", color: "#497811"}, // NM
    { name: "Coral", color: "#F585BF"}, // NM
    { name: "ImmatureHerbs", color: "#FF7800"}, // NM
    { name: "MatureHerbs", color: "#FF7800"}, // NM
    { name: "BloomingHerbs", color: "#FF7800"}, // NM
    { name: "Loom", color: "#BF8E6F"}, // NM
    { name: "Pianos", color: "#BF8E6F"}, // NM
    { name: "Dressers", color: "#BF8E6F"}, // NM
    { name: "Benches", color: "#BF8E6F"}, // NM
    { name: "Bathtubs", color: "#909490"}, // NM
    { name: "Banners", color: "#0D5882"}, // NM
    { name: "Lamps", color: "#FDDD03"}, // NM
    { name: "Kegs", color: "#BF8E6F"}, // NM
    { name: "Candelabras", color: "#FDDD03"}, // NM
    { name: "Bookcases", color: "#BF8E6F"}, // NM
    { name: "Bowls", color: "#8D624D"}, // NM
    { name: "GrandfatherClocks", color: "#BF8E6F"}, // NM
    { name: "Statues", color: "#909490"}, // NM
    { name: "Sawmill", color: "#BF8E6F"}, // NM
    { name: "Ebonsand", color: "#67627A"}, // NM
    { name: "IridescentBrick", color: "#6B5C6C"}, // NM
    { name: "Mudstone", color: "#5C4449"}, // NM
    { name: "Silt", color: "#6A6B76"}, // NM
    { name: "WoodenBeam", color: "#493324"}, // NM
    { name: "ActiveStoneBlock", color: "#A0A0A0"}, // NM
    { name: "PressurePlates", color: "#FD7272"}, // NM
    { name: "Switches", color: "#D5CBCC"}, // NM
    { name: "Traps", color: "#909490"}, // NM
    { name: "Boulder", color: "#606060"}, // NM
    { name: "Explosives", color: "#C03B3B"}, // NM
    { name: "SnowBlock", color: "#D3ECF1"}, // NM
    { name: "SandstoneBrick", color: "#BEAB5E"}, // NM
    { name: "RichMahogany", color: "#915155"}, // NM
    { name: "IceBlock", color: "#90C3E8"}, // NM
    { name: "BreakableIce", color: "#B8DBF0"}, // NM
    { name: "CorruptIce", color: "#AE91D6"}, // NM
    { name: "Stalactite", color: "#646464"}, // NM
    { name: "Tin", color: "#817D5D"}, // NM
    { name: "Lead", color: "#3E5272"}, // NM
    { name: "Tungsten", color: "#849D7F"}, // NM
    { name: "Platinum", color: "#98ABC6"}, // NM
    { name: "TinBrick", color: "#817D5D"}, // NM
    { name: "ExposedGems", color: "#FF00FF"}, // NM
    { name: "GreenMoss", color: "#318672"}, // NM
    { name: "BrownMoss", color: "#7E8631"}, // NM
    { name: "RedMoss", color: "#863B31"}, // NM
    { name: "BlueMoss", color: "#2B568C"}, // NM
    { name: "PurpleMoss", color: "#793186"}, // NM
    { name: "LongMoss", color: "#646464"}, // NM
    { name: "SmallPiles", color: "#959573"}, // NM
    { name: "LargePiles", color: "#FF00FF"}, // NM
    { name: "LargePiles2", color: "#FF00FF"}, // NM
    { name: "CactusBlock", color: "#497811"}, // NM
    { name: "Cloud", color: "#DFFFFF"}, // NM
    { name: "MushroomBlock", color: "#B6AF82"}, // NM
    { name: "LivingWood", color: "#976B4B"}, // NM
    { name: "LeafBlock", color: "#1AC454"}, // NM
    { name: "RainCloud", color: "#9390B2"}, // NM
    { name: "CrimsonGrass", color: "#D05050"}, // NM
    { name: "FleshIce", color: "#D89890"}, // NM
    { name: "CrimsonPlants", color: "#CB3D40"}, // NM
    { name: "Sunplate", color: "#D5B21C"}, // NM
    { name: "Crimstone", color: "#802C2D"}, // NM
    { name: "Crimtane", color: "#7D3741"}, // NM
    { name: "CrimsonVines", color: "#BA3234"}, // NM
    { name: "WaterFountain", color: "#909490"}, // NM
    { name: "Campfire", color: "#FE7902"}, // NM
    { name: "Extractinator", color: "#909490"}, // NM
    { name: "Slush", color: "#6B848B"}, // NM
    { name: "Hive", color: "#E37D16"}, // NM
    { name: "LihzahrdBrick", color: "#8D3800"}, // NM
    { name: "DyePlants", color: "#FFFFFF"}, // NM
    { name: "DyeVat", color: "#909490"}, // NM
    { name: "HoneyBlock", color: "#FF9C0C"}, // NM
    { name: "CrispyHoneyBlock", color: "#834F0D"}, // NM
    { name: "Larva", color: "#E0C265"}, // NM
    { name: "WoodenSpikes", color: "#915155"}, // NM
    { name: "PlantDetritus", color: "#FF00FF"}, // NM
    { name: "Crimsand", color: "#352C29"}, // NM
    { name: "LihzahrdAltar", color: "#FFF133"}, // NM
    { name: "Painting3X3", color: "#63321E"}, // NM
    { name: "Painting4X3", color: "#4D4A48"}, // NM
    { name: "Painting6X4", color: "#63321E"}, // NM
    { name: "Painting2X3", color: "#63321E"}, // NM
    { name: "Painting3X2", color: "#63321E"}, // NM
    { name: "SapphireGemspark", color: "#4F66FF"}, // NM
    { name: "LivingLoom", color: "#909490"}, // NM
    { name: "MinecartTrack", color: "#B5A47D"}, // NM
    { name: "BorealWood", color: "#604D40"}, // NM
    { name: "PalmTree", color: "#B68D56"}, // NM
    { name: "BeachPiles", color: "#E4D5AD"}, // NM
    { name: "GoldCoinPile", color: "#CCB548"}, // NM
    { name: "MushroomStatue", color: "#909490"}, // NM
    { name: "CrimsonThorns", color: "#EE615E"}, // NM
    { name: "BewitchingTable", color: "#8D6B59"}, // NM
    { name: "AlchemyTable", color: "#8D6B59"}, // NM
    { name: "MarbleBlock", color: "#A8B2CC"}, // NM
    { name: "Marble", color: "#A8B2CC"}, // NM
    { name: "Granite", color: "#322E68"}, // NM
    { name: "GraniteBlock", color: "#322E68"}, // NM
    { name: "WaterDrip", color: "#093DBF"}, // NM
    { name: "LavaDrip", color: "#FD2003"}, // NM
    { name: "HoneyDrip", color: "#FF9C0C"}, // NM
    { name: "SharpeningStation", color: "#BF8E6F"}, // NM
    { name: "LavaMoss", color: "#fc5104"},
    { name: "VineFlowers", color: "#1e9648"},
    { name: "LivingMahogany", color: "#dc8c94"},
    { name: "LivingMahoganyLeaves", color: "#64940c"},
    { name: "Sandstone", color: "#d4945c"},
    { name: "HardenedSand", color: "#99703c"},
    { name: "CorruptHardenedSand", color: "#372742"},
    { name: "CrimsonHardenedSand", color: "#3c140c"},
    { name: "CorruptSandstone", color: "#382844"},
    { name: "CrimsonSandstone", color: "#493c34"},
    { name: "DesertFossil", color: "#b46a4a"},
    { name: "Detonator", color: "#e32d2d"},
    { name: "GeyserTrap", color: "#A4A4A4"},
    { name: "BeeHive", color: "#9C845C"},
    { name: "SandDrip", color: "#FFDA38"}, // , (no clue what it's supposed to be, likely takes on biome color? Sand color for now)
    { name: "Containers2", color: "#E9CF5E"},
    { name: "Tables2", color: "#BF8E6F"},
    { name: "CrackedBlueDungeonBrick", color: "#546c7c"},
    { name: "CrackedGreenDungeonBrick", color: "#546454"},
    { name: "CrackedPinkDungeonBrick", color: "#8c446c"},
    { name: "RollingCactus", color: "#7c9c1c"},
    { name: "AntlionLarva", color: "#ccbca4"},
    { name: "FallenLog", color: "#d15558"}, //  (redish)
    { name: "ShellPile", color: "#f5e7d3"},
    { name: "CatBast", color: "#a91e26"}, //  (deeper red)
    { name: "LilyPad", color: "#1dbe62"},
    { name: "Cattail", color: "#1e9652"},
    { name: "MushroomVines", color: "#d7d3b5"},
    { name: "SeaOats", color: "#dfbd96"},
    { name: "OasisPlants", color: "#527d08"},
    { name: "BoulderStatue", color: "#393939"},
    { name: "KryptonMoss", color: "#74fc04"},
    { name: "XenonMoss", color: "#02f3eb"},
    { name: "ArgonMoss", color: "#d4047c"},
    { name: "Seaweed", color: "#345414"},
    { name: "MarbleColumn", color: "#848ca4"},
    { name: "Bamboo", color: "#54621c"},
    { name: "BorealBeam", color: "#4c3c34"},
    { name: "RichMahoganyBeam", color: "#844c54"},
    { name: "GraniteColumn", color: "#3c3474"},
    { name: "SandstoneColumn", color: "#945c3c"},
    { name: "MushroomBeam", color: "#8b856f"},
    { name: "TreeTopaz", color: "#cc7c24"},
    { name: "TreeAmethyst", color: "#eca0fc"},
    { name: "TreeSapphire", color: "#a4e4fc"},
    { name: "TreeEmerald", color: "#44bc8c"},
    { name: "TreeRuby", color: "#c42c2c"},
    { name: "TreeDiamond", color: "#a4e4ec"},
    { name: "TreeAmber", color: "#c16604"},
    { name: "VanityTreeSakura", color: "#745c4c"},
    { name: "VanityTreeYellowWillow", color: "#945c54"},
    { name: "VioletMoss", color: "#7c1cac"},
    { name: "AshGrass", color: "#d48c64"},
    { name: "TreeAsh", color: "#8c747c"},
    { name: "CorruptVines", color: "#9991d4"},
    { name: "AshPlants", color: "#f4cfa0"},
    { name: "AshVines", color: "#da9169"},
    { name: "GlowTulip", color: "#84dcc4"},
    { name: "ShimmerBlock", color: "#fcecf1"},
    { name: "CorruptJungleGrass", color: "#6c6cac"},
    { name: "CrimsonJungleGrass", color: "#a84040"},
    { name: "DirtiestBlock", color: "#74543c"} //  (might highlight?)
];

const liquids = [
    { name: "Water", color: "#093dbf"},
    { name: "Lava", color: "#fd2003"},
    { name: "Honey", color: "#fec214"},
    { name: "Shimmer", color: "#8e76c4"}
];

const walls = [
    { name: "None", color: "#000000"},
    { name: "Stone", color: "#343434"}, // NM
    { name: "DirtUnsafe", color: "#583D2E"}, // NM
    { name: "EbonstoneUnsafe", color: "#3D3A4E"}, // NM
    { name: "BlueDungeonUnsafe", color: "#272D39"}, // NM
    { name: "GreenDungeonUnsafe", color: "#25311F"}, // NM
    { name: "PinkDungeonUnsafe", color: "#3B2534"}, // NM
    { name: "GoldBrick", color: "#4A3E0C"}, // NM
    { name: "HellstoneBrickUnsafe", color: "#432525"}, // NM
    { name: "ObsidianBrickUnsafe", color: "#0F0F0F"}, // NM
    { name: "MudUnsafe", color: "#342B2D"}, // NM
    { name: "BlueDungeon", color: "#272D39"}, // NM
    { name: "GreenDungeon", color: "#25311F"}, // NM
    { name: "PinkDungeon", color: "#3B2534"}, // NM
    { name: "Glass", color: "#8DB2FE"}, // NM
    { name: "IridescentBrick", color: "#26262B"}, // NM
    { name: "MudstoneBrick", color: "#352729"}, // NM
    { name: "Planked", color: "#3E332C"}, // NM
    { name: "SandstoneBrick", color: "#454329"}, // NM
    { name: "SnowWallUnsafe", color: "#556667"}, // NM
    { name: "RichMaogany", color: "#472A2C"}, // NM
    { name: "TinBrick", color: "#3C3B33"}, // NM
    { name: "AmethystUnsafe", color: "#401D4B"}, // NM
    { name: "TopazUnsafe", color: "#4B381D"}, // NM
    { name: "SapphireUnsafe", color: "#1D304B"}, // NM
    { name: "EmeraldUnsafe", color: "#1D4B31"}, // NM
    { name: "RubyUnsafe", color: "#4B1D26"}, // NM
    { name: "DiamondUnsafe", color: "#1D474B"}, // NM
    { name: "CaveUnsafe", color: "#283832"}, // NM
    { name: "Cave2Unsafe", color: "#313024"}, // NM
    { name: "Cave3Unsafe", color: "#2B2120"}, // NM
    { name: "Cave4Unsafe", color: "#1F2831"}, // NM
    { name: "Cave5Unsafe", color: "#302334"}, // NM
    { name: "Cave6Unsafe", color: "#442F24"}, // NM
    { name: "Cave7Unsafe", color: "#37271A"}, // NM
    { name: "SpiderUnsafe", color: "#27211A"}, // NM
    { name: "GrassUnsafe", color: "#1E5030"}, // NM
    { name: "JungleUnsafe", color: "#35501E"}, // NM
    { name: "FlowerUnsafe", color: "#225A36"}, // NM
    { name: "Grass", color: "#1E5030"}, // NM
    { name: "Jungle", color: "#35501E"}, // NM
    { name: "Flower", color: "#1E5030"}, // NM
    { name: "IceUnsafe", color: "#4E6987"}, // NM
    { name: "Cloud", color: "#BECCDF"}, // NM
    { name: "Mushroom", color: "#403E50"}, // NM
    { name: "LivingWood", color: "#3F271A"}, // NM
    { name: "ObsidianBackUnsafe", color: "#332F60"}, // NM
    { name: "MushroomUnsafe", color: "#403E50"}, // NM
    { name: "CrimsonGrassUnsafe", color: "#653333"}, // NM
    { name: "DiscWall", color: "#4D4022"}, // NM
    { name: "CrimstoneUnsafe", color: "#3E2629"}, // NM
    { name: "HiveUnsafe", color: "#8A4926"}, // NM
    { name: "LihzahrdBrickUnsafe", color: "#320F08"}, // NM
    { name: "BlueDungeonSlabUnsafe", color: "#2A3A42"}, // NM
    { name: "BlueDungeonTileUnsafe", color: "#32324E"}, // NM
    { name: "PinkDungeonSlabUnsafe", color: "#45324E"}, // NM
    { name: "PinkDungeonTileUnsafe", color: "#4E324E"}, // NM
    { name: "GreenDungeonSlabUnsafe", color: "#293F2D"}, // NM
    { name: "GreenDungeonTileUnsafe", color: "#324E45"}, // NM
    { name: "BlueDungeonSlab", color: "#2A3A42"}, // NM
    { name: "BlueDungeonTile", color: "#32324E"}, // NM
    { name: "PinkDungeonSlab", color: "#45324E"}, // NM
    { name: "PinkDungeonTile", color: "#4E324E"}, // NM
    { name: "GreenDungeonSlab", color: "#293F2D"}, // NM
    { name: "GreenDungeonTile", color: "#324E45"}, // NM
    { name: "BorealWood", color: "#604752"}, // NM
    { name: "CaveWall", color: "#6C4A44"}, // NM
    { name: "CaveWall2", color: "#643F42"}, // NM
    { name: "MarbleUnsafe", color: "#6F7587"}, // NM
    { name: "MarbleBlock", color: "#6F7587"}, // NM
    { name: "GraniteUnsafe", color: "#191736"}, // NM
    { name: "GraniteBlock", color: "#191736"}, // NM
    { name: "Cave8Unsafe", color: "#343434"}, // NM
    { name: "Sandstone", color: "#955033"}, // NM
    { name: "DirtUnsafe1", color: "#614333"}, // NM
    { name: "DirtUnsafe2", color: "#70503E"}, // NM
    { name: "DirtUnsafe3", color: "#583D2E"}, // NM
    { name: "DirtUnsafe4", color: "#7F5E4C"}, // NM
    { name: "JungleUnsafe1", color: "#4A433C"}, // NM
    { name: "JungleUnsafe2", color: "#3C4E3B"}, // NM
    { name: "JungleUnsafe3", color: "#003615"}, // NM
    { name: "JungleUnsafe4", color: "#4A6148"}, // NM
    { name: "LavaUnsafe1", color: "#282523"}, // NM
    { name: "LavaUnsafe2", color: "#4D3F42"}, // NM
    { name: "LavaUnsafe3", color: "#6F0606"}, // NM
    { name: "LavaUnsafe4", color: "#58433B"}, // NM
    { name: "RocksUnsafe1", color: "#585750"}, // NM
    { name: "RocksUnsafe2", color: "#474743"}, // NM
    { name: "RocksUnsafe3", color: "#4C343C"}, // NM
    { name: "RocksUnsafe4", color: "#59303B"}, // NM
    { name: "HardenedSand", color: "#9E6440"}, // NM
    { name: "CorruptHardenedSand", color: "#3E2D4B"}, // NM
    { name: "CrimsonHardenedSand", color: "#390E0C"}, // NM
    { name: "CorruptSandstone", color: "#433750"}, // NM
    { name: "CrimsonSandstone", color: "#40251D"}, // NM
    { name: "LivingWoodUnsafe", color: "#382414"},
];

const FALLBACK_TILE_COLOR = '#FF00FF'; // Magenta for unknown tiles/walls

// Main thread's Emscripten Module object (dont remember if this is needed globally as workers load their own)
var Module = {};


const EVENT_TYPES = {
    ENTER_FUNCTION: 'ENTER_FUNCTION',
    EXIT_FUNCTION: 'EXIT_FUNCTION',
    TILE_CHANGE: 'TILE_CHANGE',
    BATCH_TILE_CHANGES: 'BATCH_TILE_CHANGES',
    CHEST_MODIFIED: 'CHEST_MODIFIED',
    LOG_MESSAGE: 'LOG_MESSAGE',
    STEP: 'STEP',
    GENERATION_COMPLETE: 'GENERATION_COMPLETE',
    UPDATE_LEVELS: 'UPDATE_LEVELS'
};

const TILE_SIZE_ON_OFFSCREEN = 1; // Render tiles at 1x1 on their offscreen canvas for max detail


function addLog(message, type = 'info') {
    const logEntry = document.createElement('div');
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logEntry.className = `log-${type}`; // TODO: styling

    if (logContainer.children.length > 200) { // Limit log size
        logContainer.removeChild(logContainer.firstChild);
    }

    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight; // auto scroll
}


class WorldDisplay {
    constructor(id, initialSeed, worldSizeOption, cppStepDelay) {
        this.id = id;
        this.seed = parseInt(initialSeed, 10); // Ensure seed is a number. Text seeds are positive crc32 values (int_min -> int_max, otherwise use abs)
        this.worldSizeOption = worldSizeOption;
        this.worldWidth = parseInt(worldSizeOption.dataset.width);
        this.worldHeight = parseInt(worldSizeOption.dataset.height);
        this.cppStepDelay = parseInt(cppStepDelay, 10); // Not used yet

        this.status = 'idle'; // 'idle', 'initializing', 'generating', 'complete', 'error'
        this.currentFunctionName = "N/A";

        this.renderedWorldBitmap = null; 

        this.compactTileBuffer = null;
        this.tileDataView = null;

        this.viewportRect = { x: 0, y: 0, width: 0, height: 0 }; // Calculated by layoutManager
        this.panX = 0;
        this.panY = 0;
        this.currentZoom = 1.0;

        this.worker = null;

        // Default layer positions, updated by C++
        this.surfaceLayerY = this.worldHeight * 0.25;
        this.rockLayerY = this.worldHeight * 0.4;
        this.hellLayerY = this.worldHeight - 200;
    }

    startGeneration() {
        this.destroyWorker(); // Ensure no old worker
        if (this.renderedWorldBitmap) { // Clear previous render if regenerating
            this.renderedWorldBitmap.close(); // Release bitmap resources
            this.renderedWorldBitmap = null;
        }
        this.status = 'initializing';
        this.currentFunctionName = "N/A";
        this.updateSelectedWorldUI(); // Reflect initializing state

        this.worker = new Worker('worldgen_worker.js');
        this.worker.onmessage = (event) => this.handleWorkerMessage(event.data);
        this.worker.onerror = (error) => {
            addLog(`World ${this.id}: Worker error: ${error.message}`, 'error');
            this.status = 'error';
            worldManager.worldFinishedOrErrored(this); // Notify manager
            this.updateSelectedWorldUI();
            this.requestRedraw();
        };

        this.worker.postMessage({
            command: 'initAndStart',
            worldId: this.id,
            seed: this.seed,
            worldSize: this.worldSizeOption.value,
            stepDelay: this.cppStepDelay,
            wasmPath: 'worldgen_visualizer.js', // glue code
            canvasWidth: this.worldWidth,   // These are tile dimensions
            canvasHeight: this.worldHeight
        });
        addLog(`World ${this.id}: Generation started with seed ${this.seed}.`);
        this.requestRedraw();
    }

    triggerSave() {
        if (this.status !== 'complete') {
            addLog(`World ${this.id}: Can only save completed worlds. Status: ${this.status}`, 'warn');
            return;
        }
        if (!this.worker) {
            addLog(`World ${this.id}: No worker available to save file. This might happen if regenerated after completion. Try generating again.`, 'error');
            return;
        }
        addLog(`World ${this.id}: Requesting worker to save world file.`);
        this.worker.postMessage({
            command: 'saveWorldFile',
            worldId: this.id,
            seed: this.seed,
            worldSize: this.worldSizeOption.value
        });
    }

    handleWorkerMessage(data) {
        const { worldId, type, payload, message, status } = data;
        if (worldId !== this.id) return; // Message not for this world

        let needsUIRedraw = false;

        switch (type) {
            case 'log':
                addLog(`World ${this.id}: ${message}`);
                break;
            case 'error':
                addLog(`World ${this.id}: Error from worker: ${message}`, 'error');
                this.status = 'error';
                worldManager.worldFinishedOrErrored(this);
                needsUIRedraw = true;
                break;
            case 'status':
                //addLog(`World ${this.id}: Status update: ${status}`);
                const oldStatus = this.status;
                if (status === 'starting_generation') this.status = 'generating';
                if (status === 'complete') this.status = 'complete';
                if (status === 'error') this.status = 'error';

                if ((oldStatus === 'generating' || oldStatus === 'initializing') && (this.status === 'complete' || this.status === 'error')) {
                    worldManager.worldFinishedOrErrored(this);
                }
                needsUIRedraw = true;
                break;
            case 'function_enter':
                this.currentFunctionName = payload.name;
                break;
            case 'function_exit':
                break;
            case 'generation_render_complete':
                if (payload) {

                    if (payload.bitmap) {
                        if (this.renderedWorldBitmap) this.renderedWorldBitmap.close();
                        this.renderedWorldBitmap = payload.bitmap;
                        addLog(`World ${this.id}: Render bitmap received.`);
                    } else {
                        addLog(`World ${this.id}: Render complete message, but no bitmap in payload.`, 'warn');
                    }

                    if (payload.tileBuffer && payload.tileBuffer instanceof ArrayBuffer) {
                        this.compactTileBuffer = payload.tileBuffer;
                        this.tileDataView = new Uint8Array(this.compactTileBuffer);
                        addLog(`World ${this.id}: Tile data buffer received (${(this.compactTileBuffer.byteLength / (1024*1024)).toFixed(2)} MB).`);
                    } else {
                        addLog(`World ${this.id}: Render complete message, but no valid tileBuffer in payload. Tile info will be unavailable.`, 'warn');
                        this.compactTileBuffer = null; // Ensure it's cleared if bad data comes
                        this.tileDataView = null;
                    }
                } else {
                     addLog(`World ${this.id}: Received malformed generation_render_complete payload.`, 'error');
                }
                
                this.status = 'complete'; // Mark as fully complete
                worldManager.worldFinishedOrErrored(this);
                needsUIRedraw = true;
                break;
            case 'update_levels':
                this.surfaceLayerY = payload.surface;
                this.rockLayerY = payload.rock;
                this.hellLayerY = payload.hell;
                break;
            case 'world_file_data': {
                //addLog(`World ${this.id}: Received file data for ${payload.fileName}. Triggering download.`);
                try {
                    const blob = new Blob([payload.fileBuffer], { type: 'application/octet-stream' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = payload.fileName;
                    document.body.appendChild(link); // Required for Firefox IIRC
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(link.href); // Clean up
                    //addLog(`World ${this.id}: Download initiated for ${payload.fileName}.`);
                } catch (e) {
                    console.error("Error triggering download:", e);
                    //addLog(`World ${this.id}: Error triggering download for ${payload.fileName}.`, 'error');
                }
                break;
            }
        }

        this.updateSelectedWorldUI(); // Update UI elements like function name, status
        if (needsUIRedraw) {
            this.requestRedraw(); // Request main canvas redraw
        }
    }

    getTileInfo(tileX, tileY) {
        if (!this.tileDataView) return "Tile data not available.";
        const getOffset = (tx, ty) => {
            if (tx < 0 || tx >= this.worldWidth || ty < 0 || ty >= this.worldHeight) return -1;
            return (ty * this.worldWidth + tx) * TILE_DATA_STRIDE; // Assumes TILE_DATA_STRIDE is defined globally/accessibly
        };

        const offset = getOffset(tileX, tileY);
        if (offset === -1) return `Out of bounds: (${tileX},${tileY})`;

        const typeId = this.tileDataView[offset + TILE_OFFSET_TYPE];
        const wallId = this.tileDataView[offset + TILE_OFFSET_WALL];
        const flagsLowByte = this.tileDataView[offset + TILE_OFFSET_FLAGS];
        const flagsHighByte = this.tileDataView[offset + TILE_OFFSET_FLAGS + 1];
        const packedFlags = (flagsHighByte << 8) | flagsLowByte;
        const liquidAmount = this.tileDataView[offset + TILE_OFFSET_LIQUID];

        const isActive = (packedFlags & TILE_FLAG_ACTIVE) !== 0;
        const liquidTypeId = (packedFlags & TILE_FLAG_LIQ_TYPE) >> LIQUID_TYPE_SHIFT;

        let info = `Tile (${tileX},${tileY}):\n`;
        if (isActive) {
            info += `Type: ${tiles[typeId]?.name || `Unknown (${typeId})`}\n`;
        }
        if (liquidAmount > 0) {
            info += `Liquid: ${liquids[liquidTypeId]?.name || `Unknown (${liquidTypeId})`} (Amt: ${liquidAmount})\n`;
        }
        if (wallId > 0 && !isActive) { // Show wall only if no active tile covering it
            info += `Wall: ${walls[wallId]?.name || `Unknown (${wallId})`}\n`;
        }
        if (!isActive && liquidAmount === 0 && wallId === 0) {
            info += "Air\n";
        }
        // info += `Raw Flags: 0x${packedFlags.toString(16).padStart(4,'0')}`;
        return info.trim();
    }

    updateSelectedWorldUI() {
        if (worldManager.selectedWorld !== this) return;

        selectedWorldIdDisplay.textContent = `Selected World: ${this.id} (Seed: ${this.seed}, Status: ${this.status})`;
        currentFunctionDisplay.textContent = `Current Function:\n ${this.currentFunctionName || "N/A"}`;
        currentEventDisplay.textContent = `Status: ${this.status.charAt(0).toUpperCase() + this.status.slice(1)}`;
        
        let progressPercent = 0;
        if (this.status === 'initializing') progressPercent = 10;
        else if (this.status === 'generating') progressPercent = 50; // Basic progress, might send proper progress later through C++
        else if (this.status === 'complete') progressPercent = 100;
        progressBar.style.width = `${progressPercent}%`;

        zoomSlider.value = this.currentZoom;
        zoomValueDisplay.textContent = `${this.currentZoom.toFixed(1)}x`;
        zoomSlider.disabled = false; // Zoom always enabled for selected world

        saveSelectedWldButton.disabled = this.status !== 'complete';
        regenerateSelectedButton.disabled = false; // Can always regenerate a selected world
    }
    
    requestRedraw() {
        worldManager.requestRedraw();
    }

    destroyWorker() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
            //addLog(`World ${this.id}: Worker terminated.`);
        }
    }

    destroy() {
        this.destroyWorker();
        if (this.offscreenCanvas) {
            this.offscreenCanvas.width = 0;
            this.offscreenCanvas.height = 0;
        }
        this.offscreenCanvas = null;
        this.offscreenCtx = null;
        this.compactTileBuffer = null;
        this.tileDataView = null;
        //addLog(`World ${this.id}: Instance destroyed.`);
    }
}

const worldManager = {
    worlds: new Map(),
    nextWorldId: 0,
    selectedWorld: null,
    maxConcurrentWorlds: Math.max(1, (navigator.hardwareConcurrency || 4) -1 ), // Leave one core for UI for now
    activeGenerations: 0,
    generationQueue: [],

    init() {
        this.resizeMainCanvas(); // Initial size
        window.addEventListener('resize', () => this.resizeMainCanvas());
        this.setupGlobalControls();
        this.updateSelectedWorldUI(); // Set initial state for UI elements
        this.requestRedraw(); // Initial empty draw
    },

    resizeMainCanvas() {
        // Ensure canvas drawing buffer matches its display size
        mainWorldCanvas.width = mainWorldCanvas.clientWidth;
        mainWorldCanvas.height = mainWorldCanvas.clientHeight;
        this.layoutWorlds();
        this.requestRedraw();
    },
    
    setupGlobalControls() {
        generateWorldsButton.addEventListener('click', () => {
            const numToGen = parseInt(numWorldsInput.value); // TODO: Bounds for these
            let baseSeedFromInput = parseInt(baseSeedInput.value);

            if (isNaN(baseSeedFromInput)) {
                baseSeedFromInput = 0; // Default to 0 if input is not a number
            }
            const clampedBaseSeed = Math.max(0, Math.min(baseSeedFromInput, MAX_SEED_VALUE));

            // Update the input field if the value was clamped or invalid
            if (clampedBaseSeed !== baseSeedFromInput || isNaN(baseSeedFromInput)) {
                baseSeedInput.value = clampedBaseSeed;
                addLog(`Base seed adjusted to be within valid range: ${clampedBaseSeed}`, 'warn');
            }
            const baseSeedValue = clampedBaseSeed; // Use the valid, clamped seed

            const sizeOpt = worldSizeSelect.options[worldSizeSelect.selectedIndex]; // TODO: Custom sizes
            const delay = parseInt(stepDelayInput.value); // Not used just yet

            let actualWorldsQueued = 0; // Keep track if we skip any
            for (let i = 0; i < numToGen; i++) {
                const worldSeed = (baseSeedValue + i) % (MAX_SEED_VALUE + 1); // Make sure it wraps around
                this.addWorldToQueue(worldSeed, sizeOpt, delay);
                actualWorldsQueued++;
            }

            if (actualWorldsQueued > 0) {
                let nextBaseSeed = (baseSeedValue + actualWorldsQueued) % (MAX_SEED_VALUE + 1);
                baseSeedInput.value = nextBaseSeed;
                addLog(`Queued ${actualWorldsQueued} worlds. Next base seed set to ${nextBaseSeed}.`);
            }
        });
        
        randomBaseSeedButton.addEventListener('click', () => {
            baseSeedInput.value = Math.floor(Math.random() * (MAX_SEED_VALUE + 1)); // 0.. 2^31 - 1
        });

        clearAllButton.addEventListener('click', () => {
            this.generationQueue = []; // Clear pending
            this.worlds.forEach(world => world.destroy());
            this.worlds.clear();
            this.activeGenerations = 0;
            this.selectedWorld = null;
            this.updateSelectedWorldUI(); // Reflect no selection
            this.layoutWorlds();
            this.requestRedraw();
            //addLog("All worlds cleared.");
        });
        
        regenerateSelectedButton.addEventListener('click', () => {
            if (this.selectedWorld) {
                addLog(`Regenerating world ${this.selectedWorld.id}...`);
                const worldToRegen = this.selectedWorld;
                

                let seedFromInput = parseInt(baseSeedInput.value, 10);
                if (isNaN(seedFromInput)) {
                    seedFromInput = 0; // Default if input is invalid
                    addLog(`Invalid base seed input for regeneration, defaulting to 0.`, 'warn');
                }
                // Clamp the seed from input to the valid range
                const newSeedForThisWorld = Math.max(0, Math.min(seedFromInput, MAX_SEED_VALUE));
                
                // Update the input field if the value was clamped or invalid
                if (newSeedForThisWorld !== seedFromInput || isNaN(seedFromInput)) {
                    baseSeedInput.value = newSeedForThisWorld; // Reflect the actual seed used
                    addLog(`Regeneration seed adjusted to be within valid range: ${newSeedForThisWorld}`, 'warn');
                }

                worldToRegen.seed = newSeedForThisWorld;

                worldToRegen.destroyWorker(); // Terminate existing worker
                if (worldToRegen.renderedWorldBitmap) { // Clear old visual
                    worldToRegen.renderedWorldBitmap.close();
                    worldToRegen.renderedWorldBitmap = null;
                }
                worldToRegen.compactTileBuffer = null; // Clear old data
                worldToRegen.tileDataView = null;
                worldToRegen.status = 'idle'; // Reset status
                worldToRegen.currentFunctionName = "N/A";

                // Add to front of queue for potentially faster processing
                this.generationQueue.unshift(worldToRegen);
                this.processQueue(); // Attempt to start it

                worldToRegen.updateSelectedWorldUI(); // Update its specific UI
                this.requestRedraw();

                baseSeedInput.value = (newSeedForThisWorld + 1) % (MAX_SEED_VALUE + 1);
                addLog(`World ${worldToRegen.id} queued for regeneration with seed ${newSeedForThisWorld}. Next base seed set to ${baseSeedInput.value}.`);
            }
        });

        mainWorldCanvas.addEventListener('click', (e) => this.handleMainCanvasClick(e));
        mainWorldCanvas.addEventListener('mousedown', (e) => this.handleMainCanvasMouseDown(e));
        mainWorldCanvas.addEventListener('mousemove', (e) => this.handleMainCanvasMouseMove(e));
        mainWorldCanvas.addEventListener('mouseup', () => this.handleMainCanvasMouseUpLeave());
        mainWorldCanvas.addEventListener('mouseleave', () => this.handleMainCanvasMouseUpLeave());
        mainWorldCanvas.addEventListener('wheel', (e) => this.handleMainCanvasWheel(e), { passive: false });


        zoomSlider.addEventListener('input', (e) => {
            if (this.selectedWorld) {
                this.selectedWorld.currentZoom = parseFloat(e.target.value);
                this.selectedWorld.updateSelectedWorldUI(); // Updates zoom display
                this.requestRedraw();
            }
        });

        saveSelectedWldButton.addEventListener('click', () => {
            if (this.selectedWorld) {
                this.selectedWorld.triggerSave();
            } else {
                addLog("No world selected to save.", "warn");
            }
        });
    },
    
    addWorldToQueue(seed, worldSizeOption, cppStepDelay) {
        const worldId = this.nextWorldId++;
        const world = new WorldDisplay(worldId, seed, worldSizeOption, cppStepDelay);
        this.worlds.set(worldId, world);
        this.generationQueue.push(world);

        this.layoutWorlds();
        if (!this.selectedWorld) {
            this.selectWorld(world);
        }
        this.processQueue();
        this.requestRedraw();
    },

    processQueue() {
        while (this.activeGenerations < this.maxConcurrentWorlds && this.generationQueue.length > 0) {
            const world = this.generationQueue.shift();
            if (world.status === 'idle' || world.status === 'queued') { // Have not implemented queued yet
                world.startGeneration();
                this.activeGenerations++;
            } else if (world.status === 'complete' || world.status === 'error') {
                // If a completed/errored world was requeued for regeneration
                world.startGeneration(); // It would have been reset before requeueing
                this.activeGenerations++;
            }
        }
    },

    worldFinishedOrErrored(world) {
        // Ensure this is only called if the world was actually active
        // The status check in handleWorkerMessage helps, but this provides a direct decrement
        if (this.activeGenerations > 0) {
            this.activeGenerations--;
        }
        this.processQueue(); // Try to start next one
        if (this.selectedWorld === world) { // Update UI if the finished world is selected
            this.selectedWorld.updateSelectedWorldUI();
        }
    },


    selectWorld(world) {
        if (this.selectedWorld === world) return;
        this.selectedWorld = world;
        this.updateSelectedWorldUI();
        //addLog(`World ${world.id} selected.`);
        this.requestRedraw(); // To highlight selected world
    },

    updateSelectedWorldUI() {
        if (this.selectedWorld) {
            this.selectedWorld.updateSelectedWorldUI();
            tileInfoDisplay.textContent = "Clicked Tile: N/A"; // Clear tile info on world switch
        } else {
            selectedWorldIdDisplay.textContent = "Selected World: N/A";
            currentFunctionDisplay.textContent = "Current Function:\n N/A";
            currentEventDisplay.textContent = "Status: N/A";
            progressBar.style.width = '0%';
            tileInfoDisplay.textContent = "Clicked Tile: N/A";
            saveSelectedWldButton.disabled = true;
            regenerateSelectedButton.disabled = true;
        }
    },

    layoutWorlds() {
        const numWorlds = this.worlds.size;
        if (numWorlds === 0) {
            this.requestRedraw(); // Clear canvas if no worlds
            return;
        }

        const cols = Math.max(1, Math.ceil(Math.sqrt(numWorlds)));
        const rows = Math.max(1, Math.ceil(numWorlds / cols));

        const cellWidth = mainWorldCanvas.width / cols;
        const cellHeight = mainWorldCanvas.height / rows;

        let i = 0;
        this.worlds.forEach(world => {
            const r = Math.floor(i / cols);
            const c = i % cols;
            world.viewportRect.x = c * cellWidth;
            world.viewportRect.y = r * cellHeight;
            world.viewportRect.width = cellWidth;
            world.viewportRect.height = cellHeight;
            i++;
        });
    },

    _redrawRequestId: null,
    requestRedraw() {
        if (this._redrawRequestId) cancelAnimationFrame(this._redrawRequestId);
        this._redrawRequestId = requestAnimationFrame(() => this.drawMainCanvas());
    },

    drawMainCanvas() {
        mainCtx.fillStyle = '#101015';
        mainCtx.fillRect(0, 0, mainWorldCanvas.width, mainWorldCanvas.height);
        if (this.worlds.size === 0) return;

        for (const world of this.worlds.values()) {
            mainCtx.save();
            mainCtx.imageSmoothingEnabled = false;
            mainCtx.beginPath();
            mainCtx.rect(world.viewportRect.x, world.viewportRect.y, world.viewportRect.width, world.viewportRect.height);
            mainCtx.clip();

            if (world.renderedWorldBitmap) { // --- DRAW THE STORED BITMAP ---
                const viewportAspect = world.viewportRect.width / world.viewportRect.height;
                // world.worldWidth and world.worldHeight are tile dimensions, bitmap has pixel dimensions
                const bitmapAspect = world.renderedWorldBitmap.width / world.renderedWorldBitmap.height;
                
                let drawWidth, drawHeight;
                if (viewportAspect > bitmapAspect) {
                    drawHeight = world.viewportRect.height * world.currentZoom;
                    drawWidth = drawHeight * bitmapAspect;
                } else {
                    drawWidth = world.viewportRect.width * world.currentZoom;
                    drawHeight = drawWidth / bitmapAspect;
                }
                const drawX = world.viewportRect.x + (world.viewportRect.width - drawWidth) / 2 + world.panX;
                const drawY = world.viewportRect.y + (world.viewportRect.height - drawHeight) / 2 + world.panY;

                mainCtx.drawImage(world.renderedWorldBitmap, drawX, drawY, drawWidth, drawHeight);

            } else if (world.status === 'generating' || world.status === 'initializing') {
                // Placeholder content while worker is rendering
                mainCtx.fillStyle = 'rgba(50,50,60,0.8)'; // Dark placeholder
                mainCtx.fillRect(world.viewportRect.x, world.viewportRect.y, world.viewportRect.width, world.viewportRect.height);
                mainCtx.fillStyle = 'white';
                mainCtx.textAlign = 'center';
                mainCtx.fillText(world.status.toUpperCase() + '...', world.viewportRect.x + world.viewportRect.width / 2, world.viewportRect.y + world.viewportRect.height / 2);
                mainCtx.textAlign = 'left'; // Reset
            }
            mainCtx.restore(); // Remove clipping

            // Draw border and status text (same as before)
            mainCtx.strokeStyle = (world === this.selectedWorld) ? 'var(--accent-color)' : 'var(--border-color)';
            mainCtx.lineWidth = (world === this.selectedWorld) ? 3 : 1;
            mainCtx.strokeRect(world.viewportRect.x, world.viewportRect.y, world.viewportRect.width, world.viewportRect.height);
            mainCtx.fillStyle = "rgba(255,255,255,0.9)";
            mainCtx.font = "10px var(--font-main)";
            const statusText = `ID: ${world.id} | ${world.status.charAt(0).toUpperCase() + world.status.slice(1)}`;
            mainCtx.fillText(statusText, world.viewportRect.x + 5, world.viewportRect.y + 15);
        }
    },
    
    _panningWorld: null,
    _lastPanPosition: {x:0, y:0},

    getMouseWorldAndCoords(e) {
        const rect = mainWorldCanvas.getBoundingClientRect();
        const canvasClickX = e.clientX - rect.left;
        const canvasClickY = e.clientY - rect.top;

        for (const world of this.worlds.values()) {
            if (canvasClickX >= world.viewportRect.x && canvasClickX < world.viewportRect.x + world.viewportRect.width &&
                canvasClickY >= world.viewportRect.y && canvasClickY < world.viewportRect.y + world.viewportRect.height) {
                
                // Calculate how the bitmap is drawn (scaled and panned)
                let sourceWidth = world.worldWidth * TILE_SIZE_ON_OFFSCREEN; // Effective pixel width of source
                let sourceHeight = world.worldHeight * TILE_SIZE_ON_OFFSCREEN; // Effective pixel height of source
                if (world.renderedWorldBitmap) {
                    sourceWidth = world.renderedWorldBitmap.width;
                    sourceHeight = world.renderedWorldBitmap.height;
                }

                const viewportAspect = world.viewportRect.width / world.viewportRect.height;
                const imageAspect = sourceWidth / sourceHeight;
                
                let drawWidth, drawHeight;
                if (viewportAspect > imageAspect) {
                    drawHeight = world.viewportRect.height * world.currentZoom;
                    drawWidth = drawHeight * imageAspect;
                } else {
                    drawWidth = world.viewportRect.width * world.currentZoom;
                    drawHeight = drawWidth / imageAspect;
                }
                const drawnImageOriginX = world.viewportRect.x + (world.viewportRect.width - drawWidth) / 2 + world.panX;
                const drawnImageOriginY = world.viewportRect.y + (world.viewportRect.height - drawHeight) / 2 + world.panY;

                const mouseXInImage = canvasClickX - drawnImageOriginX;
                const mouseYInImage = canvasClickY - drawnImageOriginY;
                let tileX = -1, tileY = -1;
                const isOverImage = mouseXInImage >= 0 && mouseXInImage < drawWidth && mouseYInImage >= 0 && mouseYInImage < drawHeight;

                if (isOverImage) {
                    // Convert mouse position on scaled image back to original tile coordinates
                    tileX = Math.floor((mouseXInImage / drawWidth) * world.worldWidth);
                    tileY = Math.floor((mouseYInImage / drawHeight) * world.worldHeight);
                }
                return { world, tileX, tileY, mouseXInViewport: canvasClickX - world.viewportRect.x, mouseYInViewport: canvasClickY - world.viewportRect.y, isOverImage };
            }
        }
        return null;
    },

    handleMainCanvasClick(e) {
        const targetData = this.getMouseWorldAndCoords(e);
        if (targetData) {
            this.selectWorld(targetData.world);
            if (targetData.isOverImage) { // Only show tile info if click was on the actual world map
                const info = targetData.world.getTileInfo(targetData.tileX, targetData.tileY);
                tileInfoDisplay.textContent = info;
            } else {
                tileInfoDisplay.textContent = "Clicked outside world map area.";
            }
        }
    },
    handleMainCanvasMouseDown(e) {
        const targetData = this.getMouseWorldAndCoords(e);
        if (targetData && e.button === 0) { // Left click
            this.selectWorld(targetData.world); // Select on mousedown too
            this._panningWorld = targetData.world;
            this._lastPanPosition = { x: e.clientX, y: e.clientY };
            mainWorldCanvas.style.cursor = 'grabbing';
        }
    },
    handleMainCanvasMouseMove(e) {
        if (this._panningWorld) {
            const dx = e.clientX - this._lastPanPosition.x;
            const dy = e.clientY - this._lastPanPosition.y;
            this._panningWorld.panX += dx;
            this._panningWorld.panY += dy;
            this._lastPanPosition = { x: e.clientX, y: e.clientY };
            this.requestRedraw();
        } else { // Update cursor if hovering over a pannable world
            const targetData = this.getMouseWorldAndCoords(e);
            mainWorldCanvas.style.cursor = (targetData && targetData.world) ? 'grab' : 'default';
        }
    },
    handleMainCanvasMouseUpLeave() {
        if (this._panningWorld) {
            this._panningWorld = null;
            // Set cursor based on current hover state, not just default
            const event = new MouseEvent('mousemove', {clientX: this._lastPanPosition.x, clientY: this._lastPanPosition.y}); // Simulate a mousemove to update cursor
            mainWorldCanvas.dispatchEvent(event); // Check if this is good practice for cursor update
        }
    },
    handleMainCanvasWheel(e) {
        e.preventDefault();
        const targetData = this.getMouseWorldAndCoords(e);
        if (!targetData || !targetData.world) return;

        const targetWorld = targetData.world;
        if (this.selectedWorld !== targetWorld) {
            this.selectWorld(targetWorld);
        }

        const zoomFactor = 1.15;
        const oldZoom = targetWorld.currentZoom;
        
        if (e.deltaY < 0) targetWorld.currentZoom *= zoomFactor; // Zoom in
        else targetWorld.currentZoom /= zoomFactor; // Zoom out
        
        targetWorld.currentZoom = Math.max(0.05, Math.min(128, targetWorld.currentZoom)); // Clamp zoom
        
        // Zoom towards mouse position logic:
        // mouseXVP is mouse X relative to viewport top-left
        const mouseXVP = targetData.mouseXInViewport; 
        const mouseYVP = targetData.mouseYInViewport;

        // Adjust pan so the point under the mouse cursor stays in the same place
        targetWorld.panX = mouseXVP - (mouseXVP - targetWorld.panX) * (targetWorld.currentZoom / oldZoom);
        targetWorld.panY = mouseYVP - (mouseYVP - targetWorld.panY) * (targetWorld.currentZoom / oldZoom);

        targetWorld.updateSelectedWorldUI();
        this.requestRedraw();
    }
};


if (typeof createWorldGenModule === 'function') {
    createWorldGenModule().then(loadedModule => {
        Module = loadedModule; // Main thread's instance, if needed
        addLog("Main WASM Module Loaded (available as 'Module' on main thread).");
        worldManager.init();
    }).catch(e => {
        console.error("Error loading main WASM module:", e);
        addLog(`Error loading main WASM module: ${e.message || e}`, 'error');
        worldManager.init(); // Init anyway, workers load their own.
    });
} else {
    console.warn("'createWorldGenModule' not defined globally. Workers will load WASM independently.");
    addLog("WASM module will be loaded by workers.");
    worldManager.init();
}

window.addEventListener('beforeunload', () => {
    addLog("Page unloading. Terminating active workers.");
    if (worldManager && worldManager.worlds) {
        worldManager.worlds.forEach(world => {
            world.destroyWorker(); // Terminates the worker if active
        });
    }
});