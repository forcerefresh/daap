# Versioning

This document describes Web Slider for versioning principles.

Versioning is based on semantic versioning with following rules.

## Pattern: 

`MAJOR.MINOR.PATCHES-RC`

## Examples in historical order

- `v1.0.0` - Base version
- `v1.0.1`, `v1.0.2`, etc. - Small improvements and bugfixes
- `v1.1.0-rc1` - Release candidate for version v1.1.0 - Include small features
- `v1.1.0` - Base version
- `v1.1.1`, `v1.0.2`, etc. - Small improvements and bugfixes
- `v2.0.0-rc1` - Release candidate for Epic

## Plan for further versions

- 1.1.0 - Responsive integration improvements (make slider layout properly)
- 2.0.0 - Wizard - (app)
  - *shared code: da app kreira strukturu za wizard i onda moze se koristi i za app i za sajt u jednoj komponenti.*
  - za sajt bi se koristilo merganje preko item id-ja i  property name-a
- 3.0.0 - Wordpress integration (upload exported template and shortcode integration)
- 3.1.0 - Upload to wordpress directly from app


