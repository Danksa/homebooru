import Type, { Static } from "typebox";
import Compile from "typebox/compile";

export const TagSchema = Type.Object({
    name: Type.String(),
    category: Type.Optional(Type.Union([Type.Number(), Type.Null()]))
});

export type TagSchema = Static<typeof TagSchema>;

export const TagSchemaCompile = Compile(TagSchema);
