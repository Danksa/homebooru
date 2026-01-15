export enum PostType {
    Image,
    Video
}

const PostTypeMap = new Map<PostType, ReadonlyArray<string>>([
    [PostType.Image, [".jpg", ".jpeg", ".png", ".bmp", ".webp", ".avif", ".jxl"]],
    [PostType.Video, [".mp4", ".mkv", ".webm", ".avi", ".mov", ".wmv", ".gif", ".apng"]]
]);

const ReversePostTypeMap = new Map<string, PostType>(
    Array.from(PostTypeMap.entries()).flatMap(([type, extensions]) => extensions.map(extension => [extension, type] as readonly [string, PostType]))
);

export const postType = (extension: string): PostType => {
    const type = ReversePostTypeMap.get(extension);
    if(type == null)
        throw new Error(`Unsupported file type "${extension}"`);
    return type;
};
