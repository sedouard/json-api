import APIError from "../../types/APIError";
import {arrayContains} from "../../util/arrays"

export default function(requestContext, responseContext, registry) {
  let type    = requestContext.type;
  let adapter = registry.adapter(type);
  let fields, sorts, includes, filters;

  // Handle fields, sorts, includes and filters.
  if(!requestContext.aboutLinkObject) {
    fields = parseFields(requestContext.queryParams.fields);
    sorts  = parseSorts(requestContext.queryParams.sort);
    includes = parseCommaSeparatedParam(requestContext.queryParams.include);
    if(!includes) {
      includes = registry.defaultIncludes(type);
    }

    return adapter
      .find(type, requestContext.idOrIds, fields, sorts, filters, includes)
      .then((resources) => {
        [responseContext.primary, responseContext.included] = resources;
      });
  }

  // the user's asking for linkage. In this case:
  // - fields don't apply because fields only pick out members of resource
  //   objects, and here we're not returning a resource object;
  // - includes don't apply because the path names for an includes must match
  //   those in the primary data's `links` key, and this primary data doesn't
  //   have a links key.
  // - sorts don't apply beacuse that's only for resource collections.
  else {
    if(Array.isArray(requestContext.idOrIds)) {
      throw new APIError(
        400, undefined,
        "You can only request the linkage for one resource at a time."
      );
    }

    return adapter.find(type, requestContext.idOrIds).spread((resource, included) => {
      if(resource.links && !resource.links[requestContext.relationship]) {
        // 404. doing it here is later than necessary, but more convenient than
        // loding in a schema.
      }
      responseContext.primary = resource.links[requestContext.relationship].linkage;
    });
  }

}

function parseSorts(sortParam) {
  if(!sortParam) {
    return undefined;
  }
  else {
    let sorts = parseCommaSeparatedParam(sortParam);
    let invalidSorts = sorts.filter((it) => !(it.startsWith("+") || it.startsWith("-")));
    if(invalidSorts.length) {
      throw new APIError(
        400, null,
        "All sort parameters must start with a + or a -.",
        `The following sort parameters were invalid: ${invalidSorts.join(", ")}.`
      );
    }
    return sorts;
  }
}

function parseFields(fieldsParam) {
  let fields;
  if(typeof fieldsParam === "object") {
    fields = {};
    let isField = (it) => !arrayContains(["id", "type", "meta"], it);

    for(let type in fieldsParam) {
      let provided = parseCommaSeparatedParam(fieldsParam[type]);
      //this check handles query strings like fields[people]=
      if(provided) {
        fields[type] = provided.filter(isField);
      }
    }
  }
  return fields;
}

function parseCommaSeparatedParam(it) {
  return it ? it.split(",").map(decodeURIComponent) : undefined;
}