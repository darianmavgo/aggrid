import React, { useState, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react'; 
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'; 
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

ModuleRegistry.registerModules([ AllCommunityModule ]);

import './index.css';

const App = () => {
  const containerStyle = useMemo(() => ({ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }), []);
  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);

  const [colDefs] = useState([
    { field: 'path', minWidth: 150 },
    { field: 'name', minWidth: 120 },
    { field: 'size', width: 90 },
    { field: 'extension', width: 90 },
    { field: 'mod_time', minWidth: 180 },
    { field: 'create_time', minWidth: 180 },
    { field: 'permissions', width: 110 },
    { field: 'is_dir', width: 80 },
    { field: 'mime_type', minWidth: 150 }
  ]);

  const defaultColDef = useMemo(() => {
    return {
      sortable: true,
      resizable: true,
      filter: true,
    };
  }, []);

  const onGridReady = useCallback((params) => {
    const dataSource = {
      rowCount: undefined,
      getRows: (params) => {
        const { startRow, endRow, sortModel } = params;
        
        // Relative URL to work with the Go server that serves this app
        let url = `/rows?start=${startRow}&end=${endRow}`;
        
        if (sortModel.length > 0) {
          const { colId, sort } = sortModel[0];
          url += `&sortCol=${colId}&sortDir=${sort}`;
        }

        fetch(url)
          .then(httpResponse => httpResponse.json())
          .then(response => {
             if (!response.rows) {
                params.successCallback([], response.totalCount);
                return;
             }
             // Map Go sql.NullString to string
             const rows = response.rows.map(r => ({
                 path: r.path?.String || '',
                 name: r.name?.String || '',
                 size: r.size?.String || '',
                 extension: r.extension?.String || '',
                 mod_time: r.mod_time?.String || '',
                 create_time: r.create_time?.String || '',
                 permissions: r.permissions?.String || '',
                 is_dir: r.is_dir?.String || '',
                 mime_type: r.mime_type?.String || '',
             }));
             
             params.successCallback(rows, response.totalCount);
          })
          .catch(error => {
            console.error("Fetch error:", error);
            params.failCallback();
          })
      }
    };

    params.api.setGridOption('datasource', dataSource);
  }, []);

  return (
    <div style={containerStyle}>
        <div className="ag-theme-alpine-dark" style={gridStyle}>
          <AgGridReact
            theme="legacy"
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            rowModelType={'infinite'}
            onGridReady={onGridReady}
            cacheBlockSize={100}
            maxBlocksInCache={10}
            rowHeight={32}
            headerHeight={32}
          />
        </div>
    </div>
  );
};

export default App;
