# Salah Tracker

A mobile-friendly web app for tracking your daily prayers.

- **Prayer times for your location.** Calculated on the device with [adhan](https://github.com/batoulapps/adhan-js). Pick your calculation method (MWL, ISNA, Umm al-Qura, Karachi, and more) and the Asr method (standard or Hanafi). Shows a countdown to the next prayer and the Qibla bearing.
- **Prayer log.** Mark each prayer as on time, late, qada or missed. The app suggests a status from the prayer's time window, and you can note whether you prayed in congregation.
- **Surahs recited.** Add the surahs you recited in each prayer. Search by name, meaning or number, with short surahs listed first.
- **History.** See the last 14 days at a glance and go back to any day to fill in or fix entries.
- **Stats.** For 7, 30 or 90 days, or all time: completion rate, on-time rate, current and best streak, congregation rate, prayers per day, a status breakdown for each prayer, and your most recited surahs with a count of ayahs recited.
- **Private.** All data stays in your browser's local storage. Use Settings to export or import a JSON backup.

## Development

```bash
npm install
npm run dev      # start the dev server
npm test         # unit tests (stats + prayer time logic)
npm run build    # typecheck and build for production
npm run lint
```

## Structure

- `src/lib/prayerTimes.ts` – prayer time calculation, prayer windows, suggested status, Qibla
- `src/lib/stats.ts` – statistics over a date range
- `src/lib/storage.ts` – saving to local storage, plus backup validation
- `src/data/surahs.ts` – all 114 surahs with ayah counts
- `src/components/` – the Today, History, Stats and Settings views
