# Static assets

Files here are served from the site root (`/`) by Vite, untouched.

## MAUG PDF

The About page links to `/maug.pdf` for download. Drop the EAACI Molecular
Allergology User's Guide PDF here as:

    public/maug.pdf

To offer more documents, add the file here and add a matching
`<a href="/your-file.pdf" download>` in
`src/components/pages/AboutPage/AboutPage.tsx`.
