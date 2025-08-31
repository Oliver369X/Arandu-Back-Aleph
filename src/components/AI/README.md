# AI Writing Assistant

This module provides AI-powered educational content generation for subtopics. It uses Google's Gemini AI to create comprehensive lesson plans with detailed steps.

## Features

- **AI-Powered Lesson Generation**: Creates 5-step lesson plans for any subtopic
- **Structured Output**: Returns JSON format with detailed educational content
- **Database Integration**: Automatically saves generated content to the database
- **Validation**: Input validation using Zod schemas
- **Error Handling**: Comprehensive error handling and logging
- **Retry Logic**: Automatic retry mechanism for AI generation failures
- **Fallback System**: Generates basic lesson plan if AI fails completely
- **Data Normalization**: Ensures consistent data format and validation

## API Endpoints

### Generate AI Feedback for Subtopic

**POST** `/ai-writing-assistant/generate-feedback/:subtopicId`

Generates a comprehensive 5-step lesson plan for a specific subtopic.

#### Parameters

- `subtopicId` (string, required): UUID of the subtopic to generate content for

#### Request Example

```bash
POST /ai-writing-assistant/generate-feedback/123e4567-e89b-12d3-a456-426614174000
```

#### Response Format

```json
{
  "success": true,
  "message": "AI feedback generated successfully",
  "data": {
    "subtopic": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Algebraic Equations",
      "description": "Solving linear equations with one variable",
      "subject": {
        "id": "456e7890-e89b-12d3-a456-426614174001",
        "name": "Mathematics"
      }
    },
    "steps": [
      {
        "id": "789e0123-e89b-12d3-a456-426614174002",
        "subtopicId": "123e4567-e89b-12d3-a456-426614174000",
        "stepNumber": 1,
        "stepName": "Engaging Introduction",
        "content": "Detailed explanation of the step...",
        "timeMinutes": 15,
        "studentActivity": "Students will participate in...",
        "timeAllocation": "5 min introduction, 8 min activity, 2 min discussion",
        "materialsNeeded": "Whiteboard, markers, worksheets",
        "successIndicator": "Students can identify the key components...",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
      // ... 4 more steps
    ]
  }
}
```

#### Error Responses

**400 Bad Request** - Invalid subtopic ID format
```json
{
  "success": false,
  "error": "Invalid subtopic ID format",
  "details": [...]
}
```

**404 Not Found** - Subtopic not found
```json
{
  "success": false,
  "error": "Subtopic not found"
}
```

**500 Internal Server Error** - AI generation or parsing error
```json
{
  "success": false,
  "error": "Failed to generate AI feedback",
  "details": "Error message"
}
```

## Generated Content Structure

Each generated lesson plan includes 5 steps:

1. **Engaging Introduction** (10-15 minutes)
   - Captures student interest
   - Introduces the concept
   - Sets learning objectives

2. **Core Concept Development** (20-25 minutes)
   - Main content delivery
   - Key concept explanation
   - Interactive learning activities

3. **Practice and Application** (20-25 minutes)
   - Hands-on practice
   - Real-world applications
   - Student collaboration

4. **Assessment and Feedback** (10-15 minutes)
   - Progress evaluation
   - Student feedback
   - Learning assessment

5. **Closure and Reflection** (5-10 minutes)
   - Lesson summary
   - Student reflection
   - Connection to broader goals

## Configuration

### Environment Variables

- `GOOGLE_GENERATIVE_AI_API_KEY`: Your Google Gemini AI API key

### AI Model Configuration

The system uses Gemini 2.0 Flash Exp with the following settings:
- Temperature: 0.8 (balanced creativity and consistency)
- Top P: 0.9 (nucleus sampling)
- Top K: 40 (diversity control)
- Max Output Tokens: 8192 (comprehensive responses)
- Response MIME Type: application/json (forced JSON output)

## File Structure

```
src/components/AI/
├── aiWritingAssistant.controllers.js    # Main controller logic
├── aiWritingAssistant.routes.js         # Route definitions
├── aiWritingAssistant.models.js         # Database models (if needed)
├── dto/
│   └── aiFeedbackGeneration.dto.js      # Input validation schemas
├── prompts/
│   └── aiFeedbackGeneration.prompt.js   # AI system prompts
└── README.md                            # This documentation
```

## Usage Examples

### JavaScript/Node.js

```javascript
const response = await fetch('/ai-writing-assistant/generate-feedback/123e4567-e89b-12d3-a456-426614174000', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
});

const result = await response.json();
console.log(result.data.steps);
```

### cURL

```bash
curl -X POST \
  http://localhost:3000/ai-writing-assistant/generate-feedback/123e4567-e89b-12d3-a456-426614174000 \
  -H 'Content-Type: application/json'
```

## Error Handling

The system includes comprehensive error handling for:

- Invalid input validation
- Database connection issues
- AI API failures with automatic retry (up to 3 attempts)
- JSON parsing errors
- Missing subtopics
- Rate limiting
- Invalid AI response structure
- Missing or incomplete step data
- Time allocation validation (60-90 minutes total)
- Fallback lesson plan generation if AI fails completely

## Best Practices

1. **Rate Limiting**: The AI generation can take 10-30 seconds, so implement appropriate loading states
2. **Caching**: Consider caching generated content to avoid regenerating the same lesson plans
3. **Validation**: Always validate the subtopic exists before generating content
4. **Error Recovery**: Implement retry logic for transient AI API failures
5. **Content Review**: Generated content should be reviewed by educators before use

## Dependencies

- `@google/generative-ai`: Google Gemini AI client
- `zod`: Input validation
- `@prisma/client`: Database operations
- `express`: Web framework

## Contributing

When modifying the AI prompts or generation logic:

1. Test with various subtopic types and subjects
2. Validate the JSON output structure
3. Ensure educational content quality
4. Update documentation for any API changes
5. Add appropriate error handling for new scenarios
