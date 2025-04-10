mutation ProductVariantsCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
  productVariantsBulkCreate(productId: $productId, variants: $variants) {
    userErrors {
      field
      message
    }
  }
}

{
  "productId": "gid://shopify/Product/10145067761974",
  "variants": [
    { 
       "inventoryQuantities": {
        "locationId": "gid://shopify/Location/104149254454",
        "availableQuantity": 12
      },
      "price": 15.99,
      "compareAtPrice": 19.99,
      "optionValues":{
        "optionId": "gid://shopify/ProductOption/12738614886710",
        "name": "Title"
      }
    }
  ]
}

const response = await admin.graphql(
  `#graphql
 mutation ProductVariantsCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
  productVariantsBulkCreate(productId: $productId, variants: $variants) {
    userErrors {
      field
      message
    }
  }
}`,
  {
    variables: {
      "productId": "gid://shopify/Product/10145067761974",
      "variants": [
        { 
           "inventoryQuantities": {
            "locationId": "gid://shopify/Location/104149254454",
            "availableQuantity": 12
          },
          "price": 15.99,
          "compareAtPrice": 19.99,
          "optionValues":{
            "optionId": "gid://shopify/ProductOption/12738614886710",
            "name": "Title"
          }
        }
      ]
    }
  },
);

const data = await response.json();



/////////////////////////////////////////////
mutation UpdateProduct($input: ProductInput!) {
  productUpdate(input: $input) {
    product {
      id
      title
      descriptionHtml
      status
      category: id
    }
    userErrors {
      field
      message
    }
  }
}

{
  "input": {
    "id": "gid://shopify/Product/10147019784502",
    "title": "New Title",
    "descriptionHtml": "New description",
    "status": "DRAFT",
    "category": "gid://shopify/TaxonomyCategory/aa-3-2"
  }
}


////////////////////////////////////////////////


mutation inventoryAdjustQuantities($input: InventoryAdjustQuantitiesInput!) {
  inventoryAdjustQuantities(input: $input) {
    userErrors {
      field
      message
    }
  }
}


{
  "input": {
    "reason": "correction",
    "name": "available",
    "changes": [
      {
        "delta": 10,
        "inventoryItemId": "gid://shopify/InventoryItem/53628158673206",
        "locationId": "gid://shopify/Location/104149254454"
      }
    ]
  }
}