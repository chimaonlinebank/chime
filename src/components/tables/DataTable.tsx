import React from 'react';

interface DataTableProps {
  columns: Array<{
    key: string;
    label: string;
    width?: string;
  }>;
  data: any[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No data available',
}) => {
  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-6 py-3 text-left text-sm font-semibold text-gray-700 ${
                  col.width ? `w-${col.width}` : ''
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 text-sm text-gray-700">
                  {row[col.key] ?? '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
