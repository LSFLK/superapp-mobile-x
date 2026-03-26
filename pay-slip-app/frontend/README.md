# Pay Slip App - Frontend

A React-based microapp for managing and viewing employee pay slips, integrated with the SuperApp mobile platform.

## Features

### For Users

- 📄 View personal pay slips by month and year
- 🔍 Filter pay slips with month/year selector
- 👁️ View PDF pay slips in-app or external viewer
- ⬇️ Download pay slips (native mobile and web support)
- 📱 Responsive mobile-first design

### For Admins

- 👥 View all employees and their pay slips
- 📤 Upload pay slips for employees
- 🗑️ Delete pay slips
- 📊 View summary statistics (total pay slips, user count)
- 👁️ Group pay slips by user with collapsible sections
- 🔄 Duplicate detection prevents multiple uploads for same month/year

## Technology Stack

- **React 19** with TypeScript
- **Vite 6** - Build tool with single-file output
- **Tailwind CSS 3** - Utility-first styling
- **Lucide React** - Icon library
- **Native Bridge** - SuperApp integration

## Project Structure

```
pay-slip-app/frontend/
├── src/
│   ├── api/              # API client with retry logic
│   ├── components/       # Reusable UI components
│   │   ├── Filters.tsx   # Month/year filter component
│   │   ├── UploadModal.tsx
│   │   ├── PaySlipCard.tsx
│   │   └── ...
│   ├── hooks/            # Custom React hooks
│   │   ├── useAuth.ts    # Authentication hook
│   │   ├── useBridge.ts  # Native bridge integration
│   │   ├── usePaySlips.ts
│   │   └── ...
│   ├── views/            # Page-level components
│   │   ├── PaySlipList.tsx
│   │   ├── AdminPaySlipList.tsx
│   │   └── ...
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript type definitions
│   ├── bridge.ts         # Native bridge wrapper
│   ├── constants.ts      # App-wide constants
│   └── App.tsx           # Main application component
├── mock-server/          # Development mock API (not committed)
├── scripts/              # Build scripts
├── .env.example          # Environment variables template
├── microapp.json         # Microapp metadata
└── package.json
```

## Setup & Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory:

   ```bash
   cd pay-slip-app/frontend
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Copy environment template:

   ```bash
   cp .env.example .env
   ```

5. Configure environment variables in `.env`:
   ```env
   VITE_DEV_TOKEN=admin-token
   VITE_API_BASE=https://your-backend-api.com/api
   ```

### Development Server

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Mock Server (Optional)

For local development without a backend:

```bash
npm run mock
```

The mock server runs on `http://localhost:3001` and provides:

- Mock users (admin, regular users)
- Sample pay slip data
- All CRUD endpoints
- JWT token simulation

Available mock tokens:

- `admin-token` → admin@example.com (Admin)
- `user-token` → user@example.com (User)
- `john-token` → john.doe@example.com (User)

### Building for Production

Build the single-file bundle:

```bash
npm run build
```

Output: `dist/index.html` (single self-contained HTML file)

## Configuration

### Environment Variables

| Variable            | Description                      | Default                                                               |
| ------------------- | -------------------------------- | --------------------------------------------------------------------- |
| `VITE_DEV_TOKEN`    | Development authentication token | `admin-token` (or `user-token` / `john-token` when using mock server) |
| `VITE_API_BASE`     | Backend API base URL             | `/api` (prod), `http://localhost:3001/api` (dev)                      |
| `VITE_PROXY_TARGET` | Development proxy target         | -                                                                     |

### Constants

All configurable values are centralized in `src/constants.ts`:

- **API Configuration**: Retry attempts, delays
- **Bridge Configuration**: Token retry logic
- **Upload Configuration**: File size limits, accepted types
- **Date Configuration**: Year ranges, month names

## API Endpoints

### User Endpoints

- `GET /api/me` - Get current user profile
- `GET /api/pay-slips` - Get user's pay slips

### Admin Endpoints

- `GET /api/users` - Get all users
- `GET /api/users/:id/pay-slips` - Get user's pay slips
- `POST /api/upload` - Upload file
- `POST /api/pay-slips` - Create pay slip record
- `DELETE /api/pay-slips/:id` - Delete pay slip

All endpoints require `Authorization: Bearer <token>` header.

## Features & Implementation

### Retry Logic

- **API Requests**: 3 attempts with 5s delay for 504/network errors
- **Token Fetching**: 3 attempts with 500ms delay

### Download Support

- **Native Mobile**: Uses `nativebridge.requestDownloadFile()`
- **Web Fallback**: Creates blob URL with cleanup
- **CORS Handling**: Graceful fallback to direct URL

### Duplicate Prevention

- Checks existing pay slips before upload
- Displays warning message if duplicate exists
- Prevents accidental overwriting

### Sorting

- Latest pay slips first (descending by year, then month)
- Consistent across all views

### Filtering

- Month and year selectors
- Admin view: Expanded by default
- User view: Collapsed by default
- Current year pre-selected

## Native Bridge Integration

The app integrates with SuperApp's native bridge for:

1. **Authentication**: Token retrieval via `requestToken()`
2. **Downloads**: File downloads via `requestDownloadFile()`
3. **Storage**: Local data persistence (future use)

See `src/bridge.ts` and `src/hooks/useBridge.ts` for implementation.

## Styling

- Mobile-first responsive design
- Tailwind CSS utility classes
- Custom color palette (primary: blue, slate grays)
- Smooth animations and transitions
- Lucide React icons

## Error Handling

- Network error recovery with retry logic
- User-friendly error messages
- Console error logging for debugging
- Fallback behaviors for unavailable features

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- React Native WebView
- iOS and Android mobile browsers

## License

Proprietary - LSFLK SuperApp

## Support

For issues or questions, contact the development team.
