# homebooru backend

## How data is stored
The backend works with a single directory defined in [`config.ts`](src/config.ts) or alternatively set with the `DATA_DIRECTORY` environment variable. I'll refer to it as `$DATA` in the following paragraphs.

### Basic structure
The `$DATA` directory is divided into the following subdirectories:
- `$DATA/posts` the raw image/video files get stored here. The filename needs to correspond to its respective post ID, e. g. `1.png`, `14.mp4` and so on.
- `$DATA/thumbnails` all thumbnails are stored here. Currently the're all PNGs to allow for transparent backgrounds and named just like posts. There is a 1:1 relationship with the posts, meaning that `$DATA/thumbnails/14.png` is the thumbnail for `$DATA/posts/14.mp4`.
- `$DATA/thumbnails/default.png` if thumbnail generation for a post fails/no thumbnail exists this one is used instead.
- `$DATA/tags` tags are stored here. As with the posts, the name scheme is `<TAG ID>.json`. Currently the JSON only contains a name, but all tag-related data is stored inside the respective JSON file.
- `$DATA/uploads` this is where multer puts files you upload to the `POST /posts` endpoint. The files there will be processed and moved to `$DATA/posts` by the server.
- `$DATA/imports` is similar to `$DATA/uploads`. You can copy image/video files you want to upload there and trigger the `POST /posts/import` endpoint to import all files as if you uploaded them. This came in handy for me to migrate from another image board.
- `$DATA/post-tags.txt` this file is special and weird. It stores which posts are tagged with which tags, each line corresponds to a pair `<Post ID> <Tag ID>`. As an example the line `4 17` would signify that post 4 is tagged with tag 17.
- `$DATA/categories` categories are stored here. Similar to tags in a JSON format with the file name `<CATEGORY ID>.json`.

So to backup your whole homebooru you only need to backup the `$DATA` directory.
