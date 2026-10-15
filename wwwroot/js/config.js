// Tailwind config: single accent color for minimalist look
tailwind.config = {
    theme: {
        extend: {
            colors: {
                accent: {
                    50: '#eef7ff',
                    100: '#d9ecff',
                    200: '#b6d8ff',
                    300: '#86bdff',
                    400: '#4e9aff',
                    500: '#1f7bff', /* primary accent */
                    600: '#0f63e6',
                    700: '#0a4db4',
                    800: '#083e8f',
                    900: '#072f6b',
                },
            },
            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'Apple Color Emoji', 'Segoe UI Emoji'],
            },
            boxShadow: {
                card: '0 8px 24px -12px rgba(0,0,0,0.15)',
            }
        }
    }
}