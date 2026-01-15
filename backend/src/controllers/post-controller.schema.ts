import { Static, Type } from "typebox";
import Compile from "typebox/compile";

export const ListPostsQuery = Type.Object({
    from: Type.Integer({ minimum: 0 }),
    count: Type.Integer({ minimum: 1 }),
    query: Type.Optional(Type.String())
});

export type ListPostsQuery = Static<typeof ListPostsQuery>;

export const ListPostsQueryCompile = Compile(ListPostsQuery);

export const FetchPostQuery = Type.Object({
    id: Type.Integer({ minimum: 0 })
});

export type FetchPostQuery = Static<typeof FetchPostQuery>;

export const FetchPostQueryCompile = Compile(FetchPostQuery);

export const AddTagsBody = Type.Union([
    Type.Object({
        name: Type.String()
    }),
    Type.Object({
        names: Type.Array(Type.String(), { readOnly: true })
    })
]);

export type AddTagsBody = Static<typeof AddTagsBody>;

export const AddTagsBodyCompile = Compile(AddTagsBody);

export const RemoveTagQuery = Type.Object({
    id: Type.Integer({ minimum: 0 }),
    tagId: Type.Integer({ minimum: 0 })
});

export type RemoveTagQuery = Static<typeof RemoveTagQuery>;

export const RemoveTagQueryCompile = Compile(RemoveTagQuery);

