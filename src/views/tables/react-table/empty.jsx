'use client';
import PropTypes from 'prop-types';

import { useMemo, useState } from 'react';

// material-ui
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

// third party
import {
  getCoreRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedMinMaxValues,
  getFacetedUniqueValues,
  flexRender,
  useReactTable
} from '@tanstack/react-table';

// project imports
import MainCard from 'components/MainCard';
import { CSVExport, DebouncedInput, EmptyTable, Filter } from 'components/third-party/react-table';
import makeData from 'data/react-table';

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data }) {
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: { columnFilters, globalFilter },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter
  });

  return (
    <MainCard content={false}>
      <Stack direction="row" sx={{ gap: 2, alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
        <DebouncedInput
          value={globalFilter ?? ''}
          onFilterChange={(value) => setGlobalFilter(String(value))}
          placeholder={`Search records...`}
        />
        <CSVExport data={data} filename={'empty-table.csv'} />
      </Stack>

      <TableContainer>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id} {...header.column.columnDef.meta}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id} {...header.column.columnDef.meta}>
                    {header.column.getCanFilter() && <Filter column={header.column} table={table} />}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length}>
                  <EmptyTable msg="No Data" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            {table.getFooterGroups().map((footerGroup) => (
              <TableRow key={footerGroup.id}>
                {footerGroup.headers.map((footer) => (
                  <TableCell key={footer.id} {...footer.column.columnDef.meta}>
                    {footer.isPlaceholder ? null : flexRender(footer.column.columnDef.header, footer.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableFooter>
        </Table>
      </TableContainer>
    </MainCard>
  );
}

// ==============================|| REACT TABLE - EMPTY ||============================== //

export default function EmptyReactTable() {
  const data = useMemo(() => makeData(0), []);

  const columns = useMemo(
    () => [
      { header: 'Name', footer: 'Name', accessorKey: 'fullName' },
      { header: 'Email', footer: 'Email', accessorKey: 'email' },
      { header: 'Role', footer: 'Role', accessorKey: 'role' },
      { header: 'Age', footer: 'Age', accessorKey: 'age', meta: { sx: { textAlign: 'right' } } },
      { header: 'Visits', footer: 'Visits', accessorKey: 'visits', meta: { sx: { textAlign: 'right' } } },
      { header: 'Status', footer: 'Status', accessorKey: 'status' },
      { header: 'Profile Progress', footer: 'Profile Progress', accessorKey: 'progress' }
    ],
    []
  );

  return <ReactTable columns={columns} data={data} />;
}

ReactTable.propTypes = { columns: PropTypes.array, data: PropTypes.array };
