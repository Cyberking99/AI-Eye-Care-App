# API Integration Guide

This document explains how the mobile app is integrated with the AIEyeCare API.

## Overview

The mobile app now consumes the AIEyeCare API for all data operations including:
- User authentication and profile management
- Eye exercises and progress tracking
- Vision tests and results
- Eye scans and AI analysis
- Chat with AI assistant

## API Services

### 1. Authentication Service (`services/api/auth.ts`)
- User registration and login
- Token management (access & refresh tokens)
- Profile management
- Automatic token refresh

### 2. Chat Service (`services/api/chat.ts`)
- Send messages to AI assistant
- Get chat history
- Manage conversations

### 3. Scans Service (`services/api/scans.ts`)
- Upload eye scan images
- Get scan results and AI analysis
- Manage scan history

### 4. Exercises Service (`services/api/exercises.ts`)
- Get available exercises
- Track exercise sessions
- Monitor progress and statistics

### 5. Tests Service (`services/api/tests.ts`)
- Get available vision tests
- Submit test results
- Track test history and progress

## Configuration

### API Base URL
The API base URL is configured in `services/api/config.ts`:
- Development: `http://localhost:4000/api`
- Production: Update the `API_BASE_URL` constant

### Authentication
- JWT tokens are automatically managed
- Tokens are stored securely using AsyncStorage
- Automatic token refresh on 401 responses

## React Query Integration

The app uses React Query for:
- Data caching and synchronization
- Background refetching
- Optimistic updates
- Error handling

### Available Hooks

#### Authentication
- `useProfile()` - Get current user profile
- `useUpdateProfile()` - Update user profile

#### Exercises
- `useExercises()` - Get all exercises
- `useExerciseHistory()` - Get exercise history
- `useExerciseProgress()` - Get progress statistics
- `useCompleteExercise()` - Complete an exercise session

#### Tests
- `useTests()` - Get all tests
- `useTestHistory()` - Get test history
- `useTestProgress()` - Get progress statistics
- `useSubmitTest()` - Submit test results

#### Scans
- `useScans(userId)` - Get user's scans
- `useUploadScan()` - Upload eye scan image

#### Chat
- `useChatHistory()` - Get chat history
- `useSendMessage()` - Send message to AI
- `useDeleteConversation()` - Delete conversation

## Usage Examples

### Authentication
```typescript
import { useAuth } from '@/hooks/useAuth';

const { signIn, signUp, signOut, user, isAuthenticated } = useAuth();

// Login
await signIn(email, password);

// Register
await signUp(email, password, name);

// Logout
await signOut();
```

### Exercises
```typescript
import { useExercises, useCompleteExercise } from '@/hooks/useApi';

const { data: exercises } = useExercises();
const completeExercise = useCompleteExercise();

// Complete an exercise
await completeExercise.mutateAsync({
  exerciseId: 'exercise-123',
  duration: 5,
  score: 85,
  notes: 'Great session!'
});
```

### Chat
```typescript
import { useSendMessage, useChatHistory } from '@/hooks/useApi';

const { data: chatHistory } = useChatHistory();
const sendMessage = useSendMessage();

// Send a message
await sendMessage.mutateAsync({
  message: 'Tell me about eye exercises',
  conversationId: 'conv-123' // optional
});
```

### Scans
```typescript
import { useUploadScan } from '@/hooks/useApi';

const uploadScan = useUploadScan();

// Upload an eye scan
const result = await uploadScan.mutateAsync(imageUri);
console.log(result.analysisResult);
```

## Error Handling

All API calls include proper error handling:
- Network errors are caught and displayed to users
- Authentication errors trigger automatic logout
- Validation errors show specific error messages

## Data Flow

1. **User Authentication**: Login/register → Store tokens → Set user context
2. **Data Fetching**: React Query hooks → API services → Backend API
3. **Real-time Updates**: Optimistic updates → API calls → Cache invalidation
4. **Error Recovery**: Automatic retries → Fallback UI → User notifications

## Development Setup

1. Start the API server:
   ```bash
   cd aieyecare-api
   npm run dev
   ```

2. Start the mobile app:
   ```bash
   cd mobile-app
   npm start
   ```

3. The app will automatically connect to the API at `http://localhost:4000/api`

## Production Deployment

1. Update the `API_BASE_URL` in `services/api/config.ts`
2. Ensure the API server is accessible from the mobile app
3. Configure proper CORS settings on the API server
4. Set up proper SSL certificates for HTTPS

## Security Considerations

- JWT tokens are stored securely in AsyncStorage
- API calls include proper authentication headers
- Sensitive data is not logged in production
- HTTPS is required for production deployments

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check if the API server is running
   - Verify the API_BASE_URL configuration
   - Check network connectivity

2. **Authentication Errors**
   - Clear app storage and re-login
   - Check if tokens are expired
   - Verify API authentication endpoints

3. **Data Not Loading**
   - Check React Query cache
   - Verify API endpoints are working
   - Check for network errors in logs

### Debug Mode

Enable debug logging by setting `__DEV__` to true in the API configuration.
