// worldgen_worker.js
let Module; // WASM Module instance for this worker
let currentWorldId = -1;
let currentStepDelay = 0; // Not used yet, will be used soon
let currentSeed = 0;
let currentWorldSize = 0;

let workerOffscreenCanvas = null;
let workerCtx = null;
let TILE_SIZE_ON_WORKER_CANVAS = 1; // Tiles are 1x1 on the offscreen canvas

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

// TODO: Shared settings
const tiles_worker = [
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

const liquids_worker = [
    { name: "Water", color: "#093dbf"},
    { name: "Lava", color: "#fd2003"},
    { name: "Honey", color: "#fec214"},
    { name: "Shimmer", color: "#8e76c4"}
];

const walls_worker = [
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

const FALLBACK_COLOR_WORKER = '#FF00FF';

let surfaceLayerY_worker, rockLayerY_worker, hellLayerY_worker, worldHeight_worker, worldWidth_worker;



function _getWorkerTileOffset(x, y) {
    if (!worldWidth_worker || !worldHeight_worker || x < 0 || x >= worldWidth_worker || y < 0 || y >= worldHeight_worker) return -1;
    return (y * worldWidth_worker + x) * TILE_DATA_STRIDE;
}

function _updateWorkerCompactTile(x, y, type, wall, flags, liquidAmount) {
    if (!workerTileDataView) return;
    const offset = _getWorkerTileOffset(x, y);
    if (offset === -1) return;

    workerTileDataView[offset + TILE_OFFSET_TYPE] = type;
    workerTileDataView[offset + TILE_OFFSET_WALL] = wall;
    workerTileDataView[offset + TILE_OFFSET_FLAGS] = flags & 0xFF;
    workerTileDataView[offset + TILE_OFFSET_FLAGS + 1] = (flags >> 8) & 0xFF;
    workerTileDataView[offset + TILE_OFFSET_LIQUID] = liquidAmount;
}

function drawBackgroundLayersToWorkerContext() {
    if (!workerCtx || !worldWidth_worker || !worldHeight_worker) return;
    const canvasWidth = workerOffscreenCanvas.width;
    const canvasHeight = workerOffscreenCanvas.height;
    const ts = TILE_SIZE_ON_WORKER_CANVAS;

    workerCtx.fillStyle = '#1a202c'; // Deep space/default
    workerCtx.fillRect(0, 0, canvasWidth, canvasHeight);
    workerCtx.fillStyle = "rgb(132, 170, 248)"; // Sky
    workerCtx.fillRect(0, 0, canvasWidth, surfaceLayerY_worker * ts);
    workerCtx.fillStyle = "rgb(88, 61, 46)"; // Underground
    workerCtx.fillRect(0, surfaceLayerY_worker * ts, canvasWidth, (rockLayerY_worker - surfaceLayerY_worker) * ts);
    workerCtx.fillStyle = "rgb(74, 67, 60)"; // Cavern
    workerCtx.fillRect(0, rockLayerY_worker * ts, canvasWidth, (hellLayerY_worker - rockLayerY_worker) * ts);
    workerCtx.fillStyle = "rgb(40, 10, 10)"; // Hell
    workerCtx.fillRect(0, hellLayerY_worker * ts, canvasWidth, (worldHeight_worker - hellLayerY_worker) * ts);
}

function drawTileToWorkerContext(x, y, tileType, wallType, liquidAmount, liquidTypeVal, active) {
    if (!workerCtx) return;
    const ts = TILE_SIZE_ON_WORKER_CANVAS;
    const screenX = x * ts;
    const screenY = y * ts;

    if (active) {
        const tileInfo = tiles_worker[tileType];
        workerCtx.fillStyle = tileInfo ? tileInfo.color : FALLBACK_COLOR_WORKER;
        workerCtx.fillRect(screenX, screenY, ts, ts);
        return;
    }
    if (liquidAmount > 0) {
        const liquidInfo = liquids_worker[liquidTypeVal];
        workerCtx.fillStyle = liquidInfo ? liquidInfo.color : FALLBACK_COLOR_WORKER;
        workerCtx.fillRect(screenX, screenY, ts, ts);
        return;
    }
    if (wallType > 0) {
        const wallInfo = walls_worker[wallType];
        workerCtx.fillStyle = wallInfo ? wallInfo.color : FALLBACK_COLOR_WORKER;
        workerCtx.fillRect(screenX, screenY, ts, ts);
        return;
    }
}

// These handlers will be called by C++ from within this worker's context
const visualizerAppWorkerHandlers = {
    handleEnterFunction: (functionName) => {
        self.postMessage({
            worldId: currentWorldId,
            type: 'function_enter',
            payload: { name: functionName }
        });
    },
    handleExitFunction: (functionName) => {
        self.postMessage({
            worldId: currentWorldId,
            type: 'function_exit',
            payload: { name: functionName }
        });
    },
    handleTileChange: (x, y, tileType, wallType, liquidAmount, liquidTypeVal, active) => { // Not used just yet
        self.postMessage({
            worldId: currentWorldId,
            type: 'single_tile',
            payload: { x, y, tileType, wallType, liquidAmount, liquidTypeVal, active: active !== 0 }
        });
    },
    handleBatchTileChanges: (tileDataView) => {
        if (!workerCtx) return; // Canvas not ready

        const TILE_FLAG_ACTIVE_WORKER = 0x0001;
        const TILE_FLAG_LIQ_TYPE_WORKER = 0x0600;
        const LIQUID_TYPE_SHIFT_WORKER = 9;

        // tileDataView is a view on WASM memory. No need to copy if processed synchronously here.
        const dataView = new DataView(tileDataView.buffer, tileDataView.byteOffset, tileDataView.byteLength);
        const numBytesPerEvent = 9; // x, y, type, wall, liquid, flags

        for (let i = 0; i < dataView.byteLength; i += numBytesPerEvent) {

            const xL = dataView.getUint8(i + 0);
            const xH = dataView.getUint8(i + 1);
            const x = (xL | (xH << 8)); // TODO: Fix. Reading Uint16 as LE/BE is broken... Same for the rest
            const yL = dataView.getUint8(i + 2);
            const yH = dataView.getUint8(i + 3);
            const y = (yL | (yH << 8));
            const tileType = dataView.getUint8(i + 4);
            const wallType = dataView.getUint8(i + 5);
            const liquidAmount = dataView.getUint8(i + 6);
            const flagsL = dataView.getUint8(i + 7);
            const flagsH = dataView.getUint8(i + 8);
            const flags = (flagsL | (flagsH << 8));


            const active = (flags & TILE_FLAG_ACTIVE_WORKER) !== 0;
            const liquidType = (flags & TILE_FLAG_LIQ_TYPE_WORKER) >> LIQUID_TYPE_SHIFT_WORKER;

            drawTileToWorkerContext(x, y, tileType, wallType, liquidAmount, liquidType, active);
            _updateWorkerCompactTile(x, y, tileType, wallType, flags , liquidAmount);
        }
    },
    handleChestModified: (x, y, itemCount) => {
        self.postMessage({
            worldId: currentWorldId,
            type: 'chest_modified',
            payload: { x, y, itemCount }
        });
    },
    handleLogMessage: (message) => {
        self.postMessage({ worldId: currentWorldId, type: 'log', message: message });
    },
    handleStep: (delayMsIgnored) => { // The actual delay is handled by emscripten_sleep in C++
        self.postMessage({
            worldId: currentWorldId,
            type: 'event',
            payload: { eventType: 'STEP' } // Ignored for now
        });
    },
    handleGenerationComplete: () => {
        let bitmap = null;
        if (workerOffscreenCanvas && workerCtx) {
            bitmap = workerOffscreenCanvas.transferToImageBitmap();
        }

        // Ensure workerCompactTileBuffer is not null (it should have been populated)
        if (!workerCompactTileBuffer) {
            console.error(`Worker ${currentWorldId}: workerCompactTileBuffer is null at generation complete!`);
            // Fallback: send only bitmap or error.
            self.postMessage({
                worldId: currentWorldId,
                type: 'generation_render_complete', // Main thread will see null tileBuffer
                payload: { bitmap: bitmap, tileBuffer: null }
            }, bitmap ? [bitmap] : []);
            self.postMessage({ worldId: currentWorldId, type: 'status', status: 'error', message: "Tile data buffer missing in worker." });
            return;
        }

        // Post both the bitmap and the worker's complete tile buffer
        self.postMessage({
            worldId: currentWorldId,
            type: 'generation_render_complete',
            payload: {
                bitmap: bitmap,
                tileBuffer: workerCompactTileBuffer // Send the ArrayBuffer
            }
        }, bitmap ? [bitmap, workerCompactTileBuffer] : [workerCompactTileBuffer]); // Transfer both if bitmap exists

        self.postMessage({ worldId: currentWorldId, type: 'status', status: 'complete' });

        // Clean up worker's resources for this world
        workerOffscreenCanvas = null;
        workerCtx = null;
        workerCompactTileBuffer = null; // Buffer was transferred
        workerTileDataView = null;
    },
    updateLevels: (surface, rock, hell) => {
        // Store these to draw background before tiles
        surfaceLayerY_worker = surface;
        rockLayerY_worker = rock;
        hellLayerY_worker = hell;
        if (workerCtx) { // If canvas already exists, redraw background
            drawBackgroundLayersToWorkerContext();
        }
        // Send to main thread if it needs this info for other purposes
        self.postMessage({ worldId: currentWorldId, type: 'update_levels', payload: { surface, rock, hell } });
    }
};

// Expose these handlers to the global scope of the worker, so EM_JS can find them
self.visualizerApp = visualizerAppWorkerHandlers;


self.onmessage = async (e) => {
    const { command, worldId, seed, worldSize, stepDelay, wasmPath, canvasWidth, canvasHeight, x, y } = e.data;

    currentWorldId = worldId;

    if (command === 'initAndStart') {
        currentStepDelay = stepDelay; // Not needed just yet
        currentSeed = seed;
        currentWorldSize = worldSize; // Store for potential C++ re-init if worker is reused

        if (canvasWidth && canvasHeight) {
            worldWidth_worker = canvasWidth;   // These are tile dimensions
            worldHeight_worker = canvasHeight; // e.g., 6400, 1800
            
            // Set default biome layers before C++ overrides
            surfaceLayerY_worker = worldHeight_worker * 0.25;
            rockLayerY_worker = worldHeight_worker * 0.4;
            hellLayerY_worker = worldHeight_worker - 200;

            try {
                workerOffscreenCanvas = new OffscreenCanvas(
                    worldWidth_worker * TILE_SIZE_ON_WORKER_CANVAS,
                    worldHeight_worker * TILE_SIZE_ON_WORKER_CANVAS
                );
                workerCtx = workerOffscreenCanvas.getContext('2d', { alpha: false }); // No alpha needed for base
                workerCtx.imageSmoothingEnabled = false;
                drawBackgroundLayersToWorkerContext(); // Initial background

                const totalTiles = worldWidth_worker * worldHeight_worker;
                const bufferSize = totalTiles * TILE_DATA_STRIDE;
                workerCompactTileBuffer = new ArrayBuffer(bufferSize);
                workerTileDataView = new Uint8Array(workerCompactTileBuffer);
                workerTileDataView.fill(0); // Initialize
            } catch (canvasError) {
                console.error(`Worker ${currentWorldId}: OffscreenCanvas creation failed`, canvasError);
                self.postMessage({ worldId: currentWorldId, type: 'error', message: `Worker OffscreenCanvas error: ${canvasError.message}`});
                // Proceed without worker-side rendering if canvas fails? Or just error out?
                // For now, it will try to run C++ anyway, but drawing calls will fail.
            }
        } else {
            console.warn(`Worker ${currentWorldId}: Canvas dimensions not provided.`);
        }

        if (!Module) {
            try {
                // Dynamically import the Emscripten-generated JS file
                // The global 'Module' object will be created by worldgen_visualizer.js itself in its own scope
                importScripts(wasmPath || 'worldgen_visualizer.js'); // defines 'createWorldGenModule' in the worker's global scope
                
                Module = await createWorldGenModule();

                self.postMessage({ worldId: currentWorldId, type: 'status', status: 'wasm_loaded' });

            } catch (error) {
                console.error(`Worker ${currentWorldId}: WASM module loading failed`, error);
                self.postMessage({ worldId: currentWorldId, type: 'error', message: `WASM load error: ${error.message}` });
                return;
            }
        }
        
        // Ensure Module is ready
        if (!Module || !Module.ccall) {
             self.postMessage({ worldId: currentWorldId, type: 'error', message: 'Module not ready after load.' });
             return;
        }

        try {
            self.postMessage({ worldId: currentWorldId, type: 'status', status: 'starting_generation' });
            
            Module.ccall('init_visualizer_worldgen', null, ['number'], [currentStepDelay]);
            Module.ccall('start_world_generation', null, ['number', 'number'], [seed, worldSize]);
            // GenerationComplete message will be sent by handleGenerationComplete
            
        } catch (err) {
            console.error(`Worker ${currentWorldId}: Generation error`, err);
            let errorMessage = `Generation error: ${err.message || err}`;
            if (err.name === 'ExitStatus') { // Emscripten exit()
                errorMessage = `Generation exited with status: ${err.status}`;
            }
            self.postMessage({ worldId: currentWorldId, type: 'error', message: errorMessage });
        }
    }
    else if (command === 'saveWorldFile') {
        currentWorldId = worldId; // Set context for any logs
        if (!Module || !Module.ccall) {
            self.postMessage({ worldId, type: 'error', message: 'WASM Module not ready for saving.' });
            return;
        }
        let sizePtr = 0; // Initialize to 0
        try {
            sizePtr = Module._malloc(4); 
            const dataPtr = Module.ccall('save_world_file',
                'number',       // Return type: const uint8_t*
                ['number'],     // Arg types: int* size_ptr (passing just the pointer value)
                [sizePtr]);     // Args: the pointer to the int where size will be stored

            const dataSize = Module.getValue(sizePtr, 'i32'); // C++ Writes size back


            if (dataPtr && dataSize > 0) {
                // Create a copy from WASM heap to JS-owned
                const fileDataView = new Uint8Array(Module.HEAPU8.buffer, dataPtr, dataSize);
                const fileDataCopy = new Uint8Array(fileDataView);

                //console.log(`Worker ${worldId}: World file data generated (${(fileDataCopy.byteLength / (1024*1024)).toFixed(2)} MB). Posting to main thread.`);
                self.postMessage({
                    worldId: worldId,
                    type: 'world_file_data',
                    payload: {
                        fileName: `${seed}_${worldSize + 1}.wld`,
                        fileBuffer: fileDataCopy.buffer // Send the ArrayBuffer of the copy
                    }
                }, [fileDataCopy.buffer]); // Transfer ownership of the buffer
            } else {
                throw new Error("C++ returned no data or zero size for world file.");
            }

        } catch (err) {
            console.error(`Worker ${worldId}: Error during world file generation/saving`, err);
            self.postMessage({ worldId: worldId, type: 'error', message: `Save error: ${err.message || err}` });
        } finally {
            if (sizePtr !== 0) { // Only free if malloc succeeded
                Module._free(sizePtr);
             }
        }
    }
    else if (command === 'getTileInfo') {
                if (!this.tileDataView) return "Tile data not available.";
        const offset = this._getTileOffset(tileX, tileY);
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
};