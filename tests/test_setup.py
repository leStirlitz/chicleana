"""Verify test framework works correctly."""
from hypothesis import given, settings
from hypothesis import strategies as st


def test_pytest_works():
    assert 1 + 1 == 2


@given(a=st.integers(), b=st.integers())
@settings(max_examples=100)
def test_hypothesis_commutativity(a, b):
    """Property: addition is commutative."""
    assert a + b == b + a
