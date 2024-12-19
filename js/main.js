import { Sigma } from 'https://cdn.jsdelivr.net/npm/sigma@3.0.0/+esm';
import { Graph } from 'https://cdn.jsdelivr.net/npm/graphology@0.25.4/+esm';
var $GP;

// Create an empty graph using Graphology
let graph = new Graph();
let container = document.getElementById('sigma-canvas');

// Initialize Sigma instance using the new constructor
const sigmaInstance = new Sigma(graph, container, {
    settings: {
        labelFont: 'Arial',
        labelSize: 14,
        defaultEdgeType: 'curve'
    }
});

// Load config.json and fetch the associated data.json file
jQuery.getJSON(GetQueryStringParams("config", "config.json"), function (config) {
    console.log("Loaded config:", config);

    // Check if the config has a valid data path
    if (config && config.data) {
        // Now, load the graph data from the specified file (data.json)
        jQuery.getJSON(config.data, function (data) {
            // If the data.json is successfully loaded, proceed with setting up the graph
            setupGraph(data);
            setupGUI(config);
        }).fail(function () {
            alert("Failed to load data.json");
        });
    } else {
        alert("Invalid configuration: missing data file path.");
    }
});

// Function to setup the graph
function setupGraph(data) {
    if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
        console.error("Invalid graph data: missing nodes or edges.");
        return;
    }

    data.nodes.forEach(node => {
        graph.addNode(node.id, {
            label: node.label,
            x: node.x,
            y: node.y,
            size: node.size / 4,
            color: node.color || '#000',
            shape: node.shape || 'dot'
        });
    });

    data.edges.forEach(edge => {
        graph.addEdge(edge.source, edge.target, {
            color: edge.color || '#000',
            size: edge.size || 1,
            type: edge.type
        });
    });

    sigmaInstance.refresh();
    setupEvents(); // Set up events like click and hover for node
}

function highlightNode(nodeId) {
    console.log(`Highlighting node: ${nodeId}`);
    const node = sigmaInstance.graph.nodes(nodeId);
    if (node) {
        node.color = 'red'; // Example of color change, can be customized
        sigmaInstance.refresh();
    }
}

// Function to reset node highlight
function resetNodeHighlight(nodeId) {
    console.log(`Resetting highlight for node: ${nodeId}`);
    const node = sigmaInstance.graph.nodes(nodeId);
    if (node) {
        node.color = 'blue'; // Reset to original color
        sigmaInstance.refresh();
    }
}

// Function to open node details
function openNodeDetails(nodeId) {
    console.log(`Opening details for node: ${nodeId}`);
    // Add logic to open details (e.g., open modal, update UI, etc.)
}

// Function to handle zoom on node
function handleNodeZoom(nodeId, zoomLevel) {
    console.log(`Zooming on node: ${nodeId} with zoom level: ${zoomLevel}`);
    // Add zooming logic here (e.g., adjust node size, camera zoom, etc.)
}

// Function to highlight an edge
function highlightEdge(edgeId) {
    console.log(`Highlighting edge: ${edgeId}`);
    const edge = sigmaInstance.graph.edges(edgeId);
    if (edge) {
        edge.color = 'green'; // Example of color change for edge
        sigmaInstance.refresh();
    }
}

// Function to reset edge highlight
function resetEdgeHighlight(edgeId) {
    console.log(`Resetting highlight for edge: ${edgeId}`);
    const edge = sigmaInstance.graph.edges(edgeId);
    if (edge) {
        edge.color = 'gray'; // Reset to original color
        sigmaInstance.refresh();
    }
}

// Function to open edge details
function openEdgeDetails(edgeId) {
    console.log(`Opening details for edge: ${edgeId}`);
    // Add logic to open edge details (e.g., display edge info)
}

// Function to handle zoom on edge
function handleEdgeZoom(edgeId, zoomLevel) {
    console.log(`Zooming on edge: ${edgeId} with zoom level: ${zoomLevel}`);
    // Add zoom logic for edges (if needed)
}

// Function to reset all highlights (on stage click)
function resetAllHighlights() {
    console.log('Resetting all highlights');
    sigmaInstance.graph.nodes().forEach(node => {
        node.color = 'blue'; // Reset all nodes to default color
    });
    sigmaInstance.graph.edges().forEach(edge => {
        edge.color = 'gray'; // Reset all edges to default color
    });
    sigmaInstance.refresh();
}

// Function to handle stage zoom (on stage wheel)
function handleStageZoom(zoomLevel) {
    console.log(`Handling zoom on stage with level: ${zoomLevel}`);
    // Add logic for overall stage zoom (e.g., zoom camera)
    const camera = sigmaInstance.camera;
    const currentZoom = camera.ratio;
    camera.ratio = currentZoom - zoomLevel * 0.05; // Adjust the zoom ratio
    sigmaInstance.refresh();
}


