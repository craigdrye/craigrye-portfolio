import csv
import json
import statistics
from collections import defaultdict
from pathlib import Path


ROOT = Path("/Users/craig/projects/website_projects/science_and_conspiracy")
PROCESSED = ROOT / "data" / "processed"


def rolling_average(values, window=3):
    output = []
    for index in range(len(values)):
        start = max(0, index - window + 1)
        chunk = [value for value in values[start : index + 1] if value is not None]
        output.append(sum(chunk) / len(chunk) if chunk else None)
    return output


def calculate_anomalies(values, threshold=2.5):
    valid = [v for v in values if v is not None]
    if len(valid) < 5:
        return [0] * len(values)
    mean = statistics.fmean(valid)
    try:
        stdev = statistics.stdev(valid)
    except statistics.StatisticsError:
        stdev = 0
    if stdev == 0:
        return [0] * len(values)
    
    return [1 if v is not None and ((v - mean) / stdev) > threshold else 0 for v in values]


def month_range(start_month, end_month):
    months = []
    year = int(start_month[:4])
    month = int(start_month[4:6])
    end_year = int(end_month[:4])
    end_month_num = int(end_month[4:6])
    while (year, month) <= (end_year, end_month_num):
        months.append(f"{year:04d}{month:02d}")
        month += 1
        if month == 13:
            month = 1
            year += 1
    return months


def mean_or_one(values):
    valid = [value for value in values if value is not None]
    if not valid:
        return 1
    mean_value = statistics.fmean(valid)
    return mean_value if mean_value != 0 else 1


def average_non_null(values):
    valid = [value for value in values if value is not None]
    if not valid:
        return None
    return sum(valid) / len(valid)


def sum_non_null(values):
    valid = [value for value in values if value is not None]
    if not valid:
        return None
    return sum(valid)


def load_monthly_rows():
    rows = []
    with (PROCESSED / "wikipedia_pageviews_monthly.csv").open(newline="") as f:
        for row in csv.DictReader(f):
            rows.append(
                {
                    "bucket": row["bucket"],
                    "topic": row["topic"],
                    "month": row["month"],
                    "views": int(row["views"]),
                }
            )
    return rows


def load_total_views():
    totals = {}
    with (PROCESSED / "en_wikipedia_total_views_monthly.csv").open(newline="") as f:
        for row in csv.DictReader(f):
            totals[row["month"]] = int(row["total_views"])
    return totals


def load_google_rows():
    rows = []
    path = PROCESSED / "google_trends_monthly.csv"
    if not path.exists():
        return []
    with path.open(newline="") as f:
        for row in csv.DictReader(f):
            rows.append(
                {
                    "bucket": row["bucket"],
                    "topic": row["topic"],
                    "month": row["month"],
                    "interest": int(row["interest"]),
                }
            )
    return rows


def load_gdelt_rows():
    rows = []
    path = PROCESSED / "gdelt_monthly.csv"
    if not path.exists():
        return []
    with path.open(newline="") as f:
        for row in csv.DictReader(f):
            rows.append(
                {
                    "bucket": row["bucket"],
                    "topic": row["topic"],
                    "month": row["month"],
                    "volume": float(row["volume"]),
                }
            )
    return rows


def load_crossref_rows():
    """Load CrossRef yearly data and expand each year into 12 monthly rows."""
    rows = []
    path = PROCESSED / "crossref_yearly.csv"
    if not path.exists():
        return []
    with path.open(newline="") as f:
        for row in csv.DictReader(f):
            year = int(row["year"])
            count = int(row["count"])
            monthly_count = count / 12  # distribute evenly across months
            for m in range(1, 13):
                rows.append(
                    {
                        "bucket": row["bucket"],
                        "topic": row["topic"],
                        "month": f"{year}{m:02d}",
                        "count": monthly_count,
                    }
                )
    return rows


def load_crossref_totals():
    """Load total CrossRef publications per year, expand to monthly."""
    totals = {}
    path = PROCESSED / "crossref_total_yearly.csv"
    if not path.exists():
        return {}
    with path.open(newline="") as f:
        for row in csv.DictReader(f):
            year = int(row["year"])
            monthly_total = int(row["total_works"]) / 12
            for m in range(1, 13):
                totals[f"{year}{m:02d}"] = monthly_total
    return totals


