export const getImageUrl = (url: string | null | undefined): string => {
    if (!url) return 'https://placehold.co/600x400?text=No+Image';

    // If the URL is already absolute (starts with http, https, or //), return it as is
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
        return url;
    }

    // Otherwise, prepend the API URL
    const apiUrl = import.meta.env.VITE_API_URL || '';
    // Ensure we don't end up with double slashes if API URL ends with one and path starts with one
    const cleanApiUrl = apiUrl.replace(/\/$/, '');
    const cleanPath = url.startsWith('/') ? url : `/${url}`;

    return `${cleanApiUrl}${cleanPath}`;
};
