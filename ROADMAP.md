# Multi AI Chatroom Roadmap

## Goal Chart

- [x] 1) Send messages to external API with response from 1-many AI agents.
- [ ] 2) Multiple chat rooms where users can join and see full log + send messages (cross-browser/backend-backed).
- [x] 3) Export chat logs.
- [x] 4) Upload/import chat logs.
- [x] 5) Continue chatting in imported chat logs.

## Notes

- Current Invite/Join passcode storage is frontend-only (`localStorage`) and works only in the same browser/profile.
- To fully complete goal 2, room state must be stored/fetched via backend persistence keyed by passcode/room ID.
