export function formatDate(date: Date | string | number): string {
  try {
    // Handle string dates
    const parsedDate = date instanceof Date ? date : new Date(date);
    
    // Validate date
    if (isNaN(parsedDate.getTime())) {
      return 'Invalid date';
    }

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(parsedDate);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

export function formatShortDate(date: Date | string | number): string {
  try {
    // Handle string dates
    const parsedDate = date instanceof Date ? date : new Date(date);
    
    // Validate date
    if (isNaN(parsedDate.getTime())) {
      return 'Invalid date';
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(parsedDate);
  } catch (error) {
    console.error('Error formatting short date:', error);
    return 'Invalid date';
  }
}