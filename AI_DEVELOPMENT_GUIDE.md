# AI Helper Components Documentation

This document serves as a guide for AI agents working on the Travelora Admin Dashboard. It explains the core reusable components, custom hooks, and standard practices that MUST be followed when creating or modifying pages.

## Architecture & Core Philosophy
The frontend follows a **Clean Component Architecture**:
- Keep pages lean. Logic should be handled by custom hooks and services.
- Define API services, types, and logic under `/src/services` and `/src/types`.
- Use the shared generic components in `/src/components/ui/` for any layout repeats like Tables, Modals, Forms, and Page Headers.

## Generic UI Components

To maintain design consistency without duplicating code, use these standardized components:

### 1. PageHeader (`/src/components/ui/PageHeader.tsx`)
Renders the standard page title, description, icon, and an optional "Create/Add" action button.
**Usage:**
```tsx
import { PageHeader } from "../components/ui/PageHeader";

<PageHeader
  title="Destinations"
  description="Manage all available travel destinations."
  icon={MapPin}
  actionButtonLabel="Add Destination"
  onAction={actions.create}
/>
```

### 2. TableToolbar (`/src/components/ui/TableToolbar.tsx`)
Handles the global search input and page size limits (`perPage` dropdown).
**Usage:**
```tsx
<TableToolbar
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  perPage={perPage}
  onPerPageChange={setPerPage}
  searchPlaceholder="Search name, slug..."
/>
```

### 3. CommonTable (`/src/components/ui/CommonTable.tsx`)
A generic wrapper for tables that provides loading, empty, and error states natively along with pagination.
- It expects `<thead>` and `<tbody>` as its children.
- You must manage your data rows mapping internally inside `<tbody>`.

### 4. TableSortHeader (`/src/components/ui/TableSortHeader.tsx`)
A custom Table Header `<th>` element that automatically handles rendering the sort arrows (Ascending/Descending) based on the column.
**Usage:**
```tsx
<TableSortHeader 
  label="Name" 
  column="name" 
  currentSort={sortBy!} 
  currentOrder={order!} 
  onSort={handleSort} 
/>
```

### 5. LookupModal (`/src/components/ui/LookupModal.tsx`)
A standardized component for selecting referencing entities (foreign keys) through a modal dialog. It implements internal pagination, search and sort behavior specifically for lookup.
**Usage:**
```tsx
const [isLookupOpen, setIsLookupOpen] = useState(false);
const [selectedItemName, setSelectedItemName] = useState("");

<LookupModal<Destination>
  isOpen={isLookupOpen}
  onClose={() => setIsLookupOpen(false)}
  onSelect={(item) => {
    setValue("destination_id", item.id);
    setSelectedItemName(item.name);
  }}
  title="Select Destination"
  queryKey="destinations"
  queryFn={destinationService.getDestinations}
  columns={[
    { header: "Name", accessor: "name", sortable: true }
  ]}
/>
```

## Custom Hooks

### useTableState (`/src/hooks/useTableState.ts`)
Manages the typical state variables needed when dealing with server-side pagination, searching, and sorting. Exposes the variables and the mutators in a clean way.
**Usage:**
```tsx
  const {
    page, perPage, sortBy, order, searchQuery, debouncedSearch,
    setPage, setPerPage, setSearchQuery, handleSort
  } = useTableState<DestinationsQueryParams["sort_by"]>("created_at", "desc");
```

## Rules for future modules
1. **Never copy-paste table structures**. Always use the `useTableState`, `PageHeader`, `TableToolbar`, and `CommonTable`.
2. **Never alter existing design files**. Rely strictly on Tailwind CSS utility classes and Lucide React.
3. For data mutations, ensure `react-query` Cache keys are properly invalidated via the `onSuccess` handlers.
