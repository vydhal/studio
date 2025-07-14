# **App Name**: Firebase School Central

## Core Features:

- Admin Authentication: Administrative Authentication using Firebase Authentication with email/password login. Protect admin routes.
- School Data Storage: Store the list of schools as documents in a Firestore collection named 'schools', including name and inep.
- School Census Form Submission: Adapt the existing form to submit data to a Firestore collection named 'submissions', including form data, submission timestamp, and submitter ID.
- Submission Table: Display submissions data from Firestore in a table with filtering and search capabilities.
- Detailed Submission View: Display submission details, sourcing the data from Firestore.
- Home Page Customization: Store home page settings (logo, texts, social media links) in a Firestore document within a 'settings' collection (e.g., 'settings/home_config').
- Dynamic Form Builder: Store the dynamic form structure in Firestore and load it dynamically.

## Style Guidelines:

- Primary color: Deep Indigo (#4B0082), a sophisticated and authoritative color, drawing from educational contexts. It is balanced enough to be versatile in combination.
- Background color: Very light gray (#F0F0F0), a subtle tint of the primary hue, providing a neutral backdrop that ensures readability.
- Accent color: Violet (#8F00FF), an analogous hue to Deep Indigo, used to draw the eye to interactive elements without overwhelming the user.
- Body and headline font: 'Inter' (sans-serif) for a clean and modern aesthetic, ensuring readability and accessibility across the platform.
- Use simple, geometric icons for navigation and actions to maintain a consistent and user-friendly experience.
- Maintain a clean and organized layout with consistent spacing and clear visual hierarchy to facilitate easy navigation and content consumption.
- Incorporate subtle animations and transitions to provide feedback and enhance the overall user experience, such as form submission confirmations or page transitions.