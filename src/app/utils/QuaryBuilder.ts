import { Query } from "mongoose";
import { excludeField } from "./constants";

interface QueryParams {
    page?: string;
    limit?: string;
    sort?: string;
    fields?: string;
    searchTerm?: string;
    [key: string]: string | undefined;
}




export class QueryBuilder<T> {
    public modelQuery: Query<T[], T>;
    public readonly query: QueryParams

    constructor(modelQuery: Query<T[], T>, query:QueryParams) {
        this.modelQuery = modelQuery;
        this.query = query;
    }


    filter(): this {
        const filter = { ...this.query }

        for (const field of excludeField) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete filter[field]
        }

        this.modelQuery = this.modelQuery.find(filter) // Tour.find().find(filter)

        return this;
    }

    search(searchableField: string[]): this {
          if (!searchableField.length) {
        return this;
    }
        const searchTerm = this.query.searchTerm || ""
        const searchQuery = {
            $or: searchableField.map(field => ({ [field]: { $regex: searchTerm, $options: "i" } }))
        }
        this.modelQuery = this.modelQuery.find(searchQuery)
        return this
    }

    sort(): this {

        const sort = this.query.sort || "-createdAt";

        this.modelQuery = this.modelQuery.sort(sort)

        return this;
    }
    fields(): this {

        const fields = this.query.fields?.split(",").join(" ") || ""

        this.modelQuery = this.modelQuery.select(fields)

        return this;
    }
    paginate(): this {

        const page = Number(this.query.page) || 1
        const limit = Number(this.query.limit) || 10
        const skip = (page - 1) * limit

        this.modelQuery = this.modelQuery.skip(skip).limit(limit)

        return this;
    }

    build() {
        return this.modelQuery
    }

   async getMeta() {
    // Create a separate query for counting that excludes pagination
    const countQuery = this.modelQuery.model.find(this.modelQuery.getFilter());
    const totalDocuments = await countQuery.countDocuments();

    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const totalPage = Math.ceil(totalDocuments / limit);

    return { 
        page, 
        limit, 
        total: totalDocuments, 
        totalPage,
        hasNextPage: page < totalPage,
        hasPrevPage: page > 1
    };
}
}