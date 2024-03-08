# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Version 3.0.2 - 2024-03-08
### Changed
- Fix auto update process.
- Add go back to static to simulation dropdown.

## Version 3.0.1 - 2024-03-08
### Changed
- Enable Discord RPC by default.
- Reset zoom level on app start.
- Add global maximum brightness setting.
- Add go back to static.

## Version 3.0.0 - 2024-03-07

**Important**: This update will reset your configuration due to major application changes, you will need to reconfigure your devices and events. There is no way around this, sorry for the inconvenience.

### Changed
- Complete UI redesign of the app
- Major performance improvements
- Major stability improvements
- Insane amount of bug fixes
- Updated dependencies
- Device selection pages will no longer open in a new window
- Add support for multiple Elgato Stream Deck devices
- Improved error handling
- Remove unused analytics
- Improved update process
- Major changes to configuration handling
- **Effects are now called events, here is everything you need to know:**
   - Effects are now called events
   - An event can have multiple triggers
   - Events will replace the custom colors, and "go back to static".
   - Events can be shared with a hyperlink.
   - You can achieve the same "go back to static" behavior as before, by creating an event that ends with delay (1000 ms) and sets the color to the wanted static color.
   - New event triggers are added, such as: Chequered flag, DRS Enabled, DRS Disabled, Time penalty, Pit exit open, and more. *Let me know if you want to see more triggers.*
   - You can now simulate events on the event editor page.
   - You can now duplicate events.

For questions or ideas, please contact me on Discord :)



