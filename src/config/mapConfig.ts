// Load map configuration and map files
// 1. Load mapConfig.json to get MAP_VERSION
// 2. Load map files from /map/{MAP_VERSION}/ folder
// 3. Parse CSV files dynamically based on headers

interface MapConfig {
  MAP_VERSION: string;
}

// Generic CSV row type (dynamic columns)
type CSVRow = Record<string, string>;

interface MapData {
  nodes: CSVRow[];
  edges: CSVRow[];
  stations: CSVRow[];
}

// Parse CSV text to array of objects
// - Skip lines starting with '#'
// - First non-comment line is header
// - Returns array of objects with header keys
function parseCSV(csvText: string): CSVRow[] {
  const lines = csvText.split("\n").map((line) => line.trim());

  // Filter out comments and empty lines
  const dataLines = lines.filter((line) => line && !line.startsWith("#"));

  if (dataLines.length === 0) {
    return [];
  }

  // First line is header
  const header = dataLines[0].split(",").map((col) => col.trim());

  // Parse data rows
  const rows: CSVRow[] = [];
  for (let i = 1; i < dataLines.length; i++) {
    const values = dataLines[i].split(",").map((val) => val.trim());
    const row: CSVRow = {};

    header.forEach((key, index) => {
      row[key] = values[index] || "";
    });

    rows.push(row);
  }

  return rows;
}

// Default configuration
const defaultMapConfig: MapConfig = {
  MAP_VERSION: "v1",
};

// Cached data
let cachedMapConfig: MapConfig | null = null;
let cachedMapData: MapData | null = null;

// Load map configuration from JSON
async function loadMapConfig(): Promise<MapConfig> {
  if (cachedMapConfig) {
    return cachedMapConfig;
  }

  try {
    const configData: MapConfig = await fetch("/config/mapConfig.json").then(
      (res) => res.json()
    );
    cachedMapConfig = configData;
    console.log(
      "[MapConfig] Loaded mapConfig.json, version:",
      configData.MAP_VERSION
    );
    return cachedMapConfig;
  } catch (error) {
    console.warn(
      "[MapConfig] Failed to load mapConfig.json, using default configuration",
      error
    );
    cachedMapConfig = defaultMapConfig;
    return defaultMapConfig;
  }
}

// Load map files based on MAP_VERSION
async function loadMapFiles(): Promise<MapData> {
  if (cachedMapData) {
    return cachedMapData;
  }

  // Load config first to get MAP_VERSION
  const config = await loadMapConfig();
  const mapVersion = config.MAP_VERSION;

  try {
    const [nodesText, edgesText, stationsText] = await Promise.all([
      fetch(`/map/${mapVersion}/nodes.map`).then((res) => res.text()),
      fetch(`/map/${mapVersion}/edges.map`).then((res) => res.text()),
      fetch(`/map/${mapVersion}/stations.map`).then((res) => res.text()),
    ]);

    // Parse CSV files
    cachedMapData = {
      nodes: parseCSV(nodesText),
      edges: parseCSV(edgesText),
      stations: parseCSV(stationsText),
    };

    console.log(
      `[MapConfig] Loaded and parsed map files from /map/${mapVersion}/`
    );
    console.log(`  - Nodes: ${cachedMapData.nodes.length} rows`);
    console.log(`  - Edges: ${cachedMapData.edges.length} rows`);
    console.log(`  - Stations: ${cachedMapData.stations.length} rows`);
    return cachedMapData;
  } catch (error) {
    console.error(
      `[MapConfig] Failed to load map files from /map/${mapVersion}/`,
      error
    );
    throw error;
  }
}

// Synchronous access (returns null if not loaded yet)
function getMapConfigSync(): MapConfig | null {
  return cachedMapConfig;
}

function getMapDataSync(): MapData | null {
  return cachedMapData;
}

export { loadMapConfig, loadMapFiles, getMapConfigSync, getMapDataSync };
export type { MapConfig, MapData, CSVRow };