def build_payload(rows, google_rows, total_views_by_month, gdelt_rows=None, crossref_rows=None, crossref_totals_by_month=None):
    gdelt_rows = gdelt_rows or []
    crossref_rows = crossref_rows or []
    crossref_totals_by_month = crossref_totals_by_month or {}
    wiki_months = sorted({row["month"] for row in rows})
    google_months = sorted({row["month"] for row in google_rows})
    
    if not google_months:
        months = wiki_months
    elif not wiki_months:
        months = google_months
    else:
        months = month_range(min(wiki_months[0], google_months[0]), max(wiki_months[-1], google_months[-1]))

    bucket_topics = defaultdict(list)
    topic_series = {}

    for row in rows:
        bucket_topics[row["bucket"]].append(row["topic"])

    for bucket in bucket_topics:
        bucket_topics[bucket] = sorted(set(bucket_topics[bucket]))

    for bucket, topics in bucket_topics.items():
        for topic in topics:
            wiki_lookup = {
                row["month"]: row["views"]
                for row in rows
                if row["bucket"] == bucket and row["topic"] == topic
            }
            google_lookup = {
                row["month"]: row["interest"]
                for row in google_rows
                if row["bucket"] == bucket and row["topic"] == topic
            }
            gdelt_lookup = {
                row["month"]: row["volume"]
                for row in gdelt_rows
                if row["bucket"] == bucket and row["topic"] == topic
            }
            crossref_lookup = {
                row["month"]: row["count"]
                for row in crossref_rows
                if row["bucket"] == bucket and row["topic"] == topic
            }
            wiki_values = [wiki_lookup.get(month) for month in months]
            google_values = [google_lookup.get(month) for month in months]
            gdelt_values = [gdelt_lookup.get(month) for month in months]
            crossref_values = [crossref_lookup.get(month) for month in months]
            wiki_mean = mean_or_one(wiki_values)
            google_mean = mean_or_one(google_values)
            gdelt_mean = mean_or_one(gdelt_values)
            crossref_mean = mean_or_one(crossref_values)
            wiki_normalized = [(value / wiki_mean) * 100 if value is not None else None for value in wiki_values]
            google_normalized = [(value / google_mean) * 100 if value is not None else None for value in google_values]
            gdelt_normalized = [(value / gdelt_mean) * 100 if value is not None else None for value in gdelt_values]
            crossref_normalized = [(value / crossref_mean) * 100 if value is not None else None for value in crossref_values]
            wiki_share = [
                ((value / total_views_by_month[month]) * 100)
                if value is not None and month in total_views_by_month
                else None
                for value, month in zip(wiki_values, months)
            ]
            crossref_share = [
                ((value / crossref_totals_by_month[month]) * 100)
                if value is not None and month in crossref_totals_by_month and crossref_totals_by_month[month] > 0
                else None
                for value, month in zip(crossref_values, months)
            ]
            merged = []
            for wiki_value, google_value in zip(wiki_normalized, google_normalized):
                if wiki_value is not None and google_value is not None:
                    merged.append((wiki_value + google_value) / 2)
                elif wiki_value is None:
                    merged.append(google_value)
                else:
                    merged.append(wiki_value)
            topic_series[f"{bucket}__{topic}"] = {
                "bucket": bucket,
                "topic": topic,
                "wiki_share_pct": [round(value, 6) if value is not None else None for value in wiki_share],
                "wiki_share_pct_smoothed": [round(value, 6) if value is not None else None for value in rolling_average(wiki_share, 3)],
                "wiki_normalized": [round(value, 3) if value is not None else None for value in wiki_normalized],
                "wiki_smoothed": [round(value, 3) if value is not None else None for value in rolling_average(wiki_normalized, 3)],
                "google_normalized": [round(value, 3) if value is not None else None for value in google_normalized],
                "google_smoothed": [round(value, 3) if value is not None else None for value in rolling_average(google_normalized, 3)],
                "gdelt_normalized": [round(value, 3) if value is not None else None for value in gdelt_normalized],
                "gdelt_smoothed": [round(value, 3) if value is not None else None for value in rolling_average(gdelt_normalized, 3)],
                "crossref_normalized": [round(value, 3) if value is not None else None for value in crossref_normalized],
                "crossref_smoothed": [round(value, 3) if value is not None else None for value in rolling_average(crossref_normalized, 3)],
                "crossref_share_pct": [round(value, 8) if value is not None else None for value in crossref_share],
                "crossref_share_pct_smoothed": [round(value, 8) if value is not None else None for value in rolling_average(crossref_share, 3)],
                "merged_normalized": [round(value, 3) if value is not None else None for value in merged],
                "merged_smoothed": [round(value, 3) if value is not None else None for value in rolling_average(merged, 3)],
                "wiki_anomalies": calculate_anomalies(rolling_average(wiki_normalized, 3)),
                "google_anomalies": calculate_anomalies(rolling_average(google_normalized, 3)),
                "gdelt_anomalies": calculate_anomalies(rolling_average(gdelt_normalized, 3)),
                "crossref_anomalies": calculate_anomalies(rolling_average(crossref_normalized, 3)),
            }

    # 1. Bucket - Sub-Discipline Indices
    bucket_indices = {}
    for bucket, topics in bucket_topics.items():
        keys = [f"{bucket}__{topic}" for topic in topics]
        bucket_indices[bucket] = {
            "topics": topics,
            "wiki_smoothed": [average_non_null([topic_series[key]["wiki_smoothed"][i] for key in keys if key in topic_series]) for i in range(len(months))],
            "wiki_share_pct_smoothed": [average_non_null([topic_series[key]["wiki_share_pct_smoothed"][i] for key in keys if key in topic_series]) for i in range(len(months))],
            "google_smoothed": [average_non_null([topic_series[key]["google_smoothed"][i] for key in keys if key in topic_series]) for i in range(len(months))],
            "gdelt_smoothed": [average_non_null([topic_series[key]["gdelt_smoothed"][i] for key in keys if key in topic_series]) for i in range(len(months))],
            "crossref_smoothed": [average_non_null([topic_series[key]["crossref_smoothed"][i] for key in keys if key in topic_series]) for i in range(len(months))],
            "crossref_share_pct_smoothed": [average_non_null([topic_series[key]["crossref_share_pct_smoothed"][i] for key in keys if key in topic_series]) for i in range(len(months))],
            "merged_smoothed": [average_non_null([topic_series[key]["merged_smoothed"][i] for key in keys if key in topic_series]) for i in range(len(months))],
        }

    # 2. Domain Master Indices (Aggregates across multiple buckets)
    DOMAINS = {
        "science": ["sci_bio", "sci_phys", "sci_chem", "sci_psych", "sci_math", "sci_earth"],
        "economics": ["eco_macro", "eco_micro", "eco_theory"],
        "history": ["hist_econ", "hist_geo", "hist_theory"],
        "politics": ["pol_ir", "pol_theory", "pol_comp"],
        "conspiracy": ["con_mod", "con_tech", "con_classic"],
        "pop_culture": ["pop_film", "pop_tv", "pop_gaming"],
        "religion": ["rel_major", "rel_texts", "rel_concepts"],
        "sports": ["spo_global", "spo_us", "spo_events"],
        "music": ["mus_genres", "mus_tech", "mus_theory"],
    }
    
    domain_indices = {}
    for domain, buckets in DOMAINS.items():
        keys = []
        for b in buckets:
            keys.extend([f"{b}__{t}" for t in bucket_topics.get(b, [])])
            
        if not keys: continue
            
        domain_indices[domain] = {
            "wiki_smoothed": [
                average_non_null([topic_series[key]["wiki_smoothed"][i] for key in keys if key in topic_series])
                for i in range(len(months))
            ],
            "wiki_share_pct_smoothed": [
                average_non_null([topic_series[key]["wiki_share_pct_smoothed"][i] for key in keys if key in topic_series])
                for i in range(len(months))
            ],
            "google_smoothed": [
                average_non_null([topic_series[key]["google_smoothed"][i] for key in keys if key in topic_series])
                for i in range(len(months))
            ],
            "gdelt_smoothed": [
                average_non_null([topic_series[key]["gdelt_smoothed"][i] for key in keys if key in topic_series])
                for i in range(len(months))
            ],
            "crossref_smoothed": [
                average_non_null([topic_series[key]["crossref_smoothed"][i] for key in keys if key in topic_series])
                for i in range(len(months))
            ],
            "crossref_share_pct_smoothed": [
                average_non_null([topic_series[key]["crossref_share_pct_smoothed"][i] for key in keys if key in topic_series])
                for i in range(len(months))
            ],
            "merged_smoothed": [
                average_non_null([topic_series[key]["merged_smoothed"][i] for key in keys if key in topic_series])
                for i in range(len(months))
            ]
        }

    return {
        "months": months,
        "wikiStartMonth": wiki_months[0] if wiki_months else "201507",
        "googleStartMonth": google_months[0] if google_months else "200401",
        "totalViewsByMonth": [total_views_by_month.get(month) for month in months],
        "bucketTopics": bucket_topics,
        "topicSeries": topic_series,
        "bucketIndices": bucket_indices,
        "domainIndices": domain_indices,
        "notes": {
            "share": "Wikipedia series use monthly total user views on English Wikipedia as the denominator.",
            "google": "Google series use Google Trends normalized interest rather than a true share of all searches.",
            "merge": "Merged series average normalized Wikipedia and Google attention where both exist, and otherwise use the source that is available.",
        },
    }


def main():
    rows = load_monthly_rows()
    google_rows = load_google_rows()
    gdelt_rows = load_gdelt_rows()
    crossref_rows = load_crossref_rows()
    total_views_by_month = load_total_views()
    crossref_totals = load_crossref_totals()
    payload = build_payload(rows, google_rows, total_views_by_month, gdelt_rows, crossref_rows, crossref_totals)
    (PROCESSED / "dashboard_data.json").write_text(json.dumps(payload, indent=2))


if __name__ == "__main__":
    main()