function setupEvents() {
    // Node click event
// Handling click on node
    sigmaInstance.on('clickNode', ({ node, originalEvent }) => {
        if (node && node.id) {
            const nodeId = node.id;
            // Open node details
            openNodeDetails(nodeId);
        }
    });

// Handling enter on node (e.g., highlighting it)
    sigmaInstance.on('enterNode', ({ node }) => {
        if (node && node.id) {
            // Highlight the node
            highlightNode(node.id);
        }
    });

// Handling leave on node (e.g., resetting highlight)
    sigmaInstance.on('leaveNode', ({ node }) => {
        if (node && node.id) {
            // Reset highlight on node
            resetNodeHighlight(node.id);
        }
    });

// Handling wheel event on node (e.g., zoom or pan)
    sigmaInstance.on('wheelNode', ({ node, originalEvent }) => {
        if (node && node.id) {
            const zoomLevel = originalEvent.deltaY;
            // Handle zoom for the specific node
            handleNodeZoom(node.id, zoomLevel);
        }
    });

// Edge Event Handling

// Handling click on edge
    sigmaInstance.on('clickEdge', ({ edge, originalEvent }) => {
        if (edge && edge.id) {
            const edgeId = edge.id;
            // Open edge details
            openEdgeDetails(edgeId);
        }
    });

// Handling enter on edge (e.g., highlighting it)
    sigmaInstance.on('enterEdge', ({ edge }) => {
        if (edge && edge.id) {
            // Highlight the edge
            highlightEdge(edge.id);
        }
    });

// Handling leave on edge (e.g., resetting highlight)
    sigmaInstance.on('leaveEdge', ({ edge }) => {
        if (edge && edge.id) {
            // Reset highlight on edge
            resetEdgeHighlight(edge.id);
        }
    });

// Handling wheel event on edge (e.g., zoom or pan)
    sigmaInstance.on('wheelEdge', ({ edge, originalEvent }) => {
        if (edge && edge.id) {
            const zoomLevel = originalEvent.deltaY;
            // Handle zoom for the specific edge
            handleEdgeZoom(edge.id, zoomLevel);
        }
    });

}


function nodeNormal() {
    console.log("Resetting to normal state");
    // Add your logic here for resetting state, closing modals, etc.
    $GP.info.hide();  // Hide the info pane as an example
    $GP.intro.show(); // Show the intro pane
}

function setupGUI(config) {
    // Initialise main interface elements
    let logo = "";
    if (config.logo && config.logo.file) {
        logo = `<img src="${config.logo.file}" alt="${config.logo.text || ''}">`;
    } else if (config.logo && config.logo.text) {
        logo = `<h1>${config.logo.text}</h1>`;
    }
    if (config.logo && config.logo.link) {
        logo = `<a href="${config.logo.link}">${logo}</a>`;
    }
    $("#maintitle").html(logo);

    // Set title
    $("#title").html(`<h2>${config.text.title}</h2>`);
    $("#titletext").html(config.text.intro);

    // Configure other parts of the interface based on the features in config
    $GP = {
        calculating: false,
        showgroup: false
    };
    $GP.intro = $("#intro");
    $GP.minifier = $GP.intro.find("#minifier");
    $GP.mini = $("#minify");
    $GP.info = $("#attributepane");
    $GP.info_donnees = $GP.info.find(".nodeattributes");
    $GP.info_name = $GP.info.find(".name");
    $GP.info_link = $GP.info.find(".link");
    $GP.info_data = $GP.info.find(".data");
    $GP.info_close = $GP.info.find(".returntext");
    $GP.info_close2 = $GP.info.find(".close");
    $GP.info_p = $GP.info.find(".p");

    // Ensure nodeNormal is properly bound to the click event
    $GP.info_close.click(nodeNormal);
    $GP.info_close2.click(nodeNormal);

    $GP.form = $("#mainpanel").find("form");
    $GP.search = $GP.form.find("#search");

    if (!config.features.groupSelectorAttribute) {
        $("#attributeselect").hide();
    }

    $GP.cluster = $GP.form.find("#attributeselect");
    config.GP = $GP;
}

// Utility function to get query string parameters
function GetQueryStringParams(param, defaultVal) {
    let url = window.location.href;
    let regex = new RegExp('[?&]' + param + '=([^&]*)', 'i');
    let result = regex.exec(url);
    return result === null ? defaultVal : decodeURIComponent(result[1]);
}
