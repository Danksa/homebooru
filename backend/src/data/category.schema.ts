import Type, { Static } from "typebox";
import Compile from "typebox/compile";

export const CategorySchema = Type.Object({
    name: Type.String(),
    color: Type.String()
});

export type CategorySchema = Static<typeof CategorySchema>;

export const CategorySchemaParser = Compile(CategorySchema);
