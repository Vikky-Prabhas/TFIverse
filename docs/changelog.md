# TFiverse Changelog

## [v2.0.0-beta] - Upcoming Box Office Architecture Rebuild
### Added
- Created strict UI/UX architectural master plan for the Box Office portal.
- Implemented `/docs/features/` directory containing deterministic Verdict Engine logic, Data Sources definitions, and API Caching strategies.
- Enforced `data_state` tracking (LIVE, ESTIMATED, REPORTED) to guarantee data trust.

### Changed
- Shifted Box Office UI philosophy from generic glassmorphism to a premium, cinematic Apple-style dark mode with vibrant, context-aware data visualizations.
- Removed arbitrary UI logic for determining verdicts (Hit/Flop); shifting to a math-based Break-Even ROI model.
- Restructured `/box-office` Hub to utilize a hierarchy focusing on Today's Gross and Booking Velocity.
