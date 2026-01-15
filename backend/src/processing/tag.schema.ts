import { Object, Static, String } from "typebox";
import Compile from "typebox/compile";

export const TagSchema = Object({
    name: String()
});

export type TagSchema = Static<typeof TagSchema>;

export const TagSchemaCompile = Compile(TagSchema);
