# homebooru frontend

The frontend consists only of static HTML, CSS and JS files, so no further process to host it is needed.

## The /data directory
The frontend assumes that posts are available on `http(s)://<hostname>/data/posts` and thumbnails on `http(s)://<hostname>/data/thumbnails` (can be changed in the [config](config.js)), so make sure that you symlink the `$DATA` directory of your backend to `./data` (only read-only permissions are required).

## Configuration
Some things like the amount of posts per page can be configured in the [config file](config.js).

## Styling
You can adjust the colors and roundness of elements in the [theme.css](theme.css).

