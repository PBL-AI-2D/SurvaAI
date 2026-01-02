import sys
from pathlib import Path
# Add service_python package paths
ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / 'app' / 'src'))

try:
    from services.ikg_service import compute_combined_satisfaction_index
except Exception as e:
    print('IMPORT_ERROR', e)
    raise

sample = compute_combined_satisfaction_index(
    raw_responses=[{'likert': {'q1': 2}, 'text': 'didnt really like it but it feels ok and i got it', 'categorical': {}}],
    categorical_features=[{}],
    sentiment_labels=['neutral'],
    sentiment_confidence_scores=[0.9],
    likert_min_val=1.0,
    likert_max_val=5.0,
)
print('SMOKE_OK')
print(sample)
