"""
CrossRef Academic Paper Fetcher
Fetches yearly academic publication counts per topic using the CrossRef API facets.
No API key required. One request per topic.
"""
import csv
import json
import time
import urllib.parse
import urllib.request
import ssl
import os
import certifi
import subprocess
from pathlib import Path

os.environ['SSL_CERT_FILE'] = certifi.where()
ssl_context = ssl.create_default_context(cafile=certifi.where())

ROOT = Path("/Users/craig/projects/website_projects/science_and_conspiracy")
PROCESSED = ROOT / "data" / "processed"

BUCKETS = {
    # 1. Natural Sciences
    "sci_bio": ["CRISPR gene editing", "Polymerase chain reaction", "mRNA vaccine", "Gene therapy", "Epigenetics", "Phylogenetics", "Natural selection", "Biodiversity", "Stem cell", "Immunotherapy"],
    "sci_phys": ["Quantum entanglement", "Quantum superposition", "Dark matter", "General relativity", "Spectroscopy", "Black hole", "Big Bang", "String theory", "Standard Model", "Dark energy"],
    "sci_chem": ["Catalysis", "Supramolecular chemistry", "Graphene", "Green chemistry", "Stoichiometry", "Crystallography", "Polymer", "Cheminformatics", "Enzyme", "Isotope"],
    "sci_psych": ["Cognitive dissonance", "Behaviorism", "Neuroplasticity", "Attachment theory", "Psychometrics", "Psychoanalysis", "Classical conditioning", "Placebo", "Myers-Briggs Type Indicator", "Operant conditioning"],
    "sci_math": ["Chaos theory", "Fractal", "Topology", "Prime number theorem", "Game theory", "Riemann hypothesis", "Set theory", "Calculus", "Linear algebra", "Bayesian inference"],
    "sci_earth": ["Plate tectonics", "Greenhouse effect", "Ocean acidification", "Climate change", "Geomorphology", "Meteorology", "Paleontology", "Seismology", "Anthropocene", "Ozone depletion"],

    # 2. Economics
    "eco_macro": ["Quantitative easing", "Purchasing power parity", "Inflation", "Fiscal policy", "Modern Monetary Theory", "Gross domestic product", "Monetary policy", "Keynesian economics", "Supply-side economics", "Interest rate"],
    "eco_micro": ["Elasticity (economics)", "Marginal utility", "Externality", "Prospect theory", "Pareto efficiency", "Opportunity cost", "Supply and demand", "Monopoly", "Oligopoly"],
    "eco_theory": ["Nash equilibrium", "Comparative advantage", "Effective demand", "Endogenous money", "Transaction cost", "Property rights", "Neoclassical economics", "Austrian School", "Marxian economics", "Behavioral economics"],

    # 3. History
    "hist_econ": ["Industrial Revolution", "Great Depression", "Silk Road", "Dutch East India Company", "Roaring Twenties", "Tulip mania", "Bretton Woods system", "Feudalism", "Mercantilism", "Gold standard"],
    "hist_geo": ["Cold War", "French Revolution", "Pax Romana", "Renaissance", "British Empire", "World War I", "World War II", "Roman Empire", "Mongol Empire", "Byzantine Empire"],
    "hist_theory": ["Historical materialism", "Great Man theory", "Historiography", "Postmodernism", "Marxist historiography", "Whig history", "Annales school", "Orientalism", "Revisionism (history)", "Feminist history"],

    # 4. Political Science
    "pol_ir": ["Realism (international relations)", "Liberalism (international relations)", "Constructivism (international relations)", "Hegemony", "Globalization", "Soft power", "Geopolitics", "Deterrence theory", "Neoconservatism", "Neoliberalism (international relations)"],
    "pol_theory": ["Social contract", "Separation of powers", "Totalitarianism", "Democracy", "Communitarianism", "Libertarianism", "Egalitarianism", "Utilitarianism", "Fascism", "Anarchism"],
    "pol_comp": ["Democratization", "Parliamentary system", "Authoritarianism", "Presidential system", "Proportional representation", "Electoral College (United States)", "Gerrymandering", "Federalism", "Populism", "Kleptocracy"],

    # 5. Conspiracy & Pseudoscience
    "con_mod": ["QAnon", "Great Replacement", "Deep state", "New World Order", "Stop the Steal", "Pizzagate conspiracy theory", "15-minute city", "Adrenochrome", "Dead Internet theory", "Agenda 21"],
    "con_tech": ["Chemtrail conspiracy theory", "5G conspiracy theory", "HAARP", "Vaccine hesitancy", "Havana syndrome", "Project Blue Beam", "RFID", "Targeted individual", "Microchip implant (human)"],
    "con_classic": ["Ancient astronauts", "Astrology", "Flat Earth", "Homeopathy", "Reptilian conspiracy theory", "Anti-vaccinationism", "Illuminati", "Freemasonry", "Moon landing conspiracy theories", "Bermuda Triangle"],

    # 6. Popular Culture
    "pop_film": ["Marvel Cinematic Universe", "Star Wars", "Harry Potter", "Anime", "Film noir", "Romantic comedy", "Horror film", "Science fiction film"],
    "pop_tv": ["Game of Thrones", "Breaking Bad", "Stranger Things", "Reality television", "Sitcom", "True crime", "Soap opera", "Streaming media"],
    "pop_gaming": ["Video game console", "Esports", "Minecraft", "Grand Theft Auto V", "Roblox", "Role-playing video game", "First-person shooter", "Massively multiplayer online role-playing game"],

    # 7. Religion
    "rel_major": ["Christianity", "Islam", "Hinduism", "Buddhism", "Judaism", "Sikhism", "Daoism", "Shinto"],
    "rel_texts": ["Bible", "Quran", "Torah", "Bhagavad Gita", "Tripitaka", "Book of Mormon", "Vedas", "Upanishads"],
    "rel_concepts": ["Karma", "Reincarnation", "Salvation", "Sin", "Atheism", "Agnosticism", "Secularism", "Spirituality"],

    # 8. Sports
    "spo_global": ["Association football", "Basketball", "Cricket", "Tennis", "Golf", "Rugby union", "Volleyball", "Athletics (sport)"],
    "spo_us": ["American football", "Baseball", "Ice hockey", "National Football League", "Major League Baseball", "National Basketball Association", "National Hockey League", "College football"],
    "spo_events": ["Olympic Games", "FIFA World Cup", "Super Bowl", "Tour de France", "Wimbledon Championships", "UEFA Champions League", "Cricket World Cup", "Summer Olympic Games"],

    # 9. Music
    "mus_genres": ["Pop music", "Hip hop music", "Rock music", "Electronic dance music", "Country music", "Jazz", "Classical music", "Rhythm and blues"],
    "mus_tech": ["Synthesizer", "Auto-Tune", "Spotify", "Vinyl record", "Electric guitar", "Drum machine", "Podcast", "Streaming media"],
    "mus_theory": ["Chord progression", "Syncopation", "Polyphony", "Harmony", "Melody", "Time signature", "Scale (music)", "Counterpoint"],
}

