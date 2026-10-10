"""
Report validation and state machine logic — testable in Python.
Mirrors the logic in js/report-service.js for property-based testing.
"""

TRASH_TYPES = ['beer_cans', 'cooler_box', 'boat_kayak', 'chair', 'plastic_bottles', 'fishing_gear', 'mixed_other']
SEVERITY_LEVELS = ['small', 'medium', 'large']
REPORT_STATUSES = ['open', 'claimed', 'cleaned']

# Valid state transitions
VALID_TRANSITIONS = {
    'open': ['claimed'],
    'claimed': ['cleaned'],
    'cleaned': [],
}


def validate_report(data):
    """Validate report data. Returns (valid: bool, errors: list[str])."""
    errors = []
    if not data.get('photo_url'):
        errors.append('Photo is required.')
    if not data.get('lat') or not data.get('lng'):
        errors.append('GPS location is required.')
    if data.get('trash_type') not in TRASH_TYPES:
        errors.append('Invalid trash type.')
    if data.get('severity') not in SEVERITY_LEVELS:
        errors.append('Invalid severity level.')
    return len(errors) == 0, errors


def create_report(photo_url, lat, lng, trash_type, severity, reporter_id, description=''):
    """Create a report dict with status 'open'. Raises ValueError if invalid."""
    valid, errors = validate_report({
        'photo_url': photo_url,
        'lat': lat,
        'lng': lng,
        'trash_type': trash_type,
        'severity': severity,
    })
    if not valid:
        raise ValueError(' '.join(errors))

    return {
        'reporter_id': reporter_id,
        'lat': lat,
        'lng': lng,
        'photo_url': photo_url,
        'trash_type': trash_type,
        'severity': severity,
        'description': description,
        'status': 'open',
        'claimed_by': None,
        'cleaned_at': None,
        'after_photo_url': None,
    }


def claim_report(report, user_id):
    """Transition report from open → claimed. Raises ValueError if invalid."""
    if report['status'] != 'open':
        raise ValueError('Report must be open to claim.')
    report = dict(report)
    report['status'] = 'claimed'
    report['claimed_by'] = user_id
    return report


def complete_cleanup(report, after_photo_url):
    """Transition report from claimed → cleaned. Raises ValueError if invalid."""
    if report['status'] != 'claimed':
        raise ValueError('Report must be claimed to complete cleanup.')
    report = dict(report)
    report['status'] = 'cleaned'
    report['after_photo_url'] = after_photo_url
    return report


def get_pin_color(status):
    """Return pin color based on status."""
    colors = {
        'open': 'red',
        'claimed': 'yellow',
        'cleaned': 'green',
    }
    return colors.get(status)
