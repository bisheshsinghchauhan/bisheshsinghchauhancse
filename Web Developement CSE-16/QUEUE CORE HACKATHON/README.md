# Queue Cure 26

A hackathon-ready clinic queue management demo for the Queue Cure 26 problem statement.

## What it includes

- Patient dashboard to join a doctor queue, see token position, estimated wait, and near-turn status.
- Reception desk to add walk-ins, call next, complete, skip, and reorder patients.
- Doctor console for calling, completing, and skipping patients.
- Analytics view with wait prediction, queue load, and status mix.
- Realtime demo behavior using `BroadcastChannel` and `localStorage`.

## How to run

Open `index.html` or `queue-cure-single.html` in a browser. Both are self-contained single-file versions of the app, so you can share either HTML file directly or run it from VS Code with Live Server.

Staff panel demo codes:

- Reception: `2468`
- Doctor: `1357`
- Analytics: `9999`

## Suggested production upgrade

Replace the browser storage layer with:

- Spring Boot REST APIs for queue operations.
- PostgreSQL tables for clinics, doctors, patients, and queue entries.
- WebSocket or Socket.IO broadcasts for live queue updates.
- SMS or WhatsApp provider integration for near-turn notifications.
