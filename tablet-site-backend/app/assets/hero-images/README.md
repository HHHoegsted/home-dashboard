# Hero Images

Images in this folder are served by the backend at `/api/hero-image`.

Supported formats:

```text
.jpg
.jpeg
.png
.webp
```

Daily images can use any descriptive filename, for example:

```text
morning-kitchen.png
summer-garden.webp
```

Birthday images use this filename convention:

```text
birthday-charlie.jpg
```

Then configure the birthday date in the root `.env`:

```env
HERO_IMAGE_BIRTHDAYS=Charlie=2006-10-23
```

On Charlie's birthday, `/api/hero-image` will serve `birthday-charlie.*`.
Full dates also let the dashboard show age labels such as `Charlie 20 years old`.

Phone uploads go through the frontend upload page and backend endpoint:

```text
/upload
POST /api/hero-images
```

Set this in the root `.env` before enabling uploads:

```env
HERO_IMAGE_UPLOAD_PASSWORD=choose-a-shared-guest-password
```
