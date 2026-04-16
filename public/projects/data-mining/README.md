# science_and_conspiracy

This project tracks attention to technical scientific terms, economics concepts, and conspiracy / pseudoscience topics using:

- English Wikipedia pageviews
- Google Trends search interest

The goal is to compare how these three knowledge ecosystems move over time.

## Buckets

### Science

- `CRISPR gene editing`
- `Polymerase chain reaction`
- `Quantum entanglement`
- `Plate tectonics`
- `Epigenetics`
- `Phylogenetics`
- `Spectroscopy`
- `Dark matter`

### Economics

- `Comparative advantage`
- `Elasticity (economics)`
- `Nash equilibrium`
- `Quantitative easing`
- `Pareto efficiency`
- `Externality`
- `Marginal utility`
- `Purchasing power parity`

### Conspiracy / Pseudoscience

- `QAnon`
- `Chemtrail conspiracy theory`
- `Flat Earth`
- `Homeopathy`
- `Astrology`
- `Ancient astronauts`
- `Great Replacement`
- `Reptilian conspiracy theory`

## Pipeline

1. `scripts/fetch_data.py`
   Pulls Wikipedia pageviews, Google Trends interest, and total English Wikipedia views.

2. `scripts/build_dashboard_data.py`
   Builds bucket and topic time series for the dashboard.

## Output

- `data/processed/wikipedia_pageviews_monthly.csv`
- `data/processed/google_trends_monthly.csv`
- `data/processed/en_wikipedia_total_views_monthly.csv`
- `data/processed/dashboard_data.json`

## Notes

- Wikipedia can be shown as a share of total English Wikipedia views.
- Google Trends is normalized search interest, not a true share of all searches.
- The merged series is an aligned index that averages normalized Wikipedia and Google attention where both exist.
