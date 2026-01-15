import { Integer, Object, Static, String } from "typebox";
import Compile from "typebox/compile";

export const CreateTagBody = Object({
    name: String()
});

export type CreateTagBody = Static<typeof CreateTagBody>;

export const CreateTagBodyCompile = Compile(CreateTagBody);

export const FetchTagQuery = Object({
    id: Integer({ minimum: 0 })
});

export type FetchTagQuery = Static<typeof FetchTagQuery>;

export const FetchTagQueryCompile = Compile(FetchTagQuery);


export const TagSuggestionsQuery = Object({
    query: String()
});

export type TagSuggestionsQuery = Static<typeof TagSuggestionsQuery>;

export const TagSuggestionsQueryCompile = Compile(TagSuggestionsQuery);
