def test_ikg_distribution_consistency():
    distribution = {'puas': 3, 'netral': 1, 'tidak_puas': 0}
    total = sum(distribution.values())

    assert total > 0
    assert distribution['puas'] / total > 0.5