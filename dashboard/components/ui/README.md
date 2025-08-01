# DataTable Component

A reusable, flexible table component that can handle various data types and rendering patterns.

## Features

- **Flexible Column Definitions**: Define columns with custom renderers
- **Row Click Handlers**: Optional click handlers for interactive tables
- **Empty State Handling**: Customizable empty state with action buttons
- **Consistent Styling**: Maintains the design system's glass-card styling
- **TypeScript Support**: Fully typed with generics for type safety
- **Customizable Styling**: Override default styles with className props

## Basic Usage

```tsx
import { DataTable, Column } from './ui/DataTable';
import { renderId, renderName, renderText } from './ui/table-utils';

interface MyData {
  id: string;
  name: string;
  status: string;
  createdAt: string;
}

const data: MyData[] = [
  { id: 'item-1', name: 'Project Alpha', status: 'active', createdAt: '2025-01-30' },
  { id: 'item-2', name: 'Project Beta', status: 'inactive', createdAt: '2025-01-29' },
];

const columns: Column<MyData>[] = [
  {
    key: 'id',
    header: 'ID',
    render: (value) => renderId(value)
  },
  {
    key: 'name',
    header: 'Name',
    render: (value) => renderName(value)
  },
  {
    key: 'status',
    header: 'Status',
    render: (value) => renderText(value)
  },
  {
    key: 'createdAt',
    header: 'Created',
    render: (value) => renderText(value)
  }
];

function MyComponent() {
  const handleRowClick = (row: MyData) => {
    console.log('Row clicked:', row);
  };

  return (
    <DataTable
      title="My Data"
      data={data}
      columns={columns}
      onRowClick={handleRowClick}
      emptyStateMessage="No data found"
      emptyStateAction={{
        label: "Create Item",
        onClick: () => console.log('Create clicked')
      }}
    />
  );
}
```

## Column Definition

Each column is defined with the following properties:

```tsx
interface Column<T = any> {
  key: string;           // Property key from your data object
  header: string;        // Column header text
  render?: (value: any, row: T, index: number) => React.ReactNode; // Custom renderer
  className?: string;    // Additional CSS classes for the column
  width?: string;        // Fixed width for the column
}
```

## Props

```tsx
interface DataTableProps<T = any> {
  title: string;                                    // Table title
  data: T[];                                       // Array of data objects
  columns: Column<T>[];                            // Column definitions
  onRowClick?: (row: T, index: number) => void;   // Optional row click handler
  emptyStateMessage?: string;                      // Message shown when no data
  emptyStateAction?: {                             // Optional action button
    label: string;
    onClick: () => void;
  };
  className?: string;                              // Additional CSS classes
  cardClassName?: string;                          // Override card styling
  tableClassName?: string;                         // Override table styling
  rowClassName?: string;                           // Override row styling
  headerClassName?: string;                        // Override header styling
  cellClassName?: string;                          // Override cell styling
}
```

## Utility Functions

The `table-utils.tsx` file provides common renderer functions:

- `renderId(value)`: Renders IDs with monospace font and primary color
- `renderName(value)`: Renders names with hover effects
- `renderText(value)`: Renders text with muted styling
- `renderCapitalized(value)`: Renders capitalized text
- `getStatusBadge(status)`: Renders status badges with appropriate colors
- `getFailureBadge(failures)`: Renders failure count badges
- `renderSteps(steps)`: Renders step progress with completion indicators
- `renderError(error)`: Renders error messages with icons

## Examples

### Simple Table
```tsx
const simpleColumns: Column<SimpleData>[] = [
  { key: 'id', header: 'ID', render: (value) => renderId(value) },
  { key: 'name', header: 'Name', render: (value) => renderName(value) },
  { key: 'status', header: 'Status', render: (value) => renderText(value) }
];
```

### Complex Table with Custom Renderers
```tsx
const complexColumns: Column<ComplexData>[] = [
  { key: 'id', header: 'ID', render: (value) => renderId(value) },
  { key: 'name', header: 'Name', render: (value) => renderName(value) },
  { 
    key: 'status', 
    header: 'Status', 
    render: (value) => getStatusBadge(value) 
  },
  {
    key: 'progress',
    header: 'Progress',
    render: (value) => (
      <div className="flex items-center gap-2">
        <div className="w-16 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all" 
            style={{ width: `${value}%` }}
          />
        </div>
        <span className="text-sm">{value}%</span>
      </div>
    )
  }
];
```

### Read-only Table
```tsx
<DataTable
  title="Read-only Table"
  data={data}
  columns={columns}
  // No onRowClick - table is read-only
/>
```

## Migration from Custom Tables

To migrate existing table implementations:

1. **Define your data interface**
2. **Create column definitions** using the Column interface
3. **Use utility renderers** from table-utils or create custom ones
4. **Replace the table JSX** with the DataTable component
5. **Remove duplicate styling** and badge logic

### Before (Custom Implementation)
```tsx
<Card className="glass-card hover-accent">
  <CardHeader>
    <CardTitle className="text-primary">My Table</CardTitle>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow className="border-border/50">
          <TableHead className="text-primary">ID</TableHead>
          <TableHead className="text-primary">Name</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id} className="hover:bg-primary/10">
            <TableCell className="font-mono text-sm text-primary">{item.id}</TableCell>
            <TableCell className="text-foreground">{item.name}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
</Card>
```

### After (DataTable Component)
```tsx
<DataTable
  title="My Table"
  data={data}
  columns={[
    { key: 'id', header: 'ID', render: (value) => renderId(value) },
    { key: 'name', header: 'Name', render: (value) => renderName(value) }
  ]}
/>
```

## Benefits

- **Reduced Code Duplication**: Single component handles all table patterns
- **Consistent Styling**: All tables follow the same design system
- **Type Safety**: Full TypeScript support with generics
- **Flexibility**: Custom renderers for complex cell content
- **Maintainability**: Centralized table logic and styling
- **Reusability**: Easy to create new tables with different data types 