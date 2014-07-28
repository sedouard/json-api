require! [\mocha, \sinon \chai, \../../lib/types/Resource]
expect = chai.expect
it2 = it # a hack for livescript

describe("Resource type", ->
  describe("validation", ->
    it2("should require a type on construction", -> 
      expect(-> new Resource(null, "bob", {})).to.throw(/type.*required/)
      expect(-> new Resource("", "bob",{})).to.throw(/type.*required/)
    )

    it2("should prevent setting type to emptly/null", ->
      r = new Resource("type", "133123", {})
      expect(-> r.type = void).to.throw(/type.*required/)
      expect(-> r.type = "").to.throw(/type.*required/)
      expect(-> r.type = null).to.throw(/type.*required/)
    )

    it2("should allow construction with no/valid id", ->
      # valid/no ids should construct w/o error
      noId    = new Resource("type", null, {})
      validId = new Resource("aoin", \3920nA_-xgGr, {})
    )

    it2("shold prevent setting id to an invalid value", ->
      # should validate ids on construction
      expect(-> new Resource("type", "2,x39", {})).to.throw(/Invalid id/)
      validId = new Resource("aoin", \3920nA_-xgGr, {})

      # removing or changind id to something valid should be fine
      validId.id = void;
      validId.id = "valid";

      # but setting to something invalid is an error
      expect(-> validId.id = "thingWithComma,rt").to.throw(/Invalid id/)
    )

    it2("should coerce ids to strings, as required by the spec", ->
      r = new Resource("type", 19339, {})
      expect(r.id==="19339").to.be.true
    )

    it2("attrs must be an object", ->
      valid = new Resource("type", "id", {})
      expect(-> new Resource("type", "id", ["attrs"])).to.throw(/must.*object/)
      expect(-> new Resource("type", "id", "atts")).to.throw(/must.*object/)
      expect(-> new Resource("type", "id"); void).to.throw(/must.*object/)
      expect(-> valid.attrs = "").to.throw(Error)
      expect(-> valid.attrs = "ias").to.throw(/must.*object/)
      expect(-> valid.attrs = void).to.throw(/must.*object/)
    )
  )
)