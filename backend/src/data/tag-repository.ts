import { Repository } from "./repository.js";
import { Tag } from "./tag.js";
import { TagSchema } from "./tag.schema.js";

export type TagRepository = Repository<Tag, TagSchema>;