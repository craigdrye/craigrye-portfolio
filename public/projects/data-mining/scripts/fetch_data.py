import csv
import json
import time
import urllib.parse
import urllib.request
import ssl
import certifi
import os
from pathlib import Path

# Fix for macOS SSL certificate verification
os.environ['SSL_CERT_FILE'] = certifi.where()
ssl_context = ssl.create_default_context(cafile=certifi.where())

from pytrends import exceptions as pytrends_exceptions
from pytrends.request import TrendReq


ROOT = Path("/Users/craig/projects/website_projects/science_and_conspiracy")
RAW = ROOT / "data" / "raw"
PROCESSED = ROOT / "data" / "processed"

WIKI_START = "2015070100"
WIKI_END = "2026022800"
GOOGLE_START_MONTH = "200401"

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


def normalize_title(title: str) -> str:
    return title.replace(" ", "_")


def file_slug(title: str) -> str:
    return (
        title.replace(" ", "_")
        .replace("/", "_")
        .replace(":", "_")
    )


def request_json(url: str) -> dict:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "science_and_conspiracy/1.0 (local research project)"},
    )
    with urllib.request.urlopen(request, context=ssl_context) as response:
        return json.loads(response.read().decode("utf-8"))


def fetch_pageviews(title: str) -> dict:
    article = urllib.parse.quote(normalize_title(title), safe="()_")
    url = (
        "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/"
        f"en.wikipedia.org/all-access/user/{article}/monthly/{WIKI_START}/{WIKI_END}"
    )
    return request_json(url)


def fetch_total_project_views() -> dict:
    url = (
        "https://wikimedia.org/api/rest_v1/metrics/pageviews/aggregate/"
        f"en.wikipedia.org/all-access/user/monthly/{WIKI_START}/{WIKI_END}"
    )
    return request_json(url)


def fetch_google_interest(term: str, geo: str = "") -> list[dict]:
    delays = [0, 25, 90, 180]
    for attempt, delay in enumerate(delays, start=1):
        if delay:
            time.sleep(delay)
        try:
            pytrend = TrendReq(hl="en-US", tz=360)
            pytrend.build_payload([term], timeframe="2004-01-01 2026-02-28", geo=geo)
            df = pytrend.interest_over_time()
            if df.empty:
                return []
            if "isPartial" in df.columns:
                df = df.drop(columns=["isPartial"])
            rows = []
            for index, row in df.iterrows():
                rows.append(
                    {
                        "month": index.strftime("%Y%m"),
                        "interest": int(row[term]),
                    }
                )
            return rows
        except pytrends_exceptions.TooManyRequestsError:
            if attempt == len(delays):
                raise
    return []


def load_existing_google_rows() -> list[dict]:
    path = PROCESSED / "google_trends_monthly.csv"
    if not path.exists():
        return []
    with path.open(newline="") as f:
        rows = list(csv.DictReader(f))
    months = {row["month"] for row in rows}
    if GOOGLE_START_MONTH not in months:
        return []
    return rows


def write_raw_payload(bucket: str, title: str, payload: dict) -> None:
    slug = file_slug(title)
    (RAW / f"{bucket}__{slug}.json").write_text(json.dumps(payload, indent=2))


def write_total_views_payload(payload: dict) -> None:
    (RAW / "en_wikipedia_total_views.json").write_text(json.dumps(payload, indent=2))


def write_long_csv(rows: list[dict]) -> None:
    path = PROCESSED / "wikipedia_pageviews_monthly.csv"
    with path.open("w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["bucket", "topic", "month", "views"])
        writer.writeheader()
        writer.writerows(rows)


def write_google_interest_csv(rows: list[dict]) -> None:
    path = PROCESSED / "google_trends_monthly.csv"
    with path.open("w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["bucket", "topic", "month", "interest"])
        writer.writeheader()
        writer.writerows(rows)


def write_topic_manifest() -> None:
    path = PROCESSED / "topic_manifest.csv"
    with path.open("w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["bucket", "topic"])
        for bucket, topics in BUCKETS.items():
            for topic in topics:
                writer.writerow([bucket, topic])


def write_total_views_csv(payload: dict) -> None:
    path = PROCESSED / "en_wikipedia_total_views_monthly.csv"
    with path.open("w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["month", "total_views"])
        for item in payload.get("items", []):
            writer.writerow([item["timestamp"][:6], item["views"]])


def main() -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    PROCESSED.mkdir(parents=True, exist_ok=True)

    rows = []
    google_rows = []
    existing_google_rows = load_existing_google_rows()
    done = {(row["bucket"], row["topic"]) for row in existing_google_rows}
    google_rows.extend(existing_google_rows)

    for bucket, topics in BUCKETS.items():
        for topic in topics:
            slug = file_slug(topic)
            raw_path = RAW / f"{bucket}__{slug}.json"
            
            # Skip if we already have the raw data and Google data
            if raw_path.exists() and (bucket, topic) in done:
                # Still need to load the raw data into rows for the final CSV
                payload = json.loads(raw_path.read_text())
                for item in payload.get("items", []):
                    rows.append({
                        "bucket": bucket,
                        "topic": topic,
                        "month": item["timestamp"][:6],
                        "views": item["views"],
                    })
                continue

            try:
                # 1. Wikipedia (rarely rate-limits)
                print(f"Fetching Wikipedia for: {topic}...")
                payload = fetch_pageviews(topic)
                write_raw_payload(bucket, topic, payload)
                for item in payload.get("items", []):
                    rows.append({
                        "bucket": bucket,
                        "topic": topic,
                        "month": item["timestamp"][:6],
                        "views": item["views"],
                    })
                
                # Write interim Wikipedia CSV so dashboard works immediately
                write_long_csv(rows)
                write_topic_manifest()

                # 2. Google Trends (aggressive 429s)
                if (bucket, topic) not in done:
                    print(f"Fetching Google Trends for: {topic}...")
                    google_interest = fetch_google_interest(topic, geo="")
                    if google_interest:
                        for item in google_interest:
                            google_rows.append({
                                "bucket": bucket,
                                "topic": topic,
                                "month": item["month"],
                                "interest": item["interest"],
                            })
                        write_google_interest_csv(google_rows)
                
                time.sleep(12) # Increased safety gap

            except pytrends_exceptions.TooManyRequestsError:
                print(f"RATE LIMITED on {topic}. Sleeping 60s...")
                time.sleep(60)
            except Exception as e:
                print(f"Error on {topic}: {e}")
                time.sleep(5)

    total_views_payload = fetch_total_project_views()
    write_total_views_payload(total_views_payload)

    write_long_csv(rows)
    write_google_interest_csv(google_rows)
    write_topic_manifest()
    write_total_views_csv(total_views_payload)


if __name__ == "__main__":
    main()
