import json

with open("datasets/campgrounds_signal_scored.json") as f:
    data = json.load(f)

data.sort(key=lambda c: (-(c.get("signal_quality_score") or 0), -(c.get("remote_work_score") or 0), c.get("campground_name", "")))

seen = set()
top = []
for c in data:
    name = c.get("campground_name", "")
    if name not in seen:
        seen.add(name)
        top.append(c)
    if len(top) == 10:
        break

header = f"{'Name':<45} {'SS':>3} {'SQS':>3} {'RW':>5}"
print(header)
print("-" * 60)
for c in top:
    name = c.get("campground_name", "?")[:44]
    ss = c.get("signal_score", 0)
    sqs = c.get("signal_quality_score", 0)
    rw = c.get("remote_work_score", 0)
    print(f"{name:<45} {ss:>3} {sqs:>3} {rw:>5.1f}")
