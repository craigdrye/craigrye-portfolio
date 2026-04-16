"""
GDELT News Volume Fetcher
Fetches monthly news article mention counts from the GDELT 2.0 Doc API.
No API key required. One request per topic, aggregates to monthly bins.
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
from collections import defaultdict

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


def update_status(status: str, message: str = "", progress: int = 0):
    path = PROCESSED / "status.json"
    data = {}
    if path.exists():
        try:
            data = json.loads(path.read_text())
        except:
            pass
    
    data["gdelt"] = {
        "status": status,
        "message": message,
        "progress": progress,
        "last_updated": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    path.write_text(json.dumps(data, indent=2))

def get_completed_topics():
    path = PROCESSED / "gdelt_monthly.csv"
    if not path.exists():
        return set()
    completed = set()
    with path.open("r", newline="") as f:
        for row in csv.DictReader(f):
            completed.add(row["topic"])
    return completed


def fetch_gdelt_timeline(term: str) -> dict:
    """
    Single request per term using timelinevolnorm mode which returns a clean
    monthly-resolution timeline without the massive data volume.
    """
    monthly = defaultdict(float)
    
    params = urllib.parse.urlencode({
        "query": f'"{term}"',
        "mode": "timelinevolnorm",  # normalized volume, more compact response
        "format": "json",
        "startdatetime": "20040101000000",
        "enddatetime": "20260228235959",
        "timelinesmooth": "30",  # 30-day smoothing = monthly resolution
    })
    url = f"https://api.gdeltproject.org/api/v2/doc/doc?{params}"
    req = urllib.request.Request(url, headers={"User-Agent": "ScienceConspiracyHub/1.0"})
    
    with urllib.request.urlopen(req, context=ssl_context, timeout=60) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    
    timeline = data.get("timeline", [])
    if not timeline:
        return {}
    for item in timeline[0].get("data", []):
        date_str = item.get("date", "")
        if len(date_str) >= 6:
            month_key = date_str[:6]
            monthly[month_key] += item.get("value", 0.0)
    
    return dict(monthly)


def main():
    csv_path = PROCESSED / "gdelt_monthly.csv"
    if not csv_path.exists():
        with csv_path.open("w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=["bucket", "topic", "month", "volume"])
            writer.writeheader()

    completed = get_completed_topics()

    # Flatten topics to allow for easier random shuffling or just steady progress
    all_tasks = []
    for bucket, topics in BUCKETS.items():
        for topic in topics:
            if topic not in completed:
                all_tasks.append((bucket, topic))

    print(f"GDELT Recovery: {len(all_tasks)} topics remaining.")
    update_status("idle", f"{len(all_tasks)} topics left", 100 - len(all_tasks))

    for bucket, topic in all_tasks:
        print(f"\n[{time.strftime('%H:%M:%S')}] Fetching: {topic}...")
        update_status("live", f"Fetching {topic}...", 100 - len(all_tasks))
        
        while True:
            try:
                monthly = fetch_gdelt_timeline(topic)
                if not monthly:
                    print(f"  No data returned for {topic}. Skipping.")
                    break

                with csv_path.open("a", newline="") as f:
                    writer = csv.DictWriter(f, fieldnames=["bucket", "topic", "month", "volume"])
                    for month, volume in sorted(monthly.items()):
                        writer.writerow({"bucket": bucket, "topic": topic, "month": month, "volume": round(volume, 4)})

                print(f"  Success. {len(monthly)} months stored. Rebuilding dashboard...")
                subprocess.run([".venv/bin/python", "scripts/build_dashboard_data.py"], cwd=str(ROOT))
                
                delay = 90
                print(f"  Waiting {delay}s to respect GDELT Doc API limits...")
                time.sleep(delay)
                break

            except Exception as e:
                err_str = str(e).lower()
                # 429, Too Many, Timeout, or JSON decode errors (WAF block) trigger the Deep Chill
                if "429" in err_str or "too many" in err_str or "timeout" in err_str or "expecting value" in err_str:
                    wait_hours = 1
                    print(f"  CRITICAL LIMIT/BLOCK: {e}")
                    print(f"  Entering 'Deep Chill' (1-hour sleep) at {time.strftime('%H:%M:%S')} to recover IP reputation...")
                    update_status("chilling", f"Paused (Rate Limit): {e}", 100 - len(all_tasks))
                    time.sleep(3600)
                    print(f"  Deep Chill finished. Retrying {topic}...")
                else:
                    print(f"  Unexpected Error: {e}. Waiting 60s before retry...")
                    update_status("error", f"Retry in 60s: {e}", 100 - len(all_tasks))
                    time.sleep(60)

    print("\nGDELT FETCH COMPLETE!")
    update_status("complete", "All topics finished", 100)

if __name__ == "__main__":
    main()
