# Ag-Grid Client with SQLite Streaming

This project implements an Ag-Grid client that streams data from a large SQLite database without locking the UI.

## Architecture

- **Server (`go-server`)**: A lightweight Go server using `modernc.org/sqlite` (no CGO) to serve rows from `Index.sqlite` via a simple REST API. It handles pagination and sorting.
- **Client (`react-client`)**: A React application using `ag-grid-react` and `ag-grid-community` (v32+). It uses the Infinite Row Model to fetch data in chunks as the user scrolls, ensuring high performance even with large datasets.

## Features

1. **Sticky Headers**: Native Ag-Grid support properly configured.
2. **Tight Column Sizing**: optimized `rowHeight` and `headerHeight` and tight column definitions.
3. **Column Sort**: Server-side sorting implemented for all columns.
4. **Streaming Data**: Uses Infinite Row Model to lazy-load data.

## How to Run

### 1. Start the Data Server
```bash
cd go-server
go run main.go
# Server listens on http://localhost:8080/rows
```

### 2. Start the Client
```bash
cd react-client
npm install
npm run dev
# Client listens on http://localhost:5173
```

## Troubleshooting
- If you see "No AG Grid modules are registered", ensure `ModuleRegistry.registerModules([AllCommunityModule])` is called in `App.jsx`.
- If data doesn't load, check that the Go server is running and `Index.sqlite` is accessible.
## Comparison with sqldoc

Both projects browse SQLite data in a grid; the tradeoffs differ:

- **Filtering**: aggrid gets per-column filter menus (contains/equals/range) for free from AG Grid's `AllCommunityModule`. [sqldoc](https://github.com/darianmavgo/sqldoc) only has a global search box, no per-column filters.
- **Sort/resize/sticky headers**: sqldoc's hand-rolled JS frontend already does all three, so this isn't unique to aggrid.
- **Schema**: aggrid's columns are hardcoded to one 9-field file-index schema (`path`, `name`, `size`, `mime_type`, ...) built for `Index.sqlite`. sqldoc reads `sqlite_master` and works with any table in any `.db`.
- **Pagination**: aggrid's server does plain `start/end` `LIMIT/OFFSET` pagination. sqldoc seeks by rowid instead, which its own benchmarks show is roughly 1000x faster on a 5M-row table.
- **Distribution**: aggrid is two processes started by hand (`go run main.go` + `npm run dev`), no packaging. sqldoc ships as one Go binary with a macOS app bundle and Finder "Open With" integration.
- **Tests**: sqldoc has `doc_test.go` / `server_test.go`; aggrid has none.

aggrid's role here is a framework comparison exercise, not a competing product to sqldoc — the one capability it has that sqldoc doesn't is the per-column filter UI.
