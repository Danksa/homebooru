export enum EmbedType {
    Image = "image",
    Video = "video",
    Animation = "animation"
}

const EmbedTypeMap = new Map<EmbedType, ReadonlyArray<string>>([
    [EmbedType.Image, [".jpg", ".jpeg", ".png", ".bmp", ".webp", ".avif", ".jxl"]],
    [EmbedType.Video, [".mp4", ".mkv", ".webm", ".avi", ".mov", ".wmv"]],
    [EmbedType.Animation, [".gif", ".apng"]]
]);

const ReverseEmbedTypeMap = new Map<string, EmbedType>(
    Array.from(EmbedTypeMap.entries()).flatMap(([type, extensions]) => extensions.map(extension => [extension, type] as readonly [string, EmbedType]))
);

export const embedType = (extension: string): EmbedType => {
    const type = ReverseEmbedTypeMap.get(extension);
    if(type == null)
        throw new Error(`Unsupported file type "${extension}"`);
    return type;
};
