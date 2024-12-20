import { Sigma } from 'https://cdn.jsdelivr.net/npm/sigma@3.0.0/+esm'
import Graph from 'https://cdn.jsdelivr.net/npm/graphology@0.25.4/+esm';
import EdgeCurveProgram from "https://cdn.jsdelivr.net/npm/@sigma/edge-curve@3.1.0/+esm";


var $GP;

// Create an empty graph using Graphology
let graph = new Graph();
let container = document.getElementById('sigma-canvas');

// Initialize Sigma instance using the new constructor
const renderer = new Sigma(graph, container, {
    minCameraRatio: 0.08,
    maxCameraRatio: 3,
    settings: {
        labelFont: 'Arial',
        labelSize: 14,
        defaultEdgeType: 'curve'
    },
    edgeProgramClasses: {
        curve: EdgeCurveProgram,
    },
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
            type: 'line'
        });
    });

    renderer.refresh();
    setupEvents(); // Set up events like click and hover for node
}

function setupEvents() {
    // Node click event
    renderer.on('node:click', (event) => {
        const node = event.node;
        console.log(`Node clicked: ${node.id}`);

        // Populate the info pane
        $GP.info_name.text(node.label);
        // Add logic to populate other attributes based on your data structure
        $GP.info_data.html(/* ... */);

        // Filter the graph to show only connected nodes
        const neighbors = graph.neighbors(node.id);
        graph.nodes().forEach(nodeId => {
            node.hidden = !neighbors.includes(nodeId);
        });
        renderer.refresh();

        $GP.intro.hide();
        $GP.info.show();
    });

    // Node hover in event
    renderer.on('node:enter', (event) => {
        const node = event.node;
        console.log(`Node hovered: ${node.id}`);
        // Handle hover behavior
        document.getElementById('tooltip').innerHTML = `Node: ${node.id}`;
    });

    // Node hover out event
    renderer.on('node:leave', (event) => {
        const node = event.node;
        console.log(`Node hover out: ${node.id}`);
        // Handle hover out behavior
        document.getElementById('tooltip').innerHTML = '';
    });
    const zoomInButton = document.getElementById('zoomIn');
    const zoomOutButton = document.getElementById('zoomOut');
    const zoomCenterButton = document.getElementById('zoomCenter');

    const camera = renderer.getCamera();

    zoomInButton.addEventListener('click', () => {
        camera.animatedZoom({ duration: 600 });
    });

    zoomOutButton.addEventListener('click', () => {
        camera.animatedUnzoom({ duration: 600 });
    });

    zoomCenterButton.addEventListener('click', () => {
        camera.animatedReset({ duration: 600 });
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

    // Search bar functionality
    $GP.search.on('input', function() {
        const query = $(this).val().toLowerCase();
        graph.nodes().forEach(nodeId => {
            const node = graph.getNodeAttributes(nodeId);
            node.hidden = !node.label.toLowerCase().includes(query);
        });
        renderer.refresh();
    });
}

// Utility function to get query string parameters
function GetQueryStringParams(param, defaultVal) {
    let url = window.location.href;
    let regex = new RegExp('[?&]' + param + '=([^&]*)', 'i');
    let result = regex.exec(url);
    return result === null ? defaultVal : decodeURIComponent(result[1]);
}