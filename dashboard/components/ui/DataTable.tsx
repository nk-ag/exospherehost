import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { Badge } from "./badge";
import { Button } from "./button";

export interface Column<T = any> {
  key: string;
  header: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  className?: string;
  width?: string;
}

export interface DataTableProps<T = any> {
  title: string;
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T, index: number) => void;
  emptyStateMessage?: string;
  emptyStateAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  cardClassName?: string;
  tableClassName?: string;
  rowClassName?: string;
  headerClassName?: string;
  cellClassName?: string;
}

export function DataTable<T = any>({
  title,
  data,
  columns,
  onRowClick,
  emptyStateMessage = "No data found",
  emptyStateAction,
  className = "",
  cardClassName = "glass-card hover-accent",
  tableClassName = "",
  rowClassName = "border-border/30 hover:bg-primary/10 hover:border-primary/40 hover:shadow-md hover:scale-[1.01] transition-all duration-300 cursor-pointer group relative",
  headerClassName = "border-border/50",
  cellClassName = "text-muted-foreground group-hover:text-foreground transition-colors"
}: DataTableProps<T>) {
  
  const handleRowClick = (row: T, index: number) => {
    if (onRowClick) {
      onRowClick(row, index);
    }
  };

  const renderCell = (column: Column<T>, row: T, index: number) => {
    const value = (row as any)[column.key];
    
    if (column.render) {
      return column.render(value, row, index);
    }
    
    return (
      <span className={cellClassName}>
        {value}
      </span>
    );
  };

  return (
    <Card className={`${cardClassName} ${className}`}>
      <CardHeader>
        <CardTitle className="text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <p className="text-muted-foreground text-center">{emptyStateMessage}</p>
            {emptyStateAction && (
              <Button 
                onClick={emptyStateAction.onClick} 
                className="bg-primary hover:bg-primary/90"
              >
                {emptyStateAction.label}
              </Button>
            )}
          </div>
        ) : (
          <Table className={tableClassName}>
            <TableHeader>
              <TableRow className={headerClassName}>
                {columns.map((column) => (
                  <TableHead 
                    key={column.key} 
                    className={`text-primary ${column.className || ''}`}
                    style={column.width ? { width: column.width } : undefined}
                  >
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow 
                  key={index}
                  className={onRowClick ? rowClassName : "border-border/30"}
                  onClick={onRowClick ? () => handleRowClick(row, index) : undefined}
                >
                  {columns.map((column) => (
                    <TableCell 
                      key={column.key}
                      className={column.className || ''}
                    >
                      {renderCell(column, row, index)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
} 