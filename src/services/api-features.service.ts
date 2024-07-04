interface ApiFeatures {
  query: any
  queryStr: {
    keyword: string[]
    category: string[]
  }
}

class ApiFeatures {
  query: any
  queryStr!: ApiFeatures["queryStr"]
  constructor(query: any, queryStr: ApiFeatures["queryStr"]) {}
}

export default ApiFeatures
