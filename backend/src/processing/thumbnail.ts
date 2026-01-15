export class Thumbnail {
    static readonly Extension: string = ".png";
    static readonly DefaultName: string = `default${this.Extension}`;

    static name(postId: number): string {
        return `${postId.toFixed(0)}${this.Extension}`;
    }
}
