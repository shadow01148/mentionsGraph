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
            type: edge.type || 'line'
        });
    });

    sigmaInstance.refresh();
    setupEvents(); // Set up events like click and hover for node
}

function setupEvents() {
    // Node click event
    sigmaInstance.on('node:click', (event) => {
        const node = event.node;
        console.log(`Node clicked: ${node.id}`);
        // Handle node click
        alert(`Node clicked: ${node.id}`);
    });

    // Node hover in event
    sigmaInstance.on('node:enter', (event) => {
        const node = event.node;
        console.log(`Node hovered: ${node.id}`);
        // Handle hover behavior
        document.getElementById('tooltip').innerHTML = `Node: ${node.id}`;
    });

    // Node hover out event
    sigmaInstance.on('node:leave', (event) => {
        const node = event.node;
        console.log(`Node hover out: ${node.id}`);
        // Handle hover out behavior
        document.getElementById('tooltip').innerHTML = '';
    });

    // Example of zoom behavior
    sigmaInstance.on('wheel', (event) => {
        const delta = event.deltaY;
        if (delta > 0) {
            sigmaInstance.camera.zoom(0.9);
        } else {
            sigmaInstance.camera.zoom(1.1);
        }
        sigmaInstance.refresh(); // Re-render after zoom
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