CROSSREF_START_YEAR = 2000
CROSSREF_END_YEAR = 2025


def get_completed_topics():
    path = PROCESSED / "crossref_yearly.csv"
    if not path.exists():
        return set()
    completed = set()
    with path.open("r", newline="") as f:
        for row in csv.DictReader(f):
            completed.add(row["topic"])
    return completed


def fetch_crossref_yearly(term: str) -> dict:
    """
    Uses CrossRef facets to get yearly publication counts for a search term.
    Returns dict of {YYYY -> count}.
    """
    params = urllib.parse.urlencode({
        "query": term,
        "facet": "published:*",
        "rows": 0,
        "mailto": "research@scienceconspiracyhub.local",
    })
    url = f"https://api.crossref.org/works?{params}"
    req = urllib.request.Request(url, headers={"User-Agent": "ScienceConspiracyHub/1.0 (research project; mailto:research@local)"})
    with urllib.request.urlopen(req, context=ssl_context, timeout=30) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    facets = data.get("message", {}).get("facets", {})
    year_values = facets.get("published", {}).get("values", {})

    result = {}
    for year_str, count in year_values.items():
        try:
            year = int(year_str)
            if CROSSREF_START_YEAR <= year <= CROSSREF_END_YEAR:
                result[str(year)] = int(count)
        except ValueError:
            continue
    return result


def main():
    csv_path = PROCESSED / "crossref_yearly.csv"
    if not csv_path.exists():
        with csv_path.open("w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=["bucket", "topic", "year", "count"])
            writer.writeheader()

    completed = get_completed_topics()

    for bucket, topics in BUCKETS.items():
        for topic in topics:
            if topic in completed:
                print(f"Skipping {topic} (already done).")
                continue

            print(f"Fetching CrossRef academic data for: {topic}...")
            try:
                yearly = fetch_crossref_yearly(topic)
                if not yearly:
                    print(f"  No CrossRef facet data for {topic}.")
                    time.sleep(3)
                    continue

                with csv_path.open("a", newline="") as f:
                    writer = csv.DictWriter(f, fieldnames=["bucket", "topic", "year", "count"])
                    for year, count in sorted(yearly.items()):
                        writer.writerow({"bucket": bucket, "topic": topic, "year": year, "count": count})

                total = sum(yearly.values())
                print(f"  Done. {len(yearly)} years, {total:,} total papers. Rebuilding...")
                subprocess.run([".venv/bin/python", "scripts/build_dashboard_data.py"], cwd=str(ROOT))
                time.sleep(3)  # Polite delay — CrossRef is generous with limits

            except Exception as e:
                print(f"  Error fetching {topic}: {e}. Retrying in 20s...")
                time.sleep(20)

    print("CROSSREF FETCH COMPLETE!")


if __name__ == "__main__":
    main()
