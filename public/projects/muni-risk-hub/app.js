document.addEventListener('DOMContentLoaded', async () => {
    const mapElement = document.getElementById('map-container');
    const metricBtns = document.querySelectorAll('.metric-btn');
    
    // UI References
    const countyNameEl = document.getElementById('county-name');
    const metricValueEl = document.getElementById('metric-value');
    const selectionCardTitle = document.querySelector('#selection-card .card-title');
    const sectorSelect = document.getElementById('sector-select');
    const horizonSelect = document.getElementById('horizon-select');
    const timeSlider = document.getElementById('time-slider');
    const quarterLabel = document.getElementById('current-quarter');
    const outlierAnchor = document.getElementById('outlier-anchor');

    let currentMetric = 'min';
    let currentSector = 'all';
    let currentHorizon = 'modern';
    let currentLayer = 'county';
    let geojsonData = null;
    let allCube = {}; 
    let stateCube = {};
    let femaData = {};
    let currentData = [];
    let cubeMap = new Map();

    async function init() {
        console.log("Initializing National Risk Hub v4 (Annualized CAGR Baseline)...");
        
        try {
            const [geoResponse, cubeResponse, stateCubeResponse, macroResponse, femaResponse] = await Promise.all([
                fetch('counties.json'),
                fetch('muni_cube_v4.json'),
                fetch('muni_state_cube_v4.json'),
                fetch('macro_issuance.json'),
                fetch('fema_risk_cube.json')
            ]);

            geojsonData = await geoResponse.json();
            allCube = await cubeResponse.json();
            stateCube = await stateCubeResponse.json();
            const macroData = await macroResponse.json();
            femaData = await femaResponse.json();
            
            renderFemaMap();
            renderMacroCharts(macroData);
            
            // Default to Full Archive (2005+) for maximum density & annualized analysis
            updateHorizon('archive');
            if (horizonSelect) horizonSelect.value = 'archive';
            
            setupListeners();
        } catch (err) {
            console.error("Failed to load dashboard data:", err);
            if (countyNameEl) countyNameEl.innerText = "Error Loading Data";
        }
    }

    function updateHorizon(horizon) {
        currentHorizon = horizon;
        currentSector = 'all'; 
        if (sectorSelect) sectorSelect.value = 'all';
        refreshLayerData();
    }

    function updateSector(sector) {
        currentSector = sector;
        refreshLayerData();
    }
    
    function refreshLayerData() {
        let activeCube = currentLayer === 'county' ? allCube : stateCube;
        if (currentSector === 'all') {
            currentData = activeCube.views[currentHorizon]?.data || [];
        } else {
            currentData = activeCube.sectors && activeCube.sectors[currentSector] ? activeCube.sectors[currentSector] : [];
        }
        refreshMapData();
    }

    function refreshMapData() {
        cubeMap.clear();
        currentData.forEach(item => cubeMap.set(item.fips, item));
        
        // Update Intelligence Badge
        const badgeText = document.getElementById('badge-text');
        if (badgeText) {
            const bondCount = currentData.reduce((acc, d) => acc + (d.count || 0), 0);
            const entityType = currentLayer === 'county' ? 'Counties' : 'States';
            badgeText.innerText = `Analyzing ${bondCount.toLocaleString()} ${currentSector} Bonds | ${currentData.length} ${entityType}`;
        }

        renderMap();
    }

    // Premium Color Scales
    const customDivergent = [
        [0, '#b91c1c'],    // Deep Red (Worst negative returns)
        [0.2, '#ef4444'],  // Red
        [0.45, '#fef08a'], // Yellow/Neutral 
        [0.6, '#4ade80'],  // Light Green
        [1, '#15803d']     // Deep Green (Highest positive returns)
    ];

    const scales = {
        mean: customDivergent,
        median: customDivergent,
        min: customDivergent, 
        max: customDivergent,
        count: 'Greens'
    };

    const metricLabels = {
        mean: "Avg Annualized Return",
        median: "Median Annualized Return",
        min: "Worst Bond (Ann.)",
        max: "Best Recovery (Ann.)",
        count: "Total Bond Series"
    };

    function renderMap() {
        if (!currentData.length) return;

        const locations = currentData.map(d => d.fips);
        const z = currentData.map(d => d[currentMetric]);
        
        // Enhance tooltip for national scope
        const texts = currentData.map(d => {
            let detail = "";
            if (currentMetric === 'min') detail = `<br>Worst Bond (Ann.): ${d.worst_description}<br>Return: ${d.worst_drawdown.toFixed(2)}% Ann.`;
            else if (currentMetric === 'max') detail = `<br>Best Bond (Ann.): ${d.best_description}<br>Return: +${d.best_drawdown.toFixed(2)}% Ann.`;
            else detail = `<br>Bonds Tracked: ${d.count}<br>Avg Annualized: ${d.mean.toFixed(2)}%`;
            
            return `<b>${d.county_name}</b>${detail}`;
        });

        const trace = {
            type: 'choropleth',
            locationmode: currentLayer === 'county' ? 'geojson-id' : 'USA-states',
            locations: locations,
            z: z,
            text: texts,
            hoverinfo: 'text+z',
            colorscale: scales[currentMetric],
            marker: { line: { width: 0.2, color: 'rgba(255,255,255,0.2)' } },
            colorbar: {
                thickness: 15,
                len: 0.5,
                x: 0,
                xanchor: 'left',
                y: 0.5,
                tickfont: { color: '#94a3b8' },
                title: { 
                    text: currentMetric === 'count' ? 'Bonds' : '% Return', 
                    font: { color: '#94a3b8', size: 10 } 
                }
            }
        };

        if (currentLayer === 'county') {
            trace.geojson = geojsonData;
        }

        const layout = {
            title: { 
                text: "Municipal Financial Yields", 
                font: { color: '#94a3b8', size: 14 },
                y: 0.82,
                yanchor: 'top'
            },
            geo: {
                scope: 'usa',
                projection: { 
                    type: 'albers usa',
                    scale: 1.2
                },
                showlakes: true,
                lakecolor: 'rgb(15, 23, 42)',
                bgcolor: 'rgba(0,0,0,0)',
                showland: true,
                landcolor: '#9ca3af',
                showsubunits: true,
                subunitcolor: '#000000',
                subunitwidth: 1
            },
            margin: { l: 0, r: 0, t: 5, b: 0 },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)'
        };

        const config = { responsive: true, displayModeBar: false };

        // State border overlay trace rendered ON TOP of county fill
        const stateOverlay = {
            type: 'choropleth',
            locationmode: 'USA-states',
            locations: ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'],
            z: new Array(50).fill(0),
            showscale: false,
            colorscale: [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0)']],
            marker: { line: { color: '#000000', width: 1.5 } },
            hoverinfo: 'skip'
        };

        Plotly.newPlot(mapElement, [trace, stateOverlay], layout, config);

        // Map Interaction Listeners
        mapElement.on('plotly_hover', data => {
            const fips = data.points[0].location;
            updateSidebar(fips);
        });
    }

    function updateSidebar(fips) {
        const data = cubeMap.get(fips);
        if (!data || !countyNameEl) return;

        countyNameEl.innerText = data.county_name;
        if (metricValueEl) metricValueEl.innerText = `${data[currentMetric].toFixed(2)}% Ann.`;
        if (selectionCardTitle) selectionCardTitle.innerText = `Selected: FIPS ${fips}`;

        // Update Signal/Outlier based on metric context
        if (!outlierAnchor) return;
        let signalHtml = '';
        if (currentMetric === 'min') {
            signalHtml = `
                <div class="card-detail" style="color: #fca5a5; font-weight: 500;">CRITICAL DISTRESS SIGNAL</div>
                <div class="card-detail"><b>Worst Performer (Ann.):</b><br>${data.worst_description}</div>
                <div class="card-detail"><b>Retrun:</b> ${data.worst_drawdown.toFixed(2)}% Annualized</div>
            `;
        } else if (currentMetric === 'max') {
             signalHtml = `
                <div class="card-detail" style="color: #6ee7b7; font-weight: 500;">HIGH-YIELD OUTLIER</div>
                <div class="card-detail"><b>Top Performer (Ann.):</b><br>${data.best_description}</div>
                <div class="card-detail"><b>Return:</b> +${data.best_drawdown.toFixed(2)}% Annualized</div>
            `;
        } else {
            signalHtml = `
                <div class="card-detail"><b>Volume:</b> ${data.count} bonds analyzed in this county.</div>
                <div class="card-detail"><b>Avg Annualized:</b> ${data.mean.toFixed(2)}%</div>
                <div class="card-detail"><b>Med Annualized:</b> ${data.median.toFixed(2)}%</div>
            `;
        }
        outlierAnchor.innerHTML = signalHtml;
    }

    function setupListeners() {
        const layerBtns = document.querySelectorAll('.layer-btn');
        layerBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                layerBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                currentLayer = btn.dataset.layer;
                refreshLayerData();
            });
        });

        metricBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                metricBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                currentMetric = btn.dataset.metric;
                renderMap(); // Just re-render everything
            });
        });

        if (sectorSelect) {
            sectorSelect.addEventListener('change', (e) => {
                updateSector(e.target.value);
            });
        }

        if (horizonSelect) {
            horizonSelect.addEventListener('change', (e) => {
                updateHorizon(e.target.value);
            });
        }
    }

    function renderMacroCharts(data) {
        if (!document.getElementById('chart-issuance-count')) return;

        // Compute yearly tick positions (one per year, at Q1)
        const yearlyTicks = data.quarters
            .filter(q => q.endsWith('-Q1'))
            .map(q => ({ val: q, text: q.split('-')[0] }));

        const xaxisConfig = {
            gridcolor: '#1e293b',
            tickangle: -45,
            tickvals: yearlyTicks.map(t => t.val),
            ticktext: yearlyTicks.map(t => t.text)
        };

        const layoutBase = {
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#94a3b8' },
            margin: { l: 60, r: 20, t: 30, b: 40 },
            xaxis: xaxisConfig,
            yaxis: { gridcolor: '#1e293b' },
            showlegend: false
        };

        // Chart 1: Issuance Count
        const traceCount = {
            x: data.quarters,
            y: data.issuance_count,
            type: 'scatter',
            mode: 'lines+markers',
            line: { color: '#38bdf8', width: 2 },
            marker: { size: 4 }
        };
        const layoutCount = { ...layoutBase, title: { text: 'Number of Bond Issuances (U.S.)', font: { color: '#e2e8f0', size: 14 } } };
        
        // Chart 2: Issuance Value
        const traceValue = {
            x: data.quarters,
            y: data.issuance_value,
            type: 'scatter',
            mode: 'lines+markers',
            line: { color: '#fbbf24', width: 2 },
            marker: { size: 4 }
        };
        const layoutValue = { ...layoutBase, title: { text: 'Total Trade Volume at Issuance ($)', font: { color: '#e2e8f0', size: 14 } } };

        Plotly.newPlot('chart-issuance-count', [traceCount], layoutCount, { responsive: true, displayModeBar: false });
        Plotly.newPlot('chart-issuance-value', [traceValue], layoutValue, { responsive: true, displayModeBar: false });
    }

    function renderFemaMap() {
        if (!document.getElementById('fema-map-container')) return;

        const locations = femaData.data.map(d => d.fips);
        const z = femaData.data.map(d => d.physical_risk);
        const texts = femaData.data.map(d => `<b>FIPS: ${d.fips}</b><br>Hazard Domain: ${d.hazard_dominant}<br>Risk Score: ${d.physical_risk.toFixed(1)}/100`);

        const trace = {
            type: 'choropleth',
            locationmode: 'geojson-id',
            geojson: geojsonData,
            locations: locations,
            z: z,
            text: texts,
            hoverinfo: 'text',
            colorscale: [
                [0, '#15803d'],
                [0.5, '#fbbf24'],
                [1.0, '#b91c1c']
            ],
            marker: { line: { width: 0.2, color: 'rgba(255,255,255,0.2)' } },
            colorbar: {
                thickness: 10,
                len: 0.5,
                x: 0,
                xanchor: 'left',
                y: 0.5,
                tickfont: { color: '#94a3b8' },
                title: { text: 'FEMA NRI', font: { color: '#94a3b8', size: 10 } }
            }
        };

        const layout = {
            title: { 
                text: "FEMA Physical Risk Index", 
                font: { color: '#94a3b8', size: 14 },
                y: 0.82,
                yanchor: 'top'
            },
            geo: {
                scope: 'usa',
                projection: { 
                    type: 'albers usa',
                    scale: 1.2
                },
                showlakes: true,
                lakecolor: 'rgb(15, 23, 42)',
                bgcolor: 'rgba(0,0,0,0)',
                showland: true,
                landcolor: '#9ca3af',
                showsubunits: true,
                subunitcolor: '#000000',
                subunitwidth: 1
            },
            margin: { l: 0, r: 0, t: 5, b: 0 },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)'
        };

        // State border overlay trace rendered ON TOP of county fill
        const stateOverlay = {
            type: 'choropleth',
            locationmode: 'USA-states',
            locations: ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'],
            z: new Array(50).fill(0),
            showscale: false,
            colorscale: [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0)']],
            marker: { line: { color: '#000000', width: 1.5 } },
            hoverinfo: 'skip'
        };

        Plotly.newPlot('fema-map-container', [trace, stateOverlay], layout, { responsive: true, displayModeBar: false });
    }

    init();
});
