const isDevelopment = process.env.NODE_ENV === 'development';

export async function loadQuestions(theme) {
    if (isDevelopment) {
        try {
            // In development, try to load from logs
            const response = await fetch(`/api/logs?theme=${theme}`);
            if (response.ok) {
                const logFile = await response.json();
                return logFile.response.questions;
            }
        } catch (error) {
            console.log('Failed to load questions from logs, falling back to API');
        }
    }
    
    // In production or if log loading fails, use the API
    const response = await fetch(`/api/questions?theme=${theme}`);
    const data = await response.json();
    return data.questions;
} 